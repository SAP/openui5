/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/changeHandler/UnhideControl"
], function(HideControl, UnhideControl) {
	"use strict";

	/**
	 * Change handlers for adding and remove of a link in sap.ui.mdc.link.PanelItem.
	 *
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.flexibility.PanelItem
	 */
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
			changeHandler: UnhideControl
		},
		hideItem: {
			layers: {
				USER: true
			},
			changeHandler: HideControl
		}
	};
}, /* bExport= */true);
