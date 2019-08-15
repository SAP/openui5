/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Handles dynamic style changes of items when sap.ui.layout.cssgrid.GridBoxLayout is used.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @constructor
	 */
	var GridBoxLayoutStyleHelper = {};

	GridBoxLayoutStyleHelper._mInstanceStyles = {};

	/**
	 * Creates a CSS style to override the height of all items.
	 *
	 * @param {string} sId The id of the control.
	 * @param {number} iMaxHeight The height to set.
	 */
	GridBoxLayoutStyleHelper.setItemHeight = function (sId, iMaxHeight) {
		var sClassStyle = "#" + sId + ".sapUiLayoutCSSGridBoxLayoutFlattenHeight ul .sapMLIB:not(.sapMGHLI) { height: " + iMaxHeight + "px; }";

		if (this._mInstanceStyles[sId] !== sClassStyle) {
			this._mInstanceStyles[sId] = sClassStyle;
			this._reapplyStyles();
		}
	};

	GridBoxLayoutStyleHelper._getStyleHelper = function () {
		var oHelper = document.getElementById("sapUiLayoutCSSGridGridBoxLayoutStyleHelper");
		if (!oHelper) {
			oHelper = document.createElement("style");
			oHelper.id = "sapUiLayoutCSSGridGridBoxLayoutStyleHelper";
			oHelper.type = "text/css";
			document.getElementsByTagName("head")[0].appendChild(oHelper);
		}
		return oHelper;
	};

	GridBoxLayoutStyleHelper._reapplyStyles = function () {
		var sStyle = "",
			oHelper = this._getStyleHelper();

		for (var sKey in this._mInstanceStyles) {
			sStyle += this._mInstanceStyles[sKey] + "\n";
		}

		oHelper.innerHTML = sStyle;
	};

	return GridBoxLayoutStyleHelper;
});
