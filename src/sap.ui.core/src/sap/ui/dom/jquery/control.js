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

	/**
	 * Extension function to the jQuery.fn which identifies SAPUI5 controls in the given jQuery context.
	 *
	 * @param {int} [iIndex] Optional parameter to return the control instance at the given index in the array.
	 * @param {boolean} [bIncludeRelated] Whether or not to respect the associated DOM elements to a control via <code>data-sap-ui-related</code> attribute.
	 * @returns {sap.ui.core.Control[] | sap.ui.core.Control | null} Depending on the given context and index parameter an array of controls, an instance or <code>null</code>.
	 * @name jQuery#control
	 * @function
	 * @public
	 * @requires module:sap/ui/dom/jquery/control
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