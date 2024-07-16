sap.ui.define([
  "sap/m/MessageBox",
  "sap/m/Tokenizer",
  "sap/m/Token",
  "sap/m/Table",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/App",
  "sap/m/Page"
], function(MessageBox, Tokenizer, Token, Table, List, StandardListItem, Label, Button, mobileLibrary, App, Page) {
  "use strict";

  // shortcut for sap.m.TokenizerRenderMode
  const TokenizerRenderMode = mobileLibrary.TokenizerRenderMode;

  //*******************************
  var oEventList = new List();
  var fEventWriter = function(eventArgs){
	  var type = eventArgs.getParameter("type");
	  var item = new StandardListItem({title: "token: " + type});
	  oEventList.addItem(item);
  };

  //*******************************
  var oTokenizer0 = new Tokenizer("editableTokenizerNarrow", {
	  renderMode: "Narrow",
	  width: "400px",
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long text example", key: "0004"}),
		  new Token({text: "Token 5", key: "0005"}),
		  new Token({text: "Token 6", key: "0006"}),
		  new Token({text: "Token 7", key: "0007"}),
		  new Token({text: "Token 8", key: "0008"}),
		  new Token({text: "Token 9 - ABCDEF", key: "0009"}),
		  new Token({text: "Token 10 - ABCDEFGHIKL", key: "0010"}),
		  new Token({text: "Token 11", key: "0011"}),
		  new Token({text: "Token 12", key: "0012"})
	  ],
	  tokenChange: fEventWriter
  });

  oTokenizer0.addAriaLabelledBy(new Label({ text: "Custom Title" }));

  //*******************************
  var oTokenizer01 = new Tokenizer("readonlyTokenizerNarrow", {
	  renderMode: "Narrow",
	  editable: false,
	  width: "400px",
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long text example", key: "0004"}),
		  new Token({text: "Token 5", key: "0005"}),
		  new Token({text: "Token 6", key: "0006"}),
		  new Token({text: "Token 7", key: "0007"}),
		  new Token({text: "Token 8", key: "0008"}),
		  new Token({text: "Token 9 - ABCDEF", key: "0009"}),
		  new Token({text: "Token 10 - ABCDEFGHIKL", key: "0010"}),
		  new Token({text: "Token 11", key: "0011"}),
		  new Token({text: "Token 12", key: "0012"})
	  ]
  });
  oTokenizer01.addAriaLabelledBy(new Label({ text: "Custom Title" }));

  //*******************************
  var oTokenizer1 = new Tokenizer("editableTokenizer", {
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long text example", key: "0004"}),
		  new Token({text: "Token 5", key: "0005"}),
		  new Token({text: "Token 6", key: "0006"}),
		  new Token("tokenToSelect0", {text: "Token 7", key: "0007"}),
		  new Token({text: "Token 8", key: "0008"}),
		  new Token({text: "Token 9 - ABCDEF", key: "0009"}),
		  new Token({text: "Token 10 - ABCDEFGHIKL", key: "0010"}),
		  new Token({text: "Token 11", key: "0011"}),
		  new Token({text: "Token 12", key: "0012"})
	  ],
	  tokenChange: fEventWriter
  });
  //*******************************
  var oTokenizer2 = new Tokenizer("notEditableTokenizer",{
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long text example", key: "0004"}),
		  new Token({text: "Token 5", key: "0005"}),
		  new Token({text: "Token 6", key: "0006"}),
		  new Token("tokenToSelect1", {text: "Token 7", key: "0007"}),
		  new Token({text: "Token 8", key: "0008"}),
		  new Token({text: "Token 9 - ABCDEF", key: "0009"}),
		  new Token({text: "Token 10 - ABCDEFGHIKL", key: "0010"}),
		  new Token({text: "Token 11", key: "0011"}),
		  new Token({text: "Token 12", key: "0012"})
	  ],
	  editable: false,
	  tokenChange: fEventWriter
  });
  //*******************************
  var oTokenizer3 = new Tokenizer("editableAndNotEditable",{
	  tokens:[
		  new Token({text:"Dente", editable: false}),
		  new Token({text:"Friese", editable: false}),
		  new Token("tokenToSelect2", {text:"Mann", editable: true})
	  ]
  });

  var oTokenizer4 = new Tokenizer("setWidth",{
	  tokens:[
		  new Token({text:"Dente", editable: false}),
		  new Token({text:"Friese", editable: false}),
		  new Token("tokenToSelect3", {text:"Mann", editable: true})
	  ],
	  width: "100px"
  });

  var oTokenizer5 = new Tokenizer("editableAndReadonly",{
	  width: "200px",
	  tokens:[
		  new Token({text:"One", editable: true}),
		  new Token({text:"Two", editable: false}),
		  new Token({text:"Three", editable: false}),
		  new Token({text:"Four", editable: true}),
		  new Token({text:"Five", editable: true}),
		  new Token({text:"Six", editable: false}),
		  new Token({text:"Seven", editable: true})
	  ]
  });

  var toggleReadOnlyBtn = new Button({
	  text : "Toggle Read-only",
	  press : function() {
		  oTokenizer5.setEditable(!oTokenizer5.getEditable());
	  }

  });

  var oTokenizer7 = new Tokenizer("tokenizerLongToken", {
	  width: "200px",
	  tokens: [
		  new Token("longToken", {text:"Very long long long long long long long text"})
	  ],
  });
  oTokenizer7.setRenderMode(TokenizerRenderMode.Narrow);

  var oTokenizer8 = new Tokenizer("tokenizerReadOnlyLongToken", {
	  width: "200px",
	  editable: false,
	  tokens: [
		  new Token("longTokenNotEditable", {text:"Very long long long long long long long text"})
	  ],
  });
  oTokenizer8.setRenderMode(TokenizerRenderMode.Narrow);

  var app = new App("myApp");

  var page1 = new Page("page1", {
	  title:"Mobile MultiInput Control",
	  content : [
		  new Label({ text : "Tokenizer.editable = true, Narrow", width:"100%"}),
		  oTokenizer0,
		  new Label({ text : "Tokenizer.editable = false, Narrow", width:"100%"}),
		  oTokenizer01,
		  new Label({ text : "Tokenizer.editable = true", width:"100%"}),
		  oTokenizer1,
		  new Label({ text : "Tokenizer.editable = false", width:"100%"}),
		  oTokenizer2,
		  new Label({ text : "set the first two tokens editable property to false", width:"100%"}),
		  oTokenizer3,
		  new Label({ text : "Token events:", width: "100%"}),
		  oEventList,
		  new Label({ text : "Tokenizer with set width", width: "100%"}),
		  oTokenizer4,
		  new Label({ text : "Tokenizer with editable and non-editable tokens", width: "100%"}),
		  oTokenizer5,
		  toggleReadOnlyBtn,
		  new Label({ text : "Tokenizer with single long token.", width: "100%"}),
		  oTokenizer7,
		  new Label({ text : "Tokenizer with single long token - read only.", width: "100%"}),
		  oTokenizer8
	  ]
  }).addStyleClass("sapUiContentPadding");

  app.addPage(page1);
  app.placeAt("body");
});