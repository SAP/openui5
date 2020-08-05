sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario5.lib1',
		dependencies: [
			'testlibs.scenario5.lib3',
			'testlibs.scenario5.lib4',
			'testlibs.scenario5.lib5'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario5.lib1; // eslint-disable-line no-undef
});