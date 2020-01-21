/*
 * ${copyright}
 */

// Provides base class sap.ui.core.Component for all components
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/base/Object',
	'sap/ui/thirdparty/URI',
	'sap/base/util/Version',
	'sap/base/Log',
	'sap/ui/dom/includeStylesheet',
	'sap/base/i18n/ResourceBundle',
	'sap/base/util/uid',
	'sap/base/util/isPlainObject',
	'sap/base/util/LoaderExtensions',
	"sap/base/util/isEmptyObject"
],
	function(
		jQuery,
		BaseObject,
		URI,
		Version,
		Log,
		includeStylesheet,
		ResourceBundle,
		uid,
		isPlainObject,
		LoaderExtensions,
		isEmptyObject
	) {
	"use strict";

	/*global Promise */

	// Manifest Template RegExp: {{foo}}
	var rManifestTemplate = /\{\{([^\}\}]+)\}\}/g;

	/**
	 * Removes the version suffix
	 *
	 * @param {string} sVersion Version
	 * @return {string} Version without suffix
	 */
	function getVersionWithoutSuffix(sVersion) {
		var oVersion = Version(sVersion);
		return oVersion.getSuffix() ? Version(oVersion.getMajor() + "." + oVersion.getMinor() + "." + oVersion.getPatch()) : oVersion;
	}

	/**
	 * Utility function to process strings in an object/array recursively
	 *
	 * @param {object/Array} oObject Object or array that will be processed
	 * @param {function} fnCallback function(oObject, sKey, sValue) to call for all strings. Use "oObject[sKey] = X" to change the value.
	 */
	function processObject(oObject, fnCallback) {
		for (var sKey in oObject) {
			if (!oObject.hasOwnProperty(sKey)) {
				continue;
			}
			var vValue = oObject[sKey];
			switch (typeof vValue) {
				case "object":
					// ignore null objects
					if (vValue) {
						processObject(vValue, fnCallback);
					}
					break;
				case "string":
						fnCallback(oObject, sKey, vValue);
						break;
				default:
					// do nothing in case of other types
			}
		}
	}

	/**
	 * Utility function to access a child member by a given path
	 *
	 * @param {object} oObject Object
	 * @param {string} sPath Path starting with a slash (/)
	 * @return {any} value of a member specified by its path;
	 *         if the path doesn't start with a slash it returns the value for the given path of the object
	 */
	function getObject(oObject, sPath) {
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
	 * Freezes the object and nested objects to avoid later manipulation
	 *
	 * @param oObject the object to deep freeze
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
	 * Creates and initializes a manifest wrapper which provides API access to
	 * the content of the manifest.
	 *
	 * @param {object}
	 *            oManifest the manifest object
	 * @param {object}
	 *            [mOptions] (optional) the configuration options
	 * @param {string}
	 *            [mOptions.componentName] (optional) the name of the component
	 * @param {string}
	 *            [mOptions.baseUrl] (optional) the base URL which is used to resolve relative URLs against
	 * @param {boolean}
	 *            [mOptions.process=true] (optional) Flag whether the manifest object should be processed or not
	 *            which means that the placeholders will be replaced with resource bundle values
	 *
	 *
	 * @public
	 *
	 * @class The Manifest class.
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.Manifest
	 * @since 1.33.0
	 */
	var Manifest = BaseObject.extend("sap.ui.core.Manifest", /** @lends sap.ui.core.Manifest.prototype */

	{

		constructor : function(oManifest, mOptions) {

			BaseObject.apply(this, arguments);

			// create a unique id per manifest
			this._uid = uid();

			// instance variables
			this._iInstanceCount = 0;
			this._bIncludesLoaded = false;

			// apply the manifest related values
			this._oRawManifest = oManifest;
			this._bProcess = !(mOptions && mOptions.process === false);
			this._bAsync = !(mOptions && mOptions.async === false);

			// component name is passed via options (overrides the one defined in manifest)
			this._sComponentName = mOptions && mOptions.componentName;

			// resolve the base URL of the component depending of given base
			// URL or the module path of the component
			var sComponentName = this.getComponentName(),
				sBaseUrl = mOptions && mOptions.baseUrl || sComponentName && sap.ui.require.toUrl(sComponentName.replace(/\./g, "/")) + "/";
			if (sBaseUrl) {
				this._oBaseUri = new URI(sBaseUrl).absoluteTo(new URI(document.baseURI).search(""));
			}

			// determine the base URL of the manifest or use the component base
			// as by default the manifest is next to the component controller
			if (mOptions && typeof mOptions.url === "string") {
				this._oManifestBaseUri = new URI(mOptions.url).absoluteTo(new URI(document.baseURI).search("")).search("");
			} else {
				this._oManifestBaseUri = this._oBaseUri;
			}

			// make sure to freeze the raw manifest (avoid manipulations)
			deepFreeze(this._oRawManifest);

			// store the raw manifest for the time being and process the
			// i18n placeholders in the manifest later
			// remark: clone the frozen raw manifest to enable changes
			this._oManifest = jQuery.extend(true, {}, this._oRawManifest);

			// resolve the i18n texts immediately when manifest should be processed
			if (this._bProcess) {
				this._processI18n();
			}

		},

		/**
		 * Triggers the processing of the i18n texts to replace them
		 * with the values from "sap.app/i18n"
		 *
		 * @param {boolean} bAsync true, if the ResourceBundle will be loaded async
		 * @return {Promise|undefined} when using the API async it will return a Promise which resolves when the texts have been replaced
		 */
		_processI18n: function(bAsync) {

			// find i18n property paths in the manifest if i18n texts in
			// the manifest which should be processed
			var aI18nProperties = [];
			processObject(this._oManifest, function(oObject, sKey, vValue) {
				var match = vValue.match(rManifestTemplate);
				if (match) {
					aI18nProperties.push({
						object: oObject,
						key: sKey
					});
				}
			});

			if (aI18nProperties.length > 0) {

				var fnReplaceI18n = function(oResourceBundle) {
					var fnReplaceI18nText = function(sMatch, sI18nKey) {
						return oResourceBundle.getText(sI18nKey);
					};
					for (var i = 0, l = aI18nProperties.length; i < l; i++) {
						var oProperty = aI18nProperties[i];
						oProperty.object[oProperty.key] = oProperty.object[oProperty.key].replace(rManifestTemplate, fnReplaceI18nText);
					}
				};

				if (bAsync) {
					return this._loadI18n(bAsync).then(fnReplaceI18n);
				} else {
					fnReplaceI18n(this._loadI18n(bAsync));
				}

			} else {
				return bAsync ? Promise.resolve() : undefined;
			}

		},

		/**
		 * Loads the ResourceBundle which is defined in the manifest
		 * in "sap.app/i18n".
		 *
		 * @param {boolean} bAsync flag, whether to load the ResourceBundle async or not
		 * @return {Promise|ResourceBundle} Promise which resolves with the ResourceBundle (async) or the ResourceBundle itself (sync)
		 * @private
		 */
		_loadI18n: function(bAsync) {

			// extract the i18n URI from the manifest
			var oManifest = this._oRawManifest,
				sI18n = (oManifest["sap.app"] && oManifest["sap.app"]["i18n"]) || "i18n/i18n.properties",
				oI18nURI = new URI(sI18n);

			// load the ResourceBundle relative to the manifest
			return ResourceBundle.create({
				url: this._resolveUri(oI18nURI, "manifest").toString(),
				async: bAsync
			});

		},


		/**
		 * Returns the manifest defined in the metadata of the component.
		 * If not specified, the return value is null.
		 *
		 * @return {Object} manifest.
		 * @public
		 */
		getJson: function() {
			return this._oManifest;
		},


		/**
		 * Returns the raw manifest defined in the metadata of the component.
		 * If not specified, the return value is null.
		 *
		 * @return {Object} manifest
		 * @public
		 */
		getRawJson: function() {
			return this._oRawManifest;
		},


		/**
		 * Returns the configuration of a manifest section or the value for a
		 * specific path. If no key is specified, the return value is null.
		 *
		 * Example:
		 * <code>
		 *   {
		 *     "sap.ui5": {
		 *       "dependencies": {
		 *         "libs": {
		 *           "sap.m": {}
		 *         },
		 *         "components": {
		 *           "my.component.a": {}
		 *         }
		 *       }
		 *   });
		 * </code>
		 *
		 * The configuration above can be accessed in the following ways:
		 * <ul>
		 * <li><b>By section/namespace</b>: <code>oManifest.getEntry("sap.ui5")</code></li>
		 * <li><b>By path</b>: <code>oManifest.getEntry("/sap.ui5/dependencies/libs")</code></li>
		 * </ul>
		 *
		 * By section/namespace returns the configuration for the specified manifest
		 * section and by path allows to specify a concrete path to a dedicated entry
		 * inside the manifest. The path syntax always starts with a slash (/).
		 *
		 * @param {string} sKey Either the manifest section name (namespace) or a concrete path
		 * @return {any|null} Value of the key (could be any kind of value)
		 * @public
		 */
		getEntry: function(sPath) {
			if (!sPath || sPath.indexOf(".") <= 0) {
				Log.warning("Manifest entries with keys without namespace prefix can not be read via getEntry. Key: " + sPath + ", Component: " + this.getComponentName());
				return null;
			}

			var oManifest = this.getJson();
			var oEntry = getObject(oManifest, sPath);

			// top-level manifest section must be an object (e.g. sap.ui5)
			if (sPath && sPath[0] !== "/" && !isPlainObject(oEntry)) {
				Log.warning("Manifest entry with key '" + sPath + "' must be an object. Component: " + this.getComponentName());
				return null;
			}

			return oEntry;
		},

		/**
		 * Validates the current UI5 version with the minimal version defined in the
		 * manifest. If the minimal version is greater than the current version an
		 * issue will be reported in the console if open.
		 *
		 * @private
		 */
		checkUI5Version: function() {

			// version check => only if minVersion is available a warning
			// will be logged and the debug mode is turned on
			// TODO: enhance version check also for libraries and components
			var sMinUI5Version = this.getEntry("/sap.ui5/dependencies/minUI5Version");
			if (sMinUI5Version &&
				Log.isLoggable(Log.Level.WARNING) &&
				sap.ui.getCore().getConfiguration().getDebug()) {
				sap.ui.getVersionInfo({async: true}).then(function(oVersionInfo) {
					var oMinVersion = getVersionWithoutSuffix(sMinUI5Version);
					var oVersion = getVersionWithoutSuffix(oVersionInfo && oVersionInfo.version);
					if (oMinVersion.compareTo(oVersion) > 0) {
						Log.warning("Component \"" + this.getComponentName() + "\" requires at least version \"" + oMinVersion.toString() + "\" but running on \"" + oVersion.toString() + "\"!");
					}
				}.bind(this), function(e) {
					Log.warning("The validation of the version for Component \"" + this.getComponentName() + "\" failed! Reasion: " + e);
				}.bind(this));
			}

		},


		/**
		 * Loads the included CSS and JavaScript resources. The resources will be
		 * resolved relative to the component location.
		 *
		 * @private
		 */
		loadIncludes: function() {

			// skip loading includes once already loaded
			if (this._bIncludesLoaded) {
				return;
			}

			var mResources = this.getEntry("/sap.ui5/resources");

			if (!mResources) {
				return;
			}

			var sComponentName = this.getComponentName();

			// load JS files
			var aJSResources = mResources["js"];
			if (aJSResources) {
				for (var i = 0; i < aJSResources.length; i++) {
					var oJSResource = aJSResources[i];
					var sFile = oJSResource.uri;
					if (sFile) {
						// load javascript file
						var m = sFile.match(/\.js$/i);
						if (m) {
							//var sJsUrl = this.resolveUri(sFile.slice(0, m.index));
							var sJsUrl = sComponentName.replace(/\./g, '/') + (sFile.slice(0, 1) === '/' ? '' : '/') + sFile.slice(0, m.index);
							Log.info("Component \"" + sComponentName + "\" is loading JS: \"" + sJsUrl + "\"");
							// call internal sap.ui.require variant that accepts a requireJS path and loads the module synchronously
							sap.ui.requireSync(sJsUrl);
						}
					}
				}
			}

			// include CSS files
			var aCSSResources = mResources["css"];
			if (aCSSResources) {
				for (var j = 0; j < aCSSResources.length; j++) {
					var oCSSResource = aCSSResources[j];
					if (oCSSResource.uri) {
						var sCssUrl = this.resolveUri(oCSSResource.uri);
						Log.info("Component \"" + sComponentName + "\" is loading CSS: \"" + sCssUrl + "\"");
						includeStylesheet(sCssUrl, {
							id: oCSSResource.id,
							"data-sap-ui-manifest-uid": this._uid
						});
					}
				}
			}

			this._bIncludesLoaded = true;

		},

		/**
		 * Removes the included CSS resources.
		 *
		 * @private
		 */
		removeIncludes: function() {

			// skip removing includes when not loaded yet
			if (!this._bIncludesLoaded) {
				return;
			}

			var mResources = this.getEntry("/sap.ui5/resources");

			if (!mResources) {
				return;
			}

			var sComponentName = this.getComponentName();

			// remove CSS files
			var aCSSResources = mResources["css"];
			if (aCSSResources) {
				// As all <link> tags have been marked with the manifest's unique id (via data-sap-ui-manifest-uid)
				// it is not needed to check for all individual CSS files defined in the manifest.
				// Checking for all "href"s again might also cause issues when they have been adopted (e.g. to add cachebuster url params).

				var aLinks = document.querySelectorAll("link[data-sap-ui-manifest-uid='" + this._uid + "']");
				for (var i = 0; i < aLinks.length; i++) {
					var oLink = aLinks[i];
					Log.info("Component \"" + sComponentName + "\" is removing CSS: \"" + oLink.href + "\"");
					oLink.parentNode.removeChild(oLink);
				}
			}

			this._bIncludesLoaded = false;

		},

		/**
		 * Load external dependencies (like libraries and components)
		 *
		 * @private
		 */
		loadDependencies: function() {

			// afterwards we load our dependencies!
			var oDep = this.getEntry("/sap.ui5/dependencies"),
				sComponentName = this.getComponentName();

			if (oDep) {

				// load the libraries
				var mLibraries = oDep["libs"];
				if (mLibraries) {
					for (var sLib in mLibraries) {
						if (!mLibraries[sLib].lazy) {
							Log.info("Component \"" + sComponentName + "\" is loading library: \"" + sLib + "\"");
							sap.ui.getCore().loadLibrary(sLib);
						}
					}
				}

				// load the components
				var mComponents = oDep["components"];
				if (mComponents) {
					for (var sName in mComponents) {
						if (!mComponents[sName].lazy) {
							// TODO: refactor component/library loading code within Manifest / Component
							// Only load component if not (pre-)loaded already
							// Usually the dependencies are already loaded beforehand within Component.create
							var sControllerModule = sName.replace(/\./g, "/") + "/Component";
							var iModuleState = sap.ui.loader._.getModuleState(sControllerModule + ".js");
							if (iModuleState === -1 /* PRELOADED */) {
								// Execute preloaded component controller module
								sap.ui.requireSync(sControllerModule);
							} else if (iModuleState === 0 /* INITIAL */) {
								Log.info("Component \"" + sComponentName + "\" is loading component: \"" + sName + ".Component\"");
								// This can't be migrated to "Component.load" as the contract is sync
								sap.ui.requireSync("sap/ui/core/Component");
								sap.ui.component.load({
									name: sName
								});
							}
						}
					}
				}

			}

		},

		/**
		 * Define the resource roots configured in the manifest.
		 * <p>
		 * In case of usage of "Manifest First" for Component loading the
		 * registration of the resource roots will be already done before loading
		 * the Component controller and thus can be used for the dependencies being
		 * declared within the sap.ui.define.
		 *
		 * @private
		 */
		defineResourceRoots: function() {
			var mResourceRoots = this.getEntry("/sap.ui5/resourceRoots");

			if (mResourceRoots) {
				for (var sResourceRoot in mResourceRoots) {
					var sResourceRootPath = mResourceRoots[sResourceRoot];
					var oResourceRootURI = new URI(sResourceRootPath);
					if (oResourceRootURI.is("absolute") || (oResourceRootURI.path() && oResourceRootURI.path()[0] === "/")) {
						Log.error("Resource root for \"" + sResourceRoot + "\" is absolute and therefore won't be registered! \"" + sResourceRootPath + "\"", this.getComponentName());
						continue;
					}
					sResourceRootPath = this._resolveUri(oResourceRootURI).toString();
					var mPaths = {};
					mPaths[sResourceRoot.replace(/\./g, "/")] = sResourceRootPath;
					sap.ui.loader.config({paths:mPaths});
				}
			}

		},


		/**
		 * Returns the Component name which is defined in the manifest as
		 * <code>sap.ui5/componentName</code> or <code>sap.app/id</code>
		 *
		 * @return {string} the component name
		 * @public
		 */
		getComponentName: function() {
			var oRawJson = this.getRawJson();
			return this._sComponentName || getObject(oRawJson, "/sap.ui5/componentName") || getObject(oRawJson, "/sap.app/id");
		},


		/**
		 * Resolves the given URI relative to the Component by default
		 * or optional relative to the manifest when passing 'manifest'
		 * as second parameter.
		 *
		 * @param {string} sUri URI to resolve as string
		 * @param {string} [sRelativeTo='component'] defines to which base URI the given URI will be resolved to; one of ‘component' (default) or 'manifest'
		 * @return {string} resolved URI as string
		 * @public
		 * @since 1.60.1
		 */
		resolveUri: function(sUri, sRelativeTo) {
			var oUri = this._resolveUri(new URI(sUri), sRelativeTo);
			return oUri && oUri.toString();
		},


		/**
		 * Resolves the given URI relative to the Component by default
		 * or optional relative to the manifest when passing 'manifest'
		 * as second parameter.
		 *
		 * @param {URI} oUri URI to resolve
		 * @param {string} [sRelativeTo] defines to which base URI the given URI will be resolved to; one of ‘component' (default) or 'manifest'
		 * @return {URI} resolved URI
		 * @private
		 */
		_resolveUri: function(oUri, sRelativeTo) {
			return Manifest._resolveUriRelativeTo(oUri, sRelativeTo === "manifest" ? this._oManifestBaseUri : this._oBaseUri);
		},


		/**
		 * Initializes the manifest which executes checks, define the resource
		 * roots, load the dependencies and the includes.
		 * @private
		 */
		init: function(oInstance) {

			if (this._iInstanceCount === 0) {

				// version check => only if minVersion is available a warning
				// will be logged and the debug mode is turned on
				this.checkUI5Version();

				// define the resource roots
				// => if not loaded via manifest first approach the resource roots
				//    will be registered too late for the AMD modules of the Component
				//    controller. This is a constraint for the resource roots config
				//    in the manifest!
				this.defineResourceRoots();

				// load the component dependencies (other UI5 libraries)
				this.loadDependencies();

				// load the custom scripts and CSS files
				this.loadIncludes();

				// activate the static customizing
				this.activateCustomizing();

			}

			// activate the instance customizing
			if (oInstance) {
				this.activateCustomizing(oInstance);
			}

			this._iInstanceCount++;

		},

		/**
		 * Terminates the manifest and does some final clean-up.
		 * @private
		 */
		exit: function(oInstance) {

			// ensure that the instance count is never negative
			var iInstanceCount = Math.max(this._iInstanceCount - 1, 0);

			// deactivate the instance customizing
			if (oInstance) {
				this.deactivateCustomizing(oInstance);
			}

			if (iInstanceCount === 0) {

				// deactivcate the customizing
				this.deactivateCustomizing();

				// remove the custom scripts and CSS files
				this.removeIncludes();

			}

			this._iInstanceCount = iInstanceCount;

		},

		/**
		 * Activates the customizing for the component or a dedicated component
		 * instance when providing the component instance as parameter.
		 * @param {sap.ui.core.Component} [oInstance] Reference to the Component instance
		 * @private
		 */
		activateCustomizing: function(oInstance) {
			// activate the customizing configuration
			var oUI5Manifest = this.getEntry("sap.ui5", true),
				mExtensions = oUI5Manifest && oUI5Manifest["extends"] && oUI5Manifest["extends"].extensions;
			if (!isEmptyObject(mExtensions)) {
				var CustomizingConfiguration = sap.ui.requireSync('sap/ui/core/CustomizingConfiguration');
				if (!oInstance) {
					CustomizingConfiguration.activateForComponent(this.getComponentName());
				} else {
					CustomizingConfiguration.activateForComponentInstance(oInstance);
				}
			}
		},

		/**
		 * Deactivates the customizing for the component or a dedicated component
		 * instance when providing the component instance as parameter.
		 * @param {sap.ui.core.Component} [oInstance] Reference to the Component instance
		 * @private
		 */
		deactivateCustomizing: function(oInstance) {
			// deactivate the customizing configuration
			var CustomizingConfiguration = sap.ui.require('sap/ui/core/CustomizingConfiguration');
			if (CustomizingConfiguration) {
				if (!oInstance) {
					CustomizingConfiguration.deactivateForComponent(this.getComponentName());
				} else {
					CustomizingConfiguration.deactivateForComponentInstance(oInstance);
				}
			}
		}

	});


	/**
	 * Resolves the given URI relative to the given base URI.
	 *
	 * @param {URI} oUri URI to resolve
	 * @param {URI} oBase Base URI
	 * @return {URI} resolved URI
	 * @static
	 * @private
	 */
	Manifest._resolveUriRelativeTo = function(oUri, oBase) {
		if (oUri.is("absolute") || (oUri.path() && oUri.path()[0] === "/")) {
			return oUri;
		}
		var oPageBase = new URI(document.baseURI).search("");
		oBase = oBase.absoluteTo(oPageBase);
		return oUri.absoluteTo(oBase).relativeTo(oPageBase);
	};


	/**
	 * Function to load the manifest by URL
	 *
	 * @param {object} mOptions the configuration options
	 * @param {string} mOptions.manifestUrl URL of the manifest
	 * @param {string} [mOptions.componentName] name of the component
	 * @param {boolean} [mOptions.async] Flag whether to load the manifest async or not (defaults to false)
	 * @param {boolean} [mOptions.failOnError] Flag whether to fail if an error occurs or not (defaults to true).
	 * If set to <code>false</code>, errors during the loading of the manifest.json file (e.g. 404) will be ignored and
	 * the resulting manifest object will be <code>null</code>.
	 * For asynchronous calls the returned Promise will not reject but resolve with <code>null</code>.
	 * @param {function} [mOptions.processJson] Callback for asynchronous processing of the loaded manifest.
	 * The callback receives the parsed manifest object and must return a Promise which resolves with an object.
	 * It allows to early access and modify the manifest object.
	 * @return {sap.ui.core.Manifest|Promise} Manifest object or for asynchronous calls an ECMA Script 6 Promise object will be returned.
	 * @protected
	 */
	Manifest.load = function(mOptions) {
		var sManifestUrl = mOptions && mOptions.manifestUrl,
			sComponentName = mOptions && mOptions.componentName,
			bAsync = mOptions && mOptions.async,
			bFailOnError = mOptions && mOptions.failOnError,
			fnProcessJson = mOptions && mOptions.processJson;

		// When loading the manifest via URL the language and client should be
		// added as query parameter as it may contain language dependent texts
		// or needs to be loaded from a specific client.
		// If the language or the client is already provided it won't be overridden
		// as this is expected to be only done by intension.
		var oManifestUrl = new URI(sManifestUrl);
		["sap-language", "sap-client"].forEach(function(sName) {
			if (!oManifestUrl.hasQuery(sName)) {
				var sValue = sap.ui.getCore().getConfiguration().getSAPParam(sName);
				if (sValue) {
					oManifestUrl.addQuery(sName, sValue);
				}
			}
		});
		sManifestUrl = oManifestUrl.toString();

		Log.info("Loading manifest via URL: " + sManifestUrl);
		if (!bAsync) {
			Log.warning("Synchronous loading of manifest, due to Manifest.load() call for '" + sManifestUrl + "'. Use parameter 'async' true to avoid this.", "SyncXHR", null, function() {
				return {
					type: "SyncXHR",
					name: "Manifest"
				};
			});
		}
		var oManifestJSON = LoaderExtensions.loadResource({
			url: sManifestUrl,
			dataType: "json",
			async: typeof bAsync !== "undefined" ? bAsync : false,
			headers: {
				"Accept-Language": sap.ui.getCore().getConfiguration().getLanguageTag()
			},
			failOnError: typeof bFailOnError !== "undefined" ? bFailOnError : true
		});

		var mSettings = {
			componentName: sComponentName,
			url: sManifestUrl,
			process: false
		};

		if (bAsync) {
			return oManifestJSON.then(function(oManifestJSON) {
				// callback for preprocessing the json, e.g. via flex-hook in Component
				if (fnProcessJson) {
					return fnProcessJson(oManifestJSON);
				} else {
					return oManifestJSON;
				}
			}).then(function(oManifestJSON) {
				return new Manifest(oManifestJSON, mSettings);
			});
		}
		return new Manifest(oManifestJSON, mSettings);
	};

	return Manifest;

});