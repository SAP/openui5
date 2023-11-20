/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the libraries specified in the restricted flag below must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/security/encodeXML"
], function (encodeXML) {
	"use strict";

	/**
	 * Creates highlighted text.
	 *
	 * @private
	 * @param {sap.m.Label} oItemDomRef Label within the input.
	 * @param {string} sInputValue Text to highlight
	 * @returns {string} sFormattedText Created text.
	 */
	var createHighlightedTextsWithContains = function(oItemDomRef, sInputValue) {
		// If escape function is not defined
		if (!RegExp.escape) {
			RegExp.escape = function (s) {
				return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
			};
		}
		var sText = oItemDomRef ? oItemDomRef.textContent : "",
			sFormattedText = "",
			escapedTerm = RegExp.escape(sInputValue),
			pattern  = new RegExp(escapedTerm, "gi"),
			isMatch = function(sText){
				return sText.match(new RegExp(pattern, "i"));
			};
			if (!isMatch(sText)) {
				return encodeXML(sText);
			} else {
				sFormattedText = sText.replace(pattern, function (match) {
					return '<span class="sapMInputHighlight">' + encodeXML(match) + '</span>';
				});
			}

		return sFormattedText;
	};

	/**
	 * Highlights text in DOM items.
	 *
	 * @param {Array<HTMLElement>} aItemsDomRef DOM elements on which formatting would be applied
	 * @param {string} sInputValue Text to highlight
	 * @param {int} iLimit Threshold of the items to enable highlighting. Above that limit, highlighting would be disabled due to performance reasons- DOM trashing. Default: 200
	 * @private
	 * @ui5-restricted sap.m, sap.ui.comp, sap.fe
	 */
	var highlightedTextsWithContains = function (aItemsDomRef, sInputValue, iLimit) {
		var i, highlightedTexts;

		iLimit = iLimit || 200;

		if (!sInputValue || // No input value
			(!aItemsDomRef && !aItemsDomRef.length) ||
			// Performance optimisation. This module causes inevitable DOM thrashing.
			// We need to limit that thrashing, so when the limit is hit, highlighting would be entirely disabled.
			aItemsDomRef.length > iLimit) {
			return;
		}

		highlightedTexts = [];

		for (i = 0; i < aItemsDomRef.length; i++) {
			highlightedTexts.push(createHighlightedTextsWithContains(aItemsDomRef[i], sInputValue));
		}

		for (i = 0; i < aItemsDomRef.length; i++) {
			aItemsDomRef[i].innerHTML = highlightedTexts[i];
		}
	};

	return highlightedTextsWithContains;
});