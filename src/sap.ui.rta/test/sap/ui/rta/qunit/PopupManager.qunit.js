jQuery.sap.require("sap/ui/qunit/qunit-coverage");
jQuery.sap.require("sap/ui/rta/qunit/RtaQunitUtils");
jQuery.sap.require("sap/ui/thirdparty/sinon");

sap.ui.define([
	"sap/ui/fl/FakeLrepLocalStorage",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/util/PopupManager",
	"sap/m/InstanceManager",
	"sap/m/Dialog",
	"sap/m/Popover",
	"sap/ui/core/Popup",
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/m/Button",
	"sap/ui/layout/form/Form"
	],
function(
	FakeLrepLocalStorage,
	FakeLrepConnectorLocalStorage,
	DesignTime,
	RuntimeAuthoring,
	PopupManager,
	InstanceManager,
	Dialog,
	Popover,
	Popup,
	MessageToast,
	UIComponent,
	ComponentContainer,
	Button,
	Form
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	var oView, oApp;

	var oComp = new (UIComponent.extend("MockController", {
		metadata: {
			manifest: 	{
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					}
				}
			}
		},
		createContent : function() {
			FakeLrepConnectorLocalStorage.enableFakeConnector();

			oApp = new sap.m.App(this.createId("mockapp"));

			var viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc">' + '</mvc:View>';

			oView = sap.ui.xmlview({
				id: this.createId("mockview"),
				viewContent: viewContent
			});

			oApp.addPage(oView);
			return oApp;
		}

	}))("testComponent");

	new ComponentContainer("sap-ui-static", {
		component: oComp
	}).placeAt("test-view");

	var fnFindOverlay = function(oElement, oDesignTime) {
		var aOverlays = oDesignTime.getElementOverlays();
		var bResult = aOverlays.some(function (oOverlay) {
			return oOverlay.getElementInstance() === oElement;
		});
		return bResult;
	};

	var fnSetRta = function (oRta) {
		//setRTA instance for PopupManager
		oRta.oPopupManage.setRta(oRta);
	};

	QUnit.module("Given RTA instance is created without starting", {
		beforeEach : function(assert) {
			FakeLrepLocalStorage.deleteChanges();
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			this.fnOverrideFunctionsSpy = sinon.spy(this.oRta.oPopupManage, "_overrideInstanceFunctions");
		},

		afterEach : function() {
			FakeLrepLocalStorage.deleteChanges();
			this.oRta.exit();
			sandbox.restore();
		}
	});

	QUnit.test("when PopupManager is initialized without setting RTA instance", function(assert) {
		assert.ok(this.oRta.oPopupManage, "PopupManager instance exists");
		assert.strictEqual(this.oRta.oPopupManage.getRta(), undefined, "then RTA instance is not set for PopupManager before RTA is started");
		assert.strictEqual(this.oRta.oPopupManage.oRtaRootAppComponent, undefined, "then RTA root element is not set for PopupManager before RTA is started");
		assert.strictEqual(this.fnOverrideFunctionsSpy.callCount, 0, "then '_overrideInstanceFunctions' not called since rta is not set");
	});

	QUnit.module("Given RTA instance is initialized", {
		beforeEach : function(assert) {

			FakeLrepLocalStorage.deleteChanges();

			//mock RTA instance
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			this.oRta._$document = jQuery(document);
			this.oRta._createToolsMenu(true);
			this.oRta._oToolsMenu.show();

			//mock DesignTime
			this.oRta._oDesignTime = new DesignTime({
				rootElements : [oComp.getAggregation("rootControl")]
			});

			this.oOriginalInstanceManager = jQuery.extend( true, {}, InstanceManager);

			//spy functions

			this.fnOverrideFunctionsSpy = sinon.spy(this.oRta.oPopupManage, "_overrideInstanceFunctions");
			this.fnApplyPopupMethods = sinon.spy(this.oRta.oPopupManage, "_applyPopupMethods");

			this.fnAddPopupInstanceSpy = sinon.spy(this.oRta.oPopupManage, "_overrideAddPopupInstance");
			this.fnOverrideAddFunctionsSpy = sinon.spy(this.oRta.oPopupManage, "_overrideAddFunctions");

			this.fnRemovePopupInstanceSpy = sinon.spy(this.oRta.oPopupManage, "_overrideRemovePopupInstance");
			this.fnOverrideRemoveFunctionsSpy = sinon.spy(this.oRta.oPopupManage, "_overrideRemoveFunctions");

			this.fnCreateDialogSpy = sinon.spy(this.oRta.oPopupManage, "_createPopupOverlays");
			this.fnToolsMenuBringToFrontSpy = sinon.spy(this.oRta._oToolsMenu, "bringToFront");
			this.fnAddRootElementSpy = sinon.spy(this.oRta._oDesignTime, "addRootElement");
			this.fnRemoveRootElementSpy = sinon.spy(this.oRta._oDesignTime, "removeRootElement");
			this.fnDisablePopupSettingsSpy = sinon.spy(this.oRta.oPopupManage, "_disablePopupSettings");

			this.fnBlurHandlingSpy = sinon.spy(this.oRta.oPopupManage, "_blurHandling");

			//mock same app component dialog
			oComp.runAsOwner(function() {
				this.oDialog = new Dialog({
					id: oComp.createId("SmartFormDialog"),
					showHeader: false,
					contentHeight: "800px",
					contentWidth: "1000px"
				});
				this.oPopover = new Popover({
					id: oComp.createId("SmartFormPopover"),
					showHeader: false,
					contentMinWidth: "250px",
					contentWidth: "20%"
				});
				this.oDialog.removeStyleClass("sapUiPopupWithPadding");
				oView.addContent(this.oDialog);
				oView.addContent(this.oPopover);
			}.bind(this));
			this.oNonRtaDialog = new Dialog("nonRtaDialog");
		},

		afterEach : function() {
			if (this.oRta) {
				this.oRta.exit();
			}
			if (this.oDialog) {
				this.oDialog.destroy();
			}
			if (this.oNonRtaDialog) {
				this.oNonRtaDialog.destroy();
			}
			if (this.oPopover) {
				this.oPopover.destroy();
			}
			delete this.oOriginalInstanceManager;
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	//_overrideInstanceFunctions
	QUnit.test("when _overrideInstanceFunctions is called with no open dialog", function(assert) {
		fnSetRta(this.oRta);
		this.oDialog.open();

		assert.strictEqual(this.oRta.oPopupManage.getRta(), this.oRta, "then RTA instance is set");
		assert.strictEqual(this.oRta.oPopupManage.oRtaRootAppComponent, this.oRta.oPopupManage._getAppComponentForControl(oComp.getAggregation("rootControl")), "then component of RTA root element is set for PopupManager");
		assert.strictEqual(this.fnAddPopupInstanceSpy.callCount, 1, "then '_overrideAddPopupInstance' is called once since RTA is set");
		assert.strictEqual(this.fnOverrideFunctionsSpy.callCount, 1, "then '_overrideInstanceFunctions' is called once since RTA is set");
		assert.strictEqual(this.fnRemovePopupInstanceSpy.callCount, 1, "then '_overrideRemovePopupInstance' is called once since RTA is set");
		assert.strictEqual(this.fnCreateDialogSpy.callCount, 0, "then _createPopupOverlays not called");
	});

	QUnit.test("when dialog is already open and then _overrideInstanceFunctions is called", function(assert) {
		this.oDialog.open();

		var done = assert.async();

		this.oDialog.attachAfterOpen(function() {
			fnSetRta(this.oRta);
			assert.strictEqual(this.oRta.oPopupManage.getRta(), this.oRta, "then RTA instance is set");
			assert.strictEqual(this.oRta.oPopupManage.oRtaRootAppComponent, this.oRta.oPopupManage._getAppComponentForControl(oComp.getAggregation("rootControl")), "then component of RTA root element is set for PopupManager");
			assert.strictEqual(this.fnAddPopupInstanceSpy.callCount, 1, "then '_overrideAddPopupInstance' is called once since RTA is set");
			assert.strictEqual(this.fnOverrideFunctionsSpy.callCount, 1, "then '_overrideInstanceFunctions' is called once since RTA is set");
			assert.strictEqual(this.fnRemovePopupInstanceSpy.callCount, 1, "then '_overrideRemovePopupInstance' is called once since RTA is set");
			assert.strictEqual(this.fnCreateDialogSpy.callCount, 1, "then _createPopupOverlays called for the already opened dialog");
			assert.ok(this.fnCreateDialogSpy.calledWith(this.oDialog), "then _createPopupOverlays called for the in-app dialog");
			done();
		}.bind(this));
	});

	//_overrideAddPopupInstance
	QUnit.test("when _overrideAddPopupInstance for dialog is called", function(assert) {
		fnSetRta(this.oRta);

		assert.strictEqual(this.fnOverrideAddFunctionsSpy.callCount, 2, "then _overrideAddFunctions called twice for dialog and popover");
		assert.ok(this.fnOverrideAddFunctionsSpy.calledWith(this.oOriginalInstanceManager.addDialogInstance), "then _overrideAddFunctions called with InstanceManager addPopoverInstance()");
		assert.ok(this.fnOverrideAddFunctionsSpy.calledWith(this.oOriginalInstanceManager.addPopoverInstance), "then _overrideAddFunctions called with InstanceManager addDialogInstance()");
	});

	//_overrideAddFunctions
	QUnit.test("when _overrideAddFunctions for dialog is called", function(assert) {
		assert.expect(9);
		var done = assert.async(2);

		fnSetRta(this.oRta);

		this.oDialog.open();

		this.oDialog.attachAfterOpen(function() {

			this.oNonRtaDialog.attachAfterOpen(function() {
				assert.notEqual(InstanceManager.addDialogInstance, this.oOriginalInstanceManager.addDialogInstance, "InstanceManager.addDialogInstance overridden");
				assert.notEqual(InstanceManager.addPopoverInstance, this.oOriginalInstanceManager.addPopoverInstance, "InstanceManager.addPopoverInstance overridden");
				assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[0], "function", "then function is returned on the first call");
				assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[1], "function", "then function is returned on the second call");

				//when dialog is opened, PopupManager.open() triggers bringToFront
				assert.notStrictEqual(this.fnToolsMenuBringToFrontSpy.callCount, 0, "then 'bringToFront' is called at least once");
				assert.strictEqual(this.fnCreateDialogSpy.callCount, 1, "then _createPopupOverlays called once for the relevant dialog");
				assert.ok(this.fnCreateDialogSpy.calledOn(this.oRta.oPopupManage), "then _createPopupOverlays called with the context of PopupManager");

				//check z-index
				assert.ok(this.oDialog.oPopup.oContent.$().zIndex() < this.oRta._oToolsMenu.$().zIndex(), "then Toolbar is on top of the app component dialog");
				assert.ok(this.oNonRtaDialog.oPopup.oContent.$().zIndex() > this.oRta._oToolsMenu.$().zIndex(), "then Toolbar is not placed on top of the non-RTA dialog");
				done();
			}.bind(this));

			this.oNonRtaDialog.open();

		}.bind(this));
	});

	//_overrideRemovePopupInstance
	QUnit.test("when _overrideRemovePopupInstance for dialog is called", function(assert) {
		fnSetRta(this.oRta);

		assert.strictEqual(this.fnOverrideRemoveFunctionsSpy.callCount, 2, "then _overrideRemoveFunctions called twice for dialog and popover");
		assert.ok(this.fnOverrideRemoveFunctionsSpy.calledWith(this.oOriginalInstanceManager.removeDialogInstance), "then _overrideRemoveFunctions called with InstanceManager addPopoverInstance()");
		assert.ok(this.fnOverrideRemoveFunctionsSpy.calledWith(this.oOriginalInstanceManager.removePopoverInstance), "then _overrideRemoveFunctions called with InstanceManager addDialogInstance()");
	});

	//_overrideRemovePopupInstance
	QUnit.test("when _overrideRemovePopupInstance for dialog is called and dialog is closed", function(assert) {
		var done = assert.async();
		fnSetRta(this.oRta);
		this.oDialog.open();
		assert.notEqual(InstanceManager.removeDialogInstance, this.oOriginalInstanceManager.removeDialogInstance, "InstanceManager.removeDialogInstance overridden");
		assert.notEqual(InstanceManager.removePopoverInstance, this.oOriginalInstanceManager.removePopoverInstance, "InstanceManager.removePopoverInstance overridden");
		assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[0], "function", "then function is returned on the first call");
		assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[1], "function", "then function is returned on the second call");

		this.oDialog.attachAfterClose(function() {
			assert.strictEqual(this.fnRemoveRootElementSpy.callCount, 1, "then 'removeRootElement' is called once since RTA is set");
			assert.ok(this.fnRemoveRootElementSpy.calledWith(this.oDialog), "then 'removeRootElement' called with the same app component dialog");
			assert.strictEqual(this.oRta._oDesignTime.getRootElements().indexOf(this.oDialog.getId()), -1, "then the opened dialog was removed from root elements");
			done();
		}.bind(this));

		this.oDialog.close();
	});

	//_createPopupOverlays
	QUnit.test("when _createPopupOverlays for dialog is called", function(assert) {
		fnSetRta(this.oRta);
		var done = assert.async();
		this.oDialog.open();
		this.oDialog.attachAfterOpen(function() {
			this.oNonRtaDialog.attachAfterOpen(function() {
				assert.strictEqual(this.fnAddRootElementSpy.callCount, 1, "then 'addRootElement' is called once since RTA is set");
				assert.ok(this.fnAddRootElementSpy.calledWith(this.oDialog), "then 'addRootElement' called with the same app component dialog");
				assert.strictEqual(this.oRta._oDesignTime.getRootElements()[1], this.oDialog.getId(), "then the opened dialog was added as the second root element");
				assert.strictEqual(this.oRta._oDesignTime.getRootElements().length, 2, "then main app element and same app component dialog present, but external dialogs not included");
				//FIXME: Not running in IE
				//assert.strictEqual(this.oDialog.oPopup.oLastBlurredElement.getMetadata().getName(), "sap.ui.core.Control", "then blur event is removed for the dialog popup");
				done();
			}.bind(this));
			this.oNonRtaDialog.open();
		}.bind(this));
	});

	//_restoreInstanceFunctions
	QUnit.test("when _restoreInstanceFunctions is called", function(assert) {
		fnSetRta(this.oRta);
		this.oRta.oPopupManage._restoreInstanceFunctions();
		assert.strictEqual(this.oOriginalInstanceManager.addDialogInstance, InstanceManager.addDialogInstance, "then addDialogInstance function is restored in original state");
		assert.strictEqual(this.oOriginalInstanceManager.removeDialogInstance, InstanceManager.removeDialogInstance, "then removeDialogInstance function is restored in original state");
		assert.strictEqual(this.fnApplyPopupMethods.callCount, 2, "then _applyPopupMethods called second time");
		assert.ok(this.fnApplyPopupMethods.calledWith(this.oRta.oPopupManage._disablePopupSettings), "then _applyPopupMethods called with _disablePopupSetting function as parameter ");
	});

	//_disablePopupSettings
	QUnit.test("when _disablePopupSettings is called", function(assert) {
		//Prepare for Popover
		var done = assert.async();
		this.oPopover.openBy(oComp.byId("mockview"));
		this.oPopover.attachAfterOpen(function() {
			//FIXME: If browser doesn't have focus blur event fails
			var oPopup = this.oPopover.oPopup;
			var vPopupElement = oPopup.oContent.getDomRef();

			this.oRta.oPopupManage.fnPopupOriginalAfterRendering = oPopup.onAfterRendering;
			this.oDialog.oPopup.onAfterRendering = null;

			vPopupElement.addEventListener("blur", this.oRta.oPopupManage.fnBlurHandling, true);
			oPopup._bOriginalAutoClose = true;
			oPopup.setAutoClose(false);

			vPopupElement.addEventListener("blur", function() {
				assert.strictEqual(typeof this.oPopover.oPopup.onAfterRendering, "function", "then onAfterRendering is set back");
				assert.strictEqual(this.oPopover.oPopup.getAutoClose(), true, "then original autoClose value is set");
				assert.strictEqual(this.fnBlurHandlingSpy.callCount, 0, "custom blur handling for popover removed");
				done();
			}.bind(this), true);
			this.oRta.oPopupManage._disablePopupSettings(this.oPopover);
			assert.strictEqual(this.oPopover.oPopup.oLastBlurredElement, undefined, "then blur event is restored for the dialog popup");
			jQuery.sap.focus(oPopup.oContent);
			jQuery.sap.delayedCall(0, this, function() {
				vPopupElement.blur();
			});
		}.bind(this));
	});

	//getRelevantPopups
	QUnit.test("when getRelevantPopups is called", function(assert) {
		fnSetRta(this.oRta);
		var done = assert.async();
		//Dialog
		this.oDialog.attachAfterOpen(function() {
			//Non-RTA Dialog
			this.oNonRtaDialog.attachAfterOpen(function() {
				//Popover
				this.oPopover.attachAfterOpen(function() {

					assert.strictEqual(this.oRta.oPopupManage.getRelevantPopups()["aDialogs"].length, 1, "then one relevant dialog returned");
					assert.deepEqual(this.oRta.oPopupManage.getRelevantPopups()["aDialogs"][0], this.oDialog, "then only dialog with same app component returned");

					assert.strictEqual(this.oRta.oPopupManage.getRelevantPopups()["aPopovers"].length, 1, "then one relevant popover returned");
					assert.deepEqual(this.oRta.oPopupManage.getRelevantPopups()["aPopovers"][0], this.oPopover, "then only popover with same app component returned");
					//Dialog Close
					this.oDialog.attachAfterClose(function () {
						assert.notOk(this.oRta.oPopupManage.getRelevantPopups()["aDialogs"], "then no relevant dialogs available");
						done();
					}.bind(this));
					this.oDialog.close();

				}.bind(this));
				this.oPopover.openBy(oComp.byId("mockview"));

			}.bind(this));
			this.oNonRtaDialog.open();

		}.bind(this));
		this.oDialog.open();

	});

	QUnit.test("when getRelevantPopups is called with MessageToast opened", function(assert) {
		//not a valid popover but using InstanceManager.AddPopoverInstance
		fnSetRta(this.oRta);
		MessageToast.show("Test Message");
		assert.ok(InstanceManager.getOpenPopovers()[0] instanceof Popup, "then message toast returned");
		assert.notOk(this.oRta.oPopupManage.getRelevantPopups()["aPopovers"], "then no valid popover returned");
	});

	//modifyBrowserEvents
	QUnit.test("when modifyBrowserEvents is called", function(assert) {
		var done = assert.async();
		sinon.stub(this.oRta.oPopupManage, "getRta").returns(this.oRta);
		sinon.stub(this.oRta, "getMode").returns("adaptation");
		var fnDefaultOnAfterRendering = this.oPopover.oPopup.onAfterRendering;
		var oPopup = this.oPopover.oPopup;
		this.oPopover.attachAfterOpen(function() {
			//FIXME: If browser doesn't have focus blur event fails
			var vPopupElement = oPopup.oContent.getDomRef();
			this.oRta.oPopupManage.modifyBrowserEvents(this.oPopover);
			assert.notEqual(oPopup.onAfterRendering, fnDefaultOnAfterRendering, "then onAfterRendering was overwritten");
			assert.notOk(oPopup._bOriginalAutoClose, "then original AutoClose value stored");
			vPopupElement.addEventListener("blur", function() {
				assert.strictEqual(this.fnBlurHandlingSpy.callCount, 1, "then custom blur handling for popover called");
				done();
			}.bind(this), true);
			jQuery.sap.focus(oPopup.oContent);
			jQuery.sap.delayedCall(0, this, function() {
				vPopupElement.blur();
			});
		}.bind(this));
		oPopup.setAutoClose(false);
		this.oPopover.openBy(oComp.byId("mockview"));
	});

	//_blurHandling
	QUnit.test("when _blurHandling is called for popover", function(assert) {

		fnSetRta(this.oRta);
		sinon.stub(this.oRta, "getMode").returns("navigation");
		var doneToolbar = assert.async();
		var donePopover = assert.async();
		var fnPopoverClose = function(oFocusElement, done) {
			this.oPopover.oPopup.setAutoClose(true);
			//clicked from toolbar element
			jQuery.sap.focus(oFocusElement.getDomRef());
			this.oRta.oPopupManage._blurHandling.call(this.oPopover, this.oRta);
			jQuery.sap.delayedCall(0, this, function() {
				assert.notOk(this.oPopover.oPopup.getAutoClose(), "then AutoClose value is set to false");
				assert.ok(this.oPopover.isOpen(), "then popover was not closed");
				done();
				//clicked from popover
				if (oFocusElement != this.oPopover) {
					fnPopoverClose.call(this, this.oPopover, donePopover);
				}
			}.bind(this));
		};
		//clicked from toolbar
		this.oPopover.attachAfterOpen(fnPopoverClose.bind(this, this.oRta._oToolsMenu.getContent()[8], doneToolbar));
		this.oPopover.oPopup.setAutoClose(false);
		this.oPopover.openBy(oComp.byId("mockview"));

	});

	//_getAppComponentForControl - runAsOwner
	QUnit.test("when _getAppComponentForControl is called with a dialog created inside Component.runAsOwner", function(assert) {
		var oAppComponentForDialog = this.oRta.oPopupManage._getAppComponentForControl(this.oDialog);
		assert.strictEqual(oAppComponentForDialog, oComp, "then main component returned");
	});

	//_getAppComponentForControl - view as parent
	QUnit.test("when _getAppComponentForControl is called with a dialog with view as parent", function(assert) {
		oComp.byId("mockview").addDependent(this.oNonRtaDialog);
		var oAppComponentForNonRtaDialog = this.oRta.oPopupManage._getAppComponentForControl(this.oNonRtaDialog);
		assert.strictEqual(oAppComponentForNonRtaDialog, oComp, "then view's component returned");
	});

	//_getAppComponentForControl - UIArea as parent
	QUnit.test("when _getAppComponentForControl is called with a dialog with UIArea as parent", function(assert) {
		this.oNonRtaDialog.open();
		var done = assert.async();

		this.oNonRtaDialog.attachAfterOpen(function() {
			var oAppComponentForNonRtaDialog = this.oRta.oPopupManage._getAppComponentForControl(this.oNonRtaDialog);
			assert.ok(this.oNonRtaDialog.getParent() instanceof sap.ui.core.UIArea, "then UIArea returned as parent");
			assert.strictEqual(oAppComponentForNonRtaDialog, undefined, "then no component returned");
			done();
		}.bind(this));
	});

	//_getValidatedPopups
	QUnit.test("when _getValidatedPopups is called with 2 relevant and one non-relevant popups", function(assert) {
		var aPopups = [this.oDialog, this.oNonRtaDialog, this.oPopover];
		this.oRta.oPopupManage.oRtaRootAppComponent = oComp;
		var aRelevantPopups = this.oRta.oPopupManage._getValidatedPopups(aPopups);

		assert.strictEqual(aRelevantPopups.length, 2, "then relevant dialog and popover with same component are returned");
		assert.deepEqual(aRelevantPopups[0], this.oDialog, "then dialog returned");
		assert.deepEqual(aRelevantPopups[1], this.oPopover, "then popover returned");
	});

	//integration tests
	//when RTA is started and then dialogs are opened
	QUnit.module("Given RTA is started with an app containing dialog(s)", {
		beforeEach : function(assert) {

			FakeLrepLocalStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});

			this.oNonRtaDialog = new Dialog("nonRtaDialog");

			var fnSpies = function() {
				this.fnAddDialogInstanceSpy = sinon.spy(this.oRta.oPopupManage, "_overrideAddPopupInstance");
				this.fnCreateDialogSpy = sinon.spy(this.oRta.oPopupManage, "_createPopupOverlays");
				this.fnRemoveDialogInstanceSpy = sinon.spy(this.oRta._oDesignTime, "removeRootElement");

			}.bind(this);

			this.oDialog = new Dialog("testDialog");
			this.oDialog.addContent(new Form("formindialog"));

			oView.addDependent(this.oDialog);

			this.oButton = new Button("testbutton", {
				text: "Main Button",
				press: function() {
					this.oDialog.open();
				}.bind(this)
			});

			return Promise.all([
				new Promise(function (fnResolve) {
					this.oRta.attachStart(fnResolve);
				}.bind(this)),
				this.oRta.start()
			]).then(fnSpies.bind(this));
		},

		afterEach : function() {
			this.oRta.exit();
			FakeLrepLocalStorage.deleteChanges();
			if (this.oDialog) {
				this.oDialog.destroy();
			}
			if (this.oButton) {
				this.oButton.destroy();
			}
			this.oNonRtaDialog.destroy();

			sandbox.restore();
		}
	});

	QUnit.test("when Dialog with the same app component is opened and then closed / destroyed", function(assert) {
		//to open the dialog
		this.oButton.firePress();

		var fnOpenDone = assert.async();

		this.oDialog.attachAfterOpen(function() {
			assert.strictEqual(this.fnCreateDialogSpy.callCount, 1, "then '_createPopupOverlays' called once");
			assert.notEqual(this.oRta._oDesignTime.getRootElements().indexOf(this.oDialog.getId()), -1, "then the opened dialog was added as a root element");
			assert.ok(this.fnCreateDialogSpy.calledOn(this.oRta.oPopupManage), "then '_createPopupOverlays' with the opened dialog");
			this.oRta._oDesignTime.attachEventOnce("synced", function() {
				assert.ok(fnFindOverlay(this.oDialog, this.oRta._oDesignTime), "then overlay exists for root dialog element");
				assert.ok(fnFindOverlay(sap.ui.getCore().byId("formindialog"), this.oRta._oDesignTime), "then overlay exists for root dialog element");
				fnOpenDone();
			}.bind(this));
			this.oDialog.close();
			var fnCloseDone = assert.async();
			this.oDialog.attachAfterClose(function() {
				assert.notEqual(this.fnRemoveDialogInstanceSpy.callCount, 0, "then removeRootElement from DesignTime called at least once");
				assert.ok(this.fnRemoveDialogInstanceSpy.calledWith(this.oDialog), "then 'removeRootElement from DesignTime is called with the opened dialog");
				assert.strictEqual(this.oRta._oDesignTime.getRootElements().indexOf(this.oDialog.getId()), -1, "then the opened dialog is not present in the list of root elements");
				fnCloseDone();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("when dialog with the same app component is opened and then RTA is stopped", function(assert) {
		//to open the dialog
		this.oButton.firePress();

		var fnOpenDone = assert.async();

		this.oDialog.attachAfterOpen(function() {
			this.oRta.stop().then(function() {
				assert.notOk(this.oRta._oDesignTime, "then DesignTime for the current RTA instance was destroyed");
				fnOpenDone();
				this.oDialog.close();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("when dialog with different app component is opened", function(assert) {
		this.oRta._oDesignTime.attachEventOnce("synced", function() {
			assert.notOk(fnFindOverlay(this.oNonRtaDialog, this.oRta._oDesignTime), "then overlay does not exist for root dialog element");
			done();
		}.bind(this));

		this.oNonRtaDialog.open();

		var done = assert.async();

		this.oNonRtaDialog.attachAfterOpen(function() {
			assert.strictEqual(this.fnCreateDialogSpy.callCount, 0, "then '_createPopupOverlays' is never called");
			assert.ok(this.fnCreateDialogSpy.neverCalledWith(this.oNonRtaDialog), "then '_createPopupOverlays' is not called");
			this.oRta._oDesignTime.fireSynced();
		}.bind(this));
	});

	//Dialog open -> RTA started
	QUnit.module("Given that a dialog is open and then RTA is started", {
		beforeEach : function(assert) {

			FakeLrepLocalStorage.deleteChanges();

			this.oDialog = new Dialog("testDialog");
			oView.addDependent(this.oDialog);

			this.oButton = new Button("testbutton", {
				text: "Main Button",
				press: function() {
					this.oDialog.open();
				}.bind(this)
			});

			//to open the dialog
			this.oButton.firePress();

			var fnOpenDone = assert.async();

			this.oDialog.attachAfterOpen(function() {
				fnOpenDone();
			});
		},

		afterEach : function() {
			FakeLrepLocalStorage.deleteChanges();
			if (this.oDialog) {
				this.oDialog.destroy();
			}
			if (this.oButton) {
				this.oButton.destroy();
			}
			sandbox.restore();
		}
	});

	QUnit.test("when dialog with same app component is already open", function(assert) {

		var oRta = new RuntimeAuthoring({
			rootControl : oComp.getAggregation("rootControl")
		});

		var fnAfterRTA = function() {
			assert.notEqual(oRta._oDesignTime.getRootElements().indexOf(this.oDialog.getId()), -1, "then the opened dialog was added as a root element");
			assert.ok(fnFindOverlay(this.oDialog, oRta._oDesignTime), "then overlay exists for root dialog element");
			oRta.exit();
		}.bind(this);

		return Promise.all([
			new Promise(function (fnResolve) {
				oRta.attachStart(fnResolve);
			}),
			oRta.start()
		]).then(fnAfterRTA.bind(this));
	});

	//_getComponentInsidePopup
	QUnit.module("Given RTA is started with an app containing dialog(s)", {
		beforeEach: function (assert) {
			var oCompContInDialog = new sap.ui.core.ComponentContainer("CompCont2", {
				component : oComp
			});

			var oCompInDialog = oCompContInDialog.getComponentInstance();

			this.oDialog = new Dialog("appinside");
			this.oDialog.addContent(oCompContInDialog);

			//mock RTA instance
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompInDialog.getAggregation("rootControl")
			});
			this.oRta._$document = jQuery(document);
			this.oRta._createToolsMenu(true);
			this.oRta._oToolsMenu.show();

			//mock DesignTime
			this.oRta._oDesignTime = new DesignTime({
				rootElements : [oCompInDialog.getAggregation("rootControl")]
			});
			this.oRta.oPopupManage.oRtaRootAppComponent = oCompInDialog;
			this.oDialog.open();
			var done = assert.async();

			this.oDialog.attachAfterOpen(function() {
				done();
			});
		},
		afterEach: function(assert) {
			FakeLrepLocalStorage.deleteChanges();
			if (this.oRta) {
				this.oRta.exit();
			}
			if (this.oDialog) {
				this.oDialog.destroy();
			}
			delete this.oOriginalInstanceManager;
			sandbox.restore();
		}
	});

	QUnit.test("when _getComponentInsidePopup is called with an app component container inside dialog", function(assert) {
		var bIsAppInsidePopup = this.oRta.oPopupManage._getComponentInsidePopup(this.oDialog);
		assert.ok(bIsAppInsidePopup, "then a component container is discovered inside popup");
	});

	QUnit.done(function( details ) {
		// If coverage is requested, remove the view to not overlap the coverage result
		if (QUnit.config.coverage == true && details.failed === 0) {
			jQuery("#test-view").hide();
		}
	});
});
