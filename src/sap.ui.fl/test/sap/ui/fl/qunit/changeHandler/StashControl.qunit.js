/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/StashControl",
	"sap/ui/fl/Change",
	"sap/ui/core/Control",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	StashControlChangeHandler,
	Change,
	Control,
	Panel,
	Button,
	VerticalLayout,
	XMLView,
	JsControlTreeModifier,
	XmlTreeModifier,
	StashedControlSupport,
	UIComponent,
	sinon
) {
	"use strict";

	// mix-in stash functionality
	StashedControlSupport.mixInto(Panel);
	StashedControlSupport.mixInto(Control);
	var sandbox = sinon.sandbox.create();
	var oMockUIComponent = new UIComponent("mockComponent");

	QUnit.module("sap.ui.fl.changeHandler.StashControl", {
		beforeEach: function() {
			this.oChangeHandler = StashControlChangeHandler;
			var oChangeJson = {
				selector: {
					id: "key"
				},
				content: {},
				texts: {}
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

			this.oChange = new Change(oChangeJson);
		},
		afterEach: function() {
			this.oChange = null;
			this.oVerticalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test('applyChange on a JsControlTreeModifier', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oControl2, {modifier: JsControlTreeModifier});
			assert.equal(this.oControl2.getVisible(), false, "then the control's visible property is set to false");
			assert.deepEqual(this.oChange.getRevertData(), {originalValue: false, originalIndex: 1}, "then revert data was set correctly");
		});

		QUnit.test('revertChange on an initially visible control using JsControlTreeModifier', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oControl1, {modifier: JsControlTreeModifier});
			this.oChangeHandler.revertChange(this.oChange, this.oControl1, {modifier: JsControlTreeModifier});
			assert.strictEqual(this.oControl1.getVisible(), true, "then the control is set back to visible");
		});

		QUnit.test('revertChange on an initially invisible control using JsControlTreeModifier', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oControlInvisible, {modifier: JsControlTreeModifier});
			this.oChangeHandler.revertChange(this.oChange, this.oControlInvisible, {modifier: JsControlTreeModifier});
			assert.strictEqual(this.oControlInvisible.getVisible(), false, "then the control is still invisible");
		});

		QUnit.test('when a control is stashed during XML pre-processing and then revertChange is called using JsControlTreeModifier', function(assert) {
			assert.equal(this.oXmlNodeToBeStashed.getAttribute("stashed"), null, "ToBeStashed node is not yet stashed (before XML modification)");

			// to simulate StashControl.applyChange() during XML pre-processing, where the XML node's control is not created
			this.oChangeHandler.applyChange(this.oChange, this.oXmlNodeToBeStashed, {modifier: XmlTreeModifier, appComponent: oMockUIComponent});

			// check XML after modification
			assert.equal(this.oXmlNodeToBeStashed.getAttribute("stashed"), "true", "ToBeStashed node is now stashed (after XML modification)");

			return XMLView.create({definition: new XMLSerializer().serializeToString(this.xmlDocument)}).then(function(oView) {
				// a StashedControl is created with the XML node's ID instead
				var oStashedControl = oView.byId("toBeStashed");

				// to simulate StashControl.revertChange() by the JSControlTreeModifier, where the StashedControl is replaced
				this.oChangeHandler.revertChange(this.oChange, oStashedControl, {modifier: JsControlTreeModifier, appComponent: oMockUIComponent});

				var aContentAfterRevert = oView.byId("verticalLayout").getContent();
				assert.strictEqual(aContentAfterRevert.length, 4, "then the VerticalLayout has 4 controls after revert");

				// check reverted control
				var oStashRevertedPanel = aContentAfterRevert[2];
				assert.strictEqual(oStashRevertedPanel.getVisible(), true, 'then the unstashed control has visible property set to true');
				assert.strictEqual(oStashRevertedPanel.getId(), "__xmlview0--" + this.oXmlNodeToBeStashed.getAttribute("id"), "then the unstashed control was placed at the correct index");

				var oButtonInUnstashedPanel = oStashRevertedPanel.getContent()[0];
				assert.ok(oButtonInUnstashedPanel instanceof Button, "Nested Button in 'stash-reverted' Panel is present.");
				assert.equal(oButtonInUnstashedPanel.getId(), "__xmlview0--myButtonInsideStashedControl", "Nested Button in 'stash-reverted' Panel has correct ID.");
				oView.destroy();
			}.bind(this));
		});

		QUnit.test('applyChange on an XMLTreeModifier', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier});
			assert.equal(this.oXmlNodeControl0.getAttribute("stashed"), "true", "xml button node has the stashed attribute added and set to true");
		});

		QUnit.test('revertChange on an XMLTreeModifier', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier});
			this.oChangeHandler.revertChange(this.oChange, this.oXmlNodeControl0, {modifier: XmlTreeModifier});
			assert.strictEqual(this.oXmlNodeControl0.getAttribute("stashed"), null, "then the stashed attribute is set back the original value");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});