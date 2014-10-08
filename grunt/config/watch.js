module.exports = function(grunt, config) {
	return {

		options: {
			livereload: true
		},

		css: {
			files: config.libraries.map(function(library) {
				return library.path + '/src/**/themes/*/*.{css,less}';
			})
		},

		js: {
			files: config.libraries.map(function(library) {
				return library.path + '/src/**/*.js';
			})
		}

	};
};
