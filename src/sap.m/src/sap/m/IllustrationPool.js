/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"./library",
	'sap/ui/core/Core',
	"sap/ui/thirdparty/jquery"
],
	function(Log, mLibrary, Core, jQuery) {
		"use strict";

		/**
		 * STATIC MEMBERS
		 */
		var SAP_ILLUSTRATION_POOL_ID = 'sap-ui-illustration-pool',
			SAP_ILLUSTRATION_PATTERNS_NAME = '-Patterns',
			SAP_ILLUSTRATION_SET_NAME = 'sapIllus',
			SAP_ILLUSTRATION_SET_PATH = sap.ui.require.toUrl("sap/m/themes/base/illustrations/"),
			SAP_ILLUSTRATION_SET_SYMBOLS = Object.keys(mLibrary.IllustratedMessageType);

		/*
		 * A map of registered sets
		 * key: set name
		 * value: configuration object containing
		 *   key: sPath
		 *   value: string path of the illustration set
		 *   key: aSymbols
		 *   value: array of the symbols names which the illustration set supports
		 *   key: bIsPending
		 *   value: boolean of whether or not the Illustration Set is loading
		 */

		var oSetRegistry = Object.create(null);

		oSetRegistry[SAP_ILLUSTRATION_SET_NAME] = {
			sPath: SAP_ILLUSTRATION_SET_PATH,
			aSymbols: SAP_ILLUSTRATION_SET_SYMBOLS,
			bIsPending: false
		};

		var aSymbolsInDOM = [], // Array with IDs of the symbols which are already in the DOM
			oAssetRegistry = Object.create(null), // Object with IDs of the assets which are loaded or being loaded
			oLoadedSymbols = Object.create(null), // Object which stores the loaded HTML raw data for a given asset for future reuse (might not be in the DOM yet)
			oRequiredAssets = Object.create(null); // Object which stores the last required asset ID for a given instance

		/**
		 * <code>IllustrationPool</code> loads the illustration assets (SVGs) via XMLHttpRequest requests.
		 *
		 * The successfully loaded data is kept in the DOM (div with ID <code>sap-illustration-pool</code>)
		 * in the <code>sap-ui-static</code> DOM element.
		 *
		 * To load a given asset, register its illustration set through the
		 * {@link sap.m.IllustrationPool.registerIllustrationSet registerIllustrationSet} API of <code>IllustrationPool</code>.
		 * The exception being the <code>sapIllus</code>, which is the default illustration set
		 * that is registered by default.
		 *
		 * The default behavior of <code>IllustrationPool</code> is to load/require an asset only
		 * when it's needed by using the {@link sap.m.IllustrationPool.loadAsset} API.
		 * When registering the new illustration set, you are given the option to load all of its assets.
		 *
		 * If some of the assets are not loaded initially, you can load the rest of them on
		 * a later state with the {@link sap.m.IllustrationPool.loadRestOfTheAssets} API.
		 *
		 * @namespace
		 * @since 1.98
		 * @public
		 * @alias sap.m.IllustrationPool
		 */
		var IllustrationPool = {};

		/**
		 * PUBLIC METHODS
		 */

		/**
		 * Loads an SVG asset depending on the input asset ID.
		 *
		 * @param {string} sAssetId The string ID of the asset being loaded
		 * @param {string} sInstanceId the ID of the Illustration instance which is requiring the asset
		 * @static
		 * @public
		 */
		IllustrationPool.loadAsset = function (sAssetId, sInstanceId) {
			var sSet;

			if (sAssetId === "") {
				Log.error("ID of the asset can not be blank/empty.");
				return;
			}

			// if the the asset is required by an instance - cache its ID
			if (sInstanceId) {
				oRequiredAssets[sInstanceId] = sAssetId;
			}

			if (oAssetRegistry[sAssetId]) {
				Log.info("The asset with ID '" + sAssetId + "' is either loaded or being loaded.");
				// if the the asset is required by an instance and it's loaded - update the DOM pool
				if (sInstanceId && oLoadedSymbols[sAssetId]) {
					IllustrationPool._updateDOMPool();
				}
				return;
			}

			sSet = sAssetId.split("-")[0];

			if (!oSetRegistry[sSet]) {
				Log.error("The illustration set '" + sSet + "' is not registered. Please register it before requiring one of its assets.");
				return;
			}

			oAssetRegistry[sAssetId] = true;

			IllustrationPool._requireSVG(sSet, sAssetId, sInstanceId);
		};

		/**
		 * Loads the rest of the SVG assets for a given illustration set.
		 *
		 * @param {string} sIllustrationSet The illustration set, the rest of the assets should be loaded for
		 * @static
		 * @public
		 */
		IllustrationPool.loadRestOfTheAssets = function(sIllustrationSet) {
			var aSymbols;

			if (!oSetRegistry[sIllustrationSet]) {
				throw new Error("The illustration set '" + sIllustrationSet + "' is not registered. Please register it before requiring rest of its assets.");
			}

			aSymbols = oSetRegistry[sIllustrationSet].aSymbols;

			if (Array.isArray(aSymbols)) {
				aSymbols.forEach(function(sSymbol) {
					IllustrationPool.loadAsset(sIllustrationSet + "-Spot-" + sSymbol);
					IllustrationPool.loadAsset(sIllustrationSet + "-Dialog-" + sSymbol);
					IllustrationPool.loadAsset(sIllustrationSet + "-Scene-" + sSymbol);
				});
			}
		};

		/**
		 * Registers an illustration set, which is needed before loading any of its assets.
		 *
		 * @param {object} oConfig object containing the name and the path of the Illustration Set
		 * @param {string} oConfig.setFamily Name of the Illustration Set
		 * @param {string} oConfig.setURI URL Path of the Illustration Set
		 * @param {boolean} bLoadAllResources whether or not all of the assets for the Illustration Set
		 * should be loaded once the metadata is loaded
		 * @static
		 * @public
		 */
		IllustrationPool.registerIllustrationSet = function(oConfig, bLoadAllResources) {
			var sName = oConfig.setFamily,
				sPath = oConfig.setURI;

			if (oSetRegistry[sName]) {
				if (oSetRegistry[sName].bIsPending) {
					Log.warning("Illustration Set is currently being loaded.");
				} else {
					Log.warning("Illustration Set already registered.");
				}
				return;
			}

			// add trailing slash if necessary for more convenience
			if (sPath.substr(sPath.length - 1) !== "/") {
				sPath += "/";
			}

			oSetRegistry[sName] = Object.create(null);
			oSetRegistry[sName].sPath = sPath;
			oSetRegistry[sName].bIsPending = true;

			IllustrationPool._loadMetadata(sName, sPath, bLoadAllResources);
		};

		/**
		 * PRIVATE METHODS
		 */

		/**
		 * Adds an asset to the Illustration Pool's DOM element inner HTML.
		 *
		 * @param {string} sHTML string containing the raw HTML of an asset
		 * @param {string} sId string containing the ID of an asset
		 * @static
		 * @private
		 */
		IllustrationPool._addAssetToDOMPool = function(sHTML, sId) {
			IllustrationPool._getDOMPool().insertAdjacentHTML("beforeend", sHTML);
			if (sId) {
				aSymbolsInDOM.push(sId);
			}
		};

		/**
		 * Returns the DOM for the Illustration Pool.
		 * It also loads the mandatory patterns for the default Illustration Set once the DOM is created.
		 *
		 * @return {Object} DOM reference of the Illustration Pool
		 * @static
		 * @private
		 */
		IllustrationPool._getDOMPool = function() {
			var oDOMPool = document.getElementById(SAP_ILLUSTRATION_POOL_ID);

			if (oDOMPool === null) {
				oDOMPool = document.createElement("div");
				oDOMPool.id = SAP_ILLUSTRATION_POOL_ID;
				oDOMPool.setAttribute("aria-hidden", "true");

				Core.getStaticAreaRef().appendChild(oDOMPool);

				// Load the patterns for the default illustration set after the DOM Pool is created
				IllustrationPool.loadAsset(SAP_ILLUSTRATION_SET_NAME + SAP_ILLUSTRATION_PATTERNS_NAME);
			}

			return oDOMPool;
		};

		/**
		 * Loads the metadata of an Illustration Set.
		 *
		 * @param {string} sName the name of the Illustration Set for which the metadata is being loaded
		 * @param {string} sPath the path of the Illustration Set for which the metadata is being loaded
		 * @param {boolean} bLoadAllResources whether or not all of the assets for the Illustration Set should be loaded
		 * @return {Promise} Promise which resolves when the metadata is loaded
		 * @static
		 * @private
		 */
		IllustrationPool._loadMetadata = function(sName, sPath, bLoadAllResources) {
			var sMetadataPath = sPath + "metadata.json";

			return new Promise(function (fnResolve) {
				jQuery.ajax(sMetadataPath, {
					type: "GET",
					dataType: "json",
					success: function (oMetadataJSON) {
						Log.info("Metadata for illustration set (" + sName + ") successfully loaded");
						IllustrationPool._metadataLoaded(sName, oMetadataJSON, bLoadAllResources);
						fnResolve(oMetadataJSON); // passing the json in the resolve for testing purposes
					},
					error: function (jqXHR, sStatus) {
						if (sStatus !== "abort") { // log an error if it isn't aborted
							Log.error("Metadata from: " + sMetadataPath + " file path could not be loaded");
							delete oSetRegistry[sName];
							fnResolve();
						}
					}
				});
			});
		};

		/**
		 * Hook which is triggered when the metadata for an Illustration Set is loaded.
		 *
		 * @param {string} sName the name of the Illustration Set for which the metadata is loaded
		 * @param {object} oMetadataJSON the loaded metadata object
		 * @param {boolean} bLoadAllResources whether or not all of the assets for the Illustration Set should be loaded
		 * @static
		 * @private
		 */
		IllustrationPool._metadataLoaded = function(sName, oMetadataJSON, bLoadAllResources) {
			var aSymbols = oMetadataJSON.symbols,
				bHasPatterns = oMetadataJSON.requireCustomPatterns;

			oSetRegistry[sName].aSymbols = aSymbols;

			// Load the patterns (if available) as soon as possible, since they can be used in any of the symbols.
			if (bHasPatterns) {
				IllustrationPool.loadAsset(sName + SAP_ILLUSTRATION_PATTERNS_NAME);
			}

			if (bLoadAllResources) {
				IllustrationPool.loadRestOfTheAssets(sName);
			}

			oSetRegistry[sName].bIsPending = false;
		};

		/**
		 * Removes an asset from the Illustration Pool's DOM element inner HTML.
		 *
		 * @param {string} sId string containing the ID of the asset which should be removed from the Illustration Pool's DOM
		 * @static
		 * @private
		 */
		IllustrationPool._removeAssetFromDOMPool = function(sId) {
			var oDOMPool = document.getElementById(SAP_ILLUSTRATION_POOL_ID),
				oAssetDOM;

			if (oDOMPool !== null) {
				oAssetDOM = document.getElementById(sId);
				if (oAssetDOM !== null) {
					oDOMPool.removeChild(oAssetDOM);
					aSymbolsInDOM.splice(aSymbolsInDOM.indexOf(sId), 1);
				}
			}
		};

		/**
		 * Loads an SVG asset.
		 *
		 * @param {string} sSet the name of the Illustration Set for which the asset is being loaded
		 * @param {string} sId the ID of the asset being loaded
		 * @param {string} sInstanceId the ID of the Illustration instance which is requiring the asset
		 * @return {Promise} Promise which resolves when the SVG asset is loaded
		 * @static
		 * @private
		 */
		IllustrationPool._requireSVG = function(sSet, sId, sInstanceId) {
			return new Promise(function (fnResolve) {
				jQuery.ajax(oSetRegistry[sSet].sPath + sId + ".svg", {
					type: "GET",
					dataType: "html",
					success: function (sHTML) {
						// if asset is a symbol, and not a pattern
						if (sId.indexOf(SAP_ILLUSTRATION_PATTERNS_NAME) === -1) {
							// cache the loaded symbol
							oLoadedSymbols[sId] = sHTML;

							// update the DOM if the asset is required by an instance
							if (sInstanceId) {
								IllustrationPool._updateDOMPool();
							}
						} else {
							// add the pattern immediately
							IllustrationPool._addAssetToDOMPool(sHTML);
						}

						fnResolve(sHTML);
					},
					error: function (jqXHR, sStatus) {
						if (sStatus !== "abort") { // log an error if it isn't aborted
							delete oAssetRegistry[sId];
							Log.error(sId + " asset could not be loaded");
							fnResolve();
						}
					}
				});
			});
		};

		/**
		 * Updates the IllustrationPool's DOM node. Adds the currently required assets (if they are
		 * not already there) and removes the ones which are not needed.
		 *
		 * @static
		 * @private
		 */
		IllustrationPool._updateDOMPool = function() {
			var oAssetsToKeep = Object.create(null),
				oAssetsToAdd = Object.create(null),
				sCurrAsset,
				iCurrIndexInDOM;

			for (var sCurrInstance in oRequiredAssets) {
				sCurrAsset = oRequiredAssets[sCurrInstance];
				iCurrIndexInDOM = aSymbolsInDOM.indexOf(sCurrAsset);
				// if the asset is not already in the DOM, remember its ID and add it later, if it's loaded
				if (iCurrIndexInDOM === -1) {
					oAssetsToAdd[sCurrAsset] = true;
				} else {
					// if the asset is already in the DOM, remember its ID to help remove the not needed ones later
					oAssetsToKeep[sCurrAsset] = true;
				}
			}

			// remove the symbols which are not used and are not required
			for (var i = 0; i < aSymbolsInDOM.length; i++) {
				sCurrAsset = aSymbolsInDOM[i];
				if (!oAssetsToKeep[sCurrAsset]) {
					IllustrationPool._removeAssetFromDOMPool(sCurrAsset);
					i--;
				}
			}

			for (var sId in oAssetsToAdd) {
				sCurrAsset = oLoadedSymbols[sId];
				// add the missing required asset to the DOM only if it's loaded
				if (sCurrAsset) {
					IllustrationPool._addAssetToDOMPool(sCurrAsset, sId);
				}
			}
		};

		return IllustrationPool;

	}, /* bExport= */ true);
