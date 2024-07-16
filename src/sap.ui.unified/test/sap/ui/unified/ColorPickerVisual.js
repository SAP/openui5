sap.ui.define([
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/ui/unified/ColorPickerDisplayMode",
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Label",
  "sap/ui/layout/HorizontalLayout",
  "sap/ui/unified/ColorPicker",
  "sap/ui/unified/library",
  "sap/m/Button",
  "sap/m/ToggleButton"
], function(
  Select,
  Item,
  ColorPickerDisplayMode,
  App,
  Page,
  VerticalLayout,
  Label,
  HorizontalLayout,
  ColorPicker,
  unifiedLibrary,
  Button,
  ToggleButton
) {
  "use strict";

  // shortcut for sap.ui.unified.ColorPickerMode
  const ColorPickerMode = unifiedLibrary.ColorPickerMode;

  var oCP;

  var oSelect = new Select('select_mode', {
	  items: [
		  new Item("default_mode", {
			  text: 'Default',
			  key: ColorPickerDisplayMode.Default
		  }),
		  new Item("large_mode", {
			  text: 'Large',
			  key: ColorPickerDisplayMode.Large
		  }),
		  new Item("simplified_mode", {
			  text: 'Simplified',
			  key: ColorPickerDisplayMode.Simplified
		  })
	  ],
	  change: function(oEvent) {
		  var sColorPickerDisplayMode = oEvent.getParameter('selectedItem').getKey();
		  oCP.setDisplayMode(sColorPickerDisplayMode);
	  }
  });

  app: new App({
	  pages: [
		  new Page("ColorPickerArea", {
			  showHeader:false,
			  content: [
				  new VerticalLayout({
					  width: "100%",
					  content: [
						  new Label({text: "HSL:"}),
						  new HorizontalLayout({
							  width: "100%",
							  content: [
								  oCP = new ColorPicker("cp", {
									  colorString: "azure",
									  mode: ColorPickerMode.HSL
								  }),
								  new Button("remove_focus_btn", {
									  text: "focus",
									  press: function () {
										  document.activeElement.blur();
									  }
								  })
							  ]
						  }),
						  oSelect,
						  new ToggleButton("hsv_hsl_btn", {
							  text: "Toggle HSV/HSL",
							  press: function () {
								  oCP.setMode(ColorPickerMode[this.getPressed() ? 'HSV':'HSL']);
							  }
						  })
					  ]
				  })
			  ]
		  }).addStyleClass("sapUiResponsiveContentPadding")
	  ]
  }).placeAt("content");
});