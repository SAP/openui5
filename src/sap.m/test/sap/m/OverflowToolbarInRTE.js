sap.ui.define([
  "sap/ui/core/Core",
  "sap/ui/richtexteditor/library"
], function(Core, richtexteditorLibrary) {
  "use strict";

  // shortcut for sap.ui.richtexteditor.EditorType
  const EditorType = richtexteditorLibrary.EditorType;

  sap.ui.getCore();

  Core.ready(function () {
	  function _buildLayout(App, Page, aContent) {
		  var oApp = new App("myApp", {
			  initialPage: "myPage"
		  });

		  var oPage = new Page("myPage", {
			  title: "OverflowToolbar in RichTextEditor",
			  showNavButton: true,
			  contentOnlyBusy: true,
			  content: aContent
		  });

		  oApp.addPage(oPage).placeAt("content");
	  }

	  try {
		  sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/m/App", "sap/m/Page", "sap/m/Button"],
			  function (RTE, App, Page, Button) {
				  var oRichTextEditor = new RTE("myRTE", {
					  editorType: EditorType.TinyMCE4,
					  width: "100%",
					  height: "300px",
					  showGroupFont: true,
					  showGroupUndo: true,
					  showGroupLink: true,
					  showGroupInsert: true,
					  customToolbar: true,
					  tooltip: "My RTE Tooltip",
					  value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean libero urna, bibendum non dapibus in, sollicitudin ac nulla. Donec ac mi at mi commodo sollicitudin.",
					  customButtons: [new Button({
						  id: "my-custom-button",
						  text: "Custom Button",
						  icon: "sap-icon://crm-sales",
						  type: "Transparent",
						  press: function () {
							  oRichTextEditor.setValue("Hello world!");
						  }
					  })],
					  ready: function () {
						  var oTinyMCE = oRichTextEditor.getNativeApi();
						  oTinyMCE.selection.select(oTinyMCE.getBody(), true);
					  }
				  });

				  _buildLayout(App, Page, [oRichTextEditor]);
			  });
	  } catch (e) {
		  sap.ui.require(["sap/m/App", "sap/m/Page", "sap/m/OverflowToolbar", "sap/m/Button"],
			  function (App, Page, OverflowToolbar, Button) {
				  var oToolbar = new OverflowToolbar({
					  content: [
						  new Button({id: "myRTE__wrapper0-Bold", icon: "sap-icon://bold-text", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-Italic", icon: "sap-icon://italic-text", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-Underline", icon: "sap-icon://underline-text", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-Strikethrough", icon: "sap-icon://edit", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-TextColor", icon: "sap-icon://text-color", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-BackgroundColor", icon: "sap-icon://color-fill", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-UnorderedList", icon: "sap-icon://list", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-OrderedList", icon: "sap-icon://numbered-text", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-Outdent", icon: "sap-icon://outdent", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-Indent", icon: "sap-icon://indent", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-InsertLink", icon: "sap-icon://chain-link", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-InsertImage", icon: "sap-icon://picture", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-Undo", icon: "sap-icon://undo", type: "Transparent"}),
						  new Button({id: "myRTE__wrapper0-Redo", icon: "sap-icon://redo", type: "Transparent"}),
						  new Button({id: "my-custom-button", text: "Custom Button", icon: "sap-icon://crm-sales", type: "Transparent"})
					  ]
				  });
				  var oButton1 = new Button({id: "myRTE__wrapper0-CancelInsertImageButton", text: "Close Image", type: "Transparent"});
				  var oButton2 = new Button({id: "myRTE__wrapper0-CancelInsertLinkButton", text: "Close Link", type: "Transparent"});

				  _buildLayout(App, Page, [oToolbar, oButton2, oButton1]);
			  });
	  }
  });
});