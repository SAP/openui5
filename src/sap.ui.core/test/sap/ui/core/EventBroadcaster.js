// Note: the HTML page 'EventBroadcaster.html' loads this module via data-sap-ui-on-init

sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/mvc/XMLView', 'sap/ui/core/support/usage/EventBroadcaster', 'sap/ui/core/mvc/Controller', 'sap/m/ColumnListItem', 'sap/m/Text', 'sap/m/MessageToast', "sap/ui/thirdparty/jquery"],
	function(Core, XMLView, EventBroadcaster, Controller, ColumnListItem, Text, MessageToast, jQuery) {
		"use strict";

		Core.ready().then(function () {
		var oTable;

		var BroadcasterController = Controller.extend("eventBroadcasterTestController", {
			onInit: function () {
				oTable = this.getView().byId("log");
			},
			enableDisableCustomEvents: function (oEvent) {
				if (oEvent.getParameter("state")) {
					EventBroadcaster.enable();
				} else {
					EventBroadcaster.disable();
				}
			},
			attachDetachListener: function (oEvent) {
				if (oEvent.getParameter("state")) {
					window.addEventListener("UI5Event", this._fnListener);
				} else {
					window.removeEventListener("UI5Event", this._fnListener);
				}
			},
			clearRows: function () {
				oTable.destroyItems();
			},
			_fnListener: function (oEvent) {
				var oEvtDetail = oEvent.detail;
				oTable.insertItem(new ColumnListItem({
					cells: [
						new Text({text: new Date(oEvtDetail.timestamp) + "(" + oEvtDetail.timestamp + ")"}),
						new Text({text: oEvtDetail.eventName}),
						new Text({text: oEvtDetail.targetId}),
						new Text({text: oEvtDetail.targetType}),
						new Text({text: oEvtDetail.componentId}),
						new Text({text: oEvtDetail.componentVersion})
					]
				}, 0));
			},
			setExcludeListConfig: function () {
				var oConfig;
				try {
					oConfig = JSON.parse(this.getView().byId("txtConfig").getValue());
					EventBroadcaster.setEventsExcludeList(oConfig);
				} catch (e) {
					MessageToast.show("Please enter valid JSON." + e.message);
				}
			},
			getExcludeListConfig: function () {
				this.getView().byId("txtConfig").setValue(JSON.stringify(EventBroadcaster.getEventsExcludeList()));
			}
		});

		XMLView.create({
			id: "eventBroadcasterTestView",
			definition: jQuery('#myXml').html(),
			controller: new BroadcasterController()
		}).then(function (oView) {
			oView.placeAt("content");
		});
	});
});