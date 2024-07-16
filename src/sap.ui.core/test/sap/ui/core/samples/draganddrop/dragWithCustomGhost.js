// Note: the HTML page 'dragWithCustomGhost.html' loads this module via data-sap-ui-on-init

sap.ui.loader.config({paths: {"my": "./"}});

sap.ui.define(["my/DraggableText", "sap/ui/core/dnd/DragDropInfo"], function(DraggableText, DragDropInfo) {
	"use strict";

	var oControl = new DraggableText({
		text: "Drag Me! My ghost will surprise you.",
		dragDropConfig: new DragDropInfo() // just make it draggable, no specific target
	});

	oControl.placeAt("content");
});