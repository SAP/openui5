/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery',
	'sap/ui/Global'
], function(jQuery) {
	"use strict";

	function fUIAreaFilter(idx){
		// @evo-todo: remove this global access (for now requiring the Core module would introduce a circular dependency)
		return sap.ui.getCore().getUIArea(this.id) != null;
	}

	function fgetUIArea(idx, odomref){
		// @evo-todo: remove this global access (for now requiring the Core module would introduce a circular dependency)
		return sap.ui.getCore().getUIArea(this.id);
	}

	/*
	 * Returns a single UIArea if an index is provided or an array of UIAreas.
	 *
	 * @param {int} iIdx Index of the UIArea
	 * @returns {Object|Array} The UIArea if an index is provided or an array of UIAreas
	 * @name jQuery#uiarea
	 * @function
	 * @private
	 */
	jQuery.fn.uiarea = function(iIdx) {
		// UIAreas need to have IDs... so reduce to those elements first
		var aUIAreas = this.slice("[id]").filter(fUIAreaFilter).map(fgetUIArea).get();
		return typeof (iIdx) === "number" ? aUIAreas[iIdx] : aUIAreas;
	};


	return jQuery;

});