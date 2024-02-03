/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"./waitForLink"
], function(
	Opa5,
	Matcher,
	Ancestor,
	Descendant,
	waitForLink
) {
	"use strict";

	return {
		iShouldSeeAPopover: function(oLink) {
			return this.waitFor({
				controlType: "sap.ui.mdc.Field",
				matchers: new Descendant(oLink, true),
				success: function(aFields) {
					this.waitFor({
						controlType: "sap.m.Popover",
						matchers: new Ancestor(aFields[0].getFieldInfo(), false),
						success: function(aPopovers) {
							Opa5.assert.equal(aPopovers.length, 1, "Popover of mdc.Link found");
						}
					});
				}
			});
		},
		iShouldSeeLinksOnPopover: function(oLink, aLinks) {
			return this.waitFor({
				controlType: "sap.ui.mdc.link.Panel",
				success: function(aPanels) {
					Opa5.assert.equal(aPanels.length, 1, "mdc.link.Panel found");
					var oPanel = aPanels[0];
					var oCSSMatcher = new Matcher();
					oCSSMatcher.isMatching = (oVBox) => {
						return oVBox.hasStyleClass("mdcbaseinfoPanelSectionLinks");
					};

					this.waitFor({
						controlType: "sap.m.VBox",
						matchers: [
							new Ancestor(oPanel, false),
							oCSSMatcher
						],
						success: function(aVBoxes) {
							Opa5.assert.equal(aVBoxes.length, 1, "Links VBox found");
							const oVBox = aVBoxes[0];
							var iIndex = 0;
							var oMatcher = new Matcher();
							oMatcher.isMatching = function(oLink) {
								var bTextMatching = oLink.getText() === aLinks[iIndex];
								iIndex++;
								return bTextMatching;
							};
							if (aLinks.length > 0) {
								this.waitFor({
									controlType: "sap.m.Link",
									matchers: [
										new Ancestor(oVBox, false),
										oMatcher
									],
									success: function(aLinkControls) {
										Opa5.assert.equal(aLinks.length, aLinkControls.length, aLinks.length + " Links on Popover found");
									}
								});
							} else {
								var aVisibleItems = oPanel.getItems().filter(function(oItem) {
									return oItem.getVisible();
								});
								Opa5.assert.equal(aVisibleItems.length, 0, aVisibleItems.length + " Links on Popover found");
							}
						}
					});
				}
			});
		}
	};

});