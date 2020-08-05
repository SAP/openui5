/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/appVariant/AppVariant",
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/base/util/merge"
], function(
	AppVariant,
	jQuery,
	Utils,
	LrepConnector,
	merge
) {
	"use strict";

	function _getAppVariant(mPropertyBag) {
		if (!mPropertyBag.url) {
			mPropertyBag.url = "/sap/bc/lrep";
		}
		// Since this method is only called internally for app variants on ABAP platform, the direct usage of write LrepConnector is triggered.
		return LrepConnector.appVariant.load(mPropertyBag);
	}

	/**
	 * Internal factory for app variants
	 * @namespace
	 * @alias sap.ui.fl.write._internal.appVariant.AppVariantFactory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	var AppVariantFactory = {};

	/**
	 * Loads an existing app variant from the back end and prepares a map for either creation or deletion.
	 *
	 * @param {object} mPropertyBag Parameters
	 * @param {string} mPropertyBag.id App variant ID
	 * @param {string} [mPropertyBag.transport] Transport request for the app variant
	 * @param {string} [mPropertyBag.isForSmartBusiness] Determines the consumer
	 * @param {string} [mPropertyBag.layer] Current working layer
	 * @return {Promise} Resolving the app variant design time file
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantFactory.load = function(mPropertyBag) {
		if (mPropertyBag.id === undefined || typeof mPropertyBag.id !== "string") {
			throw new Error("Parameter " + mPropertyBag.id + " must be provided of type string");
		}

		return _getAppVariant({
			reference: mPropertyBag.id
		}).then(function(oResult) {
			var oAppVariantConfig = oResult.response;
			if (!jQuery.isPlainObject(oAppVariantConfig)) {
				//Parse if needed. Happens if backend sends wrong content type
				oAppVariantConfig = JSON.parse(oAppVariantConfig);
			}
			mPropertyBag = merge(
				{} /* target object, to avoid changing of original modifier */,
				mPropertyBag,
				oAppVariantConfig
			);

			return new AppVariant(mPropertyBag);
		});
	};

	/**
	 * Prepares an app variant configuration for creation.
	 *
	 * @param {object} mPropertyBag Parameters
	 * @param {string} mPropertyBag.id Id of the app variant
	 * @param {string} mPropertyBag.reference Proposed referenced descriptor or app variant ID (might be overwritten by the back end)
	 * @param {string} [mPropertyBag.transport] Transport with which the app variant should be transported
	 * @param {string} [mPropertyBag.package] Package of the app variant
	 * @param {string} [mPropertyBag.version] Version of the app variant
	 * @param {string} [mPropertyBag.layer='CUSTOMER'] Proposed layer for the app variant (might be overwritten by the back end)
	 * @param {boolean} [mPropertyBag.skipIam] Indicator whether the default IAM item creation and registration is skipped
	 * @param {string} [mPropertyBag.isForSmartBusiness] Determines the consumer
	 * @return {Promise} Resolving the new <code>AppVariant<code> instance
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantFactory.prepareCreate = function(mPropertyBag) {
		try {
			Utils.checkParameterAndType(mPropertyBag, "reference", "string");
			Utils.checkParameterAndType(mPropertyBag, "id", "string");

			if (mPropertyBag.version) {
				Utils.checkParameterAndType(mPropertyBag, "version", "string");
			}

			//default layer to CUSTOMER
			if (!mPropertyBag.layer) {
				mPropertyBag.layer = 'CUSTOMER';
			} else {
				Utils.checkParameterAndType(mPropertyBag, "layer", "string");
			}

			if (mPropertyBag.skipIam) {
				Utils.checkParameterAndType(mPropertyBag, "skipIam", "boolean");
			}

			if (mPropertyBag.transport) {
				Utils.checkTransportRequest(mPropertyBag.transport);
			}

			if (mPropertyBag.package) {
				Utils.checkPackage(mPropertyBag.package);
			}
		} catch (oError) {
			return Promise.reject(oError);
		}

		mPropertyBag.content = [];

		var oAppVariant = new AppVariant(mPropertyBag);
		oAppVariant.setMode("NEW");

		return Promise.resolve(oAppVariant);
	};

	/**
	 * Loads an app variant configuration from the back end and prepares it for updation.
	 *
	 * @param {object} mPropertyBag Object with parameters as properties
	 * @param {string} mPropertyBag.id App variant ID
	 * @param {string} [mPropertyBag.transport] Transport request for the app variant
	 * @param {string} [mPropertyBag.isForSmartBusiness] Determines the consumer
	 * @param {boolean} [mPropertyBag.skipIam] Indicates whether the default IAM item creation and registration is skipped
	 * @return {Promise} Resolving with app variant design configuration
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantFactory.prepareUpdate = function(mPropertyBag) {
		return AppVariantFactory.load(mPropertyBag).then(function(oAppVariant) {
			oAppVariant.setMode("EXISTING");
			return oAppVariant;
		});
	};

	/**
	 * Loads an app variant config from back end and prepares it for deletion.
	 *
	 * @param {object} mPropertyBag Object with parameters as properties
	 * @param {string} mPropertyBag.id App variant ID
	 * @param {string} [mPropertyBag.transport] - Transport request for the app variant
	 * @param {string} [mPropertyBag.isForSmartBusiness] - Determines the consumer
	 * @param {boolean} [mPropertyBag.skipIam] Indicates whether the default IAM item creation and registration is skipped
	 * @return {Promise} Resolving with app variant design time configuration
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantFactory.prepareDelete = function(mPropertyBag) {
		return ((mPropertyBag.isForSmartBusiness) ? Promise.resolve(new AppVariant(mPropertyBag)) : AppVariantFactory.load(mPropertyBag))
			.then(function(oAppVariant) {
				oAppVariant.setMode("DELETION");
				return oAppVariant;
			});
	};

	return AppVariantFactory;
}, true);