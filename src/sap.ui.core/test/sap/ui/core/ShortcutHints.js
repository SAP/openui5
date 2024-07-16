sap.ui.define([
  "sap/ui/core/Component",
  "sap/ui/core/ComponentContainer"
], async function(Component, ComponentContainer) {
  "use strict";
  // Note: the HTML page 'ShortcutHints.html' loads this module via data-sap-ui-on-init

  sap.ui.loader.config({
	  paths: {
		  ["samples"]: "./samples"
	  }
  });

  var oComponent = await Component.create({
	  manifestUrl: "samples/components/commands/manifest.json"
  });

  var oContainer = new ComponentContainer({
	  component: oComponent
  });
  oContainer.placeAt("content");
});