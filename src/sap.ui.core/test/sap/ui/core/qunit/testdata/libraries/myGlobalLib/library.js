sap.ui.define([
	'sap/ui/core/Core',
	"sap/ui/core/Lib",
	'sap/ui/core/library',
	'testlibs/myGlobalLib/types/HalfTheTruth'
], function(Core, Library, coreLib, HalfTheTruth) {
	"use strict";
	var thisLib = Library.init({
		name: 'testlibs.myGlobalLib',
		types: [
			"testlibs.myGlobalLib.types.HalfTheTruth"
		],
		noLibraryCSS: true
	});
	return thisLib;
});