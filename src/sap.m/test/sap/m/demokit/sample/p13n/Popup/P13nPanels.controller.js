sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.Popup.Page", {

		onInit: function() {
			this._oCurrentP13nData = null;
			this.getView().setModel(new JSONModel({
				dialogMode: true,
				listLayout: true
			}));

			this._bIsOpen = false;
		},

		_initialData: {
			columns: [
				{visible: true, name: "key1", label: "City"},
				{visible: false, name: "key2", label: "Country"},
				{visible: false, name: "key3", label: "Region"}
			],
			sort: [
				{sorted: true, name: "key1", label: "City", descending: true},
				{sorted: false, name: "key2", label: "Country", descending: false},
				{sorted: false, name: "key3", label: "Region", descending: false}
			],
			group: [
				{grouped: true, name: "key1", label: "City"},
				{grouped: false, name: "key2", label: "Country"},
				{grouped: false, name: "key3", label: "Region"}
			]
		},

		_setInitialData: function() {
			var oView = this.getView();

			var oSelectionPanel = oView.byId("columnsPanel");
			var oSortPanel = oView.byId("sortPanel");
			var oGroupPanel = oView.byId("groupPanel");

			oSelectionPanel.setP13nData(this._initialData.columns);
			oSortPanel.setP13nData(this._initialData.sort);
			oGroupPanel.setP13nData(this._initialData.group);
		},

		onContainerOpen: function(oEvt) {
			var oView = this.getView();
			var oPopup = oView.byId("p13nPopup");
			if (!this._bIsOpen) {
				this._setInitialData();
				this._bIsOpen = true;
			}

			oPopup.open(oEvt.getSource());
		},

		onClose: function(oEvt) {
			var sReason = oEvt.getParameter("reason");
			MessageToast.show("Dialog close reason: " + sReason);
		},

		reset: function(oEvt) {
			this._setInitialData();
			this.parseP13nState();
		},

		parseP13nState: function(oEvt) {

			if (oEvt) {
				MessageToast.show("P13n panel change reason:" + oEvt.getParameter("reason"));
			}

			var oView = this.getView();
			var oEditor = oView.byId("p13nEditor");

			var oP13nState = {
				columns:  oView.byId("columnsPanel").getP13nData(),
				sort: oView.byId("sortPanel").getP13nData(),
				group: oView.byId("groupPanel").getP13nData()
			};

			oEditor.setValue(JSON.stringify(oP13nState, null, '  '));
		}
	});
});
