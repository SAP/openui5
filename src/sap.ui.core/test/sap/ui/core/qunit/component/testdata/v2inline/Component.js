sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("testdata.v2inline.Component", {

		metadata: {
			"interfaces": ["sap.ui.core.IAsyncContentCreation"],

			"manifest": {
				"_version": "2.0.0",
				"name": "testdata.v2inline.Component",

				"sap.app": {
					"id": "testdata.v2inline",
					"applicationVersion": {
						"version": "1.0.0"
					},
					"title": "{{title}}",
					"description": "{{description}}"
				},

				"sap.ui5": {

					"resourceRoots": {
						"x.y.z": "anypath",
						"foo.bar": "../../foo/bar"
					},

					"resources": {
						"css": [
							{
								"uri": "style.css",
								"id": "mystyle"
							},
							{}
						]
					},

					"dependencies": {
						"minUI5Version": "1.22.5",
						"libs": {
							"sap.ui.layout": {
								"minVersion": "1.22.0"
							}
						},
						"components": {
							"testdata.other": {
								"optional": true,
								"minVersion": "1.0.1"
							}
						}
					},

					"models": {
						"i18n": {
							"type": "sap.ui.model.resource.ResourceModel",
							"uri": "i18n/i18n.properties"
						},
						"sfapi": {
							"type": "sap.ui.model.odata.v2.ODataModel",
							"uri": "./some/odata/service/"
						}
					},

					"rootView": {
						"viewName": "testdata.view.Main",
						"type": "XML"
					},

					"config": {
						"any1": {
							"entry": "configuration"
						},
						"any2": {
							"anyobject": {
								"key1": "value1"
							}
						},
						"any3": {
							"anyarray": [1, 2, 3]
						},
						"zero": 0
					},

					"routing": {
						"config": {
							"type": "View",
							"viewType" : "XML",
							"path": "NavigationWithoutMasterDetailPattern.view",
							"targetParent": "myViewId",
							"targetControl": "app",
							"targetAggregation": "pages",
							"clearTarget": false
						},
						"routes": [
							{
								"name" : "myRouteName1",
								"pattern" : "FirstView/{from}",
								"view" : "myViewId"
							}
						]
					},

					"extends": {
						"extensions": {
							"sap.ui.viewReplacements": {
								"testdata.view.Main": {
									"viewName": "testdata.view.Main",
									"type": "XML"
								}
							},
							"sap.ui.controllerReplacements": {
								"testdata.view.Main": "testdata.view.Main"
							},
							"sap.ui.viewExtensions": {
								"testdata.view.Main": {
									"extension": {
										"name": "sap.xx.new.Fragment",
										"type": "sap.ui.core.XMLFragment"
									}
								}
							},
							"sap.ui.viewModification": {
								"testdata.view.Main": {
									"myControlId": {
										"text": "{{mytext}}"
									}
								}
							}
						}
					}

				},

				// getEntry is not allowed for keys without a dot
				"foo": {},

				"foo.bar": "string as entry value is not valid!"
			},

			"custom.entry": {
				"key1": "value1",
				"key2": "value2",
				"key3": {
					"subkey1": "subvalue1",
					"subkey2": "subvalue2"
				},
				"key4": ["value1", "value2"]
			}

		}

	});

	return Component;
});
