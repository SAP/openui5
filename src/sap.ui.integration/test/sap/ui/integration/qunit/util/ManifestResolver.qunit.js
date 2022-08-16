/* global QUnit */

sap.ui.define([
	"sap/ui/integration/util/ManifestResolver",
	"sap/ui/integration/util/SkeletonCard"
], function (
	ManifestResolver,
	SkeletonCard
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

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].header.title, "Donna Moore", "Binding is resolved in the header");
				assert.strictEqual(oRes["sap.card"].content.groups[0].items[0].value, "Donna", "Binding is resolved in the content");

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
			.then(JSON.parse)
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
			.then(JSON.parse)
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
			.then(JSON.parse)
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
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert

				var sResolvedStatusText = oRes["sap.card"].header.status.text;
				assert.strictEqual(sResolvedStatusText, "1 of 3", "Predefined translation key is correctly resolved");

				var sResolvedFormattedTranslation = oRes["sap.card"].header.subTitle;
				assert.strictEqual(sResolvedFormattedTranslation , "2 categories, 3 items", "Formatted translation from i18n file is correctly resolved");

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
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.ok(true, "No error were thrown");
				assert.ok(oRes, "There is result returned");

				oCard.destroy();
			});
	});

	QUnit.test("Promise is rejected if there was a fundamental error in the card", function (assert) {
		// Arrange
		var oManifest = {};

		assert.expect(1);

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.catch(function (sError) {
				// Assert
				assert.ok(true, "Promise is rejected with '" + sError + "'if manifest is empty.");

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
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(oRes["sap.card"].content.groups[0].title, "value from content", "Value should be taken from the closest data section");
			});
	});

	QUnit.test("Header binding is resolved against its own data", function (assert) {
		// Act
		return ManifestResolver.resolveCard(this.oCard)
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

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(JSON.parse)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": [
								{
									"title": "Comfort Easy"
								},
								{
									"title": "ITelO Vault"
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
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(JSON.parse)
			.then(function (oRes) {
				var oExpectedResult = {
					"groups": [
						{
							"items": []
						}
					]
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
			.then(JSON.parse)
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
			.then(JSON.parse)
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
			.then(JSON.parse)
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
								"LastName": "Moore"
							},
							{
								"FirstName": "John",
								"LastName": "Miller"
							}
						]
					},
					"row": {
						"columns": [
							{
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
			.then(JSON.parse)
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
		};

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(JSON.parse)
			.then(function (oRes) {
				var oExpectedResult = {
					"headers": [{
						"title": "Title"
					}],
					"groups": [
						{
							"rows": []
						}
					]
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
			.then(JSON.parse)
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
				assert.deepEqual(oRes["sap.card"].content, oExpectedResult, "list template is resolved correctly");

				oCard.destroy();
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

		var oCard = new SkeletonCard({
			manifest: oManifest,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources/manifestResolver/"
		});

		// Act
		return ManifestResolver.resolveCard(oCard)
			.then(JSON.parse)
			.then(function (oRes) {
				// Assert
				assert.strictEqual(
					oRes["sap.card"].configuration.filters.myFilter.items[0].title,
					oManifest["sap.card"].configuration.filters.myFilter.data.json[0].Name,
					"Item should be created from the template"
				);

				oCard.destroy();
			});
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
			.then(JSON.parse)
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
			.then(JSON.parse)
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
			.then(JSON.parse)
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

	QUnit.test("Invalid actions binding", function (assert) {
		// Arrange
		var oManifest = {
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
									"title": "{= extension.formatters.toUpperCase(${parameters>/state/value}) }"
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
			.catch(function () {
				// Assert
				assert.ok(true, "an exception is thrown");
				oCard.destroy();
			});
	});
});