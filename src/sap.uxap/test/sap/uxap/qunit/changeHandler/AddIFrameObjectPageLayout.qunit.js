/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/uxap/changeHandler/AddIFrameObjectPageLayout",
	"sap/ui/fl/Change",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/XmlTreeModifier",
	"sap/ui/core/mvc/View",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection"
], function(
	jQuery,
	AddIFrameObjectPageLayout,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	View,
	ObjectPageLayout,
	ObjectPageSection
) {
	"use strict";

	var BASE_ID = "test";
	var EXAMPLE_URL = "http://www.sap.com";

	QUnit.module("Given a AddIFrameObjectPageLayout Change Handler", {
		beforeEach : function() {
			this.oMockedAppComponent = {
				getLocalId: function () {
					return undefined;
				}
			};

			this.oChangeHandler = AddIFrameObjectPageLayout;
			this.oObjectPageLayout = new ObjectPageLayout("obp", {
				sections: [
					new ObjectPageSection()
				]
			});

			this.oView = new View({content : [
				this.oObjectPageLayout
			]});

			var mExpectedSelector = {
				id: this.oObjectPageLayout.getId(),
				type: "sap.uxap.ObjectPageLayout"
			};

			var oChangeJson = {
				reference: "sap.uxap.qunit.changeHander.AddIFrameObjectPageLayout",
				validAppVersions: {
					creation: "1.0.0"
				},
				selector: mExpectedSelector,
				changeType: "addIFrame",
				fileName: "AddIFrameChange",
				projectId: "projectId"
			};

			this.mChangeSpecificContent = {
				targetAggregation: "sections",
				baseId: BASE_ID,
				url: EXAMPLE_URL
			};

			this.mSpecificChangeData = {
				selector : mExpectedSelector,
				changeType : "addIFrame",
				content : this.mChangeSpecificContent
			};

			this.oChange = new Change(oChangeJson);

			this.mPropertyBag = {
				modifier : JsControlTreeModifier,
				view : this.oView,
				appComponent : this.oMockedAppComponent
			};
		},
		afterEach : function() {
			this.oObjectPageLayout.destroy();
		}
	}, function() {
		["targetAggregation", "baseId", "url"].forEach(function (sRequiredProperty) {
			QUnit.test("When calling 'completeChangeContent' without '" + sRequiredProperty + "'", function(assert) {
				delete this.mChangeSpecificContent[sRequiredProperty];
				assert.throws(
					function() {
						this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
					},
					Error("Attribute missing from the change specific content '" + sRequiredProperty + "'"),
					"without " + sRequiredProperty + " 'completeChangeContent' throws an error"
				);
			});
		});
	});

	QUnit.module("Given a AddIFrameObjectPageLayout Change Handler with JSTreeModifier", {
		beforeEach : function () {
			this.oMockedAppComponent = {
				getLocalId: function () {
					return undefined;
				}
			};

			this.oChangeHandler = AddIFrameObjectPageLayout;

			this.sObjectPageLayoutId = "obp";

			var mExpectedSelector = {
				id: this.sObjectPageLayoutId,
				type: "sap.uxap.ObjectPageLayout"
			};

			var oChangeJson = {
				selector: mExpectedSelector,
                reference: "sap.uxap.qunit.changeHander.AddIFrameObjectPageLayout",
				validAppVersions: {
					creation: "1.0.0"
				},
				changeType: "addIFrame",
				fileName: "AddIFrameChange",
				projectId: "projectId"
			};

			this.mChangeSpecificContent = {
				targetAggregation: "sections",
				baseId: BASE_ID,
				url: EXAMPLE_URL
			};

			this.mSpecificChangeData = {
				selector : mExpectedSelector,
				changeType : "addIFrame",
				content : this.mChangeSpecificContent
			};

			this.oChange = new Change(oChangeJson);

			// JSTreeModifier specific beforeEach
			this.oObjectPageSection = new ObjectPageSection();

			this.oObjectPageLayout = new ObjectPageLayout(this.sObjectPageLayoutId, {
				sections: [this.oObjectPageSection]
			});

			this.oObjectPageLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.mPropertyBag = {
				modifier : JsControlTreeModifier,
				view : {
					getController : function () {},
					getId : function () {},
					createId: function (sId) { return sId; }
				},
				appComponent: this.oMockedAppComponent
			};

			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
		},
		afterEach : function () {
			this.oObjectPageLayout.destroy();
		}
	}, function () {
		function _checkCreatedSection (assert, iExpectedCreatedSectionIndex) {
			assert.strictEqual(this.oObjectPageLayout.getSections().length, 2, "after the change there are 2 sections in the object page layout");
			var oCreatedSection = this.oObjectPageLayout.getSections()[iExpectedCreatedSectionIndex];
			assert.ok(oCreatedSection.getId() === BASE_ID, "the created section matches the expected baseId");
			var aSubSections = oCreatedSection.getSubSections();
			assert.strictEqual(aSubSections.length, 1, "The created section contains one sub section");
			var oCreatedSubSection = aSubSections[0];
			assert.ok(oCreatedSubSection.getId().indexOf(BASE_ID) === 0, "the created sub section starts with the expected baseId");
			var aBlocks = oCreatedSubSection.getBlocks();
			assert.strictEqual(aBlocks.length, 1, "The created sub section contains one block");
			var oCreatedIFrame = aBlocks[0];
			assert.ok(oCreatedIFrame.getId().indexOf(BASE_ID) === 0, "the created IFrame starts with the expected baseId");
			assert.strictEqual(oCreatedIFrame.getUrl(), EXAMPLE_URL, "the created IFrame has the correct URL");
		}

		QUnit.test("When applying the change on a js control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);
			_checkCreatedSection.call(this, assert, 1);
		});

		QUnit.test("When applying the change on a js control tree (index = 0)", function(assert) {
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);
			_checkCreatedSection.call(this, assert, 0);
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);},
				Error,
				"then apply change throws an error"
			);
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);
			this.oChangeHandler.revertChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);
			assert.strictEqual(this.oObjectPageLayout.getSections().length, 1, "after reversal there is again only one section of the object page layout");
			assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
		});
	});

	QUnit.module("Given a AddIFrame Change Handler with XMLTreeModifier", {
		beforeEach : function() {
			this.oChangeHandler = AddIFrameObjectPageLayout;

			this.sObjectPageLayoutId = "hbx";

			var mExpectedSelector = {
				id: this.sObjectPageLayoutId,
				type: "sap.uxap.ObjectPageLayout"
			};

			var oChangeJson = {
				selector: mExpectedSelector,
				reference: "sap.uxap.qunit.changeHander.AddIFrameObjectPageLayout",
				validAppVersions: {
					creation: "1.0.0"
				},
				changeType: "AddIFrame",
				fileName: "AddIFrameChange",
				projectId: "projectId"
			};

			this.mChangeSpecificContent = {
				targetAggregation: "sections",
				baseId: BASE_ID,
				url: EXAMPLE_URL
			};

			this.mSpecificChangeData = {
				selector : mExpectedSelector,
				changeType : "addIFrame",
				content : this.mChangeSpecificContent
			};

			this.oChange = new Change(oChangeJson);

			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				metadata: {
					manifest: "json"
				}
			});
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap">' +
				'<ObjectPageLayout id="' + this.sObjectPageLayoutId + '">' +
				'<sections>' +
				'<ObjectPageSection />' +
				'</sections>' +
				'</ObjectPageLayout>' +
				'</mvc:View>';
			this.oXmlView = jQuery.sap.parseXML(this.oXmlString, "application/xml").documentElement;
			this.oObjectPageLayout = this.oXmlView.childNodes[0];

			this.mPropertyBag = {
				modifier: XmlTreeModifier,
				view: this.oXmlView,
				appComponent: this.oComponent
			};

			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
		},
		afterEach : function() {
			this.oComponent.destroy();
		}
	}, function() {
		function _checkCreatedSection (assert, iExpectedCreatedSectionIndex) {
			var oObjectPageLayoutSectionsAggregation = this.oObjectPageLayout.childNodes[0];
			assert.strictEqual(oObjectPageLayoutSectionsAggregation.childNodes.length, 2, "after the addXML there are two sections in the object page layout");
			var oCreatedSection = oObjectPageLayoutSectionsAggregation.childNodes[iExpectedCreatedSectionIndex];
			assert.ok(oCreatedSection.getAttribute("id") === BASE_ID, "the created sections matches the expected baseId");
			var aSubSections = oCreatedSection.childNodes;
			assert.strictEqual(aSubSections.length, 1, "The created section contains one sub section");
			var oCreatedSubSection = aSubSections[0];
			assert.ok(oCreatedSubSection.getAttribute("id").indexOf(BASE_ID) === 0, "the created sub section starts with the expected baseId");
			var aBlocks = oCreatedSubSection.childNodes;
			assert.strictEqual(aBlocks.length, 1, "The created sub section contains one block");
			var oCreatedIFrame = aBlocks[0];
			assert.ok(oCreatedIFrame.getAttribute("id").indexOf(BASE_ID) === 0, "the created IFrame starts with the expected baseId");
			assert.strictEqual(oCreatedIFrame.getAttribute("url"), EXAMPLE_URL, "the created IFrame has the correct URL");
		}

		QUnit.test("When applying the change on a xml control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);
			_checkCreatedSection.call(this, assert, 1);
		});

		QUnit.test("When applying the change on a xml control tree (index = 0)", function(assert) {
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);
			_checkCreatedSection.call(this, assert, 0);
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			assert.throws(
				function() {this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);},
				Error,
				"then apply change throws an error"
			);
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);
			this.oChangeHandler.revertChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag);
			var oObjectPageLayoutSectionsAggregation = this.oObjectPageLayout.childNodes[0];
			assert.strictEqual(oObjectPageLayoutSectionsAggregation.childNodes.length, 1, "after reversal there is again only one section in the object page layout");
			assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
