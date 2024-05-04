sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/TileContent",
	"sap/m/FeedContent",
	"sap/m/GenericTile",
	"sap/m/MessageToast",
	"sap/m/library",
	"sap/m/ActionSheet",
	"sap/m/Button",
	"sap/m/SlideTile",
	"sap/m/NewsContent",
	"sap/m/Label",
	"sap/ui/layout/Grid",
	"sap/m/Page",
	"sap/m/Input",
	"sap/ui/model/type/Integer",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Title",
	"sap/m/App",
	"sap/ui/util/Mobile"
], function(
	JSONModel,
	TileContent,
	FeedContent,
	GenericTile,
	MessageToast,
	mobileLibrary,
	ActionSheet,
	Button,
	SlideTile,
	NewsContent,
	Label,
	Grid,
	Page,
	Input,
	Integer,
	Select,
	Item,
	SimpleForm,
	Title,
	App,
	Mobile
) {
	"use strict";

	// shortcut for sap.m.GenericTileScope
	var GenericTileScope = mobileLibrary.GenericTileScope;

	function setBackgroundColor(oAnyObject) {
		var oColors = {
			white : "#FFFFFF",
			black : "#000000",
			blue : "#6666FF",
			red : "#FF6666",
			green : "#66FF66"
		};
		var sParam = new URLSearchParams(window.location.search).get("sap-ui-suite-background-color");
		if (sParam) {
			var sColor = oColors[sParam.toLowerCase()];
			if (sColor) {
				oAnyObject.addDelegate({
					onAfterRendering : function() {
						oAnyObject.$().css("background-color", sColor);
					}
				});
			}
		}
	}

	Mobile.init();

	var oSlideTileData = {
		displayTime : 5000,
		transitionTime : 500,
		feedTiles : [{
			headerImage : "images/headerImg2.jpg",
			imageDescription : "portrait of the unknown person",
			header : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit",
			frameType : "TwoByOne",
			message : "Feed Tile 1",
			tileContent : [{
				contentText : "@@notify Great outcome of the Presentation today.",
				footer : "New Notifications",
				subheader : "about 1 minute ago in Computer Market",
				value : "9"
			}]
		}, {
			header : "Guy Incognito mentioned you in Sales Pitch March Lorem ipsum dolores.",
			frameType : "TwoByOne",
			state : "Loading",
			tileContent : [{
				contentText : "@@notify Great outcome of the Presentation today.",
				footer : "New Notifications",
				subheader : "about 1 minute ago in Computer Cluster",
				value : "9999"
			}]
		}],
		newsTiles : [{
			frameType : "TwoByOne",
			message : "News Tile 1",
			backgroundImage : "images/NewsImage1.png",
			tileContent : [{
				footer : "August 21, 2013",
				contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
				subheader : "SAP News"
			}]
		}, {
			frameType : "TwoByOne",
			message : "News Tile 2",
			backgroundImage : "images/NewsImage5.png",
			tileContent : [{
				footer : "August 22, 2013",
				contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
				subheader : "SAP News"
			}]
		}, {
			frameType : "TwoByOne",
			backgroundImage : "images/NewsImage3.png",
			state : "Failed",
			failedText : "Loading of relevant tile failed...",
			tileContent : [{
				footer : "August 21, 2013",
				contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
				subheader : "SAP News"
			}]
		}],
		oneTile : [{
			frameType : "TwoByOne",
			backgroundImage : "images/NewsImage5.png",
			message : "News Tile",
			tileContent : [{
				footer : "August 21, 2013",
				contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
				subheader : "SAP News"
			}]
		}]
	};

	var oSlideTileModel = new JSONModel(oSlideTileData);

	var oFeedTileContent = new TileContent({
		footer : "{footer}",
		content : new FeedContent({
			contentText : "{contentText}",
			subheader : "{subheader}",
			value : "{value}"
		})
	});

	var fnGetGTFactory = function(oTileContent) {
		var fnGenericTileFactory = function(sId, oContext) {
			var oGenericTile = new GenericTile({
				headerImage : "{headerImage}",
				frameType : "{frameType}",
				header : "{header}",
				state : "{state}",
				failedText : "{failedText}",
				backgroundImage : "{backgroundImage}",
				tileContent : {
					template : oTileContent,
					path : "tileContent"
				}
			});

			var sMsg = oContext.getProperty("message");
			if (sMsg) {
				oGenericTile.attachPress(function(oEvent) {
					MessageToast.show(sMsg + " was pressed.");
				});
			}
			return oGenericTile;
		};
		return fnGenericTileFactory;
	};

	var handleActionsPress = function(oEvent) {
		if (oEvent.getSource().getScope() === GenericTileScope.Actions &&
			oEvent.getParameter("action") === "Press") {
			var oActionSheet = new ActionSheet({
				title : "Choose Your Action",
				showCancelButton : true,
				placement : "Bottom",
				buttons : [
					new Button({
						text : "Move"
					}),
					new Button({
						text : "Whatever"
					})
				],
				afterClose : function () {
					oActionSheet.destroy();
				}
			});
			oActionSheet.openBy(oEvent.getParameter("domRef"));
		} else {
			MessageToast.show("Press event from SlideTile in " + oEvent.getParameter("scope") + " scope with parameter " + oEvent.getParameter("action"));
		}
	};

	var oFeedSlideTile = new SlideTile("st-feed", {
		displayTime : "{/displayTime}",
		transitionTime : "{/transitionTime}",
		scope: "{/scope}",
		tiles : {
			factory : fnGetGTFactory(oFeedTileContent),
			path : "/feedTiles"
		},
		press: handleActionsPress
	}).addStyleClass("sapUiTinyMarginTop");

	var oNewsTileContent = new TileContent({
		footer : "{footer}",
		content : new NewsContent({
			contentText : "{contentText}",
			subheader : "{subheader}"
		})
	});

	var oNewsSlideTile = new SlideTile("st-news", {
		displayTime : "{/displayTime}",
		transitionTime : "{/transitionTime}",
		scope: "{/scope}",
		tiles : {
			factory : fnGetGTFactory(oNewsTileContent),
			path : "/newsTiles"
		},
		press: handleActionsPress
	}).addStyleClass("sapUiTinyMarginTop");

	var oOneSlideTile = new SlideTile("st-one", {
		displayTime : "{/displayTime}",
		transitionTime : "{/transitionTime}",
		scope: "{/scope}",
		tiles : {
			factory : fnGetGTFactory(oNewsTileContent),
			path : "/oneTile"
		},
		press: handleActionsPress
	}).addStyleClass("sapUiTinyMarginTop");

	var oTileNoContent = new SlideTile("st-noContent");


	var oNewsSTLbl = new Label({
		text : "Example with news content",
		labelFor : "st-news"
	});

	var oFeedSTLbl = new Label({
		text : "Example with feed content",
		labelFor : "st-feed"
	});

	var oOneSTLbl = new Label({
		text : "Example with one tile",
		labelFor : "st-one"
	});

	var oTileNoContLbl = new Label({
		text : "Example without content",
		labelFor : "st-noContent"
	});
	var oDcContentForm = new Grid("st-content-form", {
		defaultSpan : "XL4 L4 M6 S12",
		content : [oNewsSTLbl, oNewsSlideTile, oOneSTLbl, oOneSlideTile, oFeedSTLbl, oFeedSlideTile, oTileNoContLbl, oTileNoContent]
	});

	var oPage = new Page("initial-page", {
		showHeader : false,
		content : [oDcContentForm]
	}).setModel(oSlideTileModel);

	var oDTLbl = new Label({
		text : "Display Time",
		labelFor : "display-time-value"
	});

	var oDTInput = new Input("display-time-value", {
		value : {
			path : "/displayTime",
			type : new Integer()
		},
		placeholder : 'Enter value ...'
	});

	var oTTLbl = new Label({
		text : "Transition Time",
		labelFor : "transition-time-value"
	});

	var oTTInput = new Input("transition-time-value", {
		value : {
			path : "/transitionTime",
			type : new Integer()
		},
		placeholder : 'Enter value ...'
	});

	var oScopeLabel = new Label({
		text : "Scope",
		labelFor : "scope"
	});

	var oScopeSelect = new Select("scope", {
		items : [new Item({
			key : "Display",
			text : GenericTileScope.Display
		}), new Item({
			key : "Actions",
			text : GenericTileScope.Actions
		})],
		selectedKey: "{/scope}"
	});

	var editableSimpleForm = new SimpleForm("controls", {
		maxContainerCols : 2,
		editable : true,
		content : [new Title({
			text : "Modify Tiles Appearing"
		}), oDTLbl, oDTInput, oTTLbl, oTTInput, oScopeLabel, oScopeSelect]
	});

	oPage.addContent(editableSimpleForm);
	var oApp = new App("myApp", {
		initialPage : "initial-page"
	});
	oApp.addPage(oPage).placeAt("content");

	setBackgroundColor(oDcContentForm);
});
