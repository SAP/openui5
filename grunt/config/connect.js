module.exports = function(grunt, connect) {

	// set default port
	if (typeof grunt.option('port') !== 'number') {
		grunt.option('port', 8080);
	}

	return {

		options: {

			port: '<%= grunt.option("port") %>',
			hostname: '*'

		},

		src: {

			options: {

				livereload: grunt.option('watch') || false

			}

		},

		target: {
			// no special options here
		}

	};

};
