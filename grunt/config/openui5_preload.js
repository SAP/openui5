var semver = require('semver');

// create library-preload.json for a library
module.exports = function(grunt, config) {

	// Get current version from package.json to set compatVersion accordingly
	var version = grunt.file.readJSON(__dirname + '/../../package.json').version;

	var openui5_preload = {
		options: {
			compatVersion: semver.major(version) + "." + semver.minor(version)
		}
	};

	config.libraries.forEach(function(library) {

		if (library.type === 'theme') {
			return;
		}

		var libraryNamespace = library.name.replace(/\./g, '/');
		var libraryConfig = {};
		libraryConfig[libraryNamespace] = {};

		if (library.preload && library.preload.src) {
			libraryConfig[libraryNamespace].src = library.preload.src;
		}

		var libraryPath = 'target/openui5-' + library.name + '/resources';

		// set target configuration
		openui5_preload['library-' + library.name] = {
			options: {
				resources: {
					cwd: libraryPath,
					src: [ '**/*.js' ] // only include js files (leave out e.g. *.properties files)
				},
				dest: libraryPath
			},
			libraries: libraryConfig
		};
	});

	return openui5_preload;
};
