/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Applies the focus related jQuery function extensions:
	 * @see jQuery#disableSelection
	 * @see jQuery#enableSelection
	 *
	 * @namespace
	 * @alias module:sap/ui/dom/jquery/Selection
	 * @private
	 * @sap-restricted sap.ui.core
	 */

	/**
	 * Disable HTML elements selection.
	 *
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @protected
	 * @since 1.24.0
	 * @name jQuery#disableSelection
	 * @function
	 */
	jQuery.fn.disableSelection = function() {
		return this.on(("onselectstart" in document.createElement("div") ? "selectstart" : "mousedown") + ".ui-disableSelection", function(oEvent) {
			oEvent.preventDefault();
		});
	};

	/**
	 * Enable HTML elements to get selected.
	 *
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @protected
	 * @since 1.24.0
	 * @name jQuery#enableSelection
	 * @function
	 */
	jQuery.fn.enableSelection = function() {
		return this.off(".ui-disableSelection");
	};

	return jQuery;

});

