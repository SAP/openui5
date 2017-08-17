sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller"
], function ($, Device, Controller) {
	"use strict";
	return Controller.extend("sap.uxap.sample.ObjectPageSubSectionMultiView.ObjectPageSubSectionMultiView", {
		onAfterRendering: function () {
			//demokit specific
			$(".sapUiSimpleForm").css("backgroundColor", "green");
		}
	});
}, true);

