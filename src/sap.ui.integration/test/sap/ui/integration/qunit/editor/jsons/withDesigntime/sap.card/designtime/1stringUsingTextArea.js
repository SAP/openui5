sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"stringWithTextArea": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTextArea/value",
						"type": "string",
						"label": "Use TextArea for a string field",
						"visualization": {
							"type": "TextArea",
							"settings": {
								"value": "{currentSettings>value}",
								"width": "100%",
								"editable": "{config/editable}",
								"placeholder": "{currentSettings>placeholder}",
								"rows": 7
							}
						}
					}
				}
			}
		});
	};
});
