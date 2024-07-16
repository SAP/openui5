sap.ui.define([
  "sap/ui/core/Element",
  "sap/m/Page",
  "sap/m/Table",
  "sap/m/Column",
  "sap/m/ColumnListItem",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/DateTimeInput",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/HBox",
  "sap/m/CheckBox",
  "sap/m/RadioButton",
  "sap/m/Slider",
  "sap/m/TextArea",
  "sap/m/App",
  "sap/ui/thirdparty/jquery"
], function(
  Element,
  Page,
  Table,
  Column,
  ColumnListItem,
  Label,
  Input,
  DateTimeInput,
  Select,
  Item,
  HBox,
  CheckBox,
  RadioButton,
  Slider,
  TextArea,
  App,
  jQuery
) {
  "use strict";
  // Note: the HTML page 'FormAsTable.html' loads this module via data-sap-ui-on-init

  var page = new Page({
	  title : "Form Table",
	  enableScrolling : true,
	  content : [form = new Table({
		  inset : false,
		  showUnread : true,
		  scrollToLoad : true,
		  headerText : "Personal Info",
		  columns : [
			  new Column({
				  styleClass : "key",
				  valign : "Center",
				  width : "35%",
				  hAlign : "Right"
			  }),
			  new Column({
				  minScreenWidth : "Medium",
				  demandPopin : true
			  })
		  ],
		  items : [
			  new ColumnListItem({
				  cells : [
					  new Label({
						  text : "Name",
						  required : true
					  }),
					  new Input({
						  placeholder : "Tom Roy"
					  })
				  ]
			  }),
			  new ColumnListItem({
				  cells : [
					  new Label({
						  text : "Email",
						  required : true
					  }),
					  new Input({
						  placeholder : "me@sap.com",
						  type : "Email"
					  })
				  ]
			  }),
			  new ColumnListItem({
				  cells : [
					  new Label({
						  text : "Birthday"
					  }),
					  new DateTimeInput({
						  displayFormat : "dd-mm-yyyy",
						  placeholder : "dd-mm-yyyy",
						  valueFormat : "dd-mm-yyyy"
					  })
				  ]
			  }),
			  new ColumnListItem({
				  cells : [
					  new Label({
						  text : "Size"
					  }),
					  new Select({
						  width : "100%",
						  items : [
							  new Item({
								  text: "Small"
							  }),
							  new Item({
								  text: "Medium"
							  }),
							  new Item({
								  text: "Large"
							  })
						  ]
					  })
				  ]
			  }),
			  new ColumnListItem({
				  cells : [
					  new Label({
						  text : "Favorite Colors"
					  }),
					  new HBox({
						  items : [
							  new CheckBox({
								  text : "Blue"
							  }),
							  new CheckBox({
								  text : "Red"
							  }),
							  new CheckBox({
								  text : "Green"
							  })
						  ]
					  })

				  ]
			  }),
			  new ColumnListItem({
				  cells : [
					  new Label({
						  text : "Gender"
					  }),
					  new HBox({
						  items : [
							  new RadioButton({
								  text : "Male"
							  }),
							  new RadioButton({
								  text : "Female"
							  })
						  ]
					  })
				  ]
			  }),
			  new ColumnListItem({
				  cells : [
					  new Label({
						  text : "Length"
					  }),
					  new HBox({
						  items : [
							  new Slider({
								  min : 150,
								  max : 250,
								  value : 170,
							  }).attachLiveChange(function(e) {
								  Element.getElementById("length").setValue(e.getParameter("value") + " cm");
							  }),
							  new Input("length", {
								  width : "70px",
								  editable : false,
								  value : "170 cm"
							  })
						  ]
					  }).addStyleClass("width100Percent")
				  ]
			  }),
			  new ColumnListItem({
				  cells : [
					  new Label({
						  text : "Notes"
					  }),
					  new TextArea({
						  rows : 3,
						  width : "100%",
						  maxLength : 255,
						  placeholder : "Max Length 255"
					  }).attachLiveChange(function(e) {
						  // growing textarea
						  var $ta = jQuery(this.getFocusDomRef());
						  if (!$ta.data("first")) {
							  $ta.data("first", true).css({
								  "min-height" : $ta.outerHeight(),
								  "overflow-y" : "hidden"
							  });
						  }
						  $ta.height(0).height($ta[0].scrollHeight);
					  })
				  ]
			  })
		  ]
	  }).addStyleClass("sapMForm")]
  });

  new App().addPage(page).placeAt("body");
});