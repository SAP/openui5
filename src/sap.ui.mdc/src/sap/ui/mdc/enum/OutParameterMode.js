/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines the mode of the <code>OutParameter</code> element.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.66.0
	 * @alias sap.ui.mdc.enum.OutParameterMode
	 */
	var OutParameterMode = {
		/**
		 * The value in the <code>OutParameter</code> element is always set
		 * @public
		 */
		Always: "Always",
		/**
		 * The value in the<code>OutParameter</code> element is only set if it was empty before
		 * @public
		 */
		WhenEmpty: "WhenEmpty"
	};

	return OutParameterMode;

}, /* bExport= */ true);
