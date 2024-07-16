sap.ui.define([
  "sap/m/Title",
  "sap/m/HBox",
  "sap/m/Input",
  "sap/m/MultiInput",
  "sap/m/StepInput"
], function(Title, HBox, Input, MultiInput, StepInput) {
  "use strict";
  // Note: the HTML page 'InputDescriptionVisualTests.html' loads this module via data-sap-ui-on-init

  // Test page is added due to issue reported in this ticket - 1970315739
  var title = new Title({
	  text: "Samples with Input, MultiInput (extends Input), StepInput (extends Input) and ComboBox (extends InputBase) in the different Content Densities"
  });
  title.placeAt('contentCozy');

  var btn11 = new HBox({
	  items: [
		  new Input({}),
		  new Input({description: "description (Cozy)"})
	  ]
  }).addStyleClass("border");
  btn11.placeAt('contentCozy');

  var btn12 = new HBox({
	  items: [
		  new MultiInput({}),
		  new MultiInput({description: "description (Cozy)"})
	  ]
  }).addStyleClass("border");
  btn12.placeAt('contentCozy');

  var btn13 = new HBox({
	  items: [
		  new StepInput({}),
		  new StepInput({description: "description (Cozy)"})
	  ]
  }).addStyleClass("border");
  btn13.placeAt('contentCozy');

  var btn21 = new HBox({
	  items: [
		  new Input({}),
		  new Input({description: "description (Compact)"})
	  ]
  }).addStyleClass("border");
  btn21.placeAt('contentCompact');

  var btn22 = new HBox({
	  items: [
		  new MultiInput({}),
		  new MultiInput({description: "description (Compact)"})
	  ]
  }).addStyleClass("border");
  btn22.placeAt('contentCompact');

  var btn23 = new HBox({
	  items: [
		  new StepInput({}),
		  new StepInput({description: "description (Compact)"})
	  ]
  }).addStyleClass("border");
  btn23.placeAt('contentCompact');

  var btn31 = new HBox({
	  items: [
		  new Input({}),
		  new Input({description: "description (Condesed)"})
	  ]
  }).addStyleClass("border");
  btn31.placeAt('contentCondesed');

  var btn32 = new HBox({
	  items: [
		  new MultiInput({}),
		  new MultiInput({description: "description (Condesed)"})
	  ]
  }).addStyleClass("border");
  btn32.placeAt('contentCondesed');

  var btn33 = new HBox({
	  items: [
		  new StepInput({}),
		  new StepInput({description: "description (Condesed)"})
	  ]
  }).addStyleClass("border");
  btn33.placeAt('contentCondesed')

  // Same samples without HBox containers
  new Input({width: "150px"}).placeAt('contentCozy');
  new Input({width: "150px", description: "description (Cozy)"}).placeAt('contentCozy');

  new MultiInput({width: "150px"}).placeAt('contentCozy');
  new MultiInput({width: "150px", description: "description (Cozy)"}).placeAt('contentCozy');

  new StepInput({width: "150px"}).placeAt('contentCozy');
  new StepInput({width: "150px", description: "description (Cozy)"}).placeAt('contentCozy');

  new Input({width: "150px"}).placeAt('contentCompact');
  new Input({width: "150px", description: "description (Compact)"}).placeAt('contentCompact');

  new MultiInput({width: "150px"}).placeAt('contentCompact');
  new MultiInput({width: "150px", description: "description (Compact)"}).placeAt('contentCompact');

  new StepInput({width: "150px"}).placeAt('contentCompact');
  new StepInput({width: "150px", description: "description (Compact)"}).placeAt('contentCompact')

  new Input({width: "150px"}).placeAt('contentCondesed');
  new Input({width: "150px", description: "description (Condesed)"}).placeAt('contentCondesed');

  new MultiInput({width: "150px"}).placeAt('contentCondesed');
  new MultiInput({width: "150px", description: "description (Condesed)"}).placeAt('contentCondesed');

  new StepInput({width: "150px"}).placeAt('contentCondesed');
  new StepInput({width: "150px", description: "description (Condesed)"}).placeAt('contentCondesed');
});