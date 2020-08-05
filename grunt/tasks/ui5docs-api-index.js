/*
 * grunt ui5docs-api-index task.
 *
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

'use strict';

const path = require('path');
const indexer = require("../../lib/jsdoc/createIndexFiles");

module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('ui5docs-api-index', 'Grunt task to create API indexes for use in the UI5 SDK', function(grunt) {
		const done = this.async();
		const options = this.options({});
		indexer(
			options.versionInfoFile,
			options.unpackedTestresourcesRoot,
			options.targetFile,
			options.targetFileDeprecated,
			options.targetFileExperimental,
			options.targetFileSince)
		.then(done, err => {
			grunt.fail.warn("creating API indexes failed with an error", err);
			done();
		});
	});

};
