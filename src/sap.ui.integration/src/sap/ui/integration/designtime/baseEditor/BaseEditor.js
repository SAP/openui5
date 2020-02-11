/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory",
	"sap/ui/integration/designtime/baseEditor/PropertyEditor",
	"sap/ui/integration/designtime/baseEditor/util/binding/resolveBinding",
	"sap/ui/integration/designtime/baseEditor/util/binding/ObjectBinding",
	"sap/ui/core/Control",
	"sap/ui/model/resource/ResourceModel",
	"sap/base/util/ObjectPath",
	"sap/base/util/merge",
	"sap/base/util/each",
	"sap/base/util/deepClone",
	"sap/base/util/values",
	"sap/base/util/isPlainObject",
	"sap/base/util/isEmptyObject",
	"sap/base/util/includes",
	"sap/base/util/restricted/_merge",
	"sap/base/util/restricted/_omit",
	"sap/ui/model/json/JSONModel",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/base/BindingParser",
	"sap/base/Log"
], function (
	createPromise,
	PropertyEditorFactory,
	PropertyEditor,
	resolveBinding,
	ObjectBinding,
	Control,
	ResourceModel,
	ObjectPath,
	merge,
	each,
	deepClone,
	values,
	isPlainObject,
	isEmptyObject,
	includes,
	_merge,
	_omit,
	JSONModel,
	ResourceBundle,
	BindingParser,
	Log
) {
	"use strict";

	var CUSTOM_PROPERTY_PREFIX = "customProperty--";

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
				 *   config.properties {Object<string,object>} Defines which fields in the context are editable
				 *     config.properties.<key>.label {string} of the property to show on the UI
				 *     config.properties.<key>.type {string} of the property (property editor for this type will be shown)
				 *     config.properties.<key>.path {string} that will be changed, relative to the context. Example: If the context is <code>root</code> and the path is <code>header/name</code>, the <code>json.root.header.name</code> field is to be changed
				 *     config.properties.<key>.value {string|boolean} (Optional) value of the property. A binding relative to the context (model name) should be used. Example: <code>{context>header/name}</code> will create a binding <code>json.root.header.name</code>
				 *     config.properties.<key>.tags {array} Strings to categorize the property
				 *     config.properties.<key>.visible {string|boolean} Should be used as a binding relative to the context to define the conditions under which this property should be changeable, e.g. <code>{= ${context>anotherProperty} === 'someValue'}</code>
				 *     config.properties.<key>.<other configurations> {any} It is possible to define additional configurations in this namespace. These configurations will be passed to the dedicated property editor. Binding strings relative to context model are supported as well, e.g. <code>{= ${context>someProperty} + ${context>anotherProperty}}</code>
				 *   config.propertyEditors {Object<string,string>} Defines which property editors should be loaded. Key is the property type and value is the editor module path. Example: <code>propertyEditors: {"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"}</code> defines the module responsible for all properties with the type <code>string</code>
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
			this._mObservableConfig = {};
			this._mPropertyEditors = {};
			this._aCancelHandlers = [];
			this._oDataModel = this._createDataModel();

			Control.prototype.constructor.apply(this, arguments);

			this._oDataModel.setData(this.getJson());

			this.attachJsonChange(function (oEvent) {
				var oJson = oEvent.getParameter("json");

				this._oDataModel.setData(oJson);
				this._checkReady();
			}, this);
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
		this._oDataModel.destroy();
	};

	BaseEditor.prototype.setJson = function (vJson) {
		var oJson;

		if (typeof vJson === "string") {
			try {
				oJson = JSON.parse(vJson);
			} catch (e) {
				Log.error("sap.ui.integration.designtime.baseEditor.BaseEditor: invalid JSON string is specified");
			}
		} else if (isPlainObject(vJson)) {
			// to avoid that object is changed outside of the editor
			oJson = _merge({}, vJson);
		} else {
			Log.error("sap.ui.integration.designtime.baseEditor.BaseEditor: unsupported data type specified in setJson()");
		}

		if (oJson) {
			this.setProperty("json", oJson);
			this.fireJsonChange({
				json: oJson
			});
		}
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
		PropertyEditorFactory.registerTypes(oConfig.propertyEditors);
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

		if (this._oConfigObserver) {
			this._oConfigObserver.destroy();
		}

		each(this._mPropertyEditors, function (sPropertyName, aPropertyEditors) {
			aPropertyEditors.forEach(function (oPropertyEditor) {
				this.deregisterPropertyEditor(oPropertyEditor, sPropertyName);
			}, this);
		}.bind(this));

		this.destroyAggregation("_propertyEditors");
	};

	BaseEditor.prototype._initialize = function () {
		this._reset();

		var mConfig = this.getConfig();

		if (mConfig && mConfig.properties) {
			this._oConfigObserver = new ObjectBinding();

			this._loadI18nBundles(mConfig.i18n)
				.then(function (aBundles) {
					this._oI18nModel = this._createI18nModel(aBundles);
					this.setModel(this._oI18nModel, "i18n");

					// Setup config observer
					this._oConfigObserver.addToIgnore("template"); // Ignore array templates
					this._oConfigObserver.setModel(this._oDataModel);
					this._oConfigObserver.setModel(this._oI18nModel, "i18n");

					var sContextPath = this._getContextPath();
					if (sContextPath) {
						this._oConfigObserver.setModel(this._oDataModel, "context");
						this._oConfigObserver.setBindingContext(this._oDataModel.getContext(sContextPath), "context");
					}

					var mPropertiesConfig = resolveBinding(
						mConfig.properties,
						{
							"i18n": this._oI18nModel
						}
					);

					this._mObservableConfig = this._prepareConfig(mPropertiesConfig);
					this._oConfigObserver.setObject(this._mObservableConfig);

					this._oConfigObserver.attachChange(function (oEvent) {
						var aPath = oEvent.getParameter("path").split("/");
						var vValue = oEvent.getParameter("value");
						var sPropertyKey = aPath.shift();
						var aPropertyEditors = this.getPropertyEditorsByNameSync(sPropertyKey) || [];

						aPropertyEditors.forEach(function (oPropertyEditor) {
							if (aPath[0] === "value") {
								oPropertyEditor.setValue(vValue);
							} else {
								var mProperties = oEvent.getSource().getObject();
								var mPropertyConfig = _omit(deepClone(mProperties[sPropertyKey]), "value");

								ObjectPath.set(aPath, vValue, mPropertyConfig);
								oPropertyEditor.setConfig(mPropertyConfig);
							}
						});
					}, this);

					return this._createEditors(this._oConfigObserver.getObject());
				}.bind(this));
		}
	};


	BaseEditor.prototype._createDataModel = function () {
		var oModel = new JSONModel();
		oModel.setDefaultBindingMode("OneWay");
		return oModel;
	};

	/**
	 * Loads i18n bundles.
	 *
	 * @param {string[]} aBundleList - List of paths to i18n bundles
	 * @returns {Promise} Array of {@link sap.base.i18n.ResourceBundle i18n resource bundles}
	 * @private
	 */
	BaseEditor.prototype._loadI18nBundles = function (aBundlePaths) {
		return this._createPromise(function (fnResolve, fnRejected) {
			Promise.all(
				aBundlePaths.map(function (sI18nPath) {
					return new Promise(function (fnResolve, fnReject) {
						ResourceBundle.create({
							url: sap.ui.require.toUrl(sI18nPath),
							async: true
						}).then(fnResolve, fnReject);
					});
				})
			).then(fnResolve, fnRejected);
		});
	};

	/**
	 * Creates an i18n model out of list of resource bundles.
	 *
	 * The i18n model is used as an interface (read-only) for property editors. It is created from all
	 * i18n bundles in the merged configuration. To separate properties from different bundles,
	 * namespacing should be used, e.g. <code>i18n>BASE_EDITOR.PROPERTY</code>
	 *
	 * @param {sap.base.i18n.ResourceBundle[]} aBundles - List of i18n resource bundles
	 * @returns {sap.ui.model.resource.ResourceModel} I18n model of composed bundles
	 * @private
	 */
	BaseEditor.prototype._createI18nModel = function (aBundles) {
		var aBundlesList = aBundles.slice();
		var oI18nModel = new ResourceModel({
			bundle: aBundlesList.shift()
		});

		oI18nModel.setDefaultBindingMode("OneWay");

		aBundlesList.forEach(function (oBundle) {
			oI18nModel.enhance(oBundle);
		});

		return oI18nModel;
	};

	BaseEditor.prototype._prepareConfig = function (mProperties) {
		var mResult = {};

		each(mProperties, function (sKey, mPropertyConfig) {
			mResult[sKey] = Object.assign(
				{},
				this._preparePropertyConfig(mPropertyConfig),
				{
					__propertyName: sKey
				}
			);
		}.bind(this));

		return mResult;
	};

	BaseEditor.prototype._preparePropertyConfig = function (mPropertyConfig) {
		var sContextPath = this._getContextPath();

		if (sContextPath && !sContextPath.endsWith("/")) {
			sContextPath = sContextPath + "/";
		}

		var sPath = mPropertyConfig.path;

		if (!sPath.startsWith("/") && sContextPath) {
			sPath = sContextPath + sPath;
		}

		return Object.assign({}, mPropertyConfig, {
			path: sPath,
			value: "{" + sPath + "}"
		});
	};

	/**
	 * Creates property editors wrappers for all configurable properties.
	 */
	BaseEditor.prototype._createEditors = function (mPropertiesConfig) {
		each(mPropertiesConfig, function (sPropertyName, mPropertyConfig) {
			var oPropertyEditor = this._createPropertyEditor(mPropertyConfig);
			this.addAggregation("_propertyEditors", oPropertyEditor);
		}.bind(this));

		return (
			Promise.all(
				values(this._mPropertyEditors)
					.reduce(function (aResult, aCurrent) {
						return aResult.concat(aCurrent);
					}, [])
					.map(function (oPropertyEditor) {
						return oPropertyEditor.ready();
					})
			)
			.then(this._checkReady.bind(this))
		);
	};

	BaseEditor.prototype._getRegistrationKey = function (oPropertyEditor, sKey) {
		if (typeof sKey !== "string") {
			if (
				oPropertyEditor.isA("sap.ui.integration.designtime.baseEditor.PropertyEditor")
				&& !oPropertyEditor.getConfig()
				&& !oPropertyEditor.getBindingInfo("config")
				&& oPropertyEditor.getPropertyName()
			) {
				sKey = oPropertyEditor.getPropertyName();
			} else {
				sKey = CUSTOM_PROPERTY_PREFIX + oPropertyEditor.getId();
			}
		}

		return sKey;
	};

	BaseEditor.prototype._addCustomProperty = function (sKey, mConfig) {
		var mObservableConfigNext = Object.assign({}, this._mObservableConfig);
		mObservableConfigNext[sKey] = this._preparePropertyConfig(mConfig);
		this._mObservableConfig = mObservableConfigNext;
		this._oConfigObserver.setObject(mObservableConfigNext);
	};

	BaseEditor.prototype._removeCustomProperty = function (sKey) {
		var mObservableConfigNext = _omit(this._mObservableConfig, sKey);
		this._mObservableConfig = mObservableConfigNext;
		this._oConfigObserver.setObject(mObservableConfigNext);
	};

	/**
	 * Registers a property editor to get updates from and to send updates to.
	 * @param {sap.ui.integration.designtime.baseEditor.PropertyEditor|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor} oPropertyEditor - Property editor instance
	 * @param {string} [sKey] - Optional key. The property editor will be available in {@link #getPropertyEditorSync} under the specified key.
	 */
	BaseEditor.prototype.registerPropertyEditor = function (oPropertyEditor, sKey) {
		sKey = this._getRegistrationKey(oPropertyEditor, sKey);
		var aList = Array.isArray(this._mPropertyEditors[sKey]) ? this._mPropertyEditors[sKey] : [];

		this._mPropertyEditors[sKey] = aList.concat(oPropertyEditor);

		// Register config object in binding watcher
		if (sKey.startsWith(CUSTOM_PROPERTY_PREFIX)) {
			this._addCustomProperty(sKey, oPropertyEditor.getConfig());
		}

		// Getting back already resolved config!
		var vValue = ObjectPath.get(sKey, this._oConfigObserver.getObject()).value;

		oPropertyEditor.setValue(vValue);
		oPropertyEditor.attachValueChange(this._onValueChange, this);
		oPropertyEditor.attachReady(this._checkReady, this);
	};

	/**
	 * Deregisters a property editor from the base editor
	 * @param {sap.ui.integration.designtime.baseEditor.PropertyEditor|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor} oPropertyEditor - Property editor instance
	 * @param {string} [sKey] - Optional key which was used for registration. See {@link #registerPropertyEditor}.
	 */
	BaseEditor.prototype.deregisterPropertyEditor = function (oPropertyEditor, sKey) {
		sKey = this._getRegistrationKey(oPropertyEditor, sKey);
		var aList = this._mPropertyEditors[sKey];

		// Deregister config object from binding watcher
		if (sKey.startsWith(CUSTOM_PROPERTY_PREFIX)) {
			this._removeCustomProperty(sKey);
		}

		oPropertyEditor.detachValueChange(this._onValueChange, this);

		if (Array.isArray(aList)) {
			this._mPropertyEditors[sKey] = aList.filter(function (oItem) {
				return oPropertyEditor !== oItem;
			});

			if (this._mPropertyEditors[sKey].length === 0) {
				delete this._mPropertyEditors[sKey];
			}
		}
	};

	BaseEditor.prototype._checkReady = function () {
		if (this.getPropertyEditorsSync().every(function (oEditor) {
			return oEditor.isReady();
		})) {
			// All property editors are ready
			this.firePropertyEditorsReady({propertyEditors: this.getPropertyEditorsSync()});
		}
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

	/**
	 * Returns resolved configuration by property name.
	 * @param {string} sPropertyName - Property name in the editor configuration
	 * @returns {object} Configuration object, e.g. <code>{ path: "/foo", label: "Foo", ... }</code>
	 */
	BaseEditor.prototype.getPropertyConfigByName = function (sPropertyName) {
		return _omit(
			ObjectPath.get(sPropertyName, this._oConfigObserver.getObject()),
			"value"
		);
	};

	BaseEditor.prototype._createPropertyEditor = function (oPropertyConfig) {
		var oBindingInfo = typeof oPropertyConfig.value === "string" && BindingParser.complexParser(oPropertyConfig.value);

		// Avoid passing values containing binding string to constructor, otherwise
		// there will be interpret by ManagedObject as bindings automatically.
		// Candidate to move into escape parameter inside wrapper itself.
		var oPropertyEditor = new PropertyEditor({
			config: _omit(oPropertyConfig, "value"),
			value: oBindingInfo ? undefined : oPropertyConfig.value,
			editor: this
		});

		if (oBindingInfo) {
			oPropertyEditor.setValue(oPropertyConfig.value);
		}

		return oPropertyEditor;
	};

	/**
	 * Returns a list of property editors corresponding to a specified property name.
	 * @param {string} sPropertyName - Property name
	 * @returns {Promise<sap.ui.integration.designtime.baseEditor.PropertyEditor[]|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor[]|null>} List of property editors for the specified name
	 */
	BaseEditor.prototype.getPropertyEditorsByName = function (sPropertyName) {
		return new Promise(function (fnResolve) {
			if (!this._mPropertyEditors || Object.keys(this._mPropertyEditors).length === 0) {
				this.attachEventOnce("propertyEditorsReady", fnResolve);
			} else {
				fnResolve();
			}
		}.bind(this))
		.then(function () {
			return this.getPropertyEditorsByNameSync(sPropertyName);
		}.bind(this));
	};

	/**
	 * Returns a list of property editors corresponding to a specified property name.
	 * @param {string} sPropertyName - Property name
	 * @returns {sap.ui.integration.designtime.baseEditor.PropertyEditor[]|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor[]|null} List of property editors for the specified name
	 */
	BaseEditor.prototype.getPropertyEditorsByNameSync = function (sPropertyName) {
		var aList = this._mPropertyEditors[sPropertyName];
		return Array.isArray(aList) && aList.slice() || null;
	};

	/**
	 * Checks if the property editor configuration matches the specified list of tags
	 * @param {object} mConfig - Property editor configuration
	 * @param {string, string[]} vTag - Tags for validation
	 * @returns {boolean} <code>true</code> is config fulfills specified tags
	 */
	function hasTag(mConfig, vTag) {
		var aTags = [].concat(vTag);

		return (
			Array.isArray(mConfig.tags)
			&& aTags.every(function (sTag) {
				return includes(mConfig.tags, sTag);
			})
		);
	}

	/**
	 * Returns a list of property editors corresponding to a specified list of tags.
	 * @param {string|string[]} vTag - List of tags
	 * @returns {Promise<sap.ui.integration.designtime.baseEditor.PropertyEditor[]|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor[]|null>} List of property editors for the specified tags
	 */
	BaseEditor.prototype.getPropertyEditorsByTag = function(vTag) {
		return new Promise(function (fnResolve) {
			if (!this._mPropertyEditors || Object.keys(this._mPropertyEditors).length === 0) {
				this.attachEventOnce("propertyEditorsReady", fnResolve);
			} else {
				fnResolve();
			}
		}.bind(this))
		.then(function () {
			return this.getPropertyEditorsByTagSync(vTag);
		}.bind(this));
	};

	/**
	 * Returns a list of property editors corresponding to a specified list of tags.
	 * @param {string|string[]} vTag - List of tags
	 * @returns {sap.ui.integration.designtime.baseEditor.PropertyEditor[]|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor[]|null} List of property editors for the specified tags
	 */
	BaseEditor.prototype.getPropertyEditorsByTagSync = function (vTag) {
		return this.getPropertyEditorsSync().filter(function(oPropertyEditor) {
			return hasTag(oPropertyEditor.getConfig(), vTag);
		});
	};

	/**
	 * Returns a list of registered property editors.
	 * @returns {sap.ui.integration.designtime.baseEditor.PropertyEditor[]|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor[]|null} List of property editors
	 */
	BaseEditor.prototype.getPropertyEditorsSync = function () {
		return values(this._mPropertyEditors).reduce(function (aResult, aCurrent) {
			return aResult.concat(aCurrent);
		}, []);
	};

	BaseEditor.prototype.getJson = function () {
		return _merge({}, this._getJson()); // To avoid manipulations with the json outside of the editor
	};

	BaseEditor.prototype._getJson = function () {
		return this.getProperty("json");
	};

	BaseEditor.prototype._getContextPath = function () {
		var oConfig = this.getConfig();
		var sContext = oConfig && oConfig.context || null;

		if (sContext && sContext[0] !== "/") {
			sContext = "/" + sContext;
		}

		return sContext;
	};

	function unset(aParts, oObject) {
		var mContainer = ObjectPath.get(aParts.slice(0, -1), oObject);
		delete mContainer[aParts[aParts.length - 1]];

		return (
			Array.isArray(mContainer) && mContainer.length === 0
			|| isPlainObject(mContainer) && isEmptyObject(mContainer)
				? unset(aParts.slice(0, -1), oObject)
				: oObject
		);
	}

	BaseEditor.prototype._onValueChange = function (oEvent) {
		var sPath = oEvent.getParameter("path");
		var oJson = this._getJson();
		var vValue = oEvent.getParameter("value");

		if (sPath[0] === "/") {
			sPath = sPath.substr(1);
		} else {
			throw new Error("BaseEditor._onValueChange: unknown relative path - '" + sPath + "'");
		}

		var aParts = sPath.split("/");

		ObjectPath.set(
			aParts,
			vValue,
			oJson
		);

		// Unset undefined values
		if (typeof vValue === "undefined") {
			unset(aParts, oJson);
		}

		this.setJson(oJson);
	};

	return BaseEditor;
});
