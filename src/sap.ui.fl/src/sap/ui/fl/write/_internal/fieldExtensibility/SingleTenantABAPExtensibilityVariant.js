/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariant",
	"sap/ui/fl/write/_internal/fieldExtensibility/UriParser",
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils"
], function(
	ABAPExtensibilityVariant,
	UriParser,
	Utils
) {
	"use strict";

	var sExtensionDataServiceUri = "/sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/";
	var mExtensibilityType = {
		Both: 0,
		Fields: 1,
		Logic: 2
	};
	var aNavigationIntents = [{
		semanticObject: "CustomField",
		action: "develop"
	}, {
		semanticObject: "CustomField",
		action: "manage"
	}, {
		semanticObject: "CustomLogic",
		action: "maintain"
	}];
	var aTextKeys = [
		"BTN_FREP_CCF",
		"BTN_ADD_FIELD",
		"BTN_ADD_LOGIC"
	];

	/**
	 * Extension variant for ABAP single tenant environnments (via so called Custom Fields)
	 *
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.SingleTenantABAPExtensibilityVariant
	 * @since 1.87
	 * @version ${version}
	 * @public
	 */

	var SingleTenantABAPExtensibilityVariant = ABAPExtensibilityVariant.extend("sap.ui.fl.write._internal.fieldExtensibility.SingleTenantABAPExtensibilityVariant", {
		_sExtensibilityType: null,

		/**
		 * @inheritDoc
		 */
		getExtensionData: function() {
			return this._oExtensionDataPromise.then(function(aBusinessContexts) {
				if (this._containsData(aBusinessContexts)) {
					return this._convertBusinessContextsToExtensionData(aBusinessContexts);
				}

				return null;
			}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		getNavigationUri: function() {
			return this._oExtensionDataPromise.then(function(aBusinessContexts) {
				if (this._containsData(aBusinessContexts)) {
					return Utils.getNavigationUriForIntent({
						target: aNavigationIntents[this._sExtensibilityType],
						params: {
							businessContexts: aBusinessContexts.map(function(oBusinessContext) {
								return oBusinessContext.BusinessContext;
							}),
							serviceVersion: this._mServiceInfo.serviceVersion,
							serviceName: this._mServiceInfo.serviceName,
							entityType: this._mBindingInfo.entityTypeName
						}
					});
				}

				Promise.resolve(null);
			}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		getTexts: function() {
			return this._oExtensionDataPromise.then(function(aBusinessContexts) {
				if (this._containsData(aBusinessContexts)) {
					return {
						tooltip: Utils.getText(aTextKeys[this._sExtensibilityType]),
						headerText: Utils.getText("BUSINESS_CONTEXT_TITLE")
					};
				}

				return null;
			}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		isActive: function() {
			return this._oExtensionDataPromise.then(function(aBusinessContexts) {
				return this._containsData(aBusinessContexts);
			}.bind(this));
		},

		_containsData: function(aBusinessContexts) {
			return Boolean(aBusinessContexts && aBusinessContexts.length > 0);
		},

		_convertBusinessContextsToExtensionData: function(aBusinessContexts) {
			var aExtensionData = aBusinessContexts.map(function(oBusinessContext) {
				return {
					description: oBusinessContext.BusinessContextDescription,
					businessContext: oBusinessContext.BusinessContext
				};
			});

			return {
				extensionData: aExtensionData
			};
		},

		_determineExtensionData: function() {
			return new Promise(function (fResolve, fReject) {
				Utils.isNavigationSupportedForIntents(aNavigationIntents).then(function(aNavigationSupportedForIntents) {
					var bIsSupported = aNavigationSupportedForIntents.some(function(oResult) {
						return oResult.supported === true;
					});

					if (bIsSupported) {
						Utils.executeRequest(this._getExtensionDataServiceUri(), this._getExtensionDataServiceParameters()).then(function(oResponse) {
							if (oResponse.errorOccurred === false) {
								var aBusinessContexts = this._extractBusinessContextsFromResponse(oResponse.result);
								this._sExtensibilityType = this._determineExtensibilityType(aNavigationSupportedForIntents, aBusinessContexts);
								if (this._sExtensibilityType !== null) {
									fResolve(aBusinessContexts);
								} else {
									fResolve(null);
								}
							} else if (oResponse.statusCode === 404 && this._mServiceInfo.serviceType === UriParser.mServiceType.v4) {
								// in this case we assume that the backend system is just too old to support v4 based services
								fResolve(null);
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

		_determineExtensibilityType: function(aNavigationSupportedForIntents, aBusinessContexts) {
			var sExtensibilityType = this._determineExtensibilityTypeFromBusinessContexts(aBusinessContexts);

			if (aNavigationSupportedForIntents[sExtensibilityType]) {
				return sExtensibilityType;
			} else if (aNavigationSupportedForIntents[mExtensibilityType.Both]) {
				return mExtensibilityType.Both;
			}

			return null; // authorizations contradict Business Context features
		},

		_determineExtensibilityTypeFromBusinessContexts: function(aBusinessContexts) {
			var bSupportsLogicEnhancements = false;
			var bSupportsStructuralEnhancements = false;

			aBusinessContexts.forEach(function(oBusinessContext) {
				if (oBusinessContext.hasOwnProperty("SupportsLogicEnhancements") === false || oBusinessContext.SupportsLogicEnhancements === true) {
					bSupportsLogicEnhancements = true;
				}
				if (oBusinessContext.hasOwnProperty("SupportsStructuralEnhancements") === false || oBusinessContext.SupportsStructuralEnhancements === true) {
					bSupportsStructuralEnhancements = true;
				}
			});

			if (bSupportsLogicEnhancements && bSupportsStructuralEnhancements) {
				return mExtensibilityType.Both;
			} else if (!bSupportsLogicEnhancements && bSupportsStructuralEnhancements) {
				return mExtensibilityType.Fields;
			} else if (bSupportsLogicEnhancements && !bSupportsStructuralEnhancements) {
				return mExtensibilityType.Logic;
			}

			return null;
		},

		_extractBusinessContextsFromResponse: function(oResponse) {
			return oResponse.results || [];
		},

		_getExtensionDataServiceParameters: function() {
			var oParameters = {
				EntitySetName: "", // required by backend
				EntityTypeName: this._mBindingInfo.entityTypeName
			};

			if (this._mServiceInfo.serviceType === UriParser.mServiceType.v4) {
				// ResourcePath='/sap/opu/odata4/sap/aps_integration_test/sadl/sap/i_cfd_tsm_so_core/0001/'&EntitySetName=''&EntityTypeName='BusinessPartner'
				oParameters.ResourcePath = UriParser.sODataV4ResourcePathPrefix + this._mServiceInfo.serviceName + "/" + this._mServiceInfo.serviceVersion;
			} else {
				// ServiceName='CFD_TSM_BUPA_MAINT_SRV'&ServiceVersion='0001'&EntitySetName=''&EntityTypeName='BusinessPartner'
				oParameters.ServiceName = this._mServiceInfo.serviceName;
				oParameters.ServiceVersion = this._mServiceInfo.serviceVersion;
			}

			return oParameters;
		},

		_getExtensionDataServiceUri: function() {
			if (this._mServiceInfo.serviceType === UriParser.mServiceType.v4) {
				// sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByResourcePath
				return sExtensionDataServiceUri + "GetBusinessContextsByResourcePath";
			}

			// sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByEntityType
			return sExtensionDataServiceUri + "GetBusinessContextsByEntityType";
		}
	});

	return SingleTenantABAPExtensibilityVariant;
});