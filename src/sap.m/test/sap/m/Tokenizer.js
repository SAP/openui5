sap.ui.define([
  "sap/m/MessageBox",
  "sap/m/Tokenizer",
  "sap/m/Token",
  "sap/m/Table",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/library",
  "sap/m/OverflowToolbarLayoutData",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/Toolbar",
  "sap/m/Text",
  "sap/m/Title",
  "sap/ui/core/Icon",
  "sap/m/ToolbarSpacer",
  "sap/m/OverflowToolbar",
  "sap/m/MessageToast",
  "sap/m/App",
  "sap/m/Page"
], function(
  MessageBox,
  Tokenizer,
  Token,
  Table,
  List,
  StandardListItem,
  mobileLibrary,
  OverflowToolbarLayoutData,
  Label,
  Button,
  Toolbar,
  Text,
  Title,
  Icon,
  ToolbarSpacer,
  OverflowToolbar,
  MessageToast,
  App,
  Page
) {
  "use strict";

  // shortcut for sap.m.OverflowToolbarPriority
  const OverflowToolbarPriority0 = mobileLibrary.OverflowToolbarPriority;

  //*******************************
  var oEventList = new List();
  var fEventWriter = function(eventArgs){
	  var type = eventArgs.getParameter("type");
	  var item = new StandardListItem({title: "token: " + type});
	  oEventList.addItem(item);
  };
  var OverflowToolbarPriority = OverflowToolbarPriority0;
  //*******************************
  var oTokenizer0 = new Tokenizer("editableTokenizerNarrow", {
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
	  width: "150px"
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
	  ]
  });

  var oTokenizer8 = new Tokenizer("tokenizerReadOnlyLongToken", {
	  width: "200px",
	  editable: false,
	  tokens: [
		  new Token("longTokenNotEditable", {text:"Very long long long long long long long text"})
	  ]
  });

  var oTokenizer9 = new Tokenizer("overflowToolbarTokenizer", {
	  width: "50%",
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
		  new Token({text: "Token with text", key: "0010"}),
		  new Token({text: "Token 11", key: "0011"}),
		  new Token({text: "Token 12", key: "0012"})
	  ],
	  tokenChange: fEventWriter,
	  layoutData: new OverflowToolbarLayoutData({
		  priority: OverflowToolbarPriority.Low,
		  shrinkable: true,
		  minWidth: "200px"
	  })
  });

  const oTokenizer10 = new Tokenizer("toolbarTokenizer", {
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long text example", key: "0004"}),
		  new Token({text: "Token 5", key: "0005"}),
	  ],
	  tokenChange: fEventWriter
  });

  const oToolbarTokenizer = new Toolbar("toolbar-tokenizer", {
	  active : true,
	  ariaHasPopup: "dialog",
	  tooltip : "This is a bar with tokenizer",
	  content : [
		  new Label({text : "Filter by:", tooltip: "Filter by:"}),
		  oTokenizer10,
		  new Text({text: "Text"}),
		  new Title({text: "Title", level: "H1"}),
		  new Icon({src : "sap-icon://collaborate"}),
		  new ToolbarSpacer(),
		  new Button({
			  text : "Remove",
			  type : "Reject"
		  })
	  ]
  })

  const overflowToolbarContent = [
	  new Label({
		  text : "Filtered by:"
	  }),
	  oTokenizer9,
	  new ToolbarSpacer(),
	  new Button({
		  text: "Add",
		  layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low})
	  }),
	  new Button({
		  text: "Delete",
		  layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low})
	  }),
	  new Button({
		  text: "Change",
		  layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low})
	  }),
	  new Button({text: "Notes"}),

	  new ToolbarSpacer(),
	  new Button({
		  text : "Cut",
		  layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow})
	  }),
	  new Button({
		  text : "Copy",
		  layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow})
	  }),
	  new Button({
		  text : "Paste",
		  layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow})
	  })
  ];

  const overflowToolbar = new OverflowToolbar("otb2", {
	  content : overflowToolbarContent
  });

  const oDisabledTokenizer = new Tokenizer("disabled-tokenizer", {
	  enabled: false,
	  tokens: [
		  new Token({text: "Disabled Token 1", key: "0001"}),
		  new Token({text: "Disabled Token 2", key: "0002"})
	  ],
  });

  var oDisabledNMoreTokenizer = new Tokenizer("disabled-tokenizer-nmore", {
	  enabled: false,
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

  var oNMoreTokenizerWithLongToken = new Tokenizer("long-token-nmore", {
	  width: "400px",
	  tokens: [
		  new Token({text: "Token 1", key: "0001"}),
		  new Token({text: "Token 2", key: "0002"}),
		  new Token({text: "Token 3", key: "0003"}),
		  new Token({text: "Token 4 - long token text example - as last token it is put (hidden) in the nMore first", key: "0004"})
	  ]
  });

  fHandleTokenDelete = (oEvent) => {
	  var aDeletedTokens = oEvent.getParameter("tokens");
	  aDeletedTokens.forEach(function (oToken) {
		  MessageToast.show("Token deleted: " + oToken.getText());
		  oAddRemoveTokens.removeToken(oToken);
	  });
  }

  var oAddRemoveTokens = new Tokenizer("add-remove-tokens", {
	  width: "100%",
	  tokens: [
		  new Token({text: "One", key: "0001"}),
		  new Token({text: "Two", key: "0002"}),
		  new Token({text: "Three", key: "0003"})
	  ],
	  tokenDelete: fHandleTokenDelete
  });

  var oAddTokensButton = new Button({
	  text: "Add Tokens",
	  press: function() {
		  oAddRemoveTokens.addToken(new Token({
			  text: "And another one",
			  key: Math.random().toString().substring(3)
		  }));

		  MessageToast.show("Token added");
		  }
	  }
  );

  var app = new App("myApp");

  var page1 = new Page("page1", {
	  title:"sap.m.Tokenizer Test Samples",
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
		  oTokenizer8,
		  new Label({ text : "NMore tokenizer with one long token", width: "100%"}),
		  oNMoreTokenizerWithLongToken,
		  new Label({ text : "OverflowToolbar with Tokenizer", width: "100%"}),
		  overflowToolbar,
		  new Label({ text : "Toolbar with Tokenizer", width: "100%"}),
		  oToolbarTokenizer,
		  new Label({ text : "Tokenizer with disabled='true'", width: "100%"}),
		  oDisabledTokenizer,
		  new Label({ text : "Disabled Tokenizer with nMore indicator", width: "100%"}),
		  oDisabledNMoreTokenizer,
		  new Label({ text : "Add/Remove tokens", width: "100%"}),
		  oAddRemoveTokens,
		  oAddTokensButton
	  ]
  }).addStyleClass("sapUiContentPadding");

  app.addPage(page1);
  app.placeAt("body");
});