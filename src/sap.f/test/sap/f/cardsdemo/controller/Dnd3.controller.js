sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo',
	'sap/f/dnd/GridDropInfo',
	'sap/ui/integration/widgets/Card'
], function (Controller, JSONModel, jQuery, DragInfo, DropInfo, GridDropInfo, Card) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.dnd3", {
		onInit: function () {
			this.initData();

			[
				this.byId("grid1"),
				this.byId("grid2"),
				this.byId("grid3"),
				this.byId("links1"),
				this.byId("gridList1")
			].forEach(function (oGrid) {
				oGrid.addDragDropConfig(new DragInfo({
					sourceAggregation: "items"
				}));
				oGrid.addDragDropConfig(new GridDropInfo({
					targetAggregation: "items",
					dropPosition: "Between",
					dropLayout: oGrid.isA("sap.m.List") ? "Vertical" : "Horizontal",
					drop: function (oInfo) {
						var oDragged = oInfo.getParameter("draggedControl"),
							oDropped = oInfo.getParameter("droppedControl"),
							sInsertPosition = oInfo.getParameter("dropPosition"),

							oDraggedParent = oDragged.getParent(),
							oDroppedParent = oDropped.getParent(),

							oDragModel = oDraggedParent.getModel(),
							oDropModel = oDroppedParent.getModel(),
							oDragModelData = oDragModel.getData(),
							oDropModelData = oDropModel.getData(),

							iDragPosition = oDraggedParent.indexOfItem(oDragged),
							iDropPosition = oDroppedParent.indexOfItem(oDropped);

						// remove the item
						var oItem = oDragModelData[iDragPosition];
						oDragModelData.splice(iDragPosition, 1);

						if (oDragModel === oDropModel && iDragPosition < iDropPosition) {
							iDropPosition--;
						}

						// insert the control in target aggregation
						if (sInsertPosition === "Before") {
							oDropModelData.splice(iDropPosition, 0, oItem);
						} else {
							oDropModelData.splice(iDropPosition + 1, 0, oItem);
						}

						if (oDragModel !== oDropModel) {
							oDragModel.setData(oDragModelData);
							oDropModel.setData(oDropModelData);
						} else {
							oDropModel.setData(oDropModelData);
						}
					}
				}));
			});
		},

		initData: function () {
			this.byId("grid1").setModel(new JSONModel([
				{ uniqueId: "item1", header: "Unified Ticketing", subheader: "Submit a new ticket", footer: "", numberValue: "11", icon: "sap-icon://check-availability" },
				{ uniqueId: "item2", header: "Success Map", subheader: "", footer: "", numberValue: "3", icon: "sap-icon://message-success" },
				{ uniqueId: "item3", header: "My Team Calendar", subheader: "", footer: "", numberValue: "6", icon: "sap-icon://appointment" },
				{ uniqueId: "item4", header: "Leave requests", subheader: "Create or edit a leave request", footer: "paid, unpaid, sick leave", numberValue: "30", valueColor: "Error", icon: "sap-icon://general-leave-request" },
				{ uniqueId: "item5", header: "Work from home", subheader: "Make a request for home office", footer: "", numberValue: "17", valueColor: "Good", icon: "sap-icon://addresses" },
				{ uniqueId: "item6", header: "Collaboration", subheader: "Connect with colleagues", footer: "", numberValue: "240", icon: "sap-icon://collaborate" },
				{ uniqueId: "item7", header: "Public Service", subheader: "", footer: "", numberValue: "1", icon: "sap-icon://e-care" },
				{ uniqueId: "item8", header: "Invoices", subheader: "Personal invoices", footer: "", numberValue: "15", icon: "sap-icon://monitor-payments" },
				{ uniqueId: "item10", header: "Corporate portal", subheader: "", footer: "", numberValue: "1500", icon: "sap-icon://group" },
				{ uniqueId: "item11", header: "Ariba Guided Buying", subheader: "Buy Goods & Services", footer: "",  numberValue: "2", icon: "sap-icon://cart-5" },
				{ uniqueId: "item12", header: "My IT Equipment", subheader: "Manage equipment", footer: "", numberValue: "5", valueColor: "Critical", icon: "sap-icon://add-equipment" }
			]));

			this.byId("grid2").setModel(new JSONModel([
				{ uniqueId: "item1", header: "Unified Ticketing", subheader: "Submit a new ticket", footer: "", numberValue: "11", icon: "sap-icon://check-availability" },
				{ uniqueId: "item2", header: "Success Map", subheader: "", footer: "", numberValue: "3", icon: "sap-icon://message-success" },
				{ uniqueId: "item3", header: "My Team Calendar", subheader: "", footer: "", numberValue: "6", icon: "sap-icon://appointment" },
				{ uniqueId: "item4", header: "Leave requests", subheader: "Create or edit a leave request", footer: "paid, unpaid, sick leave", numberValue: "30", valueColor: "Error", icon: "sap-icon://general-leave-request" },
				{ uniqueId: "item5", header: "Work from home", subheader: "Make a request for home office", footer: "", numberValue: "17", valueColor: "Good", icon: "sap-icon://addresses" },
				{ uniqueId: "item6", header: "Collaboration", subheader: "Connect with colleagues", footer: "", numberValue: "240", icon: "sap-icon://collaborate" },
				{ uniqueId: "item7", header: "Public Service", subheader: "", footer: "", numberValue: "1", icon: "sap-icon://e-care" },
				{ uniqueId: "item8", header: "Invoices", subheader: "Personal invoices", footer: "", numberValue: "15", icon: "sap-icon://monitor-payments" },
				{ uniqueId: "item10", header: "Corporate portal", subheader: "", footer: "", numberValue: "1500", icon: "sap-icon://group" },
				{ uniqueId: "item11", header: "Ariba Guided Buying", subheader: "Buy Goods & Services", footer: "",  numberValue: "2", icon: "sap-icon://cart-5" },
				{ uniqueId: "item12", header: "My IT Equipment", subheader: "Manage equipment", footer: "", numberValue: "5", valueColor: "Critical", icon: "sap-icon://add-equipment" }
			]));

			this.byId("grid3").setModel(new JSONModel([
				{ header: "Sales Fulfillment Application Title", subheader: "Subtitle", footer: "", numberValue: "3", icon: "sap-icon://home-share" },
				{ header: "Manage Activity Master Data Type", subheader: "", footer: "", numberValue: "15", valueColor: "Critical", icon: "sap-icon://activities" },
				{ type: "card", rows: 2, columns: 2, manifest: "manifests>/listContent/smallList" },
				{ type: "card", rows: 4, columns: 4, manifest: "manifests>/analyticalContent/line" },
				{ header: "Account", subheader: "Your personal information", footer: "", numberValue: "1", valueColor: "Good", icon: "sap-icon://account" },
				{ type: "card", rows: 6, columns: 4, manifest: "manifests>/listContent/largeList" },
				{ type: "card", rows: 4, columns: 2, manifest: "manifests>/listContent/mediumList" },
				{ header: "Appointments management", subheader: "", footer: "Current Quarter", numberValue: "240", icon: "sap-icon://appointment" },
				{ header: "Jessica D. Prince Senior Consultant", subheader: "Department", footer: "Current Quarter", numberValue: "1", icon: "sap-icon://activity-individual" },
				{ type: "card", rows: 4, columns: 4, manifest: "manifests>/analyticalContent/stackedBar" }
			]));

			this.byId("links1").setModel(new JSONModel([
				{ header: "Open SAP Homepage", href: "http://www.sap.com" },
				{ header: "Your personal information", href: "http://www.sap.com" },
				{ header: "Appointments management", href: "http://www.sap.com" }
			]));

			this.byId("gridList1").setModel(new JSONModel([
				{ title: "Grid item title 1", subtitle: "Subtitle 1", group: "Group A" },
				{ title: "Grid item title 2", subtitle: "Subtitle 2", group: "Group A" },
				{ title: "Grid item title 3", subtitle: "Subtitle 3", group: "Group A" },
				{ title: "Grid item title 4", subtitle: "Subtitle 4", group: "Group A" },
				{ title: "Grid item title 5", subtitle: "Subtitle 5", group: "Group A" },
				{ title: "Grid item title 6 Grid item title Grid item title Grid item title Grid item title Grid item title", subtitle: "Subtitle 6", group: "Group A" },
				{ title: "Very long Grid item title that should wrap 7", subtitle: "This is a long subtitle 7" },
				{ title: "Grid item title B 8", subtitle: "Subtitle 8", group: "Group B" },
				{ title: "Grid item title B 9 Grid item title B  Grid item title B 9 Grid item title B 9Grid item title B 9title B 9 Grid item title B 9Grid item title B", subtitle: "Subtitle 9", group: "Group B" },
				{ title: "Grid item title B 10", subtitle: "Subtitle 10", group: "Group B" },
				{ title: "Grid item title B 11", subtitle: "Subtitle 11", group: "Group B" },
				{ title: "Grid item title B 12", subtitle: "Subtitle 12", group: "Group B" },
				{ title: "Grid item title 13", subtitle: "Subtitle 13", group: "Group A" },
				{ title: "Grid item title 14", subtitle: "Subtitle 14", group: "Group A" },
				{ title: "Grid item title 15", subtitle: "Subtitle 15", group: "Group A" },
				{ title: "Grid item title 16", subtitle: "Subtitle 16", group: "Group A" },
				{ title: "Grid item title 17", subtitle: "Subtitle 17", group: "Group A" },
				{ title: "Grid item title 18", subtitle: "Subtitle 18", group: "Group A" },
				{ title: "Very long Grid item title that should wrap 19", subtitle: "This is a long subtitle 19" },
				{ title: "Grid item title B 20", subtitle: "Subtitle 20", group: "Group B" },
				{ title: "Grid item title B 21", subtitle: "Subtitle 21", group: "Group B" },
				{ title: "Grid item title B 22", subtitle: "Subtitle 22", group: "Group B" },
				{ title: "Grid item title B 23", subtitle: "Subtitle 23", group: "Group B" },
				{ title: "Grid item title B 24", subtitle: "Subtitle 24", group: "Group B" },
				{ title: "Grid item title B 21", subtitle: "Subtitle 21", group: "Group B" },
				{ title: "Grid item title B 22", subtitle: "Subtitle 22", group: "Group B" },
				{ title: "Grid item title B 23", subtitle: "Subtitle 23", group: "Group B" }
			]));

		},

		// todo why grids rerender with factory, is a unique key missing or something else?
		createItem: function(sID, oBindingContext) {
			var oItemData = oBindingContext.getProperty(oBindingContext.getPath());

			if (oItemData.type === "card") {
				var oCard = new Card(sID, {
					layoutData: new sap.f.GridContainerItemLayoutData({rows: oItemData.rows, columns: oItemData.columns})
				});
				oCard.bindProperty("manifest", oItemData.manifest);
				return oCard;
			} else {
				return new sap.m.GenericTile(sID, {
					layoutData: new sap.f.GridContainerItemLayoutData({rows: 2, columns: 2}),
					header: oItemData.header,
					subheader: oItemData.subheader,
					tileContent: new sap.m.TileContent({
						footer: oItemData.footer,
						content: new sap.m.NumericContent({
							animateTextChange: false,
							value: oItemData.numberValue,
							valueColor: oItemData.valueColor,
							icon: oItemData.icon
						})
					})
				});
			}
		}
	});
});