/*
 * ${copyright}
 */

// Provides class sap.ui.test.v4models.Component
sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.test.v4models.Component", {
		metadata: {
			manifest: {
				"_version": "1.0.0",
				"sap.app": {
					"_version": "1.0.0",
					"id": "sap.ui.test.v4models",
					"type": "application",
					"applicationVersion": {
						"version": "1.0.0"
					},
					"title": "V4 Models Test",
					"description": "V4 Models Test",
					"dataSources": {
						"ODataV4Consumption" : {
							"uri" : "/path/to/odata/service/",
							"type" : "OData",
							"settings": {
								"annotations": ["annotations1", "annotations2", "annotations3", "annotations4"]
							}
						},
						"annotations1": {
							"uri": "/path/to/odata/annotations/1",
							"type": "ODataAnnotation"
						},
						"annotations2": {
							"uri": "/path/to/odata/annotations/2",
							"type": "ODataAnnotation"
						},
						"annotations3": {
							"uri": "/path/to/odata/annotations/3",
							"type": "ODataAnnotation"
						},
						"annotations4": {
							"uri": "/path/to/odata/annotations/4",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui": {
					"_version": "1.0.0",
					"technology": "UI5"
				},
				"sap.ui5": {
					"_version": "1.0.0",
					"dependencies": {
						"minUI5Version": "1.80.0",
						"libs": {
							"sap.ui.core": {
								"minVersion": "1.80.0"
							}
						}
					},
					"models": {
						"ODataV4Consumption": {
							"dataSource": "ODataV4Consumption",
							"settings" : {
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
