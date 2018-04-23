/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/changeHandler/StashControl",
	"sap/ui/core/Control",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/Element",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier"
], function(
	StashControlChangeHandler,
	Control,
	StashedControlSupport,
	Element,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier
) {
	'use strict';
	QUnit.start();

	// mix-in stash functionality
	StashedControlSupport.mixInto(Control, true);

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
			this.oChange = null;
		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		var oControl = new Control();

		this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
		assert.equal(oControl.getVisible(), false);
	});

	QUnit.test('revertChange on a js control tree', function(assert) {
		var oControl = new Control();

		this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
		this.oChangeHandler.revertChange(this.oChange, oControl, {modifier: JsControlTreeModifier});
		assert.strictEqual(oControl.getVisible(), true, 'should be visible');
	});

	QUnit.test('applyChange on a xml tree', function(assert) {
		var oDOMParser = new DOMParser();
		var oXmlDocument = oDOMParser.parseFromString("<ObjectPageSection xmlns='sap.uxap' id='ObjectPageSection' title='ObjectPage Section 1' stashed='false' />", "application/xml");
		this.oXmlObjectPage = oXmlDocument.childNodes[0];

		this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPage, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlObjectPage.getAttribute("stashed"), "true", "xml button node has the unstashed attribute added and set to true");
	});

	QUnit.test('revertChange on a xml tree', function(assert) {
		var oDOMParser = new DOMParser();
		var oXmlDocument = oDOMParser.parseFromString("<ObjectPageSection xmlns='sap.uxap' id='ObjectPageSection' title='ObjectPage Section 1' stashed='true' />", "application/xml");
		this.oXmlObjectPage = oXmlDocument.childNodes[0];

		this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPage, {modifier: XmlTreeModifier});
		this.oChangeHandler.revertChange(this.oChange, this.oXmlObjectPage, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlObjectPage.getAttribute("stashed"), "true", "xml button node has the unstashed attribute added and set to true");
	});

});
