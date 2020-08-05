sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario1.lib2',
		dependencies: [
			'testlibs.scenario1.lib4',
			'testlibs.scenario1.lib1',
			'testlibs.scenario1.lib7'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario1.lib2; // eslint-disable-line no-undef
});