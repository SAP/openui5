/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global"],
	function(jQuery) {
		"use strict";

		var Utils = {};
		var _sAppIndexBasedOnIdUrl = "/sap/bc/ui2/app_index/?basedOnId=";
		var _sAppIndexIdUrl = "/sap/bc/ui2/app_index/?sap.app/id=";

		Utils.ajaxRequest = function(oRequestData) {
			return new Promise(function(resolve, reject){
		        jQuery.ajax(oRequestData).done(function(oResponseData) {
	                return resolve(oResponseData);
	            }).fail(function(oError) {
	                return reject(oError);
	            });
		    });
		};

		Utils.getAppVariants = function(sComponentName, sType) {
			var oRequestData = {
	            url: _sAppIndexBasedOnIdUrl + sComponentName + '&fields=descriptorUrl',
	            type: "GET"
	        };

	        return this.ajaxRequest(oRequestData).then(function(oResponseData) {
				var aAppVariants = oResponseData.results;
				return this.getAppVariantDescriptorInfo(aAppVariants, sType);
	        }.bind(this));
		};

		Utils.getAppVariantDescriptorInfo = function(aAppVariants, sType) {
			var aAllAppVariants = [];

			var that = this;

			aAppVariants.some(function(oAppVariant) {
				aAllAppVariants.push(that.getAppVariantsProperties(oAppVariant, sType));
			});

			return Promise.all(aAllAppVariants).then(function(aResponses) {
				return aResponses;
			});
		};

		Utils.getAppVariantsProperties = function(oAppVariant, sType) {
			var oAppVariantProperties = {}, oRequestData;

			oRequestData = {
				url: oAppVariant["descriptorUrl"],
				type: "GET"
			};

			return this.ajaxRequest(oRequestData).then(function(oResponseData) {
				var oAppVariantDescriptor = oResponseData;

				oAppVariantProperties.id = oAppVariantDescriptor["sap.app"].id;
				oAppVariantProperties.title = oAppVariantDescriptor["sap.app"].title;
				oAppVariantProperties.subTitle = oAppVariantDescriptor["sap.app"].subTitle;
				oAppVariantProperties.description = oAppVariantDescriptor["sap.app"].description;
				oAppVariantProperties.icon = oAppVariantDescriptor["sap.ui"].icons.icon;
				oAppVariantProperties.componentName = oAppVariantDescriptor["sap.ui5"].componentName;
				oAppVariantProperties.type = sType;

				return Promise.resolve(oAppVariantProperties);
	        });
		};

		Utils.getOriginalAppProperties = function(sOriginalAppId, sType) {
			var oRequestData = {
	            url: _sAppIndexIdUrl + sOriginalAppId + '&fields=descriptorUrl',
	            type: "GET"
	        };

	        return this.ajaxRequest(oRequestData).then(function(oResponseData) {
				var aAppVariants = oResponseData.results;
				return this.getAppVariantDescriptorInfo(aAppVariants, sType);
	        }.bind(this));
		};

	return Utils;
}, /* bExport= */true);