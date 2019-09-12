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
	"sap/m/VBox",
	"sap/base/Log",
	"sap/base/util/restricted/_debounce"
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
	VBox,
	Log,
	_debounce
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

		addMixedControlsTo : function(oLayout, iFrom, iTo, bVisible) {
			var aControlTypes = [Button, Label, DatePicker, Slider, RatingIndicator];

			var oControl = null;
			var ControlType = null;

			for (var i = iFrom; i <= iTo; i++) {
				ControlType = aControlTypes[i % aControlTypes.length];

				oControl = new ControlType("Control" + i, {
					visible: bVisible
				});
				if (oControl.setText) {
					oControl.setText("Control " + i);
				}

				oLayout.addContent(oControl);
			}
		},

		addBoxesWithMixedControls: function(oParent, iCount, iOffset) {
			var i = iOffset || 0;
			iCount = iOffset ? iOffset + iCount : iCount;
			for (i; i < iCount; i++) {
				oParent.addContent(
					new VBox("box" + i, {
						items: [
							new Label("Label" + i, {text: "Control " + i}),
							new DatePicker("DatePicker" + i),
							new Slider("Slider" + i),
							new RatingIndicator("RatingIndicator" + i),
							new Button("Button" + i, {text: "Control " + i})
						]
					})
				);
			}
		},

		startDesignTime: function(oRootControl, sSelectedOverlayId) {
			// Create DesignTime in other tick
			return new Promise(function(resolve) {
				//will result in custom timer in webPageTest
				window.performance.mark("dt.starts");

				var MOVABLE_TYPES = ["sap.ui.layout.VerticalLayout", "sap.m.Button", "sap.m.Label", "sap.m.DatePicker", "sap.m.Slider", "sap.m.RatingIndicator"];

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
			}).then(function() {
				sap.ui.getCore().applyChanges();
				document.getElementById("overlay-container").setAttribute("sap-ui-dt-loaded", "true");
			});
		},

		measureApplyStylePerformance: function(sCustomMetricName, iWaitUntilDoneInMs) {
			window.wpp = {
				customMetrics: {}
			};

			var aStack = [];
			var iCountCall = 0;
			var bMeasurementDone = false;

			var fnDebouncedFn = _debounce(function () {
				if (!bMeasurementDone) {
					bMeasurementDone = true;
					window.wpp.customMetrics[sCustomMetricName] = aStack[aStack.length - 1] - aStack[0];
					Log.info(sCustomMetricName + " = " + window.wpp.customMetrics[sCustomMetricName] + "ms");
					Log.info("Count call = " + iCountCall);
				} else {
					Log.error("Some applyStyles() calculation exceeded timeout of " + iWaitUntilDoneInMs + "ms");
					window.wpp.customMetrics[sCustomMetricName] = 100000;
				}
			}, iWaitUntilDoneInMs);

			OverlayRegistry.getOverlays().forEach(function (oElementOverlay) {
				oElementOverlay.attachGeometryChanged(function () {
					aStack.push(new Date().getTime());
					iCountCall++;
					setTimeout(fnDebouncedFn);
				});
			});

			aStack.push(new Date().getTime());
		}
	};

	window.startDesignTime = Util.startDesignTime;

	return Util;
}, true);
