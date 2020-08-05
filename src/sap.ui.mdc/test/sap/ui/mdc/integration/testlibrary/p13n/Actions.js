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
	"sap/ui/mdc/integration/testlibrary/filterbar/waitForFilterBar",
	"./waitForP13nDialog",
	"./waitForColumnListItemInDialogWithLabel",
	"./waitForButtonInDialog"
], function(
	Opa5,
	Ancestor,
	Properties,
	Press,
	waitForAdaptFiltersButton,
	assert,
	TestUtil,
	waitForFilterBar,
	waitForP13nDialog,
	waitForColumnListItemInDialogWithLabel,
	waitForButtonInDialog
) {
	"use strict";

	function toggleSelect(sText, bSelectionAction, bLiveMode) {
		return waitForFilterBar.call(this, {
			success: function(oFilterBar) {
				waitForP13nDialog.call(this, TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT_TITLE"), {
					liveMode: bLiveMode,
					success: function(oDialog) {
						waitForColumnListItemInDialogWithLabel.call(this, oDialog, sText, {
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
			waitForP13nDialog.call(this, TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT_TITLE"), {
				liveMode: true,
				success: function(oDialog) {
					waitForColumnListItemInDialogWithLabel.call(this, oDialog, sText, {
						actions: new Press(),
						success: function onColumnListItemPressed(oColumnListItem) {
							Opa5.assert.ok(true, 'The "' + sText + '" column list item was pressed');
						}
					});
				}
			});
		},

		iSelectTheAdaptFiltersP13nItem: function(sText) {
			return toggleSelect.call(this, sText, true, true);
		},

		iDeselectTheAdaptFiltersP13nItem: function(sText) {
			return toggleSelect.call(this, sText, false, true);
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
