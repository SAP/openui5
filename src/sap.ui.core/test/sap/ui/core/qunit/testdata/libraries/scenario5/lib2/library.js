sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario5.lib2',
		dependencies: [
			'testlibs.scenario5.lib3',
			'testlibs.scenario5.lib5'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario5.lib2; // eslint-disable-line no-undef
});