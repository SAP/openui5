/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/resource/ResourceModel",
	"sap/base/util/ObjectPath",
	"sap/base/util/merge",
	"sap/base/util/deepClone",
	"sap/ui/model/json/JSONModel",
	"sap/base/i18n/ResourceBundle"
], function(
	Control,
	ResourceModel,
	ObjectPath,
	merge,
	deepClone,
	JSONModel,
	ResourceBundle
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
					type: "object"
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

		renderer: function(oRm, oEditor) {
			oRm.openStart("div", oEditor);
			oRm.openEnd();

			oEditor.getPropertyEditors().forEach(function(oPropertyEditor) {
				oRm.renderControl(oPropertyEditor);
			});

			oRm.close("div");
		},

		exit: function() {
			this._cleanup();
		},

		setJson: function(vJson) {
			var oJson;
			if (typeof vJson === "string") {
				oJson = JSON.parse(vJson);
			} else {
				// to avoid that object is changed outside of the editor
				oJson = deepClone(vJson);
			}
			var vReturn = this.setProperty("json", oJson, false);
			this._initialize();
			return vReturn;
		},

		/**
		 * To be used only in constructor when inheriting from xEditor to add additional default config
		 * @param  {object} oConfig to merge with previous default
		 */
		addDefaultConfig: function(oConfig) {
			this.setProperty("_defaultConfig",
				this._mergeConfig(this.getProperty("_defaultConfig"), oConfig)
			);
			this.setConfig(this._oUnmergedConfig || {});
			return this;
		},

		setConfig: function(oConfig) {
			this._oUnmergedConfig = oConfig;
			return this._setConfig(
				this._mergeConfig(this.getProperty("_defaultConfig"), oConfig)
			);
		},

		getPropertyEditor: function(sPropertyName) {
			return this._mPropertyEditors[sPropertyName];
		},

		getPropertyEditors: function(vTag) {
			var hasTag = function(oPropertyEditor, sTag) {
				return oPropertyEditor.getConfig().tags && (oPropertyEditor.getConfig().tags.indexOf(sTag) !== -1);
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
		if (this._oI18nModel) {
			this._oI18nModel.destroy();
			delete this._oI18nModel;
		}
		if (this._oContextModel) {
			this._oContextModel.destroy();
			delete this._oContextModel;
		}
		delete this._mEditorClasses;
		this._mPropertyEditors = {};
		this.destroyAggregation("_propertyEditors");
	};

	BaseEditor.prototype._initialize = function() {
		this._cleanup();
		var oJson = this.getJson();
		var oConfig = this.getConfig();
		if (oJson && oConfig && oConfig.properties) {
			var oContext = oJson;
			if (oConfig.context) {
				oContext = ObjectPath.get(oConfig.context.split("/"), this.getJson());
			}
			this._oContextModel = new JSONModel(oContext);
			this._oContextModel.setDefaultBindingMode("OneWay");
			this._createI18nModel();
			this._createEditors();
		}
	};

	/**
	 * I18n model is used as interface (read-only) for property editors.
	 * I18n model created from all i18n bundles in the merged config.
	 * To separate properties from different bundles namespacing should be used, e.g. i18n>BASE_EDITOR.PROPERTY
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
					this._oI18nModel.setDefaultBindingMode("OneWay");
				} else {
					this._oI18nModel.enhance(oBundle);
				}
			}.bind(this));
		}.bind(this));
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
					var oPropertyConfig = this.getConfig().properties[sPropertyName];
					var oEditor = this.createPropertyEditor(oPropertyConfig);
					if (oEditor) {
						this._mPropertyEditors[sPropertyName] = oEditor;
						this.addAggregation("_propertyEditors", this._mPropertyEditors[sPropertyName]);
					}
				}.bind(this));

				this.firePropertyEditorsReady({propertyEditors: this.getPropertyEditors()});
			}
		}.bind(this));
	};

	BaseEditor.prototype.createPropertyEditor = function(oPropertyConfig) {
		var Editor = this._mEditorClasses[oPropertyConfig.type];
		if (Editor) {
			var oPropertyEditor = new Editor({
				editor: this
			});
			oPropertyEditor.setModel(this._oContextModel, "_context");
			// deepClone to avoid editor modifications to influence the outer config
			oPropertyEditor.setConfig(deepClone(oPropertyConfig));
			oPropertyEditor.attachPropertyChanged(this._onPropertyChanged.bind(this));
			// TODO: control styling via editor properties?
			oPropertyEditor.addStyleClass("sapUiTinyMargin");
			return oPropertyEditor;
		}
	};

	BaseEditor.prototype._onPropertyChanged = function(oEvent) {
		var sPath = oEvent.getParameter("path");
		var aParts = sPath.split("/");

		this._oContext = this._oContextModel.getData();
		ObjectPath.set(aParts, oEvent.getParameter("value"), this._oContext);
		this._oContextModel.checkUpdate();
		this.fireJsonChanged({
			json: deepClone(this.getJson()) // to avoid manipulations with the json outside of the editor
		});
	};

	return BaseEditor;
});
