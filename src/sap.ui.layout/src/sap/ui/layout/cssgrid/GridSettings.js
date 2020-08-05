/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/layout/library"
], function (ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new GridSettings.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Holds a set of CSS display:grid properties
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @since 1.60
	 * @constructor
	 * @public
	 * @alias sap.ui.layout.cssgrid.GridSettings
	 * @ui5-metamodel This simple type will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridSettings = ManagedObject.extend("sap.ui.layout.cssgrid.GridSettings", {
		metadata: {
			library: "sap.ui.layout",
			properties: {

				/**
				 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns MDN web docs: grid-template-columns}
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 */
				gridTemplateColumns: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows MDN web docs: grid-template-rows}
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 */
				gridTemplateRows: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-gap MDN web docs: grid-row-gap}
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 */
				gridRowGap: { type: "sap.ui.core.CSSSize", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-gap MDN web docs: grid-column-gap}
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 */
				gridColumnGap: { type: "sap.ui.core.CSSSize", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-gap MDN web docs: grid-gap}
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 */
				gridGap: { type: "sap.ui.layout.cssgrid.CSSGridGapShortHand", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows MDN web docs: grid-auto-rows}
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 */
				gridAutoRows: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns MDN web docs: grid-auto-columns}
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 */
				gridAutoColumns: { type: "sap.ui.layout.cssgrid.CSSGridTrack", defaultValue: "" },

				/**
				 * Sets the value for the CSS display:grid property {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow MDN web docs: grid-auto-flow}
				 *
				 * <b>Note:</b> Not supported in IE11, Edge 15.
				 */
				gridAutoFlow: { type: "sap.ui.layout.cssgrid.CSSGridAutoFlow", defaultValue: "Row" }
			}
		}
	});

	return GridSettings;
});