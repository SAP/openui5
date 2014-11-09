jQuery.sap.declare("sap.ui.test.v2.Component");
jQuery.sap.require("sap.ui.core.UIComponent");

sap.ui.core.UIComponent.extend("sap.ui.test.v2.Component", {

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
