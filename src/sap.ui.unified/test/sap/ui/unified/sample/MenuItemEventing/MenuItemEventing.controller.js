sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(MessageToast, Fragment, Controller) {
	"use strict";

	var MenuItemEventingController = Controller.extend("sap.ui.unified.sample.MenuItemEventing.MenuItemEventing", {

		onInit: function(){
			this.byId("openMenu").attachBrowserEvent("tab keyup", function(oEvent){
				this._bKeyboard = oEvent.type == "keyup";
			}, this);
		},

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
			this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},

		handleMenuItemPress: function(oEvent) {
			var msg = "'" + oEvent.getParameter("item").getText() + "' pressed";
			MessageToast.show(msg);
		},

		handleTextFieldItemPress: function(oEvent) {
			var msg = "'" + oEvent.getParameter("item").getValue() + "' entered";
			MessageToast.show(msg);
		}

	});

	return MenuItemEventingController;

});
