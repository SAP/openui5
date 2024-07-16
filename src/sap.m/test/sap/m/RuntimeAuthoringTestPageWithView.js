sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/core/mvc/View",
  "sap/ui/rta/RuntimeAuthoring",
  "sap/ui/core/util/MockServer",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/m/Toolbar",
  "sap/m/MenuButton",
  "sap/m/Menu",
  "sap/m/MenuItem",
  "sap/m/ToolbarSpacer",
  "sap/m/Text",
  "sap/m/Bar",
  "sap/m/Button",
  "sap/m/OverflowToolbar",
  "sap/ui/layout/form/Form",
  "sap/ui/layout/form/GridLayout",
  "sap/ui/layout/form/FormContainer",
  "sap/ui/layout/form/FormElement",
  "sap/m/Input",
  "sap/ui/core/mvc/ViewType",
  "sap/ui/core/UIComponent",
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/core/ComponentContainer",
  "sap/ui/thirdparty/jquery",
  "sap/ui/core/mvc/JSView",
  "sap/ui/core/mvc/Controller"
], async function(
  Element,
  View,
  RuntimeAuthoring,
  MockServer,
  ODataModel,
  Toolbar,
  MenuButton,
  Menu,
  MenuItem,
  ToolbarSpacer,
  Text,
  Bar,
  Button,
  OverflowToolbar,
  Form,
  GridLayout,
  FormContainer,
  FormElement,
  Input,
  ViewType,
  UIComponent,
  App,
  Page,
  ComponentContainer,
  jQuery
) {
  "use strict";

  // Create the FakeLrep with localStorage
  (function _createFakeLrep() {
	  sap.ui.require(["sap/ui/fl/FakeLrepConnector"], function (FakeLrepConnector) {
		  if (/[&?](sap-rta-clear-cache-lrep=(true|x)[&#]?)+/i.test(window.location.search)) {

			  jQuery.extend(FakeLrepConnector.prototype, FakeLrepConnectorLocalStorage);
			  FakeLrepConnector.deleteChanges();
		  }

		  jQuery.extend(FakeLrepConnector.prototype);
	  });
  }());

  sap.ui.controller("my.own.controller", {
	  onInit: function(){
		  this.sMockServerBaseUri = "./../../../../sap.ui.core/test/sap/ui/core/demokit/sample/DataStateOData/mockdata/";
		  this.sServiceUri = "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/";

		  this.oMockServer = new MockServer({rootUri : this.sServiceUri});
		  // configure

		  this.oMockServer.simulate(this.sMockServerBaseUri + "metadata.xml", {
			  sMockdataBaseUrl : this.sMockServerBaseUri,
			  bGenerateMissingMockData : true
		  });
		  this.oMockServer.start();
		  var oModel = new ODataModel (this.sServiceUri, {defaultBindingMode:"TwoWay"});
		  this.getView().setModel(oModel);
		  this.getView().bindElement("/ProductSet('HT-1000')");
	  },
	  onPress: function(oEvent) {
		  alert(oEvent.getSource());
	  },
	  onItemPress: function (oEvent) {
		  oEvent.getParameter("item").firePress();
	  }
  });

  sap.ui.jsview("my.own.view", {
	  // defines the UI of this View
	  getControllerName: function() {
		  return "my.own.controller";
	  },
	  createContent: function(oController) {
		  return [
			  new Toolbar({
			  id: "toolbar1",
			  content: [
				  new MenuButton({
					  id: "mbtn",
					  text: "MenuButton_1",
					  menu: new Menu({
						  itemSelected: oController.onItemPress,
						  items: [
							  new MenuItem({id: "mitem1", icon:"sap-icon://accept", text: "Item1"}),
							  new MenuItem({id: "mitem2", icon:"sap-icon://decline", text: "Item2", press: oController.onPress})
						  ]
					  })
				  }),
				  new ToolbarSpacer(),
				  new Text({text: "Toolbar"}),
				  new ToolbarSpacer(),
				  new MenuButton({
					  id: "mbtn2",
					  text: "MenuButton_2",
					  menu: new Menu({
						  items: [
							  new MenuItem({id: "mitem21", icon:"sap-icon://cart-3", text: "Item1", press: oController.onPress}),
							  new MenuItem({id: "mitem22", icon:"sap-icon://cart-4", text: "Item2"}),
							  new MenuItem({id: "mitem23", icon:"sap-icon://cart-5", text: "Item3"})
						  ]
					  })
				  })
			  ]
		  }),
		  new Bar({
			  id: "bar0",
			  contentLeft: [
				  new Text({
					  text: "Bar"
				  })
			  ],
			  contentMiddle: [
				  new Button({
					  id: "btn1",
					  text: "Button 1",
					  icon: "sap-icon://cart-3",
					  press: oController.onPress
				  }),
				  new Button({
					  id: "btn2",
					  text: "Button 2",
					  icon: "sap-icon://cart-4",
					  press: oController.onPress
				  }),
				  new Button({
					  id: "btn3",
					  text: "Button 3",
					  icon:"sap-icon://cart-5",
					  press: oController.onPress
				  })
			  ]
		  }),
		  new OverflowToolbar({
			  id: "overflowtb0",
			  content: [
				  new Button({
					  id: "btn4",
					  text: "Button 1",
					  icon: "sap-icon://cart-3",
					  press: oController.onPress
				  }),
				  new Button({
					  id: "btn5",
					  text: "Button 2",
					  icon: "sap-icon://cart-4",
					  press: oController.onPress
				  }),
				  new Button({
					  id: "btn6",
					  text: "Button 3",
					  icon:"sap-icon://cart-5",
					  press: oController.onPress
				  }),
				  new ToolbarSpacer(),
				  new Text({text: "Overflow Toolbar"}),
				  new ToolbarSpacer(),
				  new MenuButton({
					  id: "mbtn1",
					  text: "MenuButton_2",
					  menu: new Menu({
						  itemSelected: oController.onItemPress,
						  items: [
							  new MenuItem({id: "mitem3", icon:"sap-icon://accept", text: "Item1"}),
							  new MenuItem({id: "mitem4", icon:"sap-icon://decline", text: "Item2", press: oController.onPress})
						  ]
					  })
				  })

			  ]
		  }),
			  new Form({
				  id: "form",
				  title: "Form",
				  layout: new GridLayout(),
				  formContainers: [
					  new FormContainer({
						  id: "formContainer",
						  formElements: [
							  new FormElement({
								  id: "formElement",
								  label: "Name",
								  fields: [new Input({
											  value: "{Name}"
										  }
								  )]
							  }),
							  new FormElement({
								  id: "formElement2",
								  label: "CompanyId",
								  fields: [new Input({
											  value: "{CompanyId}"
										  }
								  )]
							  })
						  ]
					  })
				  ]
			  })
		  ];
	  }
  });

  var JSView = await View.create({type:ViewType.JS, viewName:"my.own.view"});


  var MyComponent = UIComponent.extend("MyComponent", {
	  createContent: function () {
		  return new App("myApp", {
			  pages: [new Page({
				  id: "idMain1",
				  content:JSView,
				  footer: new Bar({
					  id: "bar1",
					  contentLeft: [
						  new Button({
							  id: "adapt",
							  text: "Adapt UI",
							  press: function () {
								  var oRta = new RuntimeAuthoring({
									  rootControl: Element.getElementById("idMain1"),
									  flexSettings: {
										  layer: "VENDOR"
									  }
								  });
								  oRta.attachStop(function() {
									  oRta.destroy();
								  })
								  oRta.start();
							  }
						  })
					  ]
				  })
			  })]
		  });
	  }
  });

  new ComponentContainer({
	  component: new MyComponent({id: "Comp1"})
  }).placeAt("content");
});