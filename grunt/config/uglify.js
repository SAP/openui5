// configure uglify
module.exports = function(grunt, config) {
	var bContainsCore = config.allLibraries.some(function (oLib) {
		return oLib.name === "sap.ui.core";
	});

	if (!bContainsCore) {
		return {
			nothing : {
			}
		};
	}

	var sSourcesFolder = 'target/openui5-sap.ui.core/resources/';

	return {
		options: {
			banner: 'window["sap-ui-optimized"] = true;',
			preserveComments: /copyright|\(c\)|released under|license|\u00a9/i
		},
		coreNoJQueryJS: {
			src: sSourcesFolder + 'sap-ui-core-nojQuery-dbg.js',
			dest: sSourcesFolder + 'sap-ui-core-nojQuery.js'
		},
		coreJs: {
			src: sSourcesFolder + 'sap-ui-core-dbg.js',
			dest: sSourcesFolder + 'sap-ui-core.js'
		}
	};
};
