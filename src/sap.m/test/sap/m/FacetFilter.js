sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/FacetFilterList",
	"sap/m/FacetFilterItem",
	"sap/ui/model/type/Date",
	"sap/m/library",
	"sap/ui/model/type/Float",
	"sap/m/FacetFilter",
	"sap/m/Bar",
	"sap/m/Text",
	"sap/m/OverflowToolbar",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/ui/model/json/JSONModel",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/RadioButton",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/ToolbarSpacer",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/base/Log"
], function(
	App,
	Page,
	FacetFilterList,
	FacetFilterItem,
	TypeDate,
	mobileLibrary,
	Float,
	FacetFilter,
	Bar,
	MText,
	OverflowToolbar,
	Button,
	CheckBox,
	JSONModel,
	Select,
	Item,
	RadioButton,
	Input,
	Label,
	ToolbarSpacer,
	Filter,
	FilterOperator,
	FilterType,
	Log
) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.m.FacetFilterType
	var FacetFilterType = mobileLibrary.FacetFilterType;

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	// shortcut for sap.m.FacetFilterListDataType
	var FacetFilterListDataType = mobileLibrary.FacetFilterListDataType;

	document.getElementById("content").style.height = "1000px";

	var id = 1;
	function genId() {
		return "ff" + id++;
	}

	function createListValues(nCount) {
		var aVals = [];
		for (var i = 1; i < nCount + 1; i++) {
			aVals.push({text: "Val" + i, key: "val" + i, count: i});
		}
		return aVals;
	}

	function handleListOpen(oEvent) {

		var oList = oEvent.getSource();
		Log.info("FacetFilterList: listOpen event for list \"" + oList.getTitle() + "\" received by handler");
	}

	function handleListClose(oEvent) {

		var oList = oEvent.getSource();
		var bAllSelected = oEvent.getParameter("allSelected");
		var aSelectedItems = oEvent.getParameter("selectedItems");
		var sSelectedItems = "[";
		for (var i = 0; i < aSelectedItems.length; i++) {

			sSelectedItems +=  aSelectedItems[i].getText();
			if (i < aSelectedItems.length - 1) {
				sSelectedItems += ", ";
			}
		}
		sSelectedItems += "]";

		var sSelectedKeys = "[";
		var aSelectedKeys = Object.getOwnPropertyNames(oEvent.getParameter("selectedKeys"));
		for (var i = 0; i < aSelectedKeys.length; i++) {

			sSelectedKeys +=  aSelectedKeys[i];
			if (i < aSelectedKeys.length - 1) {
				sSelectedKeys += ", ";
			}
		}
		sSelectedKeys += "]";

		Log.info("FacetFilterList: listClose event for list \"" + oList.getTitle() + "\" received by handler. allSelected=" + bAllSelected + ", selectedItems=" + sSelectedItems + ", selectedKeys=" + sSelectedKeys);
	}

	function handleReset(oEvent) {

		Log.info("FacetFilter: Reset event fired for source " + oEvent.getSource());
		var oFF = oEvent.getSource();
		var aLists = oFF.getLists();
		for (var i = 0; i < aLists.length; i++) {

			aLists[i].removeSelections(true);
			//aLists[i].setSelectedKeys(); //clear selected keys
		}
	}

	// Start page controls
	var oApp = new App("myApp", {
		initialPage : "myPage1"
	});

	var oTestPage = new Page("myPage1", {
		title : "Mobile Facet Filter Control"

	});

	oApp.addPage(oTestPage);
	oApp.placeAt("content");

	var fnOData = function() {

		var oDataModel1 = new undefined/*ODataModel*/("/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc", true);
		oDataModel1.setSizeLimit(5);
		var oDataModel2 = new undefined/*ODataModel*/("/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc", true);

		oDataModel1.attachRequestCompleted(function (oEvent) {
			Log.info("oData Request completed: " + oEvent.getParameters());
		});
		oDataModel1.attachRequestSent(function (oEvent) {
			Log.info("oData Request sent: " + oEvent.getParameters());
		});

		var ffl1 = new FacetFilterList( {
			title: "Product (growing) with preselected items",
			growingThreshold: 20,
			key: "Products1",
			items: {
				path: "/Products",
				templateShareable: false,
				template: new FacetFilterItem( {
					text: "{ProductName}",
					key: "{ProductID}"
				})
			},
			listOpen: function(oEvent) {

				handleListOpen(oEvent);

				var that = this;
				var sNoDataText = this.getNoDataText();
				oDataModel1.attachRequestSent(function() {
					that.setNoDataText("*** loading ***");
				});
				oDataModel1.attachRequestCompleted(function() {
					that.setNoDataText(sNoDataText);
				});
				oDataModel1.attachRequestFailed(function() {
					that.setNoDataText(sNoDataText);
				});
				this.setModel(oDataModel1);
			},
			listClose: handleListClose,
			selectionChange: function(oEvent) {
				Log.info("selectionChange works!");
			}
		});

		ffl1.setSelectedKeys(JSON.parse(sessionStorage.getItem("Products1")));

		var ffl2 = new FacetFilterList( {
			title: "Product (not growing)",
			growing: false,
			key: "Products2",
			items: {
				path: "/Products",
				templateShareable: false,
				template: new FacetFilterItem( {
					text: "{ProductName}",
					key: "{ProductID}"
				}
			)
			},
			listOpen: handleListOpen,
			listClose: handleListClose
		});
		ffl2.setModel(oDataModel2);

		var oTypeDate = new TypeDate({
			style: "short"
		});

		var ffl3 = new FacetFilterList( {
			title: "Order Dates (growing)",
			growingThreshold: 20,
			key: "OrderDate",
			dataType: FacetFilterListDataType.Date,
			items: {
				path: "/Orders",
				templateShareable: false,
				template: new FacetFilterItem( {
					text: {path: 'OrderDate', type: oTypeDate},
					key: "{OrderID}"
				}
			)
			},

			listOpen: handleListOpen,
			listClose: handleListClose
		});
		ffl3.setModel(oDataModel1);


		var oTypeN = new Float({
			minIntegerDigits: 1, // minimal number of non-fraction digits
			maxIntegerDigits: 99, // maximal number of non-fraction digits
			minFractionDigits: 0, // minimal number of fraction digits
			maxFractionDigits: 99, // maximal number of fraction digits
			groupingEnabled: true, // enable grouping (show the grouping separators)
			groupingSeparator: ",", // the used grouping separator
			decimalSeparator: "." // the used decimal separator
		});


		var ffl4 = new FacetFilterList( {
			title: "Category Sales(not growing)",
			growing: false,
			key: "Category_Sales_for_1997",
			dataType: FacetFilterListDataType.Float,
			items: {
				path: "/Category_Sales_for_1997",
				templateShareable: false,
				template: new FacetFilterItem({
					text: {path: 'CategorySales', type: oTypeN},
					key: "{CategorySales}"
				})
			},
			listOpen: handleListOpen,
			listClose: handleListClose
		});
		ffl4.setModel(oDataModel2);

		var oFF = new FacetFilter(genId(), {
			lists: [ffl1,ffl2,ffl3,ffl4],
			reset: handleReset,
			showPersonalization: true
		});

		oTestPage.addContent(new Bar({
			contentLeft: new MText({text: "{" + oFF.getId() + "} FacetFilterList OData Model Set on List Open"})

		}));
		oTestPage.addContent(oFF);

		var oToolbar = new OverflowToolbar({
			content: [new Button({
						text: "Save Selections",
						press: function(oEvent) {
							oFF.getLists().forEach(function(oList) {
								sessionStorage.setItem(oList.getKey(), JSON.stringify(oList.getSelectedKeys()));
							});
						}
					}),
					new Button({
						text: "Load Selections",
						press: function(oEvent) {
							oFF.getLists().forEach(function(oList) {
								oList.setSelectedKeys(JSON.parse(sessionStorage.getItem(oList.getKey())));
							});
						}
					}),
					new Button({
						text: "Clear Saved Selections",
						press: function(oEvent) {
							oFF.getLists().forEach(function(oList) {
								sessionStorage.removeItem(oList.getKey());
							});
						}
					}),
					new CheckBox({
						text: "Summary Bar",
						selected: oFF.getShowSummaryBar(),
						select: function(oEvent) {
							oFF.setShowSummaryBar(oEvent.getParameter("selected"));
						}
					})]
		});

		oTestPage.addContent(oToolbar);
	};


	var fnFacetFilterListProperties = function() {

		var oData = {
				showPersonalization: true,
				lists: [{key: "A", sequence: 1, values: createListValues(15)},
						{key: "B", sequence: 1, values: createListValues(15)},
						{key: "C", sequence: 0, values: createListValues(15)}]
		};
		var oModel = new JSONModel(oData);

		var oFF = new FacetFilter(genId(), {
			showPersonalization: "{/showPersonalization}",
			lists: {
				path: "/lists",
				templateShareable: false,
				template: new FacetFilterList({
					key: "{key}",
					sequence: "{sequence}",
					growingThreshold: 5,
					items: {
						path: "values",
						templateShareable: false,
						template: new FacetFilterItem({
							key: "{key}",
							text: "{text}",
							count: "{count}"
						})
					},
					listOpen: handleListOpen,
					listClose: handleListClose
				})
			},
			reset: handleReset
		});
		oFF.setModel(oModel);

		oFF.getLists()[0].setSelectedKeys(JSON.parse(sessionStorage.getItem("A")));
		oFF.getLists()[1].setSelectedKeys(JSON.parse(sessionStorage.getItem("B")));
		oFF.getLists()[2].setSelectedKeys(JSON.parse(sessionStorage.getItem("C")));

		oTestPage.addContent(new Bar({
			contentLeft: new MText({text: "{" + oFF.getId() + "} FacetFilterList Properties"})
			}));

		oTestPage.addContent(oFF);

		var fnUpdateButtonText = function() {
			for (var i = 0; i < oFF.getLists().length; i++) {
				var oList = oFF.getLists()[i];
				oList.setTitle( "(" + oList.getKey() + ")" + " [" + i + ", " + oList.getSequence() + "]" );
			}
		};
		fnUpdateButtonText();

		var oActiveCheckbox = new CheckBox({

			text: "Active",
			selected: oFF.getLists()[0].getActive(),
			select: function(oEvent) {
				var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
				oList.setActive(oEvent.getParameter("selected"));
			}
		});
		var oRetainListSequenceCheckBox = new CheckBox({

			text: "Retain List Sequence",
			selected: oFF.getLists()[0].getRetainListSequence(),
			select: function(oEvent) {
				var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
				oList.setRetainListSequence(oEvent.getParameter("selected"));
			}
		});

		var oShowRemoveFacetIconCheckBox = new CheckBox({
			text: "Show Remove Facet Icon",
			selected: oFF.getLists()[0].getShowRemoveFacetIcon(),
			select: function(oEvent) {
				var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
				oList.setShowRemoveFacetIcon(oEvent.getParameter("selected"));
			}
		});
		var oGrowingCheckbox = new CheckBox({
			text: "Growing",
			selected: oFF.getLists()[0].getGrowing(),
			select: function(oEvent) {
				var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
				oList.setGrowing(oEvent.getParameter("selected"));
			}
		});
		var oListSelect = new Select({
			change: function(oEvent) {
				var oItem = oEvent.getParameter("selectedItem");
				var oList = sap.ui.getCore().byId(oItem.getKey());
				oSequence.setValue(oList.getSequence());
				oRadioMultiSelect.setSelected(true);
				oAllCount.setValue(oList.getAllCount());
				oActiveCheckbox.setSelected(oList.getActive());
				oShowRemoveFacetIconCheckBox.setSelected(oList.getShowRemoveFacetIcon());
				oGrowingCheckbox.setSelected(oList.getGrowing());
				oRetainListSequenceCheckBox.setSelected(oList.getRetainListSequence());
			}

		});
		for (var i = 0; i < oFF.getLists().length; i++) {
			var oList = oFF.getLists()[i];
			oListSelect.addItem(new Item({key: oList.getId(), text: oList.getTitle()}));
		}
		oListSelect.setSelectedItem(oListSelect.setSelectedItem(oListSelect.getItemAt(0)));

		var oRadioSingleSelect = new RadioButton({

			groupName: "FFLSelectionMode",
			selected: false,
			text: "Single Select",
			select: function(oEvent) {
				var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
			}
		});

		var oRadioMultiSelect = new RadioButton({

			groupName: "FFLSelectionMode",
			selected: true,
			text: "Multi Select",
			select: function(oEvent) {
				var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
			}
		});

		var oSequence = new Input({
			type: InputType.Number,
			width: "3rem"
		});
		oSequence.setValue(sap.ui.getCore().byId(oListSelect.getSelectedKey()).getSequence());

		var oAllCount = new Input({
			type: InputType.Number,
			width: "3rem"
		});
		oAllCount.setValue(sap.ui.getCore().byId(oListSelect.getSelectedKey()).getAllCount());

		var oListLabel = new Label({text: "List:",tooltip:"List", labelFor: oListSelect});
		var oSequenceLabel = new Label({text: "Sequence: ",tooltip: "Sequence", labelFor: oSequence});
		var oAllCountLabel = new Label({text: "All Count: ",tooltip: "All Count", labelFor: oAllCount});
		var oApplyButton = new Button({
							text: "Apply",
							press: function() {
								var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
								oList.setSequence(parseInt(oSequence.getValue()));
								oList.setAllCount(parseInt(oAllCount.getValue()));
								oFF._getSequencedLists(); // hack...force sequencing now so we can update the button text before the FacetFilter is rendered
								fnUpdateButtonText();
							}
					});
		var oSaveSelectionsButton = new Button({
			text: "Save Selections",
			press: function(oEvent) {
				var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
				sessionStorage.setItem(oList.getKey(), JSON.stringify(oList.getSelectedKeys()));
			}
		});
		var oClearSavedSelectionsButton = new Button({
			text: "Clear Saved Selections",
			press: function(oEvent) {
				var oList = sap.ui.getCore().byId(oListSelect.getSelectedKey());
				sessionStorage.removeItem(oList.getKey());
			}
		});

		var oToolbar1 = new OverflowToolbar({
			content: [
				oListLabel,
				oListSelect,
				new ToolbarSpacer({width: "1rem"}),
				oSequenceLabel,
				oSequence,
				new ToolbarSpacer({width: "1rem"}),
				oAllCountLabel,
				oAllCount,
				new ToolbarSpacer({width: "1rem"}),
				oApplyButton
			]
		});
		var oToolbar2 = new OverflowToolbar({
			content: [
				oRadioSingleSelect,
				oRadioMultiSelect,
				new ToolbarSpacer({width: "1rem"}),
				oActiveCheckbox,
				new ToolbarSpacer({width: "1rem"}),
				oGrowingCheckbox,
				new ToolbarSpacer({width: "1rem"}),
				oRetainListSequenceCheckBox,
				new ToolbarSpacer({width: "1rem"}),
				oShowRemoveFacetIconCheckBox,
				new ToolbarSpacer({width: "1rem"}),
				oSaveSelectionsButton,
				oClearSavedSelectionsButton
			]
		});
		oTestPage.addContent(oToolbar1);
		oTestPage.addContent(oToolbar2);
	};

	var fnFacetFilterProperties = function() {

		var oData = {
			lists: [
				{title: "List1", values: createListValues(5)},
				{title: "List2", values: createListValues(5)},
				{title: "List3", values: createListValues(5)},
				{title: "List4", values: createListValues(5)},
				{title: "List5", values: createListValues(5)},
				{title: "List6", values: createListValues(5)},
				{title: "List7", values: createListValues(5)},
				{title: "List8", values: createListValues(5)},
				{title: "List9", values: createListValues(5)},
				{title: "List10", values: createListValues(5)},
				{title: "List11", values: createListValues(5)},
				{title: "List12", values: createListValues(5)}
			]
		};
		var oModel = new JSONModel(oData);

		var oFF = new FacetFilter(genId(), {
			lists: {
				path: "test>/lists",
				templateShareable: false,
				template: new FacetFilterList({
					title: "{test>title}",
					items: {
						path: "test>values",
						templateShareable: false,
						template: new FacetFilterItem({
							key: "{test>key}",
							text: "{test>text}",
							count: "{test>count}"
						})
					},
					listOpen: handleListOpen,
					listClose: handleListClose
				})
			},
			reset: handleReset
		});
		oFF.setModel(oModel, "test");
		oTestPage.addContent(new Bar({
			contentLeft: new MText({text: "{" + oFF.getId() + "} FacetFilter Properties"})
		}));
		oTestPage.addContent(oFF);

		var oVisibleCheckbox = new CheckBox({

			text: "Visible",
			selected: oFF.getVisible(),
			select: function(oEvent) {

				oFF.setVisible(oEvent.getParameter("selected"));
			}
		});

		var oRadioSimpleType = new RadioButton({

			groupName: "FFType",
			selected: oFF.getType() === FacetFilterType.Simple ? true : false,
			text: "Simple",
			select: function(oEvent) {
				if (oEvent.getParameter("selected")) {

					oFF.setType(FacetFilterType.Simple);
				}
			}
		});

		var oRadioLightType = new RadioButton({

			groupName: "FFType",
			selected: oFF.getType() === FacetFilterType.Light ? true : false,
			text: "Light",
			select: function(oEvent) {
				if (oEvent.getParameter("selected")) {

					oFF.setType(FacetFilterType.Light);
				}
			}
		});

		var oShowSummaryBarCheckbox = new CheckBox({

			text: "Summary Bar",
			selected: oFF.getShowSummaryBar(),
			select: function(oEvent) {

				oFF.setShowSummaryBar(oEvent.getParameter("selected"));
			}
		});

		var oShowResetCheckbox = new CheckBox({
			text: "Reset",
			selected: oFF.getShowReset(),
			select: function(oEvent) {

				oFF.setShowReset(oEvent.getParameter("selected"));
			}
		});

		var oShowPersonalizationCheckbox = new CheckBox({
			text: "Personalization",
			selected: oFF.getShowPersonalization(),
			select: function(oEvent) {

				oFF.setShowPersonalization(oEvent.getParameter("selected"));
			}
		});

		var oShowPopoverOKButtonCheckbox = new CheckBox({
			text: "Popover OK Button",
			selected: oFF.getShowPopoverOKButton(),
			select: function(oEvent) {

				oFF.setShowPopoverOKButton(oEvent.getParameter("selected"));
			}
		});

		var oLiveSearchCheckbox = new CheckBox({
			text: "Live Search",
			selected: oFF.getLiveSearch(),
			select: function(oEvent) {

				oFF.setLiveSearch(oEvent.getParameter("selected"));
			}
		});

		var oToolbar = new OverflowToolbar({
			content: [
				oVisibleCheckbox,
				oRadioSimpleType,
				oRadioLightType,
				oShowSummaryBarCheckbox,
				oShowResetCheckbox,
				oShowPersonalizationCheckbox,
				oShowPopoverOKButtonCheckbox,
				oLiveSearchCheckbox
			]
		});
		oTestPage.addContent(oToolbar);
	};

	/*
	var fnVariantNoListOpen = function() {

		var oFF = new FacetFilter(genId(), {
			reset: handleReset,
			showPersonalization: true
			//type: "Light"
		});

		oTestPage.addContent(new Bar({
			contentLeft: new MText({text: "{" + oFF.getId() + "} List items loaded immediately (not from listOpen handler)"})
		}));

		var fnKeysBindingModel = function() {
			var oFFL = new FacetFilterList({
				title: "KeysBindingModel",
				growingThreshold: 3,
				listClose: handleListClose
			});
			oFFL.setSelectedKeys({
				"val1": "Val1", "val5": "Val5"
			});
			oFFL.bindAggregation("items", {
				path : "/values",
				templateShareable: false,
				template : new FacetFilterItem({
					text : "{text}",
					key: "{key}"
				})
			});

			var oModel = new JSONModel({
				values: createListValues(5)
			});
			oModel.setSizeLimit(2);
			oFFL.setModel(oModel);

			oFF.addList(oFFL);
		};

		var fnBindingModelKeys = function() {
			var oFFL = new FacetFilterList({
				title: "BindingModelKeys",
				growingThreshold: 3,
				listClose: handleListClose
			});

			oFFL.bindAggregation("items", {
				path : "/values",
				templateShareable: false,
				template : new FacetFilterItem({
					text : "{text}",
					key: "{key}"
				})
			});

			var oModel = new JSONModel({
				values: createListValues(5)
			});
			oModel.setSizeLimit(2);
			oFFL.setModel(oModel);

			oFFL.setSelectedKeys({
				"val1": "Val1", "val5": "Val5"
			});
			oFF.addList(oFFL);
		};

		var fnModelBindingKeys = function() {
			var oFFL = new FacetFilterList({
				title: "ModelBindingKeys",
				growingThreshold: 3,
				listClose: handleListClose
			});

			var oModel = new JSONModel({
				values: createListValues(5)
			});
			oModel.setSizeLimit(2);
			oFFL.setModel(oModel);

			oFFL.bindAggregation("items", {
				path : "/values",
				templateShareable: false,
				template : new FacetFilterItem({
					text : "{text}",
					key: "{key}"
				})
			});

			oFFL.setSelectedKeys({
				"val1": "Val1", "val5": "Val5"
			});
			oFF.addList(oFFL);
		};

		var fnKeysModelBinding = function() {
			var oFFL = new FacetFilterList({
				title: "KeysModelBinding",
				growingThreshold: 3,
				listClose: handleListClose
			});

			var oModel = new JSONModel({
				values: createListValues(5)
			});
			oModel.setSizeLimit(2);
			oFFL.setModel(oModel);

			oFFL.bindAggregation("items", {
				path : "/values",
				templateShareable: false,
				template : new FacetFilterItem({
					text : "{text}",
					key: "{key}"
				})
			});

			oFFL.setSelectedKeys({
				"val1": "Val1", "val5": "Val5"
			});
			oFF.addList(oFFL);
		};

		fnKeysBindingModel();
		fnKeysModelBinding();
		fnBindingModelKeys();
		fnModelBindingKeys();

		oTestPage.addContent(oFF);
	};

	var fnVariantListOpen = function() {

		var oFF = new FacetFilter(genId(), {
			reset: handleReset,
			showPersonalization: true
			//type: "Light"
		});

		oTestPage.addContent(new Bar({
			contentLeft: new MText({text: "{" + oFF.getId() + "} List items loaded from listOpen handler"}),
			tooltip: "{" + oFF.getId() + "} List items loaded from listOpen handler"
		}));

		var fnKeysBindingListOpenModel = function() {
			var oFFL = new FacetFilterList({
				title: "KeysBindingListOpenModel",
				growingThreshold: 3,
				listOpen: function(oEvent) {

					//if(!this.getBinding("items")) {
						var oModel = new JSONModel({
							values: createListValues(5)
						});
						oModel.setSizeLimit(2);
						this.setModel(oModel);
					//}
				},
				listClose: handleListClose
			});
			oFFL.bindAggregation("items", {
				path : "/values",
				templateShareable: false,
				template : new FacetFilterItem({
					text : "{text}",
					key: "{key}"
				})
			});

			oFFL.setSelectedKeys({
				"val1": "Val1", "val5": "Val5"
			});
			oFF.addList(oFFL);
		};

		var fnKeysModelListOpenBinding = function() {
			var oFFL = new FacetFilterList({
				title: "KeysModelListOpenBinding",
				growingThreshold: 3,
				listOpen: function(oEvent) {

					//if(!this.getBinding("items")) {
						this.bindAggregation("items", {
							path : "/values",
							templateShareable: false,
							template : new FacetFilterItem({
								text : "{text}",
								key: "{key}"
							})
						});
					//}
				},
				listClose: handleListClose
			});
			var oModel = new JSONModel({
				values: createListValues(5)
			});
			oModel.setSizeLimit(2);
			oFFL.setModel(oModel);
			oFFL.setSelectedKeys({
				"val1": "Val1", "val5": "Val5"
			});
			oFF.addList(oFFL);
		};

		var fnParentModelKeysListOpenBinding = function() {

			var oModel = new JSONModel({
				values: createListValues(5)
			});
			sap.ui.getCore().setModel(oModel);
			var oFFL = new FacetFilterList({
				title: "ParentModelKeysListOpenBinding",
				growingThreshold: 3,
				listOpen: function(oEvent) {
					this.bindAggregation("items", {
						path : "/values",
						templateShareable: false,
						template : new FacetFilterItem({
							text : "{text}",
							key: "{key}"
						})
					});
				},
				listClose: handleListClose
			});

			oFF.addList(oFFL);
			oFFL.setSelectedKeys({"val1": "Val1", "val5": "Val5"});
		};

		var fnKeysListOpenModelBinding = function() {
			var oFFL = new FacetFilterList({
				title: "KeysListOpenModelBinding",
				growingThreshold: 3,
				listOpen: function(oEvent) {

					//if(!this.getBinding("items")) {
						var oModel = new JSONModel({
							values: createListValues(5)
						});
						oModel.setSizeLimit(2);
						this.setModel(oModel);

						this.bindAggregation("items", {
							path : "/values",
							templateShareable: false,
							template : new FacetFilterItem({
								text : "{text}",
								key: "{key}"
							})
						});
					//}
				},
				listClose: handleListClose
			});
			oFFL.setSelectedKeys({
				"val1": "Val1", "val5": "Val5"
			});
			oFF.addList(oFFL);
		};

		fnKeysBindingListOpenModel();
		fnKeysModelListOpenBinding();
		fnKeysListOpenModelBinding();
		fnParentModelKeysListOpenBinding();

		oTestPage.addContent(oFF);
	};
	*/

	function fnDependentFacets() {

		var oCategoriesModel = new undefined/*ODataModel*/(
				"/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc", true);

		var oCategoriesFFL = new FacetFilterList({ // create the categories facet list
			title : "Categories",
			mode : ListMode.SingleSelectMaster, // restrict to one selection for simplicity
			key : "Categories",
			items : {
				path : "/Categories",
				templateShareable: false,
				template : new FacetFilterItem({
					text : "{CategoryName}",
					key : "{CategoryID}"
				})
			}
		});
		oCategoriesFFL.setModel(oCategoriesModel); // set the data model

		// create the data model for the products facet list
		var oProductsModel = new undefined/*ODataModel*/(
				"/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc", true);

		var oProductsFFL = new FacetFilterList({
			title : "Products",
			key : "Products",
			items : {
				path : "/Products_by_Categories",
				templateShareable: false,
				template : new FacetFilterItem({
					text : "{ProductName}",
					key : "{ProductID}"
				})
			},
			listOpen : function(oEvent) {

				// only display products from the selected category (if any)
				var aSelectedKeys = Object.getOwnPropertyNames(oCategoriesFFL.getSelectedKeys());
				if (aSelectedKeys.length > 0) {

					var oBinding = this.getBinding("items");
					var oUserFilter = new Filter("CategoryName", FilterOperator.Contains,
							oCategoriesFFL.getSelectedKeys()[aSelectedKeys[0]]);
					var oFinalFilter = new Filter([oUserFilter], true);
					oBinding.filter(oFinalFilter, FilterType.Control);
				}
			}
		});
		oProductsFFL.setModel(oProductsModel);

		// create the facet filter control
		var oFF = new FacetFilter(genId(), {
			lists : [oCategoriesFFL, oProductsFFL]
		});

		oTestPage.addContent(new Bar({
			contentLeft : new MText({
				text : "{" + oFF.getId() + "} Dependent facets, display products associated with selected categories"
			})

		}));
		oTestPage.addContent(oFF);
	}

	var fnModelSizeLimit = function () {
		var oFFWithModelOfArbitrarySizeLimit = new FacetFilter({type: FacetFilterType.Light}),
				oModel = new JSONModel(),
				aData = createListValues(105);

		oModel.setData({Filters: aData});
		oModel.setSizeLimit(110);
		oFFWithModelOfArbitrarySizeLimit.setModel(oModel);
		oFFWithModelOfArbitrarySizeLimit.bindAggregation("lists", {
			path: "/Filters",
			templateShareable: false,
			template: new FacetFilterList({title: "{text}"})
		});


		oTestPage.addContent(new Bar({
			contentLeft: new MText({
				text: "{" + oFFWithModelOfArbitrarySizeLimit.getId() + "} FF with lists bound to a model with arbitrary sizeLimit"
			})

		}));
		var oToolbar = new OverflowToolbar({content: [oFFWithModelOfArbitrarySizeLimit]});

		oTestPage.addContent(oToolbar);
	};

	// BCP: 1880435856
	function createListOnNavigating() {
		function fnAddList() {
			setTimeout(function () {
				oFacet.setModel(new JSONModel([{title: "Select and click back Async"}, {title: "List 2"}]));
				// Custom coding from application side. They should refreshFacetList by hand if
				// async update is happening in the listClose event
				oFacet.refreshFacetList();
			}, 500);
		}

		var oFacet = new FacetFilter("listUpdateModelAsync", {
			type: "Light",
			showPersonalization: false,
			showReset: true
		});

		var oFacetListTemplate = new FacetFilterList({
			title: "{title}",
			listClose: fnAddList
		});

		oFacet.setModel(new JSONModel([{title: "Select and click back"}]));
		oFacet.bindAggregation("lists", "/", oFacetListTemplate);

		oTestPage.addContent(oFacet);
	}

	////////////////////////////
	//fnVariantNoListOpen();
	//fnVariantListOpen();
	fnOData();
	createListOnNavigating();
	fnFacetFilterListProperties();
	fnFacetFilterProperties();
	fnDependentFacets();
	fnModelSizeLimit();
});
