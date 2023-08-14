sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/core/Core",
	"sap/ui/core/UIComponent",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/RuntimeAuthoring",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	JsControlTreeModifier,
	ComponentContainer,
	Component,
	Core,
	UIComponent,
	KeyCodes,
	Layer,
	flUtils,
	FlexObjectFactory,
	FlexState,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	JSONModel,
	QUnitUtils,
	RuntimeAuthoring,
	FlexTestAPI,
	FlQUnitUtils
) {
	"use strict";

	function disableRtaRestart() {
		RuntimeAuthoring.disableRestart(Layer.CUSTOMER);
		RuntimeAuthoring.disableRestart(Layer.USER);
	}

	var RtaQunitUtils = {};

	RtaQunitUtils.renderTestModuleAt = function(sNamespace, sDomId) {
		disableRtaRestart();
		var oComp = Component.create({
			name: "sap.ui.rta.qunitrta",
			id: "Comp1",
			settings: {
				componentData: {
					showAdaptButton: true
				}
			}
		});

		var oCompCont = new ComponentContainer({
			component: oComp
		}).placeAt(sDomId);
		Core.applyChanges();

		return oCompCont;
	};

	RtaQunitUtils.clear = function(oElement, bRevert) {
		var oComponent = (oElement && flUtils.getAppComponentForControl(oElement)) || Component.get("Comp1");
		var aCustomerChanges;

		return FlexState.initialize({
			componentId: oComponent.getId()
		}).then(function() {
			return PersistenceWriteAPI.save({selector: oComponent, layer: Layer.CUSTOMER});
		})
		.then(function(aChanges) {
			aCustomerChanges = aChanges;
			return PersistenceWriteAPI.save({selector: oComponent, layer: Layer.USER});
		})
		.then(function(aUserChangesChanges) {
			if (bRevert) {
				return aCustomerChanges.concat(aUserChangesChanges).reverse()
				.filter(function(oChange) {
					// skip descriptor changes
					return !oChange.isA("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange");
				})
				.reduce(function(oPreviousPromise, oChange) {
					var oElementToBeReverted = JsControlTreeModifier.bySelector(oChange.getSelector(), oComponent);
					return ChangesWriteAPI.revert({
						element: oElementToBeReverted,
						change: oChange
					});
				}, Promise.resolve());
			}
			return undefined;
		})
		.then(PersistenceWriteAPI.reset.bind(undefined, {
			selector: oComponent,
			layer: Layer.CUSTOMER,
			generator: "Change.createInitialFileContent"
		}))
		.then(PersistenceWriteAPI.reset.bind(undefined, {
			selector: oComponent,
			layer: Layer.USER,
			generator: "Change.createInitialFileContent"
		}));
	};

	RtaQunitUtils.getNumberOfChangesForTestApp = function() {
		return FlexTestAPI.getNumberOfStoredChanges("SessionStorage", "sap.ui.rta.qunitrta.Component");
	};

	RtaQunitUtils.renderTestAppAtAsync = function(sDomId) {
		disableRtaRestart();
		Core.getConfiguration().setFlexibilityServices([{
			connector: "SessionStorageConnector"
		}]);

		return Component.create({
			name: "sap.ui.rta.qunitrta",
			id: "Comp1",
			settings: {
				componentData: {
					showAdaptButton: true
				}
			}
		})
		.then(function(oComponent) {
			return oComponent.oView
			.then(function() {
				return new ComponentContainer({
					component: oComponent,
					async: true
				});
			});
		})
		.then(function(oComponentContainer) {
			oComponentContainer.placeAt(sDomId);
			Core.applyChanges();

			return oComponentContainer;
		});
	};

	RtaQunitUtils.renderRuntimeAuthoringAppAt = function(sDomId) {
		disableRtaRestart();
		return Component.create({
			name: "sap.ui.rta.test",
			id: "Comp1",
			settings: {
				componentData: {
					showAdaptButton: true,
					useSessionStorage: true
				}
			}
		})
		.then(function(oComponent) {
			return oComponent.oView
			.then(function() {
				return new ComponentContainer({
					component: oComponent,
					async: true
				});
			});
		})
		.then(function(oComponentContainer) {
			oComponentContainer.placeAt(sDomId);
			Core.applyChanges();
			return oComponentContainer;
		});
	};

	RtaQunitUtils.openContextMenuWithKeyboard = function(oTarget) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", resolve);
			var oParams = {};
			oParams.keyCode = KeyCodes.F10;
			oParams.which = oParams.keyCode;
			oParams.shiftKey = true;
			oParams.altKey = false;
			oParams.metaKey = false;
			oParams.ctrlKey = false;
			QUnitUtils.triggerEvent("keyup", oTarget.getDomRef(), oParams);
		}.bind(this));
	};

	RtaQunitUtils.openContextMenuWithClick = function(oTarget, sinon) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", resolve);

			var clock = sinon.useFakeTimers();
			QUnitUtils.triggerMouseEvent(oTarget.getDomRef(), "contextmenu");
			clock.tick(50);
			clock.restore();
		}.bind(this));
	};

	RtaQunitUtils.closeContextMenu = function(oTarget) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("closedContextMenu", resolve);
			oTarget.close();
		}.bind(this));
	};

	RtaQunitUtils.getContextMenuItemCount = function(oTarget) {
		return new Promise(function(resolve) {
			var iItemCount;
			oTarget.focus();
			oTarget.setSelected(true);
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, oTarget)
			.then(function() {
				var {oContextMenuControl} = this.oRta.getPlugins().contextMenu;
				iItemCount = oContextMenuControl.getItems().length;
				return oContextMenuControl;
			}.bind(this))
			.then(RtaQunitUtils.closeContextMenu.bind(this))
			.then(function() {
				resolve(iItemCount);
			});
		}.bind(this));
	};

	RtaQunitUtils.createAndStubAppComponent = function(sandbox, sId, oManifest, oContent) {
		sId ||= "someName";
		oManifest ||= {
			"sap.app": {
				id: sId
			}
		};
		var Component = UIComponent.extend("component", {
			metadata: {
				manifest: oManifest
			},
			createContent() {
				return oContent;
			}
		});

		var oComponent = new Component(sId);
		sandbox.stub(flUtils, "getAppComponentForControl").returns(oComponent);
		oComponent._restoreGetAppComponentStub = flUtils.getAppComponentForControl.restore;
		return oComponent;
	};

	RtaQunitUtils.createUIChange = function(oFileContent) {
		return FlexObjectFactory.createFromFileContent(oFileContent);
	};

	RtaQunitUtils.stubSapUiRequire = function(...aArgs) {
		return FlQUnitUtils.stubSapUiRequire.apply(undefined, aArgs);
	};

	RtaQunitUtils.showActionsMenu = function(oToolbar) {
		return oToolbar.showActionsMenu({
			getSource() {
				return oToolbar.getControl("actionsMenu");
			}
		});
	};

	RtaQunitUtils.createToolbarControlsModel = function() {
		return new JSONModel({
			modeSwitcher: "adaptation",
			undo: {
				enabled: false
			},
			redo: {
				enabled: false
			},
			save: {
				enabled: false
			},
			restore: {
				enabled: false
			},
			appVariantMenu: {
				overview: {
					visible: false,
					enabled: false
				},
				saveAs: {
					visible: false,
					enabled: false
				},
				manageApps: {
					visible: false,
					enabled: false
				}
			},
			contextBasedAdaptation: {
				visible: false,
				enabled: false
			},
			actionsMenuButton: {
				enabled: true
			},
			visualizationButton: {
				visible: false,
				enabled: false
			}
		});
	};

	return RtaQunitUtils;
});
