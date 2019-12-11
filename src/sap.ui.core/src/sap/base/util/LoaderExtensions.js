/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/base/Log',
	'sap/base/assert'
], function(
	jQuery,
	Log,
	assert
) {
	"use strict";

	/**
	 * Utilities extending the <code>sap.ui.loader</code> functionalities.
	 *
	 * @namespace
	 * @since 1.58
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var LoaderExtensions = {};

	/**
	 * Calculate a regex for all known subtypes.
	 */
	var FRAGMENT = "fragment";
	var VIEW = "view";
	var KNOWN_SUBTYPES = {
		js :  [VIEW, FRAGMENT, "controller", "designtime"],
		xml:  [VIEW, FRAGMENT],
		json: [VIEW, FRAGMENT],
		html: [VIEW, FRAGMENT]
	};
	var rTypes;

	(function() {
		var s = "";

		for (var sType in KNOWN_SUBTYPES) {
			s = (s ? s + "|" : "") + sType;
		}

		s = "\\.(" + s + ")$";
		rTypes = new RegExp(s);
	}());

	/**
	 * Returns all known subtypes.
	 *
	 * @return {object} known subtypes
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	LoaderExtensions.getKnownSubtypes = function() {
		return KNOWN_SUBTYPES;
	};

	/**
	 * Returns the names of all required modules.
	 *
	 * @return {string[]} the names of all required modules
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	LoaderExtensions.getAllRequiredModules = function() {
		var aModuleNames = [],
			mModules = sap.ui.loader._.getAllModules(true),
			oModule;

		for (var sModuleName in mModules) {
			oModule = mModules[sModuleName];
			// filter out preloaded modules
			if (oModule.ui5 && oModule.state !== -1 /* PRELOADED */) {
				aModuleNames.push(oModule.ui5);
			}
		}
		return aModuleNames;
	};

	// Stores final URL prefixes (used by registerResourcePath)
	var mFinalPrefixes = Object.create(null);

	/**
	 * Registers a URL prefix for a resource name prefix.
	 *
	 * Before a resource is loaded, the longest registered prefix of its unified resource name
	 * is searched for and the associated URL prefix is used as a prefix for the request URL.
	 * The remainder of the resource name is attached to the request URL 1:1.
	 *
	 * The registration and search operates on full name segments only. So when a prefix
	 *
	 *    'sap/com'  ->  'http://www.sap.com/ui5/resources/'
	 *
	 * is registered, then it will match the name
	 *
	 *    'sap/com/Button'
	 *
	 * but not
	 *
	 *    'sap/commons/Button'
	 *
	 * Note that the empty prefix ('') will always match and thus serves as a fallback for
	 * any search.
	 *
	 * The url prefix can either be given as string or as object which contains the url and a final flag.
	 * If final is set to true, overwriting a resource name prefix is not possible anymore.
	 *
	 * @param {string} sResourceNamePrefix in unified resource name syntax
	 * @param {string | object} vUrlPrefix prefix to use instead of the sResourceNamePrefix, either a string literal or an object (e.g. {url : 'url/to/res', 'final': true})
	 * @param {string} [vUrlPrefix.url] path prefix to register
	 * @param {boolean} [vUrlPrefix.final] flag to avoid overwriting the url path prefix for the given module name at a later point of time
	 *
	 * @private
	 * @ui5-restricted sap.ui.core.Core, sap.ui.core.Component
	 * @static
	 * @SecSink {1|PATH} Parameter is used for future HTTP requests
	 */
	LoaderExtensions.registerResourcePath = function(sResourceNamePrefix, vUrlPrefix) {
		if (!vUrlPrefix) {
			vUrlPrefix = { url: null };
		}

		if (!mFinalPrefixes[sResourceNamePrefix]) {
			var sUrlPrefix;

			if (typeof vUrlPrefix === "string" || vUrlPrefix instanceof String) {
				sUrlPrefix = vUrlPrefix;
			} else {
				sUrlPrefix = vUrlPrefix.url;
				if (vUrlPrefix.final) {
					mFinalPrefixes[sResourceNamePrefix] = vUrlPrefix.final;
				}
			}

			var sOldUrlPrefix = sap.ui.require.toUrl(sResourceNamePrefix);
			var oConfig;

			if (sUrlPrefix !== sOldUrlPrefix || vUrlPrefix.final) {
				oConfig = {
					paths: {}
				};
				oConfig.paths[sResourceNamePrefix] = sUrlPrefix;
				sap.ui.loader.config(oConfig);

				Log.info("LoaderExtensions.registerResourcePath ('" + sResourceNamePrefix + "', '" + sUrlPrefix + "')" + (vUrlPrefix['final'] ? " (final)" : ""));
			}
		} else {
			Log.warning( "LoaderExtensions.registerResourcePath with prefix " + sResourceNamePrefix + " already set as final. This call is ignored." );
		}
	};

	/**
	 * Retrieves the resource with the given name, either from the preload cache or from
	 * the server. The expected data type of the resource can either be specified in the
	 * options (<code>dataType</code>) or it will be derived from the suffix of the <code>sResourceName</code>.
	 * The only supported data types so far are xml, html, json and text. If the resource name extension
	 * doesn't match any of these extensions, the data type must be specified in the options.
	 *
	 * If the resource is found in the preload cache, it will be converted from text format
	 * to the requested <code>dataType</code> using a converter from <code>jQuery.ajaxSettings.converters</code>.
	 *
	 * If it is not found, the resource name will be converted to a resource URL (using {@link #getResourcePath})
	 * and the resulting URL will be requested from the server with a synchronous jQuery.ajax call.
	 *
	 * If the resource was found in the local preload cache and any necessary conversion succeeded
	 * or when the resource was retrieved from the backend successfully, the content of the resource will
	 * be returned. In any other case, an exception will be thrown, or if option failOnError is set to true,
	 * <code>null</code> will be returned.
	 *
	 * Future implementations of this API might add more options. Generic implementations that accept an
	 * <code>mOptions</code> object and propagate it to this function should limit the options to the currently
	 * defined set of options or they might fail for unknown options.
	 *
	 * For asynchronous calls the return value of this method is an ECMA Script 6 Promise object which callbacks are triggered
	 * when the resource is ready:
	 * If <code>failOnError</code> is <code>false</code> the catch callback of the promise is not called. The argument given to the fullfilled
	 * callback is null in error case.
	 * If <code>failOnError</code> is <code>true</code> the catch callback will be triggered. The argument is an Error object in this case.
	 *
	 * @param {string} [sResourceName] resourceName in unified resource name syntax
	 * @param {object} [mOptions] options
	 * @param {object} [mOptions.dataType] one of "xml", "html", "json" or "text". If not specified it will be derived from the resource name (extension)
	 * @param {string} [mOptions.name] unified resource name of the resource to load (alternative syntax)
	 * @param {string} [mOptions.url] url of a resource to load (alternative syntax, name will only be a guess)
	 * @param {string} [mOptions.headers] Http headers for an eventual XHR request
	 * @param {string} [mOptions.failOnError=true] whether to propagate load errors or not
	 * @param {string} [mOptions.async=false] whether the loading should be performed asynchronously.
	 * @return {string|Document|object|Promise} content of the resource. A string for text or html, an Object for JSON, a Document for XML. For asynchronous calls an ECMA Script 6 Promise object will be returned.
	 * @throws Error if loading the resource failed
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core, sap.ui.fl
	 */
	LoaderExtensions.loadResource = function(sResourceName, mOptions) {
		var sType,
			oData,
			sUrl,
			oError,
			oDeferred,
			fnDone,
			iSyncCallBehavior;

		if (LoaderExtensions.notifyResourceLoading) {
			fnDone = LoaderExtensions.notifyResourceLoading();
		}

		if (typeof sResourceName === "string") {
			mOptions = mOptions || {};
		} else {
			mOptions = sResourceName || {};
			sResourceName = mOptions.name;
		}
		// defaulting
		mOptions = jQuery.extend({ failOnError: true, async: false }, mOptions);

		sType = mOptions.dataType;
		if (sType == null && sResourceName) {
			sType = (sType = rTypes.exec(sResourceName || mOptions.url)) && sType[1];
		}

		assert(/^(xml|html|json|text)$/.test(sType), "type must be one of xml, html, json or text");

		oDeferred = mOptions.async ? new jQuery.Deferred() : null;

		function handleData(d, e) {
			if (d == null && mOptions.failOnError) {
				oError = e || new Error("no data returned for " + sResourceName);
				if (mOptions.async) {
					oDeferred.reject(oError);
					Log.error(oError);
				}
				if (fnDone) {
					fnDone();
				}
				return null;
			}

			if (mOptions.async) {
				oDeferred.resolve(d);
			}
			if (fnDone) {
				fnDone();
			}
			return d;
		}

		function convertData(d) {
			var vConverter = jQuery.ajaxSettings.converters["text " + sType];
			if (typeof vConverter === "function") {
				d = vConverter(d);
			}
			return handleData(d);
		}

		oData = sap.ui.loader._.getModuleContent(sResourceName, mOptions.url);

		if (oData != undefined) {

			if (mOptions.async) {
				//Use timeout to simulate async behavior for this sync case for easier usage
				setTimeout(function() {
					convertData(oData);
				}, 0);
			} else {
				oData = convertData(oData);
			}

		} else {

			iSyncCallBehavior = sap.ui.loader._.getSyncCallBehavior();
			if (!mOptions.async && iSyncCallBehavior) {
				if (iSyncCallBehavior >= 1) { // temp. raise a warning only
					Log.error("[nosync] loading resource '" + (sResourceName || mOptions.url) + "' with sync XHR");
				} else {
					throw new Error("[nosync] loading resource '" + (sResourceName || mOptions.url) + "' with sync XHR");
				}
			}

			jQuery.ajax({
				url: sUrl = mOptions.url || sap.ui.loader._.getResourcePath(sResourceName),
				async: mOptions.async,
				dataType: sType,
				headers: mOptions.headers,
				success: function(data, textStatus, xhr) {
					oData = handleData(data);
				},
				error: function(xhr, textStatus, error) {
					oError = new Error("resource " + sResourceName + " could not be loaded from " + sUrl + ". Check for 'file not found' or parse errors. Reason: " + error);
					oError.status = textStatus;
					oError.error = error;
					oError.statusCode = xhr.status;
					oData = handleData(null, oError);
				}
			});

		}

		if (mOptions.async) {
			return Promise.resolve(oDeferred);
		}

		if (oError != null && mOptions.failOnError) {
			throw oError;
		}

		return oData;
	};

	/**
	 * Hook to notify Interaction on loadResource
	 *
	 * @ui5-restricted sap.ui.performance.trace.Interaction
	 *
	 * @private
	 * @returns {function} callback function
	 */
	LoaderExtensions.notifyResourceLoading = null;

	return LoaderExtensions;

});