/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global window, document */
sap.ui.define([], function() {

	"use strict";

	/**
	 * Firefox returns null in case window.getComputedStyle() function is called where the
	 * document is loaded in an iframe with inline attribute style="display: none;"
	 * {@link https://bugzilla.mozilla.org/show_bug.cgi?id=548397}.
	 *
	 * Instead of returning null a copy of document.body.style gets returned in order to provide all functions of CSS declaration.
	 *
	 * @return {function} Copy of document.body.style
	 */
	var fnGetComputedStyleFix = function() {
		var fnGetComputedStyle = window.getComputedStyle;

		window.getComputedStyle = function(element, pseudoElt) {
			var oCSS2Style = fnGetComputedStyle.call(this, element, pseudoElt);
			if (oCSS2Style === null) {
				// Copy StyleDeclaration of document.body
				return document.body.cloneNode(false).style;
			}
			return oCSS2Style;
		};
	};

	return fnGetComputedStyleFix;
});
