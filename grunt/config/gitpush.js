// git push (for bower publish)
module.exports = function(grunt, config) {

	var push = {};

	// set target configurations for the libraries
	config.libraries.forEach(function(library) {

		if (library.bower !== false && grunt.option('publish')) {
			var repoName = 'packaged-' + library.name;
			push[repoName] = {
				options: {
					verbose: true,
					cwd: 'tmp/' + repoName,
					branch: grunt.option('publish-branch'),
					tags: true
				}
			};
		}

	});

	return push;

};
