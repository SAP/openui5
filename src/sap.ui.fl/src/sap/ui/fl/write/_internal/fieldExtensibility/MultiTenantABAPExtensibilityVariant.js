/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariant",
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils"
], function(
	ABAPExtensibilityVariant,
	Utils
) {
	"use strict";

	var sExtensionDataServiceUri = "/sap/opu/odata/sap/APS_PREDEFINED_FIELD_SRV/GetExtensionDataByResourcePath";
	var mNavigationIntent = {
		semanticObject: "PredefinedCustomField",
		action: "configure"
	};

	/**
	 * Extension variant for ABAP multi tenant environments (via so called Predefined Fields)
	 *
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.MultiTenantABAPExtensibilityVariant
	 * @since 1.87
	 * @version ${version}
	 * @public
	 */

	var MultiTenantABAPExtensibilityVariant = ABAPExtensibilityVariant.extend("sap.ui.fl.write._internal.fieldExtensibility.MultiTenantABAPExtensibilityVariant", {

		/**
		 * @inheritDoc
		 */
		getExtensionData: function() {
			return this._oExtensionDataPromise.then(function(mExtensionData) {
				if (this._containsData(mExtensionData)) {
					return this._convertExtensionData(mExtensionData);
				}

				return null;
			}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		getNavigationUri: function() {
			return this._oExtensionDataPromise.then(function(mExtensionData) {
				if (this._containsData(mExtensionData)) {
					return Utils.getNavigationUriForIntent({
						target: mNavigationIntent,
						params: {
							businessObjectNodeName: mExtensionData.BusinessObjectNodeName,
							cdsEntityName: mExtensionData.CdsEntityName,
							serviceVersion: this._mServiceInfo.serviceVersion,
							serviceName: this._mServiceInfo.serviceName
						}
					});
				}

				return null;
			}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		getTexts: function() {
			return this._oExtensionDataPromise.then(function(mExtensionData) {
				if (this._containsData(mExtensionData)) {
					return {
						tooltip: Utils.getText("BTN_ADD_FIELD"),
						headerText: Utils.getText("BUSINESS_OBJECT_NODE_TITLE")
					};
				}

				return null;
			}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		isActive: function() {
			return this._oExtensionDataPromise.then(function(mExtensionData) {
				return this._containsData(mExtensionData);
			}.bind(this));
		},

		_containsData: function(mExtensionData) {
			return Boolean(mExtensionData && mExtensionData.BusinessObjectNodeName && mExtensionData.CdsEntityName);
		},

		_convertExtensionData: function(mExtensionData) {
			return {
				extensionData: [{
					businessContext: mExtensionData.BusinessObjectNodeName,
					description: mExtensionData.BusinessObjectNodeDescription
				}]
			};
		},

		_determineExtensionData: function() {
			return new Promise(function (fResolve, fReject) {
				Utils.isNavigationSupportedForIntents([mNavigationIntent]).then(function(aNavigationSupportedForIntents) {
					var bIsSupported = aNavigationSupportedForIntents.some(function(bResult) {
						return bResult === true;
					});

					if (bIsSupported) {
						Utils.executeRequest(sExtensionDataServiceUri, {
							ResourcePath: this._sServiceUri,
							EntitySetName: this._mBindingInfo.entitySetName
						}).then(function(oResponse) {
							if (oResponse.errorOccurred === false) {
								fResolve(this._extractExtensionDataFromResponse(oResponse.result));
							} else {
								fReject(oResponse);
							}
						}.bind(this));
					} else {
						fResolve(null);
					}
				}.bind(this));
			}.bind(this));
		},

		_extractExtensionDataFromResponse: function(oResponse) {
			return oResponse.GetExtensionDataByResourcePath;
		}
	});

	return MultiTenantABAPExtensibilityVariant;
});