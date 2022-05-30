/*global QUnit, sinon */
sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/List",
	"sap/m/InputListItem",
	"sap/m/InstanceManager",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/m/TextArea",
	"sap/m/Text",
	"sap/m/CheckBox",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
], function(
	App,
	Page,
	List,
	InputListItem,
	InstanceManager,
	VerticalLayout,
	Button,
	MessageBox,
	TextArea,
	Text,
	CheckBox,
	KeyCodes,
	qutils,
	createAndAppendDiv,
	mobileLibrary,
	coreLibrary,
	Device,
	oCore,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.m.DialogRoleType
	var DialogRoleType = mobileLibrary.DialogRoleType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	createAndAppendDiv("content");

	var page = new Page("myFirstPage", {
		title: "MessageBox Test",
		showNavButton: true
	});

	var app = new App("myApp", {
		initialPage: "myFirstPage"
	});
	app.addPage(page).placeAt("content");

	var sMessageText = "Text to be tested";
	var sMessageTitle = "Title to be tested";

	function callback(oAction, assert) {
		assert.ok(!oAction, "Dialog is closed by calling close method, so the action parameter is null");
	}

	var sClassName = "sapUiSizeCompact";

	var mMessageBoxTypeClasses = {
		"INFORMATION": "sapMMessageBoxInfo",
		"WARNING": "sapMMessageBoxWarning",
		"ERROR": "sapMMessageBoxError",
		"SUCCESS": "sapMMessageBoxSuccess",
		"QUESTION": "sapMMessageBoxQuestion",
		"STANDARD": "sapMMessageBoxStandard"
	};

	function pressLink (oLink) {
		qutils.triggerEvent(Device.support.touch ? "tap" : "click", oLink);
	}

	QUnit.module("");

	QUnit.test("show", function (assert) {
		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.NO, "Custom Text"],
			onClose: callback.bind(this, assert),
			id: "messagebox1",
			styleClass: sClassName
		});
		oCore.applyChanges();
		var oMessageBox = oCore.byId("messagebox1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.strictEqual(oMessageBox.getProperty("role"), DialogRoleType.AlertDialog, "The correct accessibility role is applied");
		assert.equal(oMessageBox.getButtons().length, 3, "All three buttons are added to dialog");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		assert.ok(oMessageBox.$().hasClass(mMessageBoxTypeClasses.STANDARD), "The show method should open message box with standard style class.");
		oMessageBox.destroy();
	});

	QUnit.test("simple show usage", function (assert) {
		MessageBox.show(sMessageText);
		oCore.applyChanges();
		var oMessageBox = oCore.byId(jQuery(".sapMMessageDialog")[0].getAttribute("id"));
		assert.ok(oMessageBox, "Dialog should be created");
		oMessageBox.destroy();
	});

	QUnit.test("Reference call of MessageBox.show method", function (assert) {
		var mSettings = {
			details: "Some details",
			id: "messagebox1_1"
		};

		// arrange
		var fnShowSpy = sinon.spy(MessageBox.show);

		// act
		fnShowSpy.call(fnShowSpy, "Message box reference call.", mSettings);

		// assert
		var oMessageBox = oCore.byId("messagebox1_1");
		assert.ok(oMessageBox, "The message box was shown");
		assert.strictEqual(fnShowSpy.callCount, 1, "The spy was called exactly 1 time.");
		assert.strictEqual(fnShowSpy.args[0][0], "Message box reference call.", "The correct text was displayed.");

		oMessageBox.destroy();
	});

	QUnit.test("Reference call of MessageBox.confirm method", function (assert) {
		var mSettings = {
			id: "messagebox1_2"
		},
			sText = "MessageBox.confirm reference call.";

		// arrange
		var fnShowSpy = sinon.spy(MessageBox.confirm);

		// act
		fnShowSpy.call(fnShowSpy, sText, mSettings);

		// assert
		var oMessageBox = oCore.byId("messagebox1_2");
		assert.ok(oMessageBox, "The message box was shown");
		assert.strictEqual(fnShowSpy.callCount, 1, "The spy was called exactly 1 time.");
		assert.strictEqual(fnShowSpy.args[0][0], sText, "The correct text was displayed.");

		oMessageBox.destroy();
	});

	QUnit.test("Reference call of MessageBox.error method", function (assert) {
		var mSettings = {
			id: "messagebox1_3"
		},
			sText = "MessageBox.error reference call.";

		// arrange
		var fnShowSpy = sinon.spy(MessageBox.error);

		// act
		fnShowSpy.call(fnShowSpy, sText, mSettings);

		// assert
		var oMessageBox = oCore.byId("messagebox1_3");
		assert.ok(oMessageBox, "The message box was shown");
		assert.strictEqual(fnShowSpy.callCount, 1, "The spy was called exactly 1 time.");
		assert.strictEqual(fnShowSpy.args[0][0], sText, "The correct text was displayed.");

		oMessageBox.destroy();
	});

	QUnit.test("Reference call of MessageBox.information method", function (assert) {
		var mSettings = {
			id: "messagebox1_4"
		},
			sText = "MessageBox.infromation reference call.";

		// arrange
		var fnShowSpy = sinon.spy(MessageBox.information);

		// act
		fnShowSpy.call(fnShowSpy, sText, mSettings);

		// assert
		var oMessageBox = oCore.byId("messagebox1_4");
		assert.ok(oMessageBox, "The message box was shown");
		assert.strictEqual(fnShowSpy.callCount, 1, "The spy was called exactly 1 time.");
		assert.strictEqual(fnShowSpy.args[0][0], sText, "The correct text was displayed.");

		oMessageBox.destroy();
	});

	QUnit.test("Reference call of MessageBox.warning method", function (assert) {
		var mSettings = {
			id: "messagebox1_5"
		},
			sText = "MessageBox.warning reference call.";

		// arrange
		var fnShowSpy = sinon.spy(MessageBox.warning);

		// act
		fnShowSpy.call(fnShowSpy, sText, mSettings);

		// assert
		var oMessageBox = oCore.byId("messagebox1_5");
		assert.ok(oMessageBox, "The message box was shown");
		assert.strictEqual(fnShowSpy.callCount, 1, "The spy was called exactly 1 time.");
		assert.strictEqual(fnShowSpy.args[0][0], sText, "The correct text was displayed.");

		oMessageBox.destroy();
	});

	QUnit.test("Reference call of MessageBox.success method", function (assert) {
		var mSettings = {
			id: "messagebox1_6"
		},
			sText = "MessageBox.success reference call.";

		// arrange
		var fnShowSpy = sinon.spy(MessageBox.success);

		// act
		fnShowSpy.call(fnShowSpy, sText, mSettings);

		// assert
		var oMessageBox = oCore.byId("messagebox1_6");
		assert.ok(oMessageBox, "The message box was shown");
		assert.strictEqual(fnShowSpy.callCount, 1, "The spy was called exactly 1 time.");
		assert.strictEqual(fnShowSpy.args[0][0], sText, "The correct text was displayed.");

		oMessageBox.destroy();
	});

	QUnit.test("show with control as content", function (assert) {
		var oMessageBox, $TextArea,
			sTextAreaId = "myTextArea",
			oTextArea = new TextArea(sTextAreaId, {
				value: sMessageText
			});

		MessageBox.show(oTextArea, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.NO, "Custom Text"],
			onClose: callback.bind(this, assert),
			id: "messagebox1",
			styleClass: sClassName
		});
		oCore.applyChanges();
		oMessageBox = oCore.byId("messagebox1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 3, "All three buttons are added to dialog");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		$TextArea = oCore.byId(sTextAreaId).$();
		assert.equal($TextArea.length, 1, "TextArea should be created");
		oMessageBox.destroy();
	});

	QUnit.test("show error", function (assert) {
		var oResourceBundle = oCore.getLibraryResourceBundle("sap.m");
		MessageBox.error(sMessageText, {
			id: "messageboxError"
		});
		oCore.applyChanges();
		var oMessageBox = oCore.byId("messageboxError");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 1, "One button is added to the dialog");
		assert.equal(oMessageBox.getButtons()[0].mProperties.text, oResourceBundle.getText("MSGBOX_CLOSE"), "Default action Cancel is set");
		assert.equal(oMessageBox.getTitle(), oResourceBundle.getText("MSGBOX_TITLE_ERROR"), "The title should be Error");
		assert.ok(oMessageBox.$().hasClass(mMessageBoxTypeClasses.ERROR), "The error method should open message box with error style class.");
		oMessageBox.destroy();
	});

	QUnit.test("show information", function (assert) {
		var oResourceBundle = oCore.getLibraryResourceBundle("sap.m");
		MessageBox.information(sMessageText, {
			id: "messageboxInfo"
		});
		oCore.applyChanges();
		var oMessageBox = oCore.byId("messageboxInfo");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 1, "One button is added to the dialog");
		assert.equal(oMessageBox.getButtons()[0].mProperties.text, oResourceBundle.getText("MSGBOX_OK"), "Default action OK is set");
		assert.equal(oMessageBox.getTitle(), oResourceBundle.getText("MSGBOX_TITLE_INFO"), "The title should be Info");
		assert.ok(oMessageBox.$().hasClass(mMessageBoxTypeClasses.INFORMATION), "The information method should open message box with information style class.");
		oMessageBox.destroy();
	});

	QUnit.test("show warning", function (assert) {
		var oResourceBundle = oCore.getLibraryResourceBundle("sap.m");
		MessageBox.warning(sMessageText, {
			id: "messageboxWarning"
		});
		oCore.applyChanges();
		var oMessageBox = oCore.byId("messageboxWarning");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 1, "One button is added to the dialog");
		assert.equal(oMessageBox.getButtons()[0].mProperties.text, oResourceBundle.getText("MSGBOX_OK"), "Default action OK is set");
		assert.equal(oMessageBox.getTitle(), oResourceBundle.getText("MSGBOX_TITLE_WARNING"), "The title should be Warning");
		assert.ok(oMessageBox.$().hasClass(mMessageBoxTypeClasses.WARNING), "The warning method should open message box with warning style class.");
		oMessageBox.destroy();
	});

	QUnit.test("show success", function (assert) {
		var oResourceBundle = oCore.getLibraryResourceBundle("sap.m");
		MessageBox.success(sMessageText, {
			id: "messageboxSuccess"
		});
		oCore.applyChanges();
		var oMessageBox = oCore.byId("messageboxSuccess");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 1, "One button is added to the dialog");
		assert.equal(oMessageBox.getButtons()[0].mProperties.text, oResourceBundle.getText("MSGBOX_OK"), "Default action OK is set");
		assert.equal(oMessageBox.getTitle(), oResourceBundle.getText("MSGBOX_TITLE_SUCCESS"), "The title should be Success");
		assert.ok(oMessageBox.$().hasClass(mMessageBoxTypeClasses.SUCCESS), "The success method should open message box with success style class.");
		oMessageBox.destroy();
	});

	QUnit.test("disable horizontal scrolling", function (assert) {
		var sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus. Sed gravida sagittis semper. Maecenas non eros arcu. Aenean pharetra faucibus nisl sed cursus. Morbi ultrices lacus et facilisis venenatis. In porta pharetra libero, in maximus turpis semper vitae. Donec lectus mauris, consequat ut tincidunt pharetra, posuere vitae massa. Suspendisse rutrum ipsum dui, pulvinar mollis dolor ullamcorper a. Nam eleifend, neque sit amet dignissim commodo, mi lacus feugiat nunc, in elementum tortor enim congue purus.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat metus neque, ut hendrerit odio gravida hendrerit. Donec pellentesque, sem sed vestibulum tristique, lectus nulla gravida lacus, sed facilisis purus ipsum a odio. Pellentesque nisl nibh, euismod et sapien a, laoreet convallis lectus. Donec sed sollicitudin dolor, at luctus eros. Aliquam varius mauris vitae sapien aliquam sollicitudin. Curabitur auctor mattis enim, eget fermentum augue vehicula in. Mauris tempus magna nec vehicula lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla arcu augue, finibus quis quam nec, sagittis blandit turpis.	Maecenas id nisi molestie, varius lacus vitae, luctus diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur consequat fringilla faucibus.";

		var oLayout = new VerticalLayout({
			width: "100%",
			content: [
				new List({
					inset: false,
					width: "100%",
					items: [
						new InputListItem({
							label: sLongText
						}), new InputListItem({
							label: sLongText
						}), new InputListItem({
							label: sLongText
						})
					]
				})
			]
		});

		MessageBox.show(oLayout, {
			icon: MessageBox.Icon.WARNING,
			title: "Title of first MessageBox",
			actions: [MessageBox.Action.YES, MessageBox.Action.NO, MessageBox.Action.Cancel],
			onClose: null,
			id: "messageBoxScrolling",
			verticalScrolling: false,
			horizontalScrolling: false
		}
		);


		oCore.applyChanges();
		var oMessageBox = oCore.byId("messageBoxScrolling");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 3, "All three buttons are added to dialog");
		assert.equal(oMessageBox.getHorizontalScrolling(), false, "The horizontal scrolling is disabled");
		assert.equal(oMessageBox.getVerticalScrolling(), false, "The vertical scrolling is disabled");
		oMessageBox.destroy();
	});


	QUnit.test("initial focus to control", function (assert) {
		var oButton = new Button({
			text: 'Do something'
		});

		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.NO, "Custom Text", oButton],
			onClose: callback.bind(this, assert),
			id: "messagebox2",
			styleClass: sClassName,
			initialFocus: oButton
		});
		oCore.applyChanges();

		var oMessageBox = oCore.byId("messagebox2");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 4, "All four buttons are added to dialog");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.equal(oMessageBox.getInitialFocus(), oButton.sId, "InitialFocus is set correctly");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
	});

	QUnit.test("initial focus to control with details", function (assert) {
		var oMessageBox, oShowMoreLink,
			oButton = new Button({
				text: 'Do something'
			});

		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, oButton],
			details: "Lorem ipsum",
			id: "messageboxWithDetails",
			styleClass: sClassName,
			initialFocus: oButton
		});
		oCore.applyChanges();

		oMessageBox = oCore.byId("messageboxWithDetails");
		oShowMoreLink = oMessageBox.getContent()[0].getItems()[1];

		//act
		oShowMoreLink.firePress();
		oCore.applyChanges();

		assert.strictEqual(document.activeElement.id, oMessageBox.getInitialFocus(), "Focus is set correctly after details are shown");
		oMessageBox.destroy();
	});

	QUnit.test("Only text shown when the details property is set to 'null'", function (assert) {
		var oMessageBox;

		//arrange and act
		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK],
			details: null,
			id: "messageboxWithNullDetails",
			styleClass: sClassName
		});
		oCore.applyChanges();

		oMessageBox = oCore.byId("messageboxWithNullDetails");
		var iContent = oMessageBox.getContent()[0].getItems().length;

		assert.strictEqual(iContent, 1, "There is only one item in the content - the text of the message box.");
		oMessageBox.destroy();
	});

	QUnit.test("initial focus with string", function (assert) {
		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.NO, "Custom Text"],
			onClose: callback.bind(this, assert),
			id: "messagebox3",
			styleClass: sClassName,
			initialFocus: "Custom Text"
		});
		oCore.applyChanges();

		var oMessageBox = oCore.byId("messagebox3");
		var aButtons = oMessageBox.getButtons();

		var sInitialFocusControlId = (function () {
			var result;
			for (var i = 0; i < aButtons.length; i++) {
				if (aButtons[i].mProperties.text.toLowerCase() === "Custom Text".toLowerCase()) {
					result = aButtons[i].sId;
				}
			}
			return result;
		})();

		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 3, "All three buttons are added to dialog");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.equal(oMessageBox.getInitialFocus(), sInitialFocusControlId, "InitialFocus is set correctly");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
	});

	QUnit.test("show with set initial focus with MessageBox.Action", function (assert) {
		var oFormatLocale = oCore.getConfiguration().getFormatSettings().getFormatLocale().toString();
		oCore.getConfiguration().setFormatLocale("bg");
		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.NO, MessageBox.Action.Cancel],
			onClose: callback.bind(this, assert),
			id: "messagebox4",
			styleClass: sClassName,
			initialFocus: MessageBox.Action.NO
		});
		oCore.applyChanges();

		var oResourceBundle = oCore.getLibraryResourceBundle("sap.m");
		var oMessageBox = oCore.byId("messagebox4");
		var aButtons = oMessageBox.getButtons();
		var getInitialFocusControlId = (function () {
			var sInitialFocusControlId;
			for (var i = 0; i < aButtons.length; i++) {
				if (aButtons[i].mProperties.text.toLowerCase() === oResourceBundle.getText("MSGBOX_NO").toLowerCase()) {
					sInitialFocusControlId = aButtons[i].sId;
				}
			}
			return sInitialFocusControlId;
		})();

		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oCore.getConfiguration().getFormatSettings().getFormatLocale().toString(), "bg", "locale of page");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 3, "All three buttons are added to dialog");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.equal(oMessageBox.getInitialFocus(), getInitialFocusControlId, "InitialFocus is set correctly");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
		oCore.getConfiguration().setFormatLocale(oFormatLocale);
	});


	QUnit.test("alert", function (assert) {
		MessageBox.alert(sMessageText, {
			onClose: callback.bind(this, assert),
			title: sMessageTitle,
			id: "alertbox1",
			styleClass: sClassName
		});
		oCore.applyChanges();
		var oMessageBox = oCore.byId("alertbox1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.ok(oMessageBox.getButtons().length, "Only one button in alert.");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		assert.ok(oMessageBox.$().hasClass(mMessageBoxTypeClasses.STANDARD), "The alert method should open message box with standard style class.");
		oMessageBox.destroy();
	});

	QUnit.test("confirm", function (assert) {
		MessageBox.confirm(sMessageText, {
			onClose: callback.bind(this, assert),
			title: sMessageTitle,
			id: "confirmbox1",
			styleClass: sClassName
		});
		oCore.applyChanges();
		var oMessageBox = oCore.byId("confirmbox1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.ok(oMessageBox.getButtons().length === 2, "Two buttons are created");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		assert.ok(oMessageBox.$().hasClass(mMessageBoxTypeClasses.QUESTION), "The confirm method should open message box with question style class.");
		oMessageBox.destroy();
	});

	QUnit.test("show with OLD API", function (assert) {
		MessageBox.show(sMessageText, null, sMessageTitle, [MessageBox.Action.OK, "Custom Text", MessageBox.Action.NO], callback, "messagebox1", sClassName);
		oCore.applyChanges();
		var oMessageBox = oCore.byId("messagebox1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 3, "All three buttons are added to dialog");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
	});

	QUnit.test("show with OLD API and control as content", function (assert) {
		var oMessageBox, $TextArea,
			sTextAreaId = "myTextArea",
			oTextArea = new TextArea(sTextAreaId, {
				value: sMessageText
			});

		// MessageBox.show(message, icon, title, [oActions], fnCallback, oDefaultAaction, sDialogId, sClassName)
		MessageBox.show(oTextArea, null, sMessageTitle, [MessageBox.Action.OK, "Custom Text", MessageBox.Action.NO], callback, "messagebox1", sClassName);
		oCore.applyChanges();
		oMessageBox = oCore.byId("messagebox1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.equal(oMessageBox.getButtons().length, 3, "All three buttons are added to dialog");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		$TextArea = oCore.byId(sTextAreaId).$();
		assert.equal($TextArea.length, 1, "TextArea should be created");
		oMessageBox.destroy();
	});

	QUnit.test("alert with OLD API", function (assert) {
		// MessageBox.alert(vMessage, fnCallback, sTitle, sDialogId, sStyleClass)
		MessageBox.alert(sMessageText, callback, sMessageTitle, "alertbox1", sClassName);
		oCore.applyChanges();
		var oMessageBox = oCore.byId("alertbox1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.ok(oMessageBox.getButtons().length, "Only one button is created");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
	});

	QUnit.test("confirm with OLD API", function (assert) {
		MessageBox.confirm(sMessageText, callback, sMessageTitle, "confirmbox1", sClassName);
		oCore.applyChanges();
		var oMessageBox = oCore.byId("confirmbox1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.ok(oMessageBox.getButtons().length === 2, "Two buttons are created");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
	});

	QUnit.test("alert with message which contains curly bracket", function (assert) {
		MessageBox.alert("I have {abc}");
		oCore.applyChanges();
		assert.equal(jQuery("span:contains('I have {abc}')").length, 1, "Text with curly bracket is rendered");
		InstanceManager.getOpenDialogs()[0].destroy();
	});

	QUnit.test("Text Direction Tests", function (assert) {
		var sMessageBoxId = "messageboxRTL",
			oMessageBox,
			oMessageTextContainer;

		// RTL
		MessageBox.confirm(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.NO, "Custom Text"],
			onClose: callback.bind(this, assert),
			id: sMessageBoxId,
			textDirection: TextDirection.RTL
		});

		oCore.applyChanges();
		oMessageBox = oCore.byId(sMessageBoxId);
		oMessageTextContainer = oMessageBox.$().find("span.sapMText");
		assert.equal(jQuery(oMessageTextContainer).attr("dir"), "rtl", "Attribute 'dir' for Text Direction is set to RTL");
		oMessageBox.destroy();

		// LTR
		MessageBox.confirm(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.NO, "Custom Text"],
			onClose: callback.bind(this, assert),
			id: sMessageBoxId,
			textDirection: TextDirection.LTR
		});

		oCore.applyChanges();
		oMessageBox = oCore.byId(sMessageBoxId);
		oMessageTextContainer = oMessageBox.$().find("span.sapMText");
		assert.equal(jQuery(oMessageTextContainer).attr("dir"), "ltr", "Attribute 'dir' for Text Direction is set to LTR");
		oMessageBox.destroy();
	});

	//sap.ca.ui.MessageDialog replacemet
	// these examples cover the usage of sap.ca.ui.MessageDialog described in sap.ca.ui.messageDialog.qunit.html
	QUnit.test("add details", function (assert) {
		var sDetails = "Lorem ipsum dolor sit amet, eum an vidit porro ocurreret, has elit illud probatus ut. Ut est audire necessitatibus, case denique scribentur vel no. Ipsum suscipit te quo, eam ne justo insolens. His dico impedit offendit ea, decore eripuit volumus sea an, ut omnes cetero delectus eos.\n\nTota paulo graecis ei usu, mei te alii alia harum. Nulla singulis in nec, qui vide solum inani no. Lorem timeam posidonium nec te, decore noster ut eum, sit mazim delicata deterruisset cu. Id mea nemore delenit, eu ignota propriae eum.\n\nSolum atqui persecuti ut est, altera corrumpit te his. Nam justo epicurei mnesarchum ut, ne nam error ludus. Aeque utinam eum ad, homero audiam recteque nec ne, mazim constituam ne pri. Cum tollit dolorum interesset at. Pri partem tempor reprehendunt in, delectus vulputate sed ne. Etiam aeterno dolores eum ut.\n\nEx conceptam omittantur quo. Sit et petentium scripserit, te mea simul civibus scaevola. Mel solum ludus ea, ut sed cibo choro exerci. Eum discere quaestio ei, sed legendos platonem necessitatibus in. Eu duo populo mnesarchum vituperata.";
		MessageBox.show("No connection can be established to the backend system ABC", {
			id: "messagedialog1",
			title: sMessageTitle,
			type: MessageBox.Icon.ERROR,
			details: sDetails,
			styleClass: sClassName,
			initialFocus: "OK"
		});
		oCore.applyChanges();
		var oMessageBox = oCore.byId("messagedialog1");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.ok(oMessageBox.getButtons().length === 2, "Two buttons are created");
		assert.ok(oMessageBox.$().find('a.sapMMessageBoxLinkText').length != 0, "MessageBox has formatted link text");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		var sLinkText = oMessageBox.$().find('a.sapMMessageBoxLinkText');
		pressLink(sLinkText);

		oCore.applyChanges();
		assert.ok(oMessageBox.$().find('.sapMMessageBoxDetails').length != 0, "MessageBox has formatted link text");
		assert.deepEqual(oMessageBox.$().find(".sapMFT").text(), sDetails);
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
	});

	QUnit.test("details announcement", function (assert) {
		var sDetails = "Lorem ipsum dolor sit amet.";
		MessageBox.show("No connection can be established to the backend system ABC", {
			id: "messagedialog1",
			title: sMessageTitle,
			type: MessageBox.Icon.ERROR,
			details: sDetails,
			styleClass: sClassName,
			initialFocus: "OK"
		});

		oCore.applyChanges();
		var oMessageBox = oCore.byId("messagedialog1"),
			oShowMoreLink = oMessageBox.getContent()[0].getItems()[1];

		assert.strictEqual(oMessageBox.getAriaLabelledBy().length, 2, "MessageBox has 2 ARIA labels before 'Show more' press");

		oShowMoreLink.firePress();
		oCore.applyChanges();

		var oDialogAriaLabelDetails = oCore.byId(oMessageBox.getAriaLabelledBy()[2]).getHtmlText();
		assert.strictEqual(oMessageBox.getAriaLabelledBy().length, 3, "MessageBox has 3 ARIA labels after 'Show more' press");
		assert.strictEqual(oDialogAriaLabelDetails, sDetails, "MessageBox details are set as ARIA label for the dialog");
		oMessageBox.destroy();
	});

	QUnit.test("add details within control content", function (assert) {
		var oMessageBox, $Layout,
			sLayoutId = "myLayout",
			oLayout = new VerticalLayout(sLayoutId, {
				width: "100%",
				content: [
					new Text({
						text: "Do you want to see the status of the CheckBox in an additional MessageBox?"
					}),
					new CheckBox("checkBoxId", {
						text: "The CheckBox this checked",
						selected: false
					})
				]
			});
		MessageBox.show(oLayout, {
			id: "messagedialog2",
			title: sMessageTitle,
			type: MessageBox.Icon.ERROR,
			details: "Lorem ipsum dolor sit amet, eum an vidit porro ocurreret, has elit illud probatus ut. Ut est audire necessitatibus, case denique scribentur vel no. Ipsum suscipit te quo, eam ne justo insolens. His dico impedit offendit ea, decore eripuit volumus sea an, ut omnes cetero delectus eos.\n\nTota paulo graecis ei usu, mei te alii alia harum. Nulla singulis in nec, qui vide solum inani no. Lorem timeam posidonium nec te, decore noster ut eum, sit mazim delicata deterruisset cu. Id mea nemore delenit, eu ignota propriae eum.\n\nSolum atqui persecuti ut est, altera corrumpit te his. Nam justo epicurei mnesarchum ut, ne nam error ludus. Aeque utinam eum ad, homero audiam recteque nec ne, mazim constituam ne pri. Cum tollit dolorum interesset at. Pri partem tempor reprehendunt in, delectus vulputate sed ne. Etiam aeterno dolores eum ut.\n\nEx conceptam omittantur quo. Sit et petentium scripserit, te mea simul civibus scaevola. Mel solum ludus ea, ut sed cibo choro exerci. Eum discere quaestio ei, sed legendos platonem necessitatibus in. Eu duo populo mnesarchum vituperata.",
			styleClass: sClassName,
			initialFocus: "OK"
		});

		oCore.applyChanges();
		var oMessageBox = oCore.byId("messagedialog2");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.ok(oMessageBox.getButtons().length === 2, "Two buttons are created");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		assert.ok(oMessageBox.getContent()[0].isA("sap.ui.core.Control"), "Content is control");
		assert.ok(oMessageBox.$().hasClass(sClassName));
		$Layout = oCore.byId(sLayoutId).$();
		assert.equal($Layout.length, 1, "Layout should be created");
		oMessageBox.destroy();
	});

	// When the message box is used on phone device and contains exactly 2 buttons it should use internally beginButton and endButton aggregations instead of buttons.
	QUnit.test("When the message box is used on phone device and contains exactly 2 buttons:", function (assert) {
		this.stub(Device, "system").value({
			phone: true,
			tablet: false,
			desktop: false
		});

		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			actions: [MessageBox.Action.OK, MessageBox.Action.NO],
			onClose: callback.bind(this, assert),
			id: "messagebox5",
			styleClass: sClassName
		});

		oCore.applyChanges();
		var oMessageBox = oCore.byId("messagebox5");
		assert.ok(!oMessageBox.getLeftButton(), "LeftButton aggregation is not used.");
		assert.ok(!oMessageBox.getRightButton(), "RightButton aggregation is not used.");
		assert.equal(oMessageBox.getButtons().length, 2, "Buttons aggregation is used.");
		oMessageBox.destroy();
	});

	QUnit.test("Aria-labelledby attrbute:", function (assert) {
		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			id: "messagebox6"
		});

		this.clock.tick(500);
		var oMessageBox = oCore.byId("messagebox6");
		var sExpectedAriaLabelledBy = oMessageBox.$("header").find(".sapMTitle").attr("id") + " " + oMessageBox.$().find(".sapMMsgBoxText").attr("id");
		var sActualAriaLabelledBy = oMessageBox.$().attr("aria-labelledby");
		assert.equal(sActualAriaLabelledBy, sExpectedAriaLabelledBy, "should point to the header and to the text.");
		oMessageBox.destroy();
	});

	QUnit.test("When used with undefined message aria-labelledby attrbute", function (assert) {
		MessageBox.show(undefined, {
			title: sMessageTitle,
			id: "messagebox7"
		});

		this.clock.tick(500);
		var oMessageBox = oCore.byId("messagebox7");
		var sExpectedAriaLabelledBy = oMessageBox.$("header").find(".sapMTitle").attr("id");
		var sActualAriaLabelledBy = oMessageBox.$().attr("aria-labelledby");
		assert.equal(sActualAriaLabelledBy, sExpectedAriaLabelledBy, "should point to the header.");
		oMessageBox.destroy();
	});

	QUnit.test("When used with details aria-labelledby attrbute:", function (assert) {
		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			details: "Some details",
			id: "messagebox8"
		});

		this.clock.tick(500);
		var oMessageBox = oCore.byId("messagebox8");
		var sExpectedAriaLabelledBy = oMessageBox.$("header").find(".sapMTitle").attr("id") + " " + oMessageBox.$().find(".sapMMsgBoxText").attr("id");
		var sActualAriaLabelledBy = oMessageBox.$().attr("aria-labelledby");
		assert.equal(sActualAriaLabelledBy, sExpectedAriaLabelledBy, "should point to the header and to the text.");
		oMessageBox.destroy();
	});

	QUnit.test("Language change", function (assert) {
		oCore.getConfiguration().setLanguage("de");
		assert.notEqual(oCore.getLibraryResourceBundle("sap.m"), MessageBox._rb, "The MessageBox should have a different resource bundle before opening");
		MessageBox.show(sMessageText, {
			title: sMessageTitle,
			details: "Some details",
			id: "messagebox9"
		});
		assert.equal(oCore.getLibraryResourceBundle("sap.m"), MessageBox._rb, "The ResourceBundle should be the same.");
		oCore.byId("messagebox9").destroy();
	});

	QUnit.test("Check button type on default show method call", function (assert) {
		// Act
		MessageBox.show(undefined, {
			id: "messageboxButtonType1"
		});
		var oMessageBox = oCore.byId("messageboxButtonType1");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Emphasized, "Button should be with 'Emphasized' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on show method call with custom actions", function (assert) {
		// Act
		MessageBox.show(undefined, {
			id: "messageboxButtonType2",
			actions: [MessageBox.Action.OK]
		});
		var oMessageBox = oCore.byId("messageboxButtonType2");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on show method with details property", function (assert) {
		// Act
		MessageBox.show(undefined, {
			id: "messageboxButtonType3",
			details: "Test details"
		});
		var oMessageBox = oCore.byId("messageboxButtonType3");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Emphasized, "Button should be with 'Emphasized' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on alert method call", function (assert) {
		// Act
		MessageBox.alert(undefined, {
			id: "messageboxButtonType4"
		});
		var oMessageBox = oCore.byId("messageboxButtonType4");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Emphasized, "Button should be with 'Emphasized' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on confirm method call", function (assert) {
		// Act
		MessageBox.confirm(undefined, {
			id: "messageboxButtonType5"
		});
		var oMessageBox = oCore.byId("messageboxButtonType5");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Emphasized, "First button should be with 'Emphasized' type.");
		assert.equal(oMessageBox.getButtons()[1].getType(), ButtonType.Default, "Second button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on error method call", function (assert) {
		// Act
		MessageBox.error(undefined, {
			id: "messageboxButtonType6"
		});
		var oMessageBox = oCore.byId("messageboxButtonType6");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on information method call", function (assert) {
		// Act
		MessageBox.information(undefined, {
			id: "messageboxButtonType7"
		});
		var oMessageBox = oCore.byId("messageboxButtonType7");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Emphasized, "Button should be with 'Emphasized' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on warning method call", function (assert) {
		// Act
		MessageBox.warning(undefined, {
			id: "messageboxButtonType8"
		});
		var oMessageBox = oCore.byId("messageboxButtonType8");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Emphasized, "Button should be with 'Emphasized' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on success method call", function (assert) {
		// Act
		MessageBox.success(undefined, {
			id: "messageboxButtonType9"
		});
		var oMessageBox = oCore.byId("messageboxButtonType9");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Emphasized, "Button should be with 'Emphasized' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on success method call with custom actions", function (assert) {
		// Act
		MessageBox.success(undefined, {
			id: "messageboxButtonType10",
			actions: [MessageBox.Action.OK]
		});
		var oMessageBox = oCore.byId("messageboxButtonType10");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on alert method call with custom actions", function (assert) {
		// Act
		MessageBox.alert(undefined, {
			id: "messageboxButtonType11",
			actions: [MessageBox.Action.OK]
		});
		var oMessageBox = oCore.byId("messageboxButtonType11");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on confirm method call with custom actions", function (assert) {
		// Act
		MessageBox.confirm(undefined, {
			id: "messageboxButtonType12",
			actions: [MessageBox.Action.OK]
		});
		var oMessageBox = oCore.byId("messageboxButtonType12");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on information method call with custom actions", function (assert) {
		// Act
		MessageBox.information(undefined, {
			id: "messageboxButtonType13",
			actions: [MessageBox.Action.OK]
		});
		var oMessageBox = oCore.byId("messageboxButtonType13");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on warning method call with custom actions", function (assert) {
		// Act
		MessageBox.warning(undefined, {
			id: "messageboxButtonType14",
			actions: [MessageBox.Action.OK]
		});
		var oMessageBox = oCore.byId("messageboxButtonType14");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on warning method call with custom actions and details", function (assert) {
		// Act
		MessageBox.warning(undefined, {
			id: "messageboxButtonType15",
			actions: [MessageBox.Action.OK],
			details: "Lorem ipsum"
		});
		var oMessageBox = oCore.byId("messageboxButtonType15");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type on warning method call with custom details", function (assert) {
		// Act
		MessageBox.warning(undefined, {
			id: "messageboxButtonType16",
			details: "Lorem ipsum"
		});
		var oMessageBox = oCore.byId("messageboxButtonType16");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Emphasized, "Button should be with 'Emphasized' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button types when specifying actions and emphasizedAction", function (assert) {
		// Act
		MessageBox.confirm(undefined, {
			id: "messageboxButtonType17",
			actions: [MessageBox.Action.YES, MessageBox.Action.NO],
			emphasizedAction: MessageBox.Action.NO
		});
		var oMessageBox = oCore.byId("messageboxButtonType17");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "'YES' should be with 'Default' type.");
		assert.equal(oMessageBox.getButtons()[1].getType(), ButtonType.Emphasized, "'NO' should be with 'Emphasized' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button types when specifying actions but not specifying emphasizedAction", function (assert) {
		// Act
		MessageBox.information(undefined, {
			id: "messageboxButtonType18",
			actions: [MessageBox.Action.CLOSE ,MessageBox.Action.YES, MessageBox.Action.NO],
			emphasizedAction: undefined // explicitly to showcase this test
		});
		var oMessageBox = oCore.byId("messageboxButtonType18");

		// assert
		oMessageBox.getButtons().forEach(function (oButton) {
			assert.notEqual(oButton.getType(), ButtonType.Emphasized, "Button should not be with 'Emphasized' type.");
		});

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("Check button type is type Default by default on Error method call", function (assert) {
		// Act
		MessageBox.error(undefined, {
			id: "messageboxButtonType19"
		});
		var oMessageBox = oCore.byId("messageboxButtonType19");

		// assert
		assert.equal(oMessageBox.getButtons()[0].getType(), ButtonType.Default, "Button should be with 'Default' type.");

		// clean
		oMessageBox.destroy();
	});

	QUnit.test("auto close when a routing navigation occurs", function (assert) {

		var oDialog;

		MessageBox.show("Message", {
			id: "messageId",
			details: "Lorem ipsum"
		});
		this.clock.tick(500);

		oDialog = oCore.byId("messageId");

		assert.ok(oDialog.isOpen(), "Dialog is opened");

		InstanceManager.closeAllDialogs();
		this.clock.tick(500);

		assert.notOk(oDialog.isOpen(), "Dialog is closed");

		// clean
		oDialog.destroy();


		// closeOnNavigation=false
		MessageBox.show("Message", {
			id: "messageId",
			details: "Lorem ipsum",
			closeOnNavigation: false
		});
		this.clock.tick(500);

		oDialog = oCore.byId("messageId");

		InstanceManager.closeAllDialogs();
		this.clock.tick(500);

		assert.ok(oDialog.isOpen(), "Dialog remains opened when closeOnNavigation=false");
		// clean
		oDialog.destroy();
	});

	QUnit.module("Details provided asynchronously by callback");

	QUnit.test("When 'details' is provided as function 'View Details' link is shown", function (assert) {
		// act
		MessageBox.show("Message", {
			id: "messageId",
			details: function () {}
		});
		oCore.applyChanges();

		var oMessageBoxDialog = oCore.byId("messageId");

		// assert
		assert.strictEqual(oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText").length, 1, "MessageBox has 'View Details' link displayed");

		// clean up
		oMessageBoxDialog.destroy();
	});

	QUnit.test("When 'View Details' is activated details are successfully displayed", function (assert) {
		// arrange
		var done = assert.async();
		var sData = "Data to be displayed";
		var oDataPromise = Promise.resolve(sData);

		MessageBox.show("Message", {
			id: "messageId",
			details: function () {
				return oDataPromise;
			}
		});
		oCore.applyChanges();

		var oMessageBoxDialog = oCore.byId("messageId");
		var oViewDetails = oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText");

		// Act
		pressLink(oViewDetails);

		oDataPromise.then(function () {
			oCore.applyChanges();

			// assert
			assert.strictEqual(oMessageBoxDialog.$().find(".sapMMessageBoxDetails").length, 1, "Details text is displayed");
			assert.strictEqual(oMessageBoxDialog.$().find(".sapMMessageBoxDetails").text(), sData, "Details text contains the resolved data");

			// clean up
			oMessageBoxDialog.destroy();

			done();
		});
	});

	QUnit.test("Busy state with details callback that resolves", function (assert) {
		// arrange
		var done = assert.async();
		this.clock.restore();
		MessageBox.show("Message", {
			id: "messageId",
			details: function () {
				return Promise.resolve("Data to be displayed");
			}
		});
		oCore.applyChanges();

		var oMessageBoxDialog = oCore.byId("messageId");
		var oViewDetails = oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText").control(0);

		// Act
		pressLink(oViewDetails);

		// assert
		assert.ok(oViewDetails.getBusy(), "ViewDetails link should be busy");

		setTimeout(function () {
			oCore.applyChanges();

			// assert
			assert.notOk(oViewDetails.getVisible(), "ViewDetails link should no longer be visible");

			// clean up
			oMessageBoxDialog.destroy();

			done();
		}, 100);
	});

	QUnit.test("Busy state with details callback that rejects", function (assert) {
		// arrange
		var done = assert.async();
		this.clock.restore();
		MessageBox.show("Message", {
			id: "messageId",
			details: function () {
				return Promise.reject("Error message");
			}
		});
		oCore.applyChanges();
		var oResourceBundle = oCore.getLibraryResourceBundle("sap.m");
		var oMessageBoxDialog = oCore.byId("messageId");
		var oViewDetails = oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText").control(0);

		// Act
		pressLink(oViewDetails);

		// assert
		assert.ok(oViewDetails.getBusy(), "ViewDetails link should be busy");

		setTimeout(function () {
			oCore.applyChanges();
			var oErrorMessage = oMessageBoxDialog.getContent()[0].getItems()[2];

			// assert
			assert.notOk(oViewDetails.getVisible(), "ViewDetails link should no longer be visible");
			assert.ok(oErrorMessage.getVisible(), "Error message should be displayed");
			assert.strictEqual(oErrorMessage.getText(), oResourceBundle.getText("MSGBOX_DETAILS_LOAD_ERROR"), "Error text should be correct");
			assert.strictEqual(document.activeElement.getAttribute("id"), oErrorMessage.getLink().getDomRef().getAttribute("id"), "'Try again' should be focused");

			// clean up
			oMessageBoxDialog.destroy();

			done();
		}, 100);
	});

	QUnit.test("Close the MessageBox before details callback resolves", function (assert) {
		// arrange
		this.clock.restore();
		var done = assert.async();
		var oMessageBoxDialog;
		MessageBox.show("Message", {
			id: "messageId",
			details: function () {
				return new Promise(function () { });
			},
			onClose: function () {
				// assert
				assert.notOk(oMessageBoxDialog.isOpen(), "The MessageBox should be closed");
				done();
			}
		});
		oCore.applyChanges();

		oMessageBoxDialog = oCore.byId("messageId");
		var oViewDetails = oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText");

		// Act
		pressLink(oViewDetails);
		qutils.triggerKeydown(oMessageBoxDialog.getDomRef(), KeyCodes.ESCAPE);
	});

	QUnit.test("Focused element after ViewDetails is pressed", function (assert) {
		// arrange
		var done = assert.async();
		this.clock.restore();
		MessageBox.show("Message", {
			id: "messageId",
			details: function () {
				return new Promise(function () { });
			}
		});
		oCore.applyChanges();

		var oMessageBoxDialog = oCore.byId("messageId");
		var oViewDetails = oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText");

		// Act
		pressLink(oViewDetails);

		setTimeout(function () {
			// assert
			assert.strictEqual(
				document.activeElement.getAttribute("id"),
				oViewDetails.control(0).getDomRef("busyIndicator").getAttribute("id"),
				"ViewDetails link should be focused");

			// clean up
			oMessageBoxDialog.destroy();
			done();
		}, 100);
	});

	QUnit.test("Focused element after details are loaded and shown", function (assert) {
		// arrange
		var done = assert.async();
		this.clock.restore();
		MessageBox.show("Message", {
			id: "messageId",
			details: function () {
				return new Promise(function (resolve) {
					setTimeout(function () {
						resolve("Message details");
					}, 100);
				});
			}
		});
		oCore.applyChanges();

		var oMessageBoxDialog = oCore.byId("messageId");
		var oViewDetails = oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText");

		// Act
		pressLink(oViewDetails);

		setTimeout(function () {
			// assert
			assert.strictEqual(document.activeElement.getAttribute("id"), oMessageBoxDialog.getButtons()[0].getId(), "The first action button is focused");

			// clean up
			oMessageBoxDialog.destroy();
			done();
		}, 200);
	});

	QUnit.test("Focused element after 'Try again' is pressed", function (assert) {
		// arrange
		var done = assert.async();
		this.clock.restore();
		MessageBox.show("Message", {
			id: "messageId",
			details: function () {
				return Promise.reject("Error message");
			}
		});
		oCore.applyChanges();
		var oMessageBoxDialog = oCore.byId("messageId");
		var oViewDetails = oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText").control(0);
		pressLink(oViewDetails);

		setTimeout(function () {
			oCore.applyChanges();
			var oErrorMessage = oMessageBoxDialog.getContent()[0].getItems()[2];
			var oTryAgain = oErrorMessage.getLink();

			// act
			pressLink(oTryAgain);
			oCore.applyChanges();

			// assert
			assert.strictEqual(document.activeElement.getAttribute("id"), oViewDetails.getDomRef("busyIndicator").getAttribute("id"), "The busy indicator should be focused");

			// clean up
			oMessageBoxDialog.destroy();

			done();
		}, 100);
	});

	QUnit.module("Details - different types");

	QUnit.test("pass simple json to details", function (assert) {
		var oJSON = { x: 1, y: 2, z: 3 };

		MessageBox.show("No connection can be established to the backend system ABC", {
			id: "messagedialog2",
			title: sMessageTitle,
			type: MessageBox.Icon.ERROR,
			details: oJSON,
			styleClass: sClassName,
			initialFocus: "OK"
		});
		this.clock.tick(500);
		var oMessageBox = oCore.byId("messagedialog2");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.ok(oMessageBox.getButtons().length === 2, "Two buttons are created");
		assert.ok(oMessageBox.$().find("a.sapMMessageBoxLinkText").length != 0, "MessageBox has formatted link text");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		var sLinkText = oMessageBox.$().find("a.sapMMessageBoxLinkText");
		pressLink(sLinkText);

		oCore.applyChanges();
		assert.ok(oMessageBox.$().find(".sapMMessageBoxDetails").length != 0, "MessageBox has formatted link text");
		assert.deepEqual(oMessageBox.$().find(".sapMFT").text(), JSON.stringify(oJSON, null, "\t"));
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
	});

	QUnit.test("pass text with special characters in details", function (assert) {
		var deploymentErrorDetails = "sequenceflow4 : Error in element 'SequenceFlow4' field 'Condition': Dynamically evaluated expression is expected, e.g. {context.variableOfInterest == 'value of interest'} servicetask1 : Flow element 'ServiceTask1' is not properly connected to other flow elements";
		MessageBox.show("No connection can be established to the backend system ABC", {
			id: "messagedialogdetails",
			title: sMessageTitle,
			type: MessageBox.Icon.ERROR,
			details: deploymentErrorDetails,
			styleClass: sClassName,
			initialFocus: "OK"
		});
		this.clock.tick(500);
		var oMessageBox = oCore.byId("messagedialogdetails");
		assert.ok(oMessageBox, "Dialog should be created");
		var sLinkText = oMessageBox.$().find("a.sapMMessageBoxLinkText");
		pressLink(sLinkText);

		oCore.applyChanges();
		assert.ok(oMessageBox.$().find(".sapMMessageBoxDetails").length != 0, "MessageBox has formatted link text");
		assert.deepEqual(oMessageBox.$().find(".sapMFT").text(), deploymentErrorDetails);
		oMessageBox.destroy();
	});

	QUnit.test("pass control to details", function (assert) {
		var oJSON = new Text("Hi");

		MessageBox.show("No connection can be established to the backend system ABC", {
			id: "messagedialog3",
			title: sMessageTitle,
			type: MessageBox.Icon.ERROR,
			details: oJSON,
			styleClass: sClassName,
			initialFocus: "OK"
		});

		this.clock.tick(500);
		var oMessageBox = oCore.byId("messagedialog3");
		assert.ok(oMessageBox, "Dialog should be created");
		assert.equal(oMessageBox.getType(), DialogType.Message, "Dialog should have type Message");
		assert.ok(oMessageBox.getButtons().length === 2, "Two buttons are created");
		assert.ok(oMessageBox.$().find("a.sapMMessageBoxLinkText").length != 0, "MessageBox has formatted link text");
		assert.equal(oMessageBox.getTitle(), sMessageTitle, "Title is assigned");
		var sLinkText = oMessageBox.$().find("a.sapMMessageBoxLinkText");
		pressLink(sLinkText);

		oCore.applyChanges();
		assert.ok(oMessageBox.$().find(".sapMMessageBoxDetails").length != 0, "MessageBox has formatted link text");
		assert.deepEqual(oMessageBox.$().find(".sapMFT").text(), JSON.stringify(oJSON, null, "\t"));
		assert.ok(oMessageBox.$().hasClass(sClassName));
		oMessageBox.destroy();
	});

	QUnit.test("JSON details provided by callback", function (assert) {
		// arrange
		var done = assert.async();
		var oData = {
			a: "A",
			b: 123,
			c: {
				c: "Data to be displayed"
			}
		};
		var oDataPromise = Promise.resolve(oData);

		MessageBox.show("Message", {
			id: "messageId",
			details: function () {
				return oDataPromise;
			}
		});
		oCore.applyChanges();

		var oMessageBoxDialog = oCore.byId("messageId");
		var oViewDetails = oMessageBoxDialog.$().find("a.sapMMessageBoxLinkText");

		// Act
		pressLink(oViewDetails);

		oDataPromise.then(function () {
			oCore.applyChanges();

			// assert
			assert.strictEqual(oMessageBoxDialog.$().find(".sapMMessageBoxDetails").length, 1, "Details object is displayed");
			assert.strictEqual(oMessageBoxDialog.$().find(".sapMMessageBoxDetails").text(), JSON.stringify(oData, null, "\t"), "Details text should contain stringified JSON data");

			// clean up
			oMessageBoxDialog.destroy();

			done();
		});
	});

});