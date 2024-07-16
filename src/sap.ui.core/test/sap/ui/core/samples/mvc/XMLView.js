sap.ui.define([
  "sap/ui/core/mvc/View",
  "sap/m/Button",
  "sap/ui/core/mvc/ViewType",
  "sap/m/CheckBox",
  "sap/ui/thirdparty/jquery"
], async function(View, Button, ViewType, CheckBox, jQuery) {
  "use strict";
  new Button({text:"Destroy View",press:function(){
	  view.destroy();
	  view2.destroy();
  }}).placeAt("functions");

  new Button({text:"Create View",
	  press: function() {
		  var view = sap.ui.view({
			  id:"myView",
			  viewName:"sap.ui.core.mvctest.Test",
			  type:ViewType.XML
		  });
		  view.placeAt("content");
		  var view2 = sap.ui.view({id:"id2",viewContent:xml, type:ViewType.XML});
		  view2.placeAt("content2");
	  }
  }).placeAt("functions");

  new Button({text:"Re-render View",press:function(){
	  view.invalidate();
	  view2.invalidate();
  }}).placeAt("functions");

  // define View and place it onto the page
  var view = await View.create({
	  id:"myView",
	  viewName:"sap.ui.core.mvctest.Test",
	  type:ViewType.XML
  });
  view.placeAt("content");

  var xml = `
	  <mvc:View xmlns:core="sap.ui.core"
				xmlns:mvc="sap.ui.core.mvc"
				xmlns="sap.ui.commons"
				controllerName="sap.ui.core.mvctest.Test"
				xmlns:html="http://www.w3.org/1999/xhtml">
		  XML view instantiated with XML string:<html:br/>
		  <Button text="Press Me!" press="doIt"></Button>
		  <html:br/>
		  HTML Table with a Phoenix Button inside the last cell:
		  <html:table id="localTableId" border="5">
			  <html:tr>
				  <html:td>cell 1</html:td>
				  <html:td>cell 2</html:td>
				  <html:td>cell 3</html:td>
			  </html:tr>
			  <html:tr>
				  <html:td>cell 4</html:td>
				  <html:td>cell 5</html:td>
				  <html:td>
					  <Button text="Phoenix button in cell 6" press="doIt"></Button>
				  </html:td>
			  </html:tr>
		  </html:table>
		  <html:br/>
		  A simple Text fragment! Followed by a Panel:
		  <html:br/>
		  <Panel>
			  <Button text="Button in default aggregation"></Button>
			  <html:div id="testDiv">HTML div in default aggregation
				  <Button id="anotherid" text="Button in DIV (default aggregation)"></Button>
			  </html:div>
			  <content>
				  <Button id="button" text="Button in named aggregation"></Button>
				  <html:div>HTML div in named aggregation
					  <Button press="doIt" text="Button in DIV (named content)"></Button>
				  </html:div>
			  </content>
		  </Panel>
		  <html:br/>
		  <core:HTML content="&lt;span&gt;I am a HTML control with a button: &lt;/span&gt;&lt;button&gt;Press Me!&lt;/button&gt;"></core:HTML>
	  </mvc:View>`;

  var view2 = await View.create({
	  id:"id2",
	  definition:xml,
	  type:ViewType.XML
  });
  view2.placeAt("content2");

  new Button({
	  text : "Try to parse incorrect View",
	  press : function() {
		  var sHtml = jQuery("#content3_2").html();
		  sHtml = sHtml.replace(/&lt;/g, "<");
		  sHtml = sHtml.replace(/&gt;/g, ">");

		  sap.ui.view({
			  viewContent: sHtml,
			  type : ViewType.XML
		  }).placeAt("content3_3");
	  }
  }).placeAt("content3_1");

  new CheckBox({
	  text : "Use correct XML-declaration",
	  change : function() {
		  var sHtml = jQuery("#content3_2").html();

		  if (this.getChecked()) {
			  sHtml = sHtml.replace("&lt;text text=", "&lt;Text text=");
		  } else {
			  sHtml = sHtml.replace("&lt;Text text=", "&lt;text text=");
			  document.getElementById("content3_3").innerHTML = "";
		  }

		  document.getElementById("content3_2").innerHTML = sHtml;
	  }
  }).placeAt("content3_1");
});