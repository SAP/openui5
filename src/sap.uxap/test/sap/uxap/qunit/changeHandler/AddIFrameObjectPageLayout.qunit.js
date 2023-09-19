/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/uxap/changeHandler/AddIFrameObjectPageLayout",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/Core",
	"sap/ui/core/Component",
	"test-resources/sap/ui/fl/api/FlexTestAPI"
], function(
	jQuery,
	AddIFrameObjectPageLayout,
	JsControlTreeModifier,
	XmlTreeModifier,
	ObjectPageLayout,
	ObjectPageSection,
	XMLHelper,
	oCore,
	Component,
	FlexTestAPI
) {
	"use strict";

	var BASE_ID = "test";
	var EXAMPLE_URL = "exampleurl";

	QUnit.module("Given a AddIFrameObjectPageLayout Change Handler", {
		beforeEach: function() {
			this.oChangeHandler = AddIFrameObjectPageLayout;
			this.mChangeSpecificContent = {
				targetAggregation: "sections",
				baseId: BASE_ID,
				url: EXAMPLE_URL
			};
			this.mSpecificChangeData = {
				selector: {},
				changeType: "addIFrame",
				content: this.mChangeSpecificContent
			};
		}
	}, function() {
		["targetAggregation", "baseId", "url"].forEach(function (sRequiredProperty) {
			QUnit.test("When calling 'completeChangeContent' without '" + sRequiredProperty + "'", function(assert) {
				delete this.mChangeSpecificContent[sRequiredProperty];
				assert.throws(
					function() {
						this.oChangeHandler.completeChangeContent({}, this.mSpecificChangeData, {});
					},
					Error("Attribute missing from the change specific content '" + sRequiredProperty + "'"),
					"without " + sRequiredProperty + " 'completeChangeContent' throws an error"
				);
			});
		});
	});

	function beforeEachFunction() {
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

		this.mChangeSpecificContent = {
			targetAggregation: "sections",
			baseId: BASE_ID,
			url: EXAMPLE_URL
		};

		this.mSpecificChangeData = {
			selector: mExpectedSelector,
			changeType: "addIFrame",
			content: this.mChangeSpecificContent
		};

		// JSTreeModifier specific beforeEach
		this.oObjectPageSection = new ObjectPageSection();

		this.oObjectPageLayout = new ObjectPageLayout(this.sObjectPageLayoutId, {
			sections: [this.oObjectPageSection]
		});

		this.oObjectPageLayout.placeAt("qunit-fixture");
		oCore.applyChanges();

		this.mPropertyBag = {
			view: {
				getController: function () {},
				getId: function () {},
				createId: function (sId) { return sId; }
			},
			appComponent: this.oMockedAppComponent
		};

		return FlexTestAPI.createFlexObject({
			appComponent: this.oMockedAppComponent,
			changeSpecificData: this.mSpecificChangeData,
			selector: this.oObjectPageLayout
		}).then(function(oChange) {
			this.oChange = oChange;
		}.bind(this));
	}

	QUnit.module("Given a AddIFrameObjectPageLayout Change Handler with JSTreeModifier", {
		beforeEach: function () {
			return beforeEachFunction.call(this).then(function() {
				this.mPropertyBag.modifier = JsControlTreeModifier;
			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
		}
	}, function () {
		function checkCreatedSection (assert, iExpectedCreatedSectionIndex) {
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
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag)
				.then(checkCreatedSection.bind(this, assert, 1));
		});

		QUnit.test("When applying the change on a js control tree (index = 0)", function(assert) {
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag)
				.then(checkCreatedSection.bind(this, assert, 0));
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag)
				.catch(function(oError) {
					assert.ok(oError, "then apply change throws an error");
				});
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag)
				.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oObjectPageLayout, this.mPropertyBag))
				.then(function() {
					assert.strictEqual(this.oObjectPageLayout.getSections().length, 1, "after reversal there is again only one section of the object page layout");
					assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
				}.bind(this));
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

			this.oTempObjectPageLayout = new ObjectPageLayout("foo", {
				sections: []
			});
			return Component.create({
				name: "testComponent",
				manifest: false
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				this.oXmlString =
					'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap">' +
					'<ObjectPageLayout id="' + this.sObjectPageLayoutId + '">' +
					'<sections>' +
					'<ObjectPageSection />' +
					'</sections>' +
					'</ObjectPageLayout>' +
					'</mvc:View>';
				this.oXmlView = XMLHelper.parse(this.oXmlString).documentElement;
				this.oObjectPageLayout = this.oXmlView.childNodes[0];

				this.mPropertyBag = {
					modifier: XmlTreeModifier,
					view: this.oXmlView,
					appComponent: this.oComponent
				};
				return FlexTestAPI.createFlexObject({
					appComponent: this.oComponent,
					changeSpecificData: this.mSpecificChangeData,
					selector: this.oTempObjectPageLayout
				}).then(function(oChange) {
					this.oChange = oChange;
				}.bind(this));
			}.bind(this));
		},
		afterEach : function() {
			this.oTempObjectPageLayout.destroy();
			this.oComponent.destroy();
		}
	}, function() {
		function checkCreatedSectionXml (assert, iExpectedCreatedSectionIndex) {
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
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag)
				.then(checkCreatedSectionXml.bind(this, assert, 1));
		});

		QUnit.test("When applying the change on a xml control tree (index = 0)", function(assert) {
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag)
				.then(checkCreatedSectionXml.bind(this, assert, 0));
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag)
				.catch(function(oError) {
					assert.ok(oError, "then apply change throws an error");
				});
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageLayout, this.mPropertyBag)
				.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oObjectPageLayout, this.mPropertyBag))
				.then(function() {
					var oObjectPageLayoutSectionsAggregation = this.oObjectPageLayout.childNodes[0];
					assert.strictEqual(oObjectPageLayoutSectionsAggregation.childNodes.length, 1, "after reversal there is again only one section in the object page layout");
					assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
				}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
