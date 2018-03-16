/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/base/assert'], function(assert) {
	"use strict";

	function getRootFontSize() {
		var oRootDomRef = document.documentElement;

		if (!oRootDomRef) {
			return 16; // browser default font size
		}

		return parseFloat(window.getComputedStyle(oRootDomRef).getPropertyValue("font-size"));
	}

	/**
	 * @exports sap/ui/dom/units/Rem
	 * @private
	 */
	var Rem = {

		/**
		 * Convert <code>px</code> values to <code>rem</code>.
		 *
		 * @param {string|float} vPx The value in <code>px</code> units. E.g.: <code>"16px"</code> or <code>16</code>
		 * @returns {float} The converted value in <code>rem</code> units. E.g.: <code>1</code>
		 * @private
		 */
		fromPx: function(vPx) {
			assert(((typeof vPx === "string") && (vPx !== "") && !isNaN(parseFloat(vPx)) && (typeof parseFloat(vPx) === "number")) || ((typeof vPx === "number") && !isNaN(vPx)), 'Rem.fromPx: either the "vPx" parameter must be an integer, or a string e.g.: "16px"');
			return parseFloat(vPx) / getRootFontSize();
		},

		/**
		 * Convert <code>rem</code> values to <code>px</code>.
		 *
		 * @param {string|float} vRem The value in <code>rem</code>. E.g.: <code>"1rem"</code> or <code>1</code>
		 * @returns {float} The converted value in <code>px</code> units. E.g.: <code>16</code>
		 * @private
		 */
		toPx: function(vRem) {
			assert(((typeof vRem === "string") && (vRem !== "") && !isNaN(parseFloat(vRem)) && (typeof parseFloat(vRem) === "number")) || ((typeof vRem === "number") && !isNaN(vRem)), 'Rem.toPx: either the "vRem" parameter must be an integer, or a string e.g.: "1rem"');
			return parseFloat(vRem) * getRootFontSize();
		}
	};

	return Rem;

});

