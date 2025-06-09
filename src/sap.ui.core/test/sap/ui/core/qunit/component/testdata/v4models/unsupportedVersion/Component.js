/*
 * ${copyright}
 */

// Provides class testdata.v4models.unsupportedVersion.Component
sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";

	return UIComponent.extend("testdata.v4models.unsupportedVersion.Component", {
		metadata: {
			manifest: {
				"_version": "2.0.0",
				"sap.app": {
					"id": "testdata.v4models.unsupportedVersion",
					"type": "application",

					"applicationVersion": {
						"version": "1.0.0"
					},

					"title": "V4 Models Test - Unsupported Service Version",
					"description": "V4 Models Test - Unsupported Service Version",

					"dataSources": {
						"ODataV2Consumption" : {
							"uri" : "/path/to/odata/service/",
							"type" : "OData",
							"settings" : {
								"odataVersion" : "foo"
							}
						}
					}
				},
				"sap.ui": {
					"technology": "UI5"
				},
				"sap.ui5": {
					"dependencies": {
						"minUI5Version": "1.49.0",
						"libs": {
							"sap.ui.core": {
								"minVersion": "1.49.0"
							}
						}
					},

					"models": {
						"ODataV2Consumption": {
							"dataSource": "ODataV2Consumption",
							"settings" : {
								"autoExpandSelect" : false,
								"operationMode" : "Server"
							},
							"type" : "sap.ui.model.odata.v4.ODataModel"
						}
					}
				}
			}
		}
	});
});
