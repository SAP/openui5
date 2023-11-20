sap.ui.define([
	'sap/ui/core/mvc/View',
	'sap/ui/core/ExtensionPoint',
	'sap/ui/layout/VerticalLayout',
	'sap/m/Button',
	'sap/m/Text'],
	function (View, ExtensionPoint, VerticalLayout, Button, Text) {
		"use strict";

	return View.extend("testdata.customizing.async.integration.sap.views.JSView1", {

		getControllerName: function () {
			return "testdata.customizing.async.integration.sap.controller.JSView1";
		},

		createContent: function (oController) {
			var that = this;

			var fnCreateDefaultContent = function () {
				return new Text(that.createId("defaultContentText1"), { text: "Extension point 1: Default Content" });
			};
			var pNotExtisingExtPoint1 = ExtensionPoint.load({ container: this, name: "notExisting1", createDefaultContent: fnCreateDefaultContent, async: true });
			var pExtPoint1 = ExtensionPoint.load({ container: this, name: "ExtPoint1" /*, has no default content*/ , async: true});
			var pExtPoint2 = ExtensionPoint.load({ container: this, name: "ExtPoint2", async: true });

			var fnCreateDefaultContent2 = function () {
				return [
					new Text(that.createId("defaultContentText2"), { text: "Default Content" }),
					new Text(that.createId("defaultContentText3"), { text: "Default Content" })
				];
			};
			var pNotExistingExtPoint2 = ExtensionPoint.load({ container: this, name: "notExisting2", createDefaultContent: fnCreateDefaultContent2, async: true });

			var fnCreateDefaultContent3 = function () {
				return [
					new Text(that.createId("defaultContentText4"), { text: "Default Content" }),
					new Text(that.createId("defaultContentText5"), { text: "Default Content" })
				];
			};
			var pNotExistingExtPoint3 = ExtensionPoint.load({ container: this, name: "notExisting3", createDefaultContent: fnCreateDefaultContent3, async: true});

			var oLayout1 = new VerticalLayout("layout1");
			var oLayout2 = new VerticalLayout("layout2");
			var oLayout3 = new VerticalLayout("layout3");
			var oText = new Text("customizableText1", { text: "This text is made invisible by customization" });

			return Promise.all([
				pNotExtisingExtPoint1,
				pExtPoint1,
				pExtPoint2,
				pNotExistingExtPoint2,
				pNotExistingExtPoint3
			]).then(function (aExtensionPoints) {
				oLayout1.addContent(new Button({ text: "I am preceding the extension point" }));
				oLayout1.addContent(aExtensionPoints[1][0]);
				oLayout1.addContent(new Button({ text: "I am following the extension point" }));

				oLayout2.addContent(aExtensionPoints[2][0]);
				oLayout2.addContent(aExtensionPoints[2][1]);

				oLayout3.addContent(oText);
				oLayout3.addContent(aExtensionPoints[0][0]);
				oLayout3.addContent(aExtensionPoints[3][0]);
				oLayout3.addContent(aExtensionPoints[3][1]);
				oLayout3.addContent(aExtensionPoints[4][0]);
				oLayout3.addContent(aExtensionPoints[4][1]);

				return [oLayout1, oLayout2, oLayout3];
			});
		}
	});
});