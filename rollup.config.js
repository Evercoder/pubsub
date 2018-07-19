import pkg from './package.json';
import buble from 'rollup-plugin-buble';

export default [
	{
		input: 'src/pubsub.js',
		output: {
			format: 'umd',
			name: 'pubsub',
			file: pkg.main
		},
		plugins: [buble()]
	},
	{
		input: 'src/pubsub.js',
		output: {
			format: 'es',
			file: pkg.module
		},
		plugins: [buble()]
	}
];
