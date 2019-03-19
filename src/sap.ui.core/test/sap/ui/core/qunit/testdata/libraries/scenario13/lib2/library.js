sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario13.lib2',
		dependencies: [
			'testlibs.scenario13.lib4',
			'testlibs.scenario13.lib1',
			'testlibs.scenario13.lib7'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario13.lib2; // eslint-disable-line no-undef
});