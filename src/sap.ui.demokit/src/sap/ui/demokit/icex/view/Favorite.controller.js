/*!
 * @copyright@
 */

sap.ui.controller("sap.ui.demokit.icex.view.Favorite", {

	onInit : function() {
		
		// init UI model
		this.toggleUiModel();
		
		// remove footer on phone
		if (sap.ui.Device.system.phone) {
			this.getView().byId("page").destroyFooter();
		}
	},
	
	toggleUiModel : function() {
		
		//this.getView().setModel(sap.ui.getCore().getModel("fav"), "fav");
		
		var model = this.getView().getModel("ui");
		if (!model) {
			
			// init
			model = new sap.ui.model.json.JSONModel({
				inEdit : false,
				inDisplay : true,
				listMode : (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType : (sap.ui.Device.system.phone) ? "Active" : "Inactive"
			});
			this.getView().setModel(model, "ui");
		
		} else {
			
			// toggle
			var data = model.getData();
			var _listMode;
			var _listItemType;
			
			if (data.inDisplay) {
				_listMode = "Delete";
				_listItemType = "Inactive";
			} else {
				_listMode = (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster"; 
				_listItemType = (sap.ui.Device.system.phone) ? "Active" : "Inactive";
			}
			
			model.setData({
				inEdit : data.inDisplay,
				inDisplay : data.inEdit,
				listMode : _listMode,
				listItemType : _listItemType
			});
		}
	},
	
	navBack : function(evt) {
		var bus = this.getOwnerComponent().getEventBus();
		bus.publish("nav", "back");
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
		var bus = this.getOwnerComponent().getEventBus();
		bus.publish("nav", "to", {
			id : "Detail"
		});
		
		// tell detail to update
		bus.publish("app", "RefreshDetail", {
			name : item.getBindingContext("fav").getObject().name
		});
	}
});