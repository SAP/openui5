sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/ControllerExtension',
	'sap/m/Button',
	'sap/m/MessageToast'
], function (Controller, ControllerExtension, Button, MessageToast) {
	"use strict";

	return ControllerExtension.extend('com.sap.industry.retail.RetailExtension', {
		//adding a life cycle method
		onInit: function() {
			var oView = this.base.getView();
			oView.byId("box").addItem(new Button({
				id: oView.createId("ext.com.sap.industry.retail:buttonId"),
				text: {
					path:'/txt',
					formatter: this._formatButtonText.bind(this) //use a private formatter
				},
				press: [this._sayHello, this] //attach to a private method
			}));
		},
		//add a method
		sayHello : function() {
			this._sayHello();
			MessageToast.show("RETAIL tries to access oil");
			try {
				this.base.ext.com.sap.industry.oil._sayHello();
			} catch (ex) {
				MessageToast.show("OIL denied access to a private method");
				this.base.ext.com.sap.industry.oil.sayHello();
			}

		},
		_sayHello : function() {
			MessageToast.show("RETAIL says Hello" + this._formatButtonText("sdfsdf"));
		},
		//add a formatter
		_formatButtonText : function(sTxt) {
			return "RETAIL " + sTxt + " -> " + this.base.formatButtonText("");
		},
		//override an existing method of the Main.controller
		override: {
			provideText : function() {
				return "com.sap.industry.retail provides text to say Hello";
			}
		}
	});
});
