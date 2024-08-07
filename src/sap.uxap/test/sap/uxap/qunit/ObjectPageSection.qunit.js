/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/mvc/XMLView",
	"sap/uxap/library",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSectionBase",
	"sap/m/Text",
	"sap/m/MessageStrip",
	"sap/m/Button",
	"sap/m/Panel"
],
function(Element, nextUIUpdate, jQuery, XMLView, library, ObjectPageLayout, ObjectPageSubSection, ObjectPageSection, ObjectPageSectionBase, Text, MessageStrip, Button, Panel) {
	"use strict";
	var Importance = library.Importance;

	QUnit.module("aatTest");

	QUnit.test("ObjectPageSection", function (assert) {

		return XMLView.create({
			id: "UxAP-13_objectPageSection",
			viewName: "view.UxAP-13_ObjectPageSection"
		}).then(async function(ObjectPageSectionView) {

			ObjectPageSectionView.placeAt('qunit-fixture');
			await nextUIUpdate();

			// get the object page section
			// By default title is not centered, CSS:0120061532 0001349139 2014
			var oSectionWithTwoSubSection = ObjectPageSectionView.byId("SectionWithSubSection");
			assert.strictEqual(oSectionWithTwoSubSection.$().find(".sapUxAPObjectPageSectionHeader").hasClass("sapUxAPObjectPageSectionHeaderHidden"), true, "My first section title never visible");
			assert.strictEqual(oSectionWithTwoSubSection.$().find(".sapUxAPObjectPageSectionHeader").attr("aria-hidden"), undefined, "My first section title is NOT ignored by the screen reader");
			// Test by finding own class
			assert.strictEqual(oSectionWithTwoSubSection.$().find('.mysubsectiontotest').length == 2, true, "Section with two SubSections");


			var oSectionWithOneSubSection = ObjectPageSectionView.byId("SectionWithoneSubSection");
			assert.strictEqual(oSectionWithOneSubSection.$().find(".sapUxAPObjectPageSectionTitle").text(), "My third subSection Title", "Section with one SubSections");
			// Test by finding own class
			assert.strictEqual(oSectionWithOneSubSection.$().find(".mysubsectiontotest").length == 1, true, "Section with one SubSections");


			var oSectionWithoutSubSection = ObjectPageSectionView.byId("SectionWithoutSubSection");
			assert.strictEqual(oSectionWithoutSubSection.$().find(".sapUxAPObjectPageSectionHeader").length, 0, "My third section title without subsection");
			// Test by finding own class
			assert.strictEqual(oSectionWithoutSubSection.$().find(".mysubsectiontotest").length == 0, true, "Section without SubSection");


			// get the object page SubSection
			var oSubsection = ObjectPageSectionView.byId("subsection1");
			assert.strictEqual(oSubsection.getTitle(), "My first subSection Title", "My first subSection Title");

			var oSubsection2 = ObjectPageSectionView.byId("subsection2");
			assert.strictEqual(oSubsection2.getTitle(), "My second subSection Title", "My second subSection Title");

			var oSubsection3 = ObjectPageSectionView.byId("subsection3");
			assert.strictEqual(oSubsection3.$().find(".sapUxAPObjectPageSectionHeader").length, 0, "My third section without subsections");

			ObjectPageSectionView.destroy();
		});
	});

	QUnit.module("Section title visibility");

	QUnit.test("Title visibility with one section", async function(assert) {
		var oObjectPageLayout = new ObjectPageLayout("page02", {
				useIconTabBar: true,
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		assert.strictEqual(oObjectPageLayout.getSections()[0]._getInternalTitleVisible(), true, "title is displayed when there is only 1 section");
		assert.strictEqual(oObjectPageLayout.getSections()[0]._isTitleAriaVisible(), true, "title is displayed when there is only 1 section");
		assert.strictEqual(oObjectPageLayout.getSections()[0].getTitleVisible(), true, "title is displayed when there is only 1 section");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Title visibility with more than one section", async function(assert) {
		var	aSections,
			oObjectPageLayout = new ObjectPageLayout("page02", {
				useIconTabBar: true,
				sections: [
					new ObjectPageSection({
						subSections: [
							new ObjectPageSubSection({
								title: "Title",
								blocks: [new Text({text: "test"})]
							})
						]
					}),
					new ObjectPageSection({
						subSections: [
							new ObjectPageSubSection({
								title: "Title",
								blocks: [new Text({text: "test"})]
							})
						]
					})
				]
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		aSections = oObjectPageLayout.getSections();

		assert.strictEqual(aSections[0]._getInternalTitleVisible(), false, "title is hidden when there is more than 1 section");
		assert.strictEqual(aSections[1]._getInternalTitleVisible(), false, "title is hidden when there is more than 1 section");
		assert.strictEqual(aSections[0].getTitleVisible(), false, "title is hidden when there is more than 1 section");
		assert.strictEqual(aSections[1].getTitleVisible(), false, "title is hidden when there is more than 1 section");

		assert.strictEqual(aSections[0]._isTitleAriaVisible(), true, "title is NOT hidden from the screen reader when there is more than 1 section");
		assert.strictEqual(aSections[1]._isTitleAriaVisible(), true, "title is NOT hidden from the screen reader when there is more than 1 section");

		oObjectPageLayout.destroy();
	});

	QUnit.test("getTitleVisible with showTitle=false", async function(assert) {
		// Arrange
		var	oSection,
			oObjectPageLayout = new ObjectPageLayout("page02", {
				useIconTabBar: true,
				sections: [
					new ObjectPageSection({
						title: "Section Title",
						subSections: [
							new ObjectPageSubSection({
								title: "Title",
								blocks: [new Text({text: "test"})]
							}),
							new ObjectPageSubSection({
								title: "Title2",
								blocks: [new Text({text: "test"})]
							})
						]
					})
				]
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		oSection = oObjectPageLayout.getSections()[0];

		// Assert
		assert.strictEqual(oSection.getTitleVisible(), true, "title is visible");

		// Act
		oSection.setShowTitle(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSection.getTitleVisible(), false, "title is not visible");

		// Clean up
		oObjectPageLayout.destroy();
	});

	QUnit.test("getTitleVisible with importance level of SubSections", async function(assert) {
		// Arrange
		var	oSection,
			oObjectPageLayout = new ObjectPageLayout("page02", {
				useIconTabBar: true,
				sections: [
					new ObjectPageSection({
						title: "Section Title",
						showTitle: false,
						subSections: [
							new ObjectPageSubSection({
								title: "Title",
								importance: "Low",
								blocks: [new Text({text: "test"})]
							}),
							new ObjectPageSubSection({
								title: "Title2",
								blocks: [new Text({text: "test"})]
							})
						]
					})
				]
			});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		oSection = oObjectPageLayout.getSections()[0];

		// Assert
		assert.strictEqual(oSection.getTitleVisible(), false, "title is not visible");

		// Act
		oObjectPageLayout.setShowOnlyHighImportance(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSection.getTitleVisible(), true, "title is visible, as there is a hidden SubSection");

		// Clean up
		oObjectPageLayout.destroy();
	});

	var SectionBasePrototype = ObjectPageSectionBase.prototype,
		SectionPrototype = ObjectPageSection.prototype;

	QUnit.module("Section/SubSection Importance");

	QUnit.test("Section with title has button placeholders", async function(assert) {

		var oObjectPageLayout = new ObjectPageLayout("page02", {
			sections: new ObjectPageSection({
				subSections: [
					new ObjectPageSubSection({
						title: "Title",
						blocks: [new Text({text: "test"})]
					})
				]
			})
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		var $section = oObjectPageLayout.getSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSectionHeader .sapUiHiddenPlaceholder').length, 2, "subsection has 2 hidden placeholders");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Section without title has no button placeholders", async function(assert) {

		var oObjectPageLayout = new ObjectPageLayout("page02", {
			sections: new ObjectPageSection({
				showTitle: false,
				subSections: [
					new ObjectPageSubSection({
						title: "Title",
						blocks: [new Text({text: "test"})]
					})
				]
			})
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		var $section = oObjectPageLayout.getSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSectionHeader .sapUiHiddenPlaceholder').length, 0, "subsection has no hidden placeholders");

		oObjectPageLayout.destroy();
	});

	QUnit.test("First section has expand buttons when hidden", async function(assert) {

		var oObjectPageLayout = new ObjectPageLayout("page02", {
			sections: [
				new ObjectPageSection({
					importance: "Low",
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				}),
				new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title1",
							blocks: [new Text({text: "test1"})]
						})
					]
				})
			]
		}),
		oSection = oObjectPageLayout.getSections()[0];

		this.stub(oSection, "_getCurrentMediaContainerRange").callsFake(function() {
			return {
				name: "Tablet"
			};
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		assert.strictEqual(oSection._isTitleVisible(), true, "title is visible");

		oObjectPageLayout.destroy();
	});

	QUnit.test("First section has showMore button when content hidden", async function(assert) {

		var oObjectPageLayout = new ObjectPageLayout("page02", {
			sections: [
				new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							importance: "Low",
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				}),
				new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title1",
							blocks: [new Text({text: "test1"})]
						})
					]
				})
			]
		}),
		oSection = oObjectPageLayout.getSections()[0];

		this.stub(oSection, "_getCurrentMediaContainerRange").callsFake(function() {
			return {
				name: "Tablet"
			};
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		assert.strictEqual(oSection._isTitleVisible(), true, "title is visible");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Section with dynamically added title has button placeholders", async function(assert) {

		var oObjectPageLayout = new ObjectPageLayout("page02", {
			sections: new ObjectPageSection({
				showTitle: false,
				subSections: [
					new ObjectPageSubSection({
						title: "Title",
						blocks: [new Text({text: "test"})]
					})
				]
			})
		});

		oObjectPageLayout.placeAt('qunit-fixture');

		oObjectPageLayout.getSections()[0].setShowTitle(true);
		await nextUIUpdate();

		var $section = oObjectPageLayout.getSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSectionHeader .sapUiHiddenPlaceholder').length, 2, "subsection has hidden placeholders");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Default state for hiding/showing the content", function (assert) {
		var oMockSection = {
			getImportance: this.stub().returns(Importance.High)
		};

		SectionBasePrototype.init.call(oMockSection);

		assert.strictEqual(SectionBasePrototype._getIsHidden.call(oMockSection), false,
			"The section/subSection content should be initialized as visible");

		assert.strictEqual(SectionBasePrototype._shouldBeHidden.call(oMockSection), false,
			"When the section has high importance then it should never be hidden");
	});

	QUnit.test("Section title display/hide", async function(assert) {
		var oObjectPageLayout = new ObjectPageLayout({
			sections: new ObjectPageSection({
				title: "Title",
				subSections: [
					new ObjectPageSubSection({
						blocks: [new Text({text: "test"})]
					})
				]
			})
		}),
		oFirstSection = oObjectPageLayout.getSections()[0],
		$oFirstSection;

		// Arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), false,
			"The correct styling is applied");

		// Act
		oFirstSection.setShowTitle(false);
		await nextUIUpdate();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), true,
			"The correct styling is applied");

		// Act
		oFirstSection.setShowTitle(true);
		await nextUIUpdate();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), false,
			"The correct styling is applied");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Behavior with different importance levels", function (assert) {
		var that = this;

		function fnGenerateTest(sImportance, sCurrentImportanceLevel, bExpectToBeHidden, assert) {
			var sShouldBeHidden = "The section should be hidden",
				sShouldBeVisible = "The section should be visible",
				oMockSection = {
					setImportance: function (sImportance) {
						this.getImportance = that.stub().returns(sImportance);
					}
				};

			oMockSection.setImportance(sImportance);

			SectionBasePrototype.init.call(oMockSection);
			oMockSection._sCurrentLowestImportanceLevelToShow = sCurrentImportanceLevel;

			assert.strictEqual(SectionBasePrototype._shouldBeHidden.call(oMockSection), bExpectToBeHidden,
				bExpectToBeHidden ? sShouldBeHidden : sShouldBeVisible);
		}

		fnGenerateTest(Importance.Low, Importance.Low, false, assert);
		fnGenerateTest(Importance.Medium, Importance.Low, false, assert);
		fnGenerateTest(Importance.High, Importance.Low, false, assert);

		fnGenerateTest(Importance.Low, Importance.Medium, true, assert);
		fnGenerateTest(Importance.Medium, Importance.Medium, false, assert);
		fnGenerateTest(Importance.High, Importance.Medium, false, assert);

		fnGenerateTest(Importance.Low, Importance.High, true, assert);
		fnGenerateTest(Importance.Medium, Importance.High, true, assert);
		fnGenerateTest(Importance.High, Importance.High, false, assert);
	});

	QUnit.test("Deciding the lowest importance level to show", function (assert) {
		var fnGenerateTest = function (sDevice, sExpectedImportance, assert) {
			assert.strictEqual(SectionPrototype._determineTheLowestLevelOfImportanceToShow(sDevice), sExpectedImportance,
				"On " + sDevice + " show " + sExpectedImportance + " importance and above content");
		};

		fnGenerateTest("Phone", Importance.High, assert);
		fnGenerateTest("Tablet", Importance.Medium, assert);
		fnGenerateTest("Desktop", Importance.Low, assert);

		assert.strictEqual(SectionPrototype._determineTheLowestLevelOfImportanceToShow("Desktop", true), Importance.High,
			"On Desktop you can override the default behaviour and show only High priorities");
	});

	QUnit.test("Updating visibility of Section DOM element", function(assert) {
		// Arrange
		var oObjectPageLayout = new ObjectPageLayout(),
			oObjectPageSection = new ObjectPageSection(),
			oToggleSpy = this.spy(),
			jQueryObject = {
				children: this.stub().returns({
					toggle: oToggleSpy
				})
			},
			oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout");

		this.stub(oObjectPageSection, "$").returns(jQueryObject);

		oObjectPageLayout.addSection(oObjectPageSection);

		// Act
		oObjectPageSection._updateShowHideState(false);

		// Assert
		assert.ok(oToggleSpy.notCalled, "toggling visibility function is not called when there is no change in Section's visibility");
		assert.ok(oRequestAdjustLayoutSpy.notCalled, "_requestAdjustLayout is not called when there is no change in Section's visibility");

		// Act
		oObjectPageSection._updateShowHideState(true);

		// Assert
		assert.ok(oToggleSpy.calledOnce, "toggling visibility function is called when there is change in Section's visibility");
		assert.ok(oRequestAdjustLayoutSpy.calledOnce, "_requestAdjustLayout is called when there is change in Section's visibility");

		// Clean-up
		oObjectPageSection.destroy();
	});

	QUnit.test("Updating visibility of SubSection DOM element", function(assert) {
		// Arrange
		var oObjectPageLayout = new ObjectPageLayout(),
			oObjectPageSubSection = new ObjectPageSubSection(),
			oObjectPageSection = new ObjectPageSection({
				subSections: [oObjectPageSubSection]
			}),
			oToggleSpy = this.spy(),
			jQueryObject = {
				children: this.stub().returns({
					toggle: oToggleSpy
				})
			},
			oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout");

		this.stub(oObjectPageSubSection, "$").returns(jQueryObject);

		oObjectPageLayout.addSection(oObjectPageSection);

		// Act
		oObjectPageSubSection._updateShowHideState(false);

		// Assert
		assert.ok(oToggleSpy.notCalled, "toggling visibility function is not called when there is no change in Section's visibility");
		assert.ok(oRequestAdjustLayoutSpy.notCalled, "_requestAdjustLayout is not called when there is no change in Section's visibility");

		// Act
		oObjectPageSubSection._updateShowHideState(true);

		// Assert
		assert.ok(oToggleSpy.calledTwice, "toggling visibility function is called twice (for SeeMore and sapUxAPBlock containers) when there is change in SubSection's visibility");
		assert.ok(oRequestAdjustLayoutSpy.calledOnce, "_requestAdjustLayout is called when there is change in SubSection's visibility");

		// Clean-up
		oObjectPageSubSection.destroy();
	});

	QUnit.test("Updating the show/hide state", function (assert) {
		var toggleSpy = this.spy(),
			jQueryObject = {
				children: this.stub().returns({
					toggle: toggleSpy
				})
			},
			oMockSection = {
				_getObjectPageLayout: this.stub().returns(null),
				_sContainerSelector: '.someClass',
				_getIsHidden: this.stub().returns(this._isHidden),
				setImportance: function (sImportance) {
					this.getImportance = this.stub().returns(sImportance);
				},
				_isTitleVisible: function () {
					return true;
				},
				setTitleVisible: function () {
					return;
				},
				_updateShowHideState: this.spy(),
				$: this.stub().returns(jQueryObject)
			};

		SectionBasePrototype.init.call(this);
		oMockSection._isHidden = true;

		SectionBasePrototype._expandSection.call(oMockSection);
		assert.ok(oMockSection._updateShowHideState.calledWith(false));

		assert.ok(!oMockSection._getIsHidden());
		SectionBasePrototype._showHideContent.call(oMockSection);
		assert.ok(oMockSection._updateShowHideState.calledWith(true));

		assert.ok(!oMockSection._getIsHidden());

		SectionBasePrototype._updateShowHideState.call(oMockSection, true);

		assert.ok(jQueryObject.children.calledWith(oMockSection._sContainerSelector));
		assert.ok(jQueryObject.children().toggle.calledWith(false));

		SectionBasePrototype._updateShowHideState.call(oMockSection, false);

		assert.ok(jQueryObject.children.calledWith(oMockSection._sContainerSelector));
		assert.ok(jQueryObject.children().toggle.calledWith(true));
	});

	QUnit.test("Section show/hide all button text and visibility", function (assert) {
		var oButton = new Button({
				visible: false,
				text: "initialText"
			}),
			sExpectedText = "someText",
			oSectionStub = {
				_getShowHideAllButton: this.stub().returns(oButton),
				_getShouldDisplayShowHideAllButton: this.stub().returns(true),
				_getShowHideAllButtonText: this.stub().returns(sExpectedText)
			};

		SectionPrototype._updateShowHideAllButton.call(oSectionStub, true);
		assert.ok(oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.setText("otherText");
		oSectionStub._getShouldDisplayShowHideAllButton = this.stub().returns(false);

		SectionPrototype._updateShowHideAllButton.call(oSectionStub, false);
		assert.ok(!oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.destroy();
	});

	QUnit.test("Section show/hide button text and visibility", function (assert) {
		var oButton = new Button({
				visible: false,
				text: "initialText"
			}),
			sExpectedText = "someText",
			oSectionStub = {
				_getShowHideButton: this.stub().returns(oButton),
				_getShowHideButtonText: this.stub().returns(sExpectedText),
				_shouldBeHidden: this.stub().returns(true)
			};

		SectionPrototype._updateShowHideButton.call(oSectionStub, true);
		assert.ok(oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.setText("otherText");
		oSectionStub._shouldBeHidden = this.stub().returns(false);

		SectionPrototype._updateShowHideButton.call(oSectionStub, false);
		assert.ok(!oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.destroy();
	});

	QUnit.test("Testing ObjectPageSubSection._getClosestSection", function (assert) {
		return XMLView.create({
			id: "UxAP-13_objectPageSection",
			viewName: "view.UxAP-13_ObjectPageSection"
		}).then(function(ObjectPageSectionView) {
			var oSectionWithTwoSubSection = ObjectPageSectionView.byId("SectionWithSubSection"),
				oFirstSubSection = oSectionWithTwoSubSection.getSubSections()[0],
				fnGetClosestSection = ObjectPageSection._getClosestSection;

			assert.equal(fnGetClosestSection(oFirstSubSection).getId(), oSectionWithTwoSubSection.getId());
			assert.equal(fnGetClosestSection(oSectionWithTwoSubSection).getId(), oSectionWithTwoSubSection.getId());

			ObjectPageSectionView.destroy();
		});
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			return XMLView.create({
				id: "UxAP-13_objectPageSection",
				viewName: "view.UxAP-13_ObjectPageSection"
			}).then(async function(oView) {
				this.ObjectPageSectionView = oView;
				this.ObjectPageSectionView.placeAt('qunit-fixture');
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function() {
			this.ObjectPageSectionView.destroy();
		}
	});

	QUnit.test("Test aria-labelledby attribute", async function(assert) {
		assert.expect(6);

		var done = assert.async(),
			oFirstSection = this.ObjectPageSectionView.byId("SectionWithSubSection"),
			sFirstSectionAriaLabelledBy = oFirstSection.$().attr("aria-labelledby"),
			oSectionWithoutTitle = this.ObjectPageSectionView.byId("SectionWithNoTitleAndTwoSubSections"),
			sSectionWithoutTitleAriaLabel = oSectionWithoutTitle.$().attr("aria-labelledby"),
			oLastSection = this.ObjectPageSectionView.byId("SectionWithNoTitleAndOneSubSection"),
			sLastSectionAriaLabelledBy = oLastSection.$().attr("aria-labelledby"),
			sSectionText = ObjectPageSection._getLibraryResourceBundle().getText("SECTION_CONTROL_NAME"),
			oLastSectionFirstSubsection = oLastSection.getSubSections()[0],
			oRenderingAfterTitleUpdate = {
				onAfterRendering: function () {
					// assert
					oLastSection.removeEventDelegate(oRenderingAfterTitleUpdate);
					assert.strictEqual(Element.getElementById(sLastSectionAriaLabelledBy).getText(),
						oLastSection._getTitle(), "aria-labelledby is updated properly");
					done();
				}
			};

		// assert
		assert.strictEqual(Element.getElementById(sFirstSectionAriaLabelledBy).getText(),
			oFirstSection._getTitle(), "aria-labelledby is set properly");
		assert.strictEqual(Element.getElementById(sSectionWithoutTitleAriaLabel).getText(),
			sSectionText, "sections without title are labelled by 'Section' texts");
		assert.strictEqual(Element.getElementById(sLastSectionAriaLabelledBy).getText(),
			oLastSection._getTitle(), "aria-labelledby is set properly");

		// act
		oFirstSection.setTitle("New title");

		// assert
		assert.strictEqual(Element.getElementById(sFirstSectionAriaLabelledBy).getText(),
			oFirstSection._getTitle(), "aria-labelledby is updated properly");

		// act
		// setShowTitle = false should remove the title from the aria-labelledby attribute
		oFirstSection.setShowTitle(false);
		await nextUIUpdate();
		sFirstSectionAriaLabelledBy = oFirstSection.$().attr("aria-labelledby");

		// assert
		assert.strictEqual(Element.getElementById(sFirstSectionAriaLabelledBy).getText(),
			sSectionText, "sections without title are labelled by 'Section' texts");

		// arrange
		oLastSection.addEventDelegate(oRenderingAfterTitleUpdate);

		// act
		// in this case the subsection title get propagated to the
		// section title property through _setInternalTitle function
		oLastSectionFirstSubsection.setTitle("My new title");
		await nextUIUpdate();

	});

	QUnit.module("Invalidation", {
		beforeEach: async function() {
			this.oObjectPageLayout = new ObjectPageLayout("page", {
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

			this.oObjectPageLayout.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("Visibility change", function (assert) {

		// Setup
		var oSection = this.oObjectPageLayout.getSections()[0],
		oInvalidateSpy = this.spy(oSection, "invalidate");

		// Act
		oSection.setVisible(false);

		// Check
		assert.equal(oInvalidateSpy.callCount, 1, "section is invalidated");
	});

	QUnit.module("Private methods", {
		beforeEach: async function() {
			this.oObjectPageLayout = new ObjectPageLayout("page", {
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						}),
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						}),
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "test"})]
						})
					]
				})
			});

			this.oObjectPageLayout.placeAt('content');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("_getVisibleSubSections", async function(assert) {
		// Setup
		var oSection = this.oObjectPageLayout.getSections()[0],
			aSubSections = oSection.getSubSections();

		// Check
		assert.equal(oSection._getVisibleSubSections().length, 3, "All sub sections are visible");

		aSubSections[1].setVisible(false);
		await nextUIUpdate();

		// Check
		assert.equal(oSection._getVisibleSubSections().length, 2, "Two visible sub sections and one sub section with visible=false");

		aSubSections[2].destroyBlocks();
		this.oObjectPageLayout._applyUxRules();
		await nextUIUpdate();

		// Check
		assert.equal(oSection._getVisibleSubSections().length, 1, "One visible sub section, one sub section with visible=false"
			+ "and one sub section with empty content");

		aSubSections[1].setVisible(true);
		await nextUIUpdate();

		// Check
		assert.equal(oSection._getVisibleSubSections().length, 2, "Two visible sub sections and one sub section with empty content");
	});

	QUnit.test("Visibility not changed", function (assert) {

		// Setup
		var oSection = this.oObjectPageLayout.getSections()[0],
			oInvalidateSpy = this.spy(oSection, "invalidate");

		// Act: called setter with same value as current
		oSection.setVisible(true);

		// Check
		assert.equal(oInvalidateSpy.callCount, 0, "section is not invalidated");
	});

	QUnit.test("Async unstashing", function (assert) {

		// Setup
		var oSection = this.oObjectPageLayout.getSections()[0],
			oSpyConnectToModels = this.spy(ObjectPageSubSection.prototype, "connectToModelsAsync"),
			oSpyUnstash = this.spy(ObjectPageSubSection.prototype, "_unStashControlsAsync");

		// Act
		oSection.connectToModelsAsync();

		// Check
		assert.strictEqual(oSpyConnectToModels.callCount, 3, "connectToModelsAsync is called on each SubSection");
		assert.strictEqual(oSpyUnstash.callCount, 3, "_unStashControlsAsync is called on each SubSection");
	});

	QUnit.module("SubSection promoted");

	QUnit.test("Showing SubSection changes 'sapUxAPObjectPageSubSectionPromoted' class", async function(assert) {
		// Arrange
		var oObjectPageSubSection1 = new ObjectPageSubSection({
				title: "SubSection1",
				blocks: new Text({ text: "SubSection1" }),
				visible: false
			}),
			oObjectPageSubSection2 = new ObjectPageSubSection({
				title: "SubSection2",
				blocks: new Text({ text: "SubSection2" })
			}),
			oObjectPageSection = new ObjectPageSection({
				title: "Section",
				subSections: [oObjectPageSubSection1, oObjectPageSubSection2]
			}),
			oObjectPageLayout = new ObjectPageLayout({
				sections: [ oObjectPageSection ]
			}),
			done = assert.async();

		assert.expect(2);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Assert
			assert.ok(oObjectPageSubSection2.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
				"SubSection has promoted CSS class");

			// Act
			oObjectPageSubSection1.setVisible(true);

			setTimeout(function () {
				// Assert
				assert.ok(!oObjectPageSubSection2.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
					"SubSection does not have promoted CSS class");

				// Clean-up
				oObjectPageLayout.destroy();
				done();
			}, 400);
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("Adding SubSection changes 'sapUxAPObjectPageSubSectionPromoted' class", async function(assert) {
		// Arrange
		var oObjectPageSubSection1 = new ObjectPageSubSection({
				title: "SubSection1",
				blocks: new Text({ text: "SubSection1" })
			}),
			oObjectPageSubSection2 = new ObjectPageSubSection({
				title: "SubSection2",
				blocks: new Text({ text: "SubSection2" })
			}),
			oObjectPageSection = new ObjectPageSection({
				title: "Section",
				subSections: [oObjectPageSubSection1]
			}),
			oObjectPageLayout = new ObjectPageLayout({
				sections: [ oObjectPageSection ]
			}),
			done = assert.async();

		assert.expect(2);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Assert
			assert.ok(oObjectPageSubSection1.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
				"SubSection has promoted CSS class");

			// Act
			oObjectPageSection.addSubSection(oObjectPageSubSection2);

			setTimeout(function () {
				// Assert
				assert.ok(!oObjectPageSubSection2.$().hasClass("sapUxAPObjectPageSubSectionPromoted"),
					"SubSection does not have promoted CSS class");

				// Clean-up
				oObjectPageLayout.destroy();
				done();
			}, 400);
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("SubSection with long title has 'sapUxAPObjectPageSectionMultilineContent' class", async function(assert) {
		// Arrange
		var oObjectPageSubSection = new ObjectPageSubSection({
				title: "Loooooooooooooooooooooooooooooong loooooooooooooooooooooooooooooooong looooooooooooooooooong tiiiiiiiiiiiiiiiiiiiiiitle",
				blocks: new Text({ text: "SubSection1" }),
				actions: [new Button({ text: "Button with looooooooooooooooooooooooong text "})]
			}),
			oObjectPageSection = new ObjectPageSection({
				title: "SubSection",
				subSections: [oObjectPageSubSection]
			}),
			oObjectPageLayout = new ObjectPageLayout({
				sections: [ oObjectPageSection ]
			}),
			done = assert.async();

		assert.expect(1);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Assert
			assert.ok(oObjectPageSubSection.$().hasClass("sapUxAPObjectPageSectionMultilineContent"),
				"SubSection has multine content CSS class");

			// Clean up
			oObjectPageLayout.destroy();
			done();
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("Resizing OPL adds 'sapUxAPObjectPageSectionMultilineContent' class to promoted SubSection", async function(assert) {
		// Arrange
		var oObjectPageSubSection = new ObjectPageSubSection({
				title: "Not too long title",
				blocks: new Text({ text: "SubSection1" }),
				actions: [new Button({ text: "Button with looooooooooooooooooooooooong text "})]
			}),
			oObjectPageSection = new ObjectPageSection({
				title: "SubSection",
				subSections: [oObjectPageSubSection]
			}),
			oObjectPageLayout = new ObjectPageLayout({
				sections: [ oObjectPageSection ]
			}),
			$qunitDOMLocation = jQuery("#qunit-fixture"),
			iInitialWidth = $qunitDOMLocation.width(),
			done = assert.async();

		assert.expect(2);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Assert
			assert.ok(!oObjectPageSubSection.$().hasClass("sapUxAPObjectPageSectionMultilineContent"),
				"SubSection does not have multine content CSS class when width is enough");

			// Act
			$qunitDOMLocation.width(200);
			oObjectPageLayout._onUpdateContentSize({ size: {
				width: "200",
				height: "900"
			}});
			oObjectPageSection._onResize();

			// Assert
			assert.ok(oObjectPageSubSection.$().hasClass("sapUxAPObjectPageSectionMultilineContent"),
				"SubSection has multine content CSS class when width is not enough");

			// Clean up
			oObjectPageLayout.destroy();
			$qunitDOMLocation.width(iInitialWidth);
			done();
		});

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.module("Heading aggregation");

	QUnit.test("Heading is displayed correctly", async function(assert) {
		// Arrange
		var oMessageStrip = new MessageStrip({ text: "Simple message strip" }),
			oObjectPageLayout = new ObjectPageLayout({
				sections: new ObjectPageSection({
					title: "Section",
					heading: oMessageStrip,
					subSections: [
						new ObjectPageSubSection({
							title: "SubSection1",
							blocks: new Text({ text: "SubSection1" }),
							visible: false
						}),
						new ObjectPageSubSection({
							title: "SubSection2",
							blocks: new Text({ text: "SubSection2" })
						})
					]
				})
			}),
			oSection = oObjectPageLayout.getSections()[0],
			$section,
			$strip;

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

		$section = oSection.getDomRef();
		$strip = oMessageStrip.getDomRef();

		assert.ok($section.contains($strip), "Message strip is displayed correctly");

		oSection.destroyHeading();
		await nextUIUpdate();

		assert.notOk($section.contains($strip), "Message strip is displayed correctly");
	});

	QUnit.module("Layout", {
		beforeEach: async function() {
			this.oObjectPage = new ObjectPageLayout({
				sections: new ObjectPageSection({
					subSections: [
						new ObjectPageSubSection({
							title: "Title",
							blocks: [new Text({text: "Test"})]
						})
					]
				})
			});

			this.oObjectPage.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("updates to subsections aggregation invalidates the section", function (assert) {
		var oObjectPage = this.oObjectPage,
			oSection = oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			oSpy = this.spy(oSection, "invalidate");

		oSection.removeSubSection(oSubSection);
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");

		oSpy.reset();
		oSection.addSubSection(oSubSection);
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");

		oSpy.reset();
		oSection.insertSubSection(oSubSection.clone());
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");
	});

	QUnit.test("updates to subsections visibility invalidates the section", function (assert) {
		var oObjectPage = this.oObjectPage,
			oSection = oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			oSpy = this.spy(oSection, "invalidate");

		oSubSection.setVisible(false);
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");

		oSpy.reset();
		oSubSection.setVisible(true);
		assert.equal(oSpy.callCount, 1, "parent section is invalidated");
	});

	QUnit.test("destroyed section does not recreate the grid", function (assert) {
		var oObjectPage = this.oObjectPage,
			oSection = oObjectPage.getSections()[0];

		oSection.destroy();

		assert.equal(oSection._getGrid(), null, "destroyed section does not recreate the grid");
	});

	QUnit.module("Properties", {
		beforeEach : async function() {
			this.oObjectPageLayout = new ObjectPageLayout({
				sections: [
					new ObjectPageSection({
						title: "Section 2",
						anchorBarButtonColor: "Positive",
						subSections: [
							new ObjectPageSubSection({
								blocks: [
									new Panel({
										content: [new Text({text: "Content1"})]
									})]
							})
						]
					}),
					new ObjectPageSection({
						title: "Section 1",
						subSections: [
							new ObjectPageSubSection({
								blocks: [
									new Panel({
										content: [new Text({text: "Content2"})]
									})]
							})
						]
					})
				]

			});

			this.oObjectPageLayout.placeAt("content");
			await nextUIUpdate();

		},
		afterEach : function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("anchorBarButtonColor property", function (assert) {
		var oObjectPage = this.oObjectPageLayout,
			oAnchorBar = oObjectPage.getAggregation("_anchorBar"),
			oAnchorBarBtn = oAnchorBar.getItems()[0],
			oSection = oObjectPage.getAggregation("sections")[0];

		assert.strictEqual(oAnchorBarBtn.getIconColor(), oSection.getAnchorBarButtonColor(), "The anchorBarButtonColor property is correctly set and color is applied to the anchorbar button");

	});
});