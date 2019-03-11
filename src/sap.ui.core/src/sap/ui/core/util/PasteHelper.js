/*!
 * ${copyright}
 */
//Provides class sap.ui.core.util.PasteHelper - a utility for converting and validating data pasted from clipboard.
sap.ui.define([ "sap/base/util/ObjectPath"],
	function(ObjectPath) {
		"use strict";

	/**
	 * A utility for converting and validating data pasted from the clipboard. This utility is used for importing data
	 * from spreadsheets to SAPUI5 tables.
	 *
	 * @class Parses and validates data on the <code>paste</code> event of an SAPUI5 table.
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted sap.ui.table.Table, sap.m.Table
	 * @alias sap.ui.core.util.PasteHelper
	 */

	var PasteHelper = {};

	/**
	 * Parses the clipboard data from the <code>paste</code> event of the SAPUI5 tables and converts the data into a two-dimensional array that
	 * can be used further in SAPUI5 controls, for example, for importing data from spreadsheets to SAPUI5 tables.
	 *
	 * @param {object} oEvent Paste event of the web browser. It contains the clipboard data in the following export
	 *         format: Cells are separated by tabs, lines by new line characters (\n, \r, and \r\n are supported). The cells containing
	 *         more than one line separated by new line characters are enclosed by double quotes (if there are already some
	 *         double quotes in the content, you will have multiple quotes in the cell).
	 * @returns {Array} Returns a two-dimensional array containing the pasted data. If a single value is pasted (no grid data),
	 *          this value will still be in an array that is inside another array.
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
	 * Validates and parses the data of a two-dimensional array against SAPUI5 standard and EDM types based on the <code>ColumnInfo</code> object
	 * and returns result with parsed data (if the validation is successful) or error information (if the validation fails).
	 *
	 * @param {array} aData Two-dimensional array containing the pasted data
	 * @param {array} aColumnInfo Provides information for each column, such as a property name and the corresponding data type or validation function for custom data type,
	 *	as required in the target SAPUI5 table. Use <code>ignore: true</code> for read-only columns or for all other columns that must not be pasted into a SAPUI5 table.
	 *	Use either <code>customParseFunction</code> or <code>type</code> parameter for the same column. Function <code>customParseFunction</code> must return parsed value,
	 *	if the validation for this custom type was successful, or throw an exception if the validation failed.
	 *  Parameter <code>type</code> must be an instance of the type object or the type name as a string
	 *
	 *	Example:
	 *					<pre>
	 *						var aColumnsInfo = [
	 *							{
	 *								property: "name",
	 *								type: "sap.ui.model.odata.type.String"
	 *							},
	 *							{
	 *								property: "lastname",
	 *								type: new sap.ui.model.odata.type.String({maxLength: 30}
	 *							},
	 *							{
	 *								property: "age",
	 *								type: "sap.ui.model.odata.type.Byte"
	 *							},
	 *							{
	 *								property: "fullname",
	 *								customParseFunction: function(sCellData) { return ( doValidationAndModification(sCellData)) ...}
	 *							},
	 *							{
	 *								ignore: true
	 *							}
	 *						];
	 * 					</pre>
	 * @returns {Promise} a Promise that gets resolved as soon as the parsing is done with the result object. The result object contains parsed data if the validation was successful (in this case,
	 * 	the error array has the value <code>null</code>), or it contains all collected errors if the validation failed (in this case,
	 * 	the data array has the value <code>null</code>).
	 *
	 *	Example of the result object after the successful validation - the data array is filled, and the error object is empty:
	 * 					 <pre>
	 *  					oResult = {
	 *   					  	parsedData: [
	 *								{name: "/firstName", age: "/age"},
	 *      					 	{name: "myModel2>/firstName", age: "myModel2>/age"}
	 *     						],
	 *     						errors: null
	 *  					 });
	 * 					</pre>
	 *
	 *	Example of the result object after the failed validation - error information is available, and the data array is empty:
	 * 					<pre>
	 *   					oResult = {
	 *   						parsedData: null,
	 *	   						errors: [
	 *								{row: 2 , column: 3, property: "age", value: "blub", type:"sap.ui.model.odata.type.Byte",
	 *     	 						 message: "Value "blub" in row 2 and column 2 could not be parsed as sap.ui.model.odata.type.Byte"}
	 *							]
	 *						});
	 *					</pre>
	 */
	PasteHelper.parse = function(aData, aColumnInfo) {
		var oResult = {parsedData: null,
						errors: null};

		// Validate input Data
		if (!aData) {
			throw new Error("Parameter aData is not specified");
		}

		// Validate columns information
		if (aColumnInfo) {
			for (var i = 0; i < aColumnInfo.length; i++) {
				var oColumnInfo = aColumnInfo[i]; // that should be only visible columns

				// Ignore columns and go to the next
				if (oColumnInfo.ignore){
					continue;
				}

				if (oColumnInfo.property) {
					// Check with Andreas async functionality instead of parseValue, after this create oType only once pro data type
					if (oColumnInfo.type) {
						var oType =  oColumnInfo.type;
						if (oType.isA && oType.isA("sap.ui.model.SimpleType")) {
							oColumnInfo.typeInstance = oType;
						} else {
							// change to async code in the future
							oType = ObjectPath.get(oColumnInfo.type);
							if (oType) {
								oColumnInfo.typeInstance = new oType();
							} else {
								// Exception for the application developers - type not foung in UI5 core and odata types
								throw new Error("Data type " + oColumnInfo.type + " is not available");
							}
						}
					} else if (oColumnInfo.customParseFunction == undefined) {
						// Exception for the application developers - the definition of the type is missing
						throw new Error("Missing ColumnInfo.type or custom type parse function for column " + (i + 1) + ". Check the application calling PasteHelper.parse(aData, aColumnInfo) and specify the missing type in the parameter aColumnInfo.");
					}
				} else {
					// Exception for the application developers - the name of property is missing
					throw new Error("Missing ColumnInfo.property for column " + (i + 1) + ". Check the application calling PasteHelper.parse(aData, aColumnInfo) and specify the missing property in the parameter aColumnInfo.");
				}
			}
		} else {
			throw new Error("Missing parameter aColumnInfo"); //Check -  missing param standard exception?
		}

		var aErrors = [], aParsedData = [];
		for (var i = 0; i < aData.length; i++) {
			var aRowData = aData[i];
			var oParsedRow = PasteHelper._parseRow(aRowData, aColumnInfo, i, aErrors);
			aParsedData.push(oParsedRow);
		}
		if (aErrors.length > 0) {
			oResult.parsedData = null;
			oResult.errors = aErrors;
		} else {
			oResult.parsedData = aParsedData;
			oResult.errors = null;
		}

		//simulate async code here - tmp
		return Promise.resolve(oResult);
	};

	/**
	 * Returns the result object for one row that contains an array of parsed values if the validation was successful. This function also
	 * adds errors to the given error array if any validation errors occur.
	 *
	 * @param {array} aRowData Contains data for one row
	 * @param {array} aColumnInfo Provides information about the corresponding property name and its required type
	 * @param {int} iRowIndex Index of the row
	 * @param {array} aErrors Contains error information, such as the row and column number where the validation error occurs, the value, and the required type
	 * @returns {object} Returns result object for one row with an array of values that have passed the type validation successfully
	 * @private
	 */
	PasteHelper._parseRow = function(aRowData, aColumnInfo, iRowIndex, aErrors) {

		var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
			oObject = {};

		for (var i = 0; (i < aColumnInfo.length) && (i < aRowData.length); i++) {

			var oColumnInfo = aColumnInfo[i]; // that should be only visible columns
			// Ignore columns and go to the next
			if (oColumnInfo.ignore){
				continue;
			}

			var sCellData = aRowData[i];
			try {
				if (oColumnInfo.typeInstance) {
					// Check parseValue if it gets to be async
					sCellData = (oColumnInfo.typeInstance).parseValue(sCellData, "string");
				} else if (oColumnInfo.customParseFunction) {
					sCellData = oColumnInfo.customParseFunction(sCellData);
				}
			} catch (e) {
				// Build error object for single cell
				var oError = {
					row : iRowIndex + 1,
					column : i + 1,
					property : oColumnInfo.property,
					value : sCellData,
					type : oColumnInfo.type,
					message : oBundle.getText("PasteHelper.ErrorMessage", [sCellData, iRowIndex + 1, i + 1,oColumnInfo.type]) + " " + e.message//"Value '" + sCellData + "' in row " + (iRowIndex + 1) + " and column " + (i + 1) + " could not be parsed as " + oColumnInfo.type
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
