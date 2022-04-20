/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/inputUtils/wordStartsWithValue",
	"sap/base/security/encodeXML"
], function (wordStartsWithValue, encodeXML) {
	"use strict";

	/**
	 * Creates highlighted text.
	 *
	 * @private
	 * @param {sap.m.Label} oItemDomRef Label within the input.
	 * @param {string} sInputValue Text to highlight
	 * @param {boolean} bWordMode Whether to highlight single string or to highlight each string that starts with space + sInputValue
	 * @returns {string} newText Created text.
	 */
	var _createHighlightedText = function (oItemDomRef, sInputValue, bWordMode) {
		var sDomRefLowerText, iStartHighlightingIndex, iInputLength, iNextSpaceIndex, sChunk,
			sText = oItemDomRef ? oItemDomRef.textContent : "",
			sFormattedText = "";

		if (!wordStartsWithValue(sText, sInputValue)) {
			return encodeXML(sText);
		}

		sInputValue = sInputValue.toLowerCase();
		iInputLength = sInputValue.length;

		while (wordStartsWithValue(sText, sInputValue)) {
			sDomRefLowerText = sText.toLowerCase();
			iStartHighlightingIndex = sDomRefLowerText.indexOf(sInputValue);
			// search for the first word which starts with these characters
			iStartHighlightingIndex = (iStartHighlightingIndex > 0) ?
				sDomRefLowerText.indexOf(' ' + sInputValue) + 1 : iStartHighlightingIndex;


			// Chunk before highlighting
			sChunk = sText.substring(0, iStartHighlightingIndex);
			sText = sText.substring(iStartHighlightingIndex);
			sFormattedText += encodeXML(sChunk);

			// Highlighting chunk
			sChunk = sText.substring(0, iInputLength);
			sText = sText.substring(iInputLength);
			sFormattedText += '<span class="sapMInputHighlight">' + encodeXML(sChunk) + '</span>';


			// Check for repetitive patterns. For example: "prodProdProd prod" should highlight only
			// the starting of every word, but not the whole string when tested with "prod" input.
			iNextSpaceIndex = sText.indexOf(" ");
			iNextSpaceIndex = iNextSpaceIndex === -1 ? sText.length : iNextSpaceIndex;

			// The rest
			sChunk = sText.substring(0, iNextSpaceIndex);
			sText = sText.substring(iNextSpaceIndex);
			sFormattedText += encodeXML(sChunk);

			// Run only for the first occurrence when highlighting for the Input for example
			if (!bWordMode) {
				break;
			}
		}

		if (sText) {
			sFormattedText += encodeXML(sText);
		}

		return sFormattedText;
	};

	/**
	 * Highlights text in DOM items.
	 *
	 * @param {Array<HTMLElement>} aItemsDomRef DOM elements on which formatting would be applied
	 * @param {string} sInputValue Text to highlight
	 * @param {boolean} bWordMode Whether to highlight single string or to highlight each string that starts with space + sInputValue
	 * @param {int} iLimit Threshold of the items to enable highlighting. Above that limit, highlighting would be disabled due to performance reasons- DOM trashing. Default: 200
	 * @ui5-restricted UI5 Controls, Smart Controls, Fiori Elements
	 */
	var highlightItems = function (aItemsDomRef, sInputValue, bWordMode, iLimit) {
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
			highlightedTexts.push(_createHighlightedText(aItemsDomRef[i], sInputValue, bWordMode));
		}

		for (i = 0; i < aItemsDomRef.length; i++) {
			aItemsDomRef[i].innerHTML = highlightedTexts[i];
		}
	};

	return highlightItems;
});