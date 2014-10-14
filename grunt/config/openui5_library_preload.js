// create library-preload.json for a library
module.exports = function(grunt, config) {

	var openui5_library_preload = {};

	config.libraries.forEach(function(library) {

		if (library.type === 'theme') {
			return;
		}

		// convert library name into folder prefix (e.g. foo.bar.ui -> foo/bar/ui)
		var prefix = library.name.replace(/\./g, '/') + '/',
		src =  [
				prefix + '**/*.{js,json,xml}', // include all js, json and xml files
				'!' + prefix + '**/library-*' // no generated library resources (e.g. library-preload.json, library-parameters.json)
		];

		if (library.preload && library.preload.src) {
			src = src.concat(library.preload.src);
		}

		// set target configuration
		openui5_library_preload['target-preload-' + library.name] = {
			options: {
				libraryName: library.name,
				dest: 'target/openui5-' + library.name + '/resources'
			},
			files: [
				{
					expand: true,
					cwd: 'target/openui5-' + library.name + '/resources',
					src: src
				}
			]
		};
	});

	return openui5_library_preload;
};
