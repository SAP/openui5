/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/isHidden"
], function(jQuery, isHidden) {
	"use strict";

	/*
	 * Searches for a descendant of the given node that is an Element which is focusable, visible, and editable.
	 *
	 * @param {Element} oContainer Node to search for a focusable descendant
	 * @returns {Element|null} Element node that is focusable, visible and editable or null
	 * @private
	 */
	function findEditableInput(oContainer, bIncludeReadOnly) {
		var sNotInclude = 'textarea[readonly],input[type=hidden],input[type=button],input[type=submit],input[type=reset],input[type=image],button',
			sFilter = ':enabled:visible:first';

		if (bIncludeReadOnly) {
			return jQuery(oContainer).find('input, textarea')
			.not(sNotInclude)
			.filter(sFilter)[0];

		} else {
			return jQuery(oContainer).find('input, textarea')
			.not('input[readonly],' + sNotInclude)
			.filter(sFilter)[0];
		}

	}

	/*
	 * Returns a descendant of the given node that is an Element which is focusable, visible, editable and not hidden.
	 *
	 * @param {Element} oContainer Node to search for a focusable descendant
	 * @param {object} [oConfig] The configuration of the parameter for including readOnly inputs
	 * @returns {Element|null} Element node that is focusable, visible and editable or null
	 * @alias module:sap/ui/dom/getFirstEditableInput
	 * @since 1.72
	 * @private
	 * @ui5-restricted
	 */
	function getFirstEditableInput(oContainer, oConfig) {
		var bIncludeReadOnly;

		if ( !oContainer || isHidden(oContainer) ) {
			return null;
		}

		if (oConfig) {
			bIncludeReadOnly = oConfig.includeReadOnly;
		}

		return findEditableInput(oContainer, bIncludeReadOnly);
	}

	return getFirstEditableInput;

});

