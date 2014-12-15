// delete files/folders
module.exports = function(grunt, config) {

	var clean = {
		'surefire-reports': {
			src: [ 'target/surefire-reports' ]
		}
	};

	config.libraries.forEach(function(library) {

		clean[library.name] = {
			dot: true,
			src: [ 'target/openui5-' + library.name ]
		};

		if (library.bower !== false && grunt.option('publish')) {
			clean['bower-' + library.name] = {
				options: {
					force: true
				},
				files: [ {
					expand: true,
					cwd: '../packaged-' + library.name,
					src: [
						'**/*.*',
						'**/.*',
						'!bower.json',
						'!README.md',
						'!.git'
					]
				} ]
			};
		}

	});

	return clean;

};
