const path = require('path');
const glob = require('glob');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

class TailwindExtractor {
    static extract(content) {
        return content.match(/[A-z0-9-:/]+/g)
    }
}

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',

    optimization: {
        minimizer: [
            new TerserJSPlugin({}),
            new OptimizeCSSAssetsPlugin({})
        ]
    },

    plugins: [
        new CompressionPlugin()
    ]
});
