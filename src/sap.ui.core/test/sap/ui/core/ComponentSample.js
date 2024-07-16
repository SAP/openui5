sap.ui.define([
  "sap/ui/core/Component",
  "sap/ui/core/ComponentContainer"
], async function(Component, ComponentContainer) {
  "use strict";
  // Note: the HTML page 'ComponentSample.html' loads this module via data-sap-ui-on-init

  sap.ui.loader.config({
	  paths: {
		  ["samples"]: "./samples"
	  }
  });

  var oComponent = await Component.create({
	  manifestUrl: "samples/components/sample/manifest.json"
  });

  var oContainer = new ComponentContainer({
	  component : oComponent
  });
  oContainer.placeAt("target");
});