sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario16.embeddingLib',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario16.embeddingLib; // eslint-disable-line no-undef
});