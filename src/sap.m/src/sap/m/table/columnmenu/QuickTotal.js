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
	 * Constructor for a new <code>QuickTotal</code>.
	 *
	 * @param {string} [sId] ID for the new <code>QuickTotal</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>QuickTotal</code>
	 *
	 * @class
	 * The <code>QuickTotal</code> class is used for quick totaling for the <code>sap.m.table.columnmenu.Menu</code>.
	 * It can be used to specify control- and application-specific quick actions for totaling.
	 *
	 * @extends sap.m.table.columnmenu.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.QuickTotal
	 */
	var QuickTotal = QuickActionBase.extend("sap.m.table.columnmenu.QuickTotal", {

		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				 * Defines the totalable properties and the initial state.
				 */
				items: { type: "sap.m.table.columnmenu.QuickTotalItem", multiple: true }
			},
			events: {
				/**
				 * Fires the change event.
				 */
				change: {
					parameters: {
						/**
						 * The key of the property.
						 */
						key: { type: "string" },
						/**
						 * The new value.
						 */
						totaled: { type: "boolean" }
					}
				}
			}
		}
	});

	QuickTotal.prototype.getEffectiveQuickActions = function() {
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

	QuickTotal.prototype.onChange = function(oItem) {
		this.fireChange({item: oItem});
		this.getMenu().close();
	};

	return QuickTotal;
});