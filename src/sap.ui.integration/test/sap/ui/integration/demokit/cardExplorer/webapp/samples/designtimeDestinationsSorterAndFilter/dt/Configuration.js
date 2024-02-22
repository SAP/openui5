sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"destination.group": {
						"label": "Destinations",
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
						"label": "destination"
					},
					"northwind.destination": {
						"type": "destination",
						"label": "northwind destination with sorter",
						"sorter": [{
							"path": "name",
							"descending": true
						}]
					},
					"Northwind_V2.destination": {
						"type": "destination",
						"label": "northwind V2 destination with sorter and filter",
						"sorter": [{
							"path": "name",
							"descending": true
						}],
						"filter": {
							"path": "name",
							"operator": "StartsWith",
							"value1": "North"
						}
					},
					"Northwind_V3.destination": {
						"type": "destination",
						"label": "northwind V3 destination with sorter and filters",
						"sorter": [{
							"path": "name",
							"descending": true
						}],
						"filter": {
							"filters": [{
								"path": "name",
								"operator": "StartsWith",
								"value1": "North"
							},{
								"path": "name",
								"operator": "EndsWith",
								"value1": "Server"
							}],
							"and": false
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
