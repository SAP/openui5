// JavaScript validation using eslint
module.exports = function(grunt, config) {

	var eslint = {};

	config.libraries.forEach(function(library) {
		eslint[library.name] = [
			library.path
		];
	});

	return eslint;
};
