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

	const sBusinessContextServiceUri = "/sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/";
	const sBusinessObjectServiceUri = "/sap/opu/odata/sap/ui_sclg_implementation/";
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

			if (!this._containsExtensionData(oExtensionData)) {
				return null;
			}

			const aExtensionData = [];

			for (const oBusinessContext of oExtensionData.businessContexts) {
				const oExtensionData = {
					description: oBusinessContext.BusinessContextDescription,
					businessContext: oBusinessContext.BusinessContext
				};

				aExtensionData.push(oExtensionData);
			}

			return {
				extensionData: aExtensionData
			};
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

			if (!this._containsExtensionData(oExtensionData)) {
				return null;
			}

			const oNavigationSupported = oExtensionData.navigationSupported;

			if (!oNavigationSupported[sResolvedActionKey]) {
				return null;
			}

			const aBusinessContexts = oExtensionData.businessContexts;
			const aMappedBusinessContexts = aBusinessContexts.map(function(oBusinessContext) {
				return oBusinessContext.BusinessContext;
			});
			const aBusinessObjects = oExtensionData.businessObjects;
			const aMappedBusinessObjects = aBusinessObjects.map(function(oBusinessObject) {
				return oBusinessObject.SAPObjectNodeType;
			});
			return Utils.getNavigationUriForIntent({
				target: oNavigationIntents[sResolvedActionKey],
				params: {
					businessContexts: aMappedBusinessContexts,
					businessObjects: aMappedBusinessObjects,
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

			if (!this._containsExtensionData(oExtensionData)) {
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

			return this._containsExtensionData(oExtensionData);
		},

		_containsExtensionData({
			businessContexts: aBusinessContexts,
			businessObjects: aBusinessObjects
		}) {
			const bContainsBusinessContexts = Array.isArray(aBusinessContexts) && aBusinessContexts.length > 0;
			const bContainsBusinessObjects = Array.isArray(aBusinessObjects) && aBusinessObjects.length > 0;

			return bContainsBusinessContexts || bContainsBusinessObjects;
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

			const aBusinessContexts = await this._getBusinessContexts();
			if (aBusinessContexts === null) {
				return null;
			}

			const aBusinessObjects = await this._getBusinessObjects(aBusinessContexts);
			if (aBusinessObjects === null) {
				return null;
			}

			const {
				supportsStructuralEnhancements: bSupportsStructuralEnhancements,
				supportsLogicEnhancements: bSupportsLogicEnhancements
			} = this._determineSupportedExtensibilityTypes(aBusinessContexts, aBusinessObjects);

			bNavigationSupportedForCustomField &&= bSupportsStructuralEnhancements;
			bNavigationSupportedForCustomLogic &&= bSupportsLogicEnhancements;

			if (!(bNavigationSupportedForCustomField || bNavigationSupportedForCustomLogic)) {
				return null;
			}

			return {
				businessContexts: aBusinessContexts,
				businessObjects: aBusinessObjects,
				navigationSupported: {
					[oKeyOfAction.CustomField]: bNavigationSupportedForCustomField,
					[oKeyOfAction.CustomLogic]: bNavigationSupportedForCustomLogic
				}
			};
		},

		async _getBusinessContexts() {
			const sServiceUri = this._getBusinessContextDataServiceUrl();
			const oServiceParameters = this._getBusinessContextDataServiceParameters();
			const oResponse = await Utils.executeRequest(sServiceUri, oServiceParameters);

			if (oResponse.statusCode === 404 && this._mServiceInfo.serviceType === UriParser.mServiceType.v4) {
				// Guess: the backend system is too old to support v4 based services.
				return null;
			}

			if (oResponse.errorOccurred !== false) {
				throw oResponse;
			}

			const aBusinessContexts = oResponse.result.results || [];

			for (const oBusinessContext of aBusinessContexts) {
				oBusinessContext.SupportsLogicEnhancements ??= true;
				oBusinessContext.SupportsStructuralEnhancements ??= true;
			}

			return aBusinessContexts;
		},

		async _getBusinessObjects(aBusinessContexts) {
			const sServiceUri = this._getBusinessObjectDataServiceUrl();
			const oServiceParameters = this._getBusinessObjectDataServiceParameters(aBusinessContexts);
			const oResponse = await Utils.executeRequest(sServiceUri, oServiceParameters);

			if (oResponse.errorOccurred !== false) {
				// Guess: the backend system is too old to support this extension data type.
				return [];
			}

			return oResponse.result.results || [];
		},

		_determineSupportedExtensibilityTypes(aBusinessContexts, aBusinessObjects) {
			const bSupportsLogicEnhancements = aBusinessContexts.some(
				(oBusinessContext) => oBusinessContext.SupportsLogicEnhancements
			) || aBusinessObjects.some(
				(oBusinessObject) => oBusinessObject.SupportsLogicEnhancements
			);

			const bSupportsStructuralEnhancements = aBusinessContexts.some(
				(oBusinessContext) => oBusinessContext.SupportsStructuralEnhancements
			) || aBusinessObjects.some(
				(oBusinessObject) => oBusinessObject.SupportsStructuralEnhancements
			);

			return {
				supportsLogicEnhancements: bSupportsLogicEnhancements,
				supportsStructuralEnhancements: bSupportsStructuralEnhancements
			};
		},

		_getBusinessContextDataServiceParameters() {
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

		_getBusinessContextDataServiceUrl() {
			if (this._mServiceInfo.serviceType === UriParser.mServiceType.v4) {
				return `${sBusinessContextServiceUri}GetBusinessContextsByResourcePath`;
			}

			return `${sBusinessContextServiceUri}GetBusinessContextsByEntityType`;
		},

		_getBusinessObjectDataServiceParameters(aBusinessContexts) {
			const aBusinessContextNames = aBusinessContexts.map((oBusinessContext) => {
				return oBusinessContext.BusinessContext;
			});

			return {
				BusinessContexts: JSON.stringify(aBusinessContextNames)
			};
		},

		_getBusinessObjectDataServiceUrl() {
			return `${sBusinessObjectServiceUri}getSONTsFromBusinessContexts`;
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

			const oNavigationSupported = oExtensionData.navigationSupported;

			if (!this._containsExtensionData(oExtensionData)) {
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