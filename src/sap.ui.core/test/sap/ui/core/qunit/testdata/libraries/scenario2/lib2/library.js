sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario2.lib2',
		dependencies: [
			'testlibs.scenario2.lib4',
			'testlibs.scenario2.lib1',
			'testlibs.scenario2.lib7'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario2.lib2; // eslint-disable-line no-undef
});