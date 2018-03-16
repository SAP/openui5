/*!
 * ${copyright}
 */

// A bridge between the jQuery.sap plugin and the SAPUI5 Core
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dom/jquery/control',
	'sap/ui/dom/jquery/root',
	'sap/ui/dom/jquery/sapui',
	'sap/ui/dom/jquery/uiarea'
	/* cyclic: 'sap/ui/core/Core' */
], function(jQuery) {
	"use strict";

	/**
	 * Extension function to the jQuery.fn which identifies SAPUI5 controls in the given jQuery context.
	 *
	 * @param {int} [iIndex] Optional parameter to return the control instance at the given index in the array.
	 * @returns {sap.ui.core.Control[] | sap.ui.core.Control | null} Depending on the given context and index parameter an array of controls, an instance or null.
	 * @name jQuery#control
	 * @function
	 * @public
	 */

	/**
	 * @param {object} oRootControl The root control
	 * @returns {jQuery} Returns itself
	 * @name jQuery#root
	 * @function
	 * @public
	 */

	/**
	 * Returns a single UIArea if an index is provided or an array of UIAreas.
	 *
	 * @param {int} iIdx Index of the UIArea
	 * @returns {Object|Array} The UIArea if an index is provided or an array of UIAreas
	 * @name jQuery#uiarea
	 * @function
	 * @public
	 */

	return jQuery;
});
