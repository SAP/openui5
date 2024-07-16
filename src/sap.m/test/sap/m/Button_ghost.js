sap.ui.define([
  "sap/ui/core/HTML",
  "sap/ui/core/IconPool",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Toolbar",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/ToggleButton",
  "sap/m/Bar",
  "sap/m/OverflowToolbar"
], function(HTML, IconPool, App, Page, Toolbar, Button, mobileLibrary, ToggleButton, Bar, OverflowToolbar) {
  "use strict";

  // shortcut for sap.m.ToolbarDesign
  const ToolbarDesign = mobileLibrary.ToolbarDesign;

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  new App({
	  pages: new Page("page", {
		  title: "Ghost Buttons",
		  footer: new Toolbar({
			  content: [
				  new Button({
					  type: ButtonType.Ghost,
					  icon: "sap-icon://home",
					  text: "Button Ghost",
					  enabled: true
				  }),
				  new Button({
					  type: ButtonType.Ghost,
					  icon: "sap-icon://home",
					  text: "Button Ghost Dis",
					  enabled: false
				  }),
				  new ToggleButton({
					  type: ButtonType.Ghost,
					  icon: "sap-icon://home",
					  text: "ToggleBtn Ghost",
					  enabled: true
				  }),
				  new ToggleButton({
					  type: ButtonType.Ghost,
					  icon: "sap-icon://home",
					  text: "ToggleBtn Ghost Dis",
					  enabled: false
				  }),
				  new ToggleButton({
					  type: ButtonType.Ghost,
					  icon: "sap-icon://home",
					  text: "ToggleBtn Ghost",
					  enabled: true,
					  pressed: true
				  }),
				  new ToggleButton({
					  type: ButtonType.Ghost,
					  icon: "sap-icon://home",
					  text: "ToggleBtn Ghost Dis",
					  enabled: false,
					  pressed: true
				  })
			  ]
		  })
	  })
  }).placeAt("content");


  new HTML({content: "</br></br>Transparent type Buttons</br>"}).placeAt("page");

  new Button({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new Button({
	  type: ButtonType.Ghost,
	  text: "Button Type Ghost",
	  enabled: true
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new Button({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  text: "Button Type Ghost",
	  enabled: true
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new Button({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new Button({
	  type: ButtonType.Ghost,
	  text: "Button Type Ghost",
	  enabled: false
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new Button({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  text: "Button Type Ghost",
	  enabled: false
  }).placeAt("page");

  new HTML({content: "</br></br>Ghost type ToggleButtons</br>"}).placeAt("page");

  new ToggleButton({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  enabled: true
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new ToggleButton({
	  type: ButtonType.Ghost,
	  text: "ToggleButton Type Ghost",
	  enabled: true
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new ToggleButton({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Ghost",
	  enabled: true
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new ToggleButton({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  enabled: false
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new ToggleButton({
	  type: ButtonType.Ghost,
	  text: "ToggleButton Type Ghost",
	  enabled: false
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new ToggleButton({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Ghost",
	  enabled: false
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new ToggleButton({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Ghost",
	  enabled: true,
	  pressed: true
  }).placeAt("page");

  new HTML({content: "<div class='ButtonSpace'>&nbsp;</div>"}).placeAt("page");

  new ToggleButton({
	  type: ButtonType.Ghost,
	  icon: "sap-icon://home",
	  text: "ToggleButton Type Ghost",
	  enabled: false,
	  pressed: true
  }).placeAt("page");

  new HTML({content: "</br></br>Ghost type Buttons in Bar</br>"}).placeAt("page");

  new Bar({
	  contentLeft: [
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Button Ghost",
			  enabled: true
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Button Ghost Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost Dis",
			  enabled: false,
			  pressed: true
		  })
	  ]
  }).placeAt('page');

  new HTML({content: "</br></br>Transparent OverflowToolbar</br>"}).placeAt("page");

  new OverflowToolbar({
	  design: "Transparent",
	  content: [
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost",
			  enabled: true
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost Dis",
			  enabled: false,
			  pressed: true
		  })
	  ]
  }).placeAt('page');

  new HTML({content: "</br></br>OverflowToolbar</br>"}).placeAt("page");

  new OverflowToolbar({
	  content: [
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost",
			  enabled: true
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost Dis",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost Dis",
			  enabled: false,
			  pressed: true
		  })
	  ]
  }).placeAt('page');

  new HTML({content: "</br></br>ToolBar</br>"}).placeAt("page");

  new Toolbar({
	  content: [
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost",
			  enabled: true
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: false,
			  pressed: true
		  })
	  ]
  }).placeAt('page');

  new HTML({content: "</br></br>Transparent ToolBar</br>"}).placeAt("page");

  new Toolbar({
	  design: ToolbarDesign.Transparent,
	  content: [
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost",
			  enabled: true
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: false,
			  pressed: true
		  })
	  ]
  }).placeAt('page');

  new HTML({content: "</br></br>Solid ToolBar</br>"}).placeAt("page");

  new Toolbar({
	  design: ToolbarDesign.Solid,
	  content: [
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost",
			  enabled: true
		  }),
		  new Button({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "Btn Ghost",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: false
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: true,
			  pressed: true
		  }),
		  new ToggleButton({
			  type: ButtonType.Ghost,
			  icon: "sap-icon://home",
			  text: "ToggleBtn Ghost",
			  enabled: false,
			  pressed: true
		  })
	  ]
  }).placeAt('page');
});