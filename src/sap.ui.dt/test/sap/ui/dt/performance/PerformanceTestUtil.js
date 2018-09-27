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
	"sap/m/Panel",
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
	Panel,
	Log
) {
	"use strict";

	var Util = {
		addButtons: function(oParentControl, sAggregation, iNumberOfButtons) {
			if (iNumberOfButtons > 0) {
				oParentControl.addAggregation(sAggregation, new Button({
					id: oParentControl.getId() + "button" + iNumberOfButtons,
					text: oParentControl.getId() + "button" + iNumberOfButtons
				}));
				Util.addButtons(oParentControl, sAggregation, iNumberOfButtons - 1);
			}
		},

		createNestedPanels: function(oParentControl, sAggregation, iNumberOfControls, oLastElement) {
			//  add element to the inner most panel
			if (iNumberOfControls === 0) {
				oParentControl.addAggregation(sAggregation, oLastElement);
				return;
			}

			var oPanel = new Panel("Panel" + iNumberOfControls);
			oParentControl.addAggregation(sAggregation, oPanel);
			Util.createNestedPanels(oPanel, sAggregation, iNumberOfControls - 1, oLastElement);
		},

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

		startDesignTime: function(oRootControl, sSelectedOverlayId){
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
					var oOverlay = OverlayRegistry.getOverlay(sSelectedOverlayId || "Control2");
					oOverlay.setSelected(true);

					resolve();
				});
				oDesignTime.addRootElement(oRootControl);
			}).then(function(){
				sap.ui.getCore().applyChanges();
				document.getElementById("overlay-container").setAttribute("sap-ui-dt-loaded","true");
			});
		},

		debounce: function(fn, iWait) {
			iWait = iWait || 0;

			var bInvoked = false;
			var vResult;
			var iTimerId;

			function invoke() {
				bInvoked = true;
				vResult = fn();
			}

			return function () {
				if (bInvoked) {
					return vResult;
				}
				if (iTimerId) {
					clearTimeout(iTimerId);
				}
				iTimerId = setTimeout(invoke, iWait);
			};
		}
	};

	window.startDesignTime = Util.startDesignTime;

	return Util;
}, true);
