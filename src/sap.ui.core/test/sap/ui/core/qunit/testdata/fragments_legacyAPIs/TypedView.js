 sap.ui.define([
  "sap/ui/core/mvc/View",
  "sap/m/Panel"
], function(View, Panel) {
	"use strict";

	/**
	 * Uses sync legacy factories for its content.
	 */
	return View.extend("testdata.fragments_legacyAPIs.TypedView", {
		// define, which controller to use
		getControllerName: function() {
			return "testdata.fragments_legacyAPIs.TypedViewController";
		},
		// create view content and return the root control(s)
		createContent: function() {
			var oController = this.getController();
			var oPanel = new Panel(this.createId("myPanel"));

			var oJsFragment = sap.ui.fragment("example.fragment_legacyAPIs.jstest", "JS", oController);
			oPanel.addContent(oJsFragment);

			var myXml = '<Button xmlns="sap.m" id="xmlfragbtn" text="This is an XML Fragment" press="doSomething"></Button>';
			var oXmlFragment = sap.ui.xmlfragment({
				fragmentContent: myXml
			}, oController);
			oPanel.addContent(oXmlFragment);

			var myHtml = '<div id="htmlfragbtn" data-sap-ui-type="sap.m.Button" data-text="This is an HTML Fragment" data-press="doSomething"></div>';
			var oHtmlFragment = sap.ui.htmlfragment({
				fragmentContent: myHtml
			}, oController);
			oPanel.addContent(oHtmlFragment);

			return [oPanel];
		}
	});
});
