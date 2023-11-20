sap.ui.define(["sap/ui/integration/Designtime"
], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"cardTitle": {
						"manifestpath": "/sap.card/configuration/parameters/cardTitle/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"label": "Card Title",
						"allowDynamicValues": true,
						"editableToUser": false,
						"visibleToUser": true,
						"description": "Card Title",
						"cols": 1,
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?",
						"visualization": {
							"fragment": "sap/ui/integration/editor/test/customfield/viz/Input"
						}
					}
				}
			}
		});
	};
});
