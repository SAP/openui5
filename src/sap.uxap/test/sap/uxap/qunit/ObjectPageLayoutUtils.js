sap.ui.define([
	'sap/uxap/ObjectPageLayout',
	'sap/uxap/ObjectPageSection',
	'sap/uxap/ObjectPageSubSection',
	"sap/m/Text"
], function (ObjectPageLayout, ObjectPageSection, ObjectPageSubSection, Text) {
	"use strict";

	var helpers = {
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
		}
	};

	var oFactory = {
		getBlocks: function (sText) {
			return [
				new Text({text: sText || "some text"})
			];
		},
		getSection: function (iNumber, sTitleLevel, aSubSections) {
			return new ObjectPageSection({
				title: "Section" + iNumber,
				titleLevel: sTitleLevel,
				subSections: aSubSections || []
			});
		},
		getSubSection: function (iNumber, aBlocks, sTitleLevel) {
			return new ObjectPageSubSection({
				title: "SubSection " + iNumber,
				titleLevel: sTitleLevel,
				blocks: aBlocks || []
			});
		},
		getObjectPage: function () {
			return new ObjectPageLayout();
		},
		getObjectPageLayoutWithIconTabBar: function () {
			return new ObjectPageLayout({
				useIconTabBar: true
			});
		}
	};

    return {
        helpers: helpers,
        oFactory: oFactory
    };
});
