/* global QUnit */

sap.ui.define([
	"sap/ui/rta/appVariant/manageApps/webapp/controller/ManageApps.controller",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/core/Control",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/base/Event",
	"sap/m/Menu",
	"sap/m/MessageBox",
	"sap/m/MenuItem",
	"sap/m/MessageToast",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	ManageAppsController,
	AppVariantOverviewUtils,
	AppVariantUtils,
	RtaAppVariantFeature,
	RtaUtils,
	Layer,
	Control,
	ResourceBundle,
	Event,
	Menu,
	MessageBox,
	MenuItem,
	MessageToast,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	const aAppVariantOverviewAttributes = [
		{
			appId: "id1",
			title: "title1",
			subTitle: "subTitle1",
			description: "description1",
			icon: "sap-icon://history",
			originalId: "id1",
			isOriginal: true,
			typeOfApp: "Original App",
			descriptorUrl: "url1"
		},
		{
			appId: "id2",
			title: "title2",
			subTitle: "subTitle2",
			description: "description2",
			icon: "sap-icon://history",
			originalId: "id1",
			isOriginal: false,
			typeOfApp: "App Variant",
			descriptorUrl: "url2"
		},
		{
			appId: "id3",
			title: "title3",
			subTitle: "subTitle3",
			description: "description3",
			icon: "sap-icon://history",
			originalId: "id1",
			isOriginal: false,
			typeOfApp: "App Variant",
			descriptorUrl: "url3"
		}
	];

	QUnit.module("Given that the controller was not instantiated yet", {
		afterEach() {
			sandbox.restore();
		},
		after() {
			if (document.getElementById("sapUiBusyIndicator")) {
				document.getElementById("sapUiBusyIndicator").style.display = "none";
			}
		}
	}, function() {
		QUnit.test("when onInit is called in case app variants exist", function(assert) {
			var oViewStub = new Control();
			var oManageAppsController = new ManageAppsController();

			sandbox.stub(oManageAppsController, "getView").returns(oViewStub);

			var fnSimulatedOwnerComponent = {
				getIdRunningApp() {
					return "id1";
				},
				getIsOverviewForKeyUser() {
					return true;
				},
				getLayer() {
					return Layer.CUSTOMER;
				}
			};

			sandbox.stub(oManageAppsController, "getOwnerComponent").returns(fnSimulatedOwnerComponent);

			var highlightAppVariantSpy = sandbox.stub(oManageAppsController, "_highlightNewCreatedAppVariant").resolves();

			var getAppVariantOverviewSpy = sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(aAppVariantOverviewAttributes);

			return oManageAppsController.onInit().then(function() {
				assert.ok(highlightAppVariantSpy.calledOnce, "the _highlightNewCreatedAppVariant method is called once");
				assert.ok(getAppVariantOverviewSpy.calledOnce, "the getAppVariantOverview method is called once");
			});
		});

		QUnit.test("when onInit is called in case no app variants exist", function(assert) {
			var oViewStub = new Control();
			var oManageAppsController = new ManageAppsController();

			sandbox.stub(oManageAppsController, "getView").returns(oViewStub);

			var fnSimulatedOwnerComponent = {
				getIdRunningApp() {
					return "id1";
				},
				getIsOverviewForKeyUser() {
					return true;
				},
				getLayer() {
					return Layer.CUSTOMER;
				}
			};

			sandbox.stub(oManageAppsController, "getOwnerComponent").returns(fnSimulatedOwnerComponent);

			var aAppVariantOverviewAttributes = [];
			var highlightAppVariantSpy = sandbox.stub(oManageAppsController, "_highlightNewCreatedAppVariant").resolves();
			var showMessageWhenNoAppVariantsSpy = sandbox.spy(oManageAppsController, "_showMessageWhenNoAppVariantsExist");
			var utilsShowMessageBoxSpy = sandbox.stub(RtaUtils, "showMessageBox");
			var getAppVariantOverviewSpy = sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(aAppVariantOverviewAttributes);

			return oManageAppsController.onInit().then(function() {
				assert.notOk(highlightAppVariantSpy.calledOnce, "the _highlightNewCreatedAppVariant method is not called");
				assert.ok(getAppVariantOverviewSpy.calledOnce, "the getAppVariantOverview method is called once");
				assert.ok(showMessageWhenNoAppVariantsSpy.calledOnce, "the showMessageWhenNoAppVariantsSpy method is called once");
				assert.ok(utilsShowMessageBoxSpy.calledOnce, "the utilsShowMessageBoxSpy method is called once");
				assert.equal(utilsShowMessageBoxSpy.args[0][1], "MSG_APP_VARIANT_OVERVIEW_SAP_DEVELOPER", "the messageBoxPromise method displays message value correctly");
				assert.equal(utilsShowMessageBoxSpy.args[0][2].titleKey, "TITLE_APP_VARIANT_OVERVIEW_SAP_DEVELOPER", "the messageBoxPromise method displays message title correctly");
			});
		});

		QUnit.test("when onInit is called and failed", function(assert) {
			var oViewStub = new Control();
			var oManageAppsController = new ManageAppsController();

			sandbox.stub(oManageAppsController, "getView").returns(oViewStub);

			var fnSimulatedOwnerComponent = {
				getIdRunningApp() {
					return "id1";
				},
				getIsOverviewForKeyUser() {
					return true;
				},
				getLayer() {
					return Layer.CUSTOMER;
				}
			};

			sandbox.stub(oManageAppsController, "getOwnerComponent").returns(fnSimulatedOwnerComponent);

			var highlightAppVariantSpy = sandbox.stub(oManageAppsController, "_highlightNewCreatedAppVariant").resolves();

			var showMessageWhenNoAppVariantsSpy = sandbox.stub(oManageAppsController, "_showMessageWhenNoAppVariantsExist");

			sandbox.stub(RtaUtils, "showMessageBox").resolves();
			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));
			var getAppVariantOverviewSpy = sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.reject("Server error"));
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Server error").returns();

			return oManageAppsController.onInit().catch(function(bSuccess) {
				assert.equal(bSuccess, false, "Error: An unexpected exception occurred");
				assert.ok(highlightAppVariantSpy.notCalled, "the _highlightNewCreatedAppVariant method is not called");
				assert.ok(getAppVariantOverviewSpy.calledOnce, "the getAppVariantOverview method is called once");
				assert.ok(showMessageWhenNoAppVariantsSpy.notCalled, "the showMessageWhenNoAppVariantsSpy method is not called");
			});
		});
	});

	QUnit.module("Given that a ManageApps controller is instantiated", {
		async beforeEach() {
			this.oManageAppsController = new ManageAppsController();
			const oFakeControl = new Control();
			sandbox.stub(this.oManageAppsController, "getView").returns(oFakeControl);
			const fnSimulatedOwnerComponent = {
				getIdRunningApp() {
					return "id1";
				},
				getIsOverviewForKeyUser() {
					return true;
				},
				getLayer() {
					return Layer.CUSTOMER;
				}
			};
			sandbox.stub(this.oManageAppsController, "getOwnerComponent").returns(fnSimulatedOwnerComponent);
			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(aAppVariantOverviewAttributes);

			await this.oManageAppsController.onInit();
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			if (document.getElementById("sapUiBusyIndicator")) {
				document.getElementById("sapUiBusyIndicator").style.display = "none";
			}
		}
	}, function() {
		QUnit.test("when copyId is called", function(assert) {
			const fnModelPropertyStub = sandbox.stub(this.oManageAppsController, "getModelProperty");
			fnModelPropertyStub.onFirstCall().returns("Idcopied");
			var fnMessageToastSpy = sandbox.spy(MessageToast, "show");

			var oButton = {
				getBindingContext() {
					return {
						sPath: "/appVariants/0"
					};
				}
			};

			var oEmptyEvent = new Event("emptyEventId", oButton, {
				button: oButton
			});

			this.oManageAppsController.copyId(oEmptyEvent);
			assert.equal(fnModelPropertyStub.callCount, 1, "the modelProperty method is called once");
			assert.equal(fnMessageToastSpy.callCount, 1, "MessageToast.show is called once");
		});

		QUnit.test("when deleteAppVariant is called for app variant", function(assert) {
			const modelPropertySpy = sandbox.stub(this.oManageAppsController, "getModelProperty");
			modelPropertySpy.onFirstCall().returns("appVarID");
			modelPropertySpy.onSecondCall().returns(false);
			modelPropertySpy.onThirdCall().returns(undefined);

			var oButton = {
				getBindingContext() {
					return {
						sPath: "/appVariants/0"
					};
				}
			};

			var oEmptyEvent = new Event("emptyEventId", oButton, {
				button: oButton
			});

			var fnOnDeleteFromOverviewDialogStub = sandbox.stub(RtaAppVariantFeature, "onDeleteFromOverviewDialog").resolves();

			const fnShowRelevantDialogStub = sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				assert.equal(mParameters.icon, MessageBox.Icon.INFORMATION, "then the correct icon is shown");
				mParameters.onClose("Ok");
			});

			return this.oManageAppsController.deleteAppVariant(oEmptyEvent).then(function() {
				assert.ok(fnOnDeleteFromOverviewDialogStub.calledOnce, "then onDeleteFromOverviewDialogStub is called once");
				assert.ok(fnShowRelevantDialogStub.calledOnce, "the showRelevantDialog method is called once");
			});
		});

		QUnit.test("when onMenuAction is called and copy id is pressed", function(assert) {
			var oEmptyEvent = new Event("emptyEventId", new Menu(), {
				item: new MenuItem({text: "Copy ID"})
			});

			const fnCopyID = sandbox.stub(this.oManageAppsController, "copyId");

			this.oManageAppsController.onMenuAction(oEmptyEvent);
			assert.ok(fnCopyID.calledOnce, "then copyId is called once");
		});

		QUnit.test("when onMenuAction is called and handleUiAdaptation is pressed", function(assert) {
			var oEmptyEvent = new Event("emptyEventId", new Menu(), {
				item: new MenuItem({text: "Adapt UI"})
			});

			const fnHandleUiAdaptation = sandbox.stub(this.oManageAppsController, "handleUiAdaptation");

			this.oManageAppsController.onMenuAction(oEmptyEvent);
			assert.ok(fnHandleUiAdaptation.calledOnce, "then handleUiAdaptation is called once");
		});

		QUnit.test("when onMenuAction is called and deleteAppVariant is pressed", function(assert) {
			var oEmptyEvent = new Event("emptyEventId", new Menu(), {
				item: new MenuItem({text: "Delete App Variant"})
			});

			const fnDeleteAppVariant = sandbox.stub(this.oManageAppsController, "deleteAppVariant");

			this.oManageAppsController.onMenuAction(oEmptyEvent);
			assert.ok(fnDeleteAppVariant.calledOnce, "then deleteAppVariant is called once");
		});

		QUnit.test("when formatAdaptUIButtonTooltip is called with different app var statuses", function(assert) {
			const oGetTextStub = sandbox.stub(ResourceBundle.prototype, "getText");

			this.oManageAppsController.formatAdaptUIButtonTooltip(false, undefined);
			assert.ok(oGetTextStub.calledWithExactly("TOOLTIP_ADAPTUI_ON_PREMISE"), "then tooltip text key is correct");

			this.oManageAppsController.formatAdaptUIButtonTooltip(false, "R");
			assert.ok(oGetTextStub.calledWithExactly("TOOLTIP_ADAPTUI_STATUS_RUNNING"), "then tooltip text key is correct");

			this.oManageAppsController.formatAdaptUIButtonTooltip(false, "U");
			assert.ok(oGetTextStub.calledWithExactly("TOOLTIP_ADAPTUI_STATUS_UNPBLSHD_ERROR"), "then tooltip text key is correct");

			this.oManageAppsController.formatAdaptUIButtonTooltip(false, "E");
			assert.ok(oGetTextStub.calledWithExactly("TOOLTIP_ADAPTUI_STATUS_UNPBLSHD_ERROR"), "then tooltip text key is correct");

			this.oManageAppsController.formatAdaptUIButtonTooltip(false, "P");
			assert.ok(oGetTextStub.calledWithExactly("TOOLTIP_ADAPTUI_STATUS_PUBLISHED"), "then tooltip text key is correct");

			assert.strictEqual(
				this.oManageAppsController.formatAdaptUIButtonTooltip(false, "bla"),
				undefined,
				"then no tooltip will be set"
			);
			assert.strictEqual(
				this.oManageAppsController.formatAdaptUIButtonTooltip(true),
				undefined,
				"then no tooltip will be set"
			);
		});
	});

	QUnit.module("Given that a ManageApps controller is instantiated", {
		beforeEach() {
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when handleUiAdaptation is called", function(assert) {
			var oManageAppsController = new ManageAppsController();

			var modelPropertySpy = sandbox.stub(oManageAppsController, "getModelProperty");

			modelPropertySpy.onFirstCall().returns("SemObj");
			modelPropertySpy.onSecondCall().returns("Action");
			modelPropertySpy.onThirdCall().returns({
				saveAs: "customer.id"
			});

			var oButton = {
				getBindingContext() {
					return {
						sPath: "/appVariants/0"
					};
				}
			};

			var oEmptyEvent = new Event("emptyEventId", oButton, {
				button: oButton
			});

			oManageAppsController.handleUiAdaptation(oEmptyEvent);

			assert.ok(modelPropertySpy.calledThrice, "the getModelProperty is called three times");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});