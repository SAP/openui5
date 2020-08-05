const path = require("path");

// preprocess api.json file for use in the SDK
module.exports = function(grunt, config) {

	const targetPathSDK = 'target/openui5-sdk';

	let tasks = {};

	config.libraries.forEach(library => {

		// ignore theme libraries
		if ( library.type === 'theme' ) {
			return;
		}

		const libraryPath = library.name.replace(/\./g,"/");
		const libraryFile = path.join(targetPathSDK, 'resources', libraryPath, '.library');
		const apiJsonFile = path.join(targetPathSDK, 'test-resources', libraryPath, 'designtime/api.json');
		const transformedApiJsonFile = path.join(targetPathSDK, 'test-resources', libraryPath, 'designtime/apiref/api.json');

		// create target configuration
		tasks['library-' + library.name] = {
			options: {
				source: apiJsonFile,
				dest: transformedApiJsonFile,
				lib: libraryFile
			}
		};

	});

	return tasks;
};
