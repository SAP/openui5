/* global QUnit */


QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/appVariant/manageApps/webapp/controller/ManageApps.controller",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/thirdparty/sinon"
], function(
	ManageAppsController,
	AppVariantOverviewUtils,
	RtaAppVariantFeature,
	sinon) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a ManageApps controller is instantiated", {
		afterEach : function(assert) {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when onInit is called in case app variants exist", function(assert) {
			var oViewStub = new sap.ui.core.Control();
			var oManageAppsController = new ManageAppsController();

			sandbox.stub(oManageAppsController, "getView").returns(oViewStub);

			var fnSimulatedOwnerComponent = {
				getIdRunningApp : function() {
					return "id1";
				},
				getIsOverviewForKeyUser : function() {
					return true;
				}
			};

			sandbox.stub(oManageAppsController, "getOwnerComponent").returns(fnSimulatedOwnerComponent);

			var highlightAppVariantSpy = sandbox.stub(oManageAppsController, "_highlightNewCreatedAppVariant").returns(Promise.resolve());

			var aAppVariantOverviewAttributes = [
				{
					appId : "id1",
					title : "title1",
					subTitle : "subTitle1",
					description : "description1",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : true,
					typeOfApp : "Original App",
					descriptorUrl : "url1"
				},
				{
					appId : "id2",
					title : "title2",
					subTitle : "subTitle2",
					description : "description2",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url2"
				},
				{
					appId : "id3",
					title : "title3",
					subTitle : "subTitle3",
					description : "description3",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url3"
				}
			];

			var getAppVariantOverviewSpy = sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.resolve(aAppVariantOverviewAttributes));

			return oManageAppsController.onInit().then(function() {
				assert.ok(highlightAppVariantSpy.calledOnce, "the _highlightNewCreatedAppVariant method is called once");
				assert.ok(getAppVariantOverviewSpy.calledOnce, "the getAppVariantOverview method is called once");
			});
		});

		QUnit.test("when onInit is called in case no app variants exist", function(assert) {
			var oViewStub = new sap.ui.core.Control();
			var oManageAppsController = new ManageAppsController();

			sandbox.stub(oManageAppsController, "getView").returns(oViewStub);

			var fnSimulatedOwnerComponent = {
				getIdRunningApp : function() {
					return "id1";
				},
				getIsOverviewForKeyUser : function() {
					return true;
				}
			};

			sandbox.stub(oManageAppsController, "getOwnerComponent").returns(fnSimulatedOwnerComponent);

			var highlightAppVariantSpy = sandbox.stub(oManageAppsController, "_highlightNewCreatedAppVariant").returns(Promise.resolve());

			var aAppVariantOverviewAttributes = [];

			var showMessageWhenNoAppVariantsSpy = sandbox.stub(oManageAppsController, "_showMessageWhenNoAppVariantsExist").returns(Promise.resolve());

			var getAppVariantOverviewSpy = sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.resolve(aAppVariantOverviewAttributes));

			return oManageAppsController.onInit().then(function() {
				assert.notOk(highlightAppVariantSpy.calledOnce, "the _highlightNewCreatedAppVariant method is not called");
				assert.ok(getAppVariantOverviewSpy.calledOnce, "the getAppVariantOverview method is called once");
				assert.ok(showMessageWhenNoAppVariantsSpy.calledOnce, "the showMessageWhenNoAppVariantsSpy method is called once");
			});
		});

		QUnit.test("when saveAsAppVariant is called", function(assert) {
			var oManageAppsController = new ManageAppsController();

			var modelPropertySpy = sandbox.stub(oManageAppsController, "getModelProperty");

			modelPropertySpy.onFirstCall().returns("descriptorUrl");

			var oButton = {
				getBindingContext : function() {
					return {
						sPath : "/appVariants/0"
					};
				}
			};

			var oEmptyEvent = new sap.ui.base.Event("emptyEventId", oButton, {
				button : oButton
			});

			var oResult = {
				response: {
					"sap.app" : {
						id : "testId"
					},
					"sap.ui5" : {
						componentName : "id1"
					}
				}
			};

			var getDescriptorSpy = sandbox.stub(AppVariantOverviewUtils, "sendRequest").returns(Promise.resolve(oResult));

			var onSaveAsSpy = sandbox.stub(RtaAppVariantFeature, "onSaveAsFromOverviewDialog").returns(Promise.resolve());

			return oManageAppsController.saveAsAppVariant(oEmptyEvent).then(function() {
				assert.ok(getDescriptorSpy.calledOnce, "the getDescriptor is called once");
				assert.ok(onSaveAsSpy.calledOnce, "the onSaveAs method is called once");
			});
		});

		QUnit.test("when copyId is called", function(assert) {
			var oManageAppsController = new ManageAppsController();

			var modelPropertySpy = sandbox.stub(oManageAppsController, "getModelProperty");

			modelPropertySpy.onFirstCall().returns("Idcopied");

			var oButton = {
				getBindingContext : function() {
					return {
						sPath : "/appVariants/0"
					};
				}
			};

			var oEmptyEvent = new sap.ui.base.Event("emptyEventId", oButton, {
				button : oButton
			});


			oManageAppsController.copyId(oEmptyEvent);
			assert.ok(modelPropertySpy.calledOnce, "the modelProperty method is called once");
		});
	});

	QUnit.module("Given that a ManageApps controller is instantiated", {
		beforeEach : function(assert) {
			window.bUShellNavigationTriggered = false;
			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!

			sap.ushell = jQuery.extend({}, sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							}
						};
					}
				}
			});
		},
		afterEach : function(assert) {
			sandbox.restore();
			sap.ushell = this.originalUShell;
			delete window.bUShellNavigationTriggered;
		}
	}, function() {
		QUnit.test("when handleUiAdaptation is called", function(assert) {
			var oManageAppsController = new ManageAppsController();

			var modelPropertySpy = sandbox.stub(oManageAppsController, "getModelProperty");

			modelPropertySpy.onFirstCall().returns("SemObj");
			modelPropertySpy.onSecondCall().returns("Action");
			modelPropertySpy.onThirdCall().returns({
				"saveAs" : "customer.id"
			});

			var oButton = {
				getBindingContext : function() {
					return {
						sPath : "/appVariants/0"
					};
				}
			};

			var oEmptyEvent = new sap.ui.base.Event("emptyEventId", oButton, {
				button : oButton
			});

			oManageAppsController.handleUiAdaptation(oEmptyEvent);

			assert.ok(modelPropertySpy.calledThrice, "the getModelProperty is called three times");
		});
	});
});
