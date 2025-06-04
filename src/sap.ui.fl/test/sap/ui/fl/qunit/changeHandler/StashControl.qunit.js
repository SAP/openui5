/* eslint-disable max-nested-callbacks */
/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Panel",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/changeHandler/StashControl",
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
	StashedControlSupport,
	UIComponent,
	UIChange,
	Classification,
	StashControlChangeHandler,
	Layer,
	VerticalLayout,
	sinon
) {
	"use strict";

	// mix-in stash functionality
	StashedControlSupport.mixInto(Panel);
	StashedControlSupport.mixInto(Control);
	const sandbox = sinon.createSandbox();
	const oMockUIComponent = new UIComponent("mockComponent");

	QUnit.module("sap.ui.fl.changeHandler.StashControl", {
		beforeEach() {
			this.oChangeHandler = StashControlChangeHandler;
			const oChangeJson = {
				selector: {
					id: "key"
				},
				layer: Layer.CUSTOMER_BASE
			};

			this.oChange = new UIChange(oChangeJson);

			// the following aggregation describes the runtime state
			// the "ToBeStashed" control will also be part of the aggregation after the XML-Tree modification
			this.oControl1 = new Control();
			this.oControl2 = new Control("control2");
			this.oToBeStashedPlaceholder = new Panel("ToBeStashed0");
			this.oControlInvisible = new Control("invisibleControl", {
				visible: false
			});

			this.oVerticalLayout = new VerticalLayout({
				content: [this.oControl1, this.oControl2, this.oToBeStashedPlaceholder, this.oControlInvisible]
			});

			// XML representation of the above runtime state (before modification)
			this.xmlString =
				'<mvc:View  xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout">' +
					'<layout:VerticalLayout id="verticalLayout">' +
						"<layout:content>" +
							'<core:Control id="control0"></core:Control>' +
							'<core:Control id="control1"></core:Control>' +
							'<m:Panel id="toBeStashed">' +
								'<m:Button id="myButtonInsideStashedControl"></m:Button>' +
							"</m:Panel>" +
							'<core:Control id="invisibleControl" visible="false"></core:Control>' +
						"</layout:content>" +
					"</layout:VerticalLayout>" +
				"</mvc:View>";

			const oDOMParser = new DOMParser();
			this.xmlDocument = oDOMParser.parseFromString(this.xmlString, "application/xml");
			this.oXmlView = this.xmlDocument.documentElement;
			[this.oXmlLayout] = this.oXmlView.childNodes;
			[this.oXmlNodeControl0, , this.oXmlNodeToBeStashed] = this.oXmlLayout.childNodes[0].childNodes;

			this.oSetStashedSpy = sandbox.spy(JsControlTreeModifier, "setStashed");
		},
		afterEach() {
			this.oChange = null;
			this.oVerticalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		[Layer.VENDOR, Layer.CUSTOMER_BASE, Layer.CUSTOMER].forEach(function(sLayer) {
			const oChangeDefinition = {
				selector: {
					id: "control2"
				},
				layer: sLayer
			};

			let sMsg = `applyChange on a JsControlTreeModifier for a change in the Layer: ${sLayer}`;
			QUnit.test(sMsg, async function(assert) {
				const oChange = new UIChange(oChangeDefinition);
				await this.oChangeHandler.applyChange(oChange, this.oControl2, {modifier: JsControlTreeModifier});

				if (sLayer === Layer.CUSTOMER) {
					assert.strictEqual(this.oSetStashedSpy.callCount, 0, "the setStashed function was not called");
				} else {
					assert.strictEqual(this.oSetStashedSpy.callCount, 1, "the setStashed function was called");
				}
				assert.strictEqual(this.oControl2.getVisible(), false, "then the control's visible property is set to false");
				assert.deepEqual(oChange.getRevertData(), {originalValue: false, originalIndex: 1}, "then revert data was set correctly");
				assert.deepEqual(this.oChangeHandler.getCondenserInfo(oChange), {
					classification: Classification.Reverse,
					affectedControl: oChange.getSelector(),
					uniqueKey: "stashed"
				}, "then the condenser info was set correctly");
				assert.deepEqual(this.oChangeHandler.getChangeVisualizationInfo(oChange), {
					displayControls: [this.oVerticalLayout.getId()],
					affectedControls: [oChange.getSelector()]
				}, "then the change visualization info was set correctly");
			});

			sMsg = `revertChange on an initially visible control using JsControlTreeModifier in the Layer: ${sLayer}`;
			QUnit.test(sMsg, async function(assert) {
				const oChange = new UIChange(oChangeDefinition);
				const oMoveSpy = sandbox.spy(JsControlTreeModifier, "moveAggregation");
				await this.oChangeHandler.applyChange(oChange, this.oControl2, {modifier: JsControlTreeModifier});

				// by destroying the control before the stashed control the stashed control has to be moved back to the original position
				this.oControl1.destroy();

				await this.oChangeHandler.revertChange(oChange, this.oControl2, {modifier: JsControlTreeModifier});

				assert.strictEqual(this.oControl2.getVisible(), true, "then the control is set back to visible");
				if (sLayer === Layer.CUSTOMER) {
					assert.strictEqual(this.oSetStashedSpy.callCount, 0, "the setStashed function was not called");
				} else {
					assert.strictEqual(this.oSetStashedSpy.callCount, 2, "the setStashed function was called twice");
					assert.strictEqual(oMoveSpy.callCount, 1, "the moveAggregation function was called once");
				}
			});

			sMsg = `revertChange on an initially invisible control using JsControlTreeModifier in the Layer: ${sLayer}`;
			QUnit.test(sMsg, async function(assert) {
				const oChange = new UIChange(oChangeDefinition);
				await this.oChangeHandler.applyChange(oChange, this.oControlInvisible, {modifier: JsControlTreeModifier});
				await this.oChangeHandler.revertChange(oChange, this.oControlInvisible, {modifier: JsControlTreeModifier});

				assert.strictEqual(this.oControlInvisible.getVisible(), false, "then the control is still invisible");
				if (sLayer === Layer.CUSTOMER) {
					assert.strictEqual(this.oSetStashedSpy.callCount, 0, "the setStashed function was not called");
				} else {
					assert.strictEqual(this.oSetStashedSpy.callCount, 2, "the setStashed function was called twice");
				}
			});

			sMsg = `applyChange on a XMLTreeModifier for a change in the Layer: ${sLayer}`;
			QUnit.test(sMsg, async function(assert) {
				const oChange = new UIChange(oChangeDefinition);
				await this.oChangeHandler.applyChange(oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier});

				if (sLayer === Layer.CUSTOMER) {
					assert.notOk(this.oXmlNodeControl0.getAttribute("stashed"), "xml button node has the stashed attribute added and set to true");
					assert.strictEqual(this.oXmlNodeControl0.getAttribute("visible"), "false", "xml button node has the visible attribute added and set to false");
				} else {
					assert.strictEqual(this.oXmlNodeControl0.getAttribute("stashed"), "true", "xml button node has the stashed attribute added and set to true");
				}
			});

			sMsg = `revertChange on an XMLTreeModifier in the Layer: ${sLayer}`;
			QUnit.test(sMsg, async function(assert) {
				const oChange = new UIChange(oChangeDefinition);
				await this.oChangeHandler.applyChange(oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier});
				await this.oChangeHandler.revertChange(oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier});

				assert.notOk(this.oXmlNodeControl0.getAttribute("stashed"), "then the stashed attribute is set back the original value");
				if (sLayer === Layer.CUSTOMER) {
					assert.notOk(this.oXmlNodeControl0.getAttribute("visible"), "then the visible attribute is set back the original value");
				}
			});
		});

		QUnit.test("when a control is stashed during XML pre-processing and then revertChange is called using JsControlTreeModifier", async function(assert) {
			assert.strictEqual(this.oXmlNodeToBeStashed.getAttribute("stashed"), null, "ToBeStashed node is not yet stashed (before XML modification)");

			// to simulate StashControl.applyChange() during XML pre-processing, where the XML node's control is not created
			await this.oChangeHandler.applyChange(this.oChange, this.oXmlNodeToBeStashed, {modifier: XmlTreeModifier, appComponent: oMockUIComponent});

			assert.strictEqual(this.oXmlNodeToBeStashed.getAttribute("stashed"), "true", "ToBeStashed node is now stashed (after XML modification)");
			// check XML after modification
			const oView = await XMLView.create({definition: new XMLSerializer().serializeToString(this.xmlDocument)});
			// a StashedControl is created with the XML node's ID instead

			// to simulate StashControl.revertChange() by the JSControlTreeModifier, where the StashedControl is replaced
			const oStashedControl = oView.byId("toBeStashed");
			await this.oChangeHandler.revertChange(this.oChange, oStashedControl, {modifier: JsControlTreeModifier, appComponent: oMockUIComponent});

			const aContentAfterRevert = oView.byId("verticalLayout").getContent();
			assert.strictEqual(aContentAfterRevert.length, 4, "then the VerticalLayout has 4 controls after revert");

			// check reverted control
			const oStashRevertedPanel = aContentAfterRevert[2];
			assert.strictEqual(oStashRevertedPanel.getVisible(), true, "then the unstashed control has visible property set to true");
			assert.strictEqual(oStashRevertedPanel.getId(), `__xmlview0--${this.oXmlNodeToBeStashed.getAttribute("id")}`, "then the unstashed control was placed at the correct index");

			const oButtonInUnstashedPanel = oStashRevertedPanel.getContent()[0];
			assert.ok(oButtonInUnstashedPanel instanceof Button, "Nested Button in 'stash-reverted' Panel is present.");
			assert.strictEqual(oButtonInUnstashedPanel.getId(), "__xmlview0--myButtonInsideStashedControl", "Nested Button in 'stash-reverted' Panel has correct ID.");
			oView.destroy();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});