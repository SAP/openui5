/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * Gets the next parent DOM element with a given attribute and attribute value starting above the first given element
	 *
	 * @param {string} sAttribute Name of the attribute
	 * @param {string} sValue Value of the attribute (optional)
	 * @return {Element} null or the DOM reference
	 * @private
	 * @author SAP SE
	 * @function
	 * @exports sap/ui/dom/jquery/parentByAttribute
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

