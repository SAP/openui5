/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Control",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/ui/base/Interface",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/integration/Designtime",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/integration/util/Utils",
	"sap/ui/integration/util/Destinations",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/m/Popover",
	"sap/base/Log",
	"sap/ui/core/Popup",
	"sap/ui/dom/includeStylesheet",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/theming/Parameters",
	"sap/base/util/ObjectPath",
	"sap/m/MessageStrip",
	"./Manifest",
	"./Merger",
	"./Constants",
	"sap/m/Tree",
	"sap/m/StandardTreeItem",
	"./EditorRenderer",
	"./EditorFieldManager",
	"./EditorTranslation"
], function(
	Localization,
	Control,
	deepClone,
	deepEqual,
	merge,
	Interface,
	Element,
	Library,
	Designtime,
	JSONModel,
	ODataModel,
	Utils,
	Destinations,
	DataProviderFactory,
	Popover,
	Log,
	Popup,
	includeStylesheet,
	LoaderExtensions,
	Parameters,
	ObjectPath,
	MessageStrip,
	Manifest,
	Merger,
	Constants,
	Tree,
	StandardTreeItem,
	EditorRenderer,
	EditorFieldManager,
	EditorTranslation
) {
	"use strict";

	//workaround issue of orientation change fired that reapplies position and closes the popup
	//issue is not predictable and depends on host environment. Solution - apply all, simply do not close for position changes.
	var popoverInit = Popover.prototype.init;
	Popover.prototype.init = function () {
		popoverInit.apply(this, arguments);
		var fn = this.oPopup._applyPosition,
			that = this;
		this.oPopup._applyPosition = function () {
			var fnClose = that.close;
			that.close = function () { };
			fn.apply(this, arguments);
			that.close = fnClose;
		};
	};

	function getHigherZIndex(source) {
		if (source && source.nodeType !== 1) {
			return 0;
		}
		var z = parseInt(window.getComputedStyle(source).getPropertyValue('z-index'));
		if (isNaN(z)) {
			return getHigherZIndex(source.parentNode);
		}
		return z + 1;
	}
	var REGEXP_TRANSLATABLE = /\{\{(?!parameters.)(?!destinations.)([^\}\}]+)\}\}/g,
		REGEXP_PARAMETERS = /\{\{parameters\.([^\}\}]+)/g,
		CONTEXT_TIMEOUT = 5000,
		MessageStripId = "_strip",
		MODULE_PREFIX = "module:",
		CONTEXT_ENTRIES;

	/**
	 * Constructor for a new <code>Editor</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control allows to edit manifest settings from a designtime module.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.94
	 * @private
	 * @alias sap.ui.integration.editor.Editor
	 */
	var Editor = Control.extend("sap.ui.integration.editor.Editor", /** @lends sap.ui.integration.editor.Editor.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * admin, content, translation, all
				 * Used to control the editors capabilities
				 */
				mode: {
					type: "string",
					defaultValue: Constants.EDITOR_MODE.ADMIN
				},
				language: {
					type: "string",
					defaultValue: ""
				},
				allowDynamicValues: {
					type: "boolean",
					defaultValue: false
				},
				allowSettings: {
					type: "boolean",
					defaultValue: false
				},
				designtime: {
					type: "object"
				},
				section: {
					type: "string",
					defaultValue: "sap.card"
				},
				host: {
					type: "string",
					defaultValue: ""
				},
				baseUrl: {
					type: "sap.ui.core.URI",
					defaultValue: null
				},
				json: {
					type: "object"
				},
				previewPosition:{
					type: "string",
					defaultValue: "right" // value can be "top", "bottom", "left", "right" or "separate"
				},
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				}
			},
			aggregations: {
				/**
				 * Defines the header of the Editor.
				 */
				_formContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					visibility: "hidden"
				},
				_preview: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				_messageStrip: {
					type: "sap.m.MessageStrip",
					multiple: false,
					visibility: "hidden"
				},
				_extension: {
					type: "sap.ui.integration.editor.Extension",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				manifestReady: {},
				fieldReady: {},
				destinationReady: {},
				childTreeDataReady: {},
				UIReady: {},
				ready: {}
			}
		},
		renderer: EditorRenderer
	});

	/**
	 * Init of the editor
	 */
	Editor.prototype.init = function () {
		if (Editor.oResourceBundle && Editor.oResourceBundle.sLocale !== Utils._language) {
			Editor.oResourceBundle = Library.getResourceBundleFor("sap.ui.integration", Utils._language);
			this._applyLanguageChange();
		}
		this._fieldReady = false;
		this._ready = false;
		this._aFieldReadyPromise = [];
		this._aFieldDataReadyPromise = [];
		this._oResourceBundle = Library.getResourceBundleFor("sap.ui.integration", Utils._language);
		this._aAppliedLayerChanges = [];
		this._oBeforeLayerChange = {};
		this._oCurrentLayerChange = {};
		this._mDestinationDataProviders = {};
		var oMessageStrip = new MessageStrip(this.getId() + MessageStripId, {
			showIcon: false
		});
		oMessageStrip.addStyleClass("sapUiIntegrationEditorFieldMessageStrip");
		this.setAggregation("_messageStrip", oMessageStrip);
		MessageStripId = oMessageStrip.getId();
		this.setLanguage(Localization.getLanguage());
		/**
		 * Facade of the {@link sap.ui.integration.editor.Editor} control.
		 * @interface
		 * @name sap.ui.integration.editor.EditorFacade
		 * @public
		 * @author SAP SE
		 * @version ${version}
		 * @borrows sap.ui.integration.editor.Editor#getParameters as getParameters
		 * @borrows sap.ui.integration.editor.Editor#resolveDestination as resolveDestination
		 * @borrows sap.ui.integration.editor.Editor#request as request
		 * @borrows sap.ui.integration.editor.Editor#getModel as getModel
		 */
		 this._oLimitedInterface = new Interface(this, [
			"getParameters",
			"resolveDestination",
			"request",
			"getModel"
		]);
	};

	Editor.prototype.getParameters = function () {
		if (!this._isManifestReady) {
			Log.error("sap.ui.integration.editor.Editor: the manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.editor.Editor");
			return null;
		}

		var oParams = this._oManifest.getProcessedParameters(),
			oResultParams = {},
			sKey;

		for (sKey in oParams) {
			oResultParams[sKey] = oParams[sKey].value;
		}

		return oResultParams;
	};

	Editor.prototype.resolveDestination = function (sKey) {
		return this._oDestinations.getUrl(sKey);
	};

	/**
	 * Returns whether the editor is ready to be used
	 */
	Editor.prototype.isReady = function () {
		return this._ready;
	};

	/**
	 * Returns whether the fields of editor are ready to be used
	 */
	Editor.prototype.isFieldReady = function () {
		return this._fieldReady;
	};

	Editor.prototype.hasPreview = function() {
		var oPreview = this.getAggregation("_preview");
		if (oPreview && oPreview.visible !== false) {
			return true;
		}
		return false;
	};

	Editor.prototype.getSeparatePreview = function() {
		var sPreviewPosition = this.getPreviewPosition();
		if (!this.isFieldReady() || sPreviewPosition !== "separate") {
			return null;
		}
		if (!this._oPreview) {
			this._oPreview = this.getAggregation("_preview");
		}
		return this._oPreview;
	};

	Editor.prototype.flattenData = function(oData, s, a, path) {
		path = path || "";
		a = a || [];
		if (typeof oData === "object") {
			if (!oData[s]) {
				for (var n in oData) {
					this.flattenData(oData[n], s, a, path + "/" + n);
				}
			} else {
				//found leave
				if (oData.type) {
					a.push({
						path: oData.pathvalue || path.substring(1),
						value: oData.pathvalue || "{context>" + path.substring(1) + "/value}",
						object: oData
					});
				} else {
					a.push({
						path: path.substring(1),
						object: oData
					});
					for (var n in oData) {
						this.flattenData(oData[n], s, a, path + "/" + n);
					}
				}
			}
		}
		return a;
	};

	Editor.prototype.setJson = function (vIdOrSettings, bSuppress) {
		this._vIdOrSettings = deepClone(vIdOrSettings, 500);
		this._fieldReady = false;
		this._ready = false;
		if (deepEqual(vIdOrSettings, this._preIdOrSettings)) {
			return this;
		}
		this._preIdOrSettings = deepClone(vIdOrSettings, 500);
		if (typeof vIdOrSettings === "string") {
			try {
				vIdOrSettings = JSON.parse(vIdOrSettings);
			} catch (ex) {
				//not json
			}
		}
		if (typeof vIdOrSettings === "object") {
			if (vIdOrSettings.manifestChanges) {
				//map translations of unmatch languages
				Utils.mapLanguagesInManifestChanges(vIdOrSettings.manifestChanges);
				//filter the child changes from the current layer
				this._filterChildManifestChanges(vIdOrSettings);
				//filter the changes from the current layer
				this._filterManifestChangesByLayer(vIdOrSettings);
			}
			if (this._oManifestModel) {
				//already created
				return;
			}
			if (this._oDesigntimeInstance) {
				this._oDesigntimeInstance.destroy();
			}
			if (vIdOrSettings.host) {
				this.setProperty("host", vIdOrSettings.host);
			}
			if (vIdOrSettings.baseUrl) {
				this.setProperty("baseUrl", vIdOrSettings.baseUrl);
			}
			this._aAppliedLayerChanges = vIdOrSettings.manifestChanges;

			this.createManifest(vIdOrSettings, bSuppress);
		}
	};

	Editor.prototype.createManifest = function (vIdOrSettings, bSuppress) {
		var sBaseUrl = this.getBaseUrl();
		var mOptions = {},
			vManifest = vIdOrSettings.manifest;
		this._isManifestReady = false;

		if (typeof vManifest === "string") {
			mOptions.manifestUrl = vManifest;
			vManifest = null;
		}

		if (vIdOrSettings.destoryManifest !== false && this._oManifest) {
			this._oManifest.destroy();
		}
		this.destroyAggregation("_extension");
		var iCurrentModeIndex = Merger.layers[this.getMode()];

		this._oManifest = new Manifest(this.getSection(), vManifest, sBaseUrl, vIdOrSettings.manifestChanges);
		this._oManifest
			.load(mOptions)
			.then(async function () {
				this._registerManifestModulePath();
				this._oInitialManifestModel = new JSONModel(this._oManifest._oInitialJson);
				this.setProperty("json", this._oManifest._oInitialJson, bSuppress);
				var oManifestJson = this._oManifest.oJson;
				var oBeforeLayerManifestJson = merge({}, oManifestJson);
				this._oBeforeLayerManifestModel = new JSONModel(oBeforeLayerManifestJson);
				if (iCurrentModeIndex < Merger.layers[Constants.EDITOR_MODE.TRANSLATION] && this._oCurrentLayerChange) {
					//merge if not translation
					oManifestJson = Merger.mergeDelta(oManifestJson, [this._oCurrentLayerChange], this.getSection());
				}
				//create a manifest model after the changes are merged
				this._oManifestModel = new JSONModel(oManifestJson);
				this._isManifestReady = true;
				this.fireManifestReady();
				this._initResourceBundlesForMultiTranslation();
				//use the translations
				this._loadDefaultTranslations();
				if (this.getMode() === Constants.EDITOR_MODE.TRANSLATION) {
					await this._loadSpecialTranslations();
				}
				//add a context model
				this._createContextModel();
				if (this._oManifest.getResourceBundle()) {
					this._enhanceI18nModel(this._oManifest.getResourceBundle());
				}
				return this._loadExtension().then(function() {
					this._initInternal();
				}.bind(this));
			}.bind(this));
	};

	/**
	 * Returns the languages map from this editor class or any of its superclasses.
	 *
	 * @returns {object}
	 */
	Editor.prototype._getLanguages = function () {
		var oMetadata = this.getMetadata();
		while (oMetadata) {
			var oClass = oMetadata.getClass();
			if (Object.hasOwn(oClass, "_oLanguages")) {
				return oClass._oLanguages;
			}
			oMetadata = oMetadata.getParent();
		}
		return {};
	};

	/**
	 * Init the Resource Bundles for Multi Translation
	 */
	Editor.prototype._initResourceBundlesForMultiTranslation = function () {
		EditorTranslation.initResourceBundlesForMultiTranslation(this, this._getLanguages());
	};

	/**
	 * Registers the manifest ID as a module path.
	 */
	Editor.prototype._registerManifestModulePath = function () {
		if (!this._oManifest) {
			return;
		}
		this._sAppId = this._oManifest.get("/sap.app/id");
		if (this._sAppId) {
			LoaderExtensions.registerResourcePath(this._sAppId.replace(/\./g, "/"), this._oManifest.getUrl() || "/");
		} else {
			Log.error("sap.ui.integration.editor.Editor: sap.app/id entry in the manifest is mandatory");
		}
	};

	Editor.prototype._loadDefaultTranslations = function () {
		return EditorTranslation.loadDefaultTranslations(this);
	};

	Editor.prototype._enhanceI18nModel = function (oResourceBundle) {
		return EditorTranslation.enhanceI18nModel(this, oResourceBundle);
	};

	Editor.prototype._loadExtension = function () {
		var sExtensionPath = this._oManifest.get(this.getConfigurationPath() + "/extension") || this._oManifest.get("/" + this.getSection() + "/extension"),
			sFullExtensionPath;
		if (!sExtensionPath) {
			Log.info("sap.ui.integration.editor.Editor: extension is not defined in manifest, do not load it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}

		if (sExtensionPath.startsWith(MODULE_PREFIX)) {
			sFullExtensionPath = sExtensionPath.replace(MODULE_PREFIX, "");
		} else {
			sFullExtensionPath = this._sAppId.replace(/\./g, "/") + "/" + sExtensionPath;
		}

		return new Promise(function (resolve, reject) {
			sap.ui.require([sFullExtensionPath], function (ExtensionSubclass) {
				var oExtension = new ExtensionSubclass();
				if (oExtension._setEditor) {
					oExtension._setEditor(this, this._oLimitedInterface);
					this.setAggregation("_extension", oExtension); // the framework validates that the subclass extends "sap.ui.integration.Extension"
				}
				resolve();
			}.bind(this), function (vErr) {
				Log.error("sap.ui.integration.editor.Editor: failed to load " + sExtensionPath + ". Check if the path is correct. Reason: " + vErr);
				reject(vErr);
			});
		}.bind(this));
	};

	/**
	 * Performs an HTTP request using the given configuration.
	 *
	 * @public
	 * @param {object} oConfiguration The configuration of the request.
	 * @param {string} oConfiguration.URL The URL of the resource.
	 * @param {string} [oConfiguration.mode="cors"] The mode of the request. Possible values are "cors", "no-cors", "same-origin".
	 * @param {string} [oConfiguration.method="GET"] The HTTP method. Possible values are "GET", "POST".
	 * @param {Object} [oConfiguration.parameters] The request parameters. If the method is "POST" the parameters will be put as key/value pairs into the body of the request.
	 * @param {Object} [oConfiguration.dataType="json"] The expected Content-Type of the response. Possible values are "xml", "json", "text", "script", "html", "jsonp". Note: Complex Binding is not supported when a dataType is provided. Serialization of the response to an object is up to the developer.
	 * @param {Object} [oConfiguration.headers] The HTTP headers of the request.
	 * @param {boolean} [oConfiguration.withCredentials=false] Indicates whether cross-site requests should be made using credentials.
	 * @returns {Promise} Resolves when the request is successful, rejects otherwise.
	 */
	 Editor.prototype.request = function (oConfiguration) {
		var oDataProvider = this._oDataProviderFactory
			.create({ request: oConfiguration })
			.setAllowCustomDataType(true);
		return oDataProvider._waitDependencies().then(function () {
			return oDataProvider.getData();
		});
	};

	Editor.prototype.initDestinations = function (vHost) {
		this._oDestinationsModel = new JSONModel({});
		this.setModel(this._oDestinationsModel, "destinations");
		var oHostInstance = this.getHostInstance();

		if (vHost && !oHostInstance) {
			Log.error(
				"sap.ui.integration.editor.Editor: Host with id '" + vHost + "' is not available during editor initialization. It must be available for host specific features to work.",
				"Make sure that the host already exists, before assigning it to the editor.",
				"sap.ui.integration.editor.Editor"
			);
		}

		// use configurations of main manifest for destinations if current is child and useMainDestinations flag is true
		var sConfigurationPath = this.getConfigurationPath();
		var sPrefix = "destinations";
		var oManifestConfig = this._oManifestModel.getProperty(sConfigurationPath + "/destinations");
		const bUseMainDestinations = this._oManifestModel.getProperty(sConfigurationPath + "/useMainDestinations") === true;

		if (this.isChild && bUseMainDestinations) {
			sPrefix = "mainDestinations";
			oManifestConfig = this._mainManifest.get(sConfigurationPath + "/destinations");
		}
		this._oDestinations = new Destinations({
			host: oHostInstance,
			manifestConfig: oManifestConfig,
			prefix: sPrefix
		});
	};

	Editor.prototype.initDataProviderFactory = function () {
		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
		}
		var oExtension = this.getAggregation("_extension");
		this._oDataProviderFactory = new DataProviderFactory({
			destinations: this._oDestinations,
			extension: oExtension,
			csrfTokensConfig: this._oManifest.get(this.getConfigurationPath() + "/csrfTokens"),
			editor: this
		});
	};

	/**
	 * Resolves the given URL relative to the manifest base path.
	 * Absolute paths are not changed.
	 *
	 * @example
	 * oEditor.resolveUrl("images/Avatar.png") === "sample/card/images/Avatar.png"
	 * oEditor.resolveUrl("http://www.someurl.com/Avatar.png") === "http://www.someurl.com/Avatar.png"
	 * oEditor.resolveUrl("https://www.someurl.com/Avatar.png") === "https://www.someurl.com/Avatar.png"
	 *
	 * @ui5-restricted
	 * @param {string} sUrl The URL to resolve.
	 * @returns {string} The resolved URL.
	 */
	 Editor.prototype.resolveUrl = function (sUrl) {
		var sAppName,
			sSanitizedUrl = sUrl && sUrl.trim().replace(/^\//, "");

		if (!this._oManifest) {
			Log.error("sap.ui.integration.editor.Editor: The manifest is not ready so the URL can not be resolved. Consider using the 'manifestReady' event.", "sap.ui.integration.editor.Editor");
			return null;
		}

		const sAppId = this._sAppId;

		if (sUrl.startsWith("http://") ||
			sUrl.startsWith("https://") ||
			sUrl.startsWith("//")) {
			return sUrl;
		}

		if (!sAppId) {
			Log.error("The manifest property 'sap.app/id' is missing or empty. The URL '" + sUrl + "' cannot be resolved.", "sap.ui.integration.editor.Editor");
			return sUrl;
		}

		sAppName = sAppId.replace(/\./g, "/");

		// do not use sap.ui.require.toUrl(sAppName + "/" + sSanitizedUrl)
		// because it doesn't work when the sSanitizedUrl starts with ".."
		return sap.ui.require.toUrl(sAppName) + "/" + sSanitizedUrl;
	};

	/**
	 * Resolves the given URL relative to the manifest base path.
	 * Absolute paths are not modified.
	 *
	 * @example
	 * oEditor.resolveUrl("images/Avatar.png") === "sample/card/images/Avatar.png"
	 * oEditor.resolveUrl("http://www.someurl.com/Avatar.png") === "http://www.someurl.com/Avatar.png"
	 * oEditor.resolveUrl("https://www.someurl.com/Avatar.png") === "https://www.someurl.com/Avatar.png"
	 *
	 * @deprecated As of version 1.146, replaced by {@link sap.ui.integration.editor.Editor#resolveUrl}
	 * @ui5-restricted
	 * @param {string} sUrl The URL to resolve.
	 * @returns {string} The resolved URL.
	 */
	Editor.prototype.getRuntimeUrl = function (sUrl) {
		Log.warning("'getRuntimeUrl' is deprecated. Use 'resolveUrl' instead.", "sap.ui.integration.editor.Editor");
		return this.resolveUrl(sUrl);
	};

	/**
	 * @private
	 * @ui5-restricted
	 * @returns {object} Local binding functions for this Editor
	 */
	 Editor.prototype.getBindingNamespaces = function () {
		var mNamespaces = {},
			oExtension = this.getAggregation("_extension");

		if (oExtension) {
			mNamespaces.extension = {
				formatters: oExtension.getFormatters()
			};
		}

		return mNamespaces;
	};

	/**
	 * Gets the instance of the <code>host</code> association.
	 *
	 * @public
	 * @returns {sap.ui.integration.Host} The host object associated with this editor.
	 */
	Editor.prototype.getHostInstance = function () {
		var sHost = this.getHost();
		if (!sHost) {
			return null;
		}
		return Element.getElementById(sHost);
	};

	/**
	 * Sets the language of the editor
	 *
	 * @param {string} sValue the language in the format language_region or language-region
	 * @param {*} bSuppress suppress rerendering of the editor
	 */
	Editor.prototype.setLanguage = function (sValue, bSuppress) {
		//unify the language-region to language_region
		if (!sValue || typeof sValue !== "string") {
			return this;
		}
		this._language = sValue.replaceAll('_', '-');
		if (this.getLanguage() != sValue) {
			//reload resource bundler if language changed
			this._loadDefaultTranslations();
		}
		this.setProperty("language", sValue, bSuppress);
		if (!Editor._oLanguages[this._language]) {
			this._language = this._language.split("-")[0];
		}
		if (!Editor._oLanguages[this._language]) {
			Log.warning("sap.ui.integration.editor.Editor: language: " + sValue + " is currently unknown, some UI controls might show " + sValue + " instead of the language name.");
		}
		return this;
	};

	/**
	 * Increases the zIndex to a higher value for all popups
	 */
	Editor.prototype.onAfterRendering = function () {
		if (this.getDomRef()) {
			this._iZIndex = getHigherZIndex(this.getDomRef());
			Popup.setInitialZIndex(this._iZIndex);
		}
	};

	/**
	 * Filter out the manifestChanges of Child editors in the oManifestSettings
	 *
	 * @param {*} oManifestSettings
	 */
	Editor.prototype._filterChildManifestChanges = function (oManifestSettings) {
		var that = this;
		if (that._bChildManifestChangesFiltered) {
			return;
		}
		that._aMainEditorChanges = deepClone(oManifestSettings.manifestChanges, 500);
		that._oChildEditorChanges = {};
		var processObject = function(obj, parentKey) {
			parentKey = parentKey ? (parentKey + "/") : "";
			Object.keys(obj).forEach(function(sKey) {
				if (sKey.startsWith(that.getConfigurationPath() + "/childCards/") && sKey.endsWith("_manifestChanges")) {
					var sRest = sKey.substring(35);
					var sChildEditorName = sRest.split("/")[0];
					if (sChildEditorName) {
						var sChildEditorPath = parentKey + sChildEditorName;
						that._oChildEditorChanges[sChildEditorPath] = that._oChildEditorChanges[sChildEditorPath] || [];
						that._oChildEditorChanges[sChildEditorPath].push(obj[sKey]);
						if (obj[sKey] !== null) {
							processObject(obj[sKey], sChildEditorPath);
						}
					}
				}
			});
		};

		// first process child changes
		//   - move all the /sap.card/configuration/childCards/.../_manifestChanges to oChildChanges
		that._aMainEditorChanges.forEach(function(oChange) {
			processObject(oChange);
		});

		// clean up child changes
		//  - remove all /sap.card/configuration/childCards/.../_manifestChanges
		Object.keys(that._oChildEditorChanges).forEach(function(sKey) {
			that._oChildEditorChanges[sKey].forEach(function(oChange) {
				Object.keys(oChange).forEach(function(sKey1) {
					if (sKey1.startsWith(that.getConfigurationPath() + "/childCards/") && sKey1.endsWith("_manifestChanges")) {
						delete oChange[sKey1];
					}
				});
			});
		});

		// clean up main changes
		//  - remove all /sap.card/configuration/childCards/.../_manifestChanges
		that._aMainEditorChanges.forEach(function(oChange) {
			Object.keys(oChange).forEach(function(sKey1) {
				if (sKey1.startsWith(that.getConfigurationPath() + "/childCards/") && sKey1.endsWith("_manifestChanges")) {
					delete oChange[sKey1];
				}
			});
		});

		that._bChildManifestChangesFiltered = true;
	};

	/**
	 * Filters the manifestChanges array in the oManifestSettings
	 * All changes that are done for layers > than current layer are removed (see also layers)
	 * The changes of current layer will be stored in this._oCurrentLayerChange to be applied later in the editor code.
	 * All changes that are done for layers < that the current layer are kept in oManifestSettings.manifestChanges
	 *
	 * @param {*} oManifestSettings
	 */
	Editor.prototype._filterManifestChangesByLayer = function (oManifestSettings) {
		var aChanges = [],
			that = this,
			oBeforeLayerChange = {},
			oCurrentLayerChange = { ":layer": Merger.layers[this.getMode()] },
			iCurrentModeIndex = Merger.layers[that.getMode()];
		oManifestSettings.manifestChanges.forEach(function (oChange) {
			//filter manifest changes. only the changes before the current layer are needed
			//editor will merge the last layer locally to allow "reset" or properties
			//also for translation layer, the "original" value is needed
			var iLayer = oChange.hasOwnProperty(":layer") ? oChange[":layer"] : 1000;
			if (iLayer === Merger.layers[Constants.EDITOR_MODE.TRANSLATION]) {
				var sLanguage = that._language;
				if (sLanguage === "") {
					sLanguage = Localization.getLanguage().replaceAll('_', '-');
				}
				var oTranslationChange = {
					"texts": {}
				};
				// delete the error texts property
				delete oChange.texts;
				oTranslationChange.texts[sLanguage] = {};
				Object.keys(oChange).forEach(function (s) {
					if (s.charAt(0) === "/") {
						oTranslationChange.texts[sLanguage][s] = oChange[s];
					} else {
						oTranslationChange[s] = oChange[s];
					}
				});
				oChange = oTranslationChange;
			}
			if (iLayer < iCurrentModeIndex) {
				aChanges.push(oChange);
				oBeforeLayerChange = merge(oBeforeLayerChange, oChange);
			} else if (iLayer === iCurrentModeIndex) {
				//store the current layer changes locally for later processing
				oCurrentLayerChange = oChange;
			}
		});
		oManifestSettings.manifestChanges = aChanges;
		this._oCurrentLayerChange = oCurrentLayerChange;
		this._oBeforeLayerChange = oBeforeLayerChange;
	};

	/**
	 * Create the tree of Child editors
	 *
	 * @param {*} oChildNodes
	 */
	Editor.prototype.createChildTree = function (oChildNodes) {
		var that = this;
		var sBaseUrl = this.getBaseUrl();

		var sMainManifest = that._vIdOrSettings.manifest;
		if (typeof that._vIdOrSettings.manifest === "object") {
			sMainManifest = JSON.stringify(that._vIdOrSettings.manifest);
		}
		var mainTitle = this._oManifest.get("/sap.app/title") || this._oResourceBundle.getText("EDITOR_CHILD_TREE_MAIN_NODE_TEXT");
		// Create data model with main node
		var oData = [{
			text: mainTitle,
			baseUrl: sBaseUrl,
			manifest: sMainManifest,
			path: "",
			selected: true,
			textReady: true,
			dataReady: false,
			nodes: []
		}];
		var oModel = new JSONModel(oData);

		// check if all texts are ready
		var checkTextsReady = function (oDataNode) {
			oDataNode = oDataNode || oData[0];
			if (!oDataNode.textReady) {
				return false;
			}
			var oNodes = oDataNode.nodes;
			for (var i = 0; i < oNodes.length; i++) {
				if (!checkTextsReady(oNodes[i])) {
					return false;
				}
			}
			return true;
		};

		var loadChildNode = function (sName, oChildConfig, sPath, sBaseUrl, sParentName) {
			// calculate base url and manifest path for childs
			var sManifestPath = sBaseUrl + oChildConfig.manifest;
			sBaseUrl = sManifestPath.substring(0, sManifestPath.lastIndexOf("/") + 1);
			var oNode = {
				text: sName,
				baseUrl: sBaseUrl,
				manifest: sManifestPath,
				isChild: true,
				path: sPath,
				selected: false,
				textReady: false,
				nodes: []
			};
			if (oChildConfig.manifest) {
				try {
					var sManifestUrl = that._sAppId.replace(/\./g, "/");
					if (sParentName) {
						sManifestUrl += "/" + sParentName;
					}
					sManifestUrl += "/" + oChildConfig.manifest;
					// load child manifest to get title and sub child nodes
					LoaderExtensions.loadResource(sManifestUrl, {
						dataType: "json",
						async: true,
						failOnError: false
					}).then(function (oManifest) {
						if (oManifest && oManifest["sap.card"]?.configuration?.childCards) {
							var oSubChildNodes = oManifest["sap.card"].configuration.childCards;
							for (var sSubName in oSubChildNodes) {
								var oSubNode = loadChildNode(sSubName, oSubChildNodes[sSubName], sPath ? (sPath + "/" + sSubName) : sSubName, sBaseUrl, sName);
								oNode.nodes.push(oSubNode);
							}
						}
						if (oManifest) {
							oNode.text = oChildConfig.title || oManifest["sap.app"].title || oNode.text;
						} else if (oChildConfig.title) {
							oNode.text = oChildConfig.title;
						}
						oNode.textReady = true;
						// check if all texts are ready. If true, set dataReady true and fire event
						if (checkTextsReady()) {
							oData[0].dataReady = true;
							oModel.checkUpdate(true);
							that.fireChildTreeDataReady();
						} else {
							oModel.checkUpdate(true);
						}
					});
				} catch (e) {
					if (oChildConfig.title) {
						oNode.text = oChildConfig.title;
					}
					oNode.textReady = true;
					// check if all texts are ready. If true, set dataReady true and fire event
					if (checkTextsReady()) {
						oData[0].dataReady = true;
						oModel.checkUpdate(true);
						that.fireChildTreeDataReady();
					} else {
						oModel.checkUpdate(true);
					}
					Log.error("sap.ui.integration.editor.Editor: child edtior tree manifest load error: " + e);
				}
			} else if (oChildConfig.title) {
				oNode.text = oChildConfig.title;
				oNode.textReady = true;
				// check if all texts are ready. If true, set dataReady true and fire event
				if (checkTextsReady()) {
					oData[0].dataReady = true;
					oModel.checkUpdate(true);
					that.fireChildTreeDataReady();
				} else {
					oModel.checkUpdate(true);
				}
			}
			return oNode;
		};

		for (var sChildNodeName in oChildNodes) {
			var oNode = loadChildNode(sChildNodeName, oChildNodes[sChildNodeName], sChildNodeName, sBaseUrl);
			oData[0].nodes.push(oNode);
		}
		that._oChildTree = new Tree({
			items: {
				path: "/",
				template: new StandardTreeItem({
					title: "{text}",
					tooltip: "{text}",
					type: "Active",
					highlight: "{= ${selected} ? 'Information' : 'None'}"
				})
			},
			toggleOpenState: that.onToggleOpenState,
			itemPress: that.onTreeItemPress.bind(that)
		}).addStyleClass("sapUiIntegrationEditorChildTreeItem");
		that._oChildTree.setModel(oModel);
	};

	Editor.prototype.onToggleOpenState = function(oEvent) {
		var oControl = oEvent.getSource();
		var bExpanded = oEvent.getParameter("expanded");
		if (bExpanded) {
			Log.info("sap.ui.integration.editor.Editor: child edtior tree item expanded: " + oEvent.getParameter("itemIndex"));
			oControl.expand([oEvent.getParameter("itemIndex")]);
		} else {
			Log.info("sap.ui.integration.editor.Editor: child edtior tree item collapsed: " + oEvent.getParameter("itemIndex"));
			oControl.collapse([oEvent.getParameter("itemIndex")]);
		}
	};

	/**
	 * process the pressed tree item event
	 * @param {sap.ui.base.Event} oEvent the event object
	 */
	Editor.prototype.onTreeItemPress = function(oEvent) {
		// get the pressed item
		var oItem = oEvent.getParameter("srcControl");
		if (!oItem || !oItem.getBindingContext() || !oItem.getBindingContext().getObject()) {
			Log.error("sap.ui.integration.editor.Editor: child editor tree item pressed without binding context or binding object");
			return;
		}

		// get the binding object and the manifest
		var oItemObject = oItem.getBindingContext().getObject();
		var oManifest = oItemObject.manifest;
		if (!oManifest) {
			Log.error("sap.ui.integration.editor.Editor: child editor tree item pressed without manifest");
			return;
		}
		// check if manifest is json
		try {
			oManifest = JSON.parse(oManifest);
		} catch (e) {
			//manifest is not json
			Log.info("sap.ui.integration.editor.Editor: child editor tree item pressed with manifest not json");
		}
		// check if same item pressed, if yes do nothing
		var path = oItemObject.path || "/";
		this._oChildTree._path = this._oChildTree._path || "/";
		if (this._oChildTree._path === path) {
			Log.info("sap.ui.integration.editor.Editor: same item pressed, do nothing");
			return;
		}

		// update current settings to manifest changes (main editor or Child editor)
		var oCurrentSettings = this.getCurrentSettings(true);
		this._oChildEditorChanges = this._oChildEditorChanges || {};
		this._aMainEditorChanges = this._aMainEditorChanges || [];
		var sLayer = oCurrentSettings[":layer"];
		var oMatchedChange, oMatchedChangeCloned;
		if (!this.isChild) {
			// find current layer change in main editor changes
			oMatchedChange = this._aMainEditorChanges.find(function(oChange) {
				return oChange[":layer"] === sLayer;
			});
			if (oMatchedChange) {
				oMatchedChangeCloned = merge({}, oMatchedChange, oCurrentSettings);
				var iIndex = this._aMainEditorChanges.indexOf(oMatchedChange);
				if (iIndex > -1) {
					this._aMainEditorChanges.splice(iIndex, 1);
				}
				oMatchedChange = oMatchedChangeCloned;
			} else {
				oMatchedChange = oCurrentSettings;
			}
			this._aMainEditorChanges.push(oMatchedChange);
		} else {
			this._oChildEditorChanges[this._oChildTree._path] = this._oChildEditorChanges[this._oChildTree._path] || [];
			var aChildChanges = this._oChildEditorChanges[this._oChildTree._path];
			// find current layer change in Child editor changes
			oMatchedChange = aChildChanges.find(function(oChange) {
				return oChange[":layer"] === sLayer;
			});
			if (oMatchedChange) {
				oMatchedChangeCloned = merge({}, oMatchedChange, oCurrentSettings);
				var iIndex = aChildChanges.indexOf(oMatchedChange);
				if (iIndex > -1) {
					aChildChanges.splice(iIndex, 1);
				}
				oMatchedChange = oMatchedChangeCloned;
			} else {
				oMatchedChange = oCurrentSettings;
			}
			aChildChanges.push(oMatchedChange);
		}

		// clean editor and reset flags
		this.cleanAndReset();

		// switch to the pressed editor
		this.switchToEditor(oManifest, oItemObject, path);

		// unHighlignt the previous selected item and highlight the current selected item
		var oTreeModel = this._oChildTree.getModel();
		var sCurrentItemIndex = this._oChildTree._itemIndex || "/0";
		oTreeModel.setProperty(sCurrentItemIndex + "/selected", false);
		oItemObject.selected = true;
		oTreeModel.checkUpdate(true);

		// update the item index and path
		this._oChildTree._itemIndex = oItem.getBindingContext().getPath();
		this._oChildTree._path = path;
		Log.info("sap.ui.integration.editor.Editor: child editor tree item pressed");
	};

	/**
	 * Switch to another editor based on the manifest and item object
	 *
	 * @param {*} oManifest the manifest of the editor to switch to
	 * @param {*} oItemObject the binding object of the pressed tree item
	 * @param {string} sPath the path of the pressed tree item
	 */
	Editor.prototype.switchToEditor = function(oManifest, oItemObject, sPath) {
		// save the current settings, to avoid creating new instance when switching between child editors
		this._oChildTreeSettings = this._oChildTreeSettings || {};
		if (!this._oChildTreeSettings[this._oChildTree._path]) {
			this._oChildTreeSettings[this._oChildTree._path] = deepClone(this._vIdOrSettings, 500);
		}

		// keep current manifest as main manifest if it is not a child
		var bDestoryCurrentManifest = !!this.isChild;
		if (!bDestoryCurrentManifest) {
			this._mainManifest = this._oManifest;
		}
		// get settings for the pressed item
		this.isChild = oItemObject.isChild;
		var oManifestChanges;
		if (!this.isChild) {
			oManifestChanges = this._aMainEditorChanges;
		} else {
			oManifestChanges = this._oChildEditorChanges[sPath] || [];
		}
		if (this._oChildTreeSettings[sPath]) {
			this._vIdOrSettings = this._oChildTreeSettings[sPath];
		} else {
			this._vIdOrSettings.baseUrl = oItemObject.baseUrl;
			this._vIdOrSettings.manifest = oManifest;
		}
		this._vIdOrSettings.manifestChanges = oManifestChanges;
		this._vIdOrSettings.destoryManifest = bDestoryCurrentManifest;

		// switch to the pressed editor
		this.setJson(this._vIdOrSettings, true); //suppress rerendering as the editor will be rerendered anyway
	};

	/**
	 * Initializes the editor after the json is set
	 */
	Editor.prototype._initInternal = function () {
		var that = this;
		//handle keyword designtime removal
		var sConfigurationPath = that.getConfigurationPath();
		var sDesigntime = that._oManifest.get(sConfigurationPath + "/editor");
		if (!sDesigntime) {
			sDesigntime = that._oManifest.get("/" + that.getSection() + "/designtime");
		}
		if (!that._oChildTree) {
			// create Child editors tree if Child editors are defined and tree not created yet
			var oChildEditors = that._oManifest.get(sConfigurationPath + "/childCards");
			if (oChildEditors && typeof oChildEditors === "object") {
				that.createChildTree(oChildEditors);
			}
		}
		//load the designtime control and bundles lazy
		var	oConfiguration = that._oManifestModel.getProperty(sConfigurationPath),
			oPromise,
			oDesigntimeConfig = that.getDesigntime();
		if (oDesigntimeConfig) {
			if (typeof oDesigntimeConfig === "function") {
				oPromise = new Promise(function (resolve, reject) {
					var oDesigntimeInstance = new oDesigntimeConfig();
					that._applyDesigntimeDefaults(oDesigntimeInstance.getSettings());
					resolve(oDesigntimeInstance);
				});
			} else if (typeof oDesigntimeConfig === "object") {
				oPromise = new Promise(function (resolve, reject) {
					sap.ui.require(["sap/ui/integration/Designtime"], function (Designtime) {
						var AdvancedDesigntime = Designtime.extend("test.Designtime");
						AdvancedDesigntime.prototype.create = function () {
							return oDesigntimeConfig;
						};
						var oDesigntime = new AdvancedDesigntime();
						that._applyDesigntimeDefaults(oDesigntime.getSettings());
						resolve(oDesigntime);
					});
				});
			}
		} else if (sDesigntime) {
			//load designtime from module
			oPromise = that.loadDesigntime().then(function (oDesigntime) {
				that._applyDesigntimeDefaults(oDesigntime.getSettings());
				return oDesigntime;
			});
		} else {
			//stay compatible and create designtime configuration based on parameters/destinations
			oPromise = Promise.resolve(that._createParameterDesigntime(oConfiguration));
		}
		oPromise.then(function (oDesigntime) {
			that._oDesigntimeInstance = oDesigntime;
			that.initDestinations();
			that.initDataProviderFactory();
			if (!that.isChild && (that.getMode() === Constants.EDITOR_MODE.ADMIN || that.getMode() === Constants.EDITOR_MODE.ALL)) {
				//always add destination settings for admin and all modes if not child editor
				that._addDestinationSettings(oConfiguration);
			} else {
				//delete destination settings in dt for other modes
				that._deleleDestinationSettings();
			}
			//create a settings model
			that._oSettingsModel = new JSONModel(that._oDesigntimeInstance.getSettings());
			that.setModel(that._oSettingsModel, "currentSettings");
			that.setModel(that._oSettingsModel, "items");
			return that._loadValueContextInDesigntime();
		}).then(function () {
			that._applyDesigntimeLayers(); //changes done from admin to content on the dt values
			return that._requestExtensionData();
		}).then(function () {
			EditorFieldManager.requireFields().then(function () {
				// TODO: Editor.Fields is never read anywhere — remove this line
				Editor.Fields = EditorFieldManager.Fields;
				EditorFieldManager.startEditor(that, that._getLanguages());
			});
		});
	};

	Editor.prototype.loadDesigntime = function () {
		if (this._oDesigntime) {
			return Promise.resolve(this._oDesigntime);
		}

		if (!this._oManifest) {
			return new Promise(function (resolve, reject) {
				this.attachManifestReady(function () {
					this.loadDesigntime().then(resolve, reject);
				}.bind(this));
			}.bind(this));
		}

		if (!this._sAppId) {
			return Promise.reject("App id not maintained");
		}

		return new Promise(function (resolve, reject) {
			//build the module path to load as part of the widgets module path
			//handle keyword designtime removal
			var sDesigntimePath = this._oManifest.get(this.getConfigurationPath() + "/editor");
			if (!sDesigntimePath) {
				sDesigntimePath = this._oManifest.get("/" + this.getSection() + "/designtime");
			}
			var	sFullDesigntimePath = this._sAppId.replace(/\./g, "/") + "/" + sDesigntimePath;
			if (sFullDesigntimePath) {
				sap.ui.require([sFullDesigntimePath], function (oDesigntime) {
					//successfully loaded
					oDesigntime = new oDesigntime();
					oDesigntime._readyPromise(this._oLimitedInterface, this).then(function () {
						this._oDesigntime = oDesigntime;
						resolve(oDesigntime);
					}.bind(this));
				}.bind(this), function () {
					//error
					reject({
						error: sFullDesigntimePath + " not found"
					});
				});
			} else {
				reject();
			}
		}.bind(this));
	};

	Editor.prototype.getConfigurationPath = function() {
		return "/" + this.getSection() + "/configuration";
	};

	/**
	 * Returns the current settings as a json with a manifest path and the current value
	 * additionally there is a layer number added as ":layer"
	 *
	 * @param {boolean} bOnlyCurrentEditor If true, only the settings of the current editor are returned (without child editors)
	 * @returns {object} The current settings in manifest format
	 */
	Editor.prototype.getCurrentSettings = function (bOnlyCurrentEditor) {
		bOnlyCurrentEditor = bOnlyCurrentEditor || false;
		var oSettings = this._oSettingsModel.getProperty("/"),
			mResult = {},
			mNext;
		if (oSettings && oSettings.form && oSettings.form.items) {
			for (var n in oSettings.form.items) {
				var oItem = oSettings.form.items[n];
				if (oItem.editable && oItem.visible) {
					if (this.getMode() !== Constants.EDITOR_MODE.TRANSLATION) {
						if (oItem.translatable && !oItem._changed && oItem._translatedPlaceholder && !this._oCurrentLayerChange[oItem.manifestpath]) {
							//do not save a value that was not changed and comes from a translated default value
							//mResult[oItem.manifestpath] = oItem._translatedPlaceholder;
							//but we need to save the setting changes for the next layer, so remove the continue sentence.
							//continue;
						} else {
							if (oItem.valueItems && !deepEqual(this._oBeforeLayerChange[oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueItems"], oItem.valueItems)) {
								mResult[oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueItems"] = oItem.valueItems;
							}
							if (oItem.valueTokens && !deepEqual(this._oBeforeLayerChange[oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTokens"], oItem.valueTokens)) {
								mResult[oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTokens"] = oItem.valueTokens;
							}
							var beforeLayerChange = this._oBeforeLayerChange[oItem.manifestpath];
							if (typeof oItem.value !== "undefined" && !deepEqual(beforeLayerChange, oItem.value)) {
								switch (oItem.type) {
									case "string":
										if (!oItem.translatable) {
											mResult[oItem.manifestpath] = oItem.value;
										} else if (oItem._hasDynamicValue) {
											// if value is dynamic value of a translatable parameter, save it and delete all the current translations
											mResult[oItem.manifestpath] = oItem.value;
											this.deleteAllTranslationValuesInTexts(oItem.manifestpath);
										} else if (oItem._beforeLayerValue && (oItem._beforeLayerValue.indexOf("{context>") === 0 || oItem._beforeLayerValue.indexOf("{{parameters") === 0)) {
											// if before layer value is dynamic value or a translatable parameter, save it
											mResult[oItem.manifestpath] = oItem.value;
										}
										break;
									case "group":
										break;
									case "date":
									case "datetime":
										if (beforeLayerChange) {
											if (oItem.value) {
												var beforeDate = new Date(beforeLayerChange);
												var date = new Date(oItem.value);
												if (beforeDate.getTime() !== date.getTime()) {
													mResult[oItem.manifestpath] = oItem.value;
												}
											}
										} else if (oItem.value) {
											mResult[oItem.manifestpath] = oItem.value;
										}
										break;
									case "object":
										if (oItem.value && oItem.value !== "" && typeof oItem.value === "object") {
											mResult[oItem.manifestpath] = oItem.value;
										}
										break;
									case "object[]":
										if (Array.isArray(oItem.value)) {
											var aValue = deepClone(oItem.value, 500);
											// sort the value list according by the position value
											aValue = aValue.sort(function (a, b) {
												// if _position property not exists, do nothing
												if (!a._dt || !a._dt._position || !b._dt || !b._dt._position) {
													return 0;
												}
												return a._dt._position - b._dt._position;
											});
											// recount the position value
											for (var i = 0; i < aValue.length; i++) {
												var oValue = aValue[i];
												oValue._dt = oValue._dt || {};
												oValue._dt._position = i + 1;
											}
											mResult[oItem.manifestpath] = aValue;
										}
										break;
									default:
										if (oItem.manifestpath) {
											mResult[oItem.manifestpath] = oItem.value;
										}
								}
							}
						}
					} else if (oItem.translatable && oItem.value) {
						if (oItem._changed) {
							//in translation mode create an entry if value changes
							mResult[oItem.manifestpath] = oItem.value;
						} else if (this._oCurrentLayerChange && this._oCurrentLayerChange.texts && this._oCurrentLayerChange.texts[this._language] && this._oCurrentLayerChange.texts[this._language][oItem.manifestpath]) {
							//if translation layer has changed value before, save it again
							mResult[oItem.manifestpath] = this._oCurrentLayerChange.texts[this._language][oItem.manifestpath];
						}
					}
					if (oItem._next && (this.getAllowSettings())) {
						if (oItem.type === "destination") {
							if (oItem._next.pageAdminNewDestinationParameter) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/pageAdminNewDestinationParameter"] = oItem._next.pageAdminNewDestinationParameter;
							}
						} else {
							var bVisibleDefault = typeof (oItem.visibleToUser) === "undefined" ? true : oItem.visibleToUser;
							var bEditableDefault = typeof (oItem.editableToUser) === "undefined" ? true : oItem.editableToUser;
							var bAllowDynamicValuesDefault = typeof (oItem.allowDynamicValues) === "undefined" ? true : oItem.allowDynamicValues;
							if (oItem._next.visible === !bVisibleDefault) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/visible"] = oItem._next.visible;
							}
							if (oItem._next.editable === !bEditableDefault) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/editable"] = oItem._next.editable;
							}
							if (oItem._next.allowDynamicValues === !bAllowDynamicValuesDefault) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/allowDynamicValues"] = oItem._next.allowDynamicValues;
							}
							if (oItem._next.pageAdminValues) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/pageAdminValues"] = oItem._next.pageAdminValues;
							}
						}
					}
				}
			}
		}
		if (this.getMode() === Constants.EDITOR_MODE.TRANSLATION) {
			// translation mode don't have texts property
			delete mResult.texts;
		} else if (oSettings.texts) {
			mResult.texts = deepClone(oSettings.texts, 500) || {};
			// get the before layer translation texts
			var beforeLayerTexts = merge({}, this._oBeforeLayerChange.texts);
			if (deepEqual(beforeLayerTexts, mResult.texts)) {
				// if no change, DO NOT return the transtalion texts
				delete mResult.texts;
			} else {
				// Clean the translations of object or object list field :
				// - remove the translations if the object is not exist in value
				for (var language in mResult.texts){
					if (deepEqual(beforeLayerTexts[language], mResult.texts[language])) {
						// if no change, DO NOT return the transtalion texts of current language
						delete mResult.texts[language];
					} else {
						for (var key in mResult.texts[language]) {
							if (beforeLayerTexts[language] && deepEqual(beforeLayerTexts[language][key], mResult.texts[language][key])) {
								// if no change, DO NOT return the transtalion texts of the manifest path of current language
								delete mResult.texts[language][key];
							} else if (typeof mResult.texts[language][key] === "object") {
								var vValue = mResult[key];
								if (!vValue || typeof vValue !== "object" || deepEqual(vValue, {}) || deepEqual(vValue, [])) {
									delete mResult.texts[language][key];
								} else if (Array.isArray(vValue)) {
									// get all the uuids in value list of object list field
									var aUUIDs = vValue.map(function (oObject) {
										return oObject._dt ? oObject._dt._uuid || "" : "";
									});
									// delete translation texts if uuid not included in value list
									for (var uuid in mResult.texts[language][key]) {
										if (!aUUIDs.includes(uuid)) {
											delete mResult.texts[language][key][uuid];
										}
									}
								} else {
									// get the uuid in the object value of object field
									var sUUID = vValue._dt ? vValue._dt._uuid || "" : "";
									if (sUUID !== "") {
										// only save the translation texts of current uuid
										var oTranslation = mResult.texts[language][key][sUUID];
										if (!oTranslation) {
											delete mResult.texts[language][key];
										} else {
											mResult.texts[language][key] = {};
											mResult.texts[language][key][sUUID] = oTranslation;
										}
									} else {
										delete mResult.texts[language][key];
									}
								}
							}
						}
						if (deepEqual(mResult.texts[language], {})) {
							delete mResult.texts[language];
						}
					}
				}
				if (deepEqual(mResult.texts, {})) {
					delete mResult.texts;
				}
			}
		}
		var iLayer = Merger.layers[this.getMode()];
		mResult[":layer"] = iLayer;
		mResult[":errors"] = this.checkCurrentSettings()[":errors"];
		if (mNext) {
			mResult[":designtime"] = mNext;
		}
		if (oSettings[":designtime"]) {
			mResult[":designtime"] = merge(mResult[":designtime"], oSettings[":designtime"]);
		}

		// handle child editor settings
		if (this._oChildTree) {
			this._childSettings = this._childSettings || [];
			this._mainSettings = this._mainSettings || {};
			if (this.isChild) {
				this._childSettings[this._oChildTree._path] = mResult;
			} else {
				this._mainSettings = mResult;
			}
			// return whole settings including child editors
			if (!bOnlyCurrentEditor){
				// merge main settings and child settings into one object
				var mAllSettings = deepClone(this._mainSettings, 500);
				Object.keys(this._childSettings).forEach(function (childKey) {
					var oChildSetting = this._childSettings[childKey];
					var paths = childKey.split("/");
					var oParent = mAllSettings;
					paths.forEach(function (sPath, iIndex) {
						if (sPath && oChildSetting) {
							var fullPath = this.getConfigurationPath() + "/childCards/" + sPath + "/_manifestChanges";
							if (iIndex === paths.length - 1) {
								oParent[fullPath] = oChildSetting;
							} else {
								oParent[fullPath] = oParent[fullPath] || {
									":layer": iLayer,
									":errors": false
								};
								oParent = oParent[fullPath];
							}
						}
					}.bind(this));
				}.bind(this));
				return mAllSettings;
			}
		}
		return mResult;
	};
	/**
	 * Checks for invalid values in the current settings and reports the errors
	 * TODO: highlight issues and add states...
	 */
	Editor.prototype.checkCurrentSettings = function () {
		var oSettings = this._oSettingsModel.getProperty("/"),
			mChecks = {};
		if (oSettings && oSettings.form && oSettings.form.items) {
			for (var n in oSettings.form.items) {
				var oItem = oSettings.form.items[n];
				if (oItem.editable) {
					if (oItem.validateCheck === "failed") {
						mChecks[oItem.manifestpath] = false;
					} else if ((oItem.isValid || oItem.required) && !(this.getMode() === Constants.EDITOR_MODE.TRANSLATION && oItem.translatable)) {
						if (oItem.isValid) {
							mChecks[oItem.manifestpath] = oItem.isValid(oItem);
						}
						mChecks[oItem.manifestpath] = true;
						var value = oItem.value;
						var sType = oItem.type;
						if (sType === "string" && value === "") {
							mChecks[oItem.manifestpath] = value;
							//inform user of this error
						}
						if ((sType === "date" || sType === "datetime") && isNaN(Date.parse(value))) {
							mChecks[oItem.manifestpath] = value;
							//inform user of this error
						}
						if (sType === "integer") {
							if (isNaN(parseInt(value))) {
								mChecks[oItem.manifestpath] = value;
								//inform user of this error
							} else if (value < oItem.min || value > oItem.max) {
								mChecks[oItem.manifestpath] = value;
								//inform user of this error
							}
						} if (sType === "number") {
							if (isNaN(parseFloat(value))) {
								mChecks[oItem.manifestpath] = value;
							} else if (value < oItem.min || value > oItem.max) {
								mChecks[oItem.manifestpath] = value;
							}
						}
					}
				}
			}
			mChecks[":layer"] = Merger.layers[this.getMode()];
		}
		mChecks[":errors"] = Object.values(mChecks).indexOf(false) > -1;
		return mChecks;
	};

	/**
	 * Creates a model for the context object of the host environment
	 */
	Editor.prototype._createContextModel = function () {
		var oHost = this.getHostInstance(),
			oContextModel = new JSONModel({}),
			oFlatContextModel = new JSONModel([]);

			//add the models in any case
		this.setModel(oContextModel, "context");
		this.setModel(oFlatContextModel, "contextflat");
		oContextModel._aPendingPromises = [];
		oFlatContextModel._getPathObject = function (sPath) {
			var a = this.getData().filter(function (o) {
				if (o.path === sPath) {
					return true;
				}
			});
			return a.length ? a[0] : null;
		};
		oFlatContextModel._getValueObject = function (sValue) {
			var a = this.getData() || [];
			a = a.filter(function (o) {
				if (o.value === sValue || o.object.value === sValue) {
					return true;
				}
			});
			return a.length ? a[0] : null;
		};
		var oContextDataPromise = new Promise(function (resolve, reject) {
			if (oHost && oHost.getContext) {
				var bResolved = false;
				setTimeout(function () {
					if (bResolved) {
						return;
					}
					Log.error("sap.ui.integration.editor.Editor: context could not be determined with " + CONTEXT_TIMEOUT + ".");
					bResolved = true;
					resolve({});
				}, CONTEXT_TIMEOUT);
				oHost.getContext().then(function (oContextData) {
					if (bResolved) {
						Log.error("sap.ui.integration.editor.Editor: context returned after more than " + CONTEXT_TIMEOUT + ". Context is ignored.");
					}
					bResolved = true;
					resolve(oContextData || {});
				});
			} else {
				resolve({});
			}
		});

		//get the context from the host
		oContextDataPromise.then(function (oContextData) {
			var oData = this._mergeContextData(oContextData);
			oContextModel.setData(oData);
			oFlatContextModel.setData(this.flattenData(oData, "label"));
		}.bind(this));

		//async update of the value via host call
		oContextModel.getProperty = function (sPath, oContext) {
			if (sPath && !sPath.startsWith("/") && !oContext) {
				sPath = "/" + sPath;
			}
			var sAbsolutePath = this.resolve(sPath, oContext),
				pGetProperty;
			if (sAbsolutePath.endsWith("/value")) {
				this._mValues = this._mValues || {};
				if (this._mValues.hasOwnProperty(sAbsolutePath)) {
					return this._mValues[sAbsolutePath];
					//when should this be invalidated?
				}
				this._mValues[sAbsolutePath] = undefined;
				// ask the host and timeout if it does not respond
				pGetProperty = Utils.timeoutPromise(oHost.getContextValue(sAbsolutePath.substring(1)));
				pGetProperty = pGetProperty.then(function (vValue) {
						this._mValues[sAbsolutePath] = vValue;
						this.checkUpdate();
					}.bind(this))
					.catch(function (sReason) {
						this._mValues[sAbsolutePath] = null;
						this.checkUpdate();
						Log.error("sap.ui.integration.editor.Editor: path " + sAbsolutePath + " could not be resolved. Reason: " + sReason);
					}.bind(this));

				this._aPendingPromises.push(pGetProperty);
				return undefined;
			} else {
				//resolve dt data locally
				return JSONModel.prototype.getProperty.apply(this, arguments);
			}
		};
	};

	Editor.prototype._mergeContextData = function (oContextData) {
		var oData = {};
		//empty entry
		oData["empty"] = CONTEXT_ENTRIES.empty;
		//custom entries
		for (var n in oContextData) {
			oData[n] = oContextData[n];
		}
		//editor internal
		oData["editor.internal"] = CONTEXT_ENTRIES["editor.internal"];
		return oData;
	};

	Editor.prototype._loadValueContextInDesigntime = function () {
		var oContextModel = this.getModel("context");
		var oSettings = this._oDesigntimeInstance.getSettings();
		var sItemsString;
		if (oSettings && oSettings.form && oSettings.form.items) {
			sItemsString = JSON.stringify(oSettings.form.items);
		}
		if (sItemsString) {
			var contextParamRegExp = /\{context\>[\/?\w+.]+\}/g;
			var aResult = sItemsString.match(contextParamRegExp);
			var aContextEntries;
			if (aResult && aResult.length > 0) {
				// only value context need to load
				aResult = aResult.filter(function (sResult) {
					return sResult.endsWith("value}");
				});
				aContextEntries = aResult.map(function (sResult) {
					return sResult.substring(9, sResult.length - 1);
				});
				aContextEntries.forEach(function (sContextEntry) {
					oContextModel.getProperty(sContextEntry);
				});
				return Promise.all(oContextModel._aPendingPromises).then(function () {
					oContextModel._aPendingPromises = [];
				});
			}
		}
		return Promise.resolve();
	};

	/**
	 * Returns (or lazily creates) the description popover for the editor
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @returns {sap.m.ResponsivePopover}
	 */
	Editor.prototype._getPopover = function () {
		if (!this._oPopover) {
			this._oPopover = EditorFieldManager.getPopover(this);
		}
		return this._oPopover;
	};

	/**
	 * updates the additional content
	 * TODO: Track changes and call update of the additional content
	 */
	Editor.prototype._updatePreview = function () {
		var oPreview = this.getAggregation("_preview") || this._oPreview;
		if (oPreview && oPreview.update) {
			oPreview.update();
		}
	};

	/**
	 * request data via data provider in RT
	 * @param {object} oConfig
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 * @returns {Promise} the getData promise of dataProvider
	 */
	Editor.prototype._requestData = function (oConfig, oField) {
		var oDataProvider = this._oDataProviderFactory.create(oConfig.values.data);
		oDataProvider.bindObject({
			path: "items>/form/items"
		});
		oDataProvider.bindObject({
			path: "currentSettings>" + oConfig._settingspath
		});
		oDataProvider.bindObject({
			path: "context>/"
		});
		return oDataProvider._waitDependencies().then(function () {
			return oDataProvider.getData();
		}).then(function (oData) {
			if (oConfig._cancel) {
				oConfig._values = [];
				this._oSettingsModel.setProperty(oConfig._settingspath + "/_loading", false);
				return;
			}
			// filter data for page admin
			var oPath = oConfig.values.data.path,
			    aPath,
			    tResult = [];
			if (oPath && oPath !== "/") {
				if (oPath.startsWith("/")) {
					oPath = oPath.substring(1);
				}
				if (oPath.endsWith("/")) {
					oPath = oPath.substring(0, oPath.length - 1);
				}
				aPath = oPath.split("/");
				tResult = ObjectPath.get(aPath, oData);
			} else {
				tResult = oData;
			}
			if (oConfig.type === "object" || oConfig.type === "object[]") {
				tResult.forEach(function (oResult) {
					oResult._dt = {
						_editable: false
					};
				});
			}
			if (this.getMode() === Constants.EDITOR_MODE.CONTENT && oConfig.pageAdminValues && oConfig.pageAdminValues.length > 0) {
				var paValues = oConfig.pageAdminValues,
				    selValues = oConfig.value,
					selValueItems = oConfig.valueItems || [],
				    results = [],
					selResults = [],
					selItemsResults = [];
				EditorFieldManager.prepareFieldsInKey(this, oConfig);
				if (paValues.length > 0) {
					for (var i = 0; i < paValues.length; i++) {
						for (var j = 0; j < tResult.length; j++) {
							var keyValue = EditorFieldManager.getKeyFromItem(this, tResult[j]);
							if (paValues[i] === keyValue) {
								results.push(tResult[j]);
							}
						}
						if (Array.isArray(selValues)) {
							for (var k = 0; k < selValues.length; k++) {
								if (paValues[i] === selValues[k]) {
									selResults.push(selValues[k]);
								}
							}
							for (var l = 0; l < selValueItems.length; l++) {
								var kValue = EditorFieldManager.getKeyFromItem(this, selValueItems[l]);
								if (paValues[i] === kValue) {
									selItemsResults.push(selValueItems[l]);
								}
							}
						}
					}
					if (selResults.length > 0) {
						oConfig.value = [];
						oConfig.value = selResults;
					}
					if (selItemsResults.length > 0) {
						oConfig.valueItems = [];
						oConfig.valueItems = selItemsResults;
					}
				}
				if (oConfig.values.data.path && oConfig.values.data.path !== "/") {
					delete oData[aPath];
					ObjectPath.set(aPath, results, oData);
				} else {
					oData = [];
					oData = results;
				}
			}
			//add group property "Selected" to each record for MultiComboBox in StringListField
			//user configration of the field since its value maybe changed
			var oFieldConfig = oField.getConfiguration();
			if (oConfig.type === "string[]") {
				var sPath = oConfig.values.data.path;
				if (sPath && sPath !== "/") {
					if (sPath.startsWith("/")) {
						sPath = sPath.substring(1);
					}
					if (sPath.endsWith("/")) {
						sPath = sPath.substring(0, sPath.length - 1);
					}
					var aPath = sPath.split("/");
					var oResult = ObjectPath.get(aPath, oData);
					if (Array.isArray(oResult)) {
						for (var n in oResult) {
							var sKey = oField.getKeyFromItem(oResult[n]);
							if (Array.isArray(oFieldConfig.value) && oFieldConfig.value.length > 0 && oFieldConfig.value.includes(sKey)) {
								oResult[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_SELECTED");
							} else {
								oResult[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_UNSELECTED");
							}
						}
						ObjectPath.set(aPath, oResult, oData);
					}
				} else if (Array.isArray(oData)) {
					for (var n in oData) {
						var sKey = oField.getKeyFromItem(oData[n]);
						if (Array.isArray(oFieldConfig.value) && oFieldConfig.value.length > 0 && oFieldConfig.value.includes(sKey)) {
							oData[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_SELECTED");
						} else {
							oData[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_UNSELECTED");
						}
					}
				}
			}
			oConfig._values = oData;
			var oValueModel = oField.getModel();
			oValueModel.setData(oData);
			oValueModel.checkUpdate(true);
			oValueModel.firePropertyChange();
			if (oConfig.type === "object" || oConfig.type === "object[]") {
				oField.mergeValueWithRequestResult(tResult);
			}
			this._oSettingsModel.setProperty(oConfig._settingspath + "/_loading", false);
			oField._hideValueState(true, true);
		}.bind(this))
		.catch(function (oError) {
			var oErrorPromise = new Promise(function (resolve) {
				var sError = this._oResourceBundle.getText("EDITOR_BAD_REQUEST");
				if (Array.isArray(oError) && oError.length > 0) {
					sError = oError[0];
					var oResponse = oError[1];
					if (oResponse) {
						var oErrorInResponse;
						oResponse.text().then(function (sResponseText) {
							if (Utils.isJson(sResponseText)) {
								oErrorInResponse = JSON.parse(sResponseText).error;
							} else {
								sError = sResponseText;
							}

							if (oErrorInResponse) {
								sError = (oErrorInResponse.code || oErrorInResponse.errorCode || oResponse.status) + ": " + oErrorInResponse.message;
							}

							resolve(sError);
						});
						return;
					} else {
						resolve(sError);
						return;
					}
				} else if (typeof (oError) === "string") {
					sError = oError;
					resolve(sError);
					return;
				} else {
					resolve(sError);
					return;
				}
			}.bind(this));

			return oErrorPromise.then(function (sError) {
				var oValueModel = oField.getModel();
				oValueModel.firePropertyChange();
				if (oConfig.type === "object" || oConfig.type === "object[]") {
					oField.mergeValueWithRequestResult();
				}
				this._oSettingsModel.setProperty(oConfig._settingspath + "/_loading", false);
				oField._showValueState("error", sError, true);
			}.bind(this));

		}.bind(this));
	};

	Editor.prototype._requestExtensionData = function () {
		var oExtension = this.getAggregation("_extension");
		if (!oExtension) {
			Log.info("sap.ui.integration.editor.Editor: extension is not defined or created, do not load data of it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}
		var bHasExtensionData = false;
		var oExtensionConfig = {};
		var oExtensionProperty = this._oManifest.get(this.getConfigurationPath() + "/data/extension");
		var sPath;
		if (oExtensionProperty) {
			bHasExtensionData = true;
			sPath = this._oManifest.get(this.getConfigurationPath() + "/data/path");
			oExtensionConfig = {
				"extension": oExtensionProperty
			};
			if (sPath) {
				oExtensionConfig.path = sPath;
			}
		} else {
			oExtensionProperty = this._oManifest.get("/" + this.getSection() + "/data/extension");
			if (oExtensionProperty) {
				bHasExtensionData = true;
				sPath = this._oManifest.get("/" + this.getSection() + "/data/path");
				oExtensionConfig = {
					"extension": oExtensionProperty
				};
				if (sPath) {
					oExtensionConfig.path = sPath;
				}
			}
		}
		if (!bHasExtensionData) {
			Log.info("sap.ui.integration.editor.Editor: extension data is not defined in manifest, do not load data of it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}
		var oDataProvider = this._oDataProviderFactory.create(oExtensionConfig);
		return oDataProvider._waitDependencies().then(function () {
			return oDataProvider.getData();
		}).then(function (oData) {
			var oValueModel = oExtension.getModel();
			if (!oValueModel) {
				oValueModel = new JSONModel(oData || {});
				oExtension.setModel(oValueModel, undefined);
			} else {
				oValueModel.setData(oData);
			}
			oValueModel.checkUpdate(true);
		}).catch(function (oError) {
			var sError = this._oResourceBundle.getText("EDITOR_BAD_REQUEST");
			if (Array.isArray(oError) && oError.length > 0) {
				sError = oError[0];
				var oResponse = oError[1];
				if (oResponse) {
					var oErrorInResponse;
					oResponse.text().then(function (sResponseText) {
						if (Utils.isJson(sResponseText)) {
							oErrorInResponse = JSON.parse(sResponseText).error;
						} else {
							sError = sResponseText;
						}

						if (oErrorInResponse) {
							sError = (oErrorInResponse.code || oErrorInResponse.errorCode || oResponse.status) + ": " + oErrorInResponse.message;
						}

						Log.error("sap.ui.integration.editor.Editor: request extension data failed, " + sError);
					});
				}
			} else if (typeof (oError) === "string") {
				sError = oError;
				Log.error("sap.ui.integration.editor.Editor: request extension data failed, " + sError);
			}
		}.bind(this));
	};

	/**
	 * Creates a unnamed model if a values.data section exists in the configuration
	 * @param {object} oConfig
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 * @returns {promise} the return promise
	 */
	Editor.prototype._addValueListModel = function (oConfig, oField, nTimeout) {
		if (oConfig.values) {
			var oValueModel;
			if (oConfig.values.data) {
				//we use the binding context to connect the given path from oConfig.values.data.path
				//with that the result of the data request can be have also other structures.
				oField.bindObject({
					path: oConfig.values.data.path || "/"
				});
				if (this._oDataProviderFactory) {
					oValueModel = oField.getModel();
					if (!oValueModel) {
						oValueModel = new JSONModel({});
						oField.setModel(oValueModel, undefined);
					}
					this._oSettingsModel.setProperty(oConfig._settingspath + "/_loading", true);
					if (!nTimeout) {
						return this._requestData(oConfig, oField);
					} else {
						setTimeout(function() {
							return this._requestData(oConfig, oField);
						}.bind(this), nTimeout);
					}
				}
			} else if (this.getAggregation("_extension")) {
				oValueModel = this.getAggregation("_extension").getModel();
				//filter data for page admin
				if (oValueModel && this.getMode() === Constants.EDITOR_MODE.CONTENT && oConfig.pageAdminValues && oConfig.pageAdminValues.length > 0) {
					EditorFieldManager.prepareFieldsInKey(this, oConfig);
					var ePath = oConfig.values.path;
					if (ePath.length > 1) {
						ePath = ePath.substring(1);
					}
					var oValueData = ObjectPath.get([ePath], oValueModel.getData()),
					    paValues = oConfig.pageAdminValues,
						results = [];
					for (var m = 0; m < paValues.length; m++) {
						for (var j = 0; j < oValueData.length; j++) {
							var keyValue = EditorFieldManager.getKeyFromItem(this, oValueData[j]);
							if (paValues[m] === keyValue) {
								results.push(oValueData[j]);
							}
						}
					}
					delete oValueData[ePath];
					ObjectPath.set(ePath, results, oValueData);
					oValueModel.setData(oValueData);
				}
				//we use the binding context to connect the given path from oConfig.values.path
				//with that the result of the data request can be have also other structures.
				oField.bindObject({
					path: oConfig.values.path || "/"
				});
				//in the designtime the item bindings will not use a named model, therefore we add a unnamed model for the field
				//to carry the values.
				oField.setModel(oValueModel, undefined);
				return Promise.resolve(null);
			}
		}
	};

	/**
	 * Creates a meta model if a values.metadata section exists in the configuration
	 * @param {object} oConfig
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 */
	 Editor.prototype._addMetadataModel = function (oConfig, oField) {
		if (oConfig.values && oConfig.values.metadata) {
			var oRequestDefaultParameters = merge({}, oConfig.values.metadata.request);

			var oRequest = {
				url: oRequestDefaultParameters.serviceUrl
			};
			var pRequestChain = Promise.resolve(oRequest);
			if (this._oDestinations) {
				pRequestChain = this._oDestinations.process(oRequest);
			}
			pRequestChain.then(function(oData) {
				if (!oData.url.endsWith("/")) {
					oData.url = oData.url + "/";
				}
				oRequestDefaultParameters.serviceUrl = oData.url;
				var oMetaDataModel = new ODataModel(oRequestDefaultParameters);
				oMetaDataModel.oMetaModel.fetchData().then(function(oMetaData) {
					oField.setModel(new JSONModel(oMetaData), "meta");
				});
			});
		}
	};

	Editor.prototype.getTranslationValueInTexts = function (sLanguage, sManifestPath) {
		return EditorTranslation.getTranslationValueInTexts(this, sLanguage, sManifestPath);
	};

	Editor.prototype.deleteAllTranslationValuesInTexts = function (sManifestPath) {
		EditorTranslation.deleteAllTranslationValuesInTexts(this, sManifestPath);
	};

	Editor.prototype._createHint = function (sHint, sHintIdPrefix) {
		return EditorFieldManager.createHint(sHint, sHintIdPrefix);
	};

	/**
	 * Returns the current language specific text for a given key or "" if no translation for the key exists
	 */
	Editor.prototype._getCurrentLanguageSpecificText = function (sKey) {
		return EditorTranslation.getCurrentLanguageSpecificText(this, sKey);
	};

	Editor.prototype._loadSpecialTranslations = function () {
		return EditorTranslation.loadSpecialTranslations(this);
	};


	Editor.prototype.setHeight = function(sValue) {
		if (sValue) {
			this.setProperty("height", sValue);
			document.body.style.setProperty("--sapUiIntegrationEditorFormHeight", sValue);
			document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight", sValue);
		}
	};

	Editor.prototype.setWidth = function(sValue) {
		if (sValue) {
			this.setProperty("width", sValue);
			document.body.style.setProperty("--sapUiIntegrationEditorFormWidth", sValue);
		}
	};

	/**
	 * Destroy the editor and the internal instances that it created
	 */
	Editor.prototype.destroy = function () {
		this.cleanAndReset();
		if (this._oPopover) {
			this._oPopover.destroy();
		}
		var oMessageStrip = Element.getElementById(MessageStripId);
		if (oMessageStrip) {
			oMessageStrip.destroy();
		}
		this._oDestinationsModel = null;
		this._oEditorResourceBundles = null;
		document.body.style.removeProperty("--sapUiIntegrationEditorFormWidth");
		document.body.style.removeProperty("--sapUiIntegrationEditorFormHeight");
		Control.prototype.destroy.apply(this, arguments);
	};

	Editor.prototype.cleanAndReset = function () {
		if (this._oDesigntimeInstance) {
			this._oDesigntimeInstance.destroy();
		}
		this._oInitialManifestModel = null;
		this._oBeforeLayerManifestModel = null;
		this._oManifestModel = null;
		this._oSettingsModel = null;
		this._oDesigntime = null;
		this._aAppliedLayerChanges = [];
		this._oBeforeLayerChange = {};
		this._oCurrentLayerChange = {};

		this.resetProperty("designtime");
		this.destroyAggregation("_formContent");

		// destory preview
		this._destoryPreview();

		this._ready = false;
		this._fieldReady = false;
	};

	/**
	 * Initializes the preview content
	 */
	Editor.prototype._initPreview = function () {
	};

	/**
	 * Destory the preview content
	 */
	Editor.prototype._destoryPreview = function () {
		var oPreview = this.getAggregation("_preview");
		if (oPreview) {
			oPreview.destroy();
			this.setAggregation("_preview", null);
		}
	};

	/**
	 * Applies the defaults for the designtime settings
	 */
	Editor.prototype._applyDesigntimeDefaults = function (oSettings) {
		oSettings = oSettings || {};
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		var mItems = oSettings.form.items || oSettings.form.items;
		for (var n in mItems) {
			var oItem = mItems[n];
			// do not apply default values for destination
			if (oItem.type === "destination") {
				continue;
			}
			if (oItem.manifestpath) {
				oItem.value = this._oManifestModel.getProperty(oItem.manifestpath);
			}
			if (oItem.visible === undefined || oItem.visible === null) {
				oItem.visible = true;
			}
			if (oItem.editable === undefined || oItem.editable === null) {
				oItem.editable = true;
			}
			if (this.getMode() !== Constants.EDITOR_MODE.ADMIN) {
				if (oItem.visibleToUser !== undefined) {
					oItem.visible = oItem.visibleToUser;
				}
				if (oItem.editableToUser !== undefined) {
					oItem.editable = oItem.editableToUser;
				}
			}
			if (typeof oItem.translatable !== "boolean") {
				oItem.translatable = false;
			}
			if (!oItem.label) {
				oItem.label = n;
			}

			if (!oItem.type || oItem.type === "enum") {

				oItem.type = "string";
			}
			//only if the value is undefined from the this._oManifestModel.getProperty(oItem.manifestpath)
			//false, "", 0... are valid values and should not apply the default
			if (oItem.value === undefined || oItem.value === null) {
				switch (oItem.type) {
					case "boolean": oItem.value = false; break;
					case "integer":
					case "number": oItem.value = 0; break;
					case "string[]": oItem.value = []; break;
					case "object": oItem.value = undefined; break;
					case "object[]": oItem.value = undefined; break;
					default: oItem.value = "";
				}
			}
			if (oItem.type === "group") {
				if (oItem.visible === undefined || oItem.value === null) {
					oItem.visible = true;
				}
			}
			oItem._settingspath = "/form/items/" + n;
		}
	};
	/**
	 * Applies previous layer designtime settings that were changed
	 */
	Editor.prototype._applyDesigntimeLayers = function (oSettings) {
		var oTexts = {};
		var oDesigntime = {};
		//pull current values
		if (this._aAppliedLayerChanges && Array.isArray(this._aAppliedLayerChanges)) {
			for (var i = 0; i < this._aAppliedLayerChanges.length; i++) {
				var oChanges = this._aAppliedLayerChanges[i][":designtime"];
				if (oChanges) {
					var aKeys = Object.keys(oChanges);
					for (var j = 0; j < aKeys.length; j++) {
						var sPath = aKeys[j],
							vValue = oChanges[sPath];
						if (!sPath.endsWith("/pageAdminValues") && typeof vValue === "object") {
							// if vValue is a object type and not from pageAdminValues
							if (vValue.configuration && vValue.configuration.parameterFromDestination) {
								//if it is a parameter transformed from destination, add it into form/items as new parameter for this layer
								var oNewParameterConfig = vValue.configuration;
								delete oNewParameterConfig.parameterFromDestination;
								oNewParameterConfig.value = this._oManifestModel.getProperty(oNewParameterConfig.manifestpath);
								oNewParameterConfig._settingspath = "/form/items/" + vValue.parameter;
								this._oSettingsModel.setProperty(oNewParameterConfig._settingspath, oNewParameterConfig);
							} else {
								// else it should for the object field/object list field
								// add it into designtime of settings
								oDesigntime[aKeys[j]] = merge(oDesigntime[aKeys[j]], vValue);
								continue;
							}
						} else {
							this._oSettingsModel.setProperty(aKeys[j], vValue);
						}
					}
				}
				var oAppliedLayerManifestChangeTexts = this._aAppliedLayerChanges[i]["texts"];
				if (oAppliedLayerManifestChangeTexts) {
					oTexts = merge(oTexts, oAppliedLayerManifestChangeTexts);
				}
			}
		}
		if (this._oCurrentLayerChange) {
			var oChanges = this._oCurrentLayerChange[":designtime"];
			if (oChanges) {
				var aKeys = Object.keys(oChanges);
				for (var j = 0; j < aKeys.length; j++) {
					//apply the values to a "_next/editable", "_next/visible" entry to the settings.
					//the current layer needs to be able to change those values
					var sPath = aKeys[j],
						vValue = oChanges[sPath];
						sNext = sPath.substring(0, sPath.lastIndexOf("/") + 1) + "_next";
					if (!sPath.endsWith("/pageAdminValues") && typeof vValue === "object") {
						// if the value of design time is object type and not from pageAdminValues or a parameter transformed from destination, it should for the object field/object list field
						// add it into designtime of settings, else add it into _next property
						if (!vValue.configuration || !vValue.configuration.parameterFromDestination) {
							oDesigntime[sPath] = merge(oDesigntime[sPath], vValue);
							continue;
						}
					}
					if (!this._oSettingsModel.getProperty(sNext)) {
						//create a _next entry if it does not exist
						this._oSettingsModel.setProperty(sNext, {});
					}
					var sNext = sPath.substring(0, sPath.lastIndexOf("/") + 1) + "_next",
						sProp = sPath.substring(sPath.lastIndexOf("/") + 1);
					this._oSettingsModel.setProperty(sNext + "/" + sProp, vValue);
				}
			}
			var ocurrentLayerManifestChangeTexts = this._oCurrentLayerChange["texts"];
			if (ocurrentLayerManifestChangeTexts) {
				oTexts = merge(oTexts, ocurrentLayerManifestChangeTexts);
			}
		}
		if (!deepEqual(oTexts, {})) {
			this._oSettingsModel.setProperty("/texts", oTexts);
		}
		if (!deepEqual(oDesigntime, {})) {
			this._oSettingsModel.setProperty("/:designtime", oDesigntime);
		}
	};
	/**
	 * Creates a designtime instance based on an configuration section within the manifest.
	 * This is valid if there is no explicit sap.card/designtime module in the manifest itself.
	 */
	Editor.prototype._createParameterDesigntime = function (oConfiguration) {
		var oSettings = {},
			sBasePath = this.getConfigurationPath() + "/parameters",
			sMode = this.getMode();
		if (oConfiguration && oConfiguration.parameters) {
			oSettings.form = oSettings.form || {};
			oSettings.form.items = oSettings.form.items || {};
			var oItems = oSettings.form.items;
			Object.keys(oConfiguration.parameters).forEach(function (n) {
				oItems[n] = merge({
					manifestpath: sBasePath + "/" + n + "/value",
					editable: (sMode !== Constants.EDITOR_MODE.TRANSLATION),
					_settingspath: "/form/items/" + n
				}, oConfiguration.parameters[n]);
				var oItem = oItems[n];
				if (!oItem.type) {
					oItem.type = "string";
				}
				if (!oItem.hasOwnProperty("visible")) {
					oItem.visible = true;
				}
			});
		}
		return new Designtime(oSettings);
	};

	/**
	 * Adds additional settings for destinations section in admin mode and all modeß
	 * @param {object} oConfiguration
	 */
	Editor.prototype._addDestinationSettings = function (oConfiguration) {
		var oSettings = this._oDesigntimeInstance.getSettings(),
			sBasePath = this.getConfigurationPath() + "/destinations";
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		if (oSettings && oConfiguration && oConfiguration.destinations) {
			this._bDestinationGroupAtTop = false;
			var oItems = oSettings.form.items,
				oDestinations = {},
				oHost = this.getHostInstance();
			var oDestinationGroup = {
				label: this._oResourceBundle.getText("EDITOR_DESTINATIONS") || "Destinations",
				type: "group",
				expanded: true,
				visible: true,
				_settingspath: "/form/items/destination.group"
			};
			if (oItems["destination.group"]) {
				// if the 1st item is destination group, set this._bDestinationGroupAtTop to true. Then render destination group at top
				this._bDestinationGroupAtTop = Object.keys(oItems)[0] === "destination.group";
				oDestinationGroup = merge(oDestinationGroup, oItems["destination.group"]);
				delete oItems["destination.group"];
			}
			oDestinations["destination.group"] = oDestinationGroup;
			Object.keys(oConfiguration.destinations).forEach(function (n) {
				var oDestination = merge({
					manifestpath: sBasePath + "/" + n + "/name", //destination points to name not value
					visible: true,
					type: "destination",
					editable: true,
					allowDynamicValues: false,
					allowSettings: false,
					value: oConfiguration.destinations[n].name,
					defaultValue: oConfiguration.destinations[n].defaultUrl,
					_settingspath: "/form/items/" + [n + ".destination"],
					_values: [],
					_destinationName: n
				}, oConfiguration.destinations[n]);
				if (typeof oDestination.label === "undefined") {
					oDestination.label = n;
				}
				if (oItems[n + ".destination"]) {
					oDestination = merge(oDestination, oItems[n + ".destination"]);
					delete oItems[n + ".destination"];
				}
				oDestinations[n + ".destination"] = oDestination;
			});
			// reorder the items according by this._bDestinationGroupAtTop
			if (this._bDestinationGroupAtTop) {
				oSettings.form.items = merge(oDestinations, oItems);
			} else {
				oSettings.form.items = merge(oItems, oDestinations);
			}
			var getDestinationsDone = false;
			if (oHost) {
				this._oDestinationsModel.setProperty("/_loading", true);
				this._oDestinationsModel.checkUpdate(true);
				this.getHostInstance().getDestinations().then(function (a) {
					getDestinationsDone = true;
					this._oDestinationsModel.setProperty("/_values", a);
					this._oDestinationsModel.setProperty("/_loading", false);
					this._oDestinationsModel.setSizeLimit(a.length);
					this._oDestinationsModel.checkUpdate(true);
					setTimeout(function () {
						this.fireDestinationReady();
					}.bind(this), 100);
				}.bind(this)).catch(function () {
					//Fix DIGITALWORKPLACE-4359, retry once for the timeout issue
					return this.getHostInstance().getDestinations();
				}.bind(this)).then(function (b) {
					if (getDestinationsDone) {
						return;
					}
					this._oDestinationsModel.setProperty("/_values", b);
					this._oDestinationsModel.setProperty("/_loading", false);
					this._oDestinationsModel.setSizeLimit(b.length);
					this._oDestinationsModel.checkUpdate(true);
					setTimeout(function () {
						this.fireDestinationReady();
					}.bind(this), 100);
				}.bind(this)).catch(function (e) {
					this._oDestinationsModel.setProperty("/_loading", false);
					this._oDestinationsModel.checkUpdate(true);
					setTimeout(function () {
						this.fireDestinationReady();
					}.bind(this), 100);
					Log.error("sap.ui.integration.editor.Editor: can not get destinations list from '" + oHost.getId() + "'.");
				}.bind(this));
			}
		}
	};

	/**
	 * Delete destinations if mode is NOT admin or all
	 */
	Editor.prototype._deleleDestinationSettings = function () {
		var oSettings = this._oDesigntimeInstance.getSettings();
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		delete oSettings.form.items["destination.group"];
		for (var n in oSettings.form.items) {
			var oItem = oSettings.form.items[n];
			if (oItem.type === "destination") {
				delete oSettings.form.items[n];
			}
		}
	};

	/**
	 * Returns the initial value that was given by the developer for the given path
	 * @param {string} sPath
	 */
	Editor.prototype._getInitialValue = function (sPath) {
		return this._oInitialManifestModel.getProperty(sPath);
	};

	/**
	 * Returns the value including changes in the before layer manifest model for the given path
	 * @param {string} sPath
	 */
	Editor.prototype._getBeforeLayerValue = function (sPath) {
		return this._oBeforeLayerManifestModel.getProperty(sPath);
	};

	/**
	 * Returns whether the value is translatable via the handlbars translation syntax {{KEY}}
	 * For other than string values false is returned
	 * @param {any} vValue
	 */
	Editor.prototype._isValueWithHandlebarsTranslation = function (vValue) {
		if (typeof vValue === "string") {
			return !!vValue.match(REGEXP_TRANSLATABLE);
		}
		return false;
	};

	Editor.prototype._isValueWithParameterSyntax = function (vValue) {
		if (typeof vValue === "string") {
			return !!vValue.match(REGEXP_PARAMETERS);
		}
		return false;
	};



	Editor.oResourceBundle = Library.getResourceBundleFor("sap.ui.integration", Utils._language);

	//init context entries
	Editor.initContextEntries = function () {
		return {
			empty: {
				label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_VAL"),
				type: "string",
				description: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_DESC"),
				placeholder: "",
				value: ""
			},
			"editor.internal": {
				label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_INTERNAL_VAL"),
				todayIso: {
					type: "string",
					label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					description: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_DESC"),
					tags: [],
					placeholder: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					customize: ["format.dataTime"],
					value: "{{parameters.TODAY_ISO}}"
				},
				nowIso: {
					type: "string",
					label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					description: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_DESC"),
					tags: [],
					placeholder: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					customize: ["dateFormatters"],
					value: "{{parameters.NOW_ISO}}"
				},
				currentLanguage: {
					type: "string",
					label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					description: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					tags: ["technical"],
					customize: ["languageFormatters"],
					placeholder: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					value: "{{parameters.LOCALE}}"
				}
			}
		};
	};

	//create static context entries
	CONTEXT_ENTRIES = Editor.initContextEntries();

	//change static members if language changed
	Editor.prototype._applyLanguageChange = function () {
		CONTEXT_ENTRIES = Editor.initContextEntries();
	};

	//map of language strings in their actual language representation, initialized in Editor.init
	Editor._oLanguages = {};

	//theming from parameters to css valiables if css variables are not turned on
	//find out if css vars are turned on
	Editor._appendThemeVars = function () {
		//if (!window.getComputedStyle(document.documentElement).getPropertyValue('--sapBackgroundColor')) {
		var aVars = [
			"sapUiButtonHoverBackground",
			"sapUiBaseBG",
			"sapUiContentLabelColor",
			"sapUiTileSeparatorColor",
			"sapUiHighlight",
			"sapUiListSelectionBackgroundColor",
			"sapUiNegativeText",
			"sapUiCriticalText",
			"sapUiPositiveText",
			"sapUiChartScrollbarBorderColor"
		];
		var mParams = Parameters.get({
			name: aVars,
			callback: function (_params) {
			   // this will only be called if params weren’t available synchronously
			}
		});
		if (mParams) {
			for (var n in mParams) {
				document.body.style.setProperty("--" + n, mParams[n]);
			}
		}
		//}
	};

	//initializes global settings
	Editor.init = function () {
		this.init = function () { }; //replace self

		//add theming variables if css vars are not turned on
		Editor._appendThemeVars();

		var sCssURL = sap.ui.require.toUrl("sap.ui.integration.editor.css.Editor".replace(/\./g, "/") + ".css");
		includeStylesheet(sCssURL);
		Editor._oLanguages = LoaderExtensions.loadResource("sap/ui/integration/editor/languages.json", {
			dataType: "json",
			failOnError: false,
			async: false
		});
	};

	/**
	 * attach theme changes
	 */
	Editor.prototype.onThemeChanged = function () {
		Editor._appendThemeVars();
	};

	Editor.init();

	return Editor;
});
