// JavaScript validation using eslint
module.exports = function(grunt, config) {

	var eslint = {
		options: {
			quiet: true
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
