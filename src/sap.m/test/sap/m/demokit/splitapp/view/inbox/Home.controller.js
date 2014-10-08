sap.ui.controller("view.inbox.Home", {
	
	onInit : function () {
		this.router = sap.ui.core.UIComponent.getRouterFor(this);
	},
	
	onListItemTap: function(oEvent){
		var sTitle = oEvent.getSource().getTitle(), 
			sFilterProperty;
		if(sTitle === "Unread"){
			sFilterProperty = "unread";
		} else if (sTitle === "Important"){
			sFilterProperty = "important";
		}
		
		this.router.navTo("inbox", {inboxType:sFilterProperty});
	}
});