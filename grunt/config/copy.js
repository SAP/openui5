// copy files/folders
module.exports = function(grunt, config) {

	var copy = {};

	// do not copy testsuite resources when test-resources are not included
	if (grunt.option('include-test-resources')) {
		copy['test-target-' + config.testsuite.name] = {
			files: [
				{
					expand: true,
					cwd: config.testsuite.path + '/src/main/webapp',
					src: ['**/*.*', '!WEB-INF/**'],
					dest: 'target/openui5'
				}
			]
		};
	}

	// set target configurations for the libraries
	config.libraries.forEach(function(library) {

		copy['src-target-' + library.name] = {
			files: [ {
				expand: true,
				cwd: library.path + '/src',
				src: [
					'**/.*',
					'**/*.*',
					'!testsuite/testframe.html', // only a redirect file. real testsuite is located in /test/testsuite
					'!**/themes/**/*.{css,less}', // css files will be created by the 'openui5_less' task
					//'!**/*.{js}' // do not exclude js files ('uglify' task is currently skipped)
				],
				dest: 'target/openui5/resources'
			} ]
		};

		// do only copy test files if configured
		if (grunt.option('include-test-resources')) {
			copy['test-target-' + library.name] = {
				files: [ {
					expand: true,
					cwd: library.path + '/test',
					src: '**/*',
					dest: 'target/openui5/test-resources'
				} ]
			};
		}

	});

	return copy;

};
