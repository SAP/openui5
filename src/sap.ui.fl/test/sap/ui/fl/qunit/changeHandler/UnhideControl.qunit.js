/*global QUnit*/

jQuery.sap.require("sap.ui.fl.changeHandler.UnhideControl");
jQuery.sap.require("sap.ui.core.Control");
jQuery.sap.require("sap.ui.core.Element");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");


(function(UnhideControlChangeHandler, Control, Element, Change, JsControlTreeModifier, XmlTreeModifier) {
	"use strict";

	QUnit.module("sap.ui.fl.changeHandler.UnhideControl", {
		beforeEach: function() {
			this.stubs = [];
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
			this.stubs.forEach(function(stub) {
				stub.restore();
			});
		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		var oControl = new Control();
		oControl.setVisible(false);

		assert.ok(this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier}));

		assert.equal(oControl.getVisible(), true);
	});

	QUnit.test('applyChange on a xml tree', function(assert) {
		var oDOMParser = new DOMParser();
		var oXmlDocument = oDOMParser.parseFromString("<Button xmlns='sap.m' text='foo' visible='false' />", "application/xml");
		this.oXmlButton = oXmlDocument.childNodes[0];

		assert.ok(this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier}));

		assert.strictEqual(this.oXmlButton.getAttribute("visible"), null, "xml button node has the visible attribute removed");
	});

	QUnit.test('applyChange throws an error if the change is not applyable', function(assert) {
		assert.throws(function () {
			var oElement = new Element();
			this.oChangeHandler.applyChange(this.oChange, oElement, {modifier: JsControlTreeModifier});
		}, new Error("Provided control instance has no setVisible method"), "change handler throws an error that the control has no setter for visible");


	});

	QUnit.test('completeChangeContent', function(assert) {

		var oChangeJson = {
			"selector": {
				"id": "key"
			}
		};

		var oChange = new Change(oChangeJson);
		var oSpecificChangeInfo = {};

		this.oChangeHandler.completeChangeContent(oChange, oSpecificChangeInfo, JsControlTreeModifier);

		oChangeJson = oChange.getDefinition();

		assert.equal(Object.keys(oChangeJson.content).length, 0);

	});

}(sap.ui.fl.changeHandler.UnhideControl, sap.ui.core.Control, sap.ui.core.Element, sap.ui.fl.Change, sap.ui.fl.changeHandler.JsControlTreeModifier, sap.ui.fl.changeHandler.XmlTreeModifier));
