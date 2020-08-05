sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario15.lib3',
		dependencies: [
			'testlibs.scenario15.lib4'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario15.lib3; // eslint-disable-line no-undef
});