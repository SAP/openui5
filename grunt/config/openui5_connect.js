// configure the openui5 connect server
module.exports = function(grunt, config) {

	// libraries are sorted alphabetically
	var aLibraries = config.allLibraries.slice();
	aLibraries.sort(function(a, b) {
		return a.name.localeCompare(b.name);
	});

	var openui5_connect = {

		options: {

			contextpath: config.testsuite.name,
			proxypath: 'proxy',
			proxyOptions: {
				secure: false
			},
			cors: {
				origin: "*"
			}

		},

		src: {

			options: {

				appresources: config.testsuite.path + '/src/main/webapp',

				resources: aLibraries.map(function(lib) {
					return lib.src;
				}),

				testresources: aLibraries.map(function(lib) {
					return lib.test;
				})

			}

		},

		target: {

			options: {

				appresources: 'target/openui5-testsuite',

				resources: aLibraries.map(function(lib) {
					return 'target/openui5-' + lib.name + '/resources';
				}),

				testresources: aLibraries.map(function(lib) {
					return 'target/openui5-' + lib.name + '/test-resources';
				})

			}

		}

	};

	return openui5_connect;

};
