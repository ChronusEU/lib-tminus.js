gulp = require 'gulp'
browserify = require 'gulp-browserify'
uglify = require 'gulp-uglify'
saveLicense = require 'uglify-save-license'
rename = require 'gulp-rename'
jasmine = require 'gulp-jasmine'
coffee = require 'gulp-coffee'
del = require 'del'
header = require 'gulp-header'
plumber = require 'gulp-plumber'
coffeelint = require 'gulp-coffeelint'

pkg = require './package.json'
banner = """
/*!
 * <%= pkg.name %> - <%= pkg.description %>
 * @version v<%= pkg.version %>
 * @link <%= pkg.homepage %>
 * @license <%= pkg.license %>
 */

"""

config =
    globalName: 'TminusLib'
    src:
        coffee: 'src/**/*.coffee'
    entry:
        lib: 'src/lib.coffee'
        test: 'spec/test.coffee'
    dist: 'lib-tminus.js'

# Build the full distribution, compiled and minified to a single file
gulp.task 'build:distribution', ['clean'], ->
    return gulp.src config.entry.lib, 
            read: false
        .pipe plumber()
        .pipe browserify
            transform: ['coffeeify']
            extensions: ['.coffee']
            standalone: config.globalName
        .pipe rename config.dist
        .pipe header banner, 
            pkg: pkg
        .pipe gulp.dest 'dist'
        .pipe rename
            suffix: '.min'
        .pipe uglify
            preserveComments: saveLicense
        .pipe gulp.dest 'dist'
        
# Generate the javascript source files from the coffeescript files.
gulp.task 'build:js-sources', ['clean'], ->
    return gulp.src config.src.coffee
        .pipe plumber()
        .pipe coffee()
        .pipe gulp.dest 'gen-js'

# Run the jasmine tests
gulp.task 'test', ->
    return gulp.src config.entry.test
        .pipe jasmine
            includeStackTrace: true
            verbose: true

gulp.task 'lint:coffee', ->
    return gulp.src config.src.coffee
        .pipe coffeelint()
        .pipe coffeelint.reporter()

# Actively run lint against modifications
gulp.task 'watch:dev', ->
    gulp.watch 'src/**/*.coffee', ['lint:coffee']

gulp.task 'watch', ['build:distribution'], ->
    gulp.watch 'src/**/*.coffee', ['build:distribution']

gulp.task 'clean', (cb) ->
    del ['dist', 'gen-js'], cb

gulp.task 'default', ['build:distribution']