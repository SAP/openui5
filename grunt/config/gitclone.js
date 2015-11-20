// git clone (for bower publish)
module.exports = function(grunt, config) {

	var clone = {};

	// set target configurations for the libraries
	config.libraries.forEach(function(library) {

		if (library.bower !== false && grunt.option('publish')) {
			var repoName = 'packaged-' + library.name;
			clone[repoName] = {
				options: {
					verbose: true,
					branch: grunt.option('publish-branch'),
					repository: grunt.option('publish-url-prefix') + repoName + '.git',
					directory: 'tmp/' + repoName
				}
			};
		}

	});

	return clone;

};
