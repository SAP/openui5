// git commit (for bower publish)
module.exports = function(grunt, config) {

	var commit = {};

	// set target configurations for the libraries
	config.libraries.forEach(function(library) {

		if (library.bower !== false && grunt.option('publish')) {
			var repoName = 'packaged-' + library.name;
			commit[repoName] = {
				options: {
					verbose: true,
					cwd: 'tmp/' + repoName,
					message: '<%= package.version %>'
				}
			};
		}

	});

	return commit;

};
