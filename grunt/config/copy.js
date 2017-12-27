// copy files/folders
module.exports = function(grunt, config) {

	var copy = {};

	copy['bundle'] = {
		files: config.libraries.map(function(library) {
			return {
				expand: true,
				dot: true,
				cwd: 'target/openui5-' + library.name,
				src: '**',
				dest: 'target/openui5'
			};
		})
	};

	// grunt bundle --testsuite
	if (grunt.option('testsuite')) {

		// include the testsuite resources in the target/openui5 folder
		copy['bundle'].files.push({
			expand: true,
			dot: true,
			cwd: config.testsuite.path + '/src/main/webapp',
			src: [
				'**',
				'!WEB-INF/**'
			],
			dest: 'target/openui5'
		});

		// genereate the sap-ui-version.json file (same like in connect.js)
		var sapUiBuildtime = config.buildtime;
		var version = config.package && config.package.version;
		var sapUiVersionJson = {
			name: "openui5",
			version: version,
			buildTimestamp: sapUiBuildtime,
			scmRevision: '',
			gav: 'com.sap.openui5:openui5:' + version,
			libraries: config.allLibraries.map(function(library) {
				return {
					name: library.name,
					version: version,
					buildTimestamp: sapUiBuildtime,
					scmRevision: ''
				};
			})
		};
		grunt.file.write("target/openui5/resources/sap-ui-version.json", JSON.stringify(sapUiVersionJson));

	}

	// do not copy testsuite resources when test-resources are not included
	// or the option testsuite is declared for the bundle command
	if (grunt.option('include-test-resources') || grunt.option('testsuite')) {
		copy['test-target-' + config.testsuite.name] = {
			files: [
				{
					expand: true,
					dot: true,
					cwd: config.testsuite.path + '/src/main/webapp',
					src: [
						'**',
						'!WEB-INF/**'
					],
					dest: 'target/openui5-testsuite'
				}
			]
		};
	}

	// set target configurations for the libraries
	config.libraries.forEach(function(library) {

		copy['src-target-' + library.name] = {
			files: [ {
				expand: true,
				dot: true,
				cwd: library.src,
				src: [
					'**',
					'!testsuite/testframe.html' // only a redirect file. real testsuite is located in /test/testsuite
				],
				dest: 'target/openui5-' + library.name + '/resources'
			} ]
		};

		// do only copy test files if configured
		if (grunt.option('include-test-resources')) {
			copy['test-target-' + library.name] = {
				files: [ {
					expand: true,
					dot: true,
					cwd: library.test,
					src: '**',
					dest: 'target/openui5-' + library.name + '/test-resources'
				} ]
			};
		}

		if (library.bower !== false && grunt.option('publish')) {
			copy['bower-' + library.name] = {
				files: [
					// built resources/test-resources
					{
						expand: true,
						dot: true,
						cwd: 'target/openui5-' + library.name,
						src: '**',
						dest: 'tmp/packaged-' + library.name
					},
					// license and notice file should also be present in each bower repo
					{
						src: 'LICENSE.txt',
						dest: 'tmp/packaged-' + library.name + '/LICENSE.txt'
					},
					{
						src: 'NOTICE.txt',
						dest: 'tmp/packaged-' + library.name + '/NOTICE.txt'
					}
				]
			};
		}

	});

	return copy;

};
