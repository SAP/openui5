/*
 * ${copyright}
 */

// Provides base class sap.ui.core.Component for all components
sap.ui.define([
	'jquery.sap.global',
	'./Manifest',
	'./ComponentMetadata',
	'./Core',
	'sap/base/util/extend',
	'sap/ui/base/ManagedObject',
	'sap/ui/thirdparty/URI',
	'jquery.sap.trace'
], function(jQuery, Manifest, ComponentMetadata, Core, extend, ManagedObject, URI /*, jQuery*/) {
	"use strict";

	/*global Promise */

	// TODO: dependency to sap/ui/core/library not possible due to cyclic dependency
	var ViewType = {
		JSON: "JSON",
		XML: "XML",
		HTML: "HTML",
		JS: "JS",
		Template: "Template"
	};

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
	 * @param {Object} [oThisArg=undefined] Value to use as <code>this</code> when executing <code>fn</code>
	 * @return {any} result of function <code>fn</code>
	 */
	function runWithOwner(fn, sOwnerId, oThisArg) {

		jQuery.sap.assert(typeof fn === "function", "fn must be a function");

		var oldOwnerId = ManagedObject._sOwnerId;
		try {
			ManagedObject._sOwnerId = sOwnerId;
			return fn.call(oThisArg);
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
			delete this._oManifest;
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
		this._initComponentModels(oManifestModels, oManifestDataSources, this._mCacheTokens);

	};

	/**
	 * Initializes the component models and services which are passed as
	 * parameters to this function.
	 *
	 * @param {object} mModels models configuration from manifest.json
	 * @param {object} mDataSources data sources configuration from manifest.json
	 * @param {object} mCacheTokens cache tokens for OData models
	 *
	 * @private
	 */
	Component.prototype._initComponentModels = function(mModels, mDataSources, mCacheTokens) {

		var mAllModelConfigurations = Component._createManifestModelConfigurations({
			models: mModels,
			dataSources: mDataSources,
			component: this,
			mergeParent: true,
			cacheTokens: mCacheTokens
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
	 * @param {int} iLine Line number of the error
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

					// pass OData service version (e.g. "2.0"), if specified, to the OData V4 model
					if (oModelConfig.type === 'sap.ui.model.odata.v4.ODataModel'
							&& oDataSource.settings
							&& oDataSource.settings.odataVersion) {
						oModelConfig.settings = oModelConfig.settings || {};
						oModelConfig.settings.odataVersion = oDataSource.settings.odataVersion;
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

			// resolve the bundleUrl of the enhancing resource bundle relative to
			// the component (default) or relative to manifest, e.g.:
			// bundleUrlRelativeTo: 'component|manifest'
			if (oModelConfig.type === 'sap.ui.model.resource.ResourceModel' &&
				oModelConfig.settings &&
				Array.isArray(oModelConfig.settings.enhanceWith)) {
				/* eslint-disable no-loop-func */
				oModelConfig.settings.enhanceWith.forEach(function(mBundle) {
					if (mBundle.bundleUrl) {
						mBundle.bundleUrl = oManifest.resolveUri(new URI(mBundle.bundleUrl), mBundle.bundleUrlRelativeTo).toString();
					}
				});
				/* eslint-enable no-loop-func */
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
	 * Returns two maps of model configurations to be used for the model "preload" feature.
	 * Used within loadComponent to create models during component load.
	 *
	 * "afterManifest"
	 * Models that are activated for preload via "preload=true" or URI parameter.
	 * They will be created after the manifest is available.
	 *
	 * "afterPreload"
	 * Currently only for ResourceModels with async=false (default) to prevent sync requests
	 * by loading the corresponding ResourceBundle in advance.
	 * They will be created after the Component-preload has been loaded, as most apps package
	 * their ResourceBundles within the Component-preload.
	 *
	 * @param {sap.ui.core.Manifest} oManifest Manifest instance
	 * @param {object} [oComponentData] optional component data object
	 * @param {object} [mCacheTokens] optional cache tokens for OData models
	 * @returns {object} object with two maps, see above
	 */
	function getPreloadModelConfigsFromManifest(oManifest, oComponentData, mCacheTokens) {
		var mModelConfigs = {
			afterManifest: {},
			afterPreload: {}
		};

		// deep clone is needed as the mainfest only returns a read-only copy (freezed object)
		var oManifestDataSources = jQuery.extend(true, {}, oManifest.getEntry("/sap.app/dataSources"));
		var oManifestModels = jQuery.extend(true, {}, oManifest.getEntry("/sap.ui5/models"));

		var mAllModelConfigurations = Component._createManifestModelConfigurations({
			models: oManifestModels,
			dataSources: oManifestDataSources,
			manifest: oManifest,
			componentData: oComponentData,
			cacheTokens: mCacheTokens
		});

		// Read internal URI parameter to enable model preload for testing purposes
		// Specify comma separated list of model names. Use an empty segment for the "default" model
		// Examples:
		//   sap-ui-xx-preload-component-models-<componentName>=, => prelaod default model (empty string key)
		//   sap-ui-xx-preload-component-models-<componentName>=foo, => prelaod "foo" + default model (empty string key)
		//   sap-ui-xx-preload-component-models-<componentName>=foo,bar => prelaod "foo" + "bar" models
		var sPreloadModels = jQuery.sap.getUriParameters().get("sap-ui-xx-preload-component-models-" + oManifest.getComponentName());
		var aPreloadModels = sPreloadModels && sPreloadModels.split(",");

		for (var sModelName in mAllModelConfigurations) {
			var mModelConfig = mAllModelConfigurations[sModelName];

			// activate "preload" flag in case URI parameter for testing is used (see code above)
			if (!mModelConfig.preload && aPreloadModels && aPreloadModels.indexOf(sModelName) > -1 ) {
				mModelConfig.preload = true;
				jQuery.sap.log.warning("FOR TESTING ONLY!!! Activating preload for model \"" + sModelName + "\" (" + mModelConfig.type + ")",
					oManifest.getComponentName(), "sap.ui.core.Component");
			}

			// ResourceModels with async=false should be always loaded beforehand to get rid of sync requests under the hood (regardless of the "preload" flag)
			if (mModelConfig.type === "sap.ui.model.resource.ResourceModel" &&
				Array.isArray(mModelConfig.settings) &&
				mModelConfig.settings.length > 0 &&
				mModelConfig.settings[0].async !== true
			) {
				// Use separate config object for ResourceModels as the resourceBundle might be
				// part of the Component-preload which isn't available when the regular "preloaded"-models are created
				mModelConfigs.afterPreload[sModelName] = mModelConfig;
			} else if (mModelConfig.preload) {
				// Only create models:
				//   - which are flagged for preload (mModelConfig.preload) or activated via internal URI param (see above)
				//   - in case the model class is already loaded (otherwise log a warning)
				if (jQuery.sap.isDeclared(mModelConfig.type, true)) {
					mModelConfigs.afterManifest[sModelName] = mModelConfig;
				} else {
					jQuery.sap.log.warning("Can not preload model \"" + sModelName + "\" as required class has not been loaded: \"" + mModelConfig.type + "\"",
						oManifest.getComponentName(), "sap.ui.core.Component");
				}
			}

		}

		return mModelConfigs;
	}

	function loadManifests(oRootMetadata, oRootManifest) {
		var aManifestsToLoad = [];
		var aMetadataObjects = [];

		/**
		 * Collects the promises to load the manifest content and all of its parents manifest files.
		 *
		 * Gathers promises within aManifestsToLoad.
		 * Gathers associates meta data objects within aMetadataObjects.
		 * @param {object} oMetadata The metadata object
		 * @param {sap.ui.core.Manifest} [oManifest] root manifest, which is possibly already loaded
		 */
		function collectLoadManifestPromises(oMetadata, oManifest) {
			// ComponentMetadata classes with a static manifest or with legacy metadata
			// do already have a manifest, so no action required
			if (!oMetadata._oManifest) {
				// TODO: If the "manifest" property is set, the code to load the manifest.json could be moved up to run in
				// parallel with the ResourceModels that are created (after the Component-preload has finished) to trigger
				// a potential request a bit earlier. Right now the whole component loading would be delayed by the async request.

				var sName = oMetadata.getComponentName();
				var sDefaultManifestUrl = jQuery.sap.getModulePath(sName, "/manifest.json");

				var pLoadManifest;
				if (oManifest) {
					// Apply a copy of the already loaded manifest to be used by the static metadata class
					pLoadManifest = Promise.resolve(JSON.parse(JSON.stringify(oManifest.getRawJson())));
				} else {
					// We need to load the manifest.json for the metadata class as
					// it might differ from the one already loaded
					// If the manifest.json is part of the Component-preload it will be taken from there
					pLoadManifest = jQuery.sap.loadResource({
						url: sDefaultManifestUrl,
						dataType: "json",
						async: true
					}).catch(function(oError) {
						jQuery.sap.log.error(
							"Failed to load component manifest from \"" + sDefaultManifestUrl + "\" (component " + sName
							+ ")! Reason: " + oError
						);

						// If the request fails, ignoring the error would end up in a sync call, which would fail, too.
						return {};
					});
				}
				aManifestsToLoad.push(pLoadManifest);
				aMetadataObjects.push(oMetadata);
			}

			var oParentMetadata = oMetadata.getParent();
			if (oParentMetadata && (oParentMetadata instanceof ComponentMetadata) && !oParentMetadata.isBaseClass()) {
				collectLoadManifestPromises(oParentMetadata);
			}
		}

		collectLoadManifestPromises(oRootMetadata, oRootManifest);

		return Promise.all(aManifestsToLoad).then(function(aManifestJson) {
			// Inject the manifest into the metadata class
			for (var i = 0; i < aManifestJson.length; i++) {
				if (aManifestJson[i]) {
					aMetadataObjects[i]._applyManifest(aManifestJson[i]);
				}
			}
		});
	}

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
	 * Asynchronously creates a new component instance from the given configuration.
	 *
	 * To optimize the loading process, additional <code>asyncHints</code> can be provided. The structure of
	 * these hints and how they impact the loading of components is an internal feature of this API and reserved
	 * for UI5 internal use only. Code that wants to be safe wrt. version updates, should not use the
	 * <code>asyncHints</code> property.
	 *
	 * If Components and/or libraries are listed in the <code>asyncHints</code>, all the corresponding preload
	 * files will be requested in parallel, loading errors (404s) will be ignored. The constructor class will
	 * only be required after all preloads have been rejected or resolved. Only then, the new instance will
	 * be created.
	 *
	 * @example
	 *
	 *   Component.create({
	 *     name: "my.comp",
	 *     url: "find/my/comp/here",
	 *     id: "myCompId1"
	 *   }).then(function(oComponent) {
	 *     ...
	 *   });
	 *
	 * @param {object} mOptions Configuration options
	 * @param {string} mOptions.name Name of the component to load, this is the dot-separated name of the package
	 *     that contains the Component.js module;
	 *     Even when an alternative location is specified from which the manifest should be loaded
	 *     (<code>mOptions.manifest</code> is set to a non-empty string), then the name specified in that
	 *     manifest will be ignored and this name will be used instead to determine the module to be loaded.
	 * @param {string} [mOptions.url] Alternative location from where to load the Component. If <code>mOptions.manifest</code>
	 *     is set to a non-empty string, this URL specifies the location of the final component defined via that
	 *     manifest, otherwise it specifies the location of the component defined via its name <code>mOptions.name</code>.
	 * @param {object} [mOptions.componentData] Initial data of the Component, see {@link sap.ui.core.Component#getComponentData}.
	 * @param {sap.ui.core.ID} [mOptions.id] ID of the new Component
	 * @param {object} [mOptions.settings] Settings of the new Component
	 * @param {boolean|string|object} [mOptions.manifest=true] Whether and from where to load the manifest.json for the Component.
	 *     When set to any truthy value, the manifest will be loaded and evaluated before the Component controller.
	 *     If it is set to a falsy value, the manifest will not be evaluated before the controller. It might still be loaded synchronously
	 *     if declared in the Component metadata.
	 *     A non-empty string value will be interpreted as the URL to load the manifest from.
	 *     A non-null object value will be interpreted as manifest content.
	 * @param {string} [mOptions.handleValidation=false] If set to <code>true</code> validation of the component is handled by the <code>MessageManager</code>
	 * @param {object} [mOptions.asyncHints] Hints for asynchronous loading
	 * @param {string[]|object[]} [mOptions.asyncHints.components] a list of components needed by the current component and its subcomponents
	 *     The framework will try to preload these components (their Component-preload.js) asynchronously, errors will be ignored.
	 *     Please note that the framework has no knowledge about whether a Component provides a preload file or whether it is bundled
	 *     in some library preload. If Components are listed in the hints section, they will be preloaded.
	 *     Instead of specifying just the names of components, an object might be given that contains a
	 *     mandatory <code>name</code> property and optionally, an <code>url</code> that will be used for a <code>registerModulePath</code>,
	 *     and/or a <code>lazy</code> property. When <code>lazy</code> is set to a truthy value, only a necessary <code>registerModulePath</code>
	 *     will be executed, but the corresponding component won't be preloaded.
	 * @param {string[]|object[]} [mOptions.asyncHints.libs] libraries needed by the Component and its subcomponents
	 *     These libraries should be (pre-)loaded before the Component.
	 *     The framework will asynchronously load those libraries, if they're not loaded yet.
	 *     Instead of specifying just the names of libraries, an object might be given that contains a
	 *     mandatory <code>name</code> property and optionally, an <code>url</code> that will be used for a <code>registerModulePath</code>,
	 *     and/or a <code>lazy</code> property. When <code>lazy</code> is set to a truthy value, only a necessary <code>registerModulePath</code>
	 *     will be executed, but the corresponding library won't be preloaded.
	 * @param {string[]|object[]} [mOptions.asyncHints.preloadBundles] a list of additional preload bundles
	 *     The framework will try to load these bundles asynchronously before requiring the Component, errors will be ignored.
	 *     The named modules must only represent preload bundles. If they are normal modules, their dependencies
	 *     will be loaded with the normal synchronous request mechanism and performance might degrade.
	 *     Instead of specifying just the names of components, an object might be given that contains a
	 *     mandatory <code>name</code> property and optionally, an <code>url</code> that will be used for a <code>registerModulePath</code>.
	 * @param {Promise|Promise[]} [mOptions.asyncHints.waitFor] <code>Promise</code> or array of <code>Promise</code>s for which the Component instantiation should wait
	 * @returns {Promise<sap.ui.core.Component>} A Promise that resolves with the newly created component instance
	 *
	 * @since 1.56.0
	 * @static
	 * @public
	 */
	Component.create = function(mOptions) {
		if (typeof mOptions === "string") {
			throw new Error("Component.create() cannot be called with a string.");
		}

		var mParameters = extend(true, {}, mOptions);
		mParameters.async = true;

		// if no manifest option is given, the default is true
		if (mParameters.manifest === undefined) {
			mParameters.manifest = true;
		}

		return componentFactory(mParameters);
	};

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
	 * @param {string} vConfig.name Name of the Component to load, as a dot-separated name;
	 *              Even when an alternative location is specified from which the manifest should be loaded (e.g.
	 *              <code>vConfig.manifest</code> is set to a non-empty string), then the name specified in that
	 *              manifest will be ignored and this name will be used instead to determine the module to be loaded.
	 * @param {string} [vConfig.url] Alternative location from where to load the Component. If a <code>manifestUrl</code> is given, this URL specifies the location of the final component defined via that manifest, otherwise it specifies the location of the component defined via its name <code>vConfig.name</code>.
	 * @param {object} [vConfig.componentData] Initial data of the Component (@see sap.ui.core.Component#getComponentData)
	 * @param {string} [vConfig.id] sId of the new Component
	 * @param {object} [vConfig.settings] Settings of the new Component
	 * @param {boolean} [vConfig.async] Indicates whether the Component creation should be done asynchronously; defaults to true when using the manifest property with a truthy value otherwise the default is false (experimental setting)
	 * @param {object} [vConfig.asyncHints] Hints for the asynchronous loading (experimental setting)
	 * @param {string[]} [vConfig.asyncHints.libs] Libraries that should be (pre-)loaded before the Component (experimental setting)
	 * @param {string[]} [vConfig.asyncHints.components] Components that should be (pre-)loaded before the Component (experimental setting)
	 * @param {Promise|Promise[]} [vConfig.asyncHints.waitFor] @since 1.37.0 a <code>Promise</code> or and array of <code>Promise</code>s for which the Component instantiation should wait (experimental setting)
	 * @param {boolean|string|object} [vConfig.manifest=undefined] @since 1.49.0 Controls when and from where to load the manifest for the Component.
	 *              When set to any truthy value, the manifest will be loaded asynchronously by default and evaluated before the Component controller, if it is set to a falsy value
	 *              other than <code>undefined</code>, the manifest will be loaded after the controller.
	 *              A non-empty string value will be interpreted as the URL location from where to load the manifest.
	 *              A non-null object value will be interpreted as manifest content.
	 *              Setting this property to a value other than <code>undefined</code>, completely deactivates the properties
	 *              <code>manifestUrl</code> and <code>manifestFirst</code>, no matter what their values are.
	 * @param {string} [vConfig.manifestUrl] @since 1.33.0 Specifies the URL from where the manifest should be loaded from
	 *              Using this property implies <code>vConfig.manifestFirst=true</code>.
	 *              <br/><b>DEPRECATED since 1.49.0, use <code>vConfig.manifest=url</code> instead!</b>.
	 *              Note that this property is ignored when <code>vConfig.manifest</code> has a value other than <code>undefined</code>.
	 * @param {boolean} [vConfig.manifestFirst] @since 1.33.0 defines whether the manifest is loaded before or after the
	 *              Component controller. Defaults to <code>sap.ui.getCore().getConfiguration().getManifestFirst()</code>
	 *              <br/><b>DEPRECATED since 1.49.0, use <code>vConfig.manifest=true|false</code> instead!</b>
	 *              Note that this property is ignored when <code>vConfig.manifest</code> has a value other than <code>undefined</code>.
	 * @param {string} [vConfig.handleValidation=false] If set to <code>true</code> validation of the component is handled by the <code>MessageManager</code>
	 * @returns {sap.ui.core.Component|Promise} the Component instance or a Promise in case of asynchronous loading
	 *
	 * @deprecated Since 1.56.0, use one of the following alternatives instead:
	 * <ul>
	 * <li>to load a component class, use {@link sap.ui.core.Component.load Component.load}</li>
	 * <li>to create a new component instance, use {@link sap.ui.core.Component.create Component.create}</li>
	 * <li>to retrieve an existing component instance by its ID, use {@link sap.ui.core.Component.get Component.get}</li>
	 * </ul>
	 * @public
	 * @static
	 * @since 1.15.0
	 * @experimental Since 1.27.0. Support for asyncHints is still experimental and might be modified or removed completely again.
	 *   It must not be used in productive code, except in code delivered by the UI5 teams. The synchronous usage of the API is
	 *   not experimental and can be used without restrictions.
	 */
	sap.ui.component = function(vConfig) {
		if (vConfig && vConfig.async) {
			jQuery.sap.log.info("Do not use deprecated factory function 'sap.ui.component'. Use 'Component.create' instead");
		} else if (typeof vConfig === 'string') {
			jQuery.sap.log.warning("Do not use deprecated function 'sap.ui.component' for Component instance lookup. Use 'Component.get' instead");
		} else {
			jQuery.sap.log.warning("Do not use synchronous component creation! Use the new asynchronous factory 'Component.create' instead");
		}
		return componentFactory(vConfig);
	};

	/*
	 * The old sap.ui.component implementation
	 */
	function componentFactory(vConfig) {
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
	}

	/**
	 * Asynchronously loads a component class without instantiating it; returns a promise on the loaded class.
	 *
	 * Beware: "Asynchronous component loading" doesn't necessarily mean that no more synchronous loading
	 * occurs. Both the framework as well as component implementations might still execute synchronous
	 * requests. <code>Component.load</code> just allows to use async calls internally.
	 *
	 * When a manifest is referenced in <code>mOptions</code>, this manifest is not automatically used
	 * for instances of the Component class that are created after loading. The manifest or the manifest url
	 * must be provided for every instance explicitly.
	 *
	 * To optimize the loading process, additional <code>asyncHints</code> can be provided.
	 * If components and/or libraries are listed in the <code>asyncHints</code>, all the corresponding preload
	 * files will be requested in parallel, loading errors (404s) will be ignored. The constructor class will
	 * only be required after all preloads have been rejected or resolved.
	 * The structure of the hints and how they impact the loading of components is an internal feature
	 * of this API and reserved for UI5 internal use only. Code that wants to be safe wrt. version updates,
	 * should not use the <code>asyncHints</code> property.
	 *
	 * @param {object} mOptions Configuration options
	 * @param {string} mOptions.name Name of the Component to load, as a dot-separated name;
	 *     Even when an alternative location is specified from which the manifest should be loaded
	 *     (<code>mOptions.manifest</code> is set to a non-empty string), then the name specified in that
	 *     manifest will be ignored and this name will be used instead to determine the module to be loaded.
	 * @param {string} [mOptions.url] Alternative location from where to load the Component. If <code>mOptions.manifest</code>
	 *     is set to a non-empty string, this URL specifies the location of the final component defined via that
	 *     manifest, otherwise it specifies the location of the component defined via its name <code>mOptions.name</code>.
	 * @param {boolean|string|object} [mOptions.manifest=true] Whether and from where to load the manifest.json for the Component.
	 *     When set to any truthy value, the manifest will be loaded and evaluated before the Component controller.
	 *     If it is set to a falsy value, the manifest will not be evaluated before the controller. It might still be loaded synchronously
	 *     if declared in the Component metadata.
	 *     A non-empty string value will be interpreted as the URL to load the manifest from.
	 *     A non-null object value will be interpreted as manifest content.
	 * @param {object} [mOptions.asyncHints] Hints for asynchronous loading
	 * @param {string[]|object[]} [mOptions.asyncHints.components] a list of components needed by the current component and its subcomponents
	 *     The framework will try to preload these components (their Component-preload.js) asynchronously, errors will be ignored.
	 *     Please note that the framework has no knowledge about whether a Component provides a preload file or whether it is bundled
	 *     in some library preload. If Components are listed in the hints section, they will be preloaded.
	 *     Instead of specifying just the names of components, an object might be given that contains a
	 *     mandatory <code>name</code> property and optionally, an <code>url</code> that will be used for a <code>registerModulePath</code>,
	 *     and/or a <code>lazy</code> property. When <code>lazy</code> is set to a truthy value, only a necessary <code>registerModulePath</code>
	 *     will be executed, but the corresponding component won't be preloaded.
	 * @param {string[]|object[]} [mOptions.asyncHints.libs] libraries needed by the Component and its subcomponents
	 *     These libraries should be (pre-)loaded before the Component.
	 *     The framework will asynchronously load those libraries, if they're not loaded yet.
	 *     Instead of specifying just the names of libraries, an object might be given that contains a
	 *     mandatory <code>name</code> property and optionally, an <code>url</code> that will be used for a <code>registerModulePath</code>,
	 *     and/or a <code>lazy</code> property. When <code>lazy</code> is set to a truthy value, only a necessary <code>registerModulePath</code>
	 *     will be executed, but the corresponding library won't be preloaded.
	 * @param {string[]|object[]} [mOptions.asyncHints.preloadBundles] a list of additional preload bundles
	 *     The framework will try to load these bundles asynchronously before requiring the component, errors will be ignored.
	 *     The named modules must only represent preload bundles. If they are normal modules, their dependencies
	 *     will be loaded with the standard module loading mechanism and performance might degrade.
	 *     Instead of specifying just the names of components, an object might be given that contains a
	 *     mandatory <code>name</code> property and, optionally, a <code>url</code> that will be used for a <code>registerModulePath</code>.
	 * @param {boolean} [mOptions.asyncHints.preloadOnly=false] Whether only the preloads should be done, but not the loading of the Component controller class itself.
	 * @returna {Promise<function>} A Promise that resolves with the loaded component class or <code>undefined</code> in case
	 *      <code>mOptions.asyncHints.preloadOnly</code> is set to <code>true</code>
	 *
	 * @since 1.56.0
	 * @static
	 * @public
	 */
	Component.load = function (mOptions) {

		var mParameters = extend(true, {}, mOptions);
		mParameters.async = true;

		// if no manifest option is given, the default is true
		if (mParameters.manifest === undefined) {
			mParameters.manifest = true;
		}

		return loadComponent(mParameters, {
			preloadOnly: mParameters.asyncHints && mParameters.asyncHints.preloadOnly
		});
	};

	/**
	 * Returns an existing component instance, identified by its ID.
	 *
	 * @param {string} sId ID of the component.
	 * @returns {sap.ui.core.Component} Component instance or <code>undefined</code> when no component
	 *     with the given ID exists.
	 * @since 1.56.0
	 * @static
	 * @public
	 */
	Component.get = function (sId) {
		// lookup and return the component
		return sap.ui.getCore().getComponent(sId);
	};

	/**
	 * Load a component without instantiating it.
	 *
	 * Provides support for loading components asynchronously by setting
	 * <code>oConfig.async</code> to true. In that case, the method returns a JavaScript 6
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
	 * If a preload is deactivated by configuration (e.g. debug mode), then remaining requests still might be synchronous.
	 *
	 * @param {object} oConfig Configuration object describing the Component to be loaded. See {@link sap.ui.component} for more information.
	 * @returns {function|Promise} Constructor of the component class or a Promise that will be fulfilled with the same
	 *
	 * @deprecated since 1.56, use {@link sap.ui.core.Component.load}
	 * @since 1.16.3
	 * @static
	 * @public
	 * @experimental Since 1.27.0. Support for <code>asyncHints</code> is still experimental and might be modified or removed completely again.
	 *   It must not be used in productive code, except in code delivered by the UI5 teams. The synchronous usage of the API is
	 *   not experimental and can be used without restrictions.
	 */
	sap.ui.component.load = function(oConfig, bFailOnError) {
		jQuery.sap.log.warning("Do not use deprecated function 'sap.ui.component.load'! Use 'Component.load' instead");
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
	 * @param {Promise|Promise[]} mOptions.waitFor see <code>sap.ui.component</code> (<code>vConfig.asyncHints.waitFor</code>)
	 * @return {function|Promise} the constructor of the Component class or a Promise that will be fulfilled with the same
	 *
	 * @private
	*/
	function loadComponent(oConfig, mOptions) {

		var sName = oConfig.name,
			sUrl = oConfig.url,
			oConfiguration = sap.ui.getCore().getConfiguration(),
			bComponentPreload = /^(sync|async)$/.test(oConfiguration.getComponentPreload()),
			vManifest = oConfig.manifest,
			bManifestFirst,
			sManifestUrl,
			oManifest,
			mModels,
			mModelConfigs,
			fnCallLoadComponentCallback;

		function createSanitizedManifest( oRawManifestJSON ) {
			var oManifest = new Manifest( JSON.parse(JSON.stringify(oRawManifestJSON)) );
			return oConfig.async ? Promise.resolve(oManifest) : oManifest;
		}

		if ( vManifest === undefined ) {
			// no manifest property set, evaluate legacy properties
			bManifestFirst = oConfig.manifestFirst === undefined ? oConfiguration.getManifestFirst() : !!oConfig.manifestFirst;
			sManifestUrl = oConfig.manifestUrl;
			// oManifest = undefined;
		} else {
			// in case of manifest property is set, by default we load async
			if ( oConfig.async === undefined ) {
				oConfig.async = true;
			}
			// determine the semantic of the manifest property
			bManifestFirst = !!vManifest;
			sManifestUrl = vManifest && typeof vManifest === 'string' ? vManifest : undefined;
			oManifest = vManifest && typeof vManifest === 'object' ? createSanitizedManifest(vManifest) : undefined;
		}

		// set the name of this newly loaded component at the interaction measurement,
		// as otherwise this would be the outer component from where it was called,
		// which is not true - this component causes the load
		jQuery.sap.interaction.setStepComponent(sName);

		// if we find a manifest URL in the configuration
		// we will load the manifest from the specified URL (sync or async)
		if (!oManifest && sManifestUrl) {
			oManifest = Manifest.load({
				manifestUrl: sManifestUrl,
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

		// if a component name and a URL is given, we register this URL for the name of the component:
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
				manifestUrl: jQuery.sap.getModulePath(sName, "/manifest.json"),
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
				http2 = sap.ui.getCore().getConfiguration().getDepCache(),
				sPreloadName;

			// only load the Component-preload file if the Component module is not yet available
			if ( bComponentPreload && sComponentName != null && !jQuery.sap.isDeclared(sController, /* bIncludePreloaded=*/ true) ) {

				if ( bAsync ) {
					sPreloadName = jQuery.sap.getResourceName(sController, http2 ? '-h2-preload.js' : '-preload.js'); // URN
					return jQuery.sap._loadJSResourceAsync(sPreloadName, true);
				}

				try {
					sPreloadName = sController + '-preload'; // Module name
					jQuery.sap.require(sPreloadName);
				} catch (e) {
					jQuery.sap.log.warning("couldn't preload component from " + sPreloadName + ": " + ((e && e.message) || e));
				}
			} else if (bAsync) {
				return Promise.resolve();
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

			// lookup the non-lazy components from component dependencies
			var aComponents = [];
			var mComponents = oManifest.getEntry("/sap.ui5/dependencies/components");
			if (mComponents) {
				for (var sComponentName in mComponents) {
					// filter the lazy components
					if (!mComponents[sComponentName].lazy) {
						aComponents.push(sComponentName);
					}
				}
			}

			// lookup the non-lazy components from component usages
			var mUsages = oManifest.getEntry("/sap.ui5/componentUsages");
			if (mUsages) {
				// filter the lazy usages
				for (var sUsage in mUsages) {
					// default value is true, so explicit check for false
					if (mUsages[sUsage].lazy === false && aComponents.indexOf(mUsages[sUsage].name) === -1) {
						aComponents.push(mUsages[sUsage].name);
					}
				}
			}

			// preload the collected components
			if (aComponents.length > 0) {
				aComponents.forEach(function(sComponentName) {
					fnCollect(preload(sComponentName, bAsync));
				});
			}

			return bAsync ? Promise.all(aPromises) : undefined;

		}

		if ( oConfig.async ) {

			// trigger loading of libraries and component preloads and collect the given promises
			var hints = oConfig.asyncHints || {},
				promises = [],
				reflect = function(oPromise) {
					// In order to make the error handling of the Promise.all() happen after all Promises finish, we catch all rejected Promises and make them resolve with an marked object.
					oPromise = oPromise.then(
						function(v) {
							return {
								result: v,
								rejected: false
							};
						},
						function(v) {
							return {
								result: v,
								rejected: true
							};
						}
					);
					return oPromise;
				},
				collect = function(oPromise) {
					if ( oPromise ) {
						promises.push(reflect(oPromise));
					}
				},
				identity = function($) { return $; },
				phase1Preloads,
				libs;

			if (oManifest && mOptions.createModels) {
				collect(oManifest.then(function(oManifest) {
					// Calculate configurations of preloaded models once the manifest is available
					mModelConfigs = getPreloadModelConfigsFromManifest(oManifest, oConfig.componentData, hints.cacheTokens);

					return oManifest;
				}).then(function(oManifest) {
					// Create preloaded models directly after the manifest has been loaded
					if (Object.keys(mModelConfigs.afterManifest).length > 0) {
						mModels = Component._createManifestModels(mModelConfigs.afterManifest, oManifest.getComponentName());
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
					return preload(sComponentName, true).then(function() {
						// after preload is finished, the resource models from the manifest are loaded

						if (!mOptions.createModels) {
							return null;
						}

						var aResourceModelNames = Object.keys(mModelConfigs.afterPreload);

						if (aResourceModelNames.length === 0) {
							return null;
						}

						// if there are resource models to be loaded, load the resource bundle async first.
						// a promise is returned which resolves after all resource models are loaded
						return new Promise(function(resolve /*, reject*/) {
							// load the sap.ui.model/resource/ResourceModel class async if it's not loaded yet
							sap.ui.require(["sap/ui/model/resource/ResourceModel"], function(ResourceModel) {
								// Directly resolve as otherwise uncaught exceptions can't be handled
								resolve(ResourceModel);
							});
						}).then(function(ResourceModel) {
							function loadResourceBundle(sModelName) {
								var mModelConfig = mModelConfigs.afterPreload[sModelName];
								if (Array.isArray(mModelConfig.settings) && mModelConfig.settings.length > 0) {
									var mModelSettings = mModelConfig.settings[0]; // first argument is the config map
									return ResourceModel.loadResourceBundle(mModelSettings, true).then(function(oResourceBundle) {
										// Extend the model settings with the preloaded bundle so that no sync request
										// is triggered once the model gets created
										mModelSettings.bundle = oResourceBundle;
									}, function(err) {
										jQuery.sap.log.error("Component Manifest: Could not preload ResourceBundle for ResourceModel. " +
											"The model will be skipped here and tried to be created on Component initialization.",
											"[\"sap.ui5\"][\"models\"][\"" + sModelName + "\"]", sComponentName);
										jQuery.sap.log.error(err);

										// If the resource bundle can't be loaded, the resource model will be skipped.
										// But once the component instance gets created, the model will be tried to created again.
										delete mModelConfigs.afterPreload[sModelName];
									});
								} else {
									// Can't load bundle as no settings are defined.
									// Should not happen as those models won't be part of "mModelConfigs.afterPreload"
									return Promise.resolve();
								}
							}

							// Load all ResourceBundles for all models in parallel
							return Promise.all(aResourceModelNames.map(loadResourceBundle)).then(function() {
								if (Object.keys(mModelConfigs.afterPreload).length > 0) {
									var mResourceModels = Component._createManifestModels(mModelConfigs.afterPreload, oManifest.getComponentName());
									if (!mModels) {
										mModels = {};
									}
									for (var sKey in mResourceModels) {
										mModels[sKey] = mResourceModels[sKey];
									}
								}
							});
						});
					});
				}));

				fnCallLoadComponentCallback = function(oLoadedManifest) {
					// if a callback is registered to the component load, call it with the configuration
					if (typeof Component._fnLoadComponentCallback === "function") {
						// secure configuration and manifest from manipulation
						var oConfigCopy = jQuery.extend(true, {}, oConfig);
						var oManifestCopy = jQuery.extend(true, {}, oLoadedManifest);
						// trigger the callback with a copy of its required data
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
			return Promise.all(promises).then(function(v) {
				// If any promise is rejected, a new rejected Promise is forwarded on the chain which leads to the catch clause
				var aResults = [],
					bErrorFound = false,
					vError;

				bErrorFound = v.some(function(oResult) {
					if (oResult && oResult.rejected) {
						vError = oResult.result;
						return true;
					}
					aResults.push(oResult.result);
				});

				if (bErrorFound) {
					return Promise.reject(vError);
				}

				return aResults;
			}).then(function (v) {
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
						// Directly resolve as otherwise uncaught exceptions can't be handled
						resolve(oClass);
					});
				}).then(function(oClass) {
					var oMetadata = oClass.getMetadata();
					var sName = oMetadata.getComponentName();
					var sDefaultManifestUrl = jQuery.sap.getModulePath(sName, "/manifest.json");
					var pLoaded;

					// Check if we loaded the manifest.json from the default location
					// In this case it can be directly passed to its metadata class to prevent an additional request
					if (oManifest && typeof vManifest !== "object" && (typeof sManifestUrl === "undefined" || sManifestUrl === sDefaultManifestUrl)) {
						pLoaded = loadManifests(oMetadata, oManifest);
					} else {
						pLoaded = loadManifests(oMetadata);
					}

					return pLoaded.then(function() {
						// prepare the loaded class and resolve with it
						return prepareControllerClass(oClass);
					});
				});
			}).then(function(oControllerClass) {
				if (!oManifest) {
					return oControllerClass;
				}

				// Load all modules derived from "/sap.ui5" manifest entries asynchronously (if underlaying loader supports it)
				// Note: this does not load modules declared / derived from parent manifests (e.g. extension scenario)
				var aModuleNames = [];

				// lookup rootView class
				var sRootViewType;
				var oRootView = oManifest.getEntry("/sap.ui5/rootView");
				if (typeof oRootView === "string") {
					// String as rootView defaults to ViewType XML
					// See: UIComponent#createContent and UIComponentMetadata#_convertLegacyMetadata
					sRootViewType = "XML";
				} else if (oRootView && typeof oRootView === "object" && oRootView.type) {
					sRootViewType = oRootView.type;
				}
				if (sRootViewType && ViewType[sRootViewType]) {
					var sViewClass = "sap/ui/core/mvc/" + ViewType[sRootViewType] + "View";
					aModuleNames.push(sViewClass);
				}

				// lookup router class
				var oRouting = oManifest.getEntry("/sap.ui5/routing");
				if (oRouting && oRouting.routes) {
					var sRouterClass = oManifest.getEntry("/sap.ui5/routing/config/routerClass") || "sap.ui.core.routing.Router";
					var sRouterClassModule = jQuery.sap.getResourceName(sRouterClass, "");
					aModuleNames.push(sRouterClassModule);
				}

				// lookup model classes
				var mManifestModels = jQuery.extend(true, {}, oManifest.getEntry("/sap.ui5/models"));
				var mManifestDataSources = jQuery.extend(true, {}, oManifest.getEntry("/sap.app/dataSources"));
				var mAllModelConfigurations = Component._createManifestModelConfigurations({
					models: mManifestModels,
					dataSources: mManifestDataSources,
					manifest: oManifest,
					cacheTokens: hints.cacheTokens
				});
				for (var mModelName in mAllModelConfigurations) {
					if (!mAllModelConfigurations.hasOwnProperty(mModelName)) {
						continue;
					}
					var oModelConfig = mAllModelConfigurations[mModelName];
					if (!oModelConfig.type) {
						continue;
					}
					var sModuleName = jQuery.sap.getResourceName(oModelConfig.type, "");
					if (aModuleNames.indexOf(sModuleName) === -1) {
						aModuleNames.push(sModuleName);
					}
				}

				if (aModuleNames.length > 0) {
					return Promise.all(aModuleNames.map(function(sModuleName) {
						// All modules are required separately to have a better error logging.
						// This "preloading" is done for optimization to enable async loading
						// in case the underlaying loader supports it. If loading fails, the component
						// should still be created which might fail once the required module is actually used / loaded
						return new Promise(function(resolve, reject) {
							var bResolved = false;
							function logErrorAndResolve(err) {
								if (bResolved) {
									return;
								}
								jQuery.sap.log.warning("Can not preload module \"" + sModuleName + "\". " +
									"This will most probably cause an error once the module is used later on.",
									oManifest.getComponentName(), "sap.ui.core.Component");
								jQuery.sap.log.warning(err);

								bResolved = true;
								resolve();
							}
							sap.ui.require([sModuleName], resolve, logErrorAndResolve);
						});
					})).then(function() {
						return oControllerClass;
					});
				} else {
					return oControllerClass;
				}
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
