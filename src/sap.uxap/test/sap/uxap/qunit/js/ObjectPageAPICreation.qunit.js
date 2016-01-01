(function ($, QUnit) {

	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");
	jQuery.sap.registerModulePath("view", "view");

	var oFactory = {
			getSection: function (iNumber) {
				return new sap.uxap.ObjectPageSection({
					title: "Section" + iNumber
				});
			},
			getSubSection: function (iNumber, aBlocks) {
				return new sap.uxap.ObjectPageSubSection({
					title: "SubSection " + iNumber,
					blocks: aBlocks || []
				});
			},
			getBlocks: function (sText) {
				return [
					new sap.m.Text({text: sText || "some text"})
				]
			},
			getObjectPage: function (sId) {
				return new sap.uxap.ObjectPageLayout();
			},
			getObjectPageLayoutWithIconTabBar: function () {
				return new sap.uxap.ObjectPageLayout({
					useIconTabBar: true
				});
			}
		},

		helpers = {
			generateObjectPageWithIconTabBarAndContent: function (oFactory, iNumberOfSection) {
				var oObjectPage = oFactory.getObjectPageLayoutWithIconTabBar(),
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

	module("IconTabBar is initially enabled", {
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

	module("IconTabBar is initially not enabled", {
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


	module("Use IconTabBar with no sections", {
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

	module("Use IconTabBar with one section", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 1;
			this.oObjectPage = helpers.generateObjectPageWithIconTabBarAndContent(oFactory, this.NUMBER_OF_SECTIONS);
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


	module("IconTabBar section selection", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.oObjectPage = helpers.generateObjectPageWithIconTabBarAndContent(oFactory, this.NUMBER_OF_SECTIONS);
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

	QUnit.test("select another section", function (assert) {
		//act
		this.oObjectPage.scrollToSection(this.oSecondSection.getId());

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		sectionIsSelected(this.oObjectPage, assert, oExpected);
	});

	QUnit.test("test hide selected section", function (assert) {
		//act
		this.oFirstSection.setVisible(false);

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		sectionIsSelected(this.oObjectPage, assert, oExpected);
	});

	QUnit.test("test hide selected subsection", function (assert) {
		//act
		//hide the only subsection => no content left to display
		this.oFirstSection.getSubSections()[0].setVisible(false);

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		sectionIsSelected(this.oObjectPage, assert, oExpected);
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
		//act
		this.oFirstSection.getSubSections()[0].setTitle("Updated Title");

		var oExpected = {
			oSelectedSection: this.oFirstSection,
			sSelectedTitle: this.oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
		};

		//check
		sectionIsSelected(this.oObjectPage, assert, oExpected);
	});


	module("ObjectPage API: AnchorBar", {
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


	module("ObjectPage API: ObjectPageHeader", {
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


	module("ObjectPage API", {
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
		var oHeader2 = oObjectPage.getHeaderTitle();
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
				QUnit.test("Sections Rendering", function () {
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