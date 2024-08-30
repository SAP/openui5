sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/core/Lib"
], (
	Opa5,
	Press,
	Lib
) => {
	"use strict";

	Opa5.createPageObjects({
		onPageWithCViz: {

			actions: {
				iClickOnTheChangesDropDownMenuButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						bindingPath: {
							path: "",
							propertyPath: "/changeCategoryText",
							modelName: "visualizationModel"
						},
						actions: new Press(),
						errorMessage: "Did not find the DropDownMenuButton"
					});
				},
				iClickOnTheChangeCategory(sCategoryTitle) {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers(oListItem) {
							return oListItem.getTitle() === sCategoryTitle;
						},
						actions: new Press(),
						errorMessage: "Did not find the StandardListItem"
					});
				},
				iClickOnTheChangeIndicator(sElementId) {
					return this.waitFor({
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getElement().getId() === sElementId;
						},
						success(aOverlays) {
							return this.waitFor({
								controlType: "sap.ui.rta.util.changeVisualization.ChangeIndicator",
								matchers(oIndicator) {
									return oIndicator.getOverlayId() === aOverlays[0].getId();
								},
								actions: new Press(),
								errorMessage: "Did not find the ChangeIndicator"
							});
						},
						errorMessage: "Did not find the Element Overlay"
					});
				},
				iClickOnTheShowSourceButton() {
					const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
					const sButtonText = oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getText() === sButtonText;
						},
						actions: new Press(),
						errorMessage: "Did not find the ShowSourceButton"
					});
				},
				iClickOnTheUnsavedButton() {
					const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
					const sButtonText = oRtaResourceBundle.getText("BUT_CHANGEVISUALIZATION_VERSIONING_DIRTY");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getText() === sButtonText;
						},
						actions: new Press(),
						errorMessage: "Did not find the Unsaved button"
					});
				},
				iClickOnTheAllButton() {
					const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
					const sButtonText = oRtaResourceBundle.getText("BUT_CHANGEVISUALIZATION_VERSIONING_ALL");
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers(oButton) {
							return oButton.getText() === sButtonText;
						},
						actions: new Press(),
						errorMessage: "Did not find the All button"
					});
				}
			},

			assertions: {
				iShouldSeeTheChangesDropDownMenu(sCVizDropDownId) {
					return this.waitFor({
						id: sCVizDropDownId,
						controlType: "sap.m.Popover",
						success(oPopover) {
							Opa5.assert.ok(oPopover.isOpen(), "then the changesDropdown popover is open");
						},
						errorMessage: "Did not find the ChangesDropDownMenu"
					});
				},
				iShouldSeeTheDisabledSegmentedButton(sCVizDropDownId, iSegmentedButtonPosition) {
					return this.waitFor({
						id: sCVizDropDownId,
						controlType: "sap.m.Popover",
						success(oPopover) {
							Opa5.assert.notOk(oPopover.getContent()[0].getAggregation("buttons")[iSegmentedButtonPosition].getEnabled(), "then the button is disabled");
						},
						errorMessage: "The segmented button is enabled"
					});
				},
				iShouldNotSeeTheHiddenSegmentedButton(sCVizDropDownId, iSegmentedButtonPosition) {
					return this.waitFor({
						id: sCVizDropDownId,
						controlType: "sap.m.Popover",
						success(oPopover) {
							Opa5.assert.notOk(oPopover.getContent()[0].getAggregation("buttons")[iSegmentedButtonPosition].getVisible(), "then the button is hidden");
						},
						errorMessage: "The segmented Button is visible"
					});
				},
				iShouldSeeTheCorrectChangesCategoriesCount(sCVizDropDownId, oChangesCount) {
					const aChangesCount = Object.values(oChangesCount);
					return this.waitFor({
						id: sCVizDropDownId,
						controlType: "sap.m.Popover",
						success(oPopover) {
							Opa5.assert.ok(
								oPopover.getContent()[1].getItems().every((oItem, iIndex) => {
									return oItem.getCounter() === aChangesCount[iIndex];
								}),
								"then the correct categories count is visible"
							);
						},
						errorMessage: "ChangeCategory count does not match the visible count"
					});
				},
				iShouldSeeTheHiddenChangesStrip(sCVizDropDownId, nHiddenChanges) {
					return this.waitFor({
						id: sCVizDropDownId,
						controlType: "sap.m.Popover",
						success(oPopover) {
							Opa5.assert.ok(oPopover.getAggregation("content")[1].getVisible(), "then the strip is visible");
							Opa5.assert.strictEqual(
								oPopover.getModel("visualizationModel").getData().sortedChanges.relevantHiddenChanges.length,
								nHiddenChanges,
								"then the hidden changes are set correctly"
							);
						},
						errorMessage: "Then the changes hidden strip is not visible"
					});
				},
				iShouldNotSeeAChangeIndicator() {
					return this.waitFor({
						success() {
							const bHasNoIndicators = Opa5.getWindow().document.getElementsByClassName(".sapUiRtaChangeIndicator").length === 0;
							Opa5.assert.ok(bHasNoIndicators, "then no change indicators are visible");
						},
						errorMessage: "Then the a change indicator is visible"
					});
				},
				iShouldSeeTheChangeIndicators(iNumberOfVisibleIndicators) {
					return this.waitFor({
						controlType: "sap.ui.rta.util.changeVisualization.ChangeIndicator",
						success(aIndicators) {
							Opa5.assert.strictEqual(aIndicators.length, iNumberOfVisibleIndicators, "then the correct number of indicators is visible");
						},
						errorMessage: "Could not find a Indicator"
					});
				},
				iShouldSeeTheChangeIndicatorPopover() {
					return this.waitFor({
						controlType: "sap.m.Popover",
						matchers(oPopover) {
							return oPopover.getId().includes("Info--popover");
						},
						success(oPopover) {
							Opa5.assert.ok(oPopover[0].getVisible(), "then the popover is visible");
						},
						errorMessage: "Did not find ChangeIndicatorPopover"
					});
				},
				iShouldSeeTheCorrectPopupInformation(sChangeType, iIndex) {
					return this.waitFor({
						controlType: "sap.m.Table",
						success(aTables) {
							Opa5.assert.strictEqual(
								aTables[0].getItems()[iIndex].getCells()[0].getTooltip(),
								sChangeType,
								"then the information displayed in the popover is correct"
							);
						},
						errorMessage: "Could not find the popover information or it doesn't match the change type"
					});
				},
				iShouldSeeTheSourceElementOverlay() {
					return this.waitFor({
						asyncPolling: true,
						controlType: "sap.ui.dt.ElementOverlay",
						matchers(oOverlay) {
							return oOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorDependent");
						},
						success(oOverlay) {
							Opa5.assert.ok(oOverlay[0], "then dependent element indicator is shown");
						},
						errorMessage: "Did not find the dependent element with the style class"
					});
				}
			}
		}
	});
});