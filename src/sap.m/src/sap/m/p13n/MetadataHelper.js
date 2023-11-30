/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

    /**
     * @author SAP SE
	 * @public
	 * @alias sap.m.p13n.MetadataHelper
     * @class
     * The <code>MetadataHelper</code> entity offers utility functionality for service metadata during the <code>Engine#register</code> process.
     *
     * @see {@link topic:75c08fdebf784575947927e052712bab Personalization}
     *
     * @param {object[]} aProperties Array of objects defining available items for personalization
     *
	 * @example
	 *   [
     *      {key: country, label: Country, path: modelPath/to/country},
     *      {key: region, label: Region, path: modelPath/to/region},
     *      {key: city, label: City, path: modelPath/to/city}
     * ]
     */
    var MetadataHelper = BaseObject.extend("sap.m.p13n.MetadataHelper", {
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
     * @returns {object} A single property
     */
    MetadataHelper.prototype.getProperty = function(sKey) {
        return this._aProperties.find(function(oProp){
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

	return MetadataHelper;

});