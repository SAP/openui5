// configure the connect server
module.exports = function(grunt, config) {
	var bContainsCore = config.allLibraries.some(function (oLib) {
		return oLib.name === "sap.ui.core";
	});

	if(!bContainsCore) {
		return {
			nothing : {
			}
		};
	}

	var sSourcesFolder = 'target/openui5-sap.ui.core/resources/';

	return {
		options: {
			sourceMap: true
		},
		coreNoJQueryJS: {
			options: {
				footer: 'jQuery.sap.require("sap.ui.core.Core"); sap.ui.getCore().boot && sap.ui.getCore().boot();'
			},
			src: [
				sSourcesFolder + 'sap/ui/Device.js',
				sSourcesFolder + 'sap/ui/thirdparty/URI.js',
				sSourcesFolder + 'jquery.sap.promise.js',
				sSourcesFolder + 'jquery.sap.global.js'
			],
			dest: sSourcesFolder + 'sap-ui-core-nojQuery.js'
		},
		coreJs: {
			options: {
				footer:  '<%= concat.coreNoJQueryJS.options.footer %>'
			},
			src: [
				sSourcesFolder + 'sap/ui/thirdparty/jquery/jquery-1.11.1.js',
				sSourcesFolder + 'sap/ui/thirdparty/jqueryui/jquery-ui-position.js',
				'<%= concat.coreNoJQueryJS.src %>'
			],
			dest: sSourcesFolder + 'sap-ui-core.js'
		},
		debugJS : {
			src: [
					sSourcesFolder + 'sap/ui/debug/ControlTree.js',
					sSourcesFolder + 'sap/ui/debug/Highlighter.js',
					sSourcesFolder + 'sap/ui/debug/LogViewer.js',
					sSourcesFolder + 'sap/ui/debug/PropertyList.js',
					sSourcesFolder + 'sap/ui/debug/DebugEnv.js'
			],
			dest: sSourcesFolder + 'sap-ui-debug.js'
		}
	};
};
