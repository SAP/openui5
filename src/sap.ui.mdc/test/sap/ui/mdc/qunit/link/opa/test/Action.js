/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/test/Opa5', 'sap/ui/test/actions/Press', 'sap/ui/test/actions/EnterText', 'sap/ui/test/matchers/Properties', 'sap/ui/test/matchers/Ancestor', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Util', 'sap/ui/test/matchers/PropertyStrictEquals', "sap/ui/test/matchers/Descendant", "sap/ui/core/Core"
], function(Opa5, Press, EnterText, Properties, Ancestor, TestUtil, PropertyStrictEquals, Descendant, oCore) {
	'use strict';

	var Action = Opa5.extend("sap.ui.mdc.qunit.link.opa.test.Action", {

		iPressOnLinkPersonalizationButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "info.POPOVER_DEFINE_LINKS")
				}),
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "The 'More Links' button found");
				}
			});
		},

		iSelectLink: function(sColumnName) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					var oTable = aTables[0];
					this.waitFor({
						controlType: "sap.m.Link",
						matchers: [
							new Ancestor(oTable, false),
							new PropertyStrictEquals({
								name: "text",
								value: sColumnName
							})
						],
						success: function(aLinks) {
							var oLink = aLinks[0];
							this.waitFor({
								controlType: "sap.m.ColumnListItem",
								matchers: new Descendant(oLink, false),
								success: function(aColumnListItems) {
									var oColumnListItem = aColumnListItems[0];
									this.waitFor({
										controlType: "sap.m.CheckBox",
										matchers: new Ancestor(oColumnListItem, false),
										actions: new Press()
									});
								}
							});
						}
					});
				}
			});
		},

		iPressOkButton: function() {
			var oOKButton;
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				check: function(aButtons) {
					return aButtons.some(function(oButton) {
						if (oButton.getText() === TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.OK")) {
							oOKButton = oButton;
							return true;
						}
					});
				},
				success: function() {
					Opa5.assert.ok(oOKButton, "'OK' button found");
					oOKButton.$().trigger("tap");
				},
				errorMessage: "Did not find the 'OK' button"
			});
		},
		iPressOnRtaResetButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: TestUtil.getTextFromResourceBundle("sap.ui.rta", "BTN_RESTORE")
				}),
				actions: new Press(),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "'Reset' button found");
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: TestUtil.getTextFromResourceBundle("sap.ui.rta", "BTN_FREP_OK")
						}),
						actions: new Press(),
						success: function(aButtons) {
							Opa5.assert.equal(aButtons.length, 1, "'OK' button of the warning dialog found");
						}
					});
				}
			});
		},
		iConfirmTheNavigation: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: "Confirm"
				}),
				success: function(aDialogs) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(aDialogs[0]),
							new PropertyStrictEquals({
								name: "text",
								value: "Navigate"
							})
						],
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Navigation confirmed");
						}
					});
				}
			});
		},
		iCancelTheNavigation: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: "Confirm"
				}),
				success: function(aDialogs) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(aDialogs[0]),
							new PropertyStrictEquals({
								name: "text",
								value: "Cancel"
							})
						],
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Navigation canceled ");
						}
					});
				}
			});
		},
		iSelectAllLinks: function(bSelectAll) {
			return this.waitFor({
				controlType: "sap.m.CheckBox",
				matchers: function(oCheckBox) {
					return oCheckBox.getSelected() !== bSelectAll && oCheckBox.getId().endsWith("-sa");
				},
				actions: new Press()
			});
		}
	});

	return Action;
});
