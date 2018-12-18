/*!
 * ${copyright}
 */
//Provides class sap.ui.core.util.PasteHelper - a utility for converting data pasted from clipboard into a two-dimensional string array
sap.ui.define([ "sap/base/util/ObjectPath"],
	function(ObjectPath) {
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
	 * @param {object} oEvent paste event of the web browser. It contains the clipboard data in the following export
	 * format: cells are separated by tab, lines by newline (\n \r and \r\n are all supported), the cells containing
	 * newlines are wrapped in double quotes (with existing double-quotes being escaped by doubling them).
	 * @returns {Array} Returns two dimensional array containing the pasted data. If a single value is pasted (no grid data), this value will still be in an array that is inside another array.
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

	/**
	 * Validates the data from a two-dimensional array against UI5 CORE and UI5 EDM types using ColumnInfo object, that
	 * provides column information such as property name and corresponding data type as it is expected in the U5 Table,
	 * and returns parsed data in a case of successful validation and error information in a case the validation has failed.
	 *
	 * Example of the result object after the successful validation - the data array is available, and error object is empty:
	 * <pre>
	 *   oResult = {
	 *     parsedData: [
	 *       {name: "/firstName", age: "/age"},
	 *       {name: "myModel2>/firstName", age: "myModel2>/age"}
	 *     ],
	 *     errors: null
	 *   });
	 * </pre>
	 *	Example of the result object after the failed validation - error information is available , and the data array is empty:
	 * <pre>
	 *   oResult = {
	 *     parsedData: null,
	 *	   errors: [
	 *		 {row: 2 , column: 3, property: "age", value: "blub", type:"sap.ui.model.odata.type.Byte",
	 *     	  message: "Value "blub" in row 2 and column 2 could not be parsed as sap.ui.model.odata.type.Byte"}
	 *     ]
	 *   });
	 * </pre>
	 * @param {array} aData Two dimensional array containing the pasted data.
	 * @param {array} aColumnInfo Contains information for each column such as property name and the type of this property.
	 * 					Use <code>ignore: true</code> for read only columns or for all other columns that should not be pasted into UI5 Table.
	 *				  Example:
	 *					<pre>
	 *						var aColumnsInfo = [
	 *							{
	 *								property: "name",
	 *								type: "sap.ui.model.type.String"
	 *							},
	 *							{
	 *								property: "age",
	 *								type: "sap.ui.model.odata.type.Byte"
	 *							},
	 *							{
	 *								ignore: true
	 *							}
	 *						];
	 * 					</pre>
	 * @returns {object} Result result object that contains parsed data if the validation was successful(in this case
	 * 					 errors array has value <code>null</code>) and all collected errors if the validation failed (in
	 * 					 this case data array has value <code>null</code>).
	 */
	PasteHelper.validate = function(aData, aColumnInfo) {
		var oResult = {parsedData: null,
						errors: null};

		// Validate input Data
		if (!aData) {
			throw new Error("Parameter aData is not specified");
		}

		// Validate columns information
		if (aColumnInfo) {
			for ( var i = 0; i < aColumnInfo.length; i++) {
				var oColumnInfo = aColumnInfo[i]; // that should be only visible columns

				// Ignore columns and go to the next
				if (aColumnInfo.ignore){
					continue;
				}

				if (oColumnInfo.property) {
					// Check with Andreas async functionality instead of parseValue, after this create oType only once pro data type
					if (oColumnInfo.type) {
						var oType = ObjectPath.get(oColumnInfo.type);
						if (oType) {
							oColumnInfo.typeInstance = new oType();
						} else {
							// Exception for the application developers - type not foung in UI5 core and odata types
							throw new Error("Data type " + oColumnInfo.type + " is not available");
						}
					} else {
						// Exception for the application developers - the definition of the type is missing
						throw new Error("Missing ColumnInfo.type for column " + (i + 1) + ". Check the application calling PasteHelper.validate(aData, aColumnInfo) and specify the missing type in the parameter aColumnInfo.");
					}
				} else {
					// Exception for the application developers - the name of property is missing
					throw new Error("Missing ColumnInfo.property for column " + (i + 1) + ". Check the application calling PasteHelper.validate(aData, aColumnInfo) and specify the missing property in the parameter aColumnInfo.");
				}
			}
		} else {
			throw new Error("Missing parameter aColumnInfo"); //Check -  missing param standard exception?
		}

		var aErrors = [], aParsedData = [];
		for (var i = 0; i < aData.length; i++) {
			var aRowData = aData[i];
			var oParsedRow = PasteHelper._validateRow(aRowData, aColumnInfo, i, aErrors);
			aParsedData.push(oParsedRow);
		}
		if (aErrors.length > 0) {
			oResult.parsedData = null;
			oResult.errors = aErrors;
		} else {
			oResult.parsedData = aParsedData;
			oResult.errors = null;
		}

		return oResult;
	};

	/**
	 * Returns validation result object for one row that contains an array of validated values. And it may additionally
	 * add errors to the given error array.
	 *
	 * @param {array} aRowData Contains data for one row.
	 * @param {array} aColumnInfo Provides information about the corresponding property name and expected for it type.
	 * @param {int} iRowIndex Index of the row.
	 * @param {array} aErrors Information about row and column number where the validation error occurs, value and the type that is expected.
	 * @returns {object} Returns result object for one row with array of values that have been passing the type validation successfully.
	 * @private
	 */
	PasteHelper._validateRow = function(aRowData, aColumnInfo, iRowIndex, aErrors) {

		var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
			oObject = {},
			oError = {};

		for (var i = 0; i < aRowData.length; i++) {

			var oColumnInfo = aColumnInfo[i]; // that should be only visible columns
			// Ignore columns and go to the next
			if (aColumnInfo.ignore){
				continue;
			}

			var sCellData = aRowData[i];
			try {
				if (oColumnInfo.typeInstance) {
						// Check parseValue if it gets to be async
						sCellData = (oColumnInfo.typeInstance).parseValue(sCellData, "string");
					}
				} catch (e) {
					// Build error object for single cell
					var oError = {
						row : iRowIndex + 1,
						column : i + 1,
						property : oColumnInfo.property,
						value : sCellData,
						type : oColumnInfo.type,
						message : oBundle.getText("PasteHelper.ErrorMessage", [sCellData, iRowIndex + 1, i + 1,oColumnInfo.type]) //"Value '" + sCellData + "' in row " + (iRowIndex + 1) + " and column " + (i + 1) + " could not be parsed as " + oColumnInfo.type
					};

					aErrors.push(oError);
					sCellData = null;
				}
			// Set the current data property - this enforces an empty value when parsing failed
			oObject[oColumnInfo.property] = sCellData;
		}
		return oObject;
	};
	return PasteHelper;
});
