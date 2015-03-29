/// <reference path="./typings/tsd.d.ts" />
/// <reference path="src\decl\Dict.d.ts"/>
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
var merge = require('merge2');
var sourcemaps = require('gulp-sourcemaps');
var clone = require("./src/util/clone");


var pkg = require('./package.json');
var banner = `
/*!
 * <%= pkg.name %> - <%= pkg.description %>
 * @version v<%= pkg.version %>
 * @link <%= pkg.homepage %>
 * @license <%= pkg.license %>
 */

`;

interface BrowserifyOptions {
    entries?: string[];
    noParse?: any;
    extensions?: string[];
    basedir?: string;
    paths?: string[];
    commondir?: string;
    fullPaths?: boolean;
    builtins?: string[];
    bundleExternal?: boolean;
    insertGlobals?: boolean;
    detectGlobals?: boolean;
    debug?: boolean;
    standalone?: string;
    insertGlobalVars?: Dict<string>;
    externalRequireName?: string;
}

interface ExtendedBrowserifyOptions extends BrowserifyOptions {
    originFile: string;
    targetFileName: string;
}

function createBrowserifyTransform(opts:ExtendedBrowserifyOptions):NodeJS.ReadWriteStream {
    var nOpts = clone(opts);

    nOpts.debug = true; //Get sourcemaps

    return browserify(nOpts)
        .add(nOpts.originFile)
        .plugin('tsify')
        .bundle()
        .pipe(source(nOpts.targetFileName))
        .pipe(buffer());
}

var config = {
    globalName: 'TminusLib',
    dist: 'lib-tminus.js',
    entry: {
        lib: './src/lib.ts',
        test: './spec/test.ts',
        jasmine: './spec/SpecRunner.html',
        sources: './src/**/*.ts'
    },
    target: {
        dist: 'dist',
        genJS: 'gen-js'
    }
};

gulp.task('test:build-specs', ['clean'], () => {
    return createBrowserifyTransform({
        originFile: config.entry.test,
        targetFileName: 'specs.js'
    })
        .pipe(plumber())
        .pipe(gulp.dest(config.target.dist));
});

gulp.task('clean', (cb) => {
    return del([config.target.dist, config.target.genJS, '**/*.xml', './tmp'], cb);
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

    return merge([
        tsResult.js.pipe(gulp.dest(config.target.genJS)),
        tsResult.dts.pipe(gulp.dest(config.target.genJS)),
        gulp.src('./src/**/*.d.ts').pipe(gulp.dest(config.target.genJS))
    ]);
});

gulp.task('script:build', ['clean'], () => {
    return createBrowserifyTransform({
        originFile: config.entry.lib,
        targetFileName: config.dist,
        standalone: config.globalName
    })
        .pipe(plumber())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(derequire())
        .pipe(gulp.dest(config.target.dist))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify({
            preserveComments: saveLicense
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(config.target.dist));
});

gulp.task('default', ['script:build']);