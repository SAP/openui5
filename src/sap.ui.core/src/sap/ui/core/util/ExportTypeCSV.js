/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.ExportTypeCSV
sap.ui.define(['./ExportType'],
	function(ExportType) {
	'use strict';

	// Matches CR, LF, double quote and common separator chars
	// Used to detect whether content needs to be escaped (see #escapeContent)
	var rContentNeedsEscaping = /[\r\n"\t;,]/;

	// Matches a formula (for usage see #escapeContent):
	// Starts with one of = + - @ but excludes "number only" formulas like -123,45 or =1.234e+5 as they are save to be used
	var rFormula = /^[=\+\-@](?![\d.,]+(?:e[\+-]?\d+)?$)/i;

	/**
	 * Constructor for a new ExportTypeCSV.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * CSV export type. Can be used for {@link sap.ui.core.util.Export Export}.
	 *
	 * Please note that there could be an issue with the separator char depending on the user's system language in some programs such as Microsoft Excel.
	 * To prevent those issues use the data-import functionality which enables the possibility to explicitly set the separator char that should be used.
	 * This way the content will be displayed correctly.
	 *
	 * Potential formulas (cell data starts with one of = + - @) will be escaped by prepending a single quote.
	 * As the export functionality is intended to be used with actual (user) data there is no reason to allow formulas.
	 *
	 * @extends sap.ui.core.util.ExportType
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.22.0
	 *
	 * @public
	 * @deprecated Since version 1.73
	 * @alias sap.ui.core.util.ExportTypeCSV
	 */
	var CSV = ExportType.extend('sap.ui.core.util.ExportTypeCSV', {

		metadata: {
			library: "sap.ui.core",
			properties: {

				/**
				 * Separator char.
				 *
				 * Value needs to be exactly one character or empty for default.
				 */
				separatorChar: {
					type: 'string',
					defaultValue: ','
				}
			}

		}

	});

	/**
	 * Setter for property <code>separatorChar</code>.
	 *
	 * Value needs to be exactly one character or empty for default. Default value is ','.
	 *
	 * @param {string} sSeparatorChar  new value for property <code>separatorChar</code>
	 * @return {sap.ui.core.util.ExportTypeCSV} <code>this</code> to allow method chaining
	 * @public
	 */
	CSV.prototype.setSeparatorChar = function(sSeparatorChar) {
		var sSeparatorChar = this.validateProperty('separatorChar', sSeparatorChar);
		if (sSeparatorChar.length > 1) {
			throw new Error("Value of property \"separatorChar\" needs to be exactly one character or empty. " +
				"\"" + sSeparatorChar + "\" is " + sSeparatorChar.length + " characters long.");
		}
		return this.setProperty('separatorChar', sSeparatorChar);
	};

	/**
	 * @private
	 */
	CSV.prototype.init = function() {
		// Set default values
		this.setProperty('fileExtension', 'csv', true);
		this.setProperty('mimeType', 'text/csv', true);
		this.setProperty('charset', 'utf-8', true);
	};

	/**
	 * Escapes the value to prevent issues with separator char, new line and
	 * double quotes (only if required).
	 *
	 * @param {string} sVal content
	 * @return {string} escaped content
	 * @private
	 */
	CSV.prototype.escapeContent = function(sVal) {

		// No need to escape undefined, null or empty string
		if (!sVal) {
			return sVal;
		}

		// Prepend single quote in case cell content is a formula.
		// This will prevent it from beeing evaluated by other programs.
		// As the export functionality is intended to be used with actual (user) data
		// there is no reason to allow formulas in here.
		if (rFormula.test(sVal)) {
			sVal = "'" + sVal;
		}

		// Use indexOf instead of RegExp to be on the save side in case the separator
		// would need to be escaped (such as \ ^ $ * + ? . ( ) | { } [ ])
		var bContainsSeparatorChar = sVal.indexOf(this.getSeparatorChar()) > -1;

		// Only wrap content with double quotes if it contains the separator char,
		// a new line (CR / LF), a double quote or a common separator char
		if (bContainsSeparatorChar || rContentNeedsEscaping.test(sVal)) {

			// Escape double quotes by preceding them with another one
			sVal = sVal.replace(/"/g, '""');

			// Wrap final content with double quotes
			sVal = '"' + sVal + '"';

		}

		return sVal;
	};

	/**
	 * Generates the file content.
	 *
	 * @return {string} content
	 * @protected
	 */
	CSV.prototype.generate = function() {
		var aBuffer = [];

		this.generateColumns(aBuffer);
		this.generateRows(aBuffer);

		return aBuffer.join('\r\n');
	};

	/**
	 * Generates the columns.
	 *
	 * @param {string[]} aBuffer export buffer array
	 *
	 * @private
	 */
	CSV.prototype.generateColumns = function(aBuffer) {
		var aColumnBuffer = [],
			oColumns = this.columnGenerator(),
			oColumn;

		while (!(oColumn = oColumns.next()).done) {
			aColumnBuffer.push(this.escapeContent(oColumn.value.name));
		}

		aBuffer.push(aColumnBuffer.join(this.getSeparatorChar()));
	};

	/**
	 * Generates the row content.
	 *
	 * @param {string[]} aBuffer export buffer array
	 *
	 * @private
	 */
	CSV.prototype.generateRows = function(aBuffer) {
		var oRows = this.rowGenerator(),
			oRow;

		while (!(oRow = oRows.next()).done) {
			var aRowBuffer = [];

			var oCells = oRow.value.cells,
				oCell;

			while (!(oCell = oCells.next()).done) {
				aRowBuffer.push(this.escapeContent(oCell.value.content));
			}

			aBuffer.push(aRowBuffer.join(this.getSeparatorChar()));
		}
	};

	return CSV;

}
);
