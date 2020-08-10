/*!
 * ${copyright}
 */

sap.ui.define(
    ["sap/ui/mdc/util/loadModules", 'sap/base/util/merge'
],
    function (loadModules, merge) {
        "use strict";

        var AdaptationController;
        var FlexUtil;

        /**
         * @namespace
         * @name sap.ui.mdc.mixin
         * @private
         * @experimental
         * @ui5-restricted sap.ui.mdc
         */

        /**
         * Enhances a given control prototype with consolidated handling for adaptation.
         *
         * The following methods are available:
         *
         * <ul>
         * <li><code>retrieveAdaptationController</code> - Provides access to the adaptation controller initialization <code>Promise</code>.</li>
         * <li><code>getAdaptationController</code> - Enhances the adaptationConfig property and keeps <code>_oAdaptationController</code> properties in sync.</li>
         * <li><code>enhanceAdaptationConfig</code> - Returns the adaptation controller instance, if available.</li>

         * <li><code>getAdaptationConfigAttribute</code> - Returns an adaptationConfig attribute.</li>
         * </ul>
         *
         * Additionally, the following methods are wrapped:
         *
         * <ul>
         * <li><code>exit</code></li>
         * </ul>
         *
         * The <code>retrieveAdaptationController</code> method creates the following instance fields:
         *
         * <ul>
         * <li><code>_oAdaptationController</code> - Instance of sap.ui.mdc.p13n.AdaptationController</li>
         * </ul>
         *
         * @author SAP SE
         * @version ${version}
         * @alias sap.ui.mdc.mixin.AdaptationMixin
         * @namespace
         * @since 1.82.0
         * @private
         * @experimental
         * @ui5-restricted sap.ui.mdc
        */
        var AdaptationMixin = {};


        /**
         * Initializes the adaptation controller instance related to the enhanced control.
         *
         * @private
         * @returns {Promise<sap.ui.mdc.p13n.AdaptationController>} Returns a <code>Promise</code> that resolves the adaptation controller instance, if available
         */
        AdaptationMixin.retrieveAdaptationController = function () {

            if (!this.getProperty("adaptationConfig")) {
                throw new Error(
                    "Please provide an adaptation config for this control before instantiating an adaptation controller."
                );
            }

            var onAsyncDependencies = function () {
                if (!this._oAdaptationController) {
                    this._oAdaptationController = new AdaptationController(
                        Object.assign(
                            {
                                stateRetriever: function (
                                    oControl,
                                    oDelegate
                                ) {
                                    return this.getCurrentState();
                                },
                                adaptationControl: this,
                                afterChangesCreated: function (
                                    oAdaptationController,
                                    aChanges
                                ) {
                                    FlexUtil.handleChanges(aChanges);
                                }
                            },
                            this.getProperty("adaptationConfig")
                        )
                    );
                }
                return this._oAdaptationController;
            };

            return loadModules(["sap/ui/mdc/p13n/AdaptationController", "sap/ui/mdc/p13n/FlexUtil"])
            .then(function (modules) {
                AdaptationController = modules[0];
                FlexUtil = modules[1];
            })
            .then(
                function () {
                    if (!this.bIsDestroyed) {
                        return onAsyncDependencies.call(this);
                    }
                }.bind(this)
            );
        };

        /**
         * Returns the adaptation controller instance related to the enhanced control.
         *
         * @private
         * @returns {sap.ui.mdc.AdaptationController} Returns a <code>sap.ui.mdc.AdaptationController</code> instance, if available
         */
        AdaptationMixin.getAdaptationController = function () {
            if (!this._oAdaptationController) {
                throw new Error(
                    "An adaptation controller instance is not (yet) available. You must call retrieveAdaptationController before calling getAdaptationController."
                );
            }
            return this._oAdaptationController;
        };

        /**
         * Returns the adaptation controller instance related to the enhanced control.
         *
         * @private
         * @param {string} sAdaptationType adaptationConfig attribute (see {@link sap.ui.mdc.Control})
         * @returns {object} Returns a an attribute of the adaptationConfig property (see {@link sap.ui.mdc.Control})
         */
        AdaptationMixin.getAdaptationConfigAttribute = function (
            sAdaptationType
        ) {
            var oAdaptationConfig = this.getAdaptationConfig();

            if (!oAdaptationConfig) {
                throw new Error(
                    "Please provide an adaptation config for this control before calling getAdaptationConfigAttribute."
                );
            }

            return oAdaptationConfig && oAdaptationConfig[sAdaptationType];
        };

        /**
         * Enhances the adaptationConfig property and keeps <code>_oAdaptationController</code> properties in sync.
         * @private
         * @returns {object} Returns the enhanced control instance
         */
        AdaptationMixin.enhanceAdaptationConfig = function (oData) {
            var nextValue = merge(this.getAdaptationConfig(), oData);
            if (this._oAdaptationController) {
                Object.keys(oData).forEach(function (sKey) {
                    this._oAdaptationController.setProperty(sKey, nextValue[sKey]);
                }.bind(this));
            }
            this.setProperty("adaptationConfig", nextValue);
            return this;
        };

        /**
         * Enhances the adaptationConfig property and keeps <code>_oAdaptationController</code> properties in sync.
         * @private
         * @returns {object} Returns the enhanced control instance
         */
        AdaptationMixin.retrieveInbuiltFilter = function (fnRegister, bAdvancedMode) {
            return new Promise(function(resolve, reject) {
                sap.ui.require(["sap/ui/mdc/filterbar/p13n/AdaptationFilterBar"], function(AdaptationFilterBar) {
                    if (!this._oP13nFilter) {
                        //create instance of 'AdaptationFilterBar'
                        this._oP13nFilter = new AdaptationFilterBar(this.getId() + "-p13nFilter",{
                            adaptationControl: this,
                            advancedMode: bAdvancedMode,
                            filterConditions: this.getFilterConditions()
                        });

                        if (fnRegister instanceof Function){
                            fnRegister.call(this, this._oP13nFilter);
                        }

                        this.enhanceAdaptationConfig({
                            filterConfig: {
                                initializeControl: this._oP13nFilter.createFilterFields
                            }
                        });

                        this.addDependent(this._oP13nFilter);
                        resolve(this._oP13nFilter);
                    } else {
                        resolve(this._oP13nFilter);
                    }
                }.bind(this));
            }.bind(this));
        };


        /**
         * Provides designTime configuration for the runtime adaptation settings action on the given control
         *
         * @private
     	 * @param {object} mPropertyBag The flexibility property bag
         * @returns {Promise} Returns a handler for the runtime adaptation settings action
         */
        AdaptationMixin.getRTASettingsActionHandler = function (mPropertyBag) {
            return new Promise(function (resolve, reject) {
                this.retrieveAdaptationController().then(function (oAdaptationController) {
                    var bCurrentLiveMode = oAdaptationController.getLiveMode();
                    if (bCurrentLiveMode) {
                        oAdaptationController.setLiveMode(false);
                    }
                    var fnRuntimeHandling = oAdaptationController.getAfterChangesCreated();
                    var fnEnhanceDialog = function (oEvt) {
                        var oContainer = oEvt.getParameter("container");
                        oContainer.isPopupAdaptationAllowed = function () {
                            return false;
                        };
                        oContainer.addStyleClass(mPropertyBag.styleClass);
                    };
                    oAdaptationController.attachEvent("beforeP13nContainerOpens", fnEnhanceDialog);

                    oAdaptationController.setAfterChangesCreated(function (oAC, aChanges) {
                        //callback is only executed in "Ok" case
                        resolve(aChanges);
                    });

                    var fnResolveAndCleanup = function (oEvt) {
                        var sReason = oEvt.getParameter("reason");

                        //resolve changes empty for "Cancel"
                        if (sReason == "Cancel") {
                            resolve([]);
                        }

                        //cleanup (detach events)
                        oAdaptationController.setAfterChangesCreated(fnRuntimeHandling);
                        if (bCurrentLiveMode) {
                            oAdaptationController.setLiveMode(bCurrentLiveMode);
                        }
                        oAdaptationController.detachEvent("beforeP13nContainerOpens", fnEnhanceDialog);
                        oAdaptationController.detachEvent("afterP13nContainerCloses", fnResolveAndCleanup);
                    };
                    oAdaptationController.attachEvent("afterP13nContainerCloses", fnResolveAndCleanup);
                    oAdaptationController.showP13n(this, "Item");
                });
            }.bind(this));
        };


        /**
         * Provides cleanup functionality for possible created adaptation related entities
         *
         * @private
         * @param {function} fnExit Existing exit callback function
         * @returns {function} Returns a thunk applicable to a control prototype, wrapping an existing exit method
         */
        AdaptationMixin.exit = function (fnExit) {
            return function () {
                if (this._oAdaptationController) {
                    this._oAdaptationController.destroy();
                    this._oAdaptationController = null;
                }

                if (fnExit) {
                    fnExit.apply(this, arguments);
                }
            };
        };

        return function () {
            this.retrieveAdaptationController = AdaptationMixin.retrieveAdaptationController;
            this.getAdaptationController = AdaptationMixin.getAdaptationController;
            this.enhanceAdaptationConfig = AdaptationMixin.enhanceAdaptationConfig;
            this.getAdaptationConfigAttribute = AdaptationMixin.getAdaptationConfigAttribute;
            this.getRTASettingsActionHandler = AdaptationMixin.getRTASettingsActionHandler;
            this.retrieveInbuiltFilter = AdaptationMixin.retrieveInbuiltFilter;
            this.exit = AdaptationMixin.exit(this.exit);
        };
    },
    /* bExport= */ true
);
