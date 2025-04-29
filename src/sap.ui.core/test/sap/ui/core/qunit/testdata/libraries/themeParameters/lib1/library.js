sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.themeParameters.lib1',
		version: '1.0.0',
		apiVersion: 2,
		dependencies: [
		]
	});
	return testlibs.themeParameters.lib1; // eslint-disable-line no-undef
});
