/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/LayoutData",
	"sap/ui/layout/library"
], function(LayoutData) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.ui.layout.cssgrid.GridItemLayoutData</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element.
	 *
	 * @class
	 * Holds layout data for a grid item.
	 *
	 * @extends sap.ui.core.LayoutData
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.GridItemLayoutData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GridItemLayoutData = LayoutData.extend("sap.ui.layout.cssgrid.GridItemLayoutData", { metadata: {
		library: "sap.ui.layout",
		properties: {

			/**
			 * Sets the value for the CSS display:grid item property grid-column-start
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start}
			 */
			gridColumnStart: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-column-end
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end}
			 */
			gridColumnEnd: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row-start
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start}
			 */
			gridRowStart: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row-end
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end}
			 */
			gridRowEnd: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-column
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column}
			 */
			gridColumn: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row}
			 */
			gridRow: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: ""}
		}
	}});

	return GridItemLayoutData;
});