/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/descriptorRelated/api/DescriptorChange"
], function(
	DescriptorChange
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
	 * @param {object} oAppComponent application component to get the version from (is not used but must be kept for compatibility)
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
		const mInlineChangeProps = oInlineChange.getMap();
		mPropertyBag.changeType = mInlineChangeProps.changeType;
		mPropertyBag.fileName = oInlineChange.fileName;
		mPropertyBag.componentName = sReference;
		mPropertyBag.reference = sReference;
		mPropertyBag.generator = sTool;
		mPropertyBag.support = mInlineChangeProps.support;
		mPropertyBag.adaptationId = mInlineChangeProps.adaptationId;
		// default to 'CUSTOMER'
		mPropertyBag.layer = sLayer || "CUSTOMER";

		return Promise.resolve(new DescriptorChange(mPropertyBag, oInlineChange));
	};

	return DescriptorChangeFactory;
});