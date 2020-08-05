/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/Manifest",
	"sap/base/util/deepClone",
	"sap/base/util/isPlainObject",
	"sap/base/Log",
	"./ParameterMap",
	"sap/ui/integration/util/CardMerger"
	], function (
	BaseObject,
	CoreManifest,
	deepClone,
	isPlainObject,
	Log,
	ParameterMap,
	CardMerger
) {
	"use strict";

	var MANIFEST_PARAMETERS = "/{SECTION}/configuration/parameters",
		MANIFEST_FILTERS = "/{SECTION}/configuration/filters",
		MANIFEST_CONFIGURATION = "/{SECTION}",
		APP_DATA_SOURCES = "/sap.app/dataSources",
		REGEXP_TRANSLATABLE = /\{\{(?!parameters.)(?!destinations.)([^\}\}]+)\}\}|\{i18n>([^\}]+)\}/g;

	/**
	 * Creates a new Manifest object.
	 *
	 * @class Provides a set of functions to create a card manifest and work with it.
	 *
	 * Example usages:
	 *
	 * var oManifest = new Manifest()
	 * oManifest.load({ manifestUrl: "./somepath/manifest.json" }).then(function () {
	 *   // Do something
	 * })
	 *
	 * or
	 *
	 * var oManifestJson = {
	 * 	"sap.app": { ... },
	 *  "sap.card": { ... },
	 *  ...
	 * };
	 * var oManifest = new Manifest(oManifestJson);
	 *
	 * NOTE: Using Manifest.prototype.load function will also load i18n files and process the manifest
	 * replacing all translated texts and placeholders.
	 * When passing a json object to the Manifest constructor the manifest will NOT be processed as
	 * it should be already processed beforehand.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @param {Object} oManifestJson A manifest JSON.
	 * @alias sap.ui.integration.util.Manifest
	 */
	var Manifest = BaseObject.extend("sap.ui.integration.util.Manifest", {
		constructor: function(sSection, oManifestJson, sBaseUrl, aChanges) {
			BaseObject.call(this);

			this._aChanges = aChanges;

			this.PARAMETERS = MANIFEST_PARAMETERS.replace("{SECTION}", sSection);
			this.FILTERS = MANIFEST_FILTERS.replace("{SECTION}", sSection);
			this.CONFIGURATION = MANIFEST_CONFIGURATION.replace("{SECTION}", sSection);

			if (oManifestJson) {
				var mOptions = {},
					oMergedManifest;
				mOptions.process = false;

				if (sBaseUrl) {
					mOptions.baseUrl = sBaseUrl;
					this._sBaseUrl = sBaseUrl;
				} else {
					Log.warning("If no base URL is provided when the manifest is an object static resources cannot be loaded.");
				}

				if (this._aChanges) {
					oMergedManifest = CardMerger.mergeCardDelta(oManifestJson, this._aChanges);
				} else {
					oMergedManifest = oManifestJson;
				}

				this._oManifest = new CoreManifest(oMergedManifest, mOptions);
				this.oJson = this._oManifest.getRawJson();
			}
		}
	});

	/**
	 * @returns {Object} A copy of the Manifest JSON.
	 */
	Manifest.prototype.getJson = function () {
		return this._unfreeze(this.oJson);
	};

	/**
	 * Returns a value from the Manifest based on the specified path.
	 *
	 * @param {string} sPath The path to return a value for.
	 * @returns {*} The value at the specified path.
	 */
	Manifest.prototype.get = function (sPath) {
		return this._unfreeze(getObject(this.oJson, sPath));
	};

	/**
	 * @returns {string} The URL of the manifest.
	 */
	Manifest.prototype.getUrl = function () {
		return this._oManifest.resolveUri("./", "manifest");
	};

	/**
	 * @returns {module:sap/base/i18n/ResourceBundle} The resource bundle.
	 */
	Manifest.prototype.getResourceBundle = function () {
		return this.oResourceBundle;
	};

	/**
	 * Use stringify/parse to clone and unfreeze object/array values.
	 *
	 * @param {*} vValue The value to unfreeze.
	 * @returns {*} The unfrozen value.
	 */
	Manifest.prototype._unfreeze = function (vValue) {
		if (typeof vValue === "object") {
			return JSON.parse(JSON.stringify(vValue));
		}
		return vValue;
	};

	/**
	 * Destroy Manifest resources.
	 */
	Manifest.prototype.destroy = function () {
		this.oJson = null;
		this.oResourceBundle = null;
		if (this._oManifest) {
			this._oManifest.destroy();
		}

		this._bIsDestroyed = true;
	};

	/**
	 * Returns if this manifest is destroyed.
	 *
	 * @returns {boolean} if this manifest is destroyed
	 */
	Manifest.prototype.isDestroyed = function () {
		return this._bIsDestroyed;
	};

	/**
	 * Load a manifest.json file and all of its resources and then process it.
	 *
	 * @param {Object} mSettings The settings to use for manifest loading.
	 * @returns {Promise} A promise resolved when the manifest is ready and processed.
	 */
	Manifest.prototype.load = function (mSettings) {

		if (!mSettings || !mSettings.manifestUrl) {
			// When the manifest JSON is already set and there is a base URL, try to load i18n files.
			if (this._sBaseUrl && this._oManifest) {
				return this.loadI18n().then(function () {
					this.processManifest();
				}.bind(this));
			} else {
				if (this._oManifest) {
					this.processManifest();
				}
				return new Promise(function (resolve) {
					resolve();
				});
			}
		}

		return CoreManifest.load({
			manifestUrl: mSettings.manifestUrl,
			async: true,
			processJson: function (oManifestJson) {

				if (this._aChanges) {
					return CardMerger.mergeCardDelta(oManifestJson, this._aChanges);
				}

				return oManifestJson;
			}.bind(this)
		}).then(function (oManifest) {
			this._oManifest = oManifest;
			this.oJson = this._oManifest.getRawJson();

			return this.loadI18n().then(function () {
				this.processManifest();
			}.bind(this));
		}.bind(this));
	};


	/**
	 * Loads the i18n resources.
	 *
	 * @private
	 * @returns {Promise} A promise resolved when the i18n resources are ready.
	 */
	Manifest.prototype.loadI18n = function () {

		// find i18n property paths in the manifest if i18n texts in
		// the manifest which should be processed
		var bHasTranslatable = false;

		CoreManifest.processObject(this._oManifest.getJson(), function(oObject, sKey, vValue) {
			if (!bHasTranslatable && vValue.match(REGEXP_TRANSLATABLE)) {
				bHasTranslatable = true;
			}
		});

		if (this.get("/sap.app/i18n")) {
			// if an i18n file is explicitly specified in the manifest
			bHasTranslatable = true;
		}

		if (!bHasTranslatable) {
			return Promise.resolve();
		}

		return this._oManifest._loadI18n(true).then(function (oBundle) {
			this.oResourceBundle = oBundle;
		}.bind(this));
	};

	/**
	 * Process the manifest json by traversing it and translating all translatable texts
	 * and replacing all placeholders.
	 *
	 * @private
	 * @param {Object} oParams Parameters that should be replaced in the manifest.
	 */
	Manifest.prototype.processManifest = function () {

		var iCurrentLevel = 0,
			iMaxLevel = 15,
			//Always need the unprocessed manifest
			oUnprocessedJson = jQuery.extend(true, {}, this._oManifest.getRawJson()),
			oDataSources = this.get(APP_DATA_SOURCES);

		process(oUnprocessedJson, this.oResourceBundle, iCurrentLevel, iMaxLevel, this._oCombinedParams, oDataSources, this._oCombinedFilters);
		deepFreeze(oUnprocessedJson);

		this.oJson = oUnprocessedJson;
	};

	/**
	 * Freezes the object and nested objects to avoid later manipulation.
	 * Copied from Manifest.js
	 *
	 * @private
	 * @param {Object} oObject the object to deep freeze
	 */
	function deepFreeze(oObject) {
		if (oObject && typeof oObject === 'object' && !Object.isFrozen(oObject)) {
			Object.freeze(oObject);
			for (var sKey in oObject) {
				if (oObject.hasOwnProperty(sKey)) {
					deepFreeze(oObject[sKey]);
				}
			}
		}
	}

	/**
	 * Checks if the value is a translatable string in the format of "{{text}}".
	 *
	 * @private
	 * @param {*} vValue The value to be checked.
	 * @returns {boolean} If the string is translatable.
	 */
	function isTranslatable (vValue) {
		return (typeof vValue === "string")
			&& vValue.indexOf("{{") === 0
			&& vValue.indexOf("}}") === vValue.length - 2;
	}

	/**
	 * Check if a value contains placeholders.
	 *
	 * @private
	 * @param {*} vValue The value to check.
	 * @returns {boolean} true if the value contains placeholders.
	 */
	function isProcessable (vValue) {
		return (typeof vValue === "string")
			&& (vValue.indexOf("{{parameters.") > -1 || vValue.indexOf("{{dataSources") > -1 || vValue.indexOf("{{filters.") > -1);
	}

	/**
	 * Replace all placeholders inside the string.
	 *
	 * @private
	 * @param {string} sPlaceholder The value to process.
	 * @param {Object} oParam The parameter from the configuration.
	 * @param {Object} oDataSources The dataSources from the configuration.
	 * @param {Object} oFilters The filters from the configuration.
	 * @returns {string} The string with replaced placeholders.
	 */
	Manifest._processPlaceholder = function (sPlaceholder, oParam, oDataSources, oFilters) {
		var sProcessed = ParameterMap.processPredefinedParameter(sPlaceholder),
			oValue,
			sPath;

		if (oParam) {
			for (var oProperty in oParam) {
				oValue = oParam[oProperty].value;
				sPath = "{{parameters." + oProperty;

				sProcessed = replacePlaceholders(sProcessed, oValue, sPath);
			}
		}

		if (oDataSources) {
			sProcessed = replacePlaceholders(sProcessed, oDataSources, "{{dataSources");
		}

		if (oFilters) {
			sProcessed = replacePlaceholders(sProcessed, oFilters, "{{filters");
		}

		return sProcessed;
	};

	/**
	 * Replaces all placeholders inside a string.
	 *
	 * @private
	 * @param {string} sPlaceholder The string with placeholders to process.
	 * @param {string|Object} vValue The current value. It will be processed recursively, if is object.
	 * @param {string} sPath The current path.
	 * @returns {string} The string with replaced placeholders.
	 */
	function replacePlaceholders(sPlaceholder, vValue, sPath) {
		if (isPlainObject(vValue)) {
			for (var sProperty in vValue) {
				sPlaceholder = replacePlaceholders(sPlaceholder, vValue[sProperty], sPath + "." + sProperty);
			}
		} else if (sPlaceholder.includes(sPath + "}}")) {
			sPlaceholder = sPlaceholder.replace(new RegExp(sPath + "}}", 'g'), vValue);
		}

		return sPlaceholder;
	}

	/**
	 * Process a manifest.
	 *
	 * @private
	 * @param {Object} oObject The Manifest to process.
	 * @param {Object} oResourceBundle The resource bundle to use for translation.
	 * @param {number} iCurrentLevel The current level of recursion.
	 * @param {number} iMaxLevel The maximum level of recursion.
	 * @param {Object} oParams The parameters to be replaced in the manifest.
	 * @param {Object} oDataSources The dataSources to be replaced in the manifest.
	 */
	function process (oObject, oResourceBundle, iCurrentLevel, iMaxLevel, oParams, oDataSources, oFilters) {
		if (iCurrentLevel === iMaxLevel) {
			return;
		}

		if (Array.isArray(oObject)) {
			oObject.forEach(function (vItem, iIndex, aArray) {
				if (typeof vItem === "object") {
					process(vItem, oResourceBundle, iCurrentLevel + 1, iMaxLevel, oParams, oDataSources, oFilters);
				} else if (isProcessable(vItem)) {
					aArray[iIndex] = Manifest._processPlaceholder(vItem, oParams, oDataSources, oFilters);
				} else if (isTranslatable(vItem) && oResourceBundle) {
					aArray[iIndex] = oResourceBundle.getText(vItem.substring(2, vItem.length - 2));
				}
			}, this);
		} else {
			for (var sProp in oObject) {
				if (typeof oObject[sProp] === "object") {
					process(oObject[sProp], oResourceBundle, iCurrentLevel + 1, iMaxLevel, oParams, oDataSources, oFilters);
				} else if (isProcessable(oObject[sProp])) {
					oObject[sProp] = Manifest._processPlaceholder(oObject[sProp], oParams, oDataSources, oFilters);
				} else if (isTranslatable(oObject[sProp]) && oResourceBundle) {
					oObject[sProp] = oResourceBundle.getText(oObject[sProp].substring(2, oObject[sProp].length - 2));
				}
			}
		}
	}

	/**
	 * Utility function to find a property inside an Object at a specified path.
	 * Copied from Manifest.js
	 *
	 * @private
	 * @param {Object} oObject The Object to search
	 * @param {string} sPath The path to search at.
	 * @returns {*} The value at the specified path.
	 */
	function getObject(oObject, sPath) {
		if (sPath === "/") {
			return oObject;
		}

		// if the incoming sPath is a path we do a nested lookup in the
		// manifest object and return the concrete value, e.g. "/sap.ui5/extends"
		if (oObject && sPath && typeof sPath === "string" && sPath[0] === "/") {
			var aPaths = sPath.substring(1).split("/"),
				sPathSegment;
			for (var i = 0, l = aPaths.length; i < l; i++) {
				sPathSegment = aPaths[i];

				// Prevent access to native properties
				oObject = oObject.hasOwnProperty(sPathSegment) ? oObject[sPathSegment] : undefined;

				// Only continue with lookup if the value is an object.
				// Accessing properties of other types is not allowed!
				if (oObject === null || typeof oObject !== "object") {

					// Clear the value in case this is not the last segment in the path.
					// Otherwise e.g. "/foo/bar/baz" would return the value of "/foo/bar"
					// in case it is not an object.
					if (i + 1 < l && oObject !== undefined) {
						oObject = undefined;
					}

					break;
				}
			}
			return oObject;
		}

		// if no path starting with slash is specified we access and
		// return the value directly from the manifest
		return oObject && oObject[sPath];
	}

	/**
	 * Applies any filters values to the manifest.
	 * Replaces {{filters.*}} with the actual value taken from runtime or from the default filter value.
	 *
	 * @param {Map} mRuntimeFilters Runtime filters values.
	 * @private
	 */
	Manifest.prototype.processFilters = function (mRuntimeFilters) {
		if (!this._oManifest) {
			return;
		}

		var oManifestFilters = this.get(this.FILTERS),
			oCombinedFilters = {};

		if (mRuntimeFilters.size && !oManifestFilters) {
			Log.error("If runtime filters are set, they have to be defined in the manifest configuration as well.");
			return;
		}

		jQuery.each(oManifestFilters, function (sKey, oConfig) {
			var sValue = mRuntimeFilters.get(sKey) || oConfig.value;

			oCombinedFilters[sKey] = sValue;
		});

		this._oCombinedFilters = oCombinedFilters;
		this.processManifest();
	};

	/**
	 * Processes passed parameters.
	 *
	 * @param {Object} oParameters Parameters set in the card trough parameters property.
	 * @private
	 */
	Manifest.prototype.processParameters = function (oParameters) {
		if (!this._oManifest) {
			return;
		}

		var oManifestParams = this.get(this.PARAMETERS);

		if (oParameters && !oManifestParams) {
			Log.error("If parameters property is set, parameters should be described in the manifest");
			return;
		}

		this._oCombinedParams = this._syncParameters(oParameters, oManifestParams);
		this.processManifest();
	};

	/**
	 * Gets the updated parameters and processes any translations and predefined parameters on top of them.
	 *
	 * @public
	 * @param {Object} oParameters Parameters set in the card through <code>parameters</code> property.
	 * @returns {Object} The updated parameters.
	 */
	Manifest.prototype.getProcessedParameters = function (oParameters) {
		var oManifestParams = this.get(this.PARAMETERS),
			oResultParameters = this._syncParameters(oParameters, oManifestParams);

		process(oResultParameters, this.oResourceBundle, 0, 15, oParameters);

		return oResultParameters;
	};

	/**
	 * Syncs parameters from property.
	 *
	 * @param {Object} oParameters Parameters set in the card through parameters property.
	 * @param {Object} oManifestParameters Parameters set in the manifest.
	 * @private
	 */
	Manifest.prototype._syncParameters = function (oParameters, oManifestParameters) {
		if (!oParameters) {
			return oManifestParameters;
		}

		var oClonedManifestParams = deepClone(oManifestParameters, 20, 20),
			oParamProps = Object.getOwnPropertyNames(oParameters),
			oManifestParamsProps = Object.getOwnPropertyNames(oClonedManifestParams);

		for (var i = 0; i < oManifestParamsProps.length; i++) {
			for (var j = 0; j < oParamProps.length; j++) {
				if (oManifestParamsProps[i] === oParamProps[j]) {
					oClonedManifestParams[oManifestParamsProps[i]].value = oParameters[oParamProps[j]];
				}
			}
		}

		return oClonedManifestParams;
	};

	return Manifest;
}, true);
