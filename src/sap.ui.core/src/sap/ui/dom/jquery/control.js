/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery', 'jquery.sap.global', 'sap/ui/Global'],
	function(jQuery) {
	"use strict";

	/*
	 * Extension function to the jQuery.fn which identifies SAPUI5 controls in the given jQuery context.
	 *
	 * @param {int} [iIndex] Optional parameter to return the control instance at the given index in the array.
	 * @param {boolean} [bIncludeRelated] Whether or not to respect the associated DOM elements to a control via <code>data-sap-ui-related</code> attribute.
	 * @returns {sap.ui.core.Control[] | sap.ui.core.Control | null} Depending on the given context and index parameter an array of controls, an instance or null.
	 * @name jQuery#control
	 * @function
	 * @private
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