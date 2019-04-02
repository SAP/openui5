sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario14.lib2',
		dependencies: [
			'testlibs.scenario14.lib3',
			'testlibs.scenario14.lib6'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario14.lib2; // eslint-disable-line no-undef
});