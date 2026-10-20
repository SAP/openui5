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
	 * Constructor for new <code>RowSettings</code>.
	 *
	 * <b>Note:</b> Only use bindings that are bound against the rows, as working functionality cannot be ensured for other binding types.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>RowSettings</code> control is used to configure a row.
	 * This control can only be used in the context of the <code>sap.ui.mdc.Table</code> control to define row settings.
	 * @extends sap.ui.mdc.table.RowItemSettingsBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.mdc.table.RowSettings
	 */
	const RowSettings = RowItemSettingsBase.extend("sap.ui.mdc.table.RowSettings", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines the number of row actions to display.
				 *
				 * This property is useful for bound row actions where the count
				 * cannot be determined automatically. If not set, the count is derived from:
				 * <ul>
				 *   <li>Bound actions: Defaults to 1 (must be set explicitly if multiple actions exist)</li>
				 *   <li>Static actions: The length of the <code>rowActions</code> aggregation</li>
				 * </ul>
				 *
				 * <b>Note:</b><br>
				 * If the <code>rowActionCount</code> property is not explicitly set, the table will automatically determine the number of row actions
				 * that is displayed based on the configuration of the <code>RowSettings</code> and the underlying table type.
				 * In this case, the table will check how many actions are configured in the <code>RowSettings</code> and will display as many actions
				 * as possible up to the maximum number of actions supported by the underlying table type.<br>
				 *
				 * If the <code>rowActionCount</code> property is explicitly set,
				 * its value will be used to determine how many row actions are displayed,
				 * regardless of the number of actions configured in the <code>RowSettings</code>. However,
				 * the actual number of displayed actions will
				 * still be limited by the maximum number of actions supported by the underlying table type.
				 *
				 * <b>Example:</b><br>
				 * If the underlying table type supports a maximum number of 3 row actions,
				 * and there are 5 actions configured in the <code>RowSettings</code>:
				 *
				 * <ul>
				 *   <li><code>rowActionCount</code> is not set, the table will display 3 actions (the maximum supported).</li>
				 *   <li><code>rowActionCount</code> is set to 2, the table will display 2 actions (as specified),
				 *   even though more actions are configured in the <code>RowSettings</code>.</li>
				 * </ul>
				 *
				 * For bound row actions, the <code>rowActionCount</code> must be set explicitly, as the count cannot be determined automatically.
				 * For static actions, the count defaults to the length of the <code>rowActions</code> aggregation in the <code>RowSettings</code>.
				 *
				 * @since 1.148
				 */
				rowActionCount: {type: "int", group: "Appearance", defaultValue: -1}
			},
			aggregations: {
				/**
				 * The actions that appear at the end of a row.
				 *
				 * <b>Note:</b> This aggregation cannot be bound with a factory. If the table type is
				 * {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, only the <code>Navigation</code> row action type is supported.
				 */
				rowActions: {type: "sap.ui.mdc.table.RowActionItem", multiple: true}
			}
		}
	});

	RowSettings.prototype.getAllActions = function() {
		return RowItemSettingsBase.prototype.getAllActions.call(this, "rowActions", ["type", "text", "icon", "visible"]);
	};

	/**
	 * Returns the effective number of row actions to display.
	 *
	 * @returns {int} The number of row actions
	 * @private
	 */
	RowSettings.prototype.getEffectiveRowActionCount = function() {
		return this.getEffectiveActionCount("rowActionCount", "rowActions");
	};

	return RowSettings;
});
