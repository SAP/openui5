sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/plugin/TabHandling',
	'sap/ui/dt/plugin/ControlDragDrop',
	'sap/ui/dt/plugin/MouseSelection'
], function (Controller, DesignTime, ElementUtil, TabHandling, ControlDragDrop, MouseSelection) {
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
			new DesignTime({
				rootElements : [oView],
				plugins : [
				  oTabHandlingPlugin,
					oSelectionPlugin,
					oDragPlugin
				]
			});
		}
	});
}, true);

