/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Change",
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils"
], function(ChangePersistenceFactory, ChangePersistence, Change, Utils, Settings, FlexUtils) {
	"use strict";

	/**
	 * Descriptor Related
	 * @namespace
	 * @name sap.ui.fl.descriptorRelated
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted
	 */

	/**
	 * Descriptor Related Apis
	 * @namespace
	 * @name sap.ui.fl.descriptorRelated.api
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted
	 */

	/**
	 * Descriptor Change
	 *
	 * @param {object} mChangeFile change file
	 * @param {sap.ui.fl.descriptorRelated.api.DescriptorInlineChange} oInlineChange inline change object
	 * @param {sap.ui.fl.registry.Settings} oSettings settings
	 *
	 * @constructor
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorChange
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted
	 */
	var DescriptorChange = function(mChangeFile,oInlineChange,oSettings) { //so far, parameter correspond to inline change format
		this._mChangeFile = mChangeFile;
		this._mChangeFile.packageName = '$TMP';
		this._oInlineChange = oInlineChange;
		this._sTransportRequest = null;
		this._oSettings = oSettings;
	};

	/**
	 * Set transport request (for ABAP Backend)
	 *
	 * @param {string} sTransportRequest transport request
	 *
	 * @return {Promise} resolving when setting of transport request was successful
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorChange.prototype.setTransportRequest = function(sTransportRequest) {
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
	 * @param {string} sPackage package
	 *
	 * @return {Promise} resolving when setting of package was successful
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorChange.prototype.setPackage = function(sPackage) {
		try {
			//partial check: length le 30, alphanumeric, upper case, / for namespace, no space, no underscore - data element in ABAP: DEVCLASS, CHAR30
			Utils.checkPackage(sPackage);
		} catch (oError) {
			return Promise.reject(oError);
		}
		this._mChangeFile.packageName = sPackage;
		return Promise.resolve();
	};

	/**
	 * Submits the descriptor change to the backend
	 *
	 * @return {Promise} resolving after all changes have been saved
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorChange.prototype.submit = function() {
		this.store();

		//submit
		var oChangePersistence = this._getChangePersistence(this._mChangeFile.reference);
		return oChangePersistence.saveDirtyChanges();
	};

	/**
	 * Stores the descriptor change in change persistence
	 *
	 * @return {object} change object
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorChange.prototype.store = function() {
		// create persistence
		var sComponentName = this._mChangeFile.reference;
		var sAppVersion = this._mChangeFile.validAppVersions.creation;
		var oChangePersistence = this._getChangePersistence(sComponentName, sAppVersion);

		//add change to persistence
		var oChange = this._getChangeToSubmit();
		oChangePersistence.addChange(oChange);

		return oChange;
	};

	DescriptorChange.prototype._getChangePersistence = function(sComponentName, sAppVersion) {
		return ChangePersistenceFactory.getChangePersistenceForComponent(sComponentName, sAppVersion);
	};

	DescriptorChange.prototype._getChangeToSubmit = function() {
		//create Change
		var oChange = new Change(this._getMap());

		if ( this._sTransportRequest ) {
			oChange.setRequest( this._sTransportRequest );
		}  else if ( this._oSettings.isAtoEnabled() && FlexUtils.isCustomerDependentLayer(this._mChangeFile.layer) ) {
			oChange.setRequest( 'ATO_NOTIFICATION' );
		}
		return oChange;
	};

	DescriptorChange.prototype._getMap = function() {
		var mInlineChange = this._oInlineChange.getMap();

		this._mChangeFile.content = mInlineChange.content;
		this._mChangeFile.texts = mInlineChange.texts;
		return this._mChangeFile;
	};

	/**
	 * Returns a copy of the JSON object of the descriptor change
	 *
	 * @return {object} copy of JSON object of the descriptor change
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorChange.prototype.getJson = function() {
		return jQuery.extend(true, {}, this._getMap());
	};

//Descriptor LREP Change Factory
	/**
	 * Factory for Descriptor Changes
	 *
	 * @constructor
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorChangeFactory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted
	 */

	var DescriptorChangeFactory = function() {};

	/**
	 * Creates a new descriptor change
	 *
	 * @param {string} sReference the descriptor id for which the change is created
	 * @param {object} oInlineChange the inline change instance
	 * @param {string} sLayer layer of the descriptor change
	 * @param {object} oAppComponent application component to get the version from
	 * @param {string} sTool tool which creates the descriptor change (e.g. RTA, DTA, FCC ...)
	 *
	 * @return {Promise} resolving the new Change instance
	 *
	 * @private
	 * @sap-restricted
	 */
	DescriptorChangeFactory.prototype.createNew = function(sReference, oInlineChange, sLayer, oAppComponent, sTool) {
		var fSetHostingIdForTextKey = function(_oDescriptorInlineChange, sId){
			//providing "hosting id" for appdescr_app_setTitle and similar
			//"hosting id" is descriptor variant id
			if ( _oDescriptorInlineChange["setHostingIdForTextKey"] ){
				_oDescriptorInlineChange.setHostingIdForTextKey(sId);
			}
		};
		fSetHostingIdForTextKey(oInlineChange,sReference);

		var sAppVersion;
		if (oAppComponent) {
			var mManifest = oAppComponent.getManifest();
			sAppVersion = FlexUtils.getAppVersionFromManifest(mManifest);
		}

		var mPropertyBag = {};
		mPropertyBag.changeType = oInlineChange._getChangeType();
		mPropertyBag.componentName = sReference;
		mPropertyBag.reference = sReference;
		mPropertyBag.validAppVersions =  sAppVersion ? {
			"creation": sAppVersion,
			"from": sAppVersion
		} : {};
		mPropertyBag.generator = sTool;

		if (!sLayer){
			//default to 'CUSTOMER'
			mPropertyBag.layer = 'CUSTOMER';
		} else {
			if (sLayer != 'VENDOR' && sLayer != 'PARTNER' && !FlexUtils.isCustomerDependentLayer(sLayer)) {
				throw new Error("Parameter \"layer\" needs to be 'VENDOR', 'PARTNER' or customer dependent");
			}
			mPropertyBag.layer = sLayer;
		}

		var mChangeFile = Change.createInitialFileContent(mPropertyBag );
		return Settings.getInstance().then(function(oSettings) {
			return Promise.resolve( new DescriptorChange(mChangeFile, oInlineChange, oSettings) );
		});
	};

	return DescriptorChangeFactory;
}, true);