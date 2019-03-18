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
		 * Holds layout data for a GridContainer.
		 * @extends sap.ui.core.LayoutData
		 * @version ${version}
		 *
		 * @constructor
		 * @since 1.62
		 * @see {@link TODO Card}
		 * @alias sap.f.GridContainerItemLayoutData
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var GridContainerItemLayoutData = LayoutData.extend("sap.f.GridContainerItemLayoutData", /** @lends sap.f.GridContainerItemLayoutData.prototype */ {
			metadata: {

				library: "sap.f",
				properties: {
					/**
					 * Specifies the number of columns, which the item should take.
					 */
					columns: {type: "int", group: "Misc", defaultValue: 1},
					/**
					 * Specifies the number of rows, which the item should take.
					 */
					rows: {type: "int", group: "Misc"}
				}
			}
		});

		/**
		 * Returns true if rows span should grow automatically for that item.
		 *
		 * @returns {bool} True if they should grow, false if the item should be limited to the initial rows span
		 */
		GridContainerItemLayoutData.prototype.getRowsAutoSpan = function () {
			// TODO we can make this a property
			return !this.getRows();
		};

		return GridContainerItemLayoutData;
	});
