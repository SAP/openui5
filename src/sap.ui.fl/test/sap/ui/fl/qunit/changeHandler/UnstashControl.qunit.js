/*global QUnit*/

sap.ui.require([
	"sap/ui/fl/changeHandler/UnstashControl",
	"sap/ui/core/Control",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/Element",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier"
], function(UnstashControlChangeHandler, Control, ObjectPageLayout, ObjectPageSection, StashedControlSupport, Element, Change, JsControlTreeModifier, XmlTreeModifier) {
	"use strict";

	QUnit.module("sap.ui.fl.changeHandler.UnstashControl", {
		beforeEach: function() {
			this.oChangeHandler = UnstashControlChangeHandler;
			var oChangeJson = {
					"changeType" : "unstashControl",
					"selector": {
						"id": "key"
					},
					"content": {
						"parentAggregationName" : "sections",
						"index" : 0
					}
			};
			this.oChange = new Change(oChangeJson);

			var oNonMoveChangeJson = {
					"changeType" : "unstashControl",
					"selector": {
						"id": "key"
					},
					"content": {
					}
			};
			this.oNonMoveChange = new Change(oNonMoveChangeJson);

			this.oObjectPageSection1 = new ObjectPageSection();
			this.oObjectPageSection2 = new ObjectPageSection();
			this.oObjectPageSection3 = new ObjectPageSection();

			this.oObjectPageLayout = new ObjectPageLayout({
				sections : [this.oObjectPageSection1, this.oObjectPageSection2, this.oObjectPageSection3]
			});

			var oDOMParser = new DOMParser();
			var oXmlString =
				'<mvc:View  xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:uxap="sap.uxap"><uxap:ObjectPageLayout id="' + this.oObjectPageLayout.getId() + '" flexEnabled="true">' +
					'<sections>' +
						'<uxap:ObjectPageSection id="' + this.oObjectPageSection1.getId() + '"></uxap:ObjectPageSection>' +
						'<uxap:ObjectPageSection id="' + this.oObjectPageSection2.getId() + '"></uxap:ObjectPageSection>' +
						'<uxap:ObjectPageSection id="' + this.oObjectPageSection3.getId() + '" stashed="true"></uxap:ObjectPageSection>' +
					'</sections>' +
				'</uxap:ObjectPageLayout></mvc:View>';
			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument;

			this.oXmlLayout = oXmlDocument.childNodes[0].childNodes[0];
			this.oXmlObjectPageSection1 = this.oXmlLayout.childNodes[0].childNodes[0];
			this.oXmlObjectPageSection2 = this.oXmlLayout.childNodes[0].childNodes[1];
			this.oXmlObjectPageSection3 = this.oXmlLayout.childNodes[0].childNodes[2];
		},
		afterEach: function() {

		}
	});

	QUnit.test('applyChange on a js control tree', function(assert) {
		assert.ok(this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection3, {modifier: JsControlTreeModifier}));
		assert.equal(this.oObjectPageSection3.getVisible(), true, "unstashed ObjectPageSection is visible");
		assert.equal(this.oObjectPageSection3.getStashed(), undefined, "getStashed() for unstashed ObjectPageSection is undefined");
		assert.deepEqual(this.oObjectPageLayout.getAggregation("sections")[0], this.oObjectPageSection3, "unstashed ObjectPageSection is at first position");
	});

	QUnit.test('applyChange on a xml tree', function(assert) {
		assert.ok(this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView}));
		assert.equal(this.oXmlObjectPageSection3.getAttribute("stashed"), "false", "xml stashed node has the stashed attribute added and set to false");
		assert.deepEqual(this.oXmlLayout.childNodes[0].childNodes[0], this.oXmlObjectPageSection3, "unstashed ObjectPageSection is at first position");
	});


	QUnit.test('no move - applyChange on a js control tree', function(assert) {
		assert.ok(this.oChangeHandler.applyChange(this.oNonMoveChange, this.oObjectPageSection3, {modifier: JsControlTreeModifier}));
		assert.equal(this.oObjectPageSection3.getVisible(), true, "unstashed ObjectPageSection is visible");
		assert.equal(this.oObjectPageSection3.getStashed(), undefined, "getStashed() for unstashed ObjectPageSection is undefined");
		assert.deepEqual(this.oObjectPageLayout.getAggregation("sections")[2], this.oObjectPageSection3, "unstashed ObjectPageSection is still at 3. position");
	});

	QUnit.test('no move - applyChange on a xml tree', function(assert) {
		assert.ok(this.oChangeHandler.applyChange(this.oNonMoveChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView}));
		assert.equal(this.oXmlObjectPageSection3.getAttribute("stashed"), "false", "xml stashed node has the stashed attribute added and set to false");
		assert.deepEqual(this.oXmlLayout.childNodes[0].childNodes[2], this.oXmlObjectPageSection3, "unstashed ObjectPageSection is still at 3. position");
	});
});