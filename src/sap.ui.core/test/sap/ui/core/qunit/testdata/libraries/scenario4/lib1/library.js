sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario4.lib1',
		dependencies: [
			'testlibs.scenario4.lib2'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario4.lib1; // eslint-disable-line no-undef
});