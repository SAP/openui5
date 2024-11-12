sap.ui.define(["sap/ui/core/UIComponent"],
	function(UIComponent) {
	"use strict";

	// ui5lint-disable-next-line async-component-flags
	var Component = UIComponent.extend("testdata.v2.Component", {

		metadata: {

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
