/* global QUnit */

QUnit.config.autostart = false;
sap.ui.require([
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
	"sap/ui/layout/form/Form",
	"sap/ui/base/Event",
	"sap/ui/dt/Overlay",
	// should be last
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-ie",
	"sap/ui/thirdparty/sinon-qunit"
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
	Form,
	Event,
	Overlay,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox;
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
		oRta.oPopupManager.setRta(oRta);
	};
	QUnit.module("Given RTA instance is created without starting", {
		beforeEach : function(assert) {
			sandbox = sinon.sandbox.create();
			FakeLrepLocalStorage.deleteChanges();
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			this.fnOverrideFunctionsSpy = sandbox.spy(this.oRta.oPopupManager, "_overrideInstanceFunctions");
		},
		afterEach : function() {
			FakeLrepLocalStorage.deleteChanges();
			this.oRta.exit();
			sandbox.restore();
		}
	});
	QUnit.test("when PopupManager is initialized without setting RTA instance", function(assert) {
		assert.ok(this.oRta.oPopupManager, "PopupManager instance exists");
		assert.strictEqual(this.oRta.oPopupManager.getRta(), undefined, "then RTA instance is not set for PopupManager before RTA is started");
		assert.strictEqual(this.oRta.oPopupManager.oRtaRootAppComponent, undefined, "then RTA root element is not set for PopupManager before RTA is started");
		assert.strictEqual(this.fnOverrideFunctionsSpy.callCount, 0, "then '_overrideInstanceFunctions' not called since rta is not set");
	});
	//_getFocusEventName
	QUnit.test("when _getValidatedPopups is called with 2 relevant and one non-relevant popups", function(assert) {
		assert.strictEqual(this.oRta.oPopupManager._getFocusEventName("add"), "_addFocusEventListeners", "then 'add' as parameter returns _addFocusEventListeners");
		assert.strictEqual(this.oRta.oPopupManager._getFocusEventName("remove"), "_removeFocusEventListeners", "then 'remove' as parameter returns _removeFocusEventListeners");
	});
	QUnit.module("Given RTA instance is initialized", {
		beforeEach : function(assert) {
			sandbox = sinon.sandbox.create();
			FakeLrepLocalStorage.deleteChanges();
			//mock RTA instance
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			this.oRta._$document = jQuery(document);
			sap.ui.getCore().applyChanges();
			this.oRta._createToolsMenu(true);
			this.oRta._oToolsMenu.show();
			//mock DesignTime
			this.oRta._oDesignTime = new DesignTime({
				rootElements : [oComp.getAggregation("rootControl")]
			});
			this.oOriginalInstanceManager = jQuery.extend( true, {}, InstanceManager);
			//spy functions
			this.fnOverrideFunctionsSpy = sandbox.spy(this.oRta.oPopupManager, "_overrideInstanceFunctions");
			this.fnApplyPopupMethods = sandbox.spy(this.oRta.oPopupManager, "_applyPopupMethods");
			this.fnAddPopupInstanceSpy = sandbox.spy(this.oRta.oPopupManager, "_overrideAddPopupInstance");
			this.fnOverrideAddFunctionsSpy = sandbox.spy(this.oRta.oPopupManager, "_overrideAddFunctions");
			this.fnRemovePopupInstanceSpy = sandbox.spy(this.oRta.oPopupManager, "_overrideRemovePopupInstance");
			this.fnOverrideRemoveFunctionsSpy = sandbox.spy(this.oRta.oPopupManager, "_overrideRemoveFunctions");
			this.fnCreateDialogSpy = sandbox.spy(this.oRta.oPopupManager, "_createPopupOverlays");
			this.fnToolsMenuBringToFrontSpy = sandbox.spy(this.oRta._oToolsMenu, "bringToFront");
			this.fnAddRootElementSpy = sandbox.spy(this.oRta._oDesignTime, "addRootElement");
			this.fnRemoveRootElementSpy = sandbox.spy(this.oRta._oDesignTime, "removeRootElement");
			this.fnAddPopupListeners = sandbox.spy(Popup.prototype, "_addFocusEventListeners");
			this.fnRemovePopupListeners = sandbox.spy(Popup.prototype, "_removeFocusEventListeners");
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
		assert.strictEqual(this.oRta.oPopupManager.getRta(), this.oRta, "then RTA instance is set");
		assert.strictEqual(this.oRta.oPopupManager.oRtaRootAppComponent, this.oRta.oPopupManager._getAppComponentForControl(oComp.getAggregation("rootControl")), "then component of RTA root element is set for PopupManager");
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
			assert.strictEqual(this.oRta.oPopupManager.getRta(), this.oRta, "then RTA instance is set");
			assert.strictEqual(this.oRta.oPopupManager.oRtaRootAppComponent, this.oRta.oPopupManager._getAppComponentForControl(oComp.getAggregation("rootControl")), "then component of RTA root element is set for PopupManager");
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
		var done = assert.async();
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
				assert.ok(this.fnCreateDialogSpy.calledOn(this.oRta.oPopupManager), "then _createPopupOverlays called with the context of PopupManager");
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
				done();
			}.bind(this));
			this.oNonRtaDialog.open();
		}.bind(this));
	});
	//_restoreInstanceFunctions
	QUnit.test("when _restoreInstanceFunctions is called", function(assert) {
		fnSetRta(this.oRta);
		this.oRta.oPopupManager._restoreInstanceFunctions();
		assert.strictEqual(this.oOriginalInstanceManager.addDialogInstance, InstanceManager.addDialogInstance, "then addDialogInstance function is restored in original state");
		assert.strictEqual(this.oOriginalInstanceManager.removeDialogInstance, InstanceManager.removeDialogInstance, "then removeDialogInstance function is restored in original state");
		assert.strictEqual(this.fnApplyPopupMethods.callCount, 2, "then _applyPopupMethods called second time");
		assert.ok(this.fnApplyPopupMethods.calledWith(this.oRta.oPopupManager._removePopupPatch), "then _applyPopupMethods called with _removePopupPatch function as parameter with the correct context");
	});
	//_removePopupPatch
	QUnit.test("when _removePopupPatch is called", function(assert) {
		//Prepare for Popover
		var done = assert.async();
		this.oPopover.attachAfterOpen(function() {
			var oPopup = this.oPopover.oPopup;
			var vPopupElement = oPopup._$().get(0);
			this.oRta.oPopupManager.fnOriginalPopupOnAfterRendering = oPopup.onAfterRendering;
			this.oPopover.oPopup.onAfterRendering = null;
			vPopupElement.addEventListener("blur", function() {
				assert.strictEqual(typeof this.oPopover.oPopup.onAfterRendering, "function", "then onAfterRendering is set back");
				done();
			}.bind(this), true);
			this.oRta.oPopupManager._removePopupPatch(this.oPopover);
			assert.strictEqual(this.fnAddPopupListeners.callCount, 2, "then popup event listeners attached back, called twice, once while open() and once while re-attaching");
			jQuery.sap.focus(oPopup.oContent);
			jQuery.sap.delayedCall(0, this, function() {
				vPopupElement.blur();
			});
		}.bind(this));
		this.oPopover.openBy(oComp.byId("mockview"));
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
					assert.strictEqual(this.oRta.oPopupManager.getRelevantPopups()["aDialogs"].length, 1, "then one relevant dialog returned");
					assert.deepEqual(this.oRta.oPopupManager.getRelevantPopups()["aDialogs"][0], this.oDialog, "then only dialog with same app component returned");
					assert.strictEqual(this.oRta.oPopupManager.getRelevantPopups()["aPopovers"].length, 1, "then one relevant popover returned");
					assert.deepEqual(this.oRta.oPopupManager.getRelevantPopups()["aPopovers"][0], this.oPopover, "then only popover with same app component returned");
					//Dialog Close
					this.oDialog.attachAfterClose(function () {
						assert.notOk(this.oRta.oPopupManager.getRelevantPopups()["aDialogs"], "then no relevant dialogs available");
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
		assert.notOk(this.oRta.oPopupManager.getRelevantPopups()["aPopovers"], "then no valid popover returned");
	});
	//_applyPopupPatch
	QUnit.test("when _applyPopupPatch is called", function(assert) {
		var done = assert.async();
		var oPopoverOverlay = fnFindOverlay(this.oPopover, this.oRta._oDesignTime);
		var oOverlayContainer = Overlay.getOverlayContainer(oPopoverOverlay);
		sandbox.stub(this.oRta.oPopupManager, "getRta").returns(this.oRta);
		sandbox.stub(this.oRta, "getMode").returns("adaptation");
		var fnDefaultOnAfterRendering = this.oPopover.oPopup.onAfterRendering;
		var oPopup = this.oPopover.oPopup;
		this.oPopover.attachAfterOpen(function() {
			this.oRta.oPopupManager._applyPopupPatch(this.oPopover);
			assert.strictEqual(this.fnRemovePopupListeners.callCount, 1, "then popup event listeners removed");
			assert.strictEqual(oPopup._aAutoCloseAreas[0].id, this.oRta._oToolsMenu.getId(), "Toolbar added as an autoClose area");
			assert.strictEqual(oPopup._aAutoCloseAreas[1].id, this.oPopover.getId(), "Popover added as an autoClose area");
			assert.strictEqual(oPopup._aAutoCloseAreas[2].id, oOverlayContainer.id, "OverlayContainer added as an autoClose area");
			assert.notEqual(oPopup.onAfterRendering, fnDefaultOnAfterRendering, "then onAfterRendering was overwritten");
			done();
		}.bind(this));
		this.oPopover.openBy(oComp.byId("mockview"));
	});
	//_getAppComponentForControl - runAsOwner
	QUnit.test("when _getAppComponentForControl is called with a dialog created inside Component.runAsOwner", function(assert) {
		var oAppComponentForDialog = this.oRta.oPopupManager._getAppComponentForControl(this.oDialog);
		assert.strictEqual(oAppComponentForDialog, oComp, "then main component returned");
	});
	//_getAppComponentForControl - view as parent
	QUnit.test("when _getAppComponentForControl is called with a dialog with view as parent", function(assert) {
		oComp.byId("mockview").addDependent(this.oNonRtaDialog);
		var oAppComponentForNonRtaDialog = this.oRta.oPopupManager._getAppComponentForControl(this.oNonRtaDialog);
		assert.strictEqual(oAppComponentForNonRtaDialog, oComp, "then view's component returned");
	});
	//_getAppComponentForControl - UIArea as parent
	QUnit.test("when _getAppComponentForControl is called with a dialog with UIArea as parent", function(assert) {
		this.oNonRtaDialog.open();
		var done = assert.async();
		this.oNonRtaDialog.attachAfterOpen(function() {
			var oAppComponentForNonRtaDialog = this.oRta.oPopupManager._getAppComponentForControl(this.oNonRtaDialog);
			assert.ok(this.oNonRtaDialog.getParent() instanceof sap.ui.core.UIArea, "then UIArea returned as parent");
			assert.strictEqual(oAppComponentForNonRtaDialog, undefined, "then no component returned");
			done();
		}.bind(this));
	});
	//_getValidatedPopups
	QUnit.test("when _getValidatedPopups is called with 2 relevant and one non-relevant popups", function(assert) {
		var aPopups = [this.oDialog, this.oNonRtaDialog, this.oPopover];
		this.oRta.oPopupManager.oRtaRootAppComponent = oComp;
		var aRelevantPopups = this.oRta.oPopupManager._getValidatedPopups(aPopups);
		assert.strictEqual(aRelevantPopups.length, 2, "then relevant dialog and popover with same component are returned");
		assert.deepEqual(aRelevantPopups[0], this.oDialog, "then dialog returned");
		assert.deepEqual(aRelevantPopups[1], this.oPopover, "then popover returned");
	});
	//_onModeChange
	QUnit.test("when _onModeChange is called with after RTA mode is set to 'navigation'", function(assert) {
		var done = assert.async();
		sandbox.stub(this.oRta.oPopupManager, "getRta").returns(this.oRta);
		var oEvent = new Event("testevent", this.oRta, { mode: "navigation" });
		this.oRta.oPopupManager._onModeChange(oEvent);
		this.oDialog.attachAfterOpen(function () {
			assert.strictEqual(this.fnApplyPopupMethods.callCount, 1, "then applyPopupMethods method called twice");
			assert.strictEqual(this.fnAddPopupListeners.callCount, 1, "then applyPopupMethods method called twice");
			done();
		}.bind(this));
		this.oDialog.open();
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
				this.fnAddDialogInstanceSpy = sinon.spy(this.oRta.oPopupManager, "_overrideAddPopupInstance");
				this.fnCreateDialogSpy = sinon.spy(this.oRta.oPopupManager, "_createPopupOverlays");
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
			assert.ok(this.fnCreateDialogSpy.calledOn(this.oRta.oPopupManager), "then '_createPopupOverlays' with the opened dialog");
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
	//_isComponentInsidePopup
	QUnit.module("Given RTA is started with an app containing dialog(s)", {
		beforeEach: function (assert) {
			sandbox = sinon.sandbox.create();
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
			this.oDialog.open();
			var done = assert.async();
			this.oDialog.attachAfterOpen(function() {
				//to skip the call from Popup.onBeforeRendering()
				this.fnRemovePopupListeners = sandbox.spy(Popup.prototype, "_removeFocusEventListeners");
				done();
			}.bind(this));
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
	QUnit.test("when _isComponentInsidePopup is called with an app component container inside dialog", function(assert) {
		fnSetRta(this.oRta);
		var bIsAppInsidePopup = this.oRta.oPopupManager._isComponentInsidePopup(this.oDialog);
		assert.ok(bIsAppInsidePopup, "then a component container is discovered inside popup");
		assert.strictEqual(this.fnRemovePopupListeners.callCount, 1, "then popup event listeners removed - first call from PopupManager");
		this.oDialog.oPopup.onAfterRendering();
		assert.strictEqual(this.fnRemovePopupListeners.callCount, 2, "then popup event listeners removed - second call from overridden Popup.onAfterRendering()");
	});
	QUnit.done(function( details ) {
		// If coverage is requested, remove the view to not overlap the coverage result
		if (QUnit.config.coverage == true && details.failed === 0) {
			jQuery("#test-view").hide();
		}
	});
});