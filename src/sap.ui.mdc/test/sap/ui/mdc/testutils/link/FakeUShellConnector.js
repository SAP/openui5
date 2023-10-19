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

	FakeUShellConnector.enableFakeConnector = function(oSetting) {
		if (FakeUShellConnector.getServiceReal) {
			return;
		}
		FakeUShellConnector.getServiceReal = Factory.getService;
		Factory.getService = FakeUShellConnector._createFakeService(oSetting);
	};

	FakeUShellConnector.enableFakeConnectorForTesting = function(oSetting, mTestData) {
		if (FakeUShellConnector.getServiceReal) {
			return;
		}
		FakeUShellConnector.getServiceReal = Factory.getService;
		Factory.getService = FakeUShellConnector._createFakeService(oSetting, mTestData);
	};

	FakeUShellConnector._createFakeService = function(oSetting, mTestData) {
		return function(sServiceName) {
			switch (sServiceName) {
				case "CrossApplicationNavigation":
					return {
						hrefForExternal: function(oTarget, oComponent) {
							if (mTestData) {
								mTestData.hrefForExternal = mTestData.hrefForExternal || { calls: []};
								mTestData.hrefForExternal.calls.push({
									target: oTarget,
									comp: oComponent
								});
							}
							if (!oTarget) {
								return null;
							}
							return oTarget.target.shellHash;
						},
						getDistinctSemanticObjects: function() {
							const aSemanticObjects = [];
							for ( const sSemanticObject in oSetting) {
								aSemanticObjects.push(sSemanticObject);
							}
							const oDeferred = jQuery.Deferred();
							setTimeout(function() {
								oDeferred.resolve(aSemanticObjects);
							}, 0);
							return oDeferred.promise();
						},
						getLinks: function(aParams) {
							let aLinks = [];
							if (!Array.isArray(aParams)) {
								oSetting[aParams.semanticObject] ? aLinks = oSetting[aParams.semanticObject].links : aLinks = [];
							} else {
								aParams.forEach(function(aParams_) {
									oSetting[aParams_[0].semanticObject] ? aLinks.push([
										oSetting[aParams_[0].semanticObject].links
									]) : aLinks.push([
										[]
									]);
								});
							}
							const oDeferred = jQuery.Deferred();
							setTimeout(function() {
								oDeferred.resolve(aLinks);
							}, 0);
							return oDeferred.promise();
						}
					};
				case "URLParsing":
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
				default:
					return FakeUShellConnector.getServiceReal(sServiceName);
			}
		};
	};

	FakeUShellConnector.disableFakeConnector = function() {
		if (FakeUShellConnector.getServiceReal) {
			Factory.getService = FakeUShellConnector.getServiceReal;
			FakeUShellConnector.getServiceReal = undefined;
		}
	};

	return FakeUShellConnector;

}, true);
