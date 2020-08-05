/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/StashControl",
	"sap/ui/fl/Change",
	"sap/ui/core/Control",
	"sap/ui/layout/VerticalLayout",
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
	VerticalLayout,
	JsControlTreeModifier,
	XmlTreeModifier,
	StashedControlSupport,
	UIComponent,
	sinon
) {
	"use strict";

	// mix-in stash functionality
	StashedControlSupport.mixInto(Control, true);
	var sandbox = sinon.sandbox.create();
	var oMockUIComponent = new UIComponent("mockComponent");
	var fnCreateStashedControl = function(sId, sParentId) {
		return StashedControlSupport.createStashedControl(sId, {
			sParentId: sParentId,
			sParentAggregationName: "content",
			fnCreate: function () {
				//use same id of stashed control
				var oUnstashedControl = new Control(sId);
				return [oUnstashedControl];
			}
		});
	};
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

			this.oControl1 = new Control();
			this.oControl2 = new Control();
			this.oControlInvisible = new Control("invisibleControl", {
				visible: false
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oControl1, this.oControl2, this.oControlInvisible]
			});

			var oXmlString =
				'<mvc:View  xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout"><layout:VerticalLayout id="' + this.oVerticalLayout.getId() + '" flexEnabled="true">' +
					'<content>' +
						'<core:Control id="' + this.oControl1.getId() + '"></core:Control>' +
						'<core:Control id="' + this.oControl2.getId() + '"></core:Control>' +
						'<core:Control stashed="true" id="' + this.oControlInvisible.getId() + '"></core:Control>' +
						'<core:Control id="ToBeStashed"></core:Control>' +
					'</content>' +
				'</layout:VerticalLayout></mvc:View>';

			var oDOMParser = new DOMParser();
			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;
			this.oXmlLayout = this.oXmlView.childNodes[0];
			this.oXmlNodeControl0 = this.oXmlLayout.childNodes[0].childNodes[0];
			this.oXmlNodeToBeStashed = this.oXmlLayout.childNodes[0].childNodes[3];

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
			assert.strictEqual(this.oVerticalLayout.getContent().length, 3, "then the VerticalLayout has 3 controls initially");

			// to simulate StashControl.applyChange() during XML pre-processing, where the XML node's control is not created
			this.oChangeHandler.applyChange(this.oChange, this.oXmlNodeToBeStashed, {modifier: XmlTreeModifier, appComponent: oMockUIComponent});

			// a StashedControl is created with the XML node's ID instead
			var oStashedControl = fnCreateStashedControl(this.oXmlNodeToBeStashed.getAttribute("id"), this.oVerticalLayout.getId());

			// to simulate StashControl.revertChange() by the JSControlTreeModifier, where the StashedControl is replaced
			this.oChangeHandler.revertChange(this.oChange, oStashedControl, {modifier: JsControlTreeModifier, appComponent: oMockUIComponent});

			var aContentAfterRevert = this.oVerticalLayout.getContent();
			assert.strictEqual(aContentAfterRevert.length, 4, "then the VerticalLayout has 4 controls after revert");
			assert.strictEqual(aContentAfterRevert[2].getVisible(), true, 'then the unstashed control has visible property set to true');
			assert.strictEqual(aContentAfterRevert[2].getId(), this.oXmlNodeToBeStashed.getAttribute("id"), "then the unstashed control was placed at the correct index");
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