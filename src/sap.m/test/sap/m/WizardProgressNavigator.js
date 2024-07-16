sap.ui.define([
  "sap/m/WizardProgressNavigator",
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Button",
  "sap/ui/core/Element",
  "sap/m/Input",
  "sap/m/library"
], function(WizardProgressNavigator, App, Page, VerticalLayout, Button, Element, Input, mobileLibrary) {
  "use strict";

  // shortcut for sap.m.InputType
  const InputType = mobileLibrary.InputType;

  var randomTitle = function () {
	  return Array(Math.floor(Math.random() * 10) + 2).join("-").split("").map(function (x) {
		  return Array(Math.floor(Math.random() * 10 + 4)).join("a");

	  }).join(" ");
  }

  var app = new App({initialPage: "landing"});
  var pageOne = new Page("landing", {showHeader: false});

  var steps = 3;
  var maximumSteps = 8;

  while (steps <= maximumSteps) {
	  var navId = "prog-nav-" + steps;

	  (function (navigatorId) {
		  var inputId = navigatorId + "-input";

		  pageOne.addContent(new VerticalLayout({
			  width: "100%",
			  content: [
				  new WizardProgressNavigator(navigatorId, {
					  stepCount: steps,
					  varyingStepCount: steps % 2 === 1,
					  stepTitles: Array(steps + 1).join("-").split("").map(function (s, i) {
						  return randomTitle();
					  })
				  }),
				  new Button({
					  text: "Previous",
					  press: function () {
						  Element.getElementById(navigatorId).previousStep();
					  }
				  }),
				  new Button({
					  text: "Next",
					  press: function () {
						  Element.getElementById(navigatorId).nextStep();
					  }
				  }),
				  new Button({
					  text: "Discard After Step",
					  press: function () {
						  var inputVal = parseInt(Element.getElementById(inputId).getValue(), 10);

						  if (isNaN(inputVal)) {
							  return;
						  }

						  Element.getElementById(navigatorId).discardProgress(inputVal);
					  }
				  }),
				  new Input(inputId, {
					  type: InputType.Number
				  })
			  ]
		  }));
	  }(navId));

	  steps += 1;
  }

  app.addPage(pageOne);
  app.placeAt("content");
});