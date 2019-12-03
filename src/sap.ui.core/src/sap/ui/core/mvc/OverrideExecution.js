/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.CountMode
sap.ui.define(function() {
	"use strict";


	/**
	 * Execution option for overrides defined by a <code>ControllerExtension</code>.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.core.mvc.OverrideExecution
	 * @see sap.ui.core.mvc.ControllerExtension
	 */
	var OverrideExecution = {
		/**
		 * The override function gets executed after the original function
		 *
		 * @public
		 */
		After: "After",

		/**
		 * The override function gets executed before the original function
		 * @public
		 */
		Before: "Before",

		/**
		 * The override function is called instead of the original function
         *
         * This is the default option for ControllerExtension overrides
		 * @public
		 */
		Instead: "Instead"
    };

	return OverrideExecution;

}, /* bExport= */ true);
