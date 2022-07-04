/* eslint-disable max-nested-callbacks */
/*global QUnit*/

sap.ui.define([
	"sap/m/Button",
	"sap/m/Panel",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/fl/changeHandler/StashControl",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Panel,
	XMLView,
	JsControlTreeModifier,
	XmlTreeModifier,
	Control,
	UIComponent,
	StashedControlSupport,
	StashControlChangeHandler,
	Change,
	Layer,
	VerticalLayout,
	sinon
) {
	"use strict";

	// mix-in stash functionality
	StashedControlSupport.mixInto(Panel);
	StashedControlSupport.mixInto(Control);
	var sandbox = sinon.createSandbox();
	var oMockUIComponent = new UIComponent("mockComponent");

	QUnit.module("sap.ui.fl.changeHandler.StashControl", {
		beforeEach: function() {
			this.oChangeHandler = StashControlChangeHandler;
			var oChangeJson = {
				selector: {
					id: "key"
				},
				content: {},
				texts: {},
				layer: Layer.CUSTOMER_BASE
			};

			this.oChange = new Change(oChangeJson);

			// the following aggregation describes the runtime state
			// the "ToBeStashed" control will also be part of the aggregation after the XML-Tree modification
			this.oControl1 = new Control();
			this.oControl2 = new Control();
			this.oToBeStashedPlaceholder = new Panel("ToBeStashed0");
			this.oControlInvisible = new Control("invisibleControl", {
				visible: false
			});

			this.oVerticalLayout = new VerticalLayout({
				content: [this.oControl1, this.oControl2, this.oToBeStashedPlaceholder, this.oControlInvisible]
			});

			// XML representation of the above runtime state (before modification)
			this.xmlString =
				'<mvc:View  xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout"><layout:VerticalLayout id="verticalLayout" flexEnabled="true">' +
					'<layout:content>' +
						'<core:Control id="control0"></core:Control>' +
						'<core:Control id="control1"></core:Control>' +
						'<m:Panel id="toBeStashed">' +
							'<m:Button id="myButtonInsideStashedControl"></m:Button>' +
						'</m:Panel>' +
						'<core:Control id="invisibleControl" visible="false"></core:Control>' +
					'</layout:content>' +
				'</layout:VerticalLayout></mvc:View>';

			var oDOMParser = new DOMParser();
			this.xmlDocument = oDOMParser.parseFromString(this.xmlString, "application/xml");
			this.oXmlView = this.xmlDocument.documentElement;
			this.oXmlLayout = this.oXmlView.childNodes[0];
			this.oXmlNodeControl0 = this.oXmlLayout.childNodes[0].childNodes[0];
			this.oXmlNodeToBeStashed = this.oXmlLayout.childNodes[0].childNodes[2];

			this.oSetStashedSpy = sandbox.spy(JsControlTreeModifier, "setStashed");

			this.oChange = new Change(oChangeJson);
		},
		afterEach: function() {
			this.oChange = null;
			this.oVerticalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		[Layer.VENDOR, Layer.CUSTOMER_BASE, Layer.CUSTOMER].forEach(function(sLayer) {
			var oChangeDefinition = {
				selector: {
					id: "key"
				},
				content: {},
				texts: {},
				layer: sLayer
			};

			var sMsg = "applyChange on a JsControlTreeModifier for a change in the Layer: " + sLayer;
			QUnit.test(sMsg, function(assert) {
				var oChange = new Change(oChangeDefinition);
				return this.oChangeHandler.applyChange(oChange, this.oControl2, {modifier: JsControlTreeModifier})
					.then(function() {
						if (sLayer === Layer.CUSTOMER) {
							assert.equal(this.oSetStashedSpy.callCount, 0, "the setStashed function was not called");
						} else {
							assert.equal(this.oSetStashedSpy.callCount, 1, "the setStashed function was called");
						}
						assert.equal(this.oControl2.getVisible(), false, "then the control's visible property is set to false");
						assert.deepEqual(oChange.getRevertData(), {originalValue: false, originalIndex: 1}, "then revert data was set correctly");
					}.bind(this));
			});

			sMsg = "revertChange on an initially visible control using JsControlTreeModifier in the Layer: " + sLayer;
			QUnit.test(sMsg, function(assert) {
				var oChange = new Change(oChangeDefinition);
				return this.oChangeHandler.applyChange(oChange, this.oControl1, {modifier: JsControlTreeModifier})
					.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, oChange, this.oControl1, {modifier: JsControlTreeModifier}))
					.then(function() {
						assert.strictEqual(this.oControl1.getVisible(), true, "then the control is set back to visible");
						if (sLayer === Layer.CUSTOMER) {
							assert.equal(this.oSetStashedSpy.callCount, 0, "the setStashed function was not called");
						} else {
							assert.equal(this.oSetStashedSpy.callCount, 2, "the setStashed function was called twice");
						}
					}.bind(this));
			});

			sMsg = "revertChange on an initially invisible control using JsControlTreeModifier in the Layer: " + sLayer;
			QUnit.test(sMsg, function(assert) {
				var oChange = new Change(oChangeDefinition);
				return this.oChangeHandler.applyChange(oChange, this.oControlInvisible, {modifier: JsControlTreeModifier})
					.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, oChange, this.oControlInvisible, {modifier: JsControlTreeModifier}))
					.then(function() {
						assert.strictEqual(this.oControlInvisible.getVisible(), false, "then the control is still invisible");
						if (sLayer === Layer.CUSTOMER) {
							assert.equal(this.oSetStashedSpy.callCount, 0, "the setStashed function was not called");
						} else {
							assert.equal(this.oSetStashedSpy.callCount, 2, "the setStashed function was called twice");
						}
					}.bind(this));
			});

			sMsg = "applyChange on a XMLTreeModifier for a change in the Layer: " + sLayer;
			QUnit.test(sMsg, function(assert) {
				var oChange = new Change(oChangeDefinition);
				return this.oChangeHandler.applyChange(oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier})
					.then(function() {
						if (sLayer === Layer.CUSTOMER) {
							assert.notOk(this.oXmlNodeControl0.getAttribute("stashed"), "xml button node has the stashed attribute added and set to true");
							assert.equal(this.oXmlNodeControl0.getAttribute("visible"), "false", "xml button node has the visible attribute added and set to false");
						} else {
							assert.equal(this.oXmlNodeControl0.getAttribute("stashed"), "true", "xml button node has the stashed attribute added and set to true");
						}
					}.bind(this));
			});

			sMsg = "revertChange on an XMLTreeModifier in the Layer: " + sLayer;
			QUnit.test(sMsg, function(assert) {
				var oChange = new Change(oChangeDefinition);
				return this.oChangeHandler.applyChange(oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier})
					.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier}))
					.then(function() {
						assert.notOk(this.oXmlNodeControl0.getAttribute("stashed"), "then the stashed attribute is set back the original value");
						if (sLayer === Layer.CUSTOMER) {
							assert.notOk(this.oXmlNodeControl0.getAttribute("visible"), "then the visible attribute is set back the original value");
						}
					}.bind(this));
			});
		});

		QUnit.test("when a control is stashed during XML pre-processing and then revertChange is called using JsControlTreeModifier", function(assert) {
			assert.equal(this.oXmlNodeToBeStashed.getAttribute("stashed"), null, "ToBeStashed node is not yet stashed (before XML modification)");
			var oView;
			var oStashedControl;

			// to simulate StashControl.applyChange() during XML pre-processing, where the XML node's control is not created
			return this.oChangeHandler.applyChange(this.oChange, this.oXmlNodeToBeStashed, {modifier: XmlTreeModifier, appComponent: oMockUIComponent})
				.then(function() {
					assert.equal(this.oXmlNodeToBeStashed.getAttribute("stashed"), "true", "ToBeStashed node is now stashed (after XML modification)");
					// check XML after modification
					return XMLView.create({definition: new XMLSerializer().serializeToString(this.xmlDocument)});
				}.bind(this))
				.then(function(oCreatedView) {
					oView = oCreatedView;
					// a StashedControl is created with the XML node's ID instead
					oStashedControl = oView.byId("toBeStashed");

					// to simulate StashControl.revertChange() by the JSControlTreeModifier, where the StashedControl is replaced
					return this.oChangeHandler.revertChange(this.oChange, oStashedControl, {modifier: JsControlTreeModifier, appComponent: oMockUIComponent});
				}.bind(this))
				.then(function() {
					var oStashedControl = oView.byId("toBeStashed");

					this.oChangeHandler.revertChange(this.oChange, oStashedControl, {modifier: JsControlTreeModifier, appComponent: oMockUIComponent});

					var aContentAfterRevert = oView.byId("verticalLayout").getContent();
					assert.strictEqual(aContentAfterRevert.length, 4, "then the VerticalLayout has 4 controls after revert");

					// check reverted control
					var oStashRevertedPanel = aContentAfterRevert[2];
					assert.strictEqual(oStashRevertedPanel.getVisible(), true, "then the unstashed control has visible property set to true");
					assert.strictEqual(oStashRevertedPanel.getId(), "__xmlview0--" + this.oXmlNodeToBeStashed.getAttribute("id"), "then the unstashed control was placed at the correct index");

					var oButtonInUnstashedPanel = oStashRevertedPanel.getContent()[0];
					assert.ok(oButtonInUnstashedPanel instanceof Button, "Nested Button in 'stash-reverted' Panel is present.");
					assert.equal(oButtonInUnstashedPanel.getId(), "__xmlview0--myButtonInsideStashedControl", "Nested Button in 'stash-reverted' Panel has correct ID.");
					oView.destroy();
				}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});