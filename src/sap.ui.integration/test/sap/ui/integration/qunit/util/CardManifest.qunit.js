/* global QUnit, sinon */

sap.ui.define(["sap/ui/integration/util/CardManifest", "sap/ui/core/Manifest"], function (CardManifest, Manifest) {
	"use strict";

	var oJson = {
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
						"date2": "Some formatted string {NOW_ISO} and some more {TODAY_ISO}"
					},
					{
						"id": "{{id}}"
					},
					"{{text}}",
					"{NOW_ISO}"
				]
			}
		}
	};

	QUnit.module("CardManifest - constructor");

	QUnit.test("Passing an object", function (assert) {

		// Act
		var oManifest = new CardManifest(oJson);

		// Assert
		assert.ok(oManifest, "Should have successfully created a manifest.");
		assert.ok(Object.isFrozen(oManifest.oJson), "Manifest should have frozen internal JSON.");
		assert.ok(Object.isFrozen(oManifest.oJson["sap.card"]), "Manifest internal JSON should have frozen nested levels.");

		// Cleanup
		oManifest.destroy();
	});

	QUnit.test("Passing an empty object", function (assert) {

		// Act
		var oManifest = new CardManifest();

		// Assert
		assert.notOk(oManifest._oManifest, "Should NOT have _oManifest reference.");
		assert.notOk(oManifest.oJson, "Should NOT have oJson reference.");

		// Cleanup
		oManifest.destroy();
	});

	QUnit.module("CardManifest - public methods");

	QUnit.test("getJson", function (assert) {

		// Arrange
		var oManifest = new CardManifest(oJson);

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
		var oManifest = new CardManifest(oJson);

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

	QUnit.test("load without manifestUrl", function (assert) {

		// Arrange
		var oManifest = new CardManifest();

		// Act & Assert
		assert.throws(function () {
			oManifest.load();
		}, "Should throw an error when no manifestUrl is passed.");

		// Cleanup
		oManifest.destroy();
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
		var oManifest = new CardManifest();

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
			assert.notOk(oManifest.get("/sap.card/header/subTitle").indexOf("{TODAY_ISO}") > -1, "Should have replaced the placeholder inside the subTitle.");
			assert.equal(oManifest.get("/sap.card/content/items/2/id"), sTranslatedText, "Should have translated the item id.");
			assert.notOk(oManifest.get("/sap.card/content/items/1/date").indexOf("{NOW_ISO}") > -1, "Should have replaced the placeholder inside the item date.");
			assert.notOk(oManifest.get("/sap.card/content/items/1/date2").indexOf("{NOW_ISO}") > -1, "Should have replaced the placeholder inside the item date2.");
			assert.notOk(oManifest.get("/sap.card/content/items/1/date2").indexOf("{TODAY_ISO}") > -1, "Should have replaced the placeholder inside the item date2.");
			assert.equal(oManifest.get("/sap.card/content/items/3"), sTranslatedText, "Should have translated the item.");
			assert.notOk(oManifest.get("/sap.card/content/items/4").indexOf("{NOW_ISO}") > -1, "Should have replaced the placeholder inside the item.");

			// Cleanup
			oManifest.destroy();
			Manifest.load.restore();
			Manifest.prototype._loadI18n.restore();
			done();
		});
	});
});