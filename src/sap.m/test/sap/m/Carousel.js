sap.ui.define([
	"sap/ui/core/Element",
	"sap/m/Text",
	"sap/m/List",
	"sap/m/MessageToast",
	"sap/m/StandardListItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ScrollContainer",
	"sap/m/Bar",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/SearchField",
	"sap/m/Popover",
	"sap/m/Label",
	"sap/m/Switch",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/Page",
	"sap/m/SegmentedButton",
	"sap/m/Image",
	"sap/m/Carousel",
	"sap/m/CarouselLayout",
	"sap/m/Input",
	"sap/m/FlexBox",
	"sap/m/Panel",
	"sap/m/App",
	"sap/m/Slider",
	'sap/ui/layout/form/SimpleForm',
	"sap/ui/core/Title",
	"sap/ui/core/HTML",
	"sap/base/Log",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/ColumnListItem",
	"sap/m/SegmentedButtonItem"
], function (Element, Text, List, MessageToast, StandardListItem, JSONModel, Dialog, Button,
	ScrollContainer, Bar, HBox, VBox, SearchField, Popover, Label, Switch, RadioButton, RadioButtonGroup,
	Page, SegmentedButton, Image, Carousel, CarouselLayout, Input, FlexBox, Panel, App, Slider, SimpleForm,
	Title, HTML, Log, mLibrary, Table, Column, Toolbar, ToolbarSpacer, ColumnListItem, SegmentedButtonItem) {
	"use strict";

		//shortcuts
		const ButtonType = mLibrary.ButtonType,
			PlacementType = mLibrary.PlacementType,
			BackgroundDesign = mLibrary.BackgroundDesign,
			BorderDesign = mLibrary.BorderDesign,
			CarouselArrowsPlacement = mLibrary.CarouselArrowsPlacement;


		var oOldActivePage = new Text();
		var oNewActivePage = new Text();
		var oAllActivePages = new Text();

		function updateActivePages(sOldPageId, sNewPageId, aActivePages) {
			oOldActivePage.setText(sOldPageId);
			oNewActivePage.setText(sNewPageId);
			oAllActivePages.setText("[" + aActivePages + "]");
		}

		//Create demo page for mobile controls
		function createAList(inset, id) {
			var oList = new List(id, {
				inset : inset
			});

			var fnOnListItemPress = function() {
				MessageToast.show("ListItem pressed");
			};

			var data = {
				navigation : [ {
					title : "Travel Expend",
					description : "Access the travel expend workflow",
					icon : "images/travel_expend.png",
					iconInset : false,
					type : "Navigation",
					press : function() {
						MessageToast.show(this.title + " pressed");
					}
				}, {
					title : "Travel and expense report",
					description : "Access travel and expense reports",
					icon : "images/travel_expense_report.png",
					iconInset : false,
					type : "Navigation",
					press : 'detailPage'
				}, {
					title : "Travel Request",
					description : "Access the travel request workflow",
					icon : "images/travel_request.png",
					iconInset : false,
					type : "Navigation",
					press : 'detailPage'
				}, {
					title : "Work Accidents",
					description : "Report your work accidents",
					icon : "images/wounds_doc.png",
					iconInset : false,
					type : "Navigation",
					press : 'detailPage'
				}, {
					title : "Travel Settings",
					description : "Change your travel worflow settings",
					icon : "images/settings.png",
					iconInset : false,
					type : "Navigation",
					press : 'detailPage'
				} ]
			};

			var oItemTemplate1 = new StandardListItem({
				title : "{title}",
				description : "{description}",
				icon : "{icon}",
				iconInset : "{iconInset}",
				type : "{type}",
				press : [fnOnListItemPress]
			});

			function bindListData(data, itemTemplate, list) {
				var oModel = new JSONModel();
				// set the data for the model
				oModel.setData(data);
				// set the model to the list
				list.setModel(oModel);

				// bind Aggregation
				list.bindAggregation("items", "/navigation", itemTemplate);
			}

			bindListData(data, oItemTemplate1, oList);


			return oList;
		}

		var oTableData = {
			items: [
				{ name: "Michelle", color: "orange", number: 3.14 },
				{ name: "Joseph", color: "blue", number: 1.618 },
				{ name: "David", color: "green", number: 0 }
			]
		};
		var oTableModel = new JSONModel();
			oTableModel.setData(oTableData);

		const oTable = new Table("myTable", {
			headerToolbar: new Toolbar({
				content: [
					new ToolbarSpacer(),
					new Button({
						icon: "sap-icon://person-placeholder"
					})
				]
			}),
			columns: [
				new Column({
					header: new Label({ text: "Name"})
				}),
				new Column({
					header: new Label({ text: "Color"})
				}),
				new Column({
					header: new Label({ text: "Number"})
				})
			]

		});
		oTable.bindItems({
			path: "/items",
			template : new ColumnListItem({
				cells: [
					new Label({text: "{name}"}),
					new Label({text: "{color}"}),
					new Label({text: "{number}"})
				]
			})
		});
		oTable.setModel(oTableModel);

		var oDialog1;
		function openDialog() {
			oDialog1 = oDialog1 || new Dialog("dialog1", {
				title : "World Domination",
				content : [ new HTML({
					content : "<p>Do you want to start a new world domination campaign?</p>"
				}) ],
				beginButton : new Button({
					text : "Reject",
					type : ButtonType.Reject,
					press : function() {
						oDialog1.close();
					}
				}),
				endButton : new Button({
					text : "Accept",
					type : ButtonType.Accept,
					press : function() {
						oDialog1.close();
					}
				})
			});

			oDialog1.open();
		}

		var oPopover;
		function openPopover() {
			if (!oPopover) {
				var oList = createAList(true, "l1");

				var oScrollContainer = new ScrollContainer({
					horizontal : false,
					vertical : true,
					content : oList
				});

				var footer = new Bar({
					contentMiddle : [ new Button({
						icon : "images/SAPUI5.png"
					}), new Button({
						icon : "images/SAPUI5.png"
					}), new Button({
						icon : "images/SAPUI5.png"
					}) ]
				});

				oPopover = new Popover({
					placement : PlacementType.Bottom,
					title : "Popover",
					showHeader : true,
					beginButton : new Button({
						text : "Left"
					}),
					endButton : new Button({
						text : "Right"
					}),
					footer : footer,
					content : [ oScrollContainer ]
				});
			}
			oPopover.openBy(Element.getElementById("pob"));
		}

		function getAllControls() {
			var aControls = [ new Text({
				text : "This page features (almost) all UI5 Mobile Controls with visible UI parts at one glance. (This is a sap.m.Text control.)"
			}),

			new Button("pob", {
				text : "This is a Button. Press to OPEN POPOVER",
				press : openPopover
			}),

			new HBox({
				items : [ new Label({
					text : "This is a Switch:"
				}), new Switch({
					state : true
				}) ]
			}),

			new HBox({
				items : [ new Label({
					text : "This is a Label, describing RadioButtons:"
				}), new RadioButton({
					selected : true
				}), new RadioButton({
					selected : false
				}), new RadioButton({
					selected : false
				}) ]
			}),

			new SearchField({
				placeholder : "Search for..."
			}),


			createAList(true, "lins").setHeaderText("This is an inset List").setFooterText("This was an inset List") ];
			return aControls;
		}

		var demoPage = new Page("page1", {
			title : "All Controls",
			enableScrolling: true,

			headerContent : new Button({
				text : "Open Dialog",
				press : openDialog
			}),

			content : new VBox("vbox", {
				items : getAllControls()
			}),

			footer : new Bar({
				contentMiddle : new SegmentedButton('SegmentedBar', {
					items : [ new SegmentedButtonItem("sb1", {
						text : "Seg-"
					}), new SegmentedButtonItem({
						text : "-men-"
					}), new SegmentedButtonItem({
						text : "-ted"
					}) ],
					selectedItem : "sb1"
				})
			})
		});

		//Example of usage for 'BeforeShow' and 'AfterHide' events
		demoPage.addEventDelegate({
			onBeforeShow: function(evt) {
				Log.info("sap.m.Page: demo page is going to be shown");
			},
			onBeforeFirstShow: function(evt) {
				Log.info("sap.m.Page: first time, demo page is going to be shown");
			},
			onAfterHide: function(evt) {
				Log.info("sap.m.Page: demo page has been hidden");
				//Remove content of 'demoPage' when it is discarded from the carousel
				/* if(demoPage.getContent().length > 0) {
					//Make sure you do not trigger re-rendering!
					var i, ithCont;
					for(i=0; i<demoPage.getContent().length; i++) {
						ithCont = demoPage.getContent()[i];
						demoPage.removeAggregation("content", ithCont, true);
						ithCont.destroy();
					}
				} */
			}
		});

		// Create Images
		var imgDesert = new Image("desert", {
			src: "images/demo/nature/desert.jpg",
			alt: "Majestic Desert",
			densityAware: false,
			decorative: false
		});

		var imgElephant = new Image("elephant", {
			src: "images/demo/nature/elephant.jpg",
			alt: "Mighty Elephant",
			densityAware: false,
			decorative: false
		});

		var imgDesert2 = new Image("desert2", {
			src: "images/demo/nature/desert.jpg",
			alt: "Majestic Desert",
			densityAware: false,
			decorative: false
		});

		var imgForest =  new Image("forest", {
			src: "images/demo/nature/forest.jpg",
			alt: "Forest in Fall",
			densityAware: false,
			decorative: false
		});

		var scrollForest = new ScrollContainer({
			horizontal: false,
			vertical: true,
			content:[imgForest],
			width:'100%',
			height:'100%'
		});


		var imgHuntingLeopard = new Image("huntingLeopard", {
			src: "images/demo/nature/huntingLeopard.jpg",
			alt: "Hunting Leopard, Full Speed",
			densityAware: false,
			decorative: false
		});

		var imgPrairie = new Image("prairie", {
			src: "images/demo/nature/prairie.jpg",
			alt: "Prairie in Dawn",
			densityAware: false,
			decorative: false
		});

		var imgWaterfall = new Image("waterfall", {
			src: "images/demo/nature/waterfall.jpg",
			alt: "Waterfall in the Jungle",
			densityAware: false,
			decorative: false
		});


		var imgLeopard = new Image("leopard", {
			src: "images/demo/nature/huntingLeopard.jpg",
			alt: "Waterfall in the Jungle",
			densityAware: false,
			decorative: false
		});

		var imgWaterfall2 = new Image("waterfall2", {
			src: "images/demo/nature/waterfall.jpg",
			alt: "Waterfall in the Jungle",
			densityAware: false,
			decorative: false
		});

		var imgLeopard2 = new Image("leopard2", {
			src: "images/demo/nature/huntingLeopard.jpg",
			alt: "Waterfall in the Jungle",
			densityAware: false,
			decorative: false
		});

		var imgWaterfall3 = new Image("waterfall3", {
			src: "images/demo/nature/waterfall.jpg",
			alt: "Waterfall in the Jungle",
			densityAware: false,
			decorative: false
		});

		var carouselImages = [imgDesert, oTable, imgElephant, imgDesert2, demoPage, imgHuntingLeopard, imgPrairie, scrollForest, imgWaterfall, imgLeopard, imgWaterfall2, imgLeopard2, imgWaterfall3];

		//Please uncomment any of the following lines to test the corresponding
		//carousel attribute
		var carousel = new Carousel("myCarousel", {
			//pageIndicatorPlacement: PlacementType.Top,
			//pageIndicatorPlacement: PlacementType.Bottom,
			activePage: carouselImages[2],
			//width: "50%",
			//height: "50%",
			//showPageIndicator: false,
			loop: true,
			//showBusyIndicator: false,
			pages: [carouselImages[0], carouselImages[1], carouselImages[2], carouselImages[3], carouselImages[4]],
			pageChanged: function (e) {
				updateActivePages(e.getParameter("oldActivePageId"), e.getParameter("newActivePageId"), e.getParameter("activePages"));
			}
		});

		// Radio button group arrowsPlacement

		var oRBGroupArrowsPlacement = new RadioButtonGroup("RBArrowsPlacement");
		oRBGroupArrowsPlacement.setColumns(2);

		var oButtonContent = new RadioButton("RB-Content");
		oButtonContent.setText("Content");
		oButtonContent.setTooltip("Places the arrows on the sides of the content");
		oRBGroupArrowsPlacement.addButton(oButtonContent);

		var oButtonIndicator = new RadioButton("RB-Indicator");
		oButtonIndicator.setText("PageIndicator");
		oButtonIndicator.setTooltip("Places the arrows on the sides of the page indicator");
		oRBGroupArrowsPlacement.addButton(oButtonIndicator);

		var oRBGroupArrowsPlacementLabel = new Label({ text: "Carousel arrow placement", labelFor: oRBGroupArrowsPlacement });
		oRBGroupArrowsPlacement.attachSelect(function () {
			var sSelectedValue = oRBGroupArrowsPlacement.getSelectedButton().getText();
			if (sSelectedValue === "Content") {
				carousel.setArrowsPlacement(CarouselArrowsPlacement.Content);
			} else if (sSelectedValue === "PageIndicator") {
				carousel.setArrowsPlacement(CarouselArrowsPlacement.PageIndicator);
			}
		});

		// Radio button group pageIndicatorPlacement

		var oRBGroupPageIndicatorPlacement = new RadioButtonGroup("RBPageIndicatorPlacement");
		oRBGroupPageIndicatorPlacement.setColumns(2);

		var oButtonBottom = new RadioButton("RB-Bottom");
		oButtonBottom.setText("Bottom");
		oButtonBottom.setTooltip("Places the page indicator on the bottom of the carousel");
		oRBGroupPageIndicatorPlacement.addButton(oButtonBottom);

		var oButtonTop = new RadioButton("RB-Top");
		oButtonTop.setText("Top");
		oButtonTop.setTooltip("Places the page indicator on the top of the carousel");
		oRBGroupPageIndicatorPlacement.addButton(oButtonTop);

		var oRBGroupPageIndicatorPlacementLabel = new Label({ text: "Page indicator placement", labelFor: oRBGroupPageIndicatorPlacement });
		oRBGroupPageIndicatorPlacement.attachSelect(function () {
			var sSelectedValue = oRBGroupPageIndicatorPlacement.getSelectedButton().getText();
			if (sSelectedValue === "Bottom") {
				carousel.setPageIndicatorPlacement(PlacementType.Bottom);
			} else if (sSelectedValue === "Top") {
				carousel.setPageIndicatorPlacement(PlacementType.Top);
			}
		});

		// Radio button group backgroundDesign
		var oRBGroupBackgroundDesign =  new RadioButtonGroup("RBBackgroundDesign");
		oRBGroupBackgroundDesign.setColumns(3);

		var oButtonSolid = new RadioButton("RB-Solid");
		oButtonSolid.setText("Solid");
		oButtonSolid.setTooltip("Sets the carousel's background to Solid");
		oRBGroupBackgroundDesign.addButton(oButtonSolid);

		var oButtonTranslucent = new RadioButton("RB-Translucent");
		oButtonTranslucent.setText("Translucent");
		oButtonTranslucent.setSelected(true);
		oButtonTranslucent.setTooltip("Sets the carousel's background to Translucent (Default)");
		oRBGroupBackgroundDesign.addButton(oButtonTranslucent);

		var oButtonTransparent = new RadioButton("RB-Transparent");
		oButtonTransparent.setText("Transparent");
		oButtonTransparent.setTooltip("Sets the carousel's background to Transparent");
		oRBGroupBackgroundDesign.addButton(oButtonTransparent);

		var oRBGroupBackgroundDesignLabel = new Label({
			text: "Background Design",
			labelFor: oRBGroupBackgroundDesign
		});
		oRBGroupBackgroundDesign.attachSelect(function () {
			var sSelectedValue = oRBGroupBackgroundDesign.getSelectedButton().getText();
			if (sSelectedValue === "Solid") {
				carousel.setBackgroundDesign(BackgroundDesign.Solid);
			} else if (sSelectedValue === "Translucent") {
				carousel.setBackgroundDesign(BackgroundDesign.Translucent);
			} else if (sSelectedValue === "Transparent") {
				carousel.setBackgroundDesign(BackgroundDesign.Transparent);
			}
		});

		// Radio button group showPageIndicator

		var oRBGroupShowPageIndicator = new RadioButtonGroup("RBShowPageIndicator");
		oRBGroupShowPageIndicator.setColumns(2);

		var oButtonYes = new RadioButton("RB-Yes");
		oButtonYes.setText("Yes");
		oButtonYes.setTooltip("Shows the page indicator of the carousel");
		oRBGroupShowPageIndicator.addButton(oButtonYes);

		var oButtonNo = new RadioButton("RB-No");
		oButtonNo.setText("No");
		oButtonNo.setTooltip("Hides the page indicator of the carousel");
		oRBGroupShowPageIndicator.addButton(oButtonNo);

		var oRBGroupShowPageIndicatorLabel = new Label({ text: "Show page indicator", labelFor: oRBGroupShowPageIndicator });
		oRBGroupShowPageIndicator.attachSelect(function () {
			var sSelectedValue = oRBGroupShowPageIndicator.getSelectedButton().getText();
			if (sSelectedValue === "Yes") {
				carousel.setShowPageIndicator(true);
			} else if (sSelectedValue === "No") {
				carousel.setShowPageIndicator(false);
			}
		});

		// Radio button group pageIndicatorBackgroundDesign
		var oRBGroupPageIndicatorBackgroundDesign = new RadioButtonGroup();
		oRBGroupPageIndicatorBackgroundDesign.setColumns(3);

		var oPIBButtonSolid = new RadioButton("RB-PI-Solid");
		oPIBButtonSolid.setText("Solid");
		oPIBButtonSolid.setTooltip("Sets the page indicator background to Solid (Default)");
		oRBGroupPageIndicatorBackgroundDesign.addButton(oPIBButtonSolid);

		var oPIBButtonTranslucent = new RadioButton("RB-PI-Translucent");
		oPIBButtonTranslucent.setText("Translucent");
		oPIBButtonTranslucent.setTooltip("Sets the page indicator background to Translucent");
		oRBGroupPageIndicatorBackgroundDesign.addButton(oPIBButtonTranslucent);

		var oPIBButtonTransparent = new RadioButton("RB-PI-Transparent");
		oPIBButtonTransparent.setText("Transparent");
		oPIBButtonTransparent.setTooltip("Sets the page indicator background to Transparent");
		oRBGroupPageIndicatorBackgroundDesign.addButton(oPIBButtonTransparent);

		var oRBGroupPageIndicatorBackgroundDesignLabel = new Label({
			text: "Page Indicator Background Design",
			labelFor: oRBGroupPageIndicatorBackgroundDesign
		});
		oRBGroupPageIndicatorBackgroundDesign.attachSelect(function () {
			var sSelectedValue = oRBGroupPageIndicatorBackgroundDesign.getSelectedButton().getText();
			if (sSelectedValue === "Solid") {
				carousel.setPageIndicatorBackgroundDesign(BackgroundDesign.Solid);
			} else if (sSelectedValue === "Translucent") {
				carousel.setPageIndicatorBackgroundDesign(BackgroundDesign.Translucent);
			} else if (sSelectedValue === "Transparent") {
				carousel.setPageIndicatorBackgroundDesign(BackgroundDesign.Transparent);
			}
		});

		// Radio button group pageIndicatorBorderDesign
		var oRBGroupPageIndicatorBorderDesign = new RadioButtonGroup();
		oRBGroupPageIndicatorBorderDesign.setColumns(2);

		var oPIBorderButtonSolid = new RadioButton("RB-PI-B-Solid");
		oPIBorderButtonSolid.setText("Solid");
		oPIBorderButtonSolid.setTooltip("Sets the page indicator border to Solid (Default)");
		oRBGroupPageIndicatorBorderDesign.addButton(oPIBorderButtonSolid);

		var oPIBorderButtonNone = new RadioButton("RB-PI-B-None");
		oPIBorderButtonNone.setText("None");
		oPIBorderButtonNone.setTooltip("Sets the page indicator border to None");
		oRBGroupPageIndicatorBorderDesign.addButton(oPIBorderButtonNone);

		var oRBGroupPageIndicatorBorderDesignLabel = new Label({
			text: "Page Indicator Border Design",
			labelFor: oRBGroupPageIndicatorBorderDesign
		});
		oRBGroupPageIndicatorBorderDesign.attachSelect(function () {
			var sSelectedValue = oRBGroupPageIndicatorBorderDesign.getSelectedButton().getText();
			if (sSelectedValue === "Solid") {
				carousel.setPageIndicatorBorderDesign(BorderDesign.Solid);
			} else if (sSelectedValue === "None") {
				carousel.setPageIndicatorBorderDesign(BorderDesign.None);
			}
		});

		// Input for setting the number of images to show in the carousel

		var oNumberOfImagesInput = new Input("input-slides-number", {
			type: "Number",
			value: "5",
			width: "320px",
			liveChange: function (oEvent) {
				var numberOfImages = Number(oEvent.getSource().getValue());
				if (!Number.isInteger(numberOfImages) || numberOfImages < 0 || numberOfImages > carouselImages.length){
					return;
				}

				var imagesArrayCopy = carouselImages.slice(0);

				var oCarousel = Element.getElementById("myCarousel");
				oCarousel.removeAllPages();

				for (var i = 0; i < numberOfImages; i++) {
					var img = imagesArrayCopy[i];
					oCarousel.addPage(img);
				}
			}
		});
		var oNumberOfImagesInputLabel = new Label({
			text: "Number of images to display (Can be a number between 0 and " + carouselImages.length + ")",
			labelFor: oNumberOfImagesInput
		});

		var oNumberOfPagesToBeShownInput = new Input("input-pages-number", {
			type: "Number",
			value: "1",
			width: "320px",
			liveChange: function (oEvent) {
				var iNumberOfPages = Number(oEvent.getSource().getValue());
				if (!iNumberOfPages || iNumberOfPages < 1 || iNumberOfPages > 4){
					return;
				}

				var oCarousel = Element.getElementById("myCarousel");
				oCarousel.setCustomLayout(new CarouselLayout({
					visiblePagesCount: iNumberOfPages
				}));
			}
		});

		var oNumberOfIPagesToBeShownLabel = new Label({
			text: "Number of pages to be shown in Carousel's visible area (Can be a number between 1 and 4)",
			labelFor: oNumberOfPagesToBeShownInput
		});

		var oScrollModeLabel = new Label({
			text: "Scroll mode - visible pages:",
			labelFor: oScrollModeSwitch
		});

		var oScrollModeSwitch = new Switch("scrollMode",{
			state: false,
			tooltip: "Toggles the scrollMode property of the carousel",
			change: (oEvent) => {
				const bScrollMode = oEvent.getParameter("state"),
				 sScrollMode = bScrollMode ? "VisiblePages" : "SinglePage";
				 Element.getElementById("myCarousel").getCustomLayout()?.setScrollMode(sScrollMode);
			}
		});

		// Slider with 5 values, used to shrink the container of the carousel

		var oScreenSizes = [
			"35%",
			"45%",
			"60%",
			"80%",
			"100%"
		];

		var oSlider = new Slider({
			value: 5,
			width: "320px",
			step: 1,
			min: 1,
			max: 5,
			liveChange: function (oEvent) {
				var originalHeight = 650;

				var iValue = oEvent.getParameter("value");
				var screenWidth = oScreenSizes[Number(iValue) - 1];
				var oCarouselContainer = Element.getElementById("carouselContainer");
				oCarouselContainer.setWidth(screenWidth);
				var heightConstant = screenWidth === "100%" ? 0 : 25; // Add an additional 25% height
				var screenHeight = originalHeight * (parseFloat(screenWidth) + heightConstant) / 100;
				oCarouselContainer.setHeight(screenHeight + 'px');
			}
		});
		var oSliderLabel = new Label({ text: "Shrink carousel container", labelFor: oSlider });

		// SimpleForm to hold the slider for shrinking the carousel container

		var appearanceForm1 = new SimpleForm({
			labelSpanL : 6,
			labelSpanM : 6,
			editable : true,
			layout : "ResponsiveGridLayout",
			content : [
				oSliderLabel,
				oSlider
			]
		});

		// SimpleForm to hold the radio buttons and the input field

		var appearanceForm2 = new SimpleForm({
			labelSpanL : 6,
			labelSpanM : 6,
			editable : true,
			layout : "ResponsiveGridLayout",
			content : [
				new Title({ text: "Active pages"}),
				new Label({ text: "Old active page", labelFor: oOldActivePage }),
				oOldActivePage,
				new Label({ text: "New active page", labelFor: oNewActivePage }),
				oNewActivePage,
				new Label({ text: "All active pages", labelFor: oNewActivePage }),
				oAllActivePages,
				new Title({ text: "Settings"}),
				oRBGroupArrowsPlacementLabel,
				oRBGroupArrowsPlacement,
				oRBGroupPageIndicatorPlacementLabel,
				oRBGroupPageIndicatorPlacement,
				oRBGroupBackgroundDesignLabel,
				oRBGroupBackgroundDesign,
				oRBGroupShowPageIndicatorLabel,
				oRBGroupShowPageIndicator,
				new Label({ text: "Loop", labelFor: "RBLoop" }),
				new RadioButtonGroup("RBLoop", {
					columns: 2,
					buttons: [
						new RadioButton({ text: "true", select: function () { carousel.setLoop(true); } }),
						new RadioButton({ id: "RB-No-Loop", text: "false", select: function () { carousel.setLoop(false); } })
					]
				}),
				oRBGroupPageIndicatorBackgroundDesignLabel,
				oRBGroupPageIndicatorBackgroundDesign,
				oRBGroupPageIndicatorBorderDesignLabel,
				oRBGroupPageIndicatorBorderDesign,
				oNumberOfImagesInputLabel,
				oNumberOfImagesInput,
				oNumberOfIPagesToBeShownLabel,
				oNumberOfPagesToBeShownInput,
				oScrollModeLabel,
				oScrollModeSwitch
			]
		});

		var carouselContainer = new Panel("carouselContainer", {
			height: "650px"
		});

		carouselContainer.addContent(carousel);

		var carouselFlexBox = new FlexBox({
			justifyContent: "Center",
			renderType: "Bare"
		});

		carouselFlexBox.addItem(carouselContainer);

		//Listen to 'pageChanged' events
		carousel.attachPageChanged(function(oControlEvent) {
			Log.info("sap.m.Carousel: page changed: old: " + oControlEvent.getParameters().oldActivePageId );
			Log.info("                              new: " + oControlEvent.getParameters().newActivePageId );
		});

		var appCarousel = new App("myApp", {initialPage:"carouselPage"});

		var carouselPage = new Page("carouselPage", {
			title: "Carousel Test Page",
			headerContent: new Button({text: "focus trap"}),
			enableScrolling: true
		});

		var buttonChangeHeightTo50Percents = new Button("btnHeight50", {
			text: "change height to 50%",
			press: function () {
				carousel.setHeight("50%");
			}
		});

		var buttonChangeHeightTo600px = new Button("btnHeight600px", {
			text: "change height to 600 px",
			press: function () {
				carousel.setHeight("600px");
			}
		});

		var buttonChangeWidthTo60Percents = new Button("btnWidth60", {
			text: "change width to 60%",
			press: function () {
				carousel.setWidth("60%");
				carousel.invalidate();
			}
		});

		var buttonChangeWidthTo400px = new Button("btnWidth400px", {
			text: "change width to 400 px",
			press: function () {
				carousel.setWidth("400px");
				carousel.invalidate();
			}
		});

		var buttonResetCarousel = new Button("btnReset", {
			text: "Reset",
			press: function () {
				carousel.setWidth("100%");
				carousel.setHeight("100%");
				carousel.invalidate();
			}
		});

		carouselPage.addContent(appearanceForm1);
		carouselPage.addContent(carouselFlexBox);
		carouselPage.addContent(appearanceForm2);
		carouselPage.addContent(buttonChangeHeightTo50Percents);
		carouselPage.addContent(buttonChangeHeightTo600px);
		carouselPage.addContent(buttonChangeWidthTo60Percents);
		carouselPage.addContent(buttonChangeWidthTo400px);
		carouselPage.addContent(buttonResetCarousel);
		appCarousel.addPage(carouselPage);
		appCarousel.placeAt("body");
});