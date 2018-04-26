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
			generateObjectPageWithSubSectionContent: function (oFactory, iNumberOfSection, iNumberOfSubSection, bUseIconTabBar) {
				var oObjectPage = bUseIconTabBar ? oFactory.getObjectPageLayoutWithIconTabBar() : oFactory.getObjectPage(),
					oSection,
					oSubSection,
					sSectionId,
					sSubSectionId;

				for (var i = 0; i < iNumberOfSection; i++) {
					sSectionId = "s" + i;
					oSection = oFactory.getSection(sSectionId);

					for (var j = 0; j < iNumberOfSubSection; j++) {
						sSubSectionId = sSectionId + "ss" + j;
						oSubSection = oFactory.getSubSection(sSubSectionId, oFactory.getBlocks());
						oSection.addSubSection(oSubSection);
					}

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
			},
			done = assert.async();

		/* Act: Hide the third section.
		 /* which used to cause a failure, see BCP: 1770148914 */
		this.oThirdSection.setVisible(false);

		setTimeout(function () {
			/* Assert:
			 /* The ObjectPage adjusts its layout, */
			/* but the selected section should remain the same. */
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, this.iLoadingDelay);

	});

	QUnit.test("unset selected section", function (assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oObjectPage.getSections()[0],
			oSecondSection = this.oSecondSection,
			oExpected,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		setTimeout(function () {

			// initially, the second section is selected (from the module setup)
			oExpected = {
				oSelectedSection: oSecondSection,
				sSelectedTitle: oSecondSection.getSubSections()[0].getTitle()
			};
			sectionIsSelected(oObjectPage, assert, oExpected);


			// Act: unset the currently selected section
			oObjectPage.setSelectedSection(null);

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

				// Check: the selection moved to the first visible section
				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
				};
				sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		});
		}, this.iLoadingDelay);
	});

	QUnit.test("unset selected section resets expanded state", function (assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oObjectPage.getSections()[0],
			oSecondSection = this.oSecondSection,
			oExpected,
			done = assert.async(); //async test needed because tab initialization is done onAfterRenderingDomReady (after HEADER_CALC_DELAY)

		// add header content
		oObjectPage.setUseIconTabBar(false);
		oObjectPage.setHeaderTitle(new sap.uxap.ObjectPageHeader({
			objectTitle: "Long title that wraps and goes over more lines",
			objectSubtitle: "Long subtitle that wraps and goes over more lines"
		}));
		oObjectPage.addHeaderContent(new sap.ui.core.HTML({content: "<div style='height:100px'>some content</div>"}));

		setTimeout(function () {

			// initially, the second section is selected (from the module setup)
			oExpected = {
				oSelectedSection: oSecondSection,
				sSelectedTitle: oSecondSection.getSubSections()[0].getTitle()
			};
			sectionIsSelected(oObjectPage, assert, oExpected);
			assert.equal(oObjectPage._bHeaderExpanded, false, "Header is snapped");


			// Act: unset the currently selected section
			oObjectPage.setSelectedSection(null);

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

				// Check: the selection moved to the first visible section
				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[0].getTitle() //subsection is promoted
				};
				sectionIsSelected(oObjectPage, assert, oExpected);
				assert.equal(oObjectPage._bHeaderExpanded, true, "Header is expnded");
				done();
			});
		}, this.iLoadingDelay);
	});

	QUnit.module("Content resize", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, false);
			this.iLoadingDelay = 2000;
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.iLoadingDelay = 0;
		}
	});

	QUnit.test("adjust selected section", function (assert) {
		var oObjectPage = this.oObjectPage,
			oHhtmBlock,
			oFirstSection = oObjectPage.getSections()[0],
			oSecondSection = oObjectPage.getSections()[1],
			done = assert.async();

		// setup step1: add content with defined height
		oHhtmBlock = new sap.ui.core.HTML("b1", { content: '<div class="innerDiv" style="height:300px"></div>'});
		oFirstSection.getSubSections()[0].addBlock(oHhtmBlock);

		// setup step2
		oObjectPage.setSelectedSection(oSecondSection.getId());

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Act: change height without invalidating any control => on the the resize handler will be responsible for re-adjusting the selection
			sap.ui.getCore().byId("b1").getDomRef().style.height = "200px";

			setTimeout(function() {
				assert.equal(oObjectPage.getSelectedSection(), oSecondSection.getId(), "selected section is correct");
				done();
			}, this.iLoadingDelay);

		});

		helpers.renderObject(oObjectPage);
	});

	QUnit.module("test setSelectedSection functionality");

	QUnit.test("test setSelectedSection with initially empty ObjectPage", function (assert) {
		var oObjectPage = oFactory.getObjectPage(),
			sSectionId = "section1";

		// act
		oObjectPage.setSelectedSection(sSectionId);

		// assert
		assert.strictEqual(oObjectPage.getSelectedSection(), sSectionId, "The given section should be the selected one");

		oObjectPage.destroy();
	});

	QUnit.module("IconTabBar section selection", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 3;
			this.NUMBER_OF_SUB_SECTIONS = 2;
			this.oObjectPage = helpers.generateObjectPageWithSubSectionContent(oFactory, this.NUMBER_OF_SECTIONS, this.NUMBER_OF_SUB_SECTIONS, true);
			this.oFirstSection = this.oObjectPage.getSections()[0];
			this.oSecondSection = this.oObjectPage.getSections()[1];
			this.iLoadingDelay = 500;
			this.oObjectPage.placeAt("qunit-fixture");
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
			oSelectedBtn = sap.ui.getCore().byId(sSelectedBtnId),
			bExpectedSnapped = oExpected.bSnapped,
			iExpectedScrollTop = oExpected.iScrollTop;

		assert.ok(oSelectedBtn, "anchorBar has selected button");
		assert.strictEqual(oExpected.sSelectedTitle, oSelectedBtn.getText(), "section is selected in anchorBar");
		assert.strictEqual(oExpected.oSelectedSection.getId(), oObjectPage.getSelectedSection(), "section is selected in objectPage");
		assert.ok(oObjectPage.$().find("#" + oExpected.oSelectedSection.getId() + "*").length, "section is rendered");

		if (bExpectedSnapped !== undefined) {
			assert.strictEqual(oObjectPage._bStickyAnchorBar, bExpectedSnapped, "header snapped state is correct");
		}
		if (iExpectedScrollTop !== undefined) {
			assert.strictEqual(Math.ceil(oObjectPage._$opWrapper[0].scrollTop), Math.ceil(iExpectedScrollTop), "scroll position is correct");
		}
	}

	QUnit.test("test first visible section is initially selected", function (assert) {

		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);
				done();
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another section", function (assert) {

		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			bTabsMode = oPage.getUseIconTabBar(),
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSecondSection.getId(), 0, null, true);

				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another subSection (first subsection)", function (assert) {

		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			bTabsMode = oPage.getUseIconTabBar(),
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSecondSection.getSubSections()[0].getId(), 0, null, true);

				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("scrollTo another subSection (second subsection)", function (assert) {

		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			oSubSectionToScrollTo = oSecondSection.getSubSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oPage.scrollToSection(oSubSectionToScrollTo.getId(), 0, null, true);

				//check
				setTimeout(function() {

					var oExpected = {
						oSelectedSection: oSecondSection,
						sSelectedTitle: oSecondSection.getTitle(),
						bSnapped: true,
						iScrollTop: jQuery('#' + oSubSectionToScrollTo.getId()).position().top
					};

					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section before rendering completed", function (assert) {
		var oPage = this.oObjectPage,
			oSecondSection = this.oSecondSection,
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle() //subsection is promoted
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};

		//act
		oPage.setSelectedSection(this.oSecondSection.getId());
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section on before page rendering", function (assert) {

		var oPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 3, 2, true),
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);

					oPage.destroy();//cleanup
					done();
				}, 0);
			};

		oPage.addEventDelegate({onBeforeRendering: function() {
			oPage.setSelectedSection(oSecondSection.getId());
		}});
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
		oPage.placeAt("qunit-fixture");
	});

	QUnit.test("select another section on after page rendering", function (assert) {
		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};

		oPage.addEventDelegate({onAfterRendering: function() {
			oPage.setSelectedSection(oSecondSection.getId());
		}});
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("select another section after dom rendering completed", function (assert) {
		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oPage.setSelectedSection(oSecondSection.getId());

				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle()
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide selectedSection when selectedSection is first", function (assert) {
		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				oFirstSection.setVisible(false); /* hide first section */

				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide a subsection of selectedSection when selectedSection is first", function (assert) {
		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			done = assert.async(),
			fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				oFirstSection.getSubSections()[0].setVisible(false);

				oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getSubSections()[1].getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test hide all subsections of selectedSection when selectedSection is first", function (assert) {
		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			oSecondSection = oPage.getSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				oPage.detachEvent("onAfterRenderingDOMReady", fnOnDomReady);

				//initial state
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: oFirstSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);

				// act
				//hide all subsections => no content left to display
				oFirstSection.getSubSections()[0].setVisible(false);
				oFirstSection.getSubSections()[1].setVisible(false);

				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 1000);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("test remove selected section", function (assert) {

		var oObjectPage = this.oObjectPage,
			iLoadingDelay = 500,
			done = assert.async();

		//act
		oObjectPage.removeSection(this.oFirstSection);
		sap.ui.getCore().applyChanges();

		var oExpected = {
			oSelectedSection: this.oSecondSection,
			sSelectedTitle: this.oSecondSection.getTitle() //subsection is promoted
		};

		//check
		setTimeout(function () {
			sectionIsSelected(oObjectPage, assert, oExpected);
			done();
		}, iLoadingDelay);
	});

	QUnit.test("test rename selected section", function (assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = this.oFirstSection,
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oFirstSection,
					sSelectedTitle: "Updated Title"
				};

				//check
				sectionIsSelected(oObjectPage, assert, oExpected);
				done();
			};

		//act
		this.oFirstSection.setTitle("Updated Title");
		sap.ui.getCore().applyChanges();

		oObjectPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("section modified during layout calculation", function (assert) {

		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			oThirdSection = oPage.getSections()[2],
			bTabsMode = oPage.getUseIconTabBar(),
			done = assert.async(),
			fnOnDomReady = function() {
				//act
				oFirstSection.setVisible(false); // will trigger async request to adjust layout
				oPage.setSelectedSection(oThirdSection.getId());

				var oExpected = {
					oSelectedSection: oThirdSection,
					sSelectedTitle: oThirdSection.getTitle(),
					bSnapped: !bTabsMode
				};

				//check
				setTimeout(function() {
					sectionIsSelected(oPage, assert, oExpected);
					done();
				}, 0);
			};
		oPage.attachEvent("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("_isClosestScrolledSection", function (assert) {

		var oPage = this.oObjectPage,
			oFirstSection = oPage.getSections()[0],
			oThirdSection = oPage.getSections()[2],
			done = assert.async(),
			fnOnDomReady = function() {

				//check
				assert.strictEqual(oPage._isClosestScrolledSection(oFirstSection.getId()), true, "first section is currently scrolled");

				oPage.setSelectedSection(oThirdSection.getId());

				//check
				setTimeout(function() {
					assert.strictEqual(oPage._isClosestScrolledSection(oThirdSection.getId()), true, "third section is currently scrolled");
					done();
				}, 0);
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.test("setSelectedSection to subsection", function (assert) {

		var oPage = this.oObjectPage,
			oSecondSection = oPage.getSections()[1],
			oSecondSectionSecondSubSection = oSecondSection.getSubSections()[1],
			done = assert.async(),
			fnOnDomReady = function() {
				var oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getTitle(),
					bSnapped: false
				};

				sectionIsSelected(oPage, assert, oExpected);
				oPage.rerender();
				sectionIsSelected(oPage, assert, oExpected);
				done();
			};
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		oPage.setSelectedSection(oSecondSectionSecondSubSection);
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
			sap.ui.getCore().applyChanges();
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

	QUnit.test("test AnchorBar showPopover setting through ObjectPageLayout", function (assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13"),
			oAnchorBar =  oObjectPage.getAggregation("_anchorBar"),
			oSectionButton = oAnchorBar.getContent()[0];

		assert.equal(oSectionButton.getIcon(), "sap-icon://slim-arrow-down", "Drop-down icon in AnchorBar button is shown initially");

		oObjectPage.setShowAnchorBarPopover(false);
		sap.ui.getCore().applyChanges();
		oSectionButton = oAnchorBar.getContent()[0];

		assert.equal(oSectionButton.getIcon(), "", "Drop-down icon in AnchorBar button is not shown");
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

	QUnit.test("Should not call ObjectPageHeader _toggleFocusableState in non DynamicPageTitle case", function (assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13"),
			oHeader = oObjectPage.getHeaderTitle(),
			oHeaderSpy = this.spy(oHeader, "_toggleFocusableState");

		// act
		oObjectPage.setToggleHeaderOnTitleClick(false);

		// assert
		assert.strictEqual(oHeaderSpy.callCount, 0, "ObjectPageHeader _toggleFocusableState is not called");
	});

	QUnit.test("Should copy _headerContent hidden aggregation to the ObjectPage clone", function (assert) {
		var oObjectPage = this.oSampleView.byId("objectPage13"),
			oObjectPageClone = oObjectPage.clone(),
			oHeaderContent = oObjectPage.getHeaderContent(),
			oHeaderContentClone = oObjectPageClone.getHeaderContent();

		assert.strictEqual(oHeaderContentClone !== null, true, "HeaderContent aggregation should exist in the clone");
		assert.strictEqual(oHeaderContent.length, oHeaderContentClone.length, "HeaderContent and it's clone should have the same nubmer of elements");
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

	QUnit.module("ObjectPage HeaderContent");

	QUnit.test("test getHeaderContent returns array if empty", function (assert) {
		// setup: object page without header content
		var oPage = new sap.uxap.ObjectPageLayout(),
			aHeaderContent = oPage.getHeaderContent();

		// check
		assert.ok(Array.isArray(aHeaderContent), "array is returned");
		assert.strictEqual(aHeaderContent.length, 0, "empty array is returned");

		// cleanup
		oPage.destroy();
	});

	QUnit.module("ObjectPage API: sections removal", {
		beforeEach: function () {
			this.iDelay = 500;
			this.oSelectedSection = oFactory.getSection(2, null, [
				oFactory.getSubSection(2, [oFactory.getBlocks(), oFactory.getBlocks()], null)
			]);

			this.oOP = oFactory.getObjectPage();
			this.oOP.addSection(oFactory.getSection(1, null, [
					oFactory.getSubSection(1, [oFactory.getBlocks(), oFactory.getBlocks()], null)
			])).addSection(this.oSelectedSection)
				.setSelectedSection(this.oSelectedSection.getId());

			this.oOP.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oOP.destroy();
			this.oOP = null;
			this.oSelectedSection.destroy();
			this.oSelectedSection = null;
		}
	});

	QUnit.test("test removeAllSections should reset selectedSection", function (assert) {
		var oObjectPage = this.oOP,
			done = assert.async();

		// Act
		oObjectPage.removeAllSections();
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			assert.equal(oObjectPage.getSections().length, 0, "There are no sections.");
			assert.equal(oObjectPage.getSelectedSection(), null, "Selected section is null as there are no sections.");
			done();
		},  this.iDelay);
	});

	QUnit.test("applyLayout is not called on invalidated SubSection without parent ObjectPage", function (assert) {
		var oObjectPage = this.oOP,
			sNewTitle = "New SubSection Title",
			oSectionToRemove = this.oSelectedSection,
			oSubSectionToSpy = this.oSelectedSection.getSubSections()[0],
			oSubSectionMethodSpy = this.spy(oSubSectionToSpy, "_applyLayout");

		// Act: invalidate the SubSection and remove its parent Section
		oSubSectionToSpy.setTitle(sNewTitle); // invalidate the SubSection
		oObjectPage.removeSection(oSectionToRemove); // remove the Section

		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oSubSectionMethodSpy.callCount, 0,
			"applyLayout is called: " + oSubSectionMethodSpy.callCount + " times.");
	});


	QUnit.test("test destroySections should reset selectedSection", function (assert) {
		var oObjectPage = this.oOP,
			done = assert.async();

		// Act
		oObjectPage.destroySections();
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			assert.equal(oObjectPage.getSections().length, 0, "There are no sections.");
			assert.equal(oObjectPage.getSelectedSection(), null, "Selected section is null as there are no sections.");
			done();
		}, this.iDelay);
	});

	QUnit.module("ObjectPage API: invalidate");

	QUnit.test("inactive section does not invalidate the objectPage", function (assert) {

		var oObjectPage = new sap.uxap.ObjectPageLayout({
			useIconTabBar: true,
			selectedSection: "section1",
			sections: [
				new sap.uxap.ObjectPageSection("section1", {
					subSections: [
						new sap.uxap.ObjectPageSubSection({
							blocks: [
								new sap.m.Link("section1Link", {})
							]
						})
					]
				}),
				new sap.uxap.ObjectPageSection("section2", {
					subSections: [
						new sap.uxap.ObjectPageSubSection({
							blocks: [
								new sap.m.Link("section2Link", {})
							]
						})
					]
				})

			]
		}),
		oObjectPageRenderSpy = this.spy(),
		done = assert.async();

		helpers.renderObject(oObjectPage);

		oObjectPage.addEventDelegate({
			onBeforeRendering: oObjectPageRenderSpy
		});

		//act
		sap.ui.getCore().byId("section2Link").invalidate();

		//check
		setTimeout(function() {
			assert.equal(oObjectPageRenderSpy.callCount, 0,
				"OP is not rerendered");
			oObjectPage.destroy();
			done();
		}, 0);
	});

	QUnit.test("browser events not attached twice on rerender", function (assert) {

		var oButton = new sap.m.Button("btn1", {text: "test"}),
			oObjectPage = new sap.uxap.ObjectPageLayout({
				useIconTabBar: true,
				selectedSection: "section1",
				sections: [
					new sap.uxap.ObjectPageSection("section1", {
						subSections: [
							new sap.uxap.ObjectPageSubSection({
								blocks: [
									oButton
								]
							})
						]
					})
				]
			}),
			fnBrowserEventHandler = this.spy(),
			fnOnDomReady = function() {
				oObjectPage.rerender();
				var event,
					$buttonDomRef = sap.ui.getCore().byId("btn1").getDomRef();
				if (typeof Event === 'function') {
					event = new Event("click");
				} else {
					event = document.createEvent('Event');
					event.initEvent("click", true, true);
				}
				$buttonDomRef.dispatchEvent(event);
				assert.equal(fnBrowserEventHandler.callCount, 1, "browser event listener called only once");
				oObjectPage.destroy();
				done();
			},
			done = assert.async();

		assert.expect(1); //number of assertions

		oButton.attachBrowserEvent("click", fnBrowserEventHandler);

		helpers.renderObject(oObjectPage);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
	});

	QUnit.module("ObjectPage with ObjectPageDynamicHeaderTitle", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 1;
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, this.NUMBER_OF_SECTIONS, true);
			this.oObjectPage.setHeaderTitle(new sap.uxap.ObjectPageDynamicHeaderTitle());
			this.oObjectPage.addHeaderContent(new sap.m.Text({text: "test"}));
			helpers.renderObject(this.oObjectPage);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("ObjectPage Header pinnable and not pinnable", function (assert) {

		var oHeader = this.oObjectPage._getHeaderContent(),
			oPinButton = oHeader.getAggregation("_pinButton");

		this.oObjectPage.setHeaderContentPinnable(false);
		sap.ui.getCore().applyChanges();

		assert.ok(!oPinButton.$()[0],
			"The ObjectPage Header Pin Button not rendered");

		this.oObjectPage.setHeaderContentPinnable(true);
		sap.ui.getCore().applyChanges();

		assert.ok(oPinButton.$()[0],
			"The ObjectPage Header Pin Button rendered");

		assert.equal(oPinButton.$().hasClass("sapUiHidden"), false,
			"The ObjectPage Header Pin Button is visible");
	});

	QUnit.test("ObjectPage Header - expanding/collapsing by clicking the title", function (assert) {

		var oObjectPage = this.oObjectPage,
			oObjectPageTitle = oObjectPage.getHeaderTitle(),
			oHeaderContent = oObjectPage._getHeaderContent(),
			oPinButton = oHeaderContent._getPinButton(),
			oFakeEvent = {
				srcControl: oObjectPageTitle
			};

		this.oObjectPage._bHeaderInTitleArea = true;

		assert.equal(oObjectPage._bHeaderExpanded, true, "Initially the header is expanded");
		assert.equal(oObjectPage.getToggleHeaderOnTitleClick(), true, "Initially toggleHeaderOnTitleClick = true");

		oObjectPageTitle.ontap(oFakeEvent);

		assert.equal(oObjectPage._bHeaderExpanded, false, "After one click, the header is collapsed");

		oObjectPage.setToggleHeaderOnTitleClick(false);

		oObjectPageTitle.ontap(oFakeEvent);
		assert.equal(oObjectPage._bHeaderExpanded, false, "The header is still collapsed, because toggleHeaderOnTitleClick = false");

		oObjectPage.setToggleHeaderOnTitleClick(true);

		oObjectPageTitle.ontap(oFakeEvent);
		assert.equal(oObjectPage._bHeaderExpanded, true, "After restoring toggleHeaderOnTitleClick to true, the header again expands on click");

		oPinButton.firePress();
		oObjectPageTitle.ontap(oFakeEvent);

		assert.strictEqual(oObjectPage._bHeaderExpanded, false, "After one click, the header is collapsed even it's pinned");
		assert.strictEqual(oPinButton.getPressed(), false, "Pin button pressed state should be reset.");
		assert.strictEqual(oObjectPage.$().hasClass("sapUxAPObjectPageLayoutHeaderPinned"), false, "ObjectPage header should be unpinned.");
	});

	QUnit.test("ObjectPage Header - expanding/collapsing by clicking the title", function (assert) {
		// arrange
		var oObjectPage = this.oObjectPage,
			oObjectPageTitle = oObjectPage.getHeaderTitle(),
			oStateChangeListener = this.spy(),
			oFakeEvent = {
				srcControl: oObjectPageTitle
			};

		oObjectPageTitle.attachEvent("stateChange", oStateChangeListener);

		// act
		oObjectPageTitle.ontap(oFakeEvent);

		// assert
		assert.ok(oStateChangeListener.calledOnce, "stateChange event was fired once");

		// act
		oObjectPageTitle.ontap(oFakeEvent);

		// assert
		assert.strictEqual(oStateChangeListener.callCount, 2, "stateChange event was fired twice");
	});

	QUnit.module("ObjectPage with alwaysShowContentHeader", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
			this.oObjectPage.setAlwaysShowContentHeader(true);
			this.oObjectPage.addHeaderContent(new sap.m.Text({text: "Some header content"}));
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Should not call toggleHeader", function (assert) {
		var oObjectPage = this.oObjectPage,
			oHeaderContent,
			oSecondSection = oObjectPage.getSections()[1],
			oToggleHeaderSpy = this.spy(oObjectPage, "_toggleHeader"),
			done = assert.async(),
			fnOnDomReady = function() {
				oObjectPage.scrollToSection(oSecondSection.getId(), 0);
				assert.strictEqual(oToggleHeaderSpy.callCount, 0, "Toggle header is not called");
				oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnRerenderedDomReady2);
				oObjectPage.rerender();
			},
			fnOnRerenderedDomReady2 = function() {
				assert.equal(oObjectPage._bHeaderExpanded, true, "Flag for expandedHeader has correct value");
				oHeaderContent = oObjectPage._getHeaderContent();
				assert.equal(oHeaderContent.$().hasClass("sapUxAPObjectPageHeaderContentHidden"), false, "Header content is not hidden");
				done();
			};

			assert.expect(3);
			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
			helpers.renderObject(oObjectPage);
	});

	QUnit.module("Modifying hidden page", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("Should change selectedSection", function (assert) {
		var oObjectPage = this.oObjectPage,
			oSecondPage = new sap.m.Page(),
			oNavContainer = new sap.m.App(),
			oSecondSection = oObjectPage.getSections()[1],
			iCompleteScrollTimeout = oObjectPage._iScrollToSectionDuration + 100,
			iCompleteResizeCalculationTimeout = sap.uxap.ObjectPageLayout.HEADER_CALC_DELAY + 100,
			oExpected,
			done = assert.async(),
			fnOnDomReady = function() {
				oNavContainer.attachEventOnce("afterNavigate", fnOnHideObjectPage);
				oNavContainer.to(oSecondPage.getId()); // nav to the second page to hide the object page
			},
			fnOnHideObjectPage = function() {
				// act: change selectedSection while page is HIDDEN
				oObjectPage.setSelectedSection(oSecondSection);
				setTimeout(fnOnChangedSelection, iCompleteScrollTimeout);
			},
			fnOnChangedSelection = function() {
				oNavContainer.attachEventOnce("afterNavigate", fnOnShowBackObjectPage);
				oNavContainer.to(oObjectPage.getId()); // nav back to the object page
			},
			fnOnShowBackObjectPage = function() {
				setTimeout(onResizeCheckCompleted, iCompleteResizeCalculationTimeout);
			},
			onResizeCheckCompleted = function() {
				oExpected = {
					oSelectedSection: oSecondSection,
					sSelectedTitle: oSecondSection.getSubSections()[0].getTitle(), // the only subsection is promoted
					bSnapped: true
				};
				//check
				sectionIsSelected(oObjectPage, assert, oExpected);
				done();
			};

		assert.expect(5);
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		oNavContainer.addPage(oObjectPage);
		oNavContainer.addPage(oSecondPage);
		helpers.renderObject(oNavContainer);
	});

	QUnit.module("First visible section", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithSubSectionContent(oFactory, 5, 2);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("iconTabBar mode selected section", function (assert) {
		this.oObjectPage.setUseIconTabBar(true);

		var oSectionToSelect = this.oObjectPage.getSections()[1];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		helpers.renderObject(this.oObjectPage);

		assert.ok(this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelect), "the selected section is the first visible one");
	});

	QUnit.test("iconTabBar mode selected section first subSection", function (assert) {
		this.oObjectPage.setUseIconTabBar(true);

		var oSectionToSelect = this.oObjectPage.getSections()[1],
			oSectionToSelectFirstSubSection = oSectionToSelect.getSubSections()[0];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		helpers.renderObject(this.oObjectPage);

		assert.ok(this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelectFirstSubSection), "the first visible subSection is correct");
	});

	QUnit.test("iconTabBar mode selected section non-first subSection", function (assert) {
		this.oObjectPage.setUseIconTabBar(true);

		var oSectionToSelect = this.oObjectPage.getSections()[1],
			oSectionToSelectSecondSubSection = oSectionToSelect.getSubSections()[1];
		this.oObjectPage.setSelectedSection(oSectionToSelect);

		helpers.renderObject(this.oObjectPage);

		assert.ok(!this.oObjectPage._isFirstVisibleSectionBase(oSectionToSelectSecondSubSection), "the first visible subSection is correct");
	});

	QUnit.module("ScrollDelegate", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("getScrollDelegate", function (assert) {
		var oObjectPage = this.oObjectPage,
			iInitScrollTop,
			iNewScrollTop,
			done = assert.async();

		assert.expect(1);

		// wait for the event when the page is rendered and ready
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Setup: save init scroll position
			iInitScrollTop = oObjectPage._$opWrapper.scrollTop();

			// Act: call scrolling while scrolling is suppressed
			iNewScrollTop = iInitScrollTop + 10;
			oObjectPage.getScrollDelegate().scrollTo(0 /* x */, iNewScrollTop /* y */);

			// Check if scroll was effective
			assert.strictEqual(oObjectPage._$opWrapper.scrollTop(), iNewScrollTop, "scroll top is changed");
			done();
		});

		// Act: render page to test scrolling behavior
		helpers.renderObject(oObjectPage);
	});

	QUnit.module("RTA util functions", {

		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 5);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("_suppressScroll", function (assert) {
		var oObjectPage = this.oObjectPage,
			iScrollTopBefore,
			iScrollTopAfter,
			done = assert.async();

		assert.expect(1);

		// wait for the event when the page is rendered and ready
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Setup: save current scroll position and suppress scroll
			iScrollTopBefore = oObjectPage._$opWrapper.scrollTop();
			oObjectPage._suppressScroll();

			// Act: call scrolling while scrolling is suppressed
			oObjectPage._scrollTo(iScrollTopBefore + 10);

			// Check if scroll suppression was effective
			iScrollTopAfter = oObjectPage._$opWrapper.scrollTop();
			assert.strictEqual(iScrollTopBefore, iScrollTopAfter, "scroll top is unchanged");
			done();
		});

		// Act: render page to test scrolling behavior
		helpers.renderObject(oObjectPage);
	});

	QUnit.test("_resumeScroll", function (assert) {
		var oObjectPage = this.oObjectPage,
			iUpdatedScrollTop = 0,
			oFirstSection = oObjectPage.getSections()[0],
			oFourthSection = oObjectPage.getSections()[3],
			done = assert.async();

		// Arrange: set selection to a (non-first) section that requires page scrolling
		oObjectPage.setSelectedSection(oFourthSection.getId());

		assert.expect(3);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Arrange: save current scroll position and suppress scroll
			oObjectPage._suppressScroll();

			// Act: Change scrollTop (effect of RTA operation)
			oObjectPage._$opWrapper.scrollTop(iUpdatedScrollTop);

			// Act: resume page's own scrolling and restore state
			oObjectPage._resumeScroll();

			// Check that the restored section corresponds to the current scroll position
			assert.strictEqual(oObjectPage.getSelectedSection(), oFirstSection.getId(), "selected section is correct");
			assert.strictEqual(oObjectPage._$opWrapper.scrollTop(), iUpdatedScrollTop, "scroll top is correct");

			// Check that the state is correctly preserved even of the page is meanwhile invalidated and rerendered
			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				setTimeout(function() {
					assert.strictEqual(oObjectPage._$opWrapper.scrollTop(), iUpdatedScrollTop, "scroll top is correct");
					done();
				}, 0);
			});
			// Act: invalidate and apply changes to cause rerendering
			oObjectPage.invalidate();
			sap.ui.getCore().applyChanges();
		});

		// Act: render page to test scrolling behavior
		helpers.renderObject(oObjectPage);
	});

	function checkObjectExists(sSelector) {
		var oObject = jQuery(sSelector);
		return oObject.length !== 0;
	}

}(jQuery, QUnit));
