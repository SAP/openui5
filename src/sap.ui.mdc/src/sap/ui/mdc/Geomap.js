/*!
* ${copyright}
*/

sap.ui.define([
        "sap/ui/core/Lib",
        "sap/ui/mdc/Control",
        "./GeomapRenderer",
        "sap/base/Log",
        "sap/ui/mdc/ActionToolbar",
        "./geomap/PropertyHelper",
        "sap/ui/mdc/mixin/FilterIntegrationMixin",
        "sap/ui/model/base/ManagedObjectModel",
        "sap/ui/mdc/p13n/subcontroller/FilterController",
        "sap/ui/base/ManagedObjectObserver"
    ],
    (
        Library,
        Control,
        GeomapRenderer,
        Log,
        ActionToolbar,
        PropertyHelper,
        FilterIntegrationMixin,
        ManagedObjectModel,
        FilterController,
        ManagedObjectObserver
    ) => {
        "use strict";

        /**
         * Constructor for a new Geomap.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no id is given
         * @param {object} [mSettings] Initial settings for the new control
         *
         * @class The <code>Geomap</code> control creates a geomap based on metadata and the configuration specified.<br>
         * <b>Note:</b> The geomap needs to be created inside the <code>GeomapDelegate</code>.
         * @extends sap.ui.mdc.Control
         * @borrows sap.ui.mdc.mixin.FilterIntegrationMixin.rebind as #rebind
         * @author SAP SE
         * @version ${version}
         * @constructor
         *
         * @public
         *
         * @alias sap.ui.mdc.Geomap
         * @see {@link topic:1dd2aa91115d43409452a271d11be95b sap.ui.mdc}
         * @since 1.154
         */
        const Geomap = Control.extend("sap.ui.mdc.Geomap", /** @lends sap.ui.mdc.Geomap.prototype */ {
            metadata: {
                library: "sap.ui.mdc",
                designtime: "sap/ui/mdc/designtime/geomap/Geomap.designtime",
                interfaces: [
                    "sap.ui.mdc.IFilterSource", "sap.ui.mdc.IxState"
                ],
                defaultAggregation: "items",
                properties: {

                    /**
                     * Defines the width of the geomap.
                     */
                    width: {
                        type: "sap.ui.core.CSSSize",
                        group: "Dimension",
                        defaultValue: "700px",
                        invalidate: true
                    },

                    /**
                     * Defines the height of the geomap.
                     */
                    height: {
                        type: "sap.ui.core.CSSSize",
                        group: "Dimension",
                        defaultValue: "700px",
                        invalidate: true
                    },
                    /**
                     * Header text that appears in the geomap
                     */
                    header: {
                        type: "string",
                        group: "Misc",
                        defaultValue: ""
                    },

                    /**
                     * Latitude of the point where the map is centered
                     */
                    centerLat: {
                        type: "float"
                    },

                    /**
                     * Longitude of the point where the map is centered
                     */
                    centerLng: {
                        type: "float"
                    },

                    /**
                     * Zoom level of the map - the bigger, the more the map is zoomed
                     */
                    zoom: {
                        type: "float"
                    },

                    /**
                     * Enables the selection control for the map
                     */
                    enableSelectionControl: {
                        type: "boolean",
                        defaultValue: false,
                        group: "Behavior"
                    },

                    /**
                     * Enables the navigation & compas control for the map
                     */
                    enableNavigationControl: {
                        type: "boolean",
                        defaultValue: true,
                        group: "Behavior"
                    },

                    /**
                     * Enables the full screen control for the map
                     */
                    enableFullscreenControl: {
                        type: "boolean",
                        defaultValue: true,
                        group: "Behavior"
                    },

                    /**
                     * Enables the scale control for the map
                     */
                    enableScaleControl: {
                        type: "boolean",
                        defaultValue: true,
                        group: "Behavior"
                    },

                    /**
                     * Enables the copyright control for the map
                     */
                    enableCopyrightControl: {
                        type: "boolean",
                        defaultValue: false,
                        group: "Behavior"
                    },

                    /**
                     * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
                     * The object has the following properties:
                     * <ul>
                     * 	<li><code>name</code> defines the path to the <code>Delegate</code> module</li>
                     * 	<li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
                     * </ul>
                     * <i>Sample delegate object:</i>
                     * <pre><code>{
                     * 	name: "sap/ui/mdc/BaseDelegate",
                     * 	payload: {}
                     * }</code></pre>
                     * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
                     * Do not bind or modify the module. This property can only be configured during control initialization.
                     * @since 1.154
                     */
                    delegate: {
                        type: "object",
                        group: "Data",
                        defaultValue: {
                            name: "sap/ui/mdc/GeomapDelegate",
                            payload: {}
                        }
                    },

                    /**
                     * Specifies the geomap metadata.<br>
                     * <b>Note:</b> This property must not be bound.<br>
                     * <b>Note:</b> This property is exclusively used for handling SAPUI5 flexibility changes. Do not use it otherwise.<br>
                     * <b>Note</b>: Existing properties (set via <code>sap.ui.mdc.Geomap#setPropertyInfo</code>) must not be removed and their attributes must not be changed during the {@link module:sap/ui/mdc/GeomapDelegate.fetchProperties fetchProperties} callback. Otherwise validation errors might occur whenever personalization-related control features (such as the opening of any personalization dialog) are activated.
                     *
                     * <b>Note</b>: For more information about the supported inner elements, see {@link sap.ui.mdc.geomap.PropertyInfo PropertyInfo}.
                     */
                    propertyInfo: {
                        type: "object",
                        defaultValue: []
                    }
                },
                aggregations: {
                    _geomap: {
                        type: "sap.ui.core.Control",
                        multiple: false,
                        visibility: "hidden"
                    },
                    /**
                     * Aggregates the items to be displayed in the geomap.
                     * Note: As items are custom elements defined as part of the webc library the type here could not be strictly defined or used a generic one so supported types are limited to those supported by the webc library.
                     */
                    items: {
                        type: "sap.ui.mdc.geomap.Item",
                        multiple: true
                    }
                },
                associations: {
                },
                events: {
                    /**
                     * This event is fired when zooming is performed on the map.
                     */
                    zoomChange: {}
                }
            },

            renderer: GeomapRenderer
        });


        /**
         * An object literal describing a data property in the context of a {@link sap.ui.mdc.Geomap}.
         *
         * When specifying the <code>PropertyInfo</code> objects in the {@link sap.ui.mdc.Geomap#getPropertyInfo propertyInfo} property, the following
         * attributes need to be specified:
         * <ul>
         *   <li><code>key</code></li>
         *   <li><code>label</code></li>
         *   <li><code>visible</code></li>
         *   <li><code>path</code></li>
         *   <li><code>dataType</code></li>
         *   <li><code>formatOptions</code></li>
         *   <li><code>constraints</code></li>
         * </ul>
         *
         * @typedef {sap.ui.mdc.util.PropertyInfo} sap.ui.mdc.geomap.PropertyInfo
         *
         * @property {string} [key]
         * 	Defines the key that the property is related to
         * @property {string} [label]
         * 	Defines the label of the property associated with the key.
         * @property {boolean} [visible]
         *  Defines the visibility of the property.
         * @property {string} [path]
         * 	The path of the property in the data source.
         * @property {string} [dataType]
         * 	Defines the data type associated to the property.
         * @property {object} [formatOptions]
         * 	Defines if any format options are applied to the property.
         * @property {object} [constraints]
         * Defines if any constraints are applied to the property.
         * @public
         * @since 1.154
         */


        /**
         * Initialises the MDC Geomap
         *
         * @private
         */
        Geomap.prototype.init = function() {
            this._oManagedObjectModel = new ManagedObjectModel(this);
            this.setModel(this._oManagedObjectModel, "$mdcGeomap");
            Control.prototype.init.apply(this, arguments);

            this._setPropertyHelperClass(PropertyHelper);
            this._setupPropertyInfoStore("propertyInfo");
        };

        Geomap.prototype.onBeforeRendering = function () {
            Control.prototype.onBeforeRendering.apply(this, arguments);
            this._applyConfigurations();
        };

        /**
         * Applies given settings onto the MDC geomap, loads the delegate and initializes the MDC geomap
         *
         * @param {*} mSettings settings to apply
         *
         * @private
         */
        Geomap.prototype.applySettings = function(mSettings, oScope) {
            Control.prototype.applySettings.apply(this, arguments);

            this.initializedPromise = new Promise((resolve, reject) => {
                this._fnResolveInitialized = resolve;
                this._fnRejectInitialized = reject;
            });

            this.geomapBoundPromise = new Promise((resolve, reject) => {
                this._fnResolveGeomapBound = resolve;
                this._fnRejectGeomapBound = reject;
            });

            this.initControlDelegate().then(() => {
                if (!this.isDestroyed()) {
                    this._initMap();
                }
            });

        };

        /**
         * Initializes the webc in the MDC geomap (geomap instance, etc.)
         * Geomap is initialized via the delegate
         */
        Geomap.prototype._initMap = function() {


            this.getControlDelegate().initializeGeomap(this).then((oGeomap) => {

                this.setBusyIndicatorDelay(0);
                this.getControlDelegate().createInitialGeomapContent(this);

                //From now on, listen to changes on Items Aggregation and sync them with geomap
                this._oObserver?.disconnect();
                this._oObserver?.destroy();
                this._oObserver = new ManagedObjectObserver(this._propagateItemChangeToGeomap.bind(this));
                this._oObserver.observe(this, {
                    aggregations: [
                        "items"
                    ]
                });

                this._fnResolveGeomapBound();

                this._bGeomapReady = true;
                this._fnResolveInitialized();
                oGeomap.invalidate();
            }).catch((error) => {
                this._fnRejectInitialized(error);
                Log.error("mdc Geomap", "Error during initialization of geomap.");
            });

        };

        Geomap.prototype._applyConfigurations = function(){
            const oInternalMap = this._getInnerGeomap();
            if (oInternalMap) {
                oInternalMap.setCenterLat(this.getCenterLat());
                oInternalMap.setCenterLng(this.getCenterLng());
                oInternalMap.setZoom(this.getZoom());
                oInternalMap.setWidth(this.getWidth());
                oInternalMap.setHeight(this.getHeight());
            }
        };

        Geomap.prototype._geomapDataLoadComplete = function() {
            this.setBusy(false);
        };

        /**
         * Loads the delegate for the MDC geomap
         * @returns {Promise} resolved when delegate is loaded
         */
        Geomap.prototype._loadDelegate = function() {

            return new Promise((resolve) => {
                const aNotLoadedModulePaths = [this.getDelegate().name];

                function onModulesLoadedSuccess(oDelegate) {
                    resolve(oDelegate);
                }

                sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess);
            });

        };

        Geomap.prototype.getPropertyInfoSet = function() {
            return this.getPropertyHelper() ? this.getPropertyHelper().getProperties() : [];
        };

        /**
         * Rebinds the inner geomap instance by calling oDelegate.rebind
         *
         * @param {boolean} [bForceRefresh] Indicates that the binding must be refreshed regardless of any <code>bindingInfo</code> change
         * @returns {Promise} A <code>Promise</code> that resolves after rebind is executed
         * @private
         */
        Geomap.prototype._rebind = async function(bForceRefresh) {

            if (!this._bGeomapReady) {
                this.setBusy(true);
                // Wait with rebind until geomap is ready
                await this.initialized();
                this.setBusy(false);
            }

            if (!this.getControlDelegate().getGeomapBound(this)) {
                this._initMap();
                return;
            }

            const oGeomapDelegate = this.getControlDelegate();
            let oBindingInfo;
            if (oGeomapDelegate._getBindingInfo) {
                oBindingInfo = oGeomapDelegate._getBindingInfo(this);
                Log.warning("mdc Geomap", "calling the private delegate._getBindingInfo. Please make the function public!");
            } else {
                oBindingInfo = oGeomapDelegate.getBindingInfo(this);
            }
            oGeomapDelegate.updateBindingInfo(this, oBindingInfo);
            oGeomapDelegate.rebind(this, oBindingInfo);
        };

        /**
         * Handler for theme changes
         */
        Geomap.prototype.onThemeChanged = function() {
            Log.info("THEME CHANGES");
        };

        /**
         * Checks whether the geomap is initialized.
         * After initialization the delegate is loaded and the geomap is created.
         * @returns {Promise} <code>Promise</code> that resolves once MDC geomap is initialized. Contains reference to MDC geomap
         *
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Geomap.prototype.initialized = function() {
            return this.initializedPromise;
        };

        Geomap.prototype.destroy = function() {
            this._bIsDestroyed = true;
            Control.prototype.destroy.apply(this, arguments);
        };

        /**
         * Gets the managed object model.
         * @returns {sap.ui.model.base.ManagedObjectModel} the managed object model
         *
         * @private
         */
        Geomap.prototype.getManagedObjectModel = function() {
            return this._oManagedObjectModel;
        };


        /**
         * Fetches the current state of the geomap (as a JSON)<br>
         * Needed for P13n to fetch current state
         *
         * @returns {Object} Current state of the geomap
         *
         * @private
         */
        Geomap.prototype.getCurrentState = function() {
            const oState = {};

            return oState;
        };

        /**
         * Propagates a change on the "item" aggregation to the geomap via the delegate
         * The delegate must then update the geomap accordingly
         *
         * @param {object} oChange the change object from the ManagedObjectModel observer
         */
        Geomap.prototype._propagateItemChangeToGeomap = function(oChange) {

            if (this._bIsDestroyed) {
                return; //Don't propagate changes when Geomap is destroyed
            }

            // this.setBusy(true);

            this.getControlDelegate().propagateItemChangeToGeomap(this, oChange);
        };


        /**
         * Can be used to check whether the inner geomap is initialized and bound.
         * @returns {Promise} Promise that resolves once MDC geomap is bound
         *
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Geomap.prototype.innerGeomapBound = function() {
            return this.innerGeomapBoundPromise;
        };

        /**
         * Zooms in from the inner geomap.
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Geomap.prototype.zoomIn = function() {
            this.getControlDelegate().zoomIn(this);
            this.fireZoomChange();
            return this;
        };

        /**
         * Zooms out from the inner geomap.
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Geomap.prototype.zoomOut = function() {
            this.getControlDelegate().zoomOut(this);
            this.fireZoomChange();
            return this;
        };
        /**
         * Returns inner geomap instance.
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Geomap.prototype._getInnerGeomap = function() {
            return this.getAggregation("_geomap");
        };

        Geomap.prototype.exit = function() {

            delete this.geomapBoundPromise;
            delete this._fnResolveGeomapBound;
            delete this._fnRejectGeomapBound;

            delete this.initializedPromise;
            delete this._fnResolveInitialized;
            delete this._fnRejectInitialized;

            delete this._oGeomapContentPromise;

            Control.prototype.exit.apply(this, arguments);

            this._oObserver?.destroy();
            delete this._oObserver;
        };

        /**
         * @name sap.ui.mdc.Geomap#addItem
         * @private
         * @ui5-restricted sap.ui.mdc, sap.ui.fl
         */

        /**
         * @name sap.ui.mdc.Geomap#removeItem
         * @private
         * @ui5-restricted sap.ui.mdc, sap.ui.fl
         */

        /**
         * @name sap.ui.mdc.Geomap#removeAllItems
         * @private
         * @ui5-restricted sap.ui.mdc, sap.ui.fl
         */

        /**
         * @name sap.ui.mdc.Geomap#setPropertyInfo
         * @private
         * @ui5-restricted sap.ui.mdc, sap.ui.fl
         */

        /**
         * @name sap.ui.mdc.Geomap#getPropertyInfo
         * @private
         * @ui5-restricted sap.ui.mdc, sap.ui.fl
         */

        return Geomap;
    });