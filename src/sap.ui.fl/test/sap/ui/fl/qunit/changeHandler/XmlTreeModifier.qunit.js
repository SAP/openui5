/* global QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

// Restrict coverage to sap.ui.fl library
if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/fl]");
}

sap.ui.define([
	'sap/ui/fl/changeHandler/XmlTreeModifier'
], function(
	XmlTreeModifier
) {
	"use strict";

	jQuery.sap.registerModulePath("testComponent", "../testComponent");

	QUnit.module("The XmlTreeModifier", {
		beforeEach: function () {

			this.HBOX_ID = "hboxId";
			this.TEXT_ID = "textId";

			jQuery.sap.registerModulePath("testComponent", "../testComponent");

						this.oComponent = sap.ui.getCore().createComponent({
							name: "testComponent",
							id: "testComponent",
							"metadata": {
								"manifest": "json"
							}
						});

			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:layout="sap.ui.layout" >' +
					'<VBox>' +
						'<tooltip></tooltip>' +	//empty 0..1 aggregation
						'<Label visible="true"></Label>' + //content in default aggregation
						'<Label visible="false" design="Bold"></Label>' + //content in default aggregation, property set that has default value
					'</VBox>' +
					'<HBox id="' + this.HBOX_ID + '">' +
						'<tooltip>' +	//0..1 aggregation
							'<TooltipBase xmlns="sap.ui.core"></TooltipBase>' + //inline namespace as sap.ui.core is use case for not existing namespace
						'</tooltip>' +
						'<items>' +
							'<Text id="' + this.TEXT_ID + '"></Text>' + //content in default aggregation
						'</items>' +
					'</HBox>' +
					'<Bar tooltip="barTooltip">' + //control without default aggregation, tooltip aggregation filled with altType
					'</Bar>' +
					'<VBox id="stashedExperiments">' +
						'<Label text="visibleLabel" stashed="false"></Label>' +
						'<Label text="stashedInvisibleLabel" visible="false" stashed="true"></Label>' +
					'</VBox>' +
				'</mvc:View>';
			this.oXmlView = jQuery.sap.parseXML(this.oXmlString, "application/xml").documentElement;

		},

		afterEach: function () {
			this.oComponent.destroy();
		}
	});

	QUnit.test("the createControl processes parameters and working with default namspaces", function (assert) {
		var sButtonText = "ButtonText";
		var oButtonElement = XmlTreeModifier.createControl('sap.m.Button', this.oComponent, this.oXmlView, "testComponent---myView--MyButton", {'text' : sButtonText});
		assert.equal(oButtonElement.getAttribute("text"), sButtonText);
		assert.equal(oButtonElement.localName, "Button");
		assert.equal(oButtonElement.namespaceURI, "sap.m");
		assert.equal(oButtonElement.getAttribute("id"), "testComponent---myView--MyButton");
	});

	QUnit.test("setStash", function (assert) {
		var oVBox = this.oXmlView.childNodes[7];
		XmlTreeModifier.setStashed(oVBox, true);
		assert.strictEqual(oVBox.getAttribute("stashed"), "true", "stashed attribute can be added");

		var oVisibleLabel = oVBox.childNodes[0];
		XmlTreeModifier.setStashed(oVisibleLabel, true);
		assert.strictEqual(oVisibleLabel.getAttribute("stashed"), "true", "stashed attribute can be changed");

		var oStashedInvisibleLabel = oVBox.childNodes[1];
		XmlTreeModifier.setStashed(oStashedInvisibleLabel, false);
		assert.strictEqual(oStashedInvisibleLabel.getAttribute("stashed"), null, "stashed=false means not having it in xml as some controls behave differently if visible property is provided");
		assert.strictEqual(oStashedInvisibleLabel.getAttribute("visible"), null, "Unstash also needs to make the control visible (which is done automatically in with stash API)");
	});

	QUnit.test(" the createControl is adding missing namespaces ", function (assert) {
		var oCustomDataElement = XmlTreeModifier.createControl('sap.ui.core.CustomData', this.oComponent, this.oXmlView, "", {'key' : "someKey", "value": "someValue"});
		assert.equal(oCustomDataElement.localName, "CustomData");
		assert.equal(oCustomDataElement.namespaceURI, "sap.ui.core");
	});

	QUnit.test(" the createControl is using existing namespaces ", function (assert) {
		var oVerticalLayout = XmlTreeModifier.createControl('sap.ui.layout.VerticalLayout', this.oComponent, this.oXmlView);
		assert.equal(oVerticalLayout.localName, "VerticalLayout");
		assert.equal(oVerticalLayout.namespaceURI, "sap.ui.layout");
	});

	QUnit.test("the default aggregation is returned if aggregation node is not available", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		var aDefaultAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'items');
		assert.equal(aDefaultAggregationElements.length, 2);
		assert.equal(aDefaultAggregationElements[0].localName, "Label");
		assert.equal(aDefaultAggregationElements[0].namespaceURI, "sap.m");
		assert.equal(aDefaultAggregationElements[0].localName, "Label");
		assert.equal(aDefaultAggregationElements[0].namespaceURI, "sap.m");
	});

	QUnit.test("the default aggregation is returned if aggregation node is available", function (assert) {
		var oHBox = this.oXmlView.childNodes[1];
		var aDefaultAggregationElements = XmlTreeModifier.getAggregation(oHBox, 'items');
		assert.equal(aDefaultAggregationElements.length, 1);
		assert.equal(aDefaultAggregationElements[0].localName, "Text");
	});

	QUnit.test("the empty non default aggregation is returned ", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		var aNonDefaultAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'customData');
		assert.equal(aNonDefaultAggregationElements.length, 0);
	});

	QUnit.test("the empty non default aggregation is returned when no default aggregation exists", function (assert) {
		var oBar = this.oXmlView.childNodes[2];
		var aNonDefaultAggregationElements = XmlTreeModifier.getAggregation(oBar, 'contentRight');
		assert.equal(aNonDefaultAggregationElements.length, 0);
	});

	QUnit.test("the empty single aggregation is returning nothing", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		var vAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'tooltip');
		assert.ok(!vAggregationElements);
	});

	QUnit.test("the not in xml view available single aggregation is returning nothing", function (assert) {
		var oLabel = this.oXmlView.childNodes[0].childNodes[1];
		var vAggregationElements = XmlTreeModifier.getAggregation(oLabel, 'tooltip');
		assert.ok(!vAggregationElements);
	});

	QUnit.test("the single aggregation is returning the control node directly", function (assert) {
		var oHBox = this.oXmlView.childNodes[1];
		var oAggregationElements = XmlTreeModifier.getAggregation(oHBox, 'tooltip');
		assert.equal(oAggregationElements.localName, "TooltipBase");
		assert.equal(oAggregationElements.namespaceURI, "sap.ui.core");
	});

	QUnit.test("the altType aggregation returns the property value", function (assert) {
		var oBar = this.oXmlView.childNodes[2];
		var vAggregationElements = XmlTreeModifier.getAggregation(oBar, 'tooltip');
		assert.equal(vAggregationElements, "barTooltip");
	});

	QUnit.test("the first non default aggregation childNode is added under a newly created aggregation node ", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		var oCustomDataElement = XmlTreeModifier.createControl('sap.ui.core.CustomData', this.oComponent, this.oXmlView, "someId", {'key' : "someKey", "value": "someValue"});
		XmlTreeModifier.insertAggregation(oVBox, "customData", oCustomDataElement, 0, this.oXmlView, this.oComponent);
		assert.equal(oVBox.childNodes[3].localName, "customData", "aggregation node is appended at the end");
		assert.equal(oVBox.childNodes[3].namespaceURI, "sap.m", "aggregation node is added with parents namespaceURI");
		var aNonDefaultAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'customData');
		assert.equal(aNonDefaultAggregationElements.length, 1);
		assert.equal(aNonDefaultAggregationElements[0].localName, "CustomData");
		assert.equal(aNonDefaultAggregationElements[0].namespaceURI, "sap.ui.core");
	});
	QUnit.test("a child is added to the default aggregation ", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		var oCustomDataElement = XmlTreeModifier.createControl('sap.m.Text', this.oComponent, this.oXmlView);
		XmlTreeModifier.insertAggregation(oVBox, "items", oCustomDataElement, 0, this.oXmlView, this.oComponent);
		assert.equal(oVBox.childNodes.length, 4, "new control is added directly as child to the parent node");
		assert.equal(oVBox.childNodes[0].localName, "tooltip");
		assert.equal(oVBox.childNodes[0].namespaceURI, "sap.m");
		assert.equal(oVBox.childNodes[1].localName, "Text");
		assert.equal(oVBox.childNodes[1].namespaceURI, "sap.m");
		assert.equal(oVBox.childNodes[2].localName, "Label");
		assert.equal(oVBox.childNodes[2].namespaceURI, "sap.m");
		assert.equal(oVBox.childNodes[3].localName, "Label");
		assert.equal(oVBox.childNodes[3].namespaceURI, "sap.m");
		var aNonDefaultAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'items');
		assert.equal(aNonDefaultAggregationElements.length, 3);
		assert.equal(aNonDefaultAggregationElements[0].localName, "Text");
		assert.equal(aNonDefaultAggregationElements[0].namespaceURI, "sap.m");
		assert.equal(aNonDefaultAggregationElements[1].localName, "Label");
		assert.equal(aNonDefaultAggregationElements[1].namespaceURI, "sap.m");
		assert.equal(aNonDefaultAggregationElements[2].localName, "Label");
		assert.equal(aNonDefaultAggregationElements[2].namespaceURI, "sap.m");
	});

	QUnit.test("a child is removed from the default aggregation ", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		var oLabel = this.oXmlView.childNodes[0].childNodes[1];
		XmlTreeModifier.removeAggregation(oVBox, "items", oLabel);
		assert.equal(oVBox.childNodes.length, 2);
		assert.equal(oVBox.childNodes[0].localName, "tooltip");
		assert.equal(oVBox.childNodes[0].namespaceURI, "sap.m");
		assert.equal(oVBox.childNodes[1].localName, "Label");
		assert.equal(oVBox.childNodes[1].namespaceURI, "sap.m");
	});

	QUnit.test("removeAll from the default aggregation ", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		XmlTreeModifier.removeAllAggregation(oVBox, "items");
		assert.equal(oVBox.childNodes.length, 1);
		assert.equal(oVBox.childNodes[0].localName, "tooltip");
		assert.equal(oVBox.childNodes[0].namespaceURI, "sap.m");
	});

	QUnit.test("removeAll from the default aggregation ", function (assert) {
		var oHBox = this.oXmlView.childNodes[1];
		XmlTreeModifier.removeAllAggregation(oHBox, "items");
		assert.equal(oHBox.childNodes.length, 1);
		assert.equal(oHBox.childNodes[0].localName, "tooltip");
		assert.equal(oHBox.childNodes[0].namespaceURI, "sap.m");
	});

	QUnit.test("getVisible", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		var oVisibleLabel = oVBox.childNodes[1];
		var oInvisibleLabel = oVBox.childNodes[2];
		assert.strictEqual(XmlTreeModifier.getVisible(oVBox), true, "not stating visible in xml means visible");
		assert.strictEqual(XmlTreeModifier.getVisible(oVisibleLabel), true, "visible in xml");
		assert.strictEqual(XmlTreeModifier.getVisible(oInvisibleLabel), false, "invisible in xml");
	});

	QUnit.test("setVisible", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		XmlTreeModifier.setVisible(oVBox, false);
		assert.strictEqual(oVBox.getAttribute("visible"), "false", "visible attribute can be added");

		var oVisibleLabel = oVBox.childNodes[1];
		XmlTreeModifier.setVisible(oVisibleLabel, false);
		assert.strictEqual(oVisibleLabel.getAttribute("visible"), "false", "visible attribute can be changed");

		var oInvisibleLabel = oVBox.childNodes[2];
		XmlTreeModifier.setVisible(oInvisibleLabel, true);
		assert.strictEqual(oInvisibleLabel.getAttribute("visible"), null, "visible=true means not having it in xml as some controls behave differently if visible property is provided");
	});

	QUnit.test("getProperty returns default value if not in xml", function (assert) {
		var oVBox = this.oXmlView.childNodes[0];
		var oVisibleLabel = oVBox.childNodes[1];
		var oInvisibleLabel = oVBox.childNodes[2];
		assert.strictEqual(XmlTreeModifier.getProperty(oVisibleLabel, "design"), "Standard", "default value, property not in xml");
		assert.strictEqual(XmlTreeModifier.getProperty(oVisibleLabel, "text"), "", "default value, property not in xml");
		assert.strictEqual(XmlTreeModifier.getProperty(oInvisibleLabel, "design"), "Bold", "property from xml");
	});

	QUnit.test("_byId finds the node specified", function (assert) {
		var oExpectedHBox = this.oXmlView.childNodes[1];
		oExpectedHBox.setAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id", true);
		var oExpectedText = oExpectedHBox.childNodes[1].childNodes[0];
		oExpectedText.setAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id", true);

		var oHBox = XmlTreeModifier._byId(this.HBOX_ID, this.oXmlView);
		assert.strictEqual(oHBox, oExpectedHBox, "HBox node found");
		var oText = XmlTreeModifier._byId(this.TEXT_ID, this.oXmlView);
		assert.strictEqual(oText, oExpectedText, "Text node found");
	});
});
