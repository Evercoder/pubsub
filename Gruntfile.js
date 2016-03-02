module.exports = function(grunt) {

	grunt.initConfig({
		qunit: {
			all: {
				options: {
					urls: ['tests/tests.html']
				}
			}
		},

		uglify: {
			all: {
				files: {
					'pubsub.min.js': 'pubsub.js'
				}
			}
		},

		docco: {
			all: {
				src: ['./pubsub.js'],
				options: {
					output: './docs'
				}
			}
		},

		// Copy & clean to counteract grunt-docco2 absurdities

		copy: {
			all: {
				files: [{
					expand: true,
					cwd: 'undefined/',
					dest: './docs',
					src: ['**/*.*']
				}]
			}
		},

		clean: {
			all: {
				src: ['undefined']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-docco');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', 'test and build pubsub', ['qunit', 'uglify', 'docco', 'copy', 'clean']);

};