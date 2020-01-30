/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/UnstashControl",
	"sap/ui/fl/Change",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/UIComponent"
], function(
	jQuery,
	UnstashControlChangeHandler,
	Change,
	ObjectPageLayout,
	ObjectPageSection,
	JsControlTreeModifier,
	XmlTreeModifier,
	StashedControlSupport,
	UIComponent
) {
	"use strict";

	var oMockUIComponent = new UIComponent("mockComponent");

	QUnit.module("sap.ui.fl.changeHandler.UnstashControl", {
		beforeEach: function() {
			this.oChangeHandler = UnstashControlChangeHandler;
			var oChangeJson = {
				changeType : "unstashControl",
				selector: {
					id: "key"
				},
				content: {
					parentAggregationName : "sections",
					index : 0
				}
			};
			this.oChange = new Change(oChangeJson);

			var oNonMoveChangeJson = {
				changeType : "unstashControl",
				selector: {
					id: "key"
				},
				content: {
				}
			};
			this.oNonMoveChange = new Change(oNonMoveChangeJson);

			this.oObjectPageSection1 = new ObjectPageSection();
			this.oObjectPageSection2 = new ObjectPageSection();
			this.oObjectPageSectionInvisible = new ObjectPageSection("invisible"); // for XML modifier

			this.oObjectPageLayout = new ObjectPageLayout({
				sections : [this.oObjectPageSection1, this.oObjectPageSection2, this.oObjectPageSectionInvisible]
			});

			var oDOMParser = new DOMParser();
			var oXmlString =
				'<mvc:View  xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:uxap="sap.uxap"><uxap:ObjectPageLayout id="' + this.oObjectPageLayout.getId() + '" flexEnabled="true">' +
					'<sections>' +
						'<uxap:ObjectPageSection id="' + this.oObjectPageSection1.getId() + '"></uxap:ObjectPageSection>' +
						'<uxap:ObjectPageSection id="' + this.oObjectPageSection2.getId() + '"></uxap:ObjectPageSection>' +
						'<uxap:ObjectPageSection id="stashedSection" stashed="true"></uxap:ObjectPageSection>' +
						'<uxap:ObjectPageSection id="' + this.oObjectPageSectionInvisible.getId() + '" visible = "false"></uxap:ObjectPageSection>' +
					'</sections>' +
				'</uxap:ObjectPageLayout></mvc:View>';
			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;

			this.oXmlLayout = this.oXmlView.childNodes[0];
			this.oXmlObjectPageSection1 = this.oXmlLayout.childNodes[0].childNodes[0];
			this.oXmlObjectPageSection2 = this.oXmlLayout.childNodes[0].childNodes[1];
			this.oXmlObjectPageSection3 = this.oXmlLayout.childNodes[0].childNodes[2];
			this.oXmlObjectPageSection4 = this.oXmlLayout.childNodes[0].childNodes[3];

			this.oObjectPageSection3 = StashedControlSupport.createStashedControl(this.oXmlObjectPageSection3.getAttribute("id"), {
				sParentId: this.oObjectPageLayout.getId(),
				sParentAggregationName: "sections",
				fnCreate: function () {
					//use same id of stashed control
					this.oObjectPageSection3 = new ObjectPageSection(this.oXmlObjectPageSection3.getAttribute("id"));
					return [this.oObjectPageSection3];
				}.bind(this)
			});

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oChange = null;
			this.oObjectPageLayout.destroy();
		}
	}, function() {
		QUnit.test('applyChange is called with a stashed ObjectPageSection on an xml control tree', function(assert) {
			var oControl = this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView});
			assert.deepEqual(oControl, this.oXmlObjectPageSection3, "then the passed control node is returned");
		});

		QUnit.test('applyChange is called with a stashed ObjectPageSection on a js control tree', function(assert) {
			assert.equal(this.oObjectPageSection3.getStashed(), true, "getStashed() before unstashing is true");
			var oControl = this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection3, {modifier: JsControlTreeModifier, appComponent: oMockUIComponent});
			assert.ok(oControl instanceof ObjectPageSection, "then the initialized control during unstashing is returned");
			assert.equal(this.oObjectPageSection3.getVisible(), true, "unstashed ObjectPageSection is visible");
			assert.equal(this.oObjectPageSection3.getStashed(), undefined, "getStashed() after unstashing is undefined");
			assert.deepEqual(this.oObjectPageLayout.getAggregation("sections")[0], this.oObjectPageSection3, "unstashed ObjectPageSection is at the first position");
		});

		QUnit.test('revertChange is called with a stashed ObjectPageSection on a js control tree', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection3, {modifier: JsControlTreeModifier});
			this.oChangeHandler.revertChange(this.oChange, this.oObjectPageSection3, {modifier: JsControlTreeModifier});
			assert.equal(this.oObjectPageSection3.getStashed(), undefined, "getStashed() is still undefined");
			assert.equal(this.oObjectPageSection3.getVisible(), false, "the control is not visible");
		});

		QUnit.test('applyChange is called with an invisible ObjectPageSection on a js control tree', function(assert) {
			this.oObjectPageSectionInvisible.setVisible(false);
			assert.equal(this.oObjectPageSectionInvisible.getStashed(), undefined, "getStashed() before unstashing is undefined");
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier});
			assert.equal(this.oObjectPageSectionInvisible.getVisible(), true, "ObjectPageSection is now visible");
			assert.equal(this.oObjectPageSectionInvisible.getStashed(), undefined, "getStashed() after unstashing is still undefined");
			assert.deepEqual(this.oObjectPageLayout.getAggregation("sections")[0], this.oObjectPageSectionInvisible, "ObjectPageSection is at the first position");
		});

		QUnit.test('revertChange is called with a visible ObjectPageSection on a js control tree', function(assert) {
			this.oObjectPageSectionInvisible.setVisible(false);
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier});
			this.oChangeHandler.revertChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier});
			assert.equal(this.oObjectPageSectionInvisible.getVisible(), false, "ObjectPageSection is now invisible again");
			assert.equal(this.oObjectPageSectionInvisible.getStashed(), undefined, "getStashed() after unstashing is still undefined");
		});

		QUnit.test('applyChange is called with a stashed ObjectPageSection on an xml tree', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView});
			assert.equal(this.oXmlObjectPageSection3.getAttribute("stashed"), null, "xml stashed node doesn't have the stashed attribute");
			assert.deepEqual(this.oXmlLayout.childNodes[0].childNodes[0], this.oXmlObjectPageSection3, "unstashed ObjectPageSection is at first position");
		});

		QUnit.test('applyChange is called with an invisible ObjectPageSection on an xml tree, followed by a revert on js control tree', function(assert) {
			assert.equal(this.oXmlObjectPageSection4.getAttribute("visible"), "false", "initially xml invisible node visible property is false");
			assert.equal(this.oXmlObjectPageSection3.getAttribute("visible"), null, "xml stashed node doesn't have the visible property");

			this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection4, {modifier: XmlTreeModifier, view: this.oXmlView});
			assert.deepEqual(this.oXmlLayout.childNodes[0].childNodes[0], this.oXmlObjectPageSection4, "invisible ObjectPageSection unstashed at first position");

			this.oChangeHandler.revertChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier});
			assert.equal(this.oObjectPageSectionInvisible.getVisible(), false, "then the section is made invisible on revert again");
		});

		QUnit.test('revertChange is called with a ObjectPageSection on an xml tree', function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView});
			this.oChangeHandler.revertChange(this.oChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView});
			assert.equal(this.oXmlObjectPageSection3.getAttribute("stashed"), "true", "xml stashed node has the stashed attribute added and set to true ");
		});

		QUnit.test('no move - applyChange on a js control tree', function(assert) {
			this.oChangeHandler.applyChange(this.oNonMoveChange, this.oObjectPageSection3, {modifier: JsControlTreeModifier});
			assert.equal(this.oObjectPageSection3.getVisible(), true, "unstashed ObjectPageSection is visible");
			assert.equal(this.oObjectPageSection3.getStashed(), undefined, "getStashed() for unstashed ObjectPageSection is undefined");
			assert.deepEqual(this.oObjectPageLayout.getAggregation("sections")[3], this.oObjectPageSection3, "unstashed ObjectPageSection is still at 3. position");
		});

		QUnit.test('no move - applyChange on an xml tree', function(assert) {
			this.oChangeHandler.applyChange(this.oNonMoveChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView});
			assert.equal(this.oXmlObjectPageSection3.getAttribute("stashed"), null, "xml stashed node doesn't have the stashed attribute");
			assert.deepEqual(this.oXmlLayout.childNodes[0].childNodes[2], this.oXmlObjectPageSection3, "unstashed ObjectPageSection is still at 3. position");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});