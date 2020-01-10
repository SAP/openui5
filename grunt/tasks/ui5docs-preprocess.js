/*
 * grunt ui5docs-preprocess task.
 *
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const transformer = require("../../lib/jsdoc/transformApiJson");

module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('ui5docs-preprocess', 'Grunt task to run api.json transformation script', function() {

		const options = this.options({});
		const done = this.async();

		// Collect all available api.json files
		let dependencyLibs = [];
		function collectFromDir(startPath){

			if (!fs.existsSync(startPath)){
				return;
			}

			let files = fs.readdirSync(startPath);
			files.forEach(file => {
				let filename = path.join(startPath, file);
				let stat = fs.lstatSync(filename);

				if (stat.isDirectory()) {
					collectFromDir(filename);
				} else if (/designtime\/api.json$/.test(filename)) {
					dependencyLibs.push(filename);
				}
			});
		}
		collectFromDir('target');

		transformer(options.source,options.dest,options.lib, dependencyLibs)
		.then(done, (err) => {
			grunt.fail.warn(err);
		});
	});

};
