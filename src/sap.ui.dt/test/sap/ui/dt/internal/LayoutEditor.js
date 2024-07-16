window['sap-ui-config'].libs = "sap.ui.dt";
document.write('<script src="' + document.location.pathname.match(/(.*)\/test-resources\//)[1] + '/resources/sap-ui-core.js"><' + '/script>');

sap.ui.require([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/plugin/ControlDragDrop",
	"sap/ui/dt/plugin/MouseSelection",
	"sap/ui/core/mvc/XMLView",
	"sap/m/Button",
	"sap/ui/thirdparty/jquery"
],
function(
	DesignTime,
	ControlDragDrop,
	MouseSelection,
	XMLView,
	Button,
	jQuery
) {
	XMLView.create({definition: jQuery('#view1').html()})
		.then(function (oView) {
			oView.placeAt('content');

			var aMOVABLE_TYPES = ["sap.m.Button"];
			var oSelectionPlugin = new MouseSelection();
			var oDragPlugin = new ControlDragDrop({
				draggableTypes: aMOVABLE_TYPES
			});

			window.oDesignTime = new DesignTime({
				rootElements: [oView],
				plugins: [
					oSelectionPlugin,
					oDragPlugin
				]
			});

			var oDraggedOverlay;
			jQuery("#pallete_button")
				.on("dragstart", function () {
					var oButton = new Button({text: "New button"});

					oDesignTime.createOverlay({
						element: oButton,
						root: true,
					}).then(function (oOverlay) {
						oDraggedOverlay = oOverlay;
						oDraggedOverlay.placeInOverlayContainer();
						oDraggedOverlay.$().trigger("dragstart");
					});

				})
				.on("dragend", function () {
					oDraggedOverlay.$().trigger("dragend");
				});
		}.bind(this));
});