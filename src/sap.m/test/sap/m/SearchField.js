sap.ui.define([
	"sap/m/App",
	"sap/ui/core/InvisibleText",
	"sap/m/ToggleButton",
	"sap/m/Dialog",
	"sap/ui/core/library",
	"sap/m/Bar",
	"sap/m/SearchField",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/HBox",
	"sap/m/Label",
	"sap/m/FlexItemData",
	"sap/base/Log",
	"sap/ui/Device"
], function(
	App,
	InvisibleText,
	ToggleButton,
	Dialog,
	coreLibrary,
	Bar,
	SearchField,
	Button,
	Page,
	HBox,
	Label,
	FlexItemData,
	Log,
	Device
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var app = new App("searchApp", {initialPage:"searchPage"});

	new InvisibleText("SF_AD", {text: "Search"}).toStatic();

	function onSearch(event) {
		Log.debug("searchField: search for: " + event.getParameter("query"));
		if (event.getParameter("refreshButtonPressed")){
			Log.debug("searchField: refresh button was pressed");
		}
	}
	function onLiveChange(event) {
		Log.debug("searchField: liveChange for: " + event.getParameter("newValue"));
	}

	var oToggleBtnCompact = new ToggleButton("toggleCompact", {
		text: "Compact Mode",
		pressed: !Device.system.phone && document.body.classList.contains("sapUiSizeCompact"),
		press: function () {
			document.body.classList.toggle("sapUiSizeCompact", this.getPressed());
			document.body.classList.toggle("sapUiSizeCozy", !this.getPressed());
		}
	});

	var oDialog = new Dialog("Dialog", {
		title: "SearchField in a Dialog",
		state: ValueState.Success,
		subHeader: new Bar({
			contentLeft: new SearchField("DialogSFHeader",{placeholder: "search"})
		}),
		content: [
			new SearchField("DialogSF",{placeholder: "search"})
		],
		beginButton:
			new Button({
				text: "Accept",
				press : function() {
					oDialog.close();
				}
			}),
		endButton:
			new Button("reject", {
				text: "Reject",
				press : function() {
					oDialog.close();
				}
			})
	}).addStyleClass("sapUiContentPadding");

	var page = new Page("searchPage", {
		enableScrolling: true,
		title:"Mobile Search Field Control",
		customHeader: new Bar("P1Header", {
			enableFlexBox: false,
			contentLeft: [
				new Button({
					text : "To Page 2",
					press : function() { app.to("searchPage2", "show"); }
				})
			],
			contentRight: oToggleBtnCompact
		}),
		subHeader: new Bar({
			contentMiddle: [
				new HBox({
					items: [
						new Label("SFB2Label", {
							text: "SFB2"
						}).addStyleClass("sapUiTinyMarginEnd"),
						new SearchField( "SFB2", {
							placeholder: "Search",
							ariaLabelledBy: "SFB2Label",
							showRefreshButton: true,
							search: onSearch,
							liveChange: onLiveChange,
							width: "100%",
							refreshButtonTooltip: "Refresh"
						})
					]
				})
			]
		}),
		content : [
			new Label("SF1Label", {
				text: "SF1"
			}),
			new SearchField("SF1", {
				placeholder: "Search",
				ariaLabelledBy: "SF1Label",
				search: onSearch
			}),
			new Label("SF2Label", {
				text: "SF2"
			}),
			new SearchField("SF2", {
				showRefreshButton: true,
				value: "selectOnFocus:false",
				placeholder: "selectOnFocus:false..",
				selectOnFocus: false,
				ariaLabelledBy: "SF2Label",
				refreshButtonTooltip: "Reload",
				search: function(event){
					onSearch(event);
					Log.debug("Page is invalidated");
					page.invalidate();
				},
				liveChange:function(event){
					onLiveChange(event);
					Log.debug("Page is invalidated");
					page.invalidate();
				}
			}),
			new Label("SF3Label", {
				text: "SF3"
			}),
			new SearchField("SF3", {
				placeholder: "disabled",
				value: "disabled",
				ariaLabelledBy: "SF3Label",
				enabled: false,
				showRefreshButton: true,
				refreshButtonTooltip: "Reload",
				search: onSearch,
				liveChange: onLiveChange
			}),
			new Label("SF4Label", {
				text: "SF4"
			}),
			new SearchField("SF4", {
				placeholder: "maxLength=5",
				maxLength: 5,
				ariaLabelledBy: "SF4Label",
				search: onSearch,
				liveChange: onLiveChange
			}),
			new Label("SF5Label", {
				text: "SF5"
			}),
			new SearchField("SF5", {
				placeholder: "width=50%", width: "50%", ariaLabelledBy: "SF5Label", search: onSearch, liveChange: onLiveChange
			}),
			new Label("SF6Label", {
				text: "SF6"
			}),
			new SearchField("SF6", { // remove default placeholder
				placeholder: "", ariaLabelledBy: "SF6Label", search: onSearch, liveChange: onLiveChange
			}),
			new Label("SF7Label", {
				text: "SF7"
			}),
			new SearchField("SF7", { // showSearchButton = false
				placeholder: "Without search button", ariaLabelledBy: "SF7Label", showSearchButton: false, search: onSearch, liveChange: onLiveChange
			}),
			new Label("SF8Label", {
				text: "SF8 custom aria-description"
			}),
			new SearchField("SF8", {
				ariaLabelledBy: "SF8Label", ariaDescribedBy: ["SF_AD"]
			}),
			new Button("openDialog", {
				text: "Open a Dialog",
				press : function() {
					oDialog.open();
				}
			}),
			new SearchField("SF9", {
				width: "100px",
				placeholder: "Please enter city"
			}),
			new SearchField("SF10", {
				width: "100px",
				value: "Abcdefgh"
			})
		]
	});

	var page2 = new Page("searchPage2", {
		title:"Search Field: Page 2",
		enableScrolling: false,
		customHeader: new Bar({
			enableFlexBox: false,
			contentRight: [
				new Button({
					text : "To Page 1",
					press : function() { app.back(); }
				})
			],
			contentLeft: [
				new SearchField( "SFB12", {
					placeholder: "Search",
					search: onSearch,
					layoutData: new FlexItemData({growFactor: 1})
				})
			]
		}),
		subHeader: new Bar({
			contentMiddle: [
				new SearchField( "SFB22", {
					placeholder: "Search",
					search: onSearch,
					width: "100%"
				})
			]
		}),
		content : [
			new SearchField("SF12", {
				placeholder: "Search", search: onSearch, liveChange: onLiveChange
			}),
			new SearchField("SF22", {
				placeholder: "Search", search: onSearch, liveChange: onLiveChange
			})
		]
	});

	page.addStyleClass("customPadding");
	page2.addStyleClass("customPadding");
	app.addPage(page).addPage(page2).placeAt("body");
});
