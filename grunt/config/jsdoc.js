const semver = require('semver');
const path = require("path");

const UI5_TEMPLATE_NAME = "ui5";

// execute the JSDoc tooling for the sources of a single library
module.exports = function(grunt, config) {

	const targetPathSDK = 'target/openui5-sdk';

	// Get current project version to inject it in the JSDoc template configuration
	const version = config.package && config.package.version;

	const useDefaultTemplate = grunt.option("default-template");
	
	// Get JSDoc configuration template 
	const jsdocConfigTemplate = grunt.file.readJSON(__dirname + '/../../lib/jsdoc/jsdoc-config-template.json');

	let tasks = {};

	config.libraries.forEach(library => {

		// ignore theme libs
		if ( library.type === 'theme' ) {
			return;
		}

		const srcPath = library.src;
		const libraryPath = library.name.replace(/\./g,"/");
		const apiJsonFolder = path.join(targetPathSDK, 'test-resources');
		const apiJsonFile = path.join(targetPathSDK, 'test-resources', libraryPath, 'designtime/api.json');
		const jsdocConfigFile = path.join('tmp', 'jsdoc', library.name, 'jsdoc-config.json');
		const jsdocOutputDir = path.join('tmp', 'jsdoc', library.name, 'output');

		// create jsdoc configuration from template (grunt-jsdoc doesn't support the necessary configuration options)
		const jsdocConfig = JSON.parse(JSON.stringify(jsdocConfigTemplate));
		if ( library.jsdoc && Array.isArray(library.jsdoc.exclude) ) {
			jsdocConfig.source.exclude = library.jsdoc.exclude.map( exclude => path.join(library.src, exclude) );
		}
		jsdocConfig.templates[UI5_TEMPLATE_NAME].version = version;
		jsdocConfig.templates[UI5_TEMPLATE_NAME].apiJsonFolder = apiJsonFolder;
		jsdocConfig.templates[UI5_TEMPLATE_NAME].apiJsonFile = apiJsonFile;
		if ( useDefaultTemplate ) {
			delete jsdocConfig.opts.template;
			jsdocConfig.templates[UI5_TEMPLATE_NAME].includeSettingsInConstructor = true;
		}
		grunt.file.write(jsdocConfigFile, JSON.stringify(jsdocConfig, null, '\t'));

		// create target configuration
		tasks['library-' + library.name] = {
			src: [
				srcPath
			],
			debug: !!grunt.option('debug'),
			verbose: !!grunt.option('verbose'),
			options: {
				destination: jsdocOutputDir,
				config: jsdocConfigFile
			}
		};

	});

	return tasks;
};
