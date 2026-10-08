/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/AggregationBaseDelegate",
    "sap/ui/mdc/enums/GeomapControlPosition"
], (AggregationBaseDelegate, GeomapControlPosition) => {
    "use strict";

    /**
     * Base Delegate for {@link sap.ui.mdc.Geomap Geomap}. Extend this object in your project to use all functionalities of the {@link sap.ui.mdc.Geomap Geomap}.<br>
     * This class provides method calls, that are called by the <code>geomap</code> for specific operations and overwrite the internal behavior.
     *
     * @namespace
     * @author SAP SE
     * @alias module:sap/ui/mdc/GeomapDelegate
     * @extends module:sap/ui/mdc/AggregationBaseDelegate
     * @public
     * @since 1.154
     *
     */
    const GeomapDelegate = Object.assign({}, AggregationBaseDelegate);

    /**
     * Notifies the inner geomap to zoom in.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     *
     * @public
     */
    GeomapDelegate.zoomIn = function(oGeomap) { };

    /**
     * Notifies the inner geomap to zoom out.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     *
     * @public
     */
    GeomapDelegate.zoomOut = function(oGeomap) { };

    /**
     * geomap <code>ZoomState</code> type.
     *
     * @typedef {object} sap.ui.mdc.geomap.ZoomState
     * @property {boolean} enabled Zooming is enabled if set to <code>true</code>
     * @property {number} currentZoomLevel Current zoom level of the geomap in percent (between 0 and 1)
     * @since 1.154
     * @public
     */

    /**
     * Gets the current zooming information for the geomap.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     * @returns {float} Current <code>zoom</code> level of the inner geomap
     *
     * @public
     */
    GeomapDelegate.getZoomLevel = function(oGeomap) { };

    /**
     * Creates a new geomap item for a given property name and updates the inner geomap.<br>
     * <b>Note:</b> This does <b>not</b> add the geomap item to the <code>Items</code> aggregation of the geomap.
     * Called and used by <code>p13n</code>.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the MDC geomap to add the property to
     * @param {string} sPropertyName The name of the property added
     * @param {object} mPropertyBag The property bag containing useful information about the change
     * @param {string} [sRole] New role for given item
     * @returns {Promise<object>} <code>Promise</code> that resolves with new geomap <code>Item</code> as parameter
     *
     * @public
     */
    GeomapDelegate.addItem = function(oGeomap, sPropertyName, mPropertyBag, sRole) {
        return Promise.resolve();
    };

    /**
     * Removes an existing geomap item for a given property name and updates the inner geomap..
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the MDC geomap from which property is removed
     * @param {object} oItem The <code>item</code> that is removed from the geomap
     * @param {object} mPropertyBag The property bag containing useful information about the change
     * @returns {Promise<boolean>} <code>Promise</code> containing information whether the item was deleted
     *
     * @public
     */
    GeomapDelegate.removeItem = function(oGeomap, oItem, mPropertyBag) {
        return Promise.resolve(true);
    };

    /**
     * Inserts a geomap item (spot / circle for <code>sap.geomap.geomap</code>) into the inner geomap.<br>
     * This function is called by the geomap for a change of the <code>Items</code> aggregation.<br>
     * <b>Note:</b> Do not call this yourself, as it would not be synced with the geomap, but insert the item into the geomap instead.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap geomap into which the item is insert
     * @param {object} oGeomapItem geomap item (spot, container, circle & etc. )that is inserted into the inner geomap
     * @param {int} iIndex The index into which the geomap item is inserted
     * @param {string} sType the type of item which should be added to the geomap
     *
     * @public
     */
    GeomapDelegate.insertItemToGeomap = function(oGeomap, oGeomapItem, iIndex, sType) { };

    /**
     * Removes a geomap item (spot / circle for <code>sap.geomap.geomap</code>) from the inner geomap.<br>
     * This function is called by the geomap for a change of the <code>Items</code> aggregation.<br>
     * <b>Note:</b> Do not call this yourself, as it would not be synced with the geomap, but remove the item from the geomap instead.
     *
     * @param {sap.ui.mdc.Geomap} oGeoap geomap from which the item is removed
     * @param {object} oGeomapItem geomap item that is removed from the geomap
     * @param {string} sType geomap item type that should be removed from the geomap
     *
     * @public
     */
    GeomapDelegate.removeItemFromGeomap = function(oGeomap, oGeomapItem, sType) { };

    /**
     * Loads the required libraries and creates the inner geomap.<br>
     * By default, the method returns <code>Promise.reject()</code>.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     * @returns {Promise} Resolved once the inner geomap has been initialized
     *
     * @public
     */
    GeomapDelegate.initializeGeomap = function(oGeomap) {
        return Promise.reject();
    };

    /**
     * Creates the initial content for the geomap before the metadata is retrieved.<br>
     * This can be used by geomap libraries that can already show some information without the actual data (for example, axis labels, legend, ...).
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     *
     * @public
     */
    GeomapDelegate.createInitialGeomapContent = function(oGeomap) { };

    /**
     * Returns the instance of the inner geomap.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the MDC geomap
     * @returns {sap.ui.core.Control} Instance of the inner geomap
     *
     * @public
     */
    GeomapDelegate._getInnerGeomap = function(oGeomap) { };

    /**
     * Geomap <code>GeomapTypeObject</code> type.
     *
     * @typedef {object} sap.ui.mdc.Geomap.GeomapTypeObject
     * @property {string} key Unique key of the geomap type
     * @property {sap.ui.core.URI} icon URI for the icon for the current geomap type
     * @property {string} text Name of the current geomap type
     * @property {boolean} selected Whether the geomap type is the one currently used
     * @since 1.154
     * @public
     */

    /**
     * Returns the current geomap type.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the MDC geomap
     * @returns {sap.ui.mdc.Geomap.GeomapTypeObject[]} Information about the current geomap type
     * @throws {Error} Error thrown if inner geomap is not initialized yet
     *
     * @public
     */
    GeomapDelegate.getGeomapTypeInfo = function(oGeomap) { };

    /**
     * Binds the inner geomap to the back-end data and creates the inner geomap content.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     * @param {function} fnCallbackDataLoaded Callback function when data is loaded
     *
     * @public
     */
    GeomapDelegate.createInnerGeomapContent = function(oGeomap, fnCallbackDataLoaded) { };


    /**
     * Checks the binding of the geomap and rebinds it if required.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo BindingInfo of the geomap
     *
     * @public
     */
    GeomapDelegate.rebind = function(oGeomap, oBindingInfo) { };

    /**
     * Returns the binding info for given geomap.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     * @returns {sap.ui.base.ManagedObject.AggregationBindingInfo} BindingInfo object
     *
     * @public
     */
    GeomapDelegate.getBindingInfo = function(oGeomap) { };

    /**
     * Updates the binding info with the relevant information.<br>
     * By default, this method updates a given {@link sap.ui.base.ManagedObject.AggregationBindingInfo AggregationBindingInfo}.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo Binding info of the geomap
     *
     * @public
     */
    GeomapDelegate.updateBindingInfo = function(oGeomap, oBindingInfo) {

    };

    /**
     * Returns the relevant property info based on the metadata used with the geomap instance.
     *
     * <b>Note:</b>
     * The result of this function must be kept stable throughout the lifecycle of your application.
     * Any changes of the returned values might result in undesired effects.
     *
     * <b>Note</b>: Existing properties (set via <code>sap.ui.mdc.Geomap#setPropertyInfo</code>) must not be removed and their attributes must not be changed during the {@link module:sap/ui/mdc/GeomapDelegate.fetchProperties fetchProperties} callback. Otherwise validation errors might occur whenever personalization-related control features (such as the opening of any personalization dialog) are activated.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     * @returns {Promise<sap.ui.mdc.Geomap.PropertyInfo[]>} Array of the property infos that is used within the geomap
     *
     * @public
     */
    GeomapDelegate.fetchProperties = function(oGeomap) {
        return Promise.resolve([]);
    };

    /**
     * Gets the information whether the inner geomap is currently bound.
     *
     * @param {sap.ui.mdc.Geomap} oGeomap Reference to the geomap
     * @returns {boolean} <code>true</code> if inner geomap is bound; <code>false</code> if not
     *
     * @public
     */
    GeomapDelegate.getGeomapBound = function() {
        return false;
    };

    /**
     * Returns the information for control positions on the map.
     *
     * @returns {object} with defined control positions
     * @public
     */
    GeomapDelegate.getControlPositions = function() {
        return {
            controlPositions: {
                navigation: GeomapControlPosition.TopLeft,
                selection: GeomapControlPosition.TopRight,
                fullscreen: GeomapControlPosition.TopRight,
                scale: GeomapControlPosition.BottomLeft
            }
        };
    };

    /**
     * Returns the visible properties (set in <code>items</code> aggregation of the geomap.
     * @param oGeomap
     * @returns {Array} array of visible properties
     */
    GeomapDelegate.getVisibleProperties = function(oGeomap) {
        const aMDCGeomapItems = oGeomap.getAggregation("items") || [];
        let aInitiallyVisibleProperties = [];
        if (aMDCGeomapItems.length > 0) {
            aInitiallyVisibleProperties = aMDCGeomapItems.map((oItem) => oItem.getPropertyKey());
        }

        return aInitiallyVisibleProperties;
    };

    /**
     * Creates a new independent delegate instance.
     * Use this in app delegates to avoid mutation of the shared base delegate.
     * @returns {object} A new delegate object with all methods copied
     */
    GeomapDelegate.createDelegate = function() {
    };

    return GeomapDelegate;
});