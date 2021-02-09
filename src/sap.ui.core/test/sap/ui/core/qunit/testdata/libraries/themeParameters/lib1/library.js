sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.themeParameters.lib1',
		dependencies: [
		]
	});
	return testlibs.themeParameters.lib1; // eslint-disable-line no-undef
});