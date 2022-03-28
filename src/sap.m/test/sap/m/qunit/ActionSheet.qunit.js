/*global QUnit, sinon */
sap.ui.define([
	"sap/m/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/ActionSheet",
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/ui/core/Core"
], function(
	library,
	App,
	Page,
	ActionSheet,
	Button,
	KeyCodes,
	Log,
	qutils,
	createAndAppendDiv,
	Device,
	oCore
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);
	document.body.insertBefore(createAndAppendDiv("uiArea"), document.body.firstChild);
	document.body.insertBefore(createAndAppendDiv("contentHolder"), document.body.firstChild);



	var ButtonType = library.ButtonType;
	var oResourceBundle = oCore.getLibraryResourceBundle("sap.m");
	var oActionSheet = new ActionSheet("actionsheet", {
		showCancelButton: true,
		buttons: [
			new Button({
				type: ButtonType.Reject,
				text: "Reject Action"
			}),
			new Button({
				type: ButtonType.Accept,
				text: "Accept Action"
			}),
			new Button({
				type: ButtonType.Default,
				text: "Default Action"
			})
		],
		cancelButtonText: "Cancel",
		title: "Please choose one action",
		placement: PlacementType.Bottom,
		cancelButtonPress: function () {
			Log.info("sap.m.ActionSheet: cancelButton is pressed");
		}
	});

	var oButton = new Button({
		text: "Open ActionSheet",
		press: function () {
			oActionSheet.openBy(this);
		}
	});

	var page = new Page("myFirstPage", {
		title: "ActionSheet Test",
		showNavButton: true,
		enableScrolling: true,
		content: oButton
	});

	var app = new App("myApp", {
		initialPage: "myFirstPage"
	});

	app.addPage(page).placeAt("content");

	function observeOpenEvents(assert) {
		var done = assert.async();
		oActionSheet.attachBeforeOpen(function onBeforeOpen() {
			oActionSheet.detachBeforeOpen(onBeforeOpen);
			assert.ok(oCore.byId("actionsheet").$().css("visibility") !== "visible", "ActionSheet should be hidden before it's opened");
		});
		oActionSheet.attachAfterOpen(function onAfterOpen() {
			oActionSheet.detachAfterOpen(onAfterOpen);
			assert.equal(oCore.byId("actionsheet").$().css("visibility"), "visible", "ActionSheet should be visible after it's opened");
			done();
		});
	}

	function observeCloseEvents(assert) {
		var done = assert.async();
		oActionSheet.attachBeforeClose(function onBeforeClose() {
			oActionSheet.detachBeforeClose(onBeforeClose);
			assert.equal(oCore.byId("actionsheet").$().css("visibility"), "visible", "ActionSheet should be visible before it's closed");
		});
		oActionSheet.attachAfterClose(function onAfterClose() {
			oActionSheet.detachAfterClose(onAfterClose);
			assert.ok(oCore.byId("actionsheet").$().css("visibility") !== "visible", "ActionSheet should be hidden after it's closed");
			assert.ok(!oActionSheet.isOpen(), "ActionSheet is already closed");
			done();
		});
	}

	QUnit.module("Initial Check");

	QUnit.test("Initialization", function (assert) {
		assert.ok(!oCore.byId("actionsheet").$().length, "ActionSheet is not rendered before it's ever opened.");
	});

	QUnit.module("Open and Close - with Title and Cancel Button");

	QUnit.test("Open ActionSheet - - with Title and Cancel Button", function (assert) {
		observeOpenEvents(assert);
		oButton.firePress();
		assert.ok(oActionSheet.isOpen(), "ActionSheet is already open");

		setTimeout(function () {
			var $actionSheet = oCore.byId("actionsheet").$(),
				$parentControl = !Device.system.phone ? $actionSheet.closest(".sapMActionSheetPopover") : $actionSheet.closest(".sapMActionSheetDialog"),
				$header = $parentControl.children("header.sapMBar"),
				$cancelButton = $actionSheet.children("button.sapMActionSheetCancelButton");
			assert.expect(8);
			assert.ok(oCore.byId("actionsheet").$(), "ActionSheet is rendered after it's opened.");
			assert.ok($actionSheet.closest("#sap-ui-static")[0], "ActionSheet should be rendered inside the static uiArea.");
			assert.ok($parentControl[0], "ActionSheet is wrapped either in Popover or Dialog");

			if (!Device.system.phone) {
				assert.ok(!($header[0]), "Title is always ignored when doesn't run on phone");
			} else {
				assert.ok($header[0], "Title is rendered");
			}
			if (!Device.system.phone) {
				assert.ok(!($cancelButton[0]), "Cancel button is never rendered when doesn't run on phone");
			} else {
				assert.ok($cancelButton[0], "Cancel button is rendered");
			}

		}, 50);
	});

	QUnit.test("Close ActionSheet", function (assert) {
		observeCloseEvents(assert);
		assert.expect(3);
		oActionSheet.close();
	});

	QUnit.module("Open and Close - with Title but no Cancel Button");

	QUnit.test("Open ActionSheet - - with Title  but no Cancel Button", function (assert) {
		observeOpenEvents(assert);
		oActionSheet.setShowCancelButton(false);
		oButton.firePress();
		assert.ok(oActionSheet.isOpen(), "ActionSheet is already open");
		setTimeout(function () {
			var $actionSheet = oCore.byId("actionsheet").$(),
				$parentControl = !Device.system.phone ? $actionSheet.closest(".sapMActionSheetPopover") : $actionSheet.closest(".sapMActionSheetDialog"),
				$header = $parentControl.children("header.sapMBar"),
				$cancelButton = $actionSheet.children("button.sapMActionSheetCancelButton");
			assert.expect(8);
			assert.ok(oCore.byId("actionsheet").$(), "ActionSheet is rendered after it's opened.");
			assert.ok($actionSheet.closest("#sap-ui-static")[0], "ActionSheet should be rendered inside the static uiArea.");
			assert.ok($parentControl[0], "ActionSheet is wrapped either in Popover or Dialog");

			if (!Device.system.phone) {
				assert.ok(!($header[0]), "Title is always ignored in iPad");
			} else {
				assert.ok($header[0], "Title is rendered");
			}
			assert.ok(!($cancelButton[0]), "showCancelButton is set to false, there is no cancel button");
		}, 50);
	});

	QUnit.test("Close ActionSheet", function (assert) {
		observeCloseEvents(assert);
		assert.expect(3);

		oActionSheet.close();
	});

	QUnit.module("Open and Close - no Title but with Cancel Button");

	QUnit.test("Open ActionSheet - - no Title but with Cancel Button", function (assert) {
		observeOpenEvents(assert);
		oActionSheet.setShowCancelButton(true);
		oActionSheet.setTitle(null);
		oButton.firePress();
		assert.ok(oActionSheet.isOpen(), "ActionSheet is already open");
		setTimeout(function () {
			var $actionSheet = oCore.byId("actionsheet").$(),
				$parentControl = !Device.system.phone ? $actionSheet.closest(".sapMActionSheetPopover") : $actionSheet.closest(".sapMActionSheetDialog"),
				$header = $parentControl.children("div.sapMBar"),
				$cancelButton = $actionSheet.children("button.sapMActionSheetCancelButton");
			assert.expect(8);
			assert.ok(oCore.byId("actionsheet").$(), "ActionSheet is rendered after it's opened.");
			assert.ok($actionSheet.closest("#sap-ui-static")[0], "ActionSheet should be rendered inside the static uiArea.");
			assert.ok($parentControl[0], "ActionSheet is wrapped either in Popover or Dialog");

			assert.ok(!($header[0]), "There is no title because title property is set to null");

			if (!Device.system.phone) {
				assert.ok(!($cancelButton[0]), "Cancel button is never rendered in iPad");
			} else {
				assert.ok($cancelButton[0], "Cancel button is rendered");
			}
		}, 50);
	});

	QUnit.test("Close ActionSheet", function (assert) {
		observeCloseEvents(assert);
		assert.expect(3);
		oActionSheet.close();
	});

	QUnit.module("Open and Close - no Title and no Cancel Button");

	QUnit.test("Open ActionSheet - - no Title and no Cancel Button", function (assert) {
		observeOpenEvents(assert);
		oActionSheet.setShowCancelButton(false);
		oActionSheet.setTitle(null);
		oButton.firePress();
		assert.ok(oActionSheet.isOpen(), "ActionSheet is already open");
		setTimeout(function () {
			var $actionSheet = oCore.byId("actionsheet").$(),
				$parentControl = !Device.system.phone ? $actionSheet.closest(".sapMActionSheetPopover") : $actionSheet.closest(".sapMActionSheetDialog"),
				$header = $parentControl.children("div.sapMBar"),
				$cancelButton = $actionSheet.children("button.sapMActionSheetCancelButton");
			assert.expect(8);
			assert.ok(oCore.byId("actionsheet").$(), "ActionSheet is rendered after it's opened.");
			assert.ok($actionSheet.closest("#sap-ui-static")[0], "ActionSheet should be rendered inside the static uiArea.");
			assert.ok($parentControl[0], "ActionSheet is wrapped either in Popover or Dialog");

			assert.ok(!($header[0]), "There is no title because title property is set to null");
			assert.ok(!($cancelButton[0]), "showCancelButton is set to false, there is no cancel button");
		}, 50);
	});

	QUnit.test("Close ActionSheet", function (assert) {
		observeCloseEvents(assert);
		assert.expect(3);
		oActionSheet.close();
	});

	QUnit.module("Additional Test");

	QUnit.test("Open an ActionSheet which is already aggregated in dependents aggregation", function (assert) {
		var done = assert.async();
		var oAC = new ActionSheet({
			cancelButtonText: "Cancel",
			title: "Title",
			buttons: [
				new Button({
					text: "Button1"
				}),
				new Button({
					text: "Button2"
				})
			]
		});

		page.addDependent(oAC);

		var oSpyOfViewInvalidate = this.spy(page, "invalidate");

		oAC.attachAfterOpen(function () {
			assert.equal(oSpyOfViewInvalidate.callCount, 0, "Former parent shouldn't be invalidated");

			oAC.destroy();
			done();
		});

		oAC.openBy(oButton);

		assert.equal(oAC._parent.getParent(), page, "Popup of ActionSheet should be aggregated by the former parent of ActionSheet");

	});

	QUnit.test("If first button is invinsible, focus goes to the second one", function (assert) {
		var done = assert.async();
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		});

		var button1 = new Button({ text: "Button1", id: "asButton1", visible: false });
		var button2 = new Button({ text: "Button2", id: "asButton2" });
		var oActionSheet = new ActionSheet({
			cancelButtonText: "Cancel",
			title: "Title",
			buttons: [
				button1,
				button2
			]
		});

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			assert.ok(oCore.byId('asButton2').$().is(":focus"), 'The 2nd button should be focused');

			done();
			oActionSheet.close();
			oButton.destroy();
			oActionSheet.destroy();
		}, 500);
	});

	QUnit.test("setTitle property test", function (assert) {
		// Arrange
		var oClock = sinon.useFakeTimers(),
			oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var oActionSheet = new ActionSheet({
			buttons: [
				new Button({text: "Test"})
			]
		}),
		oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		}), oSpy;

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();
		oClock.tick(300);

		oSpy = this.spy(oActionSheet._parent, "setTitle");

		// Act
		oActionSheet.addButton(new Button({text: "Test1"}));
		oClock.tick(300);
		// Assert
		assert.strictEqual(oSpy.callCount, 0,'setTitle is not called');

		// Act
		oActionSheet.setTitle("");
		oClock.tick(300);
		// Assert
		assert.strictEqual(oSpy.callCount, 0,'setTitle is not called');

		// Act
		oActionSheet.setTitle("test");
		oClock.tick(300);
		// Assert
		assert.strictEqual(oSpy.callCount, 1,'setTitle is called');

		// Act
		oActionSheet.setTitle("");
		oClock.tick(300);
		// Assert
		assert.strictEqual(oSpy.callCount, 2,'setTitle is called');

		// clean
		oActionSheet.close();
		oButton.destroy();
		oClock.restore();
		oActionSheet.destroy();
	});

	QUnit.module("keyboard handling");

	QUnit.test('PageUp keyboard handling', function (assert) {
		var done = assert.async();
		assert.expect(2);
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		});

		var oActionSheet = new ActionSheet({
			showCancelButton: true,
			buttons: [
				new Button({
					id: 'oButton1',
					type: ButtonType.Reject,
					text: "Reject Action"
				}),
				new Button({
					id: 'oButton2',
					type: ButtonType.Accept,
					text: "Accept Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					id: 'oButton6',
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					id: 'oButton7',
					type: ButtonType.Default,
					text: "Default Action"
				})
			]
		});

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			oCore.byId('oButton7').$().trigger("focus");

			qutils.triggerKeydown(oCore.byId('oButton7').$()[0], KeyCodes.PAGE_UP);
			qutils.triggerKeyup(oCore.byId('oButton7').$()[0], KeyCodes.PAGE_UP);

			assert.ok(oCore.byId('oButton2').$().is(":focus"), 'The 2nd button should be focused');

			qutils.triggerKeydown(oCore.byId('oButton2').$()[0], KeyCodes.PAGE_UP);
			qutils.triggerKeyup(oCore.byId('oButton2').$()[0], KeyCodes.PAGE_UP);

			assert.ok(oCore.byId('oButton1').$().is(":focus"), 'The first button should be focused');
			done();
			oActionSheet.close();

			oButton.destroy();
			oActionSheet.destroy();
		}, 500);

	});

	QUnit.test('PageDown keyboard handling mobile phone', function (assert) {
		var done = assert.async();

		var oSystem = {
			desktop: false,
			phone: true,
			tablet: false
		};

		this.stub(Device, "system").value(oSystem);
		assert.expect(2);
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		});

		var oActionSheet = new ActionSheet({
			showCancelButton: true,
			buttons: [
				new Button({
					id: 'oButton1',
					type: ButtonType.Reject,
					text: "Reject Action"
				}),
				new Button({
					type: ButtonType.Accept,
					text: "Accept Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					id: 'oButton6',
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					id: 'oButton7',
					type: ButtonType.Default,
					text: "Default Action"
				})
			]
		});

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			qutils.triggerKeydown(oCore.byId('oButton1').$()[0], KeyCodes.PAGE_DOWN);
			qutils.triggerKeyup(oCore.byId('oButton1').$()[0], KeyCodes.PAGE_DOWN);

			assert.ok(oCore.byId('oButton6').$().is(":focus"), 'The 6th button should be focused');

			qutils.triggerKeydown(oCore.byId('oButton6').$()[0], KeyCodes.PAGE_DOWN);
			qutils.triggerKeyup(oCore.byId('oButton6').$()[0], KeyCodes.PAGE_DOWN);
			assert.ok(oActionSheet.$('cancelBtn').is(":focus"), 'The cancel button should be focused');
			done();
			oActionSheet.close();

			oButton.destroy();
			oActionSheet.destroy();
		}, 500);
	});

	QUnit.test('PageDown keyboard handling desktop', function (assert) {
		var done = assert.async();
		var oSystem = {
			desktop: true,
			phone: false
		};

		this.stub(Device, "system").value(oSystem);
		assert.expect(2);
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		});

		var oActionSheet = new ActionSheet({
			showCancelButton: true,
			buttons: [
				new Button({
					id: 'oButton1',
					type: ButtonType.Reject,
					text: "Reject Action"
				}),
				new Button({
					type: ButtonType.Accept,
					text: "Accept Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					id: 'oButton6',
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					id: 'oButton7',
					type: ButtonType.Default,
					text: "Default Action"
				})
			]
		});

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			qutils.triggerKeydown(oCore.byId('oButton1').$()[0], KeyCodes.PAGE_DOWN);
			qutils.triggerKeyup(oCore.byId('oButton1').$()[0], KeyCodes.PAGE_DOWN);

			assert.ok(oCore.byId('oButton6').$().is(":focus"), 'The 6th button should be focused');

			qutils.triggerKeydown(oCore.byId('oButton6').$()[0], KeyCodes.PAGE_DOWN);
			qutils.triggerKeyup(oCore.byId('oButton6').$()[0], KeyCodes.PAGE_DOWN);

			assert.ok(oCore.byId('oButton7').$().is(":focus"), 'The 7th button should be focused');

			done();
			oActionSheet.close();

			oButton.destroy();
			oActionSheet.destroy();
		}, 500);
	});

	QUnit.test('Alt+Left/Right keyboard handling', function (assert) {
		var done = assert.async();
		var oSystem = {
			desktop: true,
			phone: false
		};

		this.stub(Device, "system").value(oSystem);
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		});

		var oActionSheet = new ActionSheet({
			showCancelButton: true,
			buttons: [
				new Button({
					id: 'oButton1',
					type: ButtonType.Reject,
					text: "Reject Action"
				}),
				new Button({
					type: ButtonType.Accept,
					text: "Accept Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					id: 'oButton6',
					type: ButtonType.Default,
					text: "Default Action"
				}),
				new Button({
					id: 'oButton7',
					type: ButtonType.Default,
					text: "Default Action"
				})
			]
		});

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			var oModifiers = oActionSheet._oItemNavigation.getDisabledModifiers();
			assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
			assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
			assert.ok(oModifiers["sapnext"].indexOf("alt") !== -1, "forward item navigation is not handled when altKey is pressed");
			assert.ok(oModifiers["sapnext"].indexOf("meta") !== -1, "forward item navigation on MacOS is not handled when metaKey is pressed");
			assert.ok(oModifiers["sapprevious"].indexOf("alt") !== -1, "backward item navigation is not handled when altKey is pressed");
			assert.ok(oModifiers["sapprevious"].indexOf("meta") !== -1, "backward item navigation on MacOS is not handled when metaKey is pressed");

			done();
			oActionSheet.close();

			oButton.destroy();
			oActionSheet.destroy();
		}, 500);
	});



	QUnit.module("Screen reader");

	QUnit.test("Role presentation should be present", function (assert) {
		var done = assert.async(),
			oButton = new Button({
				text: "Open ActionSheet",
				press: function () {
					oActionSheet.openBy(this);
				}
			}),
			oActionSheet = new ActionSheet({
				buttons: [
					new Button({
						id: 'oButton2',
						type: ButtonType.Reject,
						text: "Reject Action"
					})
				]
			}),
			oActionSheetContentDivRole;

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			oActionSheetContentDivRole = oActionSheet.getDomRef().getAttribute("role");
			assert.equal(oActionSheetContentDivRole, "presentation", 'role=presentation should be present');

			oActionSheet.close();
			oButton.destroy();
			oActionSheet.destroy();
			done();
		});
	});

	QUnit.test("Popup should have ariaLabelledBy that points to the sPopupHiddenLabelId", function (assert) {
		var done = assert.async(),
			oButton = new Button({
				text: "Open ActionSheet",
				press: function () {
					oActionSheet.openBy(this);
				}
			}),
			oActionSheet = new ActionSheet({
				buttons: [
					new Button({
						id: 'oButton1',
						type: ButtonType.Reject,
						text: "Reject Action"
					})
				]
			}),
			sExpectedText = oResourceBundle.getText("ACTIONSHEET_AVAILABLE_ACTIONS"),
			sActualText;

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		sActualText = oCore.byId(oActionSheet.getPopupHiddenLabelId()).getText();

		setTimeout(function () {
			assert.equal(sActualText, sExpectedText, 'popup ariaLabelledBy is set');

			oActionSheet.close();
			oButton.destroy();
			oActionSheet.destroy();
			done();
		});
	});

	QUnit.test('Dialog without a title on mobile phone should have ariaLabeleedBy pointing to the sPopupHiddenLabelId', function (assert) {
		var done = assert.async(),
			oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

		this.stub(Device, "system").value(oSystem);

		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		}),
			oActionSheet = new ActionSheet({
				showCancelButton: true,
				buttons: [
					new Button({
						id: 'oButton1',
						type: ButtonType.Reject,
						text: "Reject Action"
					})
				]
			}),
			sExpectedText = oResourceBundle.getText("ACTIONSHEET_AVAILABLE_ACTIONS"),
			sActualText;


		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		sActualText = oCore.byId(oActionSheet.getPopupHiddenLabelId()).getText();

		setTimeout(function () {
			assert.equal(sActualText, sExpectedText, 'popup ariaLabelledBy is set');

			oActionSheet.close();
			oButton.destroy();
			oActionSheet.destroy();
			done();
		}, 500);
	});

	QUnit.test('Button should have ariaDescribedBy that points to hidden text', function (assert) {
		var done = assert.async();
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		});

		var button1 = new Button({ text: "Button1", id: "asButton1" });
		var button2 = new Button({ text: "Button2", id: "asButton2" });
		var oActionSheet = new ActionSheet({
			cancelButtonText: "Cancel",
			title: "Title",
			buttons: [
				button1,
				button2
			]
		});

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			var aInvisibleTexts = oActionSheet.getAggregation("_invisibleAriaTexts");

			assert.strictEqual(aInvisibleTexts[0].isA("sap.ui.core.InvisibleText"), true, "Button count label should be invisibleText");
			assert.strictEqual(aInvisibleTexts[0].getText(), oResourceBundle.getText('ACTIONSHEET_BUTTON_INDEX', [1, 2]), "Text should be the index of the button");
			assert.strictEqual(aInvisibleTexts[1].getText(), oResourceBundle.getText('ACTIONSHEET_BUTTON_INDEX', [2, 2]), "Text should be the index of the button");

			oActionSheet.close();
			oActionSheet._getAllButtons()[1].setVisible(false);
			oButton.firePress();

			setTimeout(function () {
				aInvisibleTexts = oActionSheet.getAggregation("_invisibleAriaTexts");

				assert.strictEqual(aInvisibleTexts[0].getText(), oResourceBundle.getText('ACTIONSHEET_BUTTON_INDEX', [1, 1]), "Text should be the index of the button");
				done();
				oActionSheet.close();
				oButton.destroy();
				oActionSheet.destroy();
			}, 500);

		}, 500);
	});

	QUnit.test('Removing a button and adding it again should not add wrong descriptions', function (assert) {
		var done = assert.async();
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		}),
			button1 = new Button({ text: "Button1", id: "asButton1" }),
			aInvisibleTexts, aButtonDescriptions,
			oActionSheet = new ActionSheet({
				cancelButtonText: "Cancel",
				title: "Title",
				buttons: [
					button1
				]
			});

		oActionSheet.removeButton(button1);
		oActionSheet.addButton(button1);
		oActionSheet.removeButton(button1);
		oActionSheet.addButton(button1);

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			oActionSheet.close();
			oButton.firePress();

			setTimeout(function () {
				aInvisibleTexts = oActionSheet.getAggregation("_invisibleAriaTexts");
				aButtonDescriptions = button1.getAriaDescribedBy();

				assert.strictEqual(aInvisibleTexts.length, 1, "Invisible text should be one");
				assert.strictEqual(aButtonDescriptions.length, 1, "Button should be described by 1 id");
				assert.ok(aButtonDescriptions.indexOf(aInvisibleTexts[0].getId()) > -1, "The button should be described by a text from the invisibleTexts");
				done();
				oActionSheet.close();
				oButton.destroy();
				oActionSheet.destroy();
			}, 500);

		}, 500);
	});

	QUnit.test('Inserting button should not mismatch Aria descriptions', function (assert) {
		//Setup
		var done = assert.async();
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		}),
			oASButton1 = new Button({ text: "Button1", id: "asButton1" }),
			oASButton2 = new Button({ text: "Button2", id: "asButton2" }),
			oASButton3 = new Button({ text: "Button3", id: "asButton3" }),
			oActionSheet = new ActionSheet({
				cancelButtonText: "Cancel",
				title: "Title",
				buttons: [
					oASButton1, oASButton3
				]
			});

		// Act
		oActionSheet.insertButton(oASButton2, 1);

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			var sInvisibleTextId = oASButton2.getAriaDescribedBy()[0],
				oInvisibleText = oCore.byId(sInvisibleTextId);

			//Assert
			assert.strictEqual(oActionSheet.indexOfAggregation("buttons", oASButton2), 1, "Inserted button should be correctly placed at the second place.");
			assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText('ACTIONSHEET_BUTTON_INDEX', [2, 3]), "Invisible text should correctly state that the Button is placed at position #2.");

			//Cleanup
			done();
			oActionSheet.close();
			oButton.destroy();
			oActionSheet.destroy();
		}, 500);
	});

	QUnit.test('Invisible buttons should not be counted', function (assert) {
		var done = assert.async();
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		});

		var button1 = new Button({ text: "Button1", id: "asButton1" });
		var button2 = new Button({ text: "Button2", id: "asButton2", visible: false });
		var oActionSheet = new ActionSheet({
			cancelButtonText: "Cancel",
			title: "Title",
			buttons: [
				button1,
				button2
			]
		});

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		setTimeout(function () {
			var sInvisibleText = oCore.byId('asButton1').getAriaDescribedBy()[0],
				oInvisibleTextObj = oCore.byId(sInvisibleText);

			assert.strictEqual(oInvisibleTextObj.getText(), oResourceBundle.getText('ACTIONSHEET_BUTTON_INDEX', [1, 1]), "Total amount of buttons should be 1");

			done();
			oActionSheet.close();
			oButton.destroy();
			oActionSheet.destroy();
		}, 500);

	});

	QUnit.test('ActionSheet\'s ariaRoleApplication property should be set to true', function (assert) {
		var oActionSheet = new ActionSheet();
		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		});

		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();

		assert.strictEqual(oActionSheet._parent.getProperty('ariaRoleApplication'), true, "ariaRoleApplication of the ActionSheet is set to true.");

		oActionSheet.close();
		oButton.destroy();
		oActionSheet.destroy();
	});

	QUnit.module("API");

	QUnit.test('ActionSheet clone should create a duplicate', function (assert) {
		function mockButtonPressHandler() {
			Log.info('mock button press event handler was triggered');
		}
		var spyMockButtonPressHandler = this.spy(mockButtonPressHandler);

		var button1 = new Button({ text: "Button1", id: "asButton1", press: spyMockButtonPressHandler });
		var button2 = new Button({ text: "Button2", id: "asButton2", visible: false, press: spyMockButtonPressHandler });
		var oActionSheet = new ActionSheet({
			cancelButtonText: "Cancel",
			title: "Title",
			buttons: [
				button1,
				button2
			]
		});

		var aPreCloneHandlers = oButton.mEventRegistry.press;
		oActionSheet.getButtons().forEach(function (oButton, i) {
			assert.notStrictEqual(aPreCloneHandlers, undefined,
				"The buttons of the original action sheet should have defined mock handlers attached BEFORE we clone it");
		});
		var oClonedActionSheet = oActionSheet.clone();

		var aPostCloneHandlers = oButton.mEventRegistry.press;
		oActionSheet.getButtons().forEach(function (oButton, i) {
			assert.notStrictEqual(aPostCloneHandlers, undefined,
				"The buttons of the original action sheet should still have defined mock handlers AFTER we clone it");
		});

		assert.deepEqual(aPreCloneHandlers, aPostCloneHandlers,
			'The handlers before the clone should be the same as the press handlers after the clone');
		oClonedActionSheet.getButtons().forEach(function (oButton, i) {
			assert.strictEqual(oButton.getParent(), oClonedActionSheet,
				"Cloned actionsheet buttons parent should be the clone instance");
		});
		assert.notStrictEqual(oClonedActionSheet.sId, oActionSheet.sId, 'The sId should be unique for each clone');
		assert.deepEqual(oClonedActionSheet.mProperties, oActionSheet.mProperties,
			'The properties of the clone should be the same as the properties of the ActionSheet');

	});

	QUnit.test('After removing buttons the additional invisible texts should be cleaned', function (assert) {
		var oButton = new Button({ text: "Button1" }),
			oActionSheet = new ActionSheet({
				cancelButtonText: "Cancel",
				title: "Title"
			});

		oActionSheet.addButton(oButton);
		oActionSheet.removeButton(oButton);
		assert.strictEqual(oActionSheet.getAggregation("_invisibleAriaTexts").length, 0, "Invisible text should be destroyed");

		oActionSheet.addButton(oButton);
		oActionSheet.removeAllButtons();
		assert.strictEqual(oActionSheet.getAggregation("_invisibleAriaTexts").length, 0, "Invisible text should be destroyed");
	});

	QUnit.module("AfterClose event");

	QUnit.test('Origin should be null when closing the ActionSheet without pressing a selected item', function (assert) {
		//Arrange
		var done = assert.async();
		var oClock = sinon.useFakeTimers();
		var oButton1 = new Button({text: "Button1"}),
			oActionSheet = new ActionSheet({
				cancelButtonText: "Cancel",
				title: "Title",
				buttons: [
					oButton1
				]
			}),
			oButton = new Button({
				text: "Open ActionSheet",
				press: function () {
					oActionSheet.openBy(this);
				}
			});

		//Assert
		oActionSheet.attachAfterClose(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("origin"), null, "Button should have origin of type null");

			//Clean
			oActionSheet.destroy();
			oButton.destroy();
			oClock.restore();
			done();
		});

		//Act
		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();
		oActionSheet.close();
		oClock.tick(300);
		oClock.tick(1); // also process nested setTimeout(0) calls
	});

	QUnit.test('Origin should provide the type of the selected action', function (assert) {
		//Arrange
		var done = assert.async();
		var oClock = sinon.useFakeTimers();
		var oButton1 = new Button({text: "Button1"}),
			oActionSheet = new ActionSheet({
				cancelButtonText: "Cancel",
				title: "Title",
				buttons: [
					oButton1
				]
			}),
			oButton = new Button({
				text: "Open ActionSheet",
				press: function () {
					oActionSheet.openBy(this);
				}
			});

		//Assert
		oActionSheet.attachAfterClose(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("origin"), oButton1, "Button should have origin of type sap.m.Button");

			//Clean
			oActionSheet.destroy();
			oButton.destroy();
			oClock.restore();
			done();
		});

		//Act
		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();
		oActionSheet.onmousedown({ srcControl: oButton1 });
		oButton1.firePress();
		oClock.tick(300);
		oClock.tick(1); // also process nested setTimeout(0) calls
	});

	QUnit.test('Origin should provide the type of the cancel button', function (assert) {
		//Arrange
		var done = assert.async();
		var oClock = sinon.useFakeTimers();
		var oSystem = {
			desktop: false,
			phone: true,
			tablet: false
		};

		this.stub(Device, "system").value(oSystem);

		var oButton = new Button({
			text: "Open ActionSheet",
			press: function () {
				oActionSheet.openBy(this);
			}
		}),
			oActionSheet = new ActionSheet({
			showCancelButton: true,
			buttons: [
				new Button({
					id: 'oButton1',
					type: ButtonType.Reject,
					text: "Reject Action"
				})
			]
		});
		var oCancelButton = oActionSheet._getCancelButton();

		//Assert
		oActionSheet.attachAfterClose(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("origin"), oCancelButton, "Button should have origin of type sap.m.Button");

			//Clean
			oActionSheet.destroy();
			oButton.destroy();
			oClock.restore();
			done();
		});

		//Act
		page.addContent(oButton);
		oCore.applyChanges();
		oButton.firePress();
		oActionSheet.onmousedown({ srcControl: oCancelButton });
		oCancelButton.firePress();
		oClock.tick(300);
		oClock.tick(1); // also process nested setTimeout(0) calls
	});

	QUnit.done(function () {
		// hide the content so that the QUnit results can be seen
		document.getElementById("content").style.height = "0";
	});
});