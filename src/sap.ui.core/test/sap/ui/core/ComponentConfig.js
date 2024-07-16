sap.ui.define([
  "sap/ui/core/Component",
  "sap/ui/core/ComponentContainer"
], async function(Component, ComponentContainer) {
  "use strict";
  // Note: the HTML page 'ComponentConfig.html' loads this module via data-sap-ui-on-init

  sap.ui.loader.config({
	  paths: {
		  ["samples"]: "./samples"
	  }
  });

  var oComp = await Component.create({
	  name: "samples.components.config"
  });
  var oCompCont = new ComponentContainer({
	  component: oComp
  });
  oCompCont.placeAt("content");
});