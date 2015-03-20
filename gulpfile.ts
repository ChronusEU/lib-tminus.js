/// <reference path="./typings/tsd.d.ts" />
'use strict';

import gulp = require('gulp');
import browserify = require('browserify');
import rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var saveLicense = require('uglify-save-license');
var derequire = require('gulp-derequire');
var jasminePhantomJs = require('gulp-jasmine2-phantomjs');
var header = require('gulp-header');
var del = require('del');
var plumber = require('gulp-plumber');
var ts = require('gulp-typescript');


var pkg = require('./package.json');
var banner = `
/*!
 * <%= pkg.name %> - <%= pkg.description %>
 * @version v<%= pkg.version %>
 * @link <%= pkg.homepage %>
 * @license <%= pkg.license %>
 */

`;

var config = {
    globalName: 'TminusLib',
    dist: 'lib-tminus.js',
    entry: {
        lib: './src/lib.ts',
        test: './spec/test.ts',
        jasmine: './spec/SpecRunner.html',
        sources: './src/**/*.ts'
    },
    distributionTarget: 'dist',
    generatedSourceTarget: 'gen-js'
};

gulp.task('test:build-specs', ['clean'], () => {
    return browserify({
        entries: [config.entry.test]
    }).plugin('tsify')
        .bundle()
        .pipe(plumber())
        .pipe(source('specs.js'))
        .pipe(buffer())
        .pipe(gulp.dest(config.distributionTarget));
});

gulp.task('clean', (cb) => {
    return del([config.distributionTarget, config.generatedSourceTarget], cb);
});

gulp.task('test', ['test:build-specs'], () => {
    return gulp.src(config.entry.jasmine).pipe(jasminePhantomJs());
});

gulp.task('script:generate-js', ['clean'], () => {
    var tsResult = gulp.src(config.entry.sources)
        .pipe(plumber())
        .pipe(ts({
            declarationFiles: true,
            module: 'commonjs'
        }));

    //TODO: figure out what to do with declarations
    return tsResult.js.pipe(gulp.dest(config.generatedSourceTarget));
});

gulp.task('script:build', ['clean'], () => {
    return browserify({
        standalone: config.globalName,
        entries: [config.entry.lib]
    }).plugin('tsify')
        .bundle()
        .pipe(plumber())
        .pipe(source(config.dist))
        .pipe(derequire())
        .pipe(buffer())
        .pipe(gulp.dest(config.distributionTarget))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify({
            preserveComments: saveLicense
        }))
        .pipe(gulp.dest(config.distributionTarget));
});

gulp.task('default', ['script:build']);