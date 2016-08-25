/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"],
function (Controller, JSONModel, Device) {
	"use strict";

	return Controller.extend("sap.ui.demokit.icex.view.Favorite", {

		onInit : function() {
			this._initUiModel();
			this.getView().addEventDelegate({
				onBeforeShow : function(evt) {
					this.updatePageTitle();
				}.bind(this)
			});
		},

		_initUiModel : function () {
			var oModel = new JSONModel({
				inEdit : false,
				inDisplay : true,
				listMode : (Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType : (Device.system.phone) ? "Active" : "Inactive",
				showToolbar : (Device.system.phone) ? false : true
			});
			this.getView().setModel(oModel, "ui");
		},

		toggleUiModel : function() {

			var model = this.getView().getModel("ui");

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
		},

		updatePageTitle : function () {
			var oFavModel = this.getView().getModel("fav"),
				iCount = oFavModel.getData().count,
				oBundle = this.getView().getModel("i18n").getResourceBundle(),
				sTitle = oBundle.getText("favoritesPageTitle", [ iCount ]);
			this.getView().byId("page").setTitle(sTitle);
		},

		navBack : function(evt) {
			this.getOwnerComponent().getEventBus().publish("nav", "back");
		},

		deleteIconList : function(evt) {
			var name = evt.getParameter("listItem").getTitle();
			this.getView().getModel("fav").toggleFavorite(name);
			this.updatePageTitle();
		},

		selectIconList : function(evt) {
			this._showDetail(evt.getParameter("listItem"));
		},

		pressIconListItem : function(evt) {
			this._showDetail(evt.getSource());
		},

		_showDetail : function(item) {

			var oBus = this.getOwnerComponent().getEventBus();

			// tell app controller to navigate
			oBus.publish("nav", "to", {
				id : "Detail"
			});

			// tell detail to update
			oBus.publish("app", "RefreshDetail", {
				name : item.getBindingContext("fav").getObject().name
			});
		}
	});
});
