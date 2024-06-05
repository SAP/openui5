sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/Fragment'
], function(Controller, Fragment) {
		"use strict";

		return Controller.extend("sap.m.sample.MenuSelectable.Page", {
			onPress: function () {
				var oView = this.getView(),
					oButton = oView.byId("button");

				if (!this._oMenuFragment) {
					this._oMenuFragment = Fragment.load({
						id: oView.getId(),
						name: "sap.m.sample.MenuSelectable.Menu",
						controller: this
					}).then(function(oMenu) {
						oMenu.openBy(oButton);
						this._oMenuFragment = oMenu;
						return this._oMenuFragment;
					}.bind(this));
				} else {
					this._oMenuFragment.openBy(oButton);
				}
			}
		});

	});