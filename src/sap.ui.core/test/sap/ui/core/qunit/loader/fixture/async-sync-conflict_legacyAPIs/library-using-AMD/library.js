sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";

	Log.info("executing library-using-AMD from separate file");

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