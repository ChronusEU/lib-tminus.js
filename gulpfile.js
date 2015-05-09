'use strict';
var gulp = require('gulp');
var browserify = require('browserify');
var rename = require('gulp-rename');
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
var pkg = require('./package.json');

var banner =
    "/*!\n" +
    " * <%= pkg.name %> - <%= pkg.description %>\n" +
    " * @version v<%= pkg.version %>\n" +
    " * @link <%= pkg.homepage %>\n" +
    " * @license <%= pkg.license %>\n" +
    " */\n\n";

function createBrowserifyTransform(opts) {
    opts.debug = true;
    return browserify(opts)
        .add(opts.originFile)
        .plugin('tsify')
        .bundle()
        .pipe(source(opts.targetFileName))
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
        genJS: 'src-gen',
        tmp: 'tmp'
    }
};

gulp.task('test:build-specs', ['clean'], function () {
    return createBrowserifyTransform({
        originFile: config.entry.test,
        targetFileName: 'specs.js'
    })
        .pipe(plumber())
        .pipe(gulp.dest(config.target.tmp));
});

gulp.task('clean', function (cb) {
    return del([config.target.dist, config.target.genJS, '**/*.xml'], cb);
});

gulp.task('test', ['test:build-specs'], function () {
    return gulp.src(config.entry.jasmine)
        .pipe(jasminePhantomJs());
});

gulp.task('script:generate-js', ['clean'], function () {
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

gulp.task('script:build', ['clean'], function () {
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