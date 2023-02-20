sap.ui.predefine("fixture/async-sync-conflict_legacyAPIs/library-using-AMD/library", ["sap/base/Log"], function(Log) {
	"use strict";

	Log.info("executing factory of library-using-AMD from preload");

	sap.ui.getCore().initLibrary({
		name: "fixture.async-sync-conflict_legacyAPIs.library-using-AMD",
		types: [
			"fixture.async-sync-conflict_legacyAPIs.library-using-AMD.subpackage.MyEnum"
		]
	});

	var thisLib = fixture["async-sync-conflict_legacyAPIs"]["library-using-AMD"]; // eslint-disable-line no-undef

	thisLib.subpackage.MyEnum = {
		Value1: "Value1",
		Value2: "Value2"
	};

	return thisLib;
});