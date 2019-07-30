/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/base/util/ObjectPath",
    "./Config",
    "sap/base/util/merge",
    "sap/base/util/deepClone",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode"
], function (
    Control,
    ObjectPath,
    Config,
    merge,
    deepClone,
    JSONModel,
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
        if (this._oPropertiesModel) {
            this._oPropertiesModel.destroy();
        }
        this.destroyPropertyEditors();
    };

    BaseEditor.prototype._initialize = function () {
        this._cleanup();
        var oMergedConfig = this._mergeConfig();
        this._createModels(oMergedConfig);
        this._createEditors(oMergedConfig);
    };

    BaseEditor.prototype._mergeConfig = function () {
        if (this._oMergedConfig) {
            this._oMergedConfig.setData(this.getConfig());
        } else {
            this._oMergedConfig = new Config({data : this.getConfig()});
        }
        return deepClone(this._oMergedConfig.getData());
    };

    BaseEditor.prototype._syncPropertyValue = function(oProperty) {
        var oContext = this._oContextModel.getData();

        if (oContext && oProperty.path) {
            oProperty.value = ObjectPath.get(oProperty.path.split("/"), oContext);
        }

        if (typeof oProperty.value === "undefined") {
            oProperty.value = oProperty.defaultValue;
        }
    };

    BaseEditor.prototype._createModels = function (oConfig) {
        var oContex = this.getJson();
        if (oConfig.context) {
            oContex = ObjectPath.get(oConfig.context.split("/"), oContex);
        }
        this._oContextModel = new JSONModel(oContex);
        this._oContextModel.setDefaultBindingMode(BindingMode.OneWay);

        oConfig.properties = Object.keys(oConfig.properties).map(function(sPropertyName) {
            var oProperty = oConfig.properties[sPropertyName];
            oProperty.name = sPropertyName;
            if (oProperty.path) {
                this._syncPropertyValue(oProperty);
            }
            return oProperty;
        }.bind(this));

        this._oPropertiesModel = new JSONModel(oConfig.properties);
        this._oPropertiesModel.setDefaultBindingMode(BindingMode.OneWay);
    };

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
                var oPropertyContext = this._oPropertiesModel.getContext("/" + iIndex);
                var Editor = mEditors[oPropertyContext.getObject().type];
                if (Editor) {
                    this._createPropertyEditor(Editor, oPropertyContext);
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

        oPropertyEditor.setModel(this._oPropertiesModel);
        oPropertyEditor.setBindingContext(oPropertyContext);
        oPropertyEditor.setModel(this._oContextModel, "context");
        oPropertyEditor.attachPropertyChanged(this._onPropertyChanged.bind(this));
        this.addPropertyEditor(oPropertyEditor);
    };

    BaseEditor.prototype._onPropertyChanged = function(oEvent) {
        this._oContextModel.setProperty("/" + oEvent.getParameter("path"), oEvent.getParameter("value"));

        var oProperty;
        var iIndex = this._oPropertiesModel.getData().findIndex(function(oFoundProperty) {
            if (oFoundProperty.path === oEvent.getParameter("path")) {
                oProperty = oFoundProperty;
                return true;
            }
        });

        if (iIndex !== -1) {
            this._syncPropertyValue(oProperty);
            this._oPropertiesModel.checkUpdate();
        }

        this.fireJsonChanged({
            json: deepClone(this.getJson())
        });
    };

    return BaseEditor;
});
