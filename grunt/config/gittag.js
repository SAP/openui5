// git tag (for bower publish)
module.exports = function(grunt, config) {

	var tag = {};

	// set target configurations for the libraries
	config.libraries.forEach(function(library) {

		if (library.bower !== false && grunt.option('publish')) {
			var repoName = 'packaged-' + library.name;
			tag[repoName] = {
				options: {
					verbose: true,
					cwd: 'tmp/' + repoName,
					tag: '<%= package.version %>',
					message: '<%= package.version %>',
					annotated: true
				}
			};
		}

	});

	return tag;

};
