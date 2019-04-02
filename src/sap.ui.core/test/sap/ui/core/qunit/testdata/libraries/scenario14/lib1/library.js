sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario14.lib1',
		dependencies: [
			'testlibs.scenario14.lib2',
			'testlibs.scenario14.lib5'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario14.lib1; // eslint-disable-line no-undef
});