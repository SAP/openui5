sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/comp/navpopover/Factory"
], function(
	BaseObject,
	Factory
) {
	"use strict";

	var SmartLinkUtil = BaseObject.extend("sap.ui.rta.test.SmartlinkSmartLinkUtil", {});

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

	function getCrossApplicationNavigationService() {
		return {
			hrefForExternal(oTarget) {
				if (!oTarget || !oTarget.target || !oTarget.target.shellHash) {
					return null;
				}
				return oTarget.target.shellHash;
			},
			getDistinctSemanticObjects() {
				var aSemanticObjects = [];
				for (var sSemanticObject in mSetting) {
					aSemanticObjects.push(sSemanticObject);
				}
				return new Promise(function(resolve) {
					setTimeout(function() {
						resolve(aSemanticObjects);
					}, 0);
				});
			},
			getLinks(aParams) {
				var aLinks = [];
				if (!Array.isArray(aParams)) {
					aLinks = mSetting[aParams.semanticObject] ? mSetting[aParams.semanticObject].links : [];
				} else {
					aParams.forEach(function(aParams_) {
						mSetting[aParams_[0].semanticObject] ? aLinks.push([
							mSetting[aParams_[0].semanticObject].links
						]) : aLinks.push([
							[]
						]);
					});
				}
				return new Promise(function(resolve) {
					setTimeout(function() {
						resolve(aLinks);
					}, 0);
				});
			}
		};
	}

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

	SmartLinkUtil.mockUShellServices = function() {
		Factory.getService = function(sServiceName, bAsync) {
			switch (sServiceName) {
				case "CrossApplicationNavigation":
					return bAsync ? Promise.resolve(getCrossApplicationNavigationService()) : getCrossApplicationNavigationService();
				case "URLParsing":
					return bAsync ? Promise.resolve(getURLParsingService()) : getURLParsingService();
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