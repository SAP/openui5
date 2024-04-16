/* global QUnit */
sap.ui.define([
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/util/XMLHelper",
	"sap/ui/base/Event",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	XmlTreeModifier,
	XMLHelper,
	Event,
	Component,
	XMLView,
	JSONModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var HBOX_ID = "hboxId";
	var TEXT_ID = "textId";
	var ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT = "controlWithPropertyTypeObject";
	var ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_2 = "controlWithPropertyTypeObject2";
	var ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_3 = "controlWithPropertyTypeObject3";
	var ID_OF_CONTROL_WITH_PROP_TYPE_ARRAY = "controlWithPropertyTypeArray";
	var ID_OF_CONTROL_WITH_PROP_BINDING = "controlWithPropertyBinding";
	var CHANGE_HANDLER_PATH = "path/to/changehandler/definition";
	var ID_OF_CONTROL_WITH_CUSTOM_DATA = "controlWithCustomData";
	var ID_OF_CONTROL_WITH_INLINE_CUSTOM_DATA = "controlWithInlineCustomData";

	QUnit.module("Using the XmlTreeModifier...", {
		beforeEach: function () {

			this.oXmlString =
				'<mvc:View ' +
					'xmlns:mvc="sap.ui.core.mvc" ' +
					'xmlns="sap.m" ' +
					'xmlns:f="sap.f" ' +
					'xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1" ' +
					'xmlns:fl="sap.ui.fl">' +
					'<VBox>\n' +
						'<tooltip>\n</tooltip>' +	//empty 0..1 aggregation
						'<Label visible="true"></Label>' + //content in default aggregation
						'<Label visible="false" design="Bold"></Label>' + //content in default aggregation, property set that has default value
					'</VBox>' +
					'<HBox id="' + HBOX_ID + '">' +
						'<tooltip>' +	//0..1 aggregation
							'<TooltipBase xmlns="sap.ui.core"></TooltipBase>' + //inline namespace as sap.ui.core is use case for not existing namespace
						'</tooltip>' +
						'<items>\n' +
							'<Text id="' + TEXT_ID + '"></Text>' + //content in default aggregation
						'</items>' +
					'</HBox>' +
					'<Bar tooltip="barTooltip">' + //control without default aggregation, tooltip aggregation filled with altType
					'</Bar>\n' +
					'<VBox id="foo.' + HBOX_ID + '">' +
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
					'<f:DynamicPageTitle id="' + ID_OF_CONTROL_WITH_CUSTOM_DATA + '" fl:flexibility="' + CHANGE_HANDLER_PATH + '" app:someInlineAppCustomData="inlineValue" >' +
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
						'<f:customData>' +
							'<CustomData xmlns="sap.ui.core" key="fullCustomData" value="full"></CustomData>' + //inline namespace as sap.ui.core is use case for not existing namespace
						'</f:customData>' +
					'</f:DynamicPageTitle>' +
					'<VBox id="stashedExperiments">' +
						'<Label text="visibleLabel" stashed="false"></Label>' +
						'<Label text="stashedInvisibleLabel" visible="false" stashed="true"></Label>' +
					'</VBox>' +
					'<DynamicDateRange id="' + ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT + '" value="\\{&quot;key&quot;:&quot;value&quot;\\}" />' +
					'<DynamicDateRange id="' + ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_2 + '" value="\{&quot;key&quot;:&quot;value&quot;\}" />' +
					'<DynamicDateRange id="' + ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_3 + '" value="{\'key\': \'value\'}" />' +
					'<DynamicDateRange id="' + ID_OF_CONTROL_WITH_PROP_BINDING + '" value="{/foo}" />' +
					'<DynamicDateRange id="' + ID_OF_CONTROL_WITH_PROP_TYPE_ARRAY + '" value="[\\{&quot;key&quot;:&quot;value&quot;\\}]" />' +
					'<f:DynamicPageTitle id="' + ID_OF_CONTROL_WITH_INLINE_CUSTOM_DATA + '" app:someInlineAppCustomData="inlineValue" />' +
				'</mvc:View>';
			this.oXmlView = XMLHelper.parse(this.oXmlString, "application/xml").documentElement;

			this.oXmlString2 =
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:fl="sap.ui.fl" xmlns:core="sap.ui.core" xmlns="sap.m" >' +
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
					'<core:ExtensionPoint name="ExtensionPoint3">' +
						'<Label id="ep3-label1" text="EP label1 - default content" />' +
						'<Label id="ep3-label2" text="EP label2 - default content" />' +
						'<Label id="ep3-label3" text="EP label3 - default content" />' +
						'<Label id="ep3-label4" text="EP label4 - default content" />' +
					'</core:ExtensionPoint>' +
					'<Label id="label3" text="TestLabel3" />' +
				'</HBox>' +
			'</mvc:View>';
			this.oXmlView2 = XMLHelper.parse(this.oXmlString2, "application/xml").documentElement;

			return Component.create({
				name: "sap.ui.test.other",
				id: "testComponent"
			}).then(function(oComponent) {
				this.oComponent = oComponent;
			}.bind(this));

		},
		afterEach: function () {
			sandbox.restore();
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("the createControl is processing parameters and is working with default namespaces", function (assert) {
			var sButtonText = "ButtonText";
			return XmlTreeModifier.createControl('sap.m.Button', this.oComponent, this.oXmlView, "testComponent---myView--MyButton", {'text' : sButtonText})
				.then(function (oButtonElement) {
					assert.equal(oButtonElement.getAttribute("text"), sButtonText);
					assert.equal(oButtonElement.localName, "Button");
					assert.equal(oButtonElement.namespaceURI, "sap.m");
					assert.equal(oButtonElement.getAttribute("id"), "testComponent---myView--MyButton");
				});
		});

		QUnit.test(" the createControl is adding missing namespaces ", function (assert) {
			return XmlTreeModifier.createControl('sap.ui.core.CustomData', this.oComponent, this.oXmlView, "", {'key' : "someKey", "value": "someValue"})
				.then(function (oCustomDataElement) {
					assert.equal(oCustomDataElement.localName, "CustomData");
					assert.equal(oCustomDataElement.namespaceURI, "sap.ui.core");
				});
		});

		QUnit.test(" the createControl is using existing namespaces ", function (assert) {
			return XmlTreeModifier.createControl('sap.ui.layout.VerticalLayout', this.oComponent, this.oXmlView)
				.then(function (oVerticalLayout) {
					assert.equal(oVerticalLayout.localName, "VerticalLayout");
					assert.equal(oVerticalLayout.namespaceURI, "sap.ui.layout");
				});
		});

		QUnit.test(" the createControl is called for async return value", function (assert) {
			var oPromise = XmlTreeModifier.createControl('sap.ui.layout.VerticalLayout', this.oComponent, this.oXmlView, undefined, undefined);
			assert.ok(oPromise instanceof Promise, "then a promise is returned");
			return oPromise
				.then(function(oVerticalLayout) {
					assert.equal(oVerticalLayout.localName, "VerticalLayout", "then the promise contains the requested control");
				});
		});

		QUnit.test(" the createControl is called for async return value and control is already created", function (assert) {
			sandbox.stub(XmlTreeModifier, 'bySelector').returns(true);
			var oPromise = XmlTreeModifier.createControl('sap.ui.layout.VerticalLayout', this.oComponent, this.oXmlView, undefined, undefined);
			assert.ok(oPromise instanceof Promise, "then a promise is returned");
			return oPromise
				.catch(function(oError) {
					assert.equal(oError.message, "Can't create a control with duplicated ID undefined", "then the promise is rejected with the correct error message");
				});
		});

		QUnit.test(" the createControl is called for sync return value and control is already created", function (assert) {
			sandbox.stub(XmlTreeModifier, 'bySelector').resolves(true);
			return XmlTreeModifier.createControl('sap.ui.layout.VerticalLayout', this.oComponent, this.oXmlView)
				.catch(function (vError) {
					assert.ok(vError.message.indexOf("Can't create a control with duplicated ID undefined") > -1, "then the right exception is thrown");
				});
		});

		QUnit.test("the default aggregation is returned if aggregation node is not available", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			return XmlTreeModifier.getAggregation(oVBox, 'items')
				.then(function (aDefaultAggregationElements) {
					assert.equal(aDefaultAggregationElements.length, 2);
					assert.equal(aDefaultAggregationElements[0].localName, "Label");
					assert.equal(aDefaultAggregationElements[0].namespaceURI, "sap.m");
					assert.equal(aDefaultAggregationElements[1].localName, "Label");
					assert.equal(aDefaultAggregationElements[1].namespaceURI, "sap.m");
				});
		});

		QUnit.test("the default aggregation is returned if aggregation node is available", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			return XmlTreeModifier.getAggregation(oHBox, 'items')
				.then(function (aDefaultAggregationElements) {
					assert.equal(aDefaultAggregationElements[0].localName, "Text");
					assert.equal(aDefaultAggregationElements.length, 1);
				});
		});

		QUnit.test("the empty non default aggregation is returned ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			return XmlTreeModifier.getAggregation(oVBox, 'customData')
				.then(function (aNonDefaultAggregationElements) {
					assert.equal(aNonDefaultAggregationElements.length, 0);
				});
		});

		QUnit.test("the empty non default aggregation is returned when no default aggregation exists", function (assert) {
			var oBar = XmlTreeModifier._children(this.oXmlView)[2];
			return XmlTreeModifier.getAggregation(oBar, 'contentRight')
				.then(function (aNonDefaultAggregationElements) {
					assert.equal(aNonDefaultAggregationElements.length, 0);
				});
		});

		QUnit.test("the empty single aggregation is returning nothing", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			return XmlTreeModifier.getAggregation(oVBox, 'tooltip')
				.then(function (vAggregationElements) {
					assert.ok(!vAggregationElements);
				});
		});

		QUnit.test("the not in xml view available single aggregation is returning nothing", function (assert) {
			var oLabel = XmlTreeModifier._children(this.oXmlView)[0].childNodes[2];
			return XmlTreeModifier.getAggregation(oLabel, 'tooltip')
				.then(function (vAggregationElements) {
					assert.ok(!vAggregationElements);
				});
		});

		QUnit.test("the single aggregation is returning the control node directly", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			return XmlTreeModifier.getAggregation(oHBox, 'tooltip')
				.then(function (oAggregationElements) {
					assert.equal(oAggregationElements.localName, "TooltipBase");
					assert.equal(oAggregationElements.namespaceURI, "sap.ui.core");
				});
		});

		QUnit.test("the altType aggregation returns the property value", function (assert) {
			var oBar = XmlTreeModifier._children(this.oXmlView)[2];
			return XmlTreeModifier.getAggregation(oBar, 'tooltip')
				.then(function (vAggregationElements) {
					assert.equal(vAggregationElements, "barTooltip");
				});
		});

		QUnit.test("attribute specified inline is returned in custom data aggregation", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_INLINE_CUSTOM_DATA, this.oXmlView);
			return XmlTreeModifier.getAggregation(oControl, 'customData')
				.then(function (aCustomData) {
					assert.equal(aCustomData.length, 1, "the single custom data is returned");
					return Promise.all([
						XmlTreeModifier.getProperty(aCustomData[0], "key"),
						XmlTreeModifier.getProperty(aCustomData[0], "value")
					]);
				})
				.then(function (aProperties) {
					assert.equal(aProperties[0], "someInlineAppCustomData", " inline specified custom data is available");
					assert.equal(aProperties[1], "inlineValue", " inline specified custom data is available");
				});
		});

		QUnit.test("all the namespaced attributes are returned in custom data aggregation", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_CUSTOM_DATA, this.oXmlView);
			return XmlTreeModifier.getAggregation(oControl, 'customData')
				.then(function (aCustomData) {
					assert.equal(aCustomData.length, 3, "all 3 cases for custom data are returned");
					return Promise.all([
						XmlTreeModifier.getProperty(aCustomData[0], "key"),
						XmlTreeModifier.getProperty(aCustomData[0], "value"),
						XmlTreeModifier.getProperty(aCustomData[1], "key"),
						XmlTreeModifier.getProperty(aCustomData[1], "value"),
						XmlTreeModifier.getProperty(aCustomData[2], "key"),
						XmlTreeModifier.getProperty(aCustomData[2], "value")
					]);
				})
				.then(function (aProperties) {
					assert.equal(aProperties[0], "fullCustomData", " fully specified custom data is available");
					assert.equal(aProperties[1], "full", " fully specified custom data is available");
					assert.equal(aProperties[2], "someInlineAppCustomData", " inline specified custom data is available");
					assert.equal(aProperties[3], "inlineValue", " inline specified custom data is available");
					assert.equal(aProperties[4], "sap-ui-custom-settings", " fully specified custom data is available");
					assert.deepEqual(aProperties[5], {
						"sap.ui.fl" : {
							"flexibility" : CHANGE_HANDLER_PATH
						}
					}, " sap-ui-custom-settings custom data is available");
				});
		});

		QUnit.test("createAndAddCustomData adds the custom data properly, and getAggregation returns them", function(assert) {
			assert.expect(2);
			var fnCheck = function(oCustomData) {
				return Promise.all([
					XmlTreeModifier.getProperty(oCustomData, "key"),
					XmlTreeModifier.getProperty(oCustomData, "value")
				]).then(function (aProperties) {
					if (aProperties[0] === "myKey") {
						assert.equal(aProperties[1], "myValue", "the newly added custom data is returned");
					}
				});
			};
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_CUSTOM_DATA, this.oXmlView);
			return XmlTreeModifier.createAndAddCustomData(oControl, "myKey", "myValue")
				.then(XmlTreeModifier.getAggregation.bind(XmlTreeModifier, oControl, 'customData'))
				.then(function (aCustomData) {
					assert.equal(aCustomData.length, 4, "the new custom data was returned");
					return Promise.all(aCustomData.map(fnCheck, Promise.resolve()));
				});
		});

		QUnit.test("createAndAddCustomData adds the custom data properly, and getCustomDataInfo returns them", function(assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_CUSTOM_DATA, this.oXmlView);
			return XmlTreeModifier.createAndAddCustomData(oControl, "myKey", "myValue").then(function() {
				var oCustomData = XmlTreeModifier.getCustomDataInfo(oControl, "myKey");
				assert.ok(oCustomData.customData, "the custom data is returned");
				assert.strictEqual(oCustomData.customDataValue, "myValue", "the custom data value is returned");
			});
		});

		QUnit.test("the first non default aggregation childNode is added under a newly created aggregation node ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			return XmlTreeModifier.createControl('sap.ui.core.CustomData', this.oComponent, this.oXmlView, "someId", {'key' : "someKey", "value": "someValue"})
				.then(function (oCustomDataElement) {
					return XmlTreeModifier.insertAggregation(oVBox, "customData", oCustomDataElement, 0, this.oXmlView);
				}.bind(this))
				.then(function () {
					assert.equal(XmlTreeModifier._children(oVBox)[3].localName, "customData", "aggregation node is appended at the end");
					assert.equal(XmlTreeModifier._children(oVBox)[3].namespaceURI, "sap.m", "aggregation node is added with parents namespaceURI");
					return XmlTreeModifier.getAggregation(oVBox, 'customData');
				})
				.then(function (aNonDefaultAggregationElements) {
					assert.equal(aNonDefaultAggregationElements.length, 1);
					assert.equal(aNonDefaultAggregationElements[0].localName, "CustomData");
					assert.equal(aNonDefaultAggregationElements[0].namespaceURI, "sap.ui.core");
				});
		});

		QUnit.test("a child is added to the default aggregation ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			return XmlTreeModifier.createControl('sap.m.Text', this.oComponent, this.oXmlView)
				.then(function (oCustomDataElement) {
					return XmlTreeModifier.insertAggregation(oVBox, "items", oCustomDataElement, 0, this.oXmlView);
				}.bind(this))
				.then(function () {
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
					return XmlTreeModifier.getAggregation(oVBox, 'items');
				})
				.then(function (aNonDefaultAggregationElements) {
					assert.equal(aNonDefaultAggregationElements.length, 3);
					assert.equal(aNonDefaultAggregationElements[0].localName, "Text");
					assert.equal(aNonDefaultAggregationElements[0].namespaceURI, "sap.m");
					assert.equal(aNonDefaultAggregationElements[1].localName, "Label");
					assert.equal(aNonDefaultAggregationElements[1].namespaceURI, "sap.m");
					assert.equal(aNonDefaultAggregationElements[2].localName, "Label");
					assert.equal(aNonDefaultAggregationElements[2].namespaceURI, "sap.m");
				});
		});

		QUnit.test("a child is removed from the default aggregation ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var oLabel = XmlTreeModifier._children(this.oXmlView)[0].childNodes[2];
			return XmlTreeModifier.removeAggregation(oVBox, "items", oLabel)
				.then(function () {
					var aChildNodes = XmlTreeModifier._children(oVBox);
					assert.equal(aChildNodes.length, 2);
					assert.equal(aChildNodes[0].localName, "tooltip");
					assert.equal(aChildNodes[0].namespaceURI, "sap.m");
					assert.equal(aChildNodes[1].localName, "Label");
					assert.equal(aChildNodes[1].namespaceURI, "sap.m");
				});
		});

		QUnit.test("a child is moved inside the default aggregation", async function (assert) {
			const oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			const oLabel = XmlTreeModifier._children(this.oXmlView)[0].childNodes[2];
			await XmlTreeModifier.moveAggregation(oVBox, "items", oVBox, "items", oLabel, 1);
			const aChildNodes = XmlTreeModifier._children(oVBox);
			assert.strictEqual(aChildNodes.length, 3);
			assert.strictEqual(aChildNodes[1].localName, "Label", "Label was moved to the right index");
			assert.strictEqual(aChildNodes[1].namespaceURI, "sap.m");
		});

		QUnit.test("a child is moved from one control to another", async function (assert) {
			const oSourceVBox = XmlTreeModifier._children(this.oXmlView)[0];
			const oTargetHBox = XmlTreeModifier._children(this.oXmlView)[1];
			const oLabel = XmlTreeModifier._children(this.oXmlView)[0].childNodes[2];
			await XmlTreeModifier.moveAggregation(oSourceVBox, "items", oTargetHBox, "items", oLabel, 1);
			const aTargetHBoxChildNodes = XmlTreeModifier._children(oTargetHBox);
			const aTargetItemChildNodes = XmlTreeModifier._children(aTargetHBoxChildNodes[1]);
			assert.strictEqual(aTargetItemChildNodes.length, 2);
			assert.strictEqual(aTargetItemChildNodes[1].localName, "Label", "Label was added to target parent with the right index");
			assert.strictEqual(aTargetItemChildNodes[1].namespaceURI, "sap.m");
			const aSourceItemChildNodes = XmlTreeModifier._children(oSourceVBox);
			assert.strictEqual(aSourceItemChildNodes.length, 2, "Label was removed from source parent");
		});

		QUnit.test("a child is removed from the aggregation and then destroyed + destroy without removing", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var oLabel = XmlTreeModifier._children(this.oXmlView)[0].childNodes[2];
			return XmlTreeModifier.removeAggregation(oVBox, "items", oLabel)
				.then(function () {
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
		});

		QUnit.test("removeAll from the default aggregation ", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			return XmlTreeModifier.removeAllAggregation(oVBox, "items")
				.then(function () {
					var aChildNodes = XmlTreeModifier._children(oVBox);
					assert.equal(aChildNodes.length, 1);
					assert.equal(aChildNodes[0].localName, "tooltip");
					assert.equal(aChildNodes[0].namespaceURI, "sap.m");
				});
		});

		QUnit.test("removeAll from the default aggregation ", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			return XmlTreeModifier.removeAllAggregation(oHBox, "items")
				.then(function () {
					assert.equal(oHBox.childNodes.length, 1);
					assert.equal(oHBox.childNodes[0].localName, "tooltip");
					assert.equal(oHBox.childNodes[0].namespaceURI, "sap.m");
				});
		});

		[0, 1].forEach(function(iIndex) {
			QUnit.test(`replaceAllAggregation ${iIndex}`, async function(assert) {
				const oVBox = XmlTreeModifier._children(this.oXmlView)[iIndex];
				const oNewItem1 = await XmlTreeModifier.createControl("sap.m.Text", this.oComponent, this.oXmlView2);
				const oNewItem2 = await XmlTreeModifier.createControl("sap.m.Text", this.oComponent, this.oXmlView2);
				const oNewItem3 = await XmlTreeModifier.createControl("sap.m.Text", this.oComponent, this.oXmlView2);
				await XmlTreeModifier.replaceAllAggregation(oVBox, "items", [oNewItem1, oNewItem2, oNewItem3]);
				const oNewAggregation = await XmlTreeModifier.getAggregation(oVBox, "items");
				assert.strictEqual(oNewAggregation.length, 3, "three items are in the aggregation");
				assert.strictEqual(oNewAggregation[0].localName, "Text");
				assert.strictEqual(oNewAggregation[0].namespaceURI, "sap.m");
				assert.strictEqual(oNewAggregation[1].localName, "Text");
				assert.strictEqual(oNewAggregation[1].namespaceURI, "sap.m");
				assert.strictEqual(oNewAggregation[2].localName, "Text");
				assert.strictEqual(oNewAggregation[2].namespaceURI, "sap.m");
			});
		});

		QUnit.test("getVisible", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);
			var oVisibleLabel = aChildNodes[1];
			var oInvisibleLabel = aChildNodes[2];
			return Promise.all([
				XmlTreeModifier.getVisible(oVBox),
				XmlTreeModifier.getVisible(oVisibleLabel),
				XmlTreeModifier.getVisible(oInvisibleLabel)
			]).then(function (aIsVisible) {
				assert.strictEqual(aIsVisible[0], true, "not stating visible in xml means visible");
				assert.strictEqual(aIsVisible[1], true, "visible in xml");
				assert.strictEqual(aIsVisible[2], false, "invisible in xml");
			});
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

		QUnit.test("setStash", async function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[7];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			await XmlTreeModifier.setStashed(oVBox, true);
			assert.strictEqual(oVBox.getAttribute("stashed"), "true", "stashed attribute can be added");

			var oVisibleLabel = aChildNodes[0];
			await XmlTreeModifier.setStashed(oVisibleLabel, true);
			assert.strictEqual(oVisibleLabel.getAttribute("stashed"), "true", "stashed attribute can be changed");

			var oStashedInvisibleLabel = aChildNodes[1];
			await XmlTreeModifier.setStashed(oStashedInvisibleLabel, false);
			assert.strictEqual(oStashedInvisibleLabel.getAttribute("stashed"), null, "stashed=false means not having it in xml as some controls behave differently if visible property is provided");
			assert.strictEqual(oStashedInvisibleLabel.getAttribute("visible"), null, "Unstash also needs to make the control visible (which is done automatically in with stash API)");
		});

		QUnit.test("getProperty returns default value if not in xml", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			var oVisibleLabel = aChildNodes[1];
			var oInvisibleLabel = aChildNodes[2];
			return Promise.all([
				XmlTreeModifier.getProperty(oVisibleLabel, "design"),
				XmlTreeModifier.getProperty(oVisibleLabel, "text"),
				XmlTreeModifier.getProperty(oInvisibleLabel, "design")
			]).then(function (aProperties) {
				assert.strictEqual(aProperties[0], "Standard", "default value, property not in xml");
				assert.strictEqual(aProperties[1], "", "default value, property not in xml");
				assert.strictEqual(aProperties[2], "Bold", "property from xml");
			});
		});

		QUnit.test("getProperty for properties of type object (double escaped case)", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			return XmlTreeModifier.getProperty(oControl, "value")
				.then(function (mData) {
					assert.deepEqual(mData, { key : "value"}, "returns json value");
				});
		});

		QUnit.test("getProperty for properties of type object (single escaped case)", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_2, this.oXmlView);
			return XmlTreeModifier.getProperty(oControl, "value")
				.then(function (mData) {
					assert.deepEqual(mData, { key : "value"}, "returns json value");
				});
		});

		QUnit.test("getProperty for properties of type object (single quote case)", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT_3, this.oXmlView);
			return XmlTreeModifier.getProperty(oControl, "value")
				.then(function (mData) {
					assert.deepEqual(mData, { key : "value"}, "returns json value");
				});
		});

		QUnit.test("getProperty for properties of type object with an array (curly braces escaped case)", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_ARRAY, this.oXmlView);
			return XmlTreeModifier.getProperty(oControl, "value")
				.then(function (mData) {
					assert.deepEqual(mData, [{ "key" : "value"}], "returns array value");
				});
		});

		QUnit.test("getProperty for properties controlled by a binding", function(assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_BINDING, this.oXmlView);
			return XmlTreeModifier.getProperty(oControl, "value")
				.then(function (mData) {
					assert.equal(mData, undefined, "nothing is returned");
				});
		});

		QUnit.test("setProperty for properties of type object", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			XmlTreeModifier.setProperty(oControl, "value", { key2 : 2});

			var sStringifiedData = oControl.getAttribute("value");
			assert.strictEqual(sStringifiedData, '\\{"key2":2\\}', "returns json value stringified and escaped");
		});

		QUnit.test("setProperty for properties of type array", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			XmlTreeModifier.setProperty(oControl, "value", [{ key2 : 2}]);

			var sStringifiedData = oControl.getAttribute("value");
			assert.strictEqual(sStringifiedData, '[\\{"key2":2\\}]', "returns json value stringified and escaped");
		});

		QUnit.test("getPropertyBinding for bound properties", function(assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_BINDING, this.oXmlView);
			var mData = XmlTreeModifier.getPropertyBinding(oControl, "value");
			var oBindingInfo = {
				path: "/foo"
			};
			assert.deepEqual(mData, oBindingInfo , "the binding info object is returned");
		});

		QUnit.test("getPropertyBinding for unbound properties of type object", function(assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			var mData = XmlTreeModifier.getPropertyBinding(oControl, "value");
			assert.equal(mData, undefined, "nothing is returned");
		});

		QUnit.test("getPropertyBinding for unbound properties of type string", function(assert) {
			var oControl = XmlTreeModifier._byId("button1", this.oXmlView);
			var mData = XmlTreeModifier.getPropertyBinding(oControl, "text");
			assert.equal(mData, undefined, "nothing is returned");
		});

		QUnit.test("getPropertyBinding for empty properties", function(assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_BINDING, this.oXmlView);
			var mData = XmlTreeModifier.getPropertyBinding(oControl, "value2");
			assert.equal(mData, undefined, "nothing is returned");
		});

		QUnit.test("setPropertyBinding with a binding string", function(assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			XmlTreeModifier.setPropertyBinding(oControl, "value", "{/foo}");
			assert.equal(oControl.getAttribute("value"), "{/foo}", "the string was set");
		});

		QUnit.test("setPropertyBinding with a binding info object", function(assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			var oValueBefore = oControl.getAttribute("value");
			assert.throws(function() {
				XmlTreeModifier.setPropertyBinding(oControl, "value", {path: "foo"});
			}, Error, "the function throws an error");
			assert.deepEqual(oValueBefore, oControl.getAttribute("value"), "the property was not changed");
		});

		function getVisibleLabel(oXmlView) {
			var oVBox = XmlTreeModifier._children(oXmlView)[0];
			var aChildNodes = XmlTreeModifier._children(oVBox);

			return aChildNodes[1];
		}

		QUnit.test("applySettings", function (assert) {
			var oVisibleLabel = getVisibleLabel(this.oXmlView);

			return XmlTreeModifier.applySettings(oVisibleLabel, {
				design: "Bold", //simple property type string
				required: true, //property type is not string
				labelFor: ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT //association
			}).then(function () {
				return Promise.all([
					XmlTreeModifier.getProperty(oVisibleLabel, "design"),
					XmlTreeModifier.getProperty(oVisibleLabel, "required")
				]);
			})
			.then(function (aProperties) {
				assert.strictEqual(aProperties[0], "Bold", "the design value is changed from applySettings");
				assert.strictEqual(aProperties[1], true, "the required value is changed from applySettings");
				var sAssociatedControlId = XmlTreeModifier.getAssociation(oVisibleLabel, "labelFor");
				assert.strictEqual(sAssociatedControlId, ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT);
			});
		});

		QUnit.test("applySetting with association as object", function (assert) {
			var oVisibleLabel = getVisibleLabel(this.oXmlView);
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			return XmlTreeModifier.applySettings(oVisibleLabel, {
				labelFor: oControl //association
			}).then(function () {
				var sAssociatedControlId = XmlTreeModifier.getAssociation(oVisibleLabel, "labelFor");
				assert.strictEqual(sAssociatedControlId, ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT);
			});
		});

		QUnit.test("applySetting with property of type object", function (assert) {
			var oControl = XmlTreeModifier._byId(ID_OF_CONTROL_WITH_PROP_TYPE_OBJECT, this.oXmlView);
			var mData = { key2 : 2};
			return XmlTreeModifier.applySettings(oControl, {value: mData})
				.then(XmlTreeModifier.getProperty.bind(XmlTreeModifier, oControl, "value"))
				.then(function (oProperty) {
					assert.deepEqual(oProperty, mData, "the property of type object returns in JSON notation");
				});
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

			XmlTreeModifier.setAssociation(oControl, "labelFor", HBOX_ID);
			assert.strictEqual(XmlTreeModifier.getAssociation(oControl, "labelFor"), HBOX_ID);
		});

		QUnit.test("setAssociation works with single association and control instance passed", function(assert) {
			var oControl = getVisibleLabel(this.oXmlView);
			var oAssociatedControl = XmlTreeModifier._byId(HBOX_ID, this.oXmlView);

			XmlTreeModifier.setAssociation(oControl, "labelFor", oAssociatedControl);
			assert.strictEqual(XmlTreeModifier.getAssociation(oControl, "labelFor"), HBOX_ID, "associated control instance got converted to its ID");
		});

		QUnit.test("byId finds the node specified", function (assert) {
			var oExpectedHBox = XmlTreeModifier._children(this.oXmlView)[1];
			oExpectedHBox.setAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id", true);
			var oExpectedText = oExpectedHBox.childNodes[1].childNodes[1];
			oExpectedText.setAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id", true);

			var oHBox = XmlTreeModifier._byId(HBOX_ID, this.oXmlView);
			assert.strictEqual(oHBox, oExpectedHBox, "HBox node found");
			var oText = XmlTreeModifier._byId(TEXT_ID, this.oXmlView);
			assert.strictEqual(oText, oExpectedText, "Text node found");
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 1 - control in aggregation 0..1 passed as parameter", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			var oTooltip = oHBox.childNodes[0].childNodes[0];
			return XmlTreeModifier.findIndexInParentAggregation(oTooltip)
				.then(function (iIndexInParentAggregation) {
					assert.strictEqual(iIndexInParentAggregation, 0, "The function returned the correct index.");
				});
		});

		function getButton(oXmlView) {
			var oVBox = XmlTreeModifier._children(oXmlView)[3];
			return oVBox.lastElementChild;
		}
		QUnit.test("findIndexInParentAggregation returns the correct value: case 2 - default aggregation only in xml tree", function (assert) {
			var oButton = getButton(this.oXmlView);
			return XmlTreeModifier.findIndexInParentAggregation(oButton)
				.then(function (iIndexInParentAggregation) {
					assert.strictEqual(iIndexInParentAggregation, 2, "The function returned the correct index.");
				});
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 3 - named aggregation only in xml tree", function (assert) {
			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[4];
			var oButton = XmlTreeModifier._children(oDynamicPageTitle)[0].lastElementChild;
			return XmlTreeModifier.findIndexInParentAggregation(oButton)
				.then(function (iIndexInParentAggregation) {
					assert.strictEqual(iIndexInParentAggregation, 2, "The function returned the correct index.");
				});
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 4 - mixed node with aggregation and default aggregation", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[5];
			var oButton = oVBox.lastElementChild;
			return XmlTreeModifier.findIndexInParentAggregation(oButton)
				.then(function (iIndexInParentAggregation) {
					assert.strictEqual(iIndexInParentAggregation, 2, "The function returned the correct index.");
				});
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 5 - mixed node with aggregation and named aggregation", function (assert) {
			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[6];
			var oButton = oDynamicPageTitle.childNodes[0].lastElementChild;
			var oText = oDynamicPageTitle.childNodes[1].childNodes[1];
			return Promise.all([
				XmlTreeModifier.findIndexInParentAggregation(oButton),
				XmlTreeModifier.findIndexInParentAggregation(oText)
			]).then(function (aIndexInParentAggregation) {
				assert.strictEqual(aIndexInParentAggregation[0], 2, "The function returned the correct index.");
				assert.strictEqual(aIndexInParentAggregation[1], 1, "The function returned the correct index.");
			});
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 7 - when stashed controls exist", function (assert) {
			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[6];
			var oFirstButton = oDynamicPageTitle.childNodes[0].firstElementChild;
			var oLastButton = oDynamicPageTitle.childNodes[0].lastElementChild;
			XmlTreeModifier.setProperty(oFirstButton, "stashed", true);
			return XmlTreeModifier.findIndexInParentAggregation(oLastButton)
				.then(function (iIndexInParentAggregation) {
					assert.strictEqual(iIndexInParentAggregation, 1, "The function returned the correct index.");
				});
		});

		QUnit.test("findIndexInParentAggregation returns the correct value: case 8 - when extension point exists", function (assert) {
			var oHBox1 = XmlTreeModifier._children(this.oXmlView2)[0];
			var oPanel = XmlTreeModifier._children(this.oXmlView2)[1];
			var oExtensionPoint1 = oHBox1.childNodes[0].childNodes[3];
			var oExtensionPoint2 = oPanel.childNodes[0];
			return Promise.all([
				XmlTreeModifier.findIndexInParentAggregation(oExtensionPoint1),
				XmlTreeModifier.findIndexInParentAggregation(oExtensionPoint2)
			]).then(function (aIndexInParentAggregation) {
				assert.strictEqual(aIndexInParentAggregation[0], 3, "The function returned the correct index.");
				assert.strictEqual(aIndexInParentAggregation[1], 0, "The function returned the correct index.");
			});
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

			return Promise.all([
				XmlTreeModifier.getParentAggregationName(oLabel, oVBox),
				XmlTreeModifier.getParentAggregationName(oTooltip, oHBox),
				XmlTreeModifier.getParentAggregationName(oText, oHBox),
				XmlTreeModifier.getParentAggregationName(oButton, oDynamicPageTitle),
				XmlTreeModifier.getParentAggregationName(oText2, oDynamicPageTitle)
			]).then(function (aParentAggregationNames) {
				assert.strictEqual(aParentAggregationNames[0], "items", "The function returned the correct name - 'items'.");
				assert.strictEqual(aParentAggregationNames[1], "tooltip", "The function returned the correct name - 'tooltip'.");
				assert.strictEqual(aParentAggregationNames[2], "items", "The function returned the correct name - 'items'.");
				assert.strictEqual(aParentAggregationNames[3], "actions", "The function returned the correct name - 'actions'.");
				assert.strictEqual(aParentAggregationNames[4], "snappedContent", "The function returned the correct name - 'snappedContent'.");
			});
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

		QUnit.test("when getParent is called for control without parent", function (assert) {
			var sXmlString = "<Button text='Button1' id='button1'></Button>";
			var oXmlButton = XMLHelper.parse(sXmlString, "application/xml");
			assert.strictEqual(XmlTreeModifier.getParent(oXmlButton), null, "then 'null' is returned as parent");
		});

		QUnit.test("when getChangeHandlerModule is called for control instance on which changeHandler is defined", function (assert) {
			var oDynamicPageTitle = XmlTreeModifier._children(this.oXmlView)[6];
			assert.strictEqual(XmlTreeModifier.getChangeHandlerModulePath(oDynamicPageTitle), CHANGE_HANDLER_PATH, "then the changehandler path defined at the control instance is returned");
		});

		QUnit.test("when getBingingTemplate is called for an aggregation without nodes", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[5];
			return XmlTreeModifier.getBindingTemplate(oVBox, "tooltip")
				.then(function (oBindingTemplate) {
					assert.notOk(oBindingTemplate, "then nothing is returned");
				});
		});

		QUnit.test("when getBingingTemplate is called for an aggregation with multiple nodes", function (assert) {
			var oVBox = XmlTreeModifier._children(this.oXmlView)[0];
			return XmlTreeModifier.getBindingTemplate(oVBox, "content")
				.then(function (oBindingTemplate) {
					assert.notOk(oBindingTemplate, "then nothing is returned");
				});
		});

		QUnit.test("when getBingingTemplate is called for an aggregation that has a single real control, but text nodes", function (assert) {
			var oHBox = XmlTreeModifier._children(this.oXmlView)[1];
			return XmlTreeModifier.getBindingTemplate(oHBox, "items")
				.then(function (oBindingTemplate) {
					assert.ok(oBindingTemplate, "then content inside item is returned");
				});
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
					'<Button id="' + HBOX_ID + '" text="Button1"></Button>' +
				'</core:FragmentDefinition>';
			return XmlTreeModifier.instantiateFragment(sFragment, "foo", this.oXmlView)
				.catch(function (vError) {
					assert.strictEqual(vError.message, "The following ID is already in the view: foo." + HBOX_ID,
						"then the right exception is thrown");
				});
		});

		QUnit.test("when instantiateFragment is called with a FragmentDefinition", function(assert) {
			var sFragment =
			'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
				'<Button id="button123" text="Button1"></Button>' +
				'<Button id="button1234" text="Button2"></Button>' +
			'</core:FragmentDefinition>';

			return XmlTreeModifier.instantiateFragment(sFragment, "foo", this.oXmlView)
				.then(function (aControls) {
					assert.equal(aControls.length, 2, "there are 2 controls returned");
					assert.equal(aControls[0].getAttribute("id"), "foo.button123", "the ID got prefixed");
					assert.equal(aControls[1].getAttribute("id"), "foo.button1234", "the ID got prefixed");
				});
		});

		QUnit.test("when instantiateFragment is called with a Control", function(assert) {
			var sFragment =
				'<sap.m.Button id="button123" text="Button1" />';

			return XmlTreeModifier.instantiateFragment(sFragment, "foo", this.oXmlView)
				.then(function (aControls) {
					assert.equal(aControls.length, 1, "there is 1 control returned");
					assert.equal(aControls[0].getAttribute("id"), "foo.button123", "the ID got prefixed");
				});
		});

		QUnit.test("when templating a fragment", function(assert) {
			var REPLACED_TEXT = "is replaced as well";
			var mData = {
				foo: true,
				secondValue: REPLACED_TEXT
			};
			var oThis = new JSONModel(mData);
			var mPreprocessorSettings = {
				bindingContexts: {
					"this": oThis.createBindingContext("/")
				},
				models: {
					"this": oThis
				}
			};

			return XmlTreeModifier.templateControlFragment(
				"sap.ui.test.other.fragment-withTemplating",
				mPreprocessorSettings,
				undefined
			).then(function(aControls) {
				assert.equal(aControls.length, 2, "the root controls are returned");
				assert.equal(aControls[0].getAttribute("id"), "hbox", "the parent is returned");
				var oText = XmlTreeModifier._children(aControls[0])[0];
				assert.equal(oText.getAttribute("id"), "inner", "the inner control is templated based on the model parameters");
				assert.equal(oText.getAttribute("text"), REPLACED_TEXT, "the inner control's attributed is templated based on the model parameters");
				assert.equal(aControls[1].getAttribute("id"), "otherRoot", "the parent is returned");
			});
		});

		QUnit.test("when insertAggregation is called without bSkipAdjustIndex for an aggregation containing an extension point", function (assert) {
			var oHBox2 = XmlTreeModifier._children(this.oXmlView2)[2];
			var oSelector = {
				id: "mytext"
			};
			return XmlTreeModifier.createControl('sap.m.Text', this.oComponent, this.oXmlView2, oSelector)
				.then(function (oText) {
					return XmlTreeModifier.insertAggregation(oHBox2, "items", oText, 6, this.oXmlView2, undefined);
				}.bind(this))
				.then(function () {
					var aChildNodes = XmlTreeModifier._children(oHBox2);
					assert.equal(aChildNodes.length, 5, "new control is added to the aggregation");
					assert.equal(aChildNodes[0].id, "button4");
					assert.equal(aChildNodes[1].id, "button5");
					assert.equal(aChildNodes[2].namespaceURI, "sap.ui.core");
					assert.ok(aChildNodes[2].tagName.indexOf("ExtensionPoint") > 0);
					assert.equal(aChildNodes[3].id, "mytext", "the new control is added at the correct position (adjust index took place)");
					assert.equal(aChildNodes[4].id, "label3");
				});
		});

		QUnit.test("when insertAggregation is called with bSkipAdjustIndex for an aggregation containing an extension point", function (assert) {
			var oHBox2 = XmlTreeModifier._children(this.oXmlView2)[2];
			var oSelector = {
				id: "mytext"
			};
			return XmlTreeModifier.createControl('sap.m.Text', this.oComponent, this.oXmlView2, oSelector)
				.then(function (oText) {
					return XmlTreeModifier.insertAggregation(oHBox2, "items", oText, 3, this.oXmlView2, true);
				}.bind(this))
				.then(function () {
					var aChildNodes = XmlTreeModifier._children(oHBox2);
					assert.equal(aChildNodes.length, 5, "new control is added to the aggregation");
					assert.equal(aChildNodes[0].id, "button4");
					assert.equal(aChildNodes[1].id, "button5");
					assert.equal(aChildNodes[2].namespaceURI, "sap.ui.core");
					assert.ok(aChildNodes[2].tagName.indexOf("ExtensionPoint") > 0);
					assert.equal(aChildNodes[3].id, "mytext", "the new control is added at the correct position (no adjust index took place)");
					assert.equal(aChildNodes[4].id, "label3");
				});
		});

		QUnit.test("when insertAggregation is called without bSkipAdjustIndex for an aggregation without an extension point", function (assert) {
			var oVBox2 = XmlTreeModifier._children(this.oXmlView)[5];
			var oSelector = {
				id: "mytext"
			};
			return XmlTreeModifier.createControl('sap.m.Text', this.oComponent, this.oXmlView, oSelector)
				.then(function (oText) {
					return XmlTreeModifier.insertAggregation(oVBox2, "items", oText, 2, this.oXmlView, undefined);
				}.bind(this))
				.then(function () {
					var aChildNodes = XmlTreeModifier._children(oVBox2);
					assert.equal(aChildNodes.length, 5, "new control is added to the aggregation");
					assert.equal(aChildNodes[3].id, "mytext", "the new control is added at the correct position (index offset = 0)");
				});
		});

		QUnit.test("when getExtensionPointInfo is called", function (assert) {
			return XmlTreeModifier.getExtensionPointInfo("ExtensionPoint1", this.oXmlView2)
				.then(function (oExtensionPointInfo1) {
					assert.equal(oExtensionPointInfo1.parent.getAttribute("id"), "hbox1", "then the returned object contains the parent control");
					assert.equal(oExtensionPointInfo1.aggregationName, "items", "and the aggregation name");
					assert.equal(oExtensionPointInfo1.index, 4, "and the index");
					assert.ok(Array.isArray(oExtensionPointInfo1.defaultContent), "and the defaultContent is an Array");
					assert.equal(oExtensionPointInfo1.defaultContent.length, 1, "and the defaultContent contains one item");
					assert.equal(oExtensionPointInfo1.defaultContent[0].getAttribute("id"), "default-label1", "and the default label is returned");

					return XmlTreeModifier.getExtensionPointInfo("ExtensionPoint2", this.oXmlView2);
				}.bind(this))
				.then(function (oExtensionPointInfo2) {
					assert.equal(oExtensionPointInfo2.parent.getAttribute("id"), "panel", "then the returned object contains the parent control");
					assert.equal(oExtensionPointInfo2.aggregationName, "content", "and the aggregation name");
					assert.equal(oExtensionPointInfo2.index, 1, "and the index");
					assert.ok(Array.isArray(oExtensionPointInfo2.defaultContent), "and the defaultContent is an Array");
					assert.equal(oExtensionPointInfo2.defaultContent.length, 0, "and the defaultContent contains one item");
				});
		});

		QUnit.test("when getExtensionPointInfo is called with an extension point which is not on the view", function (assert) {
			return XmlTreeModifier.getExtensionPointInfo("notAvailableExtensionPoint", this.oXmlView2)
				.then(function (oExtensionPointInfo) {
					assert.notOk(oExtensionPointInfo, "then nothing is returned");
				});
		});

		QUnit.test("when getExtensionPointInfo is called with an extension point which exists multiple times on the view", function (assert) {
			return XmlTreeModifier.getExtensionPointInfo("ExtensionPoint3", this.oXmlView2)
				.then(function (oExtensionPointInfo) {
					assert.notOk(oExtensionPointInfo, "then nothing is returned");
				});
		});

		function _getDelegate(mControlsDelegateInfo) {
			var oControl = XmlTreeModifier._byId("hbox2", this.oXmlView2);
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

	QUnit.module("Aggregation binding", {
		before: function () {
			this.createView = function (oXmlView) {
				return XMLView.create({
					definition: XMLHelper.serialize(oXmlView)
				});
			};
		},
		beforeEach: function () {
			this.pComponent = Component.create({
				name: "sap.ui.test.other",
				id: "testComponent"
			}).then(function(oComponent) {
				this.oComponent = oComponent;
			}.bind(this));

			this.oXmlString = (
				'<mvc:View ' +
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
			this.pComponent.then(function() {
				this.oComponent.destroy();
			}.bind(this));

			sandbox.restore();
		}
	}, function () {
		QUnit.test("bindAggregation - complex binding via binding string", function (assert) {
			return XmlTreeModifier.createControl(
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
			).then(function (oTemplate) {
				return XmlTreeModifier.bindAggregation(
					this.oButton,
					"customData",
					{
						path: this.sModelName + ">/customData",
						template: oTemplate
					},
					this.oXmlView
				);
			}.bind(this))
			.then(function () {
				return this.createView(this.oXmlView).then(function(oView) {
					this.oView = oView;
					this.oView.setModel(this.oModel, this.sModelName);
					this.oButtonInstance = this.oView.byId("button1");
					assert.strictEqual(this.oButtonInstance.getCustomData()[0].getKey(), "foo");
					assert.strictEqual(this.oButtonInstance.getCustomData()[0].getValue(), "bar");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("bindAggregation - complex binding via plain object", function (assert) {
			return XmlTreeModifier.createControl(
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
			).then(function (oTemplate) {
				return XmlTreeModifier.bindAggregation(
					this.oButton,
					"customData",
					{
						path: this.sModelName + ">/customData",
						template: oTemplate
					},
					this.oXmlView
				);
			}.bind(this))
			.then(function () {
				return this.createView(this.oXmlView).then(function (oView) {
					this.oView = oView;
					this.oView.setModel(this.oModel, this.sModelName);
					this.oButtonInstance = this.oView.byId("button1");
					assert.strictEqual(this.oButtonInstance.getCustomData()[0].getKey(), "foo");
					assert.strictEqual(this.oButtonInstance.getCustomData()[0].getValue(), "bar");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("unbindAggregation", function (assert) {
			return XmlTreeModifier.createControl(
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
			).then(function (oTemplate) {
				return XmlTreeModifier.bindAggregation(
					this.oButton,
					"customData",
					{
						path: this.sModelName + ">/customData",
						template: oTemplate
					},
					this.oXmlView
				);
			}.bind(this))
			.then(XmlTreeModifier.unbindAggregation.bind(XmlTreeModifier, this.oButton, "customData"))
			.then(function () {
				return this.createView(this.oXmlView).then(function (oView) {
					this.oView = oView;
					this.oView.setModel(this.oModel, this.sModelName);
					this.oButtonInstance = this.oView.byId("button1");
					assert.strictEqual(this.oButtonInstance.getCustomData().length, 0);
				}.bind(this));
			}.bind(this));
		});
	});
});
