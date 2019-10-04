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
	 * @class
	 * <h3>Overview</h3>
	 * Configurable JSON editor.
	 * <h4>Example:</h4>
	 * <pre>
	 * 	sap.ui.require(['sap/ui/integration/designtime/controls/BaseEditor'], function(Editor) {
	 *		var oJson = {
	 *			root: {
	 *				context: {
	 *					id: "404",
	 *					name: "Kate",
	 *					role: "End User"
	 *				},
	 *				foo: {
	 *					bar: true
	 *				}
	 *			}
	 *		};
	 *		var oEditor = new Editor();
	 *		oEditor.setJson(oJson);
	 *		oEditor.setConfig({
	 *			"context": "root/context",
	 *			"properties" : {
	 *				"name": {
	 *					"label": "Name",
	 *					"path": "name",
	 *					"type": "string"
	 *				},
	 *				"role": {
	 *					"label": "Role",
	 *					"path": "role",
	 *					"type": "enum",
	 *					"enum": ["Developer", "Key User", "End User"]
	 *				},
	 *				"department": {
	 *					"label": "Department",
	 *					"path": "department",
	 *					"type": "enum",
	 *					"enum": ["Sales", "HR", "Development"],
	 *					"visible": "{= ${context>/role} === 'Key User'}"
	 *				}
	 *			},
	 *			"propertyEditors": {
	 *				"enum" : "sap/ui/integration/designtime/controls/propertyEditors/EnumStringEditor",
	 *				"string" : "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
	 *			}
	 *		});
	 *		oEditor.attachJsonChanged(function(oEvent) {
	 *			var oJson = oEvent.getParameter("json");
	 *			// live change
	 *		})
	 *		oEditor.placeAt("content");
	 * 	})
	 * </pre>
	 *
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.controls.BaseEditor
	 * @author SAP SE
	 * @since 1.70.0
	 * @version ${version}
	 * @private
	 * @experimental
	 * @ui5-restricted
	 */
	var BaseEditor = Control.extend("sap.ui.integration.designtime.baseEditor.BaseEditor", {
		metadata: {
			properties: {
				/**
				 * JSON to be changed in the editor. Note: object passed as parameter won't be mutated, .getJson() or .attachJsonChanged() should be used instead to get the changed object
				 */
				"json": {
					type: "object"
				},
				/**
				 * Configuration map
				 *   config.context {string} path in the JSON, which will be edited e.g. "path/subpath" for json.path.subpath
				 *   config.properties {map} defines, which fields in the context are editable
				 *     config.properties.<key>.label {string} of the property to show in the UI
				 *     config.properties.<key>.type {string} of the property (property editor for this type will be shown)
				 *     config.properties.<key>.path {string} which will be changed, relative to the context e.g. if context is "root" and path is "header/name", json.root.header.name field is to be changed
				 *     config.properties.<key>.value {string|boolean} (optional) value of the property, binding relative to context (model name) should be used, e.g. {context>header/name} will create a binding json.root.header.name
				 *     config.properties.<key>.tags {array} strings to categorize the property
				 *     config.properties.<key>.visible {string|boolean} should be used as binding relative to context to define conditions, when this property should be possible to change, e.g. {= ${context>anotherProperty} === 'someValue'}
				 *	   config.properties.<key>.<other configurations> {any} it is possible to define additional configurations in this namespace. This configurations will be passed to the dedicated property editor. Binding strings relative to context model are supported also, e.g. {= ${context>someProperty} + ${context>anotherProperty}}.
				 *   config.propertyEditors {map} define, which property editors should be loaded. Key is property type and value is editor module path. E.g. propertyEditors: {"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"} defines module responsible for all properties with the type "string"
				 *   config.i18n {string|array} module path or array of paths for i18n property files. i18n binding, e.g. {i18n>key} is available in the "properties" section, e.g. for "label"
				 */
				"config": {
					type: "object"
				},
				"_defaultConfig": {
					type: "object",
					visibility: "hidden",
					// do not override during inheritance, use this.addDefaultConfig instead!
					defaultValue: {
						i18n: "sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"
					}
				}
			},
			defaultAggregation : "content",
			aggregations: {
				"_propertyEditors": {
					type: "sap.ui.core.Control",
					visibility: "hidden"
				},
				content: {
					type: "sap.ui.core.Control",
					multiple : true
				}
			},
			events: {
				/**
				 * Fired when any property has been changed by the propertyEditor
				 */
				jsonChanged: {
					parameters: {
						json: {type: "object"}
					}
				},
				/**
				 * Fired when all property editors for the given json and config are created
				 */
				propertyEditorsReady: {
					parameters: {
						propertyEditors: {type: "array"}
					}
				}
			}
		},

		renderer: function(oRm, oControl) {
			var aContent = oControl.getContent();

			oRm.openStart("div", oControl);
			oRm.openEnd();

			if (aContent.length) {
				aContent.forEach(function(oChildControl) {
					oRm.renderControl(oChildControl);
				});
			} else {
				oControl.getPropertyEditorsSync().forEach(function(oPropertyEditor) {
					oRm.renderControl(oPropertyEditor);
				});
			}

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
		 * To be used only in constructor when inheriting from BaseEditor to add additional default config
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
			this._createI18nModel().then(this._createEditors.bind(this));
		}
	};

	/**
	 * I18n model is used as interface (read-only) for property editors.
	 * I18n model created from all i18n bundles in the merged config.
	 * To separate properties from different bundles namespacing should be used, e.g. i18n>BASE_EDITOR.PROPERTY
	 */
	BaseEditor.prototype._createI18nModel = function() {
		var oConfig = this.getConfig();

		return Promise.all(
			oConfig.i18n.map(function (sI18nPath) {
				return new Promise(function (fnResolve, fnReject) {
					ResourceBundle.create({
						url: sap.ui.require.toUrl(sI18nPath),
						async: true
					})
						.then(function (oBundle) {
							if (!this._oI18nModel) {
								this._oI18nModel = new ResourceModel({
									bundle: oBundle
								});
								this.setModel(this._oI18nModel, "i18n");
								this._oI18nModel.setDefaultBindingMode("OneWay");
							} else {
								this._oI18nModel.enhance(oBundle);
							}
							fnResolve();
						}.bind(this))
						.catch(fnReject);
				}.bind(this));
			}.bind(this))
		);
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

				this.firePropertyEditorsReady({propertyEditors: this.getPropertyEditorsSync()});
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
			oPropertyEditor.setModel(this._oI18nModel, "i18n");
			// deepClone to avoid editor modifications to influence the outer config
			oPropertyEditor.setConfig(deepClone(oPropertyConfig));
			oPropertyEditor.attachPropertyChanged(this._onPropertyChanged.bind(this));
			// TODO: control styling via editor properties?
			oPropertyEditor.addStyleClass("sapUiTinyMargin");
			return oPropertyEditor;
		}
	};

	BaseEditor.prototype.getPropertyEditor = function (sPropertyName) {
		return new Promise(function (fnResolve) {
			if (!this._mPropertyEditors || Object.keys(this._mPropertyEditors).length === 0) {
				this.attachEventOnce("propertyEditorsReady", fnResolve);
			} else {
				fnResolve();
			}
		}.bind(this))
		.then(function () {
			return this.getPropertyEditorSync(sPropertyName);
		}.bind(this));
	};

	BaseEditor.prototype.getPropertyEditorSync = function(sPropertyName) {
		return this._mPropertyEditors[sPropertyName];
	};

	BaseEditor.prototype.getPropertyEditors = function(vTag) {
		return new Promise(function (fnResolve) {
			if (!this._mPropertyEditors || Object.keys(this._mPropertyEditors).length === 0) {
				this.attachEventOnce("propertyEditorsReady", fnResolve);
			} else {
				fnResolve();
			}
		}.bind(this))
		.then(function () {
			return this.getPropertyEditorsSync(vTag);
		}.bind(this));
	};

	BaseEditor.prototype.getPropertyEditorsSync = function(vTag) {
		var hasTag = function(oPropertyEditor, sTag) {
			return oPropertyEditor.getConfig().tags && (oPropertyEditor.getConfig().tags.indexOf(sTag) !== -1);
		};

		if (!vTag) {
			return this.getAggregation("_propertyEditors") || [];
		} else if (typeof vTag === "string") {
			return this.getPropertyEditorsSync().filter(function(oPropertyEditor) {
				return hasTag(oPropertyEditor, vTag);
			});
		} else if (Array.isArray(vTag)) {
			return this.getPropertyEditorsSync().filter(function(oPropertyEditor) {
				return vTag.every(function(sTag) {
					return hasTag(oPropertyEditor, sTag);
				});
			});
		} else {
			return [];
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
