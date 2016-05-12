
var man = require('./manifest.json');

// Dependencies
// ------------
var gulp = require('gulp');

var cache           = require('gulp-cached'),
  concat          = require('gulp-concat'),
  filter          = require('gulp-filter'),
  htmlmin         = require('gulp-htmlmin'),
  imagemin        = require('gulp-imagemin'),
  jshint          = require('gulp-jshint'),
  notify          = require('gulp-notify'),
  plumber         = require('gulp-plumber'),
  rename          = require('gulp-rename'),
  uglify          = require('gulp-uglify');

// Configuration
// -------------

// File paths
var src     = './',
  dest    = 'dist/' + man.short_name + '-' + man.version;

// Error handling
// --------------
function onError(error) {
  var errorTitle = '[' + error.plugin + ']',
    errorString = error.message;

  if (error.lineNumber) {
    errorString += ' on line ' + error.lineNumber;
  }
  if (error.fileName) {
    errorString += ' in ' + error.fileName;
  }

  notify.onError({
    title:    errorTitle,
    message:  errorString,
    sound:    "Beep"
  })(error);
  this.emit('end');
}

// Styles task
// -----------
gulp.task('styles', function() {
  return gulp.src(src + '/css/**/*.css')
    .pipe(plumber({errorHandler: onError}))

    // Cache
    .pipe(cache())

    // Write css
    .pipe(gulp.dest(dest + '/css'))

    // CSS Injection
    .pipe(filter('**/*.css'))

    // Notification
    .pipe(notify({ message: 'Styles task complete' }));
});

// Angular app task
// ----------------
gulp.task('app', function() {
  return gulp.src(src + '/app/**/*.js')
    .pipe(cache())
    //.pipe(jshint())
    //.pipe(jshint.reporter('fail'))
    //.on('error', onError)
    //.pipe(concat('mykn_frontend.js'))
    //.pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(dest + '/app'))
    .pipe(notify({ message: 'App task complete' }));
});

// Scripts task
// ------------
gulp.task('scripts', function() {
  return gulp.src(src + '/js/**/*.js')

    // Cache
    .pipe(cache())

    // JSHint & compile
    .pipe(jshint())
    .pipe(jshint.reporter('fail'))
    .on('error', onError)

    // Compile
    //.pipe(concat('main.js'))

    // Minify
    //.pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(dest + '/js'))

    // Notification
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Fonts task
// ----------
gulp.task('fonts', function() {
  return gulp.src(src + '/fonts/**/*.*')
    .pipe(plumber({errorHandler: onError}))

    // Cache
    .pipe(cache())

    // Write fonts
    .pipe(gulp.dest(dest + '/fonts'))

    // CSS Injection @todo adapt this to be what you want it to be for fonts
    //.pipe(filter('**/*.css'))

    // Notification
    .pipe(notify({ message: 'Fonts task complete' }));
});


// Images task
// -----------
gulp.task('images', function() {
  return gulp.src(src + '/img/**/*')
    .pipe(plumber({errorHandler: onError}))

    // Cache
    .pipe(cache())

    // Compress & cache
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest + '/img'))

    // Notification
    .pipe(notify({ message: 'Images task complete' }));
});

// Library files
gulp.task('library', function() {
  return gulp.src([
      src+'/lib/*/angular.min.js',   // @todo: Change these to pull from node_modules
      src+'/lib/*/angular-csp.css',
      src+'/lib/*/README.md',
      src+'/lib/*/bootstrap.min.js',
      src+'/lib/*/google-analytics-bundle.js',
      src+'/lib/*/jquery-1.10.2.min.js',
      src+'/lib/*/taffy.js'
    ])

    .pipe(cache())
    .pipe(gulp.dest(dest + '/lib'))

    // Notification
    .pipe(notify({ message: 'Library task complete' }));
});

// Top level files
gulp.task('html', function() {
  return gulp.src([
    src+'*.html'
  ])
    .pipe(cache())
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(dest))
    .pipe(notify({message: 'Top level task complete'}));
});

// Top level files
gulp.task('top', function() {
  return gulp.src([
      src+'manifest.json',
      src+'LICENSE'
    ])
    .pipe(cache())
    .pipe(gulp.dest(dest))
    .pipe(notify({message: 'Top level task complete'}));
});


// Default task
// ------------
gulp.task('default', ['styles', 'scripts', 'images', 'library', 'fonts', 'app', 'top', 'html']);

 // Development task
 // ----------------
gulp.task('dev', [], function() {
  gulp.watch(src + '/css/**/*.css', ['styles']);
  gulp.watch(src + '/js/**/*.js', ['scripts']);
  gulp.watch(src + '/img/**/*', ['images']);
  gulp.watch(src + '*.html', ['html']);
  gulp.watch(src + '*.*', ['top']);
  gulp.watch(src + '/app/**/*.js', ['app']);
});
