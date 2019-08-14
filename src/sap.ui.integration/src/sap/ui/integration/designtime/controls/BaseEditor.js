/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/model/resource/ResourceModel",
    "sap/base/util/ObjectPath",
    'sap/base/util/merge',
    "sap/base/util/deepClone",
    "sap/ui/model/json/JSONModel",
    "sap/base/i18n/ResourceBundle",
	"sap/ui/model/BindingMode"
], function (
    Control,
    ResourceModel,
    ObjectPath,
    merge,
    deepClone,
    JSONModel,
    ResourceBundle,
    BindingMode
) {
    "use strict";

    /**
     * @constructor
     * @private
     * @experimental
     */
    var BaseEditor = Control.extend("sap.ui.integration.designtime.controls.BaseEditor", {
        metadata: {
            properties: {
                "config": {
                    type: "object"
                },
                "json": {
                    type: "object",
                    multiple: false
                },
                "_defaultConfig": {
                    type: "object",
                    visibility: "hidden",
                    // do not override during inheritance, use this.addDefaultConfig instead!
                    defaultValue: {}
                }
            },
            aggregations: {
                "propertyEditors": {
                    type: "sap.ui.core.Control"
                }
            },
            associations: {
            },
            events: {
                jsonChanged: {
                    parameters: {
                        json: {type: "object"}
                    }
                },
                propertyEditorsReady: {
                    parameters: {
                        propertyEditors: {type: "array"}
                    }
                }
            }
        },

        init: function () {
            this.setConfig({});
        },

        exit: function () {
            this._cleanup();
        },

        renderer: function (oRm, oEditor) {
            oRm.write("<div");
            oRm.writeElementData(oEditor);
            oRm.addClass("sapUiIntegrationEditor");
            oRm.writeClasses();
            oRm.writeStyles();
            oRm.write(">");

            oEditor.getPropertyEditors().forEach(function(oPropertyEditor) {
                oRm.renderControl(oPropertyEditor);
            });

            oRm.write("</div>");
        },

        setJson: function (oJSON) {
            if (typeof oJSON === "string") {
                oJSON = JSON.parse(oJSON);
            }
            var vReturn = this.setProperty("json", oJSON, false);
            this._initialize();
            return vReturn;
        },

        /**
         * To be used only in constructor when inheriting from xEditor to add additional default config
         * @param  {} oConfig to merge with previous default
         */
        addDefaultConfig: function(oConfig) {
            this.setProperty("_defaultConfig",
                this._mergeConfig(this.getProperty("_defaultConfig"), oConfig)
            );
        },

        _mergeConfig: function(oTarget, oSource) {
            var oResult = deepClone(oTarget);
            merge(oResult, oSource);
            // concat i18n properties to avoid override
            oResult.i18n = [].concat(oTarget.i18n || [], oSource.i18n || []);
            return oResult;
        },

        setConfig: function (oConfig) {
            return this._setConfig(
                this._mergeConfig(this.getProperty("_defaultConfig"), oConfig)
            );
        },

        _setConfig: function(oConfig) {
            var vReturn = this.setProperty("config", oConfig, false);
            this._initialize();
            return vReturn;
        },

        addConfig: function (oNewConfig) {
            return this._setConfig(
                this._mergeConfig(this.getConfig(), oNewConfig)
            );
        }
    });

    BaseEditor.prototype._cleanup = function (oConfig) {
        if (this._oContextModel) {
            this._oContextModel.destroy();
        }
        if (this._oPropertyModel) {
            this._oPropertyModel.destroy();
        }
        if (this._oI18nModel) {
            this._oI18nModel.destroy();
        }
        this.destroyPropertyEditors();
    };

    BaseEditor.prototype._initialize = function () {
        this._cleanup();
        if (this.getConfig() && this.getConfig().properties) {
            this._createModels();
            this._createEditors();
        }
    };

    BaseEditor.prototype._createModels = function () {
        this._createContextModel();
        this._createPropertyModel();
        this._createI18nModel();
    };


    /**
     * Context model is used as interface (read-only) for property editors.
     * Context model wraps context object, which is edited by the base editor
     */
    BaseEditor.prototype._createContextModel = function () {
        var oContext = this.getJson();
        var oConfig = this.getConfig();
        if (oConfig.context) {
            oContext = ObjectPath.get(oConfig.context.split("/"), oContext);
        }
        this._oContextModel = new JSONModel(oContext);
        this._oContextModel.setDefaultBindingMode(BindingMode.OneWay);
    };


    /**
     * Property model is used as interface (read-only) for property editors.
     * Property model wraps property section of config and keeps values in sync with the edited json
     */
    BaseEditor.prototype._createPropertyModel = function () {
        var oConfig = this.getConfig();
        oConfig.properties = Object.keys(oConfig.properties).map(function(sPropertyName) {
            var oProperty = oConfig.properties[sPropertyName];
            oProperty.name = sPropertyName;
            if (oProperty.path) {
                this._syncPropertyValue(oProperty);
            }
            return oProperty;
        }.bind(this));
        this._oPropertyModel = new JSONModel(oConfig.properties);
        this._oPropertyModel.setDefaultBindingMode(BindingMode.OneWay);
    };

    /**
     * I18n model is used as interface (read-only) for property editors.
     * I18n model created from all i18n bundles in the merged config.
     * To separate properties from different bundles namespacing should be user, e.g. i18n>BASE_EDITOR.PROPERTY
     */
    BaseEditor.prototype._createI18nModel = function () {
        var oConfig = this.getConfig();
        oConfig.i18n.forEach(function(sI18nPath) {
            var oBundle = ResourceBundle.create({
                url: sap.ui.require.toUrl(sI18nPath)
            });
            if (!this._oI18nModel) {
                this._oI18nModel = new ResourceModel({
                    bundle: oBundle
                });
                this.setModel(this._oI18nModel, "i18n");
                this._oI18nModel.setDefaultBindingMode(BindingMode.OneWay);
            } else {
                this._oI18nModel.enhance(oBundle);
            }
        }.bind(this));
    };

    /**
     * Synchronizes oProperty value with manifest, if path is defined
     * TODO: support expression binding?
     * @param  {} oProperty object from configuration
     */
    BaseEditor.prototype._syncPropertyValue = function(oProperty) {
        var oContext = this._oContextModel.getData();

        if (oContext && oProperty.path) {
            oProperty.value = ObjectPath.get(oProperty.path.split("/"), oContext);
        }

        if (typeof oProperty.value === "undefined") {
            oProperty.value = oProperty.defaultValue;
        }
    };

    /**
     * Requires all editor modules and creates editor instances for all configurable properties
     */
    BaseEditor.prototype._createEditors = function () {
        var oConfig = this.getConfig();
        var aTypes = Object.keys(oConfig.propertyEditors);
        var aModules = aTypes.map(function(sType) {
            return oConfig.propertyEditors[sType];
        });

        var mEditors = {};

        this.__createEditorsCallCount = (this.__createEditorsCallCount || 0) + 1;
        var iCurrentCall = this.__createEditorsCallCount;
        sap.ui.require(aModules, function() {
            // check whether this is still the most recent call of _createEditors (otherwise config is invalid)
            if (this.__createEditorsCallCount === iCurrentCall) {
                Array.from(arguments).forEach(function(Editor, iIndex) {
                    mEditors[aTypes[iIndex]] = Editor;
                });

                for (var iIndex = 0; iIndex < oConfig.properties.length; iIndex++) {
                    var oPropertyContext = this._oPropertyModel.getContext("/" + iIndex);
                    var Editor = mEditors[oPropertyContext.getObject().type];
                    if (Editor) {
                        this.addPropertyEditor(this._createPropertyEditor(Editor, oPropertyContext));
                    }
                }

                this.firePropertyEditorsReady({propertyEditors: this.getPropertyEditors()});
            }
        }.bind(this));
    };

    BaseEditor.prototype._createPropertyEditor = function (Editor, oPropertyContext) {
        var oPropertyEditor = new Editor({
            visible: typeof oPropertyContext.getObject().visible !== undefined
                ? oPropertyContext.getObject().visible
                : true
        });

        oPropertyEditor.setModel(this._oPropertyModel);
        oPropertyEditor.setBindingContext(oPropertyContext);
        oPropertyEditor.setModel(this._oContextModel, "context");
        oPropertyEditor.attachPropertyChanged(this._onPropertyChanged.bind(this));

        return oPropertyEditor;
    };

    BaseEditor.prototype._onPropertyChanged = function(oEvent) {
        var sPath = oEvent.getParameter("path");
        this._oContextModel.setProperty("/" + sPath, oEvent.getParameter("value"));

        this._updatePropertyModel(sPath);

        this.fireJsonChanged({
            json: deepClone(this.getJson()) // to avoid manipulations with the json outside of the editor
        });
    };

    /**
     * Updates values of properties in the property model, which are connected to sPath in the context object
     * @param  {} sPath where change happened in context model
     */
    BaseEditor.prototype._updatePropertyModel = function(sPath) {
        this._oPropertyModel.getData().filter(function(oFoundProperty) {
            return oFoundProperty.path === sPath;
        }).forEach(function(oProperty) {
            this._syncPropertyValue(oProperty);
        }.bind(this));
        this._oPropertyModel.checkUpdate();
    };

    return BaseEditor;
});
