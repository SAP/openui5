/*
 * ! ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Change handlers for adding and remove of a link in sap.ui.mdc.link.PanelItem.
	 *
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.flexibility.PanelItem
	 */

	var fnApplyChange = function(bVisible, oChange, oPanelItem, mPropertyBag) {
		// // TODO: workaround due to disabled 'Reset' button in SelectionDialog
		// if (!mPropertyBag.modifier.getProperty(oPanelItem, "visibleChangedChangeHandler")) {
		// 	mPropertyBag.modifier.setProperty(oPanelItem, "visibleInitial", oPanelItem.getVisible());
		// }
		// // TODO: end of workaround

		// mPropertyBag.modifier.setProperty(oPanelItem, "visibleChangedByUser", oChange.getLayer() === "USER");

		// First store the old value for revert
		oChange.setRevertData(mPropertyBag.modifier.getProperty(oPanelItem, "visible"));
		// Then set the new value
		mPropertyBag.modifier.setProperty(oPanelItem, "visible", bVisible);
	};
	var fnRevertChange = function(bVisible, oChange, oPanelItem, mPropertyBag) {
		mPropertyBag.modifier.setProperty(oPanelItem, "visible", oChange.getRevertData());
		oChange.resetRevertData();
	};
	return {
		createChanges: function(aDeltaMItems) {
			return aDeltaMItems.map(function(oDeltaMItem) {
				var oControl = sap.ui.getCore().byId(oDeltaMItem.id);
				if (!oControl) {
					throw new Error("Invalid 'id'. For the id " + oDeltaMItem.id + " no existing control could be found");
				}
				return {
					selectorElement: oControl,
					changeSpecificData: {
						changeType: oDeltaMItem.visible ? "revealItem" : "hideItem"
					}
				};
			});
		},
		revealItem: {
			layers: {
				USER: true
			},
			changeHandler: {
				applyChange: function(oChange, oPanelItem, mPropertyBag) {
					fnApplyChange(true, oChange, oPanelItem, mPropertyBag);
				},
				revertChange: function(oChange, oPanelItem, mPropertyBag) {
					fnRevertChange(true, oChange, oPanelItem, mPropertyBag);
				},
				completeChangeContent: function(oChange, mSpecificChangeInfo) {
				}
			}
		},
		hideItem: {
			layers: {
				USER: true
			},
			changeHandler: {
				applyChange: function(oChange, oPanelItem, mPropertyBag) {
					fnApplyChange(false, oChange, oPanelItem, mPropertyBag);
				},
				revertChange: function(oChange, oPanelItem, mPropertyBag) {
					fnRevertChange(false, oChange, oPanelItem, mPropertyBag);
				},
				completeChangeContent: function(oChange, mSpecificChangeInfo) {
				}
			}
		}
	};
}, /* bExport= */true);
