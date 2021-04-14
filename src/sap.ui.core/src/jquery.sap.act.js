/*!
 * ${copyright}
 */

// Provides functionality for activity detection
sap.ui.define(['sap/ui/util/ActivityDetection', 'jquery.sap.global'],
function(ActivityDetection, jQuery) {
	"use strict";

	/**
	 * @public
	 * @name jQuery.sap.act
	 * @namespace
	 * @static
	 * @deprecated since 1.58 use {@link module:sap/ui/util/ActivityDetection} instead
	 */
	jQuery.sap.act = ActivityDetection;

	/**
	 * Registers the given handler to the activity event, which is fired when an activity was detected after a certain period of inactivity.
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
