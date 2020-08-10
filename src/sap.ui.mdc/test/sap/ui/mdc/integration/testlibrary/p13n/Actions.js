/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press",
	"./waitForAdaptFiltersButton",
	"sap/base/assert",
	"sap/ui/mdc/integration/testlibrary/Util",
	"./waitForP13nDialog",
	"./waitForPanelInP13n",
	"./waitForListItemInDialogWithLabel",
	"./waitForButtonInDialog"
], function(
	Opa5,
	Ancestor,
	Properties,
	Press,
	waitForAdaptFiltersButton,
	assert,
	TestUtil,
	waitForP13nDialog,
	waitForPanelInP13n,
	waitForListItemInDialogWithLabel,
	waitForButtonInDialog
) {
	"use strict";

	function toggleSelect(sText, bSelectionAction, bLiveMode) {
		return waitForP13nDialog.call(this, TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT_TITLE"), {
			liveMode: bLiveMode,
			success: function(oDialog) {
				waitForListItemInDialogWithLabel.call(this, oDialog, sText, {
					listItemType: "sap.ui.mdc.filterbar.p13n.FilterGroupLayout",
					success: function(oColumnListItem) {
						var bColumnListItemSelected = oColumnListItem.isSelected();

						// do only select/deselect an item if it not selected/deselected
						if (bColumnListItemSelected === bSelectionAction) {
							return;
						}

						var oTable = oColumnListItem.getParent();

						if ((oTable.getMode() === "MultiSelect") && (oTable.getIncludeItemInSelection() === false)) {

							assert(oColumnListItem.isSelectable(), "The table item must be selectable. -");

							this.waitFor({
								controlType: "sap.m.CheckBox",
								matchers: [
									new Ancestor(oColumnListItem)
								],
								actions: new Press(),
								success: function() {
									Opa5.assert.ok(true, 'The "' + sText + '" column list item was selected');
								}
							});

							return;
						}

						Opa5.assert.ok(true, 'The "' + sText + '" column list item was selected');
					}
				});
			}
		});
	}

    return {

		iPressOnButtonWithIcon: function (sIcon) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new Properties({
					name: "icon",
					value: sIcon
				}),
				actions: new Press()
			});
		},

		iPressOnTheAdaptFiltersP13nItem: function(sText) {
			return waitForP13nDialog.call(this, TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT_TITLE"), {
				liveMode: true,
				success: function(oDialog) {
					waitForListItemInDialogWithLabel.call(this, oDialog, sText, {
						listItemType: "sap.ui.mdc.filterbar.p13n.FilterGroupLayout",
						actions: new Press(),
						success: function onColumnListItemPressed(oColumnListItem) {
							Opa5.assert.ok(true, 'The "' + sText + '" column list item was pressed');
						}
					});
				}
			});
		},

		iToggleFilterPanel: function(sGroupName, bModal) {
			return waitForPanelInP13n.call(this, sGroupName, {
				modal: !!bModal,
				success: function(oPanel) {
					Opa5.assert.ok(oPanel, "Groupable Panel found in p13n Dialog");
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(oPanel)
						],
						success: function(aButtons) {
							new Press().executeOn(aButtons[0]);
						}
					});
				}
			});
		},

		iSelectTheAdaptFiltersP13nItem: function(sText) {
			return toggleSelect.call(this, sText, true, false);
		},

		iDeselectTheAdaptFiltersP13nItem: function(sText) {
			return toggleSelect.call(this, sText, false, false);
		},

		iPressOnTheAdaptFiltersP13nReorderButton: function() {
			var sResourceBundleReorderButtonText = TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.REORDER");

			return waitForAdaptFiltersButton.call(this, {
				properties: {
					text: sResourceBundleReorderButtonText
				},
				actions: new Press(),
				success: function onAdaptFiltersReorderButtonPressed(oReorderButton) {
					Opa5.assert.ok(true, 'The adapt filters "' + sResourceBundleReorderButtonText + '" button was pressed');
				},
				errorMessage: 'The adapt filters "' + sResourceBundleReorderButtonText + '" button could not be pressed'
			});
		},

		iPressOnTheAdaptFiltersMoveToTopButton: function() {
			return waitForAdaptFiltersButton.call(this, {
				properties: {
					icon: "sap-icon://collapse-group"
				},
				actions: new Press(),
				success: function onAdaptFiltersMoveToTopButtonPressed(oMoveToTopButton) {
					Opa5.assert.ok(true, 'The adapt filters "Move to Top" button was pressed');
				},
				errorMessage: 'The adapt filters "Move to Top" button could not be pressed'
			});
		},

		iPressOnTheAdaptFiltersMoveToBottomButton: function() {
			return waitForAdaptFiltersButton.call(this, {
				properties: {
					icon: "sap-icon://expand-group"
				},
				actions: new Press(),
				success: function onAdaptFiltersMoveToBottomButtonPressed(oMoveToBottomButton) {
					Opa5.assert.ok(true, 'The adapt filters "Move to Bottom" button was pressed');
				},
				errorMessage: 'The adapt filters "Move to Bottom" button could not be pressed'
			});
		},

		iPressOnTheAdaptFiltersMoveUpButton: function() {
			return waitForAdaptFiltersButton.call(this, {
				properties: {
					icon: "sap-icon://slim-arrow-up"
				},
				actions: new Press(),
				success: function onAdaptFiltersMoveUpButtonPressed(oMoveUpButton) {
					Opa5.assert.ok(true, 'The adapt filters "Move Up" button was pressed');
				},
				errorMessage: 'The adapt filters "Move Up" button could not be pressed'
			});
		},

		iPressOnTheAdaptFiltersMoveDownButton: function() {
			return waitForAdaptFiltersButton.call(this, {
				properties: {
					icon: "sap-icon://slim-arrow-down"
				},
				actions: new Press(),
				success: function onAdaptFiltersMoveDownButtonPressed(oMoveDownButton) {
					Opa5.assert.ok(true, 'The adapt filters "Move Down" button was pressed');
				},
				errorMessage: 'The adapt filters "Move Down" button could not be pressed'
			});
		},
		iCloseAllPopovers: function() {
			return this.waitFor({
				controlType: "sap.m.ResponsivePopover",
				success: function(aControls) {
					aControls.forEach(function(oControl) {
						oControl.close();
					});
					return this.waitFor({
						check: function() {
							return !Opa5.getPlugin().getMatchingControls({
								controlType: "sap.m.Popover",
								visible: true,
								interactable: true
							}).length;
						}
					});
				}
			});
		},

		iPressDialogOk: function(sTitle) {
			return waitForButtonInDialog.call(this, sTitle, true, {
				actions: new Press(),
				success: function(oButton){
					Opa5.assert.ok(true, 'The Button "Ok" was pressed');
				},
				errorMessage: 'The button "Ok" could not be pressed'
			});
		},

		iPressDialogCancel: function(sTitle) {
			return waitForButtonInDialog.call(this, sTitle, false, {
				actions: new Press(),
				success: function(oButton){
					Opa5.assert.ok(true, 'The Button "Cancel" was pressed');
				},
				errorMessage: 'The button "Cancel" could not be pressed'
			});
		}
    };
});
