sap.ui.define([
  "sap/m/App",
  "sap/m/Page",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Input",
  "sap/ui/core/Item",
  "sap/m/Text",
  "sap/m/MultiInput",
  "sap/m/Token"
], function(App, Page, VerticalLayout, Input, Item, Text, MultiInput, Token) {
  "use strict";
  // Note: the HTML page 'InputClearIcon.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp");


  var fnChange = function (event) {
	  console.log("change: ", event.getParameter("value"));
  };

  var fnLiveChange = function (event) {
	  console.log("live change: ", event.getParameter("value"));
  };

  var page1 = new Page("page1", {
	  title: "Mobile Input Control",
	  content: [
		  new VerticalLayout("oVL", {
			  width: "100%",
			  content: [
				  new Input({
					  placeholder: "Prompt Text",
					  showClearIcon: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),
				  new Input({
					  placeholder: "Prompt Text",
					  showClearIcon: true,
					  showValueHelp: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),
				  new Input({
					  placeholder: "Type Password",
					  type:"Password",
					  showClearIcon: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),
				  new Input({
					  placeholder: "Type Password",
					  type:"Password",
					  value:"Initial password value",
					  showClearIcon: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),
				  new Input({
					  placeholder: "Prompt Text",
					  showClearIcon: true,
					  showValueHelp: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),

				  new Input({
					  value: "Initial value is set",
					  showClearIcon: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),

				  new Input({
					  value: "Initial value is set",
					  showClearIcon: true,
					  showValueHelp: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),

				  new Input({
					  value: "Initial value is set and Suggestions",
					  showClearIcon: true,
					  showValueHelp: true,
					  showSuggestion: true,
					  suggestionItems: [
						  new Item({
							  text: "Albania",
						  }),
						  new Item({
							  text: "Bulgaria",
						  }),
						  new Item({
							  text: "Germany",
						  }),
						  new Item({
							  text: "Dryanovo",
						  }),
						  new Item({
							  text: "Gabrovo",
						  })
					  ],
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),

				  new Text({ text: "---------- Multi Inputs down there --------------" }).addStyleClass("myInput"),

				  new MultiInput({
					  placeholder: "Prompt Text",
					  showClearIcon: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),
				  new MultiInput({
					  placeholder: "Prompt Text",
					  showClearIcon: true,
					  showValueHelp: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),
				  new MultiInput({
					  placeholder: "Prompt Text",
					  showClearIcon: true,
					  showValueHelp: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),

				  new MultiInput({
					  value: "Initial value is set",
					  showClearIcon: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),

				  new MultiInput({
					  value: "Initial value is set",
					  showClearIcon: true,
					  showValueHelp: true,
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),

				  new MultiInput({
					  value: "Initial value is set",
					  showClearIcon: true,
					  showValueHelp: true,
					  tokens: [
						  new Token({ text: "Token 1" }),
						  new Token({ text: "Token 2" }),
						  new Token({ text: "Token 3" }),
					  ],
					  change: fnChange,
					  liveChange: fnLiveChange,
				  }).addStyleClass('myInput'),

				  new Text({ text: "---------- Inputs with description --------------" }).addStyleClass("myInput"),

				  new Input({
					  showClearIcon: true,
					  description: "Tempor proident commodo commodo duis irure ipsum amet.",
					  value: "Dryanovo na tri moreta",
				  }).addStyleClass('myInput'),

				  new Input({
					  showClearIcon: true,
					  showValueHelp: true,
					  description: "Tempor proident commodo commodo duis irure ipsum amet.",
					  value: "Dryanovo na tri moreta",
				  }).addStyleClass('myInput'),

				  new MultiInput({
					  value: "Initial value is set",
					  showClearIcon: true,
					  description: "Tempor proident commodo commodo duis irure ipsum amet.",
					  tokens: [
						  new Token({ text: "Token 1" }),
						  new Token({ text: "Token 2" }),
						  new Token({ text: "Token 3" }),
					  ],
				  }).addStyleClass('myInput'),
			  ]

		  }).addStyleClass("sapUiContentPadding")
	  ],
  });

  app.addPage(page1);
  app.placeAt("body");
});