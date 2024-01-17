sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"objectsWithSpecialPropertiesDefined": {
						"manifestpath": "/sap.card/configuration/parameters/objectsWithSpecialPropertiesDefined/value",
						"type": "object[]",
						"label": "Object List with special properties defined",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text01", "key": "key01", "type": "type01", "object": { "text": "text01", "key": "key01"}},
										{ "text": "text02", "key": "key02", "type": "type02", "object": { "text": "text02", "key": "key02"} },
										{ "text": "text03", "key": "key03", "type": "type02", "object": { "text": "text03", "key": "key03"} },
										{ "text": "text04", "key": "key04", "type": "type03", "object": { "text": "text04", "key": "key04"} },
										{ "text": "text05", "key": "key05", "type": "type03", "object": { "text": "text05", "key": "key05"} },
										{ "text": "text06", "key": "key06", "type": "type04", "object": { "text": "text06", "key": "key06"} },
										{ "text": "text07", "key": "key07", "type": "type05", "object": { "text": "text07", "key": "key07"} },
										{ "text": "text08", "key": "key08", "type": "type06", "object": { "text": "text08", "key": "key08"} }
									]
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "Key",
								"column": {
									"filterProperty": "key"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"type": {
								"label": "Type",
								"type": "string",
								"values": {
									"data": {
										"json": {
											"values": [
												{ "text": "Type 01", "key": "type01"},
												{ "text": "Type 02", "key": "type02"},
												{ "text": "Type 03", "key": "type03"},
												{ "text": "Type 04", "key": "type04"},
												{ "text": "Type 05", "key": "type05"},
												{ "text": "Type 06", "key": "type06"}
											]
										},
										"path": "/values"
									},
									"item": {
										"text": "{text}",
										"key": "{key}"
									}
								}
							},
							"object": {
								"label": "Object",
								"type": "object",
								"column": {
									"hAlign": "Center",
									"width": "10rem"
								}
							}
						}
					}
				}
			}
		});
	};
});
