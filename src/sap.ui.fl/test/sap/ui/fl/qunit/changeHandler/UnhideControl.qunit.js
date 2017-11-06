/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/core/Control',
	'sap/ui/core/Element',
	'sap/ui/fl/changeHandler/UnhideControl',
	'sap/ui/fl/Change',
	'sap/ui/fl/changeHandler/JsControlTreeModifier',
	'sap/ui/fl/changeHandler/XmlTreeModifier'
],
function(
	Control,
	Element,
	UnhideControlChangeHandler,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier
) {
	'use strict';
	QUnit.start();

	QUnit.module("sap.ui.fl.changeHandler.UnhideControl", {
		beforeEach: function() {
			this.oChangeHandler = UnhideControlChangeHandler;
			var oChangeJson = {
				"selector": {
					"id": "key"
				},
				"content": {},
				"texts": {}
			};

			this.oChange = new Change(oChangeJson);
		},
		afterEach: function() {
			this.oChange = null;
		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		var oControl = new Control();

		oControl.setVisible(false);
		this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
		assert.equal(oControl.getVisible(), true);

		oControl.setVisible(true);
		this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
		assert.equal(oControl.getVisible(), true);
	});

	QUnit.test('revertChange functionality with state persistence', function(assert) {
		var oControl = new Control();

		oControl.setVisible(true);
		this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
		this.oChangeHandler.revertChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
		assert.equal(oControl.getVisible(), true, 'should be visible');
	});

	QUnit.test('applyChange on a xml tree', function(assert) {
		var oDOMParser = new DOMParser();
		var oXmlDocument = oDOMParser.parseFromString("<Button xmlns='sap.m' text='" + this.OLD_VALUE + "' enabled='true' />", "application/xml");
		this.oXmlButton = oXmlDocument.childNodes[0];

		assert.ok(this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier}));

		assert.strictEqual(this.oXmlButton.getAttribute("visible"), null, "xml button node has no longer the visible attribute");
	});

	QUnit.test('applyChange throws an error if the change is not applyable', function(assert) {
		assert.throws(function () {
			var oElement = new Element();
			this.oChangeHandler.applyChange(this.oChange, oElement, {modifier: JsControlTreeModifier});
		}, new Error("Provided control instance has no setVisible method"), "change handler throws an error that the control has no setter for visible");
	});

});