/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory"
], function(
	AppVariantFactory
) {
	"use strict";

	/**
	 * Factory for app variants.
	 * @namespace
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorVariantFactory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	var DescriptorVariantFactory = {};

	/**
	 * Creates a new app variant.
	 *
	 * @param {object} mParameters Parameters
	 * @param {string} mParameters.reference Proposed referenced descriptor or app variant ID (might be overwritten by the back end)
	 * @param {string} mParameters.id App variant ID
	 * @param {string} [mParameters.version] Version of the app variant
	 * @param {string} [mParameters.layer='CUSTOMER'] Proposed layer of the app variant (might be overwritten by the back end)
	 * @param {boolean} [mParameters.skipIam=false] Indicates whether the default IAM item creation and registration is skipped

	 * @return {Promise} Resolving with new <code>DescriptorVariant</code> instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createNew = function(mParameters) {
		return DescriptorVariantFactory.createAppVariant(mParameters);
	};

	/**
	 * Creates a new app variant.
	 *
	 * @param {object} mParameters Parameters
	 * @param {string} mParameters.reference Proposed referenced descriptor or app variant ID (might be overwritten by the back end)
	 * @param {string} mParameters.id App variant ID
	 * @param {string} [mParameters.version] Version of the app variant
	 * @param {string} [mParameters.layer='CUSTOMER'] Proposed layer of the app variant (might be overwritten by the back end)
	 * @param {boolean} [mParameters.skipIam=false] Indicates whether the default IAM item creation and registration is skipped
	 * @return {Promise} Resolving with new <code>DescriptorVariant</code> instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createAppVariant = function(mParameters) {
		return AppVariantFactory.prepareCreate(mParameters);
	};

	/**
	 * Creates an app variant instance for an existing app variant.
	 *
	 * @param {string} sId App variant ID
	 * @return {Promise} Resolving with existing <code>DescriptorVariant</code> instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createForExisting = function(sId) {
		return AppVariantFactory.prepareUpdate({
			id: sId
		});
	};

	/**
	 * Creates an app variant deletion.
	 *
	 * @param {string} sId App variant ID
	 *
	 * @return {Promise} Resolving with existing <code>DescriptorVariant</code> instance
	 *
	 * @private
	 * @deprecated Since version 1.73
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorVariantFactory.createDeletion = function(sId) {
		return AppVariantFactory.prepareDelete({
			id: sId
		});
	};

	return DescriptorVariantFactory;
}, true);