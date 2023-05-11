// task aliases

var semver = require('semver');

module.exports = function(grunt, config) {

	return {

		// Server task
		'serve': function(mode) {
			if (!mode || (mode !== 'src' && mode !== 'target')) {
				mode = 'src';
			}
			var taskName = 'openui5_connect:' + mode;
			if (grunt.option('watch') && mode === 'src') {
				grunt.task.run([ taskName, 'watch']);
			} else {
				grunt.task.run(taskName + ':keepalive');
			}

		},

		// Lint task
		'lint': function(library, glob) {
			var aTasks = [];
			if (arguments.length > 0) {
				Array.prototype.forEach.call(arguments, function(path) {
					grunt.config(['eslint', path], path);
					aTasks.push('eslint:' + path);
				});
			} else {
				aTasks.push('eslint');
			}
			grunt.task.run(aTasks);
		},

		// Build task
		'build': function() {

			// adopt the version to "current" prerelease (with timestamp)
			var version = grunt.config(['package', 'version']);
			var parsedVersion = semver.parse(version);

			if (parsedVersion.prerelease.length > 0) {

				// only increase version for prereleases
				version = semver.inc(version, 'prerelease', grunt.config('buildtime')) + '+sha.<%= lastchange.substr(0,7) %>';

				if (grunt.option('publish') === 'release') {
					// in case of a release, check if version from package.json is NOT a prerelease version
					// the version in package.json should be change before running the publish build
					grunt.fail.fatal('Unable to publish release. "' + version + '" is a prerelease version (see package.json).');
					return;
				}

			}
			grunt.config(['package', 'version'], version);

			var aTasks = [ 'lastchange' ];

			// testsuite
			if (grunt.option('include-test-resources')) {
				aTasks.push('copy:test-target-' + config.testsuite.name);
			}

			config.libraries.forEach(function(library) {

				// copy
				aTasks.push('copy:src-target-' + library.name);
				if (grunt.option('include-test-resources')) {
					aTasks.push('copy:test-target-' + library.name);
				}

				// theme
				aTasks.push('openui5_theme:target-' + library.name);
			});

			aTasks.push('replace');

			// Only bundle core modules if library is included
			if (config.libraries.some(function(lib) { return lib.name === 'sap.ui.core'; })) {
				aTasks.push('concat:coreNoJQueryJS');
				aTasks.push('concat:coreJs');

				aTasks.push('uglify:coreNoJQueryJS');
				aTasks.push('uglify:coreJs');
			}

			config.libraries.forEach(function(library) {

				// library preload
				if (library.type !== 'theme') {
					aTasks.push('openui5_preload:library-' + library.name);
				}

			});

			if (grunt.option('publish')) {

				// clone bower repositories into temp dir
				aTasks.push('clean:tmp');
				aTasks.push('gitclone');

				// copy built resources into individual bower repositories
				config.libraries.forEach(function(library) {
					if (library.bower !== false) {
						// Remove existing resources / test-resources and copy built files
						aTasks.push('clean:bower-' + library.name);
						aTasks.push('copy:bower-' + library.name);
					}
				});

				// update the version info in all bower.json files
				aTasks.push('updateBowerVersions');

				// run git "add commit tag push" to publish the updated bower repo
				aTasks.push('gitadd');
				aTasks.push('gitcommit');
				aTasks.push('gittag');

				// Do not push/publish changes if --dry-run option is used
				if (!grunt.option('dry-run')) {
					aTasks.push('gitpush');
				}

			}

			// run all build tasks
			grunt.task.run(aTasks);
		},

		// Bundle task (execute optionally after 'build')
		'bundle': [
			'copy:bundle'
		],

		'lastchange': function() {
			var done = this.async();

			grunt.util.spawn({
					cmd: 'git',
					args: [ 'rev-parse', 'HEAD' ]
			}, function(error, result, code) {
				if (!error) {
					var hash = result.stdout;
					grunt.config('lastchange', hash);
					grunt.log.writeln('lastchange: ' + hash);
				} else {
					// do not fail if e.g. git command is not found or no git repo exists
					// log the error instead
					grunt.log.error('could not read lastchange:');
					grunt.log.errorlns(error.message);
				}
				done();
			});

		},

		// updates version infos (incl. dependency versions) of bower.json files
		'updateBowerVersions': function() {

			var version = grunt.config(['package', 'version']);

			config.libraries.forEach(function(library) {

				if (library.bower === false) {
					return;
				}

				var bowerFilename = 'tmp/packaged-' + library.name + '/bower.json';

				grunt.log.subhead(library.name);

				var bower = grunt.file.readJSON(bowerFilename);
				var oldVersion = bower.version;

				// update version
				bower.version = version;

				grunt.log.writeln('version: ' + oldVersion + ' => ' + version);

				// check for dependency infos
				if (bower.dependencies) {
					Object.keys(bower.dependencies).forEach(function(dependency) {

						var oldDependencyVersion = bower.dependencies[dependency];
						var oldDependencyVersionParts = oldDependencyVersion.split('#', 1);
						var newDependencyVersion = oldDependencyVersionParts[0] + '#' + version;

						bower.dependencies[dependency] = newDependencyVersion;

						grunt.log.writeln('dependencies.' + dependency + ': ' + oldDependencyVersion + ' => ' + newDependencyVersion);

					});
				}

				grunt.file.write(bowerFilename, JSON.stringify(bower, null, 2));

			});

		},

		// Build task
		'docs': function() {

			var sapUiBuildtime = config.buildtime;
			var version = config.package && config.package.version;
			var useDefaultTemplate = grunt.option('default-template');

			if (!useDefaultTemplate) {
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
				grunt.file.write("target/openui5-sdk/resources/sap-ui-version.json", JSON.stringify(sapUiVersionJson, null, '\t'));
			}

			var aTasks = [];

			config.libraries.forEach(function(library) {
				// ignore theme libs
				if ( library.type === 'theme' ) {
					return;
				}
				aTasks.push('jsdoc:library-' + library.name);
				aTasks.push('copy:faq-target-' + library.name);
				if (!useDefaultTemplate) {
					aTasks.push('ui5docs-preprocess:library-' + library.name);
				}
			});
			if (!useDefaultTemplate) {
				aTasks.push('ui5docs-api-index:openui5-sdk');
			}

			grunt.task.run(aTasks);
		},

		// Default task (called when just running "grunt")
		'default': [
			'lint',
			'clean',
			'build',
			'mochaTest'
		]

	};
};
