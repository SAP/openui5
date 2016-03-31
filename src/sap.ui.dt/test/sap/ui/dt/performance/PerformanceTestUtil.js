sap.ui.define([],function(){
	var Util = {
		addButtonsTo : function(oLayout, iFrom, iTo, bVisible){
			var sText, sID = null;
			var oButton = null;
			for (var i = iFrom; i <= iTo; i++){
				sText = "Button " + i;
				sID = "Button"+i;
				oButton = new sap.m.Button( sID,{
					type: sap.m.ButtonType.Default,
					text: sText,
					enabled: true,
					visible: bVisible,
					press : function() {
						var text = "press " + sText;
						alert(text);
					}
				});

				oLayout.addContent(oButton);
			};
		},
		startDesignTime: function(){
			// Create DesignTime in other tick
			return new Promise(function(resolve, reject){
				console.time("Create DesignTime Plugins");

				jQuery.sap.require("sap.ui.dt.DesignTime");
				jQuery.sap.require("sap.ui.dt.plugin.TabHandling");
				jQuery.sap.require("sap.ui.dt.plugin.ControlDragDrop");
				jQuery.sap.require("sap.ui.dt.plugin.DragDrop");
				jQuery.sap.require("sap.ui.dt.plugin.MouseSelection");
				jQuery.sap.require("sap.ui.dt.plugin.CutPaste");
				jQuery.sap.require("sap.ui.dt.plugin.ContextMenu");
				jQuery.sap.require("sap.ui.dt.OverlayRegistry");

				var aMOVABLE_TYPES = ["sap.m.Button", "sap.ui.layout.VerticalLayout"]

				var oTabHandlingPlugin = new sap.ui.dt.plugin.TabHandling();
				var oSelectionPlugin = new sap.ui.dt.plugin.MouseSelection();
				var oControlDragPlugin = new sap.ui.dt.plugin.ControlDragDrop({
					draggableTypes : aMOVABLE_TYPES
				});
				var oCutPastePlugin = new sap.ui.dt.plugin.CutPaste({
					movableTypes : aMOVABLE_TYPES
				});
				var oContextMenuPlugin = new sap.ui.dt.plugin.ContextMenu();
				console.timeEnd("Create DesignTime Plugins");

				console.time("Create DesignTime and Overlays");
				var oDesignTime = new sap.ui.dt.DesignTime({
					rootElements : oLayout,
					plugins : [
								oTabHandlingPlugin,
								oSelectionPlugin,
								oCutPastePlugin,
								oControlDragPlugin,
								oContextMenuPlugin
							]
				});

				oDesignTime.attachEventOnce("synced", function() {
					console.timeEnd("Create DesignTime and Overlays");
					//visual change at the end
					var oOverlay = sap.ui.dt.OverlayRegistry.getOverlay("Button2");
					oOverlay.setSelected(true);
					resolve();
				});
			})
		}
	};

	window.startDesignTime = Util.startDesignTime;

	return Util;
}, true);
