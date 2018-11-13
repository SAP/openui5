sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./CheckJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.HeapOfShards.view.",
		autoWait: true
	});
});