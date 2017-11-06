/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ComponentMetadata
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObjectMetadata', 'sap/ui/core/Manifest', 'sap/ui/thirdparty/URI', 'jquery.sap.resources'],
	function(jQuery, ManagedObjectMetadata, Manifest, URI /*, jQuery2 */) {
	"use strict";

	var oCfgData = window["sap-ui-config"] || {};

	var syncCallBehavior = 0; // ignore
	if (oCfgData['xx-nosync'] === 'warn' || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search)) {
		syncCallBehavior = 1;
	}
	if (oCfgData['xx-nosync'] === true || oCfgData['xx-nosync'] === 'true' || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search)) {
		syncCallBehavior = 2;
	}

	/**
	 * Creates a new metadata object for a Component subclass.
	 *
	 * @param {string} sClassName Fully qualified name of the class that is described by this metadata object
	 * @param {object} oStaticInfo Static info to construct the metadata from
	 *
	 * @public
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.9.2
	 * @alias sap.ui.core.ComponentMetadata
	 */
	var ComponentMetadata = function(sClassName, oClassInfo) {

		// call super constructor
		ManagedObjectMetadata.apply(this, arguments);

	};

	//chain the prototypes
	ComponentMetadata.prototype = Object.create(ManagedObjectMetadata.prototype);

	ComponentMetadata.preprocessClassInfo = function(oClassInfo) {
		// if the component is a string we convert this into a "_src" metadata entry
		// the specific metadata object can decide to support this or gracefully ignore it
		// basically the ComponentMetadata makes use of this feature
		if (oClassInfo && typeof oClassInfo.metadata === "string") {
			oClassInfo.metadata = {
				_src: oClassInfo.metadata
			};
		}
		return oClassInfo;
	};

	ComponentMetadata.prototype.applySettings = function(oClassInfo) {

		var oStaticInfo = this._oStaticInfo = oClassInfo.metadata;

		// if the component metadata loadFromFile feature is active then
		// the component metadata will be loaded from the specified file
		// which needs to be located next to the Component.js file.
		var sName = this.getName(),
		    sPackage = sName.replace(/\.\w+?$/, "");
		if (oStaticInfo._src) {
			if (oStaticInfo._src == "component.json") {
				jQuery.sap.log.warning("Usage of declaration \"metadata: 'component.json'\" is deprecated (component " + sName + "). Use \"metadata: 'json'\" instead.");
			} else if (oStaticInfo._src != "json") {
				throw new Error("Invalid metadata declaration for component " + sName + ": \"" + oStaticInfo._src + "\"! Use \"metadata: 'json'\" to load metadata from component.json.");
			}

			var sResource = sPackage.replace(/\./g, "/") + "/component.json";
			jQuery.sap.log.info("The metadata of the component " + sName + " is loaded from file " + sResource + ".");
			try {
				var oResponse = jQuery.sap.loadResource(sResource, {
					dataType: "json"
				});
				jQuery.extend(oStaticInfo, oResponse);
			} catch (err) {
				jQuery.sap.log.error("Failed to load component metadata from \"" + sResource + "\" (component " + sName + ")! Reason: " + err);
			}
		}

		ManagedObjectMetadata.prototype.applySettings.call(this, oClassInfo);

		// keep the information about the component name (for customizing)
		this._sComponentName = sPackage;

		// static initialization flag & instance count
		this._bInitialized = false;
		this._iInstanceCount = 0;

		// extract the manifest
		var oManifest = oStaticInfo["manifest"];

		// if a manifest is available we switch to load the manifest for the
		// metadata instead of using the component metadata section
		if (oManifest) {

			// set the version of the metadata
			oStaticInfo.__metadataVersion = 2;

			// The manifest will be lazy loaded within #getManifestObject the first time it is accessed.
			// This allows the component factory (sap.ui.component / sap.ui.component.load) to inject a
			// manifest to prevent a sync request.
			// See: #_applyManifest
			if (typeof oManifest === "string" && oManifest === "json") {
				return;
			}

		} else {

			// set the version of the metadata
			// no manifest => metadata version 1
			oStaticInfo.__metadataVersion = 1;
			oManifest = {};

		}

		// Convert legacy metadata and create manifest object
		this._applyManifest(oManifest);
	};

	/**
	 * Applies the given manifest json to the ComponentMetadata instance
	 * if there isn't already a manifest.
	 *
	 * This method is called from
	 * - {@link #applySettings} in case there is a manifest object given from the metadata
	 * - {@link #getManifestObject} after lazy loading the manifest (sync request)
	 * - {@link sap.ui.component} / {@link sap.ui.component.load} with an existing manifest to prevent the sync request
	 *
	 * @param {object} oManifestJson manifest object (will be modified internally!)
	 * @private
	 * @sap-restricted sap.ui.core.Component
	 */
	ComponentMetadata.prototype._applyManifest = function(oManifestJson) {
		// Make sure to not create the manifest object twice!
		// This could happen when the manifest is accessed (via #getManifestObject) while sap.ui.component is loading it.
		// Then the async request wouldn't be cancelled and the manifest already loaded (sync) should not be be overridden.
		if (this._oManifest) {
			jQuery.sap.log.warning("Can't apply manifest to ComponentMetadata as it has already been created.", this.getName(), "sap.ui.core.ComponentMetadata");
			return;
		}

		// ensure the general property name, the namespace sap.app with the id,
		// the namespace sap.ui5 and eventually the extends property
		oManifestJson["name"] = oManifestJson["name"] || this.getName();
		oManifestJson["sap.app"] = oManifestJson["sap.app"] || {
			"id": this.getComponentName() // use the "package" namespace instead of the classname (without ".Component")
		};
		oManifestJson["sap.ui5"] = oManifestJson["sap.ui5"] || {};
		// the extends property will be added when the component is not a base class
		if (!this.isBaseClass()) {
			oManifestJson["sap.ui5"]["extends"] = oManifestJson["sap.ui5"]["extends"] || {};
		}

		// convert the old legacy metadata and merge with the new manifest
		this._convertLegacyMetadata(this._oStaticInfo, oManifestJson);

		this._oManifest = new Manifest(oManifestJson, {
			componentName: this.getComponentName(),
			baseUrl: jQuery.sap.getModulePath(this.getComponentName(), "/"),
			process: this._oStaticInfo.__metadataVersion === 2
		});
	};

	/**
	 * Static initialization of Components. This function will be called by the
	 * Component and the metadata decides whether to execute the static init code
	 * or not. It will be called by each Component instance init.
	 * @private
	 */
	ComponentMetadata.prototype.init = function() {
		if (this._iInstanceCount === 0) {
			// first we load the dependencies of the parent
			var oParent = this.getParent();
			if (oParent instanceof ComponentMetadata) {
				oParent.init();
			}
			// init the manifest
			this.getManifestObject().init();
			this._bInitialized = true;
		}
		this._iInstanceCount++;
	};

	/**
	 * Static termination of Components. This function will be called by the
	 * Component and the metadata decides whether to execute the static exit code
	 * or not. It will be called by each Component instance exit.
	 * @private
	 */
	ComponentMetadata.prototype.exit = function() {
		// ensure that the instance count is never negative
		var iInstanceCount = Math.max(this._iInstanceCount - 1, 0);
		if (iInstanceCount === 0) {
			// exit the manifest
			this.getManifestObject().exit();
			// unload the includes of parent components
			var oParent = this.getParent();
			if (oParent instanceof ComponentMetadata) {
				oParent.exit();
			}
			this._bInitialized = false;
		}
		this._iInstanceCount = iInstanceCount;
	};

	/**
	 * Component instances need to register themselves in this method to enable
	 * the customizing for this component. This will only be done for the first
	 * instance and only if a customizing configuration is available.
	 * @param {sap.ui.core.Component} oInstance reference to the Component instance
	 * @private
	 */
	ComponentMetadata.prototype.onInitComponent = function(oInstance) {
		jQuery.sap.log.error("The function ComponentMetadata#onInitComponent will be removed soon!");
	};

	/**
	 * Component instances need to unregister themselves in this method to disable
	 * the customizing for this component. This will only be done for the last
	 * instance and only if a customizing configuration is available.
	 * @param {sap.ui.core.Component} oInstance reference to the Component instance
	 * @private
	 */
	ComponentMetadata.prototype.onExitComponent = function(oInstance) {
		jQuery.sap.log.error("The function ComponentMetadata#onExitComponent will be removed soon!");
	};

	/**
	 * Returns whether the class of this metadata is a component base class
	 * or not.
	 * @return {boolean} true if it is sap.ui.core.Component or sap.ui.core.UIComponent
	 * @protected
	 * @since 1.33.0
	 */
	ComponentMetadata.prototype.isBaseClass = function() {
		return /^sap\.ui\.core\.(UI)?Component$/.test(this.getName());
	};

	/**
	 * Returns the version of the metadata which could be 1 or 2. 1 is for legacy
	 * metadata whereas 2 is for the manifest.
	 * @return {int} metadata version (1: legacy metadata, 2: manifest)
	 * @protected
	 * @since 1.27.1
	 */
	ComponentMetadata.prototype.getMetadataVersion = function() {
		return this._oStaticInfo.__metadataVersion;
	};

	/**
	 * Returns the manifest object.
	 * @return {sap.ui.core.Manifest} manifest.
	 * @public
	 * @since 1.33.0
	 */
	ComponentMetadata.prototype.getManifestObject = function() {
		// lazy loading when manifest isn't available, yet
		if (!this._oManifest) {
			var oManifest = this._oStaticInfo["manifest"];
			if (typeof oManifest === "string" && oManifest === "json") {
				// In contrast to sap.ui.core.Manifest#load the sap-language parameter
				// won't be added here as the resource is expected to be served from the
				// preload module cache which does not contain any URL parameters
				var sName = this.getName();
				var sPackage = this.getComponentName();
				var sResource = sPackage.replace(/\./g, "/") + "/manifest.json";

				// Check if resource is available in preload cache
				var bIsResourceLoaded = jQuery.sap.isResourceLoaded(sResource);

				// Only handle sync behavior if resource is not taken from preload cache
				if (!bIsResourceLoaded && syncCallBehavior === 2) {
					jQuery.sap.log.error("[nosync] Loading manifest of the component " + sName + " ignored.", sResource, "sap.ui.core.ComponentMetadata");
					oManifest = {};
				} else {
					if (!bIsResourceLoaded && syncCallBehavior === 1) {
						jQuery.sap.log.error("[nosync] The manifest of the component " + sName + " is loaded with sync XHR.", sResource, "sap.ui.core.ComponentMetadata");
					} else {
						jQuery.sap.log.info("The manifest of the component " + sName + " is loaded from file " + sResource + ".");
					}

					try {
						// This sync loading should not happen in the following cases
						// - there is a Component-preload.js that contains the manifest.json
						// - OR
						// - sap.ui.component / sap.ui.component.load are used with "async=true" and/or
						//   "manifest=true|String|Object" to create / load the component
						//   (Also see #_applyManifest)
						var oResponse = jQuery.sap.loadResource(sResource, {
							dataType: "json"
						});
						oManifest = oResponse;
					} catch (err) {
						jQuery.sap.log.error("Failed to load component manifest from \"" + sResource + "\" (component " + sName + ")! Reason: " + err);
						// in case of error the manifest is an empty object
						// to behave similar like for missing component.json
						oManifest = {};
					}
				}

				this._applyManifest(oManifest);
			}
		}

		return this._oManifest;
	};

	/**
	 * Returns the manifest defined in the metadata of the Component.
	 * If not specified, the return value is null.
	 * @return {Object} manifest.
	 * @public
	 * @since 1.27.1
	 * @deprecated  Since 1.33.0. Please use the sap.ui.core.Component#getManifest
	 */
	ComponentMetadata.prototype.getManifest = function() {
		// use raw manifest in case of legacy metadata
		if (this.getMetadataVersion() === 1) {
			return this.getManifestObject().getRawJson();
		}
		return this.getManifestObject().getJson();
	};

	/**
	 * Returns the processed manifest object (no copy).
	 * Processing will be done in a "lazy" way.
	 *
	 * @return {object} manifest
	 * @private
	 * @since 1.29.0
	 * @deprecated  Since 1.33.0. Please use the sap.ui.core.Component#getManifest
	 */
	ComponentMetadata.prototype._getManifest = function() {
		jQuery.sap.log.warning("ComponentMetadata#_getManifest: do not use deprecated functions anymore!");
		return this.getManifestObject().getJson();
	};

	/**
	 * Returns the raw manifest defined in the metadata of the Component.
	 * If not specified, the return value is null.
	 * @return {Object} manifest
	 * @public
	 * @since 1.29.0
	 * @deprecated  Since 1.33.0. Please use the sap.ui.core.Component#getManifest
	 */
	ComponentMetadata.prototype.getRawManifest = function() {
		return this.getManifestObject().getRawJson();
	};

	/**
	 * Returns the raw manifest object (no copy).
	 *
	 * @return {object} manifest
	 * @private
	 * @since 1.29.0
	 * @deprecated  Since 1.33.0. Please use the sap.ui.core.Component#getRawManifest
	 */
	ComponentMetadata.prototype._getRawManifest = function() {
		jQuery.sap.log.warning("ComponentMetadata#_getRawManifest: do not use deprecated functions anymore!");
		return this.getManifestObject().getRawJson();
	};


	/**
	 * Returns the configuration of a manifest section or the value for a
	 * specific path. If no section or key is specified, the return value is null.
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
	 * <li><b>By section/namespace</b>: <code>oComponent.getMetadata().getManifestEntry("sap.ui5")</code></li>
	 * <li><b>By path</b>: <code>oComponent.getMetadata().getManifestEntry("/sap.ui5/dependencies/libs")</code></li>
	 * </ul>
	 *
	 * By section/namespace returns the configuration for the specified manifest
	 * section and by path allows to specify a concrete path to a dedicated entry
	 * inside the manifest. The path syntax always starts with a slash (/).
	 *
	 * @param {string} sKey Either the manifest section name (namespace) or a concrete path
	 * @param {boolean} [bMerged] Indicates whether the custom configuration is merged with the parent custom configuration of the Component.
	 * @return {any|null} Value of the manifest section or the key (could be any kind of value)
	 * @public
	 * @since 1.27.1
	 * @deprecated  Since 1.33.0. Please use the sap.ui.core.Component#getManifest
	 */
	ComponentMetadata.prototype.getManifestEntry = function(sKey, bMerged) {
		var oData = this.getManifestObject().getEntry(sKey);

		// merge / extend should only be done for objects or when entry wasn't found
		if (oData !== undefined && !jQuery.isPlainObject(oData)) {
			return oData;
		}

		// merge the configuration of the parent manifest with local manifest
		// the configuration of the static component metadata will be ignored
		var oParent, oParentData;
		if (bMerged && (oParent = this.getParent()) instanceof ComponentMetadata) {
			oParentData = oParent.getManifestEntry(sKey, bMerged);
		}

		// only extend / clone if there is data
		// otherwise "null" will be converted into an empty object
		if (oParentData || oData) {
				oData = jQuery.extend(true, {}, oParentData, oData);
		}

		return oData;
	};

	/**
	 * Returns the custom Component configuration entry with the specified key (this must be a JSON object).
	 * If no key is specified, the return value is null.
	 *
	 * Example:
	 * <code>
	 *   sap.ui.core.Component.extend("sample.Component", {
	 *       metadata: {
	 *           "my.custom.config" : {
	 *               "property1" : true,
	 *               "property2" : "Something else"
	 *           }
	 *       }
	 *   });
	 * </code>
	 *
	 * The configuration above can be accessed via <code>sample.Component.getMetadata().getCustomEntry("my.custom.config")</code>.
	 *
	 * @param {string} sKey Key of the custom configuration (must be prefixed with a namespace)
	 * @param {boolean} bMerged Indicates whether the custom configuration is merged with the parent custom configuration of the Component.
	 * @return {Object} custom Component configuration with the specified key.
	 * @public
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifestEntry
	 */
	ComponentMetadata.prototype.getCustomEntry = function(sKey, bMerged) {
		if (!sKey || sKey.indexOf(".") <= 0) {
			jQuery.sap.log.warning("Component Metadata entries with keys without namespace prefix can not be read via getCustomEntry. Key: " + sKey + ", Component: " + this.getName());
			return null;
		}

		var oParent,
		    oData = this._oStaticInfo[sKey] || {};

		if (!jQuery.isPlainObject(oData)) {
			jQuery.sap.log.warning("Custom Component Metadata entry with key '" + sKey + "' must be an object. Component: " + this.getName());
			return null;
		}

		if (bMerged && (oParent = this.getParent()) instanceof ComponentMetadata) {
			return jQuery.extend(true, {}, oParent.getCustomEntry(sKey, bMerged), oData);
		}
		return jQuery.extend(true, {}, oData);
	};


	/**
	 * Returns the name of the Component (which is the namespace only with the module name)
	 * @return {string} Component name
	 * @public
	 */
	ComponentMetadata.prototype.getComponentName = function() {
		return this._sComponentName;
	};

	/**
	 * Returns the dependencies defined in the metadata of the Component. If not specified, the return value is null.
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {Object} Component dependencies.
	 * @public
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/dependencies")
	 */
	ComponentMetadata.prototype.getDependencies = function() {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getDependencies is deprecated!");
		if (!this._oLegacyDependencies) {

			var mDependencies = this.getManifestEntry("/sap.ui5/dependencies"),
			    sUI5Version = mDependencies && mDependencies.minUI5Version || null,
			    mLibs = mDependencies && mDependencies.libs || {},
			    mComponents = mDependencies && mDependencies.components || {};
			var mLegacyDependencies = {
				ui5version: sUI5Version,
				libs: [],
				components: []
			};
			for (var sLib in mLibs) {
				mLegacyDependencies.libs.push(sLib);
			}
			for (var sComponent in mComponents) {
				mLegacyDependencies.components.push(sComponent);
			}
			this._oLegacyDependencies = mLegacyDependencies;
		}
		return this._oLegacyDependencies;
	};

	/**
	 * Returns the array of the included files that the Component requires such
	 * as CSS and JavaScript. If not specified or the array is empty, the return
	 * value is null.
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {string[]} Included files.
	 * @public
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/resources")
	 */
	ComponentMetadata.prototype.getIncludes = function() {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getIncludes is deprecated!");
		if (!this._aLegacyIncludes) {
			var aIncludes = [],
			    mResources = this.getManifestEntry("/sap.ui5/resources") || {},
			    aCSSResources = mResources && mResources.css || [],
			    aJSResources = mResources && mResources.js || [];
				for (var i = 0, l = aCSSResources.length; i < l; i++) {
					if (aCSSResources[i] && aCSSResources[i].uri) {
						aIncludes.push(aCSSResources[i].uri);
					}
				}
				for (var i = 0, l = aJSResources.length; i < l; i++) {
					if (aJSResources[i] && aJSResources[i].uri) {
						aIncludes.push(aJSResources[i].uri);
					}
				}
			this._aLegacyIncludes = (aIncludes.length > 0) ? aIncludes : null;
		}
		return this._aLegacyIncludes;
	};

	/**
	 * Returns the required version of SAPUI5 defined in the metadata of the
	 * Component. If returned value is null, then no special UI5 version is
	 * required.
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {string} Required version of UI5 or if not specified then null.
	 * @public
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/dependencies/minUI5Version")
	 */
	ComponentMetadata.prototype.getUI5Version = function() {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getUI5Version is deprecated!");
		return this.getManifestEntry("/sap.ui5/dependencies/minUI5Version");
	};

	/**
	 * Returns array of components specified in the metadata of the Component.
	 * If not specified or the array is empty, the return value is null.
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {string[]} Required Components.
	 * @public
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/dependencies/components")
	 */
	ComponentMetadata.prototype.getComponents = function() {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getComponents is deprecated!");
		return this.getDependencies().components;
	};

	/**
	 * Returns array of libraries specified in metadata of the Component, that
	 * are automatically loaded when an instance of the component is created.
	 * If not specified or the array is empty, the return value is null.
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {string[]} Required libraries.
	 * @public
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/dependencies/libs")
	 */
	ComponentMetadata.prototype.getLibs = function() {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getLibs is deprecated!");
		return this.getDependencies().libs;
	};

	/**
	 * Returns the version of the component. If not specified, the return value
	 * is null.
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {string} The version of the component.
	 * @public
	 * @deprecated Since 1.34.2. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.app/applicationVersion/version")
	 */
	ComponentMetadata.prototype.getVersion = function() {
		return this.getManifestEntry("/sap.app/applicationVersion/version");
	};

	/**
	 * Returns a copy of the configuration property to disallow modifications.
	 * If no key is specified it returns the complete configuration property
	 *
	 * @param {string} [sKey] Key of the configuration property
	 * @param {boolean} [bDoNotMerge] If set to <code>true</code>, only the local configuration is returned
	 * @return {object} the value of the configuration property
	 * @public
	 * @since 1.15.1
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/config")
	 */
	ComponentMetadata.prototype.getConfig = function(sKey, bDoNotMerge) {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getConfig is deprecated!");
		var mConfig = this.getManifestEntry("/sap.ui5/config", !bDoNotMerge);

		if (!mConfig) {
			return {};
		}

		if (!sKey) {
			return mConfig;
		}

		return mConfig.hasOwnProperty(sKey) ? mConfig[sKey] : {};
	};


	/**
	 * Returns a copy of the Customizing property
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @param {boolean} [bDoNotMerge] If set to <code>true</code>, only the local configuration is returned
	 * @return {object} the value of the Customizing property
	 * @private
	 * @since 1.15.1
	 * @experimental Since 1.15.1. Implementation might change.
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/extends/extensions")
	 */
	ComponentMetadata.prototype.getCustomizing = function(bDoNotMerge) {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getCustomizing is deprecated!");
		return this.getManifestEntry("/sap.ui5/extends/extensions", !bDoNotMerge);
	};


	/**
	 * Returns the models configuration which defines the available models of the
	 * Component.
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @param {boolean} [bDoNotMerge] If set to <code>true</code>, only the local configuration is returned
	 * @return {object} models configuration
	 * @private
	 * @since 1.15.1
	 * @experimental Since 1.15.1. Implementation might change.
	 * @deprecated Since 1.27.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/models")
	 */
	ComponentMetadata.prototype.getModels = function(bDoNotMerge) {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getModels is deprecated!");
		if (!this._oLegacyModels) {
			this._oLegacyModels = {};
			var mDataSources = this.getManifestEntry("/sap.ui5/models") || {};
			for (var sDataSource in mDataSources) {
				var oDataSource = mDataSources[sDataSource];
				this._oLegacyModels[sDataSource] = oDataSource.settings || {};
				this._oLegacyModels[sDataSource].type = oDataSource.type;
				this._oLegacyModels[sDataSource].uri = oDataSource.uri;
			}
		}

		// deep copy of the legacy models object
		var oParent,
		    mModels = jQuery.extend(true, {}, this._oLegacyModels);
		// merge the models object if defined via parameter
		if (!bDoNotMerge && (oParent = this.getParent()) instanceof ComponentMetadata) {
			mModels = jQuery.extend(true, {}, oParent.getModels(), mModels);
		}

		// return a clone of the models
		return mModels;
	};

	/**
	 * Returns messaging flag
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {boolean} bMessaging Messaging enabled/disabled
	 * @private
	 * @since 1.28.0
	 * @deprecated Since 1.28.1. Please use {@link sap.ui.core.Component#getManifestEntry}("/sap.ui5/handleValidation")
	 */
	ComponentMetadata.prototype.handleValidation = function() {
		//jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.handleValidation is deprecated!");
		return this.getManifestEntry("/sap.ui5/handleValidation");
	};

	/**
	 * Returns the services configuration which defines the available services
	 * of the component.
	 * <p>
	 * <b>Important:</b></br>
	 * If a Component is loaded using the manifest URL (or according the
	 * "manifest first" strategy), this function ignores the entries of the
	 * manifest file! It returns only the entries which have been defined in
	 * the Component metadata or in the proper Component manifest.
	 *
	 * @return {object} services configuration
	 * @private
	 * @since 1.15.1
	 * @experimental Since 1.15.1. Implementation might change.
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getServices = function() {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getServices is deprecated!");
		// legacy API - for the manifest services has a different meaning!
		return this._oStaticInfo.services || {};
	};

	/**
	 * Converts the legacy metadata into the new manifest format
	 * @private
	 */
	ComponentMetadata.prototype._convertLegacyMetadata = function(oStaticInfo, oManifest) {

		// this function can be outsourced in future when the ComponentMetadata
		// is not used anymore and the new Application manifest is used -
		// but for now we keep it as it will be one of the common use cases
		// to have the classical ComponentMetadata and this should be
		// transformed into the new manifest structure for compatibility

		// converter for array with string values to object
		var fnCreateObject = function(a, fnCallback) {
			var o = {};
			if (a) {
				for (var i = 0, l = a.length; i < l; i++) {
					var oValue = a[i];
					if (typeof oValue === "string") {
						o[oValue] = typeof fnCallback === "function" && fnCallback(oValue) || {};
					}
				}
			}
			return o;
		};

		// add the old information on component metadata to the manifest info
		var oAppManifest = oManifest["sap.app"];
		var oUI5Manifest = oManifest["sap.ui5"];

		// we do not merge the manifest and the metadata - once a manifest
		// entry exists, the metadata entries will be ignored and the specific
		// metadata entry needs to be migrated into the manifest.
		for (var sName in oStaticInfo) {
			var oValue = oStaticInfo[sName];
			if (oValue !== undefined) {
				switch (sName) {
					case "name":
						oManifest[sName] = oManifest[sName] || oValue;
						oAppManifest["id"] = oAppManifest["id"] || oValue;
						break;
					case "description":
					case "keywords":
						oAppManifest[sName] = oAppManifest[sName] || oValue;
						break;
					case "version":
						var mAppVersion = oAppManifest.applicationVersion = oAppManifest.applicationVersion || {};
						mAppVersion.version = mAppVersion.version || oValue;
						break;
					case "config":
						oUI5Manifest[sName] = oUI5Manifest[sName] || oValue;
						break;
					case "customizing":
						var mExtends = oUI5Manifest["extends"] = oUI5Manifest["extends"] || {};
						mExtends.extensions = mExtends.extensions || oValue;
						break;
					case "dependencies":
						if (!oUI5Manifest[sName]) {
							oUI5Manifest[sName] = {};
							oUI5Manifest[sName].minUI5Version = oValue.ui5version;
							oUI5Manifest[sName].libs = fnCreateObject(oValue.libs);
							oUI5Manifest[sName].components = fnCreateObject(oValue.components);
						}
						break;
					case "includes":
						if (!oUI5Manifest["resources"]) {
							oUI5Manifest["resources"] = {};
							if (oValue && oValue.length > 0) {
								for (var i = 0, l = oValue.length; i < l; i++) {
									var sResource = oValue[i];
									var m = sResource.match(/\.(css|js)$/i);
									if (m) {
										oUI5Manifest["resources"][m[1]] = oUI5Manifest["resources"][m[1]] || [];
										oUI5Manifest["resources"][m[1]].push({
											"uri": sResource
										});
									}
								}
							}
						}
						break;
					case "handleValidation":
						if (oUI5Manifest[sName] === undefined) {
							oUI5Manifest[sName] = oValue;
						}
						break;
					case "models":
						if (!oUI5Manifest["models"]) {
							var oModels = {};
							for (var sModel in oValue) {
								var oDS = oValue[sModel];
								var oModel = {};
								for (var sDSSetting in oDS) {
									var oDSSetting = oDS[sDSSetting];
									switch (sDSSetting) {
										case "type":
										case "uri":
											oModel[sDSSetting] = oDSSetting;
											break;
										default:
											oModel.settings = oModel.settings || {};
											oModel.settings[sDSSetting] = oDSSetting;
									}
								}
								oModels[sModel] = oModel;
							}
							oUI5Manifest["models"] = oModels;
						}
						break;
					// no default
				}
			}
		}

	};

	return ComponentMetadata;

}, /* bExport= */ true);
