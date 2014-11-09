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
	 * @name sap.ui.core.ComponentMetadata
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
		
		// extract the custom component data from the static info 
		this._sVersion = oStaticInfo.version;
		this._mDependencies = oStaticInfo.dependencies;
		this._aIncludes = oStaticInfo.includes;
		this._mConfig = oStaticInfo.config;
		this._mCustomizing = oStaticInfo.customizing;
	
		// extract the models and services custom component data
		// (as models and services are experimental the default value is applied here
		//  to avoid mentioning those options in the component metadata section!) 
		this._mModels = oStaticInfo.models || {};
		this._mServices = oStaticInfo.services || {};
		
		// some metadata needs to be merged with the metadata for the parent component
		// except of the version, dependencies and includes => they are handled by the
		// specific component metadata implementation and no merge is required here!
		var oParent = this.getParent();
		if (oParent instanceof ComponentMetadata) {
			this._mConfig = jQuery.extend(true, {}, oParent._mConfig, this._mConfig);
			this._mCustomizing = jQuery.extend(true, {}, oParent._mCustomizing, this._mCustomizing);
			this._mModels = jQuery.extend(true, {}, oParent._mModels, this._mModels);
			this._mServices = jQuery.extend(true, {}, oParent._mServices, this._mServices);
		}
		
		// Store the static metadata for later usage (see getCustomConfiguration)
		this._oStaticInfo = oStaticInfo;
		
	};
	
	/**
	 * Static initialization of components. This function will be called by the 
	 * component and the metadata decides whether to execute the static init code
	 * or not. It will be called the first time a component is initialized.
	 * @private
	 * @name sap.ui.core.ComponentMetadata#init
	 * @function
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
	 * @private
	 * @name sap.ui.core.ComponentMetadata#exit
	 * @function
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
	 * @name sap.ui.core.ComponentMetadata#onInitComponent
	 * @function
	 */
	ComponentMetadata.prototype.onInitComponent = function() {
		if (this._iInstanceCount === 0 && !jQuery.isEmptyObject(this._mCustomizing)) {
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
	 * @name sap.ui.core.ComponentMetadata#onExitComponent
	 * @function
	 */
	ComponentMetadata.prototype.onExitComponent = function() {
		this._iInstanceCount--;
		if (this._iInstanceCount === 0 && !jQuery.isEmptyObject(this._mCustomizing)) {
			if (sap.ui.core.CustomizingConfiguration) {
				sap.ui.core.CustomizingConfiguration.deactivateForComponent(this._sComponentName);
			}
		}
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
	 * @name sap.ui.core.ComponentMetadata#getCustomEntry
	 * @function
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
	 * Returns the dependencies defined in the metadata of the component. If not specified, the return value is null.
	 * @return {Object} Component dependencies. 
	 * @public
	 * @name sap.ui.core.ComponentMetadata#getDependencies
	 * @function
	 */
	ComponentMetadata.prototype.getDependencies = function() {
		return this._mDependencies;
	};
	
	/**
	 * Returns the array of the included files that the Component requires such as css and js. If not specified or the array is empty, the return value is null.
	 * @return {string[]} Included files.
	 * @public
	 * @name sap.ui.core.ComponentMetadata#getIncludes
	 * @function
	 */
	ComponentMetadata.prototype.getIncludes = function() {
		return (this._aIncludes && this._aIncludes.length > 0) ? this._aIncludes : null;
	};
	
	/**
	 * Returns the required version of SAP UI5 defined in the metadata of the Component. If returned value is null, then no special UI5 version is required.
	 * @return {string} Required version of UI5 or if not specified then null.
	 * @public
	 * @name sap.ui.core.ComponentMetadata#getUI5Version
	 * @function
	 */
	ComponentMetadata.prototype.getUI5Version = function() {
		return this._mDependencies ? this._mDependencies.ui5version : null;
	};
	
	/**
	 * Returns array of components specified in the metadata of the Component. If not specified or the array is empty, the return value is null.
	 * @return {string[]} Required Components.
	 * @public
	 * @name sap.ui.core.ComponentMetadata#getComponents
	 * @function
	 */
	ComponentMetadata.prototype.getComponents = function() {
		var aComponents = null;
		if (this._mDependencies) {
			if (this._mDependencies.components && (this._mDependencies.components.length > 0) ) {
				aComponents = this._mDependencies.components;
			}
		}
		return aComponents;
	};
	
	/**
	 * Returns array of libraries specified in metadata of the Component, that are automatically loaded when an instance of the component is created.
	 * If not specified or the array is empty, the return value is null.
	 * @return {string[]} Required libraries.
	 * @public
	 * @name sap.ui.core.ComponentMetadata#getLibs
	 * @function
	 */
	ComponentMetadata.prototype.getLibs = function() {
		var aLibs = null;
		if (this._mDependencies) {
			if (this._mDependencies.libs && (this._mDependencies.libs.length > 0) ) {
				aLibs = this._mDependencies.libs;
			}
		}
		return aLibs;
	};
	
	/**
	 * Returns the version of the component. If not specified, the return value is null.
	 * @return {string} The version of the component.
	 * @public
	 * @name sap.ui.core.ComponentMetadata#getVersion
	 * @function
	 */
	ComponentMetadata.prototype.getVersion = function() {
		return this._sVersion;
	};
	
	
	/**
	 * Returns a copy of the configuration property to disallow modifications. If no 
	 * key is specified it returns the complete configuration property.
	 * @param {string} [sKey] the key of the configuration property
	 * @return {object} the value of the configuration property
	 * @public
	 * @since 1.15.1
	 * @name sap.ui.core.ComponentMetadata#getConfig
	 * @function
	 */
	ComponentMetadata.prototype.getConfig = function(sKey) {
		return this._mConfig ? jQuery.extend({}, sKey ? this._mConfig[sKey] : this._mConfig) : undefined;
	};
	
	
	/**
	 * Returns a copy of the customizing property
	 * @return {object} the value of the customizing property
	 * @private
	 * @since 1.15.1
	 * @experimental Since 1.15.1. Implementation might change. 
	 * @name sap.ui.core.ComponentMetadata#getCustomizing
	 * @function
	 */
	ComponentMetadata.prototype.getCustomizing = function() {
		return this._mCustomizing ? jQuery.extend({}, this._mCustomizing) : undefined;
	};
	
	
	/**
	 * Returns the models configuration which defines the available models of the
	 * component. 
	 * @return {object} models configuration
	 * @private
	 * @since 1.15.1 
	 * @experimental Since 1.15.1. Implementation might change. 
	 * @name sap.ui.core.ComponentMetadata#getModels
	 * @function
	 */
	ComponentMetadata.prototype.getModels = function() {
		return this._mModels;
	};
	
	/**
	 * Returns the services configuration which defines the available services of the
	 * component. 
	 * @return {object} services configuration
	 * @private
	 * @since 1.15.1 
	 * @experimental Since 1.15.1. Implementation might change. 
	 * @name sap.ui.core.ComponentMetadata#getServices
	 * @function
	 */
	ComponentMetadata.prototype.getServices = function() {
		return this._mServices;
	};
	
	/**
	 * Loads the included CSS and JavaScript resources. The resources will be 
	 * resoloved relative to the component location. 
	 * 
	 * @private
	 * @name sap.ui.core.ComponentMetadata#_loadIncludes
	 * @function
	 */
	ComponentMetadata.prototype._loadIncludes = function() {
	
		// afterwards we load our includes!
		var aIncludes = this.getIncludes();
		if (aIncludes && aIncludes.length > 0) {
			var that = this;
			var sLibName = this.getLibraryName();
			jQuery.each(aIncludes, function(i, sFile) {
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
			});
		}
		
	};
	
	/**
	 * Load external dependencies (like libraries and components)
	 * 
	 * @private
	 * @name sap.ui.core.ComponentMetadata#_loadDependencies
	 * @function
	 */
	ComponentMetadata.prototype._loadDependencies = function() {
	
		// afterwards we load our dependencies!
		var that = this,
			oDep = this.getDependencies();
		if (oDep) {
			
			// load the libraries
			var aLibraries = oDep.libs;
			if (aLibraries) {
				jQuery.each(aLibraries, function(i, sLib) {
					jQuery.sap.log.info("Component \"" + that.getName() + "\" is loading library: \"" + sLib + "\"");
					sap.ui.getCore().loadLibrary(sLib);
				});
			}
			
			// load the components
			var aComponents = oDep.components;
			if (aComponents) {
				jQuery.each(aComponents, function(i, sName){
					jQuery.sap.log.info("Component \"" + that.getName() + "\" is loading component: \"" + sName + ".Component\"");
					sap.ui.component.load({
						name: sName
					});
				});
			}
			
		}
		
	};
	

	return ComponentMetadata;

}, /* bExport= */ true);
