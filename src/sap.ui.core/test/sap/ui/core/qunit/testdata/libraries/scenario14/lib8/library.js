sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario14.lib8',
		dependencies: [
			'testlibs.scenario14.lib1'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario14.lib8; // eslint-disable-line no-undef
});