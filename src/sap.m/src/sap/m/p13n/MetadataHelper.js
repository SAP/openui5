/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object"
], (BaseObject) => {
	"use strict";

	/**
	 * Personalization <code>MetadataObject</code> type.
	 *
	 * @public
	 * @typedef {object} sap.m.p13n.MetadataObject
	 * @property {string} key The unique key for the p13n metadata object
	 * @property {string} label Defines the text that will be displayed in the personalization popup
	 * @property {string} path Defines the technical path to apply binding-related updates
	 * @property {boolean} [sortable] Defines whether the metadata object is sortable
	 * @property {boolean} [groupable] Defines whether the metadata object is groupable
	 * @property {boolean} [visible] Defines whether the metadata object is visible for selection
	 *
	 */

	/**
	 * @author SAP SE
	 * @public
	 * @alias sap.m.p13n.MetadataHelper
	 * @class
	 * The <code>MetadataHelper</code> entity offers utility functionality for service metadata during the <code>Engine#register</code> process.
	 *
	 * @see {@link topic:75c08fdebf784575947927e052712bab Personalization}
	 *
	 * @constructor
	 * @param {sap.m.p13n.MetadataObject[]} aProperties Array of objects defining available items for personalization
	 * @example
	 *   [
	 *      {key: country, label: Country, path: modelPath/to/country},
	 *      {key: region, label: Region, path: modelPath/to/region},
	 *      {key: city, label: City, path: modelPath/to/city}
	 * ]
	 */
	const MetadataHelper = BaseObject.extend("sap.m.p13n.MetadataHelper", {
		constructor: function(aProperties) {
			BaseObject.apply(this, arguments);
			this._aProperties = aProperties;
		}
	});

	/**
	 * Gets the array of properties.
	 *
	 * @public
	 * @returns {object[]} Array of properties
	 */
	MetadataHelper.prototype.getProperties = function() {
		return this._aProperties;
	};

	/**
	 * Gets a single property.
	 *
	 * @public
	 * @param {string} sKey The property key identifying a property entry
	 * @returns {sap.m.p13n.MetadataObject | undefined} A single property
	 */
	MetadataHelper.prototype.getProperty = function(sKey) {
		return this._aProperties.find((oProp) => {
			return oProp.key === sKey;
		});
	};

	/**
	 * Gets a property path based on its key.
	 *
	 * @public
	 * @param {string} sKey The property key identifying a property entry
	 * @returns {string} The property path based on its key
	 */
	MetadataHelper.prototype.getPath = function(sKey) {
		return this.getProperty(sKey).path;
	};

	/**
	 * Gets a list of properties that are redundant and should be filtered out in the {@link sap.ui.mdc.p13n.SelectionController} for personalization.
	 *
	 * @protected
	 * @returns {object[]} A list of properties
	 */
	MetadataHelper.prototype.getRedundantProperties = function() {
		return [];
	};

	return MetadataHelper;

});