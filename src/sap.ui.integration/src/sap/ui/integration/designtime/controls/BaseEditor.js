/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/resource/ResourceModel",
	"./utils/ObjectBinding",
	"sap/base/util/ObjectPath",
	"sap/base/util/merge",
	"sap/base/util/deepClone",
	"sap/ui/model/json/JSONModel",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/model/BindingMode"
], function(
	Control,
	ResourceModel,
	ObjectBinding,
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
				"_propertyEditors": {
					type: "sap.ui.core.Control",
					visibility: "hidden"
				}
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

		init: function() {
			this.setConfig({});
		},

		exit: function() {
			this._cleanup();
		},

		renderer: function(oRm, oEditor) {
			oRm.openStart("div", oEditor);
			oRm.openEnd();

			oEditor.getPropertyEditors().forEach(function(oPropertyEditor) {
				oRm.renderControl(oPropertyEditor);
			});

			oRm.close("div");
		},

		setJson: function(oJSON) {
			if (typeof oJSON === "string") {
				oJSON = JSON.parse(oJSON);
			}
			var vReturn = this.setProperty("json", oJSON, false);
			this._initialize();
			return vReturn;
		},

		/**
		 * To be used only in constructor when inheriting from xEditor to add additional default config
		 * @param  {object} oConfig to merge with previous default
		 */
		addDefaultConfig: function(oConfig) {
			return this.setProperty("_defaultConfig",
				this._mergeConfig(this.getProperty("_defaultConfig"), oConfig)
			);
		},

		setConfig: function(oConfig) {
			return this._setConfig(
				this._mergeConfig(this.getProperty("_defaultConfig"), oConfig)
			);
		},

		addConfig: function(oNewConfig) {
			return this._setConfig(
				this._mergeConfig(this.getConfig(), oNewConfig)
			);
		},

		getPropertyEditor: function(sPropertyName) {
			return this._mPropertyEditors[sPropertyName];
		},

		getPropertyEditors: function(vTag) {
			var hasTag = function(oPropertyEditor, sTag) {
				return oPropertyEditor.getPropertyInfo().tags && (oPropertyEditor.getPropertyInfo().tags.indexOf(sTag) !== -1);
			};

			if (!vTag) {
				return this.getAggregation("_propertyEditors") || [];
			} else if (typeof vTag === "string") {
				return this.getPropertyEditors().filter(function(oPropertyEditor) {
					return hasTag(oPropertyEditor, vTag);
				});
			} else if (Array.isArray(vTag)) {
				return this.getPropertyEditors().filter(function(oPropertyEditor) {
					return vTag.every(function(sTag) {
						return hasTag(oPropertyEditor, sTag);
					});
				});
			} else {
				return [];
			}
		}
	});

	BaseEditor.prototype._mergeConfig = function(oTarget, oSource) {
		var oResult = merge({}, oTarget, oSource);
		// concat i18n properties to avoid override
		oResult.i18n = [].concat(oTarget.i18n || [], oSource.i18n || []);
		return oResult;
	};

	BaseEditor.prototype._setConfig = function(oConfig) {
		var vReturn = this.setProperty("config", oConfig, false);
		this._initialize();
		return vReturn;
	};

	BaseEditor.prototype._cleanup = function(oConfig) {
		if (this._oContextModel) {
			this._oContextModel.destroy();
			delete this._oContextModel;
		}
		if (this._oPropertyModel) {
			this._oPropertyModel.destroy();
			delete this._oPropertyModel;
		}
		if (this._oI18nModel) {
			this._oI18nModel.destroy();
			delete this._oI18nModel;
		}
		if (this._oPropertyObjectBinding) {
			this._oPropertyObjectBinding.destroy();
			delete this._oPropertyObjectBinding;
		}
		delete this._mEditorClasses;
		this._mPropertyEditors = {};
		this.destroyAggregation("_propertyEditors");
	};

	BaseEditor.prototype._initialize = function() {
		this._cleanup();
		if (this.getConfig() && this.getConfig().properties) {
			this._createModels();
			this._createEditors();
		}
	};

	BaseEditor.prototype._createModels = function() {
		this._createContextModel();
		this._createPropertyModel();
		this._createI18nModel();
	};


	/**
	 * Context model is used as interface (read-only) for property editors.
	 * Context model wraps context object, which is edited by the base editor
	 */
	BaseEditor.prototype._createContextModel = function() {
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
	BaseEditor.prototype._createPropertyModel = function() {
		var oConfig = this.getConfig();

		this._oPropertyModel = new JSONModel(oConfig.properties);
		this._oPropertyModel.setDefaultBindingMode(BindingMode.OneWay);

		// this allows to bind properties fields against "properties" model
		this._oPropertyObjectBinding = new ObjectBinding(oConfig.properties, this._oPropertyModel, "properties");

		Object.keys(oConfig.properties).forEach(function(sPropertyName) {
			var oProperty = oConfig.properties[sPropertyName];
			if (oProperty.path) {
				this._syncPropertyValue(oProperty);
			}
		}.bind(this));
	};

	/**
	 * I18n model is used as interface (read-only) for property editors.
	 * I18n model created from all i18n bundles in the merged config.
	 * To separate properties from different bundles namespacing should be user, e.g. i18n>BASE_EDITOR.PROPERTY
	 */
	BaseEditor.prototype._createI18nModel = function() {
		var oConfig = this.getConfig();
		oConfig.i18n.forEach(function(sI18nPath) {
			ResourceBundle.create({
				url: sap.ui.require.toUrl(sI18nPath),
				async: true
			}).then(function (oBundle) {
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
		}.bind(this));
	};

	/**
	 * Synchronizes oProperty value with manifest, if path is defined
	 * TODO: support expression binding?
	 * @param  {object} oProperty object from configuration
	 */
	BaseEditor.prototype._syncPropertyValue = function(oProperty) {
		var oContext = this._oContextModel.getData();
		if (oContext && oProperty.path) {
			oProperty.value = ObjectPath.get(oProperty.path.split("/"), oContext);
		}
		if (typeof oProperty.value === "undefined") {
			oProperty.value = oProperty.defaultValue;
		}

		// TODO: those are specific cases relying on specific property editors, move this logic to property editors instead?
		if (oProperty.type === "array") {
			this._createArrayPropertyItems(oProperty);
		}
	};

	BaseEditor.prototype._createArrayPropertyItems = function(oProperty) {
		if (oProperty.value && oProperty.template) {
			oProperty.items = [];
			oProperty.value.forEach(function(oValue, iIndex) {
				var mItem = deepClone(oProperty.template);
				Object.keys(mItem).forEach(function(sKey) {
					var oItemProperty = mItem[sKey];
					if (oItemProperty.path) {
						oItemProperty.path = oItemProperty.path.replace(":index", iIndex);
					}
					this._syncPropertyValue(oItemProperty);
				}.bind(this));
				oProperty.items.push(mItem);
			}.bind(this));
		}
	};

	/**
	 * Requires all editor modules and creates editor instances for all configurable properties
	 */
	BaseEditor.prototype._createEditors = function() {
		var oConfig = this.getConfig();
		var aTypes = Object.keys(oConfig.propertyEditors);
		var aModules = aTypes.map(function(sType) {
			return oConfig.propertyEditors[sType];
		});

		this._mEditorClasses = {};

		this._iCreateEditorsCallCount = (this._iCreateEditorsCallCount || 0) + 1;
		var iCurrentCall = this._iCreateEditorsCallCount;
		sap.ui.require(aModules, function() {
			// check whether this is still the most recent call of _createEditors (otherwise config is invalid)
			if (this._iCreateEditorsCallCount === iCurrentCall) {
				Array.from(arguments).forEach(function(Editor, iIndex) {
					this._mEditorClasses[aTypes[iIndex]] = Editor;
				}.bind(this));

				Object.keys(oConfig.properties).forEach(function(sPropertyName) {
					var oPropertyContext = this._oPropertyModel.getContext("/" + sPropertyName);
					var Editor = this._mEditorClasses[oPropertyContext.getObject().type];
					if (Editor) {
						this._mPropertyEditors[sPropertyName] = this._createPropertyEditor(Editor, oPropertyContext);
						this.addAggregation("_propertyEditors", this._mPropertyEditors[sPropertyName]);
					}
				}.bind(this));

				this.firePropertyEditorsReady({propertyEditors: this.getPropertyEditors()});
			}
		}.bind(this));
	};

	BaseEditor.prototype.createPropertyEditor = function(oPropertyContext) {
		var Editor = this._mEditorClasses[oPropertyContext.getObject().type];
		if (Editor) {
			return this._createPropertyEditor(Editor, oPropertyContext);
		}
	};

	BaseEditor.prototype._createPropertyEditor = function(Editor, oPropertyContext) {
		var oPropertyEditor = new Editor({
			visible: typeof oPropertyContext.getObject().visible !== undefined
			? oPropertyContext.getObject().visible
			: true
		});
		// TODO: control styling via editor properties?
		oPropertyEditor.addStyleClass("sapUiTinyMargin");
		oPropertyEditor.setEditor(this);
		oPropertyEditor.setModel(this._oPropertyModel);
		oPropertyEditor.setBindingContext(oPropertyContext);
		oPropertyEditor.setModel(this._oContextModel, "context");
		oPropertyEditor.attachPropertyChanged(this._onPropertyChanged.bind(this));

		return oPropertyEditor;
	};

	BaseEditor.prototype._onPropertyChanged = function(oEvent) {
		var sPath = oEvent.getParameter("path");
		var sCurPath = "/";
		var aParts = sPath.split("/");

		// if nested property is set, ensure hierarchy exists
		for (var i = 0; i < aParts.length - 1; i++ ) {
			sCurPath += aParts[i];
			if (!this._oContextModel.getProperty(sCurPath)) {
				this._oContextModel.setProperty(sCurPath, {});
			}
		}

		this._oContextModel.setProperty("/" + sPath, oEvent.getParameter("value"));
		this._updatePropertyValue(sPath);
		this.fireJsonChanged({
			json: deepClone(this.getJson()) // to avoid manipulations with the json outside of the editor
		});
	};

	/**
	 * Updates values of properties in the property model, which are connected to sPath in the context object
	 * @param  {string} sPath where change happened in context model
	 */
	BaseEditor.prototype._updatePropertyValue = function(sPath) {
		var mProperties = this._oPropertyModel.getData();
		Object.keys(mProperties).filter(function(sKey) {
			return mProperties[sKey].path === sPath;
		}).forEach(function(sKey) {
			this._syncPropertyValue(mProperties[sKey]);
		}.bind(this));
		this._oPropertyModel.checkUpdate();
	};

	return BaseEditor;
});
