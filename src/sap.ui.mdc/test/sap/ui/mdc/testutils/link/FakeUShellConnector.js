/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery", 'sap/ui/mdc/link/Factory'
], function(jQuery, Factory) {
	"use strict";

	/**
	 * @namespace FakeUShellConnector.
	 * @name sap.ui.mdc.testutils.link.FakeUShellConnector
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.120.0
	 */
	function FakeUShellConnector() {}

	FakeUShellConnector.getURLParsing = function(oSetting) {
		return {
			parseShellHash: function(sIntent) {
				// var sAction;
				const fnFindAction = function(aLinks) {
					const aLink = aLinks.filter(function(oLink) {
						return oLink.intent === sIntent;
					});
					return aLink[0];
				};
				for ( const sSemanticObject in oSetting) {
					const oLink = fnFindAction(oSetting[sSemanticObject].links);
					if (oLink) {
						return {
							semanticObject: sSemanticObject,
							action: oLink.action
						};
					}
				}
				return {
					semanticObject: null,
					action: null
				};
			}
		};
	};

	FakeUShellConnector.getNavigationService = function(oSetting) {
		return {
			getHref: function(oTarget) {
				if (!oTarget) {
					return Promise.resolve(null);
				}
				return Promise.resolve(oTarget.target.shellHash);
			},
			getSemanticObjects: function() {
				const aSemanticObjects = [];
				for ( const sSemanticObject in oSetting) {
					aSemanticObjects.push(sSemanticObject);
				}
				return Promise.resolve(aSemanticObjects);
			},
			getLinks: function(aParams) {
				let aLinks = [];
				if (!Array.isArray(aParams)) {
					aLinks = oSetting[aParams.semanticObject] ? oSetting[aParams.semanticObject].links : [];
				} else {
					aParams.forEach(function(oParam) {
						aLinks.push(oSetting[oParam.semanticObject] ? oSetting[oParam.semanticObject].links : []);
					});
				}
				return Promise.resolve(aLinks);
			}
		};
	};

	FakeUShellConnector.enableFakeConnector = function(oSetting) {
		if (FakeUShellConnector.getServiceAsyncReal) {
			return;
		}
		FakeUShellConnector.getServiceAsyncReal = Factory.getServiceAsync;
		Factory.getServiceAsync = FakeUShellConnector._createFakeService(oSetting);
	};

	FakeUShellConnector.enableFakeConnectorForTesting = function(oSetting, mTestData) {
		if (FakeUShellConnector.getServiceAsyncReal) {
			return;
		}
		FakeUShellConnector.getServiceAsyncReal = Factory.getServiceAsync;
		Factory.getServiceAsync = FakeUShellConnector._createFakeService(oSetting, mTestData);
	};

	FakeUShellConnector._createFakeService = function(oSetting, mTestData) {
		return function(sServiceName) {
			switch (sServiceName) {
				case "URLParsing":
					return Promise.resolve(FakeUShellConnector.getURLParsing(oSetting, mTestData));
				case "Navigation":
					return Promise.resolve(FakeUShellConnector.getNavigationService(oSetting, mTestData));
				default:
					return FakeUShellConnector.getServiceAsyncReal(sServiceName);
			}
		};
	};

	FakeUShellConnector.disableFakeConnector = function() {
		if (FakeUShellConnector.getServiceAsyncReal) {
			Factory.getServiceAsync = FakeUShellConnector.getServiceAsyncReal;
			FakeUShellConnector.getServiceAsyncReal = undefined;
		}
	};

	return FakeUShellConnector;

}, true);
