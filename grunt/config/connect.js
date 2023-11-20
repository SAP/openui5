var fs = require('fs');
var url = require('url');


module.exports = function(grunt, config) {

	// determine the testsuite name and lookup the sap.ui.core library
	// to be a bit more dynamic for the livereload middleware
	var testsuiteName = config.testsuite && config.testsuite.name || testsuiteName;
	var sapUiCoreBasePath = 'src/sap.ui.core';
	config.allLibraries.forEach(function(oLib, i) {
		if (oLib.name === 'sap.ui.core') {
			sapUiCoreBasePath = oLib.path;
		}
	});
	var sapUiTestsuiteBasePath = config.testsuite.path;
	var sapUiBuildtime = config.buildtime;

	// set default option
	if (typeof grunt.option('hostname') !== 'string') {
		grunt.option('hostname', '*');
	}

	// set default port
	if (!grunt.option('port')) {
		grunt.option('port', 8080);
	}

	return {

		options: {
			// set default port
			port: +grunt.option('port'),
			// use the next best port if specified port is already in use
			useAvailablePort: true,
			hostname: '<%= grunt.option("hostname") %>'

		},

		src: {

			options: {

				livereload: grunt.option('watch') || false,

				middleware: function(connect, options, middlewares) {
					// hacky solution to replace the "version" / "buildtime" placeholders to enable version comparison
					// the files won't be cached
					function createReplacementMiddleware(filePath) {
						return [ '/' + testsuiteName + '/resources/' + filePath, function(req, res, next) {
							fs.readFile(sapUiCoreBasePath + '/src/' + filePath, { encoding: 'utf-8' } , function(err, data) {
								if (err) {
									res.writeHead(404);
									res.end();
								} else {
									res.writeHead(200, { 'Content-Type': 'application/javascript' });
									data = data.replace(/(?:\$\{version\}|@version@)/g, grunt.config("package.version"));
									if (filePath === "sap/ui/Global.js") {
										data = data.replace(/(?:\$\{buildtime\}|@buildtime@)/g, sapUiBuildtime);
									}
									res.write(data);
									res.end();
								}
							});
						}];
					}

					// make sure to put the middleware after "cors"
					// if "watch" is enabled, there will be another livereload middleware in between
					middlewares.splice(grunt.option('watch') ? 3 : 2, 0,
						createReplacementMiddleware("sap/ui/Global.js"),
						createReplacementMiddleware("sap/ui/core/Configuration.js"),
						createReplacementMiddleware("sap/ui/core/getCompatibilityVersion.js"),
						[ '/' + testsuiteName + '/resources/sap-ui-version.json', function(req, res, next) {

							var version = grunt.config('package.version');

							var sapUiVersionJson = {
								name: testsuiteName,
								version: version,
								buildTimestamp: sapUiBuildtime,
								scmRevision: '',
								gav: 'com.sap.openui5:testsuite:' + version,
								libraries: config.allLibraries.map(function(library) {
									return {
										name: library.name,
										version: version,
										buildTimestamp: sapUiBuildtime,
										scmRevision: ''
									};
								})
							};

							var data = JSON.stringify(sapUiVersionJson, null, "\t");

							res.writeHead(200, {
								'Content-Type': 'application/json'
							});
							res.write(data);
							res.end();

						} ]
					);

					middlewares.unshift(function (req, res, next) {
						var sRequestUrl = req.url;

						if (
							/\/documentation\/test-resources\/\S*/.test(sRequestUrl) ||
							/\/documentation\/resources\/\S*/.test(sRequestUrl) ||
							/\/docs\/api\/\S*/.test(sRequestUrl) ||
							/\/docs\/topics\/\S*/.test(sRequestUrl)
						) {
							req.url = sRequestUrl.replace("/documentation/", "/");
							next();
							return;
						}

						if (
							/^\/testsuite\/documentation\/?$/.test(sRequestUrl) ||
							/^\/testsuite\/documentation\/api(\/?$)?\S*/.test(sRequestUrl) ||
							/^\/testsuite\/documentation\/controls\/?$/.test(sRequestUrl) ||
							/^\/testsuite\/documentation\/controls\/filter\/\S+/.test(sRequestUrl) ||
							/^\/testsuite\/documentation\/entity\/\S+/.test(sRequestUrl) ||
							/^\/testsuite\/documentation\/sample\/\S+/.test(sRequestUrl) ||
							/^\/testsuite\/documentation\/demoapps(\/?$)?\S*/.test(sRequestUrl) ||
							/^\/testsuite\/documentation\/topic(\/?$)?\S*/.test(sRequestUrl) ||
							/^\/testsuite\/documentation\/sitemap(\/?$)?\S*/.test(sRequestUrl)
						) {
							fs.readFile(sapUiTestsuiteBasePath + '/src/main/webapp/documentation-index.tmpl', { encoding: 'utf-8' } , function(err, data) {
								if (err) {
									res.writeHead(404);
									res.end();
									return;
								} else {
									res.writeHead(200, { 'Content-Type': 'text/html' });
									res.write(data);
									res.end();
									return;
								}
							});
						}

						next();
					});

					// Make sure .xml files are served with Content-Type application/xml instead of text/xml
					// as it causes issues with OData / datajs.
					// The new tooling (https://github.com/SAP/ui5-tooling) already uses the correct header.
					middlewares.unshift(function(req, res, next) {
						var sFilePath = url.parse(req.url).pathname;
						if (sFilePath && sFilePath.endsWith(".xml")) {
							res.setHeader("Content-Type", "application/xml");
						}
						next();
					});

					return middlewares;
				}

			}

		},

		target: {
			// no special options here
		}

	};

};
