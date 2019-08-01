/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/MessageView",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/MessageItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"sap/m/Link",
	"sap/ui/core/message/Message"
], function(
	qutils,
	MessageView,
	Dialog,
	Button,
	MessageItem,
	JSONModel,
	coreLibrary,
	Link,
	Message
) {
	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;



	QUnit.module("Public API", {
		beforeEach: function () {
			var that = this;

			this.oMessageView = new MessageView();

			this.oDialog = new Dialog({
				title: "Dialog with MessageView",
				content: that.oMessageView,
				contentHeight: "440px",
				contentWidth: "640px",
				verticalScrolling: false
			});

			this.oButton = new Button({
				text: "Show MessageView",
				press: function () {
					that.oDialog.open();
				}
			});

			this.oMockupData = {
				messages: [{
					type: "Error",
					groupName: "Group 1",
					title: "Error message",
					subtitle: "Subtitle",
					description: "<p>First Error message description</p>"
				}, {
					type: "Warning",
					groupName: "Group 2",
					title: "Warning without description"
				}, {
					type: "Success",
					groupName: "Group 2",
					title: "Success message",
					description: "<p>&First Success message description</p>"
				}, {
					type: "Error",
					groupName: "Group 1",
					title: "Error",
					description: "<p>Second Error message description</p>"
				}, {
					type: "Information",
					groupName: "Group 1",
					title: "Information message (Long) 1",
					description: "<h1>HTML sanitization test</h1><h3>heading</h3><p>paragraph</p><embed src='helloworld.swf'> <object width=\"400\" height=\"400\"></object>",
					longtextUrl: "/something"
				}]
			};

			this.mockMarkupDescription = "<h2>Heading h2</h2><script>alert('this JS will be sanitized')<\/script>" +
					"<p>Paragraph. At vero eos et accusamus et iusto odio dignissimos ducimus qui ...</p>" +
					"<ul>" +
					"   <li>Unordered list item 1 <a href=\"http://sap.com/some/url\">Absolute URL</a></li>" +
					"   <li>Unordered list item 2</li>" +
					"</ul>" +
					"<ol>" +
					"   <li>Ordered list item 1 <a href=\"/relative/url\">Relative URL</a></li>" +
					"   <li>Ordered list item 2</li>" +
					"</ol>" +
					"<embed src='helloworld.swf'> <object width=\"400\" height=\"400\"></object>";

			this.server = sinon.fakeServer.create();
			this.server.autoRespond = true;
			this.server.xhr.useFilters = true;

			this.server.xhr.addFilter(function (method, url) {
				return !url.match(/something/);
			});

			this.server.respondWith("GET", "/something",
					[200, {"Content-Type": "text/html"}, this.mockMarkupDescription]
			);

			this.oMessageTemplate = new MessageItem({
				type: "{type}",
				title: "{title}",
				subtitle: "{subtitle}",
				counter: 1,
				groupName: "{groupName}",
				description: "{description}",
				longtextUrl: "{longtextUrl}",
				markupDescription: "{markupDescription}"
			});

			this.oModel = new JSONModel();
			this.oModel.setData(this.oMockupData);
			sap.ui.getCore().setModel(this.oModel);

			this.oMessageView.bindAggregation("items", {
				path: "/messages",
				template: this.oMessageTemplate
			});

			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oButton.firePress();
		},
		afterEach: function () {
			this.oDialog.close();

			this.oDialog.destroy();

			this.oMessageView.destroy();

			this.oButton.destroy();

			this.oDialog = null;

			this.oMessageView = null;

			this.oButton = null;

			this.oMessageTemplate = null;

			this.oMockupData = null;

			this.server.restore();
		}
	});

	QUnit.test("setDescription() property", function (assert) {
		var testItemIndex = 4;

		// A total of 6 assertions are expected
		assert.expect(6);

		var doneLongtextLoaded = assert.async(),
				doneUrlValidated = [assert.async(), assert.async()];

		this.oMessageView.attachLongtextLoaded(function () {
			assert.strictEqual(this.oMessageView.getItems()[testItemIndex].getDescription().indexOf("h2") >= 1, true, "There should be an h2 tag");
			assert.strictEqual(this.oMessageView.getItems()[testItemIndex].getDescription().indexOf("script"), -1, "There should be no script tag in the html");
			assert.strictEqual(this.oMessageView.getItems()[testItemIndex].getDescription().indexOf("embed"), -1, "There should be no embed tag in the html");
			doneLongtextLoaded();
			assert.ok(this.oMessageView.getItems()[2].getDescription().indexOf("&") >= 0, "Item's description should not be sanitized");
		}, this);

		var setAsyncURLHandlerSpy = sinon.spy(function (config) {
			var allowed = config.url.lastIndexOf("http", 0) < 0;
			config.promise.resolve({
				allowed: allowed,
				id: config.id
			});
		});
		this.oMessageView.setAsyncURLHandler(setAsyncURLHandlerSpy);

		var callCount = 0;
		this.oMessageView.attachUrlValidated(function () {
			assert.ok(setAsyncURLHandlerSpy.called, "The URL handler should be called - validation is performed");
			doneUrlValidated[callCount]();
			callCount += 1;
		});

		this.oDialog.attachAfterOpen(function () {
			var oItem = this.oMessageView._oLists["all"].getItems()[testItemIndex].getDomRef();
			sap.ui.test.qunit.triggerEvent("tap", oItem);
		}.bind(this));


		var oModel = new JSONModel();
		oModel.setData(this.oMockupData);
		sap.ui.getCore().setModel(oModel);

		this.oMessageView.bindAggregation("items", {
			path: "/messages",
			template: this.oMessageTemplate
		});

		this.oButton.firePress();
		this.clock.tick(500);
	});

	QUnit.test("setBusy should set the busy state to MessageView", function (assert) {
		this.oMessageView.setBusy(true);

		assert.ok(this.oMessageView.getBusy(), "busy state should be set true");

		this.oMessageView.setBusy(false);

		assert.ok(!this.oMessageView.getBusy(), "busy state should be set false");
	});

	QUnit.test("Busy indicator should be shown", function (assert) {
		var done = assert.async(),
				that = this;

		this.oMessageView.setAsyncDescriptionHandler(function (config) {
			assert.ok(that.oMessageView._detailsPage.getBusy(), "when there is an async description loading");
			config.item.setDescription(that.mockMarkupDescription);
			config.promise.resolve();
			done();
		});

		this.oDialog.attachAfterOpen(function () {
			var oItem = that.oMessageView._oLists["all"].getItems()[4].getDomRef();
			sap.ui.test.qunit.triggerEvent("tap", oItem);
		});

		this.clock.tick(500);
	});

	QUnit.test("Items getter", function (assert) {
		assert.strictEqual(this.oMessageView.getItems().length, 5);
	});

	QUnit.test("setSubtitle() property", function (assert) {
		var sInterlListItemDescription, sMessageItemSubtitle;

		sInterlListItemDescription = this.oMessageView._oLists.all.getItems()[0].getDescription();
		sMessageItemSubtitle = this.oMessageView.getItems()[0].getSubtitle();

		assert.strictEqual(sInterlListItemDescription, "Subtitle", "Description of the interal listItem should be binded with the subtitle of the MessageItem");
		assert.strictEqual(sInterlListItemDescription, sMessageItemSubtitle, "Setting a subtitle to MessageItem should set the description of the internal StandardListItem");
	});

	QUnit.test("setCounter() property", function (assert) {
		var iMPItemCounter, iInterListItemCounter;

		iMPItemCounter = this.oMessageView.getItems()[0].getCounter();
		iInterListItemCounter = this.oMessageView._oLists.all.getItems()[0].getCounter();

		assert.strictEqual(iInterListItemCounter, 1, "Internal listItem's counter should be set to 1");
		assert.strictEqual(iInterListItemCounter, iMPItemCounter, "Internal listItem's counter should be the same as MessageItems's counter");
	});

	QUnit.test("setGroupItems() property", function(assert) {
		this.oMessageView.setGroupItems(true);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oMessageView._oLists.all.getItems().length, 7, "Item should be 7");
		assert.ok(this.oMessageView._oLists.all.getItems()[0] instanceof sap.m.GroupHeaderListItem, "Item should be GroupHeaderItem");
	});

	QUnit.test("No navigation arrow should be shown if there is no description", function (assert) {
		var oStandardListItem = this.oMessageView._oLists.all.getItems()[1];

		assert.strictEqual(oStandardListItem.getType(), "Inactive", "The type of the ListItem should be Inactive");
	});

	QUnit.test("addStyleClass should add class", function (assert) {
		var $oDomRef = this.oMessageView.$();

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");

		this.oMessageView.addStyleClass("test");

		assert.ok($oDomRef.hasClass("test"), "should have 'test' class");
	});

	QUnit.test("removeStyleClass should remove class", function (assert) {
		var $oDomRef = this.oMessageView.$();

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");

		this.oMessageView.addStyleClass("test");

		assert.ok($oDomRef.hasClass("test"), "should have 'test' class");

		this.oMessageView.removeStyleClass("test");

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");
	});

	QUnit.test("toggleStyleClass should toggle class", function (assert) {
		var $oDomRef = this.oMessageView.$();

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");

		this.oMessageView.toggleStyleClass("test");

		assert.ok($oDomRef.hasClass("test"), "should have 'test' class");

		this.oMessageView.toggleStyleClass("test");

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");
	});

	QUnit.test("hasStyleClass should check if class is added", function (assert) {
		var $oDomRef = this.oMessageView.$();

		assert.ok(!this.oMessageView.hasStyleClass("test"), "should not have 'test' class");

		this.oMessageView.addStyleClass("test");

		assert.ok(this.oMessageView.hasStyleClass("test"), "should have 'test' class");
	});

	QUnit.test("The items in the list should have info state set according to the message type", function(assert) {
		var aItems;

		this.oDialog.open();
		this.clock.tick(500);
		aItems = this.oMessageView._oLists.all.getItems();

		assert.strictEqual(aItems[0].getInfoState(), ValueState.Error, "The value state should be Error in case of error message.");
		assert.strictEqual(aItems[1].getInfoState(), ValueState.Warning, "The value state should be Warning in case of warning message.");
		assert.strictEqual(aItems[2].getInfoState(), ValueState.Success, "The value state should be Success in case of success message.");
		assert.strictEqual(aItems[4].getInfoState(), ValueState.None, "The value state should be None in case of information message.");
	});

	QUnit.test("MessageView should restore the focus and items type on back navigation", function (assert) {
		// arrange
		var oItems, focusSpy, restoreItemTypeSpy, setItemTypeSpy,
			sLongTitle = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod" +
					"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam," +
					"quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo" +
					"consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse" +
					"cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non" +
					"proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

		this.oMessageView.addItem(new MessageItem({
			title: sLongTitle
		}));

		// act
		this.oDialog.open();
		this.oMessageView._fnHandleForwardNavigation(this.oMessageView._oLists.all.getItems()[0], "show");

		focusSpy = sinon.spy(this.oMessageView, "_restoreFocus");
		restoreItemTypeSpy = sinon.spy(this.oMessageView, "_restoreItemsType");
		setItemTypeSpy = sinon.spy(this.oMessageView, "_setItemType");

		this.oMessageView.navigateBack();
		this.clock.tick(500);

		oItems = this.oMessageView._oLists.all.getItems();

		// assert
		assert.strictEqual(oItems[5].getType(), "Navigation", "The first item should be navigation type");
		assert.ok(focusSpy.called, "_restoreFocus should be called");
		assert.ok(restoreItemTypeSpy.called, "_restoreItemsType should be called");
		assert.ok(setItemTypeSpy.called, "_setItemType should be called");

		// cleanup
		focusSpy.restore();
		restoreItemTypeSpy.restore();
		setItemTypeSpy.restore();
	});

	QUnit.test("MessageItems type Navigation when there is Description, else Inactive", function (assert) {
		this.oDialog.open();
		this.clock.tick(500);

		var aItems = this.oMessageView._oLists.all.getItems();

		assert.ok(aItems[0].getType() === "Navigation" && aItems[0].getDescription(), "An item with description should have type Navigation");
		assert.ok(aItems[1].getType() === "Inactive" && !aItems[1].getDescription(), "An item without description should have type Inactive");
	});

	QUnit.test("custom button aggregation", function (assert) {
		var customButton = new Button({
			text: "custom btn"
		});

		this.oMessageView.setHeaderButton(customButton);

		sap.ui.getCore().applyChanges();

		this.oDialog.open();

		var btnId = '#' + customButton.getId();
		assert.ok(document.querySelectorAll(btnId), "custom header button is rendered");

		customButton.destroy();
	});

	QUnit.test("showDetailsPageHeader property", function(assert) {
		this.oMessageView.setShowDetailsPageHeader(false);
		sap.ui.getCore().applyChanges();

		this.oDialog.open();
		this.clock.tick(500);

		assert.notOk(this.oMessageView._detailsPage.getShowHeader(), "Header show not be shown");
	});

	QUnit.test("Active Items: Link is created", function (assert) {
		var oFirstItem = this.oMessageView.getItems()[0];
		var oLinkInitSpy = this.spy(Link.prototype, "init");

		oFirstItem.setActiveTitle(true);
		sap.ui.getCore().applyChanges();

		assert.ok(oLinkInitSpy.called, "link should be initialized");
	});

	QUnit.test("Active Item: Details page should contain a link", function (assert) {
		var oFirstMessageItem = this.oMessageView.getItems()[0];
		var oFirstListItem = this.oMessageView._oLists.all.getItems()[0];
		var oDetailsFirstContent;

		oFirstMessageItem.setActiveTitle(true);
		sap.ui.getCore().applyChanges();

		this.oMessageView._navigateToDetails(oFirstMessageItem, oFirstListItem, "slide", false);
		this.clock.tick(300);

		oDetailsFirstContent = this.oMessageView._detailsPage.getContent()[0];

		assert.strictEqual(oDetailsFirstContent.getMetadata().getName(), "sap.m.Link", "First content should be a link");
		assert.ok(oDetailsFirstContent.hasStyleClass("sapMMsgViewTitleText"), "Link should have 'sapMMsgViewTitleText' css class");
	});

	QUnit.test("Active Item: Details page link should fire event", function (assert) {
		var oFirstMessageItem = this.oMessageView.getItems()[0];
		var oFirstListItem = this.oMessageView._oLists.all.getItems()[0];
		var oActiveTitlePressStub = this.stub(this.oMessageView, "fireActiveTitlePress");
		var oDetailsLink;

		oFirstMessageItem.setActiveTitle(true);
		sap.ui.getCore().applyChanges();

		this.oMessageView._navigateToDetails(oFirstMessageItem, oFirstListItem, "slide", false);
		this.clock.tick(300);

		oDetailsLink = this.oMessageView._detailsPage.getContent()[0];

		oDetailsLink.firePress();
		this.clock.tick(300);

		assert.ok(oActiveTitlePressStub.called, "event should be called");
		assert.ok(oActiveTitlePressStub.calledWithExactly({ item: oFirstMessageItem }), "event should be called with the message item");
	});

	QUnit.test("Active Items: Press is propagated from Link to MessageItem", function (assert) {
		var oFirstItem = this.oMessageView.getItems()[0];
		var oActiveTitlePressStub = this.stub(this.oMessageView, "fireActiveTitlePress");

		oFirstItem.setActiveTitle(true);
		sap.ui.getCore().applyChanges();

		// fire press of the link of a MessageListItem
		this.oMessageView._oLists.all.getItems()[0].getLink().firePress();
		this.clock.tick(300);

		assert.ok(oActiveTitlePressStub.called, "event should be called");
		assert.ok(oActiveTitlePressStub.calledWithExactly({ item: oFirstItem }), "event should be called with the message item");
	});

	QUnit.test("ActiveTitlePress should be fired on ALT + Enter", function(assert)  {
		assert.expect(1);
		var oFirstItem = this.oMessageView.getItems()[0];
		var oActiveTitlePressStub = this.stub(this.oMessageView, 'fireActiveTitlePress');

		oFirstItem.setActiveTitle(true);
		sap.ui.getCore().applyChanges();

		oFirstItem.focus();
		qutils.triggerKeydown(this.oMessageView._oLists.all.getItems()[0], "Enter", false, true, false);
		this.clock.tick(500);

		assert.ok(oActiveTitlePressStub.called, "Event should be fired");
	});

	QUnit.test("Active Items: Inactive item should not have a link", function (assert) {
		assert.notOk(this.oMessageView._oLists.all.getItems()[0].getLink(), "Inactive Item should not have a link");
	});

	QUnit.test("Markup Description: Markup in the description should be scaped", function (assert) {
		var sDescription = 'Second Error message description   {http://blblbl} ';

		this.oModel.setProperty("/messages", [{
			type: "Error",
			title: "Error message 123 { here is a lot of text} ",
			description: sDescription,
			subtitle: "  a  Example of {subtitle} ",
			counter: 2,
			markupDescription: true
		}]);

		sap.ui.getCore().applyChanges();

		this.oDialog.open();
		this.clock.tick(500);

		assert.ok(true, "No exception has been thrown");
		assert.strictEqual(this.oMessageView.getItems()[0].getDescription(), sDescription, "Description is not modified");
	});

	QUnit.module("Core integration", {
		beforeEach: function () {
			var that = this;

			var oModel = new JSONModel({
				form: {
					name: "Form Name"
				}
			});

			sap.ui.getCore().getMessageManager().addMessages(
					new Message({
						message: "Invalid order of characters in this name!",
						type: MessageType.Warning,
						target: "/form/name",
						processor: oModel
					})
			);

			sap.ui.getCore().applyChanges();

			this.oMessageView = new MessageView();

			this.oDialog = new Dialog({
				title: "Dialog with MessageView",
				content: that.oMessageView,
				contentHeight: "440px",
				contentWidth: "640px",
				verticalScrolling: false
			});

			this.oButton = new Button({
				text: "Show MessageView",
				press: function () {
					that.oDialog.open();
				}
			});

			this.oButton.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oButton.firePress();
		},
		afterEach: function () {
			sap.ui.getCore().getMessageManager().removeAllMessages();

			this.oDialog.close();

			this.oDialog.destroy();

			this.oMessageView.destroy();

			this.oButton.destroy();

			this.oDialog = null;

			this.oMessageView = null;

			this.oButton = null;
		}
	});

	QUnit.test("When initialized without items template should automatically perform binding to the Message Model", function (assert) {
		assert.equal(this.oMessageView.getItems().length, 1, "The message should be one - from MessageManager");
	});

	QUnit.test("NavContainer should be child of the MessageView", function(assert) {
		assert.equal(this.oMessageView._navContainer.getParent(), this.oMessageView, "Parent child relation is correct");
	});

	QUnit.module("MessageView behaviour with one message with different title length and without description", {

		beforeEach: function () {
			var that = this;
			this.oMessageView = new MessageView();

			this.oDialog = new Dialog({
				title: "Dialog with MessageView",
				content: that.oMessageView,
				contentHeight: "440px",
				contentWidth: "640px",
				verticalScrolling: false
			});
		},
		afterEach: function () {
			this.oDialog.close();
			this.oDialog.destroy();
			this.oMessageView.destroy();
		}
	});

	QUnit.test("Contains only one message with short title should stay in list view", function (assert) {
		var oNavigateStub = this.stub(this.oMessageView, "_navigateToDetails");

		this.oMessageView.addItem(new MessageItem({
			title: "Short title."
		}));
		sap.ui.getCore().applyChanges();
		this.oDialog.open();

		assert.notOk(oNavigateStub.called, "Navigation to details has not been triggered");
	});

	QUnit.test("Contains only one message with long title should stay go details view", function (assert) {
		var oNavigateStub = this.stub(this.oMessageView, "_navigateToDetails");
		this.oMessageView.addItem(new MessageItem({
			title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		}));
		this.oDialog.open();
		sap.ui.getCore().applyChanges();

		assert.ok(oNavigateStub.called, "Navigation to details had been triggered");

		this.oMessageView.navigateBack();
		this.clock.tick(500);

		assert.ok(this.oMessageView._oLists['all'].getVisible(), "The list with all items is visible");
	});

	QUnit.module("HTML representation", {
		beforeEach: function () {
			var that = this;

			this.oMessageView = new MessageView();

			this.oButton = new Button({
				text: "Show MessageView"
			});

			this.oDialog = new Dialog({
				title: "Dialog with MessageView",
				content: that.oMessageView,
				contentHeight: "440px",
				contentWidth: "640px",
				verticalScrolling: false
			});

			this.oButton.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oDialog.close();

			this.oDialog.destroy();

			this.oMessageView.destroy();

			this.oButton.destroy();

			this.oDialog = null;

			this.oMessageView = null;

			this.oButton = null;
		}
	});

	QUnit.test("sapMMsgView class should be present", function (assert) {
		this.oDialog.open();

		var oDomRef = this.oMessageView.getDomRef();

		assert.notStrictEqual(oDomRef.className.indexOf("sapMMsgView"), -1, "sapMMsgView class should present on the HTML element");
	});

	QUnit.test("MessageItem's with truncated title", function (assert) {
		var oItems,
			sLongTitle = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod" +
				"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam," +
				"quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo" +
				"consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse" +
				"cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non" +
				"proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

		this.oMessageView.addItem(new MessageItem({
			title: sLongTitle
		}));

		this.oMessageView.addItem(new MessageItem({
			title: sLongTitle,
			activeTitle: true
		}));

		this.oMessageView.addItem(new MessageItem({
			title: "dummy item"
		}));

		sap.ui.getCore().applyChanges();

		this.oDialog.open();
		this.clock.tick(500);

		oItems = this.oMessageView._oLists.all.getItems();

		assert.strictEqual(oItems[0].getType(), "Navigation", "The first item should be navigation type");
		assert.strictEqual(oItems[1].getType(), "Navigation", "The second item should be navigation type");
		assert.strictEqual(oItems[2].getType(), "Inactive", "The third item should be inactive type");
	});

	QUnit.test("MessageItem with active title - propagation to MessageListItems", function (assert) {
		var oFirstMessageItem = new MessageItem({
			activeTitle: true,
			type: "Error"
		}), oFirstListItem;

		this.oMessageView.addItem(oFirstMessageItem);
		this.oMessageView.addItem(new MessageItem({
			activeTitle: true,
			type: "Warning"
		}));
		this.oMessageView.addItem(new MessageItem({
			activeTitle: true,
			type: "Information"
		}));

		this.oMessageView.placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		oFirstListItem = this.oMessageView._oLists.all.getItems()[0];

		assert.strictEqual(oFirstListItem.getMessageType(), oFirstMessageItem.getType(), "MessageItem Type should be propagated");
		assert.strictEqual(oFirstListItem.getLink().$().attr("aria-describedby"), oFirstListItem.getLinkAriaDescribedBy().getId(), "Describedby of the title and the MessageListItem itself should be the same");
	});

	QUnit.test("MessageItem with active title - Details page", function (assert) {
		var oFirstMessageItem = new MessageItem({
			activeTitle: true,
			type: "Error"
		}), oFirstListItem, oDetailsTitle;

		this.oMessageView.addItem(oFirstMessageItem);
		this.oMessageView.addItem(new MessageItem({
			activeTitle: true,
			type: "Warning"
		}));
		this.oMessageView.addItem(new MessageItem({
			activeTitle: true,
			type: "Information"
		}));

		this.oMessageView.placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();
		oFirstListItem = this.oMessageView._oLists.all.getItems()[0];

		this.oMessageView._navigateToDetails(oFirstMessageItem, oFirstListItem, "slide", false);
		this.clock.tick(300);

		oDetailsTitle = this.oMessageView._detailsPage.getContent()[0];

		assert.ok(oDetailsTitle.getAriaDescribedBy().indexOf(oFirstListItem.getId() + "-link") > -1, "Details title should be described by the item's link");
	});

	QUnit.test("MessageItem with active title - Message Bundle Texts", function (assert) {
		var oFirstMessageItem = new MessageItem({
			type: "Error"
		}), oBundle, sMessageAnnouncement,
			sContentAnnouncement, sAnnouncement;

		this.oMessageView.addItem(oFirstMessageItem);
		this.oMessageView.placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		sMessageAnnouncement = oBundle.getText("MESSAGEVIEW_BUTTON_TOOLTIP_ERROR");
		sContentAnnouncement = oBundle.getText("MESSAGE_LIST_ITEM_FOCUS_TEXT", [sMessageAnnouncement]);
		sAnnouncement =  this.oMessageView._oLists.all.getItems()[0].getContentAnnouncement(oBundle);

		assert.strictEqual(sAnnouncement.indexOf(sContentAnnouncement), -1, "Message List Item should not include information for the navigation");

		oFirstMessageItem.setActiveTitle(true);
		sap.ui.getCore().applyChanges();

		sAnnouncement =  this.oMessageView._oLists.all.getItems()[0].getContentAnnouncement(oBundle);

		assert.ok(sAnnouncement.indexOf(sContentAnnouncement) > -1 , "Message List Item should include information for the navigation");
	});

	QUnit.module("Binding", {
		beforeEach: function () {
			var that = this;

			this.oButton2 = new Button({text: "Press me"});

			var oMessageTemplate = new MessageItem({
				title: '{message}'
			});

			this.oMessageView2 = new MessageView({
				items: {
					path: '/',
					template: oMessageTemplate
				}
			});

			this.oDialog2 = new Dialog({
				title: "Dialog with MessageView",
				content: that.oMessageView2,
				contentHeight: "440px",
				contentWidth: "640px",
				verticalScrolling: false
			});

			this.oMessageView2.setModel(new JSONModel([{
				"code": "APPL_MM_IV_MODEL/021",
				"message": "One",
				"severity": "error",
				"target": "/Headers(NodeKey=guid'e41d2de5-37a0-1ee6-8784-60396f9b5305',State='01')/InvoicingParty"
			}]));

			this.oButton2.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oDialog2.close();

			this.oDialog2.destroy();

			this.oMessageView2.destroy();

			this.oButton2.destroy();

			this.oDialog2 = null;

			this.oButton2 = null;
		}
	});

	QUnit.test("Updating item's binding should update its property", function (assert) {

		this.oMessageView2.getModel().setProperty("/0/message", "Two");
		this.clock.tick(500);
		this.oDialog2.open();

		assert.strictEqual(this.oMessageView2._oLists.error.getItems()[0].getTitle(), "Two", "Title to be changed");
	});

	QUnit.test("No segmented button filter when not needed", function (assert) {
		this.oDialog2.open();

		this.clock.tick(500);

		assert.strictEqual(this.oMessageView2._oSegmentedButton.getVisible(), false, "Segmented button is not needed and should not be visible");

		assert.strictEqual(this.oMessageView2._listPage.getShowHeader(), false, "Header is not visible because no segmented button is visible and no custom header button is there");

		this.oDialog2.close();

		this.clock.tick(500);

		this.oMessageView2.setHeaderButton(new Button({text: 'header button'}));

		this.oDialog2.open();

		this.clock.tick(500);

		assert.strictEqual(this.oMessageView2._listPage.getShowHeader(), true, "Header should be shown when there is a custom header button even if segmente button is hidden");

		this.oDialog2.close();

		this.oDialog2.open();

		this.clock.tick(500);

		assert.strictEqual(this.oMessageView2._listPage.getShowHeader(), true, "Header should be shown when there is a custom header button even if segmented button is hidden after closing the dialog container");
	});

	QUnit.test("Removing all items", function (assert) {
		var tempObject = {
			message: "test"
		};

		this.oDialog2.open();

		this.clock.tick(500);

		this.oMessageView2.getModel().setData(null);
		sap.ui.getCore().applyChanges();

		this.oMessageView2.getModel().setData(tempObject);
		sap.ui.getCore().applyChanges();

		assert.ok(this.oMessageView2.getItems().length);

		tempObject = null;
	});

	QUnit.test("Prevent auto binding to the sap.ui.getCore().getMessageManager() when there's a model", function (assert) {
		// Setup
		var oMessageView = new MessageView({
				items: {
					path: '/',
					template: new MessageItem({
						type: '{type}',
						title: '{title}'
					})
				}
			});

		oMessageView.setModel(new JSONModel());
		oMessageView.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		var oMessage = new Message({
			type: "Error",
			message: "Simple message",
			target: "",
			processor: null,
			technical: false,
			references: null,
			validation: false
		});
		sap.ui.getCore().getMessageManager().addMessages(oMessage);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oMessageView.getItems().length, 0, "If the MessagePopover is bound to a model, the MessageView should not bind to the MessageManager");

		//Cleanup
		oMessage.destroy();
		oMessageView.destroy();
		sap.ui.getCore().getMessageManager().removeAllMessages();
	});

	QUnit.test("Auto bind to the sap.ui.getCore().getMessageManager() when there are items or binding", function (assert) {
		// Setup
		var oMessageView = new MessageView();

		oMessageView.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		var oMessage = new Message({
			type: "Error",
			message: "Simple message",
			target: "",
			processor: null,
			technical: false,
			references: null,
			validation: false
		});
		sap.ui.getCore().getMessageManager().addMessages(oMessage);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oMessageView.getItems().length, 1, "If the MessagePopover is not bound to a model, the MessageView should bind to the MessageManager");
		assert.strictEqual(oMessageView.getItems()[0].getTitle(), "Simple message", "The message should be the one from the MessageManager");

		//Cleanup
		oMessage.destroy();
		oMessageView.destroy();
		sap.ui.getCore().getMessageManager().removeAllMessages();
	});


	QUnit.module("Interaction", {
		beforeEach: function () {
			this.oMessageView = new MessageView({
				items: [
					new MessageItem({
						title: "Test",
						description: "Test Description"
					})
				]
			});

			this.oMessageView.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oMessageView.destroy();
		}
	});

	QUnit.test("First visible page should be details page", function (assert) {
		assert.strictEqual(this.oMessageView._navContainer.getCurrentPage().getId(), this.oMessageView._detailsPage.getId(), "Details page should be initially shown if item is just one");
	});

	QUnit.module("Aggregation Binding", {
		beforeEach: function () {
			this.oMessageView = new MessageView();

			var oTemplate = new MessageItem({
				title: "{title}",
				description: "Test Description",
				link: new Link({
					text: "{link}"
				})
			});

			var oData = {
				messages: [{
					type: "Error",
					groupName: "Group 1",
					title: "Error message",
					subtitle: "Subtitle",
					link: "Link 1",
					linkCustomData: "Link CustomData 1",
					description: "First Error message description"
				}, {
					type: "Warning",
					groupName: "Group 2",
					title: "Warning without description",
					link: "Link 2"
				}]
			};

			var oModel = new JSONModel();
			oModel.setData(oData);

			this.oMessageView.setModel(oModel);
			this.oMessageView.bindAggregation("items",{
				path: "/messages",
				template: oTemplate
			});

			this.oMessageView.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oMessageView.destroy();
		}
	});

	QUnit.test("Link in details page", function (assert) {
		this.oMessageView._setDescription(this.oMessageView.getItems()[0]);
		var oLink = this.oMessageView.getAggregation("_navContainer").getPages()[1].getContent()[1];

		//assert
		assert.strictEqual(oLink.getMetadata().getName(), "sap.m.Link", "A Link is added to details page");
		assert.strictEqual(oLink.getText(), "Link 1", "The link is bound correctly");
	});

	QUnit.test("Escaping brackets", function (assert) {
		// set up
		var oMessageTemplate, aMockMessages, oModel,
			oMessageView, oDialog, oButton;

		oMessageTemplate = new MessageItem({
			type: '{type}',
			title: '{title}',
			description: '{description}'
		});

		aMockMessages = [
			{
				type: 'Error',
				title: 'Error message { 123',
				description: 'Error message { description'

			}];

		oModel = new JSONModel();
		oModel.setData(aMockMessages);

		oMessageView = new MessageView({
			items: {
				path: "/",
				template: oMessageTemplate
			}
		});

		oMessageView.setModel(oModel);

		oDialog = new Dialog({
			content: [oMessageView]
		});

		oButton = new Button({
			press: function(){
				oDialog.open();
			}
		}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// act
		oButton.firePress();

		// assert
		assert.strictEqual(oMessageView.getItems()[0].getTitle(), "Error message { 123", "The item's title is set right.");
		assert.strictEqual(oMessageView.getItems()[0].getDescription(), "Error message { description", "The item's description is set right.");

		// clean up
		oButton.destroy();
		oDialog.destroy();
		oButton = null;
		oDialog = null;
		oMessageView = null;
	});

	QUnit.module("Filtering");

	QUnit.test("Filter message & model change integration", function (assert) {
		//Setup
		var oModel = new JSONModel([{
			"message": "Enter a valid number",
			"additionalText": "ZIP Code/City",
			"type": "Error"
		}, {
			"message": "Enter a valid value",
			"additionalText": "Email",
			"type": "Error"
		}, {
			"message": "A mandatory field is required",
			"additionalText": "Name",
			"type": "Error"
		}, {
			"message": "The value should not exceed 40",
			"additionalText": "Standard Weekly Hours",
			"type": "Warning"
		}]);

		var oMessageView = new MessageView({
			items: {
				path: "message>/",
				template: new MessageItem(
						{
							title: "{message>message}",
							subtitle: "{message>additionalText}",
							type: "{message>type}",
							description: "{message>message}"
						})
			}
		}).setModel(oModel, "message").placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oMessageView._oLists['all'].getVisible(), "The list with all items is visible");
		assert.strictEqual(oMessageView._oLists['warning'].getItems().length, 1, "There's 1 item in the warniing list.");

		//Act
		oMessageView._oSegmentedButton.getButtons()[2].firePress();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(!oMessageView._oLists['all'].getVisible(), "The list with all items is NOT visible");
		assert.ok(oMessageView._oLists['warning'].getVisible(), "The 'Warning' list/section is visible");

		//Act
		var aData = oMessageView.getModel("message").getData();
		aData.pop(); //Throw out the "Warning" item
		oMessageView.getModel("message").setData(aData);
		sap.ui.getCore().applyChanges();

		assert.ok(oMessageView._oLists['all'].getVisible(), "The list with all items is visible");
		assert.ok(!oMessageView._oLists['warning'].getVisible(), "The 'Warning' list/section is NOT visible");

		oMessageView.destroy();
	});

	QUnit.test("Filter messages then show all the messages again", function (assert) {
		//Setup
		var oModel = new JSONModel([{
			"message": "Enter a valid number",
			"additionalText": "ZIP Code/City",
			"type": "Error",
			"activeTitle": true
		}, {
			"message": "Enter a valid value",
			"additionalText": "Email",
			"type": "Error",
			"activeTitle": true
		}, {
			"message": "A mandatory field is required",
			"additionalText": "Name",
			"type": "Error",
			"activeTitle": true
		}, {
			"message": "The value should not exceed 40",
			"additionalText": "Standard Weekly Hours",
			"type": "Warning"
		}]);

		var oMessageView = new MessageView({
			items: {
				path: "message>/",
				template: new MessageItem(
						{
							title: "{message>message}",
							subtitle: "{message>additionalText}",
							type: "{message>type}",
							description: "{message>message}",
							activeTitle: "{message>activeTitle}"
						})
			}
		}).setModel(oModel, "message").placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		var oAll = oMessageView._oLists['all'],
		oError = oMessageView._oLists['error'],
		oWarning = oMessageView._oLists['warning'];

		//Assert
		assert.strictEqual(oAll.getItems().length, 4, "The are four messages");
		assert.strictEqual(oError.getItems().length, 3, "There are three items in the error list.");
		assert.strictEqual(oWarning.getItems().length, 1, "There are one item in the warning list");
		assert.ok(oAll.getVisible(), "The list with all the messages is visible");

		//Act
		oMessageView._oSegmentedButton.getButtons()[1].firePress();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oError.getVisible(), "The 'Error' list/section is visible");
		assert.strictEqual(oError.getItems().length, 3, "There are three items in the error list.");

		//Act
		oMessageView._oSegmentedButton.getButtons()[2].firePress();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oWarning.getVisible(), "The 'Warning' list/section is visible");
		assert.strictEqual(oWarning.getItems().length, 1, "There is one message");

		//Act
		oMessageView._oSegmentedButton.getButtons()[1].firePress();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oError.getVisible(), "The 'Error' list/section is visible");
		assert.strictEqual(oError.getItems().length, 3, "There are three messages");

		//Act
		oMessageView._oSegmentedButton.getButtons()[0].firePress();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oAll.getVisible(), "The list with all messages is visible");
		assert.strictEqual(oAll.getItems().length, 4, "There are four messages");

		oMessageView.destroy();
	});
});