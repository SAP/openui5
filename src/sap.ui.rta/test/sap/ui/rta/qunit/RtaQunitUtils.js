sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/RuntimeAuthoring"
], function(
	JsControlTreeModifier,
	ComponentContainer,
	Component,
	KeyCodes,
	Layer,
	flUtils,
	FlexState,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	FakeLrepConnectorSessionStorage,
	QUnitUtils,
	RuntimeAuthoring
) {
	"use strict";

	function disableRtaRestart() {
		RuntimeAuthoring.disableRestart(Layer.CUSTOMER);
		RuntimeAuthoring.disableRestart(Layer.USER);
	}

	var RtaQunitUtils = {};

	RtaQunitUtils.renderTestModuleAt = function(sNamespace, sDomId) {
		disableRtaRestart();
		var oComp = sap.ui.getCore().createComponent({
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
		sap.ui.getCore().applyChanges();

		return oCompCont;
	};

	RtaQunitUtils.clear = function (oElement, bRevert) {
		var oComponent = (oElement && flUtils.getAppComponentForControl(oElement)) || sap.ui.getCore().getComponent("Comp1");
		var aCustomerChanges;

		return FlexState.initialize({
			componentId: oComponent.getId()
		}).then(function() {
			return PersistenceWriteAPI.save({selector: oComponent, layer: Layer.CUSTOMER});
		})
		.then(function (aChanges) {
			aCustomerChanges = aChanges;
			return PersistenceWriteAPI.save({selector: oComponent, layer: Layer.USER});
		})
		.then(function (aUserChangesChanges) {
			if (bRevert) {
				return aCustomerChanges.concat(aUserChangesChanges).reverse()
					.filter(function (oChange) {
						//skip descriptor changes
						return !oChange.getDefinition().appDescriptorChange;
					})
					.reduce(function (oPreviousPromise, oChange) {
						var oElementToBeReverted = JsControlTreeModifier.bySelector(oChange.getSelector(), oComponent);
						return ChangesWriteAPI.revert({
							element: oElementToBeReverted,
							change: oChange
						});
					}, new flUtils.FakePromise());
			}
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

	RtaQunitUtils.getNumberOfChangesForTestApp = function () {
		return FakeLrepConnectorSessionStorage.forTesting.getNumberOfChanges("sap.ui.rta.qunitrta.Component");
	};

	RtaQunitUtils.spySessionStorageWrite = function(sandbox, assert) {
		return FakeLrepConnectorSessionStorage.forTesting.spyWrite(sandbox, assert);
	};

	RtaQunitUtils.renderTestAppAtAsync = function(sDomId) {
		disableRtaRestart();
		sap.ui.getCore().getConfiguration().setFlexibilityServices([{
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
				sap.ui.getCore().applyChanges();

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
				sap.ui.getCore().applyChanges();
				return oComponentContainer;
			});
	};

	RtaQunitUtils.openContextMenuWithKeyboard = function(oTarget) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins()["contextMenu"].attachEventOnce("openedContextMenu", resolve);

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
			this.oRta.getPlugins()["contextMenu"].attachEventOnce("openedContextMenu", resolve);

			var clock = sinon.useFakeTimers();
			QUnitUtils.triggerMouseEvent(oTarget.getDomRef(), "contextmenu");
			clock.tick(50);
			clock.restore();
		}.bind(this));
	};

	RtaQunitUtils.closeContextMenuWithKeyboard = function(oTarget) {
		return new Promise(function(resolve) {
			var oPopover = oTarget.getPopover();
			if (!oPopover.isOpen()) {
				return resolve();
			}
			oPopover.attachEventOnce("afterClose", resolve);

			oPopover.focus();
			var oParams = {};
			oParams.keyCode = KeyCodes.ESCAPE;
			QUnitUtils.triggerEvent("keyup", oPopover.getDomRef(), oParams);
		});
	};

	RtaQunitUtils.getContextMenuItemCount = function(oTarget) {
		return new Promise(function(resolve) {
			var iItemCount;
			oTarget.focus();
			oTarget.setSelected();
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, oTarget)
				.then(function () {
					var oContextMenuControl = this.oRta.getPlugins()["contextMenu"].oContextMenuControl;
					iItemCount = oContextMenuControl.getButtons().length;
					return oContextMenuControl;
				}.bind(this))
				.then(RtaQunitUtils.closeContextMenuWithKeyboard)
				.then(function () {
					resolve(iItemCount);
				});
		}.bind(this));
	};

	return RtaQunitUtils;
});