/*!
 * ${copyright}
 */

// Provides element sap.f.FlexibleColumnLayoutData
sap.ui.define(['sap/ui/core/LayoutData'],
	function(LayoutData) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.f.FlexibleColumnLayoutData</code>.
		 *
		 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new element.
		 *
		 * @class
		 * Holds layout data for <code>sap.f.FlexibleColumnLayout</code>.
		 * Allows LayoutData of type <code>sap.f.FlexibleColumnLayoutDataForDesktop</code> or <code>sap.f.FlexibleColumnLayoutFlexibleColumnLayoutDataForTablet</code>
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
		 * @alias sap.f.FlexibleColumnLayoutData
		 */
		var FlexibleColumnLayoutData = LayoutData.extend("sap.f.FlexibleColumnLayoutData", /** @lends sap.f.FlexibleColumnLayoutData.prototype */ {
			metadata: {

				library: "sap.f",
				aggregations: {

					/**
					 * Allows LayoutData of type <code>sap.f.FlexibleColumnLayoutDataForDesktop</code>
					 */
					desktopLayoutData: {type: "sap.f.FlexibleColumnLayoutDataForDesktop", multiple: false, singularName: "desktopLayoutData"},
					/**
					 * Allows LayoutData of type <code>sap.f.FlexibleColumnLayoutDataForTablet</code>
					 */
					tabletLayoutData: {type: "sap.f.FlexibleColumnLayoutDataForTablet", multiple: false, singularName: "tabletLayoutData"}
				}
			}
		});

		return FlexibleColumnLayoutData;
	});
