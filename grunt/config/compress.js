// create zip archives
module.exports = function(grunt, config) {
	return {

		target: {
			options: {
				archive: 'target/openui5.zip'
			},
			files: config.libraries.map(function(library) {
				return {
					expand: true,
					dot: true,
					cwd: 'target/openui5-' + library.name,
					src: '**'
				};
			})
		}

	};

};
