sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"param1": {
						"manifestpath": "/sap.card/configuration/parameters/param1/value",
						"label": "In one line",
						"type": "string",
						"layout": {
							"alignment": {
								"field": "End"
							}
						}
					},
					"param2": {
						"manifestpath": "/sap.card/configuration/parameters/param2/value",
						"label": "Label alignment: End",
						"type": "string",
						"layout": {
							"alignment": {
								"label": "End"
							}
						}
					},
					"param3": {
						"manifestpath": "/sap.card/configuration/parameters/param3/value",
						"label": "Field first",
						"type": "string",
						"layout": {
							"position": "field-lable"
						}
					},
					"param4": {
						"manifestpath": "/sap.card/configuration/parameters/param4/value",
						"label": "Label width: 40%",
						"type": "string",
						"layout": {
							"label-width": "40%"
						}
					},
					"param5": {
						"manifestpath": "/sap.card/configuration/parameters/param5/value",
						"label": "In one column",
						"type": "string",
						"layout": {
							"label-width": "50%"
						},
						"cols": 1
					},
					"booleanLabel1": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel1/value",
						"label": "boolean in one line",
						"type": "boolean",
						"layout": {
							"label-width": "92.4%",
							"position": "field-lable"
						}
					},
					"booleanLabel2": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel2/value",
						"label": "boolean in one line and one column",
						"type": "boolean",
						"layout": {
							"label-width": "83%",
							"position": "field-lable"
						},
						"cols": 1
					}
				}
			},
			"preview": {
				"modes": "AbstractLive"
			}
		});
	};
});
