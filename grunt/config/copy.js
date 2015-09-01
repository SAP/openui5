// copy files/folders
module.exports = function(grunt, config) {

	var copy = {};

	// do not copy testsuite resources when test-resources are not included
	if (grunt.option('include-test-resources')) {
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
				cwd: library.path + '/src',
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
					cwd: library.path + '/test',
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
						dest: '../packaged-' + library.name
					},
					// license and notice file should also be present in each bower repo
					{
						src: 'LICENSE.txt',
						dest: '../packaged-' + library.name + '/LICENSE.txt'
					},
					{
						src: 'NOTICE.txt',
						dest: '../packaged-' + library.name + '/NOTICE.txt'
					}
				]
			};
		}

	});

	return copy;

};
