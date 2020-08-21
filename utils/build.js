const webpack = require("webpack"),
    config = require("../webpack.config");

webpack(
    config,
    function (err) {
        if (err) throw err;
    }
);
