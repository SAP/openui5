/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/uxap/changeHandler/AddIFrameObjectPageSection",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/Component",
	"sap/ui/qunit/utils/nextUIUpdate",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	// Pre-load to ensure change handlers are registered before tests run.
	"sap/uxap/flexibility/ObjectPageSection.flexibility"
], function(
	jQuery,
	AddIFrameObjectPageSection,
	JsControlTreeModifier,
	XmlTreeModifier,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	XMLHelper,
	Component,
	nextUIUpdate,
	FlexTestAPI
) {
	"use strict";

	var BASE_ID = "test";
	const EXAMPLE_URL = new URL("exampleurl", document.location.href).href;

	QUnit.module("Given a AddIFrameObjectPageSection Change Handler", {
		beforeEach: function() {
			this.oChangeHandler = AddIFrameObjectPageSection;
			this.mChangeSpecificContent = {
				targetAggregation: "subSections",
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

	async function beforeEachFunction() {
		this.oMockedAppComponent = {
			getLocalId: function () {
				return undefined;
			}
		};

		this.oChangeHandler = AddIFrameObjectPageSection;
		this.sObjectPageSectionId = "ops";

		var mExpectedSelector = {
			id: this.sObjectPageSectionId,
			type: "sap.uxap.ObjectPageSection"
		};

		this.mChangeSpecificContent = {
			targetAggregation: "subSections",
			baseId: BASE_ID,
			url: EXAMPLE_URL
		};

		this.mSpecificChangeData = {
			selector: mExpectedSelector,
			changeType: "addIFrame",
			content: this.mChangeSpecificContent
		};

		// JSTreeModifier specific beforeEach
		this.oObjectPageSubSection = new ObjectPageSubSection();

		this.oObjectPageSection = new ObjectPageSection(this.sObjectPageSectionId, {
			subSections: [this.oObjectPageSubSection]
		});

		this.oObjectPageLayout = new ObjectPageLayout({
			sections: [this.oObjectPageSection]
		});

		this.oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

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
			selector: this.oObjectPageSection
		}).then(function(oChange) {
			oChange.setText("title", "Test IFrame", "XTIT");
			this.oChange = oChange;
		}.bind(this));
	}

	QUnit.module("Given a AddIFrameObjectPageSection Change Handler with JSTreeModifier", {
		beforeEach: function () {
			return beforeEachFunction.call(this).then(function() {
				this.mPropertyBag.modifier = JsControlTreeModifier;
			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageLayout.destroy();
		}
	}, function () {
		function checkCreatedSubSection(assert, iExpectedCreatedSubSectionIndex) {
			assert.strictEqual(this.oObjectPageSection.getSubSections().length, 2, "after the change there are 2 sub sections in the section");
			var oCreatedSubSection = this.oObjectPageSection.getSubSections()[iExpectedCreatedSubSectionIndex];
			assert.ok(oCreatedSubSection.getId() === BASE_ID, "the created sub section matches the expected baseId");
			assert.strictEqual(
				oCreatedSubSection.getTitle(),
				"Test IFrame",
				"the created sub section has the correct title"
			);
			var aBlocks = oCreatedSubSection.getBlocks();
			assert.strictEqual(aBlocks.length, 1, "The created sub section contains one block");
			var oCreatedIFrame = aBlocks[0];
			assert.ok(oCreatedIFrame.getId().indexOf(BASE_ID) === 0, "the created IFrame starts with the expected baseId");
			assert.strictEqual(oCreatedIFrame.getUrl(), EXAMPLE_URL, "the created IFrame has the correct URL");
			assert.strictEqual(
				oCreatedIFrame.getAsContainer(),
				true,
				"the created IFrame is marked as a container so its title can be edited/renamed"
			);
			assert.deepEqual(
				oCreatedIFrame.getRenameInfo(),
				{
					sourceControlId: oCreatedSubSection.getId(),
					selectorControlId: oCreatedSubSection.getId(),
					propertyName: "title"
				},
				"the created IFrame stores rename info pointing at the created sub section title"
			);
		}

		QUnit.test("When applying the change on a js control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection, this.mPropertyBag)
				.then(checkCreatedSubSection.bind(this, assert, 1));
		});

		QUnit.test("When applying the change on a js control tree (index = 0)", function(assert) {
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection, this.mPropertyBag)
				.then(checkCreatedSubSection.bind(this, assert, 0));
		});

		QUnit.test("When applying the change on a js control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection, this.mPropertyBag)
				.catch(function(oError) {
					assert.ok(oError, "then apply change throws an error");
				});
		});

		QUnit.test("When reverting the change on a js control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection, this.mPropertyBag)
				.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oObjectPageSection, this.mPropertyBag))
				.then(function() {
					assert.strictEqual(this.oObjectPageSection.getSubSections().length, 1, "after reversal there is again only one sub section in the section");
					assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
				}.bind(this));
		});
	});

	QUnit.module("Given a AddIFrameObjectPageSection Change Handler with XMLTreeModifier", {
		beforeEach: function() {
			this.oChangeHandler = AddIFrameObjectPageSection;
			this.sObjectPageSectionId = "ops";

			var mExpectedSelector = {
				id: this.sObjectPageSectionId,
				type: "sap.uxap.ObjectPageSection"
			};

			this.mChangeSpecificContent = {
				targetAggregation: "subSections",
				baseId: BASE_ID,
				url: EXAMPLE_URL
			};

			this.mSpecificChangeData = {
				selector: mExpectedSelector,
				changeType: "addIFrame",
				content: this.mChangeSpecificContent
			};

			this.oTempObjectPageSection = new ObjectPageSection("foo");
			return Component.create({
				name: "testComponent",
				manifest: false
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				this.oXmlString =
					'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap">' +
					'<ObjectPageLayout>' +
					'<sections>' +
					'<ObjectPageSection id="' + this.sObjectPageSectionId + '">' +
					'<subSections>' +
					'<ObjectPageSubSection />' +
					'</subSections>' +
					'</ObjectPageSection>' +
					'</sections>' +
					'</ObjectPageLayout>' +
					'</mvc:View>';
				this.oXmlView = XMLHelper.parse(this.oXmlString).documentElement;
				this.oObjectPageSection = this.oXmlView.childNodes[0].childNodes[0].childNodes[0];

				this.mPropertyBag = {
					modifier: XmlTreeModifier,
					view: this.oXmlView,
					appComponent: this.oComponent
				};
				return FlexTestAPI.createFlexObject({
					appComponent: this.oComponent,
					changeSpecificData: this.mSpecificChangeData,
					selector: this.oTempObjectPageSection
				}).then(function(oChange) {
					oChange.setText("title", "Test IFrame", "XTIT");
					this.oChange = oChange;
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			this.oTempObjectPageSection.destroy();
			this.oComponent.destroy();
		}
	}, function() {
		function checkCreatedSubSectionXml(assert, iExpectedCreatedSubSectionIndex) {
			var oSectionSubSectionsAggregation = this.oObjectPageSection.childNodes[0];
			assert.strictEqual(oSectionSubSectionsAggregation.childNodes.length, 2, "after the addIFrame there are two sub sections in the section");
			var oCreatedSubSection = oSectionSubSectionsAggregation.childNodes[iExpectedCreatedSubSectionIndex];
			assert.strictEqual(
				oCreatedSubSection.getAttribute("title"),
				"Test IFrame",
				"the created sub section has the correct title"
			);
			assert.ok(oCreatedSubSection.getAttribute("id") === BASE_ID, "the created sub section matches the expected baseId");
			var aBlocks = oCreatedSubSection.childNodes;
			assert.strictEqual(aBlocks.length, 1, "The created sub section contains one block");
			var oCreatedIFrame = aBlocks[0];
			assert.ok(oCreatedIFrame.getAttribute("id").indexOf(BASE_ID) === 0, "the created IFrame starts with the expected baseId");
			assert.strictEqual(oCreatedIFrame.getAttribute("url"), EXAMPLE_URL, "the created IFrame has the correct URL");
		}

		QUnit.test("When applying the change on a xml control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection, this.mPropertyBag)
				.then(checkCreatedSubSectionXml.bind(this, assert, 1));
		});

		QUnit.test("When applying the change on a xml control tree (index = 0)", function(assert) {
			this.mChangeSpecificContent.index = 0;
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection, this.mPropertyBag)
				.then(checkCreatedSubSectionXml.bind(this, assert, 0));
		});

		QUnit.test("When applying the change on a xml control tree with an invalid targetAggregation", function(assert) {
			this.mChangeSpecificContent.targetAggregation = "invalidAggregation";
			this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData, this.mPropertyBag);
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection, this.mPropertyBag)
				.catch(function(oError) {
					assert.ok(oError, "then apply change throws an error");
				});
		});

		QUnit.test("When reverting the change on an xml control tree", function(assert) {
			return this.oChangeHandler.applyChange(this.oChange, this.oObjectPageSection, this.mPropertyBag)
				.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, this.oObjectPageSection, this.mPropertyBag))
				.then(function() {
					var oSectionSubSectionsAggregation = this.oObjectPageSection.childNodes[0];
					assert.strictEqual(oSectionSubSectionsAggregation.childNodes.length, 1, "after reversal there is again only one sub section in the section");
					assert.strictEqual(this.oChange.getRevertData(), null, "and the revert data got reset");
				}.bind(this));
		});
	});

	QUnit.module("getChangeVisualizationInfo", {
		beforeEach: async function() {
			this.oChangeHandler = AddIFrameObjectPageSection;
			this.oSection = new ObjectPageSection();
			this.oObjectPageLayout = new ObjectPageLayout({
				sections: [this.oSection]
			});
			this.oObjectPageLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPageLayout.destroy();
		}
	}, function() {
		QUnit.test("when the change carries a URL", function(assert) {
			const sUrl = "embed/content?category={Product/Category}";
			const oSelector = { id: this.oSection.getId(), idIsLocal: false };
			const oChange = {
				getContent: () => ({
					selector: oSelector,
					url: sUrl
				})
			};
			const mVizInfo = this.oChangeHandler.getChangeVisualizationInfo(oChange, {});
			assert.deepEqual(
				mVizInfo.affectedControls,
				[oSelector],
				"then the affected control is the change selector (delegated to the base handler)"
			);
			assert.deepEqual(
				mVizInfo.displayControls,
				[oSelector],
				"then the display control is the subsection selector"
			);
			assert.deepEqual(
				mVizInfo.descriptionPayload,
				{ url: { raw: sUrl } },
				"then the URL is surfaced wrapped as { raw } so it is not resolved as a binding"
			);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
