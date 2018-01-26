/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	// @evo-todo model the jquery dependency correctly
	jQuery = jQuery || window.jQuery;


	jQuery.fn.extend( /** @lends jQuery.prototype */ {

		/**
		 * Disable HTML elements selection.
		 *
		 * @return {jQuery} <code>this</code> to allow method chaining.
		 * @private
		 * @since 1.24.0
		 */
		disableSelection: function() {
			return this.on((jQuery.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function(oEvent) {
				oEvent.preventDefault();
			});
		},

		/**
		 * Enable HTML elements to get selected.
		 *
		 * @return {jQuery} <code>this</code> to allow method chaining.
		 * @private
		 * @since 1.24.0
		 */
		enableSelection: function() {
			return this.off(".ui-disableSelection");
		}
	});

	return jQuery;

});

