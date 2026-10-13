/*!
 * ${copyright}
 */

sap.ui.define([
    "../../GeomapDelegate", 'sap/ui/mdc/odata/v4/TypeMap'
], (
    GeomapDelegate,
    ODataV4TypeMap
) => {
    "use strict";
    /**
     * Delegate class for {@link sap.ui.mdc.Geomap Geomap} and ODataV4.<br>
     * This class provides method calls, which are called by the <code>Geomap</code> at specific operations and allows to overwrite an internal behaviour.
     *
     * @namespace
     * @author SAP SE
     * @alias module:sap/ui/mdc/odata/v4/GeomapDelegate
     * @extends module:sap/ui/mdc/GeomapDelegate
     *
     * @since 1.154
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     *
     */
    const Delegate = Object.assign({}, GeomapDelegate);

    Delegate.getTypeMap = function(oPayload) {
        return ODataV4TypeMap;
    };

    /**
     * Creates an MDC geomap Item for given property.
     * @param {string} sPropertyName the name of the property in the propertyInfo object.
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the MDC geomap
     * @param {string} sRole Role of the new item (if available)
     * @returns {Promise<sap.ui.mdc.geomap.Item>} Created MDC Item
     *
     * @since 1.154
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    Delegate._createMDCChartItem = function(sPropertyName, oGeomap, sRole) {

        return this._getPropertyInfosByName(sPropertyName, oGeomap).then((oPropertyInfo) => {
            if (!oPropertyInfo) {
                return null;
            }

            return this._createMDCItemFromProperty(oPropertyInfo, oGeomap.getId(), sRole);

        });

    };

    return Delegate;
});