sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario1.lib1',
		dependencies: [
			'testlibs.scenario1.lib3',
			'testlibs.scenario1.lib4',
			'testlibs.scenario1.lib5'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario1.lib1; // eslint-disable-line no-undef
});