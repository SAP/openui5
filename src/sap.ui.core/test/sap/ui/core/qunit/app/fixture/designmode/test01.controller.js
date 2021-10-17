sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	return Controller.extend("test.designmode.test01", {

	// lifecycle hooks
		onInit : function() {
			return "aString";
		},

		onExit : function(){
			return "aString";
		},

		onBeforeRendering : function(){
			return "aString";
		},

		onAfterRendering : function(){
			return "aString";
		},

	//other methods
		method1: function() {
			return "aString";
		},

		method2: function() {
			return "aString";
		},

		onPress : function() {

		}

	});

});