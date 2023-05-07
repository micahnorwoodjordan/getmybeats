const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
    entry: {
        frontend: './src/base.js',
    },
    output: {
        path: path.resolve('../GetMyBeatsApp/static/webpack/'),
        filename: 'bundle.js',
        publicPath: path.resolve('../GetMyBeatsApp/static/webpack/'),
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '...']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new BundleTracker({
            path: __dirname,
            filename: '../webpack-stats.json',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/i,
                use: 'ts-loader',
                exclude: '/node_modules/'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.js$/,
                exclude: '/node_modules/',
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'javascript/auto',
                use: 'file-loader?name=/[name].[ext]&limit=30000'
            }
        ],
    },
    // OPTIONAL OPTIMIZATION SETTINGS
    optimization: {
        minimize: false,
    }
}