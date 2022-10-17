sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/Tree",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/model/json/JSONModel",
	"sap/m/StandardTreeItem",
	"sap/m/MessageToast",
	"sap/m/Button",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/OverflowToolbar"
], function(
	App,
	Label,
	Tree,
	DragDropInfo,
	JSONModel,
	StandardTreeItem,
	MessageToast,
	Button,
	Select,
	Item,
	mobileLibrary,
	Page,
	OverflowToolbar
) {
	"use strict";

	// shortcut for sap.m.ListSeparators
	var ListSeparators = mobileLibrary.ListSeparators;

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	var oData = [
				{
					text: "Node0",
					ref: "sap-icon://action",
					state: "Success",
					nodes: [{
						text: "Node0-1",
						ref: "sap-icon://action",
						state: "Success"
					}
					]
				},
				{
					text: "Node1 text text text text text text text text text text text text text text text text text text text text",
					ref: "sap-icon://action",
					nodes: [
						{
							text: "Node1-1",
							ref: "sap-icon://action"
						},
						{
							text: "Node1-2",
							ref: "sap-icon://action",
							nodes: [
								{
									text: "Node1-2-1",
									ref: "sap-icon://action",
									nodes: [
									{
										text: "Node1-2-1-1",
										ref: "sap-icon://action",
										nodes: [
												{
													text: "Node1-2-1-1-1",
													ref: "sap-icon://action",
													nodes: [
															{
																text: "Node1-2-1-1-1-1",
																ref: "sap-icon://action",
																nodes: [
																		{
																			text: "Node1-2-1-1-1-1-1",
																			ref: "sap-icon://action",
																			nodes: [
																				{
																					text: "Node1-2-1-1-1-1-1-1",
																					ref: "sap-icon://action",
																				nodes: [
																					{
																						text: "Node1-2-1-1-1-1-1-1-1",
																						ref: "sap-icon://action",
																					nodes: [
																						{
																							text: "Node1-2-1-1-1-1-1-1-1-1",
																							ref: "sap-icon://action",
																						nodes: [
																							{
																								text: "Node1-2-1-1-1-1-1-1-1-1-1",
																								ref: "sap-icon://action",
																								nodes: [
																								{
																									text: "Node1-2-1-1-1-1-1-1-1-1-1-1",
																									ref: "sap-icon://action",
																									nodes: [
																									{
																										text: "Node1-2-1-1-1-1-1-1-1-1-1-1-1 text text text text text text text",
																										ref: "sap-icon://action",
																										nodes: [
																										{
																											text: "Node1-2-1-1-1-1-1-1-1-1-1-1-1-1",
																											ref: "sap-icon://action",
																											nodes: [
																											{
																												text: "Node1-2-1-1-1-1-1-1-1-1-1-1-1-1-1",
																												ref: "sap-icon://action"
																											}]
																										}]
																									}]
																								}]
																							}]
																						}]
																					}]
																				}]
																		}]
															}]
												}]
									}]
								},
								{
									text: "Node1-2-2",
									ref: "sap-icon://action"
								},
								{
									text: "Node1-2-3",
									ref: "sap-icon://action",
									nodes: [
									{
										text: "Node1-2-3-1",
										ref: "sap-icon://action"
									},
									{
										text: "Node1-2-3-2",
										ref: "sap-icon://action"
									},
									{
										text: "Node1-2-3-3",
										ref: "sap-icon://action"
									}
									]
								}
							]
						}
					]
				},
				{
					text: "Node2",
					ref: "sap-icon://action",
					state: "Error",
					nodes: [{
						text: "Node2-1",
						ref: "sap-icon://action",
						state: "Warning"
					}
					]
				},
				{
					text: "Node3",
					ref: "sap-icon://action",
					state: "Success",
					nodes: [{
						text: "Node3-1",
						ref: "sap-icon://action",
						state: "Success"
					}]
				},
				{
					text: "Node4",
					ref: "sap-icon://action",
					state: "Success",
					nodes: [{
						text: "Node4-1",
						ref: "sap-icon://action",
						state: "Success"
					}]
				},
				{
					text: "Node5",
					ref: "sap-icon://action"
				},
				{
					text: "Node6",
					ref: "sap-icon://action"
				},
				{
					text: "Node7",
					ref: "sap-icon://action"
				},
				{
					text: "Node8",
					ref: "sap-icon://action"
				},
				{
					text: "Node9",
					ref: "sap-icon://action"
				},
				{
					text: "Node10",
					ref: "sap-icon://action"
				},
				{
					text: "Node11",
					ref: "sap-icon://action"
				},
				{
					text: "Node12",
					ref: "sap-icon://action"
				},
				{
					text: "Node13",
					ref: "sap-icon://action"
				},
				{
					text: "Node14",
					ref: "sap-icon://action"
				},
				{
					text: "Node15",
					ref: "sap-icon://action"
				},
				{
					text: "Node16",
					ref: "sap-icon://action"
				},
				{
					text: "Node17",
					ref: "sap-icon://action"
				},
				{
					text: "Node18",
					ref: "sap-icon://action"
				},
				{
					text: "Node19",
					ref: "sap-icon://action"
				},
				{
					text: "Node20",
					ref: "sap-icon://action"
				},
				{
					text: "Node21",
					ref: "sap-icon://action"
				},
				{
					text: "Node22",
					ref: "sap-icon://action"
				},
				{
					text: "Node23",
					ref: "sap-icon://action"
				},
				{
					text: "Node24",
					ref: "sap-icon://action"
				},
				{
					text: "Node25",
					ref: "sap-icon://action"
				},
				{
					text: "Node26",
					ref: "sap-icon://action"
				},
				{
					text: "Node27",
					ref: "sap-icon://action"
				},
				{
					text: "Node28",
					ref: "sap-icon://action"
				},
				{
					text: "Node29",
					ref: "sap-icon://action"
				},
				{
					text: "Node30",
					ref: "sap-icon://action"
				},
				{
					text: "Node31",
					ref: "sap-icon://action"
				},
				{
					text: "Node32",
					ref: "sap-icon://action"
				},
				{
					text: "Node33",
					ref: "sap-icon://action"
				},
				{
					text: "Node34",
					ref: "sap-icon://action"
				},
				{
					text: "Node35",
					ref: "sap-icon://action"
				},
				{
					text: "Node36",
					ref: "sap-icon://action"
				},
				{
					text: "Node37",
					ref: "sap-icon://action"
				},
				{
					text: "Node38",
					ref: "sap-icon://action"
				},
				{
					text: "Node39",
					ref: "sap-icon://action"
				},
				{
					text: "Node40",
					ref: "sap-icon://action"
				},
				{
					text: "Node41",
					ref: "sap-icon://action"
				},
				{
					text: "Node42",
					ref: "sap-icon://action"
				},
				{
					text: "Node43",
					ref: "sap-icon://action"
				},
				{
					text: "Node44",
					ref: "sap-icon://action"
				},
				{
					text: "Node45",
					ref: "sap-icon://action"
				},
				{
					text: "Node46",
					ref: "sap-icon://action"
				},
				{
					text: "Node47",
					ref: "sap-icon://action"
				},
				{
					text: "Node48",
					ref: "sap-icon://action"
				},
				{
					text: "Node49",
					ref: "sap-icon://action"
				},
				{
					text: "Node50",
					ref: "sap-icon://action"
				},
				{
					text: "Node2",
					ref: "sap-icon://action"
				},
				{
					text: "Node3",
					ref: "sap-icon://action"
				},
				{
					text: "Node4",
					ref: "sap-icon://action"
				},
				{
					text: "Node5",
					ref: "sap-icon://action"
				},
				{
					text: "Node6",
					ref: "sap-icon://action"
				},
				{
					text: "Node7",
					ref: "sap-icon://action"
				},
				{
					text: "Node8",
					ref: "sap-icon://action"
				},
				{
					text: "Node9",
					ref: "sap-icon://action"
				},
				{
					text: "Node10",
					ref: "sap-icon://action"
				},
				{
					text: "Node11",
					ref: "sap-icon://action"
				},
				{
					text: "Node12",
					ref: "sap-icon://action"
				},
				{
					text: "Node13",
					ref: "sap-icon://action"
				},
				{
					text: "Node14",
					ref: "sap-icon://action"
				},
				{
					text: "Node15",
					ref: "sap-icon://action"
				},
				{
					text: "Node16",
					ref: "sap-icon://action"
				},
				{
					text: "Node17",
					ref: "sap-icon://action"
				},
				{
					text: "Node18",
					ref: "sap-icon://action"
				},
				{
					text: "Node19",
					ref: "sap-icon://action"
				},
				{
					text: "Node20",
					ref: "sap-icon://action"
				},
				{
					text: "Node21",
					ref: "sap-icon://action"
				},
				{
					text: "Node22",
					ref: "sap-icon://action"
				},
				{
					text: "Node23",
					ref: "sap-icon://action"
				},
				{
					text: "Node24",
					ref: "sap-icon://action"
				},
				{
					text: "Node25",
					ref: "sap-icon://action"
				},
				{
					text: "Node26",
					ref: "sap-icon://action"
				},
				{
					text: "Node27",
					ref: "sap-icon://action"
				},
				{
					text: "Node28",
					ref: "sap-icon://action"
				},
				{
					text: "Node29",
					ref: "sap-icon://action"
				},
				{
					text: "Node30",
					ref: "sap-icon://action"
				},
				{
					text: "Node31",
					ref: "sap-icon://action"
				},
				{
					text: "Node32",
					ref: "sap-icon://action"
				},
				{
					text: "Node33",
					ref: "sap-icon://action"
				},
				{
					text: "Node34",
					ref: "sap-icon://action"
				},
				{
					text: "Node35",
					ref: "sap-icon://action"
				},
				{
					text: "Node36",
					ref: "sap-icon://action"
				},
				{
					text: "Node37",
					ref: "sap-icon://action"
				},
				{
					text: "Node38",
					ref: "sap-icon://action"
				},
				{
					text: "Node39",
					ref: "sap-icon://action"
				},
				{
					text: "Node40",
					ref: "sap-icon://action"
				},
				{
					text: "Node41",
					ref: "sap-icon://action"
				},
				{
					text: "Node42",
					ref: "sap-icon://action"
				},
				{
					text: "Node43",
					ref: "sap-icon://action"
				},
				{
					text: "Node44",
					ref: "sap-icon://action"
				},
				{
					text: "Node45",
					ref: "sap-icon://action"
				},
				{
					text: "Node46",
					ref: "sap-icon://action"
				},
				{
					text: "Node47",
					ref: "sap-icon://action"
				},
				{
					text: "Node48",
					ref: "sap-icon://action"
				},
				{
					text: "Node49",
					ref: "sap-icon://action"
				},
				{
					text: "Node50",
					ref: "sap-icon://action"
				},
				{
					text: "Node2",
					ref: "sap-icon://action"
				},
				{
					text: "Node3",
					ref: "sap-icon://action"
				},
				{
					text: "Node4",
					ref: "sap-icon://action"
				},
				{
					text: "Node5",
					ref: "sap-icon://action"
				},
				{
					text: "Node6",
					ref: "sap-icon://action"
				},
				{
					text: "Node7",
					ref: "sap-icon://action"
				},
				{
					text: "Node8",
					ref: "sap-icon://action"
				},
				{
					text: "Node9",
					ref: "sap-icon://action"
				},
				{
					text: "Node10",
					ref: "sap-icon://action"
				},
				{
					text: "Node11",
					ref: "sap-icon://action"
				},
				{
					text: "Node12",
					ref: "sap-icon://action"
				},
				{
					text: "Node13",
					ref: "sap-icon://action"
				},
				{
					text: "Node14",
					ref: "sap-icon://action"
				},
				{
					text: "Node15",
					ref: "sap-icon://action"
				},
				{
					text: "Node16",
					ref: "sap-icon://action"
				},
				{
					text: "Node17",
					ref: "sap-icon://action"
				},
				{
					text: "Node18",
					ref: "sap-icon://action"
				},
				{
					text: "Node19",
					ref: "sap-icon://action"
				},
				{
					text: "Node20",
					ref: "sap-icon://action"
				},
				{
					text: "Node21",
					ref: "sap-icon://action"
				},
				{
					text: "Node22",
					ref: "sap-icon://action"
				},
				{
					text: "Node23",
					ref: "sap-icon://action"
				},
				{
					text: "Node24",
					ref: "sap-icon://action"
				},
				{
					text: "Node25",
					ref: "sap-icon://action"
				},
				{
					text: "Node26",
					ref: "sap-icon://action"
				},
				{
					text: "Node27",
					ref: "sap-icon://action"
				},
				{
					text: "Node28",
					ref: "sap-icon://action"
				},
				{
					text: "Node29",
					ref: "sap-icon://action"
				},
				{
					text: "Node30",
					ref: "sap-icon://action"
				},
				{
					text: "Node31",
					ref: "sap-icon://action"
				},
				{
					text: "Node32",
					ref: "sap-icon://action"
				},
				{
					text: "Node33",
					ref: "sap-icon://action"
				},
				{
					text: "Node34",
					ref: "sap-icon://action"
				},
				{
					text: "Node35",
					ref: "sap-icon://action"
				},
				{
					text: "Node36",
					ref: "sap-icon://action"
				},
				{
					text: "Node37",
					ref: "sap-icon://action"
				},
				{
					text: "Node38",
					ref: "sap-icon://action"
				},
				{
					text: "Node39",
					ref: "sap-icon://action"
				},
				{
					text: "Node40",
					ref: "sap-icon://action"
				},
				{
					text: "Node41",
					ref: "sap-icon://action"
				},
				{
					text: "Node42",
					ref: "sap-icon://action"
				},
				{
					text: "Node43",
					ref: "sap-icon://action"
				},
				{
					text: "Node44",
					ref: "sap-icon://action"
				},
				{
					text: "Node45",
					ref: "sap-icon://action"
				},
				{
					text: "Node46",
					ref: "sap-icon://action"
				},
				{
					text: "Node47",
					ref: "sap-icon://action"
				},
				{
					text: "Node48",
					ref: "sap-icon://action"
				},
				{
					text: "Node49",
					ref: "sap-icon://action"
				},
				{
					text: "Node50",
					ref: "sap-icon://action"
				}
			];

	var oApp = new App();

	var oTree = new Tree({
		headerText: "Data in Tree Structure",
		'delete': handleControlEvent,
		dragDropConfig: new DragDropInfo({
			sourceAggregation: "items",
			targetAggregation: "items",
			dragStart:onDragStart,
			drop:onDrop
		})
	});

	//JSON
	var oModel = new JSONModel();
	var sType = "Inactive";
	oTree.setModel(oModel);
	oModel.setSizeLimit(200);
	// set the data to the model
	oModel.setData(oData);
	var oStandardTreeItem = new StandardTreeItem({
		title: "{text}",
		highlight: "{state}",
		type: sType,
		press: handleControlEvent,
		detailPress: handleControlEvent
	});
	oTree.bindItems("/", oStandardTreeItem);
	var oBinding = oTree.getBinding("items");
	//oTree.expandToLevel(3);

	function handleControlEvent(oEvent) {
		MessageToast.show("'" + oEvent.getId() + "' event fired");
	}

	function onDragStart(oEvent) {
		var oDragSession = oEvent.getParameter("dragSession");
		var oDraggedItem = oEvent.getParameter("target");
		var iDraggedItemIndex = oTree.indexOfItem(oDraggedItem);
		var aSelectedIndices = oTree.getBinding("items").getSelectedIndices();
		var aSelectedItems = oTree.getSelectedItems();
		var aDraggedItemContexts = [];

		if (aSelectedItems.length > 0) {
			if (aSelectedIndices.indexOf(iDraggedItemIndex) === -1) {
				oEvent.preventDefault();
			} else {
				for (var i = 0; i < aSelectedItems.length; i++) {
					aDraggedItemContexts.push(oBinding.getContextByIndex(aSelectedIndices[i]));
				}
			}
		} else {
			aDraggedItemContexts.push(oBinding.getContextByIndex(iDraggedItemIndex));
		}

		oDragSession.setComplexData("hierarchymaintenance", {
			draggedItemContexts: aDraggedItemContexts
		});
	}

	function onDrop(oEvent) {

		var oDragSession = oEvent.getParameter("dragSession");
		var oDroppedItem = oEvent.getParameter("droppedControl");
		var aDraggedItemContexts = oDragSession.getComplexData("hierarchymaintenance").draggedItemContexts;
		var iDroppedIndex = oTree.indexOfItem(oDroppedItem);
		var oNewParentContext = oBinding.getContextByIndex(iDroppedIndex);

		if (aDraggedItemContexts.length === 0 || !oNewParentContext) {
			return;
		}

		var oModel = oTree.getBinding("items").getModel();
		var oNewParent = oNewParentContext.getProperty();

		// In the JSON data of this example the children of a node are inside an array with the name "categories".
		if (!oNewParent.categories) {
			oNewParent.categories = []; // Initialize the children array.
		}

		for (var i = 0; i < aDraggedItemContexts.length; i++) {
			if (oNewParentContext.getPath().indexOf(aDraggedItemContexts[i].getPath()) === 0) {
				// Avoid moving a node into one of its child nodes.
				continue;
			}

			// Copy the data to the new parent.
			oNewParent.categories.push(aDraggedItemContexts[i].getProperty());

			// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
			oModel.setProperty(aDraggedItemContexts[i].getPath(), undefined, aDraggedItemContexts[i], true);
		}
	}

	// footer functions
	function expandMulti() {
		return new Button({
			text:"expand selected nodes",
			tooltip: "expand selected nodes",
			press: function(evt) {
				var aSelectedItems = oTree.getSelectedItems(),
					aSelectedIndices = aSelectedItems.map( function(oSelectedItem) {
					return oTree.indexOfItem(oSelectedItem);
				});
				oTree.expand(aSelectedIndices);
			}
		});
	}

	function collapseMulti() {
		return new Button({
			text:"collapse selected nodes",
			tooltip: "collapse selected nodes",
			press: function(evt) {
				var aSelectedItems = oTree.getSelectedItems(),
					aSelectedIndices = aSelectedItems.map( function(oSelectedItem) {
					return oTree.indexOfItem(oSelectedItem);
				});
				oTree.collapse(aSelectedIndices);
			}
		});
	}

	function addSelectionMode(){
		return new Select({
			tooltip: "Selection Mode",
			items: [
				new Item({ key: "0", text: ListMode.None }),
				new Item({ key: "1", text: ListMode.SingleSelect }),
				new Item({ key: "2", text: ListMode.SingleSelectLeft }),
				new Item({ key: "3", text: ListMode.SingleSelectMaster}),
				new Item({ key: "4", text: ListMode.MultiSelect }),
				new Item({ key: "5", text: ListMode.Delete })
			],
			selectedItem: "0",
			change: function(oControlEvent){
				var sMode = oControlEvent.getParameter("selectedItem").getText();
				oTree.setMode(sMode);
			}
		});
	}

	function addNodeType(){
		return new Select({
			tooltip: "set Type to tree node",
			items: [
				new Item({ key: "0", text: ListType.Inactive }),
				new Item({ key: "1", text: ListType.Detail }),
				new Item({ key: "2", text: ListType.Navigation }),
				new Item({ key: "3", text: ListType.Active }),
				new Item({ key: "4", text: ListType.DetailAndActive })
			],
			selectedItem: "0",
			change: function(oControlEvent) {
				sType = oControlEvent.getParameter("selectedItem").getText();
				oStandardTreeItem.setType(sType);
				for (var i = 0; i < oTree.getItems().length; i++) {
					oTree.getItems()[i].setType(sType);

				}
			}
		});
	}

	function addVisibility(){
		return new Select({
			tooltip: "Visibility",
			items: [
				new Item({ key: "0", text: "Visible" }),
				new Item({ key: "1", text: "invisible" })
			],
			selectedItem: "0",
			change: function(oControlEvent){
				var sVisibility = (oControlEvent.getParameter("selectedItem").getText() === "Visible");
				oTree.setVisible(sVisibility);
			}
		});
	}

	function addShowNoData(){
		return new Select({
			tooltip: "ShowNoData",
			items: [
				new Item({ key: "0", text: "WithData" }),
				new Item({ key: "1", text: "ShowNoData" })
			],
			selectedItem: "0",
			change: function(oControlEvent) {
				var bShowNoData = oControlEvent.getParameter("selectedItem").getText() === "ShowNoData";
				if (bShowNoData) {
					oTree.bindItems("/dd", oStandardTreeItem);
				} else {
					oTree.bindItems("/", oStandardTreeItem);
				}
			}
		});
	}

	function addShowSeparator(){
		return new Select({
			tooltip: "Separator",
			items: [
				new Item({ key: "0", text: ListSeparators.All }),
				new Item({ key: "1", text: ListSeparators.Inner }),
				new Item({ key: "2", text: ListSeparators.None })
			],
			selectedItem: "0",
			change: function(oControlEvent){
				var sSeparator = oControlEvent.getParameter("selectedItem").getText();
				oTree.setShowSeparators(sSeparator);
			}
		});
	}

	function addSizeMode(){
		return new Select({
			tooltip: "SizeMode",
			items: [
				new Item({ key: "0", text: "cozy" }),
				new Item({ key: "1", text: "compact" })
			],
			selectedItem: "0",
			change: function(oControlEvent){
				var sMode = oControlEvent.getParameter("selectedItem").getText();
				document.body.classList.toggle("sapUiSizeCompact", sMode === "compact");
			}
		});
	}

	function addIcon(){
		return new Select({
			tooltip: "icon (change icon will rebind the control)",
			items: [
				new Item({ key: "0", text: "withoutIcon" }),
				new Item({ key: "1", text: "withIcon" })
			],
			selectedItem: "0",
			change: function(oControlEvent) {
				var sItem = oControlEvent.getParameter("selectedItem").getText();
				if (sItem === "withIcon") {
					oStandardTreeItem.bindProperty("icon", {
						path: "ref"
					});
					oTree.bindItems("/", oStandardTreeItem);
				} else {
					oStandardTreeItem.unbindProperty("icon", false);
					oTree.bindItems("/", oStandardTreeItem);
				}
			}
		});
	}

	function addExpandToLevel(){
		return new Select({
			tooltip: "Icon",
			items: [
				new Item({ key: "0", text: "CollapseAll" }),
				new Item({ key: "1", text: "ExpandToLevel1" })
			],
			selectedItem: "0",
			change: function(oControlEvent){
				var sItem = oControlEvent.getParameter("selectedItem").getText();
				if (sItem === "ExpandToLevel1") {
					oTree.expandToLevel(1);
				} else {
					oTree.collapseAll();
				}
			}
		});
	}

	var oPage = new Page("TreeTest", {
		title : "Test Page for sap.m.Tree - JSON",
		content : [oTree],
		footer : new OverflowToolbar({
			content: [
				expandMulti(),
				collapseMulti(),
				addSizeMode(),
				addSelectionMode(),
				addExpandToLevel(),
				addNodeType(),
				addShowSeparator(),
				addIcon(),
				addShowNoData(),
				addVisibility()
			]
		})
	});

	oApp.addPage(oPage).placeAt("body");
});
