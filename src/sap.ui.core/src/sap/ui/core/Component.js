/*
 * ${copyright}
 */

// Provides base class sap.ui.core.Component for all components
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', './Manifest', './ComponentMetadata', './Core', 'sap/ui/thirdparty/URI', 'jquery.sap.trace'],
	function(jQuery, ManagedObject, Manifest, ComponentMetadata, Core, URI /*, jQuery*/) {
	"use strict";

	/*global Promise */

	/**
	 * Utility function which adds SAP-specific parameters to a URI instance
	 *
	 * @param {URI} oUri URI.js instance
	 * @private
	 */
	function addSapParams(oUri) {
		['sap-client', 'sap-server'].forEach(function(sName) {
			if (!oUri.hasSearch(sName)) {
				var sValue = sap.ui.getCore().getConfiguration().getSAPParam(sName);
				if (sValue) {
					oUri.addSearch(sName, sValue);
				}
			}
		});
	}

	/**
	 * Utility function which merges a map of property definitions to track
	 * from which "source" a property was defined.
	 *
	 * This function is used to find out which Component has defined
	 * which "dataSource/model".
	 *
	 * @param {object} mDefinitions Map with definitions to check
	 * @param {object} mDefinitionSource Object to extend with definition - source mapping
	 * @param {object} mSourceData Actual map with definitions
	 * @param {object} oSource Corresponding source object which should be assigned to the definitions-source map
	 * @private
	 */
	function mergeDefinitionSource(mDefinitions, mDefinitionSource, mSourceData, oSource) {
		if (mSourceData) {
			for (var sName in mDefinitions) {
				if (!mDefinitionSource[sName] && mSourceData[sName] && mSourceData[sName].uri) {
					mDefinitionSource[sName] = oSource;
				}
			}
		}
	}

	/**
	 * Returns the configuration of a manifest section or the value for a
	 * specific path. If no section or key is specified, the return value is null.
	 *
	 * @param {sap.ui.core.ComponentMetadata} oMetadata the Component metadata
	 * @param {sap.ui.core.Manifest} oManifest the manifest
	 * @param {string} sKey Either the manifest section name (namespace) or a concrete path
	 * @param {boolean} [bMerged] Indicates whether the manifest entry is merged with the manifest entries of the parent component.
	 * @return {any|null} Value of the manifest section or the key (could be any kind of value)
	 * @private
	 * @see {@link sap.ui.core.Component#getManifestEntry}
	 */
	function getManifestEntry(oMetadata, oManifest, sKey, bMerged) {
		var oData = oManifest.getEntry(sKey);

		// merge / extend should only be done for objects or when entry wasn't found
		if (oData !== undefined && !jQuery.isPlainObject(oData)) {
			return oData;
		}

		// merge the configuration of the parent manifest with local manifest
		// the configuration of the static component metadata will be ignored
		var oParent, oParentData;
		if (bMerged && (oParent = oMetadata.getParent()) instanceof ComponentMetadata) {
			oParentData = oParent.getManifestEntry(sKey, bMerged);
		}

		// only extend / clone if there is data
		// otherwise "null" will be converted into an empty object
		if (oParentData || oData) {
				oData = jQuery.extend(true, {}, oParentData, oData);
		}

		return oData;
	}

	/**
	 * Utility function which creates a metadata proxy object for the given
	 * metadata object
	 *
	 * @param {sap.ui.core.ComponentMetadata} oMetadata the Component metadata
	 * @param {sap.ui.core.Manifest} oManifest the manifest
	 * @return {sap.ui.core.ComponentMetadata} a metadata proxy object
	 */
	function createMetadataProxy(oMetadata, oManifest) {

		// create a proxy for the metadata object and simulate to be an
		// instance of the original metadata object of the Component
		// => retrieving the prototype from the original metadata to
		//    support to proxy sub-classes of ComponentMetadata
		var oMetadataProxy = Object.create(Object.getPrototypeOf(oMetadata));

		// provide internal access to the static metadata object
		oMetadataProxy._oMetadata = oMetadata;
		oMetadataProxy._oManifest = oManifest;

		// copy all functions from the metadata object except of the
		// manifest related functions which will be instance specific now
		for (var m in oMetadata) {
			if (!/^(getManifest|getManifestObject|getManifestEntry|getMetadataVersion)$/.test(m) && typeof oMetadata[m] === "function") {
				oMetadataProxy[m] = oMetadata[m].bind(oMetadata);
			}
		}

		// return the content of the manifest instead of the static metadata
		oMetadataProxy.getManifest = function() {
			return oManifest && oManifest.getJson();
		};
		oMetadataProxy.getManifestObject = function() {
			return oManifest;
		};
		oMetadataProxy.getManifestEntry = function(sKey, bMerged) {
			return getManifestEntry(oMetadata, oManifest, sKey, bMerged);
		};
		oMetadataProxy.getMetadataVersion = function() {
			return 2; // instance specific manifest => metadata version 2!
		};

		return oMetadataProxy;

	}


	/**
	 * Calls the function <code>fn</code> once and marks all ManagedObjects
	 * created during that call as "owned" by the given ID.
	 *
	 * @param {function} fn Function to execute
	 * @param {string} sOwnerId Id of the owner
	 * @return {any} result of function <code>fn</code>
	 */
	function runWithOwner(fn, sOwnerId) {

		jQuery.sap.assert(typeof fn === "function", "fn must be a function");

		var oldOwnerId = ManagedObject._sOwnerId;
		try {
			ManagedObject._sOwnerId = sOwnerId;
			return fn.call();
		} finally {
			ManagedObject._sOwnerId = oldOwnerId;
		}

	}


	/**
	 * Creates and initializes a new Component with the given <code>sId</code> and
	 * settings.
	 *
	 * The set of allowed entries in the <code>mSettings</code> object depends on
	 * the concrete subclass and is described there. See {@link sap.ui.core.Component}
	 * for a general description of this argument.
	 *
	 * @param {string}
	 *            [sId] Optional ID for the new control; generated automatically if
	 *            no non-empty ID is given. Note: this can be omitted, no matter
	 *            whether <code>mSettings</code> are given or not!
	 * @param {object}
	 *            [mSettings] Optional object with initial settings for the
	 *            new Component instance
	 * @public
	 *
	 * @class Base Class for Component.
	 * @extends sap.ui.base.ManagedObject
	 * @abstract
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.Component
	 * @since 1.9.2
	 */
	var Component = ManagedObject.extend("sap.ui.core.Component", /** @lends sap.ui.core.Component.prototype */

	{
		constructor : function(sId, mSettings) {

			// create a copy of arguments for later handover to ManagedObject
			var args = Array.prototype.slice.call(arguments);

			// identify how the constructor has been used to extract the settings
			if (typeof sId !== "string") {
				mSettings = sId;
				sId = undefined;
			}

			/**
			 * Checks whether a settings object was provided plus a proxy for
			 * the metadata object. If <strong>true</strong> the metadata proxy
			 * and the manifest will be stored at the instance of the Component.
			 *
			 * @param  {string} [mSettings._metadataProxy]
			 *         The proxy object for the metadata
			 */
			if (mSettings && typeof mSettings._metadataProxy === "object") {

				// set the concrete metadata proxy and the manifest and
				// delete the metadata proxy setting to avoid assert issues
				this._oMetadataProxy = mSettings._metadataProxy;
				this._oManifest = mSettings._metadataProxy._oManifest;
				delete mSettings._metadataProxy;

				/**
				 * Returns the metadata object which has been adopted to return
				 * the <strong>instance specific</strong> manifest.
				 *
				 * @return {object} the proxy object of the component metadata
				 */
				this.getMetadata = function() {
					return this._oMetadataProxy;
				};

			}

			if (mSettings && typeof mSettings._cacheTokens === "object") {
				this._mCacheTokens = mSettings._cacheTokens;
				delete mSettings._cacheTokens;
			}

			// registry of models from manifest
			if (mSettings && typeof mSettings._manifestModels === "object") {
				// use already created models from sap.ui.component.load if available
				this._mManifestModels = mSettings._manifestModels;
				delete mSettings._manifestModels;
			} else {
				this._mManifestModels = {};
			}

			// registry for services
			this._mServices = {};

			ManagedObject.apply(this, args);

		},

		metadata : {
			stereotype : "component",
			"abstract": true,
			specialSettings: {
				/*
				 * Component data
				 */
				componentData: 'any'
			},
			version : "0.0",
			/*enable/disable type validation by MessageManager
			handleValidation: 'boolean'*/
			includes : [],    // css, javascript files that should be used in the component
			dependencies : {  // external dependencies
				libs : [],
				components : [],
				ui5version : ""
			},
			config: {}, // static configuration
			customizing: { // component/view customizing

				/* Example:
				"sap.ui.viewReplacements": {
					"sap.xx.org.Main": {
						viewName: "sap.xx.new.Main",
						type: "XML"
					}
				},
				"sap.ui.viewExtensions": {
					"sap.xx.new.Main": {
						"extensionX": {
							name: "sap.xx.new.Fragment1",
							type: "sap.ui.core.XMLFragment"
						},
						"extensionY": {
							...
						}
					}
				},
				"sap.ui.controllerExtensions": {
					"sap.xx.org.Main": {
						"controllerName": "sap.xx.new.Main",
						"controllerNames": ["sap.xx.new.Sub1", "sap.xx.new.Sub2"]
					}
				},
				"sap.ui.viewModification": {
					"sap.xx.new.Main": {
						"myControlId": {
							text: "{i18n_custom>mytext}"
						}
					}
				}
				*/
			},
			/*
			properties: {
				config : "any"
			},
			*/
			library: "sap.ui.core"
		}

	}, /* Metadata constructor */ ComponentMetadata);

	/**
	 * Returns the metadata for the Component class.
	 *
	 * @return {sap.ui.core.ComponentMetadata} Metadata for the Component class.
	 * @static
	 * @public
	 * @name sap.ui.core.Component.getMetadata
	 * @function
	 */

	/**
	 * Returns the metadata for the specific class of the current instance.
	 *
	 * @return {sap.ui.core.ComponentMetadata} Metadata for the specific class of the current instance.
	 * @public
	 * @name sap.ui.core.Component#getMetadata
	 * @function
	 */

	/**
	 * Returns the manifest defined in the metadata of the component.
	 * If not specified, the return value is null.
	 *
	 * @return {object} manifest.
	 * @public
	 * @since 1.33.0
	 */
	Component.prototype.getManifest = function() {
		if (!this._oManifest) {
			return this.getMetadata().getManifest();
		} else {
			return this._oManifest.getJson();
		}
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
	 * <li><b>By section/namespace</b>: <code>oComponent.getManifestEntry("sap.ui5")</code></li>
	 * <li><b>By path</b>: <code>oComponent.getManifestEntry("/sap.ui5/dependencies/libs")</code></li>
	 * </ul>
	 *
	 * By section/namespace returns the configuration for the specified manifest
	 * section and by path allows to specify a concrete path to a dedicated entry
	 * inside the manifest. The path syntax always starts with a slash (/).
	 *
	 * @param {string} sKey Either the manifest section name (namespace) or a concrete path
	 * @return {any|null} Value of the manifest section or the key (could be any kind of value)
	 * @public
	 * @since 1.33.0
	 */
	Component.prototype.getManifestEntry = function(sKey) {
		return this._getManifestEntry(sKey);
	};

	/**
	 * Returns the configuration of a manifest section or the value for a
	 * specific path. If no section or key is specified, the return value is null.
	 *
	 * @param {string} sKey Either the manifest section name (namespace) or a concrete path
	 * @param {boolean} [bMerged] Indicates whether the manifest entry is merged with the manifest entries of the parent component.
	 * @return {any|null} Value of the manifest section or the key (could be any kind of value)
	 * @see {@link #getManifestEntry}
	 * @private
	 * @since 1.34.2
	 */
	Component.prototype._getManifestEntry = function(sKey, bMerged) {
		if (!this._oManifest) {
			return this.getMetadata().getManifestEntry(sKey, bMerged);
		} else {
			return getManifestEntry(this.getMetadata(), this._oManifest, sKey, bMerged);
		}
	};

	/**
	 * Returns the manifest object.
	 * @return {sap.ui.core.Manifest} manifest.
	 * @public
	 * @since 1.33.0
	 */
	Component.prototype.getManifestObject = function() {
		if (!this._oManifest) {
			return this.getMetadata().getManifestObject();
		} else {
			return this._oManifest;
		}
	};

	/**
	 * Returns true, if the Component instance is a variant.
	 * @TODO more details
	 *
	 * @return {boolean} true, if the Component instance is a variant
	 * @private
	 * @since 1.45.0
	 */
	Component.prototype._isVariant = function() {
		if (this._oManifest) {
			// read the "/sap.app/id" from static manifest/metadata
			var sMetadataId = this._oMetadataProxy._oMetadata.getManifestEntry("/sap.app/id");
			// a variant differs in the "/sap.app/id"
			return sMetadataId !== this.getManifestEntry("/sap.app/id");
		} else {
			return false;
		}
	};

	/**
	 * Activates the Customizing configuration for the given Component.
	 * @param {string} sComponentName the name of the component to activate
	 * @private
	 * @deprecated Since 1.21.0 as it is handled by component instantiation
	 */
	Component.activateCustomizing = function(sComponentName) {
		// noop since it will be handled by component instantiation
	};

	/**
	 * Deactivates the Customizing configuration for the given Component.
	 * @param {string} sComponentName Name of the Component to activate
	 * @private
	 * @deprecated Since 1.21.0 as it is handled by component termination
	 */
	Component.deactivateCustomizing = function(sComponentName) {
		// noop since it will be handled by component termination
	};

	// ---- Ownership functionality ------------------------------------------------------------

	//
	// Implementation note: the whole ownership functionality is now part of Component
	//  a) to ensure that only Components are used as owners
	//  b) to keep component related code out of ManagedObject as far as possible
	//
	// Only exception is the _sOwnerId property and its assignment in the ManagedObject
	// constructor, but that doesn't require much knowledge about components

	/**
	 * Returns the ID of the object in whose "context" the given ManagedObject has been created.
	 *
	 * For objects that are not ManagedObjects or for which the owner is unknown,
	 * <code>undefined</code> will be returned as owner ID.
	 *
	 * <strong>Note</strong>: Ownership for objects is only checked by the framework at the time
	 * when they are created. It is not checked or updated afterwards. And it can only be detected
	 * while the {@link sap.ui.core.Component#runAsOwner Component.runAsOwner} function is executing.
	 * Without further action, this is only the case while the content of a UIComponent is
	 * {@link sap.ui.core.UIComponent#createContent constructed} or when a
	 * {@link sap.ui.core.routing.Router Router} creates a new View and its content.
	 *
	 * <strong>Note</strong>: This method does not guarantee that the returned owner ID belongs
	 * to a Component. Currently, it always does. But future versions of UI5 might introduce a
	 * more fine grained ownership concept, e.g. taking Views into account. Callers that
	 * want to deal only with components as owners, should use the following method:
	 * {@link sap.ui.core.Component.getOwnerComponentFor Component.getOwnerComponentFor}.
	 * It guarantees that the returned object (if any) will be a Component.
	 *
	 * <strong>Further note</strong> that only the ID of the owner is recorded. In rare cases,
	 * when the lifecycle of a ManagedObject is not bound to the lifecycle of its owner,
	 * (e.g. by the means of aggregations), then the owner might have been destroyed already
	 * whereas the ManagedObject is still alive. So even the existence of an owner ID is
	 * not a guarantee for the existence of the corresponding owner.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject Object to retrieve the owner ID for
	 * @return {string} ID of the owner or <code>undefined</code>
	 * @static
	 * @public
	 * @since 1.15.1
	 */
	Component.getOwnerIdFor = function(oObject) {
		jQuery.sap.assert(oObject instanceof ManagedObject, "oObject must be given and must be a ManagedObject");
		var sOwnerId = ( oObject instanceof ManagedObject ) && oObject._sOwnerId;
		return sOwnerId || undefined; // no or empty id --> undefined
	};

	/**
	 * Returns the Component instance in whose "context" the given ManagedObject has been created
	 * or <code>undefined</code>.
	 *
	 * This is a convenience wrapper around {@link sap.ui.core.Component.getOwnerIdFor Component.getOwnerIdFor}.
	 * If the owner ID cannot be determined for reasons documented on <code>getOwnerForId</code>
	 * or when the Component for the determined ID no longer exists, <code>undefined</code>
	 * will be returned.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject Object to retrieve the owner Component for
	 * @return {sap.ui.core.Component} the owner Component or <code>undefined</code>.
	 * @static
	 * @public
	 * @since 1.25.1
	 */
	Component.getOwnerComponentFor = function(oObject) {
		var sOwnerId = Component.getOwnerIdFor(oObject);
		return sOwnerId && sap.ui.component(sOwnerId);
	};

	/**
	 * Calls the function <code>fn</code> once and marks all ManagedObjects
	 * created during that call as "owned" by this Component.
	 *
	 * Nested calls of this method are supported (e.g. inside a newly created,
	 * nested component). The currently active owner Component will be remembered
	 * before executing <code>fn</code> and restored afterwards.
	 *
	 * @param {function} fn Function to execute
	 * @return {any} result of function <code>fn</code>
	 * @since 1.25.1
	 * @public
	 */
	Component.prototype.runAsOwner = function(fn) {
		return runWithOwner(fn, this.getId());
	};

	// ---- ----

	/**
	 * @see sap.ui.base.Object#getInterface
	 * @public
	 */
	Component.prototype.getInterface = function() {
		return this;
	};

	/*
	 * initialize the Component and keep the component data
	 */
	Component.prototype._initCompositeSupport = function(mSettings) {

		// make user specific data available during component instantiation
		this.oComponentData = mSettings && mSettings.componentData;

		// static initialization (loading dependencies, includes, ... / register customzing)
		//   => either init the static or the instance manifest
		if (!this._isVariant()) {
			this.getMetadata().init();
		} else {
			this._oManifest.init(this);
		}

		// init the component models
		this.initComponentModels();

		// error handler (if exists)
		if (this.onWindowError) {
			this._fnWindowErrorHandler = jQuery.proxy(function(oEvent) {
				var oError = oEvent.originalEvent;
				this.onWindowError(oError.message, oError.filename, oError.lineno);
			}, this);
			jQuery(window).bind("error", this._fnWindowErrorHandler);
		}

		// before unload handler (if exists)
		if (this.onWindowBeforeUnload) {
			this._fnWindowBeforeUnloadHandler = jQuery.proxy(this.onWindowBeforeUnload, this);
			jQuery(window).bind("beforeunload", this._fnWindowBeforeUnloadHandler);
		}

		// unload handler (if exists)
		if (this.onWindowUnload) {
			this._fnWindowUnloadHandler = jQuery.proxy(this.onWindowUnload, this);
			jQuery(window).bind("unload", this._fnWindowUnloadHandler);
		}

	};

	/*
	 * clean up the component and its dependent entities like models or event handlers
	 */
	Component.prototype.destroy = function() {

		// destroy all services
		for (var sLocalServiceAlias in this._mServices) {
			if (this._mServices[sLocalServiceAlias].instance) {
				this._mServices[sLocalServiceAlias].instance.destroy();
			}
		}
		delete this._mServices;

		// destroy all models created via manifest definition
		for (var sModelName in this._mManifestModels) {
			this._mManifestModels[sModelName].destroy();
		}
		delete this._mManifestModels;

		// remove the event handlers
		if (this._fnWindowErrorHandler) {
			jQuery(window).unbind("error", this._fnWindowErrorHandler);
			delete this._fnWindowErrorHandler;
		}
		if (this._fnWindowBeforeUnloadHandler) {
			jQuery(window).unbind("beforeunload", this._fnWindowBeforeUnloadHandler);
			delete this._fnWindowBeforeUnloadHandler;
		}
		if (this._fnWindowUnloadHandler) {
			jQuery(window).unbind("unload", this._fnWindowUnloadHandler);
			delete this._fnWindowUnloadHandler;
		}

		// destroy event bus
		if (this._oEventBus) {
			this._oEventBus.destroy();
			delete this._oEventBus;
		}

		// destroy the object
		ManagedObject.prototype.destroy.apply(this, arguments);

		// unregister for messaging (on MessageManager)
		sap.ui.getCore().getMessageManager().unregisterObject(this);

		// static initialization (unload includes, ... / unregister customzing)
		//   => either exit the static or the instance manifest
		if (!this._isVariant()) {
			this.getMetadata().exit();
		} else {
			this._oManifest.exit(this);
		}

	};


	/**
	 * Returns user specific data object
	 *
	 * @return {object} componentData
	 * @public
	 * @since 1.15.0
	 */
	Component.prototype.getComponentData = function() {
		return this.oComponentData;
	};


	/**
	 * Returns the event bus of this component.
	 * @return {sap.ui.core.EventBus} the event bus
	 * @since 1.20.0
	 * @public
	 */
	Component.prototype.getEventBus = function() {
		if (!this._oEventBus) {
			var EventBus = sap.ui.requireSync("sap/ui/core/EventBus");
			this._oEventBus = new EventBus();
		}
		return this._oEventBus;
	};

	/**
	 * Initializes the component models and services with the configuration
	 * as defined in the manifest.json.
	 *
	 * @private
	 */
	Component.prototype.initComponentModels = function() {

		// in case of having no parent metadata we simply skip that function
		// since this would mean to init the models on the Component base class
		var oMetadata = this.getMetadata();
		if (oMetadata.isBaseClass()) {
			return;
		}

		// retrieve the merged sap.app and sap.ui5 sections of the manifest
		// to create the models for the component + inherited ones
		var oManifestDataSources = this._getManifestEntry("/sap.app/dataSources", true) || {};
		var oManifestModels = this._getManifestEntry("/sap.ui5/models", true) || {};

		// pass the models and data sources to the internal helper
		this._initComponentModels(oManifestModels, oManifestDataSources);

	};

	/**
	 * Initializes the component models and services which are passed as
	 * parameters to this function.
	 *
	 * @param {object} mModels models configuration from manifest.json
	 * @param {object} mDataSources data sources configuration from manifest.json
	 *
	 * @private
	 */
	Component.prototype._initComponentModels = function(mModels, mDataSources) {

		var mAllModelConfigurations = Component._createManifestModelConfigurations({
			models: mModels,
			dataSources: mDataSources,
			component: this,
			mergeParent: true,
			cacheTokens: this._mCacheTokens
		});

		if (!mAllModelConfigurations) {
			return;
		}

		// filter out models which are already created
		var mModelConfigurations = {};
		for (var sModelName in mAllModelConfigurations) {
			if (!this._mManifestModels[sModelName]) {
				mModelConfigurations[sModelName] = mAllModelConfigurations[sModelName];
			}
		}

		// create all models which are not created, yet.
		var mCreatedModels = Component._createManifestModels(mModelConfigurations, this.toString());
		for (var sModelName in mCreatedModels) {
			// keep the model instance to be able to destroy the created models on component destroy
			this._mManifestModels[sModelName] = mCreatedModels[sModelName];
		}

		// set all the models to the component
		for (var sModelName in this._mManifestModels) {
			var oModel = this._mManifestModels[sModelName];

			// apply the model to the component with provided name ("" as key means unnamed model)
			this.setModel(oModel, sModelName || undefined);
		}

	};


	/**
	 * Returns a service interface for the {@link sap.ui.core.service.Service Service}
	 * declared in the descriptor for components (manifest.json). The declaration needs
	 * to be done in the <code>sap.ui5/services</code> section as follows:
	 * <pre>
	 * {
	 *   [...]
	 *   "sap.ui5": {
	 *     "services": {
	 *       "myLocalServiceAlias": {
	 *         "factoryName": "my.ServiceFactory",
	 *         ["optional": true]
	 *       }
	 *     }
	 *   }
	 *   [...]
	 * }
	 * </pre>
	 * The service declaration is used to define a mapping between the local
	 * alias for the service that can be used in the Component and the name of
	 * the service factory which will be used to create a service instance.
	 *
	 * The <code>getService</code> function will look up the service factory and will
	 * create a new instance by using the service factory function
	 * {@link sap.ui.core.service.ServiceFactory#createInstance createInstance}
	 * The optional property defines that the service is not mandatory and the
	 * usage will not depend on the availability of this service. When requesting
	 * an optional service the <code>getService</code> function will reject but
	 * there will be no error logged in the console.
	 *
	 * When creating a new instance of the service the Component context will be
	 * passed as <code>oServiceContext</code> as follows:
	 * <pre>
	 * {
	 *   "scopeObject": this,     // the Component instance
	 *   "scopeType": "component" // the stereotype of the scopeObject
	 * }
	 * </pre>
	 *
	 * The service will be created only once per Component and reused in future
	 * calls to the <code>getService</code> function.
	 * <p>
	 * This function will return a <code>Promise</code> which provides the service
	 * interface when resolved. If the <code>factoryName</code> could not
	 * be found in the {@link sap.ui.core.service.ServiceFactoryRegistry Service Factory Registry}
	 * or the service declaration in the descriptor for components (manifest.json)
	 * is missing the Promise will reject.
	 *
	 * This is an example of how the <code>getService</code> function can be used:
	 * <pre>
	 * oComponent.getService("myLocalServiceAlias").then(function(oService) {
	 *   oService.doSomething();
	 * }).catch(function(oError) {
	 *   jQuery.sap.log.error(oError);
	 * });
	 * </pre>
	 *
	 * @param {string} sLocalServiceAlias Local service alias as defined in the manifest.json
	 * @return {Promise} Promise which will be resolved with the Service interface
	 * @public
	 * @since 1.37.0
	 */
	Component.prototype.getService = function(sLocalServiceAlias) {

		// check whether the Service has already been created or not
		if (!this._mServices[sLocalServiceAlias]) {

			this._mServices[sLocalServiceAlias] = {};

			// cache the promise to avoid redundant creation
			this._mServices[sLocalServiceAlias].promise = new Promise(function(fnResolve, fnReject) {

				sap.ui.require(["sap/ui/core/service/ServiceFactoryRegistry"], function(ServiceFactoryRegistry){

					var oServiceManifestEntry = this.getManifestEntry("/sap.ui5/services/" + sLocalServiceAlias);

					// lookup the factoryName in the manifest
					var sServiceFactoryName = oServiceManifestEntry.factoryName;
					if (!sServiceFactoryName) {
						fnReject(new Error("Service " + sLocalServiceAlias + " not declared!"));
						return;
					}

					// lookup the factory in the registry
					var oServiceFactory = ServiceFactoryRegistry.get(sServiceFactoryName);
					if (oServiceFactory) {
						// create a new Service instance with the current Component as context
						oServiceFactory.createInstance({
							scopeObject: this,
							scopeType: "component",
							settings: oServiceManifestEntry.settings || {}
						}).then(function(oServiceInstance) {
							if (!this.bIsDestroyed) {
								// store the created Service instance and interface
								this._mServices[sLocalServiceAlias].instance = oServiceInstance;
								this._mServices[sLocalServiceAlias].interface = oServiceInstance.getInterface();

								// return the Service interface
								fnResolve(this._mServices[sLocalServiceAlias].interface);
							} else {
								fnReject(new Error("Service " + sLocalServiceAlias + " could not be loaded as its Component was destroyed."));
							}
						}.bind(this)).catch(fnReject);

					} else {

						// the Service Factory could not be found in the registry
						var sErrorMessage = "The ServiceFactory " + sServiceFactoryName + " for Service " + sLocalServiceAlias + " not found in ServiceFactoryRegistry!";
						var bOptional = this.getManifestEntry("/sap.ui5/services/" + sLocalServiceAlias + "/optional");
						if (!bOptional) {
							// mandatory services will log an error into the console
							jQuery.sap.log.error(sErrorMessage);
						}
						fnReject(new Error(sErrorMessage));

					}
				}.bind(this));
			}.bind(this));
		}
		return this._mServices[sLocalServiceAlias].promise;
	};

	/**
	 * Internal activation function for non lazy services which should be started immediately
	 *
	 * @param {sap.ui.core.Component} oComponent The Component instance
	 *
	 * @private
	*/
	function activateServices(oComponent) {
		var oServices = oComponent.getManifestEntry("/sap.ui5/services");
		for (var sService in oServices) {
			if (oServices[sService].lazy === false) {
				oComponent.getService(sService);
			}
		}
	}


	/**
	 * Creates a nested component that is declared in the <code>sap.ui5/componentUsages</code> section of
	 * the descriptor (manifest.json). The following snippet shows the declaration:
	 * <pre>
	 * {
	 *   [...]
	 *   "sap.ui5": {
	 *     "componentUsages": {
	 *       "myUsage": {
	 *         "name": "my.useful.Component"
	 *       }
	 *     }
	 *   }
	 *   [...]
	 * }
	 * </pre>
	 * The syntax of the configuration object of the component usage matches the
	 * configuration object of the {#link sap.ui.component} factory function.
	 *
	 * This is an example of how the <code>createComponent</code> function can
	 * be used for asynchronous scenarios:
	 * <pre>
	 * oComponent.createComponent("myUsage").then(function(oComponent) {
	 *   oComponent.doSomething();
	 * }).catch(function(oError) {
	 *   jQuery.sap.log.error(oError);
	 * });
	 * </pre>
	 *
	 * The following example shows how <code>createComponent</code> can be used to create a nested
	 * component by providing specific properties like <code>id</code>, <code>async</code>,
	 * <code>settings</code>, or <code>componentData</code>:
	 * <pre>
	 * var oComponent = oComponent.createComponent({
	 *   usage: "myUsage",
	 *   id: "myId",
	 *   settings: { ... },
	 *   componentData: { ... }
	 * });
	 * </pre>
	 * The allowed list of properties are defined in the parameter documentation
	 * of this function.
	 *
	 * The properties can also be defined in the descriptor. These properties can
	 * be overwritten by the local properties of that function.
	 *
	 * @param {string|object} vUsage ID of the component usage or the configuration object that creates the component
	 * @param {string} vUsage.usage ID of component usage
	 * @param {string} [vUsage.id] ID of the nested component that is prefixed with <code>autoPrefixId</code>
	 * @param {boolean} [vUsage.async=true] Indicates whether the component creation is done asynchronously (You should use synchronous creation only if really necessary, because this has a negative impact on performance.)
	 * @param {object} [vUsage.settings] Settings for the nested component like for {#link sap.ui.component} or the component constructor
	 * @param {object} [vUsage.componentData] Initial data of the component (@see sap.ui.core.Component#getComponentData)
	 * @return {sap.ui.core.Component|Promise} Component instance or Promise which will be resolved with the component instance (defaults to Promise / asynchronous behavior)
	 * @public
	 * @since 1.47.0
	 */
	Component.prototype.createComponent = function(vUsage) {
		jQuery.sap.assert(
			(typeof vUsage === 'string' && vUsage)
			|| (typeof vUsage === 'object' && typeof vUsage.usage === 'string' && vUsage.usage),
			"vUsage either must be a non-empty string or an object with a non-empty usage id"
		);

		// extract the config from the configuration object
		var mConfig = {
			async: true // async is by default true
		};
		if (vUsage && typeof vUsage === "object") {
			mConfig.usage = vUsage.usage;
			["id", "async", "settings", "componentData"].forEach(function(sName) {
				if (vUsage[sName] !== undefined) {
					mConfig[sName] = vUsage[sName];
				}
			});
		} else if (typeof vUsage === "string") {
			mConfig.usage = vUsage;
		}
		// create the component in the owner context of the current component
		return this._createComponent(mConfig);
	};


	/**
	 * Internal API to create a nested component with the owner context of the
	 * current component.
	 *
	 * @param {object} mConfig Configuration object that creates the component
	 * @return {sap.ui.core.Component|Promise} Component instance or Promise which will be resolved with the component instance
	 *
	 * @private
	 * @since 1.47.0
	 */
	Component.prototype._createComponent = function(mConfig) {
		// check the existence of the usage (mixin here for re-use in ComponentContainer)
		if (mConfig && mConfig.usage) {
			var sUsageId = mConfig.usage;
			var mUsageConfig = this.getManifestEntry("/sap.ui5/componentUsages/" + sUsageId);
			if (!mUsageConfig) {
				throw new Error("Component usage \"" + sUsageId + "\" not declared in Component \"" + this.getManifestObject().getComponentName() + "\"!");
			}
			// mix in the component configuration on top of the usage configuration
			mConfig = jQuery.extend(true, mUsageConfig, mConfig);
		}
		// create the nested component in the context of this component
		return this.runAsOwner(function() {
			return sap.ui.component(mConfig);
		});
	};


	/**
	 * Initializes the Component instance after creation.
	 *
	 * Applications must not call this hook method directly, it is called by the
	 * framework while the constructor of a Component is executed.
	 *
	 * Subclasses of Component should override this hook to implement any necessary
	 * initialization.
	 *
	 * @function
	 * @name sap.ui.core.Component.prototype.init
	 * @protected
	 */
	//Component.prototype.init = function() {};

	/**
	 * Cleans up the Component instance before destruction.
	 *
	 * Applications must not call this hook method directly, it is called by the
	 * framework when the element is {@link #destroy destroyed}.
	 *
	 * Subclasses of Component should override this hook to implement any necessary
	 * cleanup.
	 *
	 * @function
	 * @name sap.ui.core.Component.prototype.exit
	 * @protected
	 */
	//Component.prototype.exit = function() {};


	/**
	 * The window before unload hook. Override this method in your Component class
	 * implementation, to handle cleanup before the real unload or to prompt a question
	 * to the user, if the component should be exited.
	 *
	 * @return {string} a string if a prompt should be displayed to the user
	 *                  confirming closing the Component (e.g. when the Component is not yet saved).
	 * @public
	 * @since 1.15.1
	 * @name sap.ui.core.Component.prototype.onWindowBeforeUnload
	 * @function
	 */
	//onWindowBeforeUnload : function() {},


	/**
	 * The window unload hook. Override this method in your Component class
	 * implementation, to handle cleanup of the component once the window
	 * will be unloaded (e.g. closed).
	 *
	 * @public
	 * @since 1.15.1
	 * @name sap.ui.core.Component.prototype.onWindowUnload
	 * @function
	 */
	//onWindowUnload : function() {},


	/**
	 * The window error hook. Override this method in your Component class implementation
	 * to listen to unhandled errors.
	 *
	 * @param {string} sMessage The error message.
	 * @param {string} sFile File where the error occurred
	 * @param {number} iLine Line number of the error
	 * @public
	 * @since 1.15.1
	 * @name sap.ui.core.Component.prototype.onWindowError
	 * @function
	 */
	//onWindowError : null, // function(sMessage, sFile, iLine) - function not added directly as it might result in bad stack traces in older browsers


	/**
	 * The hook which gets called when the static configuration of the component
	 * has been changed by some configuration extension.
	 *
	 * @param {string} sConfigKey Error message.
	 * @public
	 * @since 1.15.1
	 * @name sap.ui.core.Component.prototype.onConfigChange
	 * @function
	 */
	//onConfigChange : null, // function(sConfigKey)


	/**
	 * Creates model configurations by processing "/sap.app/dataSources" and "/sap.ui5/models" manifest entries.
	 * Result can be handed over to {@link sap.ui.core.Component._createManifestModels} in order to create instances.
	 *
	 * @param {object} mOptions Configuration object (see below)
	 * @param {object} mOptions.models Manifest models section (/sap.ui5/models)
	 * @param {object} mOptions.dataSources Manifest dataSources section (/sap.app/dataSources)
	 * @param {sap.ui.core.Component} [mOptions.component] Corresponding component instance
	 * @param {sap.ui.core.Manifest} [mOptions.manifest] Component manifest instance (defaults to component's manifest if not set)
	 * @param {boolean} [mOptions.mergeParent=false] Whether the component's parent configuration should be taken into account (only relevant when component is set)
	 * @param {object} [mOptions.componentData] componentData object which should be used to create the configurations (only relevant when component is not set, defaults to componentData of provided component)
	 * @return {object} key-value map with model name as key and model configuration as value
	 * @private
	 */
	Component._createManifestModelConfigurations = function(mOptions) {
		var oComponent = mOptions.component;
		var oManifest = mOptions.manifest || oComponent.getManifestObject();
		var bMergeParent = mOptions.mergeParent;
		var mCacheTokens = mOptions.cacheTokens || {};
		var sLogComponentName = oComponent ? oComponent.toString() : oManifest.getComponentName();
		var oConfig = sap.ui.getCore().getConfiguration();

		if (!mOptions.models) {
			// skipping model creation because of missing sap.ui5 models manifest entry
			return null;
		}

		var mConfig = {

			// ui5 model definitions
			models: mOptions.models,

			// optional dataSources from "sap.app" manifest
			dataSources: mOptions.dataSources || {},

			// to identify where the dataSources/models have been originally defined
			origin: {
				dataSources: {},
				models: {}
			}

		};

		if (oComponent && bMergeParent) {
			// identify the configuration in parent chain
			var oMeta = oComponent.getMetadata();
			while (oMeta instanceof ComponentMetadata) {
				var oCurrentManifest = oMeta.getManifestObject();

				var mCurrentDataSources = oMeta.getManifestEntry("/sap.app/dataSources");
				mergeDefinitionSource(mConfig.dataSources, mConfig.origin.dataSources, mCurrentDataSources, oCurrentManifest);

				var mCurrentModelConfigs = oMeta.getManifestEntry("/sap.ui5/models");
				mergeDefinitionSource(mConfig.models, mConfig.origin.models, mCurrentModelConfigs, oCurrentManifest);

				oMeta = oMeta.getParent();
			}
		}

		var mModelConfigurations = {};

		// create a model for each ["sap.ui5"]["models"] entry
		for (var sModelName in mConfig.models) {

			var oModelConfig = mConfig.models[sModelName];
			var bIsDataSourceUri = false;
			var mMetadataUrlParams = null;

			// normalize dataSource shorthand, e.g.
			// "myModel": "myDataSource" => "myModel": { dataSource: "myDataSource" }
			if (typeof oModelConfig === 'string') {
				oModelConfig = {
					dataSource: oModelConfig
				};
			}

			// check for referenced dataSource entry and read out settings/uri/type
			// if not already provided in model config
			if (oModelConfig.dataSource) {

				var oDataSource = mConfig.dataSources && mConfig.dataSources[oModelConfig.dataSource];
				if (typeof oDataSource === 'object') {

					// default type is OData
					if (oDataSource.type === undefined) {
						oDataSource.type = 'OData';
					}

					// read out type and translate to model class
					// (only if no model type was set to allow overriding)
					if (!oModelConfig.type) {
						switch (oDataSource.type) {
							case 'OData':
								if (oDataSource.settings && oDataSource.settings.odataVersion === "4.0") {
									oModelConfig.type = 'sap.ui.model.odata.v4.ODataModel';
								} else {
									oModelConfig.type = 'sap.ui.model.odata.v2.ODataModel';
								}
								break;
							case 'JSON':
								oModelConfig.type = 'sap.ui.model.json.JSONModel';
								break;
							case 'XML':
								oModelConfig.type = 'sap.ui.model.xml.XMLModel';
								break;
							default:
								// for custom dataSource types, the class should already be specified in the sap.ui5 models config
						}
					}

					// use dataSource uri if it isn't already defined in model config
					if (!oModelConfig.uri) {
						oModelConfig.uri = oDataSource.uri;
						bIsDataSourceUri = true;
					}

					if (oDataSource.type === 'OData' && oDataSource.settings && typeof oDataSource.settings.maxAge === "number") {
						oModelConfig.settings = oModelConfig.settings || {};
						oModelConfig.settings.headers = oModelConfig.settings.headers || {};
						oModelConfig.settings.headers["Cache-Control"] = "max-age=" + oDataSource.settings.maxAge;
					}

					// read out OData annotations and create ODataModel settings for it
					if (oDataSource.type === 'OData' && oDataSource.settings && oDataSource.settings.annotations) {
						var aAnnotations = oDataSource.settings.annotations;

						for (var i = 0; i < aAnnotations.length; i++) {
							var oAnnotation = mConfig.dataSources[aAnnotations[i]];

							// dataSource entry should be defined!
							if (!oAnnotation) {
								jQuery.sap.log.error("Component Manifest: ODataAnnotation \"" + aAnnotations[i] + "\" for dataSource \"" + oModelConfig.dataSource + "\" could not be found in manifest", "[\"sap.app\"][\"dataSources\"][\"" + aAnnotations[i] + "\"]", sLogComponentName);
								continue;
							}

							// type should be ODataAnnotation!
							if (oAnnotation.type !== 'ODataAnnotation') {
								jQuery.sap.log.error("Component Manifest: dataSource \"" + aAnnotations[i] + "\" was expected to have type \"ODataAnnotation\" but was \"" + oAnnotation.type + "\"", "[\"sap.app\"][\"dataSources\"][\"" + aAnnotations[i] + "\"]", sLogComponentName);
								continue;
							}

							// uri is required!
							if (!oAnnotation.uri) {
								jQuery.sap.log.error("Component Manifest: Missing \"uri\" for ODataAnnotation \"" + aAnnotations[i] + "\"", "[\"sap.app\"][\"dataSources\"][\"" + aAnnotations[i] + "\"]", sLogComponentName);
								continue;
							}

							var oAnnotationUri = new URI(oAnnotation.uri);

							if (oModelConfig.type === 'sap.ui.model.odata.v2.ODataModel') {

								/* eslint-disable no-loop-func */
								["sap-language", "sap-client"].forEach(function(sName) {
									if (!oAnnotationUri.hasQuery(sName) && oConfig.getSAPParam(sName)) {
										oAnnotationUri.setQuery(sName, oConfig.getSAPParam(sName));
									}
								});
								/* eslint-enable no-loop-func */

								var sCacheToken = mCacheTokens.dataSources && mCacheTokens.dataSources[oAnnotation.uri];
								if (sCacheToken) {

									/* eslint-disable no-loop-func */
									var applyAnnotationCacheToken = function() {

										// 1. "sap-language" must be part of the annotation URI
										if (!oAnnotationUri.hasQuery("sap-language")) {
											jQuery.sap.log.warning("Component Manifest: Ignoring provided \"sap-context-token=" + sCacheToken + "\" for ODataAnnotation \"" + aAnnotations[i] + "\" (" + oAnnotationUri.toString() + "). " +
												"Missing \"sap-language\" URI parameter",
												"[\"sap.app\"][\"dataSources\"][\"" + aAnnotations[i] + "\"]", sLogComponentName);
											return;
										}

										// 2. "sap-client" must be set as URI param
										if (!oAnnotationUri.hasQuery("sap-client")) {
											jQuery.sap.log.warning("Component Manifest: Ignoring provided \"sap-context-token=" + sCacheToken + "\" for ODataAnnotation \"" + aAnnotations[i] + "\" (" + oAnnotationUri.toString() + "). " +
												"Missing \"sap-client\" URI parameter",
												"[\"sap.app\"][\"dataSources\"][\"" + aAnnotations[i] + "\"]", sLogComponentName);
											return;
										}

										// 3. "sap-client" must equal to the value of "sap.ui.getCore().getConfiguration().getSAPParam("sap-client")"
										if (!oAnnotationUri.hasQuery("sap-client", oConfig.getSAPParam("sap-client"))) {
											jQuery.sap.log.warning("Component Manifest: Ignoring provided \"sap-context-token=" + sCacheToken + "\" for ODataAnnotation \"" + aAnnotations[i] + "\" (" + oAnnotationUri.toString() + "). " +
												"URI parameter \"sap-client=" + oAnnotationUri.query(true)["sap-client"] + "\" must be identical with configuration \"sap-client=" + oConfig.getSAPParam("sap-client") + "\"",
												"[\"sap.app\"][\"dataSources\"][\"" + aAnnotations[i] + "\"]", sLogComponentName);
											return;
										}

										// Overriding the parameter is fine as the given one should be the most up-to-date
										if (oAnnotationUri.hasQuery("sap-context-token") && !oAnnotationUri.hasQuery("sap-context-token", sCacheToken)) {
											var existingContextToken = oAnnotationUri.query(true)["sap-context-token"];
											jQuery.sap.log.warning("Component Manifest: Overriding existing \"sap-context-token=" + existingContextToken + "\" with provided value \"" + sCacheToken + "\" for ODataAnnotation \"" + aAnnotations[i] + "\" (" + oAnnotationUri.toString() + ").",
												"[\"sap.app\"][\"dataSources\"][\"" + aAnnotations[i] + "\"]", sLogComponentName);
										}

										// Finally, set the sap-context-token
										oAnnotationUri.setQuery("sap-context-token", sCacheToken);

									};
									/* eslint-enable no-loop-func */

									applyAnnotationCacheToken();

								}
							}

							// resolve relative to component
							var oAnnotationSourceManifest = mConfig.origin.dataSources[aAnnotations[i]] || oManifest;
							var sAnnotationUri = oAnnotationSourceManifest.resolveUri(oAnnotationUri).toString();

							// add uri to annotationURI array in settings (this parameter applies for ODataModel v1 & v2)
							oModelConfig.settings = oModelConfig.settings || {};
							oModelConfig.settings.annotationURI = oModelConfig.settings.annotationURI || [];
							oModelConfig.settings.annotationURI.push(sAnnotationUri);
						}
					}

				} else {
					jQuery.sap.log.error("Component Manifest: dataSource \"" + oModelConfig.dataSource + "\" for model \"" + sModelName + "\" not found or invalid", "[\"sap.app\"][\"dataSources\"][\"" + oModelConfig.dataSource + "\"]", sLogComponentName);
				}
			}

			// model type is required!
			if (!oModelConfig.type) {
				jQuery.sap.log.error("Component Manifest: Missing \"type\" for model \"" + sModelName + "\"", "[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
				continue;
			}

			// set mode of old ODataModel to "json" (default is xml).
			// as the automatic model creation is a new feature, this is not incompatible here
			if (oModelConfig.type === 'sap.ui.model.odata.ODataModel' &&
					(!oModelConfig.settings || oModelConfig.settings.json === undefined)) {
					// do not overwrite the flag if it was explicitly defined!

					oModelConfig.settings = oModelConfig.settings || {};
					oModelConfig.settings.json = true;
			}

			// adopt model uri
			if (oModelConfig.uri) {

				// parse model URI to be able to modify it
				var oUri = new URI(oModelConfig.uri);

				// resolve URI relative to component which defined it
				var oUriSourceManifest = (bIsDataSourceUri ? mConfig.origin.dataSources[oModelConfig.dataSource] : mConfig.origin.models[sModelName]) || oManifest;
				oUri = oUriSourceManifest.resolveUri(oUri);

				// inherit sap-specific parameters from document (only if "sap.app/dataSources" reference is defined)
				if (oModelConfig.dataSource) {
					addSapParams(oUri);

					if (oModelConfig.type === 'sap.ui.model.odata.v2.ODataModel') {

						// Handle sap-language URI parameter
						// Do not add it if it is already set in the "metadataUrlParams" or is part of the model URI
						mMetadataUrlParams = oModelConfig.settings && oModelConfig.settings.metadataUrlParams;
						if ((!mMetadataUrlParams || typeof mMetadataUrlParams['sap-language'] === 'undefined')
							&& !oUri.hasQuery('sap-language')
							&& oConfig.getSAPParam('sap-language')
						) {

							// Lazy initialize settings and metadataUrlParams objects
							oModelConfig.settings = oModelConfig.settings || {};
							mMetadataUrlParams = oModelConfig.settings.metadataUrlParams = oModelConfig.settings.metadataUrlParams || {};

							// Add sap-language only to $metadata URL params
							mMetadataUrlParams['sap-language'] = oConfig.getSAPParam('sap-language');
						}

						// Handle cacheTokens
						if (mCacheTokens.dataSources) {

							// Token lookup is based on exact URI defined in dataSource
							var sCacheToken = mCacheTokens.dataSources[oDataSource.uri];
							if (sCacheToken) {

								/* eslint-disable no-loop-func */
								var applyCacheToken = function() {

									// Prerequisite: sap-context-token must not be set in the model URI
									if (oUri.hasQuery("sap-context-token")) {
										jQuery.sap.log.warning("Component Manifest: Ignoring provided \"sap-context-token=" + sCacheToken + "\" for model \"" + sModelName + "\" (" + oUri.toString() + "). " +
											"Model URI already contains parameter \"sap-context-token=" + oUri.query(true)["sap-context-token"] + "\"",
											"[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
										return;
									}

									// 1. "sap-language" must be set in "oModelConfig.settings.metadataUrlParams"
									// or part of the model URI
									if ((!mMetadataUrlParams || typeof mMetadataUrlParams["sap-language"] === "undefined")
										&& !oUri.hasQuery("sap-language")
									) {
										jQuery.sap.log.warning("Component Manifest: Ignoring provided \"sap-context-token=" + sCacheToken + "\" for model \"" + sModelName + "\" (" + oUri.toString() + "). " +
											"Missing \"sap-language\" parameter",
											"[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
										return;
									}

									// 2. "sap-client" must be set as URI param in "oModelConfig.uri"
									if (!oUri.hasQuery("sap-client")) {
										jQuery.sap.log.warning("Component Manifest: Ignoring provided \"sap-context-token=" + sCacheToken + "\" for model \"" + sModelName + "\" (" + oUri.toString() + "). " +
											"Missing \"sap-client\" parameter",
											"[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
										return;
									}

									// 3. "sap-client" must equal to the value of "sap.ui.getCore().getConfiguration().getSAPParam('sap-client')"
									if (!oUri.hasQuery("sap-client", oConfig.getSAPParam("sap-client"))) {
										jQuery.sap.log.warning("Component Manifest: Ignoring provided \"sap-context-token=" + sCacheToken + "\" for model \"" + sModelName + "\" (" + oUri.toString() + "). " +
											"URI parameter \"sap-client=" + oUri.query(true)["sap-client"] + "\" must be identical with configuration \"sap-client=" + oConfig.getSAPParam("sap-client") + "\"",
											"[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
										return;
									}

									// 4. If "mMetadataUrlParams["sap-client"]" is set (which should not be done!), it must also equal to the value of the config
									if (mMetadataUrlParams && typeof mMetadataUrlParams["sap-client"] !== "undefined") {
										if (mMetadataUrlParams["sap-client"] !== oConfig.getSAPParam("sap-client")) {
											jQuery.sap.log.warning("Component Manifest: Ignoring provided \"sap-context-token=" + sCacheToken + "\" for model \"" + sModelName + "\" (" + oUri.toString() + "). " +
												"Parameter metadataUrlParams[\"sap-client\"] = \"" + mMetadataUrlParams["sap-client"] + "\" must be identical with configuration \"sap-client=" + oConfig.getSAPParam("sap-client") + "\"",
												"[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
											return;
										}
									}

									// Overriding the parameter is fine as the given one should be the most up-to-date
									if (mMetadataUrlParams && mMetadataUrlParams["sap-context-token"] && mMetadataUrlParams["sap-context-token"] !== sCacheToken) {
										jQuery.sap.log.warning("Component Manifest: Overriding existing \"sap-context-token=" + mMetadataUrlParams["sap-context-token"] + "\" with provided value \"" + sCacheToken + "\" for model \"" + sModelName + "\" (" + oUri.toString() + ").",
											"[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
									}

									// Lazy initialize settings and metadataUrlParams objects
									if (!mMetadataUrlParams) {
										oModelConfig.settings = oModelConfig.settings || {};
										mMetadataUrlParams = oModelConfig.settings.metadataUrlParams = oModelConfig.settings.metadataUrlParams || {};
									}

									// Finally, set the sap-context-token
									mMetadataUrlParams["sap-context-token"] = sCacheToken;

								};
								/* eslint-enable no-loop-func */

								applyCacheToken();

							}
						}

					}

				}

				oModelConfig.uri = oUri.toString();
			}

			// set model specific "uri" property names which should be used to map "uri" to model specific constructor
			// (only if it wasn't specified before)
			if (oModelConfig.uriSettingName === undefined) {
				switch (oModelConfig.type) {
					case 'sap.ui.model.odata.ODataModel':
					case 'sap.ui.model.odata.v2.ODataModel':
					case 'sap.ui.model.odata.v4.ODataModel':
						oModelConfig.uriSettingName = 'serviceUrl';
						break;
					case 'sap.ui.model.resource.ResourceModel':
						oModelConfig.uriSettingName = 'bundleUrl';
						break;
					default:
						// default 'undefined' is already set in this case
				}
			}

			// Origin: if sap-system paramter is given -> add this alias to the service url(s) of ODataModels
			var sSystemParameter;
			var oComponentData;
			if (oComponent) {
				oComponentData = oComponent.getComponentData();
			} else {
				oComponentData = mOptions.componentData;
			}
			sSystemParameter = oComponentData && oComponentData.startupParameters && oComponentData.startupParameters["sap-system"];
			// Check the URL as "fallback", the system parameter of the componentData.startup has precedence over a URL parameter
			if (!sSystemParameter) {
				sSystemParameter = oConfig.getSAPParam("sap-system");
			}

			// lazy load the ODataUtils if systemParameter is given
			var bAddOrigin = false;
			var ODataUtils;
			if (sSystemParameter && ["sap.ui.model.odata.ODataModel", "sap.ui.model.odata.v2.ODataModel"].indexOf(oModelConfig.type) != -1) {
				bAddOrigin = true;
				ODataUtils = sap.ui.requireSync("sap/ui/model/odata/ODataUtils");
			}

			// include "uri" property in "settings" object, depending on "uriSettingName"
			if (oModelConfig.uri) {

				if (bAddOrigin) {
					// Origin segment: pre- and postOriginBaseUris do not include uri params, they will be used for annotation uri adaption
					oModelConfig.preOriginBaseUri = oModelConfig.uri.split("?")[0];
					oModelConfig.uri = ODataUtils.setOrigin(oModelConfig.uri, {
						alias: sSystemParameter
					});
					oModelConfig.postOriginBaseUri = oModelConfig.uri.split("?")[0];
				}

				if (oModelConfig.uriSettingName !== undefined) {
					oModelConfig.settings = oModelConfig.settings || {};

					// do not override the property if it's already defined!
					if (!oModelConfig.settings[oModelConfig.uriSettingName]) {
						oModelConfig.settings[oModelConfig.uriSettingName] = oModelConfig.uri;
					}

				} else if (oModelConfig.settings) {
					// shift settings to 2nd argument if no "uriSettingName" was specified
					oModelConfig.settings = [ oModelConfig.uri, oModelConfig.settings ];
				} else {
					// only use 1st argument with "uri" string if there are no settings
					oModelConfig.settings = [ oModelConfig.uri ];
				}
			} else {
				// Origin segment: check if the uri is given via the respective settingsName, e.g. "serviceURL"
				if (bAddOrigin && oModelConfig.uriSettingName !== undefined && oModelConfig.settings && oModelConfig.settings[oModelConfig.uriSettingName]) {
					oModelConfig.preOriginBaseUri = oModelConfig.settings[oModelConfig.uriSettingName].split("?")[0];
					oModelConfig.settings[oModelConfig.uriSettingName] = ODataUtils.setOrigin(oModelConfig.settings[oModelConfig.uriSettingName], {
						alias: sSystemParameter
					});
					oModelConfig.postOriginUri = oModelConfig.settings[oModelConfig.uriSettingName].split("?")[0];
				}
			}

			// Origin segment: Adapt annotation uris here, based on the base part of the service uri.
			// Replaces the base uri prefix with the one after adding the origin
			if (bAddOrigin && oModelConfig.settings && oModelConfig.settings.annotationURI) {
				var aAnnotationUris = [].concat(oModelConfig.settings.annotationURI); //"to array"
				var aOriginAnnotations = [];
				for (var i = 0; i < aAnnotationUris.length; i++) {
					aOriginAnnotations.push(ODataUtils.setAnnotationOrigin(aAnnotationUris[i], {
						alias: sSystemParameter,
						preOriginBaseUri: oModelConfig.preOriginBaseUri,
						postOriginBaseUri: oModelConfig.postOriginBaseUri
					}));
				}
				oModelConfig.settings.annotationURI = aOriginAnnotations;
			}

			// normalize settings object to array
			if (oModelConfig.settings && !Array.isArray(oModelConfig.settings)) {
				oModelConfig.settings = [ oModelConfig.settings ];
			}

			// Add final configuration to result map
			mModelConfigurations[sModelName] = oModelConfig;

		}

		return mModelConfigurations;
	};

	/**
	 * Creates model instances using a configuration provided by {@link sap.ui.core.Component._createManifestModelConfigurations}.
	 *
	 * @param {object} mModelConfigurations key-value configuration object created via {@link sap.ui.core.Component._createManifestModelConfigurations}
	 * @param {string} sLogComponentName component name / identifier to create log entries
	 * @returns {object} key-value map with model name as key and model instance as value
	 * @private
	 */
	Component._createManifestModels = function(mModelConfigurations, sLogComponentName) {
		var mModels = {};
		for (var sModelName in mModelConfigurations) {
			var oModelConfig = mModelConfigurations[sModelName];

			// load model class and log error message if it couldn't be loaded.
			// error gets catched to continue creating the other models and not breaking the execution here
			try {
				jQuery.sap.require(oModelConfig.type);
			} catch (oError) {
				jQuery.sap.log.error("Component Manifest: Class \"" + oModelConfig.type + "\" for model \"" + sModelName + "\" could not be loaded. " + oError, "[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
				continue;
			}

			// get model class object
			var ModelClass = jQuery.sap.getObject(oModelConfig.type);
			if (!ModelClass) {
				// this could be the case if the required module doesn't register itself in the defined namespace
				jQuery.sap.log.error("Component Manifest: Class \"" + oModelConfig.type + "\" for model \"" + sModelName + "\" could not be found", "[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sLogComponentName);
				continue;
			}

			// create arguments array with leading "null" value so that it can be passed to the apply function
			var aArgs = [null].concat(oModelConfig.settings || []);

			// create factory function by calling "Model.bind" with the provided arguments
			var Factory = ModelClass.bind.apply(ModelClass, aArgs);

			// the factory will create the model with the arguments above
			var oModel = new Factory();

			// add model instance to the result map
			mModels[sModelName] = oModel;
		}
		return mModels;
	};

	/**
	 * Callback handler which will be executed once the component is loaded. A copy of the
	 * configuration object together with a copy of the manifest object will be passed into
	 * the registered function.
	 * Also a return value is not expected from the callback handler.
	 * It will only be called for asynchronous manifest first scenarios.
	 * <p>
	 * Example usage:
	 * <pre>
	 * sap.ui.require(['sap/ui/core/Component'], function(Component) {
	 *   Component._fnLoadComponentCallback = function(oConfig, oManifest) {
	 *     // do some logic with the config
	 *   };
	 * });
	 * </pre>
	 * <p>
	 * <b>ATTENTION:</b> This hook must only be used by UI flexibility (library:
	 * sap.ui.fl) and will be replaced with a more generic solution!
	 *
	 * @sap-restricted sap.ui.fl
	 * @private
	 * @since 1.37.0
	 */
	Component._fnLoadComponentCallback = null;

	/**
	 * Callback handler which will be executed once a component instance has
	 * been created by {#link sap.ui.component}. The component instance and the
	 * configuration object will be passed into the registered function.
	 * For async scenarios (<code>vConfig.async = true</code>) a Promise can be provided as
	 * return value from the callback handler to delay resolving the Promise
	 * returned by {@link sap.ui.component}.
	 * In synchronous scenarios the return value will be ignored.
	 *
	 * Example usage:
	 * <pre>
	 * sap.ui.require(['sap/ui/core/Component'], function(Component) {
	 *   Component._fnOnInstanceCreated = function(oComponent, oConfig) {
	 *     // do some logic with the config
	 *
	 *     // optionally return a Promise
	 *     return doAsyncStuff();
	 *   };
	 * });
	 * </pre>
	 * <b>ATTENTION:</b> This hook must only be used by UI flexibility (library:
	 * sap.ui.fl) and will be replaced with a more generic solution!
	 *
	 * @private
	 * @sap-restricted sap.ui.fl
	 * @since 1.43.0
	 */
	Component._fnOnInstanceCreated = null;

	/**
	 * Creates a new instance of a <code>Component</code> or returns the instance
	 * of an existing <code>Component</code>.
	 *
	 * If you want to look up an existing <code>Component</code> you can call
	 * this function with a Component ID as parameter:
	 * <pre>
	 *   var oComponent = sap.ui.component(sComponentId);
	 * </pre>
	 *
	 * To create a new instance of a component you pass a component configuration
	 * object into this function:
	 * <pre>
	 *   var oComponent = sap.ui.component({
	 *     name: "my.Component",
	 *     url: "my/component/location",
	 *     id: "myCompId1"
	 *   });
	 * </pre>
	 *
	 * @param {string|object} vConfig ID of an existing Component or the configuration object to create the Component
	 * @param {string} vConfig.name Name of the Component to load
	 * @param {string} [vConfig.url] Alternate location from where to load the Component. If a <code>manifestUrl</code> is given, this URL specifies the location of the final component defined via that manifest, otherwise it specifies the location of the component defined via its name <code>vConfig.name>/code>.
	 * @param {object} [vConfig.componentData] Initial data of the Component (@see sap.ui.core.Component#getComponentData)
	 * @param {string} [vConfig.id] sId of the new Component
	 * @param {object} [vConfig.settings] Settings of the new Component
	 * @param {boolean} [vConfig.async=false] Indicates whether the Component creation should be done asynchronously (experimental setting)
	 * @param {object} [vConfig.asyncHints] Hints for the asynchronous loading (experimental setting)
	 * @param {string[]} [vConfig.asyncHints.libs] Libraries that should be (pre-)loaded before the Component (experimental setting)
	 * @param {string[]} [vConfig.asyncHints.components] Components that should be (pre-)loaded before the Component (experimental setting)
	 * @param {Promise|Promise[]} [vConfig.asyncHints.waitFor] @since 1.37.0 a <code>Promise</code> or and array of <code>Promise</code>s for which the Component instantiation should wait (experimental setting)
	 * @param {string} [vConfig.manifestUrl] @since 1.33.0 Determines whether the component should be loaded and defined
	 *                                       via the <code>manifest.json</code>
	 * @param {string} [vConfig.manifestFirst] @since 1.33.0 defines whether the manifest is loaded before or after the
	 *                                         Component controller. Defaults to <code>sap.ui.getCore().getConfiguration().getManifestFirst()</code>
	 * @param {string} [vConfig.handleValidation=false] If set to <code>TRUE</code> validation of the component is handled by the <code>MessageManager</code>
	 * @return {sap.ui.core.Component|Promise} the Component instance or a Promise in case of asynchronous loading
	 *
	 * @public
	 * @static
	 * @since 1.15.0
	 * @experimental Since 1.27.0. Support for asyncHints is still experimental and might be modified or removed completely again.
	 *   It must not be used in productive code, except in code delivered by the UI5 teams. The synchronous usage of the API is
	 *   not experimental and can be used without restrictions.
	 */
	sap.ui.component = function(vConfig) {

		// a parameter must be given!
		if (!vConfig) {
			throw new Error("sap.ui.component cannot be called without parameter!");
		}

		// when only a string is given then this function behaves like a
		// getter and returns an existing component instance
		if (typeof vConfig === 'string') {

			// lookup and return the component
			return sap.ui.getCore().getComponent(vConfig);

		}

		function createInstance(oClass) {

			// retrieve the required properties
			var sName = vConfig.name,
				sId = vConfig.id,
				oComponentData = vConfig.componentData,
				sController = sName + '.Component',
				mSettings = vConfig.settings;

			// create an instance
			var oInstance = new oClass(jQuery.extend({}, mSettings, {
				id: sId,
				componentData: oComponentData,
				_cacheTokens: vConfig.asyncHints && vConfig.asyncHints.cacheTokens
			}));
			jQuery.sap.assert(oInstance instanceof Component, "The specified component \"" + sController + "\" must be an instance of sap.ui.core.Component!");
			jQuery.sap.log.info("Component instance Id = " + oInstance.getId());

			/*
			 * register for messaging: register if either handleValidation is set in metadata
			 * or if not set in metadata and set on instance
			 */
			var bHandleValidation = oInstance.getMetadata().handleValidation() !== undefined || vConfig.handleValidation;
			if (bHandleValidation) {
				// calculate handleValidation for registration
				if (oInstance.getMetadata().handleValidation() !== undefined) {
					bHandleValidation = oInstance.getMetadata().handleValidation();
				} else {
					bHandleValidation = vConfig.handleValidation;
				}
				sap.ui.getCore().getMessageManager().registerObject(oInstance, bHandleValidation);
			}

			// Some services may demand immediate startup
			activateServices(oInstance);

			if (typeof Component._fnOnInstanceCreated === "function") {

				// In async mode the hook can provide a promise which will be added to the promise chain
				var oPromise = Component._fnOnInstanceCreated(oInstance, vConfig);
				if (vConfig.async && oPromise instanceof Promise) {
					return oPromise.then(function() {
						// Make sure that the promise returned by the hook can not modify the resolve value
						return oInstance;
					});
				}

			}

			return oInstance;
		}

		// load the component class
		var vClassOrPromise = loadComponent(vConfig, {
			failOnError: true,
			createModels: true,
			waitFor: vConfig.asyncHints && vConfig.asyncHints.waitFor
		});
		if ( vConfig.async ) {
			// async: instantiate component after Promise has been fulfilled with component
			//        constructor and delegate the current owner id for the instance creation
			var sCurrentOwnerId = ManagedObject._sOwnerId;
			return vClassOrPromise.then(function(oClass) {
				return runWithOwner(function() {
					return createInstance(oClass);
				}, sCurrentOwnerId);
			});
		} else {
			// sync: constructor has been returned, instantiate component immediately
			return createInstance(vClassOrPromise);
		}
	};

	/**
	 * Load a Component without instantiating it.
	 *
	 * Provides support for loading Components asynchronously by setting
	 * <code>oConfig.async</code> to true. In that case, the method returns a Javascript 6
	 * Promise that will be fulfilled with the component class after loading.
	 *
	 * Using <code>async = true</code> doesn't necessarily mean that no more synchronous loading
	 * occurs. Both the framework as well as component implementations might still execute
	 * synchronous requests. The contract for <code>async = true</code> just allows to use
	 * async calls.
	 *
	 * When a manifest.json is referenced in oConfig this manifest is not used for the derived instances of the Component class.
	 * The manifest/manifest url must be provided for every instance explicitly.
	 *
	 * When asynchronous loading is used, additional <code>asyncHints</code> can be provided. The structure of these hints and how
	 * they impact the loading of components, is still experimental. Code that wants to be safe wrt. version updates, should
	 * not use the code>asyncHints</code> property.
	 * <ul>
	 * <li><code>oConfig.asyncHints.components : string[]</code>a list of components needed by the current component and its subcomponents
	 *     The framework will try to preload these components (their Component-preload.js) asynchronously, errors will be ignored.
	 *     Please note that the framework has no knowledge about whether a Component provides a preload file or whether it is bundled
	 *     in some library preload. If Components are listed in the hints section, they will be preloaded.</li>
	 * <li><code>oConfig.asyncHints.libs : string[]</code>libraries needed by the Component and its subcomponents.
	 *     The framework will asynchronously load those libraries, if they're not loaded yet.</li>
	 * <li><code>oConfig.asyncHints.preloadBundles : string[]</code>a list of additional preload bundles
	 *     The framework will try to load these bundles asynchronously before requiring the Component, errors will be ignored.
	 *     The named modules must only represent preload bundles. If they are normal modules, their dependencies
	 *     will be loaded with the normal synchronous request mechanism and performance might degrade.</li>
	 * <li><code>oConfig.asyncHints.preloadOnly : boolean (default: false)</code> whether only the preloads should be done,
	 *     but not the loading of the Component controller class itself.
	 * </ul>
	 *
	 * If Components and/or libraries are listed in the hints section, all the corresponding preload files will
	 * be requested in parallel. The constructor class will only be required after all of them are rejected or resolved.
	 * Instead of specifying just the name of a component or library in the hints, an object might be given that contains a
	 * mandatory <code>name</code> property and, optionally, an <code>url</code> that will be used for a <code>registerModulePath</code>
	 * and/or a <code>lazy</code> property. When <code>lazy</code> is set to a truthy value, only a necessary <code>registerModulePath</code>
	 * will be executed, but the corresponding component or lib won't be preloaded. For preload bundles, also an object might be given
	 * instead of a simple name, but there only the <code>url</code> property is supported, not the <code>lazy</code> property.
	 *
	 * Note: so far, only the requests for the preload files (library and/or component) are executed asynchronously.
	 * If a preload is deactivated by configuration (e.g. debug mode), then requests won't be asynchronous.
	 *
	 * @param {object} oConfig Configuration object describing the Component to be loaded. See {@link sap.ui.component} for more information.
	 * @return {function|Promise} the constructor of the Component class or a Promise that will be fulfilled with the same
	 *
	 * @since 1.16.3
	 * @static
	 * @public
	 * @experimental Since 1.27.0. Support for <code>asyncHints</code> is still experimental and might be modified or removed completely again.
	 *   It must not be used in productive code, except in code delivered by the UI5 teams. The synchronous usage of the API is
	 *   not experimental and can be used without restrictions.
	 */
	sap.ui.component.load = function(oConfig, bFailOnError) {
		return loadComponent(oConfig, {
			failOnError: bFailOnError,
			preloadOnly: oConfig.asyncHints && oConfig.asyncHints.preloadOnly
		});
	};

	/**
	 * Internal loading method to decouple "sap.ui.component" / "sap.ui.component.load".
	 *
	 * @param {object} oConfig see <code>sap.ui.component</code> / <code>sap.ui.component.load</code>
	 * @param {object} mOptions internal loading configurations
	 * @param {boolean} mOptions.failOnError see <code>sap.ui.component.load</code>
	 * @param {boolean} mOptions.createModels whether models from manifest should be created during
	 *                                        component preload (should only be set via <code>sap.ui.component</code>)
	 * @param {boolean} mOptions.preloadOnly see <code>sap.ui.component.load</code> (<code>vConfig.asyncHints.preloadOnly</code>)
	 * @param {Promise|Promise[]} mOptions.waitFor see <code>sap.ui.component.load</code> (<code>vConfig.asyncHints.waitFor</code>)
	 * @return {function|Promise} the constructor of the Component class or a Promise that will be fulfilled with the same
	 *
	 * @private
	*/
	function loadComponent(oConfig, mOptions) {

		var sName = oConfig.name,
			sUrl = oConfig.url,
			oConfiguration = sap.ui.getCore().getConfiguration(),
			bComponentPreload = /^(sync|async)$/.test(oConfiguration.getComponentPreload()),
			bManifestFirst = typeof oConfig.manifestFirst !== "undefined" ? oConfig.manifestFirst : oConfiguration.getManifestFirst(),
			oManifest,
			mModels,
			fnCallLoadComponentCallback;

		// set the name of this newly loaded component at the interaction measurement,
		// as otherwise this would be the outer component from where it was called,
		// which is not true - this component causes the load
		jQuery.sap.interaction.setStepComponent(sName);

		// if we find a manifest URL in the configuration
		// we will load the manifest from the specified URL (sync or async)
		if (oConfig.manifestUrl) {
			oManifest = Manifest.load({
				manifestUrl: oConfig.manifestUrl,
				componentName: sName,
				async: oConfig.async
			});
		}

		// once the manifest is available we extract the controller name
		if (oManifest && !oConfig.async) {
			sName = oManifest.getComponentName();
		}

		// Only if loading a manifest is done asynchronously we will skip the
		// name check because this will be done once the manifest is loaded!
		if (!(oManifest && oConfig.async)) {

			// check for an existing name
			if (!sName) {
				throw new Error("The name of the component is undefined.");
			}

			// check the type of the name
			jQuery.sap.assert(typeof sName === 'string', "sName must be a string");

		}

		// if a component name and a URL is given we register this URL for the name of the component:
		// the name is the package in which the component is located (dot separated)
		if (sName && sUrl) {
			jQuery.sap.registerModulePath(sName, sUrl);
		}

		// in case of loading the manifest first by configuration we need to
		// wait until the registration of the module path is done if needed and
		// then we can use the standard capabilities of the framework to resolve
		// the Components' modules namespace
		if (bManifestFirst && !oManifest) {
			oManifest = Manifest.load({
				manifestUrl: jQuery.sap.getModulePath(sName) + "/manifest.json",
				componentName: sName,
				async: oConfig.async,
				failOnError: false
			});
		}

		function getControllerModuleName() {
			return jQuery.sap.getResourceName(sName + ".Component", ""); // use empty suffix to suppress ".js"
		}

		function prepareControllerClass(oClass) {

			var sController = sName + '.Component';

			if (!oClass) {
				var sMsg = "The specified component controller '" + sController + "' could not be found!";
				if (mOptions.failOnError) {
					throw new Error(sMsg);
				} else {
					jQuery.sap.log.warning(sMsg);
				}
			}

			if (oManifest) {
				// create the proxy metadata object
				var oMetadataProxy = createMetadataProxy(oClass.getMetadata(), oManifest);
				// create the proxy class for passing the manifest
				var oClassProxy = function() {

					// create a copy of arguments for local modification
					// and later handover to Component constructor
					var args = Array.prototype.slice.call(arguments);

					// inject the manifest to the settings object
					var mSettings;
					if (args.length === 0 || typeof args[0] === "object") {
						mSettings = args[0] = args[0] || {};
					} else if (typeof args[0] === "string") {
						mSettings = args[1] = args[1] || {};
					}
					mSettings._metadataProxy = oMetadataProxy;

					// mixin created "models" into "mSettings"
					if (mModels) {
						mSettings._manifestModels = mModels;
					}

					// call the original constructor of the component class
					var oInstance = Object.create(oClass.prototype);
					oClass.apply(oInstance, args);
					return oInstance;

				};
				// overload the getMetadata function
				oClassProxy.getMetadata = function() {
					return oMetadataProxy;
				};
				// overload the extend function
				oClassProxy.extend = function() {
					throw new Error("Extending Components created by Manifest is not supported!");
				};
				return oClassProxy;
			} else {
				return oClass;
			}
		}

		/*
		 * Process .url and .lazy options.
		 * For preloadBundles, lazy will be ignored
		 */
		function processOptions(vObj, bIgnoreLazy) {

			jQuery.sap.assert(
				(typeof vObj === 'string' && vObj) ||
				(typeof vObj === 'object' && typeof vObj.name === 'string' && vObj.name),
				"reference either must be a non-empty string or an object with a non-empty 'name' and an optional 'url' property");

			if ( typeof vObj === 'object' ) {
				if ( vObj.url ) {
					jQuery.sap.registerModulePath(vObj.name, vObj.url);
				}
				return (vObj.lazy && bIgnoreLazy !== true) ? undefined : vObj.name; // expl. check for true to allow usage in Array.prototype.map below
			}

			return vObj;
		}

		function preload(sComponentName, bAsync) {

			var sController = sComponentName + '.Component',
				sPreloadName;

			// only load the Component-preload file if the Component module is not yet available
			if ( bComponentPreload && sComponentName != null && !jQuery.sap.isDeclared(sController, /* bIncludePreloaded=*/ true) ) {

				if ( bAsync ) {
					sPreloadName = jQuery.sap.getResourceName(sController, '-preload.js'); // URN
					return jQuery.sap._loadJSResourceAsync(sPreloadName, true);
				}

				try {
					sPreloadName = sController + '-preload'; // Module name
					jQuery.sap.require(sPreloadName);
				} catch (e) {
					jQuery.sap.log.warning("couldn't preload component from " + sPreloadName + ": " + ((e && e.message) || e));
				}
			}
		}

		function preloadDependencies(sComponentName, oManifest, bAsync) {

			var aPromises = [];
			var fnCollect = bAsync ? function(oPromise) {
				aPromises.push(oPromise);
			} : jQuery.noop;

			// lookup the resource roots and call the register API
			oManifest.defineResourceRoots();

			// lookup the required libraries
			var mLibs = oManifest.getEntry("/sap.ui5/dependencies/libs");
			if (mLibs) {
				var aLibs = [];
				// filter the lazy libs
				for (var sLibName in mLibs) {
					if (!mLibs[sLibName].lazy) {
						aLibs.push(sLibName);
					}
				}
				if (aLibs.length > 0) {
					jQuery.sap.log.info("Component \"" + sComponentName + "\" is loading libraries: \"" + aLibs.join(", ") + "\"");
					fnCollect(sap.ui.getCore().loadLibraries(aLibs, {
						async: bAsync
					}));
				}
			}

			// lookup the extended component and preload it
			var sExtendedComponent = oManifest.getEntry("/sap.ui5/extends/component");
			if (sExtendedComponent) {
				fnCollect(preload(sExtendedComponent, bAsync));
			}

			// lookup the components and preload them
			var mComponents = oManifest.getEntry("/sap.ui5/dependencies/components");
			if (mComponents) {
				for (var sComponentName in mComponents) {
					// filter the lazy components
					if (!mComponents[sComponentName].lazy) {
						fnCollect(preload(sComponentName, bAsync));
					}
				}
			}

			return bAsync ? Promise.all(aPromises) : undefined;

		}

		if ( oConfig.async ) {

			// trigger loading of libraries and component preloads and collect the given promises
			var hints = oConfig.asyncHints || {},
				promises = [],
				collect = function(oPromise) {
					if ( oPromise ) {
						promises.push(oPromise);
					}
				},
				identity = function($) { return $; },
				phase1Preloads,
				libs;

			if (oManifest && mOptions.createModels) {
				collect(oManifest.then(function(oManifest) {

					// deep clone is needed as the mainfest only returns a read-only copy (freezed object)
					var oManifestDataSources = jQuery.extend(true, {}, oManifest.getEntry("/sap.app/dataSources"));
					var oManifestModels = jQuery.extend(true, {}, oManifest.getEntry("/sap.ui5/models"));

					var mAllModelConfigurations = Component._createManifestModelConfigurations({
						models: oManifestModels,
						dataSources: oManifestDataSources,
						manifest: oManifest,
						componentData: oConfig.componentData,
						cacheTokens: hints.cacheTokens
					});

					if (mAllModelConfigurations) {

						// Read internal URI parameter to enable model preload for testing purposes
						// Specify comma separated list of model names. Use an empty segment for the "default" model
						// Examples:
						//   sap-ui-xx-preload-component-models-<componentName>=, => prelaod default model (empty string key)
						//   sap-ui-xx-preload-component-models-<componentName>=foo, => prelaod "foo" + default model (empty string key)
						//   sap-ui-xx-preload-component-models-<componentName>=foo,bar => prelaod "foo" + "bar" models
						var sPreloadModels = jQuery.sap.getUriParameters().get("sap-ui-xx-preload-component-models-" + oManifest.getComponentName());
						var aPreloadModels = sPreloadModels && sPreloadModels.split(",");

						var mModelConfigurations = {};
						for (var sModelName in mAllModelConfigurations) {
							var mModelConfig = mAllModelConfigurations[sModelName];

							// activate "preload" flag in case URI parameter for testing is used (see code above)
							if (!mModelConfig.preload && aPreloadModels && aPreloadModels.indexOf(sModelName) > -1 ) {
								mModelConfig.preload = true;
								jQuery.sap.log.warning("FOR TESTING ONLY!!! Activating preload for model \"" + sModelName + "\" (" + mModelConfig.type + ")",
									oManifest.getComponentName(), "sap.ui.core.Component");
							}

							// Only create models:
							//   - which are flagged for preload (mModelConfig.preload) or activated via internal URI param (see above)
							//   - in case the model class is already loaded (otherwise log a warning)
							if (mModelConfig.preload) {
								if (jQuery.sap.isDeclared(mModelConfig.type, true)) {
									mModelConfigurations[sModelName] = mModelConfig;
								} else {
									jQuery.sap.log.warning("Can not preload model \"" + sModelName + "\" as required class has not been loaded: \"" + mModelConfig.type + "\"",
										oManifest.getComponentName(), "sap.ui.core.Component");
								}
							}

						}
						if (Object.keys(mModelConfigurations).length > 0) {
							mModels = Component._createManifestModels(mModelConfigurations, oManifest.getComponentName());
						}
					}

					return oManifest;
				}));
			}

			phase1Preloads = [];

			// load any required preload bundles
			if ( Array.isArray(hints.preloadBundles) ) {
				hints.preloadBundles.forEach(function(vBundle) {
					phase1Preloads.push(
						jQuery.sap._loadJSResourceAsync(processOptions(vBundle, /* ignoreLazy */ true), /* ignoreErrors */ true) );
				});
			}

			// preload any libraries
			if ( Array.isArray(hints.libs) ) {
				libs = hints.libs.map(processOptions).filter(identity);
				phase1Preloads.push(
					sap.ui.getCore().loadLibraries( libs, { preloadOnly: true } )
				);
			}

			// sync preloadBundles and preloads of libraries first before requiring the libs
			// Note: component preloads are assumed to be always independent from libs
			// therefore those requests are not synchronized with the require calls for the libs
			phase1Preloads = Promise.all( phase1Preloads );
			if ( libs && !mOptions.preloadOnly ) {
				phase1Preloads = phase1Preloads.then( function() {
					return sap.ui.getCore().loadLibraries( libs );
				});
			}
			collect( phase1Preloads );

			// preload the component itself
			if (!oManifest) {
				collect(preload(sName, true));
			} else {
				// in case of manifest first we need to load the manifest
				// to know the component name and preload the component itself
				collect(oManifest.then(function(oManifest) {
					var sComponentName = oManifest.getComponentName();

					// if a URL is given we register this URL for the name of the component:
					// the name is the package in which the component is located (dot separated)
					if (sUrl) {
						jQuery.sap.registerModulePath(sComponentName, sUrl);
					}

					// preload the component
					return preload(sComponentName, true);
				}));

				fnCallLoadComponentCallback = function(oLoadedManifest) {
					// if a callback is registered to the component load call it with the configuration
					if (typeof Component._fnLoadComponentCallback === "function") {
						// secure configuration and manifest from manipulation
						var oConfigCopy = jQuery.extend(true, {}, oConfig);
						var oManifestCopy = jQuery.extend(true, {}, oLoadedManifest);
						// trigger the callback with a copy if its required data
						// do not await any result from the callback nor stop component loading on an occurring error
						try {
							Component._fnLoadComponentCallback(oConfigCopy, oManifestCopy);
						} catch (oError) {
							jQuery.sap.log.error("Callback for loading the component \"" + oManifest.getComponentName() +
								"\" run into an error. The callback was skipped and the component loading resumed.",
								oError, "sap.ui.core.Component");
						}
					}
				};
			}

			// if a hint about "used" components is given, preload those components
			if ( hints.components ) {
				jQuery.each(hints.components, function(i, vComp) {
					collect(preload(processOptions(vComp), true));
				});
			}

			// combine given promises
			return Promise.all(promises).then(function (v) {
				// after all promises including the loading of dependent libs have been resolved
				// pass the manifest to the callback function in case the manifest is present and a callback was set
				if (oManifest && fnCallLoadComponentCallback) {
					oManifest.then(fnCallLoadComponentCallback);
				}
				return v;
			}).then(function(v) {
				jQuery.sap.log.debug("Component.load: all promises fulfilled, then " + v);
				if (oManifest) {
					return oManifest.then(function(oLoadedManifest) {
						// store the loaded manifest in the oManifest variable
						// which is used for the scope constructor function
						oManifest = oLoadedManifest;
						// read the component name from the manifest and
						// preload the dependencies defined in the manifest
						sName = oManifest.getComponentName();
						return preloadDependencies(sName, oManifest, true);
					});
				} else {
					return v;
				}
			}).then(function() {
				if ( mOptions.preloadOnly ) {
					return true;
				}

				return new Promise(function(resolve, reject) {
					// asynchronously require component controller class
					sap.ui.require( [ getControllerModuleName() ], function(oClass) {
						// prepare the loaded class and resolve with it
						resolve( prepareControllerClass(oClass) );
					});
				});

			}).then(function(oControllerClass) {
				var waitFor = mOptions.waitFor;
				if (waitFor) {
					// when waitFor Promises have been specified we also wait for
					// them before we call the component constructor
					var aPromises = Array.isArray(waitFor) ? waitFor : [ waitFor ];
					return Promise.all(aPromises).then(function() {
						return oControllerClass;
					});
				}
				return oControllerClass;
			}).catch(function(vError) {
				// handle preload errors

				// destroy "preloaded" models in case of any error to prevent memory leaks
				if (mModels) {
					for (var sName in mModels) {
						var oModel = mModels[sName];
						if (oModel && typeof oModel.destroy === "function") {
							oModel.destroy();
						}
					}
				}

				// re-throw error to hand it over to the application
				throw vError;

			});

		}

		if (oManifest) {
			preloadDependencies(sName, oManifest);
		}
		preload(sName);

		// synchronously load the controller class, prepare and return it
		return prepareControllerClass(
			sap.ui.requireSync( getControllerModuleName() )
		);
	}

	return Component;

});
