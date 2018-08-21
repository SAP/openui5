/*!
 * ${copyright}
 */

/**
 * @overview Initialization for the SAP UI Library
 *
 * This module creates the main SAP namespaces {@link sap} and automatically
 * registers it to the OpenAjax hub if that exists.
 *
 * This class provides method {@link #namespace} to register namespaces to the
 * SAP UI Library.
 *
 * @sample
 * Ensures a control can be used afterwards but does not load immediately
 * sap.ui.lazyRequire("sap.ui.core.Control");
 * sap.ui.lazyRequire("sap.ui.commons.Button");
 *
 * @version ${version}
 * @author  Martin Schaus, Daniel Brinkmann
 * @public
 */

/*global OpenAjax */// declare unusual global vars for JSLint/SAPUI5 validation

// Register to the OpenAjax Hub if it exists
sap.ui.define([
	'sap/ui/VersionInfo',
	'sap/base/Log',
	'sap/base/assert',
	'sap/base/util/ObjectPath'
],
	function(VersionInfo, Log, assert, ObjectPath) {
	"use strict";

	if (window.OpenAjax && window.OpenAjax.hub) {
		OpenAjax.hub.registerLibrary("sap", "http://www.sap.com/", "0.1", {});
	}

	/**
	 * Root namespace for JavaScript functionality provided by SAP SE.
	 *
	 * The <code>sap</code> namespace is automatically registered with the
	 * OpenAjax hub if it exists.
	 *
	 * @version ${version}
	 * @namespace
	 * @public
	 * @name sap
	 */
	if ( typeof window.sap !== "object" && typeof window.sap !== "function"  ) {
	  window.sap = {};
	}

	/**
	 * The <code>sap.ui</code> namespace is the central OpenAjax compliant entry
	 * point for UI related JavaScript functionality provided by SAP.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui
	 * @public
	 */
	if ( typeof window.sap.ui !== "object") {
		window.sap.ui = {};
	}

	sap.ui = Object.assign(sap.ui, {
		/**
		 * The version of the SAP UI Library
		 * @type string
		 */
		version: "${version}",
		buildinfo : { lastchange : "${lastchange}", buildtime : "${buildtime}" }
	});

	var oCfgData = window["sap-ui-config"] || {};

	var syncCallBehavior = 0; // ignore
	if ( oCfgData['xx-nosync'] === 'warn' || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search) ) {
		syncCallBehavior = 1;
	}
	if ( oCfgData['xx-nosync'] === true || oCfgData['xx-nosync'] === 'true' || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search) ) {
		syncCallBehavior = 2;
	}

	/**
	 * Loads the version info file (resources/sap-ui-version.json) and returns
	 * it or if a library name is specified then the version info of the individual
	 * library will be returned.
	 *
	 * In case of the version info file is not available an error will occur when
	 * calling this function.
	 *
	 * @param {string|object} [mOptions] name of the library (e.g. "sap.ui.core") or an object map (see below)
	 * @param {boolean} [mOptions.library] name of the library (e.g. "sap.ui.core")
	 * @param {boolean} [mOptions.async=false] whether "sap-ui-version.json" should be loaded asynchronously
	 * @param {boolean} [mOptions.failOnError=true] whether to propagate load errors or not (not relevant for async loading)
	 * @return {object|undefined|Promise} the full version info, the library specific one,
	 *                                    undefined (if library is not listed or there was an error and "failOnError" is set to "false")
	 *                                    or a Promise which resolves with one of them
	 * @deprecated since 1.56: Use {@link sap.ui.VersionInfo.load} instead
	 * @public
	 * @static
	 */
	sap.ui.getVersionInfo = function(mOptions) {
		if (mOptions && mOptions.async) {
			Log.info("Do not use deprecated function 'sap.ui.getVersionInfo'. Use 'sap.ui.VersionInfo.load' instead");
		} else {
			Log.warning("Do not use deprecated function 'sap.ui.getVersionInfo' synchronously! Use asynchronous 'sap.ui.VersionInfo.load' instead");
		}

		return VersionInfo._load(mOptions); // .load() is async only!
	};

	/**
	 * Ensures that a given a namespace or hierarchy of nested namespaces exists in the
	 * current <code>window</code>.
	 *
	 * @param {string} sNamespace
	 * @return {object} the innermost namespace of the hierarchy
	 * @public
	 * @static
	 * @deprecated As of version 1.1, see {@link topic:c78c07c094e04ccfaab659378a1707c7 Creating Control and Class Modules}.
	 */
	sap.ui.namespace = function(sNamespace){

		assert(false, "sap.ui.namespace is long time deprecated and shouldn't be used");

		return ObjectPath.create(sNamespace);
	};

	/**
	 * Creates a lazy loading stub for a given class <code>sClassName</code>.
	 *
	 * If the class has been loaded already, nothing is done. Otherwise a stub object
	 * or constructor and - optionally - a set of stub methods are created.
	 * All created stubs will load the corresponding module on execution
	 * and then delegate to their counterpart in the loaded module.
	 *
	 * When no methods are given or when the list of methods contains the special name
	 * "new" (which is an operator can't be used as method name in JavaScript), then a
	 * stub <b>constructor</b> for class <code>sClassName</code> is created.
	 * Otherwise, a plain object is created.
	 *
	 * <b>Note</b>: Accessing any stub as a plain object without executing it (no matter
	 * whether it is a function or an object) won't load the module and therefore most like
	 * won't work as expected. This is a fundamental restriction of the lazy loader approach.
	 * It could only be fixed with JavaScript 1.5 features that are not available in all
	 * UI5 target browsers (e.g. not in IE8).
	 *
	 * <b>Note</b>: As a side effect of this method, the namespace containing the given
	 * class is created <b>immediately</b>.
	 *
	 * @param {string} sClassName Fully qualified name (dot notation) of the class that should be prepared
	 * @param {string} [sMethods='new'] space separated list of additional (static) methods that should be created as stubs
	 * @param {string} [sModuleName] name of the module to load, defaults to the class name
	 * @public
	 * @static
	 * @deprecated since 1.56
	 */
	sap.ui.lazyRequire = function(sClassName, sMethods, sModuleName) {

		assert(typeof sClassName === "string" && sClassName, "lazyRequire: sClassName must be a non-empty string");
		assert(!sMethods || typeof sMethods === "string", "lazyRequire: sMethods must be empty or a string");

		if ( syncCallBehavior === 2 ) {
			Log.error("[nosync] lazy stub creation ignored for '" + sClassName + "'");
			return;
		}

		var sFullClass = sClassName.replace(/\//gi,"\."),
			iLastDotPos = sFullClass.lastIndexOf("."),
			sPackage = sFullClass.substr(0, iLastDotPos),
			sClass = sFullClass.substr(iLastDotPos + 1),
			oPackage = ObjectPath.create(sPackage),
			oClass = oPackage[sClass],
			aMethods = (sMethods || "new").split(" "),
			iConstructor = aMethods.indexOf("new");

		sModuleName = sModuleName || sFullClass;

		if (!oClass) {

			if ( iConstructor >= 0 ) {

				// Create dummy constructor which loads the class on demand
				oClass = function() {
					if ( syncCallBehavior ) {
						if ( syncCallBehavior === 1 ) {
							Log.error("[nosync] lazy stub for constructor '" + sFullClass + "' called");
						}
					} else {
						Log.debug("lazy stub for constructor '" + sFullClass + "' called.");
					}
					sap.ui.requireSync(sModuleName.replace(/\./g, "/"));
					var oRealClass = oPackage[sClass];
					assert(typeof oRealClass === "function", "lazyRequire: oRealClass must be a function after loading");
					if ( oRealClass._sapUiLazyLoader ) {
						throw new Error("lazyRequire: stub '" + sFullClass + "'has not been replaced by module '" + sModuleName + "'");
					}

					// create a new instance and invoke the constructor
					var oInstance = Object.create(oRealClass.prototype);
					var oResult = oRealClass.apply(oInstance, arguments);
					if (oResult && (typeof oResult === "function" || typeof oResult === "object")) {
						oInstance = oResult;
					}
					return oInstance;
				};
				// mark the stub as lazy loader
				oClass._sapUiLazyLoader = true;

				aMethods.splice(iConstructor,1);

			} else {

				// Create dummy object
				oClass = {};

			}

			// remember the stub
			oPackage[sClass] = oClass;

		}


		// add stub methods to it
		aMethods.forEach( function(sMethod) {
			// check whether method is already available
			if (!oClass[sMethod]) {
				oClass[sMethod] = function() {
					if ( syncCallBehavior ) {
						if ( syncCallBehavior === 1 ) {
							Log.error("[no-sync] lazy stub for method '" + sFullClass + "." + sMethod + "' called");
						}
					} else {
						Log.debug("lazy stub for method '" + sFullClass + "." + sMethod + "' called.");
					}
					sap.ui.requireSync(sModuleName.replace(/\./g, "/"));
					var oRealClass = oPackage[sClass];
					assert(typeof oRealClass === "function" || typeof oRealClass === "object", "lazyRequire: oRealClass must be a function or object after loading");
					assert(typeof oRealClass[sMethod] === "function", "lazyRequire: method must be a function");
					if (oRealClass[sMethod]._sapUiLazyLoader ) {
						throw new Error("lazyRequire: stub '" + sFullClass + "." + sMethod + "' has not been replaced by loaded module '" + sModuleName + "'");
					}
					return oRealClass[sMethod].apply(oRealClass, arguments);
				};
				oClass[sMethod]._sapUiLazyLoader = true;
			}
		});

	};

	/**
	 * Note: this method only works when sClassName has been stubbed itself, not when
	 *    it has been stubbed as a static utility class with individual stubs for its methods.
	 *    (e.g. might not work for 'sap.ui.core.BusyIndicator').
	 * Must not be used outside the core, e.g. not by controls, apps, tests etc.
	 * @private
	 * @deprecated since 1.56
	 */
	sap.ui.lazyRequire._isStub = function(sClassName) {
		assert(typeof sClassName === "string" && sClassName, "lazyRequire._isStub: sClassName must be a non-empty string");

		var iLastDotPos = sClassName.lastIndexOf("."),
			sContext = sClassName.slice(0, iLastDotPos),
			sProperty = sClassName.slice(iLastDotPos + 1),
			oContext = ObjectPath.get(sContext || "");

		return !!(oContext && typeof oContext[sProperty] === "function" && oContext[sProperty]._sapUiLazyLoader);

	};

	/**
	 * Returns the URL of a resource that belongs to the given library and has the given relative location within the library.
	 * This is mainly meant for static resources like images that are inside the library.
	 * It is NOT meant for access to JavaScript modules or anything for which a different URL has been registered with jQuery.sap.registerModulePath(). For
	 * these cases use jQuery.sap.getModulePath().
	 * It DOES work, however, when the given sResourcePath starts with "themes/" (= when it is a theme-dependent resource). Even when for this theme a different
	 * location outside the normal library location is configured.
	 *
	 * @param {string} sLibraryName the name of a library, like "sap.ui.commons"
	 * @param {string} sResourcePath the relative path of a resource inside this library, like "img/mypic.png" or "themes/my_theme/img/mypic.png"
	 * @returns {string} the URL of the requested resource
	 *
	 * @static
	 * @public
	 * @deprecated since 1.56.0, use <code>sap.ui.require.toUrl</code> instead.
	 */
	sap.ui.resource = function(sLibraryName, sResourcePath) {
		assert(typeof sLibraryName === "string", "sLibraryName must be a string");
		assert(typeof sResourcePath === "string", "sResourcePath must be a string");

		return sap.ui.require.toUrl((String(sLibraryName).replace(/\./g, "/") + '/' + sResourcePath).replace(/^\/*/, ""));
	};

	/**
	 * Redirects access to resources that are part of the given namespace to a location
	 * relative to the assumed <b>application root folder</b>.
	 *
	 * Any UI5 managed resource (view, controller, control, JavaScript module, CSS file, etc.)
	 * whose resource name starts with <code>sNamespace</code>, will be loaded from an
	 * equally named subfolder of the <b>application root folder</b>.
	 * If the resource name consists of multiple segments (separated by a dot), each segment
	 * is assumed to represent an individual folder. In other words: when a resource name is
	 * converted to a URL, any dots ('.') are converted to slashes ('/').
	 *
	 * <b>Limitation:</b> For the time being, the <b>application root folder</b> is assumed to be
	 * the same as the folder where the current page resides in.
	 *
	 * Usage sample:
	 * <pre>
	 *   // Let UI5 know that resources, whose name starts with "com.mycompany.myapp"
	 *   // should be loaded from the URL location "./com/mycompany/myapp"
	 *   sap.ui.localResources("com.mycompany.myapp");
	 *
	 *   // The following call implicitly will use the mapping done by the previous line
	 *   // It will load a view from ./com/mycompany/myapp/views/Main.view.xml
	 *   View.create({ viewName : "com.mycompany.myapp.views.Main", type : ViewType.XML}).then(function(oView) {
	 *       // do stuff
	 *   });
	 * </pre>
	 *
	 * When applications need a more flexible mapping between resource names and their location,
	 * they can use {@link jQuery.sap.registerModulePath}.
	 *
	 * It is intended to make this configuration obsolete in future releases, but for the time
	 * being, applications must call this method when they want to store resources relative to
	 * the assumed application root folder.
	 *
	 * @param {string} sNamespace Namespace prefix for which to load resources relative to the application root folder
	 * @public
	 * @static
	 * @see jQuery.sap.registerModulePath
	 * @deprecated since 1.56, use <code>sap.ui.loader.config</code> instead.
	 */
	sap.ui.localResources = function(sNamespace) {
		assert(sNamespace, "sNamespace must not be empty");
		var mPaths = {};
		mPaths[sNamespace.replace(/\./g, "/")] = "./" + sNamespace.replace(/\./g, "/");
		sap.ui.loader.config({paths:mPaths});
	};

	return sap.ui;

});