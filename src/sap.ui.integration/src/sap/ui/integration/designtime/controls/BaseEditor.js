/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/model/resource/ResourceModel",
    "sap/base/util/ObjectPath",
    "./Config",
    "sap/base/util/deepClone",
    "sap/ui/model/json/JSONModel",
    "sap/base/i18n/ResourceBundle",
	"sap/ui/model/BindingMode"
], function (
    Control,
    ResourceModel,
    ObjectPath,
    Config,
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
                    type: "object"
                }
            }
        },

        exit: function () {
            this._cleanup();
            if (this._oMergedConfig) {
                this._oMergedConfig.destroy();
            }
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

        setConfig: function (oConfig) {
            var vReturn = this.setProperty("config", oConfig, false);
            this._initialize();
            return vReturn;
        },

        setJson: function (oJSON) {
            if (typeof oJSON === "string") {
                oJSON = JSON.parse(oJSON);
            }
            var vReturn = this.setProperty("json", oJSON, false);
            this._initialize();
            return vReturn;
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
        var oMergedConfig = this._mergeConfig();
        this._createModels(oMergedConfig);
        this._createEditors(oMergedConfig);
    };


    /**
     * Todo: refactor -> setConfig
     */
    BaseEditor.prototype._mergeConfig = function () {
        if (this._oMergedConfig) {
            this._oMergedConfig.setData(this.getConfig());
        } else {
            this._oMergedConfig = new Config({data : this.getConfig()});
        }
        return deepClone(this._oMergedConfig.getData());
    };

    BaseEditor.prototype._createModels = function (oConfig) {
        this._createContextModel(oConfig);
        this._createPropertyModel(oConfig);
        this._createI18nModel(oConfig);
    };


    /**
     * Context model is used as interface (read-only) for property editors.
     * Context model wraps context object, which is edited by the base editor
     * @param  {} oConfig merged config
     */
    BaseEditor.prototype._createContextModel = function (oConfig) {
        var oContext = this.getJson();
        if (oConfig.context) {
            oContext = ObjectPath.get(oConfig.context.split("/"), oContext);
        }
        this._oContextModel = new JSONModel(oContext);
        this._oContextModel.setDefaultBindingMode(BindingMode.OneWay);
    };


    /**
     * Property model is used as interface (read-only) for property editors.
     * Property model wraps property section of config and keeps values in sync with the edited json
     * @param  {} oConfig merged config
     */
    BaseEditor.prototype._createPropertyModel = function (oConfig) {
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
     * @param  {} oConfig merged config
     */
    BaseEditor.prototype._createI18nModel = function (oConfig) {
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
     * @param  {} oConfig merged config
     */
    BaseEditor.prototype._createEditors = function (oConfig) {
        var aTypes = Object.keys(oConfig.propertyEditors);
        var aModules = aTypes.map(function(sType) {
            return oConfig.propertyEditors[sType];
        });

        var mEditors = {};

        sap.ui.require(aModules, function() {
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
