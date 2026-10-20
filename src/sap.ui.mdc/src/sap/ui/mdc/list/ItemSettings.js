/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/table/RowItemSettingsBase"
], (
	RowItemSettingsBase
) => {
	"use strict";

	/**
	 * Constructor for new <code>ItemSettings</code>.
	 *
	 * <b>Note:</b> Only use bindings that are bound against the items, as correct behavior is not guaranteed for other binding types.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ItemSettings</code> control is used to configure an item.
	 * This control can only be used in the context of the <code>sap.ui.mdc.List</code> control to define item settings.
	 * @extends sap.ui.mdc.table.RowItemSettingsBase
	 *
	 * @ui5-restricted sap.fe
	 * @since 1.153
	 * @alias sap.ui.mdc.list.ItemSettings
	 */
	const ItemSettings = RowItemSettingsBase.extend("sap.ui.mdc.list.ItemSettings", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines the number of item actions to display.
				 *
				 * This property is useful for bound item actions where the count cannot be determined automatically.
				 * If not set, the count is derived from:
				 * <ul>
				 *   <li>Bound actions: Defaults to 1 (must be set explicitly if multiple actions exist)</li>
				 *   <li>Static actions: The length of the <code>itemActions</code> aggregation</li>
				 * </ul>
				 *
				 * <b>Note:</b> This property is only relevant for <code>sap.ui.mdc.list.ListType</code>.
				 * It has no effect for <code>sap.ui.mdc.list.GridListType</code>, which uses an overlay approach
				 * that does not require pre-allocated space.
				 */
				itemActionCount: {type: "int", group: "Appearance", defaultValue: -1}
			},
			aggregations: {
				/**
				 * Defines the actions available for each item.
				 */
				itemActions: {type: "sap.ui.mdc.list.ItemActionItem", multiple: true}
			}
		}
	});

	ItemSettings.prototype.getEffectiveItemActionCount = function() {
		return this.getEffectiveActionCount("itemActionCount", "itemActions");
	};

	ItemSettings.prototype.getAllActions = function() {
		return RowItemSettingsBase.prototype.getAllActions.call(this, "itemActions", ["icon", "text", "visible"]);
	};

	return ItemSettings;
});
