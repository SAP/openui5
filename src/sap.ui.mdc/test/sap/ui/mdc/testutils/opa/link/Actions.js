/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"../p13n/waitForP13nButtonWithMatchers",
	"../p13n/waitForP13nDialog",
	"./waitForLink",
	"./waitForPanel"
], function(
	Library,
	Opa5,
	Ancestor,
	Descendant,
	PropertyStrictEquals,
	Press,
	waitForP13nButtonWithMatchers,
	waitForP13nDialog,
	waitForLink,
	waitForPanel
) {
	"use strict";

	const oMDCBundle = Library.getResourceBundleFor("sap.ui.mdc");

	const sPopoverControlType = "sap.m.ResponsivePopover";
	const sPanelLinkControlType = "sap.m.Link";

	const fnPressLink = function(oLinkIdentifier, oSettings) {
		return waitForLink.call(this, oLinkIdentifier, {
			actions: new Press(),
			success: (oLinkInstance) => {
				Opa5.assert.ok(oLinkInstance, `should press sap.ui.mdc.Link`);
				if (oSettings && typeof oSettings.success === "function") {
					oSettings.success.call(this, oLinkInstance);
				}
			},
			errorMessage: oSettings?.errorMessage ? oSettings.errorMessage : "Could not Press sap.ui.mdc.Link"
		});
	};

	return {
		iPressTheLink: function(oLinkIdentifier) {
			return fnPressLink.call(this, oLinkIdentifier);
		},
		iOpenThePersonalizationDialog: function(vLink, oSettings) {
			const sLinkId = typeof oControl === "string" ? vLink : vLink.getId();
			return fnPressLink.call(this, { id: sLinkId }, {
				success: function(oLinkInstance) {
					return waitForPanel.call(this, {
						success: function(oPanel) {
							return waitForP13nButtonWithMatchers.call(this, {
								actions: new Press(),
								matchers: [
									new Ancestor(oPanel, false),
									new PropertyStrictEquals({
										name: "text",
										value: oMDCBundle.getText("info.POPOVER_DEFINE_LINKS")
									})
								],
								success: function() {
									return waitForP13nDialog.call(this, {
										matchers: new PropertyStrictEquals({
											name: "title",
											value: oMDCBundle.getText("info.SELECTION_DIALOG_ALIGNEDTITLE")
										}),
										success: function(oP13nDialog) {
											if (oSettings && typeof oSettings.success === "function") {
												oSettings.success.call(this, oP13nDialog);
											}
										}
									});
								}
							});
						}
					});
				},
				errorMessage: `Control "${sLinkId}" not found.`
			});
		},
		iPressLinkOnPopover: function(oLinkIdentifier, sLink) {
			return fnPressLink.call(this, oLinkIdentifier, {
				success: function(oLinkInstance) {
					return waitForPanel.call(this, {
						success: function(oPanel) {
							return this.waitFor({
								controlType: sPanelLinkControlType,
								matchers: [
									new Ancestor(oPanel, false),
									new PropertyStrictEquals({
										name: "text",
										value: sLink
									})
								],
								actions: new Press(),
								success: function(aLinks) {
									Opa5.assert.equal(aLinks.length, 1, `should press ${sPanelLinkControlType} on Popover`);
								}
							});
						}
					});
				}
			});
		},
		iCloseThePopover: function() {
			return waitForPanel.call(this, {
				success: function(oPanel) {
					return this.waitFor({
						controlType: sPopoverControlType,
						matchers: new Descendant(oPanel),
						success: function(aResponsivePopovers) {
							Opa5.assert.equal(aResponsivePopovers.length, 1, `should close ${sPopoverControlType}`);
							aResponsivePopovers[0].close();
						}
					});
				}
			});
		}
	};

});