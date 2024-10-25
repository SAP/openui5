sap.ui.define(["sap/ui/core/UIComponent"],
	function( UIComponent) {
	"use strict";

	var Component = UIComponent.extend("testdata.v2asyncRootView.Component", {

		metadata: {
			"interfaces": ["sap.ui.core.IAsyncContentCreation"],

			"properties": {},
			"aggregations": {},
			"associations": {},
			"events": {},
			"publicMethods": [],

			"manifest": "json",

			"custom.entry": {
				"key1": "value1",
				"key2": "value2",
				"key3": {
					"subkey1": "subvalue1",
					"subkey2": "subvalue2"
				},
				"key4": ["value1", "value2"]
			}

		}

	});

	return Component;
});
