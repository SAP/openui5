sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageItem",
  "sap/m/MessageView",
  "sap/m/Button",
  "sap/ui/core/IconPool",
  "sap/m/Dialog",
  "sap/m/Page",
  "sap/m/library",
  "sap/m/MessagePopover",
  "sap/m/Popover",
  "sap/m/Bar",
  "sap/m/Text",
  "sap/m/OverflowToolbarLayoutData",
  "sap/m/Toolbar",
  "sap/m/ToolbarSpacer",
  "sap/m/CheckBox",
  "sap/m/OverflowToolbar",
  "sap/m/SplitApp",
  "sap/ui/thirdparty/jquery"
], function(
  JSONModel,
  MessageItem,
  MessageView,
  Button,
  IconPool,
  Dialog,
  Page,
  mobileLibrary,
  MessagePopover,
  Popover,
  Bar,
  Text,
  OverflowToolbarLayoutData,
  Toolbar,
  ToolbarSpacer,
  CheckBox,
  OverflowToolbar,
  SplitApp,
  jQuery
) {
  "use strict";

  // shortcut for sap.m.PlacementType
  const PlacementType = mobileLibrary.PlacementType;

  // shortcut for sap.m.ButtonType
  const ButtonType = mobileLibrary.ButtonType;

  // Note: the HTML page 'MessageView.html' loads this module via data-sap-ui-on-init

  var mockMarkupDescription = "<h2>Heading h2</h2><script>alert('this JS will be sanitized')<\/script>" +
		  "<p>Paragraph. At vero eos et accusamus et iusto odio dignissimos ducimus qui ...</p>" +
		  "<ul>" +
		  "	<li>Unordered list item 1 <a href=\"http://sap.com/some/url\">Absolute URL</a></li>" +
		  "	<li>Unordered list item 2</li>" +
		  "</ul>" +
		  "<ol>" +
		  "	<li>Ordered list item 1 <a href=\"/testsuite/test-resources/sap/m/MessageView.html?this_should_be_opened_in_new_page\">Relative URL</a></li>" +
		  "	<li>Ordered list item 2</li>" +
		  "</ol>";

  var aMockMessages = {
	  count: 6,
	  messages: [{
		  type: "Error",
		  title: "Error message",
		  description: "First Error message description",
		  active: true
	  }, {
		  type: "Warning",
		  title: "Warning without description",
		  description: ""
	  }, {
		  type: "Success",
		  title: "Success message",
		  description: "First Success message description"
	  }, {
		  type: "Error",
		  title: "Error",
		  description: "Second Error message description"
	  }, {
		  type: "Information",
		  title: "Information message (Long)",
		  description: mockMarkupDescription,
		  markupDescription: true
	  }, {
		  type: "Information",
		  title: "Information message (Long) 2",
		  description: "Just some text description",
		  longtextUrl: "./SampleHTML.html",
		  active: true
	  }, {
		  type: "Information",
		  title: "Information message (Long Title) - Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmodtempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodoconsequat.",
		  description: "Just some text description",
		  longtextUrl: "./SampleHTML.html",
		  active: true
	  }],
	  reducedSet: [{
		  type: "Error",
		  title: "Error message",
		  description: "First Error message description"
	  }],
	  singleTypeSet: [{
		  type: "Error",
		  title: "Error Message 1",
		  description: "First Error message description"

	  }, {
		  type: "Error",
		  title: "Error Message 2",
		  description: "Second Error message description"
	  }, {
		  type: "Error",
		  title: "Error Message 3",
		  description: "Third Error message description"
	  }],
	  messages2: [
		  {
			  type: 'Error',
			  title: 'Product SZ_FT01 already assigned to distribution center 1015',
			  description: '',
			  subtitle: 'Example of subtitle',
			  counter: 1
		  }, {
			  type: 'Error',
			  title: 'Product AG_CZ_1 already assigned to distribution center 1015',
			  description: '',
			  subtitle: 'Example of subtitle',
			  counter: 1
		  }
	  ]
  };

  var oModel = new JSONModel();
  oModel.setData(aMockMessages);

  var oMessageTemplate = new MessageItem({
	  type: "{type}",
	  title: "{title}",
	  description: "{description}",
	  longtextUrl: "{longtextUrl}",
	  markupDescription: "{markupDescription}",
	  activeTitle: "{active}"
  });

  var oMessageViewDialog = new MessageView("mMView1", {
	  items: {
		  path: "/messages",
		  template: oMessageTemplate
	  },
	  asyncURLHandler: function (config) {
		  // put async validation here
		  setTimeout(function () {
			  console.log('validate this url', config.url);

			  // simulated answer from URL validator service: relative URLs are fine
			  var allowed = config.url.lastIndexOf("http", 0) < 0;

			  config.promise.resolve({
				  allowed: allowed,
				  id: config.id
			  });

		  }, 1000 + 4000 * Math.random());
	  }
  });

  var oMessageViewDialog2 = new MessageView("mMViewDialog", {
	  items: {
		  path: "/messages2",
		  template: oMessageTemplate
	  }
  });

  var oMessageViewPage = new MessageView("mMView2", {
	  activeTitlePress: function () {
		  alert('navigate');
	  },
	  items: {
		  path: "/messages",
		  template: oMessageTemplate
	  },
	  asyncURLHandler: function (config) {
		  // put async validation here
		  setTimeout(function () {
			  console.log('validate this url', config.url);

			  // simulated answer from URL validator service: relative URLs are fine
			  var allowed = config.url.lastIndexOf("http", 0) < 0;

			  config.promise.resolve({
				  allowed: allowed,
				  id: config.id
			  });

		  }, 1000 + 4000 * Math.random());
	  }
  });

  var oMessageViewPopover = new MessageView("mMView3", {
	  items: {
		  path: "/messages",
		  template: oMessageTemplate
	  },
	  asyncURLHandler: function (config) {
		  // put async validation here
		  setTimeout(function () {
			  console.log('validate this url', config.url);

			  // simulated answer from URL validator service: relative URLs are fine
			  var allowed = config.url.lastIndexOf("http", 0) < 0;

			  config.promise.resolve({
				  allowed: allowed,
				  id: config.id
			  });

		  }, 1000 + 4000 * Math.random());
	  }
  });

  var oMessageViewPopoverWithOneItem = new MessageView("mMView4", {
	  items: {
		  path: "/reducedSet",
		  template: oMessageTemplate
	  }
  });

  var oMessageViewDialogWithOneHeader = new MessageView("mMView5", {
	  showDetailsPageHeader: false,
	  itemSelect: function () {
		  _oBackButton.setVisible(true);
	  },
	  items: [
		  new MessageItem("mv-item1", {
			  type: "Error",
			  title: "Error message",
			  description: "First Error message description"
		  })]
  });

  var oMessageViewPopoverWithOneItemType = new MessageView("mMView6", {
	  items: {
		  path: "/singleTypeSet",
		  template: oMessageTemplate
	  }
  });

  var _oBackButton = new Button("mMView5-back", {
	  icon: IconPool.getIconURI("nav-back"),
	  visible: false,
	  press: function () {
		  oMessageViewDialogWithOneHeader.navigateBack();
		  this.setVisible(false);
	  }
  });

  var oMessageViewWithHeader = new MessageView("mMView7", {
	  items: {
		  path: "/singleTypeSet",
		  template: oMessageTemplate
	  },
	  headerButton: new Button("CloseButton2", {

		  text: "Close"
	  }),
  });

  // Dialog will have no padding because of compatVersion setting on main script
  var oDialog1 = new Dialog({
	  content: oMessageViewDialog,
	  showHeader: false,
	  beginButton: new Button("dialogCloseButton", {
		  press: function () {
			  oDialog1.close();
		  },
		  text: "Close"
	  }),
	  contentHeight: "440px",
	  contentWidth: "640px",
	  verticalScrolling: false
  });

  var oDialog2 = new Dialog({
	  type: "Message",
	  content: oMessageViewDialog2,
	  showHeader: true,
	  beginButton: new Button("dialogCloseButton2", {
		  press: function () {
			  oDialog2.close();
		  },
		  text: "Close"
	  }),
	  horizontalScrolling: false,
	  contentHeight: "440px",
	  contentWidth: "440px",
	  verticalScrolling: false
  }).addStyleClass("sapUiNoContentPadding");

  var page1 = new Page("page1", {
	  content: [
		  new Button('mView-in-dialog-btn', {
			  text: "MessageView in Dialog",
			  press: function () {
				  oDialog1.open();
			  }
		  }),
		  new Button('mView-in-dialog-btn-2', {
			  text: "MV in Dialog with hidden details header",
			  press: function () {
				  oDialogWithOneHeader.open();
			  }
		  }),

		  new Button("mViewButton4", {
			  icon: IconPool.getIconURI("add"),
			  text: "Add Warning",
			  type: ButtonType.Emphasized,
			  press: function () {
				  var oWarn = new MessageItem("mi-item1", {
					  type: "Warning",
					  title: "Warning message",
					  description: "Added Warning message description"
				  });
				  oMessageViewPopoverWithOneItemType.addItem(oWarn);
			  }
		  }),

		  new Button("mViewButton5", {
			  icon: IconPool.getIconURI("delete"),
			  text: " Remove Close button",
			  type: ButtonType.Emphasized,
			  press: function () {
				  oMessageViewWithHeader.destroyHeaderButton();
			  }
		  }),

		  new Button('mView-in-dialog-btn-3', {
			  text: "MV in Dialog with truncatable items",
			  press: function () {
				  oDialog2.open();
			  }
		  }),
	  ]
  });

  page1.addDependent(oDialog1);
  page1.addDependent(oDialog2);
  page1.addDependent(oDialogWithOneHeader);
  page1.addDependent(oMessageViewWithHeader);
  page1.addDependent(oMessageViewPopoverWithOneItemType);

  var headerButton = new Button({text: "Clear"});

  //list.bindAggregation("items", "/", oMessageTemplate);
  var oMessagePopover = new MessagePopover("mPopover", {
	  items: {
		  path: "/messages",
		  template: oMessageTemplate
	  },
	  headerButton: headerButton,
	  asyncURLHandler: function (config) {
		  // put async validation here
		  setTimeout(function () {
			  console.log('validate this url', config.url);

			  // simulated answer from URL validator service: relative URLs are fine
			  var allowed = config.url.lastIndexOf("http", 0) < 0;

			  config.promise.resolve({
				  allowed: allowed,
				  id: config.id
			  });

		  }, 1000 + 4000 * Math.random());
	  }
  });

  var oPopover = new Popover("pop1", {
	  placement: PlacementType.Top,
	  title: "Popover with MessageView",
	  showHeader: true,
	  contentWidth: "440px",
	  contentHeight: "440px",
	  verticalScrolling: false,
	  content: [
		  oMessageViewPopover
	  ]
  });

  var oPopoverWithOneItem = new Popover("pop2", {
	  placement: PlacementType.Top,
	  title: "Popover with MessageView",
	  showHeader: true,
	  endButton: new Button("closeBtn", {
		  text: "Close",
		  press: function () {
			  oPopoverWithOneItem.close();
		  }
	  }),
	  modal: true,
	  contentWidth: "440px",
	  contentHeight: "440px",
	  verticalScrolling: false,
	  content: [
		  oMessageViewPopoverWithOneItem
	  ]
  });

  var oPopoverWithOneItemType = new Popover("pop3", {
	  placement: PlacementType.Top,
	  title: "Popover with MessageView",
	  showHeader: true,
	  endButton: new Button("customClose", {
		  text: "Close",
		  press: function () {
			  oPopoverWithOneItemType.close();
		  }
	  }),
	  modal: false,
	  contentWidth: "440px",
	  contentHeight: "440px",
	  verticalScrolling: false,
	  content: [
		  oMessageViewPopoverWithOneItemType
	  ]
  });

  var oPopoverWithHeader = new Popover("pop4", {
	  placement: PlacementType.Top,
	  title: "Popover with MessageView",
	  showHeader: true,
	  modal: false,
	  contentWidth: "440px",
	  contentHeight: "440px",
	  verticalScrolling: false,
	  content: [
		  oMessageViewWithHeader
	  ]
  });

  var oCollapsedPopover = new MessagePopover("mPop", {
	  initiallyExpanded: false,
	  items: [new MessageItem({
		  type: "Error",
		  title: "Error Message 1",
		  description: "First Error message description"

	  }), new MessageItem({
		  type: "Error",
		  title: "Error Message 2",
		  description: "Second Error message description"
	  }), new MessageItem({
		  type: "Error",
		  title: "Error Message 3",
		  description: "Third Error message description"
	  })]
  });

  var oDialogWithOneHeader = new Dialog("dialog2", {
	  title: "Dialog with MessageView",
	  content: oMessageViewDialogWithOneHeader,
	  resizable: true,
	  state: 'Error',
	  beginButton: new Button("dialogWOneHeader-close-btn", {
		  press: function () {
			  oDialogWithOneHeader.close();
		  },
		  text: "Close"
	  }),
	  customHeader: new Bar({
		  contentMiddle: [
			  new Text({text: "Error"})
		  ],
		  contentLeft: [_oBackButton]
	  }),
	  contentHeight: "300px",
	  contentWidth: "500px",
	  verticalScrolling: false
  });

  var oMessagePopoverButton = new Button("mPopoverButton", {
	  icon: IconPool.getIconURI("message-popup"),
	  text: "MessagePopover",
	  layoutData: [new OverflowToolbarLayoutData({
		  closeOverflowOnInteraction: false,
	  })],
	  type: ButtonType.Emphasized,
	  press: function () {
		  oMessagePopover.toggle(this);
	  }
  });

  var oMessageViewPopoverButton = new Button("mViewButton", {
	  icon: IconPool.getIconURI("message-popup"),
	  text: "MV in Popover",
	  layoutData: [new OverflowToolbarLayoutData({
		  closeOverflowOnInteraction: false,
	  })],
	  type: ButtonType.Emphasized,
	  press: function () {
		  oPopover.openBy(this);
	  }
  });

  var oMessageViewPopoverButton2 = new Button("mViewButton2", {
	  icon: IconPool.getIconURI("message-popup"),
	  text: "MV - one item",
	  layoutData: [new OverflowToolbarLayoutData({
		  closeOverflowOnInteraction: false,
	  })],
	  type: ButtonType.Emphasized,
	  press: function () {
		  oPopoverWithOneItem.openBy(this);
	  }
  });

  var oMessageViewPopoverButton3 = new Button("mViewButton3", {
	  icon: IconPool.getIconURI("message-popup"),
	  text: "MV - one type",
	  layoutData: [new OverflowToolbarLayoutData({
		  closeOverflowOnInteraction: false,
	  })],
	  type: ButtonType.Emphasized,
	  press: function () {
		  oPopoverWithOneItemType.openBy(this);
	  }
  });

  var oMessageViewPopoverButton4 = new Button("mViewButton6", {
	  icon: IconPool.getIconURI("message-popup"),
	  text: "Custom button MV",
	  type: ButtonType.Emphasized,
	  layoutData: [new OverflowToolbarLayoutData({
		  closeOverflowOnInteraction: false,
	  })],
	  press: function () {
		  oPopoverWithHeader.openBy(this);
	  }
  });

  var oMessageViewPopoverButton5 = new Button("mViewButton7", {
	  icon: IconPool.getIconURI("message-popup"),
	  text: "Collapsed MP",
	  type: ButtonType.Emphasized,
	  layoutData: [new OverflowToolbarLayoutData({
		  closeOverflowOnInteraction: false,
	  })],
	  press: function () {
		  oCollapsedPopover.openBy(this);
	  }
  });

  oMessagePopoverButton.addDependent(oMessagePopover);
  oMessageViewPopoverButton.addDependent(oPopover);
  oMessageViewPopoverButton2.addDependent(oPopoverWithOneItem);
  oMessageViewPopoverButton3.addDependent(oPopoverWithOneItemType);
  oMessageViewPopoverButton4.addDependent(oPopoverWithHeader);
  oMessageViewPopoverButton4.addDependent(oCollapsedPopover);


  var page2 = new Page("page2", {
	  headerContent: new Toolbar({
		  content: [
			  new ToolbarSpacer(),
			  new CheckBox("compactMode", {
				  selected: false,
				  text: "Compact mode",
				  select: function () {
					  jQuery("body").toggleClass("sapUiSizeCompact");
				  }
			  })]
	  }),
	  content: [
		  oMessageViewPage
	  ],
	  footer: new OverflowToolbar({
		  id: "overflow-tb",
		  content: [
			  new ToolbarSpacer(),
			  oMessagePopoverButton,
			  oMessageViewPopoverButton,
			  oMessageViewPopoverButton2,
			  oMessageViewPopoverButton3,
			  oMessageViewPopoverButton4,
			  oMessageViewPopoverButton5,
			  new ToolbarSpacer()
		  ]
	  })
  });

  var oSplitApp = new SplitApp({
	  id: "split-app",
	  masterPages: [page1],
	  initialMaster: "page1",

	  detailPages: [page2],
	  initialDetail: "page2"
  });

  oSplitApp.setModel(oModel);
  oSplitApp.placeAt("content");
});