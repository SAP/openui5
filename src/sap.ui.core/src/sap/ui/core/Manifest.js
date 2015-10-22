/*
 * ${copyright}
 */

// Provides base class sap.ui.core.Component for all components
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/thirdparty/URI', 'jquery.sap.resources'],
	function(jQuery, BaseObject, URI /*, jQuery2 */) {
	"use strict";

	/*global Promise */

	// Manifest Template RegExp: {{foo}}
	var rManifestTemplate = /\{\{([^\}\}]+)\}\}/g;

	/**
	 * Removes the version suffix
	 * 
	 * @param {string} sVersion the version 
	 * @return {string} the version without suffix
	 */
	function getVersionWithoutSuffix(sVersion) {
		var oVersion = jQuery.sap.Version(sVersion);
		return oVersion.getSuffix() ? jQuery.sap.Version(oVersion.getMajor() + "." + oVersion.getMinor() + "." + oVersion.getPatch()) : oVersion;
	}

	/**
	 * Util function to process strings in an object/array recursively
	 *
	 * @param {object/Array} oObject object/array to process
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
	 * Util function to access a child member by a given path
	 * 
	 * @param {object} the object
	 * @param {string} the path starting with a slash
	 * @return {any|null} returns the value of a member specified by its path; 
	 *         if the path doesn't start with a slash we return the value for the given path of teh object
	 */
	function getObject(oObject, sPath) {
		// if the incoming sPath is a path we do a nested lookup in the 
		// manifest object and return the concrete value, e.g. "/sap.ui5/extends"
		if (sPath && typeof sPath === "string" && sPath.substring(0, 1) === "/") {
			var aPaths = sPath.substring(1).split("/");
			for (var i = 0, l = aPaths.length; i < l; i++) {
				oObject = oObject[aPaths[i]] || null;
				if (!oObject) {
					break;
				}
			}
			return oObject;
		}

		// if no path starting with slash is specified we access and 
		// return the value directly from the manifest
		return oObject[sPath];
	}


	/**
	 * Freezes the object and nested objects to avoid later manipulation
	 * 
	 * @param oObject the object to deep freeze
	 */
	function deepFreeze(oObject) {
		var oInnerObject, sKey;
		Object.freeze(oObject);
		for (sKey in oObject) {
			oInnerObject = oObject[sKey];
			if (!oObject.hasOwnProperty(sKey) || !(typeof oInnerObject === 'object') || Object.isFrozen(oInnerObject)) {
				continue;
			}
			deepFreeze(oInnerObject);
		}
	}


	/**
	 * Creates and initializes a manifest wrapper which provides API access to
	 * the content of the manifest.
	 *
	 * @param {object}
	 *            oManifest the manifest object
	 * @param {boolean}
	 *            [bProcess=true] (optional) flag whether the manifest object should be processed or not
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

		constructor : function(oManifest, bProcess) {

			BaseObject.apply(this, arguments);

			this._oRawManifest = oManifest;
			this._bProcess = !(bProcess === false);

			// make sure to freeze the raw manifest (avoid manipulations)
			deepFreeze(this._oRawManifest);

			// placeholder for the processed manifest (i18n translation)
			// or directly set the reference to the raw manifest if it should
			// not be processed
			this._oManifest = this._bProcess ? null : this._oRawManifest;

		},


		/**
		 * Replaces template placeholder in manifest with values from
		 * ResourceBundle referenced in manifest "sap.app/i18n".
		 *
		 * @private
		 */
		_processEntries: function(oManifest) {

			var that = this;

			// read out i18n URI, defaults to i18n/i18n.properties
			var sComponentRelativeI18nUri = (oManifest["sap.app"] && oManifest["sap.app"]["i18n"]) || "i18n/i18n.properties";

			var oResourceBundle;

			processObject(oManifest, function(oObject, sKey, vValue) {
				oObject[sKey] = vValue.replace(rManifestTemplate, function(sMatch, s1) {
					// only create a resource bundle if there is something to replace
					if (!oResourceBundle) {
						oResourceBundle = jQuery.sap.resources({
							url: Manifest._resolveUri(new URI(sComponentRelativeI18nUri), that.getComponentName()).toString()
						});
					}
					return oResourceBundle.getText(s1);
				});
			});

			return oManifest;

		},


		/**
		 * Returns the manifest defined in the metadata of the component.
		 * If not specified, the return value is null.
		 *
		 * @return {Object} manifest.
		 * @public
		 */
		getJson: function() {
			// check if the manifest was already processed 
			// since the processing is done lazy (performance!)
			if (!this._oManifest) {
				// clone the frozen raw manifest to enable changes
				// process manifest and set it as private property
				this._oManifest = this._processEntries(jQuery.extend(true, {}, this._oRawManifest));
			}
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
		 * inside the manifest. The path syntax always starts with a "/".
		 *
		 * @param {string} sKey either the manifest section name (namespace) or a concrete path
		 * @return {any|null} the value of the key (could be any kind of value)
		 * @public
		 */
		getEntry: function(sPath) {
			var oManifest = this.getJson();
			return getObject(oManifest, sPath);
		},

		/**
		 * Validates the current UI5 version with the min version defined in the
		 * manifest. If the min version is greater than the current version an
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
				jQuery.sap.log.isLoggable(jQuery.sap.log.LogLevel.WARNING) && 
				sap.ui.getCore().getConfiguration().getDebug()) {
				sap.ui.getVersionInfo({async: true}).then(function(oVersionInfo) {
					var oMinVersion = getVersionWithoutSuffix(sMinUI5Version);
					var oVersion = getVersionWithoutSuffix(oVersionInfo && oVersionInfo.version);
					if (oMinVersion.compareTo(oVersion) > 0) {
						jQuery.sap.log.warning("Component \"" + this.getComponentName() + "\" requires at least version \"" + oMinVersion.toString() + "\" but running on \"" + oVersion.toString() + "\"!");
					}
				}.bind(this), function(e) {
					jQuery.sap.log.warning("The validation of the version for Component \"" + this.getComponentName() + "\" failed! Reasion: " + e);
				}.bind(this));
			}

		},

		/**
		 * Loads the included CSS and JavaScript resources. The resources will be
		 * resoloved relative to the component location.
		 *
		 * @private
		 */
		loadIncludes: function() {

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
							// prepend lib name to path, remove extension
							var sPath = sComponentName.replace(/\./g, '/') + (sFile.slice(0, 1) === '/' ? '' : '/') + sFile.slice(0, m.index);
							jQuery.sap.log.info("Component \"" + sComponentName + "\" is loading JS: \"" + sPath + "\"");
							// call internal require variant that accepts a requireJS path
							jQuery.sap._requirePath(sPath);
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
						var sCssUrl = Manifest._resolveUri(new URI(oCSSResource.uri), sComponentName).toString();
						jQuery.sap.log.info("Component \"" + sComponentName + "\" is loading CSS: \"" + sCssUrl + "\"");
						jQuery.sap.includeStyleSheet(sCssUrl, oCSSResource.id);
					}
				}
			}

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
						jQuery.sap.log.info("Component \"" + sComponentName + "\" is loading library: \"" + sLib + "\"");
						sap.ui.getCore().loadLibrary(sLib);
					}
				}

				// load the components
				var mComponents = oDep["components"];
				if (mComponents) {
					for (var sName in mComponents) {
						jQuery.sap.log.info("Component \"" + sComponentName + "\" is loading component: \"" + sName + ".Component\"");
						sap.ui.component.load({
							name: sName
						});
					}
				}

			}

		},

		/**
		 * Define the resource roots configured in the manifest.
		 * <p>
		 * In case of usage of "Manifest First" for Component loading the #
		 * registration of the resource roots will be already done before loading
		 * the component controller and thus can be used for the dependencies being
		 * declared within the sap.ui.define. 
		 *
		 * @private
		 */
		defineResourceRoots: function() {
			var mResourceRoots = this.getEntry("/sap.ui5/resourceRoots");
			Manifest._registerResourceRoots(mResourceRoots, this.getComponentName());
		},


		/**
		 * Returns the component name which is defined in the manifest as 
		 * <code>sap.ui5/componentName</code> or <code>sap.app/id</code>
		 * 
		 * @return {string} the component name
		 * @public
		 */
		getComponentName: function() {
			var oRawJson = this.getRawJson();
			return getObject(oRawJson, "/sap.ui5/componentName") || getObject(oRawJson, "/sap.app/id");
		},


		/**
		 * Initializes the manifest which executes checks, define the resource
		 * roots, load the dependencies and the includes.
		 * @private
		 */
		init: function() {

			// version check => only if minVersion is available a warning 
			// will be logged and the debug mode is turned on 
			this.checkUI5Version();

			// define the resource roots
			// => if not loaded via manifest first approach the resource roots 
			//    will be registered too late for the AMD modules of the Component
			//    controller. This is a constraint for the resource roots config
			//    in the manifest!
			this.defineResourceRoots();

			// first the dependencies have to be loaded (other UI5 libraries)
			this.loadDependencies();

			// then load the custom scripts and CSS files
			this.loadIncludes();

		},

		/**
		 * Terminates the manifest and some final cleanup.
		 * @private
		 */
		exit: function() {
			// TODO: implement unload of CSS, ...
		}


	});


	/**
	 * Resolves the given URI relative to the component.
	 *
	 * @param {URI} oUri URI to resolve
	 * @param {string} sComponentName component name
	 * @return {URI} resolved URI
	 * @static
	 * @private
	 */
	Manifest._resolveUri = function(oUri, sComponentName) {
		return Manifest._resolveUriRelativeTo(oUri, new URI(jQuery.sap.getModulePath(sComponentName) + "/"));
	};

	/**
	 * Resolves the given URI relative to the given base URI.
	 *
	 * @param {URI} oUri URI to resolve
	 * @param {URI} oBase base URI
	 * @return {URI} resolved URI
	 * @static
	 * @private
	 */
	Manifest._resolveUriRelativeTo = function(oUri, oBase) {
		if (oUri.is("absolute") || (oUri.path() && oUri.path()[0] === "/")) {
			return oUri;
		}
		var oPageBase = new URI().search("");
		oBase = oBase.absoluteTo(oPageBase);
		return oUri.absoluteTo(oBase).relativeTo(oPageBase);
	};

	/**
	 * Registers the given resource roots configuration. Only relative paths 
	 * are allowed here and will be registered. Other paths will be ignored.
	 * 
	 * @param {object} mResourceRoots the resource roots configuration (key=namespace; value=relative path)
	 * @param {string} sComponentName the name of the component
	 * 
	 * @static
	 * @private
	 */
	Manifest._registerResourceRoots = function(mResourceRoots, sComponentName) {

		if (!mResourceRoots) {
			return;
		}

		for (var sResourceRoot in mResourceRoots) {
			var sResourceRootPath = mResourceRoots[sResourceRoot];
			var oResourceRootURI = new URI(sResourceRootPath);
			if (oResourceRootURI.is("absolute") || (oResourceRootURI.path() && oResourceRootURI.path()[0] === "/")) {
				jQuery.sap.log.error("Resource root for \"" + sResourceRoot + "\" is absolute and therefore won't be registered! \"" + sResourceRootPath + "\"", sComponentName);
				continue;
			}
			sResourceRootPath = Manifest._resolveUri(oResourceRootURI, sComponentName).toString();
			jQuery.sap.registerModulePath(sResourceRoot, sResourceRootPath);
		}

	};

	/**
	 * Function to load the manifest by URL
	 *
	 * @param {string} sManifestUrl the URL of the manifest
	 * @param {boolean} [bAsync] flag whether to load the manifest async or not
	 * @return {sap.ui.core.Manifest|Promise} The manifest object or for asynchronous calls an ECMA Script 6 Promise object will be returned.
	 * @protected
	 */
	Manifest.load = function fnLoadManifest(sManifestUrl, bAsync) {
		jQuery.sap.log.info("Loading manifest via URL: " + sManifestUrl);
		var oManifestJSON = jQuery.sap.loadResource({
			url: sManifestUrl,
			dataType: "json",
			async: bAsync || false
		});
		if (bAsync) {
			return oManifestJSON.then(function(oManifestJSON) {
				return new Manifest(oManifestJSON, false);
			});
		}
		return new Manifest(oManifestJSON, false);
	};

	return Manifest;

});
