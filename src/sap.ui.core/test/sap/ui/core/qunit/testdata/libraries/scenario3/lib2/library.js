sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario3.lib2',
		dependencies: [
			'testlibs.scenario3.lib3',
			'testlibs.scenario3.lib4'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario3.lib2; // eslint-disable-line no-undef
});