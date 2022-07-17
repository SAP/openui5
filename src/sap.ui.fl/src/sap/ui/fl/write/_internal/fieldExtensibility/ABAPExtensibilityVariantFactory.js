/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariant",
	"sap/ui/fl/write/_internal/fieldExtensibility/MultiTenantABAPExtensibilityVariant",
	"sap/ui/fl/write/_internal/fieldExtensibility/SingleTenantABAPExtensibilityVariant",
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/UriParser"
], function(
	Log,
	ABAPExtensibilityVariant,
	MultiTenantABAPExtensibilityVariant,
	SingleTenantABAPExtensibilityVariant,
	Utils,
	UriParser
) {
	"use strict";

	// map holding variant instances
	var _mExtensibilityVariants = {};

	// dummy variant providing no extensibility options
	var _oDummyInstance = new ABAPExtensibilityVariant();

	/**
	 * Get binding information from given control. Operates on cached OData metadata.
	 *
	 * @private
	 * @param {sap.ui.base.ManagedObject} oControl - Control instance that was selected
	 * @returns {Promise<map>} Resolves with a map containing <code>entitySetName</code> and <code>entityTypeName</code>
	 */
	function _getBindingInfo(oControl) {
		return Promise.all([Utils.getBoundEntitySet(oControl), Utils.getBoundEntityType(oControl)]).then(function(aResults) {
			return {
				entitySetName: aResults[0],
				entityTypeName: aResults[1]
			};
		});
	}

	function _logError(oError) {
		Log.error("Error occurred:");

		if (oError) {
			if (Array.isArray(oError.errorMessages)) {
				oError.errorMessages.forEach(function(oErrorMessage) {
					Log.error(oErrorMessage.text);
				});
			} else {
				Log.error(oError);
			}
		}
	}

	function _createInstance(sServiceUri, mBindingInfo) {
		try {
			var mServiceInfo = UriParser.parseServiceUri(sServiceUri);
			var oMultiTenantVariant = new MultiTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);
			var oSingleTenantVariant = new SingleTenantABAPExtensibilityVariant(sServiceUri, mServiceInfo, mBindingInfo);

			return Promise.all([oMultiTenantVariant.isActive(), oSingleTenantVariant.isActive()]).then(function(aIsActive) {
				var oInstance = _oDummyInstance;

				if (aIsActive[0] === true) {
					oInstance = oMultiTenantVariant;
				} else if (aIsActive[1] === true) {
					oInstance = oSingleTenantVariant;
				}

				return oInstance;
			}).catch(function(oError) {
				_logError(oError);
				return Promise.resolve(_oDummyInstance);
			});
		} catch (oError) {
			_logError(oError);
			return Promise.resolve(_oDummyInstance);
		}
	}

	function _getInstance(sServiceUri, mBindingInfo) {
		if (_mExtensibilityVariants[sServiceUri]) {
			return _mExtensibilityVariants[sServiceUri][mBindingInfo.entityTypeName];
		}

		return null;
	}

	function _setInstance(sServiceUri, mBindingInfo, oInstance) {
		if (!_mExtensibilityVariants[sServiceUri]) {
			_mExtensibilityVariants[sServiceUri] = {};
		}

		_mExtensibilityVariants[sServiceUri][mBindingInfo.entityTypeName] = oInstance;
	}

	function _obtainInstance(oControl, mBindingInfo) {
		var sServiceUri = Utils.getServiceUri(oControl);
		var oExistingInstance = _getInstance(sServiceUri, mBindingInfo);

		if (!oExistingInstance) {
			return _createInstance(sServiceUri, mBindingInfo).then(function(oCreatedInstance) {
				_setInstance(sServiceUri, mBindingInfo, oCreatedInstance);
				return Promise.resolve(oCreatedInstance);
			});
		}

		return Promise.resolve(oExistingInstance);
	}

	/**
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.ABAPExtensibilityVariantFactory
	 * @experimental Since 1.87.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var ABAPExtensibilityVariantFactory = {};

	/**
	 * Get an instance of an ABAP Extensibility Variant for a given control
	 *
	 * @public
	 * @param {sap.ui.base.ManagedObject} oControl - Control to get the extension data from
	 * @returns {Promise<sap.ui.fl.write._internal.fieldExtensibility.ABAPExtensibilityVariant>} Resolves with an ABAP Extensibility Variant instance
	 */
	ABAPExtensibilityVariantFactory.getInstance = function(oControl) {
		if (Utils.checkControlPrerequisites(oControl)) {
			return _getBindingInfo(oControl).then(function(mBindingInfo) {
				return _obtainInstance(oControl, mBindingInfo).then(function(oInstance) {
					return oInstance.getInterface();
				});
			}).catch(function(oError) {
				_logError(oError);
				return Promise.resolve(_oDummyInstance.getInterface());
			});
		}

		return Promise.resolve(_oDummyInstance.getInterface());
	};

	/**
	 * Reset the factory
	 *
	 * @public
	 */
	ABAPExtensibilityVariantFactory.reset = function() {
		_mExtensibilityVariants = {};
	};

	return ABAPExtensibilityVariantFactory;
});