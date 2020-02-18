/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/uxap/library",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSectionBase",
	"sap/m/Text",
	"sap/m/Button"],
function($, Core, library, ObjectPageLayout, ObjectPageSubSection, ObjectPageSection, ObjectPageSectionBase, Text, Button) {
	"use strict";
	var Importance = library.Importance;

	QUnit.module("aatTest");

	QUnit.test("ObjectPageSection", function (assert) {

		var ObjectPageSectionView = sap.ui.xmlview("UxAP-13_objectPageSection", {
			viewName: "view.UxAP-13_ObjectPageSection"
		});

		ObjectPageSectionView.placeAt('qunit-fixture');
		Core.applyChanges();

		// get the object page section
		// By default title is not centered, CSS:0120061532 0001349139 2014
		var oSectionWithTwoSubSection = ObjectPageSectionView.byId("SectionWithSubSection");
		assert.strictEqual(oSectionWithTwoSubSection.$().find(".sapUxAPObjectPageSectionHeader").hasClass("sapUxAPObjectPageSectionHeaderHidden"), true, "My first section title never visible");
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

	QUnit.module("Section title visiblity");

	QUnit.test("Title visibility with one section", function (assert) {
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
		Core.applyChanges();

		assert.strictEqual(oObjectPageLayout.getSections()[0]._getInternalTitleVisible(), true, "title is displayed when there is only 1 section");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Title visibility with more than one section", function (assert) {
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
		Core.applyChanges();

		aSections = oObjectPageLayout.getSections();

		assert.strictEqual(aSections[0]._getInternalTitleVisible(), false, "title is hidden when there is more than 1 section");
		assert.strictEqual(aSections[1]._getInternalTitleVisible(), false, "title is hidden when there is more than 1 section");

		oObjectPageLayout.destroy();
	});

	var SectionBasePrototype = ObjectPageSectionBase.prototype,
		SectionPrototype = ObjectPageSection.prototype;

	QUnit.module("Section/SubSection Importance");

	QUnit.test("Section with title has button placeholders", function (assert) {

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
		Core.applyChanges();

		var $section = oObjectPageLayout.getSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSectionHeader .sapUiHiddenPlaceholder').length, 2, "subsection has 2 hidden placeholders");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Section without title has no button placeholders", function (assert) {

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
		Core.applyChanges();

		var $section = oObjectPageLayout.getSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSectionHeader .sapUiHiddenPlaceholder').length, 0, "subsection has no hidden placeholders");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Section with dynamically added title has button placeholders", function (assert) {

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
		Core.applyChanges();

		var $section = oObjectPageLayout.getSections()[0].$();
		assert.strictEqual($section.find('.sapUxAPObjectPageSectionHeader .sapUiHiddenPlaceholder').length, 2, "subsection has hidden placeholders");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Default state for hiding/showing the content", function (assert) {
		var oMockSection = {
			getImportance: sinon.stub().returns(Importance.High)
		};

		SectionBasePrototype.init.call(oMockSection);

		assert.strictEqual(SectionBasePrototype._getIsHidden.call(oMockSection), false,
			"The section/subSection content should be initialized as visible");

		assert.strictEqual(SectionBasePrototype._shouldBeHidden.call(oMockSection), false,
			"When the section has high importance then it should never be hidden");
	});

	QUnit.test("Section title display/hide", function (assert) {
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
		Core.applyChanges();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), false,
			"The correct styling is applied");

		// Act
		oFirstSection.setShowTitle(false);
		Core.applyChanges();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), true,
			"The correct styling is applied");

		// Act
		oFirstSection.setShowTitle(true);
		Core.applyChanges();
		$oFirstSection = oFirstSection.$();

		// Assert
		assert.strictEqual($oFirstSection.hasClass("sapUxAPObjectPageSectionNoTitle"), false,
			"The correct styling is applied");

		oObjectPageLayout.destroy();
	});

	QUnit.test("Behavior with different importance levels", function (assert) {
		var fnGenerateTest = function (sImportance, sCurrentImportanceLevel, bExpectToBeHidden, assert) {
			var sShouldBeHidden = "The section should be hidden",
				sShouldBeVisible = "The section should be visible",
				oMockSection = {
					setImportance: function (sImportance) {
						this.getImportance = sinon.stub().returns(sImportance);
					}
				};

			oMockSection.setImportance(sImportance);

			SectionBasePrototype.init.call(oMockSection);
			oMockSection._sCurrentLowestImportanceLevelToShow = sCurrentImportanceLevel;

			assert.strictEqual(SectionBasePrototype._shouldBeHidden.call(oMockSection), bExpectToBeHidden,
				bExpectToBeHidden ? sShouldBeHidden : sShouldBeVisible);
		};

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

	QUnit.test("Updating the show/hide state", function (assert) {
		var toggleSpy = sinon.spy(),
			jQueryObject = {
				children: sinon.stub().returns({
					toggle: toggleSpy
				})
			},
			oMockSection = {
				_getObjectPageLayout: sinon.stub().returns(null),
				_sContainerSelector: '.someClass',
				_getIsHidden: sinon.stub().returns(this._isHidden),
				setImportance: function (sImportance) {
					this.getImportance = sinon.stub().returns(sImportance);
				},
				_updateShowHideState: sinon.spy(),
				$: sinon.stub().returns(jQueryObject)
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
				_getShowHideAllButton: sinon.stub().returns(oButton),
				_getShouldDisplayShowHideAllButton: sinon.stub().returns(true),
				_getShowHideAllButtonText: sinon.stub().returns(sExpectedText)
			};

		SectionPrototype._updateShowHideAllButton.call(oSectionStub, true);
		assert.ok(oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.setText("otherText");
		oSectionStub._getShouldDisplayShowHideAllButton = sinon.stub().returns(false);

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
				_getShowHideButton: sinon.stub().returns(oButton),
				_getShowHideButtonText: sinon.stub().returns(sExpectedText),
				_shouldBeHidden: sinon.stub().returns(true)
			};

		SectionPrototype._updateShowHideButton.call(oSectionStub, true);
		assert.ok(oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.setText("otherText");
		oSectionStub._shouldBeHidden = sinon.stub().returns(false);

		SectionPrototype._updateShowHideButton.call(oSectionStub, false);
		assert.ok(!oButton.getVisible());
		assert.ok(oButton.getText(sExpectedText));

		oButton.destroy();
	});

	QUnit.test("Testing ObjectPageSubSection._getClosestSection", function (assert) {
		var ObjectPageSectionView = sap.ui.xmlview("UxAP-13_objectPageSection", {
				viewName: "view.UxAP-13_ObjectPageSection"
			}),
			oSectionWithTwoSubSection = ObjectPageSectionView.byId("SectionWithSubSection"),
			oFirstSubSection = oSectionWithTwoSubSection.getSubSections()[0],
			fnGetClosestSection = ObjectPageSection._getClosestSection;

		assert.equal(fnGetClosestSection(oFirstSubSection).getId(), oSectionWithTwoSubSection.getId());
		assert.equal(fnGetClosestSection(oSectionWithTwoSubSection).getId(), oSectionWithTwoSubSection.getId());

		ObjectPageSectionView.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.ObjectPageSectionView = sap.ui.xmlview("UxAP-13_objectPageSection", {
				viewName: "view.UxAP-13_ObjectPageSection"
			});

			this.ObjectPageSectionView.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function() {
			this.ObjectPageSectionView.destroy();
		}
	});

	QUnit.test("Test aria-labelledby attribute", function (assert) {
		var oFirstSection = this.ObjectPageSectionView.byId("SectionWithSubSection"),
			sFirstSectionAriaLabelledBy = oFirstSection.$().attr("aria-labelledby"),
			oSectionWithoutTitle = this.ObjectPageSectionView.byId("SectionWithNoTitleAndTwoSubSections"),
			sSectionWithoutTitleAriaLabel = oSectionWithoutTitle.$().attr("aria-labelledby"),
			oLastSection = this.ObjectPageSectionView.byId("SectionWithNoTitleAndOneSubSection"),
			sLastSectionAriaLabelledBy = oLastSection.$().attr("aria-labelledby"),
			sSectionText = ObjectPageSection._getLibraryResourceBundle().getText("SECTION_CONTROL_NAME");

		// assert
		assert.strictEqual(Core.byId(sFirstSectionAriaLabelledBy).getText(),
			oFirstSection._getTitle() + " " + sSectionText, "aria-labelledby is set properly");
		assert.strictEqual(Core.byId(sSectionWithoutTitleAriaLabel).getText(),
			sSectionText, "sections without title are labelled by 'Section' texts");
		assert.strictEqual(Core.byId(sLastSectionAriaLabelledBy).getText(),
			oLastSection._getTitle() + " " + sSectionText, "aria-labelledby is set properly");

		// act
		oFirstSection.setTitle("New title");

		// assert
		assert.strictEqual(Core.byId(sFirstSectionAriaLabelledBy).getText(),
			oFirstSection._getTitle() + " " + sSectionText, "aria-labelledby is updated properly");
	});

	QUnit.module("Invalidation", {
		beforeEach: function() {
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
			Core.applyChanges();
		},
		afterEach: function() {
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("Visibility change", function (assert) {

		// Setup
		var oSection = this.oObjectPageLayout.getSections()[0],
		oInvalidateSpy = sinon.spy(oSection, "invalidate");

		// Act
		oSection.setVisible(false);

		// Check
		assert.equal(oInvalidateSpy.callCount, 1, "section is invalidated");
	});

	QUnit.test("Visibility not changed", function (assert) {

		// Setup
		var oSection = this.oObjectPageLayout.getSections()[0],
			oInvalidateSpy = sinon.spy(oSection, "invalidate");

		// Act: called setter with same value as current
		oSection.setVisible(true);

		// Check
		assert.equal(oInvalidateSpy.callCount, 0, "section is not invalidated");
	});

});
