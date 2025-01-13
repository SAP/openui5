/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/columnmenu/QuickActionBase"
], function(
	QuickActionBase
) {
	"use strict";

	/**
	 * Constructor for a new <code>QuickGroup</code>.
	 *
	 * @param {string} [sId] ID for the new <code>QuickGroup</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>QuickGroup</code>
	 *
	 * @class
	 * The <code>QuickGroup</code> class is used for quick grouping for the <code>sap.m.table.columnmenu.Menu</code>.
	 * It can be used to specify control- and application-specific quick actions for grouping.
	 *
	 * @extends sap.m.table.columnmenu.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.QuickGroup
	 */
	var QuickGroup = QuickActionBase.extend("sap.m.table.columnmenu.QuickGroup", {

		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				 * The groupable properties and the initial state.
				 */
				items: { type: "sap.m.table.columnmenu.QuickGroupItem", multiple: true }
			},
			events: {
				/**
				 * Fires the change event.
				 */
				change: {
					parameters: {
						/**
						 * The key of the property to be grouped.
						 */
						key: { type: "string" },
						/**
						 * The new grouped state.
						 */
						grouped: { type: "boolean" }
					}
				}
			}
		}
	});

	QuickGroup.prototype.getEffectiveQuickActions = function() {
		var aEffectiveQuickActions = [];

		if (this.getVisible()) {
			var aItems = this.getItems().filter((oItem) => {
				return oItem.getVisible();
			});

			aItems.forEach((oItem) => {
				aEffectiveQuickActions.push(oItem._getAction());
			});
		}

		return aEffectiveQuickActions;
	};

	QuickGroup.prototype.onChange = function(oItem) {
		this.fireChange({item: oItem});
		this.getMenu().close();
	};

	return QuickGroup;
});