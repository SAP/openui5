/* global QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

// Restrict coverage to sap.ui.fl library
if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/fl]");
}

sap.ui.define([
	'sap/ui/fl/changeHandler/XmlTreeModifier'
],
function(
	XmlTreeModifier
) {
	"use strict";

	QUnit.module("Using the XmlTreeModifier...", {
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
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:f="sap.f" xmlns:layout="sap.ui.layout">' +
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
					'<VBox id="vbox1">' +
						'<Button text="Button1"></Button>' +
						'<Button text="Button2"></Button>' +
						'<Button text="Button3"></Button>' +
					'</VBox>' +
					'<f:DynamicPageTitle id="title1">' +
						'<actions>' +
							'<Button text="Action1"></Button>' +
							'<Button text="Action2"></Button>' +
							'<Button text="Action3"></Button>' +
						'</actions>' +
					'</f:DynamicPageTitle>' +
					'<VBox id="vbox2">' +
						'<tooltip></tooltip>' +
						'<Button text="Button1"></Button>' +
						'<Button text="Button2"></Button>' +
						'<Button text="Button3"></Button>' +
					'</VBox>' +
					'<f:DynamicPageTitle id="title2">' +
						'<actions>' +
							'<Button text="Action1"></Button>' +
							'<Button text="Action2"></Button>' +
							'<Button text="Action3"></Button>' +
						'</actions>' +
						'<snappedContent>' +
							'<text text="text1"></text>' +
							'<text text="text2"></text>' +
							'<text text="text3"></text>' +
						'</snappedContent>' +
					'</f:DynamicPageTitle>' +
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

	QUnit.test("findIndexInParentAggregation returns the correct value: case 1 - control in aggregation 0..1 passed as parameter", function (assert) {
		var oHBox = this.oXmlView.childNodes[1];
		var oTooltip = oHBox.childNodes[0].childNodes[0];

		assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oTooltip), 0, "The function returned the correct index.");
	});

	QUnit.test("findIndexInParentAggregation returns the correct value: case 2 - default aggregation only in xml tree", function (assert) {
		var oVBox = this.oXmlView.childNodes[3];
		var oButton = oVBox.lastElementChild;

		assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oButton), 2, "The function returned the correct index.");
	});

	QUnit.test("findIndexInParentAggregation returns the correct value: case 3 - named aggregation only in xml tree", function (assert) {
		var oDynamicPageTitle = this.oXmlView.childNodes[4];
		var oButton = oDynamicPageTitle.childNodes[0].lastElementChild;

		assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oButton), 2, "The function returned the correct index.");
	});

	QUnit.test("findIndexInParentAggregation returns the correct value: case 4 - mixed node with aggregation and default aggregation", function (assert) {
		var oVBox = this.oXmlView.childNodes[5];
		var oButton = oVBox.lastElementChild;

		assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oButton), 2, "The function returned the correct index.");
	});

	QUnit.test("findIndexInParentAggregation returns the correct value: case 5 - mixed node with aggregation and named aggregation", function (assert) {
		var oDynamicPageTitle = this.oXmlView.childNodes[6];
		var oButton = oDynamicPageTitle.childNodes[0].lastElementChild;
		var oText = oDynamicPageTitle.childNodes[1].childNodes[1];

		assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oButton), 2, "The function returned the correct index.");
		assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oText), 1, "The function returned the correct index.");
	});

	QUnit.test("_getParentAggregationName returns the correct name: ", function (assert) {
		var oVBox = this.oXmlView.childNodes[0],
			oLabel = oVBox.childNodes[1];

		var oHBox = this.oXmlView.childNodes[1],
			oTooltip = oHBox.childNodes[0].childNodes[0],
			oText = oHBox.childNodes[1].childNodes[0];

		var oDynamicPageTitle = this.oXmlView.childNodes[6],
			oButton = oDynamicPageTitle.childNodes[0].childNodes[0],
			oText2 = oDynamicPageTitle.childNodes[1].childNodes[0];

		assert.strictEqual(XmlTreeModifier._getParentAggregationName(oVBox, oLabel), "items", "The function returned the correct name - 'items'.");
		assert.strictEqual(XmlTreeModifier._getParentAggregationName(oHBox, oTooltip), "tooltip", "The function returned the correct name - 'tooltip'.");
		assert.strictEqual(XmlTreeModifier._getParentAggregationName(oHBox, oText), "items", "The function returned the correct name - 'items'.");
		assert.strictEqual(XmlTreeModifier._getParentAggregationName(oDynamicPageTitle, oButton), "actions", "The function returned the correct name - 'actions'.");
		assert.strictEqual(XmlTreeModifier._getParentAggregationName(oDynamicPageTitle, oText2), "snappedContent", "The function returned the correct name - 'snappedContent'.");
	});
});