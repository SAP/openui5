/*global QUnit*/

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/changeHandler/UnstashControl",
	"sap/ui/fl/Change",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/ui/core/Core"
], function(
	XMLView,
	JsControlTreeModifier,
	XmlTreeModifier,
	UIComponent,
	UnstashControlChangeHandler,
	Change,
	ObjectPageLayout,
	ObjectPageSection,
	oCore
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

			oCore.applyChanges();
		},
		afterEach: function() {
			this.oChange = null;
			this.oObjectPageLayout.destroy();
		}
	}, function() {
		QUnit.test("applyChange is called with a stashed ObjectPageSection on an xml control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView})
				.then(function(oControl) {
					assert.deepEqual(oControl, this.oXmlObjectPageSection3, "then the passed control node is returned");
				}.bind(this));
		});

		QUnit.test("applyChange is called with a stashed ObjectPageSection on a js control tree", function(assert) {
			var oView;

			return XMLView.create({definition: this.xmlString})
				.then(function(oCreatedView) {
					oView = oCreatedView;
					var oStashedSection = oView.byId("stashedSection");
					assert.equal(oStashedSection.isStashed(), true, "isStashed() before unstashing is true");
					return this.oChangeHandler.applyChange(this.oChange, oStashedSection, {modifier: JsControlTreeModifier, appComponent: oMockUIComponent});
				}.bind(this))
				.then(function(oControl) {
					assert.ok(oControl instanceof ObjectPageSection, "then the initialized control during unstashing is returned");
					assert.equal(oControl.getVisible(), true, "unstashed ObjectPageSection is visible");
					assert.equal(oControl.isStashed(), false, "isStashed() after unstashing is false");
					assert.deepEqual(oView.byId("OPL").getAggregation("sections")[0], oControl, "unstashed ObjectPageSection is unstashed and moved to index 0");
				});
		});

		QUnit.test("revertChange is called with a stashed ObjectPageSection on a js control tree", function(assert) {
			var oView;
			return XMLView.create({definition: this.xmlString})
				.then(function(oCreatedView) {
					oView = oCreatedView;
					var oStashedSection = oView.byId("stashedSection");
					return this.oChangeHandler.applyChange(this.oChange, oStashedSection, {modifier: JsControlTreeModifier});
				}.bind(this))
				.then(function(oUnstashedSection) {
					return this.oChangeHandler.revertChange(this.oChange, oUnstashedSection, {modifier: JsControlTreeModifier});
				}.bind(this))
				.then(function() {
					var oRevertedSection = oView.byId("stashedSection");
					assert.equal(oRevertedSection.isStashed(), false, "isStashed() is still false");
					assert.equal(oRevertedSection.getVisible(), false, "the control is not visible");
				});
		});

		QUnit.test("applyChange is called with an invisible ObjectPageSection on a js control tree", function(assert) {
			this.oObjectPageSectionInvisible.setVisible(false);
			assert.equal(this.oObjectPageSectionInvisible.isStashed(), false, "isStashed() before unstashing is false");
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier})
				.then(function() {
					assert.equal(this.oObjectPageSectionInvisible.getVisible(), true, "ObjectPageSection is now visible");
					assert.equal(this.oObjectPageSectionInvisible.isStashed(), false, "isStashed() after unstashing is still false");
					assert.deepEqual(this.oObjectPageLayout.getAggregation("sections")[0], this.oObjectPageSectionInvisible, "ObjectPageSection is at the first position");
				}.bind(this));
		});

		QUnit.test("revertChange is called with a visible ObjectPageSection on a js control tree", function(assert) {
			this.oObjectPageSectionInvisible.setVisible(false);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier})
				.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler,
					this.oChange,
					this.oObjectPageSectionInvisible,
					{modifier: JsControlTreeModifier}))
				.then(function() {
					assert.equal(this.oObjectPageSectionInvisible.getVisible(), false, "ObjectPageSection is now invisible again");
					assert.equal(this.oObjectPageSectionInvisible.isStashed(), false, "isStashed() after unstashing is still false");
				}.bind(this));
		});

		QUnit.test("applyChange is called with a stashed ObjectPageSection on an xml tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView})
				.then(function() {
					assert.equal(this.oXmlObjectPageSection3.getAttribute("stashed"), null, "xml stashed node doesn't have the stashed attribute");
					assert.deepEqual(this.oXmlLayout.childNodes[0].childNodes[0], this.oXmlObjectPageSection3, "unstashed ObjectPageSection is at first position");
				}.bind(this));
		});

		QUnit.test("applyChange is called with an invisible ObjectPageSection on an xml tree, followed by a revert on js control tree", function(assert) {
			assert.equal(this.oXmlObjectPageSection4.getAttribute("visible"), "false", "initially xml invisible node visible property is false");
			assert.equal(this.oXmlObjectPageSection3.getAttribute("visible"), null, "xml stashed node doesn't have the visible property");

			return this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection4, {modifier: XmlTreeModifier, view: this.oXmlView})
				.then(function() {
					assert.deepEqual(this.oXmlLayout.childNodes[0].childNodes[0], this.oXmlObjectPageSection4, "invisible ObjectPageSection unstashed at first position");
					return this.oChangeHandler.revertChange(this.oChange, this.oObjectPageSectionInvisible, {modifier: JsControlTreeModifier});
				}.bind(this))
				.then(function() {
					assert.equal(this.oObjectPageSectionInvisible.getVisible(), false, "then the section is made invisible on revert again");
				}.bind(this));
		});

		QUnit.test("revertChange is called with a ObjectPageSection on an xml tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView})
				.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler,
					this.oChange,
					this.oXmlObjectPageSection3,
					{modifier: XmlTreeModifier, view: this.oXmlView}))
				.then(function() {
					assert.equal(this.oXmlObjectPageSection3.getAttribute("stashed"), "true", "xml stashed node has the stashed attribute added and set to true ");
				}.bind(this));
		});

		QUnit.test("no move - applyChange on a js control tree", function(assert) {
			var oView;
			return XMLView.create({definition: this.xmlString})
				.then(function(oCreatedView) {
					oView = oCreatedView;
					var oStashedSection = oView.byId("stashedSection");
					return this.oChangeHandler.applyChange(this.oNonMoveChange, oStashedSection, {modifier: JsControlTreeModifier});
				}.bind(this))
				.then(function(oUnstashedSection) {
					assert.equal(oUnstashedSection.getVisible(), true, "unstashed ObjectPageSection is visible");
					assert.equal(oUnstashedSection.isStashed(), false, "isStashed() for unstashed ObjectPageSection is false");
					assert.deepEqual(oView.byId("OPL").getAggregation("sections")[2], oUnstashedSection, "unstashed ObjectPageSection is still at 3. position");
				});
		});

		QUnit.test("no move - applyChange on an xml tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oNonMoveChange,	this.oXmlObjectPageSection3, {modifier: XmlTreeModifier, view: this.oXmlView})
				.then(function() {
					assert.equal(this.oXmlObjectPageSection3.getAttribute("stashed"), null, "xml stashed node doesn't have the stashed attribute");
					assert.deepEqual(this.oXmlLayout.childNodes[0].childNodes[2], this.oXmlObjectPageSection3, "unstashed ObjectPageSection is still at 3. position");
				}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});