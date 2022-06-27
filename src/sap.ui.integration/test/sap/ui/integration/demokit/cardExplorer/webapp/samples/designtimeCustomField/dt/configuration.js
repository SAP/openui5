sap.ui.define(["sap/ui/integration/Designtime"], function (
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
							"fragment": "card/explorer/designtime/customfield/viz/Input"
						}
					},
					"dateRange": {
						"manifestpath": "/sap.card/configuration/parameters/dateRange/value",
						"type": "string",
						"label": "Date Range",
						"displayFormat": "yyyy/MM/dd",
						"visualization": {
							"type": "card/explorer/designtime/customfield/viz/CustomDateRangeSelection",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"displayFormat": "{currentSettings>displayFormat}"
							}
						}
					}
				}
			},
			"preview": {
				"modes": "None"
			}
		});
	};
});
