"use strict";
/* eslint-env node */

var gulp = require("gulp");
var uglify = require("gulp-uglify");
var fs = require("fs-extra");
var pkg = require("./package.json");
var path = require("path");
var webpack = require("webpack-stream");
var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");


gulp.task("build", function() {
    fs.emptyDirSync("./build");

    return gulp.src(["./src/index.js"])
        .pipe(webpack({
            output: {
                filename: "watcher.js"
            },
            module: {
                loaders: [
                    {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
                ]
            }
        }))
        .pipe(rename(function(path) {
            path.basename += ".debug";
        }))
        .pipe(gulp.dest("./build/"))
        .pipe(rename(function(path) {
            path.basename = "watcher.min";
        }))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./build/"));

});

gulp.task("watch", ["build"], function() {
    gulp.watch(["src/**/*"], {debounceDelay:2000}, ["build"]);
});

