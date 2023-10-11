sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/comp/navpopover/Factory"
], function(
	BaseObject,
	Factory
) {
	"use strict";

	var SmartLinkUtil = BaseObject.extend("sap.ui.rta.test.SmartlinkSmartLinkUtil", {});

	SmartLinkUtil.getServiceReal = Factory.getService.bind(Factory);

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

	function getURLParsingService() {
		return {
			parseShellHash(sIntent) {
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
	}

	function getNavigationService() {
		return {
			getHref(oTarget) {
				if (!oTarget || !oTarget.target || !oTarget.target.shellHash) {
					return Promise.resolve(null);
				}
				return Promise.resolve(oTarget.target.shellHash);
			},
			getSemanticObjects() {
				var aSemanticObjects = [];
				for (var sSemanticObject in mSetting) {
					aSemanticObjects.push(sSemanticObject);
				}
				return Promise.resolve(aSemanticObjects);
			},
			getLinks(aParams) {
				var aLinks = [];
				if (!Array.isArray(aParams)) {
					if (mSetting[aParams.semanticObject]) {
						aLinks = mSetting[aParams.semanticObject].links;
					} else {
						aLinks = [];
					}
				} else {
					aParams.forEach(function(aParams_) {
						var oParam = Array.isArray(aParams_) ? aParams_[0] : aParams_;

						if (mSetting[oParam.semanticObject]) {
							aLinks.push(mSetting[oParam.semanticObject].links);
						} else {
							aLinks.push([]);
						}
					});
				}
				return Promise.resolve(aLinks);
			}
		};
	}

	SmartLinkUtil.mockUShellServices = function() {
		Factory.getService = function(sServiceName, bAsync) {
			switch (sServiceName) {
				case "URLParsing":
					return bAsync ? Promise.resolve(getURLParsingService()) : getURLParsingService();
				case "Navigation":
					return bAsync ? Promise.resolve(getNavigationService()) : getNavigationService();
				default:
					return SmartLinkUtil.getServiceReal(sServiceName, bAsync);
			}
		};
	};

	SmartLinkUtil.unMockUShellServices = function() {
		Factory.getService = SmartLinkUtil.getServiceReal;
	};

	return SmartLinkUtil;
}, /* bExport= */true);