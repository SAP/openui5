/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery', 'sap/ui/core/Element', 'sap/ui/Global'],
	function(jQuery, Element) {
	"use strict";

	/**
	 * This module provides the {@link jQuery#control} API.
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/control
	 * @public
	 * @since 1.58
	 */

	jQuery.fn.control = function(iIndex, bIncludeRelated) {
		var aControls = this.map(function() {
			var sControlId;
			if (bIncludeRelated) {
				var $Closest = jQuery(this).closest("[data-sap-ui],[data-sap-ui-related]");
				sControlId = $Closest.attr("data-sap-ui-related") || $Closest.attr("id");
			} else {
				sControlId = jQuery(this).closest("[data-sap-ui]").attr("id");
			}
			return Element.getElementById(sControlId);
		});

		return aControls.get(iIndex);
	};


	return jQuery;

});