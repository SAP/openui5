/*global QUnit*/

sap.ui.require([
	"sap/ui/fl/changeHandler/StashControl",
	"sap/ui/core/Control",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/Element",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier"
], function(StashControlChangeHandler, Control, StashedControlSupport, Element, Change, JsControlTreeModifier, XmlTreeModifier) {
	"use strict";

	QUnit.module("sap.ui.fl.changeHandler.StashControl", {
		beforeEach: function() {
			this.oChangeHandler = StashControlChangeHandler;
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

		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		jQuery.sap.require("sap.ui.core.StashedControlSupport");
		StashedControlSupport.mixInto(Control);
		var oControl = new Control();
		oControl.setStashed(true);

		assert.ok(this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier}));

		assert.equal(oControl.getVisible(), false);
	});

	QUnit.test('applyChange on a xml tree', function(assert) {
		var oDOMParser = new DOMParser();
		var oXmlDocument = oDOMParser.parseFromString("<ObjectPageSection xmlns='sap.uxap' id='ObjectPageSection' title='ObjectPage Section 1' stashed='false' />", "application/xml");
		this.oXmlObjectPage = oXmlDocument.childNodes[0];

		this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPage, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlObjectPage.getAttribute("stashed"), "true", "xml button node has the unstashed attribute added and set to true");
	});
});
