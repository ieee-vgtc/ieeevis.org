const webpack = require('webpack');
const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


const _root = path.resolve(__dirname, '..');

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [_root].concat(args));
}

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),

    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': root('src')
        }
    },

    output: {
        path: __dirname + '/dist',
        filename: "bundle.js"
    },
    // devServer: {
    //     contentBase: path.join(__dirname, 'static'),
    //     compress: false,
    //     open: true,
    //     port: 4000,
    //     historyApiFallback: true,
    //     hot: true,
    //     publicPath: '/',
    // },
    devServer: {
        static: { 
            directory: path.resolve(__dirname, './static'), 
            publicPath: '/static'
        },
        port: 3000,
        // proxy: 'http://localhost:4000',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: 'css-loader', options: { sourceMap: true } },
                    {
                        loader: 'postcss-loader',
                    },
                ],
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-syntax-dynamic-import']
                    },
                },
            },
        ],
    },
    plugins: [
        // new VueLoaderPlugin(),
        new BrowserSyncPlugin({
                host: 'localhost',
                port: 3000,
                proxy: 'http://localhost:4000',
                files: ['_site', 'src', 'static', 'governance'],
            },
            {
                reload: false,
            },
        ),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new CleanWebpackPlugin(),
    ]
};
