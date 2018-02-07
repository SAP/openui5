/*!
 * ${copyright}
 */

// Provides functionality for activity detection
sap.ui.define(['sap/ui/ActivityDetection', 'jquery.sap.global'],
function(ActivityDetection, jQuery) {
	"use strict";

	/**
	 * @public
	 * @name jQuery.sap.act
	 * @namespace
	 * @static
	 */
	jQuery.sap.act = ActivityDetection;

	/**
	 * Registers the given handler to the activity event, which is fired when an activity was detected after a certain period of inactivity.
	 *
	 * The Event is not fired for Internet Explorer 8.
	 *
	 * @param {Function} fnFunction The function to call, when an activity event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @protected
	 *
	 * @function
	 * @name jQuery.sap.act#attachActivate
	 */

	/**
	 * Deregisters a previously registered handler from the activity event.
	 *
	 * @param {Function} fnFunction The function to call, when an activity event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @protected
	 *
	 * @function
	 * @name jQuery.sap.act#detachActivate
	 */

	/**
	 * Checks whether recently an activity was detected.
	 *
	 * @return true if recently an activity was detected, false otherwise
	 * @protected
	 *
	 * @function
	 * @name jQuery.sap.act#isActive
	 */

	/**
	 * Reports an activity.
	 *
	 * @public
	 *
	 * @function
	 * @name jQuery.sap.act#refresh
	 */

	return jQuery;

});