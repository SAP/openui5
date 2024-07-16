sap.ui.define([
  "sap/ui/core/Component",
  "sap/ui/core/ComponentContainer"
], async function(Component, ComponentContainer) {
  "use strict";
  // Note: the HTML page 'ComponentSimple.html' loads this module via data-sap-ui-on-init

  sap.ui.loader.config({
	  paths: {
		  ["samples"]: "./samples"
	  }
  });

  var oComp = await Component.create({
	  name: "samples.components.button",
	  id: "Comp1",
	  settings: {
		  text: "Hello World 1"
	  }
  });

  var oCompCont = new ComponentContainer("CompCont1", {
	  component: oComp
  });
  oCompCont.placeAt("target1");

  var oComp2 = await Component.create({
	  name: "samples.components.button",
	  url: "samples/components/button",
	  id: "Comp2",
	  settings: {
		  text: "Hello World 2"
	  }
  });
  var oCompCont2 = new ComponentContainer("CompCont2", {
	  component: oComp2
  });
  oCompCont2.placeAt("target2");

  var oCompCont3 = new ComponentContainer("CompCont3", {
	  name: "samples.components.button",
	  settings: {
		  text: "Hello World 3"
	  }
  });
  oCompCont3.placeAt("target3");

  var oCompCont4 = new ComponentContainer("CompCont4", {
	  name: "samples.components.button",
	  url: "samples/components/button",
	  settings: {
		  text: "Hello World 4"
	  }
  });
  oCompCont4.placeAt("target4");
});