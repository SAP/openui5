/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/RuntimeAuthoring",
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
	"sap/ui/core/Component",
	"sap/ui/core/UIArea",
	"sap/base/util/merge",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/sinon-4"
],
function(
	DesignTime,
	RuntimeAuthoring,
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
	Component,
	UIArea,
	merge,
	PersistenceWriteAPI,
	ZIndexManager,
	XMLView,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oView;
	sinon.stub(PersistenceWriteAPI, "save");
	var MockComponent = UIComponent.extend("MockController", {
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
			var viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc">' + '</mvc:View>';
			oView = new XMLView(this.createId("mockview"), {
				viewContent: viewContent
			});
			return oView;
		}
	});
	var oComp = new MockComponent("testComponent");
	var oComponentContainer = new ComponentContainer("sap-ui-static", {
		component: oComp
	});
	oComponentContainer.placeAt("qunit-fixture");
	sap.ui.getCore().applyChanges();

	var fnFindOverlay = function(oElement, oDesignTime) {
		var aOverlays = oDesignTime.getElementOverlays();
		var bResult = aOverlays.some(function (oOverlay) {
			return oOverlay.getElement() === oElement;
		});
		return bResult;
	};
	var fnSetRta = function (oRta) {
		//setRTA instance for PopupManager
		oRta.getPopupManager().setRta(oRta);
	};

	QUnit.module("Given PopupManager exists", {
		beforeEach : function() {
			this.fnAddPopupFilterStub = sandbox.stub(ZIndexManager, "addPopupFilter");
		},
		afterEach : function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when RTA is initialized", function(assert) {
			assert.expect(3);
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			assert.ok(this.fnAddPopupFilterStub.calledTwice, "then 2 popup filters were added to the ZIndexManager");
			this.oRta.getPopupManager()._aPopupFilters.forEach(function(fnFilter) {
				assert.ok(this.fnAddPopupFilterStub.calledWith(fnFilter), "then ZIndexManager was called with the correct filter function");
			}.bind(this));
		});
	});

	QUnit.module("Given RTA instance is created without starting", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			this.fnOverrideFunctionsSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideInstanceFunctions");
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when PopupManager is initialized without setting RTA instance", function(assert) {
			assert.ok(this.oRta.getPopupManager(), "PopupManager instance exists");
			assert.strictEqual(this.oRta.getPopupManager().getRta(), undefined, "then RTA instance is not set for PopupManager before RTA is started");
			assert.strictEqual(this.oRta.getPopupManager().oRtaRootAppComponent, undefined, "then RTA root element is not set for PopupManager before RTA is started");
			assert.strictEqual(this.fnOverrideFunctionsSpy.callCount, 0, "then '_overrideInstanceFunctions' not called since rta is not set");
		});
		//_getFocusEventName
		QUnit.test("when _getValidatedPopups is called with 2 relevant and one non-relevant popups", function(assert) {
			assert.strictEqual(this.oRta.getPopupManager()._getFocusEventName("add"), "_activateFocusHandle", "then 'add' as parameter returns _addFocusEventListeners");
			assert.strictEqual(this.oRta.getPopupManager()._getFocusEventName("remove"), "_deactivateFocusHandle", "then 'remove' as parameter returns _removeFocusEventListeners");
		});
	});

	QUnit.module("Given RTA instance is initialized", {
		beforeEach : function() {
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			//mock RTA instance
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			this.oRta._$document = jQuery(document);
			sap.ui.getCore().applyChanges();
			this.oRta._createToolsMenu(true);
			var oToolbarPromise = this.oRta.getToolbar().show();
			//mock DesignTime
			this.oRta._oDesignTime = new DesignTime({
				rootElements : [oComp.getAggregation("rootControl")]
			});
			var oDesignTimePromise = new Promise(function(fnResolve) {
				this.oRta._oDesignTime.attachEventOnce("synced", function () {
					fnResolve();
				});
			}.bind(this));
			this.oOriginalInstanceManager = merge({}, InstanceManager);
			//spy functions
			this.fnOverrideFunctionsSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideInstanceFunctions");
			this.fnApplyPopupAttributes = sandbox.spy(this.oRta.getPopupManager(), "_applyPopupAttributes");
			this.fnAddPopupInstanceSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideAddPopupInstance");
			this.fnOverrideAddFunctionsSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideAddFunctions");
			this.fnRemovePopupInstanceSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideRemovePopupInstance");
			this.fnOverrideRemoveFunctionsSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideRemoveFunctions");
			this.fnCreateDialogSpy = sandbox.spy(this.oRta.getPopupManager(), "_createPopupOverlays");
			this.fnToolsMenuBringToFrontSpy = sandbox.spy(this.oRta.getToolbar(), "bringToFront");
			this.fnAddRootElementSpy = sandbox.spy(this.oRta._oDesignTime, "addRootElement");
			this.fnRemoveRootElementSpy = sandbox.spy(this.oRta._oDesignTime, "removeRootElement");
			this.fnAddPopupListeners = sandbox.spy(Popup.prototype, "_activateFocusHandle");
			this.fnRemovePopupListeners = sandbox.spy(Popup.prototype, "_deactivateFocusHandle");
			this.fnIsPopupAdaptableSpy = sandbox.spy(this.oRta.getPopupManager(), "_isPopupAdaptable");
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
					modal: false,
					horizontalScrolling: false,
					verticalScrolling: false,
					contentMinWidth: "250px",
					contentWidth: "20%"
				});
				this.oPopover.oPopup.setAutoClose(false); /*when focus is taken away popover might close - resulting in failing tests*/
				this.oDialog.removeStyleClass("sapUiPopupWithPadding");
				oView.addContent(this.oDialog);
				oView.addContent(this.oPopover);
			}.bind(this));
			this.oNonRtaDialog = new Dialog("nonRtaDialog");
			return Promise.all([oDesignTimePromise, oToolbarPromise]);
		},
		afterEach : function() {
			if (this.oRta) {
				this.oRta.destroy();
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
			sandbox.restore();
		}
	}, function () {
		//_overrideInstanceFunctions
		QUnit.test("when _overrideInstanceFunctions is called with no open dialog", function(assert) {
			fnSetRta(this.oRta);
			this.oDialog.open();
			assert.strictEqual(this.oRta.getPopupManager().getRta(), this.oRta, "then RTA instance is set");
			assert.strictEqual(this.oRta.getPopupManager().oRtaRootAppComponent, this.oRta.getPopupManager()._getAppComponentForControl(oComp.getAggregation("rootControl")), "then component of RTA root element is set for PopupManager");
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
				assert.strictEqual(this.oRta.getPopupManager().getRta(), this.oRta, "then RTA instance is set");
				assert.strictEqual(this.oRta.getPopupManager().oRtaRootAppComponent, this.oRta.getPopupManager()._getAppComponentForControl(oComp.getAggregation("rootControl")), "then component of RTA root element is set for PopupManager");
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
			assert.expect(11);
			var done = assert.async();
			fnSetRta(this.oRta);
			this.oDialog.attachAfterOpen(function() {
				assert.ok(this.fnIsPopupAdaptableSpy.calledWith(this.oDialog), "the isPopupAdaptable is called with the in-app Dialog");
				this.oNonRtaDialog.attachAfterOpen(function() {
					assert.notEqual(InstanceManager.addDialogInstance, this.oOriginalInstanceManager.addDialogInstance, "InstanceManager.addDialogInstance overridden");
					assert.notEqual(InstanceManager.addPopoverInstance, this.oOriginalInstanceManager.addPopoverInstance, "InstanceManager.addPopoverInstance overridden");
					assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[0], "function", "then function is returned on the first call");
					assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[1], "function", "then function is returned on the second call");
					assert.ok(this.fnIsPopupAdaptableSpy.calledWith(this.oNonRtaDialog), "the isPopupAdaptable is called with the non in-app Dialog");
					//when dialog is opened, PopupManager.open() triggers bringToFront
					assert.notStrictEqual(this.fnToolsMenuBringToFrontSpy.callCount, 0, "then 'bringToFront' is called at least once");
					assert.strictEqual(this.fnCreateDialogSpy.callCount, 1, "then _createPopupOverlays called once for the relevant dialog");
					assert.ok(this.fnCreateDialogSpy.calledOn(this.oRta.getPopupManager()), "then _createPopupOverlays called with the context of PopupManager");
					//check z-index
					assert.ok(this.oDialog.oPopup.oContent.$().zIndex() < this.oRta.getToolbar().$().zIndex(), "then Toolbar is on top of the app component dialog");
					assert.ok(this.oNonRtaDialog.oPopup.oContent.$().zIndex() > this.oRta.getToolbar().$().zIndex(), "then Toolbar is not placed on top of the non-RTA dialog");
					done();
				}.bind(this));
				this.oNonRtaDialog.open();
			}.bind(this));
			this.oDialog.open();
		});
		//_isPopupAdaptable
		QUnit.test("when _isPopupAdaptable is called with a dialog with a valid component", function(assert) {
			var done = assert.async();
			var oComp = Component.getOwnerComponentFor(this.oDialog);
			var oPopupManager = this.oRta.getPopupManager();
			var oDialogNotAllowed;

			oPopupManager.oRtaRootAppComponent = oComp;

			oComp.runAsOwner(function () {
				oDialogNotAllowed = new Dialog({
					id:"adaptNotAllowedDialog",
					showHeader: false,
					contentHeight: "800px",
					contentWidth: "1000px"
				});
			});
			oDialogNotAllowed.attachAfterOpen(function() {
				assert.ok(this.oRta.getPopupManager()._isPopupAdaptable(oDialogNotAllowed), "then true returned when isPopupAdaptationAllowed function doesn't exist for dialog");
				oDialogNotAllowed.isPopupAdaptationAllowed = function () {
					return false;
				};
				assert.notOk(this.oRta.getPopupManager()._isPopupAdaptable(oDialogNotAllowed), "then false returned when isPopupAdaptationAllowed function exists for dialog");
				oDialogNotAllowed.destroy();
				done();
			}.bind(this));
			oDialogNotAllowed.open();
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
			this.oDialog.attachAfterOpen(function() {
				assert.ok(this.fnIsPopupAdaptableSpy.calledWith(this.oDialog), "the isPopupAdaptable is called with the in-app Dialog for open");
			});
			this.oDialog.open();
			assert.notEqual(InstanceManager.removeDialogInstance, this.oOriginalInstanceManager.removeDialogInstance, "InstanceManager.removeDialogInstance overridden");
			assert.notEqual(InstanceManager.removePopoverInstance, this.oOriginalInstanceManager.removePopoverInstance, "InstanceManager.removePopoverInstance overridden");
			assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[0], "function", "then function is returned on the first call");
			assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[1], "function", "then function is returned on the second call");
			this.oDialog.attachAfterClose(function() {
				assert.ok(this.fnIsPopupAdaptableSpy.calledWith(this.oDialog), "the isPopupAdaptable is called with the in-app Dialog for close");
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
					assert.strictEqual(this.oRta._oDesignTime.getRootElements()[1].getId(), this.oDialog.getId(), "then the opened dialog was added as the second root element");
					assert.strictEqual(this.oRta._oDesignTime.getRootElements().length, 2, "then main app element and same app component dialog present, but external dialogs not included");
					done();
				}.bind(this));
				this.oNonRtaDialog.open();
			}.bind(this));
		});
		//_restoreInstanceFunctions
		QUnit.test("when _restoreInstanceFunctions is called", function(assert) {
			fnSetRta(this.oRta);
			this.oRta.getPopupManager()._restoreInstanceFunctions();
			assert.strictEqual(this.oOriginalInstanceManager.addDialogInstance, InstanceManager.addDialogInstance, "then addDialogInstance function is restored in original state");
			assert.strictEqual(this.oOriginalInstanceManager.removeDialogInstance, InstanceManager.removeDialogInstance, "then removeDialogInstance function is restored in original state");
			assert.strictEqual(this.fnApplyPopupAttributes.callCount, 2, "then _applyPopupAttributes called second time");
			assert.ok(this.fnApplyPopupAttributes.calledWith({
				method: this.oRta.getPopupManager()._removePopupPatch,
				focus: true,
				setModal: false
			}), "then _applyPopupAttributes called with _removePopupPatch function as parameter with the correct context");
		});
		//_removePopupPatch
		QUnit.test("when _removePopupPatch is called", function(assert) {
			//Prepare for Popover
			var done = assert.async();
			fnSetRta(this.oRta);
			this.oPopover.oPopup.setAutoClose(true); /* Required to re-activate to check the number of calls to Popup.prototype._addFocusEventListeners()*/
			this.oPopover.attachAfterOpen(function() {
				var oPopup = this.oPopover.oPopup;
				var vPopupElement = oPopup._$().get(0);

				this.oRta.getPopupManager().fnOriginalPopupOnAfterRendering = oPopup.onAfterRendering;
				this.oPopover.oPopup.onAfterRendering = null;

				this.oRta.getPopupManager()._removePopupPatch(this.oPopover);
				assert.strictEqual(this.fnAddPopupListeners.callCount, 2, "then popup event listeners attached back, called twice, once while open() and once while re-attaching");

				var fnCheckOnAfterRendering = function () {
					vPopupElement.removeEventListener("blur", fnCheckOnAfterRendering);
					assert.strictEqual(typeof oPopup.onAfterRendering, "function", "then onAfterRendering is set back");
					done();
				};

				//TODO find a better way to test without checking for document focus. Else case is triggered when the test window is in an inactive state*/
				if (document.hasFocus()) {
					vPopupElement.addEventListener("blur", fnCheckOnAfterRendering);
				} else {
					fnCheckOnAfterRendering();
				}
				jQuery.sap.focus(oPopup.oContent);
				jQuery.sap.delayedCall(0, this, function() {
					vPopupElement.blur();
				});
			}.bind(this));
			this.oPopover.openBy(oComponentContainer);
		});
		//getCategorizedOpenPopups
		QUnit.test("when getCategorizedOpenPopups is called", function(assert) {
			fnSetRta(this.oRta);
			var done = assert.async();
			//Dialog
			this.oDialog.attachAfterOpen(function() {
				//Non-RTA Dialog
				this.oNonRtaDialog.attachAfterOpen(function() {
					//Popover
					this.oPopover.attachAfterOpen(function() {
						assert.strictEqual(this.oRta.getPopupManager().getCategorizedOpenPopups()["aDialogs"].length, 1, "then one relevant dialog returned");
						assert.deepEqual(this.oRta.getPopupManager().getCategorizedOpenPopups()["aDialogs"][0], this.oDialog, "then only dialog with same app component returned");
						assert.strictEqual(this.oRta.getPopupManager().getCategorizedOpenPopups()["aPopovers"].length, 1, "then one relevant popover returned");
						assert.deepEqual(this.oRta.getPopupManager().getCategorizedOpenPopups()["aPopovers"][0], this.oPopover, "then only popover with same app component returned");
						//Dialog Close
						this.oDialog.attachAfterClose(function () {
							assert.deepEqual(this.oRta.getPopupManager().getCategorizedOpenPopups()["aDialogs"], [], "then no relevant dialogs available");
							done();
						}.bind(this));
						this.oDialog.close();
					}.bind(this));
					this.oPopover.openBy(oComponentContainer);
				}.bind(this));
				this.oNonRtaDialog.open();
			}.bind(this));
			this.oDialog.open();
		});
		QUnit.test("when getCategorizedOpenPopups is called with MessageToast opened", function(assert) {
			//not a valid popover but using InstanceManager.AddPopoverInstance
			fnSetRta(this.oRta);
			MessageToast.show("Test Message");
			var oMessageToast = InstanceManager.getOpenPopovers()[0];
			oMessageToast.destroy();
			assert.ok(oMessageToast instanceof Popup, "then message toast returned");
			assert.deepEqual(this.oRta.getPopupManager().getCategorizedOpenPopups()["aPopovers"], [], "then no valid popover returned");
		});
		//_applyPopupPatch
		QUnit.test("when _applyPopupPatch is called", function(assert) {
			var done = assert.async();
			fnSetRta(this.oRta);
			sandbox.stub(this.oRta, "getMode").returns("adaptation");
			var fnDefaultOnAfterRendering = this.oPopover.oPopup.onAfterRendering;
			var oPopup = this.oPopover.oPopup;
			this.oPopover.attachAfterOpen(function() {
				var oOverlayContainerDomRef = Overlay.getOverlayContainer().get(0);
				this.oRta.getPopupManager().addAutoCloseArea(new Button("autoCloseButton"));
				this.oRta.getPopupManager()._applyPopupPatch(this.oPopover);
				assert.strictEqual(this.fnRemovePopupListeners.callCount, 1, "then popup event listeners removed");
				assert.ok(oPopup._aExtraContent.some(function(mArea) { return mArea.id && mArea.id === this.oRta.getToolbar().getId(); }, this), "Toolbar added as an autoClose area");
				assert.ok(oPopup._aExtraContent.some(function(mArea) { return mArea.id && mArea.id === this.oPopover.getId(); }, this), "Popover added as an autoClose area");
				assert.ok(oPopup._aExtraContent.some(function(mArea) { return mArea.id && mArea.id === oOverlayContainerDomRef.id; }), "OverlayContainer added as an autoClose area");
				assert.ok(oPopup._aExtraContent.some(function(mArea) { return mArea.id && mArea.id === "autoCloseButton"; }), "then custom autoClose area added as an autoClose area");
				assert.notEqual(oPopup.onAfterRendering, fnDefaultOnAfterRendering, "then onAfterRendering was overwritten");
				done();
			}.bind(this));
			this.oPopover.openBy(oComponentContainer);
		});
		//_getAppComponentForControl - runAsOwner
		QUnit.test("when _getAppComponentForControl is called with a dialog created inside Component.runAsOwner", function(assert) {
			sandbox.stub(this.oRta.getPopupManager(), "getRta").returns(this.oRta);
			var oAppComponentForDialog = this.oRta.getPopupManager()._getAppComponentForControl(this.oDialog);
			assert.strictEqual(oAppComponentForDialog, oComp, "then main component returned");
		});
		//_getAppComponentForControl - view as parent
		QUnit.test("when _getAppComponentForControl is called with a dialog with view as parent", function(assert) {
			sandbox.stub(this.oRta.getPopupManager(), "getRta").returns(this.oRta);
			oComp.byId("mockview").addDependent(this.oNonRtaDialog);
			var oAppComponentForNonRtaDialog = this.oRta.getPopupManager()._getAppComponentForControl(this.oNonRtaDialog);
			assert.strictEqual(oAppComponentForNonRtaDialog, oComp, "then view's component returned");
		});
		//_getAppComponentForControl - UIArea as parent
		QUnit.test("when _getAppComponentForControl is called with a dialog with UIArea as parent", function(assert) {
			var done = assert.async();
			fnSetRta(this.oRta);
			this.oNonRtaDialog.attachAfterOpen(function() {
				var oAppComponentForNonRtaDialog = this.oRta.getPopupManager()._getAppComponentForControl(this.oNonRtaDialog);
				assert.ok(this.oNonRtaDialog.getParent() instanceof UIArea, "then UIArea returned as parent");
				assert.strictEqual(oAppComponentForNonRtaDialog, undefined, "then no component returned");
				done();
			}.bind(this));
			this.oNonRtaDialog.open();
		});

		//_getValidatedPopups
		QUnit.test("when _getValidatedPopups is called with 2 relevant and one non-relevant popups", function(assert) {
			sandbox.stub(this.oRta.getPopupManager(), "getRta").returns(this.oRta);
			var aPopups = [this.oDialog, this.oNonRtaDialog, this.oPopover];
			this.oRta.getPopupManager().oRtaRootAppComponent = oComp;
			var aRelevantPopups = this.oRta.getPopupManager()._getValidatedPopups(aPopups).relevant;
			assert.strictEqual(aRelevantPopups.length, 2, "then relevant dialog and popover with same component are returned");
			assert.ok(this.fnIsPopupAdaptableSpy.calledThrice, "then _isPopupAdaptable called thrice for all 3 popups");
			assert.deepEqual(aRelevantPopups[0], this.oDialog, "then dialog returned");
			assert.deepEqual(aRelevantPopups[1], this.oPopover, "then popover returned");
		});
		//_onModeChange
		QUnit.test("when _onModeChange is called with after RTA mode is set to 'navigation'", function(assert) {
			var done = assert.async();
			fnSetRta(this.oRta);
			var oEvent = new Event("testevent", this.oRta, { mode: "navigation" });
			this.oRta.getPopupManager()._onModeChange(oEvent);
			this.oDialog.attachAfterOpen(function () {
				assert.strictEqual(this.fnApplyPopupAttributes.callCount, 2, "then applyPopupAttributes method was called twice");
				assert.strictEqual(this.fnAddPopupListeners.callCount, 1, "then fnAddPopupListeners method was called once");
				done();
			}.bind(this));
			this.oDialog.open();
		});
		//set PopOver to Modal (initial state = false)
		QUnit.test("when _onModeChange is called on a non modal popover", function(assert) {
			var done = assert.async();
			assert.equal(this.oPopover.getModal(), false, "the Popover is not modal before mode change");
			fnSetRta(this.oRta);

			this.oRta.getPopupManager().attachEventOnce("open", function(oEvent) {
				this.oRta.getPopupManager()._applyPopupAttributes.restore();
				var oPopup = oEvent.getParameters().getSource().oPopup;

				// change mode to 'adaptation'
				var oModeChangeEvent = new Event("testevent", this.oRta, { mode: "adaptation" });
				this.oRta.getPopupManager()._onModeChange(oModeChangeEvent);
				assert.equal(oPopup.getModal(), true, "then the Popover is modal after switch to adaptation mode");
				assert.strictEqual(this.fnToolsMenuBringToFrontSpy.callCount, 2, "then 'bringToFront' was called twice; on popover open and on mode change ");

				// change mode to 'navigation'
				oModeChangeEvent = new Event("testevent", this.oRta, { mode: "navigation" });
				this.oRta.getPopupManager()._onModeChange(oModeChangeEvent);
				assert.equal(oPopup.getModal(), false, "then the Popover is not modal after switch back to navigation mode");
				assert.strictEqual(this.fnToolsMenuBringToFrontSpy.callCount, 2, "then 'bringToFront' was not called again");
				this.fnApplyPopupAttributes = sandbox.spy(this.oRta.getPopupManager(), "_applyPopupAttributes");
				done();
			}.bind(this));
			this.oPopover.openBy(oComponentContainer);
		});
		//set PopOver to Modal (initial state = true)
		QUnit.test("when _onModeChange is called on a modal popover", function(assert) {
			var done = assert.async();
			// set the initial Modal state to "true"
			this.oPopover.setModal(true);
			fnSetRta(this.oRta);

			this.oPopover.attachAfterOpen(function() {
				this.oRta.getPopupManager()._applyPopupAttributes.restore();
				var oPopup = this.oPopover.oPopup;

				// change mode to 'adaptation'
				var oEvent = new Event("testevent", this.oRta, { mode: "adaptation" });
				this.oRta.getPopupManager()._onModeChange(oEvent);
				assert.equal(oPopup.getModal(), true, "then the Popover is modal after switch to adaptation mode");

				// change mode to 'navigation'
				oEvent = new Event("testevent", this.oRta, { mode: "navigation" });
				this.oRta.getPopupManager()._onModeChange(oEvent);
				assert.equal(oPopup.getModal(), true, "then the Popover is stil modal after switch back to navigation mode");
				this.fnApplyPopupAttributes = sandbox.spy(this.oRta.getPopupManager(), "_applyPopupAttributes");
				done();
			}.bind(this));
			this.oPopover.openBy(oComponentContainer);
		});
	});

	//integration tests
	//when RTA is started and then dialogs are opened
	QUnit.module("Given RTA is started with an app containing dialog(s)", {
		beforeEach : function() {
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			this.oNonRtaDialog = new Dialog("nonRtaDialog");
			var fnSpies = function() {
				this.fnAddDialogInstanceSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideAddPopupInstance");
				this.fnCreateDialogSpy = sandbox.spy(this.oRta.getPopupManager(), "_createPopupOverlays");
				this.fnRemoveDialogInstanceSpy = sandbox.spy(this.oRta._oDesignTime, "removeRootElement");
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
			return this.oRta.start().then(fnSpies.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oRta.destroy();
			if (this.oDialog) {
				this.oDialog.destroy();
			}
			if (this.oButton) {
				this.oButton.destroy();
			}
			this.oNonRtaDialog.destroy();
		}
	}, function () {
		QUnit.test("when Dialog with the same app component is opened and then closed / destroyed", function(assert) {
			//to open the dialog
			this.oButton.firePress();
			var fnOpenDone = assert.async();
			this.oDialog.attachAfterOpen(function() {
				assert.strictEqual(this.fnCreateDialogSpy.callCount, 1, "then '_createPopupOverlays' called once");
				assert.notEqual(this.oRta._oDesignTime.getRootElements().map(function(oRootElement) {
					return oRootElement.getId();
				}).indexOf(this.oDialog.getId()), -1, "then the opened dialog was added as a root element");
				assert.ok(this.fnCreateDialogSpy.calledOn(this.oRta.getPopupManager()), "then '_createPopupOverlays' with the opened dialog");
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
		QUnit.test("when dialog with different app component is opened", function(assert) {
			var done = assert.async();
			this.oRta._oDesignTime.attachEventOnce("synced", function() {
				assert.notOk(fnFindOverlay(this.oNonRtaDialog, this.oRta._oDesignTime), "then overlay does not exist for root dialog element");
				done();
			}.bind(this));
			this.oNonRtaDialog.open();
			this.oNonRtaDialog.attachAfterOpen(function() {
				assert.strictEqual(this.fnCreateDialogSpy.callCount, 0, "then '_createPopupOverlays' is never called");
				assert.ok(this.fnCreateDialogSpy.neverCalledWith(this.oNonRtaDialog), "then '_createPopupOverlays' is not called");
				this.oRta._oDesignTime.fireSynced();
			}.bind(this));
		});
	});
	//Dialog open -> RTA started
	QUnit.module("Given that a dialog is open and then RTA is started", {
		beforeEach : function(assert) {
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});

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
			sandbox.restore();
			if (this.oDialog) {
				this.oDialog.destroy();
			}
			if (this.oButton) {
				this.oButton.destroy();
			}
		}
	}, function () {
		QUnit.test("when dialog with same app component is already open", function(assert) {
			var oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			var fnAfterRTA = function() {
				assert.notEqual(oRta._oDesignTime.getRootElements().map(function(oRootElement) {
					return oRootElement.getId();
				}).indexOf(this.oDialog.getId()), -1, "then the opened dialog was added as a root element");
				assert.ok(fnFindOverlay(this.oDialog, oRta._oDesignTime), "then overlay exists for root dialog element");
				oRta.getDependent('toolbar').destroy();
				oRta.destroy();
			}.bind(this);

			return oRta.start().then(fnAfterRTA.bind(this));
		});
		QUnit.test("when a non-adaptable dialog is already open and RTA is started and stopped", function(assert) {
			var fnDone = assert.async();
			this.oDialog.isPopupAdaptationAllowed = function () {
				return false;
			};
			this.oDialog.oPopup.setModal(false);
			var oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			assert.notOk(this.oDialog.oPopup.getModal(), "initially modal property for dialog is set to false");
			var fnAfterRTA = function() {
				assert.ok(this.oDialog.oPopup.getModal(), "then modal property for dialog is set to true after RTA is started");
				assert.ok(typeof oRta.getPopupManager()._oModalState.get(this.oDialog.oPopup) === "boolean", "then dialog's modal state map entry exists");

				oRta.stop().then(function() {
					oRta.destroy();
					assert.notOk(this.oDialog.oPopup.getModal(), "then modal property is set back to the original state then RTA is switched to navigation mode");
					fnDone();
				}.bind(this));
			}.bind(this);
			return oRta.start().then(fnAfterRTA.bind(this));
		});
		QUnit.test("when a non-adaptable dialog is already open, RTA is started and RTA's mode is switched to navigation", function(assert) {
			var fnDone = assert.async();
			this.oDialog.isPopupAdaptationAllowed = function () {
				return false;
			};
			this.oDialog.oPopup.setModal(false);
			var oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			assert.notOk(this.oDialog.oPopup.getModal(), "initially modal property for dialog is set to false");
			var fnAfterRTA = function() {
				assert.ok(this.oDialog.oPopup.getModal(), "then modal property for dialog is set to true after RTA is started");
				assert.ok(typeof oRta.getPopupManager()._oModalState.get(this.oDialog.oPopup) === "boolean", "then dialog's modal state map entry exists");

				var oEvent = new Event("testevent", oRta, { mode: "navigation" });
				oRta.getPopupManager()._onModeChange(oEvent);
				assert.notOk(this.oDialog.oPopup.getModal(), "then modal property is set back to the original state then RTA is switched to navigation mode");
				assert.strictEqual(oRta.getPopupManager()._oModalState.get(this.oDialog.oPopup), undefined, "then dialog's modal state map entry no longer exists");
				oRta.destroy();
				fnDone();
			}.bind(this);
			return oRta.start().then(fnAfterRTA.bind(this));
		});
	});

	//_isComponentInsidePopup
	QUnit.module("Given RTA is started with an app containing dialog(s)", {
		beforeEach: function (assert) {
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			var oCompContInDialog = new ComponentContainer("CompCont2", {
				component : new MockComponent("compInContainer")
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
			this.oRta.getToolbar().show();
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
		afterEach: function() {
			if (this.oRta) {
				this.oRta.destroy();
			}
			if (this.oDialog) {
				this.oDialog.destroy();
			}
			delete this.oOriginalInstanceManager;
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when _isComponentInsidePopup is called with an app component container inside dialog", function(assert) {
			fnSetRta(this.oRta);
			var bIsAppInsidePopup = this.oRta.getPopupManager()._isComponentInsidePopup(this.oDialog);
			assert.ok(bIsAppInsidePopup, "then a component container is discovered inside popup");
			assert.strictEqual(this.fnRemovePopupListeners.callCount, 1, "then popup event listeners removed - first call from PopupManager");
			this.oDialog.oPopup.onAfterRendering();
			assert.strictEqual(this.fnRemovePopupListeners.callCount, 2, "then popup event listeners removed - second call from overridden Popup.onAfterRendering()");
		});
	});

	QUnit.module("Given RTA is started with an app containing dialog(s)", {
		beforeEach: function (assert) {
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			//mock RTA instance
			this.oRta = new RuntimeAuthoring({
				rootControl : oComp.getAggregation("rootControl")
			});
			var done = assert.async();
			this.oNonRtaDialog = new Dialog("nonRtaDialog");
			oComp.runAsOwner(function() {
				this.oCompContInside = new ComponentContainer("CompContInside", {
					component : new MockComponent("compInside")
				});
				oComp.byId("mockview").addContent(this.oCompContInside);
				this.oCompContInside.getComponentInstance().byId("mockview").addContent(this.oNonRtaDialog);
				done();
			}.bind(this));
		},
		afterEach: function () {
			if (this.oRta) {
				this.oRta.destroy();
			}
			this.oCompContInside.destroy();
			this.oNonRtaDialog.destroy();
		}
	}, function () {
		//_getComponentForControl
		QUnit.test("when _getComponentForControl is called with a dialog inside an embedded component", function(assert) {
			var sBaseCompId = this.oRta.getPopupManager()._getComponentForControl(this.oNonRtaDialog).getId();
			assert.strictEqual(sBaseCompId, oComp.getId(), "then base component id returned");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});