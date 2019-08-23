/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/thirdparty/jquery"], function(jQuery) {
	"use strict";

	/**
	 * This module provides the following API:
	 * <ul>
	 * <li>{@link jQuery#disableSelection}</li>
	 * <li>{@link jQuery#enableSelection}</li>
	 * </ul>
	 * @namespace
	 * @name module:sap/ui/dom/jquery/Selection
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @since 1.58
	 */

	/**
	 * Disable HTML elements selection.
	 *
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @protected
	 * @requires module:sap/ui/dom/jquery/Selection
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
	 * @requires module:sap/ui/dom/jquery/Selection
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

