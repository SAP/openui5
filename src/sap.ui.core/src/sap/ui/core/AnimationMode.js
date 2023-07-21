/*!
 * ${copyright}
 */

// Provides type module:sap/ui/core/AnimationMode.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Enumerable list with available animation modes.
	 *
	 * This enumerable is used to validate the animation mode. Animation modes allow to specify
	 * different animation scenarios or levels. The implementation of the Control (JavaScript or CSS)
	 * has to be done differently for each animation mode.
	 *
	 * @enum {string}
	 * @alias module:sap/ui/core/AnimationMode
	 * @private
	 * @ui5-restricted sap.ui.core.Configuration
	 */
	var AnimationMode = {
		/**
		 * <code>full</code> represents a mode with unrestricted animation capabilities.
		 * @public
		 */
		full : "full",

		/**
		 * <code>basic</code> can be used for a reduced, more light-weight set of animations.
		 * @public
		 */
		basic : "basic",

		/**
		 * <code>minimal</code> includes animations of fundamental functionality.
		 * @public
		 */
		minimal : "minimal",

		/**
		 * <code>none</code> deactivates the animation completely.
		 * @public
		 */
		none : "none"
	};
	return AnimationMode;
});