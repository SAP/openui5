sap.ui.define([

], function () {
  "use strict";
  // Note: the HTML page 'Shell.html' loads this module via data-sap-ui-on-init

  (function() {
	  sap.ui.require([
		  "sap/ui/core/Core",
		  "sap/ui/core/Theming",
		  "sap/ui/core/mvc/XMLView",
		  "sap/ui/core/mvc/Controller"
	  ], function(Core, Theming, XMLView, Controller) {
		  "use strict";

		  Controller.extend("myController", {
			  onInit() {
				  this.sTheme = "sap_horizon";
			  },
			  changeTheme: function() {
				  this.sTheme = this.sTheme == "sap_horizon_dark" ? "sap_horizon" : "sap_horizon_dark";
				  return Theming.setTheme(this.sTheme);
			  }
		  });

		  Core.ready(function() {
			  XMLView.create({
				  definition: '<mvc:View controllerName="myController" xmlns:mvc="sap.ui.core.mvc" height="100%">' +
					  '<Shell xmlns="sap.m" logo="images/Woman_avatar_01.png" showLogout="false">' +
						  '<App autoFocus="false">' +
							  '<Button id="btnChangeTheme" press="changeTheme" text="Change Theme"></Button>' +
						  '</App>' +
					  '</Shell>' +
				  '</mvc:View>',
			  }).then(function(oView) {
				  oView.placeAt("content");
			  });
		  })
	  });
  })();
});