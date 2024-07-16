sap.ui.define([
  "sap/m/App",
  "sap/m/Button",
  "sap/m/Page",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Text",
  "sap/m/ComboBox",
  "sap/ui/core/Item",
  "sap/m/MultiComboBox",
  "sap/ui/thirdparty/jquery"
], function(App, Button, Page, VerticalLayout, Text, ComboBox, Item, MultiComboBox, jQuery) {
  "use strict";
  // Note: the HTML page 'ComboBoxClearIcon.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp");

  var fnChange = function (event) {
	  console.log("change: ", event.getParameter("value"));
  };

  // Add a css class to the body HTML element, in order to be used for caret stylization in visual tests run.
  var oCustomCssButton = new Button ("customCssButton",{
	  text: "Toggle custom CSS for visual test",
	  press: function() {
		  var $body = jQuery("body");

		  $body.toggleClass("customClassForVisualTests");
	  }
  });

  var page1 = new Page("page1", {
	  title: "Mobile ComboBoxes Control",
	  content: [
		  new VerticalLayout("oVL", {
			  width: "100%",
			  content: [
				  oCustomCssButton,

				  new Text({ text: "---------- ComboBox --------------" }),

				  new ComboBox({
					  placeholder: "No initial value, no items",
					  value: "",
					  showClearIcon: true,
					  change: fnChange,
					  width: "100%",
				  }),

				  new ComboBox({
					  placeholder: "Specified width",
					  value: "",
					  showClearIcon: true,
					  change: fnChange,
					  width: "300px",
				  }),

				  new ComboBox({
					  placeholder: "No specified width",
					  value: "",
					  showClearIcon: true,
					  change: fnChange,
				  }),

				  new ComboBox({
					  placeholder: "No initial value, with items",
					  showClearIcon: true,
					  width: "100%",
					  items: [
						  new Item({
							  text: "Albania",
							  key: "AL"
						  }),
						  new Item({
							  text: "Bulgaria",
							  key: "BG"
						  }),
						  new Item({
							  text: "Germany",
							  key: "DE"
						  }),
						  new Item({
							  text: "Dryanovo",
							  key: "DR"
						  }),
						  new Item({
							  text: "Gabrovo",
							  key: "GB"
						  })
					  ],
					  change: fnChange
				  }),

				  new ComboBox({
					  value: "Not editable with value",
					  showClearIcon: true,
					  editable: false,
					  width: "100%",
					  items: [
						  new Item({
							  text: "Albania",
							  key: "AL"
						  }),
						  new Item({
							  text: "Bulgaria",
							  key: "BG"
						  }),
						  new Item({
							  text: "Germany",
							  key: "DE"
						  }),
						  new Item({
							  text: "Dryanovo",
							  key: "DR"
						  }),
						  new Item({
							  text: "Gabrovo",
							  key: "GB"
						  })
					  ],
					  change: fnChange
				  }),

				  new ComboBox({
					  placeholder: "Initial value, with items",
					  value: "Bulgaria",
					  selectedKey: "BG",
					  showClearIcon: true,
					  width: "100%",
					  items: [
						  new Item({
							  text: "Albania",
							  key: "AL"
						  }),
						  new Item({
							  text: "Bulgaria",
							  key: "BG"
						  }),
						  new Item({
							  text: "Germany",
							  key: "DE"
						  }),
						  new Item({
							  text: "Dryanovo",
							  key: "DR"
						  }),
						  new Item({
							  text: "Gabrovo",
							  key: "GB"
						  })
					  ],
					  change: fnChange
				  }),

				  new Text({ text: "---------- MultiComboBox --------------" }),

				  new MultiComboBox({
					  placeholder: "No items no clear Icon",
					  showClearIcon: false,
				  }),

				  new MultiComboBox({
					  placeholder: "No items with clear Icon",
					  showClearIcon: true,
				  }),

				  new MultiComboBox({
					  placeholder: "Not editable with clear Icon",
					  showClearIcon: true,
					  editable: false
				  }),

				  new MultiComboBox({
					  placeholder: "Items with clear icon",
					  showClearIcon: true,
					  items: [
						  new Item({
							  text: "Albania",
							  key: "AL"
						  }),
						  new Item({
							  text: "Bulgaria",
							  key: "BG"
						  }),
						  new Item({
							  text: "Germany",
							  key: "DE"
						  }),
						  new Item({
							  text: "Dryanovo",
							  key: "DR"
						  }),
						  new Item({
							  text: "Gabrovo",
							  key: "GB"
						  })
					  ],
					  change: fnChange
				  }),
				  new MultiComboBox({
					  placeholder: "Preselected item and clear icon",
					  showClearIcon: true,
					  selectedKeys: ["BG"],
					  items: [
						  new Item({
							  text: "Albania",
							  key: "AL"
						  }),
						  new Item({
							  text: "Bulgaria",
							  key: "BG"
						  }),
						  new Item({
							  text: "Germany",
							  key: "DE"
						  }),
						  new Item({
							  text: "Dryanovo",
							  key: "DR"
						  }),
						  new Item({
							  text: "Gabrovo",
							  key: "GB"
						  })
					  ],
					  change: fnChange
				  }),
				  new MultiComboBox({
					  placeholder: "Item, value and clear icon",
					  showClearIcon: true,
					  selectedKeys: ["BG"],
					  value: "Dryanovo",
					  items: [
						  new Item({
							  text: "Albania",
							  key: "AL"
						  }),
						  new Item({
							  text: "Bulgaria",
							  key: "BG"
						  }),
						  new Item({
							  text: "Germany",
							  key: "DE"
						  }),
						  new Item({
							  text: "Dryanovo",
							  key: "DR"
						  }),
						  new Item({
							  text: "Gabrovo",
							  key: "GB"
						  })
					  ],
					  change: fnChange
				  }),
				  new MultiComboBox({
					  placeholder: "Item, value, clear icon and selectAll item",
					  showClearIcon: true,
					  showSelectAll: true,
					  selectedKeys: ["BG"],
					  value: "Dryanovo",
					  items: [
						  new Item({
							  text: "Albania",
							  key: "AL"
						  }),
						  new Item({
							  text: "Bulgaria",
							  key: "BG"
						  }),
						  new Item({
							  text: "Germany",
							  key: "DE"
						  }),
						  new Item({
							  text: "Dryanovo",
							  key: "DR"
						  }),
						  new Item({
							  text: "Gabrovo",
							  key: "GB"
						  })
					  ],
					  change: fnChange
				  }),
			  ]
		  }).addStyleClass("sapUiContentPadding")
	  ],
  });

  app.addPage(page1);
  app.placeAt("body");
});