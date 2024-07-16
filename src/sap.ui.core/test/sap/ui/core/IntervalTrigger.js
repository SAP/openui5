sap.ui.define([
  "sap/ui/core/IntervalTrigger",
  "sap/m/ButtonRenderer",
  "sap/ui/core/Control",
  "sap/m/Label",
  "sap/m/Button",
  "sap/ui/layout/VerticalLayout",
  "sap/ui/layout/HorizontalLayout"
], function(IntervalTrigger, ButtonRenderer, Control, Label, Button, VerticalLayout, HorizontalLayout) {
  "use strict";

  var triggerCounter = 0;

  var MySampleListener = Control.extend("MySampleListener", {
	  metadata : {
		  properties : {
			  "index" : "int"
		  }
	  },

	  renderer : {
		  apiVersion: 2,
		  render: function(oRm, oControl) {
			  oRm.openStart("div", oControl);
			  oRm.class("sampleListener");
			  oRm.openEnd();

			  oRm.text("Lorem Ipsum");

			  oRm.close("div");
		  }
	  },

	  onclick : function(oEvent) {
		  this.trigger();
	  },

	  trigger : function() {
		  triggerCounter += 1;
		  oLbl.setText("Call back calls: " + triggerCounter);

		  var oThis = this;
		  oThis.$().css("background-color", "green");

		  setTimeout(function() {
			  oThis.$().css("background-color", "red");
		  }, 500);
	  }
  });

  var oLbl = new Label({
	  text : "Call back calls: " + triggerCounter
  }).placeAt("counter");

  function removeListener(oTriggerBtn) {
	  var index = oTriggerBtn.getIndex();
	  oTrigger.removeListener(aListeners[index].trigger, aListeners[index]);
  }

  var oTrigger = new IntervalTrigger();

  var MyTriggerButton = Button.extend("MyTriggerButton", {
	  metadata : {
		  properties : {
			  "index" : "int"
		  }
	  },

	  renderer : ButtonRenderer
  });

  var aListeners = [];
  var oBtn = {};
  var oLayout = new VerticalLayout().placeAt("triggers");

  for ( var i = 0; i < 10; i++) {
	  aListeners[i] = new MySampleListener();
	  oBtn = new MyTriggerButton({
		  text : "Remove from trigger",
		  index : i,
		  press : function() {
			  removeListener(this);
		  }
	  });

	  oLayout.addContent(
		  new HorizontalLayout({
			  content: [
				  aListeners[i],
				  oBtn
			  ]
		  })
	  );
	  oTrigger.addListener(aListeners[i].trigger, aListeners[i]);
  }

  new Button({
	  text : "Start trigger",
	  press : function() {
		  oTrigger.setInterval(1000);
	  }
  }).placeAt("attachIntervalBtn");
});