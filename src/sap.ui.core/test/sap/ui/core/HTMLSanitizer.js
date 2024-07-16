sap.ui.define([
  "sap/ui/layout/Grid",
  "sap/m/Title",
  "sap/ui/layout/GridData",
  "sap/m/TextArea",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Button",
  "sap/m/CheckBox",
  "sap/ui/core/HTML"
], function(Grid, Title, GridData, TextArea, VerticalLayout, Button, CheckBox, HTML) {
  "use strict";
  // Note: the HTML page 'HTMLSanitizer.html' loads this module via data-sap-ui-on-init

  var oTextArea, oHTML, oResultView;

  new Grid({
	  content: [
		  new Title({
			  titleStyle: 'H2',
			  text:"Input (unsafe)",
			  layoutData: new GridData({
				  span: "L5 M5 S5"
			  })
		  }),
		  new Title({
			  titleStyle: 'H2',
			  text:"Output (sanitized)",
			  layoutData: new GridData({
				  span: "L3 M3 S3"
			  })
		  }),
		  new Title({
			  titleStyle: 'H2',
			  text:"HTML Control",
			  layoutData: new GridData({
				  span: "L3 M3 S3"
			  })
		  }),
		  oTextArea = new TextArea({
			  width: '100%',
			  height: '300px',
			  value: '<div><br>\n<span>some <b>bold</b> or <i>italic</i> or <font size="+2">taller</font>Text</span><br>\n<a href="http://anonymous.org">Some Link</a><br>\n<script>alert("XSS attack");</' + 'script><br>\n</div>',
			  layoutData: new GridData({
				  span: "L3 M3 S3",
				  linebreak: true
			  })
		  }),
		  new VerticalLayout({
			  content: [
				  new Button({
					  text: "Set as content ->",
					  press: function() {
						  oHTML.setContent(oTextArea.getValue());
						  oResultView.setValue(oHTML.getContent());
					  }
				  }),
				  new CheckBox({
					  text: "Sanitize",
					  select: function() {
						  oHTML.setSanitizeContent(this.getSelected());
					  }
				  })
			  ],
			  layoutData: new GridData({
				  span: "L2 M2 S2"
			  })
		  }),
		  oResultView = new TextArea({
			  width: '100%',
			  height: '300px',
			  value: '',
			  layoutData: new GridData({
				  span: "L3 M3 S3"
			  })
		  }),
		  oHTML = new HTML({
			  layoutData: new GridData({
				  span: "L3 M3 S3"
			  })
		  })
	  ]
  }).placeAt("content");
});