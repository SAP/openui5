sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"group": {
						"label": "Group1",
						"type": "group",
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"stringParameter": {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"label": "StaticLabel",
						"defaultValue": "StaticLabelDefaultValue",
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					}
				}
			}
		});
	};
});
