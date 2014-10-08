// For Feedback after Menu-Item Click
jQuery.sap.require("sap.m.MessageToast");

sap.ui.controller("sap.ui.unified.sample.MenuItemEventing.MenuItemEventing", {
	handlePressOpenMenu: function(oEvent) {
		var oButton = oEvent.getSource();

		// create menu only once
		if (!this._menu) {
			this._menu = sap.ui.xmlfragment(
				"sap.ui.unified.sample.MenuItemEventing.MenuItemEventing",
				this
			);
			this.getView().addDependent(this._menu);
		}

		var eDock = sap.ui.core.Popup.Dock;
		this._menu.open(false, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
	},
	
	handleMenuItemPress: function(oEvent) {
		var msg = "'" + oEvent.getParameter("item").getText() + "' pressed";
	    sap.m.MessageToast.show(msg);
	},
	
	handleTextFieldItemPress: function(oEvent) {
		var msg = "'" + oEvent.getParameter("item").getValue() + "' entered";
	    sap.m.MessageToast.show(msg);
	}
	
});