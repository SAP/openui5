/*!
 * ${copyright}
 */

sap.ui.define([
	"./ColumnSettings"
], function(ColumnSettings) {
	"use strict";

	/**
	 * Constructor for a new <code>ResponsiveColumnSettings</code>.
	 *
	 * Provides the following settings that are supported by the {@link sap.m.Column}:
	 *
	 * <ul>
	 *	<li>importance</li>
	 *	<li>mergeFunction</li>
	 * </ul>
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 *
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.mdc.table.ColumnSettings
	 * @version ${version}
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.mdc.table.ResponsiveColumnSettings
	 * @since 1.110
	 */

	const ResponsiveColumnSettings = ColumnSettings.extend("sap.ui.mdc.table.ResponsiveColumnSettings", {
		metadata: {
			library: "sap.ui.mdc",
			"final": true,
			properties: {
				/**
				 * Defines the column importance.
				 *
				 * The column importance is taken into consideration for calculating the <code>minScreenWidth</code>
				 * property and for setting the <code>demandPopin</code> property of the column.
				 * See {@link sap.m.Table#getAutoPopinMode} for more details, which is automatically set to <code>true</code>.
				 *
				 * @since 1.110
				 */
				importance: {
					type: "sap.ui.core.Priority",
					group: "Behavior",
					defaultValue: "None"
				},
				/**
				 * Defines the control serialization function to merge duplicate cells into one cell block.
				 * The control itself uses this function to compare values of two duplicate cells.
				 *
				 * <b>Note:</b> Providing this property will automatically set {@link sap.m.Column#getMergeDuplicates} to <code>true</code>,
				 * and the property itself is mapped to {@link sap.m.Column#getMergeFunctionName} of the inner column.
				 * Don't set this property for cells for which the content provides a user interaction, such as <code>sap.m.Link</code>.
				 *
				 * @since 1.110
				 */
				mergeFunction: {
					type: "string",
					group: "Misc"
				}
			}
		}
	});

	return ResponsiveColumnSettings;
});