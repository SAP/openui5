sap.ui.define([
  "sap/m/FormattedText",
  "sap/m/library",
  "sap/m/TextArea",
  "sap/m/Button",
  "sap/m/Page",
  "sap/m/VBox",
  "sap/m/App"
], function(FormattedText, mobileLibrary, TextArea, Button, Page, VBox, App) {
  "use strict";

  // shortcut for sap.m.LinkConversion
  const LinkConversion = mobileLibrary.LinkConversion;

  // Note: the HTML page 'FormattedText.html' loads this module via data-sap-ui-on-init

  var htmlText = '<h1>Header 1</h1>\n';
  htmlText += '<h3>Header 3</h3>\n';
  // link
  htmlText += '<p><a href="//www.sap.com" target="_top" style="color:green; font-weight:600;">www.sap.com</a> - opens in a new window.\n';
  // link with a script
  htmlText += '<p><a href="javascript:alert(\'You have clicked a link!\');void(0);">script link</a>\n - <code>href=&lt;javascript:..&gt;</code> is not allowed.';
  // list
  htmlText += '<ul>\n';
  htmlText += '<li class="https://sdk.openui5.org">&lt;ul&gt; - &lt;li&gt;</li>\n';
  htmlText += '<li>Span <span class="foo">span class="foo"</span> &bull; <strong>strong</strong> &bull; <em>em</em> &bull; <u>u</u></li>\n';
  htmlText += '<li style="background-color: rgb(255, 255, 255);">white background</li>\n';
  htmlText += '</ul>\n';
  // pre
  htmlText += '<pre>https://sdk.openui5.org <h3>www.sap.com</h3> <h4 class="www.sap.com">Something else https://sdk.openui5.org</h4></pre>\n';
  // dl - dt - dd
  htmlText += '<dl data="https://sdk.openui5.org"><dt>dl - dt - de:</dt><dd>Definition list <code>&lt;dl&gt;</code> of terms <code>&lt;dt&gt;</code> and descriptions <code>&lt;dd&gt;</code></dd>\n';
  htmlText += '<br><cite>Cite: a reference to a source</cite>\n';

  var oFT = new FormattedText("FormattedText", {
	  convertLinksToAnchorTags: LinkConversion.All,
	  htmlText: htmlText,
	  width: "80%",
	  height: "auto"
  }).addStyleClass("oft");

  var oTextArea = new TextArea({
	  value:htmlText,
	  width: "100%",
	  height: "300px"
  });
  var oButton1 = new Button("B1", {
	  text : "Update",
	  press : function() {
		  oFT.setHtmlText(oTextArea.getValue());
	  }
  });

  var page = new Page({
	  title : "sap.m.FormattedText Control",
	  enableScrolling : true,
	  content : new VBox({ items: [
		  oTextArea,
		  oButton1,
		  oFT
	  ]})
  });

  new App().addPage(page).placeAt("body");
});