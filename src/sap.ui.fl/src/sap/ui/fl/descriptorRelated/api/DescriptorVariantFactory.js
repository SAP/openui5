/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/ui/fl/registry/Settings"
], function(DescriptorInlineChangeFactory, FlexUtils, LrepConnector, Utils, Settings) {
	"use strict";

	/**
	 * App variant/CDM app config
	 *
	 * @param {object} mParameters parameters
	 * @param {string} mParameters.id the id of the app variant/CDM app config id to be provided for a new app variant/CDM app config and for deleting a app variant/CDM app config
	 * @param {string} mParameters.reference the proposed referenced descriptor or app variant/CDM app config id (might be overwritten by the backend) to be provided when creating a new app variant/CDM app config
	 * @param {string} [mParameters.layer='CUSTOMER] the proposed layer (might be overwritten by the backend) when creating a new app variant/CDM app config
	 * @param {boolean} [mParameters.isAppVariantRoot=true] indicator whether this is an app variant, default is true
	 * @param {object} mFileContent file content of the existing app variant/CDM app config to be provided if app variant/CDM app config shall be created from an existing
	 * @param {boolean} [bDeletion=false] deletion indicator to be provided if app variant/CDM app config shall be deleted
	 * @param {sap.ui.fl.registry.Settings} oSettings settings
	 *
	 * @constructor
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorVariant
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted
	 */


	//App variant/CDM app config
	var DescriptorVariant = function(mParameters, mFileContent, bDeletion, oSettings) {
		if (mParameters && bDeletion) {
			this._id = mParameters.id;
			this._mode = 'DELETION';
			this._mMap = mFileContent;

		} else if (mParameters) {
			this._id = mParameters.id;
			this._reference = mParameters.reference;
			this._layer = mParameters.layer;
			if ( typeof mParameters.isAppVariantRoot != undefined){
				this._isAppVariantRoot = mParameters.isAppVariantRoot;
			}
			if ( typeof mParameters.referenceVersion != undefined){
				this._referenceVersion = mParameters.referenceVersion;
			}
			this._mode = 'NEW';
			this._skipIam = mParameters.skipIam;

		} else if (mFileContent) {
			this._mMap = mFileContent;
			this._mode = 'FROM_EXISTING';

		}

		this._oSettings = oSettings;
		this._sTransportRequest = null;
		this._content = [];
	};

	/**
	 * Adds a descriptor inline change to the app variant/CDM app config
	 *
	 * @param {sap.ui.fl.descriptorRelated.api.DescriptorInlineChange} oDescriptorInlineChange the inline change
	 *
	 * @return {Promise} resolving when adding the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorVariant.prototype.addDescriptorInlineChange = function(oDescriptorInlineChange) {
		var that = this;
		return new Promise(function(resolve) {

			var fSetHostingIdForTextKey = function(_oDescriptorInlineChange, sId){
				//providing "hosting id" for appdescr_app_setTitle and similar
				//"hosting id" is app variant/CDM app config id
				if ( _oDescriptorInlineChange["setHostingIdForTextKey"] ){
					_oDescriptorInlineChange.setHostingIdForTextKey(sId);
				}
			};

			switch (that._mode) {
				case 'NEW':
					fSetHostingIdForTextKey(oDescriptorInlineChange,that._id);
					that._content.push(oDescriptorInlineChange.getMap());
					break;
				case 'FROM_EXISTING':
					fSetHostingIdForTextKey(oDescriptorInlineChange,that._mMap.id);
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
	 * @sap-restricted
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
	 * @sap-restricted
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
	 *
	 * @return {Promise} resolving when submitting the app variant was successful
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorVariant.prototype.submit = function() {
		var sRoute = '/sap/bc/lrep/appdescr_variants/';
		var sMethod;

		switch (this._mode) {
			case 'NEW':
				sMethod = 'POST';
				break;
			case 'FROM_EXISTING':
				sMethod = 'PUT';
				sRoute = sRoute + this._getMap().id;
				break;
			case 'DELETION':
				sMethod = 'DELETE';
				sRoute = sRoute + this._id;
				break;
			default:
				// do nothing
		}

		var mMap = this._getMap();

		if (this._sTransportRequest) {
		//set to URL-Parameter 'changelist', as done in LrepConnector
			sRoute += '?changelist=' + this._sTransportRequest;
		} else if ( this._oSettings.isAtoEnabled() && FlexUtils.isCustomerDependentLayer(mMap.layer) ) {
			sRoute += '?changelist=ATO_NOTIFICATION';
		}
		if (this._skipIam) {
			sRoute += ( sRoute.indexOf('?') < 0 ) ? '?' : '&';
				sRoute += 'skipIam=' + this._skipIam;
		}

		var oLREPConnector = LrepConnector.createConnector();

		return oLREPConnector.send(sRoute, sMethod, mMap);
	};

	DescriptorVariant.prototype.getId = function() {
		return this._id;
	};

	/**
	 * Set the reference of the app variant/CDM app config
	 *
	 * @param {string} sReference the new reference
	 *
	 * @private
	 * @sap-restricted
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

	DescriptorVariant.prototype.getNamespace = function() {
		return this._getMap().namespace;
	};

	DescriptorVariant.prototype.getSettings = function() {
		return this._oSettings;
	};

	/**
	 * Returns a copy of the JSON object of the app variant/CDM app config
	 *
	 * @return {object} copy of JSON object of the app variant/CDM app config
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorVariant.prototype.getJson = function() {
		return jQuery.extend(true, {}, this._getMap());
	};

	DescriptorVariant.prototype._getMap = function() {
		switch (this._mode) {
			case 'NEW':
				var mResult = {
					"fileName": this._getNameAndNameSpace().fileName,
					"fileType": "appdescr_variant",
					"namespace": this._getNameAndNameSpace().namespace,
					"layer": this._layer,
					"packageName": this._package ? this._package : "$TMP",

					"reference": this._reference,
					"id": this._id,

					"content": this._content
				};
				if ( typeof this._isAppVariantRoot != undefined ) {
					mResult.isAppVariantRoot = this._isAppVariantRoot;
				}
				if (mResult.isAppVariantRoot != undefined && !mResult.isAppVariantRoot) {
					mResult.fileType = "cdmapp_config";
				}
				if ( typeof this._referenceVersion != undefined ) {
					mResult.referenceVersion = this._referenceVersion;
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
		return Utils.getNameAndNameSpace(this._id,this._reference);
	};

	/**
	 * Factory for App variant/CDM app configs
	 * @namespace
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorVariantFactory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted
	 */
	var DescriptorVariantFactory = {};

	DescriptorVariantFactory._getDescriptorVariant = function(sId) {
		var sRoute = '/sap/bc/lrep/appdescr_variants/' + sId;
		var oLREPConnector = LrepConnector.createConnector();
		return oLREPConnector.send(sRoute, 'GET');
	};

	/**
	 * Creates a new app variant/CDM app config
	 *
	 * @param {object} mParameters the parameters
	 * @param {string} mParameters.reference the proposed referenced descriptor or app variant/CDM app config id (might be overwritten by the backend)
	 * @param {string} mParameters.id the id for the app variant/CDM app config id
	 * @param {string} [mParameters.layer='CUSTOMER'] the proposed layer for the app variant/CDM app config (might be overwritten by the backend)
	 * @param {boolean} [mParameters.isAppVariantRoot=true] indicator whether this is an app variant, default is true
	 * @param {boolean} [mParameters.skipIam=true] indicator whether the default IAM item creation and registration is skipped

	 * @return {Promise} resolving the new DescriptorVariant instance
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorVariantFactory.createNew = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "reference", "string");
		Utils.checkParameterAndType(mParameters, "id", "string");

		//default layer to CUSTOMER
		if (!mParameters.layer){
			mParameters.layer = 'CUSTOMER';
		} else {
			Utils.checkParameterAndType(mParameters, "layer", "string");
			//TODO: is this necessary? already checked in Utils-method? -> checks only type
			if (mParameters.layer != 'VENDOR' && mParameters.layer != 'PARTNER' && !FlexUtils.isCustomerDependentLayer(mParameters.layer)) {
				//TODO: this should do a reject 	return Promise.reject(oError);
				throw new Error("Parameter \"layer\" needs to be 'VENDOR', 'PARTNER' or customer dependent");
			}
		}

		// isAppVariantRoot
		if (mParameters.isAppVariantRoot){
			Utils.checkParameterAndType(mParameters, "isAppVariantRoot", "boolean");
		}
		if (mParameters.skipIam){
			Utils.checkParameterAndType(mParameters, "skipIam", "boolean");
		}

		return Settings.getInstance().then(function(oSettings) {
			return Promise.resolve( new DescriptorVariant(mParameters,null,false,oSettings) );
		});
	};

	/**
	 * Creates an app variant/CDM app config instance for an existing app variant/CDM app config id
	 *
	 * @param {string} sId the id of the app variant/CDM app config id
	 *
	 * @return {Promise} resolving the DescriptorVariant instance
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorVariantFactory.createForExisting = function(sId) {
		if (sId === undefined || typeof sId !== "string") {
			throw new Error("Parameter \"sId\" must be provided of type string");
		}

		var _mResult;
		return DescriptorVariantFactory._getDescriptorVariant(sId).then(function(mResult){
			_mResult = mResult;
			return Settings.getInstance();
		}).then( function(oSettings){
			var mDescriptorVariantJSON = _mResult.response;
			if (!jQuery.isPlainObject(mDescriptorVariantJSON)) {
				//Parse if needed. Happens if backend sends wrong content type
				mDescriptorVariantJSON = JSON.parse(mDescriptorVariantJSON);
			}
			return Promise.resolve(new DescriptorVariant(null,mDescriptorVariantJSON,false,oSettings));
		});
	};

	/**
	 * Creates a app variant/CDM app config instance from a json
	 *
	 * @param {object} mParameters DT content of app variant/CDM app config
	 *
	 * @return {Promise} resolving the DescriptorVariant instance
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorVariantFactory.createFromJson = function(mParameters) {
		if (!jQuery.isPlainObject(mParameters)) {
			throw new Error("Parameter \"mParameters\" must be provided of type object");
		}
		return Settings.getInstance().then( function(oSettings){
			return Promise.resolve(new DescriptorVariant(null,mParameters,false,oSettings));
		});
	};

	/**
	 * Creates an app variant/CDM app config deletion
	 *
	 * @param {string} sId the id of the app variant/CDM app config id
	 *
	 * @return {Promise} resolving the DescriptorVariant instance
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorVariantFactory.createDeletion = function(sId) {
		if (sId === undefined || typeof sId !== "string") {
			throw new Error("Parameter \"sId\" must be provided of type string");
		}
		var mParameter = {};
		mParameter.id = sId;

		var _mResult;
		return DescriptorVariantFactory._getDescriptorVariant(sId).then(function(mResult){
			_mResult = mResult;
			return Settings.getInstance();
		}).then( function(oSettings){
			var mDescriptorVariantJSON = JSON.parse(_mResult.response);
			return Promise.resolve(new DescriptorVariant(mParameter,mDescriptorVariantJSON,true,oSettings));
		});

	};

	return DescriptorVariantFactory;
},true);