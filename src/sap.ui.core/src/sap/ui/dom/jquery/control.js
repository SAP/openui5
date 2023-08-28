/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery', 'sap/ui/Global'],
	function(jQuery) {
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
			// @evo-todo: remove this global access (for now requiring the Core module would introduce a circular dependency)
			return sap.ui.getCore().byId(sControlId);
		});

		return aControls.get(iIndex);
	};


	return jQuery;

});