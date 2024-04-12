sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/matchers/Ancestor',
	'sap/ui/test/actions/Press'
], function (Opa5, Properties, Ancestor, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheSubApiDetailPage: {
			viewName: "SubApiDetail",
			actions: {
				iSelectASection: function(sSectionName) {
					return this.waitFor({
						controlType: "sap.uxap.ObjectPageLayout",
						success: function(aPage) {
							var oPage = aPage[0],
								oSection = oPage.getSections().find((s) => s.getTitle() === sSectionName);
							oPage.setSelectedSection(oSection);
						},
						errorMessage: "ObjectPage not found."
					});
				},

				iSelectASubSection: function(sSectionName, sSubSectionName) {
					return this.waitFor({
						controlType: "sap.uxap.ObjectPageLayout",
						success: function(aPage) {
							var oPage = aPage[0],
								oSection = oPage.getSections().find((s) => s.getTitle() === sSectionName),
								oSubSection = oSection.getSubSections().find((s) => s.getTitle() === sSubSectionName);
							aPage[0].scrollToSection(oSubSection.getId());
						},
						errorMessage: "ObjectPage not found."
					});
				},

				iSelectALink: function(sLinkName) {
					return this.waitFor({
						controlType: "sap.ui.documentation.ParamText",
						matchers: new Properties({text: sLinkName}),
						actions: new Press(),
						errorMessage: "Link" + sLinkName + " not found."
					});
				},

				iSelectSectionLink: function(sLinkName) {
					return this.waitFor({
						controlType: "sap.ui.documentation.ParamText",
						matchers: new Properties({text: sLinkName}),
						success: function(oLink) {
							Opa5.assert.ok(oLink, sLinkName + " section Link is found");
						},
						errorMessage: "Link" + sLinkName + " not found."
					});
				}
			},

			assertions: {
				iShouldSeeTheApiDetailObjectPage: function() {
					return this.waitFor({
						id: "apiDetailObjectPage",
						success: function() {
							Opa5.assert.ok(true, "The apiDetailObjectPage was successfully displayed.");
						},
						errorMessage: "The apiDetailObjectPage was not displayed."
					});
				},

				iShouldSeeTheCorrectTitleAndSubtitle: function (sTitle, sSubtitle) {
					return this.waitFor({
						id: "title",
						matchers: new Properties({objectTitle: sTitle, objectSubtitle: sSubtitle}),
						success: function() {
							Opa5.assert.ok(true, "Title: " + sTitle + " and Subtitle: " + sSubtitle + "  found.");
						},
						errorMessage: "Title: " + sTitle + " and Subtitle: " + sSubtitle + "  not found."
					});
				},

				iShouldSeeTheseSections: function () {
					var aExpectedSections = Array.from(arguments);
					return this.waitFor({
						id: "apiDetailObjectPage",
						success: function(oObjectPage) {
							var iVisibleSections = 0;
							oObjectPage.getSections().forEach(function(oSection) {
								if (oSection.getVisible()) {
									iVisibleSections++;
									Opa5.assert.ok(aExpectedSections.includes(oSection.getTitle()), oSection.getTitle() + " section found.");
								}
							});
							Opa5.assert.strictEqual(iVisibleSections, aExpectedSections.length, "There are " + iVisibleSections + " visible sections.");
						},
						errorMessage: "Cannot find the expected sections."
					});
				},

				iShouldSeeTheCorrectSectionSelected: function(sSectionName) {
					return this.waitFor({
						id: "apiDetailObjectPage",
						success: function(oObjectPage) {
							var sSelectedSectionId = oObjectPage.getSelectedSection();
							this.waitFor({
								id: sSelectedSectionId,
								success: function(oSection) {
									Opa5.assert.strictEqual(oSection.getTitle(), sSectionName, "Section " + sSectionName + " is selected.");
								},
								errorMessage: "Subsection " + sSelectedSectionId + " not found."
							});
						},
						errorMessage: "sap.uxap.ObjectPageHeaderContent  not found."
					});
				},

				iShouldSeeTheCorrectSubSectionOnTop: function(sSubSectionName) {
					return this.waitFor({
						id: "apiDetailObjectPage",
						success: function(oObjectPage) {
							this.waitFor({
								controlType: "sap.uxap.ObjectPageSubSection",
								matchers: new Properties({title: sSubSectionName}),
								success: function(oSubSections) {
									Opa5.assert.ok(oSubSections.length === 1, "There is only one " + sSubSectionName + " SubSection");
								},
								errorMessage: "SubSection " + sSubSectionName + " not found."
							});
						},
						errorMessage: "apiDetailObjectPage  not found."
					});
				}
			}
		}
	});

});
