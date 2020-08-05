/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/semantic/SemanticPage",
	"sap/m/semantic/SemanticButton",
	"sap/m/semantic/ShareMenu",
	"sap/m/semantic/ShareMenuPage",
	"sap/m/semantic/DetailPage",
	"sap/m/semantic/SendEmailAction",
	"sap/m/semantic/SendMessageAction",
	"sap/m/ActionSheet",
	"sap/m/Button"
], function(
	qutils,
	createAndAppendDiv,
	SemanticPage,
	SemanticButton,
	ShareMenu,
	ShareMenuPage,
	DetailPage,
	SendEmailAction,
	SendMessageAction,
	ActionSheet,
	Button
) {
	createAndAppendDiv("qunit-fixture-visible");



	QUnit.module("Accessibility");

	QUnit.test("Aria attributes", function (assert) {
		// Arrange
		var oDetail = new DetailPage("detailPage", {
				sendEmailAction: new SendEmailAction(),
				sendMessageAction: new SendMessageAction()
			}),
			oMenu = oDetail._getSegmentedShareMenu().getContainer(),
			oShareMenuBtn = oMenu._getShareMenuButton();

		// Act
		oDetail.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oShareMenuBtn.$().attr("aria-haspopup"), "menu", "aria-haspopup is as expected");

		// Clean
		oDetail.destroy();
	});

	QUnit.module("ShareMenu Control", {
		beforeEach: function () {
			this.oActionSheet = new ActionSheet();
			// Action sheet needs a parent to create the button correctly
			this.oSemanticPage = new SemanticPage();
			this.oSemanticPage.addDependent(this.oActionSheet);
		},
		afterEach: function () {
			this.oSemanticPage.destroy();
			jQuery("#qunit-fixture-visible").html("");
		}
	});

	QUnit.test("has correct init state", function (assert) {
		// Arrange
		var oMenu = new ShareMenu(this.oActionSheet);

		// Act

		// Assert
		assert.strictEqual(oMenu.getBaseButton() != null, true, "ShareMenu has a base button");
		assert.strictEqual(oMenu.getContent().length, 0, "ShareMenu is empty");

		// Cleanup
		oMenu.destroy();
	});

	QUnit.test("content aggregation", function (assert) {
		// Arrange
		var oMenu = new ShareMenu(this.oActionSheet),
				oCustomButton1 = new Button("customButtonId1",{
					text: "Custom1",
					icon: "sap-icon://synchronize"
				}),
				oCustomButton2 = new Button("customButtonId2",{
					text: "Custom2",
					icon: "sap-icon://video"
				}),
				oCustomButton3 = new Button("customButtonId3",{
					text: "Custom3",
					icon: "sap-icon://task"
				});

		// Act  (add item)
		var oResult = oMenu.addContent(oCustomButton1);

		// Assert
		assert.strictEqual(oResult, oMenu, "add function returns menu reference");
		assert.strictEqual(oMenu.getContent().length, 1, "ShareMenu has one item");
		assert.strictEqual(oMenu.getContent()[0], oCustomButton1, "ShareMenu has added item");
		assert.strictEqual(oMenu.indexOfContent(oCustomButton1), 0, "index of item1 is 0");
		assert.strictEqual(oMenu.getBaseButton() != null, true, "ShareMenu has a base button");
		assert.strictEqual(oMenu.getBaseButton(), oCustomButton1, "ShareMenu has the added button as a base button");

		// Act  (add item)
		oResult = oMenu.addContent(oCustomButton2);

		// Assert
		assert.strictEqual(oResult, oMenu, "add function returns menu reference");
		assert.strictEqual(oMenu.getContent().length, 2, "ShareMenu has two items");
		assert.strictEqual(oMenu.getContent()[0], oCustomButton1, "ShareMenu has added item1");
		assert.strictEqual(oMenu.getContent()[1], oCustomButton2, "ShareMenu has added item2");
		assert.strictEqual(oMenu.indexOfContent(oCustomButton1), 0, "index of item1 is 0");
		assert.strictEqual(oMenu.indexOfContent(oCustomButton2), 1, "index of item1 is 1");
		assert.strictEqual(oMenu.getBaseButton() != null, true, "ShareMen has a base button");
		assert.strictEqual(oMenu.getBaseButton().getVisible(), true, "ShareMenu base button is visible");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton2, true, "ShareMenu base button is not item1");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton1, true, "ShareMenu base button is not item2");

		// Act  (remove item)
		oResult = oMenu.removeContent(oCustomButton1);

		// Assert
		assert.strictEqual(oResult, oCustomButton1, "remove function returns reference to removed item");
		assert.strictEqual(oMenu.getContent().length, 1, "ShareMenu has one item");
		assert.strictEqual(oMenu.getContent()[0], oCustomButton2, "ShareMenu has item2");
		assert.strictEqual(oMenu.indexOfContent(oCustomButton2), 0, "index of item2 is 0");
		assert.strictEqual(oMenu.getBaseButton() != null, true, "ShareMenu has a base button");
		assert.strictEqual(oMenu.getBaseButton(), oCustomButton2, "ShareMenu has item2 as a base button");

		// Act  (insert item)
		oResult = oMenu.insertContent(oCustomButton3, 0);

		// Assert
		assert.strictEqual(oResult, oMenu, "insert function returns menu reference");
		assert.strictEqual(oMenu.getContent().length, 2, "ShareMenu has two items");
		assert.strictEqual(oMenu.getContent()[0], oCustomButton3, "ShareMenu has added item3");
		assert.strictEqual(oMenu.getContent()[1], oCustomButton2, "ShareMenu has added item2");
		assert.strictEqual(oMenu.indexOfContent(oCustomButton3), 0, "index of item3 is 0");
		assert.strictEqual(oMenu.indexOfContent(oCustomButton2), 1, "index of item2 is 1");
		assert.strictEqual(oMenu.getBaseButton() != null, true, "ShareMen has a base button");
		assert.strictEqual(oMenu.getBaseButton().getVisible(), true, "ShareMenu base button is visible");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton2, true, "ShareMenu base button is not item2");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton3, true, "ShareMenu base button is not item3");

		// Act  (insert item)
		oResult = oMenu.insertContent(oCustomButton1, 1);

		// Assert
		assert.strictEqual(oResult, oMenu, "insert function returns menu reference");
		assert.strictEqual(oMenu.getContent().length, 3, "ShareMenu has two items");
		assert.strictEqual(oMenu.getContent()[0], oCustomButton3, "ShareMenu has added item3");
		assert.strictEqual(oMenu.getContent()[1], oCustomButton1, "ShareMenu has added item1");
		assert.strictEqual(oMenu.getContent()[2], oCustomButton2, "ShareMenu has added item2");
		assert.strictEqual(oMenu.getBaseButton() != null, true, "ShareMen has a base button");
		assert.strictEqual(oMenu.getBaseButton().getVisible(), true, "ShareMenu base button is visible");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton1, true, "ShareMenu base button is not item1");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton2, true, "ShareMenu base button is not item2");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton3, true, "ShareMenu base button is not item3");

		// Act  (remove all)
		oResult = oMenu.removeAllContent();

		// Assert
		assert.strictEqual(oResult.length, 3, "removeAll function returns removed items");
		assert.strictEqual(oMenu.getContent().length, 0, "ShareMenu has no items");
		assert.strictEqual(oResult[0], oCustomButton3, "ShareMenu has removed item3");
		assert.strictEqual(oResult[1], oCustomButton1, "ShareMenu has removed item1");
		assert.strictEqual(oResult[2], oCustomButton2, "ShareMenu has removed item2");
		assert.strictEqual(oMenu.getBaseButton() != null, true, "ShareMen has a base button");
		assert.strictEqual(oMenu.getBaseButton().getVisible(), false, "ShareMenu base button is not visible");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton1, true, "ShareMenu base button is not item1");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton2, true, "ShareMenu base button is not item2");
		assert.strictEqual(oMenu.getBaseButton() != oCustomButton3, true, "ShareMenu base button is not item3");

		// Act  (insert item)
		oResult = oMenu.insertContent(oCustomButton1, 0);

		// Assert
		assert.strictEqual(oResult, oMenu, "insert function returns menu reference");
		assert.strictEqual(oMenu.getContent().length, 1, "ShareMenu has one item");
		assert.strictEqual(oMenu.getContent()[0], oCustomButton1, "ShareMenu has added item");
		assert.strictEqual(oMenu.indexOfContent(oCustomButton1), 0, "index of item1 is 0");
		assert.strictEqual(oMenu.getBaseButton() != null, true, "ShareMenu has a base button");
		assert.strictEqual(oMenu.getBaseButton(), oCustomButton1, "ShareMenu has the added button as a base button");

		// Cleanup
		oMenu.destroy();
	});

	QUnit.test("share menu button visibility", function (assert) {
		// Arrange
		var fnGetButton = function(oConfig) {
			return new Button(oConfig || {});
		},
		oButton1 = fnGetButton({text: "Custom1", icon: "sap-icon://synchronize"}),
		oButton2 = fnGetButton({text: "Custom2", icon: "sap-icon://video"}),
		oButton3 = fnGetButton({text: "Custom3", icon: "sap-icon://task"}),
		oPage = new ShareMenuPage({
			customShareMenuContent: [oButton1]
		}),
		oShareMenu = oPage._oSegmentedShareMenu.getContainer(),
		oShareMenuBtn = oShareMenu._getShareMenuButton();

		// Assert: The share menu button should not be visible, when there is one share menu content.
		assert.strictEqual(oShareMenuBtn.getVisible(), false, "ShareMenu button is not visible initially");

		// Act: Add a second visible item.
		oPage.addCustomShareMenuContent(oButton2);

		// Assert
		assert.strictEqual(oShareMenuBtn.getVisible(), true,
				"ShareMenu button is visible: there are two visible items");

		// Act: Hide both the buttons.
		oButton1.setVisible(false);
		oButton2.setVisible(false);

		// Assert
		assert.strictEqual(oShareMenuBtn.getVisible(), false,
				"ShareMenu button is not visible: there are no visible items");

		// Act: Add third item - it`s visible.
		// Although there is a single visible item 1 of 3, the share menu button will be visible.
		oPage.addCustomShareMenuContent(oButton3);
		// Assert
		assert.strictEqual(oShareMenuBtn.getVisible(), true,
				"ShareMenu button is visible: there are 3 items, at least one visible");

		// Act: Remove the visible item.
		oPage.removeCustomShareMenuContent(oButton3);
		// Assert
		assert.strictEqual(oShareMenuBtn.getVisible(), false,
				"ShareMenu button is not visible: there are no visible items");

		// Act: Show both the buttons and remove all content.
		oButton1.setVisible(true);
		oButton2.setVisible(true);
		oPage.removeAllCustomShareMenuContent();

		// Assert
		assert.strictEqual(oShareMenuBtn.getVisible(), false,
				"ShareMenu button is not visible: there are no items");
		assert.strictEqual(oButton1._fnOriginalSetVisible, undefined,
				"button`s setVisible method is recovered.");
		assert.strictEqual(oButton1._fnOriginalSetVisible, undefined,
				"button`s setVisible method is recovered.");
		assert.strictEqual(oButton1._fnOriginalSetVisible, undefined,
				"button`s setVisible method is recovered.");

		// Cleanup
		oButton1.destroy();
		oButton2.destroy();
		oButton3.destroy();
		oPage.destroy();
	});
});