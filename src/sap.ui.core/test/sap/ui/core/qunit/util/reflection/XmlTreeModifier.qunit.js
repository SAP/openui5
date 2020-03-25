/* global QUnit */
sap.ui.define([
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/util/XMLHelper",
	"sap/ui/base/Event",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/CustomData",
	"sap/ui/thirdparty/sinon-4"
],
function(
	XmlTreeModifier,
	XMLHelper,
	Event,
	JSONModel,
	CustomData,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Using the XmlTreeModifier...", {
		beforeEach: function () {
			this.HBOX_ID = "hboxId";
			this.TEXT_ID = "textId";
			this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT = "controlWithPropertyTypeObject";
			this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_2 = "controlWithPropertyTypeObject2";
			this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_3 = "controlWithPropertyTypeObject3";
			this.ID_OF_CONTROL_WITH_PROP_TYPE_ARRAY = "controlWithPropertyTypeArray";
			this.ID_OF_CONTROL_WITH_PROP_BINDING = "controlWithPropertyBinding";
			this.CHANGE_HANDLER_PATH = "path/to/changehandler/definition";

			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});

			this.oXmlString =
				'<mvc:View id="testComponent---myView" ' +
					'xmlns:mvc="sap.ui.core.mvc" ' +
					'xmlns="sap.m" ' +
					'xmlns:f="sap.f" ' +
					'xmlns:fl="sap.ui.fl">' +
					'<VBox>\n' +
						'<tooltip>\n</tooltip>' +	//empty 0..1 aggregation
						'<Label visible="true"></Label>' + //content in default aggregation
						'<Label visible="false" design="Bold"></Label>' + //content in default aggregation, property set that has default value
					'</VBox>' +
					'<HBox id="' + this.HBOX_ID + '">' +
						'<tooltip>' +	//0..1 aggregation
							'<TooltipBase xmlns="sap.ui.core"></TooltipBase>' + //inline namespace as sap.ui.core is use case for not existing namespace
						'</tooltip>' +
						'<items>\n' +
							'<Text id="' + this.TEXT_ID + '"></Text>' + //content in default aggregation
						'</items>' +
					'</HBox>' +
					'<Bar tooltip="barTooltip">' + //control without default aggregation, tooltip aggregation filled with altType
					'</Bar>\n' +
					'<VBox id="foo.' + this.HBOX_ID + '">' +
						'<Button text="Button1" id="button1"></Button>' +
						'<Button text="Button2"></Button>\n' +
						'<Button text="Button3"></Button>' +
					'</VBox>' +
					'<f:DynamicPageTitle id="title1">\n' +
						'<f:actions>\n' +
							'<Button text="Action1"></Button>\n' +
							'<Button text="Action2"></Button>\n' +
							'<Button text="Action3"></Button>' +
						'</f:actions>' +
					'</f:DynamicPageTitle>' +
					'<VBox id="vbox2">' +
						'<tooltip>\n</tooltip>' +
						'<Button text="Button1"></Button>' +
						'<Button text="Button2"></Button>' +
						'<Button text="Button3"></Button>' +
					'</VBox>' +
					'<f:DynamicPageTitle id="title2" fl:flexibility="' + this.CHANGE_HANDLER_PATH + '">' +
						'<f:actions>' +
							'<Button text="Action1"></Button>' +
							'<Button text="Action2"></Button>' +
							'<Button text="Action3"></Button>' +
						'</f:actions>' +
						'<f:snappedContent>' +
							'<Text text="text1"></Text>' +
							'<Text text="text2"></Text>' +
							'<Text text="text3"></Text>' +
						'</f:snappedContent>' +
					'</f:DynamicPageTitle>' +
					'<VBox id="stashedExperiments">' +
						'<Label text="visibleLabel" stashed="false"></Label>' +
						'<Label text="stashedInvisibleLabel" visible="false" stashed="true"></Label>' +
					'</VBox>' +
					'<QuickViewPage id="' + this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT + '" crossAppNavCallback="\\{&quot;key&quot;:&quot;value&quot;\\}" />' +
					'<QuickViewPage id="' + this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_2 + '" crossAppNavCallback="\{&quot;key&quot;:&quot;value&quot;\}" />' +
					'<QuickViewPage id="' + this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_3 + '" crossAppNavCallback="{\'key\': \'value\'}" />' +
					'<QuickViewPage id="' + this.ID_OF_CONTROL_WITH_PROP_BINDING + '" crossAppNavCallback="{/foo}" />' +
					'<QuickViewPage id="' + this.ID_OF_CONTROL_WITH_PROP_TYPE_ARRAY + '" crossAppNavCallback="[\\{&quot;key&quot;:&quot;value&quot;\\}]" />' +
				'</mvc:View>';
			this.oXmlView = XMLHelper.parse(this.oXmlString, "application/xml").documentElement;

			this.oXmlString2 =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns:fl="sap.ui.fl" xmlns:core="sap.ui.core" xmlns="sap.m" >' +
				'<HBox id="hbox1">' +
					'<items>' +
						'<Button id="button1" text="Button1" />' +
						'<Button id="button2" text="Button2" />' +
						'<Button id="button3" text="Button3" />' +
						'<core:ExtensionPoint name="ExtensionPoint1">' +
							'<Label id="default-label1" text="Extension point label1 - default content" />' +
						'</core:ExtensionPoint>' +
						'<Label id="label1" text="TestLabel1" />' +
					'</items>' +
				'</HBox>' +
				'<Panel id="panel">' +
						'<core:ExtensionPoint name="ExtensionPoint2" />' +
						'<Label id="label2" text="TestLabel2" />' +
						'<core:ExtensionPoint name="ExtensionPoint3" />' +
				'</Panel>' +
				'<HBox id="hbox2">' +
					'<Button id="button4" text="Button4" />' +
					'<Button id="button5" text="Button5" />' +
					'<core:ExtensionPoint name="ExtensionPoint3" />' +
					'<Label id="label3" text="TestLabel3" />' +
				'</HBox>' +
			'</mvc:View>';
			this.oXmlView2 = XMLHelper.parse(this.oXmlString2, "application/xml").documentElement;
		},
		afterEach: function () {
			sandbox.restore();
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("the createControl is processing parameters and is working with default namespaces", function (assert) {
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

		QUnit.test(" the createControl is called for async return value", function (assert) {
			var oPromise = XmlTreeModifier.createControl('sap.ui.layout.VerticalLayout', this.oComponent, this.oXmlView, undefined, undefined, true);
			assert.ok(oPromise instanceof Promise, "then a promise is returned");
			return oPromise
			.then(function(oVerticalLayout) {
				assert.equal(oVerticalLayout.localName, "VerticalLayout", "then the promise contains the requested control");
			});
		});

		QUnit.test(" the createControl is called for async return value and control is already created", function (assert) {
			sandbox.stub(XmlTreeModifier, 'bySelector').returns(true);
			var oPromise = XmlTreeModifier.createControl('sap.ui.layout.VerticalLayout', this.oComponent, this.oXmlView, undefined, undefined, true);
			assert.ok(oPromise instanceof Promise, "then a promise is returned");
			return oPromise
			.catch(function(oError) {
				assert.equal(oError.message, "Can't create a control with duplicated ID undefined", "then the promise is rejected with the correct error message");
			});
		});

		QUnit.test(" the createControl is called for sync return value and control is already created", function (assert) {
			sandbox.stub(XmlTreeModifier, 'bySelector').returns(true);
			assert.throws(function() {
				XmlTreeModifier.createControl('sap.ui.layout.VerticalLayout', this.oComponent, this.oXmlView);
			}, /Can't create a control with duplicated ID undefined/,
			"then the right exception is thrown");
		});

		QUnit.test("the default aggregation is returned if aggregation node is not available", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aDefaultAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'items');
			assert.equal(aDefaultAggregationElements.length, 2);
			assert.equal(aDefaultAggregationElements[0].localName, "Label");
			assert.equal(aDefaultAggregationElements[0].namespaceURI, "sap.m");
			assert.equal(aDefaultAggregationElements[0].localName, "Label");
			assert.equal(aDefaultAggregationElements[0].namespaceURI, "sap.m");
		});

		QUnit.test("the default aggregation is returned if aggregation node is available", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			var aDefaultAggregationElements = XmlTreeModifier.getAggregation(oHBox, 'items');
			assert.equal(aDefaultAggregationElements.length, 1);
			assert.equal(aDefaultAggregationElements[0].localName, "Text");
		});

		QUnit.test("the empty non default aggregation is returned ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aNonDefaultAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'customData');
			assert.equal(aNonDefaultAggregationElements.length, 0);
		});

		QUnit.test("the empty non default aggregation is returned when no default aggregation exists", function (assert) {
			var oBar = XmlTreeModifier._children(this.oXmlView)[2];
			var aNonDefaultAggregationElements = XmlTreeModifier.getAggregation(oBar, 'contentRight');
			assert.equal(aNonDefaultAggregationElements.length, 0);
		});

		QUnit.test("the empty single aggregation is returning nothing", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var vAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'tooltip');
			assert.ok(!vAggregationElements);
		});

		QUnit.test("the not in xml view available single aggregation is returning nothing", function (assert) {
			var oLabel = XmlTreeModifier._children(this.oXmlView)[0].childNodes[2];
			var vAggregationElements = XmlTreeModifier.getAggregation(oLabel, 'tooltip');
			assert.ok(!vAggregationElements);
		});

		QUnit.test("the single aggregation is returning the control node directly", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			var oAggregationElements = XmlTreeModifier.getAggregation(oHBox, 'tooltip');
			assert.equal(oAggregationElements.localName, "TooltipBase");
			assert.equal(oAggregationElements.namespaceURI, "sap.ui.core");
		});

		QUnit.test("the altType aggregation returns the property value", function (assert) {
			var oBar = XmlTreeModifier._children(this.oXmlView)[2];
			var vAggregationElements = XmlTreeModifier.getAggregation(oBar, 'tooltip');
			assert.equal(vAggregationElements, "barTooltip");
		});

		QUnit.test("the first non default aggregation childNode is added under a newly created aggregation node ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var oCustomDataElement = XmlTreeModifier.createControl('sap.ui.core.CustomData', this.oComponent, this.oXmlView, "someId", {'key' : "someKey", "value": "someValue"});
			XmlTreeModifier.insertAggregation(oVBox, "customData", oCustomDataElement, 0, this.oXmlView, this.oComponent);
			assert.equal(XmlTreeModifier._children(oVBox)[3].localName, "customData", "aggregation node is appended at the end");
			assert.equal(XmlTreeModifier._children(oVBox)[3].namespaceURI, "sap.m", "aggregation node is added with parents namespaceURI");
			var aNonDefaultAggregationElements = XmlTreeModifier.getAggregation(oVBox, 'customData');
			assert.equal(aNonDefaultAggregationElements.length, 1);
			assert.equal(aNonDefaultAggregationElements[0].localName, "CustomData");
			assert.equal(aNonDefaultAggregationElements[0].namespaceURI, "sap.ui.core");
		});
		QUnit.test("a child is added to the default aggregation ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var oCustomDataElement = XmlTreeModifier.createControl('sap.m.Text', this.oComponent, this.oXmlView);
			XmlTreeModifier.insertAggregation(oVBox, "items", oCustomDataElement, 0, this.oXmlView, this.oComponent);
			var aChildNodes = XmlTreeModifier._children(oVBox);
			assert.equal(aChildNodes.length, 4, "new control is added directly as child to the parent node");
			assert.equal(aChildNodes[0].localName, "tooltip");
			assert.equal(aChildNodes[0].namespaceURI, "sap.m");
			assert.equal(aChildNodes[1].localName, "Text");
			assert.equal(aChildNodes[1].namespaceURI, "sap.m");
			assert.equal(aChildNodes[2].localName, "Label");
			assert.equal(aChildNodes[2].namespaceURI, "sap.m");
			assert.equal(aChildNodes[3].localName, "Label");
			assert.equal(aChildNodes[3].namespaceURI, "sap.m");
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
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var oLabel = XmlTreeModifier._children(this.oXmlView)[0].childNodes[2];
			XmlTreeModifier.removeAggregation(oVBox, "items", oLabel);
			var aChildNodes = XmlTreeModifier._children(oVBox);
			assert.equal(aChildNodes.length, 2);
			assert.equal(aChildNodes[0].localName, "tooltip");
			assert.equal(aChildNodes[0].namespaceURI, "sap.m");
			assert.equal(aChildNodes[1].localName, "Label");
			assert.equal(aChildNodes[1].namespaceURI, "sap.m");
		});

		QUnit.test("a child is removed from the aggregation and then destroyed + destroy without removing", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var oLabel = XmlTreeModifier._children(this.oXmlView)[0].childNodes[2];
			XmlTreeModifier.removeAggregation(oVBox, "items", oLabel);
			var aChildNodes = XmlTreeModifier._children(oVBox);
			assert.equal(aChildNodes.length, 2);
			assert.equal(aChildNodes[0].localName, "tooltip");
			assert.equal(aChildNodes[0].namespaceURI, "sap.m");
			assert.equal(aChildNodes[1].localName, "Label");
			assert.equal(aChildNodes[1].namespaceURI, "sap.m");

			// destroy after remove
			XmlTreeModifier.destroy(oLabel);
			// nothing changes
			aChildNodes = XmlTreeModifier._children(oVBox);
			assert.equal(aChildNodes.length, 2);
			assert.equal(aChildNodes[0].localName, "tooltip");
			assert.equal(aChildNodes[0].namespaceURI, "sap.m");
			assert.equal(aChildNodes[1].localName, "Label");
			assert.equal(aChildNodes[1].namespaceURI, "sap.m");

			// destroy the other label
			oLabel = aChildNodes[1];
			XmlTreeModifier.destroy(oLabel);

			// the label is removed
			aChildNodes = XmlTreeModifier._children(oVBox);
			assert.equal(aChildNodes.length, 1);
			assert.equal(aChildNodes[0].localName, "tooltip");
			assert.equal(aChildNodes[0].namespaceURI, "sap.m");
		});

		QUnit.test("removeAll from the default aggregation ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			XmlTreeModifier.removeAllAggregation(oVBox, "items");
			var aChildNodes = XmlTreeModifier._children(oVBox);
			assert.equal(aChildNodes.length, 1);
			assert.equal(aChildNodes[0].localName, "tooltip");
			assert.equal(aChildNodes[0].namespaceURI, "sap.m");
		});

		QUnit.test("removeAll from the default aggregation ", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			XmlTreeModifier.removeAllAggregation(oHBox, "items");
			assert.equal(oHBox.childNodes.length, 1);
			assert.equal(oHBox.childNodes[0].localName, "tooltip");
			assert.equal(oHBox.childNodes[0].namespaceURI, "sap.m");
		});

		QUnit.test("getVisible", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);
			var oVisibleLabel = aChildNodes[1];
			var oInvisibleLabel = aChildNodes[2];
			assert.strictEqual(XmlTreeModifier.getVisible(oVBox), true, "not stating visible in xml means visible");
			assert.strictEqual(XmlTreeModifier.getVisible(oVisibleLabel), true, "visible in xml");
			assert.strictEqual(XmlTreeModifier.getVisible(oInvisibleLabel), false, "invisible in xml");
		});

		QUnit.test("setVisible", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			XmlTreeModifier.setVisible(oVBox, false);
			assert.strictEqual(oVBox.getAttribute("visible"), "false", "visible attribute can be added");

			var oVisibleLabel = aChildNodes[1];
			XmlTreeModifier.setVisible(oVisibleLabel, false);
			assert.strictEqual(oVisibleLabel.getAttribute("visible"), "false", "visible attribute can be changed");

			var oInvisibleLabel = aChildNodes[2];
			XmlTreeModifier.setVisible(oInvisibleLabel, true);
			assert.strictEqual(oInvisibleLabel.getAttribute("visible"), null, "visible=true means not having it in xml as some controls behave differently if visible property is provided");
		});

		QUnit.test("setStash", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[7];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			XmlTreeModifier.setStashed(oVBox, true);
			assert.strictEqual(oVBox.getAttribute("stashed"), "true", "stashed attribute can be added");

			var oVisibleLabel = aChildNodes[0];
			XmlTreeModifier.setStashed(oVisibleLabel, true);
			assert.strictEqual(oVisibleLabel.getAttribute("stashed"), "true", "stashed attribute can be changed");

			var oStashedInvisibleLabel = aChildNodes[1];
			XmlTreeModifier.setStashed(oStashedInvisibleLabel, false);
			assert.strictEqual(oStashedInvisibleLabel.getAttribute("stashed"), null, "stashed=false means not having it in xml as some controls behave differently if visible property is provided");
			assert.strictEqual(oStashedInvisibleLabel.getAttribute("visible"), null, "Unstash also needs to make the control visible (which is done automatically in with stash API)");
		});

		QUnit.test("getProperty returns default value if not in xml", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			var oVisibleLabel = aChildNodes[1];
			var oInvisibleLabel = aChildNodes[2];
			assert.strictEqual(XmlTreeModifier.getProperty(oVisibleLabel, "design"), "Standard", "default value, property not in xml");
			assert.strictEqual(XmlTreeModifier.getProperty(oVisibleLabel, "text"), "", "default value, property not in xml");
			assert.strictEqual(XmlTreeModifier.getProperty(oInvisibleLabel, "design"), "Bold", "property from xml");
		});

		QUnit.test("getProperty for properties of type object (double escaped case)", function (assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			var mData = XmlTreeModifier.getProperty(oControl, "crossAppNavCallback");
			assert.deepEqual(mData, { key : "value"}, "returns json value");
		});

		QUnit.test("getProperty for properties of type object (single escaped case)", function (assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_2, this.oXmlView);
			var mData = XmlTreeModifier.getProperty(oControl, "crossAppNavCallback");
			assert.deepEqual(mData, { key : "value"}, "returns json value");
		});

		QUnit.test("getProperty for properties of type object (single quote case)", function (assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_3, this.oXmlView);
			var mData = XmlTreeModifier.getProperty(oControl, "crossAppNavCallback");
			assert.deepEqual(mData, { key : "value"}, "returns json value");
		});

		QUnit.test("getProperty for properties of type object with an array (curly braces escaped case)", function (assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_ARRAY, this.oXmlView);
			var mData = XmlTreeModifier.getProperty(oControl, "crossAppNavCallback");
			assert.deepEqual(mData, [{ "key" : "value"}], "returns array value");
		});

		QUnit.test("getProperty for properties controlled by a binding", function(assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_BINDING, this.oXmlView);
			var mData = XmlTreeModifier.getProperty(oControl, "crossAppNavCallback");
			assert.equal(mData, undefined, "nothing is returned");
		});

		QUnit.test("setProperty for properties of type object", function (assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			XmlTreeModifier.setProperty(oControl, "crossAppNavCallback", { key2 : 2});

			var sStringifiedData = oControl.getAttribute("crossAppNavCallback");
			assert.strictEqual(sStringifiedData, '{"key2":2}', "returns json value stringified and escaped");
		});

		QUnit.test("setProperty for properties of type array", function (assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			XmlTreeModifier.setProperty(oControl, "crossAppNavCallback", [{ key2 : 2}]);

			var sStringifiedData = oControl.getAttribute("crossAppNavCallback");
			assert.strictEqual(sStringifiedData, '[{"key2":2}]', "returns json value stringified and escaped");
		});

		QUnit.test("getPropertyBinding for bound properties", function(assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_BINDING, this.oXmlView);
			var mData = XmlTreeModifier.getPropertyBinding(oControl, "crossAppNavCallback");
			var oBindingInfo = {
				path: "/foo"
			};
			assert.deepEqual(mData, oBindingInfo , "the binding info object is returned");
		});

		QUnit.test("getPropertyBinding for unbound properties of type object", function(assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			var mData = XmlTreeModifier.getPropertyBinding(oControl, "crossAppNavCallback");
			assert.equal(mData, undefined, "nothing is returned");
		});

		QUnit.test("getPropertyBinding for unbound properties of type string", function(assert) {
			var oControl = XmlTreeModifier._byId("button1", this.oXmlView);
			var mData = XmlTreeModifier.getPropertyBinding(oControl, "text");
			assert.equal(mData, undefined, "nothing is returned");
		});

		QUnit.test("getPropertyBinding for empty properties", function(assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_BINDING, this.oXmlView);
			var mData = XmlTreeModifier.getPropertyBinding(oControl, "crossAppNavCallback2");
			assert.equal(mData, undefined, "nothing is returned");
		});

		QUnit.test("setPropertyBinding with a binding string", function(assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			XmlTreeModifier.setPropertyBinding(oControl, "crossAppNavCallback", "{/foo}");
			assert.equal(oControl.getAttribute("crossAppNavCallback"), "{/foo}", "the string was set");
		});

		QUnit.test("setPropertyBinding with a binding info object", function(assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			var oValueBefore = oControl.getAttribute("crossAppNavCallback");
			assert.throws(function() {
				XmlTreeModifier.setPropertyBinding(oControl, "crossAppNavCallback", {path: "foo"});
			}, Error, "the function throws an error");
			assert.deepEqual(oValueBefore, oControl.getAttribute("crossAppNavCallback"), "the property was not changed");
		});

		function getVisibleLabel(oXmlView){
			var oVBox = XmlTreeModifier._children(oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			return aChildNodes[1];
		}

		QUnit.test("applySettings", function (assert) {
			var oVisibleLabel = getVisibleLabel(this.oXmlView);

			XmlTreeModifier.applySettings(oVisibleLabel, {
				design: "Bold", //simple property type string
				required: true, //property type is not string
				labelFor: this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT //association
			});
			assert.strictEqual(XmlTreeModifier.getProperty(oVisibleLabel, "design"), "Bold", "the design value is changed from applySettings");
			assert.strictEqual(XmlTreeModifier.getProperty(oVisibleLabel, "required"), true, "the required value is changed from applySettings");

			var sAssociatedControlId = XmlTreeModifier.getAssociation(oVisibleLabel, "labelFor");
			assert.strictEqual(sAssociatedControlId, this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT);
		});

		QUnit.test("applySetting with association as object", function (assert) {
			var oVisibleLabel = getVisibleLabel(this.oXmlView);
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			XmlTreeModifier.applySettings(oVisibleLabel, {
				labelFor: oControl //association
			});
			var sAssociatedControlId = XmlTreeModifier.getAssociation(oVisibleLabel, "labelFor");
			assert.strictEqual(sAssociatedControlId, this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT);
		});

		QUnit.test("applySetting with property of type object", function (assert) {
			var oControl = XmlTreeModifier._byId(this.ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			var mData = { key2 : 2};
			XmlTreeModifier.applySettings(oControl, {crossAppNavCallback: mData});
			assert.deepEqual(XmlTreeModifier.getProperty(oControl, "crossAppNavCallback"), mData, "the property of type object returns in JSON notation");
		});

		QUnit.test("isPropertyInitial", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			var oVisibleLabel = aChildNodes[1];
			var oInvisibleLabel = aChildNodes[2];
			assert.strictEqual(XmlTreeModifier.isPropertyInitial(oVisibleLabel, "design"), true, "initial as property not in xml");
			assert.strictEqual(XmlTreeModifier.isPropertyInitial(oVisibleLabel, "text"),true, "initial as property not in xml");
			assert.strictEqual(XmlTreeModifier.isPropertyInitial(oInvisibleLabel, "design"), false, "not initial as property is from xml");
		});

		QUnit.test("unbindProperty removes the attribute in xml to restore default", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			var oVisibleLabel = aChildNodes[1];
			XmlTreeModifier.unbindProperty(oVisibleLabel, "visible");
			assert.strictEqual(oVisibleLabel.getAttribute("visible"), null, "default value, property not in xml");
		});

		//label has single association labelFor
		QUnit.test("setAssociation and removeAssociation works with single association and control id passed", function(assert) {
			var oControl = getVisibleLabel(this.oXmlView);

			XmlTreeModifier.setAssociation(oControl, "labelFor", this.HBOX_ID);
			assert.strictEqual(XmlTreeModifier.getAssociation(oControl, "labelFor"), this.HBOX_ID);
		});

		QUnit.test("setAssociation works with single association and control instance passed", function(assert) {
			var oControl = getVisibleLabel(this.oXmlView);
			var oAssociatedControl = XmlTreeModifier._byId(this.HBOX_ID, this.oXmlView);

			XmlTreeModifier.setAssociation(oControl, "labelFor", oAssociatedControl);
			assert.strictEqual(XmlTreeModifier.getAssociation(oControl, "labelFor"), this.HBOX_ID, "associated control instance got converted to its ID");
		});

		QUnit.test("byId finds the node specified", function (assert) {
			var oExpectedHBox = XmlTreeModifier._children(this.oXmlView)[1];
			oExpectedHBox.setAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id", true);
			var oExpectedText = oExpectedHBox.childNodes[1].childNodes[1];
			oExpectedText.setAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id", true);

			var oHBox = XmlTreeModifier._byId(this.HBOX_ID, this.oXmlView);
			assert.strictEqual(oHBox, oExpectedHBox, "HBox node found");
			var oText = XmlTreeModifier._byId(this.TEXT_ID, this.oXmlView);
			assert.strictEqual(oText, oExpectedText, "Text node found");
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 1 - control in aggregation 0..1 passed as parameter", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];

			var oTooltip = oHBox.childNodes[0].childNodes[0];

			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oTooltip), 0, "The function returned the correct index.");
		});

		function getButton(oXmlView) {
			var oVBox = XmlTreeModifier._children(oXmlView)[3];
			return oVBox.lastElementChild;
		}
		QUnit.test("findIndexInParentAggregation returns the correct value: case 2 - default aggregation only in xml tree", function (assert) {
			var oButton = getButton(this.oXmlView);

			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oButton), 2, "The function returned the correct index.");
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 3 - named aggregation only in xml tree", function (assert) {
			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[4];
			var oButton = XmlTreeModifier._children(oDynamicPageTitle)[0].lastElementChild;

			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oButton), 2, "The function returned the correct index.");
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 4 - mixed node with aggregation and default aggregation", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[5];
			var oButton = oVBox.lastElementChild;

			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oButton), 2, "The function returned the correct index.");
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 5 - mixed node with aggregation and named aggregation", function (assert) {
			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[6];
			var oButton = oDynamicPageTitle.childNodes[0].lastElementChild;
			var oText = oDynamicPageTitle.childNodes[1].childNodes[1];

			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oButton), 2, "The function returned the correct index.");
			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oText), 1, "The function returned the correct index.");
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 7 - when stashed controls exist", function (assert) {
			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[6];
			var oFirstButton = oDynamicPageTitle.childNodes[0].firstElementChild;
			var oLastButton = oDynamicPageTitle.childNodes[0].lastElementChild;
			XmlTreeModifier.setProperty(oFirstButton, "stashed", true);
			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oLastButton), 1, "The function returned the correct index.");
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 8 - when extension point exists", function (assert) {
			var oHBox1 = XmlTreeModifier._children(this.oXmlView2)[0];
			var oPanel = XmlTreeModifier._children(this.oXmlView2)[1];
			var oExtensionPoint1 = oHBox1.childNodes[0].childNodes[3];
			var oExtensionPoint2 = oPanel.childNodes[0];

			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oExtensionPoint1), 3, "The function returned the correct index.");
			assert.strictEqual(XmlTreeModifier.findIndexInParentAggregation(oExtensionPoint2), 0, "The function returned the correct index.");
		});

		QUnit.test("getParentAggregationName returns the correct name: ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0],
				oLabel = XmlTreeModifier._children(oVBox)[1];

			var oHBox = XmlTreeModifier._children(this.oXmlView)[1],
				oTooltip = oHBox.childNodes[0].childNodes[0],
				oText = oHBox.childNodes[1].childNodes[0];

			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[6],
				oButton = oDynamicPageTitle.childNodes[0].childNodes[0],
				oText2 = oDynamicPageTitle.childNodes[1].childNodes[0];

			assert.strictEqual(XmlTreeModifier.getParentAggregationName(oLabel, oVBox), "items", "The function returned the correct name - 'items'.");
			assert.strictEqual(XmlTreeModifier.getParentAggregationName(oTooltip, oHBox), "tooltip", "The function returned the correct name - 'tooltip'.");
			assert.strictEqual(XmlTreeModifier.getParentAggregationName(oText, oHBox), "items", "The function returned the correct name - 'items'.");
			assert.strictEqual(XmlTreeModifier.getParentAggregationName(oButton, oDynamicPageTitle), "actions", "The function returned the correct name - 'actions'.");
			assert.strictEqual(XmlTreeModifier.getParentAggregationName(oText2, oDynamicPageTitle), "snappedContent", "The function returned the correct name - 'snappedContent'.");
		});

		QUnit.test("when getParent is called for control inside an extension point", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView2)[0];
			var oExtensionPoint1 = oHBox.childNodes[0].childNodes[3];
			var oLabel = oExtensionPoint1.childNodes[0];
			assert.strictEqual(XmlTreeModifier.getParent(oLabel), oExtensionPoint1, "then the extension point is returned as parent");
		});

		QUnit.test("when getParent is called for control inside an control node", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[3];
			var oButton = XmlTreeModifier._children(oVBox)[0];
			assert.strictEqual(XmlTreeModifier.getParent(oButton), oVBox, "then the parent control is returned as parent");
		});

		QUnit.test("when getParent is called for control inside an aggregation node", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			var oTooltip = XmlTreeModifier._children(oHBox)[0];
			var oTooltipBase = XmlTreeModifier._children(oTooltip)[0];
			assert.strictEqual(XmlTreeModifier.getParent(oTooltipBase), oHBox, "then the parent control is returned as parent");
		});

		QUnit.test("when getChangeHandlerModule is called for control instance on which changeHandler is defined", function (assert) {
			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[6];
			assert.strictEqual(XmlTreeModifier.getChangeHandlerModulePath(oDynamicPageTitle), this.CHANGE_HANDLER_PATH, "then the changehandler path defined at the control instance is returned");
		});

		QUnit.test("when getBingingTemplate is called for an aggregation without nodes", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[5];
			assert.notOk(XmlTreeModifier.getBindingTemplate(oVBox, "tooltip"), "then nothing is returned");
		});

		QUnit.test("when getBingingTemplate is called for an aggregation with multiple nodes", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			assert.notOk(XmlTreeModifier.getBindingTemplate(oVBox, "content"), "then nothing is returned");
		});

		QUnit.test("when getBingingTemplate is called for an aggregation that has a single real control, but text nodes", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			assert.ok(XmlTreeModifier.getBindingTemplate(oHBox, "items"), "then content inside item is returned");
		});

		QUnit.test("when destroy is called for a control that is directly under the parent node", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			var oText = oHBox.childNodes[1].childNodes[0];
			var iChildNodesBeforeDestroy = oHBox.childNodes[1].childNodes.length;
			XmlTreeModifier.destroy(oText);
			assert.equal(oHBox.childNodes[1].childNodes.length, iChildNodesBeforeDestroy - 1, "then the parent node has one child node less");
		});

		QUnit.test("when instantiateFragment is called with a duplicate ID", function(assert) {
			var sFragment =
				'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
					'<Button id="' + this.HBOX_ID + '" text="Button1"></Button>' +
				'</core:FragmentDefinition>';
			assert.throws(function() {
				XmlTreeModifier.instantiateFragment(sFragment, "foo", this.oXmlView);
			}, Error("The following ID is already in the view: foo." + this.HBOX_ID),
			"then the right exception is thrown");
		});

		QUnit.test("when instantiateFragment is called with a FragmentDefinition", function(assert) {
			var sFragment =
			'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
				'<Button id="button123" text="Button1"></Button>' +
				'<Button id="button1234" text="Button2"></Button>' +
			'</core:FragmentDefinition>';

			var aControls = XmlTreeModifier.instantiateFragment(sFragment, "foo", this.oXmlView);
			assert.equal(aControls.length, 2, "there are 2 controls returned");
			assert.equal(aControls[0].getAttribute("id"), "foo.button123", "the ID got prefixed");
			assert.equal(aControls[1].getAttribute("id"), "foo.button1234", "the ID got prefixed");
		});

		QUnit.test("when instantiateFragment is called with a Control", function(assert) {
			var sFragment =
				'<sap.m.Button id="button123" text="Button1" />';

			var aControls = XmlTreeModifier.instantiateFragment(sFragment, "foo", this.oXmlView);
			assert.equal(aControls.length, 1, "there is 1 control returned");
			assert.equal(aControls[0].getAttribute("id"), "foo.button123", "the ID got prefixed");
		});

		QUnit.test("when getExtensionPointInfo is called", function (assert) {
			var oExtensionPointInfo1 = XmlTreeModifier.getExtensionPointInfo("ExtensionPoint1", this.oXmlView2);
			assert.equal(oExtensionPointInfo1.parent.getAttribute("id"), "hbox1", "then the returned object contains the parent control");
			assert.equal(oExtensionPointInfo1.aggregationName, "items", "and the aggregation name");
			assert.equal(oExtensionPointInfo1.index, 4, "and the index");
			assert.ok(Array.isArray(oExtensionPointInfo1.defaultContent), "and the defaultContent is an Array");
			assert.equal(oExtensionPointInfo1.defaultContent.length, 1, "and the defaultContent contains one item");
			assert.equal(oExtensionPointInfo1.defaultContent[0].getAttribute("id"), "default-label1", "and the default label is returned");

			var oExtensionPointInfo2 = XmlTreeModifier.getExtensionPointInfo("ExtensionPoint2", this.oXmlView2);
			assert.equal(oExtensionPointInfo2.parent.getAttribute("id"), "panel", "then the returned object contains the parent control");
			assert.equal(oExtensionPointInfo2.aggregationName, "content", "and the aggregation name");
			assert.equal(oExtensionPointInfo2.index, 1, "and the index");
			assert.ok(Array.isArray(oExtensionPointInfo2.defaultContent), "and the defaultContent is an Array");
			assert.equal(oExtensionPointInfo2.defaultContent.length, 0, "and the defaultContent contains one item");
		});

		QUnit.test("when getExtensionPointInfo is called with an extension point which is not on the view", function (assert) {
			var oExtensionPointInfo = XmlTreeModifier.getExtensionPointInfo("notAvailableExtensionPoint", this.oXmlView2);
			assert.notOk(oExtensionPointInfo, "then nothing is returned");
		});

		QUnit.test("when getExtensionPointInfo is called with an extension point which exists multiple times on the view", function (assert) {
			var oExtensionPointInfo = XmlTreeModifier.getExtensionPointInfo("ExtensionPoint3", this.oXmlView2);
			assert.notOk(oExtensionPointInfo, "then nothing is returned");
		});

		function _getDelegate(mControlsDelegateInfo){
			var oControl = XmlTreeModifier._byId("hbox2",this.oXmlView2);
			if (mControlsDelegateInfo) {
				oControl.setAttributeNS("sap.ui.fl","delegate", JSON.stringify(mControlsDelegateInfo));
			}
			return XmlTreeModifier.getFlexDelegate(oControl);
		}

		QUnit.test("when getFlexDelegate is called for a control without a delegate", function (assert) {
			var mDelegateInfo = _getDelegate.call(this);
			assert.notOk(mDelegateInfo, "then nothing is returned");
		});

		QUnit.test("when getFlexDelegate is called for a control delegate and payload", function (assert) {
			var mControlsDelegateInfo = {
				name : "some/Delegate",
				payload : {
					path : "/foo",
					modelName : "bar",
					custom : "prop"
				}
			};
			var mDelegateInfo = _getDelegate.call(this, mControlsDelegateInfo);
			assert.deepEqual(mDelegateInfo, mControlsDelegateInfo, "then everything is returned as json structure");
		});

		QUnit.test("when getFlexDelegate is called for a control delegate without payload", function (assert) {
			var mControlsDelegateInfo = {
				name : "some/Delegate"
			};
			var mDelegateInfo = _getDelegate.call(this, mControlsDelegateInfo);
			assert.deepEqual(mDelegateInfo, {
				name : "some/Delegate",
				payload : {}
			}, "then an empty payload is returned");
		});
	});

	QUnit.module("Events", {
		before: function () {
			this.createView = function (oXmlView) {
				return sap.ui.xmlview({
					viewContent: XMLHelper.serialize(oXmlView)
				});
			};
		},
		beforeEach: function () {
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});

			this.oXmlString = (
				'<mvc:View ' +
					'id="testComponent---myView" ' +
					'xmlns:mvc="sap.ui.core.mvc" ' +
					'xmlns="sap.m"' +
				'>' +
						'<Button text="Button1" id="button1"></Button>' +
				'</mvc:View>'
			);
			this.oXmlView = XMLHelper.parse(this.oXmlString, "application/xml").documentElement;

			this.oButton = XmlTreeModifier._byId('button1', this.oXmlView);

			this.oSpy1 = sandbox.spy();
			window.$sap__qunit_presshandler1 = this.oSpy1;

			this.oSpy2 = sandbox.spy();
			window.$sap__qunit_presshandler2 = this.oSpy2;
		},
		afterEach: function () {
			if (this.oView) {
				this.oView.destroy();
			}
			this.oComponent.destroy();
			delete window.$sap__qunit_presshandler1;
			delete window.$sap__qunit_presshandler2;
			sandbox.restore();
		}
	}, function () {
		QUnit.test("attachEvent() — basic case", function (assert) {
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1");

			this.oView = this.createView(this.oXmlView);
			this.oView.byId("button1").firePress();

			assert.strictEqual(this.oSpy1.callCount, 1);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event)).callCount, 1);
		});

		QUnit.test("attachEvent() — basic case with parameters", function (assert) {
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1", ["param0", "param1", { foo: "bar" }]);

			this.oView = this.createView(this.oXmlView);
			this.oView.byId("button1").firePress();

			assert.strictEqual(this.oSpy1.callCount, 1);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event), ["param0", "param1", { foo: "bar" }]).callCount, 1);
		});

		QUnit.test("attachEvent() — two different event handlers with different set of parameters for the same event name", function (assert) {
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1", ["param0", "param1"]);
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler2", ["param2", "param3"]);

			this.oView = this.createView(this.oXmlView);
			this.oView.byId("button1").firePress();

			assert.strictEqual(this.oSpy1.callCount, 1);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event), ["param0", "param1"]).callCount, 1);
			assert.strictEqual(this.oSpy2.callCount, 1);
			assert.strictEqual(this.oSpy2.withArgs(sinon.match.instanceOf(Event), ["param2", "param3"]).callCount, 1);
		});

		QUnit.test("attachEvent() — attempt to attach non-existent function", function (assert) {
			assert.throws(
				function () {
					XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_non_existent_handler");
				}.bind(this),
				/function is not found/
			);
		});

		QUnit.test("attachEvent() — two equal event handlers with a different set of parameters", function (assert) {
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1", ["param0", "param1"]);
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1", ["param2", "param3"]);

			this.oView = this.createView(this.oXmlView);
			this.oView.byId("button1").firePress();

			assert.strictEqual(this.oSpy1.callCount, 2);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event), ["param0", "param1"]).callCount, 1);
			assert.strictEqual(this.oSpy1.withArgs(sinon.match.instanceOf(Event), ["param2", "param3"]).callCount, 1);
		});

		QUnit.test("detachEvent() — basic case", function (assert) {
			assert.notOk(this.oButton.hasAttribute("press"));

			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1");
			XmlTreeModifier.detachEvent(this.oButton, "press", "$sap__qunit_presshandler1");

			assert.notOk(this.oButton.hasAttribute("press"));

			this.oView = this.createView(this.oXmlView);
			this.oView.byId("button1").firePress();

			assert.strictEqual(this.oSpy1.callCount, 0);
		});

		QUnit.test("detachEvent() — basic case", function (assert) {
			assert.notOk(this.oButton.hasAttribute("press"));

			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1");
			XmlTreeModifier.detachEvent(this.oButton, "press", "$sap__qunit_presshandler1");

			assert.notOk(this.oButton.hasAttribute("press"));

			this.oView = this.createView(this.oXmlView);
			this.oView.byId("button1").firePress();

			assert.strictEqual(this.oSpy1.callCount, 0);
		});

		QUnit.test("detachEvent() — three event handlers, two of them are with a different set of parameters", function (assert) {
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler1");
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler2", ["param0", "param1"]);
			XmlTreeModifier.attachEvent(this.oButton, "press", "$sap__qunit_presshandler2", ["param2", "param3"]);
			XmlTreeModifier.detachEvent(this.oButton, "press", "$sap__qunit_presshandler2");

			this.oView = this.createView(this.oXmlView);
			this.oView.byId("button1").firePress();

			assert.strictEqual(this.oSpy1.callCount, 1);
			assert.strictEqual(this.oSpy2.callCount, 1);
			assert.strictEqual(this.oSpy2.withArgs(sinon.match.instanceOf(Event), ["param2", "param3"]).callCount, 1);
		});

		QUnit.test("detachEvent() — attempt to detach non-existent function", function (assert) {
			assert.throws(
				function () {
					XmlTreeModifier.detachEvent(this.oButton, "press", "$sap__qunit_non_existent_handler");
				}.bind(this),
				/function is not found/
			);
		});
	});

	QUnit.module("Aggregation binding", {
		before: function () {
			this.createView = function (oXmlView) {
				return sap.ui.xmlview({
					viewContent: XMLHelper.serialize(oXmlView)
				});
			};
		},
		beforeEach: function () {
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});

			this.oXmlString = (
				'<mvc:View ' +
					'id="testComponent---myView" ' +
					'xmlns:mvc="sap.ui.core.mvc" ' +
					'xmlns="sap.m"' +
				'>' +
						'<Button text="Button1" id="button1"></Button>' +
				'</mvc:View>'
			);
			this.oXmlView = XMLHelper.parse(this.oXmlString, "application/xml").documentElement;

			this.oButton = XmlTreeModifier._byId('button1', this.oXmlView);

			this.oModel = new JSONModel();
			this.oModel.setData({
				customData: [{
					key: "foo",
					value: "bar"
				}]
			});

			this.sModelName = "someModel";
		},
		afterEach: function () {
			if (this.oView) {
				this.oView.destroy();
			}
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("bindAggregation - complex binding via binding string", function (assert) {
			XmlTreeModifier.bindAggregation(
				this.oButton,
				"customData",
				{
					path: this.sModelName + ">/customData",
					template: XmlTreeModifier.createControl(
						"sap.ui.core.CustomData",
						this.oComponent,
						this.oXmlView,
						{
							id: XmlTreeModifier.getId(this.oButton) + '-customData'
						},
						{
							key: "{path: '" + this.sModelName + ">key'}",
							value: "{path: '" + this.sModelName + ">value'}"
						}
					)
				},
				this.oXmlView
			);

			this.oView = this.createView(this.oXmlView);
			this.oView.setModel(this.oModel, this.sModelName);
			this.oButtonInstance = this.oView.byId("button1");

			assert.strictEqual(this.oButtonInstance.getCustomData()[0].getKey(), "foo");
			assert.strictEqual(this.oButtonInstance.getCustomData()[0].getValue(), "bar");
		});

		QUnit.test("bindAggregation - complex binding via plain object", function (assert) {
			XmlTreeModifier.bindAggregation(
				this.oButton,
				"customData",
				{
					path: this.sModelName + ">/customData",
					template: XmlTreeModifier.createControl(
						"sap.ui.core.CustomData",
						this.oComponent,
						this.oXmlView,
						{
							id: XmlTreeModifier.getId(this.oButton) + '-customData'
						},
						{
							key: {
								path: this.sModelName + ">key"
							},
							value: {
								path: this.sModelName + ">value"
							}
						}
					)
				},
				this.oXmlView
			);

			this.oView = this.createView(this.oXmlView);
			this.oView.setModel(this.oModel, this.sModelName);
			this.oButtonInstance = this.oView.byId("button1");

			assert.strictEqual(this.oButtonInstance.getCustomData()[0].getKey(), "foo");
			assert.strictEqual(this.oButtonInstance.getCustomData()[0].getValue(), "bar");
		});

		QUnit.test("unbindAggregation", function (assert) {
			XmlTreeModifier.bindAggregation(
				this.oButton,
				"customData",
				{
					path: this.sModelName + ">/customData",
					template: XmlTreeModifier.createControl(
						"sap.ui.core.CustomData",
						this.oComponent,
						this.oXmlView,
						{
							id: XmlTreeModifier.getId(this.oButton) + '-customData'
						},
						{
							key: "{path: '" + this.sModelName + ">key'}",
							value: "{path: '" + this.sModelName + ">value'}"
						}
					)
				},
				this.oXmlView
			);

			XmlTreeModifier.unbindAggregation(this.oButton, "customData");

			this.oView = this.createView(this.oXmlView);
			this.oView.setModel(this.oModel, this.sModelName);
			this.oButtonInstance = this.oView.byId("button1");

			assert.strictEqual(this.oButtonInstance.getCustomData().length, 0);
		});
	});
});
