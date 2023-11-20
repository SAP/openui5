sap.ui.define(['sap/ui/core/ExtensionPoint', 'sap/m/Button', 'sap/m/Text', 'sap/ui/core/mvc/View', 'sap/ui/layout/VerticalLayout'],
	function(ExtensionPoint, Button, Text, View, VerticalLayout) {
	"use strict";

	return View.extend("testdata.customizing.sap.Sub4Typed", {

		getControllerName : function(){
			return "testdata.customizing.sap.Sub4TypedController";
		},
		createContent : function(oController) {
			var that = this;

			var fnCreateDefaultContent = function(){
				var aDefaultContent = [
					new Text(that.createId("defaultContentTextView"), {text: "Extension point 1: Default Content"})
				];
				return aDefaultContent;
			};

			var aAllEPs = [];

			// ext1
			aAllEPs.push(
				ExtensionPoint.load({
					name: "extension41Typed",
					createDefaultContent: fnCreateDefaultContent,
					container: this,
					async: true
				})
			);

			// ext2
			aAllEPs.push(
				ExtensionPoint.load({
					name: "extension42Typed",
					createDefaultContent: undefined /* has no default content */,
					container: this,
					async: true
				}).then(function(oResult) {
					return new VerticalLayout({
						content: [
							new Button({text: "I am preceding the extension point"}),
							oResult,
							new Button({text: "I am following the extension point"})
						]
					});
				})
			);

			// ext3
			aAllEPs.push(
				ExtensionPoint.load({
					name: "extension43Typed",
					createDefaultContent: undefined /* has no default content */,
					container: this,
					async: true
				}).then(function(aResult) {
					return new VerticalLayout({
						content: aResult
					});
				})
			);

			// ext4
			var fnCreateDefaultContent2 = function(){
				return [
					new Text(that.createId("iShouldBeDestroyed1"), {text: "Extension point 44: Default Content"}),
					new Text(that.createId("iShouldBeDestroyed2"), {text: "Extension point 44: Second Default Content"})
				];
			};
			aAllEPs.push(
				ExtensionPoint.load({
					name: "extension45Typed",
					createDefaultContent: fnCreateDefaultContent2,
					container: this,
					async: true
				})
			);

			// ext5
			var fnCreateDefaultContent3 = function(){
				return [
					new Text(that.createId("defaultContentTextView2"), {text: "Extension point 667: Default Content"}),
					new Text(that.createId("defaultContentTextView3"), {text: "Extension point 667: Second Default Content"})
				];
			};
			aAllEPs.push(
				ExtensionPoint.load({
					name: "extension667Typed",
					createDefaultContent: fnCreateDefaultContent3,
					container: this,
					async: true
				})
			);

			return Promise.all(aAllEPs).then(function(aResultControls){
				return new VerticalLayout("typedLayout1", {
					content: [
						new Text({text: "SAP View 'Sub4Typed' - the text after this one is hidden by customizing: "}),
						new Text("typedCustomizableText1", {text: "This text is made invisible by customization"}),
						aResultControls[0],
						aResultControls[1],
						aResultControls[2],
						aResultControls[3],
						aResultControls[4]
					]
				});
			});
		}
	});


});
