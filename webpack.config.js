const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

const files = [
    "all_docs.js", 
    "bulk_docs.js", 
    "changes.js", 
    "del_db.js", 
    "get_bulk_get.js", 
    "get_db.js", 
    "post_bulk_get.js", 
    "put_db.js", 
    "revs_diff.js"
];

module.exports = files.map(function (filename) {
    return {
        mode: 'production',
        target: "node",
        entry: {
            app: ["./actions/" + filename]
        },
        output: {
            filename: filename
        },
        externals: [nodeExternals()],
        optimization: {
            // We no not want to minimize our code.
            minimize: false
        },
    };
});