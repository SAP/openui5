sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario15.lib2',
		dependencies: [
			'testlibs.scenario15.lib4',
			'testlibs.scenario15.lib1',
			'testlibs.scenario15.lib7'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario15.lib2; // eslint-disable-line no-undef
});