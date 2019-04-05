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
		 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
		 */
		var GridContainerItemLayoutData = LayoutData.extend("sap.f.GridContainerItemLayoutData", /** @lends sap.f.GridContainerItemLayoutData.prototype */ {
			metadata: {

				library: "sap.f",
				properties: {
					/**
					 * Specifies the number of columns, which the item should take
					 */
					columns: {type: "int", group: "Misc", defaultValue: 1},
					/**
					 * Specifies the number of rows, which the item should take
					 * If not specified, the <code>sap.f.GridContainer</code> will calculate how many rows the item needs. Based on it's height.
					 */
					rows: {type: "int", group: "Misc"}
				}
			}
		});

		/**
		 * Returns true if rows span should grow automatically for that item.
		 *
		 * @private
		 * @returns {bool} True if they should grow, false if the item should be limited to the initial rows span
		 */
		GridContainerItemLayoutData.prototype.getRowsAutoSpan = function () {
			// TODO we can make this a property
			return !this.getRows();
		};

		return GridContainerItemLayoutData;
	});
