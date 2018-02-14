// configure concat
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
		coreNoJQueryJS: {
			options: {
				footer: 'if (!window["sap-ui-debug"]) { sap.ui.requireSync("sap/ui/core/library-preload"); } sap.ui.requireSync("sap/ui/core/Core"); sap.ui.getCore().boot && sap.ui.getCore().boot();'
			},
			src: [
				sSourcesFolder + 'sap/ui/thirdparty/baseuri.js',
				sSourcesFolder + 'sap/ui/thirdparty/es6-promise.js',
				sSourcesFolder + "sap/ui/thirdparty/es6-string-methods.js",
				sSourcesFolder + "ui5loader.js",
				sSourcesFolder + "ui5loader-autoconfig.js"
			],
			dest: sSourcesFolder + 'sap-ui-core-nojQuery-dbg.js'
		},
		coreJs: {
			options: {
				footer:  '<%= concat.coreNoJQueryJS.options.footer %>'
			},
			src: [
				sSourcesFolder + 'sap/ui/thirdparty/baseuri.js',
				sSourcesFolder + 'sap/ui/thirdparty/es6-promise.js',
				sSourcesFolder + "sap/ui/thirdparty/es6-string-methods.js",
				sSourcesFolder + "ui5loader.js",
				sSourcesFolder + "ui5loader-autoconfig.js"
			],
			dest: sSourcesFolder + 'sap-ui-core-dbg.js'
		}
	};
};
