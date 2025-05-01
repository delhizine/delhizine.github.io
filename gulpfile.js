const gulp = require("gulp");
const data = require("gulp-data");
const nunjucksRender = require("gulp-nunjucks-render");
const rename = require("gulp-rename");
const merge = require("merge-stream");
const page_data = require("./src/page_data.json");
const zine_data = require("./src/zine_data.json");

gulp.task("generate-pages", function () {
    const itemPages = zine_data.zinelist.map(item => {
        return gulp
            .src("src/pages/zine.njk")
            .pipe(data(function () { return { item: item, ...page_data, ...zine_data }; }))
            .pipe(nunjucksRender({
                path: ["src/templates"]
            }))
            .pipe(rename(`${item.pagename}.html`))
            .pipe(gulp.dest("dist"));
    });

    return merge(itemPages);
});

gulp.task("generate-main", function () {
    return gulp
        .src(["src/pages/*.html", "!src/pages/zine.njk"])
        .pipe(data(function () { return { ...page_data, ...zine_data }; }))
        .pipe(nunjucksRender({
            path: ["src/templates"]
        }))
        .pipe(gulp.dest("dist"));
});

gulp.task("default", gulp.series("generate-main", "generate-pages"));