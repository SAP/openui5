/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/Host",
	"sap/ui/integration/util/ManifestResolver",
	"sap/ui/integration/util/SkeletonCard",
	"sap/ui/integration/util/AnalyticsCloudHelper",
	"sap/base/Log",
	"qunit/testResources/nextCardReadyEvent"
], function (
	Library,
	Host,
	ManifestResolver,
	SkeletonCard,
	AnalyticsCloudHelper,
	Log,
	nextCardReadyEvent
) {
	"use strict";

	function createManifestWithFormElement(oFormElement) {
		return {
			"sap.app": {
				"id": "test.mobileSdk.form",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"activityTypes": [
							{
								"id": "activity1",
								"title": "Processing"
							},
							{
								"id": "activity2",
								"title": "Monitoring"
							}
						],
						"priorityLevels": [
							{ "key": "low", "text": "Low Priority" },
							{ "key": "medium", "text": "Medium Priority" },
							{ "key": "high", "text": "High Priority" }
						],
						"activityTypeSelectedKey": "activity1"
					}
				},
				"content": {
					"groups": [
						{
							"items": [
								oFormElement
							]
						}
					]
				}
			}
		};
	}

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
					"title": "{firstName} {lastName}",
					"icon": {
						"src": "{photo}"
					}
				},
				"content": {
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
									"icon": {
										"src": "{photo}"
									},
									"label": "First name",
									"value": "{firstName}"
								}
							]
						}
					]
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Donna Moore", "Binding is resolved in the header");
				assert.strictEqual(oRes["sap.card"].header.icon.src, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/./images/Woman_avatar_01.png", "The icon paths are resolved correctly.");
				assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].value, "Donna", "Binding is resolved in the content");
				assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].icon.src, "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/./images/Woman_avatar_01.png", "The icon paths are resolved correctly.");

				oCard.destroy();
			});
	});

	QUnit.test("Resolve bindings inside Object item 'valueEntries' array", function (assert) {
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
				"content": {
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
									"label": "Contacts",
									"valueEntries": [
										{
											"value": "{phone}",
											"tooltip": "Call {firstName}",
											"actions": [
												{
													"type": "Navigation",
													"parameters": {
														"url": "tel:{phone}"
													}
												}
											]
										},
										{
											"value": "{company/website}",
											"visible": "{= ${firstName} === 'Donna' }"
										}
									]
								}
							]
						}
					]
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oItem = oRes["sap.card"].content.groups[0].items[0];
				var aValues = oItem.valueEntries;

				// Assert
				assert.ok(Array.isArray(aValues), "The 'valueEntries' array is preserved in the resolved manifest.");
				assert.strictEqual(aValues.length, 2, "Both value entries are present.");
				assert.strictEqual(aValues[0].value, "+1 202 555 5555", "Binding in the first value entry is resolved.");
				assert.strictEqual(aValues[0].tooltip, "Call Donna", "Binding in the entry tooltip is resolved.");
				assert.strictEqual(aValues[0].actions[0].parameters.url, "tel:+1 202 555 5555", "Binding in the entry action is resolved.");
				assert.strictEqual(aValues[1].value, "https://www.company_a.example.com", "Binding in the second value entry is resolved.");
				assert.strictEqual(aValues[1].visible, true, "Expression binding for the entry visibility is resolved to a boolean.");

				oCard.destroy();
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

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Donna Moore", "Binding is resolved in the header");
				assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].value, "Donna", "Binding is resolved in the content");

				oCard.destroy();
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

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Contact Details", "Double curly bracket translation syntax is resolved");
				assert.strictEqual(oRes["sap.card"].content.groups[0].title, "Contact Details", "Translation syntax is resolved from i18n model");

				oCard.destroy();
			});
	});

	QUnit.test("Resolve translations when there are no 'data' sections", function (assert) {
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
				"header": {
					"title": "{{contactDetails}}",
					"subtitle": "{i18n>contactDetails}"
				},
				"content": {
					"groups": [
						{
							"title": "Group",
							"items": []
						}
					]
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Contact Details", "Double curly bracket translation syntax is resolved");
				assert.strictEqual(oRes["sap.card"].header.subTitle, "Contact Details", "Translation syntax is resolved from i18n model");

				oCard.destroy();
			});
	});

	QUnit.test("Resolve predefined translations", function (assert) {
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
				"data": {
					"request": {
						"url": "./products.json"
					}
				},
				"type": "List",
				"header": {
					"title": "Products",
					"subtitle": "{= format.text(${i18n>subtitle_data_count}, [${uniqueCategories}, ${count}]) }",
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"maxItems": 1,
					"item": {
						"title": "{Name}",
						"description": "{Description}"
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var sResolvedStatusText = oRes["sap.card"].header.status.text;
				// Assert
				assert.strictEqual(sResolvedStatusText, "3 of 3", "Predefined translation key is correctly resolved");

				var sResolvedFormattedTranslation = oRes["sap.card"].header.subTitle;
				assert.strictEqual(sResolvedFormattedTranslation, "2 categories, 3 items", "Formatted translation from i18n file is correctly resolved");

				oCard.destroy();
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

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.ok(true, "No error were thrown");
				assert.ok(oRes, "There is result returned");

				oCard.destroy();
			});
	});

	QUnit.test("Resolve with a severe error in the card", function (assert) {
		// Arrange
		var oManifest = {},
			oCard = new SkeletonCard({
				manifest: oManifest,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
			}),
			oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

		assert.expect(1);

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"message": {
						"type": "error",
						"title": oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"),
						"description": oResourceBundle.getText("CARD_ERROR_CONFIGURATION_DESCRIPTION"),
						"details": "Card sap.app/id entry in the manifest is mandatory There must be a 'sap.card' section in the manifest.",
						"illustrationType": "sapIllus-UnableToLoad",
						"illustrationSize": "Small"
					}
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "The content contains a message when there is a severe error.");

				oCard.destroy();
			});
	});

	QUnit.test("Resolve with unreachable manifest", function (assert) {
		// Arrange
		var oCard = new SkeletonCard();
		oCard.setManifest("UnreachableManifestUrl");

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {

				// Assert
				assert.notOk(oRes["sap.card"].content.message.description === "", "The content contains a message description even when the manifest is unreachable.");
				oCard.destroy();
			});
	});

	QUnit.test("Resolve with data loading error", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card.errorData",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "./wrong_url.json"
					}
				},
				"header": {
					"title": "Error in data loading"
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
		},
			oCard = new SkeletonCard({
				manifest: oManifest,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
			}),
			oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"message": {
						"type": "error",
						"title": "404 " + oResourceBundle.getText("CARD_ERROR_REQUEST_NOTFOUND_TITLE"),
						"illustrationType": "sapIllus-PageNotFound",
						"illustrationSize": "Auto",
						"description": oResourceBundle.getText("CARD_ERROR_REQUEST_DESCRIPTION")
					}
				},
					oResult = oRes["sap.card"].content;

				delete oResult.message.details;

				// Assert
				assert.deepEqual(oResult, oExpectedResult, "The content contains a message when there is error with data loading.");

				oCard.destroy();
			});
	});

	QUnit.test("Resolve with syntax error in data provider", function (assert) {
		// Arrange
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");
		var oManifest = {
				"sap.app": {
					"id": "manifestResolver.test.card.errorDataSyntax",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"extension": "./extensions/ExtensionSimulateFetchError",
					"data": {
						"request": {
							"url": "./wrong_url.json"
						}
					},
					"header": {
						"title": "Syntax Error in Data Provider"
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
			},
			oCard = new SkeletonCard({
				manifest: oManifest,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
						"message": {
							"type": "error",
							"title": oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"),
							"illustrationType": "sapIllus-UnableToLoad",
							"illustrationSize": "Auto",
							"description": oResourceBundle.getText("CARD_ERROR_CONFIGURATION_DESCRIPTION")
						}
					},
					oResult = oRes["sap.card"].content;

				delete oResult.message.details;

				// Assert
				assert.deepEqual(oResult, oExpectedResult, "The content contains a message with correct error description.");

				oCard.destroy();
			});
	});

	QUnit.test("There should be no 'undefined' values", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": [
						{
							"training": "Scrum"
						}
					]
				},
				"content": {
					"item": {
						"title": "{ nonexistent training }"
					}
				}
			}
		};
		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				function hasUndefined(obj) {
					var bFound = false;

					for (var key in obj) {
						if (obj[key] === undefined) {
							bFound = true;
						} else if (Array.isArray(obj[key])) {

							bFound = obj[key].some(hasUndefined);
						} else if (typeof obj[key] === 'object') {
							bFound = hasUndefined(obj[key]);
						}

						if (bFound) {
							return true;
						}
					}

					return false;
				}

				// Assert
				assert.notOk(hasUndefined(oRes), "The resolved manifest shouldn't contain any 'undefined' value.");

				oCard.destroy();
			});
	});

	QUnit.module("Precedence of 'data' sections", {
		beforeEach: function () {
			this.oCard = new SkeletonCard({
				manifest: {
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
				},
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Content binding is resolved against its own data", function (assert) {
		// Act
		return ManifestResolver.resolveCard(this.oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].content.groups[0].title, "value from content", "Value should be taken from the closest data section");
			});
	});

	QUnit.test("Header binding is resolved against its own data", function (assert) {
		// Act
		return ManifestResolver.resolveCard(this.oCard)
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
								"Name": "Comfort Easy",
								"Icon": "../../images/Woman_avatar_01.png",
								"Url": "www.sap.com"
							},
							{
								"Name": "ITelO Vault",
								"Icon": "../../images/Woman_avatar_02.png"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{Icon}"
						},
						"actions": [
							{
								"type": "Navigation",
								"enabled": "{= ${Url}}",
								"parameters": {
									"url": "{Url}"
								}
							}
						]
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": [
								{
									"title": "Comfort Easy",
									"icon": {
										"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_01.png"
									},
									"actions": [
										{
											"type": "Navigation",
											"enabled": true,
											"parameters": {
												"url": "www.sap.com"
											}
										}
									]
								},
								{
									"title": "ITelO Vault",
									"icon": {
										"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_02.png"
									},
									"actions": [
										{
											"type": "Navigation",
											"enabled": false,
											"parameters": { }
										}
									]
								}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "list template is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("List item template - 'no data' ", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": []
					},
					"item": {
						"title": "{Name}"
					}
				}
			}
		},
			oCard = new SkeletonCard({
				manifest: oManifest,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
			}),
			oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"message": {
						"type": "noData",
						"illustrationSize": "Auto",
						"illustrationType": "sapIllus-NoEntries",
						"title": oResourceBundle.getText("CARD_NO_ITEMS_ERROR_LISTS")
					}
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "list template is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("List item template with groups", function (assert) {
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
								"Name": "Comfort Easy",
								"Description": "32 GB Digital Assistant with high-resolution color screen",
								"Sales": "150",
								"State": "Warning"
							},
							{
								"Name": "ITelO Vault",
								"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
								"Sales": "540",
								"State": "Success"
							},
							{
								"Name": "Notebook Professional 15",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Sales": "350",
								"State": "Success"
							},
							{
								"Name": "Ergo Screen E-I",
								"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
								"Sales": "100",
								"State": "Error"
							},
							{
								"Name": "Laser Professional Eco",
								"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
								"Sales": "200",
								"State": "Warning"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"description": "{Description}",
						"info": {
							"value": "{Sales} K",
							"state": "{State}"
						}
					},
					"group": {
						"title": "{= ${Sales} > 150 ? 'Over 150' : 'Under 150'}",
						"order": {
							"path": "Sales",
							"dir": "ASC"
						}
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"title": "Under 150",
							"items": [
								{
									"title": "Ergo Screen E-I",
									"description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
									"info": {
										"value": "100 K",
										"state": "Error"
									}
								},
								{
									"title": "Comfort Easy",
									"description": "32 GB Digital Assistant with high-resolution color screen",
									"info": {
										"value": "150 K",
										"state": "Warning"
									}
								}
							]
						},
						{
							"title": "Over 150",
							"items": [
								{
									"title": "Laser Professional Eco",
									"description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
									"info": {
										"value": "200 K",
										"state": "Warning"
									}
								},
								{
									"title": "Notebook Professional 15",
									"description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
									"info": {
										"value": "350 K",
										"state": "Success"
									}
								},
								{
									"title": "ITelO Vault",
									"description": "Digital Organizer with State-of-the-Art Storage Encryption",
									"info": {
										"value": "540 K",
										"state": "Success"
									}
								}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "list template is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("List item template with Bullet graph and actions", function (assert) {
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
								"Name": "Comfort Easy",
								"Description": "32 GB Digital Assistant",
								"Highlight": "Success",
								"Expected": 300000,
								"Actual": 330000,
								"Target": 280000,
								"ChartColor": "Good"
							},
							{
								"Name": "ITelO Vault",
								"Description": "Digital Organizer",
								"Highlight": "Success",
								"Expected": 230000,
								"Actual": 225000,
								"Target": 210000,
								"ChartColor": "Good"
							},
							{
								"Name": "Notebook Professional 15",
								"Description": "Multitouch LCD",
								"Highlight": "Success",
								"Expected": 170000,
								"Actual": 150000,
								"Target": 149000,
								"ChartColor": "Good"
							},
							{
								"Name": "Ergo Screen E-I",
								"Description": "Optimum Hi-Resolution max.",
								"Highlight": "Warning",
								"Expected": 120000,
								"Actual": 100000,
								"Target": 100000,
								"ChartColor": "Neutral"
							},
							{
								"Name": "Laser Professional Eco",
								"Description": "Powerful 500 MHz processor",
								"Highlight": "Error",
								"Expected": 45000,
								"Actual": 60000,
								"Target": 45000,
								"ChartColor": "Error"
							}
						]
					},
					"maxItems": 5,
					"item": {
						"title": "{Name}",
						"description": "{Description}",
						"info": {
							"value": "{= format.currency(${Actual} - ${Target}, 'EUR', {currencyCode:false})} {= ${Actual} - ${Target} >= 0 ? 'Profit' : 'Loss' }",
							"state": "{Highlight}"
						},
						"chart": {
							"type": "Bullet",
							"minValue": 0,
							"maxValue": "{Expected}",
							"target": "{Target}",
							"value": "{Actual}",
							"scale": "€",
							"displayValue": "{= format.currency(${Actual}, 'EUR', {currencyCode:false})}",
							"color": "{ChartColor}"
						},
						"actions": [
							{
								"type": "Navigation",
								"enabled": "{= !!${Actual}}",
								"parameters": {
									"url": "{Actual}"
								}
							}
						]
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": [
								{
									"title": "Comfort Easy",
									"description": "32 GB Digital Assistant",
									"info": {
										"value": "€50,000.00 Profit",
										"state": "Success"
									},
									"chart": {
										"type": "Bullet",
										"minValue": 0,
										"maxValue": 300000,
										"target": 280000,
										"value": 330000,
										"scale": "€",
										"displayValue": "€330,000.00",
										"color": "Good"
									},
									"actions": [
										{
											"type": "Navigation",
											"enabled": true,
											"parameters": {
												"url": 330000
											}
										}
									]
								},
								{
									"title": "ITelO Vault",
									"description": "Digital Organizer",
									"info": {
										"value": "€15,000.00 Profit",
										"state": "Success"
									},
									"chart": {
										"type": "Bullet",
										"minValue": 0,
										"maxValue": 230000,
										"target": 210000,
										"value": 225000,
										"scale": "€",
										"displayValue": "€225,000.00",
										"color": "Good"
									},
									"actions": [
										{
											"type": "Navigation",
											"enabled": true,
											"parameters": {
												"url": 225000
											}
										}
									]
								},
								{
									"title": "Notebook Professional 15",
									"description": "Multitouch LCD",
									"info": {
										"value": "€1,000.00 Profit",
										"state": "Success"
									},
									"chart": {
										"type": "Bullet",
										"minValue": 0,
										"maxValue": 170000,
										"target": 149000,
										"value": 150000,
										"scale": "€",
										"displayValue": "€150,000.00",
										"color": "Good"
									},
									"actions": [
										{
											"type": "Navigation",
											"enabled": true,
											"parameters": {
												"url": 150000
											}
										}
									]
								},
								{
									"title": "Ergo Screen E-I",
									"description": "Optimum Hi-Resolution max.",
									"info": {
										"value": "€0.00 Profit",
										"state": "Warning"
									},
									"chart": {
										"type": "Bullet",
										"minValue": 0,
										"maxValue": 120000,
										"target": 100000,
										"value": 100000,
										"scale": "€",
										"displayValue": "€100,000.00",
										"color": "Neutral"
									},
									"actions": [
										{
											"type": "Navigation",
											"enabled": true,
											"parameters": {
												"url": 100000
											}
										}
									]
								},
								{
									"title": "Laser Professional Eco",
									"description": "Powerful 500 MHz processor",
									"info": {
										"value": "€15,000.00 Profit",
										"state": "Error"
									},
									"chart": {
										"type": "Bullet",
										"minValue": 0,
										"maxValue": 45000,
										"target": 45000,
										"value": 60000,
										"scale": "€",
										"displayValue": "€60,000.00",
										"color": "Error"
									},
									"actions": [
										{
											"type": "Navigation",
											"enabled": true,
											"parameters": {
												"url": 60000
											}
										}
									]
								}
							]
						}
					],
					"maxItems": 5
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "list template is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("List item template with Stacked Bar chart", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "card.explorer.stackedBar.list.card",
				"type": "card",
				"title": "Sample of a List with StackedBar Chart",
				"subTitle": "Sample of a List with StackedBar chart",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"shortTitle": "A short title for this Card",
				"info": "Additional information about this Card",
				"description": "A long description for this Card",
				"tags": {
					"keywords": [
						"List",
						"Chart",
						"Card",
						"Sample"
					]
				}
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Notebooks Distribution",
					"subtitle": "by years",
					"status": {
						"text": "3 of 11"
					}
				},
				"content": {
					"data": {
						"json": {
							"legend": {
								"items": {
									"Notebook13": "Notebook 13",
									"Notebook17": "Notebook 17"
								}
							},
							"maxOverYears": 700,
							"Notebooks": [
								{
									"Year": 2017,
									"Category": "Computer system accessories",
									"Notebook13": 200,
									"Notebook17": 500
								},
								{
									"Year": 2018,
									"Category": "Computer system accessories",
									"Notebook13": 300,
									"Notebook17": 320
								},
								{
									"Year": 2019,
									"Category": "Computer system accessories",
									"Notebook13": 140,
									"Notebook17": 255
								}
							]
						},
						"path": "/Notebooks"
					},
					"maxItems": 3,
					"item": {
						"title": "{Year}",
						"description": "{Category}",
						"chart": {
							"type": "StackedBar",
							"displayValue": "{= ${Notebook13} + ${Notebook17}}K",
							"maxValue": "{/maxOverYears}",
							"bars": [
								{
									"value": "{Notebook13}",
									"displayValue": "{/legend/items/Notebook13}: {Notebook13}K",
									"legendTitle": "{/legend/items/Notebook13}"
								},
								{
									"value": "{Notebook17}",
									"displayValue": "{/legend/items/Notebook17}: {Notebook17}K",
									"legendTitle": "{/legend/items/Notebook17}"
								}
							]
						}
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": [
								{
									"title": 2017,
									"description": "Computer system accessories",
									"chart": {
										"type": "StackedBar",
										"displayValue": "700K",
										"maxValue": 700,
										"bars": [
											{
												"value": 200,
												"displayValue": "Notebook 13: 200K",
												"legendTitle": "Notebook 13"
											},
											{
												"value": 500,
												"displayValue": "Notebook 17: 500K",
												"legendTitle": "Notebook 17"
											}
										]
									}
								},
								{
									"title": 2018,
									"description": "Computer system accessories",
									"chart": {
										"type": "StackedBar",
										"displayValue": "620K",
										"maxValue": 700,
										"bars": [
											{
												"value": 300,
												"displayValue": "Notebook 13: 300K",
												"legendTitle": "Notebook 13"
											},
											{
												"value": 320,
												"displayValue": "Notebook 17: 320K",
												"legendTitle": "Notebook 17"
											}
										]
									}
								},
								{
									"title": 2019,
									"description": "Computer system accessories",
									"chart": {
										"type": "StackedBar",
										"displayValue": "395K",
										"maxValue": 700,
										"bars": [
											{
												"value": 140,
												"displayValue": "Notebook 13: 140K",
												"legendTitle": "Notebook 13"
											},
											{
												"value": 255,
												"displayValue": "Notebook 17: 255K",
												"legendTitle": "Notebook 17"
											}
										]
									}
								}
							]
						}
					],
					"maxItems": 3
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "list template is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("List with maxItems - all items are returned when card is SkeletonCard", function (assert) {
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
							{ "Name": "Item 1" },
							{ "Name": "Item 2" },
							{ "Name": "Item 3" },
							{ "Name": "Item 4" },
							{ "Name": "Item 5" }
						]
					},
					"maxItems": 2,
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var aItems = oRes["sap.card"].content.groups[0].items;

				// Assert - all 5 items must be returned despite maxItems: 2
				assert.strictEqual(aItems.length, 5, "All items are returned regardless of maxItems when resolved via SkeletonCard");
				assert.strictEqual(aItems[0].title, "Item 1", "First item is correct");
				assert.strictEqual(aItems[4].title, "Item 5", "Last item is correct");

				oCard.destroy();
			});
	});

	QUnit.test("List with maxItems - maxItems is present in the resolved manifest", function (assert) {
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
							{ "Name": "Item 1" },
							{ "Name": "Item 2" },
							{ "Name": "Item 3" }
						]
					},
					"maxItems": 2,
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oContent = oRes["sap.card"].content;

				// Assert - maxItems must be present so the Android SDK can enforce it on its side
				assert.strictEqual(oContent.maxItems, 2, "maxItems is included in the resolved content");

				oCard.destroy();
			});
	});

	QUnit.test("List with pagination - client side", function (assert) {
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
							},
							{
								"Name": "Product 3"
							}
						]
					},
					"item": {
						"title": "{Name}"
					}
				},
				"footer": {
					"paginator": {
						"pageSize": 2
					}
				}
			}
		},
			oExpectedItemsPage1 = [
				{
					"title": "Comfort Easy"
				},
				{
					"title": "ITelO Vault"
				},
				{
					"title": "Product 3"
				}
			],
			oExpectedPaginatorPage1 = {
				"pageCount": 1,
				"pageIndex": 0
			},
			oCard = new SkeletonCard({
				manifest: oManifest,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
			});

		// Act
		return oCard.resolveManifest()
			.then(function (oRes) {
				// Assert
				assert.deepEqual(oRes["sap.card"].content.groups[0].items, oExpectedItemsPage1, "content for first page is resolved correctly");
				assert.deepEqual(oRes["sap.card"].footer.paginator, oExpectedPaginatorPage1, "paginator for first page is resolved correctly");
			});
	});


	QUnit.test("List with pagination with large amount of data - client side", function (assert) {
		const aData = new Array(100).fill({ Name: "Name" });
		const oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": aData
					},
					"item": {
						"title": "{Name}"
					}
				},
				"footer": {
					"paginator": {
						"pageSize": 2
					}
				}
			}
		};
		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});
		const oExpectedItemsPage1 = aData.map((oItem) => { return { title: "Name" }; });
		const oExpectedPaginatorPage1 = {
			"pageCount": 1,
			"pageIndex": 0
		};

		// Act
		return oCard.resolveManifest()
			.then(function (oRes) {
				// Assert
				assert.deepEqual(oRes["sap.card"].content.groups[0].items, oExpectedItemsPage1, "content for first page is resolved correctly");
				assert.deepEqual(oRes["sap.card"].footer.paginator, oExpectedPaginatorPage1, "paginator for first page is resolved correctly");

			});
	});

	QUnit.test("Table item template", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Table",
				"content": {
					"data": {
						"json": [
							{
								"FirstName": "Donna",
								"LastName": "Moore",
								"Icon": "../../images/Woman_avatar_01.png"
							},
							{
								"FirstName": "John",
								"LastName": "Miller",
								"Icon": "../../images/Woman_avatar_02.png"
							}
						]
					},
					"row": {
						"columns": [
							{
								"icon": {
									"src": "{Icon}"
								},
								"title": "First Name",
								"value": "{FirstName}",
								"width": "18%",
								"hAlign": "Center",
								"identifier": true
							},
							{
								"title": "Last Name",
								"value": "{LastName}",
								"visible": false
							}
						]
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"headers": [
						{
							"title": "First Name",
							"width": "18%",
							"hAlign": "Center",
							"identifier": true
						},
						{
							"title": "Last Name",
							"visible": false
						}
					],
					"groups": [
						{
							"rows": [
								{
									"columns": [
										{
											"icon": {
												"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_01.png"
											},
											"value": "Donna"
										},
										{
											"value": "Moore"
										}
									]
								},
								{
									"columns": [
										{

											"icon": {
												"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_02.png"
											},
											"value": "John"
										},
										{
											"value": "Miller"
										}
									]
								}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "table template is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("Table item template - 'no data' ", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Table",
				"content": {
					"data": {
						"json": []
					},
					"row": {
						"columns": [
							{
								"value": "{{value}}",
								"title": "Title"
							}
						]
					}
				}
			}
		},
			oCard = new SkeletonCard({
				manifest: oManifest,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
			}),
			oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"message": {
						"type": "noData",
						"illustrationSize": "Auto",
						"illustrationType": "sapIllus-NoEntries",
						"title": oResourceBundle.getText("CARD_NO_ITEMS_ERROR_LISTS")
					}
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "table template is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("Table item template with groups", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Table",
				"content": {
					"data": {
						"json": [
							{
								"FirstName": "Donna",
								"LastName": "Moore",
								"deliveryProgress": 1
							},
							{
								"FirstName": "John",
								"LastName": "Miller",
								"deliveryProgress": 51
							}
						]
					},
					"row": {
						"columns": [
							{
								"title": "First Name",
								"value": "{FirstName}"
							},
							{
								"title": "Last Name",
								"value": "{LastName}"
							}
						]
					},
					"group": {
						"title": "{= ${deliveryProgress} > 10 ? 'In Delivery' : 'Not in Delivery'}",
						"order": {
							"path": "statusState",
							"dir": "ASC"
						}
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"headers": [
						{
							"title": "First Name"
						},
						{
							"title": "Last Name"
						}
					],
					"groups": [
						{
							"title": "Not in Delivery",
							"rows": [
								{
									"columns": [
										{
											"value": "Donna"
										},
										{
											"value": "Moore"
										}
									]
								}
							]
						},
						{
							"title": "In Delivery",
							"rows": [
								{
									"columns": [
										{
											"value": "John"
										},
										{
											"value": "Miller"
										}
									]
								}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "table template is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("Table with popin properties", function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Table",
				"content": {
					"autoPopinMode": true,
					"hiddenInPopin": ["Low", "None"],
					"popinLayout": "GridLarge",
					"data": {
						"json": [
							{
								"FirstName": "Donna",
								"LastName": "Moore"
							}
						]
					},
					"row": {
						"columns": [
							{
								"title": "First Name",
								"value": "{FirstName}",
								"importance": "High"
							},
							{
								"title": "Last Name",
								"value": "{LastName}",
								"importance": "Low"
							}
						]
					}
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				const oExpectedResult = {
					"autoPopinMode": true,
					"hiddenInPopin": ["Low", "None"],
					"popinLayout": "GridLarge",
					"headers": [
						{
							"title": "First Name",
							"importance": "High"
						},
						{
							"title": "Last Name",
							"importance": "Low"
						}
					],
					"groups": [
						{
							"rows": [
								{
									"columns": [
										{
											"value": "Donna"
										},
										{
											"value": "Moore"
										}
									]
								}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "table with popin properties is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("Table with popin properties - bindings", function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Table",
				"configuration": {
					"parameters": {
						"enableAutoPopin": {
							"value": true
						},
						"popinLayoutType": {
							"value": "Grid"
						},
						"hidePriorities": {
							"value": ["Low", "None"]
						}
					}
				},
				"content": {
					"autoPopinMode": "{parameters>/enableAutoPopin/value}",
					"hiddenInPopin": "{parameters>/hidePriorities/value}",
					"popinLayout": "{parameters>/popinLayoutType/value}",
					"data": {
						"json": [
							{
								"FirstName": "Donna",
								"LastName": "Moore",
								"Department": "IT"
							},
							{
								"FirstName": "John",
								"LastName": "Miller",
								"Department": "Sales"
							}
						]
					},
					"row": {
						"columns": [
							{
								"title": "First Name",
								"value": "{FirstName}",
								"importance": "High"
							},
							{
								"title": "Last Name",
								"value": "{LastName}",
								"importance": "Low"
							},
							{
								"title": "Department",
								"value": "{Department}",
								"importance": "None"
							}
						]
					}
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				const oExpectedResult = {
					"autoPopinMode": true,
					"hiddenInPopin": ["Low", "None"],
					"popinLayout": "Grid",
					"headers": [
						{
							"title": "First Name",
							"importance": "High"
						},
						{
							"title": "Last Name",
							"importance": "Low"
						},
						{
							"title": "Department",
							"importance": "None"
						}
					],
					"groups": [
						{
							"rows": [
								{
									"columns": [
										{
											"value": "Donna"
										},
										{
											"value": "Moore"
										},
										{
											"value": "IT"
										}
									]
								},
								{
									"columns": [
										{
											"value": "John"
										},
										{
											"value": "Miller"
										},
										{
											"value": "Sales"
										}
									]
								}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "table with bound popin properties is resolved correctly");

				oCard.destroy();
			});
	});

	QUnit.test("Timeline item template", function (assert) {
		return Library.load("sap.suite.ui.commons").then(function () {
			var oManifest = {
				"sap.app": {
					"id": "manifestResolver.test.card",
					"type": "card"
				},
				"sap.card": {
					"type": "Timeline",
					"content": {
						"data": {
							"json": [
								{
									"Title": "Weekly sync: Marketplace / Design Stream",
									"Description": "MRR WDF18 C3.2(GLASSBOX)",
									"Icon": "sap-icon://appointment-2",
									"Name": "Laurent Dubois",
									"Photo": "./images/Laurent_Dubois.png",
									"Time": "2021-10-25T10:00:00.000Z",
									"Url": "/activity1"
								},
								{
									"Title": "Video Conference for FLP@SF, S4,Hybris",
									"Icon": "sap-icon://my-view",
									"Name": "Sabine Mayer",
									"Photo": "./images/Sabine_Mayer.png",
									"Time": "2021-10-25T14:00:00.000Z",
									"Url": "/activity2"
								},
								{
									"Title": "Call 'Project Nimbus'",
									"Icon": "sap-icon://outgoing-call",
									"Name": "Alain Chevalier",
									"Photo": "./images/Alain_Chevalier.png",
									"Time": "2021-10-25T16:00:00.000Z",
									"Url": "/activity3"
								}
							]
						},
						"item": {
							"dateTime": {
								"value": "{Time}"
							},
							"description": {
								"value": "{Description}"
							},
							"title": {
								"value": "{Title}"
							},
							"icon": {
								"src": "{Icon}"
							},
							"owner": {
								"value": "{Name}"
							},
							"ownerImage": {
								"value": "{Photo}"
							},
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{Url}"
									}
								}
							]
						}
					}
				}
			};

			var oCard = new SkeletonCard({
				manifest: oManifest,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
			});

			// Act
			return ManifestResolver.resolveCard(oCard)
				.then(function (oRes) {
					var oExpectedResult = {
						"items": [
							{
								"actions": [
									{
										"parameters": {
											"url": "/activity3"
										},
										"type": "Navigation"
									}
								],
								"dateTime": {
									"value": "2021-10-25T16:00:00.000Z"
								},
								"description": {},
								"icon": {
									"src": "sap-icon://outgoing-call"
								},
								"owner": {
									"value": "Alain Chevalier"
								},
								"ownerImage": {
									"value": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/./images/Alain_Chevalier.png"
								},
								"title": {
									"value": "Call 'Project Nimbus'"
								}
							},
							{
								"actions": [
									{
										"parameters": {
											"url": "/activity2"
										},
										"type": "Navigation"
									}
								],
								"dateTime": {
									"value": "2021-10-25T14:00:00.000Z"
								},
								"description": {},
								"icon": {
									"src": "sap-icon://my-view"
								},
								"owner": {
									"value": "Sabine Mayer"
								},
								"ownerImage": {
									"value": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/./images/Sabine_Mayer.png"
								},
								"title": {
									"value": "Video Conference for FLP@SF, S4,Hybris"
								}
							},
							{
								"actions": [
									{
										"parameters": {
											"url": "/activity1"
										},
										"type": "Navigation"
									}
								],
								"dateTime": {
									"value": "2021-10-25T10:00:00.000Z"
								},
								"description": {
									"value": "MRR WDF18 C3.2(GLASSBOX)"
								},
								"icon": {
									"src": "sap-icon://appointment-2"
								},
								"owner": {
									"value": "Laurent Dubois"
								},
								"ownerImage": {
									"value": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/./images/Laurent_Dubois.png"
								},
								"title": {
									"value": "Weekly sync: Marketplace / Design Stream"
								}
							}
						]
					};

					// Assert
					assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "timeline template is resolved correctly");

					oCard.destroy();
			});
		}).catch(function () {
			assert.ok(true, "Timeline content type is not available with this distribution.");
		});
	});

	QUnit.module("Filters");

	QUnit.test("Filters - static items", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Table",
				"configuration": {
					"filters": {
						"withStaticItems": {
							"value": "two",
							"type": "Select",
							"items": [
								{ "key": "one", "title": "Option one" },
								{ "key": "two", "title": "Option two" },
								{ "key": "three", "title": "Option three" }
							]
						}
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(
					oRes["sap.card"].configuration.filters.withStaticItems.items[0].title,
					oManifest["sap.card"].configuration.filters.withStaticItems.items[0].title,
					"Static filter items should be resolved"
				);

				assert.strictEqual(
					oRes["sap.card"].configuration.filters.withStaticItems.value,
					oManifest["sap.card"].configuration.filters.withStaticItems.items[1].key,
					"Filter's selected key is available"
				);

				oCard.destroy();
			});
	});

	QUnit.test("Filter item template - with JSON in data section", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"filters": {
						"withJSONInSection": {
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
										"ShipperID": "1",
										"CompanyName": "SAP"
									}
								]
							}
						}
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(
					oRes["sap.card"].configuration.filters.withJSONInSection.items[0].title,
					oManifest["sap.card"].configuration.filters.withJSONInSection.data.json[0].CompanyName,
					"Item should be created from the template"
				);

				assert.strictEqual(
					oRes["sap.card"].configuration.filters.withJSONInSection.value,
					oManifest["sap.card"].configuration.filters.withJSONInSection.data.json[0].ShipperID,
					"Filter's selected key is available"
				);

				oCard.destroy();
			});
	});

	QUnit.test("ComboBox filter", function (assert) {
		const done = assert.async();

		const oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card.comboBox",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"filters": {
						"country": {
							"type": "ComboBox",
							"label": "Country",
							"selectedKey": "FR",
							"placeholder": "Enter a country",
							"data": {
								"json": [
									{
										"text": "Austria",
										"key": "AT"
									},
									{
										"text": "Germany",
										"key": "DE"
									},
									{
										"text": "France",
										"key": "FR"
									}
								]
							},
							"item": {
								"path": "/",
								"template": {
									"key": "{key}",
									"title": "{text}",
									"additionalText": "{key}"
								}
							}
						}
					}
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		oCard.attachEventOnce("stateChanged", async () => {
			// Assert
			const oRes = await ManifestResolver.resolveCard(oCard);
			assert.strictEqual(oRes["sap.card"].configuration.filters.country.items.length, 3, "Items are resolved.");
			assert.strictEqual(oRes["sap.card"].configuration.filters.country.items[0].title, "Austria", "First item title is resolved.");
			assert.strictEqual(oRes["sap.card"].configuration.filters.country.items[0].key, "AT", "First item key is resolved.");
			assert.strictEqual(oRes["sap.card"].configuration.filters.country.items[0].additionalText, "AT", "First item additionalText is resolved.");

			assert.strictEqual(oRes["sap.card"].configuration.filters.country.value, "France", "Initial value is resolved.");
			assert.strictEqual(oRes["sap.card"].configuration.filters.country.selectedKey, "FR", "Initial selectedKey is resolved.");

			oCard.setFilterValue("country", { selectedKey: "DE" });

			const oRes2 = await ManifestResolver.resolveCard(oCard);
			assert.strictEqual(oRes2["sap.card"].configuration.filters.country.value, "Germany", "Changed value is resolved correctly.");
			assert.strictEqual(oRes2["sap.card"].configuration.filters.country.selectedKey, "DE", "Changed selectedKey is resolved correctly.");

			oCard.setFilterValue("country", { value: "Italy" });

			const oRes3 = await ManifestResolver.resolveCard(oCard);
			assert.strictEqual(oRes3["sap.card"].configuration.filters.country.value, "Italy", "Changed value second time is resolved correctly.");
			assert.strictEqual(oRes3["sap.card"].configuration.filters.country.selectedKey, undefined, "Changed selectedKey second time is resolved correctly.");

			oCard.destroy();
			done();
		});

		oCard.startManifestProcessing();
	});

	QUnit.test("Bound filter properties", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card.filterPropertiesBound",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"parameters": {
						"someParameter": {
							"value": "SomeValue"
						}
					},
					"filters": {
						"filter1": {
							"type": "Select",
							"label": "{parameters>/someParameter/value}",
							"visible": "{= !!${parameters>/someParameter/value}}",
							"value": "{parameters>/someParameter/value}",
							"items": []
						},
						"filter2": {
							"type": "Search",
							"label": "{parameters>/someParameter/value}",
							"visible": "{= !!${parameters>/someParameter/value}}",
							"value": "{parameters>/someParameter/value}"
						},
						"filter3": {
							"type": "ComboBox",
							"label": "{parameters>/someParameter/value}",
							"visible": "{= !!${parameters>/someParameter/value}}",
							"value": "{parameters>/someParameter/value}",
							"items": []
						},
						"filter4": {
							"type": "DateRange",
							"label": "{parameters>/someParameter/value}",
							"visible": "{= !!${parameters>/someParameter/value}}",
							"value": {
								"option": "dateRange",
								"values": [
									"1996-08-06T00:00:00.000Z",
									"1996-08-16T00:00:00.000Z"
								]
							}
						}
					}
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		assert.deepEqual(
			oRes["sap.card"].configuration.filters.filter1,
			{
				"type": "Select",
				"label": "SomeValue",
				"visible": true,
				"value": "SomeValue",
				"index": 0,
				"items": []
			},
			"Values are resolved."
		);

		assert.deepEqual(
			oRes["sap.card"].configuration.filters.filter2,
			{
				"type": "Search",
				"label": "SomeValue",
				"value": "SomeValue",
				"index": 1,
				"visible": true
			},
			"Values are resolved."
		);

		assert.deepEqual(
			oRes["sap.card"].configuration.filters.filter3,
			{
				"type": "ComboBox",
				"label": "SomeValue",
				"value": "SomeValue",
				"visible": true,
				"index": 2,
				"items": []
			},
			"Values are resolved."
		);

		assert.deepEqual(
			oRes["sap.card"].configuration.filters.filter4,
			{
				"type": "DateRange",
				"label": "SomeValue",
				"visible": true,
				"index": 3,
				"value": {
					"option": "dateRange",
					"values": [
						"1996-08-06T00:00:00.000Z",
						"1996-08-16T00:00:00.000Z"
					]
				}
			},
			"Values are resolved."
		);

		oCard.destroy();
	});


	QUnit.module("Resolving formatters");

	QUnit.test("Predefined formatters", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"total": "5"
					}
				},
				"header": {
					"title": "{= format.text('Header: showing {0} of {1} items', ['2', ${/total}]) }"
				},
				"content": {
					"groups": [
						{
							"title": "{= format.text('Content: showing {0} of {1} items', ['2', ${/total}]) }",
							"items": [
								{
									"label": "First name"
								}
							]
						}
					]
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Header: showing 2 of 5 items", "Should have correctly resolved predefined formatter");
				assert.strictEqual(oRes["sap.card"].content.groups[0].title, "Content: showing 2 of 5 items", "Should have correctly resolved predefined formatter");

				oCard.destroy();
			});
	});

	QUnit.test("Predefined formatters in list item template", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": [
						{
							"training": "Scrum"
						}
					]
				},
				"content": {
					"item": {
						"title": "{= format.text('Training: {0}', [${training}]) }"
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].title, "Training: Scrum", "Should have correctly resolved predefined formatter");

				oCard.destroy();
			});
	});

	QUnit.module("Invalid manifests");

	QUnit.test("Invalid binding", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": [
						{
							"training": "Scrum"
						}
					]
				},
				"content": {
					"item": {
						"title": "{invalidProperty}"
					}
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": [
								{}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "list template is resolved correctly");
				oCard.destroy();
			});
	});

	QUnit.test("Actions binding with stringified json", function (assert) {
		// Arrange
		var sExpectedValue1 = "{\"presentationVariant\":{\"SortOrder\":[{\"Property\":\"BillingDocDateYearMonth\",\"Descending\":false}]},\"sensitiveProps\":{}}",
			sExpectedValue2 = "{\"value\":\"Berlin\",\"presentationVariant\":{\"SortOrder\":[{\"Property\":\"BillingDocDateYearMonth\",\"Descending\":false}]},\"sensitiveProps\":{}}",
			oManifest = {
				"sap.app": {
					"id": "sap.ui.integration.test"
				},
				"sap.card": {
					"type": "List",
					"extension": "./extensions/Extension1",
					"data": {
						"extension": {
							"method": "getData"
						}
					},
					"configuration": {
						"parameters": {
							"state": {
								"value": "{\"presentationVariant\":{\"SortOrder\":[{\"Property\":\"BillingDocDateYearMonth\",\"Descending\":false}]},\"sensitiveProps\":{}}"
							}
						}
					},
					"content": {
						"item": {
							"title": "{= extension.formatters.toUpperCase(${city}) }",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"value1": "{parameters>/state/value}",
										"value2": "{= extension.formatters.stringifiedJsonSample(${city}) }"
									}
								}
							]
						}
					}
				}
			};

		var oCard = new SkeletonCard({
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
			manifest: oManifest
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oAction = oRes["sap.card"].content.groups[0].items[0].actions[0],
					oParams = oAction.parameters;

				// Assert
				assert.strictEqual(oParams.value1, sExpectedValue1, "Action parameter from parameters is resolved correctly.");
				assert.strictEqual(oParams.value2, sExpectedValue2, "Action parameter from extension formatter is resolved correctly.");
				oCard.destroy();
			});
	});

	QUnit.test("Resolve ButtonGroup and IconGroup type items", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "card.bundle.object",
				"type": "card",
				"i18n": "i18n/i18n.properties"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "./employee.json"
					}
				},
				"header": {
					"title": "Title"
				},
				"content": {
					"groups": [{
						"title": "Group Title",
						"items": [
							{
								"label": "Icons",
								"type": "IconGroup",
								"path": "team",
								"template": {
									"icon": {
										"src": "{imageUrl}",
										"initials": "{= format.initials(${firstName} + ' ' + ${lastName}) }"
									},
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "{imageUrl}"
										}
									}]
								}
							},
							{
								"label": "Buttons",
								"type": "ButtonGroup",
								"path": "attachments",
								"template": {
									"icon": "{icon}",
									"text": "{title}",
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "{url}"
										}
									}]
								}
							}
						]
					}
					]
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedButtonGroup = {
					"label": "Buttons",
					"type": "ButtonGroup",
					"items": [{
						"icon": "sap-icon://excel-attachment",
						"text": "Schedule",
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "./somefile.csv"
							}
						}]
					},
					{
						"icon": "sap-icon://attachment",
						"text": "Attachment 2",
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "./somefile.csv"
							}
						}]
					}
					]
				},
					oExpectedIconGroup = {
						"label": "Icons",
						"type": "IconGroup",
						"items": [
							{
								"icon": {
									"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_01.png",
									"initials": "EE"
								},
								"actions": [{
									"type": "Navigation",
									"parameters": {
										"url": "../../images/Woman_avatar_01.png"
									}
								}]
							},
							{
								"icon": {
									"initials": "JM"
								},
								"actions": [{
									"type": "Navigation",
									"parameters": {}
								}]
							}
						]
					};
				// Assert
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0], oExpectedIconGroup);
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[1], oExpectedButtonGroup);

				oCard.destroy();
			});
	});

	QUnit.test("Resolve ButtonGroup and IconGroup type items using named data section", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "card.bundle.object",
				"type": "card",
				"i18n": "i18n/i18n.properties"
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
					"title": "Title"
				},
				"content": {
					"groups": [{
						"title": "Group Title",
						"items": [
							{
								"label": "Icons",
								"type": "IconGroup",
								"path": "myDataSection>/team",
								"template": {
									"icon": {
										"src": "{myDataSection>imageUrl}",
										"initials": "{= format.initials(${myDataSection>firstName} + ' ' + ${myDataSection>lastName}) }"
									},
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "{myDataSection>imageUrl}"
										}
									}]
								}
							},
							{
								"label": "Buttons",
								"type": "ButtonGroup",
								"path": "myDataSection>/attachments",
								"template": {
									"icon": "{myDataSection>icon}",
									"text": "{myDataSection>title}",
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "{myDataSection>url}"
										}
									}]
								}
							}
						]
					}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				const oExpectedButtonGroup = {
					"label": "Buttons",
					"type": "ButtonGroup",
					"items": [{
						"icon": "sap-icon://excel-attachment",
						"text": "Schedule",
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "./somefile.csv"
							}
						}]
					},
					{
						"icon": "sap-icon://attachment",
						"text": "Attachment 2",
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "./somefile.csv"
							}
						}]
					}
					]
				};
				const oExpectedIconGroup = {
					"label": "Icons",
					"type": "IconGroup",
					"items": [
						{
							"icon": {
								"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_01.png",
								"initials": "EE"
							},
							"actions": [{
								"type": "Navigation",
								"parameters": {
									"url": "../../images/Woman_avatar_01.png"
								}
							}]
						},
						{
							"icon": {
								"initials": "JM"
							},
							"actions": [{
								"type": "Navigation",
								"parameters": {}
							}]
						}
					]
				};
				// Assert
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0], oExpectedIconGroup);
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[1], oExpectedButtonGroup);

				oCard.destroy();
			});
	});

	QUnit.test("Resolve ButtonGroup and IconGroup type items using named data section with base path", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "card.bundle.object",
				"type": "card",
				"i18n": "i18n/i18n.properties"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "./employee.json"
					},
					"name": "myDataSection",
					"path": "myDataSection>/"
				},
				"header": {
					"title": "Title"
				},
				"content": {
					"groups": [{
						"title": "Group Title",
						"items": [
							{
								"label": "Icons",
								"type": "IconGroup",
								"path": "myDataSection>team",
								"template": {
									"icon": {
										"src": "{myDataSection>imageUrl}",
										"initials": "{= format.initials(${myDataSection>firstName} + ' ' + ${myDataSection>lastName}) }"
									},
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "{myDataSection>imageUrl}"
										}
									}]
								}
							},
							{
								"label": "Buttons",
								"type": "ButtonGroup",
								"path": "myDataSection>/attachments",
								"template": {
									"icon": "{myDataSection>icon}",
									"text": "{myDataSection>title}",
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "{myDataSection>url}"
										}
									}]
								}
							}
						]
					}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				const oExpectedButtonGroup = {
					"label": "Buttons",
					"type": "ButtonGroup",
					"items": [{
						"icon": "sap-icon://excel-attachment",
						"text": "Schedule",
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "./somefile.csv"
							}
						}]
					},
					{
						"icon": "sap-icon://attachment",
						"text": "Attachment 2",
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "./somefile.csv"
							}
						}]
					}
					]
				};
				const oExpectedIconGroup = {
					"label": "Icons",
					"type": "IconGroup",
					"items": [
						{
							"icon": {
								"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_01.png",
								"initials": "EE"
							},
							"actions": [{
								"type": "Navigation",
								"parameters": {
									"url": "../../images/Woman_avatar_01.png"
								}
							}]
						},
						{
							"icon": {
								"initials": "JM"
							},
							"actions": [{
								"type": "Navigation",
								"parameters": {}
							}]
						}
					]
				};
				// Assert
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0], oExpectedIconGroup);
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[1], oExpectedButtonGroup);

				oCard.destroy();
			});
	});

	QUnit.test("Resolve ButtonGroup and IconGroup type items using 2 data sections", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "card.bundle.object",
				"type": "card",
				"i18n": "i18n/i18n.properties"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"buttonText": "Button Text"
					}
				},
				"header": {
					"title": "Title"
				},
				"content": {
					"data": {
						"request": {
							"url": "./employee.json"
						},
						"name": "myDataSection"
					},
					"groups": [{
						"title": "Group Title",
						"items": [
							{
								"label": "Icons",
								"type": "IconGroup",
								"path": "myDataSection>/team",
								"template": {
									"icon": {
										"src": "{myDataSection>/manager/photo}",
										"initials": "{= format.initials(${myDataSection>firstName} + ' ' + ${myDataSection>lastName}) }"
									}
								}
							},
							{
								"label": "Buttons",
								"type": "ButtonGroup",
								"path": "myDataSection>/attachments",
								"template": {
									"icon": "{myDataSection>icon}",
									"text": "{/buttonText}"
								}
							}
						]
					}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				const oExpectedButtonGroup = {
					"label": "Buttons",
					"type": "ButtonGroup",
					"items": [{
						"icon": "sap-icon://excel-attachment",
						"text": "Button Text"
					},
					{
						"icon": "sap-icon://attachment",
						"text": "Button Text"
					}]
				};
				const oExpectedIconGroup = {
					"label": "Icons",
					"type": "IconGroup",
					"items": [{
						"icon": {
							"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/./images/Woman_avatar_01.png",
							"initials": "EE"
						}
					},
					{
						"icon": {
							"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/./images/Woman_avatar_01.png",
							"initials": "JM"
						}
					}]
				};
				// Assert
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0], oExpectedIconGroup);
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[1], oExpectedButtonGroup);

				oCard.destroy();
			});
	});

	QUnit.module("Resolve host context parameters");

	QUnit.test("Host context parameters", function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"country": {
							"type": "Search",
							"value": "{context>/country}"
						}
					}
				},
				"data": {
					"request": {
						"url": "./products.json"
					}
				},
				"type": "List",
				"header": {
					"title": "{context>/country}"
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{context>/country}"
					}
				}
			}
		};

		var oHost = new Host();
		oHost.getContextValue = function (sKey) {
			return new Promise(function (resolve, reject) {
				setTimeout(function () {
					if (sKey === "country") {
						resolve("France");
						return;
					}
					reject("Host context parameter " + sKey + " doesn't exist");
				}, 200);
			});
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/",
			host: oHost
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].configuration.filters.country.value, "France", "Host context binding is resolved in the filter");
				assert.strictEqual(oRes["sap.card"].header.title, "France", "Host context binding is resolved in the title");
				assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].title, "France", "Host context binding is resolved in the list items");

				oCard.destroy();
			});
	});

	QUnit.module("Resolving form elements");

	QUnit.test("ComboBox with 'selectedKey' and no 'value'", function (assert) {
		// Arrange
		var oManifest = createManifestWithFormElement({
			"id": "activity",
			"label": "Activity",
			"type": "ComboBox",
			"selectedKey": "{/activityTypeSelectedKey}",
			"required": true,
			"item": {
				"path": "/activityTypes",
				"template": {
					"key": "{id}",
					"title": "{title}"
				}
			},
			"validations": [
				{
					"required": true,
					"message": "Value is required"
				},
				{
					"restrictToPredefinedOptions": true
				}
			]
		});

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": [
								{
									"id": "activity",
									"label": "Activity",
									"type": "ComboBox",
									"value": "Processing",
									"selectedKey": "activity1",
									"required": true,
									"items": [
										{
											"key": "activity1",
											"title": "Processing"
										},
										{
											"key": "activity2",
											"title": "Monitoring"
										}
									],
									"validations": [
										{
											"required": true,
											"message": "Value is required"
										},
										{
											"restrictToPredefinedOptions": true
										}
									]
								}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "Form elements should be resolved correctly.");

				oCard.destroy();
			});
	});

	QUnit.test("ComboBox with 'value' only", function (assert) {
		// Arrange
		var oManifest = createManifestWithFormElement({
			"id": "activity",
			"label": "Activity",
			"type": "ComboBox",
			"value": "option 1",
			"required": true
		});

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": [
								{
									"id": "activity",
									"label": "Activity",
									"type": "ComboBox",
									"value": "option 1",
									"required": true,
									"selectedKey": ""
								}
							]
						}
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "Form elements should be resolved correctly.");

				oCard.destroy();
			});
	});

	function assertObjectGroupItemResolvesTo(assert, oCard, oExpectedResult) {
		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "Resolved form element contains valueState.");
			});
	}

	QUnit.module("Using Card#setFormValues API");

	QUnit.test("Input: 'valueState' is resolved", function (assert) {
		var done = assert.async(),
			oManifest = createManifestWithFormElement({
				"id": "i1",
				"label": "Label",
				"type": "Input",
				"value": "a",
				"validations": [
					{
						"required": true
					},
					{
						"minLength": 30,
						"message": "warning message",
						"type": "Warning"
					}
				]
			});

		var oCard = new SkeletonCard({
			manifest: oManifest
		});

		// Assert
		var fnAssert = function () {
			return assertObjectGroupItemResolvesTo(assert, oCard, {
				"groups": [
					{
						"items": [
							{
								"id": "i1",
								"label": "Label",
								"type": "Input",
								"value": "short text",
								"valueState": {
									"message": "warning message",
									"type": "Warning"
								},
								"validations": [
									{
										"required": true
									},
									{
										"minLength": 30,
										"message": "warning message",
										"type": "Warning"
									}
								]
							}
						]
					}
				]
			});
		};

		// Cleanup
		var fnCleanup = function () {
			oCard.destroy();
			done();
		};

		oCard.resolveManifest().then(function () {
			oCard.attachStateChanged(function () {
				fnAssert().then(fnCleanup);
			});

			// Act
			oCard.setFormValues([
				{
					"id": "i1",
					"value": "short text"
				}
			]);
		});
	});

	QUnit.test("TextArea: 'valueState' is resolved", function (assert) {
		var done = assert.async(),
			oManifest = createManifestWithFormElement({
				"id": "i1",
				"label": "Label",
				"rows": 2,
				"type": "TextArea",
				"validations": [
					{
						"required": true,
						"message": "error message",
						"type": "Error"
					}
				]
			});

		var oCard = new SkeletonCard({
			manifest: oManifest
		});

		// Assert
		var fnAssert = function () {
			return assertObjectGroupItemResolvesTo(assert, oCard, {
				"groups": [
					{
						"items": [
							{
								"id": "i1",
								"label": "Label",
								"rows": 2,
								"type": "TextArea",
								"value": "",
								"valueState": {
									"message": "error message",
									"type": "Error"
								},
								"validations": [
									{
										"required": true,
										"message": "error message",
										"type": "Error"

									}
								]
							}
						]
					}
				]
			});
		};

		// Cleanup
		var fnCleanup = function () {
			oCard.destroy();
			done();
		};

		oCard.resolveManifest().then(function () {
			oCard.attachStateChanged(function () {
				fnAssert().then(fnCleanup);
			});

			// Act
			oCard.setFormValues([
				{
					"id": "i1",
					"value": ""
				}
			]);
		});
	});

	QUnit.test("ComboBox: 'valueState' is resolved (invalid data set through 'value')", function (assert) {
		var done = assert.async(),
			oManifest = createManifestWithFormElement({
				"id": "i1",
				"label": "Label",
				"type": "ComboBox",
				"validations": [
					{
						"required": true,
						"message": "error message",
						"type": "Error"
					},
					{
						"restrictToPredefinedOptions": true
					}
				]
			});

		var oCard = new SkeletonCard({
			manifest: oManifest
		});

		// Assert
		var fnAssert = function () {
			return assertObjectGroupItemResolvesTo(assert, oCard, {
				"groups": [
					{
						"items": [
							{
								"id": "i1",
								"label": "Label",
								"type": "ComboBox",
								"value": "",
								"selectedKey": "",
								"valueState": {
									"message": "error message",
									"type": "Error"
								},
								"validations": [
									{
										"required": true,
										"message": "error message",
										"type": "Error"
									},
									{
										"restrictToPredefinedOptions": true
									}
								]
							}
						]
					}
				]
			});
		};

		// Cleanup
		var fnCleanup = function () {
			oCard.destroy();
			done();
		};

		oCard.resolveManifest().then(function () {
			oCard.attachStateChanged(function () {
				fnAssert().then(fnCleanup);
			});

			// Act
			oCard.setFormValues([
				{
					"id": "i1",
					"value": ""
				}
			]);
		});

	});

	QUnit.test("ComboBox: 'valueState' is resolved (invalid data set through 'selectedKey')", function (assert) {
		var done = assert.async(),
			oManifest = createManifestWithFormElement({
				"id": "i1",
				"label": "Label",
				"type": "ComboBox",
				"selectedKey": "{/activityTypeSelectedKey}",
				"item": {
					"path": "/activityTypes",
					"template": {
						"key": "{id}",
						"title": "{title}"
					}
				},
				"validations": [
					{
						"required": true,
						"message": "error message",
						"type": "Error"
					}
				]
			});

		var oCard = new SkeletonCard({
			manifest: oManifest
		});

		// Assert
		var fnAssert = function () {
			return assertObjectGroupItemResolvesTo(assert, oCard, {
				"groups": [
					{
						"items": [
							{
								"id": "i1",
								"label": "Label",
								"type": "ComboBox",
								"value": "",
								"selectedKey": "missing",
								"items": [
									{
										"key": "activity1",
										"title": "Processing"
									},
									{
										"key": "activity2",
										"title": "Monitoring"
									}
								],
								"valueState": {
									"message": "error message",
									"type": "Error"
								},
								"validations": [
									{
										"required": true,
										"message": "error message",
										"type": "Error"
									}
								]
							}
						]
					}
				]
			});
		};

		// Cleanup
		var fnCleanup = function () {
			oCard.destroy();
			done();
		};

		oCard.resolveManifest().then(function () {
			oCard.attachStateChanged(function () {
				fnAssert().then(fnCleanup);
			});

			// Act
			oCard.setFormValues([
				{
					"id": "i1",
					"key": "missing"
				}
			]);
		});
	});

	QUnit.test("ComboBox: 'valueState' is resolved (valid data)", function (assert) {
		var done = assert.async(),
			oManifest = createManifestWithFormElement({
				"id": "i1",
				"label": "Label",
				"type": "ComboBox",
				"selectedKey": "{/activityTypeSelectedKey}",
				"item": {
					"path": "/activityTypes",
					"template": {
						"key": "{id}",
						"title": "{title}"
					}
				},
				"validations": [
					{
						"required": true,
						"message": "error message",
						"type": "Error"
					}
				]
			});

		var oCard = new SkeletonCard({
			manifest: oManifest
		});

		// Assert
		var fnAssert = function () {
			return assertObjectGroupItemResolvesTo(assert, oCard, {
				"groups": [
					{
						"items": [
							{
								"id": "i1",
								"label": "Label",
								"type": "ComboBox",
								"value": "Monitoring",
								"selectedKey": "activity2",
								"items": [
									{
										"key": "activity1",
										"title": "Processing"
									},
									{
										"key": "activity2",
										"title": "Monitoring"
									}
								],
								"validations": [
									{
										"required": true,
										"message": "error message",
										"type": "Error"
									}
								]
							}
						]
					}
				]
			});
		};

		// Cleanup
		var fnCleanup = function () {
			oCard.destroy();
			done();
		};

		oCard.resolveManifest().then(function () {
			oCard.attachStateChanged(function () {
				fnAssert().then(fnCleanup);
			});

			// Act
			oCard.setFormValues([
				{
					"id": "i1",
					"key": "activity2"
				}
			]);
		});
	});

	QUnit.test("RadioButtonGroup: 'selectedIndex' and 'value' are resolved", function (assert) {
		var oManifest = createManifestWithFormElement({
			"id": "priority",
			"label": "Priority Level",
			"type": "RadioButtonGroup",
			"selectedIndex": 1,
			"required": true,
			"item": {
				"path": "/priorityLevels",
				"template": {
					"key": "{key}",
					"title": "{text}"
				}
			},
			"validations": [
				{
					"required": true,
					"message": "Priority selection is required"
				}
			]
		});

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0].selectedIndex, 1, "RadioButtonGroup should have the correct selectedIndex.");
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0].selectedKey, "medium", "RadioButtonGroup should have the correct selectedKey.");
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0].type, "RadioButtonGroup", "RadioButtonGroup form element type should be resolved correctly.");

				oCard.destroy();
			});
	});

	QUnit.test("RadioButtonGroup: Dynamic items from data binding", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "test.radioButtonGroup.dynamic",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"priorities": [
							{
								"key": "active",
								"text": "Active"
							},
							{
								"key": "inactive",
								"text": "Inactive"
							},
							{
								"key": "vacation",
								"text": "On Vacation"
							},
							{
								"key": "sick",
								"text": "Sick Leave",
								"enabled": false
							}
						]
					}
				},
				"content": {
					"groups": [
						{
							"items": [
								{
									"id": "dynamicPriority",
									"label": "Select Priority",
									"type": "RadioButtonGroup",
									"item": {
										"path": "/priorities",
										"template": {
											"key": "{id}",
											"title": "{title}",
											"selected": "{selected}"
										}
									},
									"validations": [
										{
											"required": true,
											"message": "Priority must be selected"
										}
									]
								}
							]
						}
					]
				}
			}
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		return ManifestResolver.resolveCard(oCard)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": [
								{
									"id": "dynamicPriority",
									"label": "Select Priority",
									"type": "RadioButtonGroup",
									"selectedIndex": -1,
									"selectedKey": null,
									"item": [
										{
											"key": "active",
											"text": "Active"
										},
										{
											"key": "inactive",
											"text": "Inactive"
										},
										{
											"key": "vacation",
											"text": "On Vacation"
										},
										{
											"key": "sick",
											"text": "Sick Leave",
											"enabled": false
										}
									],
									"validations": [
										{
											"required": true,
											"message": "Priority must be selected"
										}
									]
								}
							]
						}
					]
				};

				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "RadioButtonGroup with dynamic items should be resolved correctly.");
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0].selectedKey, null, oExpectedResult, "RadioButtonGroup with dynamic items should be resolved correctly with proper selectedKey based on value.");
				assert.deepEqual(oRes["sap.card"].content.groups[0].items[0].selectedIndex, -1, oExpectedResult, "RadioButtonGroup with dynamic items should be resolved correctly with proper selectedIndex based on value.");

				oCard.destroy();
			});
	});

	QUnit.module("Resolve show/hide message");

	QUnit.test("Show message and hide message is working", function (assert) {
		var done = assert.async(),
			oCard = new SkeletonCard({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/",
				manifest: {
					"sap.app": {
						"id": "manifestResolver.test.card.showMessage",
						"type": "card",
						"i18n": {
							"bundleUrl": "i18n/i18n.properties",
							"supportedLocales": [""],
							"fallbackLocale": ""
						}
					},
					"sap.card": {
						"type": "Object",
						"header": {
							"title": "Test show message"
						},
						"content": {
							"groups": [
								{
									"items": []
								}
							]
						}
					}
				}
			}),
			oExpectedMessage = {
				text: "Test message.",
				type: "Error"
			};

		var fnCheckMessage = function () {
			return oCard.resolveManifest().then(function (oResolvedManifest) {
				var oMessage = oResolvedManifest["sap.card"].messageStrip;
				assert.deepEqual(oMessage, oExpectedMessage, "Message strip is resolved as expected.");
			});
		};

		var fnCheckMessageIsHidden = function () {
			return oCard.resolveManifest().then(function (oResolvedManifest) {
				var oMessage = oResolvedManifest["sap.card"].messageStrip;
				assert.notOk(oMessage, "Message strip is hidden.");
				oCard.destroy();
				done();
			});
		};

		oCard.attachEventOnce("stateChanged", function () {
			oCard.attachEventOnce("stateChanged", function () {
				// Assert - show message
				fnCheckMessage().then(function () {
					// Act - hide message
					oCard.hideMessage();
				});

				oCard.attachEventOnce("stateChanged", function () {
					// Assert - hide message
					fnCheckMessageIsHidden();
				});
			});

			// Act - show message
			oCard.showMessage("{i18n>testMessage}", "Error");
		});

		oCard.startManifestProcessing();
	});

	QUnit.module("Property subtitle and subtitleMaxLines");

	QUnit.test("Subtitle is resolved for header", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card.headeSubtitle",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Test Title",
					"subtitle": "Test Subtitle",
					"subtitleMaxLines": 3
				},
				"content": {
					"item": {
						"title": "test"
					}
				}
			}
		};
		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		const oResult = await ManifestResolver.resolveCard(oCard);

		assert.strictEqual(oResult["sap.card"].header.subTitle, oManifest["sap.card"].header.subtitle, "subtitle was resolved correctly to subTitle");
		assert.strictEqual(oResult["sap.card"].header.subTitleMaxLines, oManifest["sap.card"].header.subtitleMaxLines, "subtitleMaxLines was resolved correctly to subTitleMaxLines");
		assert.notOk(oResult["sap.card"].header.hasOwnProperty("subtitle"), "The subtitle property should be removed from the resolved manifest.");
		assert.notOk(oResult["sap.card"].header.hasOwnProperty("subtitleMaxLines"), "The subtitleMaxLines property should be removed from the resolved manifest.");

		oCard.destroy();
	});

	QUnit.test("Subtitle is resolved for numeric header", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card.headeNumericSubtitle",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Test Title",
					"subtitle": "Test Subtitle",
					"subtitleMaxLines": 4
				},
				"content": {
					"item": {
						"title": "test"
					}
				}
			}
		};
		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		const oResult = await ManifestResolver.resolveCard(oCard);

		assert.strictEqual(oResult["sap.card"].header.subTitle, oManifest["sap.card"].header.subtitle, "subtitle was resolved correctly to subTitle");
		assert.strictEqual(oResult["sap.card"].header.subTitleMaxLines, oManifest["sap.card"].header.subtitleMaxLines, "subtitleMaxLines was resolved correctly to subTitleMaxLines");
		assert.notOk(oResult["sap.card"].header.hasOwnProperty("subtitle"), "The subtitle property should be removed from the resolved manifest.");
		assert.notOk(oResult["sap.card"].header.hasOwnProperty("subtitleMaxLines"), "The subtitleMaxLines property should be removed from the resolved manifest.");

		oCard.destroy();
	});

	QUnit.test("Subtitle is resolved for object group item overlay", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "manifestResolver.test.card.imageOverlaySubtitle",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Card with overlay"
				},
				"content": {
					"groups": [
						{
							"items": [
								{
									"type": "Image",
									"src": "./images/natureAndChildren.jpg",
									"overlay": {
										"title": "Hello, John",
										"subtitle": "Today will be a good day!"
									}
								}
							]
						}
					]
				}
			}
		};
		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		const oResult = await ManifestResolver.resolveCard(oCard);
		const oResultOverlay = oResult["sap.card"].content.groups[0].items[0].overlay;
		const oOriginalOverlay = oManifest["sap.card"].content.groups[0].items[0].overlay;

		assert.strictEqual(oResultOverlay.subTitle, oOriginalOverlay.subtitle, "subtitle was resolved correctly to subTitle");
		assert.notOk(oResultOverlay.hasOwnProperty("subtitle"), "The subtitle property should be removed from the resolved manifest.");

		oCard.destroy();
	});

	QUnit.module("Resolve child cards", {
		beforeEach: function () {
			this.oServer = sinon.createFakeServer({
				respondImmediately: true
			});

			const sDestinationUrl = "some/fake/url";
			this.oServer.respondWith("GET", new RegExp(sDestinationUrl), [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify({
					"title": "Title from destination",
					"description": "Description from destination"
				})
			]);

			this.oHost = new Host({
				resolveDestination: (sName) => {
					if (sName === "destination1") {
						return sDestinationUrl;
					}

					return null;
				}
			});
		},
		afterEach: function () {
			this.oServer.restore();
			this.oHost.destroy();
		}
	});

	QUnit.test("Card opens child card using ShowCard action with manifest url", function (assert) {
		const done = assert.async();
		const sChildCardManifestUrl = "/fake/child/manifest.json";
		const oChildCardManifest = {
			"sap.app": {
				"id": "child.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"configuration" :{
					"useMainDestinations": true
				},
				"data": {
					"request": {
						"url": "{{mainDestinations.destination1}}/data.json"
					}
				},
				"header": {
					"title": "{title}"
				},
				"content": {
					"groups": [
						{
							"title": "Child Group",
							"items": [
								{
									"label": "Child Item",
									"value": "{description}"
								}
							]
						}
					]
				}
			}
		};

		this.oServer.respondWith("GET", new RegExp(sChildCardManifestUrl), [
			200,
			{
				"Content-Type": "application/json"
			},
			JSON.stringify(oChildCardManifest)
		]);

		const oMainCardManifest = {
			"sap.app": {
				"id": "main.card",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"destination1": {
							"name": "destination1"
						}
					}
				},
				"header": {
					"title": "Main Card"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Open Child"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"actions": [
							{
								"type": "ShowCard",
								"parameters": {
									"manifest": sChildCardManifestUrl
								}
							}
						]
					}
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oMainCardManifest,
			baseUrl: "/"
		});

		this.oHost.onShowCard = function (oChildCard) {
			ManifestResolver.resolveCard(oChildCard)
				.then(function (oRes) {
					// Assert
					assert.strictEqual(oRes["sap.card"].header.title, "Title from destination", "Destination is resolved in child card manifest.");
					assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].value, "Description from destination", "Destination is resolved in child card manifest.");

					// Clean up
					oCard.destroy();
					done();
				});
		};

		oCard.setHost(this.oHost);

		nextCardReadyEvent(oCard).then(() => {
			oCard.triggerAction(oMainCardManifest["sap.card"].content.item.actions[0]);
		});

		oCard.startManifestProcessing();
	});

	QUnit.module("Resolve Destinations", {
	});

	QUnit.test("Sync resolution", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"contentDestination": {
							"name": "contentDestination"
						},
						"headerDestination": {
							"name": "headerDestination"
						},
						"imageDestination": {
							"name": "imageDestination"
						},
						"emptyDestination": {
							"name": "emptyDestination"
						},
						"navigationDestination": {
							"name": "navigationDestination"
						},
						"innerDestination": {
							"name": "innerDestination"
						}
					}
				},
				"header": {
					"title": "{{destinations.innerDestination}} {title}",
					"data": {
						"request": {
							"url": "{{destinations.headerDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.imageDestination}}/{Image}"
						},
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"product": "{{destinations.navigationDestination}}/{Name}",
									"empty": "{{destinations.emptyDestination}}/empty"
								}
							}
						]
					}
				}
			}
		};

		const oHost = new Host({
			resolveDestination: function(sDestinationName) {
				switch (sDestinationName) {
					case "contentDestination":
					case "headerDestination":
						return "qunit/testResources/cardWithDestinations/";
					case "imageDestination":
						return "qunit/testResources/images/";
					case "emptyDestination":
						return "";
					case "navigationDestination":
						return "https://some.domain.com" + "test1";
					case "innerDestination":
						return "Some text";
					default:
						return null;
				}
			}
		});

		const oCard = new SkeletonCard({
			manifest: oManifest,
			host: oHost,
			baseUrl: "test-resources/sap/ui/integration/"
		});

		// Act
		const oRes = await ManifestResolver.resolveCard(oCard);
		const sExpectedIcon = "test-resources/sap/ui/integration/qunit/testResources/images/Woman_avatar_01.png";

		// Assert
		assert.strictEqual(oRes["sap.card"].header.title, "Some text Card Title", "header destination is resolved successfully");
		assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].icon.src, sExpectedIcon, "The icon path is correct.");
		assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].actions[0].parameters.product, "https://some.domain.comtest1/Notebook Basic 15", "Navigation destination is resolved successfully");
		assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].actions[0].parameters.empty, "/empty", "Empty destination is resolved successfully");

		// Clean up
		oHost.destroy();
		oCard.destroy();
	});

	QUnit.test("Async resolution", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"contentDestination": {
							"name": "contentDestination"
						},
						"headerDestination": {
							"name": "headerDestination"
						},
						"imageDestination": {
							"name": "imageDestination"
						},
						"emptyDestination": {
							"name": "emptyDestination"
						},
						"navigationDestination": {
							"name": "navigationDestination"
						},
						"innerDestination": {
							"name": "innerDestination"
						}
					}
				},
				"header": {
					"title": "{{destinations.innerDestination}} {title}",
					"data": {
						"request": {
							"url": "{{destinations.headerDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.imageDestination}}/{Image}"
						},
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"product": "{{destinations.navigationDestination}}/{Name}",
									"empty": "{{destinations.emptyDestination}}/empty"
								}
							}
						]
					}
				}
			}
		};

		const oAsyncHost = new Host({
			resolveDestination: function(sDestinationName) {
				switch (sDestinationName) {
					case "contentDestination":
					case "headerDestination":
						return new Promise(function (resolve) {
							setTimeout(function () {
								resolve("qunit/testResources/cardWithDestinations/");
							}, 10);
						});
					case "imageDestination":
						return "qunit/testResources/images/";
					case "emptyDestination":
						return new Promise(function (resolve) {
							setTimeout(function () {
								resolve("");
							}, 10);
						});
					case "navigationDestination":
						return new Promise(function (resolve) {
							setTimeout(function () {
								resolve("https://some.domain.com" + "test1");
							}, 10);
						});
					case "innerDestination":
						return new Promise(function (resolve) {
							setTimeout(function () {
								resolve("Some text");
							}, 10);
						});
					default:
						return null;
				}
			}
		});

		const oCard = new SkeletonCard({
			manifest: oManifest,
			host: oAsyncHost,
			baseUrl: "test-resources/sap/ui/integration/"
		});

		// Act
		const oRes = await ManifestResolver.resolveCard(oCard);
		const sExpectedIcon = "test-resources/sap/ui/integration/qunit/testResources/images/Woman_avatar_01.png";

		// Assert
		assert.strictEqual(oRes["sap.card"].header.title, "Some text Card Title", "header destination is resolved successfully");
		assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].icon.src, sExpectedIcon, "The icon path is correct.");
		assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].actions[0].parameters.product, "https://some.domain.comtest1/Notebook Basic 15", "Navigation destination is resolved successfully");
		assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].actions[0].parameters.empty, "/empty", "Empty destination is resolved successfully");

		// Clean up
		oAsyncHost.destroy();
		oCard.destroy();
	});

	QUnit.test("Invalid host", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "{title}",
					"subtitle": "{{destinations.myDestination}} {subTitle}",
					"data": {
						"request": {
							"url": "{{destinations.asyncDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.myDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		const oInvalidHost = new Host({
			resolveDestination: function() {
				return undefined;
			}
		});

		const oCard = new SkeletonCard({
			manifest: oManifest,
			host: oInvalidHost,
			baseUrl: "test-resources/sap/ui/integration/"
		});

		// Act
		const oRes = await ManifestResolver.resolveCard(oCard);

		// Assert
		assert.notOk(oRes["sap.card"].content.groups, "The data request is unsuccessful due to invalid destination.");
		assert.notOk(oRes["sap.card"].header.title, "Header destination is not resolved successfully");
		assert.notOk(oRes["sap.card"].header.subtitle, "Subtitle destination is not resolved");

		// Clean up
		oInvalidHost.destroy();
		oCard.destroy();
	});

	QUnit.test("Mixed valid and invalid destinations", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"contentDestination": {
							"name": "contentDestination"
						},
						"headerDestination": {
							"name": "headerDestination"
						}
					}
				},
				"header": {
					"title": "{title}",
					"data": {
						"request": {
							"url": "{{destinations.headerDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}",
						"icon": {
							"src": "{{destinations.invalidDestination}}/{Image}"
						}
					}
				}
			}
		};

		const oPartialHost = new Host({
			resolveDestination: function(sDestinationName) {
				switch (sDestinationName) {
					case "contentDestination":
					case "headerDestination":
						return "qunit/testResources/cardWithDestinations/";
					default:
						return null;
				}
			}
		});

		const oCard = new SkeletonCard({
			manifest: oManifest,
			host: oPartialHost,
			baseUrl: "test-resources/sap/ui/integration/"
		});

		// Act
		const oRes = await ManifestResolver.resolveCard(oCard);
		const sFirstItemIcon = oRes["sap.card"].content.groups[0].items[0].icon.src;

		// Assert
		assert.ok(oRes["sap.card"].content.groups[0].items.length, "The data request is successful.");
		assert.strictEqual(oRes["sap.card"].header.title, "Card Title", "header destination is resolved successfully");
		assert.notOk(sFirstItemIcon, "The icon path is not resolved.");

		// Clean up
		oPartialHost.destroy();
		oCard.destroy();
	});

	QUnit.test("No host provided", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"contentDestination": {
							"name": "contentDestination"
						}
					}
				},
				"header": {
					"title": "{title}",
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/header.json"
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "{{destinations.contentDestination}}/items.json"
						}
					},
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/"
		});

		// Act
		const oRes = await ManifestResolver.resolveCard(oCard);

		// Assert
		assert.notOk(oRes["sap.card"].content.groups, "The data request is unsuccessful.");
		assert.notOk(oRes["sap.card"].header.title, "destination is not resolved successfully");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Resolve Destinations - Default URL", {
	});

	QUnit.test("Default URL with host returning null", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"test1": {
							"name": "Test1Name",
							"defaultUrl": "test1/url"
						},
						"test2": {
							"defaultUrl": "test2/url"
						}
					}
				},
				"header": {
					"title": "{{destinations.test1}}"
				},
				"content": {
					"data": {
						"json": [
							{
								"url1": "{{destinations.test1}}",
								"url2": "{{destinations.test2}}"
							}
						]
					},
					"item": {
						"title": "{url1}",
						"description": "{url2}"
					}
				}
			}
		};

		const oHost = new Host({
			resolveDestination: function() {
				return null;
			}
		});

		const oCard = new SkeletonCard({
			manifest: oManifest,
			host: oHost,
			baseUrl: "test-resources/sap/ui/integration/"
		});

		// Act
		const oRes = await ManifestResolver.resolveCard(oCard);

		// Assert
		assert.strictEqual(oRes["sap.card"].header.title, "test1/url", "Default url for test1 is correct.");
		assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].title, "test1/url", "Default url for test1 is correct.");
		assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].description, "test2/url", "Default url for test2 is correct.");

		// Clean up
		oHost.destroy();
		oCard.destroy();
	});

	QUnit.test("Default URL without host", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"test1": {
							"name": "Test1Name",
							"defaultUrl": "test1/url"
						}
					}
				},
				"header": {
					"title": "{{destinations.test1}}"
				},
				"content": {
					"data": {
						"json": []
					},
					"item": {
						"title": "test"
					}
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/"
		});

		// Act
		const oRes = await ManifestResolver.resolveCard(oCard);

		// Assert
		assert.strictEqual(oRes["sap.card"].header.title, "test1/url", "Default url for test1 is correct.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Missing default URL and name", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test1"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"test3": { }
					}
				},
				"header": {
					"title": "{{destinations.test3}}"
				},
				"content": {
					"data": {
						"json": []
					},
					"item": {
						"title": "test"
					}
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/"
		});

		// Act
		const oRes = await ManifestResolver.resolveCard(oCard);

		// Assert
		assert.ok(oRes["sap.card"].header.title === "" || oRes["sap.card"].header.title.includes("{{destinations.test3}}"), "Destination without name or defaultUrl is not resolved");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Resolve customSettings");

	QUnit.test("Resolves simple bindings from manifest only", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.skeleton.customsettings.manifestonly"
			},
			"sap.card": {
				"type": "Object",
				"customSettings": {
					"theme": {
						"primaryColor": "#ff0000",
						"fontSize": 16
					},
					"headerText": {
						"headerSubtitle": "Object Subtitle"
					},
					"features": ["feature1", "feature2"]
				},
				"header": {
					"title": "SkeletonCard CustomSettings Test",
					"subtitle": "{customSettings>/headerText/headerSubtitle}",
					"status": {
						"text": "{customSettings>/features/0}"
					}
				},
				"content": {
					"groups": [
						{
							"title": "Settings",
							"items": [
								{
									"label": "Primary Color",
									"value": "{customSettings>/theme/primaryColor}"
								},
								{
									"label": "Font Size",
									"value": "{customSettings>/theme/fontSize}"
								},
								{
									"label": "First Feature",
									"value": "{customSettings>/features/0}"
								}
							]
						}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oResolvedManifest) {
				const oHeader = oResolvedManifest["sap.card"].header;
				const oContent = oResolvedManifest["sap.card"].content;

				// Assert
				assert.strictEqual(oHeader.subTitle, "Object Subtitle", "Object binding in header resolved");
				assert.strictEqual(oHeader.status.text, "feature1", "Array binding in header resolved");
				assert.strictEqual(oContent.groups[0].items[0].value, "#ff0000", "Nested object binding resolved");
				assert.strictEqual(oContent.groups[0].items[1].value, 16, "Nested object binding for number resolved");
				assert.strictEqual(oContent.groups[0].items[2].value, "feature1", "Array index binding resolved");

				oCard.destroy();
			});
	});

	QUnit.test("Resolves bindings with property and manifest merge", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.skeleton.customsettings.merge"
			},
			"sap.card": {
				"type": "Object",
				"customSettings": {
					"theme": {
						"primaryColor": "#ff0000"
					}
				},
				"header": {
					"title": "Merge Test",
					"subtitle": "{customSettings>/theme/primaryColor}"
				},
				"content": {
					"groups": [
						{
							"title": "Settings",
							"items": [
								{
									"label": "Primary (manifest)",
									"value": "{customSettings>/theme/primaryColor}"
								},
								{
									"label": "Property Setting",
									"value": "{customSettings>/propertyOnlySetting}"
								}
							]
						}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
		});

		oCard.setProperty("customSettings", {
			theme: {
				primaryColor: "#007bff",
				secondaryColor: "#6c757d"
			},
			propertyOnlySetting: "Property value"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oResolvedManifest) {
				const oHeader = oResolvedManifest["sap.card"].header;
				const oContent = oResolvedManifest["sap.card"].content;
				const oCustomSettings = oResolvedManifest["sap.card"].customSettings;

				// Assert
				assert.strictEqual(oHeader.subTitle, "#ff0000", "Binding resolved to manifest value (overrides property)");
				assert.strictEqual(oContent.groups[0].items[0].value, "#ff0000", "Manifest override applied");
				assert.strictEqual(oContent.groups[0].items[1].value, "Property value", "Property-only setting preserved and resolved");
				assert.strictEqual(oCustomSettings.theme.primaryColor, "#ff0000", "Manifest theme present");
				assert.strictEqual(oCustomSettings.theme.secondaryColor, undefined, "Property secondaryColor lost (shallow merge)");
				assert.strictEqual(oCustomSettings.propertyOnlySetting, "Property value", "Property-only setting preserved");

				oCard.destroy();
			});
	});

	QUnit.test("Resolves visibility expression bindings", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.skeleton.customsettings.visibility"
			},
			"sap.card": {
				"type": "Object",
				"customSettings": {
					"showHeader": true
				},
				"header": {
					"title": "Visibility Test",
					"subTitle": "Header is visible",
					"visible": "{= ${customSettings>/showHeader} === true}"
				},
				"content": {
					"groups": [
						{
							"title": "Status",
							"items": [
								{
									"label": "Result",
									"value": "{= ${customSettings>/showHeader} ? 'Visible' : 'Hidden'}"
								}
							]
						}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oResolvedManifest) {
				const oHeader = oResolvedManifest["sap.card"].header;
				const oContent = oResolvedManifest["sap.card"].content;

				// Assert
				assert.strictEqual(oHeader.visible, true, "Header visibility expression resolved");
				assert.strictEqual(oContent.groups[0].items[0].value, "Visible", "Ternary expression resolved");

				oCard.destroy();
			});
	});

	QUnit.test("Resolves complex expression bindings", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.skeleton.customsettings.expressions"
			},
			"sap.card": {
				"type": "Object",
				"customSettings": {
					"minValue": 25,
					"maxValue": 100,
					"prefix": "Range: "
				},
				"header": {
					"title": "Expression Test",
					"subTitle": "{= ${customSettings>/prefix} + ${customSettings>/minValue} + ' - ' + ${customSettings>/maxValue}}"
				},
				"content": {
					"groups": [
						{
							"title": "Calculations",
							"items": [
								{
									"label": "Concatenation",
									"value": "{= ${customSettings>/prefix} + ${customSettings>/minValue}}"
								},
								{
									"label": "Math",
									"value": "{= ${customSettings>/minValue} + ${customSettings>/maxValue}}"
								}
							]
						}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
		});

		oCard.setProperty("customSettings", {
			minValue: 10,
			maxValue: 50
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oResolvedManifest) {
				const oHeader = oResolvedManifest["sap.card"].header;
				const oContent = oResolvedManifest["sap.card"].content;

				// Assert
				assert.strictEqual(oHeader.subTitle, "Range: 25 - 100", "Complex string concatenation expression resolved");
				assert.strictEqual(oContent.groups[0].items[0].value, "Range: 25", "Expression with concatenation resolved");
				assert.strictEqual(oContent.groups[0].items[1].value, 125, "Math expression resolved");

				oCard.destroy();
			});
	});

	QUnit.test("Resolves bindings with property settings only", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.skeleton.customsettings.propertyonly"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Property Settings Only Test",
					"subTitle": "{customSettings>/subtitle}",
					"visible": "{= ${customSettings>/showHeader} === true}"
				},
				"content": {
					"groups": [
						{
							"title": "Property Values",
							"items": [
								{
									"label": "Setting",
									"value": "{customSettings>/propertyValue}"
								}
							]
						}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
		});

		oCard.setProperty("customSettings", {
			showHeader: true,
			subtitle: "From property",
			propertyValue: "Property-provided value"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oResolvedManifest) {
				const oHeader = oResolvedManifest["sap.card"].header;
				const oContent = oResolvedManifest["sap.card"].content;

				// Assert
				assert.strictEqual(oHeader.subTitle, "From property", "Binding resolved to property value");
				assert.strictEqual(oHeader.visible, true, "Expression resolved to property boolean value");
				assert.strictEqual(oContent.groups[0].items[0].value, "Property-provided value", "Property-only value resolved");

				oCard.destroy();
			});
	});

	QUnit.test("Handles empty customSettings", function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.card.resolver4"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Empty Custom Settings Test"
				},
				"content": {
					"groups": [
						{
							"title": "Group 1",
							"items": [
								{
									"label": "Label",
									"value": "Value"
								}
							]
						}
					]
				}
			}
		};

		const oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(function (oResolvedManifest) {
				const oCustomSettings = oResolvedManifest["sap.card"].customSettings;

				// Assert
				assert.deepEqual(oCustomSettings, {}, "customSettings is empty object when nothing provided");

				oCard.destroy();
			});
	});

	QUnit.module("Parameters with complex/JSON values", {
		beforeEach: function () {
			this._oLogErrorRawSpy = sinon.spy(Log, "error");
			const oRawSpy = this._oLogErrorRawSpy;
			const sComponent = "sap.ui.integration.util.ManifestResolver";

			function aFailSafeCalls() {
				return oRawSpy.getCalls().filter((oCall) => oCall.args[1] === sComponent);
			}

			this.oLogErrorSpy = {
				get callCount() { return aFailSafeCalls().length; },
				get called() { return aFailSafeCalls().length > 0; },
				calledWithMatch: (oMatcher) => aFailSafeCalls().some((oCall) => oMatcher.test(oCall.args[0]))
			};
		},
		afterEach: function () {
			this._oLogErrorRawSpy.restore();
		}
	});

	const sBaseUrl = "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/";
	const sBareBraceJsonArray = "[{\"datasetId\":\"planning:[TENANT][][/sap.ask/Model_qs]\"}]";

	function manifestWithParameters(sId, oParameters, oExtraSapCard) {
		return {
			"sap.app": { "id": sId, "type": "card" },
			"sap.card": Object.assign({
				"type": "Object",
				"configuration": { "parameters": oParameters },
				"content": { "groups": [] }
			}, oExtraSapCard || {})
		};
	}

	function hasConfigurationError(oRes) {
		const oContent = oRes["sap.card"].content;
		return !!(oContent && oContent.message && oContent.message.type === "error");
	}

	QUnit.test("Fail-safe: bare-brace JSON-array string is preserved", async function (assert) {
		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.failsafe.string", {
				"entityId": { "value": sBareBraceJsonArray }
			}),
			baseUrl: sBaseUrl
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		assert.notOk(hasConfigurationError(oRes), "Fail-safe prevents the Card Configuration Error");
		assert.strictEqual(oRes["sap.card"].configuration.parameters.entityId.value, sBareBraceJsonArray, "Raw string preserved verbatim");
		assert.ok(this.oLogErrorSpy.calledWithMatch(/entityId/), "Log.error names the parameter");
		assert.ok(this.oLogErrorSpy.calledWithMatch(/ignoreBinding/), "Log.error points to the ignoreBinding flag");

		oCard.destroy();
	});

	QUnit.test("Fail-safe: bare-brace JSON-object string is preserved", async function (assert) {
		const sJsonObject = "{\"key\":\"value\",\"nested\":{\"arr\":[1,2,3]}}";
		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.failsafe.objectstring", {
				"config": { "value": sJsonObject }
			}),
			baseUrl: sBaseUrl
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		assert.notOk(hasConfigurationError(oRes), "Fail-safe prevents the Card Configuration Error");
		assert.strictEqual(typeof oRes["sap.card"].configuration.parameters.config.value, "string", "Resolved value remains a string, not a coerced object");
		assert.strictEqual(oRes["sap.card"].configuration.parameters.config.value, sJsonObject, "Raw string preserved verbatim");
		assert.ok(this.oLogErrorSpy.calledWithMatch(/config/), "Log.error names the parameter");

		oCard.destroy();
	});

	QUnit.test("Fail-safe: object value with bare-brace leaf is preserved", async function (assert) {
		const oParamValue = {
			"body": [{
				"details": { "EntityId": sBareBraceJsonArray },
				"id": "sac_widget1"
			}],
			"id": "9a4e5576-ff53-454b-b231-5ead55a0e578"
		};
		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.failsafe.object", {
				"interpretation": { "value": oParamValue }
			}),
			baseUrl: sBaseUrl
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		assert.notOk(hasConfigurationError(oRes), "Fail-safe prevents the Card Configuration Error");
		assert.deepEqual(oRes["sap.card"].configuration.parameters.interpretation.value, oParamValue, "Object value with bare-brace leaf is restored verbatim");
		assert.ok(this.oLogErrorSpy.calledWithMatch(/interpretation/), "Log.error names the parameter");

		oCard.destroy();
	});

	QUnit.test("Fail-safe: each malformed parameter logs once, well-formed siblings unaffected", async function (assert) {
		const oHost = new Host();
		oHost.getContextValue = (sKey) => Promise.resolve(sKey === "sample/country" ? "France" : undefined);

		const oManifest = manifestWithParameters("test.params.failsafe.multi", {
			"firstParam": { "value": sBareBraceJsonArray },
			"secondParam": { "value": "[{\"datasetId\":\"other:[TENANT][][/sap.ask/Model_qs]\"}]" },
			"country": { "value": "{context>/sample/country}" }
		});
		const oCard = new SkeletonCard({ manifest: oManifest, baseUrl: sBaseUrl, host: oHost });

		const oRes = await ManifestResolver.resolveCard(oCard);
		const oParams = oRes["sap.card"].configuration.parameters;
		assert.notOk(hasConfigurationError(oRes), "Card resolves successfully despite two malformed parameters");
		assert.strictEqual(oParams.firstParam.value, sBareBraceJsonArray, "first raw value restored");
		assert.strictEqual(oParams.country.value, "France", "Well-formed sibling resolves through host");
		assert.strictEqual(this.oLogErrorSpy.callCount, 2, "Log.error called once per recovered parameter");
		assert.ok(this.oLogErrorSpy.calledWithMatch(/firstParam/), "Log.error names firstParam");
		assert.ok(this.oLogErrorSpy.calledWithMatch(/secondParam/), "Log.error names secondParam");
		assert.notOk(this.oLogErrorSpy.calledWithMatch(/country/), "Log.error does not name the well-formed sibling");

		oCard.destroy();
		oHost.destroy();
	});

	QUnit.test("ignoreBinding: stringified-JSON value preserved verbatim", async function (assert) {
		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.ignorebinding.string", {
				"entityId": { "ignoreBinding": true, "value": sBareBraceJsonArray }
			}),
			baseUrl: sBaseUrl
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		const oParam = oRes["sap.card"].configuration.parameters.entityId;
		assert.notOk(hasConfigurationError(oRes), "No Card Configuration Error");
		assert.strictEqual(oParam.value, sBareBraceJsonArray, "Value preserved verbatim");
		assert.strictEqual(oParam.ignoreBinding, true, "ignoreBinding flag survives in resolved manifest");
		assert.notOk(this.oLogErrorSpy.called, "Fail-safe does not fire when ignoreBinding handled the value");

		oCard.destroy();
	});

	QUnit.test("ignoreBinding: deep object value preserved and referenceable from content", async function (assert) {
		const oInterpretation = {
			"body": [{
				"details": {
					"Datasource": {
						"EntityId": "[{\"datasetId\":\"planning:[TENANT_7][][/sap.epm/BestRunJuice_SampleModel_qs]\"}]",
						"ModelName": "BestRunJuice_SampleModel"
					}
				},
				"id": "sac_widget1"
			}],
			"id": "9a4e5576-ff53-454b-b231-5ead55a0e578"
		};

		const fnIncludeScriptStub = sinon.stub(AnalyticsCloudHelper, "_includeScript").callsFake(() => {
			sap.sac = {
				api: {
					widget: {
						setup: sinon.stub(),
						getWidgetInfo: sinon.stub(),
						renderWidget: sinon.stub(),
						renderWidgetForJustAsk: sinon.stub()
					}
				}
			};
			return Promise.resolve();
		});

		const oManifest = {
			"sap.app": { "id": "test.params.ignorebinding.deep", "type": "card" },
			"sap.card": {
				"type": "AnalyticsCloud",
				"configuration": {
					"parameters": {
						"interpretation": { "ignoreBinding": true, "value": oInterpretation }
					}
				},
				"content": {
					"interpretation": "{parameters>/interpretation/value}",
					"sacTenantDestination": "https://example.sac.cloud"
				}
			}
		};
		const oCard = new SkeletonCard({ manifest: oManifest, baseUrl: sBaseUrl });

		const oRes = await ManifestResolver.resolveCard(oCard);
		assert.notOk(hasConfigurationError(oRes), "No Card Configuration Error");
		assert.deepEqual(oRes["sap.card"].configuration.parameters.interpretation.value, oInterpretation, "Deep object preserved verbatim, including bare-brace EntityId");
		assert.notOk(this.oLogErrorSpy.called, "Fail-safe does not fire when ignoreBinding handled the value");

		oCard.destroy();
		fnIncludeScriptStub.restore();
		AnalyticsCloudHelper._pInitialize = null;
		if (sap.sac && sap.sac.api) { delete sap.sac.api.widget; }
	});

	QUnit.test("ignoreBinding: binding-like string is kept literal", async function (assert) {
		const oHost = new Host();
		oHost.getContextValue = () => Promise.resolve("HOST_VALUE");

		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.ignorebinding.tradeoff", {
				"opaque": {
					"ignoreBinding": true,
					"value": { "wouldBeBinding": "{context>/some/path}", "literal": "static" }
				}
			}),
			baseUrl: sBaseUrl,
			host: oHost
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		const oVal = oRes["sap.card"].configuration.parameters.opaque.value;
		assert.strictEqual(oVal.wouldBeBinding, "{context>/some/path}", "Binding-like string is kept literal, not resolved");
		assert.strictEqual(oVal.literal, "static", "Static field is preserved");

		oCard.destroy();
		oHost.destroy();
	});

	QUnit.test("Regression: well-formed bindings resolve normally", async function (assert) {
		const oHost = new Host();
		oHost.getContextValue = (sKey) => Promise.resolve({
			"sample/firstName": "Donna",
			"sample/lastName": "Moore",
			"sample/supplier/id/value": "SUP001"
		}[sKey]);

		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.regression.bindings", {
				"fullName": { "value": "{= ${context>/sample/firstName} + ' ' + ${context>/sample/lastName} }" },
				"supplierId": { "value": "{context>/sample/supplier/id/value}" }
			}),
			baseUrl: sBaseUrl,
			host: oHost
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		const oParams = oRes["sap.card"].configuration.parameters;
		assert.strictEqual(oParams.fullName.value, "Donna Moore", "Composite expression binding over {context>/...} resolved");
		assert.strictEqual(oParams.supplierId.value, "SUP001", "{context>/...} binding resolved through host");
		assert.notOk(this.oLogErrorSpy.called, "Fail-safe does not fire for legitimate bindings");

		oCard.destroy();
		oHost.destroy();
	});

	QUnit.test("Regression: TODAY_ISO system placeholder still resolves", async function (assert) {
		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.regression.systemparam", {
				"today": { "value": "{{parameters.TODAY_ISO}}", "type": "date" }
			}),
			baseUrl: sBaseUrl
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		const sValue = oRes["sap.card"].configuration.parameters.today.value;
		assert.ok(typeof sValue === "string" && /^\d{4}-\d{2}-\d{2}/.test(sValue), "TODAY_ISO resolved to date string, got: " + sValue);
		assert.notOk(this.oLogErrorSpy.called, "Fail-safe does not fire for system placeholder");

		oCard.destroy();
	});

	QUnit.test("Regression: primitive and array parameter values are preserved", async function (assert) {
		const aArrayValue = [{ "id": "abc", "label": "ABC" }, { "id": "xyz", "label": "XYZ" }];
		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.regression.primitives", {
				"count": { "value": 42 },
				"enabled": { "value": true },
				"empty": { "value": null },
				"items": { "value": aArrayValue }
			}),
			baseUrl: sBaseUrl
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		const oParams = oRes["sap.card"].configuration.parameters;
		assert.strictEqual(oParams.count.value, 42, "Integer preserved");
		assert.strictEqual(oParams.enabled.value, true, "Boolean preserved");
		assert.strictEqual(oParams.empty.value, null, "Null preserved");
		assert.deepEqual(oParams.items.value, aArrayValue, "Array preserved");
		assert.notOk(this.oLogErrorSpy.called, "Fail-safe does not fire for primitives");

		oCard.destroy();
	});

	QUnit.test("Regression: ignoreBinding requires strict true", async function (assert) {
		const oCard = new SkeletonCard({
			manifest: manifestWithParameters("test.params.regression.ignorebinding.strict", {
				"falseFlag": { "ignoreBinding": false, "value": sBareBraceJsonArray },
				"stringFlag": { "ignoreBinding": "true", "value": sBareBraceJsonArray }
			}),
			baseUrl: sBaseUrl
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		const oParams = oRes["sap.card"].configuration.parameters;
		assert.strictEqual(oParams.falseFlag.value, sBareBraceJsonArray, "ignoreBinding:false - raw value restored by fail-safe");
		assert.strictEqual(oParams.stringFlag.value, sBareBraceJsonArray, "ignoreBinding:'true' string - raw value restored by fail-safe");
		assert.strictEqual(this.oLogErrorSpy.callCount, 2, "Fail-safe fires once per non-strict-true parameter");

		oCard.destroy();
	});

	QUnit.test("Edge: manifest without configuration resolves cleanly", async function (assert) {
		const oCard = new SkeletonCard({
			manifest: {
				"sap.app": { "id": "test.params.edge.noconfig", "type": "card" },
				"sap.card": {
					"type": "Object",
					"content": { "groups": [] }
				}
			},
			baseUrl: sBaseUrl
		});

		const oRes = await ManifestResolver.resolveCard(oCard);
		assert.notOk(hasConfigurationError(oRes), "Card without parameters resolves cleanly");
		assert.notOk(this.oLogErrorSpy.called, "Fail-safe does not fire");

		oCard.destroy();
	});

});
