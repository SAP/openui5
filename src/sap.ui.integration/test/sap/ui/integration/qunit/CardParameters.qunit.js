/* global QUnit, sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/Locale",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/date/UI5Date",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function(
	Log,
	Localization,
	Locale,
	Card,
	UI5Date,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_DefaultParameters = {
		"sap.app": {
			"id": "test.card.card5"
		},
		"sap.card": {
			"configuration": {
				"parameters": {
					"city": {
						"value": "Vratza"
					},
					"country": {
						"value": "Bulgaria"
					},
					"testObject": {
						"value": {
							"text": "OBJECT_VALUE"
						}
					},
					"testArray": {
						"value": [
							{
								"text": "ARRAY_VALUE_0"
							},
							{
								"text": "ARRAY_VALUE_1"
							}
						]
					}
				}
			},
			"type": "List",
			"header": {
				"title": "Default manifest parameters",
				"subTitle": "Default parameter from manifest"
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Notebook Basic 15",
							"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1000",
							"SubCategoryId": "Notebooks",
							"state": "Information",
							"info": "27.45 EUR",
							"infoState": "Success"
						},
						{
							"Name": "Notebook Basic 17",
							"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1001",
							"SubCategoryId": "Notebooks",
							"state": "Success",
							"info": "27.45 EUR",
							"infoState": "Success"

						}
					]
				},
				"item": {
					"title": {
						"label": "Title label",
						"value": "{Name}, {{parameters.TODAY_ISO}}"
					},
					"description": {
						"value": "Stationed in: {{parameters.city}}, {{parameters.country}}. City again: {{parameters.city}}"
							+ "Other test: {{parameters.testObject.text}} and {{parameters.testArray.0.text}} and {{parameters.testArray.1.text}}"
					},
					"highlight": "{state}"
				}
			}
		}
	};

	var oManifest_WithoutParameters = {
		"sap.app": {
			"id": "test.card.card6"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Default manifest parameters",
				"subTitle": "Default parameter from manifest"
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Notebook Basic 15",
							"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1000",
							"SubCategoryId": "Notebooks",
							"state": "Information",
							"info": "27.45 EUR",
							"infoState": "Success"
						},
						{
							"Name": "Notebook Basic 17",
							"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1001",
							"SubCategoryId": "Notebooks",
							"state": "Success",
							"info": "27.45 EUR",
							"infoState": "Success"

						}
					]
				},
				"item": {
					"title": {
						"label": "Title label",
						"value": "{Name}, {{parameters.TODAY_ISO}}"
					},
					"description": {
						"value": "Stationed in: {{parameters.city}}, {{parameters.country}}"
					},
					"highlight": "{state}"
				}
			}
		}
	};

	QUnit.module("Card Parameters", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Property is set with correct values", function (assert) {
		// Act
		this.oCard.setParameters({ "city": "Sofia" });
		var oCardWithParameters = new Card({
			parameters: {
				"city": "Waldorf",
				"country": "Germany"
			}
		});
		var oParameters = oCardWithParameters.getParameters(),
			oSetterProperties = this.oCard.getParameters();

		// Assert
		assert.strictEqual(oParameters.city, "Waldorf", "Parameter property is set correctly");
		assert.strictEqual(oParameters.country, "Germany", "Parameter property is set correctly");
		assert.strictEqual(oSetterProperties.city, "Sofia", "Parameter property is set correctly");
	});

	QUnit.test("Default Parameters - In manifest only parameters", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_DefaultParameters);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItems = this.oCard.getCardContent()._getList().getItems(),
			oItem = oManifest_DefaultParameters["sap.card"]["content"]["data"]["json"][0],
			sTitle = oListItems[0].getTitle(),
			sDescription = oListItems[0].getDescription();

		// Assert
		assert.ok(sDescription.indexOf("Vratza") > -1, "Card parameter 'city' should be replaced in rendered html  with 'Vratza'");
		assert.strictEqual(sDescription.match(/Vratza/g).length, 2, "Parameter can occur multiple times and is replaced in every occurrence");
		assert.ok(sDescription.indexOf("Bulgaria") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Bulgaria'");

		assert.ok(sDescription.indexOf("OBJECT_VALUE") > -1, "Object parameters work");
		assert.ok(sDescription.indexOf("ARRAY_VALUE_0") > -1, "Array parameters work for index 0");
		assert.ok(sDescription.indexOf("ARRAY_VALUE_1") > -1, "Array parameters work for index 1");

		assert.ok(sTitle.indexOf(oItem.Name) > -1, "Card title should be rendered with its value");
	});

	QUnit.test("Overwrite Parameters - Default value from manifest and one overwritten through property", async function (assert) {
		// Act
		this.oCard.setParameters({ "city": "Sofia" });
		this.oCard.setManifest(oManifest_DefaultParameters);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItems = this.oCard.getCardContent()._getList().getItems(),
			oParameters = this.oCard.getCombinedParameters();

		// Assert
		assert.ok(oListItems[0].getDescription().indexOf("Sofia") > -1, "Card parameter 'city' should be replaced in rendered html  with 'Sofia'");
		assert.ok(oListItems[0].getDescription().indexOf("Bulgaria") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Bulgaria'");

		assert.strictEqual(oParameters.city, "Sofia", "Card parameter 'city' is correct.");
		assert.strictEqual(oParameters.country, "Bulgaria", "Card parameter 'country' is correct.");
	});

	QUnit.test("Default Parameters - In manifest and overwrite from property", async function (assert) {
		// Arrange
		var oData = {
				"location": {
					"city": "Waldorf",
					"country": "Germany"
				}
			};

		// Act
		this.oCard.setParameters(oData.location);
		this.oCard.setManifest(oManifest_DefaultParameters);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItems = this.oCard.getCardContent()._getList().getItems(),
			oParameters = this.oCard.getCombinedParameters();

		// Assert
		assert.ok(oListItems[0].getDescription().indexOf("Waldorf") > -1, "Card parameter 'city' should be replaced in rendered html with 'Waldorf'");
		assert.ok(oListItems[0].getDescription().indexOf("Germany") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Germany'");

		assert.strictEqual(oParameters.city, "Waldorf", "Card parameter 'city' is correct.");
		assert.strictEqual(oParameters.country, "Germany", "Card parameter 'country' is correct.");
	});

	QUnit.test("Only parameter property set", async function (assert) {
		// Arrange
		var oData = {
				"location": {
					"city": "Vratza",
					"country": "Bulgaria"
				}
			};

		// Act
		this.oCard.setParameters(oData.location);
		this.oCard.setManifest(oManifest_WithoutParameters);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItems = this.oCard.getCardContent()._getList().getItems();
		// Assert
		assert.ok(oListItems[0].getDescription().indexOf("Vratza") === -1, "Card parameter 'city' should NOT  be replaced in rendered html with 'Vratza'");
		assert.ok(oListItems[0].getDescription().indexOf("Bulgaria") === -1, "Card parameter 'country' NOT should be replaced in rendered html  with 'Bulgaria'");
	});

	QUnit.test("No parameters property set and no manifest parameters", async function (assert) {
		// Arrange
		var fnErrorSpy = sinon.spy(Log, "error");

		// Act
		this.oCard.setManifest(oManifest_WithoutParameters);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sMessage = "If parameters property is set, parameters should be described in the manifest";
		// Assert
		assert.ok(fnErrorSpy.neverCalledWith(sMessage), "There is no error logged if parameters are not set.");

		fnErrorSpy.restore();
	});

	QUnit.test("Parameters are set after card is rendered once - In manifest and overwrite from property", async function (assert) {
		// Arrange
		var oData = {
				"location": {
					"city": "Waldorf",
					"country": "Germany"
				}
			};

		this.oCard.setParameters(oData.location);
		this.oCard.setManifest(oManifest_DefaultParameters);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		var oListItems = this.oCard.getCardContent()._getList().getItems();
		assert.ok(oListItems[0].getDescription().indexOf("Waldorf") > -1, "Card parameter 'city' should be replaced in rendered html with 'Waldorf'");
		assert.ok(oListItems[0].getDescription().indexOf("Germany") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Germany'");
	});

	QUnit.test("Setting single parameter", async function (assert) {
		// Arrange
		this.oCard.setManifest(oManifest_DefaultParameters);

		await nextCardReadyEvent(this.oCard);

		// Act
		this.oCard.setParameter("city", "Tokyo");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		var oListItems = this.oCard.getCardContent()._getList().getItems();
		assert.ok(oListItems[0].getDescription().indexOf("Tokyo") > -1, "Card parameter 'city' should be replaced in rendered html with 'Tokyo'");
	});

	QUnit.test("Allow visibility change based on a parameter of type array", async function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "test.object.card.visibility",
				"type": "card"
			},
			"sap.ui": {
				"technology": "UI5"
			},
			"sap.card": {
				"type": "Object",
				"configuration": {
					"parameters": {
						"visibleFields": {
							"value": ["firstName", "companyDetails"]
						},
						"visibleItems": {
							"value": ["lastName"]
						}
					}
				},
				"content": {
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
									"label": "First Name",
									"value": "First Name",
									"visible": "{= ${parameters>/visibleFields/value}.indexOf('firstName')>-1}"
								},
								{
									"label": "Last Name",
									"value": "LastName",
									"visible": "{= ${parameters>/visibleFields/value}.indexOf('lastName')>-1}"
								}
							]
						},
						{
							"title": "Company Details",
							"visible": "{= ${parameters>/visibleFields/value}.indexOf('companyDetails')>-1}",
							"items": [
								{
									"label": "Company Name",
									"value": "Company Name"
								}
							]
						}
					]
				}
			}
		};

		var oSpy = sinon.spy(Log, "warning"),
			sWarning = "The parameter name 'visibleItems' is reserved for cards. Can not be used for creating custom parameter.";

		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getAggregation("_content"),
		oLayout = oContent.getAggregation("_content").getItems()[0];

		// Assert
		assert.ok(oSpy.calledWith(sWarning), "Warning is logged if reserved parameter name is used");
		assert.ok(oLayout.getContent()[0].getItems()[1].getVisible(), "The group item should be visible");
		assert.notOk(oLayout.getContent()[0].getItems()[3].getVisible(), "The group item should not be visible");
		assert.ok(oLayout.getContent()[1].getItems()[0].getVisible(), "The group item should not be visible");

		oSpy.restore();
	});

	QUnit.module("Card Predefined Parameters", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Predefined parameters are available as 'parameters' model values", function (assert) {
		// Arrange
		var oParameters = this.oCard.getModel("parameters").getData();

		[
			"TODAY_ISO",
			"NOW_ISO",
			"LOCALE"
		].forEach(function (sPredefinedParameter) {
			// Assert
			assert.ok(oParameters.hasOwnProperty(sPredefinedParameter), sPredefinedParameter + " should be part of the predefined parameters");
		});
	});

	QUnit.test("[Deprecated syntax] TODAY_ISO", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.parameters"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Default manifest parameters",
					"subTitle": "{{parameters.TODAY_ISO}}"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sSubtitle = this.oCard.getCardHeader()._getSubtitle().getText();

		// Assert
		assert.ok(sSubtitle !== "", "Card should have a subtitle with the now Date");
	});

	QUnit.test("TODAY_ISO", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.parameters"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Default manifest parameters",
					"subTitle": "{parameters>/TODAY_ISO}"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sSubtitle = this.oCard.getCardHeader()._getSubtitle().getText();

		// Assert
		assert.ok(sSubtitle !== "", "Card should have a subtitle with the now Date");
	});

	QUnit.test("[Deprecated Syntax] TODAY_ISO and LOCALE", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.parameters"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Default manifest parameters",
					"subTitle": "{{parameters.TODAY_ISO}} and {{parameters.LOCALE}}"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sSubtitle = this.oCard.getCardHeader()._getSubtitle().getText();

		// Assert
		assert.ok(sSubtitle.indexOf(UI5Date.getInstance().toISOString().slice(0, 10)) > -1, "Card should have a subtitle with the now Date");
		assert.ok(sSubtitle.indexOf(new Locale(Localization.getLanguageTag()).toString()) > -1, "Card should have a subtitle with the locale");
	});

	QUnit.module("Card Dynamic Parameters", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("'parameters>/visibleItems' when there is no data", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.dataHandling.card8"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": {}
				},
				"header": {
					"title": "Some title"
				},
				"content": {
					"item": {
						"title": " "
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		assert.strictEqual(this.oCard.getModel("parameters").getProperty("/visibleItems"), 0, "Property value should be 0");
	});

});