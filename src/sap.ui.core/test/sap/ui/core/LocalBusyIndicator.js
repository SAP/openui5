sap.ui.define([
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Panel",
	"sap/m/RatingIndicator",
	"sap/m/SelectList",
	"sap/m/Text",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Column",
	"sap/ui/table/Table"
], function(Button, CheckBox, Input, Label, Link, Panel, RatingIndicator, SelectList, Text, Control, Icon, ListItem, JSONModel, Column, Table) {
	"use strict";

	/**
	 * Sample Control.
	 * Renders a text and has a marker class for styling the Blocking Layer.
	 */
	var SampleControl = Control.extend("test.SampleControl", {
		metadata: {
			properties: {
				text : {type : "string", defaultValue : ""}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sapCoreSampleControl");
				oRm.openEnd();
				var sText = oControl.getText().replace(/\\t/g,"\t");
				oRm.text(sText);
				oRm.close("div");
			}
		}
	});

	var oSC = new SampleControl({text: "Styled Block Layer"});
	oSC.placeAt("uiArea0");

	var oMyListBox = new SelectList({
		tooltip : "Country",
		width : "400px",
		items : [
			new ListItem({
				text : "I'm an item, and you?"
			}),
			new ListItem({
				text : "Oh, I'm too, nice to meet you!"
			}),
			new ListItem({
				text : "My name is Three, Item Three"
			})
		]
	}).placeAt("uiArea1");

	var oBtn1 = new Button({
		text : "set loading-mode: on",
		press : function() {
			var bBusy = !oMyListBox.isBusy();
			oBtn1.setText(bBusy ? "set loading-mode: off" : "set loading-mode: on");
			oMyListBox.setBusy(bBusy);
		}
	}).placeAt("button1");
	new Button({
		text : "show short",
		press : function() {
			var bBusy = !oMyListBox.isBusy();

			oMyListBox.setBusyIndicatorDelay(0);
			oBtn1.setText(bBusy ? "set loading-mode: off" : "set loading-mode: on");
			oMyListBox.setBusy(bBusy);

			setTimeout(function() {
				var bBusy = !oMyListBox.isBusy();

				oBtn1.setText(bBusy ? "set loading-mode: off" : "set loading-mode: on");
				oMyListBox.setBusy(bBusy);
			}, 200);
		}
	}).placeAt("button1");

	var oMyTable = new Table({
		busyIndicatorDelay: 0,
		columns: [
			new Column({
				label: new Label({
					text: "Last Name"
				}),
				template: new Text({
					text:"{lastName}" // short binding notation
				}),
				sortProperty: "lastName",
				filterProperty: "lastName",
				width: "100px"
			}),
			new Column({
				label: new Label({
					text: "First Name"
				}),
				template: new Input().bindProperty("value", "name"), // more verbose binding notation,
				sortProperty: "name",
				filterProperty: "name",
				width: "80px"
			}),
			new Column({
				label: new Label({
					text: "Checked"
				}),
				template: new CheckBox({
					selected: "{checked}"
				}),
				sortProperty: "checked",
				filterProperty: "checked",
				width: "75px",
				hAlign: "Center"
			}),
			new Column({
				label: new Label({
					text: "Web Site"
				}),
				template: new Link({
					text: "{linkText}",
					href: "{href}"
				}),
				sortProperty: "linkText",
				filterProperty: "linkText"
			}),
			new Column({
				label: new Label({
					text: "Rating"
				}),
				template: new RatingIndicator({
					value: "{rating}"
				}),
				sortProperty: "rating",
				filterProperty: "rating"
			})
		]
	}).placeAt("uiArea2");


	// create some local data
	var aData = [
		{lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", rating: 4},
		{lastName: "Friese", name: "Andy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", rating: 2},
		{lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", rating: 3}
	];

	// create a JSONModel, fill in the data and bind the Table to this model
	var oModel = new JSONModel();
	oModel.setData({modelData: aData});
	oMyTable.setModel(oModel);
	oMyTable.bindRows("/modelData");

	var oBtn2 = new Button({
		text : "set loading-mode: on",
		press : function() {

			var bBusy = !oMyTable.isBusy();
			oBtn2.setText(bBusy ? "set loading-mode: off" : "set loading-mode: on");
			oMyTable.setBusy(bBusy);
		}
	}).placeAt("button2");

	/**
	 * Small Busy Indicator test
	 */
	var oIcon = new Icon({
		src: "sap-icon://nutrition-activity",
		size: "3rem",
		color:"#DD0000",
		decorative: false,
		// an empty function to make the icon rendered as role="button"
		press: function() {}
	});
	oIcon.placeAt("icon");
	oIcon.setBusyIndicatorDelay(0);

	var oMButton = new Button({text: "Hello World"});
	oMButton.placeAt("mButton");
	oMButton.setBusyIndicatorDelay(0);

	var oInput = new Input();
	oInput.placeAt("input");
	oInput.setBusyIndicatorDelay(0);

	/*
	 * Toggle All button
	 */
	var oToggleAllButton = new Button({
		text: "Toggle All - Busy",
		press: function () {
			oMyListBox.setBusy(!oMyListBox.getBusy());
			oMyTable.setBusy(!oMyTable.getBusy());
			oIcon.setBusy(!oIcon.getBusy());
			oMButton.setBusy(!oMButton.getBusy());
			oInput.setBusy(!oInput.getBusy());
			oPanel.setBusy(!oPanel.getBusy());
			oPanel2.setBusy(!oPanel2.getBusy());
			oSC.setBusy(!oSC.getBusy());
		}
	});
	oToggleAllButton.placeAt("toggleAll");

	/*
	 * Toggle All Blocked Button
	 */
	 var oToggleAllBlockedButton = new Button({
		text: "Toggle All - Blocked",
		press: function () {
			oMyListBox.setBlocked(!oMyListBox.getBlocked());
			oMyTable.setBlocked(!oMyTable.getBlocked());
			oIcon.setBlocked(!oIcon.getBlocked());
			oMButton.setBlocked(!oMButton.getBlocked());
			oInput.setBlocked(!oInput.getBlocked());
			oPanel.setBlocked(!oPanel.getBlocked());
			oPanel2.setBlocked(!oPanel2.getBlocked(), "header");
			oSC.setBlocked(!oSC.getBlocked());
		}
	});
	oToggleAllBlockedButton.placeAt("toggleAll");

	/**
	 * Binding Test
	 */
	var oBusyModel = new JSONModel();
	oBusyModel.setData({o:{isBusy: true}});

	var oPanel = new Panel({
		headerText: "'busy' property is bound",
		busy: "{/o/isBusy}",
		content: new Input()
	});
	oPanel.placeAt("mPanel");
	oPanel.setModel(oBusyModel);

	/**
	 * Partial Test
	 */
	var oPanel2 = new Panel({
		headerText: "Only header is set busy",
		content: new Input()
	});
	oPanel2.placeAt("mPanel2");
	oPanel2.setBusy(true, "header");

});
