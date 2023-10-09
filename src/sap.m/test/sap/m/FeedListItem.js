sap.ui.define([
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/FeedListItemAction",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Bar",
	"sap/m/Popover",
	"sap/m/FeedListItem",
	"sap/ui/core/IconPool",
	"sap/m/MessageToast",
	"sap/m/App",
	"sap/m/Page",
	"sap/base/Log",
	"sap/ui/core/Core"
], function(
	List,
	StandardListItem,
	FeedListItemAction,
	JSONModel,
	Button,
	mobileLibrary,
	Bar,
	Popover,
	FeedListItem,
	IconPool,
	MessageToast,
	App,
	Page,
	Log,
	Core
) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// shortcut for sap.m.LinkConversion
	var LinkConversion = mobileLibrary.LinkConversion;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	var oList2 = new List({
		inset: true
	});

	var data = {
		navigation: [{
			title: "Travel Expend",
			description: "Access the travel expend workflow",
			icon: "images/travel_expend.png",
			iconInset: false,
			type: "Active",
			press: 'detailPage'
		}, {
			title: "Travel and expense report",
			description: "Access travel and expense reports",
			icon: "images/travel_expense_report.png",
			iconInset: false,
			type: "Detail",
			press: 'detailPage'
		}, {
			title: "Travel Request",
			description: "Access the travel request workflow",
			icon: "images/travel_request.png",
			iconInset: false,
			type: "DetailAndActive",
			press: 'detailPage'
		}, {
			title: "Work Accidents",
			description: "Report your work accidents",
			icon: "images/wounds_doc.png",
			iconInset: false,
			type: "Inactive",
			press: 'detailPage'
		}, {
			title: "Travel Settings",
			description: "Change your travel worflow settings",
			icon: "images/settings.png",
			iconInset: false,
			type: "Navigation",
			press: 'detailPage'
		}]
	};

	var oItemTemplate1 = new StandardListItem({
		title: "{title}",
		description: "{description}",
		icon: "{icon}",
		iconInset: "{iconInset}",
		type: "{type}"
	});

	var oActionTemplate = new FeedListItemAction({
		icon: "{icon}",
		text: "{text}"
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

	bindListData(data, oItemTemplate1, oList2);

	var oLeftButton = new Button({
		text: "Modal",
		type: ButtonType.Reject,
		press: function() {
			oPopover.setModal(!oPopover.getModal());
		}
	});

	var oRightButton = new Button({
		text: "Close",
		type: ButtonType.Accept,
		press: function() {
			oPopover.close();
		}
	});

	var footer = new Bar({
		contentLeft: [],
		contentMiddle: [new Button({icon: "images/favorite@2x.png"}),
			new Button({icon: "images/feed@2x.png"}),
			new Button({icon: "images/flag@2x.png"})],
		contentRight: []
	});

	var oPopover = new Popover({
		placement: PlacementType.Auto,
		title: "Popover",
		showHeader: true,
		beginButton: oLeftButton,
		endButton: oRightButton,
		beforeOpen: function(oEvent) {
			Log.info("before popover opens!!!");
		},
		afterOpen: function(oEvent) {
			Log.info("popover is opened finally!!!");
		},
		beforeClose: function(oEvent) {
			Log.info("before popover closes!!!");
		},
		afterClose: function(oEvent) {
			Log.info("popover is closed properly!!!");
		},
		footer: footer,
		content: [
			oList2
		]
	});

	var oFeedList = new List("oFeedItemList", {
		mode: "SingleSelectMaster"
		//showSeparators: "None",
	});


	var fnOpenPopup = function(oControlEvent) {
		oPopover.openBy(oControlEvent.getParameter("getDomRef")());
	};


	var oFeedListItemTemplate = new FeedListItem({
		type: "{type}",
		icon: "{icon}",
		activeIcon: "{activeIcon}",
		text: "{text}",
		sender: "{sender}",
		showIcon: "{showIcon}",
		senderActive: "{senderActive}",
		iconActive: "{iconActive}",
		info: "{info}",
		timestamp: "{timestamp}",
		maxCharacters: 100,
		senderPress: fnOpenPopup,
		iconPress: fnOpenPopup,
		convertLinksToAnchorTags: LinkConversion.All,
		actions: {
			path: "/actions",
			template: oActionTemplate,
			templateShareable : false
		}
	});

	function bindFeedListData(data, itemTemplate, list) {
		var oModel = new JSONModel();
		// set the data for the model
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// bind Aggregation
		list.bindAggregation("items", "/chunks", itemTemplate);
	}

	var sURI = IconPool.getIconURI("personnel-view");
	var feedData = {
		chunks: [{
			icon: "images/Woman_04.png",
			text: 'Automatically recognized link: www.sap.com - links open in a new window',
			sender: "Jeremy Dash",
			senderActive: true,
			iconActive: true,
			timestamp: "March 03, 2013",
			info: "Approved",
			type: ListType.Active
		}, {
			icon: "images/Woman_04.png",
			text: '<h3>subheader</h3>     <p>link: <a href="//www.sap.com">link to sap.com</a> - links open in a new window.</p> <p> Automatically recognized link: www.sap.com - links open in a new window.</p>     <p>paragraph: <strong>strong</strong> and <em>emphasized</em>.</p>     <p>list:</p>     <ul><li>list item 1</li><li>list item 2<ul><li>sub item 1</li><li>sub item 2</li></ul></li></ul>     <p>pre:</p><pre>abc    def    ghi</pre>     <p>code: <code>var el = document.getElementById("myId");</code></p>     <p>cite: <cite>a reference to a source</cite></p>     <dl><dt>definition:</dt><dd>definition list of terms and descriptions</dd></dl>',
			sender: "Jeremy Dash",
			senderActive: true,
			iconActive: true,
			timestamp: "March 03, 2013",
			info: "Approved",
			type: ListType.Active
		}, {
			icon: sURI,
			text: "This FeedListItem displays an ImagePool image and it is clickable. <strong>Strong Text</strong> and another one <em>Italic text</em> metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. ",
			sender: "Christopher Kent",
			senderActive: true,
			iconActive: true,
			timestamp: "Dec 04, 2012",
			info: "Rejected",
			type: ListType.Detail
		}, {
			icon: "images/female.jpg",
			text: "This <em>FeedListItem</em> comes with <strong>senderActive</strong> = false and iconActive = false and it is not clickable. In hac habitasse <a href='//www.sap.com'>link</a> platea dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante.",
			sender: "Claire Jones",
			senderActive: false,
			iconActive: false,
			timestamp: "Dec 02, 2012",
			info: "Waiting for Approval",
			type: ListType.DetailAndActive
		}, {
			text: "This <a href='//www.sap.com'>FeedListItem</a> comes without an image, it is not clickable and has a very long info text",
			sender: "Christine Noah",
			senderActive: true,
			iconActive: false,
			timestamp: "Nov 23, 2012",
			info: "Waiting for Approval and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting and waiting",
			type: ListType.Inactive
		}, {
			icon: "images/male.jpg",
			activeIcon: "images/female.jpg",
			text: "This one has no date and it is not clickable",
			sender: "Frank Black",
			senderActive: true,
			iconActive: false,
			info: "New",
			type: ListType.Navigation
		}, {
			text: "This one shows the default image and it is clickable",
			sender: "Frank Black"
		}, {
			text: "And this one does without info",
			sender: "Kurt Nistroy",
			senderActive: true,
			iconActive: true,
			timestamp: "Nov 01, 2012"
		}, {
			text: "OPEN (No decision yet)",
			sender: "Kurt Nistroy",
			senderActive: true,
			iconActive: true
		}, {
			text: "This one has no timestamp and no icon",
			info: "Approved",
			sender: "Kurt Nistroy",
			showIcon: false
		}, {
			text: "This one has no sender and no icon",
			info: "Approved",
			timestamp: "Nov 01, 2012",
			showIcon: false
		}, {
			text: "This one has a timestamp starting with a number",
			info: "Approved",
			timestamp: "1.12.2012",
			showIcon: false
		}, {
			text: "This one has no sender but active/inactve icons (check out the icon's color, when you press this item)",
			icon: "images/action.png",
			activeIcon: "images/action_pressed.png",
			senderActive: true,
			iconActive: true,
			timestamp: "Nov 01, 2012"
		}, {
			sender: "Frank Black",
			text: "This FeedListItem has an image but showIcon is set to false so it should not be displayed",
			icon: "images/action.png",
			showIcon: false,
			senderActive: true,
			iconActive: true,
			timestamp: "Nov 01, 2012"
		}, {
			icon: "images/male.jpg",
			text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea dictumst. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea dictumst. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea dictumst. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea dictumst. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea dictumst. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea dictumst. This is a very long URL: http://this.is.some.very.long.url.sap.com/lorem/ipsum/dolor/sit/amet/consectetur/adipiscing/elit/lorem/ipsum/dolor/sit/amet/consectetur/adipiscing/elit/lorem/ipsum/dolor/sit/amet/consectetur/adipiscing/elit/lorem/ipsum/dolor/sit/amet/consectetur/adipiscing/elit/lorem/ipsum/dolor/sit/amet/consectetur/adipiscing/elit#LoremIpsumDolorSitAmetConsecteturAdipiscingElitLoremIpsumDolorSitAmetConsecteturAdipiscingElitLoremIpsumDolorSitAmetConsecteturAdipiscingElit Quisque ut ipsum est.",
			sender: "Jeremy has a really long long long middle-name Dash",
			senderActive: true,
			iconActive: true,
			timestamp: "March 03, 2013 March 03, 2013 March 03, 2013 March 03, 2013 March 03, 2013 March 03, 2013 March 03, 2013 March 03, 2013 March 03, 2013",
			info: "Approved Approved Approved Approved Approved Approved Approved Approved Approved Approved Approved Approved Approved Approved "
		}],
		actions: [
			{
				icon: "sap-icon://accept",
				text: "Accept"
			},
			{
				icon: "sap-icon://decline",
				text: "Reject"
			}
		]
	};

	bindFeedListData(feedData, oFeedListItemTemplate, oFeedList);

	var oRerenderButton = new Button({
		text: "Invalidate / Rerender",
		press: function(oEvent) {
			MessageToast.show("Rerender triggered.");
			Core.byId("feedListPage").invalidate();
		}
	});

	var appFeedList = new App("myApp", {
		initialPage: "feedListPage"
	});

	var feedListPage = new Page("feedListPage", {
		title: "Feed List Item Test Page",
		content: [oRerenderButton, oFeedList]
	});

	appFeedList.addPage(feedListPage);
	appFeedList.placeAt("content");
});
