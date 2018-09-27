sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario1.lib5',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario1.lib5; // eslint-disable-line no-undef
});