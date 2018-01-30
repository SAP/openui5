/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery',
	'./uiarea',
	'./control',
	'jquery.sap.global',
	'sap/ui/Global'
], function(jQuery, uiarea, control) {
	"use strict";

	function fgetUIAreaOfCtrl(oCtrl, idx){
		return oCtrl.getUIArea().getInterface();
	}

	/*
	 * @param {object} oRootControl The root control
	 * @name jQuery#root
	 * @returns {jQuery.fn} Returns itself
	 * @function
	 * @private
	 */
	jQuery.fn.root = function(oRootControl) {
		// handle 'setRoot'
		if (oRootControl) {
			// @evo-todo: remove this global access (for now requiring the Core module would introduce a circular dependency)
			sap.ui.getCore().setRoot(this.get(0), oRootControl);
			return this;
		}
		// and 'getRoot' behavior.
		// requires control dependency
		var aControls = this.control();
		if (aControls.length > 0) {
			return aControls.map(fgetUIAreaOfCtrl);
		}

		// requires uiarea dependency
		var aUIAreas = this.uiarea();

		if (aUIAreas.length > 0) {
			// we have UIAreas
			return aUIAreas;
		}

		// create UIAreas
		this.each(function(idx){
			// @evo-todo: remove this global access (for now requiring the Core module would introduce a circular dependency)
			sap.ui.getCore().createUIArea(this);
		});
		return this;
	};


	return jQuery;

});