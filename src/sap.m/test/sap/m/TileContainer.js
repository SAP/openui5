sap.ui.define([
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/StandardTile",
	"sap/m/TileContainer",
	"sap/m/ToggleButton"
], function(App, Bar, Button, Page, StandardTile, TileContainer, ToggleButton) {
	"use strict";

	var oTC = new TileContainer("tc",{
		width: "100%",
		height: "100%",
		tiles:[
			new StandardTile({
				type : "Create",
				info : "28 days left",
				infoState : "Success",
				title : "Create Leave Request",
				removable: false
			}),
			new StandardTile({
				icon : "images/action.png",
				title : "Leave Request History",
				type: "Monitor"
			}),
			new StandardTile({
				icon : "images/travel_expense_report.png",
				info : "Waiting for Approval",
				infoState : "Warning",
				number : "787",
				numberUnit : "euro",
				title : "Travel Reimbursement"
			}),
			new StandardTile({
				icon : "images/action.png",
				title : "Travel Reimbursement History",
				type: "Monitor"
			}),
			new StandardTile({
				type : "Create",
				info : "On Hold",
				infoState : "Error",
				title : "Create Purchase Order"
			}),
			new StandardTile({
				icon : "images/analytics_64.png",
				title : "Financial report",
				type: "Monitor"
			}),
			new StandardTile({
				icon : "images/analytics_grey_64.png",
				title : "Team Report",
				type: "Monitor",
				removable: false
			}),
			new StandardTile({
				type : "Create",
				info : "28 days left",
				infoState : "Success",
				title : "Create Leave Request"
			}),
			new StandardTile({
				icon : "images/action.png",
				title : "Leave Request History",
				type: "Monitor"
			}),
			new StandardTile({
				icon : "images/travel_expense_report.png",
				info : "Waiting for Approval",
				infoState : "Warning",
				number : "787",
				numberUnit : "euro",
				title : "Travel Reimbursement"
			}),
			new StandardTile({
				icon : "images/action.png",
				title : "Travel Reimbursement History",
				type: "Monitor"
			}),
			new StandardTile({
				type : "Create",
				info : "On Hold",
				infoState : "Error",
				title : "Create Purchase Order"
			}),
			new StandardTile({
				icon : "images/analytics_64.png",
				title : "Financial report",
				type: "Monitor"
			}),
			new StandardTile({
				icon : "images/analytics_grey_64.png",
				title : "Team Report",
				type: "Monitor"
			}),
			new StandardTile({
				type : "Create",
				info : "28 days left",
				infoState : "Success",
				title : "Create Leave Request"
			}),
			new StandardTile({
				icon : "images/action.png",
				title : "Leave Request History",
				type: "Monitor"
			}),
			new StandardTile({
				icon : "images/travel_expense_report.png",
				info : "Waiting for Approval",
				infoState : "Warning",
				number : "787",
				numberUnit : "euro",
				title : "Travel Reimbursement"
			}),
			new StandardTile({
				icon : "images/action.png",
				title : "Travel Reimbursement History",
				type: "Monitor"
			}),
			new StandardTile({
				type : "Create",
				info : "On Hold",
				infoState : "Error",
				title : "Create Purchase Order"
			}),
			new StandardTile({
				icon : "images/analytics_64.png",
				title : "Financial report",
				type: "Monitor"
			}),
			new StandardTile({
				icon : "images/analytics_grey_64.png",
				title : "Team Report",
				type: "Monitor"
			})
		],
		tileDelete: function(evt){
			var tile = evt.getParameter("tile");
			evt.getSource().removeTile(tile);
		}
	});

	var page1 = new Page({
		content: oTC,
		footer: new Bar({
			contentRight: [
				new ToggleButton({
					text: "Edit",
					press: function (evt) {
						var newValue = !oTC.getEditable();
						evt.getSource().getPressed() ? evt.getSource().setText("Done") : evt.getSource().setText("Edit");
						oTC.setEditable(newValue);
					}
				}),
				new ToggleButton({
					text: "Busy",
					press: function (evt) {
						var newValue = !oTC.getBusy();
						evt.getSource().getPressed() ? evt.getSource().setText("Done") :  evt.getSource().setText("Busy state");
						oTC.setBusy(newValue);
					}
				}),
				new Button({
					text: 'To Page 2',
					press: function () {
						app.to(page2.getId());
						setTimeout(function () {
							page2.$("cont").height("0px");
						}, 100);
					}
				})
			]
		})
	});

	var page2 = new Page({
		showHeader: true,
		title: "Add Tiles when height is 0"
	});
	var tc2 = new TileContainer({
		height: '70%'
	});
	page2.addContent(tc2);
	page2.setFooter(new Bar({
		contentMiddle: [
			new Button({
				text: "Add Tile", press: function () {
					tc2.addTile(new StandardTile({
						icon: "images/action.png",
						number: "Busy state test1",
						numberUnit: "Unit",
						info: "10 day ago"
					}));
				}
			}),
			new Button({
				text: 'Restore height', press: function () {
					page2.$("cont").height("100%");
				}
			}),
			new Button({
				text: 'Back to Page 1', press: function () {
					app.to(page1.getId());
				}
			})
		]
	}));


	var app = new App({
		initialPage: page1.getId()
	});

	app.addPage(page1);
	app.addPage(page2);
	app.placeAt('body');
});
