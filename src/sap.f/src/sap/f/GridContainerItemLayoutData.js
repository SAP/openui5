/*!
 * ${copyright}
 */

// Provides element sap.f.GridContainerItemLayoutData
sap.ui.define(['sap/ui/core/LayoutData'],
	function(LayoutData) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.f.GridContainerItemLayoutData</code>.
		 *
		 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new element.
		 *
		 * @class
		 * Holds layout data for an item inside a <code>sap.f.GridContainer</code>.
		 *
		 * @see {@link topic:32d4b9c2b981425dbc374d3e9d5d0c2e Grid Controls}
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @extends sap.ui.core.LayoutData
		 *
		 * @experimental Since 1.65 This class is experimental. The API may change.
		 * @since 1.65
		 * @public
		 * @constructor
		 * @alias sap.f.GridContainerItemLayoutData
		 */
		var GridContainerItemLayoutData = LayoutData.extend("sap.f.GridContainerItemLayoutData", /** @lends sap.f.GridContainerItemLayoutData.prototype */ {
			metadata: {

				library: "sap.f",
				properties: {
					/**
					 * Specifies the number of columns, which the item should take
					 *
					 * <b>Note:</b> Make sure that the item does not have more columns than the total columns in the grid.
					 * Use {@link sap.f.GridContainer#attachLayoutChange} or a resize listener to handle when columns count is changed for the grid.
					 * If item has more columns at some point, they will be automatically reduced to the total grid columns. This is done to prevent broken layout (grid blowout) that affects all items.
					 */
					columns: {type: "int", group: "Misc", defaultValue: 1},
					/**
					 * Specifies the minimum number of rows, which the item should take.
					 */
					minRows: {type: "int", group: "Misc"},
					/**
					 * Specifies the number of rows, which the item should take.
					 * @experimental Since 1.65 this property may soon be removed, use minRows instead
					 */
					rows: {type: "int", group: "Misc"}
				}
			}
		});

		/**
		 * Returns if the item has auto height.
		 *
		 * @returns {boolean} True if the item has auto height
		 * @private
		 */
		GridContainerItemLayoutData.prototype.hasAutoHeight = function () {
			return !this.getRows();
		};

		/**
		 * Returns the actual number of rows.
		 *
		 * @returns {int} The actual number of rows
		 * @private
		 */
		GridContainerItemLayoutData.prototype.getActualRows = function () {
			return Math.max(this.getRows() || 1, this.getMinRows() || 1);
		};

		return GridContainerItemLayoutData;
	});
