var gulp = require('gulp'),
    eslint = require('gulp-eslint');

var paths = {
    scripts: [
        '**/*.js',
        '!**/*.min.js',
        '!node_modules/**/*.js'
    ]
};

gulp.task('lint', function() {
    return gulp.src(paths.scripts)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['lint']);
});

gulp.task('default', ['lint']);
