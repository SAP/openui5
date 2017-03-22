sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario6.lib2',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario6.lib2;
});