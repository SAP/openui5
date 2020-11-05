/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_CancelablePromise",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/restricted/_omit",
	"sap/base/util/merge",
	"sap/base/util/deepClone",
	"sap/base/util/ObjectPath",
	"./CardEditor",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/util/CardMerger",
	"sap/base/util/LoaderExtensions",
	"sap/base/Log"
], function (
	CancelablePromise,
	_isEqual,
	_omit,
	merge,
	deepClone,
	ObjectPath,
	CardEditor,
	BaseEditor,
	Designtime,
	CardMerger,
	LoaderExtensions,
	Log
) {
	"use strict";

	var configurationTemplate = "";
	configurationTemplate = LoaderExtensions.loadResource("sap/ui/integration/designtime/cardEditor/ConfigurationTemplate.js", {
		dataType: "text",
		failOnError: false,
		async: false
	});

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var BASEditor = CardEditor.extend("sap.ui.integration.designtime.cardEditor.BASEditor", {
		metadata: {
			library: "sap.ui.integration",
			events: {
				configurationChange: {},
				createConfiguration: {},
				error: {},
				designtimeInited: {}
			}
		},
		renderer: CardEditor.getMetadata().getRenderer()
	});

	BASEditor.prototype.getManifest = function () {
		return this._oCurrent.manifest;
	};

	BASEditor.prototype.getConfigurationClass = function () {
		return this._oCurrent.configurationclass;
	};

	BASEditor.prototype.getConfiguration = function () {
		return this._oCurrent.configuration;
	};

	BASEditor.prototype.getConfigurationString = function () {
		return this._oCurrent.configurationstring;
	};

	BASEditor.prototype._generateDesigntimeJSConfig = function () {
		var oMetadata = this._formatExportedDesigntimeMetadata(this.getDesigntimeMetadata());
		var oJson = this.getJson();
		if (this._eventTimeout) {
			clearTimeout(this._eventTimeout);
			this._eventTimeout = null;
		}
		this._eventTimeout = setTimeout(function () {
			var oEmptyItems = {
				form: {
					items: {}
				}
			};
			var oCopyConfig = merge(oEmptyItems, this._oDesigntimeJSConfig);
			var oNewItems = {};
			var aItems = [];
			var oItem;
			if (oJson) {
				//parameters content changed added, removed
				var mParameters = ObjectPath.get(["sap.card", "configuration", "parameters"], oJson);
				if (!mParameters) {
					this._oCurrent = {
						configuration: this._cleanConfig(this._oDesigntimeJSConfig),
						manifest: this._cleanJson(),
						configurationclass: this._fnDesigntime,
						configurationstring: this._cleanConfig(this._oDesigntimeJSConfig, true)
					};
					this.fireConfigurationChange(this._oCurrent);
					return;
				}
				var aCurrentKeys = Object.keys(mParameters);
				for (var n in oCopyConfig.form.items) {
					oItem = merge({}, oCopyConfig.form.items[n]);
					if (!mParameters[n]) {
						//delete the item because it is not part of parameters anymore
						delete oCopyConfig.form.items[n];
						continue;
					}
					var iIndex = aCurrentKeys.indexOf(n);
					if (iIndex > -1) {
						aCurrentKeys.splice(iIndex, 1);
					}
					var oViz;
					if (oCopyConfig.form.items[n].visualization) {
						oViz = oCopyConfig.form.items[n].visualization;
					}
					oCopyConfig.form.items[n] = merge(oItem, mParameters[n]);
					if (oViz) {
						oCopyConfig.form.items[n].visualization = oViz;
						oViz = null;
					}
				}
				if (aCurrentKeys.length > 0) {
					//something new
					for (var i = 0; i < aCurrentKeys.length; i++) {
						var sNewItem = aCurrentKeys[i];
						var oNewItem = mParameters[sNewItem];
						oCopyConfig.form.items[sNewItem] = {
							manifestpath: "/sap.card/configuration/parameters/" + sNewItem + "/value",
							type: oNewItem.type || "string",
							label: oNewItem.label,
							translatable: false,
							editable: oNewItem.editable,
							visible: oNewItem.visible
						};
					}
					mParameters[sNewItem] = merge(oCopyConfig.form.items[sNewItem], mParameters[sNewItem]);
				}
			}
			if (oMetadata) {
				var mParameters = ObjectPath.get(["sap.card", "configuration", "parameters"], oJson);
				if (oCopyConfig) {
					for (var n in oMetadata) {
						var oMetaItem = oMetadata[n];
						var sKey = n.substring(n.lastIndexOf("/") + 1);
						if (!n.startsWith("sap.card/configuration/parameters")) {
							continue;
						}
						var oOriginalItem = oCopyConfig.form.items[sKey];
						var oViz;
						if (oOriginalItem.visualization) {
							oViz = oOriginalItem.visualization;
						}

						oItem = merge(oOriginalItem || {}, mParameters[sKey]);
						if (oMetaItem.hasOwnProperty("label")) {
							oItem.label = oMetaItem.label;
						}
						if (oMetaItem.hasOwnProperty("position")) {
							oItem.position =  oMetaItem.position;
						}
						if (oItem.editable === "false") {
							oItem.editable = false;
						} else if (oItem.editable === "true") {
							oItem.editable = false;
						}
						if (oItem.visible === "false") {
							oItem.visible = false;
						} else if (oItem.visible === "true") {
							oItem.visible = false;
						}

						if (oViz) {
							oItem.visualization = oViz;
							oViz = null;
						}
						oItem.__key = sKey;
						aItems[oItem.position] = oItem;

					}
					for (var i = 0; i < aItems.length; i++) {
						oItem = aItems[i];
						if (!oItem) {
							continue;
						}
						oNewItems[oItem.__key] = oItem;
						delete oItem.__key;
						delete oItem.position;
					}
					oCopyConfig.form.items = oNewItems;
				}
			}
			this._oDesigntimeJSConfig = oCopyConfig;
			this._fnDesigntime = function (o) {
				return new Designtime(o);
			}.bind(this, this._oDesigntimeJSConfig);
			this._oCurrent = {
				configuration: this._cleanConfig(this._oDesigntimeJSConfig),
				manifest: this._cleanJson(),
				configurationclass: this._fnDesigntime,
				configurationstring: this._cleanConfig(this._oDesigntimeJSConfig, true)
			};
			this.fireConfigurationChange(this._oCurrent);
		}.bind(this), 500);
	};

	BASEditor.prototype.init = function () {
		CardEditor.prototype.init.apply(this, arguments);
		this._oCurrent = {
			configuration: null,
			manifest: null,
			configurationclass: null
		};
	};

	BASEditor.prototype._applyDefaultValue = function (oItem) {
		if (oItem.value === undefined || oItem.value === null) {
			switch (oItem.type) {
				case "boolean": oItem.value = oItem.defaultValue || false; break;
				case "integer":
				case "number": oItem.value = oItem.defaultValue || 0; break;
				case "string[]": oItem.value = oItem.defaultValue || []; break;
				default: oItem.value = oItem.defaultValue || "";
			}
		}
	};

	BASEditor.prototype._cleanJson = function (oJson) {
		oJson = oJson || this.getJson();
		var sDesigntimePath = sanitizePath(ObjectPath.get(["sap.card", "designtime"], oJson) || "");
		if (!sDesigntimePath) {
			ObjectPath.set(["sap.card", "designtime"], "dt/configuration", oJson);
		}
		oJson = deepClone(oJson);
		var mParameters = ObjectPath.get(["sap.card", "configuration", "parameters"], oJson);
		for (var n in mParameters) {
			var oParam = mParameters[n];
			if (oParam && oParam.manifestpath && !oParam.manifestpath.startsWith("/sap.card/configuration/parameters")) {
				delete mParameters[n];
				continue;
			}
			mParameters[n] = {
				value: mParameters[n].value
			};
		}
		if (this._i18n) {
			ObjectPath.set(["sap.app", "i18n"], this._i18n, oJson);
		}
		return oJson;
	};

	BASEditor.prototype._cleanConfig = function (oConfig, bString) {
		var oConfig = merge({}, oConfig);
		for (var n in oConfig.form.items) {
			var oItem = oConfig.form.items[n];
			delete oItem.value;
			if (oItem.visualization &&
				oItem.visualization.type &&
				typeof oItem.visualization.type === "function") {
				if (oItem.visualization.type.getMetadata && oItem.visualization.type.getMetadata()) {
					var sClass = oItem.visualization.type.getMetadata().getName().replace(/\./g, "/");
					if (bString) {
						var iIndex = sClass.lastIndexOf("/");
						sClass = iIndex > 0 ? sClass.substring(iIndex + 1) : sClass;
						oItem.visualization.type = "$$" + sClass + "$$";
					} else {
						oItem.visualization.type = oItem.visualization.type.getMetadata().getName().replace(/\./g, "/");
					}
				}
			}
		}
		if (bString) {
			var sConfig = JSON.stringify(oConfig, null, "\t");
			sConfig = sConfig.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
				return s.substring(3, s.length - 3);
			});
			return sConfig;
		}
		return oConfig;
	};

	BASEditor.prototype._generateMetadataFromJSConfig = function () {
		var oMetadata = {};
		if (this._oDesigntimeJSConfig) {
			var mItems = this._oDesigntimeJSConfig.form.items;
			var i = 0;
			for (var n in mItems) {
				var sPath = "sap.card/configuration/parameters/" + n,
					aPath = sPath.split("/"),
					oMetaItem;
				oMetadata[sPath] = merge({}, mItems[n]);
				oMetaItem = oMetadata[sPath];
				oMetaItem.position = i++;
				if (oMetaItem.visualization) {
					oMetaItem.visualization = 1;
				}

				if (!oMetaItem.manifestpath.startsWith("/sap.card/configuration/parameters/") || !ObjectPath.get(aPath, this._oInitialJson)) {
					ObjectPath.set(aPath, oMetaItem, this._oInitialJson);
				}
				ObjectPath.set(aPath, oMetaItem, this._oInitialJson);

				if (!oMetaItem.hasOwnProperty("type")) {
					this.fireError({
						"name": "Designtime Error",
						"detail": {
							"message": "Type of parameter " + n + " not exist"
						}
					});
				} else if (oMetaItem.type === "") {
					this.fireError({
						"name": "Designtime Error",
						"detail": {
							"message": "Type of parameter " + n + " is Invalid"
						}
					});
				}

				if (!oMetaItem.hasOwnProperty("value")) {
					var aOtherPath = oMetaItem.manifestpath.substring(1).split("/"),
						vValue = ObjectPath.get(aOtherPath, this._oInitialJson);
					if (vValue !== undefined) {
						oMetaItem.value = vValue;
					} else {
						this._applyDefaultValue(oMetaItem);
					}
				} else {
					this._applyDefaultValue(oMetaItem);
				}

				if (ObjectPath.get(aPath, this._oInitialJson)) {
					if (ObjectPath.get(aPath, this._oInitialJson).value === undefined) {
						//set the value from the metadata to the original data
						ObjectPath.get(aPath, this._oInitialJson).value = oMetaItem.value;
					}
				}
			}
		}
		return oMetadata;
	};

	BASEditor.prototype.setJson = function (oJson) {
		if (!this._i18n) {
			this._i18n = ObjectPath.get(["sap.app", "i18n"], oJson);
		}

		BaseEditor.prototype.setJson.apply(this, arguments);
		if (!this.__generateDesigntimeJSConfigAttached) {
			this.attachDesigntimeMetadataChange(this._generateDesigntimeJSConfig.bind(this));
			this.attachJsonChange(this._generateDesigntimeJSConfig.bind(this));
			this.__generateDesigntimeJSConfigAttached = true;
		}

		var oJson = this.getJson();
		var sCardId = ObjectPath.get(["sap.app", "id"], oJson);

		if (this._bDesigntimeInit && this._bCardId !== sCardId) {
			if (this._oDesigntimePromise) {
				this._oDesigntimePromise.cancel();
			}
			delete this._bCardId;
			delete this._bDesigntimeInit;
		}

		if (!this._bDesigntimeInit) {
			this.setPreventInitialization(true);
			this._bCardId = sCardId;
			var sTempDesigntimeUrl;
			var sDesigntimePath = sanitizePath(ObjectPath.get(["sap.card", "designtime"], oJson) || "");
			if (!sDesigntimePath) {
				var sDesigntime = configurationTemplate;
				//sDesigntime = sDesigntime.replace(/\$\$CARDID\$\$/, sCardId + ".Configuration");
				ObjectPath.set(["sap.card", "designtime"], "dt/configuration", oJson);
				sTempDesigntimeUrl = "sap/ui/integration/designtime/cardEditor/ConfigurationTemplate";
				this.fireCreateConfiguration({
					file: "dt/configuration.js",
					content: sDesigntime,
					manifest: this._cleanJson(oJson)
				});
				return;
			}
			var sBaseUrl = sanitizePath(this.getBaseUrl() || "");
			if (sBaseUrl && sDesigntimePath) {
				var mPaths = {};
				var sSanitizedBaseUrl = sanitizePath(sBaseUrl);
				var sDesigntimeRelativePath = trimCurrentFolderPrefix(sDesigntimePath);
				var sDesigntimeAbsolutePath = sSanitizedBaseUrl + "/" + sDesigntimeRelativePath;
				var sNamespace = sCardId.replace(/\./g, "/") + "/" + sDesigntimeRelativePath;

				mPaths[sNamespace] = sDesigntimeAbsolutePath;
				mPaths[sNamespace + "js"] = sDesigntimeAbsolutePath.substring(0, sDesigntimeAbsolutePath.lastIndexOf("/"));
				var sFileName = sDesigntimeAbsolutePath.replace(mPaths[sNamespace + "js"] + "/", "");
				sap.ui.loader.config({
					paths: mPaths
				});
				//var sEditorConfigModule = sNamespace + "/editor.config";
				//var sI18nModule = sNamespace + "/i18n/i18n.properties";
				//var sDesigntimeMetadataPath = sDesigntimeAbsolutePath + "/metadata.json";
				var that = this;
				this._oDesigntimePromise = new CancelablePromise(function (fnResolve) {
					var sUrl = sNamespace + "js" + "/" + sFileName + ".js";
					if (sTempDesigntimeUrl) {
						sUrl = sTempDesigntimeUrl + ".js";
					}
					sap.ui.loader._.loadJSResourceAsync(sUrl).then(function (DesigntimeClass) {
						if (!DesigntimeClass) {
							//file exists but no valid js
							that.fireError({
								"name": "Designtime Error",
								"detail": {
									"message": "Invalid file format"
								}
							});
						} else if (DesigntimeClass) {
							var oDesigntime = new DesigntimeClass();
							that._oDesigntimeJSConfig = oDesigntime.getSettings();
							that._fnDesigntime = DesigntimeClass;
							var oMetadata = that._generateMetadataFromJSConfig(that._oDesigntimeJSConfig);
							DesigntimeClass = oDesigntime.getMetadata().getClass();
							fnResolve(oMetadata);
						}
					}).catch(function (o) {
						//error no valid js file... create one
						Log.error(o);
						that.fireError({
							"name": "Designtime Error",
							"detail": o
						});
					});
				});

				this._oDesigntimePromise.then(function (oMetadata) {
					this.setPreventInitialization(false);

					// Metadata
					var oDesigntimeMetadata = oMetadata;
					oDesigntimeMetadata = CardMerger.mergeCardDesigntimeMetadata(oDesigntimeMetadata, this.getDesigntimeChanges());

					this._oInitialDesigntimeMetadata = oDesigntimeMetadata;
					this.setDesigntimeMetadata(formatImportedDesigntimeMetadata(oDesigntimeMetadata), true);

					// Editor config

					this._bDesigntimeInit = true;
					this.fireDesigntimeInited();
				}.bind(this));
			} else {
				this.setPreventInitialization(false);
				//this.addConfig({});
			}
		}
	};

	BASEditor.prototype.initialize = function () {
		//If designtime is not ready, attach to event
		if (!this._bDesigntimeInit) {
			this.attachEventOnce("designtimeInited", this.initialize);
			return;
		}
		if (!this._bPreventInitialization) {
			this._initialize();
		}
	};

	BASEditor.prototype.getConfigurationTemplate = function () {
		return configurationTemplate;
	};

	function formatImportedDesigntimeMetadata(oFlatMetadata) {
		var oFormattedMetadata = {};
		Object.keys(oFlatMetadata).forEach(function (sPath) {
			ObjectPath.set(sPath.split("/"), { __value: deepClone(oFlatMetadata[sPath]) }, oFormattedMetadata);
		});
		return oFormattedMetadata;
	}
	function sanitizePath(sPath) {
		return sPath.trim().replace(/\/*$/, "");
	}

	function trimCurrentFolderPrefix(sPath) {
		return sPath.replace(/^\.\//, "");
	}

	return BASEditor;
});
