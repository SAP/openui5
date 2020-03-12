/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/base/util/merge",
	"sap/base/Log"
], function (
	jQuery,
	ManagedObject,
	Utils,
	LrepConnector,
	merge,
	Log
) {
	"use strict";

	/**
	 * App variant API
	 *
	 * @param {object} mPropertyBag Parameters
	 * @param {string} mPropertyBag.id ID of the app variant to be provided for a new app variant and for deleting an app variant
	 * @param {string} [mPropertyBag.reference] Proposed referenced descriptor or app variant ID (might be overwritten by the back end) to be provided when creating a new app variant
	 * @param {string} [mPropertyBag.transport] Transport with which the app variant should be transported
	 * @param {string} [mPropertyBag.package] Package of the app variant
	 * @param {string} [mPropertyBag.version] Version of the app variant
	 * @param {string} [mPropertyBag.layer='CUSTOMER'] Current working layer (might be overwritten by the back end) when creating a new app variant
	 *
	 * @constructor
	 * @alias sap.ui.fl.write._internal.appVariant.AppVariant
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	var AppVariant = ManagedObject.extend("sap.ui.fl.write._internal.appVariant.AppVariant", /** @lends sap.ui.fl.write._internal.appVariant.AppVariant */ {
		constructor : function(mPropertyBag) {
			ManagedObject.apply(this);
			if (!jQuery.isPlainObject(mPropertyBag)) {
				Log.error("Constructor : sap.ui.fl.write._internal.appVariant.AppVariant: mPropertyBag is not defined");
			}
			this._oDefinition = mPropertyBag;
			return this;
		},
		metadata : {
			properties : {
				mode : {
					type: "string"
				}
			}
		}
	});

	AppVariant.modes = {
		NEW: "NEW",
		EXISTING : "EXISTING",
		DELETION: "DELETION"
	};

	AppVariant.prototype._isValidMode = function(sMode) {
		var bModeFound = false;
		Object.keys(AppVariant.modes).some(function(sKey) {
			if (AppVariant.modes[sKey] === sMode) {
				bModeFound = true;
			}
		});

		return bModeFound;
	};

	/**
	 * Sets the operation mode.
	 *
	 * @param {string} sMode Operation mode
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariant.prototype.setMode = function(sMode) {
		if (this._isValidMode(sMode)) {
			this.setProperty("mode", sMode);
		} else {
			throw new Error("Provide a correct operation mode");
		}
	};

	/**
	 * Sets the transport request (for ABAP back end).
	 *
	 * @param {string} sTransportRequest ABAP transport request
	 *
	 * @return {Promise} Resolving when setting of transport request was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariant.prototype.setTransportRequest = function(sTransportRequest) {
		try {
			//partial check: length le 20, alphanumeric, upper case, no space not underscore - data element in ABAP: TRKORR, CHAR20
			Utils.checkTransportRequest(sTransportRequest);
		} catch (oError) {
			return Promise.reject(oError);
		}
		this._oDefinition.transport = sTransportRequest;
		return Promise.resolve();
	};

	/**
	 * Sets the reference of app variant.
	 *
	 * @param {string} sReference New reference
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariant.prototype.setReference = function(sReference) {
		if (sReference === undefined || typeof sReference !== "string") {
			throw new Error("No parameter sReference of type string provided");
		}
		this._oDefinition.reference = sReference;
	};

	/**
	 * Sets the package (for the ABAP back end).
	 *
	 * @param {string} sPackage ABAP package
	 *
	 * @return {Promise} Resolving when setting of package was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariant.prototype.setPackage = function(sPackage) {
		try {
			//partial check: length le 30, alphanumeric, upper case, / for namespace, no space, no underscore - data element in ABAP: DEVCLASS, CHAR30
			Utils.checkPackage(sPackage);
		} catch (oError) {
			return Promise.reject(oError);
		}
		this._oDefinition.packageName = sPackage;
		return Promise.resolve();
	};

	/**
	 * Gets the definition of the app variant in JSON format.
	 * @returns {object} Content of the app variant file
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariant.prototype.getDefinition = function () {
		return this._oDefinition;
	};

	AppVariant.prototype.getId = function() {
		return this._oDefinition.id;
	};

	AppVariant.prototype.getNamespace = function() {
		return this._oDefinition.namespace || Utils.getNameAndNameSpace(this._oDefinition.id, this._oDefinition.reference).namespace;
	};

	AppVariant.prototype.getFileName = function() {
		return this._oDefinition.fileName || Utils.getNameAndNameSpace(this._oDefinition.id, this._oDefinition.reference).fileName;
	};

	AppVariant.prototype.getReference = function() {
		return this._oDefinition.reference;
	};

	AppVariant.prototype.getPackage = function() {
		return this._oDefinition.packageName;
	};

	AppVariant.prototype.getVersion = function() {
		return this._oDefinition.version;
	};

	AppVariant.prototype.getTransportRequest = function() {
		return this._oDefinition.transport;
	};

	/**
	 * Returns a copy of the JSON object of the app variant
	 *
	 * @return {object} Copy of JSON object of the app variant
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariant.prototype.getJson = function() {
		return merge({}, this._getMap());
	};

	AppVariant.prototype._getMap = function() {
		var mMap = {};
		switch (this.getMode()) {
			case AppVariant.modes.NEW:
				mMap = {
					fileName: this.getFileName(),
					fileType: "appdescr_variant",
					namespace: this.getNamespace(),
					layer: this._oDefinition.layer,
					packageName: this._oDefinition.packageName ? this._oDefinition.packageName : "",
					reference: this._oDefinition.reference,
					id: this._oDefinition.id,
					content: this._oDefinition.content || []
				};
				if (this._oDefinition.referenceVersion) {
					mMap.referenceVersion = this._oDefinition.referenceVersion;
				}
				if (this._oDefinition.version) {
					mMap.version = this._oDefinition.version;
				}
				break;
			case AppVariant.modes.EXISTING:
				mMap = {
					fileName: this._oDefinition.fileName,
					fileType: this._oDefinition.fileType,
					namespace: this._oDefinition.namespace,
					layer: this._oDefinition.layer,
					packageName: this._oDefinition.packageName,
					reference: this._oDefinition.reference,
					id: this._oDefinition.id,
					content: this._oDefinition.content
				};
				if (this._oDefinition.referenceVersion) {
					mMap.referenceVersion = this._oDefinition.referenceVersion;
				}
				if (this._oDefinition.version) {
					mMap.version = this._oDefinition.version;
				}
				break;
			case AppVariant.modes.DELETION:
				mMap = {
					id: this._oDefinition.id
				};
				break;
			default: // Do nothing
		}
		return mMap;
	};

	/**
	 * Adds a descriptor inline change to the app variant.
	 *
	 * @param {sap.ui.fl.descriptorRelated.api.DescriptorInlineChange} oDescriptorInlineChange Inline change
	 *
	 * @return {Promise} Resolving when adding the descriptor inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariant.prototype.addDescriptorInlineChange = function(oDescriptorInlineChange) {
		//TODO: This method will be optimized and go to other class in the follow up change
		return new Promise(function(resolve) {
			var fSetHostingIdForTextKey = function(_oDescriptorInlineChange, sId) {
				//providing "hosting id" for appdescr_app_setTitle and similar
				//"hosting id" is app variant id
				if (_oDescriptorInlineChange["setHostingIdForTextKey"]) {
					_oDescriptorInlineChange.setHostingIdForTextKey(sId);
				}
			};

			fSetHostingIdForTextKey(oDescriptorInlineChange, this.getId());
			this._oDefinition.content.push(oDescriptorInlineChange.getMap());
			resolve(null);
		}.bind(this));
	};

	/**
	 * Submits the app variant to the back end.
	 * @return {Promise} Resolving when submitting the app variant was successful
	 * Since this method is only called for app variants on ABAP platform, the direct usage of write LrepConnector is triggered.
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariant.prototype.submit = function() {
		var mMap = this._getMap();

		var mPropertyBag = {
			flexObject: {},
			appVariant: this
		};

		if (this._oDefinition.transport) {
			mPropertyBag.transport = this._oDefinition.transport;
		}
		if (this._oDefinition.skipIam) {
			mPropertyBag.skipIam = this._oDefinition.skipIam;
		}

		if (this._oDefinition.isForSmartBusiness) {
			mPropertyBag.isForSmartBusiness = this._oDefinition.isForSmartBusiness;
		}

		if (mMap.layer) {
			mPropertyBag.layer = mMap.layer;
		}

		mPropertyBag.url = "/sap/bc/lrep";

		var oBackendOperation;
		switch (this.getMode()) {
			case AppVariant.modes.NEW:
				Object.assign(mPropertyBag.flexObject, mMap);
				oBackendOperation = LrepConnector.appVariant.create(mPropertyBag);
				break;
			case AppVariant.modes.EXISTING:
				mPropertyBag.reference = mMap.id;
				Object.assign(mPropertyBag.flexObject, mMap);
				oBackendOperation = LrepConnector.appVariant.update(mPropertyBag);
				break;
			case AppVariant.modes.DELETION:
				mPropertyBag.reference = mMap.id;
				oBackendOperation = LrepConnector.appVariant.remove(mPropertyBag);
				break;
			default:
				return Promise.reject("Please provide a valid operation.");
		}

		return oBackendOperation.then(function(oResult) {
			return oResult;
		});
	};

	return AppVariant;
}, true);