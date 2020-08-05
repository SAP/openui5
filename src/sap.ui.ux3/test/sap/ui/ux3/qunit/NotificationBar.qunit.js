/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/ux3/NotificationBar",
	"sap/ui/ux3/Notifier",
	"sap/ui/core/Message",
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/ux3/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/events/jquery/EventExtension"
], function(
    qutils,
	createAndAppendDiv,
	NotificationBar,
	Notifier,
	Message,
	coreLibrary,
	jQuery,
	ux3Library,
	KeyCodes
) {
	"use strict";

	// prepare DOM
	// shortcut for sap.ui.ux3.NotificationBarStatus
	var NotificationBarStatus = ux3Library.NotificationBarStatus;

	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

	createAndAppendDiv("uiArea1").setAttribute("style", "margin-top: 40px;");


	var oNotiBar;

	function openHandler(oEvent) {
		var bShow = oEvent.getParameter("show");
		if (bShow) {
			oNotiBar.setVisibleStatus("Default");
		} else {
			oNotiBar.setVisibleStatus("None");
		}
		sap.ui.getCore().applyChanges();
	}

	function minimize(assert, oNBar, sFrom, sTo, done) {
		oNBar.setVisibleStatus(sFrom);
		sap.ui.getCore().applyChanges();

		var iBefore = oNBar.$().height();

		oNBar.setVisibleStatus(sTo);
		sap.ui.getCore().applyChanges();

		var iAfter = oNBar.$().height();

		assert.ok(iBefore > iAfter, "Bar minimized from " + sFrom + " to " + sTo);

		if (done) {
			done();
		}
	}

	function maximize(assert, oNBar, sFrom, sTo) {
		oNBar.setVisibleStatus(sFrom);
		sap.ui.getCore().applyChanges();

		var iBefore = oNBar.$().height();

		oNBar.setVisibleStatus(sTo);
		sap.ui.getCore().applyChanges();

		var iAfter = oNBar.$().height();
		assert.ok(iBefore < iAfter, "Bar maximized from " + sFrom + " to " + sTo);
	}

	function toggleVisibility(assert, oNBar, sFrom, sTo) {
		oNBar.setVisibleStatus(sFrom);
		sap.ui.getCore().applyChanges();

		var sBefore = oNBar.$().css("display");

		oNBar.setVisibleStatus(sTo);
		sap.ui.getCore().applyChanges();

		var sAfter = oNBar.$().css("display");

		assert.notEqual(sBefore, sAfter, "Bar toggled from " + sFrom + " to " + sTo);
	}


	var fx = jQuery.fx.off;

	oNotiBar = new NotificationBar("my-very-long-id", {
		display : openHandler,
		enableResize : false
	});
	oNotiBar.placeAt("uiArea1");
	var oMN = new Notifier({
		title : "Messages"
	});

	QUnit.module("Messages", {
		beforeEach : function() {
			jQuery.fx.off = true;
		},
		afterEach : function() {
			jQuery.fx.off = fx;
		}
	});
	QUnit.test("Adding/removing messages", function(assert) {
		assert.expect(9);

		var now = (new Date()).toUTCString();
		var sText = "Lorem Ipsum";
		var sUri = "test-resources/sap/ui/ux3/images/notification_bar/Thumbnail_32.png";

		oNotiBar.setMessageNotifier(oMN);
		var oMessage = new Message("message1", {
			text : sText,
			icon : sUri,
			level : MessageType.Error,
			timestamp : now
		});
		oMN.addMessage(oMessage);

		now = (new Date()).toUTCString();
		oMessage = new Message("message2", {
			text : sText,
			icon : sUri,
			level : MessageType.Error,
			timestamp : now
		});
		oMN.addMessage(oMessage);
		sap.ui.getCore().applyChanges();

		assert.ok(oMN.hasItems(), "Message added to Notifier");
		assert.ok(oNotiBar.hasItems(), "Message reached NotificationBar");

		var bTest = oNotiBar.getVisibleStatus() != "None";
		assert.ok(bTest, "Visibility correctly changed");

		var sDisplay = oNotiBar.$().css("display");
		bTest = sDisplay === "block";
		assert.ok(bTest, "Bar displayed in DOM");

		/*
		 * Removing messages
		 */
		oMN.removeMessage(oMessage);
		sap.ui.getCore().applyChanges();
		var iCounter = oNotiBar.getMessageNotifier().getMessages().length;
		assert.ok(iCounter === 1, "One single message was removed");

		oMN.removeAllMessages();
		sap.ui.getCore().applyChanges();

		assert.ok(!oMN.hasItems(), "All Messages removed from Notifier");

		assert.ok(!oNotiBar.hasItems(), "Messages removed from bar");

		bTest = oNotiBar.getVisibleStatus() === "None";
		assert.ok(bTest, "Visibility status correctly set to None");

		sDisplay = oNotiBar.$().css("display");
		bTest = sDisplay === "none";
		assert.ok(bTest, "Bar invisible in DOM");
	});

	QUnit.test("Read-Only Messages", function(assert) {
		assert.expect(3);

		oNotiBar.setMessageNotifier(oMN);

		// test if common message WITHOUT event listener is selectable
		var now = (new Date()).toUTCString();
		var oMessage = new Message("message2readOnly", {
			text : "Common message",
			level : MessageType.Error,
			timestamp : now
		});
		oMN.addMessage(oMessage);
		sap.ui.getCore().applyChanges();

		var $InplaceText = jQuery(document.getElementById(oNotiBar.getId() + "-inplaceMessage"));
		var bTest = $InplaceText.hasClass("sapUiInPlaceMessageSelectable");
		assert.ok(!bTest, "Inplace text for common message is not selectable - there is no event listener");

		// test if common message with event listener is selectable
		oMN.attachMessageSelected(function() {
		});
		sap.ui.getCore().applyChanges();
		$InplaceText = jQuery(document.getElementById(oNotiBar.getId() + "-inplaceMessage"));
		bTest = $InplaceText.hasClass("sapUiInPlaceMessageSelectable");
		assert.ok(bTest, "Inplace text for common message is selectable");

		// test if read only message is selectable (event listener needed of course)
		now = (new Date()).toUTCString();
		var oReadOnlyMessage = new Message("message1readOnly", {
			text : "Read only message",
			level : MessageType.Error,
			timestamp : now,
			readOnly : true
		});
		oMN.addMessage(oReadOnlyMessage);
		sap.ui.getCore().applyChanges();

		$InplaceText = jQuery(document.getElementById(oNotiBar.getId() + "-inplaceMessage"));
		bTest = $InplaceText.hasClass("sapUiInPlaceMessageSelectable");
		assert.ok(!bTest, "Inplace text is not selectable because it's read only");
	});

	/*
	 * Testing from None
	 */
	QUnit.module("Resizing", {
		beforeEach : function() {
			jQuery.fx.off = true;
		},
		afterEach : function() {
			jQuery.fx.off = fx;
		}
	});
	QUnit.test("From None", function(assert) {
		assert.expect(3);
		toggleVisibility(assert, oNotiBar, "None", "Min");
		toggleVisibility(assert, oNotiBar, "None", "Default");
		toggleVisibility(assert, oNotiBar, "None", "Max");
	});

	/*
	 * Testing from Minimized
	 */
	QUnit.test("From Minimized", function(assert) {
		assert.expect(2);
		toggleVisibility(assert, oNotiBar, "Min", "None");
		maximize(assert, oNotiBar, "Min", "Default");
	});

	/*
	 * Testing from Default
	 */
	QUnit.test("From Default", function(assert) {
		assert.expect(3);
		toggleVisibility(assert, oNotiBar, "Default", "None");
		minimize(assert, oNotiBar, "Default", "Min");
		maximize(assert, oNotiBar, "Default", "Max");
	});

	/*
	 * Testing from Maximized
	 */
	QUnit.test("From Maximized", function(assert) {
		assert.expect(2);
		toggleVisibility(assert, oNotiBar, "Max", "None");
		minimize(assert, oNotiBar, "Max", "Default");
	});

	/*
	 * Testing whether the resize event is fired
	 */
	QUnit.test("Resize event", function(assert) {
		var done = assert.async();
		assert.expect(2);

		var fnResizeHandler = function() {
			oNotiBar.detachResize(fnResizeHandler);
			assert.ok(true, "Resize event was fired by the NotificationBar");
		};

		oNotiBar.attachResize(fnResizeHandler);

		minimize(assert, oNotiBar, "Max", "Default", done);
	});

	/*
	 * Testing if a Callout opens and the message is displayed
	 */
	QUnit.module("Open Callouts", {
		beforeEach : function() {
			jQuery.fx.off = true;
		},
		afterEach : function() {
			jQuery.fx.off = fx;
		}
	});
	QUnit.test("Open it", function(assert) {
		var done = assert.async();
		assert.expect(1);

		var oNotifier = new Notifier({
			title : "First Notifier"
		});
		var oMessage = new Message({
			text : "Lorem Ipsum"
		});
		oNotifier.addMessage(oMessage);
		oNotiBar.addNotifier(oNotifier);
		sap.ui.getCore().applyChanges();

		var $notifier = jQuery(document.getElementById(oNotifier.getId()));

		var oEvt = jQuery.Event("mouseover");
		$notifier.trigger(oEvt);

		oNotifier._oCallout.attachOpened(function() {
			var $message = jQuery(".sapUiNotifierMessage");
			var $child = jQuery($message.children()[0]);
			var sHtml = $child.html();

			var bTest = !!(sHtml === "Lorem Ipsum");
			assert.ok(bTest, "Notifier opened and message displayed");
			done();
		});
	});

	QUnit.module("Testing ItemNavigation", {
		beforeEach : function() {
			jQuery.fx.off = true;
		},
		afterEach : function() {
			jQuery.fx.off = fx;

			oNotiBar.destroyMessageNotifier();
			oNotiBar.destroyNotifiers();
			oNotiBar.setVisibleStatus(NotificationBarStatus.None);
		}
	});
	QUnit.test("Navigate through Notifiers (minimized)", function(assert) {
		var done = assert.async();
		assert.expect(2);

		var sKeyLeft = KeyCodes.ARROW_LEFT;
		var sKeyRight = KeyCodes.ARROW_RIGHT;

		var oMN = new Notifier({
			title : "Message Notifier"
		});
		var oMsg2 = new Message({
			text : "Lorem Ipsum"
		});
		oMN.addMessage(oMsg2);
		oNotiBar.setMessageNotifier(oMN);
		sap.ui.getCore().applyChanges();

		var aNotifiers = oNotiBar.getNotifiers();

		var notifierDomRef = aNotifiers[0].$();

		qutils.triggerMouseEvent(notifierDomRef, "focusin");

		setTimeout(function() {
			var before = document.activeElement;

			qutils.triggerKeydown(notifierDomRef, sKeyRight);

			var after = document.activeElement;

			var bTest = before.id !== after.id;
			assert.ok(bTest, "Moved from Notifier to MessageNotifier");

			setTimeout(function() {
				qutils.triggerKeydown(oMN.$(), sKeyLeft);

				var after = document.activeElement;

				var bTest = before.id === after.id;

				assert.ok(bTest, "Moved back to Notifier");
				done();
			}, 100);
		}, 1000);
	});

	QUnit.test("Navigate through messages (maximized)", function(assert) {
		var done = assert.async();
		assert.expect(5);

		var sKeyRight = KeyCodes.ARROW_RIGHT;

		var oMN = new Notifier("messageNotifier", {
			title : "Message Notifier"
		});
		var oMsg1 = new Message("messageMaximized1", {
			text : "Lorem Ipsum"
		});
		var oMsg2 = new Message("messageMaximized2", {
			text : "Lorem Ipsum"
		});
		oMN.addMessage(oMsg1);
		oMN.addMessage(oMsg2);
		oNotiBar.setMessageNotifier(oMN);

		var oN = new Notifier("anotherNotifier", {
			title : "Message Notifier"
		});
		var oMsg3 = new Message("messageMaximized3", {
			text : "Lorem Ipsum"
		});
		oN.addMessage(oMsg3);
		oNotiBar.addNotifier(oN);

		oNotiBar.setVisibleStatus(NotificationBarStatus.Max);
		sap.ui.getCore().applyChanges();

		// NotificationBar is in maximized-mode
		var oDomRef = window.document.getElementById("messageNotifier-messageNotifierView-messageView-messageMaximized2");
		jQuery(oDomRef).trigger("focus");

		setTimeout(function() {
			var before = document.activeElement;
			qutils.triggerKeydown(oDomRef, sKeyRight);

			setTimeout(function() {
				var after = document.activeElement;

				var bTest = before.id !== after.id;
				assert.ok(bTest, "Moved from first message to next one");

				bTest = after.id === "messageNotifier-messageNotifierView-messageView-messageMaximized1";
				assert.ok(bTest, "Next message notifier message focused");

				oDomRef = after.id ? window.document.getElementById(after.id) : null;
				before = after;
				qutils.triggerKeydown(oDomRef, sKeyRight);

				setTimeout(function() {
					after = document.activeElement;

					bTest = before.id !== after.id;
					assert.ok(bTest, "Moved to message of common notifier");

					oDomRef = after.id ? window.document.getElementById(after.id) : null;
					before = after;
					qutils.triggerKeydown(oDomRef, sKeyRight);

					setTimeout(function() {
						after = document.activeElement;
						bTest = before.id !== after.id;

						assert.ok(bTest, "Moved to message of common notifier");
						bTest = after.id === "messageNotifier-messageNotifierView-messageView-messageMaximized2";

						assert.ok(bTest, "Cycled through all messages and first one is focused again");
						done();
					}, 100);
				}, 100);
			}, 100);
		}, 500);
	});
});