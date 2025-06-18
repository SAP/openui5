/*
 * ${copyright}
 */

// Provides class testdata.v2modelsext.Component
sap.ui.define(["testdata/v2models/empty/Component"], function(EmptyExtensionComponent) {
	"use strict";

	return EmptyExtensionComponent.extend("testdata.v2models.extension.Component", {

		metadata: {

			manifest: {

				"_version": "2.0.1",

				"sap.app": {
					"id": "testdata.v2models.extension",
					"type": "application",

					"applicationVersion": {
						"version": "1.0.0"
					},

					"i18n": "i18n.properties",
					"title": "{{title}}",
					"description": "{{description}}",

					"dataSources": {

						// override URI
						"default": {
							"uri": "/path/to/default/extension/datasource"
						},

						// add extension annotation
						"default-with-annotations": {
							"uri": "/path/to/default/datasource",
							"settings": {
								"annotations": [ "annotations2", "annotations1", "extension-annotation" ],
								"maxAge": 360
							}
						},

						// extension annotation referenced above
						"extension-annotation": {
							"uri": "path/to/local/extension/annotation",
							"type": "ODataAnnotation"
						},

						// override local URI
						"json-relative": {
							"uri": "path/to/extension/data.json",
							"type": "JSON"
						}

					}
				},

				"sap.ui": {
					"technology": "UI5"
				},

				"sap.ui5": {
					"dependencies": {
						"minUI5Version": "1.28.0",
						"libs": {
							"sap.ui.core": {
								"minVersion": "1.28.0"
							}
						}
					},

					"models": {

						// inherit and only change settings
						"v2-ODataModel": {
							"settings": {
								"useBatch": true,
								"skipMetadataAnnotationParsing": true
							}
						},

						// create model using a dataSource from the parent manifest
						// and redefine the URI
						"xml-extension": {
							"dataSource": "xml-relative",
							"uri": "./path/to/local/data.xml"
						},

						// override i18n model but inherit uri (should still point to parent)
						"resourceBundle-legacy-uri": {
							"type": "sap.ui.model.resource.ResourceModel"
						}

					}
				}

			}

		}

	});

});
