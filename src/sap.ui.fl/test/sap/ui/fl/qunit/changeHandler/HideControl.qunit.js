jQuery.sap.require("sap.ui.fl.changeHandler.HideControl");
jQuery.sap.require("sap.ui.core.Control");
jQuery.sap.require("sap.ui.core.Element");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");

(function(HideControlChangeHandler, Control, Element, Change, JsControlTreeModifier, XmlTreeModifier) {

	"use strict";

	QUnit.module("sap.ui.fl.changeHandler.HideControl", {
		beforeEach: function() {
			this.stubs = [];
			this.oChangeHandler = HideControlChangeHandler;
			var oDOMParser = new DOMParser();
			this.oXmlDocument = oDOMParser.parseFromString("<Button text='" + this.OLD_VALUE + "' enabled='true' id='buttonId' />", "application/xml");
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
		oControl.setVisible(true);

		this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier});

		assert.equal(oControl.getVisible(), false);
	});


	QUnit.test('applyChange on a js control tree throws an exception if the change is not applicable', function(assert) {
		assert.throws(function () {
			var oElement = new Element();
			this.oChangeHandler.applyChange(this.oChange, oElement, {modifier: JsControlTreeModifier});
		}, new Error("Provided control instance has no setVisible method"), "change handler throws an error that the control has no setter for visible");
	});


	QUnit.test('applyChange on a xml tree', function() {
		this.oXmlButton = this.oXmlDocument.childNodes[0];

		this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {
			modifier: XmlTreeModifier,
			view: this.oXmlDocument
		});

		assert.equal(this.oXmlButton.getAttribute("visible"), "false", "xml button node has the visible attribute added and set to false");
	});


	QUnit.test('completeChangeContent', function(assert) {
		var oSpecificChangeInfo = {};

		this.oChangeHandler.completeChangeContent(this.oChange, oSpecificChangeInfo);

		var oChangeJson = this.oChange.getDefinition();

		assert.equal(Object.keys(oChangeJson.content).length, 0);

	});

}(sap.ui.fl.changeHandler.HideControl, sap.ui.core.Control, sap.ui.core.Element, sap.ui.fl.Change, sap.ui.fl.changeHandler.JsControlTreeModifier, sap.ui.fl.changeHandler.XmlTreeModifier));
