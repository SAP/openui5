/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"./waitForLink",
	"./waitForPanel"
], function(
	Opa5,
	Ancestor,
	Descendant,
	waitForLink,
	waitForPanel
) {
	"use strict";

	const sLinkParentControlType = "sap.ui.mdc.Field";
	const sPopoverControlType = "sap.m.Popover";
	const sLinkContainerControlType = "sap.m.VBox";
	const sPanelLinkControlType = "sap.m.Link";

	return {
		iShouldSeeAPopover: function(oLink) {
			return this.waitFor({
				controlType: sLinkParentControlType,
				matchers: new Descendant(oLink, true),
				success: function(aLinkParentControls) {
					Opa5.assert.equal(aLinkParentControls.length, 1, `should see ${sLinkParentControlType} as parent of Link`);
					const oLinkParentControl = aLinkParentControls[0];
					const oFieldInfo = oLinkParentControl.getFieldInfo();

					Opa5.assert.ok(oFieldInfo, `should have a FieldInfo`);

					this.waitFor({
						controlType: sPopoverControlType,
						matchers: new Ancestor(oFieldInfo, false),
						success: function(aPopovers) {
							Opa5.assert.equal(aPopovers.length, 1, `should see ${sPopoverControlType}`);
						}
					});
				}
			});
		},
		iShouldSeeLinksOnPopover: function(oLink, aLinks) {
			return waitForPanel.call(this, {
				success: function(oPanel) {
					// should not see Links on Popover
					if (aLinks.length === 0) {
						const aVisibleItems = oPanel.getItems().filter(function(oItem) {
							return oItem.getVisible();
						});
						Opa5.assert.equal(aVisibleItems.length, 0, "should see 0 Links on Popover");
					}

					// should see Links on Popover
					if (aLinks.length > 0) {
						const fnCSSMatcher = (oVBox) => {
							return oVBox.hasStyleClass("mdcbaseinfoPanelSectionLinks");
						};
						this.waitFor({
							controlType: sLinkContainerControlType,
							matchers: [
								new Ancestor(oPanel, false),
								fnCSSMatcher
							],
							success: function(aLinkContaienrs) {
								Opa5.assert.equal(aLinkContaienrs.length, 1, `should see ${sLinkContainerControlType} containing Links`);
								const oLinkContainer = aLinkContaienrs[0];

								let iLinkIndex = 0;
								const fnTextMatcher = (oLink) => {
									const bTextMatching = oLink.getText() === aLinks[iLinkIndex];
									iLinkIndex++;
									return bTextMatching;
								};

								this.waitFor({
									controlType: sPanelLinkControlType,
									matchers: [
										new Ancestor(oLinkContainer, false),
										fnTextMatcher
									],
									success: function(aPanelLinks) {
										Opa5.assert.equal(aLinks.length, aPanelLinks.length, `should see ${aLinks.length} ${sPanelLinkControlType} on Popover`);
									}
								});
							}
						});
					}
				}
			});
		}
	};

});