const path = require('path');

module.exports = {
    mode: 'production',
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
        clean: true,
    },
};