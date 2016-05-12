/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/Device"], function (Controller, JSONModel, Device) {
	"use strict";

	return Controller.extend("sap.ui.demokit.icex.view.Favorite", {

		onInit : function() {

			// init UI model
			this.toggleUiModel();

			this.oBus = this.getOwnerComponent().getEventBus();

		},

		toggleUiModel : function() {

			var model = this.getView().getModel("ui");
			if (!model) {

				// init
				model = new JSONModel({
					inEdit : false,
					inDisplay : true,
					listMode : (Device.system.phone) ? "None" : "SingleSelectMaster",
					listItemType : (Device.system.phone) ? "Active" : "Inactive",
					showToolbar : (Device.system.phone) ? false : true
				});
				this.getView().setModel(model, "ui");

			} else {

				// toggle
				var data = model.getData();
				var _listMode;
				var _listItemType;
				var _showToolbar = true;

				if (data.inDisplay) {
					_listMode = "Delete";
					_listItemType = "Inactive";
				} else {
					_listMode = (Device.system.phone) ? "None" : "SingleSelectMaster";
					_listItemType = (Device.system.phone) ? "Active" : "Inactive";
					_showToolbar = (Device.system.phone) ? false : true;
				}

				model.setData({
					inEdit : data.inDisplay,
					inDisplay : data.inEdit,
					listMode : _listMode,
					listItemType : _listItemType,
					showToolbar : _showToolbar
				});
			}
		},

		navBack : function(evt) {
			this.oBus.publish("nav", "back");
		},

		deleteIconList : function(evt) {
			var name = evt.getParameter("listItem").getTitle();
			this.getView().getModel("fav").toggleFavorite(name);
		},

		selectIconList : function(evt) {
			this._showDetail(evt.getParameter("listItem"));
		},

		pressIconListItem : function(evt) {
			this._showDetail(evt.getSource());
		},

		_showDetail : function(item) {

			// tell app controller to navigate
			this.oBus.publish("nav", "to", {
				id : "Detail"
			});

			// tell detail to update
			this.oBus.publish("app", "RefreshDetail", {
				name : item.getBindingContext("fav").getObject().name
			});
		}
	});
});
