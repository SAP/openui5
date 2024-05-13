/*!
 * ${copyright}
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

	const sExtensionDataServiceUri = "/sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/";
	const sNamespace = "sap.ui.fl.write._internal.fieldExtensibility.SingleTenantABAPExtensibilityVariant";

	const oKeyOfAction = {
		CustomField: "CUSTOM_FIELD",
		CustomLogic: "CUSTOM_LOGIC"
	};
	const oNavigationIntents = {
		[oKeyOfAction.CustomField]: {
			semanticObject: "CustomField",
			action: "manage"
		},
		[oKeyOfAction.CustomLogic]: {
			semanticObject: "CustomLogic",
			action: "develop"
		}
	};

	const oTextKeys = {
		BusinessContextTitle: "BUSINESS_CONTEXT_TITLE",
		MenuButtonLabel: "BTN_CREATE",
		MenuButtonTooltip: "BTN_FREP_CCF",
		MenuCreateCustomField: "BTN_MENU_CREATE_CUSTOM_FIELD",
		StandaloneCreateCustomField: "BTN_CREATE_CUSTOM_FIELD",
		MenuCreateCustomLogic: "BTN_MENU_CREATE_CUSTOM_LOGIC",
		StandaloneCreateCustomLogic: "BTN_CREATE_CUSTOM_LOGIC"
	};

	/**
	 * Extension variant for ABAP single tenant environnments (via so called Custom Fields)
	 *
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.SingleTenantABAPExtensibilityVariant
	 * @since 1.87
	 * @version ${version}
	 * @public
	 */
	const SingleTenantABAPExtensibilityVariant = ABAPExtensibilityVariant.extend(sNamespace, {
		/**
		 * @inheritDoc
		 */
		async getExtensionData() {
			const oExtensionData = await this._oExtensionDataPromise;

			if (oExtensionData === null) {
				return null;
			}

			const aBusinessContexts = oExtensionData.businessContexts;

			if (!this._containsData(aBusinessContexts)) {
				return null;
			}

			return this._convertBusinessContextsToExtensionData(aBusinessContexts);
		},

		/**
		 * @inheritDoc
		 */
		async getNavigationUri(sActionKey) {
			// Fallback mechanism for users of scenario one (implicit navigation targets).
			const sResolvedActionKey = sActionKey ?? await this._getFallbackNavigationActionKey();

			if (sResolvedActionKey === null) {
				// No fallback action key for navigation was found.
				return null;
			}

			// Implements scenario two (explicit navigation targets).
			const oExtensionData = await this._oExtensionDataPromise;
			if (oExtensionData === null) {
				return null;
			}

			const aBusinessContexts = oExtensionData.businessContexts;
			const oNavigationSupported = oExtensionData.navigationSupported;

			if (!this._containsData(aBusinessContexts)) {
				return null;
			}

			if (!oNavigationSupported[sResolvedActionKey]) {
				return null;
			}

			const aMappedBusinessContexts = aBusinessContexts.map(function(oBusinessContext) {
				return oBusinessContext.BusinessContext;
			});
			return Utils.getNavigationUriForIntent({
				target: oNavigationIntents[sResolvedActionKey],
				params: {
					businessContexts: aMappedBusinessContexts,
					serviceVersion: this._mServiceInfo.serviceVersion,
					serviceName: this._mServiceInfo.serviceName,
					entityType: this._mBindingInfo.entityTypeName
				}
			});
		},

		/**
		 * @inheritDoc
		 */
		async getTexts() {
			const oExtensionData = await this._oExtensionDataPromise;
			if (oExtensionData === null) {
				return null;
			}

			const aBusinessContexts = oExtensionData.businessContexts;

			if (!this._containsData(aBusinessContexts)) {
				return null;
			}

			const sButtonText = await this._getMenuButtonLabel();
			const sTooltip = await this._getMenuButtonTooltip();
			const oOptions = await this._getMenuButtonOptions();

			if (oOptions.length === 1) {
				oOptions[0].text = sButtonText;
				oOptions[0].tooltip = sTooltip;
			}

			return {
				headerText: Utils.getText(oTextKeys.BusinessContextTitle),
				buttonText: sButtonText,
				tooltip: sTooltip,
				options: oOptions
			};
		},

		/**
		 * @inheritDoc
		 */
		async isActive() {
			const oExtensionData = await this._oExtensionDataPromise;
			if (oExtensionData === null) {
				return false;
			}

			const aBusinessContexts = oExtensionData.businessContexts;

			return this._containsData(aBusinessContexts);
		},

		_containsData(aBusinessContexts) {
			return Array.isArray(aBusinessContexts) && aBusinessContexts.length > 0;
		},

		_convertBusinessContextsToExtensionData(aBusinessContexts) {
			const aExtensionData = aBusinessContexts.map((oBusinessContext) => {
				return {
					description: oBusinessContext.BusinessContextDescription,
					businessContext: oBusinessContext.BusinessContext
				};
			});

			return {
				extensionData: aExtensionData
			};
		},

		async _determineExtensionData() {
			let [
				bNavigationSupportedForCustomField,
				bNavigationSupportedForCustomLogic
			] = await Utils.isNavigationSupportedForIntents([
				oNavigationIntents[oKeyOfAction.CustomField],
				oNavigationIntents[oKeyOfAction.CustomLogic]
			]);

			if (!(bNavigationSupportedForCustomField || bNavigationSupportedForCustomLogic)) {
				return null;
			}

			const sServiceUri = this._getExtensionDataServiceUri();
			const oServiceParameters = this._getExtensionDataServiceParameters();
			const oResponse = await Utils.executeRequest(sServiceUri, oServiceParameters);

			if (oResponse.errorOccurred === false) {
				const aBusinessContexts = this._extractBusinessContextsFromResponse(oResponse.result);

				const {
					supportsStructuralEnhancements: bSupportsStructuralEnhancements,
					supportsLogicEnhancements: bSupportsLogicEnhancements
				} = this._determineSupportedExtensibilityTypes(aBusinessContexts);

				bNavigationSupportedForCustomField &&= bSupportsStructuralEnhancements;
				bNavigationSupportedForCustomLogic &&= bSupportsLogicEnhancements;

				if (!(bNavigationSupportedForCustomField || bNavigationSupportedForCustomLogic)) {
					return null;
				}

				return {
					businessContexts: aBusinessContexts,
					navigationSupported: {
						[oKeyOfAction.CustomField]: bNavigationSupportedForCustomField,
						[oKeyOfAction.CustomLogic]: bNavigationSupportedForCustomLogic
					}
				};
			} else if (oResponse.statusCode === 404 && this._mServiceInfo.serviceType === UriParser.mServiceType.v4) {
				// in this case we assume that the backend system is just too old to support v4 based services
				return null;
			}

			throw oResponse;
		},

		_determineSupportedExtensibilityTypes(aBusinessContexts) {
			let bSupportsLogicEnhancements = false;
			let bSupportsStructuralEnhancements = false;

			for (const oBusinessContext of aBusinessContexts) {
				const bHasSupportsLogicEnhancements = oBusinessContext.hasOwnProperty("SupportsLogicEnhancements");
				if (!bHasSupportsLogicEnhancements || oBusinessContext.SupportsLogicEnhancements === true) {
					bSupportsLogicEnhancements = true;
				}

				const bHasSupportsStructuralEnhancements = oBusinessContext.hasOwnProperty("SupportsStructuralEnhancements");
				if (!bHasSupportsStructuralEnhancements || oBusinessContext.SupportsStructuralEnhancements === true) {
					bSupportsStructuralEnhancements = true;
				}
			}

			return {
				supportsLogicEnhancements: bSupportsLogicEnhancements,
				supportsStructuralEnhancements: bSupportsStructuralEnhancements
			};
		},

		_extractBusinessContextsFromResponse(oResponse) {
			return oResponse.results || [];
		},

		_getExtensionDataServiceParameters() {
			const oParameters = {
				EntitySetName: "", // required by backend
				EntityTypeName: this._mBindingInfo.entityTypeName
			};

			if (this._mServiceInfo.serviceType === UriParser.mServiceType.v4) {
				// ResourcePath='/sap/opu/odata4/sap/aps_integration_test/sadl/sap/i_cfd_tsm_so_core/0001/'
				// EntitySetName=''
				// EntityTypeName='BusinessPartner'
				oParameters.ResourcePath = `${UriParser.sODataV4ResourcePathPrefix + this._mServiceInfo.serviceName}/${this._mServiceInfo.serviceVersion}`;
			} else {
				// ServiceName='CFD_TSM_BUPA_MAINT_SRV'
				// ServiceVersion='0001'
				// EntitySetName=''
				// EntityTypeName='BusinessPartner'
				oParameters.ServiceName = this._mServiceInfo.serviceName;
				oParameters.ServiceVersion = this._mServiceInfo.serviceVersion;
			}

			return oParameters;
		},

		_getExtensionDataServiceUri() {
			if (this._mServiceInfo.serviceType === UriParser.mServiceType.v4) {
				// sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByResourcePath
				return `${sExtensionDataServiceUri}GetBusinessContextsByResourcePath`;
			}

			// sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByEntityType
			return `${sExtensionDataServiceUri}GetBusinessContextsByEntityType`;
		},

		async _getMenuButtonText(sTextKeyForExplicitNavigation) {
			const oExtensionData = await this._oExtensionDataPromise;

			if (oExtensionData === null) {
				return undefined;
			}

			const oNavigationSupported = oExtensionData.navigationSupported;

			let iNumberOfAvailableExtensibilityTypes = 0;
			for (const sExtensibilityType in oNavigationSupported) {
				if (!oNavigationSupported[sExtensibilityType]) {
					continue;
				}

				iNumberOfAvailableExtensibilityTypes++;
			}

			// Explicit navigation through menu button
			if (iNumberOfAvailableExtensibilityTypes > 1) {
				return Utils.getText(sTextKeyForExplicitNavigation);
			}

			// No navigation target
			if (iNumberOfAvailableExtensibilityTypes === 0) {
				return undefined;
			}

			if (oNavigationSupported[oKeyOfAction.CustomField]) {
				// Implicit navigation to custom fields
				return Utils.getText(oTextKeys.StandaloneCreateCustomField);
			}

			if (oNavigationSupported[oKeyOfAction.CustomLogic]) {
				// Implicit navigation to custom logic
				return Utils.getText(oTextKeys.StandaloneCreateCustomLogic);
			}

			// Reaching this point is essentially an error condition
			return undefined;
		},

		_getMenuButtonLabel() {
			return this._getMenuButtonText(oTextKeys.MenuButtonLabel);
		},

		_getMenuButtonTooltip() {
			return this._getMenuButtonText(oTextKeys.MenuButtonTooltip);
		},

		async _getMenuButtonOptions() {
			const oExtensionData = await this._oExtensionDataPromise;

			if (oExtensionData === null) {
				return [];
			}

			const oNavigationSupported = oExtensionData.navigationSupported;

			const aOptions = [];

			if (oNavigationSupported[oKeyOfAction.CustomField]) {
				aOptions.push(this._getFieldsMenuButtonOption());
			}

			if (oNavigationSupported[oKeyOfAction.CustomLogic]) {
				aOptions.push(this._getLogicMenuButtonOption());
			}

			return aOptions;
		},

		_getFieldsMenuButtonOption() {
			const sButtonText = Utils.getText(oTextKeys.MenuCreateCustomField);

			return {
				actionKey: oKeyOfAction.CustomField,
				text: sButtonText,
				tooltip: sButtonText
			};
		},

		_getLogicMenuButtonOption() {
			const sButtonText = Utils.getText(oTextKeys.MenuCreateCustomLogic);

			return {
				actionKey: oKeyOfAction.CustomLogic,
				text: sButtonText,
				tooltip: sButtonText
			};
		},

		async _getFallbackNavigationActionKey() {
			const oExtensionData = await this._oExtensionDataPromise;
			if (oExtensionData === null) {
				return null;
			}

			const aBusinessContexts = oExtensionData.businessContexts;
			const oNavigationSupported = oExtensionData.navigationSupported;

			if (!this._containsData(aBusinessContexts)) {
				return null;
			}

			for (const sActionKey in oNavigationSupported) {
				if (!oNavigationSupported[sActionKey]) {
					continue;
				}

				return sActionKey;
			}

			return null;
		}
	});

	return SingleTenantABAPExtensibilityVariant;
});