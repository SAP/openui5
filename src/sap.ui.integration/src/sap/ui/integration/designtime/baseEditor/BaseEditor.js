/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory",
	"sap/ui/integration/designtime/baseEditor/validator/ValidatorRegistry",
	"sap/ui/integration/designtime/baseEditor/PropertyEditors",
	"sap/ui/integration/designtime/baseEditor/util/binding/resolveBinding",
	"sap/ui/integration/designtime/baseEditor/util/binding/ObjectBinding",
	"sap/ui/integration/designtime/baseEditor/util/hasTag",
	"sap/ui/integration/designtime/baseEditor/util/cleanupDesigntimeMetadata",
	"sap/ui/base/EventProvider",
	"sap/ui/core/Control",
	"sap/ui/model/resource/ResourceModel",
	"sap/base/util/ObjectPath",
	"sap/base/util/each",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/base/util/isPlainObject",
	"sap/base/util/isEmptyObject",
	"sap/base/util/restricted/_intersection",
	"sap/base/util/restricted/_flatten",
	"sap/base/util/restricted/_mergeWith",
	"sap/base/util/restricted/_merge",
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_union",
	"sap/base/util/restricted/_isNil",
	"sap/base/util/restricted/_castArray",
	"sap/ui/model/json/JSONModel",
	"sap/base/i18n/ResourceBundle",
	"sap/base/Log",
	"sap/ui/integration/designtime/baseEditor/util/unset"
], function (
	createPromise,
	PropertyEditorFactory,
	ValidatorRegistry,
	PropertyEditors,
	resolveBinding,
	ObjectBinding,
	hasTag,
	cleanupDesigntimeMetadata,
	EventProvider,
	Control,
	ResourceModel,
	ObjectPath,
	each,
	deepClone,
	deepEqual,
	isPlainObject,
	isEmptyObject,
	_intersection,
	_flatten,
	_mergeWith,
	_merge,
	_omit,
	_union,
	_isNil,
	_castArray,
	JSONModel,
	ResourceBundle,
	Log,
	unset
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
	 *                 "type": "select",
	 *                 "items": [
	 *                     { "key": "Developer" },
	 *                     { "key": "Key User" },
	 *                     { "key": "End User" }
	 *                 ]
	 *             },
	 *             "department": {
	 *                 "label": "Department",
	 *                 "path": "department",
	 *                 "type": "select",
	 *                 "items": [
	 *                     { "key": "Sales" },
	 *                     { "key": "HR" },
	 *                     { "key": "Development" }
	 *                 ]
	 *                 "visible": "{= ${context>/role} === 'Key User'}"
	 *             }
	 *         },
	 *         "propertyEditors": {
	 *             "select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
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
			library: "sap.ui.integration",
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
				 *     config.properties.<key>.visible {string|boolean} Should be used as a binding relative to the context to define the conditions under which the editor for this property should be visible, e.g. <code>{= ${context>anotherProperty} === 'someValue'}</code>. Invisible editors won't receive value updates until they are activated again.
				 *     config.properties.<key>.<other configurations> {any} It is possible to define additional configurations in this namespace. These configurations will be passed to the dedicated property editor. Binding strings relative to context model are supported as well, e.g. <code>{= ${context>someProperty} + ${context>anotherProperty}}</code>
				 *   config.propertyEditors {Object<string,string>} Defines which property editors should be loaded. Key is the property type and value is the editor module path. Example: <code>propertyEditors: {"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"}</code> defines the module responsible for all properties with the type <code>string</code>
				 *   config.i18n {string|array} Module path or array of paths for i18n property files. i18n binding, for example, <code>{i18n>key}</code> is available in the <code>/properties<code> section, e.g. for <code>label</code>
				 */
				"config": {
					type: "object",
					defaultValue: {
						"i18n": [
							"sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"
						]
					}
				},

				/**
				 * Designtime-specific metadata to be changed in the editor. Note: If an object is passed as a parameter, it won't be mutated. <code>.getDesigntimeMetadata()</code> or
				 * <code>.attachDesigntimeMetadataChange()</code> should be used instead to get the changed object.
				 */
				"designtimeMetadata": {
					type: "object"
				},

				/**
				 * Layout name. Standard layout types: list | form
				 */
				"layout": {
					type: "string",
					defaultValue: "list"
				}
			},
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: true
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
				 * Fired when designtime metadata has been changed by a <code>propertyEditor</code>.
				 */
				designtimeMetadataChange: {
					parameters: {
						designtimeMetadata: {
							type: "object"
						}
					}
				},
				/**
				 * Fired when config has been changed.
				 */
				configChange: {
					parameters: {
						config: {
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
						propertyEditors: { type: "array" }
					}
				},
				/**
				 * Fires when the error state of one of the nested property editors changes
				 */
				 validationErrorChange: {
					parameters: {
						/**
						 * Whether there is an error in one of the nested editors
						 * @since 1.96.0
						 */
						hasError: { type: "boolean" }
					}
				}
			}
		},

		constructor: function () {
			this._oSetConfigPromise = Promise.resolve();
			this._mObservableConfig = {};
			this._mPropertyEditors = {};
			this._aCancelHandlers = [];
			this._oDataModel = this._createModel();
			this._oDesigntimeMetadataModel = this._createModel();

			this._bInitFinished = false;
			this._bValidatorsReady = false;
			this._setReady(false);

			Control.prototype.constructor.apply(this, arguments);

			this._oDataModel.setData(this._prepareData(this.getJson()));

			this.attachJsonChange(function (oEvent) {
				var oJson = oEvent.getParameter("json");
				this._oDataModel.setData(this._prepareData(oJson));
				this._checkReady();
			}, this);
		},

		renderer: function (oRm, oControl) {
			var aContent = oControl.getContent();

			oRm.openStart("div", oControl);
			oRm.openEnd();

			if (aContent.length) {
				aContent.forEach(function (oChildControl) {
					oRm.renderControl(oChildControl);
				});
			} else {
				oControl.getPropertyEditorsSync().forEach(function (oPropertyEditor) {
					oRm.renderControl(oPropertyEditor);
				});
			}

			oRm.close("div");
		}
	});

	BaseEditor.prototype.init = function () { };

	BaseEditor.prototype.exit = function () {
		this._reset();
		this._oDataModel.destroy();
		this._oDesigntimeMetadataModel.destroy();
	};

	BaseEditor.prototype._prepareData = function (oJson) {
		var oJsonCopy = deepClone(oJson);

		each(this._mObservableConfig, function (sPropertyName, mPropertyConfig) {
			var sPath = mPropertyConfig.path;
			if (sPath[0] === "/") {
				sPath = sPath.substr(1);
			}
			if (
				typeof ObjectPath.get(sPath.split("/"), oJsonCopy) === "undefined"
				&& typeof mPropertyConfig.defaultValue !== "undefined"
			) {
				ObjectPath.set(
					sPath.split("/"),
					deepClone(mPropertyConfig.defaultValue),
					oJsonCopy
				);
			}
		});

		return oJsonCopy;
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

		// since now we support functions in validations property of parameters, JSON.stringify is not suitable now, need to use deepEqual
		if (
			oJson
			//&& JSON.stringify(this.getProperty("json")) !== JSON.stringify(oJson)
			&& !deepEqual(this.getProperty("json"), oJson, 100)
		) {
			this.setProperty("json", oJson);
			this.fireJsonChange({
				json: oJson
			});
		}
	};

	BaseEditor.prototype.setPreventInitialization = function (bPreventInitialization) {
		this._bPreventInitialization = bPreventInitialization;
	};

	BaseEditor.prototype.setConfig = function (oConfig, bIsDefaultConfig) {
		this._bIsDefaultConfig = bIsDefaultConfig;
		oConfig = oConfig || {};
		this._oSetConfigPromise = this._oSetConfigPromise
			.then(this._registerPropertyEditorTypes.bind(this, oConfig.propertyEditors))
			.then(this._setConfig.bind(this, oConfig, bIsDefaultConfig));

		return this._oSetConfigPromise;
	};

	BaseEditor.prototype._registerPropertyEditorTypes = function (mPropertyEditors) {
		PropertyEditorFactory.deregisterAllTypes();
		return PropertyEditorFactory.registerTypes(mPropertyEditors || {});
	};

	BaseEditor.prototype._setConfig = function (oConfig, bIsDefaultConfig, mPropertyEditors) {
		this._initValidators(oConfig.validators || {});

		// Backwards compatibility. If no i18n configuration specified, we use default one.
		var oTarget = {
			propertyEditors: {},
			properties: {}
		};

		var oNewConfig = mergeConfig(oTarget, oConfig);

		if (this._oSpecificConfig) {
			// If the provided config is the default config
			// card specific config should always win
			oNewConfig = bIsDefaultConfig
				? this._oSpecificConfig
				: mergeSpecificConfig(oNewConfig, this._oSpecificConfig, mPropertyEditors);
		}

		// Always include the default i18n file
		oNewConfig.i18n = _union(
			oNewConfig.i18n && _castArray(oNewConfig.i18n),
			this.getMetadata().getProperty("config").getDefaultValue().i18n
		);

		this.setProperty("config", oNewConfig, false);
		this.fireConfigChange({
			config: deepClone(oNewConfig)
		});

		this.initialize();
	};

	BaseEditor.prototype.addConfig = function (oConfig, bIsDefaultConfig) {
		this._bIsDefaultConfig = bIsDefaultConfig;

		this._oSetConfigPromise = this._oSetConfigPromise
			.then(function () {
				oConfig = mergeConfig(this.getConfig(), oConfig);
				return oConfig.propertyEditors;
			}.bind(this))
			.then(this._registerPropertyEditorTypes)
			.then(function (mPropertyEditors) {
				this._setConfig(oConfig, bIsDefaultConfig, mPropertyEditors);
			}.bind(this));

		return this._oSetConfigPromise;
	};

	function mergeConfig(oTarget, oCurrentConfig) {
		var oResult = _merge({}, oTarget, oCurrentConfig);
		// concat i18n properties to avoid override
		oResult.i18n = [].concat(oTarget.i18n || [], oCurrentConfig.i18n || []);
		return oResult;
	}

	BaseEditor.prototype._addSpecificConfig = function (oSpecificConfig) {
		var oCurrentConfig;
		this._oSetConfigPromise = this._oSetConfigPromise
			.then(function () {
				this._oSpecificConfig = oSpecificConfig;

				oCurrentConfig = _merge({}, this.getConfig());
				oCurrentConfig.propertyEditors = addMissingPropertyEditors(oCurrentConfig, oSpecificConfig);

				return oCurrentConfig.propertyEditors;
			}.bind(this))
			.then(this._registerPropertyEditorTypes)
			.then(function (mPropertyEditors) {
				this._setConfig(oCurrentConfig, this._bIsDefaultConfig, mPropertyEditors);
			}.bind(this));

		return this._oSetConfigPromise;
	};

	function addMissingPropertyEditors(oCurrentConfig, oSpecificConfig) {
		var oPropertyEditors = {};
		var oCurrentEditors = oCurrentConfig.propertyEditors || {};
		var oSpecificEditors = oSpecificConfig.propertyEditors || {};

		_union(
			Object.keys(oCurrentEditors),
			Object.keys(oSpecificEditors)
		)
			.forEach(function (sEditorName) {
				oPropertyEditors[sEditorName] = oSpecificEditors[sEditorName]
					|| oCurrentEditors[sEditorName];
			});

		return oPropertyEditors;
	}

	function mergeSpecificConfig(oCurrentConfig, oSpecificConfig, mPropertyEditors) {
		// merge i18n
		oCurrentConfig.i18n = _union(oCurrentConfig.i18n, oSpecificConfig.i18n);

		// merge rest
		var oNewConfig = Object.assign(
			{},
			oCurrentConfig,
			_omit(oSpecificConfig, ["properties", "i18n", "propertyEditors"]),
			_omit(oCurrentConfig, ["properties", "i18n", "propertyEditors"])
		);

		// merge properties
		oNewConfig.properties = {};
		each(oCurrentConfig.properties, function (sPropertyName, oProperty) {
			var sEditor = oCurrentConfig.propertyEditors[oProperty.type] && oCurrentConfig.propertyEditors[oProperty.type].split("/").join(".");
			var oConfigMetadata = sEditor && mPropertyEditors[sEditor].configMetadata;

			if (oConfigMetadata && oSpecificConfig.properties[sPropertyName]) {
				each(oProperty, function (sKey, vTargetValue) {
					var vNewValue;
					var sMergeStrategy = oConfigMetadata[sKey] && oConfigMetadata[sKey].mergeStrategy;
					if (sMergeStrategy) {
						// only applicable for boolean values
						if (sMergeStrategy === "mostRestrictiveWins") {
							var bMostRestrictiveValue = oConfigMetadata[sKey].mostRestrictiveValue || false;
							if (vTargetValue === bMostRestrictiveValue) {
								vNewValue = bMostRestrictiveValue;
							} else {
								vNewValue = oSpecificConfig.properties[sPropertyName][sKey];
							}
						} else if (sMergeStrategy === "intersection") {
							vNewValue = _intersection(vTargetValue, oSpecificConfig.properties[sPropertyName][sKey]);
						}
					} else {
						vNewValue = vTargetValue;
					}
					oNewConfig.properties[sPropertyName] = oNewConfig.properties[sPropertyName] || {};
					oNewConfig.properties[sPropertyName][sKey] = vNewValue;
				});
			}
		});

		return oNewConfig;
	}

	BaseEditor.prototype.setDesigntimeMetadata = function (oDesigntimeMetadata, bIsInitialMetadata) {
		var oNextMetadata = deepClone(oDesigntimeMetadata, 15);
		if (!deepEqual(oNextMetadata, this.getDesigntimeMetadata())) {
			this.setProperty("designtimeMetadata", oNextMetadata);
			this._oDesigntimeMetadataModel.setData(oNextMetadata);
			if (!bIsInitialMetadata) {
				this.fireDesigntimeMetadataChange({
					designtimeMetadata: this._formatExportedDesigntimeMetadata(oNextMetadata)
				});
			}
		}
	};

	BaseEditor.prototype._formatExportedDesigntimeMetadata = function (oMetadata) {
		var oFlatMetadata = {};
		var fnFlattenPath = function (oObject, aPath) {
			Object.keys(oObject).forEach(function (sKey) {
				var vValue = oObject[sKey];

				if (sKey === "__value") {
					oFlatMetadata[aPath.join("/")] = vValue;
				} else if (isPlainObject(vValue)) {
					fnFlattenPath(vValue, [].concat(aPath, sKey));
				}
			});
		};

		fnFlattenPath(oMetadata || {}, []);
		return oFlatMetadata;
	};

	BaseEditor.prototype._initValidators = function (mValidatorModules) {
		ValidatorRegistry.deregisterAllValidators();
		ValidatorRegistry.registerValidators(mValidatorModules);

		// Wait for all validators in order to use them
		// synchronously inside the property editors
		ValidatorRegistry.ready().then(function () {
			this._bValidatorsReady = true;
			this._checkReady();
		}.bind(this));
	};

	BaseEditor.prototype._reset = function () {
		this._bInitFinished = false;
		this._setReady(false);

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

		if (this._oRootWrapper) {
			this._oRootWrapper.destroy();
		}
	};

	BaseEditor.prototype.initialize = function () {
		if (!this._bPreventInitialization) {
			this._initialize();
		}
	};

	BaseEditor.prototype._initialize = function () {
		this._reset();

		var mConfig = this.getConfig();

		if (typeof this.getProperty("json") === "undefined") {
			// Initial JSON data wasn't set yet
			this.attachEventOnce("jsonChange", this._initialize);
			return;
		}

		if (mConfig) {
			this._oConfigObserver = new ObjectBinding();

			this._loadI18nBundles(mConfig.i18n)
				.then(function (aBundles) {
					this._oI18nModel = this._createI18nModel(aBundles);
					this.setModel(this._oI18nModel, "i18n");

					// Setup config observer
					this._oConfigObserver.addToIgnore(["template", "itemLabel"]); // Ignore array templates and itemLabels
					this._oConfigObserver.setModel(this._oDataModel);
					this._oConfigObserver.setModel(this._oDesigntimeMetadataModel, "designtimeMetadata");
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

					this._mObservableConfig = Object.assign(this._mObservableConfig, this._prepareConfig(mPropertiesConfig));
					this._oConfigObserver.setObject(this._mObservableConfig);

					this._oConfigObserver.attachChange(this._onConfigChange, this);

					// If there is no custom layout, create default
					var aContent = this.getContent();
					if (
						aContent.length === 0
						|| aContent.length === 1 && aContent[0] === this._oRootWrapper
					) {
						this.removeAllContent();
						this._createEditors(this._oConfigObserver.getObject());
					}

					this._bInitFinished = true;
					this._checkReady();
				}.bind(this));
		}
	};

	BaseEditor.prototype._onConfigChange = function (oEvent) {
		var oChangeMap = oEvent.getParameter("changes")
			.reduce(function (oCurrentChangeMap, oOriginalChange) {
				var oChange = deepClone(oOriginalChange);
				oChange.path = oChange.path.split("/");
				oChange.propertyKey = oChange.path.shift();
				if (!oCurrentChangeMap[oChange.propertyKey]) {
					oCurrentChangeMap[oChange.propertyKey] = [];
				}
				oCurrentChangeMap[oChange.propertyKey].push(oChange);
				return oCurrentChangeMap;
			}, {});

		// Collect all editors which are affected by one of the changes
		var aPropertyEditors = Object.keys(oChangeMap).reduce(function (aList, sPropertyName) {
			var aAffectedEditors = (this.getPropertyEditorsByNameSync(sPropertyName) || [])
				.map(function (oEditor) {
					return {
						editor: oEditor,
						// Keep the property name to identify independent editors later
						propertyName: sPropertyName
					};
				});
			aList = aList.concat(aAffectedEditors);
			return aList;
		}.bind(this), []);

		// Property editors which are not managed by the root wrapper
		// have to be updated independently
		var aIndependentEditors = aPropertyEditors.filter(function (oPropertyEditor) {
			return !this._oRootWrapper || !this._oRootWrapper._aEditorWrappers.includes(oPropertyEditor.editor);
		}.bind(this));

		aIndependentEditors.forEach(function (oPropertyEditor) {
			var sPropertyKey = oPropertyEditor.propertyName;
			var mProperties = oEvent.getSource().getObject();
			var mPropertyConfig = _omit(deepClone(mProperties[sPropertyKey]), "value");
			var bConfigChanged = false;

			var aChanges = oChangeMap[sPropertyKey] || [];
			aChanges.forEach(function (oChange) {
				if (oChange.path[0] === "value") {
					oPropertyEditor.editor.setValue(oChange.value);
				} else {
					ObjectPath.set(oChange.path, oChange.value, mPropertyConfig);
					bConfigChanged = true;
				}
			});

			if (bConfigChanged) {
				oPropertyEditor.editor.setConfig(mPropertyConfig);
			}
		});

		// If at least one property editor is managed by the root wrapper
		// update the wrapper and let it pass the change down to the
		// property editors
		if (aIndependentEditors.length < aPropertyEditors.length) {
			var aModifiedConfigs = deepClone(this._oRootWrapper.getConfig())
				.map(function (mConfig) {
					var aChanges = oChangeMap[mConfig.__propertyName] || [];
					aChanges.forEach(function (oChange) {
						ObjectPath.set(oChange.path, oChange.value, mConfig);
					});
					return mConfig;
				});
			this._oRootWrapper.setConfig(aModifiedConfigs);
		}
	};

	BaseEditor.prototype._createModel = function () {
		var oModel = new JSONModel();
		oModel.setDefaultBindingMode("OneWay");
		return oModel;
	};

	BaseEditor.prototype.getI18nProperty = function (sName, aPlaceholders) {
		if (this.getModel("i18n")) {
			return this.getModel("i18n").getResourceBundle().getText(sName, aPlaceholders);
		}
		return sName;
	};

	/**
	 * Loads i18n bundles.
	 *
	 * @param {string[]} aBundlePaths - List of paths to i18n bundles
	 * @returns {Promise<module:sap/base/i18n/ResourceBundle>} Array of {@link module:sap/base/i18n/ResourceBundle i18n resource bundles}
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
			value: "{" + sPath + "}",
			designtime: "{designtimeMetadata>" + sPath + "}"
		});
	};

	/**
	 * Creates property editors wrappers for all configurable properties.
	 */
	BaseEditor.prototype._createEditors = function (mPropertiesConfig) {
		var vLayoutConfig = ObjectPath.get(["layout", this.getLayout()], this.getConfig());

		if (isPlainObject(vLayoutConfig) || Array.isArray(vLayoutConfig)) {
			vLayoutConfig = resolveBinding(
				vLayoutConfig,
				{
					"i18n": this._oI18nModel
				}
			);
		}

		this._oRootWrapper = new PropertyEditors({
			config: Object.values(mPropertiesConfig),
			layout: this.getLayout(),
			layoutConfig: vLayoutConfig
		});

		this.addContent(this._oRootWrapper);

		return (
			Promise.all(
				Object.values(this._mPropertyEditors)
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
		var vValue = ObjectPath.get([sKey], this._oConfigObserver.getObject()).value;

		oPropertyEditor.setValue(vValue);
		oPropertyEditor.attachValueChange(this._onValueChange, this);
		oPropertyEditor.attachDesigntimeMetadataChange(this._onDesigntimeMetadataChange, this);
		oPropertyEditor.attachReady(this._checkReady, this);
		oPropertyEditor.attachValidationErrorChange(function() {
			this.fireValidationErrorChange({
				hasError: this.hasError()
			});
		}.bind(this));
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
		oPropertyEditor.detachDesigntimeMetadataChange(this._onDesigntimeMetadataChange, this);

		if (Array.isArray(aList)) {
			this._mPropertyEditors[sKey] = aList.filter(function (oItem) {
				return oPropertyEditor !== oItem;
			});

			if (this._mPropertyEditors[sKey].length === 0) {
				delete this._mPropertyEditors[sKey];
			}
		}
	};

	BaseEditor.prototype._setReady = function (bReadyState) {
		var bPreviousReadyState = this._bIsReady;
		this._bIsReady = bReadyState;
		if (bPreviousReadyState !== true && bReadyState === true) {
			// If the editor was not ready before, fire the ready event
			this.firePropertyEditorsReady({ propertyEditors: this.getPropertyEditorsSync() });
		}
	};

	BaseEditor.prototype._checkReady = function () {
		var aLayoutDependecies = this.getContent().filter(function (oEditor) {
			return (
				oEditor.isA("sap.ui.integration.designtime.baseEditor.PropertyEditors")
				|| oEditor.isA("sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor")
			);
		});

		// Workaround to support first-level of async dependencies of BaseEditor ¯\_(ツ)_/¯
		aLayoutDependecies.forEach(function (oEditor) {
			if (!EventProvider.hasListener(oEditor, "ready", this._checkReady, this)) {
				oEditor.attachReady(this._checkReady, this);
			}
		}, this);

		var aAsyncDependencies = [].concat(
			aLayoutDependecies,
			this.getPropertyEditorsSync()
		);

		var bIsReady = (
			this._bInitFinished
			&& this._bValidatorsReady
			&& aAsyncDependencies.every(function (oEditor) {
				return oEditor.isReady();
			})
		);
		this._setReady(bIsReady);
	};

	BaseEditor.prototype.isReady = function () {
		return this._bIsReady;
	};

	/**
	 * Wait for the BaseEditor to be ready.
	 * @returns {Promise} Promise which will resolve once the editor is ready. Resolves immediately if the editor is currently ready.
	 */
	BaseEditor.prototype.ready = function () {
		return new Promise(function (resolve) {
			if (this.isReady()) {
				// The editor is already ready, resolve immediately
				resolve();
			} else {
				this.attachEventOnce("propertyEditorsReady", resolve);
			}
		}.bind(this));
	};

	BaseEditor.prototype.hasError = function () {
		return _flatten(Object.values(this._mPropertyEditors || {})).some(function(oPropertyEditor) {
			return oPropertyEditor.hasError();
		});
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
			ObjectPath.get([sPropertyName], this._oConfigObserver.getObject()),
			"value"
		);
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
	 * Returns a list of property editors corresponding to a specified list of tags.
	 * @param {string|string[]} vTag - List of tags
	 * @returns {Promise<sap.ui.integration.designtime.baseEditor.PropertyEditor[]|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor[]|null>} List of property editors for the specified tags
	 */
	BaseEditor.prototype.getPropertyEditorsByTag = function (vTag) {
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
	 * Returns list of configurations for properties which match the specified list of the tags.
	 * @param {string|string[]} vTag - Tag or an array of tags.
	 * @returns {object[]} Array of the configuration objects which match all the specified tags
	 */
	BaseEditor.prototype.getConfigsByTag = function (vTag) {
		var aProperties = this.getConfig().properties;

		return Object.keys(aProperties)
			.filter(function (sPropertyName) {
				return hasTag(aProperties[sPropertyName], vTag);
			})
			.map(function (sPropertyName) {
				return aProperties[sPropertyName];
			});
	};

	/**
	 * Returns a list of property editors corresponding to a specified list of tags.
	 * @param {string|string[]} vTag - List of tags
	 * @returns {sap.ui.integration.designtime.baseEditor.PropertyEditor[]|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor[]|null} List of property editors for the specified tags
	 */
	BaseEditor.prototype.getPropertyEditorsByTagSync = function (vTag) {
		return this.getPropertyEditorsSync().filter(function (oPropertyEditor) {
			return hasTag(oPropertyEditor.getConfig(), vTag);
		});
	};

	/**
	 * Returns a list of registered property editors.
	 * @returns {sap.ui.integration.designtime.baseEditor.PropertyEditor[]|sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor[]|null} List of property editors
	 */
	BaseEditor.prototype.getPropertyEditorsSync = function () {
		return Object.values(this._mPropertyEditors)
			.reduce(function (aResult, aCurrent) {
				return aResult.concat(aCurrent);
			}, [])
			.sort(function (oPropertyEditor1, oPropertyEditor2) {
				return parseInt(oPropertyEditor1.getId().match(/\d+$/)) - parseInt(oPropertyEditor2.getId().match(/\d+$/));
			});
	};

	BaseEditor.prototype.getJson = function () {
		return _merge({}, this.getProperty("json")); // To avoid manipulations with the json outside of the editor
	};

	BaseEditor.prototype.getDesigntimeMetadata = function () {
		return _merge({}, this.getProperty("designtimeMetadata"));
	};

	BaseEditor.prototype._getContextPath = function () {
		var oConfig = this.getConfig();
		var sContext = oConfig && oConfig.context || null;

		if (sContext && sContext[0] !== "/") {
			sContext = "/" + sContext;
		}

		return sContext;
	};

	BaseEditor.prototype._onValueChange = function (oEvent) {
		var oPropertyEditor = oEvent.getSource();
		var sPath = oEvent.getParameter("path");
		var oJson = this.getJson() || {};
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

		if (
			typeof vValue === "undefined"
			|| deepEqual(vValue, oPropertyEditor.getRuntimeConfig().defaultValue)
			|| Array.isArray(vValue) && vValue.length === 0
			|| isPlainObject(vValue) && isEmptyObject(vValue)
		) {
			unset(oJson, aParts);
		}

		this.setJson(oJson);
	};

	BaseEditor.prototype._onDesigntimeMetadataChange = function (oEvent) {
		var sPath = oEvent.getParameter("path");
		var oDesigntimeMetadata = this.getDesigntimeMetadata() || {};
		var vValue = oEvent.getParameter("value");

		if (sPath[0] === "/") {
			sPath = sPath.substr(1);
		} else {
			throw new Error("BaseEditor._onDesigntimeMetadataChange: unknown relative path - '" + sPath + "'");
		}

		var aParts = sPath.split("/");

		ObjectPath.set(
			aParts,
			vValue,
			oDesigntimeMetadata
		);

		cleanupDesigntimeMetadata(oDesigntimeMetadata);

		this.setDesigntimeMetadata(oDesigntimeMetadata);
	};

	return BaseEditor;
});
