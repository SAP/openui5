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

		Utils.getAppVariantOverviewAttributes = function(oAppVariantInfo) {
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
						if (aResult.length) {
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
				title : oAppVariantInfo.title,
				subTitle : oAppVariantInfo.subTitle,
				description : oAppVariantInfo.description,
				icon : oAppVariantInfo.iconUrl,
				originalId : oAppVariantInfo.originalId,
				isOriginal : oAppVariantInfo.isOriginal,
				typeOfApp : fnCheckAppType(),
				descriptorUrl : oAppVariantInfo.descriptorUrl
			};

			var sNewAppVariantId = AppVariantUtils.getNewAppVariantId();

			if (sNewAppVariantId === oAppVariantInfo.appId) {
				oAppVariantAttributes.rowStatus = "Information";
			}

			return fnGetNavigationInfo(oAppVariantAttributes);
		};

		Utils.getAppVariantOverview = function(sReferenceAppId) {
			var sRoute = '/sap/bc/lrep/app_variant_overview/?sap.app/id=' + sReferenceAppId;

			return this.sendRequest(sRoute, 'GET').then(function(oResult) {
				var aAppVariantOverviewInfo = [];
				var aAppVariantInfo = oResult.response.items;
				if (aAppVariantInfo.length) {
					var that = this;
					aAppVariantInfo.forEach(function(oAppVariantInfo) {
						if (!oAppVariantInfo.isDescriptorVariant) {
							aAppVariantOverviewInfo.push(that.getAppVariantOverviewAttributes(oAppVariantInfo));
						}
					});

					return Promise.all(aAppVariantOverviewInfo).then(function(aResponses) {
						return aResponses;
					});
				}
			}.bind(this));
		};

		Utils.getDescriptor = function(sDescriptorUrl) {
			return this.sendRequest(sDescriptorUrl, 'GET').then(function(oResult) {
				return oResult.response;
			});
		};

	return Utils;
}, /* bExport= */true);