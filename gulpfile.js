const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

gulp.task('lint',
  () => gulp.src(['test/**/*.js', 'lib/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format('table'))
    .pipe(eslint.failAfterError()));

gulp.task('test',
  gulp.series(['lint'],
    () => gulp.src(['test/**/*.js']).pipe(mocha())
  )
);

gulp.task('test-no-lint', function () {
  return gulp.src(['test/**/*.js'])
    .pipe(mocha());
});
