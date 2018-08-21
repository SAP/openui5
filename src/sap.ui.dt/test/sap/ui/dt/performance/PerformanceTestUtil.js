sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/plugin/TabHandling",
	"sap/ui/dt/plugin/ControlDragDrop",
	"sap/ui/dt/plugin/MouseSelection",
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/DatePicker",
	"sap/m/Slider",
	"sap/m/RatingIndicator",
	"sap/base/Log"
], function(
	DesignTime,
	TabHandling,
	ControlDragDrop,
	MouseSelection,
	CutPaste,
	ContextMenu,
	OverlayRegistry,
	Button,
	Label,
	DatePicker,
	Slider,
	RatingIndicator,
	Log
) {
	"use strict";

	var Util = {
		addMixedControlsTo : function(oLayout, iFrom, iTo, bVisible){
			var aControlTypes = [Button, Label, DatePicker, Slider, RatingIndicator];

			var oControl = null;
			var ControlType = null;

			for (var i = iFrom; i <= iTo; i++){
				ControlType = aControlTypes[i % aControlTypes.length];

				oControl = new ControlType( "Control" + i, {
					visible: bVisible
				});
				if (oControl.setText){
					oControl.setText("Control " + i);
				}

				oLayout.addContent(oControl);
			}
		},

		startDesignTime: function(oHorizontalLayout){
			// Create DesignTime in other tick
			return new Promise(function(resolve, reject){
				//will result in custom timer in webPageTest
				window.performance.mark("dt.starts");

				var MOVABLE_TYPES = ["sap.ui.layout.VerticalLayout","sap.m.Button","sap.m.Label","sap.m.DatePicker","sap.m.Slider","sap.m.RatingIndicator"];

				var oTabHandlingPlugin = new TabHandling();
				var oSelectionPlugin = new MouseSelection();
				var oControlDragPlugin = new ControlDragDrop({
					draggableTypes : MOVABLE_TYPES
				});
				var oCutPastePlugin = new CutPaste({
					movableTypes : MOVABLE_TYPES
				});
				var oContextMenuPlugin = new ContextMenu();
				window.performance.mark("dt.plugins.created");

				var oDesignTime = new DesignTime({
					plugins : [
						oTabHandlingPlugin,
						oSelectionPlugin,
						oCutPastePlugin,
						oControlDragPlugin,
						oContextMenuPlugin
					]
				});
				oDesignTime.attachEventOnce("synced", function() {
					//will result in custom timer in webPageTest
					window.performance.mark("dt.synced");
					window.performance.measure("Create DesignTime and Overlays", "dt.starts", "dt.synced");
					sap.ui.dt.creationTime = window.performance.getEntriesByName("Create DesignTime and Overlays")[0].duration;
					Log.info("Create DesignTime and Overlays", sap.ui.dt.creationTime + "ms");
					//visual change at the end
					var oOverlay = OverlayRegistry.getOverlay("Control2");
					oOverlay.setSelected(true);

					resolve();
				});
				oDesignTime.addRootElement(oHorizontalLayout);
			}).then(function(){
				sap.ui.getCore().applyChanges();
				document.getElementById("overlay-container").setAttribute("sap-ui-dt-loaded","true");
			});
		}
	};

	window.startDesignTime = Util.startDesignTime;

	return Util;
}, true);
