sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/model/json/JSONModel",
  "sap/m/Label",
  "sap/base/Log",
  "sap/ui/performance/Measurement",
  "sap/ui/core/mvc/Controller"
], async function(XMLView, JSONModel, Label, Log, Measurement) {
  "use strict";
  // Note: the HTML page 'StashedControlSupport.html' loads this module via data-sap-ui-on-init

  var myController = sap.ui.controller("mycontroller", {
	  onInit: function() {
		  Log.debug("in controller onInit");
	  }
  });

  var oModel = new JSONModel({
	  stashed3: false,
	  stashed4: false
  });


  Measurement.setActive(true);
  Measurement.start("view_loading");
  (await XMLView.create({
	  id: "view1",
	  controller: myController,
	  definition: document.getElementById("myview").innerHTML
  })).setModel(oModel).placeAt("content");
  Measurement.end("view_loading");
  new Label({
	  text: "loading time: " + Measurement.getMeasurement("view_loading").duration + " ms"
  }).placeAt("result");
});