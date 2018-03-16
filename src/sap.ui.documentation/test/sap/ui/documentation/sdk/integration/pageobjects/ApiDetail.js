sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/matchers/AggregationLengthEquals',
	'sap/ui/test/matchers/AggregationFilled',
	'sap/ui/test/matchers/Ancestor',
	'sap/ui/test/matchers/Visible',
	'sap/ui/test/actions/Press'
], function (Opa5, Properties, PropertyStrictEquals, AggregationLengthEquals, AggregationFilled, Ancestor, Visible, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheApiDetailPage: {
			viewName: "ApiDetail",
			actions: {

				iSelectASection: function(sSectionName) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Properties({text: sSectionName})
						],
						actions: new Press(),
						errorMessage: "Section button for " + sSectionName + " not found."
					});
				},

				iSelectALink: function(sLinkName) {
					return this.waitFor({
						controlType: "sap.m.Link",
						matchers: new Properties({text: sLinkName}),
						//actions: new Press(),
						// Since Change 3002279, Links no longer navigate correctly when used with OPA Press action,
						// scrolling to wrong entity.
						// Using firePress as workaround
						success: function (aLink) {
							aLink[0].firePress();
						},
						errorMessage: "Link" + sLinkName + " not found."
					});
				}

			},

			assertions: {

				iShouldSeeTheApiDetailPage: function() {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Api Detail page was successfully displayed.");
						},
						errorMessage: "The Api Detail page was not displayed."
					});
				},

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

				iShouldSeeTheElementDetailsInHeaderContent: function () {
					return this.waitFor({
						controlType: "sap.uxap.ObjectPageHeaderContent",
						success: function(aContent) {
							var oHeaderContent =  aContent[0];
							if (oHeaderContent) {
								this.waitFor({
									controlType: "sap.ui.layout.VerticalLayout",
									matchers: new Ancestor(oHeaderContent),
									success: function(aLayouts) {

										this.waitFor({
											controlType: "sap.m.Label",
											matchers: new Ancestor(aLayouts[0]),
											success: function(aLabels) {
												Opa5.assert.strictEqual(aLabels.length, 3, "There are three labels in the first column");
											}
										});
										this.waitFor({
											controlType: "sap.m.ObjectAttribute",
											matchers: new Ancestor(aLayouts[1]),
											success: function(aObjectAttributes) {
												Opa5.assert.strictEqual(aObjectAttributes.length, 3, "There are three ObjectAttributes in the second column");
											}
										});
										this.waitFor({
											controlType: "sap.m.ObjectAttribute",
											matchers: new Ancestor(aLayouts[2]),
											success: function(aObjectAttributes) {
												Opa5.assert.strictEqual(aObjectAttributes.length, 1, "There is one ObjectAttribute in the third column");
											}
										});

									},
									errorMessage: "sap.ui.layout.VerticalLayout  not found."

								});
							}
							Opa5.assert.ok(aContent.length === 1, "There is only one Header content");
							Opa5.assert.ok(true, "sap.uxap.ObjectPageHeaderContent found");
						},
						errorMessage: "sap.uxap.ObjectPageHeaderContent  not found."
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
									var oSubSection = oSubSections[0],
										oSectionInfo = oObjectPage._oSectionInfo[oSubSection.getId()],
										iScrollPosition = oObjectPage._$opWrapper[0].scrollTop;
									Opa5.assert.ok(oSubSections.length === 1, "There is only one " + sSubSectionName + " SubSection");
									Opa5.assert.ok(iScrollPosition === oSectionInfo.positionTop, sSubSectionName + " is on top");
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
