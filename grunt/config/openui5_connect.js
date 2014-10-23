// configure the connect server
module.exports = function(grunt, config) {

	// libraries are sorted alphabetically
	var aLibraries = config.allLibraries.slice();
	aLibraries.sort(function(a, b) {
		return a.name.localeCompare(b.name);
	});

	// forward the configuration for the openui5-connect plugin
	var openui5_connect = {

		options: {

			port: grunt.option('port'),

			livereload: grunt.option('watch') || false,

			contextpath: config.testsuite.name,

			cors: {
				
				origin: "*"
					
			}

		},

		src: {

			options: {

				useLess: true,

				appresources: [config.testsuite.path + '/src/main/webapp'],

				resources: aLibraries.map(function(lib) {
					return lib.path + '/src';
				}),

				testresources: aLibraries.map(function(lib) {
					return lib.path + '/test';
				})

			}

		},

		target: {

			options: {

				appresources: ['target/openui5'],

				resources: ['target/openui5/resources'],

				registerResources: false,

				testresources: ['target/openui5/test-resources'],

				registerTestresources: false

			}

		}

	};

	return openui5_connect;

};
