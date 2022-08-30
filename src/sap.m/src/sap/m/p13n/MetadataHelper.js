/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

    /**
     * The <code>MetadataHelper</code> entity offers utility functionality for providing service metadata during the <code>Engine#register</code> process.
     *
	 * @author SAP SE
	 * @public
     * @experimental Since 1.104.
	 * @alias sap.m.p13n.MetadataHelper
     */
    var MetadataHelper = BaseObject.extend("sap.m.p13n.MetadataHelper", {
        constructor: function(aProperties) {
			BaseObject.apply(this, arguments);
			this._aProperties = aProperties;
		}
    });

    MetadataHelper.prototype.getProperties = function() {
        return this._aProperties;
    };

    MetadataHelper.prototype.getProperty = function(sKey) {
        return this._aProperties.find(function(oProp){
            return oProp.key === sKey;
        });
    };

    MetadataHelper.prototype.getPath = function(sKey) {
        return this.getProperty(sKey).path;
    };

	return MetadataHelper;

});