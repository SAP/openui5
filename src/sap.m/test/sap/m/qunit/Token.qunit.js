/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Token",
	"sap/ui/core/library",
	"sap/ui/core/InvisibleText",
	"sap/m/Tokenizer",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core"
], function(qutils, createAndAppendDiv, Token, coreLibrary, InvisibleText, Tokenizer, KeyCodes, oCore) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	createAndAppendDiv("content");


	QUnit.module("Basic", {
		beforeEach : function() {
			this.token1 = new Token("t1");
			this.token1.placeAt("content");

			oCore.applyChanges();
		},
		afterEach : function() {
			this.token1.destroy();
		}
	});

	// test property accessor methods
	QUnit.test("setter / getter Key", function(assert) {
		var key = "testKey";

		this.token1.setKey(key);
		assert.equal(this.token1.getKey(), key, "Input value is " + key);
	});

	QUnit.test("setter / getter Text", function(assert) {
		var text = "testText";

		this.token1.setText(text);
		assert.equal(this.token1.getText(), text, "Input value is " + text);
	});

	QUnit.test("setter / getter editableParent", function(assert) {
		var isEditableParent = true,
			aAriaDescibedByTextIds, aUniqueTextIds;

		function fnDistinct(value, index, array) {
			return array.indexOf(value) === index;
		}

		// Assert
		aAriaDescibedByTextIds = this.token1.getDomRef().attributes["aria-describedby"].value.split(" ");
		aUniqueTextIds = aAriaDescibedByTextIds.filter(fnDistinct);
		assert.strictEqual(this.token1.getProperty("editableParent"), isEditableParent, "Token's parent is editable");
		assert.strictEqual(aAriaDescibedByTextIds.length, 2, "Token's aria-describedby attribute contains two invisible text ids");
		assert.strictEqual(aUniqueTextIds.length, aAriaDescibedByTextIds.length, "Only unique text ids were added");

		// Act
		isEditableParent = false;
		this.token1.setProperty("editableParent", isEditableParent);
		oCore.applyChanges();

		// Assert
		aAriaDescibedByTextIds = this.token1.getDomRef().attributes["aria-describedby"].value.split(" ");
		aUniqueTextIds = aAriaDescibedByTextIds.filter(fnDistinct);
		assert.strictEqual(this.token1.getProperty("editableParent"), isEditableParent, "Token's parent is not editable");
		assert.strictEqual(aUniqueTextIds.length, 1, "Token's aria-describedby attribute contains 1 invisible text id");

		// Act
		isEditableParent = true;
		this.token1.setProperty("editableParent", isEditableParent);
		oCore.applyChanges();

		// Assert
		aAriaDescibedByTextIds = this.token1.getDomRef().attributes["aria-describedby"].value.split(" ");
		aUniqueTextIds = aAriaDescibedByTextIds.filter(fnDistinct);
		assert.strictEqual(this.token1.getProperty("editableParent"), isEditableParent, "Token's parent is editable");
		assert.strictEqual(aUniqueTextIds.length, 2, "Token's aria-describedby attribute contains two invisible text ids");
		assert.strictEqual(aUniqueTextIds.length, aAriaDescibedByTextIds.length, "Only unique text ids were added");
	});

	QUnit.test("setter / getter isSelected", function(assert) {
		var isSelected = false;
		assert.equal(this.token1.getSelected(), isSelected, "Token is not selected");

		isSelected = true;
		this.token1.setSelected(isSelected);
		assert.equal(this.token1.getSelected(), isSelected, "Token is selected");

		isSelected = false;
		this.token1.setSelected(isSelected);
		assert.equal(this.token1.getSelected(), isSelected, "Token is not selected");
	});

	QUnit.test("show / hide delete icon depending on isEditable", function(assert) {
		var isEditable = true;
		this.token1.setEditable(isEditable);

		var oTokenIcon = this.token1.getAggregation("deleteIcon");
		assert.ok(oTokenIcon, "Token contains icon");
		assert.strictEqual(oTokenIcon.getTooltip(), oCore.getLibraryResourceBundle("sap.m").getText("TOKEN_ICON_TOOLTIP"), "Token icon contains a tooltip");

		isEditable = false;
		this.token1.setEditable(isEditable);

		oCore.applyChanges();

		//assert.equal(this.token1.$().children().length, 1, "Token does not show delete icon");
		assert.ok(this.token1.$().hasClass("sapMTokenReadOnly"), "Token does not show delete icon");

	});

	QUnit.test("select/deselect token", function(assert) {

		this.token1.setSelected(false);

		qutils.triggerEvent("tap", this.token1.getDomRef());
		oCore.applyChanges();
		assert.ok(this.token1.$().hasClass("sapMTokenSelected"), "token is selected");

		qutils.triggerEvent("tap", this.token1.getDomRef());
		oCore.applyChanges();
		assert.ok(this.token1.$().hasClass("sapMTokenSelected"), "token is selected");

	});

	QUnit.test("setter / getter textDirection", function(assert) {
		this.token1.setTextDirection(TextDirection.RTL);
		assert.equal(this.token1.getTextDirection(), TextDirection.RTL, "Input value is " + TextDirection.RTL);
	});

	QUnit.test("Token has attribute dir", function(assert) {
		this.token1.setTextDirection(TextDirection.RTL);
		oCore.applyChanges();

		assert.equal(this.token1.$().children(0).attr("dir"), 'rtl', "Token has attribute dir equal to rtl");
	});

	QUnit.test("setter / getter truncated", function(assert) {
		this.token1.setTruncated(true);
		assert.equal(this.token1.getTruncated(), true, "Token's textTruncated property was set.");
	});

	QUnit.module("Keyboard Handling", {
		beforeEach : function() {
			this.token1 = new Token("t1");
			this.token1.placeAt("content");

			oCore.applyChanges();
		},
		afterEach : function() {
			this.token1.destroy();
		}
	});

	QUnit.test("Space", function(assert) {
		// act
		qutils.triggerKeydown("t1", KeyCodes.SPACE, false, false, false);

		// assert
		assert.equal(this.token1.getSelected(), true, "Token is selected");

		// act
		qutils.triggerKeydown("t1", KeyCodes.SPACE, false, false, false);

		// assert
		assert.equal(this.token1.getSelected(), false, "Token is deselected");
	});

	QUnit.test("Ctrl + Space", function(assert) {
		// act
		qutils.triggerKeydown("t1", KeyCodes.SPACE, false, false, true);

		// assert
		assert.equal(this.token1.getSelected(), true, "Token is selected");

		// act
		qutils.triggerKeydown("t1", KeyCodes.SPACE, false, false, true);

		// assert
		assert.equal(this.token1.getSelected(), false, "Token is deselected");
	});

	QUnit.module("Token in Tokenizer", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer("t");
			this.token1 = new Token("t1");
			this.token2 = new Token("t2");
			this.token3 = new Token("t3");

			this.tokenizer.addToken(this.token1);
			this.tokenizer.addToken(this.token2);
			this.tokenizer.addToken(this.token3);

			this.tokenizer.placeAt("content");

			oCore.applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Selection", function(assert) {
		// act
		qutils.triggerEvent("tap", this.token1.getDomRef());
		qutils.triggerKeydown("t", KeyCodes.ARROW_RIGHT);

		// assert
		assert.ok(this.token1.getSelected(), 1, "Token1 is selected.");
		assert.equal(document.activeElement, this.token2.getDomRef(), "Token2 is focused after navigation.");
	});

	QUnit.test("Pressing delete icon", function (assert) {
		// arrange
		var fnFireDeleteSpy = this.spy(this.token1, "fireDelete");

		// act
		this.token1.getAggregation("deleteIcon").firePress();
		oCore.applyChanges();

		// assert
		assert.equal(fnFireDeleteSpy.callCount, 1, "delete event was fired");
	});

	QUnit.module("ARIA attributes", {
		beforeEach : function() {
			this.token1 = new Token("t1");
			this.token1.placeAt("content");

			oCore.applyChanges();
		},
		afterEach : function() {
			this.token1.destroy();
		}
	});

	QUnit.test("Role option should be set", function(assert) {
		assert.strictEqual(this.token1.$().attr("role"), "option", "Token has role option.");
	});

	QUnit.test("ARIA Read only attribyte is not present", function(assert) {
		// aria-readonly is not valid for the current role of the token.
		assert.ok(!this.token1.$().attr("aria-readonly"), "Token has no aria-readonly attribute set.");
	});

	QUnit.test("ARIA Token describe text is present", function(assert) {
		var sId = InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_LABEL");

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) > -1, "Token has correct invisible text ID added to aria-describedby attribute");
	});

	QUnit.test("ARIA-SELECTED attribute", function(assert) {
		assert.strictEqual(this.token1.$().attr("aria-selected"), "false", "aria-selected is set to false.");

		this.token1.setSelected(true);
		oCore.applyChanges();
		assert.strictEqual(this.token1.$().attr("aria-selected"), "true", "aria-selected is updated correctly.");

		this.token1.setSelected(false);
		oCore.applyChanges();
		assert.strictEqual(this.token1.$().attr("aria-selected"), "false", "aria-selected updated correctly.");
	});

	QUnit.test("ARIA Editable (deletable) text", function(assert) {
		var sId = InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_DELETABLE");

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) > -1, "Token has correct invisible text ID added to aria-describedby attribute");

		this.token1.setEditable(false);
		this.token1.invalidate(); // simulate parent invalidation
		oCore.applyChanges();

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) === -1, "Token has the invisible text ID removed from aria-describedby attribute");
	});

	QUnit.test("ARIA editableParent (deletable) text", function(assert) {
		var sId = InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_DELETABLE");

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) > -1, "Token has correct invisible text ID added to aria-describedby attribute");

		this.token1.setProperty("editableParent", false);
		this.token1.invalidate(); // simulate parent invalidation
		oCore.applyChanges();

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) === -1, "Token has the invisible text ID removed from aria-describedby attribute");
	});

	QUnit.module("Truncated Token", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer("t");
			this.token = new Token("t1");

			this.tokenizer.addToken(this.token);

			this.tokenizer.placeAt("content");
			oCore.applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Selection when token is truncated", function(assert) {
		var oSpy = this.spy(this.token, "setSelected");

		// Arrange
		this.token.setTruncated(true);

		// Act
		this.token._onTokenPress({});

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Token was not initially selected");

		// Arrange
		this.token.setTruncated(false);

		// Act
		this.token._onTokenPress({});

		// Assert
		assert.strictEqual(oSpy.callCount, 2, "Token was selected.");
		assert.strictEqual(oSpy.calledWith(true), true, "Correct parameter passed");
	});

});