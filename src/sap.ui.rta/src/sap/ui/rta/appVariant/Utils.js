/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/LrepConnector",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/fl/registry/Settings",
	"sap/base/i18n/ResourceBundle"
],
function(
	LrepConnector,
	AppVariantUtils,
	Settings,
	ResourceBundle
) {
		"use strict";

		var Utils = {};

		var sModulePath = sap.ui.require.toUrl("sap/ui/rta/appVariant/manageApps/") + "webapp";
		var oI18n = ResourceBundle.create({
			url : sModulePath + "/i18n/i18n.properties"
		});

		Utils.sendRequest = function(sRoute, sOperation) {
			var oLREPConnector = LrepConnector.createConnector();
			return oLREPConnector.send(sRoute, sOperation);
		};

		Utils._checkNavigationSupported = function(oNavigationParams) {
			var oNavigationService = sap.ushell.Container.getService( "CrossApplicationNavigation" );
			return oNavigationService.getLinks(oNavigationParams);
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

		Utils._calculateCurrentStatus = function(sAppVariantInfoId) {
			// Get the id of a new created app variant
			var sNewAppVariantId = AppVariantUtils.getNewAppVariantId();

			if (sNewAppVariantId === sAppVariantInfoId) {
				return  oI18n.getText("MAA_NEW_APP_VARIANT");
			}

			return undefined;
		};

		Utils._checkDeleteButtonOptions = function(oPreparedObject, bAdaptUIButtonEnabled) {
			var oDelAppVarObject = {};

			if (oPreparedObject.isKeyUser) {
				if (oPreparedObject.isOriginal) {
					oDelAppVarObject.delAppVarButtonEnabled = false;
					oDelAppVarObject.delAppVarButtonVisibility = false;
					return oDelAppVarObject;
				}

				if (bAdaptUIButtonEnabled) {
					if (oPreparedObject.isS4HanaCloud) {
						// S4 Hana Cloud and target mappings => deleteable
						oDelAppVarObject.delAppVarButtonEnabled = true;
						oDelAppVarObject.delAppVarButtonVisibility = true;
					} else {
						// S4 Hana on premise and target mappings => not deleteable
						oDelAppVarObject.delAppVarButtonEnabled = false;
						oDelAppVarObject.delAppVarButtonVisibility = true;
					}
				} else if (oPreparedObject.isS4HanaCloud) {
					// S4 Hana Cloud and no target mappings => not deleteable
					oDelAppVarObject.delAppVarButtonEnabled = false;
					oDelAppVarObject.delAppVarButtonVisibility = true;
				} else {
					// S4 Hana on Premise and no target mappings => deleteable
					oDelAppVarObject.delAppVarButtonEnabled = true;
					oDelAppVarObject.delAppVarButtonVisibility = true;
				}
			} else {
				// Not a key user => not deleteable
				oDelAppVarObject.delAppVarButtonEnabled = false;
				oDelAppVarObject.delAppVarButtonVisibility = false;
			}

			return oDelAppVarObject;
		};

		Utils._getNavigationInfo = function(oPreparedObject) {
			var oNavigationObject = {};

			var sSemanticObject = oPreparedObject.startWith.semanticObject;
			var sAction = oPreparedObject.startWith.action;
			var oParams = oPreparedObject.startWith.parameters;

			var oNavigationParams = {
				semanticObject : sSemanticObject,
				action : sAction,
				params: oParams
			};

			return this._checkNavigationSupported(oNavigationParams).then(function(aResult) {
				var oDeleteButtonProperties;

				if (aResult.length && oPreparedObject.isKeyUser) {
					oNavigationObject.adaptUIButtonEnabled = true;
					oDeleteButtonProperties = this._checkDeleteButtonOptions(oPreparedObject, true);
				} else {
					oNavigationObject.adaptUIButtonEnabled = false;
					oDeleteButtonProperties = this._checkDeleteButtonOptions(oPreparedObject, false);
				}

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

				oNavigationObject = Object.assign({}, oNavigationObject, oDeleteButtonProperties);
				return oNavigationObject;
			}.bind(this));
		};

		Utils._prepareAppVariantAttributes = function(oAppVariantInfo) {
			return {
				appId : oAppVariantInfo.appId,
				title : oAppVariantInfo.title || '',
				subTitle : oAppVariantInfo.subTitle || '',
				description : oAppVariantInfo.description || '',
				icon : oAppVariantInfo.iconUrl || '',
				iconText : oAppVariantInfo.iconText,
				isOriginal : oAppVariantInfo.isOriginal,
				isAppVariant : oAppVariantInfo.isAppVariant,
				descriptorUrl : oAppVariantInfo.descriptorUrl
			};
		};

		Utils.getAppVariantOverviewAttributes = function(oAppVariantInfo, bKeyUser) {
			var oAppVariantAttributes;
			// Adding the tooltip to every icon which is shown on the App Variant Overview Dialog
			var sIconUrl = oAppVariantInfo.iconUrl;
			if (sIconUrl && sap.ui.core.IconPool.isIconURI(sIconUrl)) {
				oAppVariantInfo.iconText = sIconUrl.split('//')[1];
			}

			oAppVariantAttributes = this._prepareAppVariantAttributes(oAppVariantInfo);

			// A key user
			oAppVariantAttributes.isKeyUser = bKeyUser;

			// Type of application required for Overview dialog
			oAppVariantAttributes.typeOfApp = this._checkAppType(oAppVariantInfo.isOriginal, oAppVariantInfo.isAppVariant);

			// Calculate current status of application required for Overview Dialog
			oAppVariantAttributes.currentStatus = this._calculateCurrentStatus(oAppVariantInfo.appId);

			var bIsS4HanaCloud;
			return Settings.getInstance().then(function(oSettings) {
				bIsS4HanaCloud = AppVariantUtils.isS4HanaCloud(oSettings);
				// Populate the app variant attributes with the cloud system information
				oAppVariantAttributes.isS4HanaCloud = bIsS4HanaCloud;

				var oPreparedObject = {
					isKeyUser: bKeyUser,
					isOriginal: oAppVariantInfo.isOriginal,
					isS4HanaCloud: bIsS4HanaCloud
				};

				if (oAppVariantInfo.hasStartableIntent) {
					oPreparedObject.startWith = oAppVariantInfo.startWith;
					return this._getNavigationInfo(oPreparedObject).then(function(oNavigationObject) {
						oAppVariantAttributes = Object.assign({}, oAppVariantAttributes, oNavigationObject);
						return oAppVariantAttributes;
					});
				} else {
					oAppVariantAttributes.adaptUIButtonEnabled = false;
					var oDeleteButtonProperties = this._checkDeleteButtonOptions(oPreparedObject, false);
					oAppVariantAttributes = Object.assign({}, oAppVariantAttributes, oDeleteButtonProperties);
					return Promise.resolve(oAppVariantAttributes);
				}
			}.bind(this));
		};

		Utils.getAppVariantOverview = function(sReferenceAppId, bKeyUser) {
			// Customer* means the layer can be either CUSTOMER or CUSTOMER_BASE. This layer calculation will be done backendside
			var sLayer = bKeyUser ? 'CUSTOMER*' : 'VENDOR';
			var sRoute = '/sap/bc/lrep/app_variant_overview/?sap.app/id=' + sReferenceAppId + '&layer=' + sLayer;

			return this.sendRequest(sRoute, 'GET').then(function(oResult) {
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

		Utils.getDescriptor = function(sDescriptorUrl) {
			return this.sendRequest(sDescriptorUrl, 'GET').then(function(oResult) {
				return oResult.response;
			});
		};

	return Utils;
}, /* bExport= */true);