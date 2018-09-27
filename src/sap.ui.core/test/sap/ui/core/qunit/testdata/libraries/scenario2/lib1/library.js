sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario2.lib1',
		dependencies: [
			'testlibs.scenario2.lib3',
			'testlibs.scenario2.lib4',
			'testlibs.scenario2.lib5'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario2.lib1; // eslint-disable-line no-undef
});