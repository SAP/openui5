/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/changeHandler/UnstashControl",
	"sap/ui/fl/Change",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/ui/core/mvc/XMLView",
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
	XMLView,
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
				changeType: "unstashControl",
				selector: {
					id: "key"
				},
				content: {
					parentAggregationName: "sections",
					index: 0
				}
			};
			this.oChange = new Change(oChangeJson);

			var oNonMoveChangeJson = {
				changeType: "unstashControl",
				selector: {
					id: "key"
				},
				content: {
				}
			};
			this.oNonMoveChange = new Change(oNonMoveChangeJson);

			this.oObjectPageSection1 = new ObjectPageSection();
			this.oObjectPageSection2 = new ObjectPageSection();
			this.oPlaceholderSection = new ObjectPageSection({
				id: "stashedSection"
			});
			this.oObjectPageSectionInvisible = new ObjectPageSection("invisible"); // for XML modifier

			this.oObjectPageLayout = new ObjectPageLayout({
				sections: [this.oObjectPageSection1, this.oObjectPageSection2, this.oPlaceholderSection, this.oObjectPageSectionInvisible]
			});

			var oDOMParser = new DOMParser();
			this.xmlString =
				'<mvc:View  xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:uxap="sap.uxap">' +
					'<uxap:ObjectPageLayout id="OPL" flexEnabled="true">' +
						'<uxap:sections>' +
							'<uxap:ObjectPageSection id="section0"></uxap:ObjectPageSection>' +
							'<uxap:ObjectPageSection id="section1"></uxap:ObjectPageSection>' +
							'<uxap:ObjectPageSection id="stashedSection" stashed="true"></uxap:ObjectPageSection>' +
							'<uxap:ObjectPageSection id="section3" visible = "false"></uxap:ObjectPageSection>' +
						'</uxap:sections>' +
					'</uxap:ObjectPageLayout>' +
				'</mvc:View>';

			this.xmlDocument = oDOMParser.parseFromString(this.xmlString, "application/xml");
			this.oXmlView = this.xmlDocument.documentElement;

			this.oXmlLayout = this.oXmlView.childNodes[0];
			this.oXmlObjectPageSection1 = this.oXmlLayout.childNodes[0].childNodes[0];
			this.oXmlObjectPageSection2 = this.oXmlLayout.childNodes[0].childNodes[1];
			this.oXmlObjectPageSection3 = this.oXmlLayout.childNodes[0].childNodes[2];
			this.oXmlObjectPageSection4 = this.oXmlLayout.childNodes[0].childNodes[3];

			/*this.oObjectPageSection3 = StashedControlSupport.createStashedControl("sap-ui-stashed-" + this.oXmlObjectPageSection3.getAttribute("id"), {
				sParentId: this.oObjectPageLayout.getId(),
				sWrapperId: "stashedSection",
				sParentAggregationName: "sections",
				fnCreate: function () {
					//use same id of stashed control
					this.oObjectPageSection3 = new ObjectPageSection(this.oXmlObjectPageSection3.getAttribute("id"));
					return [this.oObjectPageSection3];
				}.bind(this)
			});*/

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
			return XMLView.create({definition: this.xmlString}).then(function(oView) {
				var oStashedSection = oView.byId("stashedSection");
				assert.equal(oStashedSection.isStashed(), true, "isStashed() before unstashing is true");
				var oControl = this.oChangeHandler.applyChange(this.oChange, oStashedSection, {modifier: JsControlTreeModifier, appComponent: oMockUIComponent});
				assert.ok(oControl instanceof ObjectPageSection, "then the initialized control during unstashing is returned");
				assert.equal(oControl.getVisible(), true, "unstashed ObjectPageSection is visible");
				assert.equal(oControl.isStashed(), false, "isStashed() after unstashing is false");
				assert.deepEqual(oView.byId("OPL").getAggregation("sections")[0], oControl, "unstashed ObjectPageSection is unstashed and moved to index 0");
			}.bind(this));
		});

		QUnit.test('revertChange is called with a stashed ObjectPageSection on a js control tree', function(assert) {
			return XMLView.create({definition: this.xmlString}).then(function(oView) {
				var oStashedSection = oView.byId("stashedSection");
				var oUnstashedSection = this.oChangeHandler.applyChange(this.oChange, oStashedSection, {modifier: JsControlTreeModifier});
				this.oChangeHandler.revertChange(this.oChange, oUnstashedSection, {modifier: JsControlTreeModifier});
				var oRevertedSection = oView.byId("stashedSection");
				assert.equal(oRevertedSection.isStashed(), false, "isStashed() is still false");
				assert.equal(oRevertedSection.getVisible(), false, "the control is not visible");
			}.bind(this));
		});

		QUnit.test('applyChange is called with an invisible ObjectPageSection on a js control tree', function(assert) {
			this.oObjectPageSectionInvisible.setVisible(false);
			assert.equal(this.oObjectPageSectionInvisible.isStashed(), false, "isStashed() before unstashing is false");
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier});
			assert.equal(this.oObjectPageSectionInvisible.getVisible(), true, "ObjectPageSection is now visible");
			assert.equal(this.oObjectPageSectionInvisible.isStashed(), false, "isStashed() after unstashing is still false");
			assert.deepEqual(this.oObjectPageLayout.getAggregation("sections")[0], this.oObjectPageSectionInvisible, "ObjectPageSection is at the first position");
		});

		QUnit.test('revertChange is called with a visible ObjectPageSection on a js control tree', function(assert) {
			this.oObjectPageSectionInvisible.setVisible(false);
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier});
			this.oChangeHandler.revertChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier});
			assert.equal(this.oObjectPageSectionInvisible.getVisible(), false, "ObjectPageSection is now invisible again");
			assert.equal(this.oObjectPageSectionInvisible.isStashed(), false, "isStashed() after unstashing is still false");
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
			return XMLView.create({definition: this.xmlString}).then(function(oView) {
				var oStashedSection = oView.byId("stashedSection");
				var oUnstashedSection = this.oChangeHandler.applyChange(this.oNonMoveChange, oStashedSection, {modifier: JsControlTreeModifier});
				assert.equal(oUnstashedSection.getVisible(), true, "unstashed ObjectPageSection is visible");
				assert.equal(oUnstashedSection.isStashed(), false, "isStashed() for unstashed ObjectPageSection is false");
				assert.deepEqual(oView.byId("OPL").getAggregation("sections")[2], oUnstashedSection, "unstashed ObjectPageSection is still at 3. position");
			}.bind(this));
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