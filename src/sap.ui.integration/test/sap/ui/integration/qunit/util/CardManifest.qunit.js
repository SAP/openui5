/* global QUnit, sinon */

sap.ui.define(["sap/ui/integration/util/Manifest", "sap/ui/core/Manifest", "sap/base/Log"], function (CardManifest, Manifest, Log) {
	"use strict";

	var oJson = {
		"sap.card": {
			"type": "Object",
			"configuration": {
				"parameters": {
					"city": {
						"value": "Sofia"
					},
					"country": {
						"value": "Bulgaria"
					}
				}
			},
			"header": {
				"data": {
					"url": "someurltotest"
				},
				"title": "{{title}}",
				"subTitle": "{TODAY_ISO}"
			},
			"content": {
				"items": [
					{
						"id": "item1"
					},
					{
						"id": "item2",
						"date": "{NOW_ISO}",
						"date2": "Some formatted string {{parameters.NOW_ISO}} and some more {{parameters.TODAY_ISO}} {{parameters.city}}, {{parameters.country}}"
					},
					{
						"id": "{{id}}"
					},
					"{{text}}",
					"{{parameters.NOW_ISO}}"
				]
			}
		}
	},
	oManifestWithOutPrameters = {
		"sap.card": {
			"type": "Object",
			"header": {
				"data": {
					"url": "someurltotest"
				},
				"title": "{{title}}",
				"subTitle": "{TODAY_ISO}"
			},
			"content": {
				"items": [
					{
						"id": "item1"
					},
					{
						"id": "item2",
						"date": "{NOW_ISO}",
						"date2": "Some formatted string {{parameters.NOW_ISO}} and some more {{parameters.TODAY_ISO}} {{parameters.city}}, {{parameters.country}}"
					},
					{
						"id": "{{id}}"
					},
					"{{text}}",
					"{{parameters.NOW_ISO}}"
				]
			}
		}
	},
	oManifestWithDataSources = {
		"sap.app": {
			"id": "someid",
			"type": "card",
			"dataSources": {
				"purchaseOrders": {
					"uri": "someUri",
					"type": "OData",
					"settings": {
						"odataVersion": "2.0"
					}
				}
			}
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"request": {
						"url": "{{dataSources.purchaseOrders.uri}}"
					},
					"path": "/value"
				},
				"item": {
					"title": "{ShipName}"
				}
			}
		}
	};

	QUnit.module("CardManifest - constructor");

	QUnit.test("Passing an object", function (assert) {

		// Act
		var oManifest = new CardManifest("sap.card", oJson);

		// Assert
		assert.ok(oManifest, "Should have successfully created a manifest.");
		assert.ok(Object.isFrozen(oManifest.oJson), "Manifest should have frozen internal JSON.");
		assert.ok(Object.isFrozen(oManifest.oJson["sap.card"]), "Manifest internal JSON should have frozen nested levels.");

		// Cleanup
		oManifest.destroy();
	});

	QUnit.test("Passing an empty object", function (assert) {

		// Act
		var oManifest = new CardManifest("sap.card");

		// Assert
		assert.notOk(oManifest._oManifest, "Should NOT have _oManifest reference.");
		assert.notOk(oManifest.oJson, "Should NOT have oJson reference.");

		// Cleanup
		oManifest.destroy();
	});

	QUnit.module("CardManifest - public methods");

	QUnit.test("getJson", function (assert) {

		// Arrange
		var oManifest = new CardManifest("sap.card", oJson);

		// Act
		var oManifestJson = oManifest.getJson();

		// Assert
		assert.ok(oManifestJson, "Should return a JSON.");
		assert.ok(oManifestJson["sap.card"], "Return value should have sap.card property.");
		assert.notOk(Object.isFrozen(oManifestJson), "Should return an unfrozen copy of the JSON.");

		// Cleanup
		oManifest.destroy();
	});

	QUnit.test("get", function (assert) {

		// Arrange
		var oManifest = new CardManifest("sap.card", oJson);

		// Act
		var oCard = oManifest.get("/sap.card");
		var sUrl = oManifest.get("/sap.card/header/data/url");
		var sId = oManifest.get("/sap.card/content/items/0/id");

		// Assert
		assert.ok(typeof oCard === "object", "Should return sap.card object.");
		assert.equal(sUrl, oJson["sap.card"].header.data.url, "Should return correct value for path.");
		assert.equal(sId, oJson["sap.card"].content.items[0].id, "Should return correct value for path.");

		// Cleanup
		oManifest.destroy();
	});

	QUnit.test("load without manifestUrl and base URL", function (assert) {

		// Arrange
		var done = assert.async();
		var oManifest = new CardManifest("sap.card");

		// Act & Assert
		oManifest.load().then(function () {
			assert.ok(true, "Should load successfully when no manifestUrl and no base URL");

			// Cleanup
			oManifest.destroy();
			done();
		});
	});

	QUnit.test("load", function (assert) {

		// Arrange
		var done = assert.async();
		var sTranslatedText = "translated";
		var oResourceBundle = {
			getText: function () {
				return sTranslatedText;
			}
		};
		var oManifest = new CardManifest("sap.card");

		sinon.stub(Manifest, "load").callsFake(function () {
			return Promise.resolve(new Manifest(oJson, { process: false }));
		});
		sinon.stub(Manifest.prototype, "_loadI18n").callsFake(function () {
			return Promise.resolve(oResourceBundle);
		});

		// Act
		oManifest.load({ manifestUrl: "someurl" }).then(function () {

			// Assert
			assert.ok(oManifest.oJson, "Should have created a JSON.");
			assert.ok(Object.isFrozen(oManifest.oJson), "Should have frozen the JSON.");
			assert.equal(oManifest.get("/sap.card/header/title"), sTranslatedText, "Should have translated the title.");
			assert.notOk(oManifest.get("/sap.card/header/subTitle").indexOf("{{parameters.TODAY_ISO}}") > -1, "Should have replaced the placeholder inside the subTitle.");
			assert.equal(oManifest.get("/sap.card/content/items/2/id"), sTranslatedText, "Should have translated the item id.");
			assert.notOk(oManifest.get("/sap.card/content/items/1/date").indexOf("{{parameters.NOW_ISO}}") > -1, "Should have replaced the placeholder inside the item date.");
			assert.notOk(oManifest.get("/sap.card/content/items/1/date2").indexOf("{{parameters.NOW_ISO}}") > -1, "Should have replaced the placeholder inside the item date2.");
			assert.notOk(oManifest.get("/sap.card/content/items/1/date2").indexOf("{{parameters.TODAY_ISO}}") > -1, "Should have replaced the placeholder inside the item date2.");
			assert.equal(oManifest.get("/sap.card/content/items/3"), sTranslatedText, "Should have translated the item.");
			assert.notOk(oManifest.get("/sap.card/content/items/4").indexOf("{{parameters.NOW_ISO}}") > -1, "Should have replaced the placeholder inside the item.");

			// Cleanup
			oManifest.destroy();
			Manifest.load.restore();
			Manifest.prototype._loadI18n.restore();
			done();
		});
	});

	QUnit.module("CardManifest - static methods");

	QUnit.test("#_processPlaceholder", function (assert) {
		// Arrange
		var mParameters = {
			"someKey": {
				"value": "someValue"
			},
			"someOtherKey": {
				"value": {
					"subvalue": "Other value"
				}
			}
		};
		var mDataSources = {
			"invoiceRemote": {
				"uri": "someUri"
			}
		};

		// Assert
		assert.strictEqual(CardManifest._processPlaceholder("no placeholder", mParameters, mDataSources), "no placeholder", "Should not replace anything if there are no placeholders.");
		assert.strictEqual(CardManifest._processPlaceholder("{{}}", mParameters, mDataSources), "{{}}", "Should not replace anything if there is nothing in the placeholders.");
		assert.strictEqual(CardManifest._processPlaceholder("{{parameters.someKey}} and {{dataSources.invoiceRemote.uri}}", mParameters, mDataSources), "someValue and someUri",
							"Should replace parameters and dataSources properly");
		assert.strictEqual(CardManifest._processPlaceholder("{{parameters.someKey}} and {{dataSources.invoiceRemote.uri}}", {}, {}), "{{parameters.someKey}} and {{dataSources.invoiceRemote.uri}}",
							"Should NOT replace anything if parameters and and dataSources are not given");
		assert.strictEqual(CardManifest._processPlaceholder("{parameters.someKey} and dataSources.invoiceRemote", mParameters, mDataSources), "{parameters.someKey} and dataSources.invoiceRemote",
							"Should NOT replace anything out of placeholders");
		assert.strictEqual(CardManifest._processPlaceholder("{{parameters.someKey}} {{parameters.someOtherKey.subvalue}} {{dataSources.invoiceRemote.uri}} {{dataSources.invoiceRemote.uri}}", mParameters, mDataSources),
							"someValue Other value someUri someUri", "All matches should be replaced.");
		assert.strictEqual(CardManifest._processPlaceholder("{{dataSources}} text", mParameters, mDataSources), "{{dataSources}} text", "Nothing should be replaced.");
	});

	QUnit.module("Manifest parameters", {
		beforeEach: function () {

			this.oManifest = new CardManifest("sap.card", oJson);
			this.oManifestWhitoutParams = new CardManifest("sap.card", oManifestWithOutPrameters);

			this.oManifestParameter = {
				"city": {
					"value": "Sofia"
				},
				"country": {
					"value": "Bulgaria"
				}
			};

			this.oParameter = {
				"city": "Vratza"
			};
		},
		afterEach: function () {
			this.oManifest.destroy();
			this.oManifest = null;
			this.oManifestWhitoutParams.destroy();
			this.oManifestWhitoutParams = null;
			this.oManifestParameter = null;
			this.oParameter = null;
		}
	});

	QUnit.test("_syncParameters return correct object with default parameters", function (assert) {

		// Act
		var oSyncParametersResult = this.oManifest._syncParameters(null, this.oManifestParameter);

		//Assert
		assert.strictEqual(oSyncParametersResult, this.oManifestParameter, "Should return the correct object.");
	});

	QUnit.test("_syncParameters return correct object with overwritten parameters parameters", function (assert) {

		// Act
		var oSyncParametersResult = this.oManifest._syncParameters(this.oParameter, this.oManifestParameter);

		//Assert
		assert.strictEqual(oSyncParametersResult.city.value, "Vratza", "Should return the correct city value.");
		assert.strictEqual(oSyncParametersResult.country.value, "Bulgaria", "Should return the correct country value.");
	});

	QUnit.test("processParameters - parameters in the property, but not in the manifest", function (assert) {

		// Arrange
		var oLogSpy = sinon.spy(Log, "error");

		// Act
		this.oManifestWhitoutParams.processParameters(this.oManifestParameter);

		// Assert
		assert.ok(oLogSpy.calledOnce, "An error should be logged");

		// Cleanup
		oLogSpy.restore();
	});


	QUnit.test("processParameters - parameters in the property, but not in the manifest", function (assert) {

		// Arrange
		var oSyncParametersSpy = sinon.spy(this.oManifest, "_syncParameters"),
			oProcessManifestSpy = sinon.spy(this.oManifest, "processManifest");

		// Act
		this.oManifest.processParameters(this.oParameter);

		// Assert
		assert.ok(oSyncParametersSpy.calledOnce, "_syncParameters should be called");
		assert.ok(oProcessManifestSpy.calledOnce, "processManifest should be called");

		// Cleanup
		oSyncParametersSpy.restore();
		oProcessManifestSpy.restore();
	});

	QUnit.module("Manifest dataSources", {
		beforeEach: function () {
			this.oManifest = new CardManifest("sap.card", oManifestWithDataSources);
		},
		afterEach: function () {
			this.oManifest.destroy();
			this.oManifest = null;
		}
	});

	QUnit.test("Process 'dataSources' placeholder", function (assert) {
		// Act
		this.oManifest.processManifest();

		// Assert
		assert.strictEqual(this.oManifest.oJson["sap.card"].content.data.request.url, "someUri", "Placeholder with 'dataSources' should have been replaced correctly.");
	});
});