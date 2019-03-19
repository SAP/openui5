sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario15.lib9',
		dependencies: [
			'testlibs.scenario15.lib10'
		],
		noLibraryCSS: true
	});
	return testlibs.scenario15.lib9; // eslint-disable-line no-undef
});