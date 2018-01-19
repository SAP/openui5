module.exports = function(grunt, config) {
	return {

		options: {
			livereload: true
		},

		styles: {
			files: config.libraries.map(function(library) {
				return library.src + '/**/themes/*/*.less';
			})
		},

		js: {
			files: config.libraries.map(function(library) {
				return library.src + '/**/*.js';
			})
		}

	};
};
