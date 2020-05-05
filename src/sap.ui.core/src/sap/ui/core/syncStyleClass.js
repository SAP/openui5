/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/jquery', 'sap/ui/base/Object', 'sap/base/assert'], function(jQuery, BaseObject, assert) {
	"use strict";

	/**
	 * Search ancestors of the given source DOM element for the specified CSS class name.
	 *
	 * If the class name is found, set it to the root DOM element of the target control.
	 * If the class name is not found, it is also removed from the target DOM element.
	 *
	 * @function
	 * @since 1.58
	 * @param {string} sStyleClass CSS class name
	 * @param {jQuery|sap.ui.core.Control|string} vSource jQuery object, control or an id of the source element.
	 * @param {jQuery|sap.ui.core.Control} vDestination target jQuery object or a control.
	 * @return {jQuery|Element} Target element
	 * @public
	 * @alias module:sap/ui/core/syncStyleClass
	 */
	var fnSyncStyleClass = function(sStyleClass, vSource, vDestination) {

		if (!sStyleClass) {
			return vDestination;
		}


		if (BaseObject.isA(vSource, 'sap.ui.core.Control')) {
			vSource = vSource.$();
		} else if (typeof vSource === "string") {
			vSource = jQuery(document.getElementById(vSource));
		} else if (!(vSource instanceof jQuery)) {
			assert(false, 'sap/ui/core/syncStyleClass(): vSource must be a jQuery object or a Control or a string');
			return vDestination;
		}

		var bClassFound = !!vSource.closest("." + sStyleClass).length;

		if (vDestination instanceof jQuery) {
			vDestination.toggleClass(sStyleClass, bClassFound);
		} else if (BaseObject.isA(vDestination, 'sap.ui.core.Control')) {
			vDestination.toggleStyleClass(sStyleClass, bClassFound);
		} else {
			assert(false, 'sap/ui/core/syncStyleClass(): vDestination must be a jQuery object or a Control');
		}

		return vDestination;
	};

	return fnSyncStyleClass;

});