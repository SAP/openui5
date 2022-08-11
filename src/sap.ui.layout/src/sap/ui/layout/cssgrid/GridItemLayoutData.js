/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/LayoutData",
	"sap/ui/layout/library"
], function(LayoutData) {
	"use strict";

	var mGridItemProperties = {
		gridColumnStart: "grid-column-start",
		gridColumnEnd: "grid-column-end",
		gridRowStart: "grid-row-start",
		gridRowEnd: "grid-row-end",
		gridColumn: "grid-column",
		gridRow: "grid-row"
	};

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
	 */
	var GridItemLayoutData = LayoutData.extend("sap.ui.layout.cssgrid.GridItemLayoutData", { metadata: {
		library: "sap.ui.layout",
		interfaces: [
			"sap.ui.layout.cssgrid.IGridItemLayoutData"
		],
		properties: {

			/**
			 * Sets the value for the CSS display:grid item property grid-column-start
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start MDN web docs: grid-column-start}
			 */
			gridColumnStart: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-column-end
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end MDN web docs: grid-column-end}
			 */
			gridColumnEnd: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row-start
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start MDN web docs: grid-row-start}
			 */
			gridRowStart: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row-end
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end MDN web docs: grid-row-end}
			 */
			gridRowEnd: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-column
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column MDN web docs: grid-column}
			 */
			gridColumn: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: "" },

			/**
			 * Sets the value for the CSS display:grid item property grid-row
			 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row MDN web docs: grid-row}
			 */
			gridRow: { type: "sap.ui.layout.cssgrid.CSSGridLine", defaultValue: ""}
		}
	}});

	/**
	 * Updates the display:grid styles of a single item
	 *
	 * @private
	 * @param {sap.ui.core.Control} oItem The item which styles have to be updated
	 */
	GridItemLayoutData.prototype.setItemStyles = function (oItem) {
		if (!oItem) {
			return;
		}

		var oProperties = this.getMetadata().getProperties();
		for (var sProp in mGridItemProperties) {
			if (oProperties[sProp]) {
				var sPropValue = this.getProperty(sProp);

				if (typeof sPropValue !== "undefined") {
					GridItemLayoutData._setItemStyle(oItem, mGridItemProperties[sProp], sPropValue);
				}
			}
		}
	};

	/**
	 * Remove all grid properties from the item
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} oItemDom The Item DOM reference
	 */
	GridItemLayoutData.removeItemStyles = function (oItemDom) {
		for (var sProp in mGridItemProperties) {
			oItemDom.style.removeProperty(mGridItemProperties[sProp]);
		}
	};

	/**
	 * Sets a property on the DOM element
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} oItemDom The item DOM reference
	 * @param {string} sProperty The name of the property to set
	 * @param {string} sValue The value of the property to set
	 */
	GridItemLayoutData._setItemStyle = function (oItemDom, sProperty, sValue) {
		if (sValue !== "0" && !sValue) {
			oItemDom.style.removeProperty(sProperty);
		} else {
			oItemDom.style.setProperty(sProperty, sValue);
		}
	};

	return GridItemLayoutData;
});