/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/URI"
], function(URI) {
	"use strict";

	/**
	 * Helper module that provides a set of functions to resolve bundle urls.
	 *
	 * @namespace
	 * @alias module:sap/ui/core/_UrlResolver
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var _UrlResolver = {};

	/**
	 * Function that loops through the model config and resolves the bundle urls
	 * of terminologies relative to the component, the manifest or relative to an URL.
	 *
	 * @example
	 * {
	 *   "oil": {
	 *     "bundleUrl": "i18n/terminologies/oil.i18n.properties"
	 *   },
	 *   "retail": {
	 *     "bundleName": "i18n.terminologies.retail.i18n.properties"
	 *   }
	 * }
	 *
	 * @param {object} mBundleConfig Map with bundle config settings
	 * @param {object} mSettings Map with settings for processing the resource configuration
	 * @param {boolean} [mSettings.alreadyResolvedOnRoot=false] Whether the bundleUrl was already resolved (usually by the sap.ui.core.Component)
	 * @param {URI} mSettings.baseURI The base URI of the Component (usually provided by the sap.ui.core.Component or sap.ui.core.Manifest)
	 * @param {URI} mSettings.manifestBaseURI The base URI of the manifest (usually provided by the sap.ui.core.Component or sap.ui.core.Manifest)
	 * @param {string} [mSettings.relativeTo="component"] Either "component", "manifest" or a "library path" to which the bundleUrl should be resolved
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	_UrlResolver._processResourceConfiguration = function (mBundleConfig, mSettings) {
		mSettings = mSettings || {};

		var bAlreadyResolvedOnRoot = mSettings.alreadyResolvedOnRoot || false;
		var sRelativeTo = mBundleConfig.bundleUrlRelativeTo || mSettings.relativeTo;
		var vRelativeToURI;

		if (sRelativeTo === "manifest") {
			vRelativeToURI = mSettings.manifestBaseURI;
		} else if (sRelativeTo === "component") {
			vRelativeToURI = mSettings.baseURI;
		} else {
			// relative to library path or undefined; default (component base uri)
			vRelativeToURI = sRelativeTo || mSettings.baseURI;
		}

		Object.keys(mBundleConfig).forEach(function(sKey) {
			if (sKey === "bundleUrl" && !bAlreadyResolvedOnRoot) {
				var sBundleUrl = mBundleConfig[sKey];
				var oResolvedUri = _UrlResolver._resolveUri(sBundleUrl, vRelativeToURI);
				mBundleConfig[sKey] = oResolvedUri && oResolvedUri.toString();
			}
			if (sKey === "terminologies") {
				var mTerminologies = mBundleConfig[sKey];
				for (var sTerminology in mTerminologies) {
					_UrlResolver._processResourceConfiguration(mTerminologies[sTerminology], {
						relativeTo: sRelativeTo,
						baseURI: mSettings.baseURI,
						manifestBaseURI: mSettings.manifestBaseURI
					});
				}
			}
			if (sKey === "enhanceWith") {
				var aEnhanceWith = mBundleConfig[sKey] || [];
				for (var i = 0; i < aEnhanceWith.length; i++) {
					_UrlResolver._processResourceConfiguration(aEnhanceWith[i], {
						relativeTo: sRelativeTo,
						baseURI: mSettings.baseURI,
						manifestBaseURI: mSettings.manifestBaseURI
					});
				}
			}
		});
	};

	/**
	 * Makes sure that we can safely deal with URI instances.
	 * See return value.
	 *
	 * @param {URI|string|undefined} v either a URI instance, a string value or undefined
	 * @returns {URI} a URI instance created from the given argument, or the given argument if it is already a URI instance
	 */
	function normalizeToUri(v) {
		if (v && v instanceof URI) {
			return v;
		}
		return new URI(v);
	}

	/**
	 * Resolves the given URI relative to the Component by default,
	 * relative to the manifest when passing 'manifest'
	 * or relative to URL path when passing an URL string as seceond
	 * parameter.
	 *
	 * @param {URI|string} vUri URI to resolve
	 * @param {URI|string} [vRelativeToURI] defines to which base URI the given URI will be resolved to.
	 *                                      Either a string or a URI instance.
	 *                                      Can be a component base URI, a manifest base URI or a library path.
	 * @return {URI} resolved URI
	 * @private
	 */
	_UrlResolver._resolveUri = function (vUri, vRelativeToURI) {
		return _UrlResolver._resolveUriRelativeTo(normalizeToUri(vUri), normalizeToUri(vRelativeToURI));
	};

	/**
	 * Resolves the given URI relative to the given base URI.
	 *
	 * @param {URI} oUri URI to resolve
	 * @param {URI} oBase Base URI
	 * @return {URI} resolved URI
	 * @static
	 * @private
	 */
	_UrlResolver._resolveUriRelativeTo = function(oUri, oBase) {
		if (oUri.is("absolute") || (oUri.path() && oUri.path()[0] === "/")) {
			return oUri;
		}
		var oPageBase = new URI(document.baseURI).search("");
		oBase = oBase.absoluteTo(oPageBase);
		return oUri.absoluteTo(oBase).relativeTo(oPageBase);
	};

	return _UrlResolver;
});