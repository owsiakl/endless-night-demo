const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public/dist'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        devMiddleware: {
            writeToDisk: true
        }
    },
};