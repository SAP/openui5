/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Tokenizer",
	"sap/m/Token",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/MultiInput",
	"sap/ui/base/Event",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/m/library"
], function(Core, QUnitUtils, createAndAppendDiv, Tokenizer, Token, Dialog, Label, MultiInput, Event, Device, KeyCodes, Library) {
	createAndAppendDiv("content");


	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
		TokenizerRenderMode = Library.TokenizerRenderMode;


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

	QUnit.test("removeAllTokens should call setFirstTokenTruncated with 'false'.", function(assert) {
		var oSpy = sinon.spy(this.tokenizer, "setFirstTokenTruncated");

		// Act
		this.tokenizer.removeAllTokens();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "setFirstTokenTruncated was called.");
		assert.strictEqual(oSpy.firstCall.args[0], false, "setFirstTokenTruncated was called with 'false'.");
	});

	QUnit.test("_handleResize should call _useCollapsedMode and scrollToEnd so as to show properly the tokens", function(assert) {
		var oUseCollapsedModeSpy = sinon.spy(this.tokenizer, "_useCollapsedMode"),
			oScrollToEndSpy = sinon.spy(this.tokenizer, "scrollToEnd");

		// Act
		this.tokenizer._handleResize();

		// Assert
		assert.strictEqual(oUseCollapsedModeSpy.callCount, 1, "_useCollapsedMode was called.");
		assert.strictEqual(oScrollToEndSpy.callCount, 1, "scrollToEnd was called.");
	});

	QUnit.test("DestroyTokens should call setFirstTokenTruncated with 'false'", function (assert) {
		// arrange
		this.tokenizer.addToken(new Token());
		sap.ui.getCore().applyChanges();
		var oSpy = sinon.spy(this.tokenizer, "setFirstTokenTruncated");

		// Act
		this.tokenizer.destroyTokens();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSpy.callCount, 1, "setFirstTokenTruncated was called.");
		assert.ok(oSpy.calledWith(false), "The setFirstTokenTruncated is called with false value");

		// Cleanup
		oSpy.restore();
	});


	QUnit.test("updateTokens should call setFirstTokenTruncated with 'false'.", function(assert) {
		var oSpy = sinon.spy(this.tokenizer, "setFirstTokenTruncated");

		// Arrange
		this.tokenizer.updateAggregation = sinon.stub().returns(true);

		// Act
		this.tokenizer.updateAggregation("tokens");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "setFirstTokenTruncated was called.");
		assert.strictEqual(oSpy.firstCall.args[0], false, "setFirstTokenTruncated was called with 'false'.");
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
		assert.notEqual(aSelectedTokens.length, this.tokenizer.getTokens().length, "not all tokens are selected");

		// act
		token2.setSelected(true);
		aSelectedTokens = this.tokenizer.getSelectedTokens();

		// assert
		assert.equal(aSelectedTokens.length, this.tokenizer.getTokens().length, "all tokens are selected");
	});

	QUnit.test("test keyboard select all", function(assert) {
		// arrange
		var token1 = new Token(),
			token2 = new Token(),
			token3 = new Token();

		[token1, token2, token3].forEach(function(oToken) {
			this.tokenizer.addToken(oToken);
		}, this);

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

		[oToken1, oToken2, oToken3].forEach(function(oToken) {
			this.tokenizer.addToken(oToken);
		}, this);

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

	QUnit.test("_getPixelWidth", function(assert) {
		// Arrange
		var oToken1 = new Token({text:"Token 1"}),
			oToken2 = new Token({text:"Token 1"}),
			sTokenizerWidth,
			iPaddingLeft;

		// Act
		[oToken1, oToken2].forEach(function(oToken) {
			this.tokenizer.addToken(oToken);
		}, this);
		sap.ui.getCore().applyChanges();
		iPaddingLeft = parseInt(this.tokenizer.$().css("padding-left"));
		sTokenizerWidth = this.tokenizer._getPixelWidth();

		// Assert
		assert.strictEqual(sTokenizerWidth, this.tokenizer.getDomRef().clientWidth - iPaddingLeft, "When there is no maxWidth set, the client width of the tokenizer should be taken for calculation.");

		// Act
		this.tokenizer.setMaxWidth("3rem");
		sap.ui.getCore().applyChanges();
		sTokenizerWidth = this.tokenizer._getPixelWidth();

		// Assert
		assert.strictEqual(sTokenizerWidth, this.tokenizer.getDomRef().clientWidth - iPaddingLeft, "When the maxWidth is not set in pixels, the client width of the tokenizer should be taken for calculation.");

		// Act
		this.tokenizer.setMaxWidth("99px");
		sap.ui.getCore().applyChanges();
		sTokenizerWidth = this.tokenizer._getPixelWidth();

		// Assert
		assert.strictEqual(sTokenizerWidth, 99 - iPaddingLeft, "When the maxWidth is set in pixels, the maxWidth property should be taken for calculation.");
	});

	QUnit.test("_mapTokenToListItem with not escaped strings does not throw an exception", function (assert) {
		var sNotEscapedString = "asd{",
			oToken = new Token();

		oToken.setKey(sNotEscapedString);
		oToken.setText(sNotEscapedString);
		oToken.setTooltip(sNotEscapedString);

		this.tokenizer._mapTokenToListItem(oToken);

		assert.ok(true, "No exception is thrown");
	});

	QUnit.test("Handle mapping between List items and Tokens on Token deletion", function (assert) {
		// Setup
		var aItems, aTokens, oItem, oToken,
			oModel = new sap.ui.model.json.JSONModel({
				items: [{text: "Token 0"},
					{text: "Token 1"},
					{text: "Token 2"}
				]
			}),
			oTokenizer = new Tokenizer({
				tokens: {path: "/items", template: new Token({text: {path: "text"}})},
				width: "200px",
				renderMode: "Narrow"
			})
				.setModel(oModel)
				.placeAt("content"),
			oEvent = {
				getParameter: function () {
					return oTokenizer._getTokensList().getItems()[0];
				}
			};

		var oTokenDeleteSpy = this.spy(oTokenizer, "fireTokenDelete");
		var oTokenUpdateSpy = this.spy(oTokenizer, "fireTokenUpdate");

		sap.ui.getCore().applyChanges();

		// Act
		oModel.setData({
			items: [
				{text: "Token 1"},
				{text: "Token 2"}
			]
		});

		oTokenizer._handleNMoreIndicatorPress();
		sap.ui.getCore().applyChanges();

		oTokenizer._handleListItemDelete(oEvent);
		sap.ui.getCore().applyChanges();

		// Assert
		aItems = oTokenizer._getTokensList().getItems();
		aTokens = oTokenizer.getTokens();
		assert.ok(oTokenUpdateSpy.called, "Token Update event should be called");
		assert.ok(oTokenDeleteSpy.called, "Token Delete event should be called");

		oItem = aItems[0];
		oToken = sap.ui.getCore().byId(oItem.data("tokenId"));
		assert.strictEqual(oItem.getTitle(), oToken.getText(), "The first item in the list should be the same as the Token" + oItem.getTitle());

		// Cleanup
		oTokenizer.destroy();
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
		var oToken;
		this.tokenizer.addToken(new Token({text: "Token 1", key: "0001"}));

		oToken = this.tokenizer.getTokens()[0];

		assert.ok(oToken.getProperty("editableParent"), "Token's parent is editable");

		this.tokenizer.setEditable(false);
		sap.ui.getCore().applyChanges();

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
		this.tokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		this.tokenizer.addToken(new Token({key:"XXX", text: "XXX"}));
		sap.ui.getCore().applyChanges();

		// act
		var spy = this.spy(Tokenizer.prototype, "_adjustTokensVisibility");
		this.tokenizer.setMaxWidth(MAX_WIDTH);

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(spy.callCount, 1, "tokenizer's _adjustTokensVisibility was called once");

		spy.restore();
	});

	QUnit.test("setEnabled", function(assert) {
		// act
		this.tokenizer.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(jQuery(this.tokenizer.getDomRef()).hasClass("sapMTokenizerDisabled"), "Tokenizer's dom has class sapMTokenizerDisabled");
	});

	QUnit.test("setHiddenTokensCount", function(assert) {
		var oSpy;

		// assert
		assert.strictEqual(this.tokenizer.getHiddenTokensCount(), 0, "Initially the hidden tokens count is 0");
		// act
		this.tokenizer._setHiddenTokensCount(5);
		// assert
		assert.strictEqual(this.tokenizer.getHiddenTokensCount(), 5, "The Token's count was correctly set to 5");

		oSpy = sinon.spy(this.tokenizer, "_setHiddenTokensCount");
		// act
		try {
			this.tokenizer._setHiddenTokensCount("x");
		} catch (e) {
			// do nothing here
		}
		// assert
		assert.strictEqual(oSpy.threw(), true, "The setter is checking for type match");
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
		var oFireDeleteSpy, oUpdateTokensSpy,
			oToken = new Token({text: "test"});

		oFireDeleteSpy = this.spy(oToken, "fireDelete");
		oUpdateTokensSpy = this.spy(this.tokenizer, "fireTokenUpdate");
		this.tokenizer.addToken(oToken);
		this.tokenizer.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// act
		oToken.getAggregation("deleteIcon").firePress();

		// assert
		assert.equal(oUpdateTokensSpy.callCount, 0, "TokenUpdate was NOT fired");
		assert.equal(oFireDeleteSpy.callCount, 0, "delete event was NOT BE fired");
		assert.ok(!oToken.bIsDestroyed, "Token1 is NOT destroyed");

		oFireDeleteSpy.restore();
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
		var oSpy = this.spy(this.tokenizer, "fireTokenDelete");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent("t", KeyCodes.DELETE);

		var oCall = oSpy.getCalls()[0];

		// assert
		assert.equal(oCall.args[0].tokens.length, 2, "Two tokens were removed");
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

		[
			new Token("tok0"),
			oSecondToken,
			new Token("tok2")
		].forEach(function(oToken) {
			oTokenizer.addToken(oToken);
		}, this);

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

		[
			new Token("tok0"),
			oSecondToken,
			new Token("tok2")
		].forEach(function(oToken) {
			oTokenizer.addToken(oToken);
		}, this);

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

	QUnit.test("onsaphome + hidden tokens", function() {
		var oEvent = new jQuery.Event(),
			oTokenizer = new Tokenizer({
				tokens: [new Token(), new Token(), new Token()]
			}).placeAt("content");
		sap.ui.getCore().applyChanges();

		oTokenizer.getTokens()[0].addStyleClass("sapMHiddenToken");
		sap.ui.getCore().applyChanges();

		// act
		oTokenizer.onsaphome(oEvent);

		// assert
		assert.strictEqual(oTokenizer.getTokens()[1].getDomRef(), document.activeElement, "The second token (first visible) is focused.");

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
		sap.ui.test.qunit.triggerEvent("tap", this.t3.getDomRef(), {target : this.t3.getDomRef()});

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

		// act
		this.tokenizer._copy();

		// assert
		// we can intercept the attached function by
		// getting the first call - called from inside the _copy method
		// and then its second argument
		fnCopyToClipboard = oAddListenerSpy.getCall(0).args[1];
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

		this.tokenizer.setRenderMode(sap.m.TokenizerRenderMode.Narrow);
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

		this.tokenizer.setRenderMode(TokenizerRenderMode.Loose);
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
		this.tokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		sap.ui.getCore().applyChanges();

		// assert
		aTokens = this.tokenizer.getTokens();
		oIndicator = this.tokenizer.$().find(".sapMTokenizerIndicator")[0];

		assert.ok(aTokens[0].$().hasClass("sapMHiddenToken"), "The first token should be hidden.");
		assert.ok(aTokens[1].$().hasClass("sapMHiddenToken"), "The last token is hidden.");

		assert.ok(oIndicator, true, "An indicator label is added.");
		assert.strictEqual(oIndicator.innerHTML, oRb.getText("TOKENIZER_SHOW_ALL_ITEMS", 2), "N-items label's text is correct.");
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

		oTokenizer.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oTokenizer.setRenderMode(TokenizerRenderMode.Narrow);
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

	QUnit.test("aria-readonly attribute", function(assert) {
		// Assert
		assert.ok(!this.tokenizer.$().attr("aria-readonly"), "Tokenizer has no aria-readonly attribute");

		// Act
		this.tokenizer.setEditable(false);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.tokenizer.$().attr("aria-readonly"), "true", "Tokenizer has aria-readonly attribute set.");
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

	QUnit.test("posinset and setsize ARIA attributes are correct after removing token", function(assert) {
		var token1, token2;

		this.tokenizer.addToken(token1 = new Token());
		this.tokenizer.addToken(token2 = new Token());
		sap.ui.getCore().applyChanges();

		this.tokenizer.removeToken(token1);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(token2.$().attr("aria-setsize"), "1", "Token 2 has correct aria-setsize attribute");
		assert.strictEqual(token2.$().attr("aria-posinset"), "1", "Token 2 has correct aria-posinset attribute");

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

	QUnit.module("One token handling", {
		beforeEach : function() {
			this.tokenizer = new Tokenizer({
				maxWidth: "100px",
				tokens: [
					new Token({text: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"})
				]
			});

			this.tokenizer.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.clock = sinon.useFakeTimers();
		},
		afterEach : function() {
			this.tokenizer.destroy();
			this.clock.reset();
		}
	});

	QUnit.test("setFirstTokenTruncated", function(assert) {
		var oToken = this.tokenizer.getTokens()[0],
			oSetTruncatedSpy = this.spy(oToken, "setTruncated"),
			oAddStyleClassSpy = this.spy(this.tokenizer, "addStyleClass"),
			oRemoveStyleClassSpy = this.spy(this.tokenizer, "removeStyleClass");

		// Act
		this.tokenizer.setFirstTokenTruncated(true);
		this.clock.tick();

		// Assert
		assert.strictEqual(oSetTruncatedSpy.callCount, 1, "The token's setTruncated method called once.");
		assert.strictEqual(oSetTruncatedSpy.calledWith(true), true, "Method called with correct parameter");
		assert.strictEqual(oAddStyleClassSpy.callCount, 1, "The tokenizer's addStyleClass method was called once.");
		assert.strictEqual(oAddStyleClassSpy.calledWith("sapMTokenizerOneLongToken"), true, "Method called with correct parameter");

		// Act
		this.tokenizer.setFirstTokenTruncated(false);
		this.clock.tick();

		// Assert
		assert.strictEqual(oSetTruncatedSpy.callCount, 2, "The token's setTruncateds method twice.");
		assert.strictEqual(oSetTruncatedSpy.calledWith(false), true, "Method called with correct parameter");
		assert.strictEqual(oRemoveStyleClassSpy.callCount, 1, "The tokenizer's removeStyleClass method was called once.");
		assert.strictEqual(oAddStyleClassSpy.calledWith("sapMTokenizerOneLongToken"), true, "Method called with correct parameter");

		// Clean
		oSetTruncatedSpy.restore();
		oAddStyleClassSpy.restore();
		oRemoveStyleClassSpy.restore();
	});

	QUnit.test("Click on tokenizer should remove truncation", function(assert) {
		// Arrange
		var oToken = this.tokenizer.getTokens()[0],
			oSpy = this.spy(this.tokenizer, "_togglePopup");

		this.tokenizer._adjustTokensVisibility();
		// await to set the truncation
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oToken.getTruncated(), "Token should be truncated");

		// Act
		this.tokenizer.ontap({
			getMark: function (sId) {
				return sId === "tokenTap" ? oToken : null;
			}
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "fnOnNMorePress should be called once.");
	});

	QUnit.test("Small container + One long token should set truncation to the token", function(assert) {
		// Arrange
		var oSpy = this.spy(this.tokenizer, 'setFirstTokenTruncated');

		// Act
		this.tokenizer._adjustTokensVisibility();

		// Assert
		assert.ok(oSpy.calledOnce, "Truncation function should be called once.");
		assert.ok(this.tokenizer.$().hasClass("sapMTokenizerOneLongToken"), "Should have class for one long token.");
		assert.ok(oSpy.calledWith(true), "Truncation function should be called with True value");
		// cleanup
		oSpy.restore();
	});

	QUnit.test("Small container + One long truncated token should call setFirstTokenTruncated with false", function(assert) {
		// Arrange
		var oSpy = this.spy(this.tokenizer, 'setFirstTokenTruncated');
		this.tokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		this.tokenizer.getTokens()[0].setTruncated(true);

		// Act
		this.tokenizer.setMaxWidth("500px");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oSpy.calledOnce, "Truncation function should be called once.");
		assert.notOk(this.tokenizer.$().hasClass("sapMTokenizerOneLongToken"), "Should not have class for one long token.");
		assert.ok(oSpy.calledWith(false), "Truncation function should be called with false");
		// cleanup
		oSpy.restore();
	});

	QUnit.test("Small containers usage (1 Item):", function(assert) {
		var oIndicator;

		// Act
		this.tokenizer._adjustTokensVisibility();

		// Assert
		oIndicator = this.tokenizer.$().find(".sapMTokenizerIndicator")[0];

		assert.ok(this.tokenizer.$().hasClass("sapMTokenizerOneLongToken"), "Should have class for one long token.");
		assert.ok(oIndicator, true, "An indicator label is added.");
		assert.strictEqual(oIndicator.innerHTML, "", "N-items label's text is not added for one token.");
	});

	QUnit.test("hasOneTruncatedToken returns correct value", function(assert) {
		// Assert
		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), false, "hasOneTruncatedToken should return false");
		// Act
		this.tokenizer.getTokens()[0].setTruncated(true);
		// Assert
		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), true, "hasOneTruncatedToken should return true");
		// Act
		this.tokenizer.addToken(new Token({text: "test"}));
		// Assert
		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), false, "hasOneTruncatedToken should return false");
	});

	QUnit.test("Removes token truncation after resize", function(assert) {
		// Arrange
		this.tokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		this.tokenizer.setFirstTokenTruncated(true);

		// Act
		this.tokenizer.setMaxWidth("500px");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), false, "Token's truncation was removed.");

		this.tokenizer.setMaxWidth("100px");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.tokenizer.hasOneTruncatedToken(), true, "Token's truncation was set again after resize.");
	});

	QUnit.module("Mobile Dialog", {
		stubPlatform: function () {
			this.stub(Device, "system", {
				desktop: false,
				phone: true,
				tablet: false
			});
		},

		createTokenizer: function () {
			return new Tokenizer({
				width: "240px",
				tokens: [
					new Token({ text: "Token 1" }),
					new Token({ text: "Token 2" }),
					new Token({ text: "Token 3" }),
					new Token({ text: "Token 4" }),
					new Token({ text: "Token 5" }),
					new Token({ text: "Token 6" }),
					new Token({ text: "Token 7" }),
					new Token({ text: "Token 8" }),
					new Token({ text: "Token 9" }),
					new Token({ text: "Token 10" })
				]
			});
		}
	});

	QUnit.test("Checks if Dialog opens", function (assert) {
		this.stubPlatform();
		var oTokenizer = this.createTokenizer();
		var oOpenSpy = this.spy(Dialog.prototype, "open");

		oTokenizer.setRenderMode(TokenizerRenderMode.Narrow);

		oTokenizer.placeAt("content");
		Core.applyChanges();

		oTokenizer._handleNMoreIndicatorPress();
		Core.applyChanges();

		assert.ok(oOpenSpy.called, "Dialog is open");

		oTokenizer.destroy();
	});

	QUnit.test("Checks Dialog's default title", function (assert) {
		this.stubPlatform();
		var oTokenizer = this.createTokenizer();

		oTokenizer.placeAt("content");
		Core.applyChanges();

		var oRPO = oTokenizer.getTokensPopup();

		assert.strictEqual(oRPO.getTitle(), Core.getLibraryResourceBundle("sap.m").getText("COMBOBOX_PICKER_TITLE"), "Default title should be taken from Resource Bundle");

		oTokenizer.destroy();
	});

	QUnit.test("Checks Dialog's custom title", function (assert) {
		this.stubPlatform();
		var oTokenizer = this.createTokenizer();
		var sTitleText = "Custom Title";

		oTokenizer.addAriaLabelledBy(new Label({ text: sTitleText }));

		oTokenizer.placeAt("content");
		Core.applyChanges();

		var oRPO = oTokenizer.getTokensPopup();

		assert.strictEqual(oRPO.getTitle(), sTitleText, "Label should be set as title");
		assert.ok(oRPO.getShowHeader(), "Header should be shown");

		oTokenizer.destroy();
	});

	QUnit.test("Checks if title is shown ot desktop", function (assert) {
		var oTokenizer = this.createTokenizer();

		oTokenizer.placeAt("content");
		Core.applyChanges();

		var oRPO = oTokenizer.getTokensPopup();

		assert.notOk(oRPO.getShowHeader(), "Header should be hidden");

		oTokenizer.destroy();
	});
});