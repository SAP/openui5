/*global QUnit */
sap.ui.define(["sap/ui/thirdparty/jquery",
               "sap/ui/core/Core",
							 "sap/ui/core/mvc/XMLView",
							 "sap/m/App"],
function($, Core, XMLView, App) {
	"use strict";

	var BREAK_POINTS = {
		TABLET: 1024,
		PHONE: 600,
		DESKTOP: 2000
	},
	MEDIA = {
		PHONE: "sapUxAPObjectPageLayout-Std-Phone",
		TABLET: "sapUxAPObjectPageLayout-Std-Tablet",
		DESKTOP: "sapUxAPObjectPageLayout-Std-Desktop"
	},
	DYNAMIC_HEADERS_MEDIA = {
		PHONE: "sapFDynamicPage-Std-Phone",
		TABLET: "sapFDynamicPage-Std-Tablet",
		DESKTOP: "sapFDynamicPage-Std-Desktop"
	};

	QUnit.module("aat_UxAP-ManageDisplay", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-331_ObjectPageRules1",
				viewName: "view.UxAP-331_ObjectPageRules1"
			}).then(function (oView) {
				this.objectPageSampleView1 = oView;
				this.objectPageSampleView1.placeAt("qunit-fixture");
				Core.applyChanges();
				this.referencedObjectPage1 = this.objectPageSampleView1.byId("objectPage1");
				done();
			}.bind(this));
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
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-331_ObjectPageRules2",
				viewName: "view.UxAP-331_ObjectPageRules2"
			}).then(function (oView) {
				this.objectPageSampleView2 = oView;
				this.objectPageSampleView2.placeAt("qunit-fixture");
				Core.applyChanges();
				this.referencedObjectPage2 = this.objectPageSampleView2.byId("objectPage2");
				done();
			}.bind(this));
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
		assert.expect(18);

		var oObjectPage = this.referencedObjectPage2,
			fnCheckMediaClasses = function(sMediaClass, oMedia) {
				Object.keys(oMedia).forEach(function (sMedia) {
					var sCurrentMediaClass = oMedia[sMedia],
						bMediaShouldBeApplied = sMediaClass === sCurrentMediaClass;

					assert.strictEqual(oObjectPage.hasStyleClass(sCurrentMediaClass), bMediaShouldBeApplied, sCurrentMediaClass + " is applied: " + bMediaShouldBeApplied);
				}, this);
			};

		oObjectPage._updateMedia(BREAK_POINTS.PHONE, MEDIA);
		fnCheckMediaClasses(MEDIA.PHONE, MEDIA);

		oObjectPage._updateMedia(BREAK_POINTS.TABLET, MEDIA);
		fnCheckMediaClasses(MEDIA.TABLET, MEDIA);

		oObjectPage._updateMedia(BREAK_POINTS.DESKTOP, MEDIA);
		fnCheckMediaClasses(MEDIA.DESKTOP, MEDIA);

		oObjectPage._updateMedia(BREAK_POINTS.PHONE, DYNAMIC_HEADERS_MEDIA);
		fnCheckMediaClasses(DYNAMIC_HEADERS_MEDIA.PHONE, DYNAMIC_HEADERS_MEDIA);

		oObjectPage._updateMedia(BREAK_POINTS.TABLET, DYNAMIC_HEADERS_MEDIA);
		fnCheckMediaClasses(DYNAMIC_HEADERS_MEDIA.TABLET, DYNAMIC_HEADERS_MEDIA);

		oObjectPage._updateMedia(BREAK_POINTS.DESKTOP, DYNAMIC_HEADERS_MEDIA);
		fnCheckMediaClasses(DYNAMIC_HEADERS_MEDIA.DESKTOP, DYNAMIC_HEADERS_MEDIA);
	});

	QUnit.module("ObjectPage with DynamicHeaderTitle", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-331_ObjectPageRules3",
				viewName: "view.UxAP-331_ObjectPageRules3"
			}).then(function (oView) {
				this.objectPageSampleView3 = oView;
				this.objectPageSampleView3.placeAt("qunit-fixture");
				Core.applyChanges();
				this.referencedObjectPage3 = this.objectPageSampleView3.byId("objectPage3");
				done();
			}.bind(this));
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
		var oAnchorBar = this.referencedObjectPage3.getAggregation("_anchorBar"),
			oAnchorBarDom = oAnchorBar.getDomRef();

		function hasTopMargin() {
			return getComputedStyle(oAnchorBarDom).marginTop > "0px";
		}

		this.referencedObjectPage3._pin();
		assert.ok(hasTopMargin(), "DynamicPageTitle AnchorBar has top margin");

		this.referencedObjectPage3._expandHeader(false);
		assert.ok(hasTopMargin(), "DynamicPageTitle AnchorBar has top margin");

		this.referencedObjectPage3._expandHeader(true);
		assert.ok(hasTopMargin(), "DynamicPageTitle AnchorBar has top margin");

		this.referencedObjectPage3._toggleHeader(false);
		assert.ok(hasTopMargin(), "DynamicPageTitle AnchorBar has top margin");
	});

	QUnit.module("Title Propagation Support based on UX Rules", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageTitlePropagationSupport",
				viewName: "view.UxAP-ObjectPageTitlePropagationSupport"
			}).then(function (oView) {
				this.oOPView = oView;
				this.oOPView.placeAt("qunit-fixture");
				Core.applyChanges();
				this.oSection3 = this.oOPView.byId("section_3");
				this.oSection4 = this.oOPView.byId("section_4");
				this.oSubSection11 = this.oOPView.byId("sub_section_1_1");
				this.oSubSection21 = this.oOPView.byId("sub_section_2_1");
				this.oSubSection22 = this.oOPView.byId("sub_section_2_2");
				this.oSubSection31 = this.oOPView.byId("sub_section_3_1");
				this.oSubSection41 = this.oOPView.byId("sub_section_4_1");
				done();
			}.bind(this));
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

	QUnit.module("ObjectPage section selection and UX rules effects");

	QUnit.test("When sections are bound to a model", function (assert) {
		var done = assert.async();
		XMLView.create({
			id: "objectPageBoundSectionsViewSample",
			viewName: "view.UxAP-ObjectPageBoundSections"
		}).then(function (oView) {
			this.oSampleView = oView;
			this.appControl = new App();
			this.appControl.addPage(this.oSampleView);
			this.appControl.placeAt("qunit-fixture");
			Core.applyChanges();

			assert.strictEqual(this.oSampleView.byId("PartProfileObjectPage").getSelectedSection(), "objectPageBoundSectionsViewSample--testSection1", "selected section value should not be affected by UX rules");
			done();
		}.bind(this));
	});

	QUnit.test("When sections are not bound to a model", function (assert) {
		var done = assert.async();
		XMLView.create({
			id: "objectPageNotBoundSectionsViewSample",
			viewName: "view.UxAP-ObjectPageNotBoundSections"
		}).then(function (oView) {
			this.oSampleView = oView;
			this.appControl = new App();
			this.appControl.addPage(this.oSampleView);
			this.appControl.placeAt("qunit-fixture");
			Core.applyChanges();

			assert.strictEqual(this.oSampleView.byId("PartProfileObjectPage").getSelectedSection(), "objectPageNotBoundSectionsViewSample--testSection2", "selected section value should be affected by UX rules");
			done();
		}.bind(this));
	});

});
