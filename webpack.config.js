const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Імпорт плагіна

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Очистка dist перед кожною збіркою
    },
    devServer: {
        static: './dist',
        port: 8080,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html', // Використання HTML-шаблону
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' }, // Копіювання папки assets
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.(png|jpg|gif|mp3|wav)$/,
                type: 'asset/resource',
            },
        ],
    },
};