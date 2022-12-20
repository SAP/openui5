/*global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/Label",
	"sap/ui/core/Core",
	"sap/ui/core/UIArea",
	"sap/ui/core/mvc/HTMLView",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/serializer/ViewSerializer",
	"sap/ui/qunit/utils/createAndAppendDiv"
],
	function (Log, Button, Image, Label, Core, UIArea, HTMLView, XMLView, ViewSerializer, createAndAppendDiv) {
		"use strict";

		createAndAppendDiv(["htmlViewArea", "xmlViewArea", "xmlViewWithoutControllerArea"]);

		var checkView = function (oView, assert) {

			var oLayout = oView.getContent()[0];

			var aContent = oLayout.getContent();

			assert.equal(aContent.length, 4);

			var oImage = aContent[0];
			assert.equal(oImage instanceof Image, true);
			assert.equal(oImage.getSrc(), "some/image/url.png");
			assert.equal(oImage.getAlt(), "alternative text for image");

			var oNestedView = aContent[1];
			assert.equal(oNestedView instanceof HTMLView || oNestedView instanceof XMLView, true);
			assert.equal(oNestedView.getContent()[0] instanceof Button, true);

			var oLabel = aContent[2];
			assert.equal(oLabel instanceof Label, true);
			assert.equal(oLabel.getText(), "Label");

			var oButton = aContent[3];
			assert.equal(oButton instanceof Button, true);
			assert.equal(oButton.getText(), "Save");

		};

		QUnit.module("ViewSerializer", {
			beforeEach: function () {
				this.oHtmlView = sap.ui.htmlview("MyTestHtmlView", "serializer.view.TestHtml");
				this.oHtmlView.placeAt("htmlViewArea");
				this.oXmlView = sap.ui.xmlview("MyTestXmlView", "serializer.view.TestXml");
				this.oXmlView.placeAt("xmlViewArea");
				this.oXmlViewWithoutController = sap.ui.xmlview("MyTestXmlViewWithoutController", "serializer.view.TestViewWithoutController");
				this.oXmlViewWithoutController.placeAt("xmlViewWithoutControllerArea");
			},
			afterEach: function () {
				if (this.oHtmlView) {
					this.oHtmlView.destroy();
				}
				if (this.oXmlView) {
					this.oXmlView.destroy();
				}
				if (this.oXmlViewWithoutController) {
					this.oXmlViewWithoutController.destroy();
				}
				if (this.oNestedView) {
					this.oNestedView.destroy();
				}
			}
		});

		QUnit.test("Serialize, Re-Instantiate and Check an HTML View", function (assert) {
			var oViewSerializer = new ViewSerializer(UIArea.registry.get("htmlViewArea"), null, "sap.m");

			var mHTMLViews = oViewSerializer.serializeToHTML();
			var sHTMLResult = mHTMLViews["serializer.view.TestHtml"];
			var mXMLViews = oViewSerializer.serializeToXML();
			var sXMLResult = mXMLViews["serializer.view.TestHtml"];

			Log.info(sHTMLResult);
			Log.info(sXMLResult);
			var oView = sap.ui.htmlview("restoredHtmlView1", {
				viewContent: sHTMLResult
			});
			checkView(oView, assert);
			var oView2 = sap.ui.xmlview("restoredxmlView1", {
				viewContent: sXMLResult
			});
			checkView(oView2, assert);
		});

		QUnit.test("Serialize, Re-Instantiate and Check an XML View", function (assert) {
			var oViewSerializer = new ViewSerializer(UIArea.registry.get("xmlViewArea"), null, "sap.m");

			var mHTMLViews = oViewSerializer.serializeToHTML();
			var sHTMLResult = mHTMLViews["serializer.view.TestXml"];
			var mXMLViews = oViewSerializer.serializeToXML();
			var sXMLResult = mXMLViews["serializer.view.TestXml"];

			Log.info(sHTMLResult);
			Log.info(sXMLResult);
			var oView = sap.ui.htmlview("restoredHtmlView2", {
				viewContent: sHTMLResult
			});
			checkView(oView, assert);
			var oView2 = sap.ui.xmlview("restoredxmlView2", {
				viewContent: sXMLResult
			});
			checkView(oView2, assert);
		});

		QUnit.test("Serialize, Check if nested XMLView within the HTML View doesn't get converted", function (assert) {
			var oViewSerializer = new ViewSerializer(UIArea.registry.get("htmlViewArea"), null, "sap.m");

			var mXMLViews = oViewSerializer.serialize();
			var sResult = mXMLViews["serializer.view.TestHtml"];
			assert.equal(sResult.indexOf("<template") === 0, true);

			var sNestedXMLResult = mXMLViews["serializer.view.NestedXmlView"];
			assert.equal(sNestedXMLResult.indexOf("<template") === -1, true);
		});

		QUnit.test("Serialize, Check if nested HTMLView within the XML View doesn't get converted", function (assert) {
			var oViewSerializer = new ViewSerializer(UIArea.registry.get("xmlViewArea"), null, "sap.m");

			var mXMLViews = oViewSerializer.serialize();
			var sResult = mXMLViews["serializer.view.TestXml"];
			assert.equal(sResult.indexOf("<template") === -1, true);

			var sNestedHTMLResult = mXMLViews["serializer.view.NestedHtmlView"];
			assert.equal(sNestedHTMLResult.indexOf("<template") === 0, true);
		});

		QUnit.test("Serialize, Check conversion of nested XMLView within the HTML View", function (assert) {
			var oViewSerializer = new ViewSerializer(UIArea.registry.get("htmlViewArea"), null, "sap.m");

			var mXMLViews = oViewSerializer.serializeToXML();
			var sResult = mXMLViews["serializer.view.TestHtml"];
			assert.equal(sResult.indexOf("<template") === -1, true);

			var sNestedXMLResult = mXMLViews["serializer.view.NestedXmlView"];
			assert.equal(sNestedXMLResult.indexOf("<template") === -1, true);
		});

		QUnit.test("Serialize, Check conversion of nested HTMLView within the XML View", function (assert) {
			var oViewSerializer = new ViewSerializer(UIArea.registry.get("xmlViewArea"), null, "sap.m");

			var mXMLViews = oViewSerializer.serializeToHTML();
			var sResult = mXMLViews["serializer.view.TestXml"];
			assert.equal(sResult.indexOf("<template") === 0, true);

			var sNestedHTMLResult = mXMLViews["serializer.view.NestedHtmlView"];
			assert.equal(sNestedHTMLResult.indexOf("<template") === 0, true);
		});

		QUnit.test("Serialize, Check if a view that has no controller is still serializable", function (assert) {
			var oViewSerializer = new ViewSerializer(UIArea.registry.get("xmlViewWithoutControllerArea"), null, "sap.m");

			var mXMLViews = oViewSerializer.serializeToHTML();
			var sResult = mXMLViews["serializer.view.TestViewWithoutController"];
			assert.equal(sResult.indexOf("<template") === 0, true);

			mXMLViews = oViewSerializer.serializeToXML();
			sResult = mXMLViews["serializer.view.TestViewWithoutController"];
			assert.equal(sResult.indexOf("<template") === -1, true);

			mXMLViews = oViewSerializer.serialize();
			sResult = mXMLViews["serializer.view.TestViewWithoutController"];
			assert.equal(sResult.indexOf("<template") === -1, true);
		});
	});