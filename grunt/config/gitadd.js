// git add (for bower publish)
module.exports = function(grunt, config) {

	var add = {};

	// set target configurations for the libraries
	config.libraries.forEach(function(library) {

		if (library.bower !== false && grunt.option('publish')) {
			var repoName = 'packaged-' + library.name;
			add[repoName] = {
				options: {
					verbose: true,
					cwd: 'tmp/' + repoName,
					all: true
				}
			};
		}

	});

	return add;

};
