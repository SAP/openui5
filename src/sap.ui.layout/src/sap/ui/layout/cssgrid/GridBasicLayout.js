/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/layout/cssgrid/GridLayoutBase",
	"sap/ui/layout/cssgrid/GridSettings",
	"sap/ui/layout/library"
], function (GridLayoutBase, GridSettings) {
	"use strict";

	/**
	 * Constructor for a new GridBasicLayout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Applies a sap.ui.layout.cssgrid.GridSettings to a provided DOM element or Control.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.GridLayoutBase
	 *
	 * @since 1.60
	 * @constructor
	 * @private
	 * @alias sap.ui.layout.cssgrid.GridBasicLayout
	 */
	var GridBasicLayout = GridLayoutBase.extend("sap.ui.layout.cssgrid.GridBasicLayout", {
		metadata: {
			library: "sap.ui.layout",
			properties: {

				/**
				 * Sets the value for the CSS display:grid property grid-template-columns
				 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns}
				 */
				gridTemplateColumns: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property grid-template-rows
				 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows}
				 */
				gridTemplateRows: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property grid-row-gap
				 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-gap}
				 */
				gridRowGap: { type: "sap.ui.core.CSSSize", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property grid-column-gap
				 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-gap}
				 */
				gridColumnGap: { type: "sap.ui.core.CSSSize", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property grid-gap
				 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-gap}
				 */
				gridGap: { type: "sap.ui.layout.cssgrid.CSSGridGapShortHand", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property grid-auto-rows
				 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows}
				 */
				gridAutoRows: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property grid-auto-columns
				 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns}
				 */
				gridAutoColumns: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property grid-auto-flow
				 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow}
				 */
				gridAutoFlow: { type: "sap.ui.layout.cssgrid.CSSGridAutoFlow", defaultValue: "Row" }
			}
		}
	});

	/**
	 * Provides active settings for the <code>CSSGrid</code>.
	 *
	 * @returns {sap.ui.layout.cssgrid.GridSettings} GridBasicLayout The active GridSettings
	 * @override
	 */
	GridBasicLayout.prototype.getActiveGridSettings = function () {
		return new GridSettings({
			gridTemplateColumns: this.getGridTemplateColumns(),
			gridTemplateRows: this.getGridTemplateRows(),
			gridRowGap: this.getGridRowGap(),
			gridColumnGap: this.getGridColumnGap(),
			gridGap: this.getGridGap(),
			gridAutoRows: this.getGridAutoRows(),
			gridAutoColumns: this.getGridAutoColumns(),
			gridAutoFlow: this.getGridAutoFlow()
		});
	};

	return GridBasicLayout;
});