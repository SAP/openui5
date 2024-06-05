/*!
 * ${copyright}
 */

// Provides element sap.f.FlexibleColumnLayoutDataForTablet
sap.ui.define(['sap/ui/core/LayoutData'],
	function(LayoutData) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.f.FlexibleColumnLayoutDataForTablet</code>.
		 *
		 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new element.
		 *
		 * @class
		 * Holds layout data for columns of <code>sap.f.FlexibleColumnLayout</code> on tablet.
		 *
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @extends sap.ui.core.LayoutData
		 *
		 * @since 1.128
		 * @public
		 * @constructor
		 * @alias sap.f.FlexibleColumnLayoutDataForTablet
		 */
		var FlexibleColumnLayoutDataForTablet = LayoutData.extend("sap.f.FlexibleColumnLayoutDataForTablet", /** @lends sap.f.FlexibleColumnLayoutDataForTablet.prototype */ {
			metadata: {

				library: "sap.f",
				properties: {
					/**
					 * Columns distribution of TwoColumnsBeginExpanded layout in the format "begin/mid/end", where values are set in percentages.
					 */
					twoColumnsBeginExpanded: {type: "string", group: "Appearance", defaultValue: "67/33/0"},

					/**
					 * Columns distribution of TwoColumnsMidExpanded layout in the format "begin/mid/end", where values are set in percentages.
					 */
					twoColumnsMidExpanded: {type: "string", group: "Appearance", defaultValue: "33/67/0"},

					/**
					 * Columns distribution of ThreeColumnsBeginExpandedEndHidden layout in the format "begin/mid/end", where values are set in percentages.
					 */
					threeColumnsBeginExpandedEndHidden: {type: "string", group: "Appearance", defaultValue: "67/33/0"},

					/**
					 * Columns distribution of ThreeColumnsEndExpanded layout in the format "begin/mid/end", where values are set in percentages.
					 */
					threeColumnsEndExpanded: {type: "string", group: "Appearance", defaultValue: "0/33/67"},

					/**
					 * Columns distribution of ThreeColumnsMidExpanded layout in the format "begin/mid/end", where values are set in percentages.
					 */
					threeColumnsMidExpanded: {type: "string", group: "Appearance", defaultValue: "0/67/33"},

					/**
					 * Columns distribution of ThreeColumnsMidExpandedEndHidden layout in the format "begin/mid/end", where values are set in percentages.
					 */
					threeColumnsMidExpandedEndHidden: {type: "string", group: "Appearance", defaultValue: "33/67/0"}
				}
			}
		});

		return FlexibleColumnLayoutDataForTablet;
	});
