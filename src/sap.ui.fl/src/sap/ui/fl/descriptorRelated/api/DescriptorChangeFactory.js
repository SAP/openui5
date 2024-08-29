/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Utils"
], function(
	fnBaseMerge,
	FlexObjectFactory,
	UIChangeManager,
	ChangePersistenceFactory,
	Utils
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
	var DescriptorChange = function(mChangeFile, oInlineChange) { // so far, parameter correspond to inline change format
		this._mChangeFile = mChangeFile;
		this._mChangeFile.packageName = "";
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

		// submit
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
		const sReference = this._mChangeFile.reference;
		const oComponent = Utils.getComponentForControl(this._mChangeFile.selector);
		const oChange = this._getChangeToSubmit();
		UIChangeManager.addDirtyChanges(sReference, [oChange], oComponent);

		return oChange;
	};

	DescriptorChange.prototype._getChangePersistence = function(sComponentName) {
		return ChangePersistenceFactory.getChangePersistenceForComponent(sComponentName);
	};

	DescriptorChange.prototype._getChangeToSubmit = function() {
		return FlexObjectFactory.createAppDescriptorChange(this._getMap());
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

	// Descriptor LREP Change Factory
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
		// providing "hosting id" for appdescr_app_setTitle and similar
		// "hosting id" is descriptor variant id
		if (oInlineChange.setHostingIdForTextKey) {
			oInlineChange.setHostingIdForTextKey(sReference);
		}

		var mPropertyBag = {};
		mPropertyBag.changeType = oInlineChange._getChangeType();
		mPropertyBag.componentName = sReference;
		mPropertyBag.reference = sReference;
		mPropertyBag.generator = sTool;
		mPropertyBag.support = oInlineChange.getMap().support;

		// default to 'CUSTOMER'
		mPropertyBag.layer = sLayer || "CUSTOMER";

		return Promise.resolve(new DescriptorChange(mPropertyBag, oInlineChange));
	};

	return DescriptorChangeFactory;
});