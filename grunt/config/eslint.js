// JavaScript validation using eslint
module.exports = function(grunt, config) {

	// read out CLI option for quiet (default true)
	// use --no-quiet / --quiet=false to set it to false
	var quiet = grunt.option('quiet');
	if (quiet !== false) {
		quiet = true;
	}

	var eslint = {
		options: {
			quiet: quiet,
			errorOnUnmatchedPattern: false
		}
	};

	// Lint JS files in testsuite
	eslint['testsuite'] = [
		config.testsuite.path
	];

	// Lint all libraries
	config.libraries.forEach(function(library) {
		eslint[library.name] = [
			library.path
		];
	});

	return eslint;
};
