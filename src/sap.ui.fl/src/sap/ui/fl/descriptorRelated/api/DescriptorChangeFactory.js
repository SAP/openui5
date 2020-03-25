/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/base/util/merge"
], function(
	ChangePersistenceFactory,
	Change,
	FlexUtils,
	fnBaseMerge
) {
	"use strict";

	/**
	 * Descriptor Related
	 * @namespace
	 * @name sap.ui.fl.descriptorRelated
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */

	/**
	 * Descriptor Related Apis
	 * @namespace
	 * @name sap.ui.fl.descriptorRelated.api
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */

	/**
	 * Descriptor Change
	 *
	 * @param {object} mChangeFile change file
	 * @param {sap.ui.fl.descriptorRelated.api.DescriptorInlineChange} oInlineChange inline change object
	 *
	 * @constructor
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorChange
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	var DescriptorChange = function(mChangeFile, oInlineChange) { //so far, parameter correspond to inline change format
		this._mChangeFile = mChangeFile;
		this._mChangeFile.packageName = '';
		this._oInlineChange = oInlineChange;
	};

	/**
	 * Submits the descriptor change to the backend
	 *
	 * @return {Promise} resolving after all changes have been saved
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
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
	 * @ui5-restricted sap.ui.rta, smart business
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
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorChange.prototype.getJson = function() {
		return fnBaseMerge({}, this._getMap());
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
	 * @ui5-restricted sap.ui.rta, smart business
	 */

	var DescriptorChangeFactory = function() {};

	/**
	 * Creates a new descriptor change
	 *
	 * @param {string} sReference the descriptor id for which the change is created
	 * @param {object} oInlineChange the inline change instance
	 * @param {string} [sLayer] layer of the descriptor change, when nothing passed, will set it to CUSTOMER
	 * @param {object} oAppComponent application component to get the version from
	 * @param {string} sTool tool which creates the descriptor change (e.g. RTA, DTA, FCC ...)
	 *
	 * @return {Promise} resolving the new Change instance
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorChangeFactory.prototype.createNew = function(sReference, oInlineChange, sLayer, oAppComponent, sTool) {
		var fSetHostingIdForTextKey = function(_oDescriptorInlineChange, sId) {
			//providing "hosting id" for appdescr_app_setTitle and similar
			//"hosting id" is descriptor variant id
			if (_oDescriptorInlineChange["setHostingIdForTextKey"]) {
				_oDescriptorInlineChange.setHostingIdForTextKey(sId);
			}
		};
		fSetHostingIdForTextKey(oInlineChange, sReference);

		var sAppVersion;
		if (oAppComponent) {
			sAppVersion = oAppComponent.appVersion;

			if (!oAppComponent.appId && !sAppVersion) {
				var mManifest = oAppComponent.getManifest();
				sAppVersion = FlexUtils.getAppVersionFromManifest(mManifest);
			}
		}

		var mPropertyBag = {};
		mPropertyBag.changeType = oInlineChange._getChangeType();
		mPropertyBag.componentName = sReference;
		mPropertyBag.reference = sReference;
		mPropertyBag.validAppVersions = sAppVersion ? {
			creation: sAppVersion,
			from: sAppVersion
		} : {};
		mPropertyBag.generator = sTool;

		//default to 'CUSTOMER'
		mPropertyBag.layer = sLayer || 'CUSTOMER';

		var mChangeFile = Change.createInitialFileContent(mPropertyBag);

		return Promise.resolve(new DescriptorChange(mChangeFile, oInlineChange));
	};

	return DescriptorChangeFactory;
}, true);