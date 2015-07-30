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
				footer: 'if (!window["sap-ui-debug"]) { jQuery.sap.preloadModules("sap.ui.core.library-preload", false); } jQuery.sap.require("sap.ui.core.Core"); sap.ui.getCore().boot && sap.ui.getCore().boot();'
			},
			src: [
				sSourcesFolder + 'sap/ui/Device.js',
				sSourcesFolder + 'sap/ui/thirdparty/URI.js',
				sSourcesFolder + 'sap/ui/thirdparty/es6-promise.js',
				sSourcesFolder + 'jquery.sap.global.js'
			],
			dest: sSourcesFolder + 'sap-ui-core-nojQuery-dbg.js'
		},
		coreJs: {
			options: {
				footer:  '<%= concat.coreNoJQueryJS.options.footer %>'
			},
			src: [
				sSourcesFolder + 'sap/ui/thirdparty/jquery.js',
				sSourcesFolder + 'sap/ui/thirdparty/jqueryui/jquery-ui-position.js',
				'<%= concat.coreNoJQueryJS.src %>'
			],
			dest: sSourcesFolder + 'sap-ui-core-dbg.js'
		}
	};
};
