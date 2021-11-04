/* global QUnit */

sap.ui.define([
	"sap/ui/integration/ManifestResolver"
], function (
	ManifestResolver
) {
	"use strict";

	QUnit.module("Generic");

	QUnit.test("Resolve bindings to default model", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card",
				"i18n": {
					"bundleUrl": "i18n/i18n.properties",
					"supportedLocales": [""],
					"fallbackLocale": ""
				}
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "./employee.json"
					}
				},
				"header": {
					"title": "{firstName} {lastName}"
				},
				"content": {
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
									"label": "First name",
									"value": "{firstName}"
								}
							]
						}
					]
				}
			}
		};

		// Act
		return ManifestResolver.resolve(oManifest, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/")
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Donna Moore", "Binding is resolved in the header");
				assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].value, "Donna", "Binding is resolved in the content");
			});
	});

	QUnit.test("Resolve bindings to named data section", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card",
				"i18n": {
					"bundleUrl": "i18n/i18n.properties",
					"supportedLocales": [""],
					"fallbackLocale": ""
				}
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "./employee.json"
					},
					"name": "myDataSection"
				},
				"header": {
					"title": "{myDataSection>/firstName} {myDataSection>/lastName}"
				},
				"content": {
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
									"label": "First name",
									"value": "{myDataSection>/firstName}"
								}
							]
						}
					]
				}
			}
		};

		// Act
		return ManifestResolver.resolve(oManifest, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/")
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Donna Moore", "Binding is resolved in the header");
				assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].value, "Donna", "Binding is resolved in the content");
			});
	});

	QUnit.test("Resolve translations", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card",
				"i18n": {
					"bundleUrl": "i18n/i18n.properties",
					"supportedLocales": [""],
					"fallbackLocale": ""
				}
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "./employee.json"
					}
				},
				"header": {
					"title": "{{contactDetails}}"
				},
				"content": {
					"groups": [
						{
							"title": "{i18n>contactDetails}",
							"items": [
								{
									"label": "First name",
									"value": "{firstName}"
								}
							]
						}
					]
				}
			}
		};

		// Act
		return ManifestResolver.resolve(oManifest, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/")
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Contact Details", "Double curly bracket translation syntax is resolved");
				assert.strictEqual(oRes["sap.card"].content.groups[0].title, "Contact Details", "Translation syntax is resolved from i18n model");
			});
	});

	QUnit.test("Resolve manifest with empty sections", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "./employee.json"
					}
				}
			}
		};

		// Act
		return ManifestResolver.resolve(oManifest, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/")
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.ok(true, "No error were thrown");
				assert.ok(oRes, "There is result returned");
			});
	});

	QUnit.module("Precedence of 'data' sections", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "manifestResolver.test.card",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"data": {
						"json": {
							"json": {
								"key": "value from card"
							}
						}
					},
					"header": {
						"data": {
							"json": {
								"key": "value from header"
							}
						},
						"title": "{key}"
					},
					"content": {
						"data": {
							"json": {
								"key": "value from content"
							}
						},
						"groups": [
							{
								"title": "{key}",
								"items": []
							}
						]
					}
				}
			};
		}
	});

	QUnit.test("Content binding is resolved against its own data", function (assert) {
		// Act
		return ManifestResolver.resolve(this.oManifest, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/")
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].content.groups[0].title, "value from content", "Value should be taken from the closest data section");
			});
	});

	QUnit.test("Header binding is resolved against its own data", function (assert) {
		// Act
		return ManifestResolver.resolve(this.oManifest, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/")
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "value from header", "Value should be taken from the closest data section");
			});
	});

	QUnit.module("Resolving templates");

	QUnit.test("List item template", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [
							{
								"Name": "Comfort Easy"
							},
							{
								"Name": "ITelO Vault"
							}
						]
					},
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		// Act
		return ManifestResolver.resolve(oManifest, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/")
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].content.items[0].title, oManifest["sap.card"].content.data.json[0].Name, "Item should be created from the list template");
				assert.strictEqual(oRes["sap.card"].content.items[1].title, oManifest["sap.card"].content.data.json[1].Name, "Item should be created from the list template");
			});
	});

	QUnit.test("Filter item template", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"filters": {
						"myFilter": {
							"value": "1",
							"type": "Select",
							"item": {
								"template": {
									"key": "{ShipperID}",
									"title": "{CompanyName}"
								}
							},
							"data": {
								"json": [
									{
										"ShipperID": 1,
										"CompanyName": 1
									}
								]
							}
						}
					}
				}
			}
		};

		// Act
		return ManifestResolver.resolve(oManifest, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/")
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(
					oRes["sap.card"].configuration.filters.myFilter.items[0].title,
					oManifest["sap.card"].configuration.filters.myFilter.data.json[0].Name,
					"Item should be created from the template"
				);
			});
	});

});