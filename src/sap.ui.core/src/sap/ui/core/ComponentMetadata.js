/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ComponentMetadata
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObjectMetadata'],
	function(jQuery, ManagedObjectMetadata) {
	"use strict";


	/**
	 * Creates a new metadata object for a Component subclass.
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oStaticInfo static info to construct the metadata from
	 *
	 * @experimental Since 1.9.2. The Component concept is still under construction, so some implementation details can be changed in future.
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
	ComponentMetadata.prototype = jQuery.sap.newObject(ManagedObjectMetadata.prototype);
	
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
		
		var oStaticInfo = oClassInfo.metadata;
	
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
		
		// keep the infor about the component name (for customizing)
		this._sComponentName = sPackage;
		
		// static initialization flag & instance count
		this._bInitialized = false;
		this._iInstanceCount = 0;
		
		// get the parent component
		var oParent = this.getParent();
		
		// extract the manifest
		var oManifest = oStaticInfo["manifest"];
		
		// if a manifest is available we switch to load the manifest for the 
		// metadata instead of using the component metadata section
		if (oManifest) {
			
			// set the version of the metadata
			oStaticInfo.__metadataVersion = 2;
			
			// load the manifest if defined as string
			if (typeof oManifest === "string" && oManifest === "json") {
				
				var sResource = sPackage.replace(/\./g, "/") + "/manifest.json";
				jQuery.sap.log.info("The manifest of the component " + sName + " is loaded from file " + sResource + ".");
				try {
					// the synchronous loading would be only relevant during the
					// development time - for productive usage the Component should
					// provide a preload packaging which includes the manifest 
					// next to the Component code - so the sync request penalty
					// should be ignorable for now (async implementation will 
					// change the complete behavior of the constructor function)
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
			
			// ensure property name incl. sap.app and sap.ui5 namespace
			oManifest["name"] = oManifest["name"] || this.getName();
			oManifest["sap.app"] = oManifest["sap.app"] || {};
			oManifest["sap.ui5"] = oManifest["sap.ui5"] || {};
			
		} else {
			
			// else branch can be outsourced in future when the ComponentMetadata
			// is not used anymore and the new Application manifest is used - 
			// but for now we keep it as it will be one of the common use cases
			// to have the classical ComponentMetadata and this should be 
			// transformed into the new manifest structure for compatibility
			
			// set the version of the metadata
			oStaticInfo.__metadataVersion = 1;
			
			// create the manifest object
			var oManifest = {
				"name": this.getName(),
				"sap.app": {},
				"sap.ui5": {}
			};
			
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
			for (var sName in oStaticInfo) {
				var oValue = oStaticInfo[sName];
				switch (sName) {
					case "name":
						oAppManifest["id"] = oValue;
						break;
					case "description":
					case "keywords":
						oAppManifest[sName] = oValue;
						break;
					case "version":
						oAppManifest.applicationVersion = {
							version: oValue
						};
						break;
					case "config":
						oUI5Manifest[sName] = oValue;
						break;
					case "customizing":
						oUI5Manifest["extends"] = {
							component: oParent ? oParent.getName() : undefined,
							extensions: oValue
						};
						break;
					case "dependencies":
						oUI5Manifest[sName] = {};
						oUI5Manifest[sName].minUI5Version = oValue.ui5version;
						oUI5Manifest[sName].libs = fnCreateObject(oValue.libs);
						oUI5Manifest[sName].components = fnCreateObject(oValue.components);
						break;
					case "includes":
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
						break;
					case "models":
						var oModels = {};
						for (var sModel in oValue) {
							var oDS = oValue[sModel];
							var oModel = {
								settings: {}
							};
							for (var sDSSetting in oDS) {
								var oDSSetting = oDS[sDSSetting];
								switch (sDSSetting) {
									case "type":
										oModel[sDSSetting] = oDSSetting;
										break;
									default: 
										oModel.settings[sDSSetting] = oDSSetting;
								}
							}
							oModels[sModel] = oModel;
						}
						oUI5Manifest["models"] = oModels;
						break;
					// no default
				}
			}
			
		}
		
		// apply the manifest to the static info and store the static info for
		// later access to specific custom entries of the manifest itself
		oStaticInfo["manifest"] = oManifest;
		this._oStaticInfo = oStaticInfo;
		
		// some metadata needs to be merged with the metadata for the parent component
		// except of the version, dependencies and includes => they are handled by the
		// specific component metadata implementation and no merge is required here!
		if (oParent instanceof ComponentMetadata) {
			var oUI5Manifest = oManifest["sap.ui5"];
			var oParentUI5Manifest = oParent.getManifestEntry("sap.ui5");
			if (oParentUI5Manifest.config) {
				oUI5Manifest.config = jQuery.extend(true, {}, oParentUI5Manifest.config, oUI5Manifest.config);
			}
			if (oParentUI5Manifest["extends"] && oParentUI5Manifest["extends"].extensions) {
				oUI5Manifest["extends"] = oUI5Manifest["extends"] || {};
				oUI5Manifest["extends"].extensions = jQuery.extend(true, {}, oParentUI5Manifest["extends"].extensions, oUI5Manifest["extends"].extensions);
			}
			if (oParentUI5Manifest.models) {
				oUI5Manifest.models = jQuery.extend(true, {}, oParentUI5Manifest.models, oUI5Manifest.models);
			}
		}
		
	};
	
	/**
	 * Static initialization of components. This function will be called by the 
	 * component and the metadata decides whether to execute the static init code
	 * or not. It will be called the first time a component is initialized.
	 * @private
	 */
	ComponentMetadata.prototype.init = function() {
		if (!this._bInitialized) {
	
			// first we load the dependencies of the parent
			var oParent = this.getParent();
			if (oParent instanceof ComponentMetadata) {
				oParent.init();
			}
			
			// first the dependencies have to be loaded (other UI5 libraries)
			this._loadDependencies();
			
			// then load the custom scripts and CSS files
			this._loadIncludes();
			
			this._bInitialized = true;
			
		}
	};
	
	/**
	 * Static termination of components.
	 * 
	 * TODO: Right now it is unclear when this function should be called. Just to
	 *       make sure that we do not forget this in future. 
	 * 
	 * @private
	 */
	ComponentMetadata.prototype.exit = function() {
		if (this._bInitialized) {
			var oParent = this.getParent();
			if (oParent instanceof ComponentMetadata) {
				oParent.exit();
			}
			// TODO: implement unload of CSS, ...
			this._bInitialized = false;
		}
	};
	
	/**
	 * Component instances need to register themselves in this method to enable 
	 * the customizing for this component. This will only be done for the first
	 * instance and only if a customizing configuration is available.
	 * @private
	 */
	ComponentMetadata.prototype.onInitComponent = function() {
		var oUI5Manifest = this.getManifestEntry("sap.ui5"),
		    mExtensions = oUI5Manifest && oUI5Manifest["extends"] && oUI5Manifest["extends"].extensions;
		if (this._iInstanceCount === 0 && !jQuery.isEmptyObject(mExtensions)) {
			jQuery.sap.require("sap.ui.core.CustomizingConfiguration");
			sap.ui.core.CustomizingConfiguration.activateForComponent(this._sComponentName);
		}
		this._iInstanceCount++;
	};
	
	/**
	 * Component instances need to unregister themselves in this method to disable 
	 * the customizing for this component. This will only be done for the last
	 * instance and only if a customizing configuration is available.
	 * @private
	 */
	ComponentMetadata.prototype.onExitComponent = function() {
		this._iInstanceCount--;
		var oUI5Manifest = this.getManifestEntry("sap.ui5"),
		    mExtensions = oUI5Manifest && oUI5Manifest["extends"] && oUI5Manifest["extends"].extensions;
		if (this._iInstanceCount === 0 && !jQuery.isEmptyObject(mExtensions)) {
			if (sap.ui.core.CustomizingConfiguration) {
				sap.ui.core.CustomizingConfiguration.deactivateForComponent(this._sComponentName);
			}
		}
	};
	
	/**
	 * Returns the version of the metadata which could be 1 or 2. 1 is for legacy 
	 * metadata whereas 2 is for the manifest.
	 * @return {int} metadata version () 
	 * @protected
	 * @since 1.27.1
	 */
	ComponentMetadata.prototype.getMetadataVersion = function() {
		return this._oStaticInfo.__metadataVersion;
	};
	
	/**
	 * Returns the manifest defined in the metadata of the component. 
	 * If not specified, the return value is null.
	 * @return {Object} manifest. 
	 * @public
	 * @since 1.27.1
	 */
	ComponentMetadata.prototype.getManifest = function() {
		// only a copy of the manifest will be returned to make sure that it
		// cannot be modified - TODO: think about Object.freeze() instead
		return jQuery.extend(true, {}, this._oStaticInfo.manifest);
	};
	
	/**
	 * Returns the manifest configuration entry with the specified key (Must be a JSON object).
	 * If no key is specified, the return value is null.
	 * 
	 * Example:
	 * <code>
	 *   sap.ui.core.Component.extend("sample.Component", {
	 *       metadata: {
	 *           manifest: {
	 *               "my.custom.config" : {
	 *                   "property1" : true,
	 *                   "property2" : "Something else"
	 *               }
	 *           }
	 *       }
	 *   });
	 * </code>
	 * 
	 * The configuration above can be accessed via <code>sample.Component.getMetadata().getManifestEntry("my.custom.config")</code>.
	 * 
	 * @param {string} sKey key of the custom configuration (must be prefixed with a namespace / separated with dots)
	 * @param {boolean} bMerged whether the custom configuration should be merged with components parent custom configuration.
	 * @return {Object} custom Component configuration with the specified key. 
	 * @public
	 * @since 1.27.1
	 */
	ComponentMetadata.prototype.getManifestEntry = function(sKey, bMerged) {
		if (!sKey || sKey.indexOf(".") <= 0) {
			jQuery.sap.log.warning("Manifest entries with keys without namespace prefix can not be read via getManifestEntry. Key: " + sKey + ", Component: " + this.getName());
			return null;
		}
		
		var oManifest = this.getManifest();
		var oData = oManifest && oManifest[sKey] || {};
		
		if (!jQuery.isPlainObject(oData)) {
			jQuery.sap.log.warning("Custom Manifest entry with key '" + sKey + "' must be an object. Component: " + this.getName());
			return null;
		}
		
		var oParent = this.getParent();
		if (bMerged && oParent instanceof ComponentMetadata) {
			return jQuery.extend(true, {}, oParent.getManifestEntry(sKey, bMerged), oData);
		}
		return jQuery.extend(true, {}, oData);
	};
	
	/**
	 * Returns the custom Component configuration entry with the specified key (Must be a JSON object).
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
	 * @param {string} sKey key of the custom configuration (must be prefixed with a namespace)
	 * @param {boolean} bMerged whether the custom configuration should be merged with components parent custom configuration.
	 * @return {Object} custom Component configuration with the specified key. 
	 * @public
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifestEntry
	 */
	ComponentMetadata.prototype.getCustomEntry = function(sKey, bMerged){
		if (!sKey || sKey.indexOf(".") <= 0) {
			jQuery.sap.log.warning("Component Metadata entries with keys without namespace prefix can not be read via getCustomEntry. Key: " + sKey + ", Component: " + this.getName());
			return null;
		}
		
		var oData = this._oStaticInfo[sKey] || {};
		
		if (!jQuery.isPlainObject(oData)) {
			jQuery.sap.log.warning("Custom Component Metadata entry with key '" + sKey + "' must be an object. Component: " + this.getName());
			return null;
		}
		
		var oParent = this.getParent();
		if (bMerged && oParent instanceof ComponentMetadata) {
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
	 * Returns the dependencies defined in the metadata of the component. If not specified, the return value is null.
	 * @return {Object} Component dependencies. 
	 * @public
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getDependencies = function() {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getDependencies is deprecated!");
		if (!this._oLegacyDependencies) {
			var oUI5Manifest = this.getManifestEntry("sap.ui5"),
			    mDependencies = oUI5Manifest && oUI5Manifest.dependencies,
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
	 * Returns the array of the included files that the Component requires such as css and js. If not specified or the array is empty, the return value is null.
	 * @return {string[]} Included files.
	 * @public
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getIncludes = function() {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getIncludes is deprecated!");
		if (!this._oLegacyIncludes) {
			var aIncludes = [],
			    oUI5Manifest = this.getManifestEntry("sap.ui5"),
			    mResources = oUI5Manifest && oUI5Manifest.resources || {},
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
			this._oLegacyIncludes = (aIncludes.length > 0) ? aIncludes : null;
		}
		return this._oLegacyIncludes;
	};
	
	/**
	 * Returns the required version of SAP UI5 defined in the metadata of the Component. If returned value is null, then no special UI5 version is required.
	 * @return {string} Required version of UI5 or if not specified then null.
	 * @public
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getUI5Version = function() {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getUI5Version is deprecated!");
		return this.getDependencies().ui5version;
	};
	
	/**
	 * Returns array of components specified in the metadata of the Component. If not specified or the array is empty, the return value is null.
	 * @return {string[]} Required Components.
	 * @public
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getComponents = function() {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getComponents is deprecated!");
		return this.getDependencies().components;
	};
	
	/**
	 * Returns array of libraries specified in metadata of the Component, that are automatically loaded when an instance of the component is created.
	 * If not specified or the array is empty, the return value is null.
	 * @return {string[]} Required libraries.
	 * @public
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getLibs = function() {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getLibs is deprecated!");
		return this.getDependencies().libs;
	};
	
	/**
	 * Returns the version of the component. If not specified, the return value is null.
	 * @return {string} The version of the component.
	 * @public
	 */
	ComponentMetadata.prototype.getVersion = function() {
		var oAppManifest = this.getManifestEntry("sap.app");
		return oAppManifest && oAppManifest.applicationVersion && oAppManifest.applicationVersion.version;
	};
	
	/**
	 * Returns a copy of the configuration property to disallow modifications. If no 
	 * key is specified it returns the complete configuration property.
	 * @param {string} [sKey] the key of the configuration property
	 * @return {object} the value of the configuration property
	 * @public
	 * @since 1.15.1
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getConfig = function(sKey) {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getConfig is deprecated!");
		var oUI5Manifest = this.getManifestEntry("sap.ui5"),
		    mConfig = oUI5Manifest && oUI5Manifest.config;
		return mConfig ? jQuery.extend({}, sKey ? mConfig[sKey] : mConfig) : undefined;
	};
	
	
	/**
	 * Returns a copy of the customizing property
	 * @return {object} the value of the customizing property
	 * @private
	 * @since 1.15.1
	 * @experimental Since 1.15.1. Implementation might change. 
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getCustomizing = function() {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getCustomizing is deprecated!");
		var oUI5Manifest = this.getManifestEntry("sap.ui5"),
		    mExtensions = oUI5Manifest && oUI5Manifest["extends"] && oUI5Manifest["extends"].extensions;
		return mExtensions ? jQuery.extend({}, mExtensions) : undefined;
	};
	
	
	/**
	 * Returns the models configuration which defines the available models of the
	 * component. 
	 * @return {object} models configuration
	 * @private
	 * @since 1.15.1 
	 * @experimental Since 1.15.1. Implementation might change. 
	 * @deprecated Since 1.27.1. Please use the sap.ui.core.ComponentMetadata#getManifest
	 */
	ComponentMetadata.prototype.getModels = function() {
		jQuery.sap.log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getModels is deprecated!");
		if (!this._oLegacyModels) {
			var mModels = {},
			    oUI5Manifest = this.getManifestEntry("sap.ui5"),
			    mDataSources = oUI5Manifest && oUI5Manifest.models || {};
			for (var sDataSource in mDataSources) {
				var oDataSource = mDataSources[sDataSource];
				mModels[sDataSource] = oDataSource.settings || {};
				mModels[sDataSource].type = oDataSource.type;
			}
			this._oLegacyModels = mModels;
		}
		return this._oLegacyModels;
	};
	
	/**
	 * Returns the services configuration which defines the available services of the
	 * component. 
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
	 * Loads the included CSS and JavaScript resources. The resources will be 
	 * resoloved relative to the component location. 
	 * 
	 * @private
	 */
	ComponentMetadata.prototype._loadIncludes = function() {
	
		// afterwards we load our includes!
		var aIncludes = this.getIncludes();
		if (aIncludes && aIncludes.length > 0) {
			var that = this;
			var sLibName = this.getLibraryName();
			for (var i = 0, l = aIncludes.length; i < l; i++) {
				var sFile = aIncludes[i];
				if (sFile.match(/\.css$/i)) {
					var sCssUrl = sap.ui.resource(sLibName, sFile);
					jQuery.sap.log.info("Component \"" + that.getName() + "\" is loading CSS: \"" + sCssUrl + "\"");
					jQuery.sap.includeStyleSheet(sCssUrl /* TODO: , sId (do we have a good idea how to create the id?!) */ );
				} else {
					// load javascript file
					var m = sFile.match(/\.js$/i);
					if (m) {
						// prepend lib name to path, remove extension
						var sPath = sLibName.replace(/\./g, '/') + (sFile.slice(0, 1) === '/' ? '' : '/') + sFile.slice(0, m.index);
						jQuery.sap.log.info("Component \"" + that.getName() + "\" is loading JS: \"" + sPath + "\"");
						// call internal require variant that accepts a requireJS path
						jQuery.sap._requirePath(sPath);
					}
				}
			}
		}
		
	};
	
	/**
	 * Load external dependencies (like libraries and components)
	 * 
	 * @private
	 */
	ComponentMetadata.prototype._loadDependencies = function() {
	
		// afterwards we load our dependencies!
		var that = this,
			oDep = this.getDependencies();
		if (oDep) {
			
			// load the libraries
			var aLibraries = oDep.libs;
			if (aLibraries) {
				for (var i = 0, l = aLibraries.length; i < l; i++) {
					var sLib = aLibraries[i];
					jQuery.sap.log.info("Component \"" + that.getName() + "\" is loading library: \"" + sLib + "\"");
					sap.ui.getCore().loadLibrary(sLib);
				}
			}
			
			// load the components
			var aComponents = oDep.components;
			if (aComponents) {
				for (var i = 0, l = aComponents.length; i < l; i++) {
					var sName = aComponents[i];
					jQuery.sap.log.info("Component \"" + that.getName() + "\" is loading component: \"" + sName + ".Component\"");
					sap.ui.component.load({
						name: sName
					});
				}
			}
			
		}
		
	};
	

	return ComponentMetadata;

}, /* bExport= */ true);
