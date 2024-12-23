sap.ui.define([
	"sap/m/App",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/FilterOperator",
	"sap/m/SelectDialog",
	"sap/m/VBox",
	"sap/m/Input",
	"sap/ui/core/library",
	"sap/m/StandardListItem",
	"sap/m/Bar",
	"sap/ui/model/type/Boolean"
], function(
	App,
	MessageBox,
	MessageToast,
	JSONModel,
	Filter,
	Button,
	Page,
	MockServer,
	ODataModel,
	FilterOperator,
	SelectDialog,
	VBox,
	Input,
	coreLibrary,
	StandardListItem,
	Bar,
	BooleanType
) {
	"use strict";

		var sServiceURI = "/service/" ;
		var sMetaDataURI = "qunit/data/";


		// configure respond to requests delay
	   MockServer.config({
			autoRespond : true,
			autoRespondAfter : 1000
		});

		// create mockserver
		var oMockServer = new MockServer({
			rootUri : sServiceURI
		});

		// start mockserver
		oMockServer.simulate(sMetaDataURI + "metadata.xml", sMetaDataURI);
		oMockServer.start();

		// filter function for the list search
		var fnDoSearch = function (oEvent, bProductSearch) {
			var aFilters = [],
				sSearchValue = oEvent.getParameter("value"),
				itemsBinding = oEvent.getParameter("itemsBinding");

			// create the local filter to apply
			if (sSearchValue !== undefined && sSearchValue.length > 0) {
				aFilters.push(new Filter((bProductSearch ? "ProductId" : "title" ), FilterOperator.Contains , sSearchValue));
			}
			// apply the filter to the bound items, and the Select Dialog will update
			itemsBinding.filter(aFilters, "Application");
		};

		// filter function for the product search
		var fnDoProductSearch = function (oEvent) {
			fnDoSearch(oEvent, true);
		};

		// filter function to align the binding with the search term
		var fnCreatePrefilter = function (sSearchValue, bProductSearch) {
			var aFilters = [];

			// create the local filter to apply
			if (sSearchValue !== undefined) {
				aFilters.push(new Filter((bProductSearch ? "ProductId" : "title" ), FilterOperator.Contains , sSearchValue));
			}
			return aFilters;
		};

		// cancel function to display a message
		var fnCancelDialog = function (oEvent) {
			MessageBox.alert("Cancel Selected on " + (oEvent.oSource ? oEvent.oSource : oEvent.srcControl));
		};

		/* dummy list data */
		var oListData = {
			superheros: [ {
					title: "Chuck Norris",
					description: "Roundhouse-Kick, UndefeatableRoundhouse-Kick, UndefeatableRoundhouse-Kick, UndefeatableRoundhouse-Kick, Undefeatable",
					icon: "sap-icon://employee",
					selected: true
				}, {
					title: "The incredible Hulk",
					description: "Lots of Anger, Mutation",
					icon: "sap-icon://e-care",
					selected: true
				}, {
					title: "Superman",
					description: "Flying, Laser Sight",
					icon: "sap-icon://competitor",
					selected: true
				},{
					title: "Bud Spencer",
					description: "Dampfhammer, Beating",
					icon: "sap-icon://dimension",
					selected: true
				}, {
					title: "Obelix",
					description: "Hinkelstein, Eating",
					icon: "sap-icon://badge",
					selected: false
				}, {
					title: "Spiderman",
					description: "Climb walls, Cobwebbs",
					icon: "sap-icon://burglary",
					selected: false
				}, {
					title: "Darth Vader",
					description: "The force",
					icon: "sap-icon://alert",
					selected: false
				}, {
					title: "Agent Smith",
					description: "Matrix virus",
					icon: "sap-icon://attachment",
					selected: false
				}, {
					title: "Lucky Luke",
					description: "Incredible gun prowess",
					icon: "sap-icon://accept",
					selected: false
				}, {
					title: "Jack Sparrow",
					description: "Pirate, Bad Luck",
					icon: "sap-icon://arobase",
					selected: false
				} ]
		};

		var oModelList = new JSONModel();
		oModelList.setDefaultBindingMode("OneWay");
		oModelList.setData(oListData);

		var oItemTemplate = new StandardListItem({
			title: "{title}",
			description: "{description}",
			icon: "{icon}",
			type: "Active"
		});

		var oItemTemplateSelection = new StandardListItem({
			title: "{title}",
			description: "{description}",
			icon: "{icon}",
			selected: "{selected}"
		});

		/* dialog data */
		var oDialogData = {
			title: "Forward to...",
			noDataMessage: "Sorry, we can't find what you are looking for.. No data available!"
		};

		var oModelDialog = new JSONModel();
		oModelDialog.setData(oDialogData);

		/* 1) select dialog with list binding and static parameters */
		var oSelectDialog1 = new SelectDialog("SelectDialog1", {
			title: "Choose a World Domination companion",
			noDataText: "Sorry, no domination partners are available",
			search : fnDoSearch,
			liveChange: fnDoSearch
		});

		// set model & bind Aggregation
		oSelectDialog1.setModel(oModelList);
		oSelectDialog1.bindAggregation("items", "/superheros", oItemTemplate);

		var oInput1 = new Input({
			type: "Text",
			placeholder: "Open SelectDialog with List Binding and input value connected to this field",
			showValueHelp: true,
			valueHelpRequest: function () {
				// initiate model
				oSelectDialog1.setModel(oModelList);

				// bind aggregation with filters
				oSelectDialog1.bindAggregation("items", {
					path: "/superheros",
					filters: fnCreatePrefilter(oInput1.getValue()),
					template: oItemTemplate
				});

				// open dialog
				oSelectDialog1.open(oInput1.getValue());
			}
		});
		// attach close listener
		oSelectDialog1.attachConfirm(function (oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				oInput1.setValue("You selected: " + selectedItem.getTitle());
			}
		});

		// attach cancel listener
		oSelectDialog1.attachCancel(fnCancelDialog);

		/* 2) select dialog with list binding and dialog binding */
		var oSelectDialog2 = new SelectDialog("SelectDialog2", {
			title: "{dialog>/title}",
			noDataText: "{dialog>/noDataMessage}",
			contentWidth: "30rem",
			search : fnDoSearch,
			liveChange: fnDoSearch
		});

		// alert message box on close
		oSelectDialog2.attachConfirm(function (oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				MessageBox.alert("Message will be forwarded to " + selectedItem.getTitle());
			}
		});

		// attach cancel listener
		oSelectDialog2.attachCancel(fnCancelDialog);

		var oButton2 = new Button("Button2", {
			text: "Open SelectDialog with Dialog Binding & List Binding & prefiltered by \"ad\"",
			press: function (oEvent) {
				// initiate model
				oSelectDialog2.setModel(oModelList);
				oSelectDialog2.setModel(oModelDialog,"dialog");

				// bind aggregation with filters
				oSelectDialog2.bindAggregation("items", {
					path: "/superheros",
					filters: fnCreatePrefilter("ad"),
					template: oItemTemplate
				});

				// open dialog
				oSelectDialog2.open("ad");
			}
		});

		/* 3) select dialog with list binding auto destroy on close */
		var oSelectDialog3 = new SelectDialog("SelectDialog3", {
			title: "Choose a World Domination companion",
			noDataText: "Sorry, no world domination companions available",
			contentWidth: "800px",
			search : fnDoSearch,
			liveChange: fnDoSearch
		});

		// attach close listener
		oSelectDialog3.attachConfirm(function (oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				oButton3.setText("You selected: " + selectedItem.getTitle());
				oButton3.setDisabled(true);
				oSelectDialog3.destroy();
				oSelectDialog3 = null;
			}
		});

		// attach cancel listener
		oSelectDialog3.attachCancel(fnCancelDialog);

		var oButton3 = new Button("Button3", {
			text: "Open SelectDialog with destroy call in close event & already initialized binding",
			press: function (oEvent) {
				// set model & bind Aggregation
				oSelectDialog3.setModel(oModelList);
				oSelectDialog3.bindAggregation("items", "/items", oItemTemplate);
				// open dialog
				oSelectDialog3.open("");
			}
		});

		var oSelectDialog4 = new SelectDialog("SelectDialog4", {
			title: "Choose a product",
			noDataText: "Sorry, no products available",
			search : fnDoProductSearch,
			liveChange: fnDoProductSearch
		});

		var oProductItemTemplate = new StandardListItem({
			title : "{ProductId}",
			description : "{Name}",
			icon : "images/travel_expend.png",
			activeIcon: "images/travel_expend_grey.png",
			iconInset : false,
			type : "Detail",
			counter: 99,
			selected: false,
			info: "{Price/CurrencyCode}",
			infoState: "Warning"
		});

		// attach close listener
		oSelectDialog4.attachConfirm(function (oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				oButton4.setText("You selected: " + selectedItem.getTitle());
			}
		});

		// attach cancel listener
		oSelectDialog4.attachCancel(fnCancelDialog);

		var oButton4 = new Button("Button4", {
			text: "Open SelectDialog with web service and binding before opening the dialog",
			press: function (oEvent) {

				// initiate model
				var oModel = new ODataModel(sServiceURI, true);
				oSelectDialog4.setModel(oModel);

				// bind aggregation with filters
				oSelectDialog4.bindAggregation("items", {
					path: "/Products",
					filters: fnCreatePrefilter("", true),
					template: oProductItemTemplate
				});

				// open dialog
				oSelectDialog4.open("");
			}
		});

		/* 4a) select dialog with web service binding and setting data after opening the dialog (adapted from growinglist) */
		var oSelectDialog4a = new SelectDialog("SelectDialog4a", {
			title: "Choose a product",
			noDataText: "Sorry, no products available",
			search : fnDoProductSearch,
			liveChange: fnDoProductSearch
		});

		var oProductItemTemplate = new StandardListItem({
			title : "{ProductId}",
			description : "{Name}",
			icon : "images/travel_expend.png",
			activeIcon: "images/travel_expend_grey.png",
			iconInset : false,
			type : "Detail",
			counter: 99,
			selected: false,
			info: "{Price/CurrencyCode}",
			infoState: "Warning"
		});


		function productSelectionFormatter(sText) {
			if (!sText) {
				return false;
			}
			if (parseInt(sText.substring(sText.length - 1)) < 5) {
				return true;
			} else {
				return false;
			}
		}

		var oProductItemTemplateSelection = new StandardListItem({
			title : "{ProductId}",
			description : "{Name}",
			icon : "images/travel_expend.png",
			activeIcon: "images/travel_expend_grey.png",
			iconInset : false,
			type : "Detail",
			counter: 99,
			selected: {path: 'ProductId', type: new BooleanType(), formatter: productSelectionFormatter },
			info: "{Price/CurrencyCode}",
			infoState: "Warning"
		});

		// attach close listener
		oSelectDialog4a.attachConfirm(function (oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				oButton4a.setText("You selected: " + selectedItem.getTitle());
			}
		});

		// attach cancel listener
		oSelectDialog4a.attachCancel(fnCancelDialog);

		var oButton4a = new Button("Button4a", {
			text: "Open SelectDialog with web service pre-filtered by \"id\" and binding before opening the dialog",
			press: function (oEvent) {
				// open dialog
				oSelectDialog4a.open("id_1");

				// initiate model
				var oModel = new ODataModel(sServiceURI, true);
				oSelectDialog4a.setModel(oModel);

				// bind aggregation with filters
				oSelectDialog4a.bindAggregation("items", {
					path: "/Products",
					filters: fnCreatePrefilter("id_1", true),
					template: oProductItemTemplate
				});
			}
		});

		/* 5) reuse of dialog2 to show a forward footer button scenario */
		var oButton5 = new Button("Button5", {
			text: "Forward to...",
			press: function () {
				// open dialog
				oSelectDialog2.open("");

				// initiate model
				oSelectDialog2.setModel(oModelList);
				oSelectDialog2.setModel(oModelDialog,"dialog");

				// bind aggregation with filters
				oSelectDialog2.bindAggregation("items", {
					path: "/superheros",
					template: oItemTemplate
				});
			}
		});

		/* 6) SelectDialog with multiselect and fixed width */

		var oSelectDialog6 = new SelectDialog("SelectDialog6", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			contentWidth: "1000px",
			multiSelect: true,
			search : fnDoSearch,
			liveChange: fnDoSearch
		});

		// set model & bind Aggregation
		oSelectDialog6.setModel(oModelList);
		oSelectDialog6.bindAggregation("items", "/superheros", oItemTemplate);

		// attach close listener
		oSelectDialog6.attachConfirm(function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				sSelectedItems = "";

			if (aSelectedItems) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					sSelectedItems += aSelectedItems[i].getTitle();
					if (i < aSelectedItems.length - 1) {
						sSelectedItems += ', ';
					}
				}
				oButton6.setText("You selected: " + sSelectedItems);
			}
		});

		// attach cancel listener
		oSelectDialog6.attachCancel(fnCancelDialog);

		var oButton6 = new Button("Button6", {
			text: "Open SelectDialog with late binding in MultiSelect prefiltered by \"ad\" mode with 1000px width",
			press: function () {
				// open dialog
				oSelectDialog6.open("");

				// initiate model
				oSelectDialog6.setModel(oModelList);
				oSelectDialog6.setModel(oModelDialog,"dialog");

				// bind aggregation with filters
				oSelectDialog6.bindAggregation("items", {
					path: "/superheros",
					filters: fnCreatePrefilter("ad"),
					template: oItemTemplate
				});
			}
		});

		/* 7) SelectDialog in MultiSelect mode prefiltered by \"id_\" with web service binding and 400px width */

		var oSelectDialog7 = new SelectDialog("SelectDialog7", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			multiSelect: true,
			contentWidth: "400px",
			search : fnDoProductSearch,
			liveChange: fnDoProductSearch,
			showClearButton: true
		});

		// attach close listener
		oSelectDialog7.attachConfirm(function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				aSelectedContexts = oEvent.getParameter("selectedContexts"),
				sSelectedItems = "",
				sSelectedContexts = "";

			if (aSelectedItems) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					sSelectedItems += aSelectedItems[i].getTitle();
					if (i < aSelectedItems.length - 1) {
						sSelectedItems += ', ';
					}
				}

			}
			if (aSelectedContexts) {
				for (var i = 0; i < aSelectedContexts.length; i++) {
					sSelectedContexts += aSelectedContexts[i].getObject().ProductId;
					if (i < aSelectedContexts.length - 1) {
						sSelectedContexts += ', ';
					}
				}
			}
			oButton7.setText("You selected: " + sSelectedItems +  " (contexts: " + sSelectedContexts + ")");
		});

		// attach cancel listener
		oSelectDialog7.attachCancel(fnCancelDialog);

		var oButton7 = new Button("Button7", {
			text: "Open SelectDialog in MultiSelect mode prefiltered by \"id_1\" with web service binding and 400px width",
			press: function () {
				// initiate model
				var oModel = new ODataModel(sServiceURI, true);
				oSelectDialog7.setModel(oModel);

				// bind aggregation with filters
				oSelectDialog7.bindAggregation("items", {
					path: "/Products",
					filters: fnCreatePrefilter("id_1", true),
					template: oProductItemTemplateSelection
				});

				// open dialog
				oSelectDialog7.open("id_1");
			}
		});

		/* 8) selection model in JSON data (multiSelect mode) */

		var oSelectDialog8 = new SelectDialog("SelectDialog8", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			multiSelect: true,
			contentWidth: "400px",
			search : fnDoSearch,
			liveChange: fnDoSearch
		});

		// attach close listener
		oSelectDialog8.attachConfirm(function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				aSelectedContexts = oEvent.getParameter("selectedContexts"),
				sSelectedItems = "",
				sSelectedContexts = "";

			if (aSelectedItems) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					sSelectedItems += aSelectedItems[i].getTitle();
					if (i < aSelectedItems.length - 1) {
						sSelectedItems += ', ';
					}
				}

			}
			if (aSelectedContexts) {
				for (var i = 0; i < aSelectedContexts.length; i++) {
					sSelectedContexts += aSelectedContexts[i].getObject().title;
					if (i < aSelectedContexts.length - 1) {
						sSelectedContexts += ', ';
					}
				}
			}
			oButton8.setText("You selected: " + sSelectedItems +  " (contexts: " + sSelectedContexts + ")");
		});

		// attach cancel listener
		oSelectDialog8.attachCancel(fnCancelDialog);

		// initiate model
		oSelectDialog8.setModel(oModelList);

		// bind aggregation with filters
		oSelectDialog8.bindAggregation("items", {
			path: "/superheros",
			template: oItemTemplateSelection
		});

		var oButton8 = new Button("Button8", {
			text: "Open SelectDialog in MultiSelect mode with JSON binding and selection model and rememberSelections=false",
			press: function () {
				// clear filter
				oSelectDialog8.getBinding("items").filter([]);
				// open dialog
				oSelectDialog8.open();
			}
		});

		/* 9) selection model in JSON data (multiSelect mode) + rememberSelections = true */

		var oSelectDialog9 = new SelectDialog("SelectDialog9", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			multiSelect: true,
			rememberSelections: true,
			contentWidth: "400px",
			search : fnDoSearch,
			liveChange: fnDoSearch
		});

		// attach close listener
		oSelectDialog9.attachConfirm(function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				aSelectedContexts = oEvent.getParameter("selectedContexts"),
				sSelectedItems = "",
				sSelectedContexts = "";

			if (aSelectedItems) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					sSelectedItems += aSelectedItems[i].getTitle();
					if (i < aSelectedItems.length - 1) {
						sSelectedItems += ', ';
					}
				}

			}
			if (aSelectedContexts) {
				for (var i = 0; i < aSelectedContexts.length; i++) {
					sSelectedContexts += aSelectedContexts[i].getObject().title;
					if (i < aSelectedContexts.length - 1) {
						sSelectedContexts += ', ';
					}
				}
			}
			oButton9.setText("You selected: " + sSelectedItems +  " (contexts: " + sSelectedContexts + ")");
		});

		// attach cancel listener
		oSelectDialog9.attachCancel(fnCancelDialog);

		// initiate model
		oSelectDialog9.setModel(oModelList);

		// bind aggregation with filters
		oSelectDialog9.bindAggregation("items", {
			path: "/superheros",
			filters: fnCreatePrefilter("Hulk"),
			template: oItemTemplateSelection
		});

		var oButton9 = new Button("Button9", {
			text: "Open SelectDialog in MultiSelect mode prefiltered by \"Hulk\" with JSON binding and selection model and rememberSelections=true",
			press: function () {
				// prefilter dialog
				var itemsBinding = oSelectDialog9.getBinding("items");
				itemsBinding.filter(fnCreatePrefilter("Hulk"), "Application");
				// open dialog
				oSelectDialog9.open("Hulk");
			}
		});

		var oSelectDialog10 = new SelectDialog("SelectDialog10", {
			title: "{dialog>/title}",
			noDataText: "{dialog>/noDataMessage}",
			multiSelect: true,
			contentWidth: "777px",
			contentHeight: "500px",
			search : fnDoProductSearch,
			liveChange: fnDoProductSearch
		});

		// attach close listener
		oSelectDialog10.attachConfirm(function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				aSelectedContexts = oEvent.getParameter("selectedContexts"),
				sSelectedItems = "",
				sSelectedContexts = "";

			if (aSelectedItems) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					sSelectedItems += aSelectedItems[i].getTitle();
					if (i < aSelectedItems.length - 1) {
						sSelectedItems += ', ';
					}
				}

			}
			if (aSelectedContexts) {
				for (var i = 0; i < aSelectedContexts.length; i++) {
					sSelectedContexts += aSelectedContexts[i].getObject().ProductId;
					if (i < aSelectedContexts.length - 1) {
						sSelectedContexts += ', ';
					}
				}
			}
			oButton10.setText("You selected: " + sSelectedItems +  " (contexts: " + sSelectedContexts + ")");
		});

		// attach cancel listener
		oSelectDialog10.attachCancel(fnCancelDialog);

		var oButton10 = new Button("Button10", {
			text: "Open SelectDialog with the view as parent and delayed binding (wrong usage, don't do this at home!)",
			press: function () {
				// bind aggregation with filters
				oSelectDialog10.bindAggregation("items", {
					path: "/Products",
					filters: fnCreatePrefilter("id_1", true),
					template: oProductItemTemplateSelection
				});

				// open dialog
				oSelectDialog10.open("id_1");

				setTimeout(function () {
					// initiate model
					var oModel = new ODataModel(sServiceURI, true);
					oSelectDialog10.setModel(oModel);

					oSelectDialog10.setModel(oModelDialog,"dialog");
				}, 1000);
			}
		});

		/* SelectDialog with multiselect ang growing false */

		var oSelectDialog11 = new SelectDialog("SelectDialog11", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			contentWidth: "1000px",
			multiSelect: true,
			growing: false
		});

		// set model & bind Aggregation
		oSelectDialog11.setModel(oModelList);
		oSelectDialog11.bindAggregation("items", "/superheros", oItemTemplate);

		var oButton11 = new Button("Button11", {
			text: "Open SelectDialog with growing=false",
			press: function () {
				// open dialog
				oSelectDialog8.open();
			}
		});

		/*SelectDialog 12 - test the sticky toolbar*/

		var oSelectDialog12 = new SelectDialog("SelectDialog12", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			multiSelect: true,
			contentWidth: "400px",
			search : fnDoProductSearch,
			liveChange: fnDoProductSearch
		});

		// attach cancel listener
		oSelectDialog12.attachCancel(fnCancelDialog);

		var oButton12 = new Button("Button12", {
			text: "Open SelectDialog to test the sticky toolbar",
			press: function () {
				// initiate model
				var oModel = new ODataModel(sServiceURI, true);
				oSelectDialog12.setModel(oModel);

				// bind aggregation with filters
				oSelectDialog12.bindAggregation("items", {
					path: "/Products",
					filters: fnCreatePrefilter("id", true),
					template: oProductItemTemplateSelection
				});

				// open dialog
				oSelectDialog12.open("id");
			}
		});

		/* SelectDialog with resizable true */

		var oSelectDialog13 = new SelectDialog("SelectDialog13", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			contentWidth: "1000px",
			resizable: true
		});

		// set model & bind Aggregation
		oSelectDialog13.setModel(oModelList);
		oSelectDialog13.bindAggregation("items", "/superheros", oItemTemplate);

		var oButton13 = new Button("Button13", {
			text: "Open SelectDialog with resizable=true",
			press: function () {
				// open dialog
				oSelectDialog13.open();
			}
		});

		var oSingleListData = {
			superheroes: [{
				title: "Darth Vader",
				description: "The force",
				icon: "sap-icon://alert",
				selected: false
			}, {
				title: "Agent Smith",
				description: "Matrix virus",
				icon: "sap-icon://attachment",
				selected: false
			}]
		};
		var oSingleModel = new JSONModel(oSingleListData);

		var oSelectDialog14 = new SelectDialog("SelectDialog14", {
			title: "Single Select with Remember Selection",
			noDataText: "Sorry, no world domination companions available",
			multiSelect: false,
			rememberSelections: true,
			contentWidth: "400px",
			search : fnDoSearch,
			liveChange: fnDoSearch
		});

		// attach confirm listener
		oSelectDialog14.attachConfirm(function (oEvent) {
			MessageToast.show("Selected item: " + oEvent.getParameter("selectedItem").getTitle());
		});

		// attach cancel listener
		oSelectDialog14.attachCancel(fnCancelDialog);

		var oButton14 = new Button("Button14", {
			text: "Single Select Dialog with Remember Selection",
			press: function () {
				// initiate model
				oSelectDialog14.setModel(oSingleModel);

				// bind aggregation with filters
				oSelectDialog14.bindAggregation("items", {
					path: "/superheroes",
					filters: [],
					template: oItemTemplateSelection
				});

				// open dialog
				oSelectDialog14.open();
			}
		});

		var oSelectDialog15 = new SelectDialog("SelectDialog15", {
			title: "Multi Select with Remember Selection",
			noDataText: "Sorry, no world domination companions available",
			multiSelect: true,
			rememberSelections: true,
			contentWidth: "400px",
			search : fnDoSearch,
			liveChange: fnDoSearch
		});

		// attach confirm listener
		oSelectDialog15.attachConfirm(function (oEvent) {
			MessageToast.show("Selected items: " + oEvent.getParameter("selectedItems").reduce(function (acc, oItem) {
				 acc += oItem.getTitle() + ", ";
				return acc;
			}, ""));
		});

		// attach cancel listener
		oSelectDialog15.attachCancel(fnCancelDialog);

		var oButton15 = new Button("Button15", {
			text: "Multi Select Dialog with Remember Selection",
			press: function () {
				// initiate model
				oSelectDialog15.setModel(oModelList);

				// bind aggregation with filters
				oSelectDialog15.bindAggregation("items", {
					path: "/superheros",
					filters: [],
					template: oItemTemplateSelection
				});

				// open dialog
				oSelectDialog15.open();
			}
		});

		var oSelectDialog16 = new SelectDialog("SelectDialog16", {
			title: "Resize this window to observe the responsive paddings",
			noDataText: "Sorry, no world domination companions available",
			contentWidth: "100%",
			draggable: true,
			resizable: true
		});

		// set model & bind Aggregation
		oSelectDialog16.setModel(oModelList);
		oSelectDialog16.bindAggregation("items", "/superheros", oItemTemplate);
		oSelectDialog16.addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader");

		var oButton16 = new Button("Button16", {
			text: "SelectDialog with Responsive Paddings (SAP Quartz and Horizon Themes only)",
			press: function () {
				oSelectDialog16.setModel(oModelList);
				oSelectDialog16.bindAggregation("items", {
					path: "/superheros",
					filters: [],
					template: oItemTemplateSelection
				});

				oSelectDialog16.open();
			}
		});

		var oSelectDialog17 = new SelectDialog("SelectDialog17", {
			title: "Choose several World Domination companions",
			noDataText: "Sorry, no world domination companions available",
			contentWidth: "1000px",
			searchPlaceholder: "Placeholder text"
		});

		// set model & bind Aggregation
		oSelectDialog17.setModel(oModelList);
		oSelectDialog17.bindAggregation("items", "/superheros", oItemTemplate);

		var oButton17 = new Button("Button17", {
			text: "Select Dialog with custom placeholder",
			press: function () {
				// open dialog
				oSelectDialog17.open();
			}
		});

		var oSelectDialog18 = new SelectDialog("SelectDialog18", {
				title: "SelectDialog with delayed binding",
				multiSelect: true,
				contentWidth: "777px",
				contentHeight: "500px"
			});

		var oButton18 = new Button("Button18", {
				text: "Open SelectDialog with delayed binding",
				press: function () {
					// bind aggregation with filters
					oSelectDialog18.bindAggregation("items", {
						path: "/Products",
						template: oProductItemTemplate
					});

					// open dialog
					oSelectDialog18.open("id_1");

					setTimeout(function () {
						// initiate model
						var oModel = new ODataModel(sServiceURI, true);
						oSelectDialog18.setModel(oModel);
					}, 500);
				}
			});

		var oPage = new Page("page", {
			title:"Mobile SelectDialog Control",
			content:[
				new VBox({
					items: [
						oInput1,
						oButton2,
						oButton3,
						oButton4,
						oButton4a,
						oButton6,
						oButton7,
						oButton8,
						oButton9,
						oButton10,
						oButton11,
						oButton12,
						oButton13,
						oButton14,
						oButton15,
						oButton16,
						oButton17,
						oButton18
					]
				})
			],
			footer: new Bar({
				contentRight: [oButton5]
			})
		});

		var oApp = new App("myApp", {initialPage:"page"});
		oApp.addPage(oPage).placeAt("content");
	});
