sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/comp/navpopover/Factory"
], function(
	BaseObject,
	Factory
) {
	"use strict";

	var SmartLinkUtil = BaseObject.extend("sap.ui.rta.test.SmartlinkSmartLinkUtil",
	{});

	SmartLinkUtil.getServiceReal = Factory.getService;

	var mSetting = {
		semanticObjectSupplierId: {
			links: [
				{
					action: "action_01",
					intent: "#1",
					text: "Show SupplierId"
				}, {
					action: "action_02",
					intent: "#2",
					text: "Show favorite SupplierId"
				}, {
					action: "action_03",
					intent: "#3",
					text: "Show extra SupplierId"
				}
			]
		}
	};

	SmartLinkUtil.mockUShellServices = function() {
		Factory.getService = function(sServiceName) {
			switch (sServiceName) {
				case "CrossApplicationNavigation":
					return {
						hrefForExternal: function(oTarget) {
							if (!oTarget || !oTarget.target || !oTarget.target.shellHash) {
								return null;
							}
							return oTarget.target.shellHash;
						},
						getDistinctSemanticObjects: function() {
							var aSemanticObjects = [];
							for (var sSemanticObject in mSetting) {
								aSemanticObjects.push(sSemanticObject);
							}
							var oDeferred = jQuery.Deferred();
							setTimeout(function() {
								oDeferred.resolve(aSemanticObjects);
							}, 0);
							return oDeferred.promise();
						},
						getLinks: function(aParams) {
							var aLinks = [];
							if (!jQuery.isArray(aParams)) {
								mSetting[aParams.semanticObject] ? aLinks = mSetting[aParams.semanticObject].links : aLinks = [];
							} else {
								aParams.forEach(function(aParams_) {
									mSetting[aParams_[0].semanticObject] ? aLinks.push([
										mSetting[aParams_[0].semanticObject].links
									]) : aLinks.push([
										[]
									]);
								});
							}
							var oDeferred = jQuery.Deferred();
							setTimeout(function() {
								oDeferred.resolve(aLinks);
							}, 0);
							return oDeferred.promise();
						}
					};
				case "URLParsing":
					return {
						parseShellHash: function(sIntent) {
							var sAction;
							for (var sSemanticObject in mSetting) {
								mSetting[sSemanticObject].links.some(function(oLink) { // eslint-disable-line no-loop-func
									if (oLink.intent === sIntent) {
										sAction = oLink.action;
										return true;
									}
								});
								if (sAction) {
									return {
										semanticObject: sSemanticObject,
										action: sAction
									};
								}
							}
							return {
								semanticObject: null,
								action: null
							};
						}
					};
				default:
					return SmartLinkUtil.getServiceReal(sServiceName);
			}
		};
	};

	SmartLinkUtil.unMockUShellServices = function() {
		Factory.getService = SmartLinkUtil.getServiceReal;
	};

	return SmartLinkUtil;
}, /* bExport= */true);
