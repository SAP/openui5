/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/Press"
], function(Opa5, TestUtil, PropertyStrictEquals, Ancestor, Press) {
	"use strict";

	const Arrangement = Opa5.extend("sap.ui.mdc.qunit.p13n.test.Arrangement", {

		closeAllPopovers: function() {
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
		//close with 'Ok' or 'Cancel'
		closeModalDialog: function(sCloseType){
			return this.waitFor({
				controlType: "sap.m.Dialog",
				success: function(aControls) {
					const oDialog = aControls[0];
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(oDialog),
							new PropertyStrictEquals({
								name: "text",
								value: sCloseType
							})
						],
						actions: new Press()
					});
				}
			});
		},
		enableAndDeleteLrepLocalStorage: function() {
			const oStorage = window.localStorage;
			const fnRemoveItem = function(sKey) {
				const bIsFlexObject = sKey.includes("sap.ui.fl");

				if (!bIsFlexObject) {
					return;
				}

				oStorage.removeItem(sKey);
			};

			Object.keys(oStorage).map(fnRemoveItem);

			// Note: prevent app restart for different layer
			// (--> check why there are tests that are not cleaned up correctly)
            window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
            window.sessionStorage.removeItem("sap.ui.rta.restart.USER");
		}

	});

	Arrangement.P13nDialog = {
		Settings:{
			key: "Column",
			Icon: "sap-icon://action-settings",
			Back: "sap-icon://decline",
			MoveToTop: "sap-icon://collapse-group",
			MoveUp: "sap-icon://slim-arrow-up",
			MoveDown: "sap-icon://slim-arrow-down"
		},
		Sort:{
			key: "Sort",
			Icon: "sap-icon://sort",
			Back: "sap-icon://decline",
			MoveToTop: "sap-icon://collapse-group",
			MoveUp: "sap-icon://slim-arrow-up",
			MoveDown: "sap-icon://slim-arrow-down",
			Ascending: TestUtil.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_SORT_ASCENDING"),
			Descending: TestUtil.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_SORT_DESCENDING")
		},
		Filter:{
			key: "Filter",
			Icon: "sap-icon://filter",
			Back: "sap-icon://decline",
			MoveToTop: "sap-icon://collapse-group",
			MoveUp: "sap-icon://slim-arrow-up",
			MoveDown: "sap-icon://slim-arrow-down"
		},
		Group:{
			key: "Group"
		},
		AdaptFilter:{
			MoveToTop: "sap-icon://collapse-group",
			MoveUp: "sap-icon://slim-arrow-up",
			MoveDown: "sap-icon://slim-arrow-down",
			button: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT"),
			getButtonCountText: function(iCount) {
				return TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT_NONZERO", iCount);
			},
			go: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.GO")
		},
		Titles:{
			sort: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "sort.PERSONALIZATION_DIALOG_TITLE"),
			columns: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "table.SETTINGS_COLUMN"),
			chart: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "chart.PERSONALIZATION_DIALOG_TITLE"),
			filter: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filter.PERSONALIZATION_DIALOG_TITLE"),
			adaptFilter: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT_TITLE"),
			settings: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.VIEW_SETTINGS"),
			group: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "group.PERSONALIZATION_DIALOG_TITLE")
		}
	};

	return Arrangement;
});
