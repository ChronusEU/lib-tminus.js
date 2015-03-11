/// <reference path="./typings/tsd.d.ts" />
'use strict';

import gulp = require('gulp');
import source = require('vinyl-source-stream');
import browserify = require('browserify');
import rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var saveLicense = require('uglify-save-license');
var derequire = require('gulp-derequire');

var config = {
    dist: 'lib-tminus.js',
    browserify: {
        standalone: 'TminusLib',
        entries: ['./src/lib.ts']
    }
};

gulp.task('script:build', () => {
    return browserify(config.browserify)
        .plugin('tsify')
        .bundle()
        .pipe(source(config.dist))
        .pipe(derequire())
        .pipe(buffer())
        .pipe(gulp.dest('dist'))
        //TODO: banner
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify({
            preserveComments: saveLicense
        }))
        .pipe(gulp.dest('dist'));
});