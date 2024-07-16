sap.ui.define([
  "sap/m/MessageBox",
  "sap/m/Token",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Label",
  "sap/ui/core/library"
], function(MessageBox, Token, App, Page, Label, coreLibrary) {
  "use strict";

  // shortcut for sap.ui.core.TextDirection
  const TextDirection = coreLibrary.TextDirection;

  var app = new App("myApp");

  var tokenDeleted = function(args){
	  MessageBox.alert("Token deleted: " +  args.oSource.getText());
  };

  var page1 = new Page("page1", {
	  title:"Mobile Token Control",
	  content : [
			  new Label({ text : "Tokens:", width: "100%"}),
			  new Token("tokenNotSelected1", {key : "01", text : "1. Token", "delete": tokenDeleted}),
			  new Token({key : "02", text : "2. Token with very long text example", "delete": tokenDeleted}),
			  new Token("tokenNotSelected3", {key : "03", text : "3. no edit Token", "delete": tokenDeleted, editable: false}),
			  new Label({ text : "Selected tokens:", width: "100%"}),
			  new Token("tokenSelected4", {key : "04", text : "4. Token", "delete": tokenDeleted, selected: true}),
			  new Token({key : "05", text : "5. Token with very long text example", "delete": tokenDeleted, selected: true}),
			  new Token("tokenSelected6", {key : "06", text : "6. no edit Token", "delete": tokenDeleted, editable: false, selected: true}),
			  new Label({ text : "Token with textDirection set to RTL", width: "100%"}),
			  new Token("tokenRTL",{key : "07", text : "123 456", textDirection: TextDirection.RTL, "delete": tokenDeleted, selected: true}),
			  new Label({ text : "The same token but with default textDirection", width: "100%"}),
			  new Token({key : "08", text : "123 456", "delete": tokenDeleted, selected: true})
			  ]
  });
  app.addPage(page1);

  app.placeAt("body");
});