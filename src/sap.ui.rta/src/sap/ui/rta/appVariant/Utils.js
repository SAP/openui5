/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/core/IconPool"
], function(
	AppVariantUtils,
	Settings,
	FlUtils,
	ResourceBundle,
	AppVariantWriteAPI,
	IconPool
) {
	"use strict";

	var Utils = {};

	var sModulePath = `${sap.ui.require.toUrl("sap/ui/rta/appVariant/manageApps/")}webapp`;
	var oI18n = ResourceBundle.create({
		url: `${sModulePath}/i18n/i18n.properties`
	});

	Utils._checkNavigationSupported = function(oNavigationParams) {
		var oUShellContainer = FlUtils.getUshellContainer();
		return oUShellContainer.getServiceAsync("Navigation")
		.then(function(oNavigationService) {
			return oNavigationService.getLinks([oNavigationParams]);
		})
		.catch(function(vError) {
			throw new Error(`Error retrieving ushell service Navigation: ${vError}`);
		});
	};

	Utils._checkAppType = function(bOriginalApp, bAppVariant) {
		if (bOriginalApp && bAppVariant) {
			return oI18n.getText("MAA_ORIGINAL_TYPE");
		} else if (bAppVariant) {
			return oI18n.getText("MAA_APP_VARIANT_TYPE");
		} else if (bOriginalApp) {
			return oI18n.getText("MAA_ORIGINAL_TYPE");
		}

		return undefined;
	};

	Utils._calculateCurrentStatus = function(sAppVariantInfoId, sAppVarStatus) {
		// Get the id of a new created app variant
		var sNewAppVariantId = AppVariantUtils.getNewAppVariantId();

		if (sAppVarStatus === "R") {
			return oI18n.getText("MAA_OPERATION_IN_PROGRESS");
		} else if (sNewAppVariantId === sAppVariantInfoId) {
			AppVariantUtils.setNewAppVariantId(null);
			if (sAppVarStatus !== "E") {
				return oI18n.getText("MAA_NEW_APP_VARIANT");
			}
		}
	};

	Utils._checkMenuItemOptions = function(oPreparedObject, bAdaptUIButtonEnabled) {
		var oAppVarObject = {};

		if (oPreparedObject.isKeyUser) {
			if (oPreparedObject.isOriginal) {
				oAppVarObject.delAppVarButtonVisibility = false;
				oAppVarObject.adaptUIButtonVisibility = false;
				return oAppVarObject;
			}
			// If the catalogs bound to the app variants are hanging in one of the following states, then the Save As button is disabled => Should be applicable only for S4/Cloud
			// Unpublished state ('U')
			// Error state ('E')
			// Running state ('R')
			if (oPreparedObject.appVarStatus === "U" || oPreparedObject.appVarStatus === "E" || oPreparedObject.appVarStatus === "R") {
				oAppVarObject.saveAsButtonEnabled = false;
			}
			oAppVarObject.adaptUIButtonVisibility = true;

			if (bAdaptUIButtonEnabled) {
				if (oPreparedObject.isS4HanaCloud) {
					// S4 Hana Cloud and target mappings => deleteable
					oAppVarObject.delAppVarButtonEnabled = true;
					oAppVarObject.delAppVarButtonVisibility = true;
				} else {
					// S4 Hana on premise and target mappings => not deleteable
					oAppVarObject.delAppVarButtonEnabled = false;
					oAppVarObject.delAppVarButtonVisibility = true;
				}
			} else {
				oAppVarObject.delAppVarButtonVisibility = true;
				if (oPreparedObject.appVarStatus === "R") {
					// catalog unpublishing or publishing is currently in progress => not deleteable
					oAppVarObject.delAppVarButtonEnabled = false;
				} else {
					// S/4HANA on Premise or Cloud and no target mappings => deleteable
					oAppVarObject.delAppVarButtonEnabled = true;
				}
			}
		} else {
			// Not a key user => not deleteable
			oAppVarObject.delAppVarButtonVisibility = false;
			oAppVarObject.adaptUIButtonVisibility = false;
		}

		return oAppVarObject;
	};

	Utils._getNavigationInfo = function(oPreparedObject) {
		var oNavigationObject = {};

		var sSemanticObject = oPreparedObject.startWith.semanticObject;
		var sAction = oPreparedObject.startWith.action;
		var oParams = oPreparedObject.startWith.parameters;

		var oNavigationParams = {
			semanticObject: sSemanticObject,
			action: sAction,
			params: oParams
		};

		return this._checkNavigationSupported(oNavigationParams).then(function(aResult) {
			var oDeleteButtonProperties;

			if (aResult[0].length && oPreparedObject.isKeyUser) {
				oNavigationObject.adaptUIButtonEnabled = true;

				if (oPreparedObject.appVarStatus === "R" || oPreparedObject.appVarStatus === "U" || oPreparedObject.appVarStatus === "E") {
					oNavigationObject.adaptUIButtonEnabled = false;
					oNavigationObject.appVarStatus = oPreparedObject.appVarStatus;
				}
			} else {
				oNavigationObject.adaptUIButtonEnabled = false;
			}

			oDeleteButtonProperties = this._checkMenuItemOptions(oPreparedObject, oNavigationObject.adaptUIButtonEnabled);

			oNavigationObject.semanticObject = sSemanticObject;
			oNavigationObject.action = sAction;

			if (oParams) {
				Object.keys(oParams).forEach(function(sParamValue) {
					if (oParams[sParamValue].value) {
						oParams[sParamValue] = oParams[sParamValue].value;
					}
				});

				oNavigationObject.params = oParams;
			}

			oNavigationObject = { ...oNavigationObject, ...oDeleteButtonProperties };
			return oNavigationObject;
		}.bind(this));
	};

	Utils._prepareAppVariantAttributes = function(oAppVariantInfo) {
		return {
			appId: oAppVariantInfo.appId,
			title: oAppVariantInfo.title || "",
			subTitle: oAppVariantInfo.subTitle || "",
			description: oAppVariantInfo.description || "",
			icon: oAppVariantInfo.iconUrl || "",
			iconText: oAppVariantInfo.iconText,
			isOriginal: oAppVariantInfo.isOriginal,
			isAppVariant: oAppVariantInfo.isAppVariant,
			descriptorUrl: oAppVariantInfo.descriptorUrl,
			appVarStatus: oAppVariantInfo.appVarStatus
		};
	};

	Utils.getAppVariantOverviewAttributes = function(oAppVariantInfo, bKeyUser) {
		var oAppVariantAttributes;
		// Adding the tooltip to every icon which is shown on the App Variant Overview Dialog
		var sIconUrl = oAppVariantInfo.iconUrl;
		if (sIconUrl && IconPool.isIconURI(sIconUrl)) {
			// eslint-disable-next-line prefer-destructuring
			oAppVariantInfo.iconText = sIconUrl.split("//")[1];
		}

		oAppVariantAttributes = this._prepareAppVariantAttributes(oAppVariantInfo);

		// A key user
		oAppVariantAttributes.isKeyUser = bKeyUser;

		// Type of application required for Overview dialog
		oAppVariantAttributes.typeOfApp = this._checkAppType(oAppVariantInfo.isOriginal, oAppVariantInfo.isAppVariant);

		// Calculate current status of application required for Overview Dialog
		oAppVariantAttributes.currentStatus = this._calculateCurrentStatus(oAppVariantInfo.appId, oAppVariantInfo.appVarStatus);

		var bIsS4HanaCloud;
		return Settings.getInstance().then(function(oSettings) {
			bIsS4HanaCloud = AppVariantUtils.isS4HanaCloud(oSettings);
			// Populate the app variant attributes with the cloud system information
			oAppVariantAttributes.isS4HanaCloud = bIsS4HanaCloud;

			var oPreparedObject = {
				isKeyUser: bKeyUser,
				isOriginal: oAppVariantInfo.isOriginal,
				isS4HanaCloud: bIsS4HanaCloud,
				appVarStatus: oAppVariantInfo.appVarStatus
			};

			if (oAppVariantInfo.hasStartableIntent) {
				oPreparedObject.startWith = oAppVariantInfo.startWith;
				return this._getNavigationInfo(oPreparedObject).then(function(oNavigationObject) {
					oAppVariantAttributes = { ...oAppVariantAttributes, ...oNavigationObject };
					return oAppVariantAttributes;
				});
			}

			oAppVariantAttributes.adaptUIButtonEnabled = false;
			var oDeleteButtonProperties = this._checkMenuItemOptions(oPreparedObject, false);
			oAppVariantAttributes = { ...oAppVariantAttributes, ...oDeleteButtonProperties };
			return Promise.resolve(oAppVariantAttributes);
		}.bind(this));
	};

	Utils.getAppVariantOverview = function(sReferenceAppId, bKeyUser) {
		// Customer* means the layer can be either CUSTOMER or CUSTOMER_BASE. This layer determination takes place in backend.
		var sLayer = bKeyUser ? "CUSTOMER*" : "VENDOR";

		var mPropertyBag = {
			selector: {
				appId: sReferenceAppId
			},
			layer: sLayer
		};

		return AppVariantWriteAPI.listAllAppVariants(mPropertyBag).then(function(oResult) {
			var aAppVariantOverviewInfo = [];
			var aAppVariantInfo;
			if (oResult.response && oResult.response.items) {
				aAppVariantInfo = oResult.response.items;
			} else {
				return Promise.resolve([]);
			}

			aAppVariantInfo.forEach(function(oAppVariantInfo) {
				if (!oAppVariantInfo.isDescriptorVariant) {
					aAppVariantOverviewInfo.push(this.getAppVariantOverviewAttributes(oAppVariantInfo, bKeyUser));
				}
			}, this);

			return Promise.all(aAppVariantOverviewInfo).then(function(aResponses) {
				return aResponses;
			});
		}.bind(this));
	};

	Utils.getDescriptor = function(mPropertyBag) {
		return AppVariantWriteAPI.getManifest(mPropertyBag).then(function(oResult) {
			return oResult.response;
		});
	};

	return Utils;
});