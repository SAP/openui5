/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/InstanceManager",
	"sap/m/MessageToast",
	"sap/m/Popover",
	"sap/ui/base/Event",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/core/UIArea",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Popup",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/dt/Overlay",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/layout/form/Form",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/dom/jquery/zIndex" // jQuery Plugin "zIndex"
], async function(
	merge,
	Button,
	Dialog,
	InstanceManager,
	MessageToast,
	Popover,
	Event,
	XMLView,
	ComponentContainer,
	Component,
	Element,
	UIArea,
	UIComponent,
	Popup,
	ZIndexManager,
	Overlay,
	FlSettings,
	PersistenceWriteAPI,
	FlUtils,
	Form,
	nextUIUpdate,
	RuntimeAuthoring,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	sinon.stub(PersistenceWriteAPI, "save");
	let oViewPromise;
	var MockComponent = UIComponent.extend("MockController", {
		metadata: {
			manifest: {
				"sap.app": {
					applicationVersion: {
						version: "1.2.3"
					},
					id: "MockComponent"
				}
			},
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},
		createContent() {
			oViewPromise = XMLView.create({
				id: this.createId("mockview"),
				definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc">' + "</mvc:View>"
			});
			return oViewPromise;
		}
	});
	var oComp = new MockComponent("testComponent");
	var oView = await oViewPromise;
	var oComponentContainer = new ComponentContainer({
		component: oComp
	});
	oComponentContainer.placeAt("qunit-fixture");
	await nextUIUpdate();

	function findOverlay(oElement, oDesignTime) {
		var aOverlays = oDesignTime.getElementOverlays();
		var bResult = aOverlays.some(function(oOverlay) {
			return oOverlay.getElement() === oElement;
		});
		return bResult;
	}

	function stubBefore(bPersistenceAPI, bAppComponentForControl, bSettingsInstance) {
		if (bPersistenceAPI) {
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: true
			});
		}
		if (bAppComponentForControl) {
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oComp);
		}
		if (bSettingsInstance) {
			var oSettings = {
				isVersioningEnabled() {
					return false;
				},
				isProductiveSystem() {
					return true;
				},
				isCustomerSystem() {
					return false;
				},
				isAppVariantSaveAsEnabled() {
					return true;
				},
				isVariantAdaptationEnabled() {
					return false;
				},
				isKeyUserTranslationEnabled() {
					return false;
				},
				isSystemWithTransports() {
					return false;
				},
				isPublicLayerAvailable() {
					return false;
				},
				isContextBasedAdaptationEnabled() {
					return false;
				},
				isLocalResetEnabled() {
					return false;
				},
				isPublishAvailable() {
					return false;
				},
				isSeenFeaturesAvailable() {
					return false;
				}
			};
			sandbox.stub(FlSettings, "getInstance").resolves(oSettings);
			sandbox.stub(FlSettings, "getInstanceOrUndef").returns(oSettings);
		}
	}

	function spyBefore() {
		this.fnAddDialogInstanceSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideAddPopupInstance");
		this.fnCreateDialogSpy = sandbox.spy(this.oRta.getPopupManager(), "_createPopupOverlays");
		this.fnRemoveDialogInstanceSpy = sandbox.spy(this.oRta._oDesignTime, "removeRootElement");
	}

	function createDialogOpenButton() {
		return new Button("testbutton", {
			text: "Main Button",
			press: function() {
				this.oDialog.open();
			}.bind(this)
		});
	}

	// RTA Toolbar needs RTA Mode settings
	document.body.classList.add("sapUiRtaMode");

	QUnit.module("Given PopupManager exists", {
		beforeEach() {
			this.fnAddPopupFilterStub = sandbox.stub(ZIndexManager, "addPopupFilter");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA is initialized", function(assert) {
			assert.expect(3);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});
			assert.ok(this.fnAddPopupFilterStub.calledTwice, "then 2 popup filters were added to the ZIndexManager");
			this.oRta.getPopupManager()._aPopupFilters.forEach(function(fnFilter) {
				assert.ok(this.fnAddPopupFilterStub.calledWith(fnFilter), "then ZIndexManager was called with the correct filter function");
			}.bind(this));
		});
	});

	QUnit.module("Given RTA instance is created without starting", {
		beforeEach() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});
			this.fnOverrideFunctionsSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideInstanceFunctions");
			this.fnAddPopupInstanceSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideAddPopupInstance");
			this.fnRemovePopupInstanceSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideRemovePopupInstance");
			this.fnCreateDialogSpy = sandbox.spy(this.oRta.getPopupManager(), "_createPopupOverlays");
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when PopupManager is initialized without setting RTA instance", function(assert) {
			assert.ok(this.oRta.getPopupManager(), "PopupManager instance exists");
			assert.strictEqual(this.oRta.getPopupManager().getRta(), undefined, "then RTA instance is not set for PopupManager before RTA is started");
			assert.strictEqual(this.oRta.getPopupManager().oRtaRootAppComponent, undefined, "then RTA root element is not set for PopupManager before RTA is started");
			assert.strictEqual(this.fnOverrideFunctionsSpy.callCount, 0, "then '_overrideInstanceFunctions' not called since rta is not set");
		});
		// _getFocusEventName
		QUnit.test("when _getValidatedPopups is called with 2 relevant and one non-relevant popups", function(assert) {
			assert.strictEqual(this.oRta.getPopupManager()._getFocusEventName("add"), "_activateFocusHandle", "then 'add' as parameter returns _addFocusEventListeners");
			assert.strictEqual(this.oRta.getPopupManager()._getFocusEventName("remove"), "_deactivateFocusHandle", "then 'remove' as parameter returns _removeFocusEventListeners");
		});

		QUnit.test("when dialog is already open and then _overrideInstanceFunctions is called", function(assert) {
			var done = assert.async();
			oComp.runAsOwner(function() {
				this.oDialog = new Dialog({
					id: oComp.createId("SmartFormDialog"),
					showHeader: false,
					contentHeight: "800px",
					contentWidth: "1000px"
				});
			}.bind(this));
			this.oDialog.attachAfterOpen(function() {
				return this.oRta.start().then(function() {
					assert.strictEqual(this.oRta.getPopupManager().oRtaRootAppComponent, this.oRta.getPopupManager()._getAppComponentForControl(oComp.getAggregation("rootControl")), "then component of RTA root element is set for PopupManager");
					assert.strictEqual(this.fnAddPopupInstanceSpy.callCount, 1, "then '_overrideAddPopupInstance' is called once since RTA is set");
					assert.strictEqual(this.fnOverrideFunctionsSpy.callCount, 1, "then '_overrideInstanceFunctions' is called once since RTA is set");
					assert.strictEqual(this.fnRemovePopupInstanceSpy.callCount, 1, "then '_overrideRemovePopupInstance' is called once since RTA is set");
					assert.strictEqual(this.fnCreateDialogSpy.callCount, 1, "then _createPopupOverlays called for the already opened dialog");
					assert.ok(this.fnCreateDialogSpy.calledWith(this.oDialog), "then _createPopupOverlays called for the in-app dialog");

					this.oDialog.destroy();
					done();
				}.bind(this));
			}.bind(this));
			this.oDialog.open();
		});
	});

	QUnit.module("Given RTA instance is initialized", {
		async beforeEach() {
			stubBefore(true/* bPersistenceAPI */);

			// mock RTA instance
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});
			await nextUIUpdate();
			this.oOriginalInstanceManager = merge({}, InstanceManager);

			// mock same app component dialog
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
				this.oPopover.oPopup.setAutoClose(false); /* when focus is taken away popover might close - resulting in failing tests */
				this.oDialog.addStyleClass("sapUiNoContentPadding");
				oView.addContent(this.oDialog);
				oView.addContent(this.oPopover);
			}.bind(this));
			this.oNonRtaDialog = new Dialog("nonRtaDialog");

			this.fnOverrideFunctionsSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideInstanceFunctions");
			this.fnApplyPopupAttributes = sandbox.spy(this.oRta.getPopupManager(), "_applyPopupAttributes");
			this.fnAddPopupInstanceSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideAddPopupInstance");
			this.fnOverrideAddFunctionsSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideAddFunctions");
			this.fnRemovePopupInstanceSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideRemovePopupInstance");
			this.fnOverrideRemoveFunctionsSpy = sandbox.spy(this.oRta.getPopupManager(), "_overrideRemoveFunctions");
			this.fnCreateDialogSpy = sandbox.spy(this.oRta.getPopupManager(), "_createPopupOverlays");
			this.fnAddPopupListeners = sandbox.spy(Popup.prototype, "_activateFocusHandle");
			this.fnRemovePopupListeners = sandbox.spy(Popup.prototype, "_deactivateFocusHandle");
			this.fnIsPopupAdaptableSpy = sandbox.spy(this.oRta.getPopupManager(), "_isPopupAdaptable");

			return this.oRta.start().then(function() {
				this.fnRemoveRootElementSpy = sandbox.spy(this.oRta._oDesignTime, "removeRootElement");
				this.fnAddRootElementSpy = sandbox.spy(this.oRta._oDesignTime, "addRootElement");
				this.fnToolsMenuBringToFrontSpy = sandbox.spy(this.oRta.getToolbar(), "bringToFront");
			}.bind(this));
		},
		afterEach() {
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
	}, function() {
		QUnit.test("when _overrideInstanceFunctions is called with no open dialog", function(assert) {
			this.oDialog.open();
			assert.strictEqual(this.oRta.getPopupManager().getRta(), this.oRta, "then RTA instance is set");
			assert.strictEqual(this.oRta.getPopupManager().oRtaRootAppComponent, this.oRta.getPopupManager()._getAppComponentForControl(oComp.getAggregation("rootControl")), "then component of RTA root element is set for PopupManager");
			assert.strictEqual(this.fnAddPopupInstanceSpy.callCount, 1, "then '_overrideAddPopupInstance' is called once since RTA is set");
			assert.strictEqual(this.fnOverrideFunctionsSpy.callCount, 1, "then '_overrideInstanceFunctions' is called once since RTA is set");
			assert.strictEqual(this.fnRemovePopupInstanceSpy.callCount, 1, "then '_overrideRemovePopupInstance' is called once since RTA is set");
			assert.strictEqual(this.fnCreateDialogSpy.callCount, 0, "then _createPopupOverlays not called");
		});

		QUnit.test("when _overrideAddPopupInstance for dialog is called", function(assert) {
			assert.strictEqual(this.fnOverrideAddFunctionsSpy.callCount, 2, "then _overrideAddFunctions called twice for dialog and popover");
			assert.ok(this.fnOverrideAddFunctionsSpy.calledWith(this.oOriginalInstanceManager.addDialogInstance), "then _overrideAddFunctions called with InstanceManager addPopoverInstance()");
			assert.ok(this.fnOverrideAddFunctionsSpy.calledWith(this.oOriginalInstanceManager.addPopoverInstance), "then _overrideAddFunctions called with InstanceManager addDialogInstance()");
		});

		QUnit.test("when _overrideAddFunctions for dialog is called", function(assert) {
			assert.expect(11);
			var done = assert.async();
			this.oDialog.attachAfterOpen(function() {
				assert.ok(this.fnIsPopupAdaptableSpy.calledWith(this.oDialog), "the isPopupAdaptable is called with the in-app Dialog");
				this.oNonRtaDialog.attachAfterOpen(function() {
					assert.notEqual(InstanceManager.addDialogInstance, this.oOriginalInstanceManager.addDialogInstance, "InstanceManager.addDialogInstance overridden");
					assert.notEqual(InstanceManager.addPopoverInstance, this.oOriginalInstanceManager.addPopoverInstance, "InstanceManager.addPopoverInstance overridden");
					assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[0], "function", "then function is returned on the first call");
					assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[1], "function", "then function is returned on the second call");
					assert.ok(this.fnIsPopupAdaptableSpy.calledWith(this.oNonRtaDialog), "the isPopupAdaptable is called with the non in-app Dialog");
					// when dialog is opened, PopupManager.open() triggers bringToFront
					assert.notStrictEqual(this.fnToolsMenuBringToFrontSpy.callCount, 0, "then 'bringToFront' is called at least once");
					assert.strictEqual(this.fnCreateDialogSpy.callCount, 1, "then _createPopupOverlays called once for the relevant dialog");
					assert.ok(this.fnCreateDialogSpy.calledOn(this.oRta.getPopupManager()), "then _createPopupOverlays called with the context of PopupManager");
					// check z-index
					assert.ok(this.oDialog.oPopup.oContent.$().zIndex() < this.oRta.getToolbar().$().zIndex(), "then Toolbar is on top of the app component dialog");
					assert.ok(this.oNonRtaDialog.oPopup.oContent.$().zIndex() > this.oRta.getToolbar().$().zIndex(), "then Toolbar is not placed on top of the non-RTA dialog");
					done();
				}.bind(this));
				this.oNonRtaDialog.open();
			}.bind(this));
			this.oDialog.open();
		});

		QUnit.test("when _isPopupAdaptable is called with a dialog with a valid component", function(assert) {
			var done = assert.async();
			var oComp = Component.getOwnerComponentFor(this.oDialog);
			var oPopupManager = this.oRta.getPopupManager();
			var oDialogNotAllowed;
			this.fnCreateDialogSpy.restore();
			sandbox.stub(oPopupManager, "_createPopupOverlays");

			oComp.runAsOwner(function() {
				oDialogNotAllowed = new Dialog({
					id: "adaptNotAllowedDialog",
					showHeader: false,
					contentHeight: "800px",
					contentWidth: "1000px"
				});
			});
			oDialogNotAllowed.attachAfterOpen(function() {
				assert.ok(oPopupManager._isPopupAdaptable(oDialogNotAllowed), "then true returned when isPopupAdaptationAllowed function doesn't exist for dialog");
				oDialogNotAllowed.isPopupAdaptationAllowed = function() {
					return false;
				};
				assert.notOk(oPopupManager._isPopupAdaptable(oDialogNotAllowed), "then false returned when isPopupAdaptationAllowed function exists for dialog");
				oDialogNotAllowed.destroy();
				done();
			});
			oDialogNotAllowed.open();
		});

		QUnit.test("when _isPopupAdaptable is called with a dialog with a valid component and parent dialog", function(assert) {
			var done = assert.async();
			var oComp = Component.getOwnerComponentFor(this.oDialog);
			var oPopupManager = this.oRta.getPopupManager();
			this.fnCreateDialogSpy.restore();
			sandbox.stub(oPopupManager, "_createPopupOverlays");
			var oInnerDialog;

			var oDialogNotAllowed = new Dialog({
				id: "adaptNotAllowedDialog",
				showHeader: false,
				contentHeight: "800px",
				contentWidth: "1000px"
			});
			oComp.runAsOwner(function() {
				oInnerDialog = new Dialog({
					id: "dialogWithValidComponent",
					showHeader: false,
					contentHeight: "400px",
					contentWidth: "600px"
				});
				oDialogNotAllowed.addContent(oInnerDialog);
			});
			oInnerDialog.attachAfterOpen(function() {
				assert.ok(oPopupManager._isPopupAdaptable(oInnerDialog), "then true returned when isPopupAdaptationAllowed function doesn't exist for dialog");
				oDialogNotAllowed.isPopupAdaptationAllowed = function() {
					return false;
				};
				assert.notOk(oPopupManager._isPopupAdaptable(oInnerDialog), "then false returned when isPopupAdaptationAllowed function exists for dialog");
				oDialogNotAllowed.destroy();
				oInnerDialog.destroy();
				done();
			});
			oInnerDialog.open();
		});

		QUnit.test("when _overrideRemovePopupInstance for dialog is called", function(assert) {
			assert.strictEqual(this.fnOverrideRemoveFunctionsSpy.callCount, 2, "then _overrideRemoveFunctions called twice for dialog and popover");
			assert.ok(this.fnOverrideRemoveFunctionsSpy.calledWith(this.oOriginalInstanceManager.removeDialogInstance), "then _overrideRemoveFunctions called with InstanceManager addPopoverInstance()");
			assert.ok(this.fnOverrideRemoveFunctionsSpy.calledWith(this.oOriginalInstanceManager.removePopoverInstance), "then _overrideRemoveFunctions called with InstanceManager addDialogInstance()");
		});

		QUnit.test("when _overrideRemovePopupInstance for dialog is called and dialog is closed", function(assert) {
			var done = assert.async();
			this.oDialog.attachAfterOpen(function() {
				assert.ok(this.fnIsPopupAdaptableSpy.calledWith(this.oDialog), "the isPopupAdaptable is called with the in-app Dialog for open");
				this.oDialog.attachAfterClose(function() {
					assert.ok(this.fnIsPopupAdaptableSpy.calledWith(this.oDialog), "the isPopupAdaptable is called with the in-app Dialog for close");
					assert.strictEqual(this.fnRemoveRootElementSpy.callCount, 1, "then 'removeRootElement' is called once since RTA is set");
					assert.ok(this.fnRemoveRootElementSpy.calledWith(this.oDialog), "then 'removeRootElement' called with the same app component dialog");
					assert.strictEqual(this.oRta._oDesignTime.getRootElements().indexOf(this.oDialog.getId()), -1, "then the opened dialog was removed from root elements");
					done();
				}.bind(this));
				this.oDialog.close();
			}.bind(this));
			this.oDialog.open();
			assert.notEqual(InstanceManager.removeDialogInstance, this.oOriginalInstanceManager.removeDialogInstance, "InstanceManager.removeDialogInstance overridden");
			assert.notEqual(InstanceManager.removePopoverInstance, this.oOriginalInstanceManager.removePopoverInstance, "InstanceManager.removePopoverInstance overridden");
			assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[0], "function", "then function is returned on the first call");
			assert.strictEqual(typeof this.fnOverrideAddFunctionsSpy.returnValues[1], "function", "then function is returned on the second call");
		});

		QUnit.test("when _createPopupOverlays for dialog is called", function(assert) {
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

		QUnit.test("when _restoreInstanceFunctions is called", function(assert) {
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

		QUnit.test("when _removePopupPatch is called", function(assert) {
			// Prepare for Popover
			var done = assert.async();
			this.oPopover.oPopup.setAutoClose(true); /* Required to re-activate to check the number of calls to Popup.prototype._addFocusEventListeners() */
			this.oPopover.attachAfterOpen(function() {
				var {oPopup} = this.oPopover;
				var vPopupElement = oPopup.getContent().getDomRef();

				this.oRta.getPopupManager().fnOriginalPopupOnAfterRendering = oPopup.onAfterRendering;
				this.oPopover.oPopup.onAfterRendering = null;

				this.oRta.getPopupManager()._removePopupPatch(this.oPopover);
				assert.strictEqual(this.fnAddPopupListeners.callCount, 2, "then popup event listeners attached back, called twice, once while open() and once while re-attaching");

				var fnCheckOnAfterRendering = function() {
					vPopupElement.removeEventListener("blur", fnCheckOnAfterRendering);
					assert.strictEqual(typeof oPopup.onAfterRendering, "function", "then onAfterRendering is set back");
					done();
				};

				// TODO find a better way to test without checking for document focus. Else case is triggered when the test window is in an inactive state*/
				if (document.hasFocus()) {
					vPopupElement.addEventListener("blur", fnCheckOnAfterRendering);
				} else {
					fnCheckOnAfterRendering();
				}
				oPopup.oContent.getDomRef().focus();
				setTimeout(function() {
					vPopupElement.blur();
				}, 0);
			}.bind(this));
			this.oPopover.openBy(oComponentContainer);
		});

		QUnit.test("when getCategorizedOpenPopups is called", function(assert) {
			var done = assert.async();
			// Dialog
			this.oDialog.attachAfterOpen(function() {
				// Non-RTA Dialog
				this.oNonRtaDialog.attachAfterOpen(function() {
					// Popover
					this.oPopover.attachAfterOpen(function() {
						assert.strictEqual(this.oRta.getPopupManager().getCategorizedOpenPopups().aDialogs.length, 1, "then one relevant dialog returned");
						assert.deepEqual(this.oRta.getPopupManager().getCategorizedOpenPopups().aDialogs[0], this.oDialog, "then only dialog with same app component returned");
						assert.strictEqual(this.oRta.getPopupManager().getCategorizedOpenPopups().aPopovers.length, 1, "then one relevant popover returned");
						assert.deepEqual(this.oRta.getPopupManager().getCategorizedOpenPopups().aPopovers[0], this.oPopover, "then only popover with same app component returned");
						// Dialog Close
						this.oDialog.attachAfterClose(function() {
							assert.deepEqual(this.oRta.getPopupManager().getCategorizedOpenPopups().aDialogs, [], "then no relevant dialogs available");
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
			// not a valid popover but using InstanceManager.AddPopoverInstance
			MessageToast.show("Test Message");
			var oMessageToast = InstanceManager.getOpenPopovers()[0];
			oMessageToast.destroy();
			assert.ok(oMessageToast instanceof Popup, "then message toast returned");
			assert.deepEqual(this.oRta.getPopupManager().getCategorizedOpenPopups().aPopovers, [], "then no valid popover returned");
		});

		QUnit.test("when _applyPopupPatch is called", function(assert) {
			var done = assert.async();
			sandbox.stub(this.oRta, "getMode").returns("adaptation");
			var fnDefaultOnAfterRendering = this.oPopover.oPopup.onAfterRendering;
			var {oPopup} = this.oPopover;
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

		QUnit.test("when _getAppComponentForControl is called with a dialog created inside Component.runAsOwner", function(assert) {
			sandbox.stub(this.oRta.getPopupManager(), "getRta").returns(this.oRta);
			var oAppComponentForDialog = this.oRta.getPopupManager()._getAppComponentForControl(this.oDialog);
			assert.strictEqual(oAppComponentForDialog, oComp, "then main component returned");
		});

		QUnit.test("when _getAppComponentForControl is called with a dialog with view as parent", function(assert) {
			sandbox.stub(this.oRta.getPopupManager(), "getRta").returns(this.oRta);
			oComp.byId("mockview").addDependent(this.oNonRtaDialog);
			var oAppComponentForNonRtaDialog = this.oRta.getPopupManager()._getAppComponentForControl(this.oNonRtaDialog);
			assert.strictEqual(oAppComponentForNonRtaDialog, oComp, "then view's component returned");
		});

		QUnit.test("when _getAppComponentForControl is called with a dialog with UIArea as parent", function(assert) {
			var done = assert.async();
			this.oNonRtaDialog.attachAfterOpen(function() {
				var oAppComponentForNonRtaDialog = this.oRta.getPopupManager()._getAppComponentForControl(this.oNonRtaDialog);
				assert.ok(this.oNonRtaDialog.getParent() instanceof UIArea, "then UIArea returned as parent");
				assert.strictEqual(oAppComponentForNonRtaDialog, undefined, "then no component returned");
				done();
			}.bind(this));
			this.oNonRtaDialog.open();
		});

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

		QUnit.test("when _onModeChange is called with after RTA mode is set to 'navigation'", function(assert) {
			var done = assert.async();
			var oEvent = new Event("testevent", this.oRta, { mode: "navigation" });
			this.oRta.getPopupManager()._onModeChange(oEvent);
			this.oDialog.attachAfterOpen(function() {
				assert.strictEqual(this.fnApplyPopupAttributes.callCount, 2, "then applyPopupAttributes method was called twice");
				assert.strictEqual(this.fnAddPopupListeners.callCount, 1, "then fnAddPopupListeners method was called once");
				done();
			}.bind(this));
			this.oDialog.open();
		});

		QUnit.test("when _onModeChange is called on a non modal popover", function(assert) {
			var done = assert.async();
			assert.equal(this.oPopover.getModal(), false, "the Popover is not modal before mode change");

			this.oRta.getPopupManager().attachEventOnce("open", function(oEvent) {
				this.oRta.getPopupManager()._applyPopupAttributes.restore();
				var {oPopup} = oEvent.getParameters().getSource();

				// change mode to 'adaptation'
				var oModeChangeEvent = new Event("testevent", this.oRta, { mode: "adaptation" });
				this.oRta.getPopupManager()._onModeChange(oModeChangeEvent);
				assert.ok(oPopup.getModal(), "then the Popover is modal after switch to adaptation mode");
				assert.strictEqual(this.fnToolsMenuBringToFrontSpy.callCount, 2, "then 'bringToFront' was called twice; on popover open and on mode change ");
				assert.notOk(this.oRta._oDesignTime.getElementOverlays()[0].getVisible(), "then the visibility from the main root control overlay is false");

				// change mode to 'navigation'
				oModeChangeEvent = new Event("testevent", this.oRta, { mode: "navigation" });
				this.oRta.getPopupManager()._onModeChange(oModeChangeEvent);
				assert.notOk(oPopup.getModal(), "then the Popover is not modal after switch back to navigation mode");
				assert.strictEqual(this.fnToolsMenuBringToFrontSpy.callCount, 2, "then 'bringToFront' was not called again");

				// change mode to 'visualization'
				oModeChangeEvent = new Event("testevent", this.oRta, { mode: "visualization" });
				this.oRta.getPopupManager()._onModeChange(oModeChangeEvent);
				assert.ok(oPopup.getModal(), "then the Popover is modal after switch to visualization mode");
				assert.strictEqual(this.fnToolsMenuBringToFrontSpy.callCount, 3, "then 'bringToFront' is called again");
				assert.notOk(this.oRta._oDesignTime.getElementOverlays()[0].getVisible(), "then the visibility from the main root control overlay is false");

				this.fnApplyPopupAttributes = sandbox.spy(this.oRta.getPopupManager(), "_applyPopupAttributes");
				done();
			}.bind(this));
			this.oPopover.openBy(oComponentContainer);
		});

		QUnit.test("when _onModeChange is called on a modal popover", function(assert) {
			var done = assert.async();
			// set the initial Modal state to "true"
			this.oPopover.setModal(true);

			this.oPopover.attachAfterOpen(function() {
				this.oRta.getPopupManager()._applyPopupAttributes.restore();
				var {oPopup} = this.oPopover;

				// change mode to 'adaptation'
				var oEvent = new Event("testevent", this.oRta, { mode: "adaptation" });
				this.oRta.getPopupManager()._onModeChange(oEvent);
				assert.ok(oPopup.getModal(), "then the Popover is modal after switch to adaptation mode");
				assert.notOk(this.oRta._oDesignTime.getElementOverlays()[0].getVisible(), "then the visibility from the main root control overlay is false");

				// change mode to 'navigation'
				oEvent = new Event("testevent", this.oRta, { mode: "navigation" });
				this.oRta.getPopupManager()._onModeChange(oEvent);
				assert.ok(oPopup.getModal(), "then the Popover is still modal after switch back to navigation mode");
				assert.ok(this.oRta._oDesignTime.getElementOverlays()[0].getVisible(), "then the visibility from the main root control overlay is true");

				// change mode to 'visualization'
				oEvent = new Event("testevent", this.oRta, { mode: "visualization" });
				this.oRta.getPopupManager()._onModeChange(oEvent);
				assert.ok(oPopup.getModal(), "then the Popover is modal after switch to visualization mode");
				assert.notOk(this.oRta._oDesignTime.getElementOverlays()[0].getVisible(), "then the visibility from the main root control overlay is false");

				done();
			}.bind(this));
			this.oPopover.openBy(oComponentContainer);
		});
	});

	// integration tests
	// when RTA is started and then dialogs are opened
	QUnit.module("Given RTA is started with an app containing dialog(s)", {
		beforeEach() {
			stubBefore(true/* bPersistenceAPI */, true/* bAppComponentForControl */, true/* bSettingsInstance */);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});
			this.oNonRtaDialog = new Dialog("nonRtaDialog");
			this.oDialog = new Dialog("testDialog");
			this.oDialog.addContent(new Form("formindialog"));
			oView.addDependent(this.oDialog);
			this.oButton = createDialogOpenButton.call(this);
			return this.oRta.start().then(spyBefore.bind(this));
		},
		afterEach() {
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
	}, function() {
		QUnit.test("when Dialog with the same app component is opened and then closed / destroyed", function(assert) {
			// to open the dialog
			this.oButton.firePress();
			var fnCloseDone = assert.async();
			this.oDialog.attachAfterOpen(function() {
				assert.strictEqual(this.fnCreateDialogSpy.callCount, 1, "then '_createPopupOverlays' called once");
				assert.notEqual(this.oRta._oDesignTime.getRootElements().map(function(oRootElement) {
					return oRootElement.getId();
				}).indexOf(this.oDialog.getId()), -1, "then the opened dialog was added as a root element");
				assert.ok(this.fnCreateDialogSpy.calledOn(this.oRta.getPopupManager()), "then '_createPopupOverlays' with the opened dialog");
				this.oRta._oDesignTime.attachEventOnce("synced", function() {
					assert.ok(findOverlay(this.oDialog, this.oRta._oDesignTime), "then overlay exists for root dialog element");
					assert.ok(findOverlay(Element.getElementById("formindialog"), this.oRta._oDesignTime), "then overlay exists for root dialog element");

					this.oDialog.attachAfterClose(function() {
						assert.notEqual(this.fnRemoveDialogInstanceSpy.callCount, 0, "then removeRootElement from DesignTime called at least once");
						assert.ok(this.fnRemoveDialogInstanceSpy.calledWith(this.oDialog), "then 'removeRootElement from DesignTime is called with the opened dialog");
						assert.strictEqual(this.oRta._oDesignTime.getRootElements().indexOf(this.oDialog.getId()), -1, "then the opened dialog is not present in the list of root elements");
						fnCloseDone();
					}.bind(this));
					this.oDialog.close();
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("when dialog with different app component is opened", function(assert) {
			var done = assert.async();
			this.oRta._oDesignTime.attachEventOnce("synced", function() {
				assert.notOk(findOverlay(this.oNonRtaDialog, this.oRta._oDesignTime), "then overlay does not exist for root dialog element");
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

	// Dialog open -> RTA started
	QUnit.module("Given that a dialog is open and then RTA is started", {
		beforeEach(assert) {
			stubBefore(true/* bPersistenceAPI */, true/* bAppComponentForControl */);

			this.oDialog = new Dialog("testDialog");
			oView.addDependent(this.oDialog);
			this.oButton = createDialogOpenButton.call(this);
			// to open the dialog
			this.oButton.firePress();
			var fnOpenDone = assert.async();
			this.oDialog.attachAfterOpen(function() {
				fnOpenDone();
			});
		},
		afterEach() {
			sandbox.restore();
			if (this.oDialog) {
				this.oDialog.destroy();
			}
			if (this.oButton) {
				this.oButton.destroy();
			}
		}
	}, function() {
		QUnit.test("when dialog with same app component is already open", function(assert) {
			var oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});
			var fnAfterRTA = function() {
				assert.notEqual(oRta._oDesignTime.getRootElements().map(function(oRootElement) {
					return oRootElement.getId();
				}).indexOf(this.oDialog.getId()), -1, "then the opened dialog was added as a root element");
				assert.ok(findOverlay(this.oDialog, oRta._oDesignTime), "then overlay exists for root dialog element");
				assert.notOk(oRta._oDesignTime.getElementOverlays()[0].getVisible(), "then the visibility from the main root control overlay is false");
				oRta.getDependent("toolbar").destroy();
				oRta.destroy();
			}.bind(this);

			return oRta.start().then(fnAfterRTA.bind(this));
		});
		QUnit.test("when a non-adaptable dialog is already open and RTA is started and stopped", function(assert) {
			var fnDone = assert.async();
			this.oDialog.isPopupAdaptationAllowed = function() {
				return false;
			};
			this.oDialog.oPopup.setModal(false);
			var oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
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
			this.oDialog.isPopupAdaptationAllowed = function() {
				return false;
			};
			this.oDialog.oPopup.setModal(false);
			var oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
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

	QUnit.module("Given RTA is started with an app containing dialog(s)", {
		beforeEach(assert) {
			stubBefore(true/* bPersistenceAPI */);

			// mock RTA instance
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});
			var done = assert.async();
			this.oNonRtaDialog = new Dialog("nonRtaDialog");
			oComp.runAsOwner(async function() {
				this.oCompContInside = new ComponentContainer("CompContInside", {
					component: new MockComponent("compInside")
				});
				await oViewPromise;
				oComp.byId("mockview").addContent(this.oCompContInside);
				this.oCompContInside.getComponentInstance().byId("mockview").addContent(this.oNonRtaDialog);
				done();
			}.bind(this));
		},
		afterEach() {
			if (this.oRta) {
				this.oRta.destroy();
			}
			this.oCompContInside.destroy();
			this.oNonRtaDialog.destroy();
		}
	}, function() {
		// _getComponentForControl
		QUnit.test("when _getComponentForControl is called with a dialog inside an embedded component", function(assert) {
			var sBaseCompId = this.oRta.getPopupManager()._getComponentForControl(this.oNonRtaDialog).getId();
			assert.strictEqual(sBaseCompId, oComp.getId(), "then base component id returned");
		});
	});

	QUnit.done(function() {
		PersistenceWriteAPI.save.restore();
		document.body.classList.remove("sapUiRtaMode");
		document.getElementById("qunit-fixture").style.display = "none";
	});
});