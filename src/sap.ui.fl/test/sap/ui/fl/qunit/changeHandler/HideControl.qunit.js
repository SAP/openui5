/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Control,
	Element,
	UIChange,
	HideControlChangeHandler,
	JsControlTreeModifier,
	XmlTreeModifier,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	QUnit.module("sap.ui.fl.changeHandler.HideControl", {
		beforeEach() {
			this.oChangeHandler = HideControlChangeHandler;
			var oDOMParser = new DOMParser();
			this.oXmlString =
			'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" >' +
			'<Button text="foo" enabled="true" id="buttonId" />' +
			"</mvc:View>";
			this.oXmlDocument = oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;

			this.oChange = new UIChange({
				selector: {id: "key"}
			});
		},
		afterEach() {
			this.oChange.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("applyChange on a js control tree", function(assert) {
			var oControl = new Control();
			oControl.setVisible(true);
			return this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier})
			.then(function() {
				assert.equal(oControl.getVisible(), false);
			});
		});

		QUnit.test("applyChange on a js control tree throws an exception if the change is not applicable", function(assert) {
			var oElement = new Element();

			return this.oChangeHandler.applyChange(this.oChange, oElement, {modifier: JsControlTreeModifier})
			.catch(function(oError) {
				assert.equal(oError.message,
					"Provided control instance has no getVisible method",
					"change handler throws an error that the control has no getter/setter for visible");
			});
		});

		QUnit.test("revertChange functionality", function(assert) {
			var oControl = new Control();
			oControl.setVisible(false);

			return this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier})
			.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, oControl, {modifier: JsControlTreeModifier}))
			.then(function() {
				assert.equal(oControl.getVisible(), false, "should be invisible");
			});
		});

		QUnit.test("applyChange on a xml tree", function(assert) {
			[this.oXmlButton] = this.oXmlDocument.childNodes;
			return this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {
				modifier: XmlTreeModifier,
				view: this.oXmlDocument
			}).then(function() {
				assert.equal(this.oXmlButton.getAttribute("visible"), "false",
				 "xml button node has the visible attribute added and set to false");
			}.bind(this));
		});

		QUnit.test("completeChangeContent", function(assert) {
			var oSpecificChangeInfo = {};
			this.oChangeHandler.completeChangeContent(this.oChange, oSpecificChangeInfo);
			assert.equal(Object.keys(this.oChange.getContent()).length, 0);
		});

		QUnit.test("getChangeVisualizationInfo when control is currently visible", function(assert) {
			const oControl = new Control();
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(oControl);
			const oCVizInfo = this.oChangeHandler.getChangeVisualizationInfo(this.oChange, "DummyComponent");
			assert.deepEqual(
				oCVizInfo,
				{ affectedControls: [this.oChange.getSelector()], displayControls: [oControl.getId()], updateRequired: true },
				"affectedControl is the selector, displayControl the control and updateRequired is returned as true"
			);
		});

		QUnit.test("getChangeVisualizationInfo when control is currently invisible", function(assert) {
			const oControl = new Control();
			const oParentControl = new Control();
			oControl.setParent(oParentControl);
			oControl.setVisible(false);
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(oControl);
			const oCVizInfo = this.oChangeHandler.getChangeVisualizationInfo(this.oChange, "DummyComponent");
			assert.deepEqual(
				oCVizInfo,
				{ affectedControls: [this.oChange.getSelector()], displayControls: [oParentControl.getId()], updateRequired: true },
				"affectedControl is the selector, displayControl is the parent control and updateRequired is true"
			);
		});

		QUnit.test("getChangeVisualizationInfo when the control and its parent are currently invisible", function(assert) {
			const oControl = new Control();
			const oParentControl = new Control();
			const oGrandParentControl = new Control();
			oParentControl.setParent(oGrandParentControl);
			oControl.setParent(oParentControl);
			oControl.setVisible(false);
			oParentControl.setVisible(false);
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(oControl);
			const oCVizInfo = this.oChangeHandler.getChangeVisualizationInfo(this.oChange, "DummyComponent");
			assert.deepEqual(
				oCVizInfo,
				{ affectedControls: [this.oChange.getSelector()], displayControls: [oGrandParentControl.getId()], updateRequired: true },
				"affectedControl is the selector, displayControl is the parent of the parent control and updateRequired is true"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});