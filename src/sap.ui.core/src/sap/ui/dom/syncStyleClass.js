/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/base/assert', 'sap/ui/dom/jquery/byId'], function(assert, byId) {
	"use strict";


	// @evo-todo: deal with weak dependency / lazy require
	// handle weak dependency to sap/ui/core/Control
	var _Control;

	function getControl() {
		return _Control || (_Control = sap.ui.require('sap/ui/core/Control'));
	}

	/**
	 * Search ancestors of the given source DOM element for the specified CSS class name.
	 *
	 * If the class name is found, set it to the root DOM element of the target control.
	 * If the class name is not found, it is also removed from the target DOM element.
	 *
	 * @function
	 * @param {string} sStyleClass CSS class name
	 * @param {jQuery|sap.ui.core.Control|string} vSource jQuery object, control or an id of the source element.
	 * @param {jQuery|sap.ui.core.Control} vDestination target jQuery object or a control.
	 * @return {jQuery|Element} Target element
	 * @private
	 * @exports sap/ui/dom/syncStyleClass
	 */
	var fnSyncStyleClass = function(sStyleClass, vSource, vDestination) {

		if (!sStyleClass) {
			return vDestination;
		}

		var Control = getControl();

		if (Control && vSource instanceof Control) {
			vSource = vSource.$();
		} else if (typeof vSource === "string") {
			vSource = byId(vSource);
		} else if (!(vSource instanceof jQuery)) {
			assert(false, 'sap/ui/dom/syncStyleClass(): vSource must be a jQuery object or a Control or a string');
			return vDestination;
		}

		var bClassFound = !!vSource.closest("." + sStyleClass).length;

		if (vDestination instanceof jQuery) {
			vDestination.toggleClass(sStyleClass, bClassFound);
		} else if (Control && vDestination instanceof Control) {
			vDestination.toggleStyleClass(sStyleClass, bClassFound);
		} else {
			assert(false, 'sap/ui/dom/syncStyleClass(): vDestination must be a jQuery object or a Control');
		}

		return vDestination;
	};

	return fnSyncStyleClass;

});

