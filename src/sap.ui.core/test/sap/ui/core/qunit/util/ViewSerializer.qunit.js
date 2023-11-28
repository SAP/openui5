/*global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/Label",
	"sap/ui/core/UIArea",
	"sap/ui/core/UIAreaRegistry",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/serializer/ViewSerializer",
	"sap/ui/qunit/utils/createAndAppendDiv"
],
	function (Log, Button, Image, Label, UIArea, UIAreaRegistry, XMLView, ViewSerializer, createAndAppendDiv) {
		"use strict";

		createAndAppendDiv(["xmlViewArea", "xmlViewWithoutControllerArea"]);

		var checkView = function (oView, assert) {

			var oLayout = oView.getContent()[0];

			var aContent = oLayout.getContent();

			assert.equal(aContent.length, 3);

			var oImage = aContent[0];
			assert.equal(oImage instanceof Image, true);
			assert.equal(oImage.getSrc(), "some/image/url.png");
			assert.equal(oImage.getAlt(), "alternative text for image");

			var oLabel = aContent[1];
			assert.equal(oLabel instanceof Label, true);
			assert.equal(oLabel.getText(), "Label");

			var oButton = aContent[2];
			assert.equal(oButton instanceof Button, true);
			assert.equal(oButton.getText(), "Save");

		};

		QUnit.module("ViewSerializer", {
			beforeEach: function () {
				return Promise.all([
					XMLView.create({
						id: "MyTestXmlView",
						viewName: "serializer.view.TestXml"
					}),
					XMLView.create({
						id: "MyTestXmlViewWithoutController",
						viewName: "serializer.view.TestViewWithoutController"
					})
				]).then(function(aViews) {
					this.oXmlView = aViews[0];
					this.oXmlView.placeAt("xmlViewArea");

					this.oXmlViewWithoutController = aViews[1];
					this.oXmlViewWithoutController.placeAt("xmlViewWithoutControllerArea");
				}.bind(this));
			},
			afterEach: function () {
				if (this.oXmlView) {
					this.oXmlView.destroy();
				}
				if (this.oXmlViewWithoutController) {
					this.oXmlViewWithoutController.destroy();
				}
			}
		});

		QUnit.test("Serialize, Re-Instantiate and Check an XML View", function (assert) {
			var oViewSerializer = new ViewSerializer(UIAreaRegistry.get("xmlViewArea"), null, "sap.m");

			var mXMLViews = oViewSerializer.serializeToXML();
			var sXMLResult = mXMLViews["serializer.view.TestXml"];

			Log.info(sXMLResult);

			return XMLView.create({
				id: "restoredxmlView2",
				definition: sXMLResult
			}).then(function(oView) {
				checkView(oView, assert);
			});
		});

		QUnit.test("Serialize, Check if a view that has no controller is still serializable", function (assert) {
			var oViewSerializer = new ViewSerializer(UIAreaRegistry.get("xmlViewWithoutControllerArea"), null, "sap.m");

			var mXMLViews = oViewSerializer.serializeToXML();
			var sResult = mXMLViews["serializer.view.TestViewWithoutController"];
			assert.equal(sResult.indexOf("<template") === -1, true);

			mXMLViews = oViewSerializer.serialize();
			sResult = mXMLViews["serializer.view.TestViewWithoutController"];
			assert.equal(sResult.indexOf("<template") === -1, true);
		});
	});