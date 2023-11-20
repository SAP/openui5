sap.ui.define([
	"sap/m/App",
	"sap/ui/core/InvisibleText",
	"sap/m/ToggleButton",
	"sap/m/Bar",
	"sap/m/SearchField",
	"sap/m/Page",
	"sap/base/Log",
	"sap/ui/Device"
], function(
	App,
	InvisibleText,
	ToggleButton,
	Bar,
	SearchField,
	Page,
	Log,
	Device
) {
	"use strict";

	var app = new App("searchApp", {initialPage:"searchPage"});

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

	var page = new Page("searchPage", {
		enableScrolling: true,
		title:"Mobile Search Field Control",
		customHeader: new Bar("P1Header", {
			enableFlexBox: false,
			contentRight: oToggleBtnCompact
		}),
		content : [
			new SearchField("SF1", {
				placeholder: "Search",
				search: onSearch
			}),
			new SearchField("SF2", {
				showRefreshButton: true,
				value: "selectOnFocus:false",
				placeholder: "selectOnFocus:false..",
				selectOnFocus: false,
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
			new SearchField("SF3", {
				placeholder: "disabled",
				value: "disabled",
				enabled: false,
				showRefreshButton: true,
				search: onSearch,
				liveChange: onLiveChange
			}),
			new SearchField("SF4", {
				placeholder: "maxLength=5",
				maxLength: 5,
				search: onSearch,
				liveChange: onLiveChange
			}),
			new SearchField("SF5", {
				placeholder: "width=50%", width: "50%", search: onSearch, liveChange: onLiveChange
			}),
			new SearchField("SF6", { // remove default placeholder
				placeholder: "", search: onSearch, liveChange: onLiveChange
			}),
			new SearchField("SF7", { // showSearchButton = false
				placeholder: "Without search button", showSearchButton: false, search: onSearch, liveChange: onLiveChange
			})
		]
	});

	page.addStyleClass("customPadding");
	app.addPage(page).placeAt("body");
});
