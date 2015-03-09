/*
 * ${copyright}
 */

// Provides class sap.ui.test.v2models.Component
sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {

	return sap.ui.core.UIComponent.extend("sap.ui.test.v2models.Component", {

		metadata: {

			manifest: {

				"_version": "1.0.0",

				"sap.app": {
					"_version": "1.0.0",
					"id": "samples.components.models.Component",
					"type": "application",
					"applicationVersion": {
						"version": "1.0.0"
					},
					"dataSources": {

						"default": {
							"uri": "/path/to/default/datasource"
						},

						"default-with-annotations": {
							"uri": "/path/to/default/datasource",
							"settings": {
								"annotations": [ "annotations2", "annotations1" ],
							}
						},

						"OData": {
							"uri": "/path/to/odata/service",
							"type": "OData",
							"settings": {
								"odataVersion": "2.0", // TODO: how to translate into constructor arguments? Ignore for now...
								"annotations": [ "annotations1", "annotations2" ],
								"localMetaDataUri": "/path/to/local/metadata.xml" // TODO: how to translate into constructor arguments? Ignore for now
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

						"json": {
							"uri": "/path/to/data.json",
							"type": "JSON"
						},

						"xml": {
							"uri": "/path/to/data.xml",
							"type": "XML"
						},

						"customType": {
							"uri": "/path/to/custom.datatype",
							"type": "SomeCustomType"
						},

						"odata-invalid-annotations": {
							"type": "OData",
							"uri": "/path/to/odata/service",
							"settings": {
								"annotations": [ "undefined", "annotations1", "annotation-without-uri", "json" ]
							}
						},

						"annotation-without-uri": {
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
						"minUI5Version": "1.28.0",
						"libs": {
							"sap.ui.core": {
								"minVersion": "1.28.0"
							}
						}
					},

					"models": {

						"": "default",

						"default-with-annotations": "default-with-annotations",

						"old-uri-syntax": {
							"type": "sap.ui.model.odata.v2.ODataModel",
							"uri": "/path/to/odata/service"
						},

						"ODataModel": {
							"type": "sap.ui.model.odata.ODataModel",
							"dataSource": "OData",
							"settings": {
								"useBatch": false,
								"refreshAfterChange": false
							}
						},

						"v2-ODataModel": {
							"type": "sap.ui.model.odata.v2.ODataModel",
							"settings": {
								"serviceUrl": "/path/to/odata/service",
								"useBatch": true,
								"refreshAfterChange": true
							}
						},

						"invalid-annotations": {
							"dataSource": "odata-invalid-annotations"
						},

						"json": "json",

						"xml": "xml",

						"resourceBundle-name": {
							"type": "sap.ui.model.resource.ResourceModel",
							"settings": {
								"bundleName": "sap.ui.test.v2models.i18n"
							}
						},

						"resourceBundle-legacy-uri": {
							"type": "sap.ui.model.resource.ResourceModel",
							"uri": "./i18n.properties"
						},

						"custom-uri-string": {
							"type": "sap.ui.test.v2models.CustomModel",
							"dataSource": "customType"
						},

						"custom-uri-string-with-settings": {
							"type": "sap.ui.test.v2models.CustomModel",
							"dataSource": "customType",
							"settings": {
								"foo": "bar"
							}
						},

						"custom-without-args": {
							"type": "sap.ui.test.v2models.CustomModel"
						},

						"custom-uri-setting-name": {
							"type": "sap.ui.test.v2models.CustomModel",
							"dataSource": "customType",
							"uriSettingName": "myUri"
						},

						"custom-uri-setting-merge": {
							"type": "sap.ui.test.v2models.CustomModel",
							"dataSource": "customType",
							"uriSettingName": "uri",
							"settings": {
								"foo": "bar"
							}
						},

						"custom-uri-setting-already-defined": {
							"type": "sap.ui.test.v2models.CustomModel",
							"dataSource": "customType",
							"uriSettingName": "uri",
							"settings": {
								"uri": "foo"
							}
						},

						// error cases (should not create any model)
						"no-model-type": {
							"uri": "/path/to/foo/bar"
						},
						"missing-model-class": {
							"type": "sap.ui.not.defined.Model"
						},
						"model-not-found": {
							"type": "sap.ui.test.v2models.ModelNotDefined"
						}

					}

				}

			}

		}

	});

}, /* bExport= */ true);
