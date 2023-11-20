sap.ui.define([
	"sap/m/Tokenizer",
	"sap/m/Token",
	"sap/m/CheckBox",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/HTML",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(Tokenizer, Token, CheckBox, App, Page, HTML, Toolbar, ToolbarSpacer) {
	"use strict";

	var oTokenizer1 = new Tokenizer("editableTokenizer", {
			tokens: [
				new Token("firstToken", {text: "Token 1", key: "0001"}),
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
		}),
		oTokenizer2 = new Tokenizer("notEditableTokenizer",{
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
			editable: false
		}),
		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),
		app = new App("myApp"),

		oPage = new Page("page1", {
			title:"Tokenizer Accessibility Test Page",
			content : [
				new HTML({ content: "<h2>Editable Tokenizer</h2>" }),
				oTokenizer1,
				new HTML({ content: "<h2>Non-editable Tokenizer</h2>" }),
				oTokenizer2
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		});

	app.addPage(oPage);
	app.placeAt("body");
});
