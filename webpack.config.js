const path = require('path');

module.exports = {
	mode: 'development',
	entry: './src/renderer/index.jsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'renderer.js',
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-react', '@babel/preset-env'],
					},
				},
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	resolve: {
		extensions: ['.js', '.jsx'],
	},
	target: 'electron-renderer',
	node: {
		__dirname: false,
		__filename: false,
	},
};
