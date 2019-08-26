/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Token",
	"sap/ui/core/library",
	"sap/ui/core/InvisibleText",
	"sap/m/Tokenizer",
	"sap/ui/events/KeyCodes"
], function(QUnitUtils, createAndAppendDiv, Token, coreLibrary, InvisibleText, Tokenizer, KeyCodes) {
	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	createAndAppendDiv("content");


	QUnit.module("Basic", {
		beforeEach : function() {
			this.token1 = new Token("t1");
			this.token1.placeAt("content");

			sap.ui.getCore().applyChanges();
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

	QUnit.test("setter / getter editable", function(assert) {
		var sTooltipText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("TOKEN_ARIA_DELETABLE"),
			isEditable = true;

		assert.equal(this.token1.getEditable(), isEditable, "Token is editable");
		assert.strictEqual(this.token1._getTooltip(this.token1, this.token1.getEditable()), sTooltipText, "Token has a tooltip");

		isEditable = false;
		this.token1.setEditable(isEditable);
		assert.equal(this.token1.getEditable(), isEditable, "Token is not editable");
		assert.ok(!this.token1._getTooltip(this.token1, this.token1.getEditable()), "Token does not have a tooltip");

		isEditable = true;
		this.token1.setEditable(isEditable);
		assert.equal(this.token1.getEditable(), isEditable, "Token is editable");
		assert.strictEqual(this.token1._getTooltip(this.token1, this.token1.getEditable()), sTooltipText, "Token has a tooltip");
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
		sap.ui.getCore().applyChanges();

		// Assert
		aAriaDescibedByTextIds = this.token1.getDomRef().attributes["aria-describedby"].value.split(" ");
		aUniqueTextIds = aAriaDescibedByTextIds.filter(fnDistinct);
		assert.strictEqual(this.token1.getProperty("editableParent"), isEditableParent, "Token's parent is not editable");
		assert.strictEqual(aUniqueTextIds.length, 1, "Token's aria-describedby attribute contains 1 invisible text id");

		// Act
		isEditableParent = true;
		this.token1.setProperty("editableParent", isEditableParent);
		sap.ui.getCore().applyChanges();

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
		assert.ok(!this.token1.$().hasClass("sapMTokenReadOnly"), "Token contains icon");

		isEditable = false;
		this.token1.setEditable(isEditable);

		sap.ui.getCore().applyChanges();

		//assert.equal(this.token1.$().children().length, 1, "Token does not show delete icon");
		assert.ok(this.token1.$().hasClass("sapMTokenReadOnly"), "Token does not show delete icon");

	});

	QUnit.test("select/deselect token", function(assert) {

		this.token1.setSelected(false);

		sap.ui.test.qunit.triggerEvent("tap", this.token1.getDomRef());
		sap.ui.getCore().applyChanges();
		assert.ok(this.token1.$().hasClass("sapMTokenSelected"), "token is selected");

		sap.ui.test.qunit.triggerEvent("tap", this.token1.getDomRef());
		sap.ui.getCore().applyChanges();
		assert.ok(this.token1.$().hasClass("sapMTokenSelected"), "token is selected");

	});

	QUnit.test("setter / getter textDirection", function(assert) {
		this.token1.setTextDirection(TextDirection.RTL);
		assert.equal(this.token1.getTextDirection(), TextDirection.RTL, "Input value is " + TextDirection.RTL);
	});

	QUnit.test("Token has attribute dir", function(assert) {
		this.token1.setTextDirection(TextDirection.RTL);
		sap.ui.getCore().applyChanges();

		assert.equal(this.token1.$().children(0).attr("dir"), 'rtl', "Token has attribute dir equal to rtl");
	});

	QUnit.module("Keyboard Handling", {
		beforeEach : function() {
			this.token1 = new Token("t1");
			this.token1.placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.token1.destroy();
		}
	});

	QUnit.test("Ctrl + Space", function(assert) {
		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t1", KeyCodes.SPACE, false, false, true);

		// assert
		assert.equal(this.token1.getSelected(), true, "Token is selected");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t1", KeyCodes.SPACE, false, false, true);

		// assert
		assert.equal(this.token1.getSelected(), false, "Token is deselected");
	});

	QUnit.test("Backspace", function(assert) {
		// arrange
		var fnFireDeleteSpy = this.spy(this.token1, "fireDelete");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t1", KeyCodes.BACKSPACE);

		// assert
		assert.equal(fnFireDeleteSpy.callCount, 1, "delete event was fired");
	});

	QUnit.test("Delete", function(assert) {
		// arrange
		var fnFireDeleteSpy = this.spy(this.token1, "fireDelete");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t1", KeyCodes.DELETE);

		// assert
		assert.equal(fnFireDeleteSpy.callCount, 1, "delete event was fired");
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

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Selection", function(assert) {
		// act
		sap.ui.test.qunit.triggerEvent("tap", this.token1.getDomRef());
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.ARROW_RIGHT);

		// assert
		assert.ok(this.token1.getSelected(), 1, "Token1 is selected.");
		assert.equal(document.activeElement, this.token2.getDomRef(), "Token2 is focused after navigation.");
	});

	QUnit.test("Pressing delete icon", function(assert) {
		// arrange
		var fnFireDeleteSpy = this.spy(this.token1, "fireDelete"),
			oDeleteTokenSpy = this.spy(this.tokenizer, "_onTokenDelete"),
			oPreventSpy = this.spy(),
			oTokenIcon = this.token1.$("icon"),
			oFakeEvent = {
				preventDefault: oPreventSpy
			};

		// act
		this.token1._tokenIconPress(oFakeEvent);

		// assert
		assert.equal(fnFireDeleteSpy.callCount, 1, "delete event was fired");
		assert.ok(this.token1.bIsDestroyed, "Token1 is destroyed");
		assert.strictEqual(oPreventSpy.calledOnce, true, "The event was prevented from bubbling.");
		assert.strictEqual(oDeleteTokenSpy.calledOnce, true, "The tokenizer's '_onTokenDelete' was called");
		assert.deepEqual(oDeleteTokenSpy.firstCall.args[0], this.token1, "The deleted token was passed to the tokenizer.");
	});

	QUnit.module("ARIA attributes", {
		beforeEach : function() {
			this.token1 = new Token("t1");
			this.token1.placeAt("content");

			sap.ui.getCore().applyChanges();
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

	QUnit.test("ARIA Selection text", function(assert) {
		var sId = InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_SELECTED");

		assert.ok(!this.token1.$().attr("aria-selected"), "aria-selected is not valid property for the current type of role - listitem");

		this.token1.setSelected(true);
		sap.ui.getCore().applyChanges();
		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) > -1, "Token has correct invisible text ID added to aria-describedby attribute");

		this.token1.setSelected(false);
		sap.ui.getCore().applyChanges();
		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) === -1, "Token has the invisible text ID removed from aria-describedby attribute");

	});

	QUnit.test("ARIA Editable (deletable) text", function(assert) {
		var sId = InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_DELETABLE");

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) > -1, "Token has correct invisible text ID added to aria-describedby attribute");

		this.token1.setEditable(false);
		this.token1.invalidate(); // simulate parent invalidation
		sap.ui.getCore().applyChanges();

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) === -1, "Token has the invisible text ID removed from aria-describedby attribute");
	});

	QUnit.test("ARIA editableParent (deletable) text", function(assert) {
		var sId = InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_DELETABLE");

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) > -1, "Token has correct invisible text ID added to aria-describedby attribute");

		this.token1.setProperty("editableParent", false);
		this.token1.invalidate(); // simulate parent invalidation
		sap.ui.getCore().applyChanges();

		assert.ok(this.token1.$().attr("aria-describedby").split(" ").indexOf(sId) === -1, "Token has the invisible text ID removed from aria-describedby attribute");
	});

});