/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/base/Log',
	'sap/base/assert',
	'sap/base/util/extend'
], function(
	jQuery,
	Log,
	assert,
	extend
) {
	"use strict";

	/**
	 * Utilities extending the <code>sap.ui.loader</code> functionalities.
	 *
	 * @namespace
	 * @since 1.58
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @alias module:sap/base/util/LoaderExtensions
	 */
	var LoaderExtensions = {};

	/**
	 * Known subtypes per file type.
	 * @const
	 * @private
	 */
	var KNOWN_SUBTYPES = {
		js:   ["controller", "designtime", "fragment", "support", "view"],
		json: ["fragment", "view"],
		html: ["fragment", "view"],
		xml:  ["fragment", "view"]
	};

	/**
	 * A regex that matches all known file type extensions (without subtypes).
	 * @const
	 * @private
	 */
	var rTypes = new RegExp("\\.(" + Object.keys(KNOWN_SUBTYPES).join("|") + ")$");

	/**
	 * Returns all known subtypes.
	 *
	 * @returns {Object<string,string[]>} Map of known subtypes per file type
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	LoaderExtensions.getKnownSubtypes = function() {
		return KNOWN_SUBTYPES;
	};

	/**
	 * Returns the names of all required modules in the legacy syntax for module names (dot-separated).
	 *
	 * @return {string[]} The names of all required modules
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
	 * <pre>
	 *    'sap/com'  ->  'http://www.sap.com/ui5/resources/'
	 * </pre>
	 *
	 * is registered, then it will match the name
	 *
	 * <pre>
	 *    'sap/com/Button'
	 * </pre>
	 *
	 * but not
	 *
	 * <pre>
	 *    'sap/commons/Button'
	 * </pre>
	 *
	 * Note that the empty prefix ('') will always match and thus serves as a fallback for
	 * any search.
	 *
	 * The URL prefix can either be given as string or as an object which contains a <code>url</code> property
	 * and optionally a <code>final</code> flag. If <code>final</code> is set to true, overwriting the path
	 * for the given resource name prefix is not possible anymore.
	 *
	 * @param {string} sResourceNamePrefix In unified resource name syntax
	 * @param {string | object} vUrlPrefix Prefix to use instead of the <code>sResourceNamePrefix</code>, either
	 *     a string literal or an object (e.g. <code>{url : 'url/to/res', 'final': true}</code>)
	 * @param {string} [vUrlPrefix.url] Path prefix to register
	 * @param {boolean} [vUrlPrefix.final=false] Prevents overwriting the URL path prefix for the given resource
	 *     name prefix at a later point of time.
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
	 * The only supported data types so far are <code>'xml'</code>, <code>'html'</code>, <code>'json'</code>
	 * and <code>'text'</code>. If the resource name extension doesn't match any of these extensions,
	 * the <code>dataType</code> property must be specified as option.
	 *
	 * If the resource is found in the preload cache, it will be converted from text format
	 * to the requested <code>dataType</code> using conversions similar to:
	 * <pre>
	 *   dataType | conversion
	 *   ---------+-------------------------------------------------------------
	 *     html   | text (no conversion)
	 *     json   | JSON.parse(text)
	 *     xml    | DOMParser.prototype.parseFromString(text, "application/xml")
	 * </pre>
	 *
	 * If it is not found, the resource name will be converted to a resource URL (using {@link #getResourcePath})
	 * and the resulting URL will be requested from the server with an XMLHttpRequest.
	 *
	 * If the resource was found in the local preload cache and any necessary conversion succeeded
	 * or when the resource was retrieved from the backend successfully, the content of the resource will
	 * be returned. In any other case, an exception will be thrown, or if option <code>failOnError</code> is set,
	 * <code>null</code> will be returned.
	 *
	 * For asynchronous calls, the return value of this method is a Promise which resolves with the
	 * content of the resource on success or rejects with an error in case of errors. If <code>failOnError</code>
	 * is <code>false</code> and an error occurs, the promise won't be rejected, but resolved with <code>null</code>.
	 *
	 * Future implementations of this API might add more options. Generic implementations that accept an
	 * <code>mOptions</code> object and propagate it to this function should limit the options to the currently
	 * defined set of options or they might fail for unknown options.
	 *
	 * @param {string} [sResourceName] resourceName In unified resource name syntax
	 * @param {object} [mOptions] Options
	 * @param {string} [mOptions.dataType] One of "xml", "html", "json" or "text". If not specified, it will be derived
	 *     from the extension of the resource name or URL
	 * @param {string} [mOptions.name] Unified resource name of the resource to load (alternative syntax)
	 * @param {string} [mOptions.url] URL of a resource to load (alternative syntax, name will only be a guess)
	 * @param {Object<string,string>} [mOptions.headers] HTTP headers for an eventual XHR request
	 * @param {string} [mOptions.failOnError=true] Whether to propagate load errors to the caller or not
	 * @param {string} [mOptions.async=false] Whether the loading should be performed asynchronously
	 * @returns {string|Document|object|Promise} Content of the resource. A string for type 'text' or 'html',
	 *     an Object for type 'json', a Document for type 'xml'. For asynchronous calls, a Promise will be returned
	 *     that resolves with the resources's content or rejects with an error when loading the resource failed
	 * @throws Error if loading the resource failed (synchronous call)
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
		mOptions = extend({ failOnError: true, async: false }, mOptions);

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
	 * Hook to notify interaction tracking about the loading of a resource.
	 *
	 * When set, the hook will be called when loading a resource starts. The hook can return a callback
	 * function which will be called when loading the resource finishes (no matter whether loading
	 * succeeds or fails). No further data is provided to the hook nor to the callback.
	 *
	 * Only a single implementation of the hook is supported.
	 *
	 * @private
	 * @ui5-restricted module:sap/ui/performance/trace/Interaction
	 *
	 * @type {function():function}
	 */
	LoaderExtensions.notifyResourceLoading = null;

	return LoaderExtensions;

});