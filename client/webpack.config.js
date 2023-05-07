const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
    entry: {
        frontend: './src/noodles.js',
    },
    output: {
        path: path.resolve('../GetMyBeatsApp/static/webpack/'),
        filename: 'bundle.js',
        publicPath: 'static/frontend/',
    },
    // re:qsolve: {
    //     //     extensions: ['.ts', '...']
    //     // },
    plugins: [
        new CleanWebpackPlugin(),
        new BundleTracker({
            path: __dirname,
            filename: './webpack-stats.json',
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
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
}