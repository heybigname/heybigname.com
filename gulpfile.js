var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    plumber = require('gulp-plumber'),
    server = lr();

// Error catching
function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

// Compile SCSS
gulp.task('styles', function() {
    return gulp.src('assets/styles/main.scss')
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(sass({ quiet: true }))
        .pipe(sass({ style: 'expanded' }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('public/assets/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('public/assets/css'))
        .pipe(notify({ message: 'Styles task complete' }));
});


// Minify scripts
gulp.task('scripts', function() {
    return gulp.src('assets/scripts/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('public/assets/scripts'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('public/assets/scripts'))
        .pipe(livereload(server))
        .pipe(notify({ message: 'Scripts task complete' }))
        .on('error', handleError);
});

// Minify images
gulp.task('images', function() {
    return gulp.src('assets/images/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
        .pipe(gulp.dest('public/assets/img'))
        .pipe(livereload(server))
        .pipe(notify({ message: 'Images task complete' }))
        .on('error', handleError);
});

// Clean up!
gulp.task('clean', function() {
    return gulp.src(['public/assets/css', 'public/assets/js', 'public/assets/img'], {read: false})
        .pipe(clean());
});

// Watch
gulp.task('watch', function() {
    // Watch .scss files
    gulp.watch('assets/styles/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('assets/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('assets/images/**/*', ['images']);
});

// Register tasks
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images');
});
