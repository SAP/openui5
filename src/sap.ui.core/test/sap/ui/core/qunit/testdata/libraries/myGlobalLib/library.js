sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library', 'testlibs/myGlobalLib/types/HalfTheTruth'], function(Core, coreLib, HalfTheTruth) {
	sap.ui.getCore().initLibrary({
		name: 'testlibs.myGlobalLib',
		types: [
			"testlibs.myGlobalLib.types.HalfTheTruth"
		],
		noLibraryCSS: true,
	});
	return testlibs.myGlobalLib;
});