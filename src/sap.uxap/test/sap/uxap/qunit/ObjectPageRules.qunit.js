/*global QUnit */
sap.ui.define(["sap/ui/thirdparty/jquery",
               "sap/ui/core/Core"],
function($, Core) {
	"use strict";

	var BREAK_POINTS = {
		TABLET: 1024,
		PHONE: 600,
		DESKTOP: 2000
	};

	var MEDIA = {
		PHONE: "sapFDynamicPage-Std-Phone",
		TABLET: "sapFDynamicPage-Std-Tablet",
		DESKTOP: "sapFDynamicPage-Std-Desktop"
	};

	QUnit.module("aat_UxAP-ManageDisplay", {
		beforeEach: function () {
			//aat_UxAP-331_ObjectPageRules1
			this.objectPageSampleView1 = sap.ui.xmlview("UxAP-331_ObjectPageRules1", {
				viewName: "view.UxAP-331_ObjectPageRules1"
			});
			this.objectPageSampleView1.placeAt('qunit-fixture');

			Core.applyChanges();

			this.referencedObjectPage1 = this.objectPageSampleView1.byId("objectPage1");
		},
		afterEach: function () {
			this.objectPageSampleView1.destroy();
			this.referencedObjectPage1 = null;
		}
	});


	QUnit.test("ObjectPageId 1 created", function (assert) {
		assert.notStrictEqual(this.referencedObjectPage1, undefined, "ObjectPageLayout 1 created successfuly");
	});
	QUnit.test("ObjectPageId 1: DynamicPageTitle titleClickEnabled class not applied", function (assert) {
		assert.notOk(this.referencedObjectPage1.$().hasClass("sapUxAPObjectPageLayoutTitleClickEnabled"), "DynamicPageTitle titleClickEnabled class not applied");
		this.referencedObjectPage1.setToggleHeaderOnTitleClick(true);
		Core.applyChanges();
		assert.notOk(this.referencedObjectPage1.$().hasClass("sapUxAPObjectPageLayoutTitleClickEnabled"), "DynamicPageTitle titleClickEnabled class is still not applied");
	});
	QUnit.test("ObjectPageId 1: AnchorBar ", function (assert) {
		var objectPageToBar331 = $("#UxAP-331_ObjectPageRules1--objectPage1").find(".sapUxAPAnchorBar").is(":visible");
		assert.strictEqual(objectPageToBar331, true, "ObjectPageLayout 1 AnchorBar is display");
	});
	QUnit.test("ObjectPageId 1: No block - subsection not display", function (assert) {
		var objectPageSubSectionNoBlock331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSubSectionNoBlock331").getId()).is(":visible");
		assert.strictEqual(objectPageSubSectionNoBlock331, false, "Subsection 'id=ObjectPageSubSectionNoBlock331' not visible");
	});
	QUnit.test("ObjectPageId 1: 1 block subsection display", function (assert) {
		var objectPageSubSectionNotEmpty331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSubSectionNotEmpty331").getId()).is(":visible");
		assert.strictEqual(objectPageSubSectionNotEmpty331, true, "Subsection 'id=ObjectPageSubSectionNotEmpty331' is visible");
	});
	QUnit.test("ObjectPageId 1: Section Without subection not display", function (assert) {
		var objectPageSectionNoSubSection331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSectionNoSubSection331").getId()).is(":visible");
		assert.strictEqual(objectPageSectionNoSubSection331, false, "Section 'id=ObjectPageSectionNoSubSection331' is not  visible");
	});
	QUnit.test("ObjectPageId 1: Subsection Promoted", function (assert) {
		var objectPageSectionPromoted = this.objectPageSampleView1.byId("ObjectPageSectionPromoted331");
		assert.strictEqual(objectPageSectionPromoted.$().find(".sapUxAPObjectPageSectionTitle").text(), 'Promoted', "Section 'id=ObjectPageSectionPromoted331' Title is 'Promoted'");
		var objectPageSubSectionPromoted = this.objectPageSampleView1.byId("ObjectPageSubSectionPromoted331");
		assert.strictEqual(objectPageSubSectionPromoted.$().find(".sapUxAPObjectPageSectionTitle").text(), '', "Subsection 'id=ObjectPageSubSectionPromoted331' Title is empty");
	});
	QUnit.test("ObjectPageId 1: Section with 1 Subsection without block", function (assert) {
		var objectPageSectionEmpty331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSectionEmpty331").getId()).is(":visible");
		assert.strictEqual(objectPageSectionEmpty331, false, "Section 'id=ObjectPageSectionEmpty331' is not visible");
		var objectPageSubSectionEmpty331 = $("#" + this.objectPageSampleView1.byId("ObjectPageSubSectionEmpty331").getId()).is(":visible");
		assert.strictEqual(objectPageSubSectionEmpty331, false, "Subsection 'id=ObjectPageSubSectionEmpty331' is not visible");
	});
	QUnit.test("ObjectPageId 1: 1st Title Section is not visible", function (assert) {
		var objectPageTitle331 = $("#UxAP-331_ObjectPageRules1--ObjectPageSectionNoBlock331").find(".sapUxAPObjectPageSectionHeader").hasClass("sapUxAPObjectPageSectionHeaderHidden");
		assert.strictEqual(objectPageTitle331, true, "1st Title is not visible");
	});
	QUnit.test("ObjectPageId 1: SubSection visible properties is false but rules say visible", function (assert) {
		var objectPageTitle331 = $("#UxAP-331_ObjectPageRules1--ObjectPageSubSectionNotVisible331").is(":visible");
		assert.strictEqual(objectPageTitle331, false, "SubSection is not visible by override");
	});
	QUnit.test("ObjectPageId 1: SubSection visible properties is true but rules say not visible", function (assert) {
		var objectPageTitle331 = $("#UxAP-331_ObjectPageRules1--ObjectPageSubSectionVisible331").is(":visible");
		assert.strictEqual(objectPageTitle331, false, "SubSection is visible by override");
	});

	QUnit.module("Single section", {
		beforeEach: function () {
			//aat_UxAP-331_ObjectPageRules2
			this.objectPageSampleView2 = sap.ui.xmlview("UxAP-331_ObjectPageRules2", {
				viewName: "view.UxAP-331_ObjectPageRules2"
			});
			this.objectPageSampleView2.placeAt('qunit-fixture');
			Core.applyChanges();

			this.referencedObjectPage2 = this.objectPageSampleView2.byId("objectPage2");
		},
		afterEach: function () {
			this.objectPageSampleView2.destroy();
			this.referencedObjectPage2 = null;
		}
	});

	QUnit.test("ObjectPageId 2 created", function (assert) {
		assert.notStrictEqual(this.referencedObjectPage2, undefined, "ObjectPageLayout 2 created successfuly");
	});
	QUnit.test("ObjectPageId 2: No AnchorBar ", function (assert) {
		var objectPageToBar331 = $("#UxAP-331_ObjectPageRules2--objectPage2").find(".sapUxAPAnchorBar").is(":visible");
		assert.strictEqual(objectPageToBar331, false, "ObjectPageLayout 2 No AnchorBar is display");
	});

	QUnit.test("ObjectPage _updateMedia: correct media class is applied", function (assert) {
		assert.expect(9);

		var oObjectPage = this.referencedObjectPage2,
			fnCheckMediaClasses = function(oAssert, sMediaClass) {
				Object.keys(MEDIA).forEach(function (sMedia) {
					var sCurrentMediaClass = MEDIA[sMedia],
						bMediaShouldBeApplied = sMediaClass === sCurrentMediaClass;

					oAssert.strictEqual(oObjectPage.hasStyleClass(sCurrentMediaClass), bMediaShouldBeApplied, sCurrentMediaClass + " is applied: " + bMediaShouldBeApplied);
				}, this);
			};

		oObjectPage._updateMedia(BREAK_POINTS.PHONE);
		fnCheckMediaClasses(assert, MEDIA.PHONE);

		oObjectPage._updateMedia(BREAK_POINTS.TABLET);
		fnCheckMediaClasses(assert, MEDIA.TABLET);

		oObjectPage._updateMedia(BREAK_POINTS.DESKTOP);
		fnCheckMediaClasses(assert, MEDIA.DESKTOP);
	});

	QUnit.module("ObjectPage with DynamicHeaderTitle", {
		beforeEach: function () {
			//aat_UxAP-331_ObjectPageRules3
			this.objectPageSampleView3 = sap.ui.xmlview("UxAP-331_ObjectPageRules3", {
				viewName: "view.UxAP-331_ObjectPageRules3"
			});
			this.objectPageSampleView3.placeAt('qunit-fixture');
			Core.applyChanges();

			this.referencedObjectPage3 = this.objectPageSampleView3.byId("objectPage3");
		},
		afterEach: function () {
			this.objectPageSampleView3.destroy();
			this.referencedObjectPage3 = null;
		}
	});

	QUnit.test("ObjectPageId 3: DynamicPageTitle titleClickEnabled class is applied", function (assert) {
		assert.ok(this.referencedObjectPage3.$().hasClass("sapUxAPObjectPageLayoutTitleClickEnabled"), "DynamicPageTitle titleClickEnabled class is applied");
		this.referencedObjectPage3.setToggleHeaderOnTitleClick(false);
		Core.applyChanges();
		assert.notOk(this.referencedObjectPage3.$().hasClass("sapUxAPObjectPageLayoutTitleClickEnabled"), "DynamicPageTitle titleClickEnabled class is removed");
	});

	QUnit.test("ObjectPageId 3: DynamicPageTitle  headerContentPinnable class is applied", function (assert) {
		assert.ok(this.referencedObjectPage3.$().hasClass("sapUxAPObjectPageLayoutHeaderPinnable"), "DynamicPageTitle headerContentPinnable class is applied");
		this.referencedObjectPage3.setHeaderContentPinnable(false);
		Core.applyChanges();
		assert.notOk(this.referencedObjectPage3.$().hasClass("sapUxAPObjectPageLayoutHeaderPinnable"), "DynamicPageTitle headerContentPinnable class is removed");
	});

	QUnit.test("ObjectPageId 3: DynamicPageTitle  AnchorBar padding top CSS functionality", function (assert) {
		var $stickyAnchorBar = this.referencedObjectPage3._$stickyAnchorBar;

		this.referencedObjectPage3._pin();
		assert.ok($stickyAnchorBar.hasClass("sapUxAPObjectPageStickyAnchorBarPaddingTop"), "DynamicPageTitle AnchorBar padding top class is applied");

		this.referencedObjectPage3._expandHeader(false);
		assert.notOk($stickyAnchorBar.hasClass("sapUxAPObjectPageStickyAnchorBarPaddingTop"), "DynamicPageTitle AnchorBar padding top class is removed");

		this.referencedObjectPage3._expandHeader(true);
		assert.ok($stickyAnchorBar.hasClass("sapUxAPObjectPageStickyAnchorBarPaddingTop"), "DynamicPageTitle AnchorBar padding top class is applied");

		this.referencedObjectPage3._toggleHeader(false);
		assert.notOk($stickyAnchorBar.hasClass("sapUxAPObjectPageStickyAnchorBarPaddingTop"), "DynamicPageTitle AnchorBar padding top class is removed");
	});

	QUnit.module("Title Propagation Support based on UX Rules", {
		beforeEach: function () {
			this.oOPView = sap.ui.xmlview("UxAP-ObjectPageTitlePropagationSupport", {
				viewName: "view.UxAP-ObjectPageTitlePropagationSupport"
			});
			this.oOPView.placeAt('qunit-fixture');
			Core.applyChanges();

			this.oSection3 = this.oOPView.byId("section_3");
			this.oSection4 = this.oOPView.byId("section_4");
			this.oSubSection11 = this.oOPView.byId("sub_section_1_1");
			this.oSubSection21 = this.oOPView.byId("sub_section_2_1");
			this.oSubSection22 = this.oOPView.byId("sub_section_2_2");
			this.oSubSection31 = this.oOPView.byId("sub_section_3_1");
			this.oSubSection41 = this.oOPView.byId("sub_section_4_1");
		},
		afterEach: function () {
			this.oOPView.destroy();
			this.oSection3 = null;
			this.oSection4 = null;
			this.oSubSection11 = null;
			this.oSubSection21 = null;
			this.oSubSection22 = null;
			this.oSubSection31 = null;
			this.oSubSection41 = null;
		}
	});

	QUnit.test("SubSection configured properly", function (assert) {
		assert.strictEqual(this.oSubSection11._getTitleDomId(),
			"UxAP-ObjectPageTitlePropagationSupport--objectPageLayout-anchBar-UxAP-ObjectPageTitlePropagationSupport--section_1-anchor-content",
			"Title DOM ID of the Anchor Bar first button text containing element");

		assert.strictEqual(this.oSubSection21._getTitleDomId(),
			"UxAP-ObjectPageTitlePropagationSupport--sub_section_2_1-headerTitle",
			"Own Title DOM ID is returned");

		assert.strictEqual(this.oSubSection22._getTitleDomId(),
			"UxAP-ObjectPageTitlePropagationSupport--sub_section_2_2-headerTitle",
			"Own Title DOM ID is returned");

		assert.strictEqual(this.oSubSection31._getTitleDomId(),
			this.oSection3.getId() + "-title",
			"Title DOM ID of parent Section is returned");

		assert.strictEqual(this.oSubSection41._getTitleDomId(),
			this.oSection4.getId() + "-title",
			"Title DOM ID of parent Section is returned");
	});

	QUnit.test("First Section with two SubSections - configured properly", function (assert) {
		// Arrange
		var oSubSection = this.oOPView.byId("op2_sub_section_1_1");

		// Asssert
		assert.strictEqual(oSubSection._getTitleDomId(),
			"UxAP-ObjectPageTitlePropagationSupport--op2_sub_section_1_1-headerTitle", "Own Title DOM ID is returned");
	});

});
