sap.ui.define([
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Popover",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/layout/ResponsiveFlowLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData"
], function(Button, CheckBox, Input, Label, Popover, CoreController, XMLView, ResponsiveFlowLayout, ResponsiveFlowLayoutData) {
	"use strict";

	var bResponsive = true;

	var oInputFirst,
		oInputLast;

	new CheckBox({
		text : "Use line breaks (line breaks for TextFields)",
		selected : false,
		select : function(oEvent) {
			var bLinebreaks = oEvent.getSource().getSelected();

			var oLDFirst = oInputFirst.getLayoutData();
			var oLDLast = oInputLast.getLayoutData();

			oLDFirst.setLinebreak(bLinebreaks);
			oLDLast.setLinebreak(bLinebreaks);
		}
	}).placeAt("RFLcheckBreak");

	new CheckBox({
		text : "Set Layout to responsive",
		selected : true,
		select : function(oEvent) {
			bResponsive = oEvent.getSource().getSelected();

			oInnerFirst.setResponsive(bResponsive);
			oInnerLast.setResponsive(bResponsive);
			oAddress.setResponsive(bResponsive);
			oRFL.setResponsive(bResponsive);
		}
	}).placeAt("RFLcheckResponsive");

	new Button({
		text : "Invalidate Layouts",
		press : function() {
			oInnerFirst.invalidate();
			oInnerLast.invalidate();
			oAddress.invalidate();
			oRFL.invalidate();
		}
	}).placeAt("RFLcheckResponsive");

	/*
	 * Inner layout for first name
	 */
	var oInnerFirst = new ResponsiveFlowLayout({
		id: "rfl_firstname",
		responsive: bResponsive,
		layoutData: new ResponsiveFlowLayoutData({
			minWidth : 250,
			margin : false
		}),
		content: [
			new Label({
				text : "First name",
				width : "100%"
			}),
			oInputFirst = new Input({
				width : "100%",
				layoutData: new ResponsiveFlowLayoutData({
					weight : 1
				})
			})
		]
	});

	/*
	 * inner layout for last name name
	 */
	var oInnerLast = new ResponsiveFlowLayout({
		id: "rfl_lastname",
		responsive: bResponsive,
		layoutData: new ResponsiveFlowLayoutData({
			minWidth : 250
		}),
		content: [
			new Label({
				text : "Last name",
				width : "100%"
			}),
			oInputLast = new Input({
				width : "100%",
				layoutData: new ResponsiveFlowLayoutData({
					weight : 2,
					minWidth : 100
				})
			})
		]
	});

	/*
	 * inner layout for street
	 */
	var oAddress = new ResponsiveFlowLayout({
		id: "rfl_address",
		responsive: bResponsive,
		layoutData: new ResponsiveFlowLayoutData({
			minWidth : 250,
			linebreak : true
		}),
		content: [
			new Label({
				text : "Address",
				width : "100%",
				layoutData: new ResponsiveFlowLayoutData({
					weight : 1,
					minWidth : 80
				})
			}),
			new Input({
				width : "100%",
				layoutData: new ResponsiveFlowLayoutData({
					weight : 5
				})
			}),
			new Input({
				width : "100%",
				layoutData:  new ResponsiveFlowLayoutData({
					weight : 2,
					linebreakable : false
				})
			})
		]
	});


	// outer layout for the form stuff
	var oRFL = new ResponsiveFlowLayout({
		id: "rfl_outer",
		responsive : bResponsive,
		content: [
			oInnerFirst,
			oInnerLast,
			oAddress
		]
	}).placeAt("RFL1");

	/*
	 * Next example
	 */
	var oRFL = new ResponsiveFlowLayout("rflLayout").placeAt("RFL2");

	var oBtn1 = new Button("button1", {
		text : "Button1",
		width : "100%"
	});
	oBtn1.setLayoutData(new ResponsiveFlowLayoutData());

	var oBtn2 = new Button("button2", {
		text : "Button1 (lb)",
		width : "100%"
	});
	oBtn2.setLayoutData(new ResponsiveFlowLayoutData({
		weight : 2,
		linebreak : false
	}));

	// adding content
	oRFL.addContent(oBtn1);
	oRFL.addContent(oBtn2);

	/*
	 * Example of a SimpleForm using an XML-View
	 */

	var sXmlView =
			  '<mvc:View controllerName="sampleController"'
			+ '    xmlns="sap.m" xmlns:layout="sap.ui.layout" xmlns:mvc="sap.ui.core.mvc">'
			+ '    <layout:ResponsiveFlowLayout>'
			+ '        <Button text="A button" width="100%">'
			+ '            <layoutData>'
			+ '                <layout:ResponsiveFlowLayoutData weight="2" />'
			+ '            </layoutData>'
			+ '        </Button>'
			+ '        <Button id="buttonOpener" text="Open Form" width="100%" press="openForm">'
			+ '        </Button>'
			+ '        <Button text="A button" width="100%">'
			+ '        </Button>'
			+ '    </layout:ResponsiveFlowLayout>'
			+ '</mvc:View>';

	var sXmlViewSimpleForm =
			  '<mvc:View xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:form="sap.ui.layout.form" xmlns:mvc="sap.ui.core.mvc">'
			+ '    <form:SimpleForm>'
			+ '        <Label text="First Label"></Label>'
			+ '        <Link text="Press the Phone"/>'
			+ '        <core:Icon src="sap-icon://iphone-2" color="#666666" />'
			+ '        <Label text="Second Label" />'
			+ '        <Link text="Just a Link"/>'
			+ '        <Label text="E-Mail" />'
			+ '        <Link text="test@sap.com"/>'
			+ '        </form:SimpleForm>'
			+ '</mvc:View>';

	var Controller = CoreController.extend("sampleController", {
		openForm : function(oEvent) {
			if (oTP.isOpen()) {
				oTP.close();
			} else {
				oTP.openBy(oEvent.getSource(), true);
			}
		}
	});

	var oTP = new Popover({
		id: "formInPopup"
	});

	XMLView.create({
		id: "simpleFormTP",
		definition: sXmlViewSimpleForm
	}).then(function(oXMLViewTP) {
		oTP.addContent(oXMLViewTP);
	});

	XMLView.create({
		definition : sXmlView,
		controller : new Controller()
	}).then(function(oXMLView) {
		oXMLView.placeAt("RFL3");
	});

	XMLView.create({
		id: "simpleFormView",
		definition : sXmlViewSimpleForm
	}).then(function(oXMLViewSimpleForm) {
		oXMLViewSimpleForm.placeAt("RFL3");
	});

});
