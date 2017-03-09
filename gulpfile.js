var gulp = require('gulp');
var concat = require('gulp-concat');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');

// js格式检查
gulp.task('jscs', function() {
    gulp.src('./src/*.js')
    .pipe(jscs({fix: true}))
    .pipe(jscs.reporter());
});

// 合并dcharts.js: gulp dcct
gulp.task('dcct', function() {
    var path = './src/';
    gulp.src([
        path + 'start.js', // NOTE: keep this first
        path + 'core.js',
        path + 'utils.js',
        path + 'filter.js',
        path + 'bar-chart.js',
        path + 'end.js' // NOTE: keep this last
    ])
    .pipe(concat('dcharts.js'))
    .pipe(gulp.dest('./lib'));
});

// 监控
gulp.task('watch', function() {
    gulp.watch('./src/*.js', ['dcct']);
});

gulp.task('default', ['dcct', 'watch']);
