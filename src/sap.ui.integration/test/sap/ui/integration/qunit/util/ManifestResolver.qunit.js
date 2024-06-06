/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/Host",
	"sap/ui/integration/util/ManifestResolver",
	"sap/ui/integration/util/SkeletonCard"
], function (
	Library,
	Host,
	ManifestResolver,
	SkeletonCard
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
					"subTitle": "{i18n>contactDetails}"
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
					"subTitle": "{= format.text(${i18n>subtitle_data_count}, [${uniqueCategories}, ${count}]) }",
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
				// Assert

				var sResolvedStatusText = oRes["sap.card"].header.status.text;
				assert.strictEqual(sResolvedStatusText, "1 of 3", "Predefined translation key is correctly resolved");

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
						"illustrationType": "sapIllus-SimpleError",
						"illustrationSize": "Spot"
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
							"illustrationType": "sapIllus-ErrorScreen",
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
						"title": "{ formatter: '' }"
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
								"Icon": "../../images/Woman_avatar_01.png"
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
									"title": "Comfort Easy",
									"icon": {
										"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_01.png"
									}
								},
								{
									"title": "ITelO Vault",
									"icon": {
										"src": "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/../../images/Woman_avatar_02.png"
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
					]
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
					"subTitle": "by years",
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
					]
				};

				// Assert
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "list template is resolved correctly");

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

		assert.expect(2);

		// Act
		return oCard.resolveManifest()
			.then(function (oRes) {
				// Assert
				assert.deepEqual(oRes["sap.card"].content.groups[0].items, oExpectedItemsPage1, "content for first page is resolved correctly");
				assert.deepEqual(oRes["sap.card"].footer.paginator, oExpectedPaginatorPage1, "paginator for first page is resolved correctly");

				// Act - next page
				oCard.getCardFooter().getPaginator().next();

				return oCard.resolveManifest();
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
				"items": []
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
						"title": "{ formatter: '' }"
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
									"title": {}
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
					"icon": {
						"src": "{photo}"
					},
					"title": "{firstName} {lastName}",
					"subTitle": "{position}"
				},
				"content": {
					"groups": [{
						"title": "{{contactDetails}}",
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
});