const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public/dist'),
    },
    devServer: {
        open: true,
        static: {
            directory: path.join(__dirname, 'public'),
        },
        devMiddleware: {
            writeToDisk: true
        }
    },
};