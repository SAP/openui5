sap.ui.define([
  "sap/m/PagingButton",
  "sap/m/App",
  "sap/m/MessageToast",
  "sap/m/Button",
  "sap/ui/core/IconPool",
  "sap/m/Input",
  "sap/m/Label",
  "sap/m/Page"
], function(PagingButton, App, MessageToast, Button, IconPool, Input, Label, Page) {
  "use strict";

  var app = new App("myApp", {initialPage: "page1"}),
		  oPagingButton = new PagingButton({
			  count: 10, positionChange: function (oEvent) {
				  var msg = 'Position was ' + oEvent.getParameter("oldPosition")
						  + ", now is " + oEvent.getParameter("newPosition");
				  MessageToast.show(msg);
			  }
		  }),
		  getButtons = function () {
			  return [
				  new Button({
					  icon: IconPool.getIconURI("add"),
					  text: "one",
					  enabled: true
				  }),
				  new Button({
					  icon: IconPool.getIconURI("attachment"),
					  text: "two",
					  enabled: true
				  }),
				  new Button({
					  icon: IconPool.getIconURI("paper-plane"),
					  text: "three",
					  enabled: false
				  }),
				  new Button({
					  icon: IconPool.getIconURI("synchronize"),
					  text: "four",
					  enabled: true
				  })];
		  },
		  oChangePositionInput = new Input("changePosition", {
			  liveChange: function (oEvent) {
				  oPagingButton.setPosition(+oEvent.getParameter("value"))
			  }
		  }),
		  oChangePositionLabel = new Label({
			  text: "Change position value",
			  labelFor: "changePosition"
		  }),
		  oChangeCountInput = new Input("changeCount", {
			  liveChange: function (oEvent) {
				  oPagingButton.setCount(+oEvent.getParameter("value"))
			  }
		  }),
		  oChangeCountLabel = new Label({
			  text: "Change count value",
			  labelFor: "changeCount"
		  }),
		  page1 = new Page("page1", {
			  title: "PagingButton",
			  titleLevel: "H1",
			  headerContent: [
				  getButtons(),
				  oPagingButton,
				  getButtons()
			  ],
			  content: [
				  oChangePositionLabel,
				  oChangePositionInput,
				  oChangeCountLabel,
				  oChangeCountInput,
				  getButtons(),
				  new PagingButton({
					  count: 10, positionChange: function (oEvent) {
						  var msg = 'Position was ' + oEvent.getParameter("oldPosition")
								  + ", now is " + oEvent.getParameter("newPosition");
						  MessageToast.show(msg);
					  }
				  }),
				  getButtons()
			  ]
		  });

  app.addPage(page1);

  app.placeAt("body");
});