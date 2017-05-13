/*global QUnit*/

(function ($, QUnit) {
	"use strict";

	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");
	jQuery.sap.registerModulePath("view", "view");

	var oFactory = {
			getSection: function (iNumber, sTitleLevel, aSubSections) {
				return new sap.uxap.ObjectPageSection({
					title: "Section" + iNumber,
					titleLevel: sTitleLevel,
					subSections: aSubSections || []
				});
			},
			getSubSection: function (iNumber, aBlocks, sTitleLevel) {
				return new sap.uxap.ObjectPageSubSection({
					title: "SubSection " + iNumber,
					titleLevel: sTitleLevel,
					blocks: aBlocks || []
				});
			},
			getBlocks: function (sText) {
				return [
					new sap.m.Text({text: sText || "some text"})
				];
			},
			getObjectPage: function () {
				return new sap.uxap.ObjectPageLayout();
			},
			getObjectPageLayoutWithIconTabBar: function () {
				return new sap.uxap.ObjectPageLayout({
					useIconTabBar: true
				});
			},
			getObjectPageLayoutWithSectionTitleLevel: function (sSectionTitleLevel) {
				return new sap.uxap.ObjectPageLayout({
					sectionTitleLevel: sSectionTitleLevel,
					sections:
						oFactory.getSection(1, null, [
							oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(3, [oFactory.getBlocks(), oFactory.getBlocks()], null),
							oFactory.getSubSection(4, [oFactory.getBlocks(), oFactory.getBlocks()], null)
						])

				});
			}
	},

		helpers = {
			generateObjectPageWithContent: function (oFactory, iNumberOfSection, bUseIconTabBar) {
				var oObjectPage = bUseIconTabBar ? oFactory.getObjectPageLayoutWithIconTabBar() : oFactory.getObjectPage(),
					oSection,
					oSubSection;

				for (var i = 0; i < iNumberOfSection; i++) {
					oSection = oFactory.getSection(i);
					oSubSection = oFactory.getSubSection(i, oFactory.getBlocks());
					oSection.addSubSection(oSubSection);
					oObjectPage.addSection(oSection);
				}

				return oObjectPage;
			},
			renderObject: function (oSapUiObject) {
				oSapUiObject.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
				return oSapUiObject;
			}
		};

	QUnit.module("IconTabBar is initially enabled", {
		beforeEach: function () {
			this.oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();
			helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Using UseIconTabBar via Control settings", function (assert) {
		assert.strictEqual(this.oObjectPage.getUseIconTabBar(), true);
	});
	QUnit.test("Using UseIconTabBar does not disable the use of an AnchorBar", function (assert) {
		assert.strictEqual(this.oObjectPage.getShowAnchorBar(), true);
	});

	QUnit.module("IconTabBar is initially not enabled", {
		beforeEach: function () {
			this.oObjectPage = oFactory.getObjectPage();
			helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("The default value of UseIconTabBar", function (assert) {
		assert.strictEqual(this.oObjectPage.getUseIconTabBar(), false, "is correctly set to false");
	});

	QUnit.test("test UseIconTabBar APIs", function (assert) {
		this.oObjectPage.setUseIconTabBar(false);
		assert.ok(!this.oObjectPage.getUseIconTabBar(), false);
		this.oObjectPage.setUseIconTabBar(true);
		assert.ok(this.oObjectPage.getUseIconTabBar(), true);
	});


	QUnit.module("test scrollToSection API");

	QUnit.test("Calling scrollToSection when OPL is not rendered should do nothing", function (assert) {
		var oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5),
			oFirstSection = oObjectPage.getSections()[0],
			oLoggerSpy = this.spy(jQuery.sap.log, "warning"),
			oComputeScrollPositionSpy = this.spy(oObjectPage, "_computeScrollPosition");

		assert.ok(!oObjectPage.getDomRef(), "ObjectPage is not rendered");

		oObjectPage.scrollToSection(oFirstSection.getId());

		assert.ok(!oComputeScrollPositionSpy.called, "Compute scroll position not called when OPL is not rendered");

		assert.ok(oLoggerSpy.calledWith("scrollToSection can only be used after the ObjectPage is rendered", oObjectPage), "Warning message is logged");
	});

	QUnit.module("Use IconTabBar with no sections", {
		beforeEach: function () {
			this.oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar();
			helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("test IconTabBar is empty", function (assert) {
		assert.strictEqual(this.oObjectPage.getAggregation("_anchorBar").getContent().length, 0, 'The IconTabBar content aggregation is empty');
	});

	QUnit.test("test IconTabBar shoud not be created when 0 section is provided", function (assert) {
		var expectedNumberOfSections = 0;

		assert.strictEqual(this.oObjectPage.getSections().length, expectedNumberOfSections, 'The ObjectPage has ' +
		expectedNumberOfSections + ' sections');
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation").length, "anchor bar when no sections");
		assert.strictEqual(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation *").length, 0, "empty anchor bar when no sections");
	});

	QUnit.module("Use IconTabBar with one section", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 1;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("test empty anchorBar when one section is provided", function (assert) {
		var expectedNumberOfSections = this.NUMBER_OF_SECTIONS;

		// one section only
		assert.strictEqual(this.oObjectPage.getSections().length, expectedNumberOfSections, 'The ObjectPage has ' +
		expectedNumberOfSections + ' sections');

		//empty anchor bar
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation").length, "anchor bar when no sections");
		assert.strictEqual(this.oObjectPage.$().find(".sapUxAPObjectPageNavigation *").length, 0, "empty anchor bar when no sections");
		assert.ok(this.oObjectPage.$().find(".sapUxAPObjectPageContainerNoBar").length, "Empty bar when single section");
	});

	QUnit.test("test the section is rendered", function (assert) {
		//section is rendered
		var sSectionId = this.oObjectPage.getSections()[0].getId();
		assert.ok(this.oObjectPage.$().find("#" + sSectionId + " *").length, "section is rendered");
	});

	QUnit.module("test selectedSection association API", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			this.oSecondSection = this.oObjectPage.getSections()[1];
			this.oThirdSection = this.oObjectPage.getSections()[2];
			this.oObjectPage.setSelectedSection(this.oSecondSection.getId());
			this.iLoadingDelay = 500;
			helpers.renderObject(this.oObjectPage);

		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oSecondSection = null;
			this.oThirdSection = null;
			this.iLoadingDelay = 0;
		}
	});

	QUnit.test("test user defined selected section", function (assert) {
		var oObjectPage = this.oObjectPage,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);
	});

	QUnit.test("test selected section when hiding another one", function (assert) {
		/* Arrange */
		var oObjectPage = this.oObjectPage,
			oExpected = {
				oSelectedSection: this.oSecondSection,
				sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle()
			};

		/* Act: Hide the third section.
		/* which used to cause a failure, see BCP: 1770148914 */
		this.oThirdSection.setVisible(false);

		/* Assert:
		/* The ObjectPage adjusts its layout, */
		/* but the selected section should remain the same. */
		sectionIsSelected(oObjectPage, assert, oExpected);
	});

	QUnit.module("IconTabBar section selection", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			this.oFirstSection = this.oObjectPage.getSections()[0];
			this.oSecondSection = this.oObjectPage.getSections()[1];
			this.iLoadingDelay = 500;
			helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oFirstSection = null;
			this.oSecondSection = null;
			this.iLoadingDelay = 0;
		}
	});

	function sectionIsSelected(oObjectPage, assert, oExpected) {

		var sSelectedBtnId = oObjectPage.getAggregation('_anchorBar').getSelectedButton(),
			oSelectedBtn = sap.ui.getCore().byId(sSelectedBtnId);

		assert.ok(oSelectedBtn, "anchorBar has selected button");
		assert.strictEqual(oExpected.sSelectedTitle, oSelectedBtn.getText(), "section is selected in anchorBar");
		assert.strictEqual(oExpected.oSelectedSection.getId(), oObjectPage.getSelectedSection(), "section is selected in objectPage");
		assert.ok(oObjectPage.$().find("#" + oExpected.oSelectedSection.getId() + "*").length, "section is rendered");
	}

	QUnit.test("test first visible section is initially selected", function (assert) {

		var oObjectPage = this.oObjectPage,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		var oExpected = {
			oSelectedSection: this.oFirstSection,
			sSelectedTitle: this.oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);
	});

	QUnit.test("scrollTo another section", function (assert) {
		//act
		this.oObjectPage.scrollToSection(this.oSecondSection.getId(), 0, null, true);

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		sectionIsSelected(this.oObjectPage, assert, oExpected);
	});

	QUnit.test("select another section", function (assert) {
		//act
		this.oObjectPage.setSelectedSection(this.oFirstSection.getId());

		var oExpected = {
			oSelectedSection: this.oFirstSection,
			sSelectedTitle: this.oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		sectionIsSelected(this.oObjectPage, assert, oExpected);
	});

	QUnit.test("test hide selected section", function (assert) {
		var oObjectPage = this.oObjectPage,
			done = assert.async();

		//act
		this.oFirstSection.setVisible(false);

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);
	});

	QUnit.test("test hide selected subsection", function (assert) {
		var oObjectPage = this.oObjectPage,
			done = assert.async();

		//act
		//hide the only subsection => no content left to display
		this.oFirstSection.getSubSections()[0].setVisible(false);

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);
	});

	QUnit.test("test remove selected section", function (assert) {

		var oObjectPage = this.oObjectPage,
			iLoadingDelay = 500,
			done = assert.async();

		//act
		oObjectPage.removeSection(this.oFirstSection);

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, iLoadingDelay);
	});

	QUnit.test("test rename selected section", function (assert) {
		var oObjectPage = this.oObjectPage,
			done = assert.async();

		//act
		this.oFirstSection.getSubSections()[0].setTitle("Updated Title");

		var oExpected = {
			oSelectedSection: this.oFirstSection,
			sSelectedTitle: this.oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);
	});

	QUnit.module("ObjectPage API: sectionTitleLevel");

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel is TitleLevel.Auto", function (assert) {
		var oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(null),
			oSection,
			$sectionHeader,
			oSubSection,
			$subSectionTitle,
			sSectionAriaLevelDefault = "3",
			sSubSectionAriaLevelDefault = "4";

		helpers.renderObject(oObjectPage);

		oSection = oObjectPage.getSections()[0];
		$sectionHeader = oSection.$("header");
		oSubSection = oSection.getSubSections()[0];
		$subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeader.attr("aria-level"), sSectionAriaLevelDefault, "The section has the correct aria-level");
		assert.equal($subSectionTitle.attr("aria-level"), sSubSectionAriaLevelDefault, "The subSection has the correct aria-level");
	});

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel is not TitleLevel.Auto", function (assert) {
		var oObjectPageSectionTitleLevel = sap.ui.core.TitleLevel.H1,
			oObjectPageMinimumSectionTitleLevel = sap.ui.core.TitleLevel.H6,
			oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(oObjectPageSectionTitleLevel),
			oSection,
			$sectionHeader,
			oSubSection,
			$subSectionTitle,
			sSectionExpectedAriaLevel = "1", // equal to the  sectionTitleLevel(H1)
			sSubSectionExpectedAriaLevel = "2", // lower than sectionTitleLevel(H1) by 1
			sMinimumAriaLevel = "6";

		helpers.renderObject(oObjectPage);

		oSection = oObjectPage.getSections()[0];
		$sectionHeader = oSection.$("header");
		oSubSection = oSection.getSubSections()[0];
		$subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeader.attr("aria-level"), sSectionExpectedAriaLevel, "The section has the correct aria-level");
		assert.equal($subSectionTitle.attr("aria-level"), sSubSectionExpectedAriaLevel, "The subSection has the correct aria-level");

		oObjectPage.setSectionTitleLevel(oObjectPageMinimumSectionTitleLevel);
		sap.ui.getCore().applyChanges();
		$sectionHeader = oSection.$("header");
		$subSectionTitle = oSubSection.$("headerTitle");

		assert.equal($sectionHeader.attr("aria-level"), sMinimumAriaLevel, "The section has the correct aria-level");
		assert.equal($subSectionTitle.attr("aria-level"), sMinimumAriaLevel, "The subSection has the correct aria-level");

	});

	QUnit.test("test sections/subsections aria-level when sectionTitleLevel and titleLevel are defined", function (assert) {
		var oObjectPageSectionTitleLevel = sap.ui.core.TitleLevel.H4,
			oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(oObjectPageSectionTitleLevel),
			aSections = oObjectPage.getSections(),
			oSection = aSections[0],
			aSubSections = oSection.getSubSections(),
			oFirstSubSection = aSubSections[0],
			oSecondSubSection  = aSubSections[1],
			oThirdSubSection = aSubSections[2],
			$firstSubSectionTitle,
			$secondSubSectionTitle,
			$thirdSubSectionTitle,
			sSubSectionDefaultAriaLevel = "5", // lower than sectionTitleLevel(H4) by 1
			sFirstSubSectionExpectedAriaLevel = "1", // titleLevel(H1) is set explicitly
			sSecondSubSectionExpectedAriaLevel = "2"; // titleLevel(H2) is set explicitly

		oFirstSubSection.setTitleLevel(sap.ui.core.TitleLevel.H1);
		oSecondSubSection.setTitleLevel(sap.ui.core.TitleLevel.H2);

		helpers.renderObject(oObjectPage);
		$firstSubSectionTitle = oFirstSubSection.$("headerTitle");
		$secondSubSectionTitle = oSecondSubSection.$("headerTitle");
		$thirdSubSectionTitle = oThirdSubSection.$("headerTitle");

		assert.equal($firstSubSectionTitle.attr("aria-level"), sFirstSubSectionExpectedAriaLevel,
			"SubSection aria-level " + sFirstSubSectionExpectedAriaLevel + ", although op sectionTitleLevel is " + oObjectPageSectionTitleLevel);

		assert.equal($secondSubSectionTitle.attr("aria-level"), sSecondSubSectionExpectedAriaLevel,
			"SubSection aria-level " + sSecondSubSectionExpectedAriaLevel + ", although op sectionTitleLevel is " + oObjectPageSectionTitleLevel);

		assert.equal($thirdSubSectionTitle.attr("aria-level"), sSubSectionDefaultAriaLevel,
			"SubSection aria-level " + sSubSectionDefaultAriaLevel + ", lower than sectionTitleLevel:" + oObjectPageSectionTitleLevel + " by 1");
	});

	QUnit.module("ObjectPage API: sectionTitleLevel - private methods");

	QUnit.test("test _determineSectionBaseInternalTitleLevel and _shouldApplySectionTitleLevel", function (assert) {
		var oObjectPage = oFactory.getObjectPageLayoutWithSectionTitleLevel(sap.ui.core.TitleLevel.H2),
			oSection = oObjectPage.getSections()[0],
			aSubSections = oSection.getSubSections(),
			oFirstSubSection = aSubSections[0],
			oThirdSubSection = aSubSections[2];

		oFirstSubSection.setTitleLevel(sap.ui.core.TitleLevel.H1);
		helpers.renderObject(oObjectPage);

		assert.equal(oObjectPage._shouldApplySectionTitleLevel(oFirstSubSection), false,
			"OP should not apply sectionTitleLevel as the subSection has titleLevel, explicitly defined and different from TitleLevel.Auto: " + oFirstSubSection.getTitleLevel());

		assert.equal(oObjectPage._shouldApplySectionTitleLevel(oThirdSubSection), true,
			"OP should apply sectionTitleLevel as the subSection has no titleLevel, explicitly defined");
		assert.equal(oObjectPage._determineSectionBaseInternalTitleLevel(oThirdSubSection), sap.ui.core.TitleLevel.H3,
			"SubSection internal titleLevel is: " + sap.ui.core.TitleLevel.H3 + ", lower than sectionTitleLevel:" + oObjectPage.getSectionTitleLevel() + " by 1");
	});

	QUnit.test("test _getNextTitleLevelEntry", function (assert) {
		var ObjectPageLayout = sap.uxap.ObjectPageLayout,
			sCurrentTitleLevel = sap.ui.core.TitleLevel.H1;

		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), sap.ui.core.TitleLevel.H2,
			"Correct, next TitleLevel is: " + sap.ui.core.TitleLevel.H2 + " one level lower than: " + sCurrentTitleLevel);

		sCurrentTitleLevel = sap.ui.core.TitleLevel.H4;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), sap.ui.core.TitleLevel.H5,
			"Correct, next TitleLevel is: " + sap.ui.core.TitleLevel.H5 + " one level lower than: " + sCurrentTitleLevel);

		sCurrentTitleLevel = sap.ui.core.TitleLevel.H6;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), sap.ui.core.TitleLevel.H6,
			"Correct, starting from the last entry should return the last entry itself: " + sCurrentTitleLevel);

		sCurrentTitleLevel = sap.ui.core.TitleLevel.H7;
		assert.equal(ObjectPageLayout._getNextTitleLevelEntry(sCurrentTitleLevel), sap.ui.core.TitleLevel.Auto,
			"Correct, if the provided TitleLevel is not valid, TitleLevel.Auto should be returned " + sap.ui.core.TitleLevel.Auto);
	});

	QUnit.module("ObjectPage API: AnchorBar", {
		beforeEach: function () {
			this.appControl = new sap.m.App();
			this.oSampleView = sap.ui.xmlview("objectPageViewSample", {
				viewName: "view.UxAP-77_ObjectPageSample"
			});
			this.appControl.addPage(this.oSampleView);
			this.appControl.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();
		}
	});

	QUnit.test("test AnchorBar not rendering using ShowAnchorBar within XMLView", function (assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13");

		oObjectPage.setShowAnchorBar(false);
		sap.ui.getCore().applyChanges();

		assert.equal(oObjectPage.getShowAnchorBar(), false);
		assert.equal(checkObjectExists(".sapUxAPAnchorBar"), false);
	});

	QUnit.test("test AnchorBar rendering using ShowAnchorBar within XMLView", function (assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13");

		oObjectPage.setShowAnchorBar(true);
		sap.ui.getCore().applyChanges();

		assert.equal(oObjectPage.getShowAnchorBar(), true);
		assert.equal(checkObjectExists(".sapUxAPAnchorBar"), true);
	});


	QUnit.module("ObjectPage API: ObjectPageHeader", {
		beforeEach: function () {
			this.appControl = new sap.m.App();
			this.oSampleView = sap.ui.xmlview("objectPageViewSample", {
				viewName: "view.UxAP-77_ObjectPageSample"
			});
			this.appControl.addPage(this.oSampleView);
			this.appControl.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();
		}
	});

	QUnit.test("test ObjectPageHeader for ObjectPageLayout defined into XMLView", function (assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13");
		var oHeader = oObjectPage.getHeaderTitle();

		assert.ok(oHeader);
		assert.equal(oObjectPage.getHeaderContent()[0].getText(), "Personal description");

		oObjectPage.destroyHeaderTitle();
		oObjectPage.destroyHeaderContent();
		assert.ok(!oObjectPage.getHeaderTitle());

		var oNewHeader = new sap.uxap.ObjectPageHeader(this.oSampleView.createId("newHeader"));
		oObjectPage.addHeaderContent(new sap.m.Text(this.oSampleView.createId("newHeaderText"), {text: "test"}));
		oObjectPage.setHeaderTitle(oNewHeader);
		assert.ok(oObjectPage.getHeaderTitle());
		assert.equal(oObjectPage.getHeaderContent()[0].getText(), "test");

		sap.ui.getCore().applyChanges();

		assert.strictEqual(checkObjectExists("#objectPageViewSample--newHeader"), true);
	});


	QUnit.module("ObjectPage API", {
		beforeEach: function () {
			this.appControl = new sap.m.App();

			this.oSampleView = sap.ui.xmlview("objectPageViewSample", {
				viewName: "view.UxAP-77_ObjectPageSample"
			});
			this.oView = sap.ui.xmlview("objectPageView", {
				viewName: "view.UxAP-77_ObjectPage"
			});
			this.appControl.addPage(this.oView);
			this.appControl.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.appControl.destroy();
			this.oSampleView.destroy();
			this.oView.destroy();
		}
	});

	QUnit.test("create instance ObjectPageLayout via javascript", function (assert) {
		var oObjectPage = new sap.uxap.ObjectPageLayout("myObjectPage1");
		assert.equal(oObjectPage.getId(), "myObjectPage1");
	});
	QUnit.test("add ObjectPageLayout in XMLView via API", function (assert) {
		var oObjectPage = new sap.uxap.ObjectPageLayout(this.oView.createId("myObjectPage2"));
		this.oView.addContent(oObjectPage);
		var referenceObjectPage = this.oView.byId("myObjectPage2");
		assert.ok(referenceObjectPage != undefined, "ObjectPageLayout created in View");

	});
	QUnit.test("test default value of ShowAnchorBar", function (assert) {
		this.oView.removeAllContent();
		var oObjectPage = new sap.uxap.ObjectPageLayout(this.oView.createId("myObjectPage3"));
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});
	QUnit.test("test ShowAnchorBar via Control settings", function (assert) {
		var oObjectPage = new sap.uxap.ObjectPageLayout(this.oView.createId("myObjectPage4"), {showAnchorBar: false});
		assert.equal(oObjectPage.getShowAnchorBar(), false);
	});

	QUnit.test("test ShowAnchorBar APIs", function (assert) {
		var oObjectPage = new sap.uxap.ObjectPageLayout(this.oView.createId("myObjectPage5"));
		oObjectPage.setShowAnchorBar(false);
		assert.equal(oObjectPage.getShowAnchorBar(), false);
		oObjectPage.setShowAnchorBar(true);
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});
	QUnit.test("test Section APIs", function (assert) {
		var oObjectPage = new sap.uxap.ObjectPageLayout(this.oView.createId("myObjectPage7"));
		var oSection1 = new sap.uxap.ObjectPageSection({title: "Recognition"});
		var oSection2 = new sap.uxap.ObjectPageSection({title: "Employee"});
		oObjectPage.addSection(oSection1);
		oObjectPage.addSection(oSection2);
		var aSections = oObjectPage.getSections();
		assert.equal(aSections.length, 2);

		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.indexOfSection(oSection2), 1);

		assert.equal(aSections[0].getTitle(), "Recognition");
		assert.equal(aSections[1].getTitle(), "Employee");
		var oSection3 = new sap.uxap.ObjectPageSection({title: "Goal"});
		oObjectPage.insertSection(oSection3, 1);
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.indexOfSection(oSection3), 1);
		assert.equal(oObjectPage.indexOfSection(oSection2), 2);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Recognition");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Employee");
		oObjectPage.removeSection(oSection1);
		assert.equal(oObjectPage.getSections().length, 2);
		assert.equal(oObjectPage.indexOfSection(oSection3), 0);
		assert.equal(oObjectPage.indexOfSection(oSection2), 1);

		oObjectPage.removeAllSections();
		assert.equal(oObjectPage.getSections().length, 0);
		oObjectPage.addSection(oSection1);
		assert.equal(oObjectPage.getSections().length, 1);
		oObjectPage.destroySections();
		assert.equal(oObjectPage.getSections().length, 0);
	});

	QUnit.test("test Height APIs", function (assert) {
		var oObjectPage = new sap.uxap.ObjectPageLayout(this.oView.createId("myObjectPage10"));
		assert.equal(oObjectPage.getHeight(), '100%');
		oObjectPage.setHeight('50%');
		assert.equal(oObjectPage.getHeight(), '50%');
	});
	QUnit.test("test Header APIs", function (assert) {
		var oObjectPage = new sap.uxap.ObjectPageLayout(this.oView.createId("myObjectPage11"));
		var oHeader = new sap.uxap.ObjectPageHeader("header");
		oObjectPage.addHeaderContent(new sap.m.Text({text: "test"}));
		oObjectPage.setHeaderTitle(oHeader);
		var aContent = oObjectPage.getHeaderContent();
		assert.equal(aContent[0].getText(), "test");
	});

	QUnit.test("test ShowAnchorBar for ObjectPageLayout defined into XMLView", function (assert) {
		this.appControl.removeAllPages();
		this.appControl.addPage(this.oSampleView);
		var oObjectPage = this.oSampleView.byId("objectPage13");
		assert.equal(oObjectPage.getShowAnchorBar(), true);
		oObjectPage.setShowAnchorBar(false);
		assert.equal(oObjectPage.getShowAnchorBar(), false);
		oObjectPage.setShowAnchorBar(true);
		assert.equal(oObjectPage.getShowAnchorBar(), true);
	});

	QUnit.test("test Section for ObjectPageLayout defined into XMLView", function (assert) {
		this.appControl.removeAllPages();
		this.appControl.addPage(this.oSampleView);

		var oObjectPage = this.oSampleView.byId("objectPage13");
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Payroll");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Wage Type");

		var oSection1 = new sap.uxap.ObjectPageSection(this.oSampleView.createId("sectionGoal"), {title: "Goal"});
		oObjectPage.insertSection(oSection1, 1);
		assert.equal(oObjectPage.getSections().length, 4);
		assert.equal(oObjectPage.indexOfSection(oSection1), 1);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Payroll");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[3].getTitle(), "Wage Type");
		oObjectPage.removeSection(oObjectPage.getSections()[0]);
		assert.equal(oObjectPage.getSections().length, 3);
		assert.equal(oObjectPage.indexOfSection(oSection1), 0);
		assert.equal(oObjectPage.getSections()[0].getTitle(), "Goal");
		assert.equal(oObjectPage.getSections()[1].getTitle(), "Status");
		assert.equal(oObjectPage.getSections()[2].getTitle(), "Wage Type");
		var oSection2 = new sap.uxap.ObjectPageSection(this.oSampleView.createId("sectionRecognition"), {title: "Recognition"});
		oObjectPage.addSection(oSection2);
		assert.equal(oObjectPage.getSections().length, 4);
		assert.equal(oObjectPage.indexOfSection(oSection2), 3);
		assert.equal(oObjectPage.getSections()[3].getTitle(), "Recognition");
		oSection2.addDelegate({
			onAfterRendering: function () {
				QUnit.test("Sections Rendering", function (assert) {
					//check sections
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionGoal"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionStatus"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionWageType"), true);
					assert.strictEqual(checkObjectExists("#objectPageViewSample--sectionRecognition"), true);
				});
			}
		});
	});

	function checkObjectExists(sSelector) {
		var oObject = jQuery(sSelector);
		return oObject.length !== 0;
	}

}(jQuery, QUnit));