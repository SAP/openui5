/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ComponentMetadata
sap.ui.define([
	'sap/ui/base/ManagedObjectMetadata',
	'sap/ui/core/Manifest',
	'sap/base/future',
	'sap/base/Log',
	'sap/base/util/deepExtend',
	'sap/base/util/isPlainObject',
	'sap/base/util/LoaderExtensions'
], function(ManagedObjectMetadata, Manifest, future, Log, deepExtend, isPlainObject, LoaderExtensions) {
	"use strict";

	var syncCallBehavior = sap.ui.loader._.getSyncCallBehavior();

	/**
	 * Creates a new metadata object for a Component subclass.
	 *
	 * @param {string} sClassName Fully qualified name of the class that is described by this metadata object
	 * @param {object} oClassInfo Static info to construct the metadata from
	 * @param {sap.ui.core.Component.MetadataOptions} [oClassInfo.metadata]
	 *  The metadata object describing the class
	 *
	 * @public
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.9.2
	 * @alias sap.ui.core.ComponentMetadata
	 * @extends sap.ui.base.ManagedObjectMetadata
	 */
	var ComponentMetadata = function(sClassName, oClassInfo) {

		// call super constructor
		ManagedObjectMetadata.apply(this, arguments);

	};

	//chain the prototypes
	ComponentMetadata.prototype = Object.create(ManagedObjectMetadata.prototype);
	ComponentMetadata.prototype.constructor = ComponentMetadata;

	ComponentMetadata.prototype.applySettings = function(oClassInfo) {
		var oStaticInfo = this._oStaticInfo = oClassInfo.metadata;

		var sName = this.getName(),
		    sPackage = sName.replace(/\.\w+?$/, "");

		if (oClassInfo && typeof oClassInfo.metadata === "string") {
			future.errorThrows("Component Metadata must not be a string. Please use \"metadata: { manifest: 'json' }\" instead.");
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
	 * @param {boolean} [bSkipProcess=false] whether the sync processing of the manifest should be skipped.
	 *  This needs to be set to true when the processing of manifest should be done asynchronously with
	 *  separated code
	 * @private
	 * @ui5-restricted sap.ui.core.Component
	 */
	ComponentMetadata.prototype._applyManifest = function(oManifestJson, bSkipProcess = false) {
		// Make sure to not create the manifest object twice!
		// This could happen when the manifest is accessed (via #getManifestObject) while sap.ui.component is loading it.
		// Then the async request wouldn't be cancelled and the manifest already loaded (sync) should not be be overridden.
		if (this._oManifest) {
			Log.info("Can't apply manifest to ComponentMetadata as it has already been created.", this.getName(), "sap.ui.core.ComponentMetadata");
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
			baseUrl: sap.ui.require.toUrl(this.getComponentName().replace(/\./g, "/")) + "/",
			process: !bSkipProcess && this._oStaticInfo.__metadataVersion === 2
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
		Log.error("The function ComponentMetadata#onInitComponent will be removed soon!");
	};

	/**
	 * Component instances need to unregister themselves in this method to disable
	 * the customizing for this component. This will only be done for the last
	 * instance and only if a customizing configuration is available.
	 * @param {sap.ui.core.Component} oInstance reference to the Component instance
	 * @private
	 */
	ComponentMetadata.prototype.onExitComponent = function(oInstance) {
		Log.error("The function ComponentMetadata#onExitComponent will be removed soon!");
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
				var bIsResourceLoaded = !!sap.ui.loader._.getModuleState(sResource);

				// Only handle sync behavior if resource is not taken from preload cache
				if (!bIsResourceLoaded && syncCallBehavior === 2) {
					Log.error("[nosync] Loading manifest of the component " + sName + " ignored.", sResource, "sap.ui.core.ComponentMetadata");
					oManifest = {};
				} else {
					if (!bIsResourceLoaded && syncCallBehavior === 1) {
						Log.error("[nosync] The manifest of the component " + sName + " is loaded with sync XHR.", sResource, "sap.ui.core.ComponentMetadata");
					} else {
						Log.info("The manifest of the component " + sName + " is loaded from file " + sResource + ".");
					}

					try {
						// This sync loading should not happen in the following cases
						// - there is a Component-preload.js that contains the manifest.json
						// - OR
						// - sap.ui.component / sap.ui.component.load are used with "async=true" and/or
						//   "manifest=true|String|Object" to create / load the component
						//   (Also see #_applyManifest)
						var oResponse = LoaderExtensions.loadResource(sResource, {
							dataType: "json"
						});
						oManifest = oResponse;
					} catch (err) {
						Log.error("Failed to load component manifest from \"" + sResource + "\" (component " + sName + ")! Reason: " + err);
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
	 *
	 * @return {object|null} manifest
	 * @private
	 * @ui5-restricted sap.ui.core.Component
	 * @since 1.29.0
	 */
	ComponentMetadata.prototype._getManifest = function() {
		// use raw manifest in case of legacy metadata
		if (this.getMetadataVersion() === 1) {
			return this.getManifestObject().getRawJson();
		}
		return this.getManifestObject().getJson();
	};

	/**
	 * Returns the configuration of a manifest section or the value for a
	 * specific path. If no section or key is specified, the return value is null.
	 *
	 * Sample and more information see public function documentation.
	 *
	 * @param {string} sKey Either the manifest section name (namespace) or a concrete path
	 * @param {boolean} [bMerged=false] Indicates whether the custom configuration is merged with the parent custom configuration of the Component.
	 * @return {any|null} Value of the manifest section or the key (could be any kind of value)
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	ComponentMetadata.prototype._getManifestEntry = function(sKey, bMerged) {
		var oData = this.getManifestObject().getEntry(sKey);

		// merge / extend should only be done for objects or when entry wasn't found
		if (oData !== undefined && !isPlainObject(oData)) {
			return oData;
		}

		// merge the configuration of the parent manifest with local manifest
		// the configuration of the static component metadata will be ignored
		var oParent, oParentData;
		if (bMerged && (oParent = this.getParent()) instanceof ComponentMetadata) {
			oParentData = oParent._getManifestEntry(sKey, bMerged);
		}

		// only extend / clone if there is data
		// otherwise "null" will be converted into an empty object
		if (oParentData || oData) {
				oData = deepExtend({}, oParentData, oData);
		}

		return oData;
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
});