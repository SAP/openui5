// Note: the HTML page 'LayoutEditor.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/plugin/ControlDragDrop",
	"sap/ui/dt/plugin/MouseSelection",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Button"
],
function (
	DesignTime,
	ControlDragDrop,
	MouseSelection,
	XMLView,
	Button
) {
	"use strict";

	const oViewDefinition = document.getElementById("view1").innerHTML;
	XMLView.create({definition: oViewDefinition})
		.then(function(oView) {
			oView.placeAt("content");

			const aMOVABLE_TYPES = ["sap.m.Button"];
			const oSelectionPlugin = new MouseSelection();
			const oDragPlugin = new ControlDragDrop({
				draggableTypes: aMOVABLE_TYPES
			});

			window.oDesignTime = new DesignTime({
				rootElements: [oView],
				plugins: [
					oSelectionPlugin,
					oDragPlugin
				]
			});

			let oDraggedOverlay;
			// Add event listeners for dragstart and dragend
			const oPaletteButton = document.getElementById("pallete_button");
			oPaletteButton.addEventListener("dragstart", function() {
				const oButton = new Button({text: "New button"});

				oDesignTime.createOverlay({
					element: oButton,
					root: true,
				}).then(function(oOverlay) {
					oDraggedOverlay = oOverlay;
					oDraggedOverlay.placeInOverlayContainer();
					oDraggedOverlay.getDomRef().dispatchEvent(new Event("dragstart"));
				});
			});
			oPaletteButton.addEventListener("dragend", function() {
				oDraggedOverlay.getDomRef().dispatchEvent(new Event("dragend"));
			});
		});
});