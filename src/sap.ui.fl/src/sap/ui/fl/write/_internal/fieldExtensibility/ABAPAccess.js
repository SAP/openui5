/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/util/openWindow",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariantFactory",
	"sap/ui/fl/write/_internal/fieldExtensibility/ServiceValidation"
], function(
	openWindow,
	ABAPExtensibilityVariantFactory,
	ServiceValidation
) {
	"use strict";

	var _oCurrentControl = null;
	var _oExtensibilityVariant = null;

	/**
	 * Get an instance of an ABAP Extensibility Variant for a given control
	 *
	 * @private
	 * @returns {sap.ui.fl.write._internal.fieldExtensibility.ABAPExtensibilityVariant} ABAP Extensibility Variant
	 */
	function getExtensibilityVariant() {
		if (!_oExtensibilityVariant) {
			return ABAPExtensibilityVariantFactory.getInstance(_oCurrentControl).then(function(oExtensibilityVariant) {
				_oExtensibilityVariant = oExtensibilityVariant;

				return oExtensibilityVariant;
			});
		}

		return Promise.resolve(_oExtensibilityVariant);
	}

	/**
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.ABAPAccess
	 * @since 1.87.0
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */
	var ABAPAccess = {};

	/**
	 * @inheritDoc
	 */
	ABAPAccess.getTexts = function() {
		return getExtensibilityVariant(_oCurrentControl).then(function(oExtensibilityVariant) {
			return oExtensibilityVariant.getTexts().then(function(mTexts) {
				return mTexts;
			});
		});
	};

	/**
	 * @inheritDoc
	 */
	ABAPAccess.isExtensibilityEnabled = function(oControl) {
		return getExtensibilityVariant(oControl).then(function(oExtensibilityVariant) {
			// Can any extensibility app be navigated to (uses fallback mechanism of getNavigationUri)?
			return oExtensibilityVariant.getNavigationUri().then(function(sNavigationUri) {
				return Boolean(sNavigationUri);
			});
		});
	};

	/**
	 * @inheritDoc
	 */
	ABAPAccess.getExtensionData = function() {
		return getExtensibilityVariant(_oCurrentControl).then(function(oExtensibilityVariant) {
			return oExtensibilityVariant.getExtensionData().then(function(mExtensionData) {
				return mExtensionData;
			});
		});
	};

	/**
	 * @inheritDoc
	 */
	ABAPAccess.onControlSelected = function(oControl) {
		if (oControl !== _oCurrentControl) {
			_oCurrentControl = oControl;
			_oExtensibilityVariant = null;
		}
	};

	/**
	 * @inheritDoc
	 */
	ABAPAccess.onTriggerCreateExtensionData = function(oExtensibilityInfo, sRtaStyleClassName, sActionKey) {
		return getExtensibilityVariant().then(function(oExtensibilityVariant) {
			return oExtensibilityVariant.getNavigationUri(sActionKey).then(function(sNavigationUri) {
				if (sNavigationUri) {
					openWindow(sNavigationUri, "_blank");
				}
			});
		});
	};

	/**
	 * Resets the cached data
	 *
	 * @public
	 */
	ABAPAccess.reset = function() {
		_oCurrentControl = null;
		_oExtensibilityVariant = null;
	};

	/**
	 * Checks if a given service is outdated
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {boolean}    returns true if the service is outdated
	 */
	ABAPAccess.isServiceOutdated = function(vServiceInfo) {
		return ServiceValidation.isServiceOutdated(vServiceInfo);
	};

	/**
	 * Sets a given service valid.
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {void}
	 */
	ABAPAccess.setServiceValid = function(vServiceInfo) {
		ServiceValidation.setServiceValid(vServiceInfo);
	};

	/**
	 * Invalidates a given service. Once a service has been validated or invalidation period is over the service becomes valid again
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {void}
	 */
	ABAPAccess.setServiceInvalid = function(vServiceInfo) {
		ServiceValidation.setServiceInvalid(vServiceInfo);
	};

	return ABAPAccess;
});