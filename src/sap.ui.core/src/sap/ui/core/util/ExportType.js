/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.ExportType
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject'],
	function(jQuery, ManagedObject) {
	'use strict';

	/**
	 * Constructor for a new ExportType.
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
	 * <li>{@link #getFileExtension fileExtension} : string</li>
	 * <li>{@link #getMimeType mimeType} : string</li>
	 * <li>{@link #getCharset charset} : string</li></ul>
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
	 * Base export type. Subclasses can be used for {@link sap.ui.core.util.Export Export}.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.22.0
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.core.util.ExportType
	 */
	var ExportType = ManagedObject.extend('sap.ui.core.util.ExportType', {

		metadata: {
			properties: {
				fileExtension: 'string',
				mimeType: 'string',
				charset: 'string'
			}
		}

	});

	/**
	 * Creates a new subclass of class sap.ui.core.util.ExportType with name <code>sClassName</code> 
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
	 * @name sap.ui.core.util.ExportType.extend
	 * @function
	 */

	/**
	 * Getter for property <code>fileExtension</code>.
	 * File extension
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @return {string} the value of property <code>fileExtension</code>
	 * @public
	 * @name sap.ui.core.util.ExportType#getFileExtension
	 * @function
	 */

	/**
	 * Setter for property <code>fileExtension</code>.
	 *
	 * Default value is empty/<code>undefined</code> 
	 *
	 * @param {string} sFileExtension  new value for property <code>fileExtension</code>
	 * @return {sap.ui.core.util.ExportType} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportType#setFileExtension
	 * @function
	 */

	/**
	 * Getter for property <code>mimeType</code>.
	 * MIME type
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @return {string} the value of property <code>mimeType</code>
	 * @public
	 * @name sap.ui.core.util.ExportType#getMimeType
	 * @function
	 */

	/**
	 * Setter for property <code>mimeType</code>.
	 *
	 * Default value is empty/<code>undefined</code> 
	 *
	 * @param {string} sMimeType  new value for property <code>mimeType</code>
	 * @return {sap.ui.core.util.ExportType} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportType#setMimeType
	 * @function
	 */

	/**
	 * Getter for property <code>charset</code>.
	 * Charset
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @return {string} the value of property <code>charset</code>
	 * @public
	 * @name sap.ui.core.util.ExportType#getCharset
	 * @function
	 */

	/**
	 * Setter for property <code>charset</code>.
	 *
	 * Default value is empty/<code>undefined</code> 
	 *
	 * @param {string} sCharset  new value for property <code>charset</code>
	 * @return {sap.ui.core.util.ExportType} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportType#setCharset
	 * @function
	 */

	/**
	 * @private
	 * @name sap.ui.core.util.ExportType#init
	 * @function
	 */
	ExportType.prototype.init = function() {
		this._oExport = null;
	};

	/**
	 * Handles the generation process of the file.<br>
	 *
	 * @param {sap.ui.core.util.Export} oExport export instance
	 * @return {string} content
	 *
	 * @protected
	 * @name sap.ui.core.util.ExportType#_generate
	 * @function
	 */
	ExportType.prototype._generate = function(oExport) {
		this._oExport = oExport;
		var sContent = this.generate();
		this._oExport = null;
		return sContent;
	};

	/**
	 * Generates the file content.<br>
	 * Should be implemented by the individual types!
	 *
	 * @return {string} content
	 *
	 * @protected
	 * @name sap.ui.core.util.ExportType#generate
	 * @function
	 */
	ExportType.prototype.generate = function() {
		return '';
	};

	/**
	 * Returns the number of columns.
	 *
	 * @return {int} count
	 *
	 * @protected
	 * @name sap.ui.core.util.ExportType#getColumnCount
	 * @function
	 */
	ExportType.prototype.getColumnCount = function() {
		if (this._oExport) {
			return this._oExport.getColumns().length;
		}
		return 0;
	};

	/**
	 * Returns the number of rows.
	 *
	 * @return {int} count
	 *
	 * @protected
	 * @name sap.ui.core.util.ExportType#getRowCount
	 * @function
	 */
	ExportType.prototype.getRowCount = function() {
		if (this._oExport && this._oExport.getBinding("rows")) {
			return this._oExport.getBinding("rows").getLength();
		}
		return 0;
	};

	/**
	 * Creates a column "generator" (inspired by ES6 Generators)
	 *
	 * @return {Generator} generator
	 * @protected
	 * @name sap.ui.core.util.ExportType#columnGenerator
	 * @function
	 */
	ExportType.prototype.columnGenerator = function() {
		/*
		// Implementation using ES6 Generator
		function* cellGenerator() {
			var aColumns = this._oExport.getColumns(),
				iColumns = aColumns.length;

			for (var i = 0; i < iColumns; i++) {
				yield {
					index: i,
					name: aColumns[i].getName()
				};
			}
		}
		*/

		var i = 0,
			aColumns = this._oExport.getColumns(),
			iColumns = aColumns.length;

		return {
			next: function() {
				if (i < iColumns) {
					var iIndex = i;
					i++;
					return {
						value: {
							index: iIndex,
							name: aColumns[iIndex].getName()
						},
						done: false
					};
				} else {
					return {
						value: undefined,
						done: true
					};
				}
			}
		};
	};

	/**
	 * Creates a cell "generator" (inspired by ES6 Generators)
	 *
	 * @return {Generator} generator
	 * @protected
	 * @name sap.ui.core.util.ExportType#cellGenerator
	 * @function
	 */
	ExportType.prototype.cellGenerator = function() {
		/*
		// Implementation using ES6 Generator
		function* cellGenerator() {
			var oRowTemplate = this._oExport.getAggregation('_template'),
				aCells = oRowTemplate.getCells(),
				iCells = aCells.length;

			for (var i = 0; i < iCells; i++) {
				yield {
					index: i,
					content: aCells[i].getContent()
				};
			}
		}
		*/

		var i = 0,
			oRowTemplate = this._oExport.getAggregation('_template'),
			aCells = oRowTemplate.getCells(),
			iCells = aCells.length;

		return {
			next: function() {
				if (i < iCells) {
					var iIndex = i;
					i++;

					// convert customData object array to key-value map
					var mCustomData = {};
					jQuery.each(aCells[iIndex].getCustomData(), function() {
						mCustomData[this.getKey()] = this.getValue();
					});

					return {
						value: {
							index: iIndex,
							content: aCells[iIndex].getContent(),
							customData: mCustomData
						},
						done: false
					};
				} else {
					return {
						value: undefined,
						done: true
					};
				}
			}
		};
	};

	/**
	 * Creates a row "generator" (inspired by ES6 Generators)
	 *
	 * @return {Generator} generator
	 * @protected
	 * @name sap.ui.core.util.ExportType#rowGenerator
	 * @function
	 */
	ExportType.prototype.rowGenerator = function() {
		/*
		// Implementation using ES6 Generator
		function* rowGenerator() {
			var oExport = this._oExport,
				oBinding = oExport.getBinding("rows"),
				mBindingInfos = oExport.getBindingInfo("rows"),
				aContexts = oBinding.getContexts(0, oBinding.getLength()),
				iContexts = aContexts.length,
				oRowTemplate = oExport.getAggregation('_template');

			for (var i = 0; i < iCells; i++) {
				oRowTemplate.setBindingContext(aContexts[i], mBindingInfos.model);
				yield {
					index: i,
					cells: this.cellGenerator()
				};
			}
		}
		*/

		var that = this,
			i = 0,
			oExport = this._oExport,
			oBinding = oExport.getBinding("rows"),
			mBindingInfos = oExport.getBindingInfo("rows"),
			aContexts = oBinding.getContexts(0, oBinding.getLength()),
			iContexts = aContexts.length,
			oRowTemplate = oExport.getAggregation('_template');

		return {
			next: function() {
				if (i < iContexts) {
					var iIndex = i;
					i++;

					oRowTemplate.setBindingContext(aContexts[iIndex], mBindingInfos.model);
					return {
						value: {
							index: iIndex,
							cells: that.cellGenerator()
						},
						done: false
					};
				} else {
					return {
						value: undefined,
						done: true
					};
				}
			}
		};
	};

	return ExportType;

}, /* bExport= */ true);
