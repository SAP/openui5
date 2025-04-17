/*global QUnit*/

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	'./ObjectPageLayoutUtils'
], function(nextUIUpdate, utils) {
	"use strict";

	QUnit.module("Anchor labels", {
	});

	QUnit.test("section without title but with promoted subSection", function(assert) {
		// Arrange
		var iNumberOfSections = 2,
			iNumberOfSubSectionsInEachSection = 1,
			oObjectPage = utils.helpers.generateObjectPageWithSubSectionContent(utils.oFactory, iNumberOfSections, iNumberOfSubSectionsInEachSection),
			oSection = oObjectPage.getSections()[0],
			oSubSection = oSection.getSubSections()[0],
			sExpectedSectionTitle,
			sActualSectionTitle;

		// Arrange
		oSection.setTitle("");
		sExpectedSectionTitle = oSubSection.getTitle();
		oObjectPage.setShowAnchorBarPopover(false);

		// Act: build the anchorBar
		oObjectPage._requestAdjustLayoutAndUxRules(true);

		// Assert
		sActualSectionTitle = oObjectPage._oABHelper._getAnchorBar().getItems()[0].getText();
		assert.strictEqual(sActualSectionTitle, sExpectedSectionTitle, "section title is correct");
	});
});
