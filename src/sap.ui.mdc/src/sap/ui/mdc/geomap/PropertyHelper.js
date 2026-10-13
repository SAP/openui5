/*!
 * ${copyright}
 */

sap.ui.define([
    "../util/PropertyHelper", "sap/ui/core/Lib"
], (
    PropertyHelperBase,
    Library
) => {
    "use strict";

    /**
     * Constructor for a new geomap property helper.
     *
     * @param {object[]} aProperties The properties to process in this helper
     * @param {sap.ui.base.ManagedObject} [oParent] A reference to an instance that will act as the parent of this helper
     *
     * @class
     * Geomap property helpers give geomaps of this library a consistent and standardized view on properties and their attributes.
     * Property helpers validate the given properties, set default values, and provides utilities to work with these properties.
     * The utilities can only be used for properties that are known to the helper. Known properties are all those that are passed to the constructor.
     *
     * @extends sap.ui.mdc.util.PropertyHelper
     *
     * @author SAP SE
     * @version ${version}
     *
     * @private
     * @since 1.154
     * @alias sap.ui.mdc.geomap.PropertyHelper
     */
    const PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.geomap.PropertyHelper", {
        constructor: function(aProperties, oParent) {
            PropertyHelperBase.call(this, aProperties, oParent, {
                propertyInfos: true
            });
        }
    });

    /**
     * @inheritDoc
     */
    PropertyHelper.prototype.prepareProperty = function(oProperty, mProperties) {
        if (!oProperty.path && oProperty.propertyPath) {
            oProperty.path = oProperty.propertyPath;
        }

        if (!oProperty.typeConfig && oProperty.dataType) {
            const oFormatOptions = oProperty.formatOptions ? oProperty.formatOptions : null;
            const oConstraints = oProperty.constraints ? oProperty.constraints : {};

            oProperty.typeConfig = this.getParent().getTypeMap().getTypeConfig(oProperty.dataType, oFormatOptions, oConstraints);
        }

        PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);

        oProperty.isAggregatable = function() {

            if (oProperty) {
                return oProperty.isComplex() ? false : oProperty.aggregatable;
            }
        };
    };

    return PropertyHelper;

});