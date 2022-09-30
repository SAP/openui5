/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/columnmenu/QuickActionBase"
], function (
	QuickActionBase
) {
	"use strict";

	/**
	 * Constructor for a new <code>QuickSort</code>.
	 *
	 * @param {string} [sId] ID for the new <code>QuickSort</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>QuickSort</code>
	 *
	 * @class
	 * The <code>QuickSort</code> class is used for quick sorting for the <code>sap.m.table.columnmenu.Menu</code>.
	 * It can be used to specify control- and application-specific quick actions for sorting.
	 *
	 * @extends sap.m.table.columnmenu.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.QuickSort
	 */
	var QuickSort = QuickActionBase.extend("sap.m.table.columnmenu.QuickSort", {

		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				 * The sortable properties and the initial state.
				 */
				items: { type: "sap.m.table.columnmenu.QuickSortItem", multiple: true }
			},
			events: {
				/**
				 * Fires the change event.
				 */
				change: {
					parameters: {
						/**
						 * The key of the property that is sorted.
						 */
						key: { type: "string" },
						/**
						 * The new sort order.
						 */
						sortOrder: { type: "sap.ui.core.SortOrder" }
					}
				}
			}
		}
	});

	QuickSort.prototype.getEffectiveQuickActions = function() {
		var aItems = this.getItems();
		var aEffectiveQuickActions = [];

		if (this.getVisible()) {
			aItems.forEach(function(oItem) {
				aEffectiveQuickActions.push(oItem._getAction());
			}, this);
		}

		return aEffectiveQuickActions;
	};

	QuickSort.prototype.onChange = function(oItem) {
		this.fireChange({item: oItem});
		this.getMenu().close();
	};

	return QuickSort;
});