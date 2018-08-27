/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * This module provides the {@link jQuery#parentByAttribute} API.
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/parentByAttribute
	 * @public
	 * @since 1.58
	 */

	/**
	 * Gets the next parent DOM element with a given attribute and attribute value starting above the first given element
	 *
	 * @param {string} sAttribute Name of the attribute
	 * @param {string} sValue Value of the attribute (optional)
	 * @return {Element} null or the DOM reference
	 * @public
	 * @name jQuery#parentByAttribute
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/parentByAttribute
	 */
	var fnParentByAttribute = function parentByAttribute(sAttribute, sValue) {
		if (this.length > 0) {
			if (sValue) {
				return this.first().parents("[" + sAttribute + "='" + sValue + "']").get(0);
			} else {
				return this.first().parents("[" + sAttribute + "]").get(0);
			}
		}
	};

	jQuery.fn.parentByAttribute = fnParentByAttribute;

	return jQuery;

});

