/*!
 * ${copyright}
 */
//Provides class sap.ui.core.util.PasteHelper - a utility for converting data pasted from clipboard into a two-dimensional string array
sap.ui.define([], function () {
	"use strict";

	/**
	 * A utility for converting data pasted from clipboard into a two-dimensional string array.
	 *
	 * @class Class to parse data pasted from the clipboard on "paste" event. Used for importing from Spreadsheets to UI5 Tables.
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted sap.ui.table.Table, sap.m.Table
	 * @alias sap.ui.core.util.PasteHelper
	 */

	var PasteHelper = {};

	/**
	 * Parses the clipboard data in a paste event and converts this data to a two-dimensional array that
	 * can be used further in UI5 Controls, for example for importing data from Spreadsheets to UI5 Tables.
	 *
	 * @param {object} [oEvent] paste event of the web browser. It contains the clipboard data in the following export
	 * format: cells are separated by tab, lines by newline (\n \r and \r\n are all supported), the cells containing
	 * newlines are wrapped in double quotes (with existing double-quotes being escaped by doubling them).
	 * @returns {Array} two dimensional array containing the pasted data. If a single value is pasted (no grid data), this value will still be in an array that is inside another array.
	 */
	PasteHelper.getPastedDataAs2DArray = function(oEvent) {
		var oClipboardData = oEvent.clipboardData; // Chrome, Firefox
		if (!oClipboardData) {
			oClipboardData = window.clipboardData; // IE11
		}

		// Placeholder for temporary replacement of the cells with multiple lines
		var rPlaceHolder = /sapui5Placeholder4MultiLine/g;
		var sPlaceHolder = rPlaceHolder.source;
		var rDoubleQuotes = /""/g;

		// Variables for containing the input data and the end-result.
		var sData, aData, sRow, aResult = [];

		if (oClipboardData) {
			// Data directly from clipboard with all special characters as in Spreadsheet/Excel
			sData = oClipboardData.getData('Text');
			// Array of the taken out cells with multiple lines
			var aCuts = [];
			// Flag - true if a multi-line cell is found
			var bMultiLineCellFound = false;
			// Index of the " that shows at multi-lines inside of one cell
			var index1 = sData.indexOf("\""),
			index2 = -1;
			var cNextChar, cPrevChar;

			while (index1 > -1) {
				// Identify if there are cells with multiple lines
				cPrevChar = sData.charAt(index1 - 1);
				// If the opening quotation mark comes after the new line, tab, return or it is the first char
				// in the first cell - then look for the closing quotation mark
				if ((index1 === 0) || (cPrevChar === '\n') || (cPrevChar === '\t') || (cPrevChar === '\r')) {
					index2 = sData.indexOf("\"", index1 + 1);
					if (index2 > -1) { // if at least one second " exists
						//Check if the found at position index2 quotation mark is closing one or belongs to the data
						cNextChar = sData.charAt(index2 + 1);
						while ((index2 > -1) && (cNextChar === '\"')) {
							// It is " around the customer data - jump to the next
							index2 = sData.indexOf("\"", index2 + 2);
							cNextChar = sData.charAt(index2 + 1);
						}

						// The closing quotation mark must be front of new line, tab, CReturn or to be the last char of the whole data
						if ((cNextChar === '\n') || (cNextChar === '\t') || (cNextChar === '') || (cNextChar === '\r')) {
							var sMultiLineCell = sData.substring(index1 + 1, index2);
							sData = sData.replace("\"" + sMultiLineCell + "\"", sPlaceHolder);
							// remove one of duplicated "" as it is only internal copy format of the excel
							sMultiLineCell = sMultiLineCell.replace(rDoubleQuotes, "\"");
							aCuts.push(sMultiLineCell);
							// Search for the next multi-line cell
							index1 = sData.indexOf("\"", index1 + sPlaceHolder.length + 1);
							bMultiLineCellFound = true;
						}
					}
				}

				if (!bMultiLineCellFound) {
					index1 = sData.indexOf("\"", index1 + 1);
				}
				bMultiLineCellFound = false;
			}

			aData = sData.split(/\r\n|\r|\n/);

			var j = 0;
			// Function that gives the next entry from the array of the cut off multi-line cells.
			var fnGetReplacement = function() {
				return aCuts[j++];
			};

			for (var i = 0; i < aData.length; i++) { // parse string into two-dimensional array
				sRow = aData[i];
				if (aCuts.length > 0) {
					sRow = sRow.replace(rPlaceHolder, fnGetReplacement);
				}
				if (sRow.length || i < aData.length - 1) { // there's always an empty row appended
					aResult.push(sRow.split("\t"));
				}
			}
		}
		// result: two-dimensional array containing the data
		return aResult;
	};

	return PasteHelper;
});