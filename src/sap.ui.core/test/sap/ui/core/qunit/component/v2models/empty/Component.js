/*
 * ${copyright}
 */

// Provides class sap.ui.test.v2modelsext.Component
sap.ui.define(["sap/ui/test/v2models/parent/Component"], function(ParentComponent) {

	return ParentComponent.extend("sap.ui.test.v2models.empty.Component", {

		metadata: {

			manifest: {

				"_version": "1.0.0",

				"sap.app": {
					"_version": "1.0.0",
					"id": "sap.ui.test.v2models.empty",
					"type": "application",
					"applicationVersion": {
						"version": "1.0.0"
					},
					"i18n": "i18n.properties",
					"title": "{{title}}",
					"description": "{{description}}"
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
					}

				}

			}

		}

	});

}, /* bExport= */ true);
