// Note: the HTML page 'GenericEventBinding.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Rendering",
	"sap/m/Input",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout"
], function(
	Core,
	Rendering,
	Input,
	Button,
	HorizontalLayout
) {
	"use strict";
	Core.ready().then(function() {
		function scream() {
			//eslint-disable-next-line no-alert
			alert("Help! I've lost focus!");
		}
		function scream2() {
			//eslint-disable-next-line no-alert
			alert("HEEEEEEELP! I'VE LOST FOCUS!");
		}

		var oTf1 = new Input("tf1").attachBrowserEvent("focusout", scream);
		oTf1.placeAt("uiArea1");

		var oBtn = new Button("btn1", {text : "Bind focusout event"});
		oBtn.attachPress(function(){
			oTf2.attachBrowserEvent("focusout", scream);
		});

		var oBtn2 = new Button("btn2", {text : "Bind another, more INTENSE focusout event"});
		oBtn2.attachPress(function(){
			oTf2.attachBrowserEvent("focusout", scream2);
		});

		var oBtn3 = new Button("btn3", {text : "Unbind focusout event"});
		oBtn3.attachPress(function(){
			oTf2.detachBrowserEvent("focusout", scream);
		});

		var oBtn4 = new Button("btn4", {text : "Unbind INTENSE focusout event"});
		oBtn4.attachPress(function(){
			oTf2.detachBrowserEvent("focusout", scream2);
		});

		new HorizontalLayout({
			content: [
				oBtn, oBtn2, oBtn3, oBtn4
			]
		}).placeAt("uiArea2");

		var oTf2 = new Input("tf2");
		oTf2.placeAt("uiArea3");

		var oBtnR = new Button("btnR", {text : "Re-Render the Inputs", press : function(){
			oTf1.invalidate();
			oTf2.invalidate();
		}});
		oBtnR.placeAt("uiArea4");
	});
});