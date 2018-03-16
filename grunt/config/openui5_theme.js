// build OpenUI5 themes
module.exports = function(grunt, config) {

	var openui5_theme = {

		// default options for all targets
		options: {

			// pass in src folders of all libraries to support @import directives
			// across library projects
			rootPaths: config.allLibraries.map(function(library) {
				return library.src;
			}),

			// set compress flag using grunt option (--minifiy-css)
			compiler: {
				compress: grunt.option('minify-css')
			}
		}

	};

	config.libraries.forEach(function(library) {
		openui5_theme['target-' + library.name] = {
			files: [
				{
					expand: true,
					cwd: library.src,
					src: '**/themes/*/library.source.less',
					dest: 'target/openui5-' + library.name + '/resources'
				}
			],
			options: {
				library: {
					name: library.name
				}
			}
		};
	});

	return openui5_theme;
};
