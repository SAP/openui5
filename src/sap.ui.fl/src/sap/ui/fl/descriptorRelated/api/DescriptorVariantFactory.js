/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/merge",
	"sap/ui/fl/write/_internal/connectors/LrepConnector"
], function(
	LayerUtils,
	Utils,
	Settings,
	jQuery,
	fnBaseMerge,
	LrepConnector
) {
	"use strict";

	/**
	 * App variant
	 *
	 * @param {object} mParameters parameters
	 * @param {string} mParameters.id the id of the app variant id to be provided for a new app variant and for deleting a app variant
	 * @param {string} mParameters.reference the proposed referenced descriptor or app variant id (might be overwritten by the backend) to be provided when creating a new app variant
	 * @param {string} [mParameters.version] version of the app variant (optional)
	 * @param {string} [mParameters.layer='CUSTOMER'] the proposed layer (might be overwritten by the backend) when creating a new app variant
	 * @param {object} mFileContent file content of the existing app variant to be provided if app variant shall be created from an existing
	 * @param {boolean} [bDeletion=false] deletion indicator to be provided if app variant shall be deleted
	 * @param {sap.ui.fl.registry.Settings} oSettings settings
	 *
	 * @constructor
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorVariant
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */


	//App variant
	var DescriptorVariant = function(mParameters, mFileContent, bDeletion, oSettings) {
		if (mParameters && bDeletion) {
			this._id = mParameters.id;
			this._mode = 'DELETION';
			this._mMap = mFileContent;
		} else if (mParameters) {
			this._id = mParameters.id;
			this._reference = mParameters.reference;
			this._layer = mParameters.layer;
			if (typeof mParameters.referenceVersion !== "undefined") {
				this._referenceVersion = mParameters.referenceVersion;
			}
			this._mode = 'NEW';
			this._skipIam = mParameters.skipIam;
			this._version = mParameters.version;
		} else if (mFileContent) {
			this._mMap = mFileContent;
			this._mode = 'FROM_EXISTING';
		}
		this._oSettings = oSettings;
		this._sTransportRequest = mParameters && mParameters.transport ? mParameters.transport : null;
		this._content = [];
	};

	/**
	 * Adds a descriptor inline change to the app variant
	 *
	 * @param {sap.ui.fl.descriptorRelated.api.DescriptorInlineChange} oDescriptorInlineChange the inline change
	 *
	 * @return {Promise} resolving when adding the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariant.prototype.addDescriptorInlineChange = function(oDescriptorInlineChange) {
		var that = this;
		return new Promise(function(resolve) {
			var fSetHostingIdForTextKey = function(_oDescriptorInlineChange, sId) {
				//providing "hosting id" for appdescr_app_setTitle and similar
				//"hosting id" is app variant id
				if (_oDescriptorInlineChange["setHostingIdForTextKey"]) {
					_oDescriptorInlineChange.setHostingIdForTextKey(sId);
				}
			};

			switch (that._mode) {
				case 'NEW':
					fSetHostingIdForTextKey(oDescriptorInlineChange, that._id);
					that._content.push(oDescriptorInlineChange.getMap());
					break;
				case 'FROM_EXISTING':
					fSetHostingIdForTextKey(oDescriptorInlineChange, that._mMap.id);
					that._mMap.content.push(oDescriptorInlineChange.getMap());
					break;
				default:
					// do nothing
			}
			resolve(null);
		});
	};

	/**
	 * Set transport request (for ABAP Backend)
	 *
	 * @param {string} sTransportRequest ABAP transport request
	 *
	 * @return {Promise} resolving when setting of transport request was successful
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariant.prototype.setTransportRequest = function(sTransportRequest) {
		try {
			//partial check: length le 20, alphanumeric, upper case, no space not underscore - data element in ABAP: TRKORR, CHAR20
			Utils.checkTransportRequest(sTransportRequest);
		} catch (oError) {
			return Promise.reject(oError);
		}
		this._sTransportRequest = sTransportRequest;
		return Promise.resolve();
	};

	/**
	 * Set package (for ABAP Backend)
	 *
	 * @param {string} sPackage ABAP package
	 *
	 * @return {Promise} resolving when setting of package was successful
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariant.prototype.setPackage = function(sPackage) {
		try {
			//partial check: length le 30, alphanumeric, upper case, / for namespace, no space, no underscore - data element in ABAP: DEVCLASS, CHAR30
			Utils.checkPackage(sPackage);
		} catch (oError) {
			return Promise.reject(oError);
		}
		this._package = sPackage;
		return Promise.resolve();
	};

	/**
	 * Submits the app variant to the backend
	 * @return {Promise} resolving when submitting the app variant was successful
	 * Since this method is only called for app variants on ABAP platform, the direct usage of write LrepConnector is triggered.
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariant.prototype.submit = function() {
		var mMap = this._getMap();

		var mPropertyBag = {
			flexObject: {},
			settings: this._oSettings,
			appVariant: this
		};

		if (this._sTransportRequest) {
			mPropertyBag.transport = this._sTransportRequest;
		}
		if (this._skipIam) {
			mPropertyBag.skipIam = this._skipIam;
		}

		if (mMap.layer) {
			mPropertyBag.layer = mMap.layer;
		}

		if (!mPropertyBag.url) {
			mPropertyBag.url = "/sap/bc/lrep";
		}

		var oBackendOperation;
		switch (this._mode) {
			case 'NEW':
				Object.assign(mPropertyBag.flexObject, mMap);
				oBackendOperation = LrepConnector.appVariant.create(mPropertyBag);
				break;
			case 'FROM_EXISTING':
				mPropertyBag.reference = mMap.id;
				Object.assign(mPropertyBag.flexObject, mMap);
				oBackendOperation = LrepConnector.appVariant.update(mPropertyBag);
				break;
			case 'DELETION':
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

	DescriptorVariant.prototype.getId = function() {
		return this._getMap().id;
	};

	/**
	 * Set the reference of the app variant
	 *
	 * @param {string} sReference the new reference
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariant.prototype.setReference = function(sReference) {
		if (sReference === undefined || typeof sReference !== "string") {
			throw new Error("No parameter sReference of type string provided");
		}
		this._reference = sReference;
	};

	DescriptorVariant.prototype.getReference = function() {
		return this._reference;
	};

	DescriptorVariant.prototype.getVersion = function() {
		return this._version;
	};

	DescriptorVariant.prototype.getNamespace = function() {
		return this._getMap().namespace;
	};

	DescriptorVariant.prototype.getPackage = function() {
		return this._getMap().packageName;
	};

	DescriptorVariant.prototype.getDefinition = function() {
		return this._getMap();
	};

	DescriptorVariant.prototype.getSettings = function() {
		return this._oSettings;
	};

	/**
	 * Returns a copy of the JSON object of the app variant
	 *
	 * @return {object} copy of JSON object of the app variant
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariant.prototype.getJson = function() {
		return fnBaseMerge({}, this._getMap());
	};

	DescriptorVariant.prototype._getMap = function() {
		switch (this._mode) {
			case 'NEW':
				var mResult = {
					fileName: this._getNameAndNameSpace().fileName,
					fileType: "appdescr_variant",
					namespace: this._getNameAndNameSpace().namespace,
					layer: this._layer,
					packageName: this._package ? this._package : "",
					reference: this._reference,
					id: this._id,

					content: this._content
				};
				if (typeof this._referenceVersion !== "undefined") {
					mResult.referenceVersion = this._referenceVersion;
				}
				if (this._version) {
					mResult.version = this._version;
				}
				return mResult;

			case 'FROM_EXISTING':
			case 'DELETION':
				{
					return this._mMap;
				}
			default: // do nothing
		}
	};

	DescriptorVariant.prototype._getNameAndNameSpace = function() {
		return Utils.getNameAndNameSpace(this._id, this._reference);
	};

	/**
	 * Factory for App variants
	 * @namespace
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorVariantFactory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	var DescriptorVariantFactory = {};

	DescriptorVariantFactory._getDescriptorVariant = function(mPropertyBag) {
		if (!mPropertyBag.url) {
			mPropertyBag.url = "/sap/bc/lrep";
		}
		// Since this method is only called internally for app variants on ABAP platform, the direct usage of write LrepConnector is triggered.
		return LrepConnector.appVariant.load(mPropertyBag);
	};

	/**
	 * Creates a new app variant
	 *
	 * @param {object} mParameters the parameters
	 * @param {string} mParameters.reference the proposed referenced descriptor or app variant id (might be overwritten by the backend)
	 * @param {string} mParameters.id the id for the app variant id
	 * @param {string} mParameters.version optional version of the app variant
	 * @param {string} [mParameters.layer='CUSTOMER'] the proposed layer for the app variant (might be overwritten by the backend)
	 * @param {boolean} [mParameters.skipIam=false] indicator whether the default IAM item creation and registration is skipped

	 * @return {Promise} resolving the new DescriptorVariant instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createNew = function(mParameters) {
		return DescriptorVariantFactory.createAppVariant(mParameters);
	};

	/**
	 * Creates a new app variant
	 *
	 * @param {object} mParameters the parameters
	 * @param {string} mParameters.reference the proposed referenced descriptor or app variant id (might be overwritten by the backend)
	 * @param {string} mParameters.id the id for the app variant id
	 * @param {string} mParameters.version optional version of the app variant
	 * @param {string} [mParameters.layer='CUSTOMER'] the proposed layer for the app variant (might be overwritten by the backend)
	 * @param {boolean} [mParameters.skipIam=false] indicator whether the default IAM item creation and registration is skipped
	 * @return {Promise} resolving the new DescriptorVariant instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createAppVariant = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "reference", "string");
		Utils.checkParameterAndType(mParameters, "id", "string");

		if (mParameters.version) {
			Utils.checkParameterAndType(mParameters, "version", "string");
		}

		//default layer to CUSTOMER
		if (!mParameters.layer) {
			mParameters.layer = 'CUSTOMER';
		} else {
			Utils.checkParameterAndType(mParameters, "layer", "string");
		}

		if (mParameters.skipIam) {
			Utils.checkParameterAndType(mParameters, "skipIam", "boolean");
		}

		if (mParameters.transport) {
			Utils.checkTransportRequest(mParameters.transport);
		}

		return Settings.getInstance().then(function(oSettings) {
			return Promise.resolve(new DescriptorVariant(mParameters, null, false, oSettings));
		});
	};

	/**
	 * Creates an app variant instance for an existing app variant
	 *
	 * @param {string} sId the id of the app variant
	 * @return {Promise} resolving the DescriptorVariant instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createForExisting = function(sId) {
		return DescriptorVariantFactory.loadAppVariant(sId, false);
	};

	/**
	 * Creates a app variant instance from a json
	 *
	 * @param {object} mParameters DT content of app variant
	 *
	 * @return {Promise} resolving the DescriptorVariant instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createFromJson = function(mParameters) {
		if (!jQuery.isPlainObject(mParameters)) {
			throw new Error("Parameter \"mParameters\" must be provided of type object");
		}
		return Settings.getInstance().then(function(oSettings) {
			return Promise.resolve(new DescriptorVariant(null, mParameters, false, oSettings));
		});
	};

	/**
	 * Creates an app variant deletion
	 *
	 * @param {string} sId the id of the app variant
	 *
	 * @return {Promise} resolving the DescriptorVariant instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createDeletion = function(sId) {
		return DescriptorVariantFactory.loadAppVariant(sId, true);
	};

	/**
	 * Loads an existing app variant from backend and prepare a map for either creation or deletion
	 *
	 * @param {string} sId the id of the app variant
	 * @param {boolean} [bDeletion] required for deletion
	 * @return {Promise} resolving the DescriptorVariant instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.loadAppVariant = function(sId, bDeletion) {
		if (sId === undefined || typeof sId !== "string") {
			throw new Error("Parameter \"sId\" must be provided of type string");
		}

		var _mResult;
		return DescriptorVariantFactory._getDescriptorVariant({
			reference: sId
		}).then(function(mResult) {
			_mResult = mResult;
			return Settings.getInstance();
		}).then(function(oSettings) {
			var mDescriptorVariantJSON = _mResult.response;
			if (!jQuery.isPlainObject(mDescriptorVariantJSON)) {
				//Parse if needed. Happens if backend sends wrong content type
				mDescriptorVariantJSON = JSON.parse(mDescriptorVariantJSON);
			}
			return bDeletion
				? Promise.resolve(new DescriptorVariant({id: sId}, mDescriptorVariantJSON, bDeletion, oSettings))
				: Promise.resolve(new DescriptorVariant(null, mDescriptorVariantJSON, bDeletion, oSettings));
		});
	};

	return DescriptorVariantFactory;
}, true);