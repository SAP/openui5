/* global QUnit sinon */

QUnit.config.autostart = false;
sap.ui.require(["sap/ui/rta/appVariant/Feature",
				"sap/ui/rta/appVariant/Utils",
				"sap/ui/rta/appVariant/AppVariantUtils",
				"sap/ui/rta/appVariant/manageApps/webapp/controller/ManageApps.controller"], function(RtaAppVariantFeature, ManageAppsUtils, AppVariantUtils, ManageAppsController) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a RtaAppVariantFeature is instantiated", {
		beforeEach : function(assert) {},
		afterEach : function(assert) {
			sandbox.restore();
		}
	});

	QUnit.test("when onGetOverview() is called,", function(assert) {
		var oMockedDescriptorData = {
			"sap.ui5": {
				componentName: "BaseAppId"
			},
			"sap.app": {
				title: "BaseAppTitle",
				subTitle: "BaseAppSubtitle",
				description: "BaseAppDescription",
				id: "BaseAppId"
			},
			"sap.ui": {
				icons: {
					icon: "sap-icon://history"
				}
			}
		};
		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

		var aMockAppVariantsProperties = [
			{
				"componentName": "component1",
				"description" : "description1",
				"icon" : "sap-icon://history",
				"id" : "id1",
				"subTitle" : "subTitle1",
				"title" : "title1",
				"type" :"App variant"
			},
			{
				"componentName": "component2",
				"description" : "description2",
				"icon" : "sap-icon://history",
				"id" : "id2",
				"subTitle" : "subTitle2",
				"title" : "title2",
				"type" :"App variant"
			},
			{
				"componentName": "component3",
				"description" : "description3",
				"icon" : "sap-icon://history",
				"id" : "id3",
				"subTitle" : "subTitle3",
				"title" : "title3",
				"type" :"App variant"
			}
		];
		sandbox.stub(ManageAppsUtils, "getAppVariants").returns(Promise.resolve(aMockAppVariantsProperties));

		sandbox.stub(ManageAppsController.prototype, "_paintCurrentlyAdaptedApp").returns(Promise.resolve(true));

		return RtaAppVariantFeature.onGetOverview("demoRootControl").then(function(oManageAppsDialog) {
			assert.ok(true, "the the promise got resolved and manageAppsDialog is opened");
			oManageAppsDialog.destroy();
		});
	});

	QUnit.test("when isPlatFormEnabled() is called for FLP apps on S/4 Hana platform with feature flag 'sap-ui-xx-rta-save-as' equal to true", function(assert) {
		var oMockedDescriptorData = {
			"sap.ui5": {
				componentName: "BaseAppId"
			},
			"sap.app": {
				title: "BaseAppTitle",
				subTitle: "BaseAppSubtitle",
				description: "BaseAppDescription",
				id: "BaseAppId",
				crossNavigation: {
					inbounds: {}
				}
			},
			"sap.ui": {
				icons: {
					icon: "sap-icon://history"
				}
			}
		};

		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

		var oMockedUriParams = {
			mParams: {
				"sap-ui-xx-rta-save-as": ["true"]
			}
		};

		sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);

		sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

		sandbox.stub(AppVariantUtils, "getInboundInfo").returns({currentRunningInbound: "testInboundId", addNewInboundRequired: true});

		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

		return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
			assert.equal(bResult, true, "then the 'i' button is visible");
		});
	});

	QUnit.test("when isPlatFormEnabled() is called for non FLP apps on S/4 Hana platform", function(assert) {
		var oMockedDescriptorData = {
			"sap.app": {
				id: "BaseAppId"
			}
		};

		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(false);
		sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

		return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
			assert.equal(bResult, false, "then the 'i' button is not visible");
		});
	});

	QUnit.test("when isPlatFormEnabled() is called for scaffolding apps", function(assert) {

		var oMockedDescriptorData = {
			"sap.app": {
				id: "BaseAppId"
			}
		};

		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);
		sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: false}));

		return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
			assert.equal(bResult, false, "then the 'i' button is not visible");
		});
	});

	QUnit.test("when isPlatFormEnabled() is called for non FLP apps on S/4 Hana platform with feature flag 'sap-ui-xx-rta-save-as' equal to false", function(assert) {
		var oMockedDescriptorData = {
			"sap.ui5": {
				componentName: "BaseAppId"
			},
			"sap.app": {
				title: "BaseAppTitle",
				subTitle: "BaseAppSubtitle",
				description: "BaseAppDescription",
				id: "BaseAppId",
				crossNavigation: {
					inbounds: {}
				}
			},
			"sap.ui": {
				icons: {
					icon: "sap-icon://history"
				}
			}
		};

		var oMockedUriParams = {
			mParams: {
				"sap-ui-xx-rta-save-as": ["false"]
			}
		};

		sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);

		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

		sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

		sandbox.stub(AppVariantUtils, "getInboundInfo").returns({currentRunningInbound: "testInboundId", addNewInboundRequired: true});
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

		return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
			assert.equal(bResult, false, "then the 'i' button is not visible");
		});
	});

	QUnit.test("when isPlatFormEnabled() is called for an FLP app which has no crossNavigation in 'sap.app' property of a descriptor", function(assert) {
		var oMockedDescriptorData = {
			"sap.ui5": {
				componentName: "BaseAppId"
			},
			"sap.app": {
				title: "BaseAppTitle",
				subTitle: "BaseAppSubtitle",
				description: "BaseAppDescription",
				id: "BaseAppId"
			},
			"sap.ui": {
				icons: {
					icon: "sap-icon://history"
				}
			}
		};

		var oMockedUriParams = {
			mParams: {
				"sap-ui-xx-rta-save-as": ["true"]
			}
		};

		sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);

		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

		sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

		sandbox.stub(AppVariantUtils, "getInboundInfo").returns({currentRunningInbound: "testInboundId", addNewInboundRequired: true});
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

		return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
			assert.equal(bResult, false, "then the 'i' button is not visible");
		});
	});

	QUnit.test("when isPlatFormEnabled() is called for FLP app which has no 'sap.app' property of a descriptor", function(assert) {
		var oMockedDescriptorData = {
			"sap.ui5": {
				componentName: "BaseAppId"
			},
			"sap.ui": {
				icons: {
					icon: "sap-icon://history"
				}
			}
		};

		var oMockedUriParams = {
			mParams: {
				"sap-ui-xx-rta-save-as": ["true"]
			}
		};

		sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);

		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

		sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

		sandbox.stub(AppVariantUtils, "getInboundInfo").returns({currentRunningInbound: "testInboundId", addNewInboundRequired: true});
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

		return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
			assert.equal(bResult, false, "then the 'i' button is not visible");
		});
	});

	QUnit.test("when isPlatFormEnabled() is called with no isPlatFormEnabled support (NON S/4 Hana Cloud systems)", function(assert) {
		var oMockedDescriptorData = {
			"sap.app": {
				id: "BaseAppId"
			}
		};

		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);
		sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

		return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", false).then(function(bResult) {
			assert.equal(bResult, false, "then the 'i' button is not visible");
		});
	});
});
