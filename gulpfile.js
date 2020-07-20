const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const minify = require("gulp-minify");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const log = require("fancy-log");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");

// Paths for copy2-src
var scssSrc = ["node_modules/bootstrap/scss/**/*.scss"];
var jsSrc = ["node_modules/bootstrap/dist/js/**/*.js"];

// Copy the SCSS and JS files from node_modules/bootstrap
// SCSS
gulp.task("scss2src", function () {
  return gulp.src(scssSrc).pipe(gulp.dest("src/scss"));
});
// JS
gulp.task("js2src", function () {
  return gulp.src(jsSrc).pipe(gulp.dest("src/js"));
});

// Minify Assets
//Compress JS files
gulp.task("compress", function () {
  return gulp.src(["src/**/*.js"]).pipe(minify()).pipe(gulp.dest("./"));
});

//Clean CSS files
gulp.task("minify-css", () => {
  return gulp
    .src("css/main.css")
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("css/"))
    .pipe(browserSync.stream(true));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task("sass", function () {
  return gulp
    .src("scss/**/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("css/"))
    .pipe(browserSync.stream(true));
});

gulp.task("imagemin", async function () {
  const files = await imagemin(["src/images/*.{jpg,png}"], {
    destination: "images",
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  });

  log(files);
  //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
});

// copy2-src
gulp.task(
  "copy2-src",
  gulp.series(
    "scss2src",
    "js2src",
    "compress",
    "sass",
    "minify-css",
    async function () {
      log("Imported SCSS and JS, Run `gulp serve` to run a local server");
    }
  )
);

// Static Server + watching scss/html files
gulp.task(
  "serve",
  gulp.series("sass", "minify-css", function () {
    browserSync.init({
      server: "./",
    });
    log("Press ^ + C or ctrl + C to close BrowserSync");
    gulp.watch("scss/**/*.scss", gulp.series("sass", "minify-css"));
    gulp.watch("*.html").on("change", browserSync.reload);
  })
);

gulp.task("default", gulp.series("serve"));
