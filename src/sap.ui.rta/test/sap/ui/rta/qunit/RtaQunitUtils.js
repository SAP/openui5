sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function(
	Layer,
	FakeLrepConnectorSessionStorage,
	PersistenceWriteAPI,
	Component,
	ComponentContainer,
	QUnitUtils,
	KeyCodes
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

	RtaQunitUtils.clear = function (oSelector) {
		oSelector = oSelector || sap.ui.getCore().getComponent("Comp1");
		return Promise.all([
			PersistenceWriteAPI.save({selector: oSelector, layer: Layer.CUSTOMER}),
			PersistenceWriteAPI.save({selector: oSelector, layer: Layer.USER})
		])
		.then(
			Promise.all([
				PersistenceWriteAPI.reset({selector: oSelector, layer: Layer.CUSTOMER, generator: "Change.createInitialFileContent"}),
				PersistenceWriteAPI.reset({selector: oSelector, layer: Layer.USER, generator: "Change.createInitialFileContent"})
			])
		);
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

	return RtaQunitUtils;
});
