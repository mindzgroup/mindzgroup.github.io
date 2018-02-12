let gulp = require('gulp');
let less = require('gulp-less');
let sass = require('gulp-sass');
let browserSync = require('browser-sync').create();
let historyApiFallback = require('connect-history-api-fallback');
let connectLogger = require("connect-logger");
let header = require('gulp-header');
let cleanCSS = require('gulp-clean-css');
let rename = require("gulp-rename");
let uglify = require('gulp-uglify');
let pkg = require('./package.json');
let concat = require('gulp-concat');
let utils = require('gulp-util');
let uglifyES = require('uglify-es');
let clean = require('gulp-clean');

let composer = require('gulp-uglify/composer');
let pump = require('pump');
let minify = composer(uglifyES, console);

// Set the banner content
let banner = ['/*!\n',
    ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright ' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' */\n',
    ''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', function () {
    return gulp.src(['less/site.less'])
        .pipe(less())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('css'));
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function () {
    return gulp.src(['css/*.css', '!css/*.min.css'])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('css'));
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function () {
    // font awesome
    gulp.src([
        'node_modules/font-awesome/**',
        '!node_modules/font-awesome/**/*.map',
        '!node_modules/font-awesome/{less,less/**}',
        '!node_modules/font-awesome/{scss,scss/**}',
        '!node_modules/font-awesome/.npmignore',
        '!node_modules/font-awesome/*.txt',
        '!node_modules/font-awesome/*.md',
        '!node_modules/font-awesome/*.json'])
        .pipe(gulp.dest(''));
    
    // bootstrap fonts
    gulp.src(['node_modules/bootstrap-less/fonts/**'])
        .pipe(gulp.dest('fonts'));
    
    // third party css files
    gulp.src(['csssrc/**',
        'node_modules/animate.css/**.css'])
        .pipe(gulp.dest('css'));
    
    // javasccript files
    gulp.src(['jssrc/*.js', 
        'node_modules/wowjs/dist/*.js', 
        'node_modules/jquery/dist/*.js', 
        'node_modules/bootstrap-less/js/boo*.js'])
        .pipe(gulp.dest('js'));
});

// Run everything
gulp.task('default', ['minify-css']);

// Configure the browserSync task
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: '.'
        },
        middleware: [connectLogger(), historyApiFallback()]
    });
});

// Dev task with browserSync
gulp.task('dev', ['default', 'browserSync'], function () {
    gulp.watch('less/*.less', ['less']);
    gulp.watch(['css/*.css','!css/*.min.css'], ['minify-css']);
    // gulp.watch('js/**/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    // gulp.watch('jssrc/*.js', ['copy'], browserSync.reload);
    gulp.watch('css/*.min.css', browserSync.reload);
});