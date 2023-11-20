sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"destination.group": {
						"label": "Destinations group label defined in DT",
						"type": "group"
					},
					"generalGroup": {
						"type": "group",
						"label": "General",
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"cardTitle": {
						"manifestpath": "/sap.card/configuration/parameters/cardTitle/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"allowDynamicValues": true,
						"editableToUser": false,
						"visibleToUser": false
					},
					"local.destination": {
						"type": "destination",
						"label": "{i18n>TRANSLATED_DESTINATION_LABEL} defined in dt",
						"editable": false
					},
					"northwind.destination": {
						"type": "destination",
						"label": "label of northwind destination defined in dt"
					}
				}
			},
			"preview": {
				"modes": "None"
			}
		});
	};
});
