sap.ui.define([
	"sap/m/Button",
	"sap/m/Text",
	"sap/ui/core/mvc/JSView",
	"sap/ui/layout/VerticalLayout"
], function(Button, Text, JSView, VerticalLayout) {
	"use strict";

	sap.ui.jsview("testdata.customizing.sync_legacyAPIs.jsview.sap.Sub", {

		getControllerName : function(){
			return "testdata.customizing.sync_legacyAPIs.jsview.sap.Sub";
		},
		createContent : function(oController) {
			var that = this;
			var ext1, ext2, ext3, ext4, ext5;
			var fnCreateDefaultContent = function(){
				return [
					new Text(that.createId("defaultContentText"), {
						text: "Extension point 1: Default Content"
					})
				];
			};
			ext1 = sap.ui.extensionpoint(this, "extension41", fnCreateDefaultContent);
			ext2 = new VerticalLayout({
				content: [
					new Button({text: "I am preceding the extension point"}),
					sap.ui.extensionpoint(this, "extension42" /*, has no default content*/),
					new Button({text: "I am following the extension point"})
				]
			});
			ext3 = new VerticalLayout();
			sap.ui.extensionpoint(this, "extension43", null,  ext3, "content");
			var fnCreateDefaultContent2 = function(){
				return [
					new Text(that.createId("iShouldBeDestroyed1"), {
						text: "Extension point 44: Default Content"
					}),
					new Text(that.createId("iShouldBeDestroyed2"), {
						text: "Extension point 44: Second Default Content"
					})
				];
			};
			ext4 = sap.ui.extensionpoint(this, "extension45", fnCreateDefaultContent2);

			var fnCreateDefaultContent3 = function(){
				return [
					new Text(that.createId("defaultContentText2"), {
						text: "Extension point 667: Default Content"
					}),
					new Text(that.createId("defaultContentText3"), {
						text: "Extension point 667: Second Default Content"
					})
				];
			};
			ext5 = sap.ui.extensionpoint(this, "extension667", fnCreateDefaultContent3);

			var oLayout = new VerticalLayout("Layout1", {
				content: [
					new Text({
						text: "SAP View 'Sub' - the text after this one is hidden by customizing: "
					}),
					new Text("customizableText1", {
						text: "This text is made invisible by customization"
					}),
					ext1,
					ext2,
					ext3,
					ext4,
					ext5
				]
			});

			return oLayout;
		}
	});

});
