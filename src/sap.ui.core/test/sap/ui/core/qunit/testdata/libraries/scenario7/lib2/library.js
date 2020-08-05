sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario7.lib2',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario7.lib2; // eslint-disable-line no-undef
});