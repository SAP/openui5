/*
 * ${copyright}
 */

// Provides base class sap.ui.core.Component for all components
sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/ui/base/Object',
	'sap/ui/thirdparty/URI',
	'sap/ui/VersionInfo',
	'sap/base/util/Version',
	'sap/base/future',
	'sap/base/Log',
	'sap/ui/dom/includeStylesheet',
	'sap/base/i18n/ResourceBundle',
	'sap/base/util/uid',
	'sap/base/util/merge',
	'sap/base/util/isPlainObject',
	'sap/base/util/LoaderExtensions',
	'sap/base/config',
	'sap/ui/core/Supportability',
	'sap/ui/core/Lib',
	'./_UrlResolver'
], function(
	Localization,
	BaseObject,
	URI,
	VersionInfo,
	Version,
	future,
	Log,
	includeStylesheet,
	ResourceBundle,
	uid,
	merge,
	isPlainObject,
	LoaderExtensions,
	BaseConfig,
	Supportability,
	Library,
	_UrlResolver
) {
	"use strict";

	/*global Promise */

	function noMultipleMajorVersionsCheck(aVersions) {
		const aSeen = [];
		aVersions.forEach((sVersion) => {
			const oVersion = Version(sVersion);
			if (aSeen.includes(oVersion.getMajor())) {
				throw new Error(`The minimal UI5 versions defined in the manifest must not include multiple versions with the same major version, Component: ${this.getComponentName()}.`);
			} else {
				aSeen.push(oVersion.getMajor());
			}
		});
	}

	/**
	 * Removes the version suffix
	 *
	 * @param {string} sVersion Version
	 * @return {string} Version without suffix
	 */
	function getVersionWithoutSuffix(vVersion) {
		let sVersion = vVersion;
		if (Array.isArray(vVersion)) {
			sVersion = vVersion.sort()[0];
			noMultipleMajorVersionsCheck.call(this, vVersion);
		}
		const oVersion = Version(sVersion);
		return oVersion.getSuffix() ? Version(oVersion.getMajor() + "." + oVersion.getMinor() + "." + oVersion.getPatch()) : oVersion;
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
				oObject = Object.hasOwn(oObject, sPathSegment) ? oObject[sPathSegment] : undefined;

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
	 * @param {object} oObject the object to deep freeze
	 * @private
	 */
	function deepFreeze(oObject) {
		if (oObject && typeof oObject === 'object' && !Object.isFrozen(oObject)) {
			Object.freeze(oObject);
			for (var sKey in oObject) {
				if (Object.hasOwn(oObject, sKey)) {
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
	 * @param {string[]}
	 *            [mOptions.activeTerminologies] (optional) A list of active terminologies. If the <code>mOptions.process</code>
	 *            flag is set to <code>true</code>, the given terminologies will be respected when replacing placeholders with resource
	 *            bundle values.
	 *            To use active terminologies, the <code>sap.app.i18n</code> section in the manifest
	 *            must be defined in object syntax as described here: {@link topic:eba8d25a31ef416ead876e091e67824e Text Verticalization}.
	 *            The order of the given active terminologies is significant. The {@link module:sap/base/i18n/ResourceBundle ResourceBundle} API
	 *            documentation describes the processing behavior in more detail.
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

			// apply the manifest related values
			this._oRawManifest = oManifest;
			this._bProcess = !(mOptions && mOptions.process === false);
			this._bAsync = !(mOptions && mOptions.async === false);
			this._activeTerminologies = mOptions && mOptions.activeTerminologies;

			// This should be only the case if manifestFirst is true but there was no manifest.json
			// As of 08.07.2021 we only set this parameter in Manifest.load in case of failing request
			this._bLoadManifestRequestFailed = mOptions && mOptions._bLoadManifestRequestFailed;

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
			this._oManifest = merge({}, this._oRawManifest);

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
		 * @param {string[]} [aI18nProperties] The array of manifest temnplate strings to replace (if processed already processed from outside this function)
		 * @return {Promise|undefined} when using the API async it will return a Promise which resolves when the texts have been replaced
		 */
		_processI18n: function(bAsync, aI18nProperties) {

			// if not given from outside (from async Component startup):
			// find all i18n property paths based on the handlebars placeholder template
			if (!aI18nProperties) {
				aI18nProperties = [];
				this._preprocess({
					i18nProperties: aI18nProperties
				});
			}

			if (aI18nProperties.length > 0) {

				var fnReplaceI18n = function(oResourceBundle) {
					var fnReplaceI18nText = function(sMatch, sI18nKey) {
						return oResourceBundle.getText(sI18nKey);
					};
					for (var i = 0, l = aI18nProperties.length; i < l; i++) {
						var oProperty = aI18nProperties[i];
						oProperty.object[oProperty.key] = oProperty.object[oProperty.key].replace(Manifest._rManifestTemplate, fnReplaceI18nText);
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
				oI18nURI,
				// a bundle url given in the "sap.app.i18n" section is by default always resolved relative to the manifest
				// when using the object syntax for the "sap.app.i18n" section a "bundleRelativeTo" property can be given to change the default
				sBaseBundleUrlRelativeTo = "manifest",
				vI18n = (oManifest["sap.app"] && oManifest["sap.app"]["i18n"]) || "i18n/i18n.properties";

			if (typeof vI18n === "string") {
				oI18nURI = new URI(vI18n);

				// load the ResourceBundle relative to the manifest
				return ResourceBundle.create({
					url: this.resolveUri(oI18nURI, sBaseBundleUrlRelativeTo),
					async: bAsync
				});

			} else if (typeof vI18n === "object") {
				// make a copy as manifest is frozen
				vI18n = JSON.parse(JSON.stringify(vI18n));
				sBaseBundleUrlRelativeTo = vI18n.bundleUrlRelativeTo || sBaseBundleUrlRelativeTo;

				// resolve bundleUrls including terminology bundles
				_UrlResolver._processResourceConfiguration(vI18n, {
					alreadyResolvedOnRoot: false,
					baseURI: this._oBaseUri,
					manifestBaseURI: this._oManifestBaseUri,
					relativeTo: sBaseBundleUrlRelativeTo
				});

				// merge activeTerminologies and settings object into mParams
				var mParams = Object.assign({
					activeTerminologies: this._activeTerminologies,
					async: bAsync
				}, vI18n);

				return ResourceBundle.create(mParams);
			}
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
		 * @param {string} sPath Either the manifest section name (namespace) or a concrete path
		 * @return {any|null} Value of the key (could be any kind of value)
		 * @public
		 */
		getEntry: function(sPath) {
			if (!sPath || sPath.indexOf(".") <= 0) {
				future.warningThrows("Manifest entries with keys without namespace prefix can not be read via getEntry. Key: " + sPath + ", Component: " + this.getComponentName());
				return null;
			}

			var oManifest = this.getJson();
			var oEntry = getObject(oManifest, sPath);

			// top-level manifest section must be an object (e.g. sap.ui5)
			if (sPath && sPath[0] !== "/" && oEntry !== undefined && !isPlainObject(oEntry)) {
				future.warningThrows("Manifest entry with key '" + sPath + "' must be an object. Component: " + this.getComponentName());
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
		checkUI5Version: async function() {
			// version check => only if minVersion is available a warning
			// will be logged and the debug mode is turned on
			// TODO: enhance version check also for libraries and components
			var vMinUI5Version = this.getEntry("/sap.ui5/dependencies/minUI5Version");
			if (vMinUI5Version &&
				Log.isLoggable(Log.Level.WARNING) &&
				Supportability.isDebugModeEnabled()) {

				const oVersionInfo = await VersionInfo.load().catch((e) => {
					Log.warning("The validation of the version for Component \"" + this.getComponentName() + "\" failed! Reason: " + e);
				});

				const oMinVersion = getVersionWithoutSuffix.call(this, vMinUI5Version);
				const oVersion = getVersionWithoutSuffix.call(this, oVersionInfo?.version);

				if (oMinVersion.compareTo(oVersion) > 0) {
				  Log.warning("Component \"" + this.getComponentName() + "\" requires at least version \"" + oMinVersion.toString() + "\" but running on \"" + oVersion.toString() + "\"!");
				}
			}
		},


		/**
				 * Loads the included CSS and JavaScript resources. The resources will be
				 * resolved relative to the component location.
				 *
				 * @return {Promise<void>|undefined} Promise for required *.js resources
				 *
				 * @private
				 */
		_loadIncludes: function() {
			var mResources = this.getEntry("/sap.ui5/resources"), oPromise;

			if (!mResources) {
				return;
			}

			var sComponentName = this.getComponentName();

			/**
			 * Load JS files.
			 * @eprecated As of version 1.94, standard dependencies should be used instead.
			 */
			if (mResources["js"]) {
				var aJSResources = mResources["js"];
				var requireAsync = function (sModule) {
					// Wrap promise within function because OPA waitFor (sap/ui/test/autowaiter/_promiseWaiter.js)
					// can't deal with a promise instance in the wrapped then handler
					return function() {
						return new Promise(function(resolve, reject) {
							sap.ui.require([sModule], resolve, reject);
						});
					};
				};

				oPromise = Promise.resolve();
				for (var i = 0; i < aJSResources.length; i++) {
					var oJSResource = aJSResources[i];
					var sFile = oJSResource.uri;
					if (sFile) {
						// load javascript file
						var m = sFile.match(/\.js$/i);
						if (m) {
							// call internal sap.ui.require variant that accepts a requireJS path and loads the module synchronously
							var sJsUrl = sComponentName.replace(/\./g, '/') + (sFile.slice(0, 1) === '/' ? '' : '/') + sFile.slice(0, m.index);
							Log.info("Component \"" + sComponentName + "\" is loading JS: \"" + sJsUrl + "\"");
							oPromise = oPromise.then(requireAsync(sJsUrl));
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

			return oPromise;
		},

		/**
		 * Removes the included CSS resources.
		 *
		 * @private
		 */
		removeIncludes: function() {
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
		},

		/**
				 * Load external dependencies (like libraries and components)
				 *
				 * @return {Promise<void>} Promise containing further promises of dependent libs and components requests
				 *
				 * @private
				 */
		_loadDependencies: function() {
			var aPromises = [];
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
							aPromises.push(Library._load(sLib, {sync: false}));
						}
					}
				}

				// collect all "non-lazy" components
				var mComponents = oDep["components"];
				var aComponentDependencies = [];
				if (mComponents) {
					for (var sName in mComponents) {
						if (!mComponents[sName].lazy) {
							aComponentDependencies.push(sName);
						}
					}
				}

				// Async loading of Component, so that Component.load is available
				var pComponentLoad = new Promise(function(fnResolve, fnReject) {
					sap.ui.require(["sap/ui/core/Component"], function(Component) {
						fnResolve(Component);
					}, fnReject);
				}).then(function(Component) {
					// trigger Component.load for all "non-lazy" component dependencies (parallel)
					return Promise.all(aComponentDependencies.map(function(sComponentName) {
						// Component.load does not load the dependencies of a dependent component in case property manifest: false
						// because this could have a negative impact on performance and we do not know if there is a necessity
						// to load the dependencies
						// If needed we could make this configurable via manifest.json by adding a 'manifestFirst' option
						return Component.load({
							name: sComponentName,
							manifest: false
						});
					}));
				});

				aPromises.push(pComponentLoad);
			}
			return Promise.all(aPromises);

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
						future.errorThrows("Resource root for \"" + sResourceRoot + "\" is absolute and therefore won't be registered! \"" + sResourceRootPath + "\"", this.getComponentName());
						continue;
					}
					sResourceRootPath = this.resolveUri(sResourceRootPath);
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
			var oRelativeToBaseUri = sRelativeTo === "manifest" ? this._oManifestBaseUri : this._oBaseUri;
			var oResultUri = _UrlResolver._resolveUri(sUri, oRelativeToBaseUri);
			return oResultUri && oResultUri.toString();
		},

		/**
		 * Generic preprocessing function.
		 * Current features:
		 *   - resolve "ui5://..." urls.
		 *   - collect "i18n placeholder properties"
		 *
		 * @param {object} args arguments map
		 * @param {boolean} [args.resolveUI5Urls] whether "ui5://..." URLs should be resolved
		 * @param {array}  [args.i18nProperties] an array into which all i18n placeholders will be pushed
		 *
		 * @private
		 * @ui5-restricted sap.ui.core.Manifest, sap.ui.core.Component
		 */
		_preprocess: function(args) {
			Manifest.processObject(this._oManifest, function(oObject, sKey, sValue) {
				if (args.resolveUI5Urls && sValue.startsWith("ui5:")) {
					oObject[sKey] = LoaderExtensions.resolveUI5Url(sValue);
				} else if (args.i18nProperties && sValue.match(Manifest._rManifestTemplate)) {
					args.i18nProperties.push({
						object: oObject,
						key: sKey
					});
				}
			});
		},

		/**
		 * Initializes the manifest which executes checks, define the resource
		 * roots, load the dependencies and the includes.
		 *
		 * @param {sap.ui.core.Component} [oInstance] Reference to the Component instance
		 * @private
		 */
		init: function(oInstance) {
			if (this._iInstanceCount === 0) {
				this.loadDependenciesAndIncludes();
			}
			this._iInstanceCount++;
		},

		/**
		 * Executes checks, define the resource roots, load the dependencies and the includes.
		 *
		 * @param {boolean} bAsync indicator whether the dependent dependencies and includes should be loaded asynchronous
		 * @return {Promise<void>} Promise containing further promises of dependent libs and includes requests
		 *
		 * @private
		 */
		loadDependenciesAndIncludes: function (bAsync) {
			if (this._pDependenciesAndIncludes) {
				return this._pDependenciesAndIncludes;
			}
			// version check => only if minVersion is available a warning
			// will be logged and the debug mode is turned on
			const pCheckUI5Version = this.checkUI5Version();

			// define the resource roots
			// => if not loaded via manifest first approach the resource roots
			//    will be registered too late for the AMD modules of the Component
			//    controller. This is a constraint for the resource roots config
			//    in the manifest!
			this.defineResourceRoots();

			// resolve "ui5://..." URLs after the resource-rooots have been defined
			// this way all ui5 URLs can rely on any resource root definition
			this._preprocess({
				resolveUI5Urls: true
			});

			this._pDependenciesAndIncludes = Promise.all([
				this._loadDependencies(bAsync), // load the component dependencies (other UI5 libraries)
				this._loadIncludes(bAsync), // load the custom scripts and CSS files
				pCheckUI5Version
			]);

			return this._pDependenciesAndIncludes;
		},

		/**
		 * Terminates the manifest and does some final clean-up.
		 *
		 * @param {sap.ui.core.Component} [oInstance] Reference to the Component instance
		 * @private
		 */
		exit: function(oInstance) {

			// ensure that the instance count is never negative
			var iInstanceCount = Math.max(this._iInstanceCount - 1, 0);

			if (iInstanceCount === 0) {
				// remove the custom scripts and CSS files
				this.removeIncludes();

				delete this._pDependenciesAndIncludes;
			}

			this._iInstanceCount = iInstanceCount;

		}

	});

	// Manifest Template RegExp: {{foo}}
	Manifest._rManifestTemplate = /\{\{([^\}\}]+)\}\}/g;

	/**
	 * Function to load the manifest by URL
	 *
	 * @param {object} mOptions the configuration options
	 * @param {string} mOptions.manifestUrl URL of the manifest
	 * @param {string} [mOptions.componentName] name of the component
	 * @param {boolean} [mOptions.async=false] Flag whether to load the manifest async or not
	 * @param {boolean} [mOptions.failOnError=true] Flag whether to fail if an error occurs or not
	 * If set to <code>false</code>, errors during the loading of the manifest.json file (e.g. 404) will be ignored and
	 * the resulting manifest object will be <code>null</code>.
	 * For asynchronous calls the returned Promise will not reject but resolve with <code>null</code>.
	 * @param {function} [mOptions.processJson] Callback for asynchronous processing of the loaded manifest.
	 * The callback receives the parsed manifest object and must return a Promise which resolves with an object.
	 * It allows to early access and modify the manifest object.
	 * @param {string[]} [mOptions.activeTerminologies] A list of active terminologies.
	 * The order of the given active terminologies is significant. The {@link module:sap/base/i18n/ResourceBundle ResourceBundle} API
	 * documentation describes the processing behavior in more detail.
	 * Please have a look at this dev-guide chapter for general usage instructions: {@link topic:eba8d25a31ef416ead876e091e67824e Text Verticalization}.
	 * @return {sap.ui.core.Manifest|Promise<sap.ui.core.Manifest>} Manifest object or for asynchronous calls an ECMA Script 6 Promise object will be returned.
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
		if (!oManifestUrl.hasQuery("sap-language")) {
			var sValue = Localization.getSAPLogonLanguage();
			if (sValue) {
				oManifestUrl.addQuery("sap-language", sValue);
			}
		}
		if (!oManifestUrl.hasQuery("sap-client")) {
			var sValue = BaseConfig.get({name: "sapClient", type:BaseConfig.Type.String, external: true});
			if (sValue) {
				oManifestUrl.addQuery("sap-client", sValue);
			}
		}
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
				"Accept-Language": Localization.getLanguageTag().toString()
			},
			failOnError: typeof bFailOnError !== "undefined" ? bFailOnError : true
		});

		var mSettings = {
			componentName: sComponentName,
			url: sManifestUrl,
			process: false
		};

		if (mOptions.activeTerminologies) {
			mSettings["activeTerminologies"] = mOptions.activeTerminologies;
		}

		if (bAsync) {
			return oManifestJSON.then(function(oManifestJSON) {
				// callback for preprocessing the json, e.g. via flex-hook in Component
				if (fnProcessJson && oManifestJSON) {
					return fnProcessJson(oManifestJSON);
				} else {
					return oManifestJSON;
				}
			}).then(function(oManifestJSON) {
				if (!oManifestJSON) {
					// Loading manifest.json was not successful e.g. because there is no manifest.json
					// This should be only the case if manifestFirst is true but there was
					// no manifest.json
					mSettings._bLoadManifestRequestFailed = true;
				}
				return new Manifest(oManifestJSON, mSettings);
			});
		}
		return new Manifest(oManifestJSON, mSettings);
	};

	/**
	 * Utility function to process strings in an object/array recursively
	 *
	 * @param {object/Array} oObject Object or array that will be processed
	 * @param {function} fnCallback function(oObject, sKey, sValue) to call for all strings. Use "oObject[sKey] = X" to change the value.
	 */
	Manifest.processObject = function (oObject, fnCallback) {
		for (var sKey in oObject) {
			if (!Object.hasOwn(oObject, sKey)) {
				continue;
			}
			var vValue = oObject[sKey];
			switch (typeof vValue) {
				case "object":
					// ignore null objects
					if (vValue) {
						Manifest.processObject(vValue, fnCallback);
					}
					break;
				case "string":
					fnCallback(oObject, sKey, vValue);
					break;
				default:
				// do nothing in case of other types
			}
		}
	};

	return Manifest;

});
