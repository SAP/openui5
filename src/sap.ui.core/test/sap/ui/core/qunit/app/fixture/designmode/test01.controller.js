sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	return Controller.extend("test.designmode.test01", {

	// lifecycle hooks
		onInit : function() {
			this._onInitCalled = true;
		},

		onExit : function(){
			this._onExitCalled = true;
		},

		onBeforeRendering : function(){
			this._onBeforeRenderingCalled = true;
		},

		onAfterRendering : function(){
			this._onAfterRenderingCalled = true;
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