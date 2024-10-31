sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/Popup'
	], function(MessageToast, Fragment, Controller, Popup) {
	"use strict";

	return Controller.extend("sap.ui.unified.sample.MenuItemEventing.MenuItemEventing", {

		onInit: function(){
			this.byId("openMenu").attachBrowserEvent("tab keyup", function(oEvent){
				this._bKeyboard = oEvent.type === "keyup";
			}, this);
		},

		handlePressOpenMenu: function(oEvent) {
			var oButton = oEvent.getSource();

			// create menu only once
			if (!this._menu) {
				Fragment.load({
					name: "sap.ui.unified.sample.MenuItemEventing.MenuItemEventing",
					controller: this
				}).then(function(oMenu){
					this._menu = oMenu;
					this.getView().addDependent(this._menu);
					this._menu.open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
				}.bind(this));
			} else {
				this._menu.open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
			}
		},

		handleMenuItemPress: function(oEvent) {
			MessageToast.show("'" + oEvent.getParameter("item").getText() + "' pressed");
		},

		handleTextFieldItemPress: function(oEvent) {
			MessageToast.show("'" + oEvent.getParameter("item").getValue() + "' entered");
		}

	});

});
