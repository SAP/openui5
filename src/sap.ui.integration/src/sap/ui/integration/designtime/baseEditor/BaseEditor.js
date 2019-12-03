/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/ui/core/Control",
	"sap/ui/model/resource/ResourceModel",
	"sap/base/util/ObjectPath",
	"sap/base/util/merge",
	"sap/base/util/isPlainObject",
	"sap/base/util/restricted/_merge",
	"sap/ui/model/json/JSONModel",
	"sap/base/i18n/ResourceBundle",
	"sap/base/Log"
], function (
	createPromise,
	Control,
	ResourceModel,
	ObjectPath,
	merge,
	isPlainObject,
	_merge,
	JSONModel,
	ResourceBundle,
	Log
) {
	"use strict";

	/**
	 * @class
	 * <h3>Overview</h3>
	 * Configurable JSON editor
	 * <h4>Example</h4>
	 * <pre>
	 * sap.ui.require(["sap/ui/integration/designtime/baseEditor/BaseEditor"], function (Editor) {
	 *     var oJson = {
	 *         root: {
	 *             context: {
	 *                 id: "404",
	 *                 name: "Kate",
	 *                 role: "End User"
	 *             },
	 *             foo: {
	 *                 bar: true
	 *             }
	 *         }
	 *     };
	 *     var oEditor = new Editor();
	 *     oEditor.setJson(oJson);
	 *     oEditor.setConfig({
	 *         "context": "root/context",
	 *         "properties" : {
	 *             "name": {
	 *                 "label": "Name",
	 *                 "path": "name",
	 *                 "type": "string"
	 *             },
	 *             "role": {
	 *                 "label": "Role",
	 *                 "path": "role",
	 *                 "type": "enum",
	 *                 "enum": ["Developer", "Key User", "End User"]
	 *             },
	 *             "department": {
	 *                 "label": "Department",
	 *                 "path": "department",
	 *                 "type": "enum",
	 *                 "enum": ["Sales", "HR", "Development"],
	 *                 "visible": "{= ${context>/role} === 'Key User'}"
	 *             }
	 *         },
	 *         "propertyEditors": {
	 *             "enum" : "sap/ui/integration/designtime/baseEditor/propertyEditors/enumStringEditor/EnumStringEditor",
	 *             "string" : "sap/ui/integration/designtime/baseEditor/propertyEditors/stringEditor/StringEditor"
	 *         }
	 *     });
	 *     oEditor.attachJsonChange(function(oEvent) {
	 *         var oJson = oEvent.getParameter("json");
	 *         // live change
	 *     })
	 *     oEditor.placeAt("content");
	 * })
	 * </pre>
	 *
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.baseEditor.BaseEditor
	 * @author SAP SE
	 * @since 1.70.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.70.0
	 * @ui5-restricted
	 */
	var BaseEditor = Control.extend("sap.ui.integration.designtime.baseEditor.BaseEditor", {
		metadata: {
			properties: {
				/**
				 * JSON to be changed in the editor. Note: If an object is passed as a parameter, it won't be mutated. <code>.getJson()</code> or
				 * <code>.attachJsonChange()</code> should be used instead to get the changed object.
				 */
				"json": {
					type: "object"
				},

				/**
				 * Configuration Map
				 *   config.context {string} Path in the JSON that will be edited e.g. <code>"path/subpath"</code> for <code>json.path.subpath</code>
				 *   config.properties {map} Defines which fields in the context are editable
				 *     config.properties.<key>.label {string} of the property to show on the UI
				 *     config.properties.<key>.type {string} of the property (property editor for this type will be shown)
				 *     config.properties.<key>.path {string} that will be changed, relative to the context. Example: If the context is <code>root</code> and the path is <code>header/name</code>, the <code>json.root.header.name</code> field is to be changed
				 *     config.properties.<key>.value {string|boolean} (Optional) value of the property. A binding relative to the context (model name) should be used. Example: <code>{context>header/name}</code> will create a binding <code>json.root.header.name</code>
				 *     config.properties.<key>.tags {array} Strings to categorize the property
				 *     config.properties.<key>.visible {string|boolean} Should be used as a binding relative to the context to define the conditions under which this property should be changeable, e.g. <code>{= ${context>anotherProperty} === 'someValue'}</code>
				 *     config.properties.<key>.<other configurations> {any} It is possible to define additional configurations in this namespace. These configurations will be passed to the dedicated property editor. Binding strings relative to context model are supported as well, e.g. <code>{= ${context>someProperty} + ${context>anotherProperty}}</code>
				 *   config.propertyEditors {map} Defines which property editors should be loaded. Key is the property type and value is the editor module path. Example: <code>propertyEditors: {"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"}</code> defines the module responsible for all properties with the type <code>string</code>
				 *   config.i18n {string|array} Module path or array of paths for i18n property files. i18n binding, for example, <code>{i18n>key}</code> is available in the <code>/properties<code> section, e.g. for <code>label</code>
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
				 * Fired when any property has been changed by the <code>propertyEditor</code>.
				 */
				jsonChange: {
					parameters: {
						json: {
							type: "object"
						}
					}
				},
				/**
				 * Fired when all property editors for the given JSON and configuration are created.
				 * TODO: remove this public event.
				 */
				propertyEditorsReady: {
					parameters: {
						propertyEditors: {type: "array"}
					}
				}
			}
		},

		constructor: function() {
			this._mPropertyEditors = {};
			this._mEditorClasses = {};
			this._aCancelHandlers = [];

			Control.prototype.constructor.apply(this, arguments);
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
		}
	});

	BaseEditor.prototype.exit = function () {
		this._reset();
	};

	BaseEditor.prototype.setJson = function (vJson) {
		var mJson;

		if (typeof vJson === "string") {
			try {
				mJson = JSON.parse(vJson);
			} catch (e) {
				Log.error("sap.ui.integration.designtime.baseEditor.BaseEditor: invalid JSON string is specified");
			}
		} else if (isPlainObject(vJson)) {
			// to avoid that object is changed outside of the editor
			mJson = _merge({}, vJson);
		} else {
			Log.error("sap.ui.integration.designtime.baseEditor.BaseEditor: unsupported data type specified in setJson()");
		}

		if (mJson) {
			this.setProperty("json", mJson, false);
			this._initialize();
		}

		return this;
	};

	/**
	 * To be used only in constructor when inheriting from <code>BaseEditor</code> to add additional default configuration.
	 * @param  {object} oConfig - To merge with previous default
	 */
	BaseEditor.prototype.addDefaultConfig = function (oConfig) {
		this.setProperty("_defaultConfig",
			this._mergeConfig(this.getProperty("_defaultConfig"), oConfig)
		);
		this.setConfig(this._oUnmergedConfig || {});
		return this;
	};

	BaseEditor.prototype.setConfig = function (oConfig) {
		this._oUnmergedConfig = oConfig;
		return this._setConfig(
			this._mergeConfig(this.getProperty("_defaultConfig"), oConfig)
		);
	};

	BaseEditor.prototype._mergeConfig = function (oTarget, oSource) {
		var oResult = merge({}, oTarget, oSource);
		// concat i18n properties to avoid override
		oResult.i18n = [].concat(oTarget.i18n || [], oSource.i18n || []);
		return oResult;
	};

	BaseEditor.prototype._setConfig = function (oConfig) {
		var vReturn = this.setProperty("config", oConfig, false);
		this._initialize();
		return vReturn;
	};

	BaseEditor.prototype._reset = function () {
		this._aCancelHandlers.forEach(function (fnCancel) {
			fnCancel();
		});

		if (this._oI18nModel) {
			this._oI18nModel.destroy();
			delete this._oI18nModel;
		}
		if (this._oContextModel) {
			this._oContextModel.destroy();
			delete this._oContextModel;
		}


		this._mEditorClasses = {};

		Object.keys(this._mPropertyEditors).forEach(function (sPropertyName) {
			this._mPropertyEditors[sPropertyName].destroy();
		}, this);

		this._mPropertyEditors = {};

		this.destroyAggregation("_propertyEditors");
	};

	BaseEditor.prototype._initialize = function () {
		this._reset();
		var mJson = this.getJson();
		var mConfig = this.getConfig();
		if (mJson && mConfig && mConfig.properties) {
			this._oContextModel = this._createContextModel();

			this._createI18nModel()
				.then(function (aBundles) {
					if (aBundles.length) {
						if (!this._oI18nModel) {
							this._oI18nModel = new ResourceModel({
								bundle: aBundles.shift()
							});
							this.setModel(this._oI18nModel, "i18n");
							this._oI18nModel.setDefaultBindingMode("OneWay");
						}

						aBundles.forEach(function (oBundle) {
							this._oI18nModel.enhance(oBundle);
						}, this);
					}
				}.bind(this))
				.then(this._createEditors.bind(this));
		}
	};

	BaseEditor.prototype._createContextModel = function () {
		var mJson = this.getJson();
		var mContext = mJson;
		var mConfig = this.getConfig();

		if (mConfig.context) {
			mContext = ObjectPath.get(mConfig.context.split("/"), mJson);
		}

		var oModel = new JSONModel(mContext);
		oModel.setDefaultBindingMode("OneWay");

		return oModel;
	};

	/**
	 * The I18n model is used as an interface (read-only) for property editors.
	 * It is created from all i18n bundles in the merged configuration.
	 * To separate properties from different bundles, namespacing should be used, e.g. i18n>BASE_EDITOR.PROPERTY
	 */
	BaseEditor.prototype._createI18nModel = function () {
		return this._createPromise(function (fnResolve, fnRejected) {
			var oConfig = this.getConfig();
			Promise.all(
				oConfig.i18n.map(function (sI18nPath) {
					return new Promise(function (fnResolve, fnReject) {
						ResourceBundle.create({
							url: sap.ui.require.toUrl(sI18nPath),
							async: true
						}).then(fnResolve, fnReject);
					});
				})
			).then(fnResolve, fnRejected);
		}.bind(this));
	};

	/**
	 * Requires all editor modules and creates editor instances for all configurable properties.
	 */
	BaseEditor.prototype._createEditors = function () {
		var oConfig = this.getConfig();

		return Promise.all(
			Object.keys(oConfig.properties).map(function(sPropertyName) {
				var oPropertyConfig = this.getConfig().properties[sPropertyName];
				return Promise.all([sPropertyName, this.createPropertyEditor(oPropertyConfig)]);
			}.bind(this))
		).then(function (aPropertyEditors) {
			aPropertyEditors.forEach(function (mPropertyEditor) {
				var sPropertyName = mPropertyEditor[0];
				var oPropertyEditor = mPropertyEditor[1];

				if (oPropertyEditor) {
					oPropertyEditor.attachPropertyChange(this._onPropertyChange.bind(this));
					this._mPropertyEditors[sPropertyName] = oPropertyEditor;
					this.addAggregation("_propertyEditors", oPropertyEditor);
				}
			}, this);
			this.firePropertyEditorsReady({propertyEditors: this.getPropertyEditorsSync()});
		}.bind(this));

	};

	BaseEditor.prototype._createPromise = function (fn) {
		var mPromise = createPromise(fn);
		this._aCancelHandlers.push(mPromise.cancel);

		var removeHandler = function (fnCancel, vResolvedValue) {
			this._aCancelHandlers = this._aCancelHandlers.filter(function (fn) {
				return fn !== fnCancel;
			});
			return vResolvedValue;
		}.bind(this, mPromise.cancel);

		return mPromise.promise.then(removeHandler, removeHandler);
	};

	BaseEditor.prototype._loadClasses = function (aModules) {
		return this._createPromise(function (fnResolve, fnReject) {
			sap.ui.require(
				aModules,
				function () {
					fnResolve(Array.from(arguments));
				},
				fnReject
			);
		});
	};

	BaseEditor.prototype.createPropertyEditor = function (oPropertyConfig) {
		var mConfig = this.getConfig();
		var aTypes = Object.keys(mConfig.propertyEditors);
		var aModules = aTypes.map(function(sType) {
			return mConfig.propertyEditors[sType];
		});

		return this._loadClasses(aModules).then(function (aClasses) {
			var Editor = aClasses[aTypes.indexOf(oPropertyConfig.type)];
			if (Editor) {
				var oPropertyEditor = new Editor({
					editor: this
				});
				oPropertyEditor.setModel(this._oContextModel, "_context");
				oPropertyEditor.setModel(this._oI18nModel, "i18n");
				oPropertyEditor.setConfig(_merge({}, oPropertyConfig)); // deep clone to avoid editor modifications to influence the outer config

				// TODO: control styling via editor properties?
				oPropertyEditor.addStyleClass("sapUiTinyMargin");
				return oPropertyEditor;
			}
		}.bind(this));
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

	BaseEditor.prototype.getPropertyEditorSync = function (sPropertyName) {
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

	BaseEditor.prototype.getPropertyEditorsSync = function (vTag) {
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

	BaseEditor.prototype._onPropertyChange = function (oEvent) {
		var sPath = oEvent.getParameter("path");
		var aParts = sPath.split("/");

		this._oContext = this._oContextModel.getData();
		ObjectPath.set(aParts, oEvent.getParameter("value"), this._oContext);
		this._oContextModel.checkUpdate();
		this.fireJsonChange({
			json: _merge({}, this.getJson()) // to avoid manipulations with the json outside of the editor
		});
	};

	return BaseEditor;
});
