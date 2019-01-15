/*!
 * ${copyright}
 */

// Provides element sap.f.CardItemLayoutData
sap.ui.define(['sap/ui/core/LayoutData'],
	function(LayoutData) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.f.CardItemLayoutData</code>.
		 *
		 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new element.
		 *
		 * @class
		 * Holds layout data for a CardContainer.
		 * @extends sap.ui.core.LayoutData
		 * @version ${version}
		 *
		 * @constructor
		 * @since 1.62
		 * @see {@link TODO Card}
		 * @alias sap.f.CardItemLayoutData
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var CardItemLayoutData = LayoutData.extend("sap.f.CardItemLayoutData", /** @lends sap.f.CardItemLayoutData.prototype */ {
			metadata: {

				library: "sap.f",
				properties: {
					/**
					 * Specifies the number of columns, which the item should take.
					 */
					columns: {type: "int", group: "Misc", defaultValue: 1}
				}
			}
		});

		return CardItemLayoutData;
	});
