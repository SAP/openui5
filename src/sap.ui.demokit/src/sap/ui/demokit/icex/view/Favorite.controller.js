/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
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
				model = new sap.ui.model.json.JSONModel({
					inEdit : false,
					inDisplay : true,
					listMode : (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
					listItemType : (sap.ui.Device.system.phone) ? "Active" : "Inactive",
					showToolbar : (sap.ui.Device.system.phone) ? false : true
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
					_listMode = (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster"; 
					_listItemType = (sap.ui.Device.system.phone) ? "Active" : "Inactive";
					_showToolbar = (sap.ui.Device.system.phone) ? false : true;
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
