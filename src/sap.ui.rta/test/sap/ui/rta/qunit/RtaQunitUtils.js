sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	Layer,
	flUtils,
	FakeLrepConnectorSessionStorage,
	PersistenceWriteAPI,
	ChangesWriteAPI,
	Component,
	ComponentContainer,
	QUnitUtils,
	KeyCodes,
	JsControlTreeModifier
) {
	"use strict";

	var RtaQunitUtils = {};

	RtaQunitUtils.renderTestModuleAt = function(sNamespace, sDomId) {
		var oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.qunitrta",
			id : "Comp1",
			settings : {
				componentData : {
					showAdaptButton : true
				}
			}
		});

		var oCompCont = new ComponentContainer({
			component: oComp
		}).placeAt(sDomId);
		sap.ui.getCore().applyChanges();

		return oCompCont;
	};

	RtaQunitUtils.renderTestAppAt = function(sDomId) {
		FakeLrepConnectorSessionStorage.enableFakeConnector();

		var oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.qunitrta",
			id : "Comp1",
			settings : {
				componentData : {
					showAdaptButton : true
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

		return Promise.all([
			PersistenceWriteAPI.save({selector: oComponent, layer: Layer.CUSTOMER}),
			PersistenceWriteAPI.save({selector: oComponent, layer: Layer.USER})
		])
			.then(function (aSavedChanges) {
				if (bRevert) {
					return aSavedChanges[0].concat(aSavedChanges[1]).reverse()
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
			.then(function () {
				return Promise.all([
					PersistenceWriteAPI.reset({
						selector: oComponent,
						layer: Layer.CUSTOMER,
						generator: "Change.createInitialFileContent"
					}),
					PersistenceWriteAPI.reset({
						selector: oComponent,
						layer: Layer.USER,
						generator: "Change.createInitialFileContent"
					})
				]);
			});
	};

	RtaQunitUtils.getNumberOfChangesForTestApp = function () {
		return FakeLrepConnectorSessionStorage.forTesting.getNumberOfChanges("sap.ui.rta.qunitrta.Component");
	};

	RtaQunitUtils.spySessionStorageWrite = function(sandbox, assert) {
		return FakeLrepConnectorSessionStorage.forTesting.spyWrite(sandbox, assert);
	};

	RtaQunitUtils.renderTestAppAtAsync = function(sDomId) {
		FakeLrepConnectorSessionStorage.enableFakeConnector();

		return Component.create({
			name : "sap.ui.rta.qunitrta",
			id : "Comp1",
			settings : {
				componentData : {
					showAdaptButton : true
				}
			}
		})
		.then(function(oComponent) {
			return new ComponentContainer({
				component : oComponent,
				async: true
			});
		})
		.then(function(oComponentContainer) {
			oComponentContainer.placeAt(sDomId);
			sap.ui.getCore().applyChanges();

			return oComponentContainer;
		});
	};

	RtaQunitUtils.renderRuntimeAuthoringAppAt = function(sDomId) {
		var oComp = sap.ui.getCore().createComponent({
			name : "sap.ui.rta.test",
			id : "Comp1",
			settings : {
				componentData : {
					showAdaptButton : true,
					useSessionStorage: true
				}
			}
		});

		var oCompCont = new ComponentContainer({
			component: oComp
		}).placeAt(sDomId);
		sap.ui.getCore().applyChanges();

		return oCompCont;
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
