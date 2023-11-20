/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/changeHandler/UnhideControl",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier"
], function(
	Control,
	Element,
	UIChange,
	UnhideControlChangeHandler,
	JsControlTreeModifier,
	XmlTreeModifier
) {
	"use strict";

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
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});