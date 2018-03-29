/*
 * grunt ui5docs-preprocess task.
 *
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

'use strict';

const path = require('path');
const transformer = require("../../lib/jsdoc/transform-apijson-for-sdk");

module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('ui5docs-preprocess', 'Grunt task to run api.json transformation script', function() {
		const options = this.options({});
		const done = this.async();
		transformer(options.source,options.dest,options.lib)
		.then(done, (err) => {
			grunt.fail.warn(err);
		});
	});

};
