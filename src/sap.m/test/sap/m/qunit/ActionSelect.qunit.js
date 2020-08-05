/*global QUnit */
sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/ActionSelect",
	"sap/m/Button",
	"sap/ui/core/Item",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/ui/qunit/qunit-css",
	"sap/ui/thirdparty/qunit",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(
	App,
	Page,
	ActionSelect,
	Button,
	Item,
	Core,
	KeyCodes,
	qutils,
	createAndAppendDiv,
	Device
) {
	"use strict";
	createAndAppendDiv("actionselect-content");



	var oApp = new App("myApp", {
		initialPage: "page1"
	});

	// page
	var oPage = new Page("page1", {
		title: "Mobile ActionSelect Control"
	});

	oApp.addPage(oPage);
	oApp.placeAt("actionselect-content");



	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	/* ------------------------------ */
	/* getButtons()                   */
	/* ------------------------------ */

	QUnit.module("API");

	QUnit.test("method: getButtons()", function (assert) {

		// system under test
		var oActionSelect = new ActionSelect({
			buttons: [
				new Button({
					text: "Action 1"
				}),

				new Button({
					text: "Action 2"
				})
			]
		});

		// arrange
		oPage.addContent(oActionSelect);
		Core.applyChanges();
		oActionSelect.open();
		this.clock.tick(1000);

		var aPopupButtons = oActionSelect.getSimpleFixFlex().getFlexContent().filter(function (oControl) {
			return oControl.getMetadata().getName() === "sap.m.Button";
		});

		// assertions
		assert.strictEqual(oActionSelect.getButtons().length, 2, 'The buttons are added to the association named "buttons"');
		assert.strictEqual(aPopupButtons.length, 2, 'The buttons are added to the association named "content" in the ActionSelect popup');

		// cleanup
		oActionSelect.destroy();
	});

	/* ------------------------------ */
	/* removeButton()                 */
	/* ------------------------------ */

	var removeButtonTestCase = function (mOptions) {
		QUnit.test("method: removeButton()", function (assert) {

			// system under test
			var oActionSelect = mOptions.control;

			// arrange + act
			oPage.addContent(oActionSelect);
			Core.applyChanges();
			mOptions.removeButtons.forEach(function (vButton) {
				oActionSelect.removeButton(vButton);
			});
			Core.applyChanges();
			oActionSelect.open();
			this.clock.tick(1000);

			var aPopupButtons = oActionSelect.getSimpleFixFlex().getFlexContent().filter(function (oControl) {
				return oControl.getMetadata().getName() === "sap.m.Button";
			});

			// assertions
			assert.strictEqual(oActionSelect.getButtons().length, mOptions.removeButtons.length, 'The button with id or index "' + mOptions.removeButtons + '" was/were removed from the association named "buttons"');
			assert.strictEqual(aPopupButtons.length, mOptions.removeButtons.length, 'The button with id or index "' + mOptions.removeButtons + '" was/were removed from the aggregation named "content" in the ActionSelect popup');

			// cleanup
			oActionSelect.destroy();
		});
	};

	// remove the button by its id
	removeButtonTestCase({
		control: new ActionSelect({
			buttons: [
				new Button("myButton0", {
					text: "Action 1"
				}),

				new Button({
					text: "Action 2"
				})
			]
		}),

		removeButtons: ["myButton0"]
	});

	// remove the button by its index
	removeButtonTestCase({
		control: new ActionSelect({
			buttons: [
				new Button({
					text: "Action 1"
				}),

				new Button({
					text: "Action 2"
				})
			]
		}),

		removeButtons: [0]
	});

	// remove the button given the instance
	(function () {
		var oButton = new Button({
			text: "Action 1"
		});

		removeButtonTestCase({
			control: new ActionSelect({
				buttons: [
					oButton,

					new Button({
						text: "Action 2"
					})
				]
			}),

			removeButtons: [oButton]
		});
	}());

	// try to remove a button given a faulty argument
	removeButtonTestCase({
		control: new ActionSelect({
			buttons: [

				new Button({
					text: "Action 1"
				})
			]
		}),

		removeButtons: [{}]
	});

	/* ------------------------------ */
	/* removeAllButtons()             */
	/* ------------------------------ */

	var removeAllButtonsTestCase = function (mOptions) {
		QUnit.test("method: removeAllButtons()", function (assert) {

			// system under test
			var oActionSelect = mOptions.control;

			// arrange + act
			oPage.addContent(oActionSelect);
			Core.applyChanges();
			oActionSelect.removeAllButtons();
			Core.applyChanges();
			oActionSelect.open();
			this.clock.tick(1000);

			var aPopupButtons = oActionSelect.getSimpleFixFlex().getFlexContent().filter(function (oControl) {
				return oControl.getMetadata().getName() === "sap.m.Button";
			});

			// assertions
			assert.strictEqual(oActionSelect.getButtons().length, 0, 'All buttons were removed from the association named "buttons"');
			assert.strictEqual(aPopupButtons.length, 0, ' All buttons were removed from the aggregation named "content" in the ActionSelect popup');

			// cleanup
			oActionSelect.destroy();
		});
	};

	removeAllButtonsTestCase({
		control: new ActionSelect({
			buttons: [

				new Button({
					text: "Action 1"
				}),

				new Button({
					text: "Action 2"
				})
			]
		})
	});

	QUnit.module("Keyboard Navigation");

	QUnit.test("onsaptabnext keyboard handler", function (assert) {

		var oActionSelect = new ActionSelect({
			items: [
				new Item("first_content_left", {
					key: "0",
					text: "item 0"
				}),

				new Item("second_content_left", {
					key: "1",
					text: "item 1"
				})
			],

			buttons: [
				new Button({
					text: "Action 1",
					enabled: false
				}),

				new Button("firstEnabledButton", {
					text: "Action 2"
				}),

				new Button({
					text: "Action 3",
					enabled: false
				}),

				new Button({
					text: "Action 4"
				}),

				new Button({
					text: "Action 5",
					enabled: false
				})
			]
		});

		// arrange
		oPage.addContent(oActionSelect);
		Core.applyChanges();
		oActionSelect.open();
		this.clock.tick(500);

		qutils.triggerKeydown(oActionSelect.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oActionSelect.getDomRef(), KeyCodes.TAB);
		this.clock.tick(500);

		// assert
		if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
			assert.ok(Core.byId('firstEnabledButton').$().is(":focus"), 'The first enabled button should be focused');
		}
		assert.strictEqual(oActionSelect.getSelectedItem().getId(), "second_content_left", "The second item is the selected one");

		// cleanup
		oActionSelect.destroy();
	});

	QUnit.test("onsaptabprevious keyboard handler", function (assert) {

		var oActionSelect = new ActionSelect("actionSheet", {
			items: [
				new Item("first_content_left", {
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			],

			buttons: [
				new Button({
					text: "Action 1",
					enabled: false
				}),

				new Button("firstEnabledButton", {
					text: "Action 2"
				}),

				new Button({
					text: "Action 3",
					enabled: false
				}),

				new Button("lastEnabledButton", {
					text: "Action 4"
				}),

				new Button({
					text: "Action 5",
					enabled: false
				})
			]
		});

		// arrange
		oPage.addContent(oActionSelect);
		Core.applyChanges();
		oActionSelect.open();
		this.clock.tick(500);

		qutils.triggerKeydown(oActionSelect.getDomRef(), KeyCodes.TAB, true, false, false);
		this.clock.tick(500);

		// assert
		if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
			assert.ok(Core.byId('lastEnabledButton').$().is(":focus"), 'The last enabled button should be focused');
		} else {
			assert.ok(true);
		}

		// cleanup
		oActionSelect.destroy();
	});

	QUnit.module("Focus handling", {
		beforeEach: function () {
			this.oActionSelect = new ActionSelect({
				items: [
					new Item()
				],
				buttons: [
					new Button()
				]
			});
			this.oActionSelect.placeAt("actionselect-content");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oActionSelect.destroy();
		}
	});

	QUnit.test("_toggleListFocusIndication should remove focus indication", function (assert) {
		this.oActionSelect.open();
		this.clock.tick();

		// act
		this.oActionSelect._toggleListFocusIndication(true);
		this.clock.tick();

		// assert
		assert.ok(this.oActionSelect.getSelectedItem().$().hasClass("sapMActionSelectItemWithoutFocus"), "Item should not be focused");
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this._oRb = Core.getLibraryResourceBundle("sap.m");
			this.oActionSelect = new ActionSelect({
				items: [
					new Item()
				],
				buttons: [
					new Button()
				]
			});
			this.oActionSelect.placeAt("actionselect-content");
			this.oPicker = this.oActionSelect.getPicker();
			Core.applyChanges();
		},
		afterEach: function () {
			this.oActionSelect.destroy();
		},
		getTutorMessageIndex: function() {
			return this.oPicker.getAriaLabelledBy().indexOf(this.oActionSelect._getTutorMessageId());
		},
		getTutorMessageText: function(iTutorMessageIndex) {
			return Core.byId(this.oPicker.getAriaLabelledBy()[iTutorMessageIndex]).getText();
		},
		assertTutorMessageIndexValue: function(assert, iTutorMessageIndex) {
			assert.strictEqual(iTutorMessageIndex, this.oPicker.getAriaLabelledBy().length - 1, "Tutor message id should be at the end of ariaLabelledBy");
		}
	});

	QUnit.test("A tutor message should be added if the control has buttons", function (assert) {
		var iLabelsCountAfter1stMessageUpdate = 0,
			iLabelsCountAfter2ndMessageUpdate = 0;

		// act
		this.oActionSelect.open();
		Core.applyChanges();

		// assert
		var iTutorMessageIndex = this.getTutorMessageIndex();
		this.assertTutorMessageIndexValue(assert, iTutorMessageIndex);

		var sInvisibleText = this.getTutorMessageText(iTutorMessageIndex);
		assert.strictEqual(sInvisibleText, this._oRb.getText("ACTION_SELECT_TUTOR_MESSAGE"), "The tutor message is set correctly");

		// act
		iLabelsCountAfter1stMessageUpdate = this.oPicker.getAriaLabelledBy().length;
		this.oActionSelect._updateTutorMessage();
		iLabelsCountAfter2ndMessageUpdate = this.oPicker.getAriaLabelledBy().length;

		// assert
		assert.strictEqual(iLabelsCountAfter1stMessageUpdate, iLabelsCountAfter2ndMessageUpdate, "The tutor message is reference only only");

	});

	QUnit.test("A tutor message should be added and removed accordingly if buttons are programmatically added/removed", function (assert) {
		this.oActionSelect.removeAllButtons();
		this.oActionSelect.open();
		Core.applyChanges();

		// assert
		var iTutorMessageIndex =  this.getTutorMessageIndex();
		assert.strictEqual(iTutorMessageIndex, -1, "The tutor message is not added, when there are no buttons");

		this.oActionSelect.close();

		this.oActionSelect.addButton(new Button({ text: "text" }));
		this.oActionSelect.open();
		Core.applyChanges();
		this.clock.tick(500);

		// assert
		iTutorMessageIndex =  this.getTutorMessageIndex();
		this.assertTutorMessageIndexValue(assert, iTutorMessageIndex);

		var sInvisibleTextMessage = this.getTutorMessageText(iTutorMessageIndex);
		assert.strictEqual(sInvisibleTextMessage, this._oRb.getText("ACTION_SELECT_TUTOR_MESSAGE"), "The tutor message is set correctly when adding buttons");
	});

	QUnit.test("ActionSelect's picker should have ariaRoleApplication property set to true", function (assert) {
		this.oActionSelect.open();
		Core.applyChanges();

		assert.strictEqual(this.oPicker.getProperty("ariaRoleApplication"), true, "The picker's ariaRoleApplication property is set to true.");

		this.oActionSelect.close();
	});
});