/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/*
	 * Disable HTML elements selection.
	 *
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @private
	 */
	jQuery.fn.disableSelection = function() {
		return this.on(("onselectstart" in document.createElement("div") ? "selectstart" : "mousedown") + ".ui-disableSelection", function(oEvent) {
			oEvent.preventDefault();
		});
	};

	/*
	 * Enable HTML elements to get selected.
	 *
	 * @return {jQuery} <code>this</code> to allow method chaining.
	 * @private
	 */
	jQuery.fn.enableSelection = function() {
		return this.off(".ui-disableSelection");
	};

	return jQuery;

});

