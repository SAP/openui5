sap.ui.define(['sap/m/Button', 'sap/m/Text', 'sap/ui/core/mvc/View', 'sap/ui/layout/VerticalLayout'],
	function(Button, Text, View, VerticalLayout) {
	"use strict";

	return View.extend("testdata.customizing.sap.Sub4Typed", {

		getControllerName : function(){
			return "testdata.customizing.sap.Sub4TypedController";
		},
		createContent : function(oController) {
			var that = this;
			var ext1, ext2, ext3, ext4, ext5;
			var fnCreateDefaultContent = function(){
				var aDefaultContent = [
					new Text(that.createId("defaultContentTextView"), {text: "Extension point 1: Default Content"})
				];
				return aDefaultContent;
			};
			ext1 = sap.ui.extensionpoint(this, "extension41Typed", fnCreateDefaultContent);
			ext2 = new VerticalLayout({
				content: [
					new Button({text: "I am preceding the extension point"}),
					sap.ui.extensionpoint(this, "extension42Typed" /*, has no default content*/),
					new Button({text: "I am following the extension point"})
				]
			});
			ext3 = new VerticalLayout();
			sap.ui.extensionpoint(this, "extension43Typed", null,  ext3, "content");
			var fnCreateDefaultContent2 = function(){
				return [
					new Text(that.createId("iShouldBeDestroyed1"), {text: "Extension point 44: Default Content"}),
					new Text(that.createId("iShouldBeDestroyed2"), {text: "Extension point 44: Second Default Content"})
				];
			};
			ext4 = sap.ui.extensionpoint(this, "extension45Typed", fnCreateDefaultContent2);

			var fnCreateDefaultContent3 = function(){
				return [
					new Text(that.createId("defaultContentTextView2"), {text: "Extension point 667: Default Content"}),
					new Text(that.createId("defaultContentTextView3"), {text: "Extension point 667: Second Default Content"})
				];
			};
			ext5 = sap.ui.extensionpoint(this, "extension667Typed", fnCreateDefaultContent3);

			var oLayout = new VerticalLayout("typedLayout1", {
				content: [
					new Text({text: "SAP View 'Sub4Typed' - the text after this one is hidden by customizing: "}),
					new Text("typedCustomizableText1", {text: "This text is made invisible by customization"}),
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
