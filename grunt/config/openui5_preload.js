// create library-preload.json for a library
module.exports = function(grunt, config) {

	var openui5_preload = {};

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
