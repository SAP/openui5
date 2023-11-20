sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/ControllerExtension',
	'sap/m/Button',
	'sap/m/MessageToast'
], function (Controller, ControllerExtension, Button, MessageToast) {
	"use strict";

	return ControllerExtension.extend('com.sap.industry.oil.OilExtension', {
		//adding a life cycle method
		onInit: function() {
			var oView = this.base.getView();
			oView.byId("box").addItem(new Button({
				id: oView.createId("com.sap.industry.oil:buttonId"),
				text: {
					path:'/txt',
					formatter: this.formatButtonText.bind(this)
				},
				press: [this._sayHello, this]
			}));
			//adding a member
			this.setting = "com.sap.industry.oil provides text to say Hello";
		},
		//add a method
		sayHello : function() {
			this._sayHello();
			MessageToast.show("OIL says Hello" + this.formatButtonText("sdfsdf"));
		},
		_sayHello : function() {
			MessageToast.show("OIL says Hello" + this.formatButtonText("sdfsdf"));
		},
		//add a formatter
		formatButtonText : function(sTxt) {
			MessageToast.show(this.setting);
			this.setting = this.setting + this.base.getView().getId();
			return "OIL " + sTxt + " -> " + this.base.formatButtonText("");
		},
		//override an existing method of the Main.controller
		override: {
			provideText : function() {
				return this.setting;
			}
		}
	});
});