/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Messaging",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/MessagePopover",
	"sap/m/Button",
	"sap/ui/base/ObjectPool",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"sap/ui/core/IconPool",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/ui/core/message/Message",
	"sap/m/MessageItem",
	"sap/ui/Device",
	"sap/ui/core/CustomData",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
], function(
	Element,
	Messaging,
	qutils,
	MessagePopover,
	Button,
	ObjectPool,
	JSONModel,
	coreLibrary,
	IconPool,
	mobileLibrary,
	Toolbar,
	Message,
	MessageItem,
	Device,
	CustomData,
	Core,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.VerticalPlacementType
	var VerticalPlacementType = mobileLibrary.VerticalPlacementType;



	QUnit.module("Public API", {
		sCustomId: "custom-msg-popover-id",
		oSpies: {},
		beforeEach: function () {
			this.oSpies.beforeOpen = sinon.spy();
			this.oSpies.afterOpen = sinon.spy();
			this.oSpies.beforeClose = sinon.spy();
			this.oSpies.afterClose = sinon.spy();

			this.oMessagePopover = new MessagePopover(this.sCustomId, {
				beforeOpen: this.oSpies.beforeOpen,
				afterOpen: this.oSpies.afterOpen,
				beforeClose: this.oSpies.beforeClose,
				afterClose: this.oSpies.afterClose
			});

			this.oButton = new Button({
				text: "Show MessagePopover"
			});

			this.oMockupData = {
				count: 5,
				messages: [{
				type: "Error",
				title: "Error message",
				subtitle: "Subtitle",
				description: "<p>First Error message description</p>"
			}, {
				type: "Warning",
				title: "Warning without description",
				description: ""
			}, {
				type: "Success",
				title: "Success message",
				description: "<p>&First Success message description</p>"
			}, {
				type: "Error",
				title: "Error",
				description: "<p>Second Error message description</p>"
			}, {
				type: "Information",
				title: "Information message (Long)",
				description: "<h1>HTML sanitization test</h1><h3>heading</h3><p>paragraph</p><embed src='helloworld.swf'> <object width=\"400\" height=\"400\"></object>",
				longtextUrl: "/something"
			}]};

			this.mockMarkupDescription = "<h2>Heading h2</h2><script>alert('this JS will be sanitized')<\/script>" +
			"<p>Paragraph. At vero eos et accusamus et iusto odio dignissimos ducimus qui ...</p>" +
			"<ul>" +
			"	<li>Unordered list item 1 <a href=\"http://sap.com/some/url\">Absolute URL</a></li>" +
			"	<li>Unordered list item 2</li>" +
			"</ul>" +
			"<ol>" +
			"	<li>Ordered list item 1 <a href=\"/relative/url\">Relative URL</a></li>" +
			"	<li>Ordered list item 2</li>" +
			"</ol>" +
			"<embed src='helloworld.swf'> <object width=\"400\" height=\"400\"></object>";

			this.oMessageTemplate = new MessageItem({
				type: "{type}",
				title: "{title}",
				subtitle: "{subtitle}",
				counter: 1,
				description: "{description}",
				longtextUrl: "{longtextUrl}",
				markupDescription: true
			});

			this.oButton.addDependent(this.oMessagePopover);
			this.oButton.placeAt("qunit-fixture");
			Core.applyChanges();

			sinon.stub(ObjectPool.prototype, "returnObject").callsFake(function(){});
		},
		bindMessagePopover: function (oMessagePopover, oData) {
			var oModel = new JSONModel();
			oModel.setData(oData);
			oMessagePopover.setModel(oModel);

			oMessagePopover.bindAggregation("items", {
				path: "/messages",
				template: this.oMessageTemplate
			});
		},
		openDetailPageAfterOpen: function (oMessagePopover, iItem) {
			oMessagePopover.attachAfterOpen(function () {
				var oItem = oMessagePopover._oMessageView._oLists['all'].getItems()[iItem].getDomRef();
				qutils.triggerEvent("tap", oItem);
			});
		},
		afterEach: function () {
			this.oMessagePopover.destroy();
			this.oButton.destroy();

			ObjectPool.prototype.returnObject.restore();
			this.oMessagePopover = null;
			this.oButton = null;
			this.oMockupData = null;
			this.oMessageTemplate.destroy();
		}
	});

	QUnit.test("HeaderButton aggregation binding", function (assert) {

		var oMessagePopover = new MessagePopover({
			models: new JSONModel({
				deleteIcon: "sap-icon://delete"
			}),
			headerButton: new Button({
				id: "idHeaderButton",
				icon: "{/deleteIcon}"
			})
		}).placeAt("qunit-fixture");

		Core.applyChanges();

		assert.strictEqual(Element.getElementById("idHeaderButton").getIcon(), "sap-icon://delete", "The header button is bound correctly");

		// clean up
		oMessagePopover.destroy();
	});

	QUnit.test("setDescription() property", function (assert) {
		// A total of 8 assertions are expected
		assert.expect(8);

		var doneLongtextLoaded = assert.async(),
			doneUrlValidated = [assert.async(), assert.async()],
			bAsyncURLHandlerCalled = false;

		this.server = sinon.fakeServer.create();
		this.server.autoRespond = true;
		this.server.xhr.useFilters = true;

		this.server.xhr.addFilter(function (method, url) {
			//whenever the this returns true the request will not faked
			return !url.match(/something/);
		});

		this.server.respondWith("GET", "/something",
				[200, {"Content-Type": "text/html"}, this.mockMarkupDescription]
		);

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);
		this.openDetailPageAfterOpen(this.oMessagePopover, 4);

		this.oMessagePopover.attachLongtextLoaded(function () {
			assert.strictEqual(this.oMessagePopover._oMessageView._detailsPage.getContent()[1].getContent().indexOf("h2") >= 1, true, "There should be an h2 tag");
			assert.strictEqual(this.oMessagePopover._oMessageView._detailsPage.getContent()[1].getContent().indexOf("<script"), -1, "There should be no script tag in the html");
			assert.strictEqual(this.oMessagePopover._oMessageView._detailsPage.getContent()[1].getContent().indexOf("embed"), -1, "There should be no embed tag in the html");
			doneLongtextLoaded();
			assert.ok(this.oMessagePopover._oMessageView.getItems()[2].getDescription().indexOf("&") >= 0, "Item's description should not be sanitized");
		}, this);

		this.oMessagePopover.setAsyncURLHandler(function (config) {
			var allowed = config.url.lastIndexOf("http", 0) < 0;
			bAsyncURLHandlerCalled = true;
			config.promise.resolve({
				allowed: allowed,
				id: config.id
			});
		});

		var callCount = 0;
		this.oMessagePopover.attachUrlValidated(function () {
			assert.ok(bAsyncURLHandlerCalled, "The URL handler should be called");
			assert.ok(true, "A validation is performed");
			doneUrlValidated[callCount]();
			callCount += 1;
		});

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		this.server.restore();
	});

	QUnit.test("setSubtitle() property", function (assert) {
		var sInterlListItemDescription, sMessageItemSubtitle;

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);
		this.oMessagePopover.openBy(this.oButton);

		sInterlListItemDescription = this.oMessagePopover._oMessageView._oLists.all.getItems()[0].getDescription();
		sMessageItemSubtitle = this.oMessagePopover.getItems()[0].getSubtitle();

		assert.strictEqual(sInterlListItemDescription, "Subtitle", "Description of the internal listItem should be binded with the subtitle of the MessageItem");
		assert.strictEqual(sInterlListItemDescription, sMessageItemSubtitle, "Setting a subtitle to MessageItem should set the description of the internal StandardListItem");
	});

	QUnit.test("setCounter() property", function (assert) {
		var iMPItemCounter, iInterListItemCounter;

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);
		this.oMessagePopover.openBy(this.oButton);

		iMPItemCounter = this.oMessagePopover.getItems()[0].getCounter();
		iInterListItemCounter = this.oMessagePopover._oMessageView._oLists.all.getItems()[0].getCounter();

		assert.strictEqual(iInterListItemCounter, 1, "Internal listItem's counter should be set to 1");
		assert.strictEqual(iInterListItemCounter, iMPItemCounter, "Internal listItem's counter should be the same as MessageItems's counter");
	});

	QUnit.test("No Navigation arrow should be shown if there is no description", function (assert) {
		var oStandardListItem;
		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);
		this.oMessagePopover.openBy(this.oButton);

		this.oMessagePopover.getItems()[1].setMarkupDescription(false);
		Core.applyChanges();

		oStandardListItem = this.oMessagePopover._oMessageView._oLists.all.getItems()[1];

		assert.strictEqual(oStandardListItem.getType(), "Inactive", "The type of the ListItem should be Inactive");
	});

	QUnit.test("Busy indicator should be shown", function (assert) {
		var done = assert.async(),
				that = this;

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);

		this.oMessagePopover.setAsyncDescriptionHandler(function (config) {
			assert.ok(that.oMessagePopover._oMessageView._detailsPage.getBusy(), "when there is an async description loading");
			config.item.setDescription(that.mockMarkupDescription);
			config.promise.resolve();
			done();
		});

		this.openDetailPageAfterOpen(this.oMessagePopover, 4);

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
	});

	QUnit.test("getId() should return correct id", function (assert) {
		var sId = this.oMessagePopover.getId();

		assert.strictEqual(sId, this.sCustomId, "#" + sId + " should be equal to #" + this.sCustomId);
	});

	QUnit.test("getDomRef() should return HTML element", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		var oDomRef = this.oMessagePopover.getDomRef();

		assert.ok(oDomRef instanceof HTMLElement, "return value should be an instance of HTMLElement");
	});

	QUnit.test("setVisible should hide and show the MessagePopover", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		var oDomRef = this.oMessagePopover.getDomRef();

		assert.ok(oDomRef instanceof HTMLElement, "return value should be an instance of HTMLElement");

		this.oMessagePopover.setVisible(false);
		this.clock.tick(100);
		oDomRef = this.oMessagePopover.getDomRef();

		assert.equal(oDomRef, null, "return value should be null");

		this.oMessagePopover.setVisible(true);
		this.clock.tick(500);
		oDomRef = this.oMessagePopover.getDomRef();

		assert.ok(oDomRef instanceof HTMLElement, "return value should be an instance of HTMLElement");
	});

	QUnit.test("setBusy should set the busy to the Popover as well", function (assert) {
		this.oMessagePopover.setBusy(true);

		assert.ok(this.oMessagePopover.getBusy(), "busy state should be set true");
		assert.ok(this.oMessagePopover._oPopover.getAggregation("_popup").getBusy(), "busy state of the Popover should be set to true");

		this.oMessagePopover.setBusy(false);

		assert.ok(!this.oMessagePopover.getBusy(), "busy state should be set false");
		assert.ok(!this.oMessagePopover._oPopover.getAggregation("_popup").getBusy(), "busy state of the Popover should be set to false");
	});

	QUnit.test("$() should return jQuery object", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		var $oDomRef = this.oMessagePopover.$();

		assert.ok($oDomRef instanceof jQuery, "return value should be an instance of jQuery");
	});

	QUnit.test("setPlacement() should set the placement when valid placement is used", function (assert) {
		this.oMessagePopover.setPlacement(VerticalPlacementType.Bottom);
		assert.strictEqual(this.oMessagePopover.getPlacement(), VerticalPlacementType.Bottom, "message popover should be placed at the Bottom");

		this.oMessagePopover.setPlacement(VerticalPlacementType.Top);
		assert.strictEqual(this.oMessagePopover.getPlacement(), VerticalPlacementType.Top, "message popover should be placed at the Top");

		this.oMessagePopover.setPlacement(VerticalPlacementType.Vertical);
		assert.strictEqual(this.oMessagePopover.getPlacement(), VerticalPlacementType.Vertical, "message popover should be placed Vertical");
	});

	QUnit.test("setPlacement() should throw and error when invalid placement is used", function (assert) {
		assert.throws(function () {
			this.oMessagePopover.setPlacement(PlacementType.Left);
		}, "message popover should throw an error when positioned on the Left");

		assert.throws(function () {
			this.oMessagePopover.setPlacement(PlacementType.Right);
		}, "message popover should throw an error when positioned on the Right");

		assert.throws(function () {
			this.oMessagePopover.setPlacement(PlacementType.Horizontal);
		}, "message popover should throw an error when positioned Horizontal");

		assert.throws(function () {
			this.oMessagePopover.setPlacement(PlacementType.Auto);
		}, "message popover should throw an error when positioned Auto");
	});

	QUnit.test("isOpen() should return correct boolean value", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		assert.strictEqual(this.oMessagePopover.isOpen(), true, "message popover should be open");

		this.oMessagePopover.close();
		this.clock.tick(500);
		assert.strictEqual(this.oMessagePopover.isOpen(), false, "message popover should be closed");
	});

	QUnit.test("isOpen() should return false if no popover is present", function (assert) {
		// Arrange
		this.oMessagePopover._oPopover.destroy();
		this.oMessagePopover._oPopover = null;

		// Assert
		assert.strictEqual(this.oMessagePopover.isOpen(), false, "isOpen should not throw an error and should return false");
	});

	QUnit.test("openBy() should open the popover with arrow", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		assert.equal(this.oMessagePopover.$("arrow").length, 1, "message popover should has arrow");
	});

	QUnit.test("openBy() called from sap.m.Toolbar button should open the popover without arrow", function (assert) {
		var oToolbar = new Toolbar({ content: this.oButton });
		oToolbar.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		assert.equal(this.oMessagePopover.$("arrow").length, 0, "message popover should not has arrow");

		oToolbar.destroy();
	});

	QUnit.test("beforeOpen callback should be called with correct parameter and this binding", function (assert) {
		this.oMessagePopover.openBy(this.oButton);

		assert.strictEqual(this.oSpies.beforeOpen.calledOnce, true, "callback is called only once");

		assert.strictEqual(this.oSpies.beforeOpen.calledBefore(this.oSpies.afterOpen), true, "callback should be called before afterOpen");
		assert.strictEqual(this.oSpies.beforeOpen.calledBefore(this.oSpies.beforeClose), true, "callback should be called before beforeClose");
		assert.strictEqual(this.oSpies.beforeOpen.calledBefore(this.oSpies.afterClose), true, "callback should be called before afterClose");

		assert.strictEqual(this.oSpies.beforeOpen.calledOn(this.oMessagePopover), true, "callback should be called with correct this binding");
		assert.strictEqual(this.oSpies.beforeOpen.args[0][0].getParameter("openBy").getId(), this.oButton.getId(),
			"callback should be called with correct argument");
	});

	QUnit.test("afterOpen callback should be called with correct argument and this binding", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		assert.strictEqual(this.oSpies.afterOpen.calledOnce, true, "callback should be called only once");

		assert.strictEqual(this.oSpies.afterOpen.calledAfter(this.oSpies.beforeOpen), true, "callback should be called after beforeOpen");
		assert.strictEqual(this.oSpies.afterOpen.calledBefore(this.oSpies.beforeClose), true, "callback should be called before beforeClose");
		assert.strictEqual(this.oSpies.afterOpen.calledBefore(this.oSpies.afterClose), true, "callback should be called before afterClose");

		assert.strictEqual(this.oSpies.afterOpen.calledOn(this.oMessagePopover), true, "callback should be called with correct this binding");
		assert.strictEqual(this.oSpies.afterOpen.args[0][0].getParameter("openBy").getId(), this.oButton.getId(),
			"callback should be called with correct argument");
	});

	QUnit.test("beforeClose callback should be called with correct argument and this binding", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		this.oMessagePopover.close();

		assert.strictEqual(this.oSpies.beforeClose.calledOnce, true, "callback should be called only once");

		assert.strictEqual(this.oSpies.beforeClose.calledAfter(this.oSpies.beforeOpen), true, "callback should be called after beforeOpen");
		assert.strictEqual(this.oSpies.beforeClose.calledAfter(this.oSpies.afterOpen), true, "callback should be called after afterOpen");
		assert.strictEqual(this.oSpies.beforeClose.calledBefore(this.oSpies.afterClose), true, "callback should be called before afterClose");

		assert.strictEqual(this.oSpies.beforeClose.calledOn(this.oMessagePopover), true, "callback should be called with correct this binding");
		assert.strictEqual(this.oSpies.beforeClose.args[0][0].getParameter("openBy").getId(), this.oButton.getId(),
			"callback should be called with correct argument");
	});

	QUnit.test("afterClose callback should be called with correct argument and this binding", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		this.oMessagePopover.close();
		this.clock.tick(500);

		assert.strictEqual(this.oSpies.afterClose.calledOnce, true, "callback should be called only once");

		assert.strictEqual(this.oSpies.afterClose.calledAfter(this.oSpies.beforeOpen), true, "callback should be called after beforeOpen");
		assert.strictEqual(this.oSpies.afterClose.calledAfter(this.oSpies.afterOpen), true, "callback should be called after afterOpen");
		assert.strictEqual(this.oSpies.afterClose.calledAfter(this.oSpies.beforeClose), true, "callback should be called after beforeClose");

		assert.strictEqual(this.oSpies.afterClose.calledOn(this.oMessagePopover), true, "callback should be called with correct this binding");
		assert.strictEqual(this.oSpies.afterClose.args[0][0].getParameter("openBy").getId(), this.oButton.getId(),
			"callback should be called with correct argument");
	});

	QUnit.test("AfterOpen should always load control's overview screen", function (assert) {
		assert.expect(2);
		var done = assert.async(),
			that = this,
			fnAfterOpen = function() {
				assert.ok(that.oMessagePopover._oMessageView._isListPage());
				that.oMessagePopover._oMessageView._navContainer.to(that.oMessagePopover._oMessageView._detailsPage);
				that.oMessagePopover.close();
				that.clock.tick(500);
			};

			that.oMessagePopover.attachAfterOpen(fnAfterOpen);
			that.oMessagePopover.openBy(that.oButton);
			that.clock.tick(500);

			assert.ok(that.oMessagePopover._oMessageView._isListPage());
			done();
	});

	QUnit.test("addStyleClass should add class", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		var $oDomRef = this.oMessagePopover.$();

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");

		this.oMessagePopover.addStyleClass("test");

		assert.ok($oDomRef.hasClass("test"), "should have 'test' class");
	});

	QUnit.test("removeStyleClass should remove class", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		var $oDomRef = this.oMessagePopover.$();

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");

		this.oMessagePopover.addStyleClass("test");

		assert.ok($oDomRef.hasClass("test"), "should have 'test' class");

		this.oMessagePopover.removeStyleClass("test");

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");
	});

	QUnit.test("toggleStyleClass should toggle class", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		var $oDomRef = this.oMessagePopover.$();

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");

		this.oMessagePopover.toggleStyleClass("test");

		assert.ok($oDomRef.hasClass("test"), "should have 'test' class");

		this.oMessagePopover.toggleStyleClass("test");

		assert.ok(!$oDomRef.hasClass("test"), "should not have 'test' class");
	});

	QUnit.test("hasStyleClass should check if class is added", function (assert) {
		this.oMessagePopover.openBy(this.oButton);

		assert.ok(!this.oMessagePopover.hasStyleClass("test"), "should not have 'test' class");

		this.oMessagePopover.addStyleClass("test");

		assert.ok(this.oMessagePopover.hasStyleClass("test"), "should have 'test' class");
	});

	QUnit.test("_collapseMsgPopover() is called on opening when initiallyExpanded=false", function (assert) {
		var shrinkSpy = sinon.spy();

		this.oMessagePopover._collapseMsgPopover = shrinkSpy;
		this.oMessagePopover.setInitiallyExpanded(false);

		this.oMessagePopover.openBy(this.oButton);
		this.oMessagePopover.close();

		assert.strictEqual(shrinkSpy.calledOnce, true, "_collapseMsgPopover() is called the first time");

		this.oMessagePopover.openBy(this.oButton);

		assert.strictEqual(shrinkSpy.callCount, 2, "_collapseMsgPopover() is called the second time");
	});

	QUnit.test("_collapseMsgPopover() is NOT called on opening when initiallyExpanded=false and there is only one item", function (assert) {
		var oMessagePopover = new MessagePopover({
				items: {
					path: "/messages",
					template: new MessageItem({
						type: "{type}",
						title: "{title}",
						subtitle: "{subtitle}",
						counter: 1,
						description: "{description}",
						longtextUrl: "{longtextUrl}",
						markupDescription: false
					})
				}
			}),
			shrinkSpy = sinon.spy(oMessagePopover, "_collapseMsgPopover"),
			oMockupData = {
				count: 1,
				messages: [{
					type: "Warning",
					title: "Warning without description",
					description: ""
				}]
			},
			oModel = new JSONModel(oMockupData);

		oMessagePopover.setModel(oModel);
		oMessagePopover.setInitiallyExpanded(false);

		oMessagePopover.openBy(this.oButton);
		oMessagePopover.close();

		assert.strictEqual(shrinkSpy.callCount, 0, "_collapseMsgPopover() is not called the first time");

		oMessagePopover.openBy(this.oButton);

		assert.strictEqual(shrinkSpy.callCount, 0, "_collapseMsgPopover() is not called the second time");

		// Clean
		shrinkSpy.restore();
		oMessagePopover.destroy();
	});

	QUnit.test("_restoreFocus", function (assert) {
		var restoreFocusSpy = sinon.spy(this.oMessagePopover._oMessageView, "_restoreFocus");
		this.oMessagePopover.openBy(this.oButton);

		this.clock.tick(500);
		assert.strictEqual(restoreFocusSpy.callCount, 1, "_restoreFocus() should be called after opening");

		// Clean
		restoreFocusSpy.restore();
	});

	QUnit.test("_restoreFocus should not be called", function (assert) {
		var restoreFocusSpy = sinon.spy(this.oMessagePopover._oMessageView, "_restoreFocus");
		this.oMessagePopover.setInitiallyExpanded(false);
		this.oMessagePopover.openBy(this.oButton);

		this.clock.tick(500);
		assert.strictEqual(restoreFocusSpy.callCount, 0, "_restoreFocus() should not be called after opening");
		assert.strictEqual(document.activeElement, this.oMessagePopover._oMessageView._oSegmentedButton.getDomRef(), "The initial focus is over the segmented button");

		// Clean
		restoreFocusSpy.restore();
	});

	QUnit.test("When initialized without items template should automatically perform binding to the Message Model", function (assert) {
		var oModel = new JSONModel({
			form: {
				name: "Form Name"
			}
		});

		Messaging.addMessages(
				new Message({
					message: "Invalid order of characters in this name!",
					type: MessageType.Warning,
					target: "/form/name",
					processor: oModel
				})
		);

		this.oMessagePopover.openBy(this.oButton);

		this.clock.tick(500);
		assert.equal(this.oMessagePopover._oMessageView.getItems().length, 1, "The message should be one");

		// cleanup
		Messaging.removeAllMessages();
	});

	QUnit.test("When all messages from model are removed, MessageView / Popover should return to home page", function (assert) {
		var oMessagePopover = new MessagePopover();
		var fnAddMessage = function() {
			Messaging.addMessages(
				new Message({
					message: "Something wrong happend!",
					description: "Some Description",
					type: MessageType.Warning,
					processor: new JSONModel()
				})
			);
		};
		var fnClearMessages = function() {
			Messaging.removeAllMessages();
		};

		var oBtn = new Button({
			press: function (oEvent) {
				oMessagePopover.openBy(oEvent.oSource);
			}
		}).placeAt("qunit-fixture");
		Core.applyChanges();

		fnClearMessages();
		oBtn.firePress();
		Core.applyChanges();
		this.clock.tick(500);

		// store pages
		var oMessagePopoverCurrentPage = oMessagePopover._oMessageView._navContainer.getCurrentPage();
		assert.strictEqual(oMessagePopover._oMessageView._listPage, oMessagePopoverCurrentPage, "List Page should be visible");

		fnAddMessage();
		Core.applyChanges();

		// store pages
		oMessagePopoverCurrentPage = oMessagePopover._oMessageView._navContainer.getCurrentPage();
		assert.strictEqual(oMessagePopover._oMessageView._detailsPage, oMessagePopoverCurrentPage, "Details Page should be visible");

		fnClearMessages();
		Core.applyChanges();

		// store pages
		oMessagePopoverCurrentPage = oMessagePopover._oMessageView._navContainer.getCurrentPage();
		assert.strictEqual(oMessagePopover._oMessageView._listPage, oMessagePopoverCurrentPage, "List Page should be visible");

		oBtn.destroy();
		oMessagePopover.destroy();
	});

	QUnit.test("Filtering after resize should not reset the height of the Popover", function(assert) {
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		var $Content = this.oMessagePopover.$("cont");
		$Content.css("height", "10px");

		this.oMessagePopover._expandMsgPopover();
		this.clock.tick(500);

		assert.strictEqual($Content.height(), 10, "height should be the same as before filtering");
	});

	QUnit.test("Initially collapsed popover should be able to expand", function(assert) {
		var $Content;
		this.oMessagePopover.setInitiallyExpanded(false);
		Core.applyChanges();
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		this.oMessagePopover._expandMsgPopover();
		this.clock.tick(500);
		$Content = this.oMessagePopover.$("cont");

		assert.strictEqual($Content.height(), 320, "height should be 320px");
	});

	QUnit.test("The items in the list should have info state set according to the message type", function(assert) {
		var aItems;

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
		aItems = this.oMessagePopover._oMessageView._oLists.all.getItems();

		assert.strictEqual(aItems[0].getInfoState(), ValueState.Error, "The value state should be Error in case of error message.");
		assert.strictEqual(aItems[1].getInfoState(), ValueState.Warning, "The value state should be Warning in case of warning message.");
		assert.strictEqual(aItems[2].getInfoState(), ValueState.Success, "The value state should be Success in case of success message.");
		assert.strictEqual(aItems[4].getInfoState(), ValueState.None, "The value state should be None in case of information message.");
	});

	QUnit.test("Active Items: MessageView should forward the event to the MPO", function (assert) {
		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		var oActiveTitlePressStub = this.stub(this.oMessagePopover, "fireActiveTitlePress");
		this.oMessagePopover._oMessageView._oLists.all.getItems()[0].fireActiveTitlePress();
		this.clock.tick(100);

		assert.ok(oActiveTitlePressStub.called, "Event should be forwarded");
	});

	QUnit.module("HTML representation", {
		beforeEach: function () {
			this.oMessagePopover = new MessagePopover();

			this.oButton = new Button({
				text: "Show MessagePopover"
			});

			this.oButton.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oMessagePopover.destroy();
			this.oButton.destroy();

			this.oMessagePopover = null;
			this.oButton = null;
		}
	});

	QUnit.test("MessagePopover's filter should not be displayed if there is only one type of messages", function(assert){

		var oItem = new MessageItem({title: "MessageItem", type: "Error"}),
			oItem2 = new MessageItem({title: "MessageItem", type: "Error"});

		this.oMessagePopover.insertItem(oItem);
		this.oMessagePopover.insertItem(oItem2);

		this.oMessagePopover.openBy(this.oButton);
		Core.applyChanges();

		assert.strictEqual(this.oMessagePopover._oMessageView._oSegmentedButton.getVisible(), false, "no header buttons should be rendered");
	});

	QUnit.test("MessagePopover's filter should be displayed if there are more that one type of messages", function(assert){

		var oItem = new MessageItem({title: "MessageItem", type: "Error"}),
			oItem2 = new MessageItem({title: "MessageItem", type: "Warning"});

		this.oMessagePopover.insertItem(oItem);
		this.oMessagePopover.insertItem(oItem2);

		this.oMessagePopover.openBy(this.oButton);
		Core.applyChanges();

		assert.strictEqual(this.oMessagePopover._oMessageView._oSegmentedButton.getVisible(), true, "header buttons should be rendered");
	});

	QUnit.test("sapMMsgPopover class should be present", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		var oDomRef = this.oMessagePopover.getDomRef();

		assert.notStrictEqual(oDomRef.className.indexOf("sapMMsgPopover"), -1, "sapMMsgPopover class should present on the HTML element");
	});

	QUnit.test("sapMMsgPopover-init class should be present when initiallyExpanded=false", function (assert) {
		this.oMessagePopover.setInitiallyExpanded(false);
		this.oMessagePopover.openBy(this.oButton);
		var oDomRef = this.oMessagePopover.getDomRef();

		assert.notStrictEqual(oDomRef.className.indexOf("sapMMsgPopover-init"), -1,
			"sapMMsgPopover-init class should present on the HTML element");
	});

	QUnit.test("sapMMsgPopover-init class should be present after shrinking the MessagePopover", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		this.oMessagePopover._collapseMsgPopover();
		Core.applyChanges();

		var oDomRef = this.oMessagePopover.getDomRef();

		assert.notStrictEqual(oDomRef.className.indexOf("sapMMsgPopover-init"), -1,
			"sapMMsgPopover-init class should present on the HTML element");
	});

	QUnit.test("MessageItem's with truncated title", function (assert) {
		var sLongTitle = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod" +
				"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam," +
				"quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo" +
				"consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse" +
				"cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non" +
				"proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

		this.oMessagePopover.addItem(new MessageItem({
			title: sLongTitle
		}));

		this.oMessagePopover.addItem(new MessageItem({
			title: "dummy item"
		}));

		Core.applyChanges();

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		assert.strictEqual(this.oMessagePopover._oMessageView._oLists.all.getItems()[0].getType(), "Navigation", "The first item should be navigation type");
	});

	QUnit.test("aria-labelledby attribute", function (assert) {
		this.oMessagePopover.openBy(this.oButton);
		var oDomRef = this.oMessagePopover.getDomRef(),
			sInvisibleHeadingLabelId = this.oMessagePopover.getId() + "-messageView-HeadingDescr",
			sActualAriaLabelledBy = oDomRef.getAttribute("aria-labelledby");

		assert.ok(sActualAriaLabelledBy !== null, "should be present");
		assert.ok(sActualAriaLabelledBy.indexOf(sInvisibleHeadingLabelId) !== -1, "should have a reference to the hidden text with heading messages description");
	});

	QUnit.test("MessagePopover's behavior in different screens on Desktop", function (assert) {
		//System under test
		this.stub(Device, "system").value({desktop: true});

		var oMessagePopover = new MessagePopover({
			items: [
				new MessageItem({
					type: MessageType.Error,
					title: 'ERROR',
					description: 'ERROR desc'
				})
			]
		});
		Core.applyChanges();


		// Act
		// Open the popover normally
		oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		// Emulate a small screen size on desktop
		oMessagePopover._oPopover.setContentHeight("0px");
		Core.applyChanges();

		// Close the popover
		oMessagePopover.close();
		this.clock.tick(500);

		// Open it again
		oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);


		// Assert
		assert.notStrictEqual(oMessagePopover._oPopover.getContentHeight(), "0px", "Popover's height not to be set to 0");

		// Clean
		oMessagePopover.destroy();
	});

	QUnit.module("Public API for async handlers", {
		sCustomId: "custom-msg-popover-id",
		oSpies : {},
		beforeEach: function () {
			var that = this;

			that.promiseDescription = new Promise(function(resolve) {
				that.resolveDescription = resolve;
			});

			that.promiseURL = new Promise(function(resolve) {
				that.resolveURL = resolve;
			});

			MessagePopover.setDefaultHandlers({
				asyncDescriptionHandler: function(config) {
					config.item.setDescription(that.mockMarkupDescription);
					config.promise.resolve();
					that.resolveDescription();
				},
				asyncURLHandler: function(config) {
					var allowed = config.url.lastIndexOf("http", 0) < 0;
					config.promise.resolve({
						allowed: allowed,
						id: config.id
					});
					that.resolveURL();
				}
			});

			this.oMessagePopover = new MessagePopover(this.sCustomId, {});

			this.oButton = new Button({
				text: "Show MessagePopover"
			});

			this.oButton.addDependent(this.oMessagePopover);

			this.oMockupData = {
				count: 5,
				messages: [{
					type: "Error",
					title: "Error message",
					description: "<p>First Error message description</p>",
					markupDescription: true
				}, {
					type: "Warning",
					title: "Warning without description",
					description: "",
					markupDescription: true
				}, {
					type: "Success",
					title: "Success message",
					description: "<p>First Success message description</p>",
					markupDescription: true
				}, {
					type: "Error",
					title: "Error",
					description: "<p>Second Error message description</p>",
					markupDescription: true
				}, {
					type: "Information",
					title: "Information message (Long)",
					description: "<h1>HTML sanitization test</h1><h3>heading</h3><p>paragraph</p><embed src='helloworld.swf'> <object width=\"400\" height=\"400\"></object>",
					longtextUrl: "protocol://domain.tld",
					markupDescription: true
				}]};

			this.mockMarkupDescription = "<h2>Heading h2</h2><script>alert('this JS will be sanitized')<\/script>" +
					"<p>Paragraph. At vero eos et accusamus et iusto odio dignissimos ducimus qui ...</p>" +
					"<ul>" +
					"	<li>Unordered list item 1 <a href=\"http://sap.com/some/url\">Absolute URL</a></li>" +
					"	<li>Unordered list item 2</li>" +
					"</ul>" +
					"<ol>" +
					"	<li>Ordered list item 1 <a href=\"/relative/url\">Relative URL</a></li>" +
					"	<li>Ordered list item 2</li>" +
					"</ol>";

			this.oMessageTemplate = new MessageItem({
				type: "{type}",
				title: "{title}",
				description: "{description}",
				longtextUrl: "{longtextUrl}",
				markupDescription: "{markupDescription}"
			});

			this.oButton.placeAt("qunit-fixture");
			Core.applyChanges();

			sinon.stub(ObjectPool.prototype, "returnObject").callsFake(function(){});
		},
		bindMessagePopover: function(oMessagePopover, oData) {
			var oModel = new JSONModel();
			oModel.setData(oData);
			oMessagePopover.setModel(oModel);

			oMessagePopover.bindAggregation("items", {
				path: "/messages",
				template: this.oMessageTemplate
			});
		},
		openDetailPageAfterOpen: function(oMessagePopover, iItem) {
			oMessagePopover.attachAfterOpen(function() {
				var oItem = oMessagePopover._oMessageView._oLists['all'].getItems()[iItem].getDomRef();
				qutils.triggerEvent("tap", oItem);
			});
		},
		afterEach: function() {
			this.oMessagePopover.destroy();
			this.oButton.destroy();

			ObjectPool.prototype.returnObject.restore();
			this.oMessagePopover = null;
			this.oButton = null;
			this.oMockupData = null;
			this.oMessageTemplate.destroy();
		}
	});

	QUnit.test("Async description handler", function (assert) {
		var done = assert.async();

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);

		this.promiseDescription.then(function () {
			assert.ok(true, "Default async description handler has been executed");
			done();
		});

		this.openDetailPageAfterOpen(this.oMessagePopover, 4);

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
	});

	QUnit.test("Async URL handler", function (assert) {
		var done = assert.async();

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);

		this.promiseURL.then(function () {
			assert.ok(true, "Default async URL handler has been executed");
			done();
		});

		this.openDetailPageAfterOpen(this.oMessagePopover, 4);

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);
	});

	QUnit.test("MessageItems type Navigation", function (assert) {
		var aItems;

		this.oMockupData.messages.forEach(function (message) {
			message["description"] = "";
		});

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		aItems = this.oMessagePopover._oMessageView._oLists.all.getItems();

		aItems.forEach(function (item) {
			assert.strictEqual(item.getType(), "Navigation", "Should be set if they have a markupDescription");
		});
	});

	QUnit.test("MessageItems type Navigation", function (assert) {
		var aItems;

		this.oMockupData.messages.forEach(function (message) {
			message["description"] = "";
			message["longtextUrl"] = "http://url.com";
			message["markupDescription"] = false;
		});

		this.bindMessagePopover(this.oMessagePopover, this.oMockupData);

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		aItems = this.oMessagePopover._oMessageView._oLists.all.getItems();

		aItems.forEach(function (item) {
			assert.strictEqual(item.getType(), "Navigation", "Should be set if they have a markupDescription");
		});
	});

	QUnit.module("Aggregation headerButton");

	QUnit.test("custom button aggregation", function (assert) {
		var customButton = new Button({
			text: "custom btn"
		});
		var oMessagePopover = new MessagePopover({
			headerButton: customButton
		});
		var oButton = new Button({
			text: "Show MessagePopover"
		});

		oButton.placeAt("qunit-fixture");
		Core.applyChanges();

		oMessagePopover.openBy(oButton);

		var btnId = '#' + customButton.getId();
		assert.equal(document.querySelectorAll(btnId).length, 1, "custom header button is rendered");

		customButton.destroy();
		oMessagePopover.destroy();
		oButton.destroy();
	});

	QUnit.module("Internal ResponsivePopover");

	QUnit.test("openBy method should not call setShowArrow on phone", function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			tablet: false,
			phone: true
		});

		var oMessagePopover = new MessagePopover(),
			oButton = new Button({
				text: "Show MessagePopover"
			});

		oMessagePopover._oPopover.getAggregation("_popup").setShowArrow = function () {};
		var spySetShowArrow = sinon.spy(oMessagePopover._oPopover.getAggregation("_popup"), "setShowArrow");

		oButton.placeAt("qunit-fixture");
		Core.applyChanges();

		oMessagePopover.openBy(oButton);

		assert.equal(spySetShowArrow.callCount, 0, "setShowArrow should not be called when opened on phone");

		oMessagePopover.destroy();
		oButton.destroy();
		spySetShowArrow.restore();
	});

	QUnit.test("openBy method should call setShowArrow on desktop", function (assert) {
		this.stub(Device, "system").value({
			desktop: true,
			tablet: false,
			phone: false
		});

		var oMessagePopover = new MessagePopover(),
				oButton = new Button({
					text: "Show MessagePopover"
				});

		oMessagePopover._oPopover.getAggregation("_popup").setShowArrow = function () {};
		var spySetShowArrow = sinon.spy(oMessagePopover._oPopover.getAggregation("_popup"), "setShowArrow");

		oButton.placeAt("qunit-fixture");
		Core.applyChanges();

		oMessagePopover.openBy(oButton);

		assert.equal(spySetShowArrow.callCount, 1, "setShowArrow should be called once when opened on desktop");
		assert.ok(spySetShowArrow.calledWith(true), "setShowArrow should be called once when opened from button which is not part of toolbar or SemanticPage");

		oMessagePopover.destroy();
		oButton.destroy();
		spySetShowArrow.restore();
	});

	QUnit.test("openBy method should call setShowArrow on desktop", function (assert) {
		this.stub(Device, "system").value({
			desktop: true,
			tablet: false,
			phone: false
		});

		var oMessagePopover = new MessagePopover(),
				oButton = new Button({
					text: "Show MessagePopover"
				}),
				oToolbar = new Toolbar({
					content: oButton
				});

		oMessagePopover._oPopover.getAggregation("_popup").setShowArrow = function () {};
		var spySetShowArrow = sinon.spy(oMessagePopover._oPopover.getAggregation("_popup"), "setShowArrow");

		oToolbar.placeAt("qunit-fixture");
		Core.applyChanges();

		oMessagePopover.openBy(oButton);

		assert.equal(spySetShowArrow.callCount, 1, "setShowArrow should be called once when opened on desktop");
		assert.ok(spySetShowArrow.calledWith(false), "setShowArrow should be called once when opened from button which in Toolbar or SemanticPage");

		oMessagePopover.destroy();
		oToolbar.destroy();
		spySetShowArrow.restore();
	});

	QUnit.module("Binding", {
		beforeEach: function () {
			this.oButton2 = new Button({text: "Press me"});

			var oMessageTemplate = new MessageItem({
				title: '{message}'
			});

			this.oMessagepopover2 = new MessagePopover({
				items: {
					path: '/',
					template: oMessageTemplate
				},
				initiallyExpanded: true
			});

			this.oMessagepopover2.setModel(new JSONModel([{
				"code": "APPL_MM_IV_MODEL/021",
				"message": "One",
				"severity": "error",
				"target": "/Headers(NodeKey=guid'e41d2de5-37a0-1ee6-8784-60396f9b5305',State='01')/InvoicingParty"
			}]));

			this.oButton2.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oMessagepopover2.destroy();
			this.oMessagepopover2 = null;

			this.oButton2.destroy();
			this.oButton2 = null;
		}
	});

	QUnit.test("Updating item's binding should update its property", function (assert) {
		this.oMessagepopover2.openBy(this.oButton2);
		this.clock.tick(500);

		assert.strictEqual(this.oMessagepopover2._oMessageView._oLists.error.getItems()[0].getTitle(), "One", "Title is properly set");

		this.oMessagepopover2.getModel().setProperty("/0/message", "Two");
		this.clock.tick(500);
		assert.strictEqual(this.oMessagepopover2._oMessageView._oLists.error.getItems()[0].getTitle(), "Two", "Title to be changed");
	});

	QUnit.test("No segmented button filter when not needed", function (assert) {
		this.oMessagepopover2.setInitiallyExpanded(false);
		this.oMessagepopover2.openBy(this.oButton2);

		assert.strictEqual(this.oMessagepopover2._oMessageView._oSegmentedButton.getVisible(), true, "Segmented button is not needed but must be shown because message popover is set initiallyExpanded=false");
	});

	QUnit.test("Adding item to MessagePopover", function (assert) {
		var oMessagePopover = new MessagePopover(),
			oMessageItem = new MessageItem({ title: "Test" }),
			oButton = new Button();

		oMessagePopover.addItem(oMessageItem);

		oButton.placeAt("qunit-fixture");
		Core.applyChanges();

		oMessagePopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(oMessagePopover.getItems().length);

		oMessagePopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Removing all items", function (assert) {
		var tempObject = {
			"message": "test"
		};

		this.oMessagepopover2.openBy(this.oButton2);
		this.clock.tick(500);

		this.oMessagepopover2.getModel().setData(null);
		Core.applyChanges();

		this.oMessagepopover2.getModel().setData([tempObject]);
		Core.applyChanges();

		assert.ok(this.oMessagepopover2.getItems().length);

		tempObject = null;
	});

	QUnit.test("Model should be forwarded to the internal MessageView", function (assert) {
		var oSetModelStub = this.stub(this.oMessagepopover2._oMessageView, "setModel");

		this.oMessagepopover2.setModel(new JSONModel([]), "test");

		assert.ok(oSetModelStub.called, "setModel of the MessageView should be called");
	});

	QUnit.test("Prevent auto binding to the sap.ui.getCore().getMessageManager() when there's a model", function (assert) {
		// Setup
		var oMessagePopover = new MessagePopover({
				items: {
					path: '/',
					template: new MessageItem({
						type: '{type}',
						title: '{title}'
					})
				}
			}),
			oButton = new Button();

		oMessagePopover.setModel(new JSONModel());
		oButton.addDependent(oMessagePopover);
		oButton.placeAt("qunit-fixture");
		Core.applyChanges();

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
		Messaging.addMessages(oMessage);
		Core.applyChanges();

		oMessagePopover.openBy(oButton);
		Core.applyChanges();
		this.clock.tick(500);

		//Assert
		assert.strictEqual(oMessagePopover._oMessageView.getItems().length, 0, "If the MessagePopover is bound to a model, the MessageView should not bind to the MessageManager");

		//Cleanup
		oMessage.destroy();
		oMessagePopover.destroy();
		oButton.destroy();
		Messaging.removeAllMessages();
	});

	QUnit.test("Auto bind to the sap.ui.getCore().getMessageManager() when there are items or binding", function (assert) {
		// Setup
		var oMessagePopover = new MessagePopover(),
			oButton = new Button();

		oButton.addDependent(oMessagePopover);
		oButton.placeAt("qunit-fixture");
		Core.applyChanges();

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
		Messaging.addMessages(oMessage);
		Core.applyChanges();

		oMessagePopover.openBy(oButton);
		Core.applyChanges();
		this.clock.tick(500);

		//Assert
		assert.strictEqual(oMessagePopover._oMessageView.getItems().length, 1, "If the MessagePopover is not bound to a model, the MessageView should bind to the MessageManager");
		assert.strictEqual(oMessagePopover._oMessageView.getItems()[0].getTitle(), "Simple message", "The message should be the one from the MessageManager");

		//Cleanup
		oMessage.destroy();
		oMessagePopover.destroy();
		oButton.destroy();
		Messaging.removeAllMessages();
	});

	QUnit.test("Update binding of single item should change its properties (integration test)", function (assert) {
		var oMessageTemplate = new MessageItem({
			type: '{messageSummary>type}',
			title: '{messageSummary>message}'
		});

		var oMessagePopover = new MessagePopover({
			items: {
				path: "messageSummary>/",
				template: oMessageTemplate
			}
		});

		var oButton = new Button();
		var sWarningText = "[WARNING] Veniam esse veniam nisi irure et labore eu consectetur dolor.";

		var oChangeToWarningBtn = new Button({
			press: function () {
				_setMessageModel(sWarningText, "Warning");
				Core.applyChanges();
			}
		}).placeAt("qunit-fixture");

		var _setMessageModel = function(sText, sType) {
			var oMessage = new Message({
				message: sText,
				type: sType
			});

			var aMessages = [oMessage];
			var oMessageModel = oMessagePopover.getModel("messageSummary");
			oMessageModel.setData(aMessages);

			oMessagePopover.navigateBack();
		};

		oMessagePopover.setModel(new JSONModel([]), "messageSummary");
		_setMessageModel("[ERROR] Veniam esse veniam nisi irure et labore eu consectetur dolor.", "Error");

		oButton.addDependent(oMessagePopover);
		oButton.placeAt("qunit-fixture");
		Core.applyChanges();


		oMessagePopover.openBy(oButton);
		Core.applyChanges();
		this.clock.tick(500);

		oChangeToWarningBtn.firePress();

		assert.strictEqual(oMessagePopover._oMessageView._oMessageIcon.getSrc(), IconPool.getIconURI("alert"), "Icon should be warning");
		assert.strictEqual(oMessagePopover._oMessageView._detailsPage.getContent()[0].getText(), sWarningText, "Text should be warning");

		oButton.destroy();
		oMessagePopover.destroy();
		oChangeToWarningBtn.destroy();
	});

	QUnit.module("Refactoring", {
		beforeEach: function () {
			var oMessageTemplate = new MessageItem({
				type: "{type}",
				title: "{title}",
				subtitle: "{subtitle}",
				description: "{description}"
			});

			var oMockData = {
				messages: [{
					type: "Error",
					title: "Error message",
					subtitle: "Subtitle",
					description: "<p>First Error message description</p>"
				}, {
					type: "Warning",
					title: "Warning without description",
					description: ""
				}, {
					type: "Success",
					title: "Success message",
					description: "<p>&First Success message description</p>"
				}]};

			this.oMessagePopover = new MessagePopover({
				items: {
					path: "/messages",
					template: oMessageTemplate
				},
				initiallyExpanded: true
			});

			this.oModel = new JSONModel(oMockData);

			this.oButton = new Button({text: "Press me"});

			this.oButton.placeAt("qunit-fixture");
		},
		afterEach: function () {
			// Clean
			this.oButton.destroy();
			this.oButton = null;

			this.oMessagePopover.destroy();
			this.oMessagePopover = null;

			this.oModel = null;
		}
	});

	QUnit.test("Model set via addDependent method", function (assert) {
		//System under test
		this.oButton.addDependent(this.oMessagePopover);
		this.oButton.setModel(this.oModel);
		Core.applyChanges();

		//Act
		var aMVItems = this.oMessagePopover._oMessageView.getItems();
		//Assert
		assert.strictEqual(aMVItems.length, 3, "Items are forwarded to the MessageView items aggregation");
	});

	QUnit.test("Model set via addDependent method - after the MessagePopover is opened", function (assert) {
		//System under test
		this.oButton.addDependent(this.oMessagePopover);
		this.oButton.setModel(this.oModel);
		Core.applyChanges();

		//Act
		//Open the MessagePopover
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		var aMVItems = this.oMessagePopover._oMessageView.getItems(),
				aMPItems = this.oMessagePopover.getItems();

		//Assert
		assert.ok(Array.isArray(aMVItems), "There is an array of items in the MessageView");
		assert.strictEqual(aMVItems.length, aMPItems.length, "The items in the MessageView are the same number as in the MessagePopover");
	});

	QUnit.test("Model set directly on the MessagePopover and items are forwarded to the MessageView", function (assert) {
		//System under test
		this.oMessagePopover.setModel(this.oModel);
		Core.applyChanges();

		//Act
		var aMVItems = this.oMessagePopover._oMessageView.getItems();
		//Assert
		assert.strictEqual(aMVItems.length, 3, "The items array is empty");
	});

	QUnit.test("After the MessagePopover is opened - there are items in the MessageView", function (assert) {
		//System under test
		this.oMessagePopover.setModel(this.oModel);
		Core.applyChanges();

		//Act
		//Open the MessagePopover
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		var aMVItems = this.oMessagePopover._oMessageView.getItems(),
				aMPItems = this.oMessagePopover.getItems();

		//Assert
		assert.strictEqual(aMVItems[0].mBindingInfos, aMPItems[0].mBindingInfos, "The Binding information is the same for the MessagePopover and the MessageView items");
		assert.ok(Array.isArray(aMVItems), "There is an array of items in the MessageView");
		assert.strictEqual(aMVItems.length, aMPItems.length, "The items in the MessageView are the same number as in the MessagePopover");
	});

	QUnit.test("Changing property in any MessagePopover item should update the items in the MessageView", function (assert) {
		//System under test
		this.oMessagePopover.setModel(this.oModel);
		Core.applyChanges();

		//Act
		//Open the MessagePopover
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		var oItem = this.oMessagePopover.getItems()[0];
		var spyInvalidate = sinon.spy(this.oMessagePopover, "invalidate");
		oItem.setTitle("Test");
		Core.applyChanges();

		//Assert
		assert.strictEqual(this.oMessagePopover.getItems()[0].getTitle() , "Test", "The title of the first item of the MessagePopover is changed");
		assert.strictEqual(this.oMessagePopover._oMessageView.getItems()[0].getTitle() , "Test", "The title of the first item of the MessageView is changed");

		//Clean
		spyInvalidate.restore();
	});

	QUnit.test("Any custom data from the items of the MessagePopover should be cloned in the MessageView's items", function (assert) {
		//System under test
		this.oMessagePopover.setModel(this.oModel);
		Core.applyChanges();

		//Act
		this.oMessagePopover.getItems()[0].addCustomData(new CustomData({key : "test", value : true}));

		//Open the MessagePopover
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		//Assert
		assert.strictEqual(this.oMessagePopover.getItems()[0].getCustomData().length, 1, "The message popover's item has custom data.");
		assert.strictEqual(this.oMessagePopover._oMessageView.getItems()[0].getCustomData().length, 1, "The custom data was cloned into the message view's item.");
		assert.ok(this.oMessagePopover._oMessageView.getItems()[0].getCustomData()[0].getValue(), "The data was passed correctly");
	});

	QUnit.test("Any custom data from the MessagePopover should be passed to the ResponsivePopover", function (assert) {
		//Act
		this.oMessagePopover.addCustomData(new CustomData({key: "test", value: "value", writeToDom: true}));
		Core.applyChanges();

		//Open the MessagePopover
		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		//Assert
		assert.strictEqual(this.oMessagePopover.getDomRef().getAttribute("data-test"), "value", "The message popover dom has a data attribute added.");
		assert.strictEqual(this.oMessagePopover._oPopover.getCustomData().length, 1, "The custom data was cloned into the message popover's popover.");
	});

	QUnit.test("On mobile the dialog should be closed after clicking on the active title", function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			tablet: false,
			phone: true
		});

		var oMessagePopover = new MessagePopover({
			items: [
				new MessageItem({
					activeTitle: true,
					title: "Test",
					description: "lorem"
				})
			]
		});
		var oCloseStub = this.stub(oMessagePopover, "close");
		Core.applyChanges();

		oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		//fire activeTitlePress on the first element
		oMessagePopover._oMessageView._oLists['all'].getItems()[0].fireActiveTitlePress();

		//Assert
		assert.ok(oCloseStub.called, "MessagePopover should be closed when the active title is pressed");

		//Clean
		oMessagePopover.destroy();
	});

	QUnit.test("MessagePopover opened by a button, should be auto closed in case the DOM of this button is removed", function(assert){
		// arrange
		this.oButton.addDependent(this.oMessagePopover);
		Core.applyChanges();

		this.oMessagePopover.openBy(this.oButton);
		this.clock.tick(500);

		assert.ok(this.oMessagePopover.isOpen(), "MessagePopover is open");

		// act
		this.oButton.setVisible(false);
		this.oMessagePopover.invalidate();
		this.clock.tick(500);

		// assert
		assert.ok(!this.oMessagePopover.isOpen(), "Popover is now closed");
		assert.ok(true, "No exception has been thrown");
	});

	QUnit.test("MessagePopover's navigateBack should serve as proxy to the MessageView", function (assert) {
		//Arrange
		var oNavigateBackSpy = sinon.spy(this.oMessagePopover._oMessageView, "navigateBack");

		Core.applyChanges();

		//Act
		this.oMessagePopover.navigateBack();
		this.clock.tick(500);

		//Assert
		assert.strictEqual(oNavigateBackSpy.callCount, 1, "MessageView's navigateBack() is called.");
	});

	QUnit.test("Should not throw if no MessageView is present", function (assert) {
		// Arrange
		this.oMessagePopover._oMessageView = null;

		// Act
		this.oMessagePopover._setInitialFocus();
		this.oMessagePopover._syncMessageView();
		this.oMessagePopover.onBeforeRenderingPopover();
		this.oMessagePopover._restoreExpansionDefaults();
		this.oMessagePopover.setModel(null, "Name");
		this.oMessagePopover.navigateBack();

		// Assert
		assert.ok(true, "No exception is thrown");
	});

	//================================================================================
	// MessagePopover accessibility
	//================================================================================

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.oMessagePopover = new MessagePopover();
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oMessagePopover.close();
			this.oMessagePopover.destroy();

			this.oButton.destroy();
		}
	});

	QUnit.test("MessagePopover should have accessibility attribute aria-modal set to false", function(assert) {
		// act
		this.oMessagePopover.openBy(this.oButton);

		// assert
		assert.strictEqual(this.oMessagePopover.getDomRef().getAttribute('aria-modal'), "false", 'aria-modal attribute is false');
	});
});