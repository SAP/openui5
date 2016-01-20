sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/plugin/TabHandling',
	'sap/ui/dt/plugin/ControlDragDrop',
	'sap/ui/dt/plugin/MouseSelection',
	'sap/ui/dt/Preloader'
], function (Controller, DesignTime, ElementUtil, TabHandling, ControlDragDrop, MouseSelection, Preloader) {
	"use strict";
	return Controller.extend("sap.ui.dt.demo.ObjectPageWithDesignTime", {
		onInit: function () {
			var aMOVABLE_TYPES = ["sap.uxap.ObjectPageSection", "sap.ui.layout.form.FormElement", "sap.ui.layout.form.FormContainer"];
			var oTabHandlingPlugin = new TabHandling({});
			var oSelectionPlugin = new MouseSelection({});

			var oDragPlugin = new ControlDragDrop({
				draggableTypes : aMOVABLE_TYPES
			});

			var oView = this.getView();
			var aElements = ElementUtil.findAllPublicElements(oView);
			Preloader.load(aElements).then(function() {
				new DesignTime({
					rootElements : [oView],
					plugins : [
					  oTabHandlingPlugin,
						oSelectionPlugin,
						oDragPlugin
					]
				});
			});
		}
	});
}, true);

