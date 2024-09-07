/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/changeHandler/UnhideControl",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	Element,
	UIChange,
	UnhideControlChangeHandler,
	JsControlTreeModifier,
	XmlTreeModifier,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	QUnit.module("sap.ui.fl.changeHandler.UnhideControl", {
		beforeEach() {
			this.oChangeHandler = UnhideControlChangeHandler;
			var oChangeJson = {
				selector: {
					id: "key"
				}
			};

			this.oChange = new UIChange(oChangeJson);
		},
		afterEach() {
			this.oChange = null;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("applyChange on a js control tree", function(assert) {
			var oControl = new Control();

			oControl.setVisible(false);

			return this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier})
			.then(function() {
				assert.equal(oControl.getVisible(), true);
				oControl.setVisible(true);
				return this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
			}.bind(this))
			.then(function() {
				assert.equal(oControl.getVisible(), true);
			});
		});

		QUnit.test("revertChange functionality with state persistence", function(assert) {
			var oControl = new Control();

			oControl.setVisible(true);

			return this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier})
			.then(function() {
				this.oChangeHandler.revertChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
				assert.equal(oControl.getVisible(), true, "should be visible");
			}.bind(this));
		});

		QUnit.test("applyChange on a xml tree", function(assert) {
			var oDOMParser = new DOMParser();
			var oXmlDocument = oDOMParser.parseFromString(`<Button xmlns='sap.m' text='${this.OLD_VALUE}' enabled='true' />`, "application/xml");
			[this.oXmlButton] = oXmlDocument.childNodes;

			return this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier})
			.then(function() {
				assert.strictEqual(this.oXmlButton.getAttribute("visible"), null, "xml button node has no longer the visible attribute");
			}.bind(this));
		});

		QUnit.test("applyChange throws an error if the change is not applyable", function(assert) {
			var oElement = new Element();
			return this.oChangeHandler.applyChange(this.oChange, oElement, {modifier: JsControlTreeModifier})
			.catch(function(oError) {
				assert.equal(oError.message,
					"Provided control instance has no setVisible method",
					"change handler throws an error that the control has no setter for visible");
			});
		});

		QUnit.test("getChangeVisualizationInfo when control is currently visible", function(assert) {
			const oControl = new Control();
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(oControl);
			const oCVizInfo = this.oChangeHandler.getChangeVisualizationInfo(this.oChange, "DummyComponent");
			assert.deepEqual(oCVizInfo, { updateRequired: true }, "updateRequired is true");
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
				{ displayControls: [oParentControl.getId()], updateRequired: true },
				"displayControl is the parent control and updateRequired is true"
			);
		});

		QUnit.test("getChangeVisualizationInfo when control and its parent are currently invisible", function(assert) {
			const oControl = new Control();
			const oParentControl = new Control();
			const oGrandParentControl = new Control();
			oControl.setParent(oParentControl);
			oParentControl.setParent(oGrandParentControl);
			oControl.setVisible(false);
			oParentControl.setVisible(false);
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(oControl);
			const oCVizInfo = this.oChangeHandler.getChangeVisualizationInfo(this.oChange, "DummyComponent");
			assert.deepEqual(
				oCVizInfo,
				{ displayControls: [oGrandParentControl.getId()], updateRequired: true },
				"displayControl is the parent control and updateRequired is true"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});