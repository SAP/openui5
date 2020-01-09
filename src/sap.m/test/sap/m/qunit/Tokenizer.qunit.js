/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Tokenizer",
	"sap/m/Token",
	"sap/m/MultiInput",
	"sap/ui/base/Event",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes"
], function(QUnitUtils, createAndAppendDiv, Tokenizer, Token, MultiInput, Event, Device, KeyCodes) {
	createAndAppendDiv("content");


	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");


	QUnit.module("Init", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("test scroll width", function(assert) {
		assert.strictEqual(this.tokenizer.getScrollWidth(), 0, 'Scroll width should be 0 when control is not rendered');
	});

	QUnit.test("scrollToStart before tokenizer is rendered", function(assert) {
		var fnDeactivateScrollSpy = this.spy(this.tokenizer, "_deactivateScrollToEnd");

		// act
		this.tokenizer.scrollToStart();

		// assert
		assert.equal(fnDeactivateScrollSpy.callCount, 0, "_deactivateScrollToEnd was not called");
	});

	QUnit.test("scrollToEnd after tokenizer is rendered", function(assert) {
		var fnScrollToEndSpy = this.spy(this.tokenizer, "scrollToEnd");

		//arrange
		this.tokenizer.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(fnScrollToEndSpy.callCount, "scrollToEnd was called");
		assert.ok(this.tokenizer._sResizeHandlerId, "Tokenizer has resize handler.");

		//clean
		fnScrollToEndSpy.restore();
	});

	QUnit.module("Basic", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer("t1");
			this.tokenizer.placeAt("content");
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("validator add/remove/removeAll", function(assert) {
		// arrange
		var function1 = function() {},
			function2 = function() {},
			function3 = function() {};

		// act
		this.tokenizer.removeAllValidators();

		// assert
		assert.equal(this.tokenizer._aTokenValidators.length, 0, "No token validators available");

		// act
		this.tokenizer.addValidator(function1);

		// assert
		assert.equal(this.tokenizer._aTokenValidators.length, 1, "1 token validator available");

		// act
		this.tokenizer.addValidator(function2);
		this.tokenizer.addValidator(function3);

		this.tokenizer.removeValidator(function2);

		// assert
		assert.equal(this.tokenizer._aTokenValidators.length, 2, "2 token validators available");

		// act
		this.tokenizer.removeAllValidators();

		// assert
		assert.equal(this.tokenizer._aTokenValidators.length, 0, "No token validators available");
	});

	QUnit.test("clone", function(assert) {
		//arrange
		var token1 = new Token(),
			token2 = new Token(),
			token3 = new Token(),
			tokenizerClone;

		this.tokenizer.addToken(token1);
		this.tokenizer.addToken(token2);
		this.tokenizer.addToken(token3);

		//act
		tokenizerClone = this.tokenizer.clone();

		//assert
		assert.equal(tokenizerClone.getTokens().length, 3, "Clone has 3 tokens");

		//clean-up
		tokenizerClone.destroy();
	});

	QUnit.test("tokens aggregation", function(assert) {
		var token1 = new Token(),
			token2 = new Token(),
			token3 = new Token();

		this.tokenizer.addToken(token1);
		this.tokenizer.addToken(token2);
		this.tokenizer.addToken(token3);

		assert.equal(this.tokenizer.getTokens().length, 3, "Tokenizer contains 3 tokens");

		this.tokenizer.removeToken(token1);
		assert.equal(this.tokenizer.getTokens().length, 2, "Tokenizer contains 2 tokens");

		this.tokenizer.removeAllTokens();
		assert.equal(this.tokenizer.getTokens().length, 0, "Tokenizer contains 0 tokens");
	});

	QUnit.test("validate tokens using validator callback", function(assert) {
		var validationCallbackCount = 0,
			isValidated = false,
			fValidationCallback = function(bValidated) {
				validationCallbackCount++;
				isValidated = bValidated;
			},
			tokenText = "new Token 1";

		this.tokenizer.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});

		assert.equal(validationCallbackCount, 1, "validation callback called 1x");

		assert.equal(isValidated, false, "token not validated");

		this.tokenizer.addValidateToken({
			text : tokenText,
			token : new Token({
				text : tokenText
			}),
			validationCallback : fValidationCallback
		});

		assert.equal(this.tokenizer.getTokens().length, 1, "Tokenizer contains 1 token");
		assert.equal(this.tokenizer.getTokens()[0].getText(), tokenText, "added token contains validated text");
		assert.equal(validationCallbackCount, 2, "validation callback called 2x");
		assert.equal(isValidated, true, "token got validated");



		this.tokenizer.removeAllTokens();

		this.tokenizer.addValidator(function(args) {
			return new Token({
				text : args.text
			});
		});

		tokenText = "TestToken1";
		this.tokenizer.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});

		assert.equal(this.tokenizer.getTokens().length, 1, "Tokenizer contains 1 token");
		assert.equal(this.tokenizer.getTokens()[0].getText(), tokenText, "added token contains validated text");
		assert.equal(validationCallbackCount, 3, "validation callback called 3x");
		assert.equal(isValidated, true, "token got validated");

		isValdiated = false;
		var tokenText = "TestToken2";
		this.tokenizer.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});

		assert.equal(this.tokenizer.getTokens().length, 2, "Tokenizer contains 2 tokens");
		assert.equal(this.tokenizer.getTokens()[1].getText(), tokenText, "added token contains validated text");
		assert.equal(validationCallbackCount, 4, "validation callback called 4x");
		assert.equal(isValidated, true, "token got validated");

		this.tokenizer.removeAllValidators();
		this.tokenizer.addValidator(function(args) {
			return;
		});
		tokenText = "TestToken3";
		this.tokenizer.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});
		assert.equal(this.tokenizer.getTokens().length, 2, "Tokenizer contains 2 tokens, no token added as validator rejected it");
		assert.equal(validationCallbackCount, 5, "validation callback called 5x");
		assert.equal(isValidated, false, "token not validated");

		var fAsyncValidateCallback;
		this.tokenizer.removeAllValidators();
		this.tokenizer.addValidator(function(args) {
			fAsyncValidateCallback = args.asyncCallback;
			return Tokenizer.WaitForAsyncValidation;
		});
		tokenText = "TestToken4";
		this.tokenizer.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});
		assert.equal(this.tokenizer.getTokens().length, 2,
				"Tokenizer contains 2 tokens, no token added as validator runs asynchronously");
		assert.equal(validationCallbackCount, 5, "validation callback called 5x (1 call still pending)");

		fAsyncValidateCallback(new Token({
			text : "dummy"
		}));

		assert.equal(this.tokenizer.getTokens().length, 3, "Tokenizer contains 3 tokens");
		assert.equal(validationCallbackCount, 6, "validation callback called 6x");
		assert.equal(isValidated, true, "token got validated");
	});

	QUnit.test("tokens change event", function(assert) {
		var eventType,
			token1 = new Token();

		this.tokenizer.attachTokenChange(function(args) {
			eventType = args.getParameter("type");
		});

		this.tokenizer.addToken(token1);
		assert.equal(eventType, Tokenizer.TokenChangeType.Added, "added event raised");

		this.tokenizer.removeToken(token1);
		assert.equal(eventType, Tokenizer.TokenChangeType.Removed, "removed event raised");

		this.tokenizer.removeAllTokens();
		assert.equal(eventType, Tokenizer.TokenChangeType.RemovedAll, "removedAll event raised");

		// clean-up
		token1.destroy();
	});

	QUnit.test("tokenUpdate event", function(assert) {
		var eventType,
			token1 = new Token({key: "test", text: "test", selected: true}),
			count = 0;

		this.tokenizer.attachTokenUpdate(function(args) {
			eventType = args.getParameter("type");
			count++;
		});

		this.tokenizer._addValidateToken({
			token : token1,
			validationCallback : function() {return true;}
		});
		assert.strictEqual(eventType, Tokenizer.TokenUpdateType.Added, "tokenUpdate event raised when token added");
		assert.strictEqual(count, 1, "tokenUpdate event fired once upon adding unique token");

		this.tokenizer._removeSelectedTokens();
		assert.strictEqual(eventType, Tokenizer.TokenUpdateType.Removed, "tokenUpdate event raised when token removed");
		assert.strictEqual(count, 2, "tokenUpdate event fired once upon removing selected token");

		// clean-up
		token1.destroy();
	});

	QUnit.test("getSelectedTokens", function(assert) {
		var token1 = new Token({ selected : true });
		var token2 = new Token();
		var token3 = new Token({ selected : true });

		this.tokenizer.addToken(token1);
		this.tokenizer.addToken(token2);
		this.tokenizer.addToken(token3);

		var aSelectedTokens = this.tokenizer.getSelectedTokens();

		assert.equal(aSelectedTokens.length, 2, "2 selected tokens");
		assert.equal(aSelectedTokens[0], token1, "correct selected token1");
		assert.equal(aSelectedTokens[1], token3, "correct selected token3");
		assert.equal(this.tokenizer.isAllTokenSelected(), false, "not all tokens are selected");

		// act
		token2.setSelected(true);

		// assert
		assert.equal(this.tokenizer.isAllTokenSelected(), true, "all tokens are selected");
	});

	QUnit.test("test keyboard select all", function(assert) {
		// arrange
		var token1 = new Token(),
			token2 = new Token(),
			token3 = new Token();

		this.tokenizer.setTokens([token1, token2, token3]);

		// act
		this.tokenizer.onkeydown({ctrlKey: true, which: KeyCodes.A, preventDefault: function(){}, stopPropagation: function(){}});

		// assert
		assert.equal(token1.getSelected(), true, "Token1 got selected using ctrl+a");
		assert.equal(token2.getSelected(), true, "Token2 got selected using ctrl+a");
		assert.equal(token3.getSelected(), true, "Token3 got selected using ctrl+a");

		// act
		token1.setSelected(false);
		token2.setSelected(false);
		token3.setSelected(false);

		this.tokenizer.onkeydown({metaKey: true, which: KeyCodes.A, preventDefault: function(){}, stopPropagation: function(){}});

		// assert
		assert.equal(token1.getSelected(), true, "Token1 got selected using metaKey+a");
		assert.equal(token2.getSelected(), true, "Token2 got selected using metaKey+a");
		assert.equal(token3.getSelected(), true, "Token3 got selected using metaKey+a");
	});


	QUnit.test("token editable in tokenizer", function(assert) {
		var oToken1 = new Token({text:"Dente", editable: false}),
			oToken2 = new Token({text:"Friese", editable: false}),
			oToken3 = new Token({text:"Mann", editable: true});

		this.tokenizer.setTokens([oToken1, oToken2, oToken3]);

		sap.ui.getCore().applyChanges();

		assert.equal(oToken1.$().hasClass("sapMTokenReadOnly"), true, "token1 is not editable");
		assert.equal(oToken2.$().hasClass("sapMTokenReadOnly"), true, "token2 is not editable");
		assert.equal(oToken3.$().hasClass("sapMTokenReadOnly"), false, "token3 is editable");
	});

	QUnit.test("selected token is visible after select with left arrow", function(assert) {
		var oSpecialToken = new Token({text: "Token 5", key: "0005"}),
			oMultiInput = new MultiInput({
				width: '800px',
				tokens: [
					new Token({text: "Token 1", key: "0001"}),
					new Token({text: "Token 2", key: "0002"}),
					new Token({text: "Token 3", key: "0003"}),
					new Token({text: "Token 4", key: "0004"}),
					oSpecialToken,
					new Token("t6", {text: "Token 6", key: "0006"})
				],
				editable: true
			});

		oMultiInput.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oTokenizerDomRef = oMultiInput.$().find('.sapMTokenizer')[0];

		// act
		sap.ui.test.qunit.triggerKeydown(oTokenizerDomRef, KeyCodes.ARROW_LEFT);

		// assert
		assert.strictEqual(sap.ui.getCore().byId("t6").getDomRef().id, document.activeElement.id,
			"Token6 is selected.");

		// act
		sap.ui.test.qunit.triggerKeydown(oTokenizerDomRef, KeyCodes.ARROW_LEFT);

		// assert
		assert.strictEqual(oSpecialToken.getDomRef().id, document.activeElement.id,
			"Token5 is selected.");
		assert.ok(oSpecialToken.$().offset().left >= jQuery(oTokenizerDomRef).offset().left, "token 5 left side is visible.");

		oMultiInput.destroy();
	});

	QUnit.test("test setEditable=false Tokenizer with editable tokens", function(assert) {
		var aFirstToken,
			aSecondToken;

		//arrange
		this.tokenizer.addToken(new Token({text: "Token 1", key: "0001"}));
		this.tokenizer.addToken(new Token({text: "Token 2", key: "0002", editable: false}));

		aFirstToken = this.tokenizer.getTokens()[0];
		aSecondToken = this.tokenizer.getTokens()[1];

		sap.ui.getCore().applyChanges();

		//assert
		assert.ok(aFirstToken.getDomRef('icon'), 'First token has icon');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');

		//act
		this.tokenizer.setEditable(false);

		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(aFirstToken.$('icon').css('display'), 'none', 'First token icon is invisible');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');
	});

	QUnit.module("Setters", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer();

			this.tokenizer.placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("setEditable", function () {
		this.tokenizer.addToken(new Token({text: "Token 1", key: "0001"}));

		oToken = this.tokenizer.getTokens()[0];
		sap.ui.getCore().applyChanges();

		assert.ok(oToken.getProperty("editableParent"), "Token's parent is editable");

		this.tokenizer.setEditable(false);

		assert.strictEqual(this.tokenizer.getEditable(), false, "The property of the Tokenizer was set.");
		assert.strictEqual(oToken.getProperty("editableParent"), false, "The editableParent property of the Token was correctly set");
	});

	QUnit.test("setWidth and setPixelWidth", function(assert) {
		var WIDTH = 300,
			S_WIDTH = "200px";

		// act
		this.tokenizer.setWidth(S_WIDTH);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(this.tokenizer.getDomRef().style.width, S_WIDTH, "Tokenizer width is set to " + S_WIDTH);

		// act
		this.tokenizer.setPixelWidth("400px");
		sap.ui.getCore().applyChanges();

		assert.equal(this.tokenizer.getDomRef().style.width, S_WIDTH, "Tokenizer width remains " + S_WIDTH);

		// act
		this.tokenizer.setPixelWidth(WIDTH);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(this.tokenizer.getDomRef().style.width, WIDTH + "px", "Tokenizer width is set to 300px");
	});

	QUnit.test("setMaxWidth", function(assert) {
		var MAX_WIDTH = "300px";

		// act
		this.tokenizer.setMaxWidth(MAX_WIDTH);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(this.tokenizer.getDomRef().style.maxWidth, MAX_WIDTH, "Tokenizer max-width is set to " + MAX_WIDTH);
	});

	QUnit.test("setMaxWidth in adjustable tokenizer calls _adjustTokensVisibility", function(assert) {
		var MAX_WIDTH = "300px";
		this.tokenizer._setAdjustable(true);

		// act
		var spy = this.spy(Tokenizer.prototype, "_adjustTokensVisibility");
		this.tokenizer.setMaxWidth(MAX_WIDTH);

		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(spy.called, "tokenizer's _adjustTokensVisibility is called");

		spy.restore();
	});

	QUnit.test("setEnabled", function(assert) {
		// act
		this.tokenizer.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(jQuery(this.tokenizer.getDomRef()).hasClass("sapMTokenizerDisabled"), "Tokenizer's dom has class sapMTokenizerDisabled");
	});

	QUnit.module("Disabled state", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer("t1");
			this.tokenizer.placeAt("content");
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Pressing delete icon when Tokenizer is disabled", function(assert) {
		// arrange
		var fnFireDeleteSpy,
			oToken = new Token({text: "test"}),
			oTokenIcon = jQuery("#t1-icon")[0];

		fnFireDeleteSpy = this.spy(oToken, "fireDelete");
		this.tokenizer.addToken(oToken);
		this.tokenizer.setEnabled(false);

		// act
		oToken._tokenIconPress({preventDefault: function () {}});

		// assert
		assert.equal(fnFireDeleteSpy.callCount, 0, "delete event was NOT fired");
		assert.ok(!oToken.bIsDestroyed, "Token1 is NOT destroyed");

		fnFireDeleteSpy.restore();
	});

	QUnit.module("Scrolling public API", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer({
				width: "200px",
				tokens : [
					new Token({ text : "Token 1"}),
					new Token({ text : "Token 2"}),
					new Token({ text : "Token 3"})
				]
			});

			this.tokenizer.placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("scrollToStart and scrollToEnd", function(assert) {
		// assert
		assert.ok(this.tokenizer._sResizeHandlerId, "Tokenizer has resize handler.");

		// act
		this.tokenizer.scrollToStart();

		//assert
		assert.ok(!this.tokenizer._sResizeHandlerId, "Tokenizer's resize handler has been deregistered.");

		// act
		this.tokenizer.scrollToEnd();

		//assert
		assert.ok(this.tokenizer._sResizeHandlerId, "Tokenizer has resize handler.");
	});

	QUnit.module("Keyboard handling", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer("t", {
				tokens : [
					new Token("t1", { text : "Token 1", selected : true}),
					new Token("t2", { text : "Token 2", selected : false}),
					new Token("t3", { text : "Token 3", selected : true})
				]
			});

			this.tokenizer.placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("delete with editable=false", function(assert) {
		// arrange
		this.tokenizer.setEditable(false);

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.DELETE);

		// assert
		assert.equal(this.tokenizer.getTokens().length, 3, "No tokens were removed");
	});

	QUnit.test("delete with enabled=false", function(assert) {
		// arrange
		var oFakeEvent = {
			preventDefault: function () {},
			setMarked: function () {},
			keyCode: KeyCodes.DELETE,
			which: KeyCodes.DELETE
		};

		this.tokenizer.setEnabled(false);

		// act
		this.tokenizer.onkeydown(oFakeEvent);

		// assert
		assert.equal(this.tokenizer.getTokens().length, 3, "No tokens were removed");
	});

	QUnit.test("delete with editable=true", function(assert) {
		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.DELETE);

		// assert
		assert.equal(this.tokenizer.getTokens().length, 1, "Two tokens were removed");
		assert.equal(document.activeElement, this.tokenizer.$()[0], "tokenizer is focused");
	});

	QUnit.test("backspace with no selected tokens", function(assert) {
		// arrange
		this.tokenizer._changeAllTokensSelection(false);

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.BACKSPACE);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 0, "There aren't any selected tokens");
		assert.strictEqual(this.tokenizer.getTokens()[2].getDomRef().id, document.activeElement.id,
			"The last token is selected");
	});

	QUnit.test("backspace with editable=false", function(assert) {
		// arrange
		var oFakeEvent = {
			preventDefault: function () {},
			setMarked: function () {},
			keyCode: KeyCodes.BACKSPACE,
			which: KeyCodes.BACKSPACE
		};

		this.tokenizer.setEditable(false);

		// act
		this.tokenizer.onsapbackspace(oFakeEvent);

		// assert
		assert.equal(this.tokenizer.getTokens().length, 3, "No tokens were removed");
	});

	QUnit.test("backspace with enabled=false", function(assert) {
		// arrange
		var oFakeEvent = {
			preventDefault: function () {},
			setMarked: function () {},
			keyCode: KeyCodes.BACKSPACE,
			which: KeyCodes.BACKSPACE
		};

		this.tokenizer.setEnabled(false);

		// act
		this.tokenizer.onsapbackspace(oFakeEvent);

		// assert
		assert.equal(this.tokenizer.getTokens().length, 3, "No tokens were removed");
	});

	QUnit.test("backspace with editable=true", function(assert) {
		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.BACKSPACE);

		// assert
		assert.equal(this.tokenizer.getTokens().length, 1, "Two tokens were removed");
	});

	QUnit.test("backspace on tokenizer with one token", function(assert) {
		var oToken = new Token("token", { text : "Token 1", selected : true}),
			oTokenizer = new Tokenizer("tokenizer", {
				tokens: [
					oToken
				]
			});
		oTokenizer.placeAt("content");
		sap.ui.getCore().applyChanges();


		var preventDefaultSpy = this.spy(),
			oFakeEvent = {
				preventDefault: preventDefaultSpy,
				target: oToken,
				setMarked: function () {},
				keyCode: KeyCodes.BACKSPACE,
				which: KeyCodes.BACKSPACE
			};

		// Act
		oTokenizer.onsapbackspace(oFakeEvent);

		//Assert
		assert.strictEqual(preventDefaultSpy.callCount, 2, "The default action of onsapbackspace and onsapprevious is prevented.");

		oTokenizer.destroy();
	});

	QUnit.test("tab", function(assert) {
		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.TAB);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 0, "There are no selected tokens");
	});

	QUnit.test("Ctrl + C (copy)", function(assert) {
		// arrange
		var fnCopySpy = this.spy(this.tokenizer, "_copy");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.C, false, false, true);

		// assert
		assert.equal(fnCopySpy.callCount, 1, "Copy was triggered");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.INSERT, false, false, true);

		// assert
		assert.equal(fnCopySpy.callCount, 2, "Copy was triggered");
	});

	QUnit.test("Ctrl + X (cut)", function(assert) {
		var fnCutSpy = this.spy(this.tokenizer, "_cut");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.X, false, false, true);

		// assert
		assert.equal(fnCutSpy.callCount, 1, "Cut was triggered");
	});

	QUnit.test("Ctrl + X (cut) Disabled Tokenizer", function(assert) {
		var fnCutSpy = this.spy(this.tokenizer, "_cut"),
			oFakeEvent = {
				preventDefault: function () {},
				setMarked: function () {},
				keyCode: KeyCodes.BACKSPACE,
				which: KeyCodes.BACKSPACE,
				metaKey: true
			};

		// arrange
		this.tokenizer.setEnabled(false);

		// act
		this.tokenizer.onkeydown(oFakeEvent);

		// assert
		assert.equal(fnCutSpy.callCount, 0, "Cut was NOT triggered");

		// clean
		fnCutSpy.restore();
	});

	QUnit.test("Ctrl + X (copy)", function(assert) {
		// arrange
		var fnCopySpy = this.spy(this.tokenizer, "_copy");

		this.tokenizer.setEditable(false);

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.X, false, false, true);

		// assert
		assert.equal(fnCopySpy.callCount, 1, "Copy was triggered");
	});

	QUnit.test("Shift + DELETE (cut)", function(assert) {
		var fnCutSpy = this.spy(this.tokenizer, "_cut");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.DELETE, true);

		// assert
		assert.equal(fnCutSpy.callCount, 1, "Cut was triggered");
	});

	QUnit.test("Shift + DELETE (cut) Disabled Tokenizer", function(assert) {
		var fnCutSpy = this.spy(this.tokenizer, "_cut"),
			oFakeEvent = {
				preventDefault: function () {},
				setMarked: function () {},
				keyCode: KeyCodes.DELETE,
				which: KeyCodes.DELETE
			};

		// arrange
		this.tokenizer.setEnabled(false);

		// act
		this.tokenizer.onkeydown(oFakeEvent);

		// assert
		assert.equal(fnCutSpy.callCount, 0, "Cut was NOT triggered");
	});

	QUnit.test("Shift + DELETE (copy)", function(assert) {
		// arrange
		var fnCopySpy = this.spy(this.tokenizer, "_copy");

		this.tokenizer.setEditable(false);

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.DELETE, true);

		// assert
		assert.equal(fnCopySpy.callCount, 1, "Copy was triggered");
	});

	QUnit.test("Arrow_right", function(assert) {
		// arrange
		sap.ui.getCore().byId("t1").focus();

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t1", KeyCodes.ARROW_RIGHT);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 2, "The initial selection is preserved");
		assert.equal(this.tokenizer.getTokens()[1].getId(), "t2", "The second token is not selected");
	});

	QUnit.test("Arrow_right when tokenizer is focused", function(assert) {
		//arrange
		this.tokenizer.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(this.tokenizer.getId(), KeyCodes.ARROW_RIGHT);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 0, "There aren't any selected token");
		assert.strictEqual(this.tokenizer.getTokens()[0].getId(), document.activeElement.id,
			"The first token in the multiinput is focused.");
	});

	QUnit.test("Arrow_right when last token in tokenizer is focused", function(assert) {
		// arrange
		var oTokenizer = this.tokenizer,
			oSpy = sinon.spy(oTokenizer, "onsapnext"),
			oEventArg;

		sap.ui.getCore().byId("t3").focus();

		// act
		sap.ui.test.qunit.triggerKeydown("t", KeyCodes.ARROW_RIGHT);
		oEventArg = oSpy.getCall(0).args[0];

		// assert
		assert.equal(document.activeElement.id, "t3", "The third token is still selected");

		// The Tokenizer does not process right key press on its last token, but leaves the event
		// to bubble up.
		assert.equal(oSpy.callCount, 1, "Only one event is triggered");
		assert.equal(oEventArg.isMarked(), false, "The event was not processed by the Tokenizer");

		oSpy.restore();
	});

	QUnit.test("Arrow_up", function(assert) {
		// arrange
		sap.ui.getCore().byId("t1").focus();

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t1", KeyCodes.ARROW_UP);

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 2, "Token selection is not changed");
	});

	QUnit.test("_selectRange(true)", function() {
		var oTokenizer = new Tokenizer().placeAt("content"),
			aSelectedTokens,
			oSecondToken = new Token("tok1");

		oTokenizer.setTokens([
			new Token("tok0"),
			oSecondToken,
			new Token("tok2")
		]);

		sap.ui.getCore().applyChanges();

		// act
		oSecondToken.focus();
		oTokenizer._selectRange(true); // select all tokens till the end

		// assert
		aSelectedTokens = oTokenizer.getSelectedTokens();
		assert.equal(aSelectedTokens.length, 2, "Two tokens are selected");
		assert.strictEqual(aSelectedTokens[0].getId(), oSecondToken.getId(), "The middle token is selected");
		assert.strictEqual(aSelectedTokens[1].getId(), "tok2", "The last token is selected");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("RIGHT_ARROW + invisible token", function(assert) {
		// arrange
		var oTokenizer = new Tokenizer({
			tokens: [
				new Token({text: "Token1", visible: true}),
				new Token({text: "Token2", visible: false}),
				new Token({text: "Token3", visible: true})
			]
		}).placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oTokenizer.getTokens()[0].focus();
		sap.ui.test.qunit.triggerKeydown(oTokenizer.getTokens()[0].getDomRef(), KeyCodes.ARROW_RIGHT);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oTokenizer.getTokens()[2].getDomRef(), document.activeElement, "The navigation was successful.");
	});

	QUnit.test("LEFT_ARROW + invisible token", function(assert) {
		// arrange
		var oTokenizer = new Tokenizer({
			tokens: [
				new Token({text: "Token1", visible: true}),
				new Token({text: "Token2", visible: false}),
				new Token({text: "Token3", visible: true})
			]
		}).placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oTokenizer.getTokens()[2].focus();
		sap.ui.test.qunit.triggerKeydown(oTokenizer.getTokens()[2].getDomRef(), KeyCodes.ARROW_LEFT);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oTokenizer.getTokens()[0].getDomRef(), document.activeElement, "The navigation was successful.");
	});

	QUnit.test("_selectRange(false)", function() {
		var oTokenizer = new Tokenizer().placeAt("content"),
			aSelectedTokens,
			oSecondToken = new Token("tok1");

		oTokenizer.setTokens([
			new Token("tok0"),
			oSecondToken,
			new Token("tok2")
		]);

		sap.ui.getCore().applyChanges();

		// act
		oSecondToken.focus();
		oTokenizer._selectRange(false); // select all tokens till the beginning

		// assert
		aSelectedTokens = oTokenizer.getSelectedTokens();
		assert.equal(aSelectedTokens.length, 2, "Two tokens are selected");
		assert.strictEqual(aSelectedTokens[0].getId(), "tok0", "The first token is selected");
		assert.strictEqual(aSelectedTokens[1].getId(), oSecondToken.getId(), "The middle token is selected");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("onsapend", function() {
		var oEvent = new jQuery.Event(),
			aTokens,
			oTokenizer = new Tokenizer({
				tokens: [new Token(), new Token(), new Token()]
			}).placeAt("content");

		aTokens = oTokenizer.getTokens();

		sap.ui.getCore().applyChanges();

		// act
		oTokenizer.onsapend(oEvent);

		// assert
		assert.strictEqual(aTokens[aTokens.length - 1].getDomRef(), document.activeElement, "The last token is focused.");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("onsaphome", function() {
		var oEvent = new jQuery.Event(),
			oTokenizer = new Tokenizer({
				tokens: [new Token(), new Token(), new Token()]
			}).placeAt("content");

		sap.ui.getCore().applyChanges();

		// act
		oTokenizer.onsaphome(oEvent);

		// assert
		assert.strictEqual(oTokenizer.getTokens()[0].getDomRef(), document.activeElement, "The first token is focused.");

		// clean up
		oTokenizer.destroy();
	});

	QUnit.test("HOME + SHIFT", function() {
		var oSpySelection = this.spy(this.tokenizer, "_selectRange");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.HOME, true);

		// assert
		assert.ok(oSpySelection.called, "Range selection is triggered");
		assert.ok(oSpySelection.calledWith(false), "Range selection should select all tokens until the beginning");

		// clean up
		oSpySelection.restore();
	});

	QUnit.test("END + SHIFT", function() {
		var oSpySelection = this.spy(this.tokenizer, "_selectRange");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.END, true);

		// assert
		assert.ok(oSpySelection.called, "Range selection is triggered");
		assert.ok(oSpySelection.calledWith(true), "Range selection should select all tokens until the end");

		// clean up
		oSpySelection.restore();
	});

	QUnit.test("ARROW_LEFT + CTR", function() {
		var oSpyPrevious = this.spy(this.tokenizer, "onsapprevious");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.ARROW_LEFT, false, false, true);

		// assert
		assert.ok(oSpyPrevious.called, "Backward navigation is triggered");

		// clean up
		oSpyPrevious.restore();
	});

	QUnit.test("ARROW_RIGHT + CTR", function() {
		var oSpyNext = this.spy(this.tokenizer, "onsapnext");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.ARROW_RIGHT, false, false, true);

		// assert
		assert.ok(oSpyNext.called, "Forward navigation is triggered");

		// clean up
		oSpyNext.restore();
	});



	QUnit.module("Token selection", {
		beforeEach : function() {
			this.t1 = new Token({ text : "Token 1"});
			this.t3 = new Token({ text : "Token 3", selected : true});
			this.t5 = new Token({ text : "Token 5"});
			this.tokenizer = new Tokenizer({
				tokens : [
					this.t1,
					new Token({ text : "Token 2"}),
					this.t3,
					new Token({ text : "Token 4"}),
					this.t5
				]
			});

			this.tokenizer.placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Test token selection with Shift and Ctrl", function(assert){
		// arrange
		this.t3.focus();

		// act
		sap.ui.test.qunit.triggerEvent("tap", this.t1.getDomRef(), {target : this.t1.getDomRef(), shiftKey: true});

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 3, "Tokens 1 to 3 are selected");

		// act
		sap.ui.test.qunit.triggerEvent("tap", this.t5.getDomRef(), {target : this.t5.getDomRef(), shiftKey: true, ctrlKey: true});

		// assert
		assert.equal(this.tokenizer.getSelectedTokens().length, 5, "All 5 tokens are selected");
	});

	QUnit.module("Copy and paste", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer();

			this.tokenizer.placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("parsing for copy and paste", function(assert) {
		var text1 = "1\r\n2\r\n3",
			aTextArray1 = this.tokenizer._parseString(text1);

		assert.equal(aTextArray1[0], "1", "text separated");
		assert.equal(aTextArray1[1], "2", "text separated");
		assert.equal(aTextArray1[2], "3", "text separated");

		var text1 = "1 2\n2+4\r3)\t(/&%$)";
		var aTextArray1 = this.tokenizer._parseString(text1);

		assert.equal(aTextArray1[0], "1 2", "text separated");
		assert.equal(aTextArray1[1], "2+4", "text separated");
		assert.equal(aTextArray1[2], "3)\t(/&%$)", "text separated");
	});

	QUnit.test("Copy to clipboard (Non IE):", function(assert) {
		if (Device.browser.msie) {
			assert.ok(true, "There is separate test for IE browser");
			return;
		}
		assert.expect(6);
		var oAddListenerSpy = new sinon.spy(document, "addEventListener"),
			oExecCommandSpy = new sinon.spy(document, "execCommand"),
			fnCopyToClipboard = null,
			oDummyEvent1 = {
				clipboardData: {
					setData: function (sType, sText) {
						assert.strictEqual(
							sType,
							"text/plain",
							"Type 1: The correct type was added to the clipboard data object: " + sType
						);
						assert.strictEqual(
							sText,
							"Token 0\r\nToken 1\r\nToken 2\r\nToken 3",
							"Type 1: The correct text was added to the clipboard data object: " + sText
						);
					}
				},
				preventDefault: function () {}
			},
			oDummyEvent2 = {
				originalEvent : {
					clipboardData: {
						setData: function (sType, sText) {
							assert.strictEqual(
								sType,
								"text/plain",
								"Type 2: The correct type was added to the clipboard data object: " + sType
							);
							assert.strictEqual(
								sText,
								"Token 0\r\nToken 1\r\nToken 2\r\nToken 3",
								"Type 2: The correct text was added to the clipboard data object: " + sText
							);
						}
					}
				},
				preventDefault: function () {}
			};

		// arrange
		for (var i = 0; i < 4; i++) {
			this.tokenizer.addToken(new Token({text: "Token " + i, key: "000" + i}));
		}
		sap.ui.getCore().applyChanges();

		this.tokenizer.focus();
		this.tokenizer.selectAllTokens(true);

		document.addEventListener("copy", oExecCommandSpy);

		// act
		this.tokenizer._copy();

		// assert
		// we can intercept the attached function by
		// getting the second call - called from inside the _copy method
		// and then its second argument
		fnCopyToClipboard = oAddListenerSpy.getCall(1).args[1];
		// Now we can check if it does attach the correct text
		// to the provided event object

		fnCopyToClipboard.call(this, oDummyEvent1);
		fnCopyToClipboard.call(this, oDummyEvent2);

		assert.strictEqual(oExecCommandSpy.callCount, 1, "The method was called only once");
		assert.strictEqual(oExecCommandSpy.getCall(0).args[0], "copy", "The command was copy");

		// cleanup
		document.removeEventListener("copy", oExecCommandSpy);
		oAddListenerSpy.restore();
		oExecCommandSpy.restore();
	});

	QUnit.test("Copy to clipboard (IE):", function(assert) {
		if (!(Device.browser.msie && window.clipboardData && window.clipboardData.getData)) {
			assert.ok(true, "There is separate test for non IE browsers");
			return;
		}
		assert.expect(1);

		// arrange
		for (var i = 0; i < 4; i++) {
			this.tokenizer.addToken(new Token({text: "Token " + i, key: "000" + i}));
		}
		sap.ui.getCore().applyChanges();

		this.tokenizer.focus();
		this.tokenizer.selectAllTokens(true);

		// act
		this.tokenizer._copy();

		// assert
		assert.strictEqual(
			window.clipboardData.getData("Text"),
			"Token 0\r\nToken 1\r\nToken 2\r\nToken 3",
			"The correct text was added to the clipboard data object"
		);
	});

	QUnit.module("useCollapsedMode", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Basic: ", function(assert) {
		var aTokens, oIndicator, iHiddenTokens = 0;
		this.tokenizer = new Tokenizer({
			maxWidth:"200px",
			tokens: [
				new Token({text: "XXXX"}),
				new Token({text: "XXX"}),
				new Token({text: "XXXX"})
			]
		});

		this.tokenizer.placeAt("content");
		sap.ui.getCore().applyChanges();
		aTokens = this.tokenizer.getTokens();
		aTokens.forEach(function(oToken, iIndex){
			assert.strictEqual(oToken.$().hasClass("sapMHiddenToken"), false, "Token on position " +  iIndex +  " is visible");
		});

		this.tokenizer._useCollapsedMode(true);
		sap.ui.getCore().applyChanges();

		aTokens = this.tokenizer.getTokens();
		aTokens.forEach(function(oToken){
			if (oToken.$().hasClass("sapMHiddenToken")) {
				iHiddenTokens += 1;
			}
		});

		oIndicator = this.tokenizer.$().find(".sapMTokenizerIndicator")[0];
		assert.ok(oIndicator, true, "N-more label is added.");
		assert.strictEqual(oIndicator.innerHTML, oRb.getText("MULTIINPUT_SHOW_MORE_TOKENS", iHiddenTokens), "N-more label's text is correct.");

		this.tokenizer._useCollapsedMode(false);
		sap.ui.getCore().applyChanges();

		aTokens = this.tokenizer.getTokens();
		aTokens.forEach(function(oToken, iIndex) {
			assert.strictEqual(oToken.$().hasClass("sapMHiddenToken"), false, "Token on position " + iIndex + " is shown when the tokenizer is collapsed.");
		});
	});

	QUnit.test("Small containers usage (N Items):", function(assert) {
		var aTokens, oIndicator;
		this.tokenizer = new Tokenizer({
			maxWidth: "100px",
			tokens: [
				new Token({text: "XXXXXXXXXXXX"}),
				new Token({text: "XXXXXXXXXXXX"})
			]
		});

		this.tokenizer.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		this.tokenizer._useCollapsedMode(true);
		sap.ui.getCore().applyChanges();

		// assert
		aTokens = this.tokenizer.getTokens();
		oIndicator = this.tokenizer.$().find(".sapMTokenizerIndicator")[0];

		assert.ok(aTokens[0].$().hasClass("sapMHiddenToken"), "The first token should be hidden.");
		assert.ok(aTokens[1].$().hasClass("sapMHiddenToken"), "The last token is hidden.");

		assert.ok(oIndicator, true, "An indicator label is added.");
		assert.strictEqual(oIndicator.innerHTML, oRb.getText("TOKENIZER_SHOW_ALL_ITEMS", 2), "N-items label's text is correct.");
	});

	QUnit.test("Small containers usage (1 Item):", function(assert) {
		var aTokens, oIndicator;
		this.tokenizer = new Tokenizer({
			maxWidth: "100px",
			tokens: [
				new Token({text: "XXXXXXXXXXXX"})
			]
		});

		this.tokenizer.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		this.tokenizer._useCollapsedMode(true);
		sap.ui.getCore().applyChanges();

		// assert
		aTokens = this.tokenizer.getTokens();
		oIndicator = this.tokenizer.$().find(".sapMTokenizerIndicator")[0];

		assert.ok(aTokens[0].$().hasClass("sapMHiddenToken"), "The first token should be hidden.");

		assert.ok(oIndicator, true, "An indicator label is added.");
		assert.strictEqual(oIndicator.innerHTML, oRb.getText("TOKENIZER_SHOW_ALL_ITEM", 1), "N-items label's text is correct.");
	});

	QUnit.test("_handleNMoreIndicator", function(assert) {
		var oTokenizer = new Tokenizer();
		assert.strictEqual(oTokenizer._handleNMoreIndicator(), oTokenizer, "The method return a instance of the tokenizer");

		oTokenizer.destroy();
	});

	QUnit.test("N-More label + Invalidation", function() {
		var oTokenizer = new Tokenizer({
			maxWidth: "100px",
			tokens: [
				new Token({text: "XXXXXXXXXXXX"}),
				new Token({text: "XXXXXXXXXXXX"})
			]
		});

		oTokenizer._setAdjustable(true);
		oTokenizer.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oTokenizer._useCollapsedMode(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.notOk(oTokenizer._oIndicator.hasClass("sapUiHidden"), "The indicator label is shown.");

		// act
		oTokenizer.invalidate();
		oTokenizer.rerender();
		sap.ui.getCore().applyChanges();

		// assert
		assert.notOk(oTokenizer._oIndicator.hasClass("sapUiHidden"), "The indicator label is still shown.");

		// clean up
		oTokenizer.destroy();
		oTokenizer = null;
	});

	QUnit.module("Tokenizer ARIA", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer();

			this.tokenizer.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.tokenizer.destroy();
		}
	});

	QUnit.test("Role listbox should be applied", function(assert) {
		assert.strictEqual(this.tokenizer.$().attr("role"), "listbox", "Tokenizer has role listbox");
	});

	QUnit.test("ARIA Read only attribute is not present", function(assert) {
		// aria-readonly is not valid for the current role of the tokenizer.
		assert.ok(!this.tokenizer.$().attr("aria-readonly"), "Tokenizer has no aria-readonly attribute");
	});

	QUnit.test("posinset and setsize ARIA attributes are set on the Tokens", function(assert) {
		var token1, token2;

		this.tokenizer.addToken(token1 = new Token("t1"));
		this.tokenizer.addToken(token2 = new Token("t2"));
		sap.ui.getCore().applyChanges();

		assert.ok(token1.$().attr("aria-posinset"), "Token 1 has aria-posinset attribute");
		assert.ok(token2.$().attr("aria-posinset"), "Token 2 has aria-posinset attribute");
		assert.ok(token1.$().attr("aria-setsize"), "Token 1 has aria-setsize attribute");
		assert.ok(token2.$().attr("aria-setsize"), "Token 2 has aria-setsize attribute");

		assert.strictEqual(token1.$().attr("aria-posinset"), "1", "Token 1 has correct aria-posinset attribute");
		assert.strictEqual(token2.$().attr("aria-posinset"), "2", "Token 2 has correct aria-posinset attribute");
		assert.strictEqual(token1.$().attr("aria-setsize"), "2", "Token has correct aria-setsize attribute");
		assert.strictEqual(token2.$().attr("aria-setsize"), "2", "Token has correct aria-setsize attribute");
	});

	QUnit.test("Adjust Tokens' title on editable property", function(assert) {
		var token1, token2;
		// Setup
		this.tokenizer.setEditable(false);
		this.tokenizer.addToken(token1 = new Token("t1"));
		this.tokenizer.addToken(token2 = new Token("t2"));
		sap.ui.getCore().applyChanges();

		assert.ok(!token1.$().attr("title"), "There's no title for the token");
		assert.ok(!token2.$().attr("title"), "There's no title for the token");

		this.tokenizer.setEditable(true);
		sap.ui.getCore().applyChanges();

		assert.ok(token1.$().attr("title"), "There's a title for the token");
		assert.ok(token2.$().attr("title"), "There's a title for the token");
	});
});