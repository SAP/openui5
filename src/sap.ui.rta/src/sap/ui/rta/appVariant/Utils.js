/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/fl/LrepConnector",
	"sap/ui/rta/appVariant/AppVariantUtils"],
	function(jQuery, LrepConnector, AppVariantUtils) {
		"use strict";

		var Utils = {};

		var sModulePath = jQuery.sap.getModulePath( "sap.ui.rta.appVariant.manageApps.webapp" );
		var oI18n = jQuery.sap.resources({
			url : sModulePath + "/i18n/i18n.properties"
		});

		Utils.sendRequest = function(sRoute, sOperation) {
			var oLREPConnector = LrepConnector.createConnector();
			return oLREPConnector.send(sRoute, sOperation);
		};

		Utils.getAppVariantOverviewAttributes = function(oAppVariantInfo, bKeyUser) {
			var oAppVariantAttributes;
			var fnCheckAppType = function() {
				if (oAppVariantInfo.isOriginal && oAppVariantInfo.isAppVariant) {
					return oI18n.getText("MAA_ORIGINAL_TYPE");
				} else if (oAppVariantInfo.isAppVariant) {
					return oI18n.getText("MAA_APP_VARIANT_TYPE");
				} else if (oAppVariantInfo.isOriginal) {
					return oI18n.getText("MAA_ORIGINAL_TYPE");
				}
			};

			var fncheckNavigationSupported = function(oNavigationParams) {
				var oNavigationService = sap.ushell.Container.getService( "CrossApplicationNavigation" );
				return oNavigationService.getLinks(oNavigationParams);
			};

			var fnGetNavigationInfo = function(oAppVariantAttributes) {
				if (oAppVariantInfo.hasStartableIntent) {
					var sSemanticObject = oAppVariantInfo.startWith.semanticObject;
					var sAction = oAppVariantInfo.startWith.action;
					var oParams = oAppVariantInfo.startWith.parameters;

					var oNavigationParams = {
						semanticObject : sSemanticObject,
						action : sAction,
						params: oParams
					};

					return fncheckNavigationSupported(oNavigationParams).then(function(aResult) {
						if (aResult.length && bKeyUser) {
							oAppVariantAttributes.adaptUIButtonVisibility = true;
						} else {
							oAppVariantAttributes.adaptUIButtonVisibility = false;
						}
						oAppVariantAttributes.semanticObject = sSemanticObject;
						oAppVariantAttributes.action = sAction;

						if (oParams) {
							Object.keys(oParams).forEach(function(sParamValue) {
								if (oParams[sParamValue].value) {
									oParams[sParamValue] = oParams[sParamValue].value;
								}
							});

							oAppVariantAttributes.params = oParams;
						}
						return Promise.resolve(oAppVariantAttributes);
					});
				} else {
					oAppVariantAttributes.adaptUIButtonVisibility = false;
					return Promise.resolve(oAppVariantAttributes);
				}
			};

			oAppVariantAttributes = {
				appId : oAppVariantInfo.appId,
				title : oAppVariantInfo.title || '',
				subTitle : oAppVariantInfo.subTitle || '',
				description : oAppVariantInfo.description || '',
				icon : oAppVariantInfo.iconUrl || '',
				isOriginal : oAppVariantInfo.isOriginal,
				typeOfApp : fnCheckAppType(),
				descriptorUrl : oAppVariantInfo.descriptorUrl,
				isKeyUser : bKeyUser
			};

			var sNewAppVariantId = AppVariantUtils.getNewAppVariantId();

			if (sNewAppVariantId === oAppVariantInfo.appId) {
				oAppVariantAttributes.currentStatus = oI18n.getText("MAA_NEW_APP_VARIANT");
			}

			return fnGetNavigationInfo(oAppVariantAttributes);
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