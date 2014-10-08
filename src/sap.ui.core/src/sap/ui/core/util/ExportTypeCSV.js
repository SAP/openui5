/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.ExportTypeCSV
sap.ui.define(['jquery.sap.global', './ExportType'],
	function(jQuery, ExportType) {
	'use strict';

	/**
	 * Constructor for a new ExportTypeCSV.
	 * 
	 * Accepts an object literal <code>mSettings</code> that defines initial 
	 * property values, aggregated and associated objects as well as event handlers. 
	 * 
	 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
	 * then the framework assumes property, aggregation, association, event in that order. 
	 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
	 * or "event:" can be added to the name of the setting (such a prefixed name must be
	 * enclosed in single or double quotes).
	 *
	 * The supported settings are:
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>{@link #getSeparatorChar separatorChar} : string</li></ul>
	 * </li>
	 * <li>Aggregations
	 * <ul></ul>
	 * </li>
	 * <li>Associations
	 * <ul></ul>
	 * </li>
	 * <li>Events
	 * <ul></ul>
	 * </li>
	 * </ul>

	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * CSV export type. Can be used for {@link sap.ui.core.util.Export Export}.<br>
	 * <br>
	 * Please note that there could issues with the separator char depending on the user's system language in some programs such as Microsoft Excel.<br>
	 * To prevent those issues use the data-import functionality which enables the possibility to explicitly set the separator char that should be used.<br>
	 * This way the content will be displayed correctly.
	 *
	 * @extends sap.ui.core.util.ExportType
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.22.0
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.core.util.ExportTypeCSV
	 */
	var CSV = ExportType.extend('sap.ui.core.util.ExportTypeCSV', {

		metadata: {

			properties: {
				separatorChar: {
					type: 'string',
					defaultValue: ','
				}
			}

		}

	});

	/**
	 * Creates a new subclass of class sap.ui.core.util.ExportTypeCSV with name <code>sClassName</code> 
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 * 
	 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
	 *   
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] object literal with informations about the class  
	 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
	 * @return {function} the created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.core.util.ExportTypeCSV.extend
	 * @function
	 */

	/**
	 * Getter for property <code>separatorChar</code>.
	 * Separator char.
	 * Value needs to be exactly one character or empty for default.
	 *
	 * Default value is ','
	 *
	 * @return {string} the value of property <code>separatorChar</code>
	 * @public
	 * @name sap.ui.core.util.ExportTypeCSV#getSeparatorChar
	 * @function
	 */

	/**
	 * Setter for property <code>separatorChar</code>.
	 *
	 * Value needs to be exactly one character or empty for default. Default value is ','.
	 *
	 * @param {string} sSeparatorChar  new value for property <code>separatorChar</code>
	 * @return {sap.ui.core.util.ExportTypeCSV} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportTypeCSV#setSeparatorChar
	 * @function
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
	 * @name sap.ui.core.util.ExportTypeCSV#init
	 * @function
	 */
	CSV.prototype.init = function() {
		// Set default values
		this.setProperty('fileExtension', 'csv', true);
		this.setProperty('mimeType', 'text/csv', true);
		this.setProperty('charset', 'utf-8', true);
	};

	/**
	 * Escapes the value if needed to prevent issues with separator-char and new-line.
	 *
	 * @private
	 * @name sap.ui.core.util.ExportTypeCSV#escapeContent
	 * @function
	 */
	CSV.prototype.escapeContent = function(sVal) {
		if (sVal && (sVal.indexOf(this.getSeparatorChar()) > -1 || sVal.indexOf('\r\n') > -1)) {
			sVal = sVal.replace(/"/g, '""');
			sVal = '"' + sVal + '"';
		}
		return sVal;
	};

	/**
	 * Generates the file content.
	 *
	 * @return {string} content
	 * @protected
	 * @name sap.ui.core.util.ExportTypeCSV#generate
	 * @function
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
	 * @name sap.ui.core.util.ExportTypeCSV#generateColumns
	 * @function
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
	 * @name sap.ui.core.util.ExportTypeCSV#generateRows
	 * @function
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

}, /* bExport= */ true
);
