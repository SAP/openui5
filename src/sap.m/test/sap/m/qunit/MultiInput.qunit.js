/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/InvisibleMessage",
	"sap/m/MultiInput",
	"sap/m/Token",
	"sap/m/Tokenizer",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Column",
	"sap/m/Table",
	"sap/m/Button",
	"sap/ui/core/Item",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/m/Input",
	"sap/ui/core/ListItem",
	"sap/m/StandardListItem",
	"sap/ui/core/library",
	"sap/ui/base/Event",
	"sap/ui/core/InvisibleText",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/model/Sorter",
	"sap/m/library",
	// side effect: provides jQuery.Event.prototype.isMarked
	"sap/ui/events/jquery/EventExtension"
], function(
	Element,
	Library1,
	qutils,
	createAndAppendDiv,
	InvisibleMessage,
	MultiInput,
	Token,
	Tokenizer,
	ColumnListItem,
	Label,
	Column,
	Table,
	Button,
	Item,
	KeyCodes,
	Device,
	JSONModel,
	jQuery,
	Input,
	ListItem,
	StandardListItem,
	coreLibrary,
	Event,
	InvisibleText,
	nextUIUpdate,
	Sorter,
	Library
) {
	"use strict";

	createAndAppendDiv("content");


	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	var oResourceBundle = Library1.getResourceBundleFor("sap.m");
	var nPopoverAnimationTick = 300;
	var TokenizerRenderMode = Library.TokenizerRenderMode;

	function runAllTimersAndRestore(oClock) {
		if (!oClock) {
			return;
		}

		oClock.runAll();
		oClock.restore();
	}

	// make jQuery.now work with Sinon fake timers (since jQuery 2.x, jQuery.now caches the native Date.now)
	jQuery.now = function () {
		return Date.now();
	};

	QUnit.module("Basic", {
		beforeEach : async function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.multiInput1.destroy();
		}
	});

	QUnit.test("tokens aggregation", function(assert) {
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();
		this.multiInput1.addToken(token1);
		this.multiInput1.addToken(token2);
		this.multiInput1.addToken(token3);

		assert.equal(this.multiInput1.getTokens().length, 3, "MultiInput contains 3 tokens");

		this.multiInput1.removeToken(token1);
		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens");

		this.multiInput1.removeAllTokens();
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		this.multiInput1.addToken(token1);
		this.multiInput1.addToken(token2);
		this.multiInput1.addToken(token3);
		assert.equal(this.multiInput1.getTokens().length, 3, "MultiInput contains 3 tokens");
	});

	QUnit.test("setTokens aggregation", function(assert) {
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();
		this.multiInput1.setTokens([token1, token2, token3]);

		assert.equal(this.multiInput1.getTokens().length, 3, "MultiInput contains 3 tokens");
	});

	QUnit.test("insertToken aggregation", async function(assert) {

		var oSpy = this.spy(Tokenizer.prototype, "insertToken");
		await nextUIUpdate();

		this.multiInput1.insertToken(new Token({text: "Token1"}), 0);

		// assert
		assert.ok(oSpy.called, "Tokenizer's insertToken method is called");
		assert.equal(this.multiInput1.getTokens().length, 1, "then the MultiInput contains 1 tokens");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("destroyTokens() called upon the tokens aggregation must update the MultiInput CSS classes", async function(assert) {
		// Arrange
		var oToken1 = new Token(),
			oToken2 = new Token(),
			oToken3 = new Token(),
			oInvalidationSpy;

		// Act
		this.multiInput1.setTokens([oToken1, oToken2, oToken3]);
		await nextUIUpdate();

		oInvalidationSpy = this.spy(this.multiInput1, "onBeforeRendering");
		this.multiInput1.destroyTokens();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInvalidationSpy.calledOnce, true, "MultiInput has been rerendered after the tokens has been destroyed");
		assert.strictEqual(this.multiInput1.getDomRef().classList.contains("sapMMultiInputHasTokens"), false, "MultiInput does not have 'sapMMultiInputHasTokens' class");
	});

	QUnit.test("getAggregation tokens", function(assert) {
		//arrange
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();

		//act
		this.multiInput1.setTokens([token1, token2, token3]);

		//assert
		assert.equal(this.multiInput1.getAggregation("tokens").length, 3, "MultiInput contains 3 tokens");
		assert.equal(this.multiInput1.getAggregation("asdf"), null, "asdf is invalid aggregation");
	});

	QUnit.test("_initTokenizer should be called on init", async function(assert) {
		// Arrange
		var fnSpy = this.spy(MultiInput.prototype, "_initTokenizer"),
			oMultiInput = new MultiInput();

		oMultiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.equal(fnSpy.callCount, 1, "_initTokenizer is called on init");

		// Cleanup
		oMultiInput.destroy();
		fnSpy.restore();
	});

	QUnit.test("clone", function(assert) {
		//arrange
		var TEXT = "text",
			KEY = "key",
			token1 = new Token({text : TEXT, key : KEY}),
			multiInputClone;

		this.multiInput1.addToken(token1);

		var oDetachSuggestionItemSelectedFireSpy = this.spy(this.multiInput1, "detachSuggestionItemSelected"),
			oDetachLiveChangeireSpy = this.spy(this.multiInput1, "detachLiveChange"),
			oDetachValueHelpRequestSpy = this.spy(this.multiInput1, "detachValueHelpRequest");


		//act
		multiInputClone = this.multiInput1.clone();

		//assert
		assert.ok(oDetachSuggestionItemSelectedFireSpy.calledOnce, "detachSuggestionItemSelected should be called");
		assert.ok(oDetachLiveChangeireSpy.calledOnce, "detachSuggestionItemSelected should be called");
		assert.ok(oDetachValueHelpRequestSpy.calledOnce, "detachValueHelpRequest should be called");
		assert.equal(multiInputClone.getTokens().length, 1, "Cloned MultiInput contains 1 token");
		assert.equal(multiInputClone.getTokens()[0].getText(), TEXT, "Cloned token has correct text");

		//clean-up
		multiInputClone.destroy();
		oDetachSuggestionItemSelectedFireSpy.restore();
		oDetachLiveChangeireSpy.restore();
	});

	QUnit.test("check base class prerequisites", function(assert) {
		assert.ok(this.multiInput1._$input && this.multiInput1._$input.cursorPos, "Base class can return cursor position");
		//assert.ok(multiInput1._oSuggestionPopup && multiInput1._oSuggestionPopup.isOpen, "Base class can tell if suggestion popup is open");
	});

	QUnit.test("test setEditable", function(assert) {
		var isEditable;
		this.multiInput1.setEditable(false);

		isEditable = this.multiInput1.getEditable();
		assert.equal(isEditable, false, "MultiInput editable === false");
		assert.equal(jQuery(this.multiInput1.getDomRef())
				.css("visibility"), "visible", "Input should be visible even if MultiInput is disabled");

		this.multiInput1.setEditable(false);
		isEditable = this.multiInput1.getEditable();
		assert.equal(isEditable, false, "MultiInput editable still === false");

		this.multiInput1.setEditable(true);
		isEditable = this.multiInput1.getEditable();
		assert.equal(isEditable, true, "MultiInput editable === true");
	});

	QUnit.test("max tokens", async function(assert) {
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();

		this.multiInput1.setMaxTokens(2);
		this.multiInput1.setTokens([token1, token2, token3]);
		await nextUIUpdate();

		var aVisibleTokens = this.multiInput1.getTokens().filter(function (oToken) {
			return oToken.getVisible();
		});

		assert.equal(aVisibleTokens.length, 2, "no more than 2 tokens can be added");
	});

	QUnit.test("_calculateSpaceForTokenizer", async function(assert) {
		var multiInput = new MultiInput({
			width: "500px"
		});

		multiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(multiInput._calculateSpaceForTokenizer(), "406px", "_calculateSpaceForTokenizer returns a correct px value");

		multiInput.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer for MultiInput with description", async function(assert) {
		var multiInput = new MultiInput({
			width: "500px",
			description: "Unit"
		});

		multiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(multiInput._calculateSpaceForTokenizer(), "156px", "_calculateSpaceForTokenizer returns a correct px value");

		multiInput.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer with null DOM element reference", async function(assert) {
		var multiInput = new MultiInput(),
			output;

		multiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		multiInput.$().find(".sapMMultiInputInputContainer").removeClass("sapMMultiInputInputContainer");
		await nextUIUpdate();

		output = multiInput._calculateSpaceForTokenizer();

		assert.strictEqual(isNaN(parseInt(output)), false, "_calculateSpaceForTokenizer returns a valid value");

		multiInput.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer with negative tokenizer space", async function(assert) {
		var multiInput = new MultiInput({
			width: "30px",
			description: "Unit"
		});

		multiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(multiInput._calculateSpaceForTokenizer(), "0px", "_calculateSpaceForTokenizer returns a non negative value");

		multiInput.destroy();
	});

	QUnit.test("token data binding", async function(assert) {
		// JSON sample data
		var data = {
			modelData:[
				{lastName:"Doe",gender:"Male"},
				{lastName:"Ali",gender:"Female"}
			]};

		// create JSON model instance
		var oModel = new JSONModel();

		// set the data for the model
		oModel.setData(data);

		var oMultiInput = new MultiInput({
			tokens:[
				new Token({text:"{lastName}", key:"{lastName}"}),
				new Token({text:"{gender}", key:"{gender}"})
			]
		});

		// define the template
		var oItemTemplate = new ColumnListItem({
			cells : [
				new Label({
					text: "{lastName}"
				}),
				oMultiInput
			]
		});

		var aColumns = [
			new Column({
				header : new Label({
					text : "LastName"
				}),
				width: "100px"
			}),
			new Column({
				header : new Label({
					text : "LastName + Gender"
				})
			})
		];

		var oTable = new Table({ columns : aColumns});
		oTable.setModel(oModel);
		oTable.bindItems("/modelData", oItemTemplate);
		oTable.placeAt("qunit-fixture");

		await nextUIUpdate();

		var oMultiInput1 = oTable.getItems()[0].getCells()[1];
		assert.equal(oMultiInput1.getTokens()[0].$().text(), "Doe", "text of token is correct");
		assert.equal(oMultiInput1.getTokens()[1].$().text(), "Male", "text of token is correct");

		var oMultiInput2 = oTable.getItems()[1].getCells()[1];
		assert.equal(oMultiInput2.getTokens()[0].$().text(), "Ali", "text of token is correct");
		assert.equal(oMultiInput2.getTokens()[1].$().text(), "Female", "text of token is correct");

		oMultiInput.destroy();
		oTable.destroy();
	});

	QUnit.test("data binding when tokens have changed", async function(assert) {
		// arrange
		var oldData = {
			names: [
				{firstName: "Peter"},
				{firstName: "Martin"},
				{firstName: "Thomas"},
				{firstName: "John"}
			]
		};

		var newData = {
			names: [
				{firstName: "Arnold"},
				{firstName: "Chuck"},
				{firstName: "Silvester"},
				{firstName: "Jason"}
			]
		};

		// create a Model with the data above
		var model = new JSONModel();
		model.setData(oldData);

		var oTokenTemplate = new Token({text : "{firstName}"});

		this.multiInput1.setModel(model);
		this.multiInput1.bindAggregation("tokens", "/names", oTokenTemplate);

		await nextUIUpdate();

		var firstToken = this.multiInput1.getTokens()[0];
		firstToken.setSelected(true);

		await nextUIUpdate();

		qutils.triggerKeydown(firstToken.$(), KeyCodes.BACKSPACE);
		await nextUIUpdate();

		// assert
		assert.equal(this.multiInput1.getTokens().length, 3, "MultiInput has only 3 tokens");

		// act
		model.setData(newData);

		await nextUIUpdate();

		// assert
		assert.equal(this.multiInput1.getTokens().length, 4, "MultiInput has 4 tokens");
		assert.equal(this.multiInput1.getTokens()[0].getText(), "Arnold", "The data binding has been applied properly");
	});


	QUnit.test("tabindex of tokenizer in MultiInput", function(assert) {
		assert.equal(this.multiInput1.getAggregation("tokenizer")._bShouldRenderTabIndex, false, "_bShouldRenderTabIndex is set to false");
		assert.equal(this.multiInput1.getAggregation("tokenizer").getDomRef().hasAttribute("tabindex"), false, "tokenizer has no tabindex if it is in MultiInput");
	});

	QUnit.test("test setEditable=false MultiInput with editable tokens", async function(assert) {
		var aFirstToken,
			aSecondToken;
		//arrange
		this.multiInput1.setTokens([
			new Token({text: "Token 1", key: "0001"}),
			new Token({text: "Token 2", key: "0002", editable: false})
		]);

		aFirstToken = this.multiInput1.getTokens()[0];
		aSecondToken = this.multiInput1.getTokens()[1];
		await nextUIUpdate();

		//assert
		assert.equal(aFirstToken.$('icon').css('display'), 'inline-block', 'First token icon is visible');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');

		//act
		this.multiInput1.setEditable(false);
		await nextUIUpdate();

		//assert
		assert.equal(aFirstToken.$('icon').css('display'), 'none', 'First token icon is invisible');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');
	});

	QUnit.test("Tests if creating tokens escapes text value", async function(assert) {
		var oMI = new MultiInput({
			tokens: [
				new Token({ text: "Token 1" })
			]
		}).placeAt("content");
		var sText = '{"test":"abc"}';
		var fnValidator = function(args){
			return new Token({ text: args.text });
		};

		oMI.setValue(sText);
		oMI.addValidator(fnValidator);
		await nextUIUpdate();

		oMI.onsapenter();
		await nextUIUpdate();

		assert.strictEqual(oMI.getTokens()[1].getText(), sText, "Token is created with escaped text");

		oMI.destroy();
	});

	QUnit.test("Text validation on focus leave", async function(assert) {
		var oMI = new MultiInput({
			tokens: [
				new Token({text: "Long text"}),
				new Token({text: "Very long text"}),
				new Token({text: "Very, very long text"}),
				new Token({text: "Very, very, very long text"})
			]
		}).placeAt( "qunit-fixture");
		await nextUIUpdate();

		var oValidationSpy = this.spy(oMI, "_validateCurrentText");
		var oFocusOutSpy = this.spy(oMI, "onsapfocusleave");

		oMI.focus();
		qutils.triggerKeydown(oMI.getFocusDomRef(), KeyCodes.ARROW_LEFT);
		await nextUIUpdate();

		assert.strictEqual(oValidationSpy.callCount, 0, "_validateCurrentText not invoked when focused is moved to the tokenizer");
		assert.strictEqual(oFocusOutSpy.callCount, 1, "onsapfocusleave is called");

		oValidationSpy.restore();
		oFocusOutSpy.restore();
		oMI.destroy();
	});

	QUnit.test("test text validation on focus leave", function(assert) {
		//arrange
		var testTokenText = "C-Item";

		this.multiInput1.addValidator(function(args){
			return new Token({text: args.text});
		});

		this.multiInput1.setValue(testTokenText);

		//act
		this.multiInput1.onsapfocusleave({});

		//assert
		var aTokens = this.multiInput1.getTokens();
		assert.equal(aTokens.length, 1, "MultiInput contains 1 token");
		assert.equal(aTokens[0].getText(), testTokenText, "Token text == " + testTokenText);
	});

	QUnit.test("test text validation on focus leave when duplicate token is created", function(assert) {
		//arrange
		var testTokenText = "C-Item",
			firstToken = new Token({
				text: testTokenText,
				key: testTokenText
			});

		this.multiInput1.addValidator(function(args){
			return new Token({text: args.text, key: args.text});
		});

		this.multiInput1.addToken(firstToken);

		//act
		this.multiInput1.onsapfocusleave({});

		//assert
		let aTokens = this.multiInput1.getTokens();
		assert.equal(aTokens.length, 1, "MultiInput contains 1 token");
		assert.equal(aTokens[0].getText(), testTokenText, "Token text == " + testTokenText);

		this.multiInput1.setValue(testTokenText);
		//act
		this.multiInput1.onsapfocusleave({});

		//assert
		aTokens = this.multiInput1.getTokens();
		assert.equal(aTokens.length, 1, "MultiInput contains still contains 1 token, duplicate token was not added");

		this.multiInput1.setValue("B-Item");
		//act
		this.multiInput1.onsapfocusleave({});

		//assert
		aTokens = this.multiInput1.getTokens();
		assert.equal(aTokens.length, 2, "MultiInput contains contains 2 token");

	});

	QUnit.test("Token should invalidate the MultiInput when its text is updated by the binding", async function(assert) {
		// Arrange
		var oInvalidateSpy = this.spy(this.multiInput1, "invalidate");
		var oToken = new Token({
			text: "{/text}"
		});
		var oData = {
			text: ""
		};
		var oJSONModel = new JSONModel(oData);

		this.multiInput1.setModel(oJSONModel);
		this.multiInput1.addToken(oToken);
		await nextUIUpdate();

		oInvalidateSpy.resetHistory();

		// Act
		oJSONModel.setProperty("/text", "test");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oInvalidateSpy.callCount, 1, "MultiInput was invalidated once.");
		assert.strictEqual(oToken.getText(), "test", "Token's text property was updated.");

		// Clean
		oJSONModel.destroy();
	});

	QUnit.test("Adding a token, should attach the invalidate event handler function.", async function(assert) {
		// Arrange
		var oToken = new Token({
			text: "test"
		});
		var oAttachEventSpy = this.spy(oToken, "attachEvent");

		// Act
		this.multiInput1.addToken(oToken);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oAttachEventSpy.callCount, 1, "Attach event was called once");
		assert.strictEqual(oAttachEventSpy.firstCall.args[0], "_change", "Attach event was called for the right event.");
		assert.strictEqual(oAttachEventSpy.firstCall.args[2].getId(), this.multiInput1.getId(), "Attach event was called with the right context.");
	});

	QUnit.test("Removing a token, should detach the invalidate event handler function.", async function(assert) {
		// Arrange
		var oToken = new Token({
			text: "test"
		});
		var oDetachEventSpy = this.spy(oToken, "detachEvent");

		this.multiInput1.addToken(oToken);
		await nextUIUpdate();

		// Act
		this.multiInput1.removeToken(oToken);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oDetachEventSpy.callCount, 1, "Detach event was called once");
		assert.strictEqual(oDetachEventSpy.firstCall.args[0], "_change", "Detach event was called for the right event.");
		assert.strictEqual(oDetachEventSpy.firstCall.args[2].getId(), this.multiInput1.getId(), "Detach event was called with the right context.");
	});

	QUnit.module("Validation", {
		beforeEach: async function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.multiInput1.destroy();
		}
	});

	QUnit.test("validator add/remove/removeAll", function(assert) {
		// arrange
		var function1 = function() {},
			function2 = function() {},
			function3 = function() {};

		// act
		this.multiInput1.removeAllValidators();

		// assert
		assert.equal(this.multiInput1._aTokenValidators.length, 0, "No token validators available");

		// act
		this.multiInput1.addValidator(function1);

		// assert
		assert.equal(this.multiInput1._aTokenValidators.length, 1, "1 token validator available");

		// act
		this.multiInput1.addValidator(function2);
		this.multiInput1.addValidator(function3);

		this.multiInput1.removeValidator(function2);

		// assert
		assert.equal(this.multiInput1._aTokenValidators.length, 2, "2 token validators available");

		// act
		this.multiInput1.removeAllValidators();

		// assert
		assert.equal(this.multiInput1._aTokenValidators.length, 0, "No token validators available");
	});

	QUnit.test("validate tokens using validator callback", function(assert) {
		var oTokenizer = this.multiInput1.getAggregation("tokenizer"),
			validationCallbackCount = 0,
			isValidated = false,
			fValidationCallback = function(bValidated) {
				validationCallbackCount++;
				isValidated = bValidated;
			},
			tokenText = "new Token 1";

		this.multiInput1.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});

		assert.equal(validationCallbackCount, 1, "validation callback called 1x");
		assert.equal(isValidated, false, "token not validated");

		this.multiInput1.addValidateToken({
			text : tokenText,
			token : new Token({
				text : tokenText
			}),
			validationCallback : fValidationCallback
		});

		assert.equal(oTokenizer.getTokens().length, 1, "Tokenizer contains 1 token");
		assert.equal(oTokenizer.getTokens()[0].getText(), tokenText, "added token contains validated text");
		assert.equal(validationCallbackCount, 2, "validation callback called 2x");
		assert.equal(isValidated, true, "token got validated");

		oTokenizer.removeAllTokens();
		this.multiInput1.addValidator(function(args) {
			return new Token({
				text : args.text
			});
		});

		tokenText = "TestToken1";
		this.multiInput1.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});

		assert.equal(oTokenizer.getTokens().length, 1, "Tokenizer contains 1 token");
		assert.equal(oTokenizer.getTokens()[0].getText(), tokenText, "added token contains validated text");
		assert.equal(validationCallbackCount, 3, "validation callback called 3x");
		assert.equal(isValidated, true, "token got validated");

		tokenText = "TestToken2";
		this.multiInput1.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});

		assert.equal(oTokenizer.getTokens().length, 2, "Tokenizer contains 2 tokens");
		assert.equal(oTokenizer.getTokens()[1].getText(), tokenText, "added token contains validated text");
		assert.equal(validationCallbackCount, 4, "validation callback called 4x");
		assert.equal(isValidated, true, "token got validated");

		this.multiInput1.removeAllValidators();
		this.multiInput1.addValidator(function(args) {
			return;
		});

		tokenText = "TestToken3";
		this.multiInput1.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});

		assert.equal(oTokenizer.getTokens().length, 2, "Tokenizer contains 2 tokens, no token added as validator rejected it");
		assert.equal(validationCallbackCount, 5, "validation callback called 5x");
		assert.equal(isValidated, false, "token not validated");

		var fAsyncValidateCallback;
		var that = this.multiInput1;
		this.multiInput1.removeAllValidators();
		this.multiInput1.addValidator(function(args) {
			fAsyncValidateCallback = args.asyncCallback;
			return that.getWaitForAsyncValidation();
		});

		tokenText = "TestToken4";
		this.multiInput1.addValidateToken({
			text : tokenText,
			validationCallback : fValidationCallback
		});

		assert.equal(oTokenizer.getTokens().length, 2,
				"Tokenizer contains 2 tokens, no token added as validator runs asynchronously");
		assert.equal(validationCallbackCount, 5, "validation callback called 5x (1 call still pending)");

		fAsyncValidateCallback(new Token({
			text : "dummy"
		}));

		assert.equal(oTokenizer.getTokens().length, 3, "Tokenizer contains 3 tokens");
		assert.equal(validationCallbackCount, 6, "validation callback called 6x");
		assert.equal(isValidated, true, "token got validated");
	});

	QUnit.test("validation via suggestion items", async function(assert) {
		var i,
			AasciiCode = 65; // A == 65 in ASCII

		for (i = 0; i < 10; i++) {
			this.multiInput1.addSuggestionItem(new Item({ text : String.fromCharCode(i + AasciiCode) + "-Item"}));
		}

		await nextUIUpdate();

		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		this.multiInput1.setValue("a");
		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };
		this.multiInput1.onsapenter();
		await nextUIUpdate();

		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token, added via suggest");

		this.multiInput1.setValue("B");
		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };
		this.multiInput1.onsapenter();
		await nextUIUpdate();

		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, added via suggest ");

		this.multiInput1.setValue("C");
		this.multiInput1._getIsSuggestionPopupOpen = function(){ return false; };
		this.multiInput1.onsapenter();
		await nextUIUpdate();

		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, no token added, suggestion list was closed");

		this.multiInput1.setValue("Z");
		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };
		this.multiInput1.onsapenter();
		await nextUIUpdate();

		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, no token added, value does not fit suggestion list");
	});

	QUnit.test("validate tokens using validator callback", function(assert) {
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		this.multiInput1.removeAllValidators();
		this.multiInput1.addValidator(function(args){
			return new Token({text: args.text});
		});

		let tokenText = "TestToken1";
		this.multiInput1.setValue(tokenText);
		this.multiInput1.onsapenter();
		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token");
		assert.equal(this.multiInput1.getTokens()[0].getText(), tokenText, "added token contains validated text");

		tokenText = "TestToken2";
		this.multiInput1.setValue(tokenText);
		this.multiInput1.onsapenter();
		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens");
		assert.equal(this.multiInput1.getTokens()[1].getText(), tokenText, "added token contains validated text");

		this.multiInput1.removeAllValidators();
		this.multiInput1.addValidator(function(args){
			return;
		});
		tokenText = "TestToken3";
		this.multiInput1.setValue(tokenText);
		this.multiInput1.onsapenter();
		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, no token added as validator rejected it");



		var fAsyncValidateCallback;
		var that = this.multiInput1;

		this.multiInput1.removeAllValidators();
		this.multiInput1.addValidator(function(args){
			fAsyncValidateCallback = args.asyncCallback;
			return that.getWaitForAsyncValidation();
		});
		tokenText = "TestToken4";
		this.multiInput1.setValue(tokenText);
		this.multiInput1.onsapenter();

		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, no token added as validator runs asynchronously");

		fAsyncValidateCallback(new Token({text: "dummy"}));

		assert.equal(this.multiInput1.getTokens().length, 3, "MultiInput contains 3 tokens");
	});

	QUnit.test("do not duplicate tokens on sapfocusleave when using custom validator", async function(assert) {
		var aItems = [
			new Item("itemId", {
				key: "1",
				text: "Token 1"
			}),
			new Item({
				key: "2",
				text: "Token 2"
			}),
			new Item({
				key: "3",
				text: "Token 3"
			})
		];
		var oMockEvent = {
			relatedControlId: "itemId"
		};
		var oMockItem = {
			selectedItem: aItems[0],
			selectedRow: null,
			getParameter: function() {
				return aItems[0];
			}
		};

		aItems.forEach(function(oItem) {
			this.multiInput1.addSuggestionItem(oItem);
			}.bind(this)
		);

		this.multiInput1.addValidator(function(args) {
			return new Token({ text: args.text });
		});

		await nextUIUpdate();

		// Act
		this.multiInput1.setValue("Token 1");
		this.multiInput1.onsapfocusleave(oMockEvent);
		this.multiInput1._onSuggestionItemSelected(oMockItem);

		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token");
	});

	QUnit.test("removeValidator", async function(assert) {

		var oSpy = this.spy(this.multiInput1, "removeValidator"),
			oValidator = function(args){
				return new Token({text: args.text});
			};

		this.multiInput1.addValidator(oValidator);

		await nextUIUpdate();
		this.multiInput1.removeValidator(oValidator);
		// assert
		assert.strictEqual(this.multiInput1._aTokenValidators.length, 0 , "then the MultiInput has no validators");
		assert.ok(oSpy.called, "MultiInput's removeValidator is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.module("KeyboardEvents", {
		beforeEach : async function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			await nextUIUpdate();

			this.multiInput1.focus();
		},
		afterEach : function() {
			this.multiInput1.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("delete tokens via backspace", async function(assert) {
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		var token1 = new Token();
		this.multiInput1.addToken(token1);
		await nextUIUpdate();

		this.multiInput1.focus();
		await nextUIUpdate();

		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.BACKSPACE);
		await nextUIUpdate();

		assert.notOk(token1.getSelected(), "Token got selected");
		assert.strictEqual(token1.getId(), document.activeElement.id ,"Token got focused");

		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);

		assert.equal(this.multiInput1.getTokens().length, 0, "Token got deleted");
	});

	QUnit.test("delete tokens via backspace and prevent default", async function(assert) {

		this.multiInput1.attachTokenUpdate(function (evt) {
			evt.preventDefault();
		});

		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		var token1 = new Token();
		this.multiInput1.addToken(token1);

		await nextUIUpdate();

		this.multiInput1.focus();
		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.BACKSPACE);
		await nextUIUpdate();

		assert.strictEqual(token1.getId(), document.activeElement.id ,"Token got focused");

		this.multiInput1.onsapbackspace({preventDefault:function(){}, stopPropagation:function(){},
			isMarked: function(){}, setMarked:function(){}});
		assert.equal(this.multiInput1.getTokens().length, 1, "Token is not deleted");
	});

	QUnit.test("Get custom data from deleted tokens", async function (assert) {
		var fnDone = assert.async();
		var oToken = new Token({
			key: "ABC",
			text: "Token 1"
		}).data("my-extra-data", "data1");
		var oMI = new MultiInput({
			tokens:[
				oToken,
				new Token({
					key: "DEF",
					text: "Token 2"
				}).data("my-extra-data", "data2")
			],
			tokenUpdate: function(oEvent) {
				var removed = oEvent.getParameter("removedTokens");
				var data = removed[0].data("my-extra-data");
				assert.strictEqual(data, "data1", "Custom data is correct");
				oMI.destroy();
				fnDone();
			}
		});

		assert.expect(1);
		oMI.placeAt("content");
		await nextUIUpdate();

		oToken.fireDelete({
			byKeyboard: false,
			backspace: false
		});

		await nextUIUpdate();
	});

	QUnit.test("test keyboard navigation", async function(assert){
		var token = new Token({selected: true}),
			that = this;
		this.multiInput1.addToken(token);

		await nextUIUpdate();
		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token");

		this.multiInput1.focus();

		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ARROW_LEFT);
		await nextUIUpdate();

		qutils.triggerKeydown(document.activeElement, KeyCodes.DELETE);
		await nextUIUpdate();

		await nextUIUpdate();
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		token = new Token({selected: false});
		this.multiInput1.addToken(token);

		await nextUIUpdate();

		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };

		this.multiInput1.onsapprevious(new jQuery.Event("onsapprevious", {srcControl: that.multiInput1}));
		assert.equal(token.getSelected(), false, "Token not selected because popup is open");

		this.multiInput1._getIsSuggestionPopupOpen = function(){return false;};
		this.multiInput1.onsapprevious(new jQuery.Event("onsapprevious", {srcControl: that.multiInput1}));
		assert.strictEqual(token.getId(), document.activeElement.id ,"Token got focused");
	});

	QUnit.test("test remove via live change", async function(assert) {
		var token1 = new Token({selected:true});
		var token2 = new Token({selected:true});
		var token3 = new Token({selected:true});
		this.multiInput1.setTokens([token1, token2, token3]);
		await nextUIUpdate();

		this.multiInput1.fireLiveChange();

		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");
	});

	QUnit.test("keyboard - ctrl + A with focused token", async function(assert) {
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();
		this.multiInput1.setTokens([token1, token2, token3]);

		await nextUIUpdate();

		qutils.triggerKeydown(token1.$(), KeyCodes.A, false, false, true); // trigger Control key + A
		assert.equal(token1.getSelected(), true, "Token1 got selected using ctrl+a");
		assert.equal(token2.getSelected(), true, "Token2 got selected using ctrl+a");
		assert.equal(token3.getSelected(), true, "Token3 got selected using ctrl+a");
	});

	QUnit.test("keyboard - ctrl + A with text", function(assert) {
		this.clock = sinon.useFakeTimers();
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();
		this.multiInput1.setTokens([token1, token2, token3]);

		this.multiInput1.updateDomValue("123");
		qutils.triggerEvent("input", this.multiInput1.getFocusDomRef());

		this.multiInput1.focus();
		this.multiInput1.selectText(0, this.multiInput1.getValue().length);
		assert.equal(this.multiInput1._$input.getSelectedText(), "123", "only texts are selected");

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.A, false, false, true); // trigger Control key + A
		assert.equal(token1.getSelected(), true, "Token1 is selected");
		assert.equal(token2.getSelected(), true, "Token2 is selected");
		assert.equal(token3.getSelected(), true, "Token3 is selected");

		qutils.triggerEvent("tap", this.multiInput1.getDomRef());
		this.clock.tick(1);

		assert.equal(token1.getSelected(), false, "Token1 is unselected");
		assert.equal(token2.getSelected(), false, "Token2 is unselected");
		assert.equal(token3.getSelected(), false, "Token3 is unselected");
		this.clock.restore();
	});
	QUnit.test("esc key", function(assert) {

		this.multiInput1.setValue("123");
		this.multiInput1.selectText(0, this.multiInput1.getValue().length);
		var token1 = new Token({selected:true});
		var token2 = new Token({selected:true});
		var token3 = new Token({selected:true});
		this.multiInput1.setTokens([token1, token2, token3]);

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ESCAPE);
		assert.equal(token1.getSelected(), false, "Token1 is unselected");
		assert.equal(token2.getSelected(), false, "Token2 is unselected");
		assert.equal(token3.getSelected(), false, "Token3 is unselected");
		assert.equal(this.multiInput1._$input.getSelectedText(), "", "texts get unselected");
	});

	QUnit.test("onsaphome", async function(assert) {

		var oSpy = this.spy(Tokenizer.prototype, "onsaphome"),
			token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		await nextUIUpdate();

		this.multiInput1.getTokens()[0].focus();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.HOME);

		// assert
		assert.ok(oSpy.called, "Tokenizer's onsaphome is called when a token is focused");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsaphome when the input value is empty", async function(assert) {
		var token1 = new Token({text: "Token 1"}),
			token2 = new Token({text: "Token 2"});

		this.multiInput1.setTokens([token1, token2]);
		await nextUIUpdate();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(token1.getDomRef().id, document.activeElement.id,
			"The first token in the multiinput is focused.");

	});

	QUnit.test("onsaphome when the input has text value", async function(assert) {
		var focusRef = this.multiInput1.getFocusDomRef(),
			token1 = new Token({text: "Token 1"}),
			token2 = new Token({text: "Token 2"});

		this.multiInput1.setTokens([token1, token2]);
		this.multiInput1.setValue("text123");
		await nextUIUpdate();

		this.multiInput1.focus();
		this.multiInput1._$input[0].setSelectionRange(1, 7);
		await nextUIUpdate();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.HOME);
		await nextUIUpdate();

		// assert
		assert.strictEqual(focusRef.id, document.activeElement.id,
			"The focus stays in the input.");

	});

	QUnit.test("onsapprevious when MultiInput has no value", async function(assert) {

		var oSpy = this.spy(Tokenizer.prototype, "onsapprevious"),
				token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		await nextUIUpdate();

		this.multiInput1.getTokens()[0].focus();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_LEFT);

		// assert
		assert.ok(oSpy.called, "Tokenizer's onsapprevious is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapprevious when MultiInput has value and focus is on input", async function(assert) {

		var oSpy = this.spy(Tokenizer.prototype, "onsapprevious"),
			token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		this.multiInput1.setValue("text");
		this.multiInput1.addValidator(function (args) {
			return new Token({text: args.text, key: args.text});
		});

		this.multiInput1._$input.trigger("focus");
		this.multiInput1._$input[0].setSelectionRange(3, 3);

		await nextUIUpdate();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_LEFT);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapprevious is not called");
		assert.strictEqual(this.multiInput1.getTokens().length, 1,
			"No token is added after navigation.");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Arrow navigation through tokens should not delete them", async function(assert) {
		var oMultiInput =  new MultiInput(),
			token1 = new Token({text: "Token 1", selected: true}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3", selected: true});

		oMultiInput.placeAt("content");
		await nextUIUpdate();

		oMultiInput.setTokens([token1, token2, token3]);
		oMultiInput.setValue("AAA");
		await nextUIUpdate();

		oMultiInput._$input.trigger("focus");

		qutils.triggerKeydown(token3.getDomRef(), KeyCodes.ARROW_LEFT);
		qutils.triggerKeydown(token3.getDomRef(), KeyCodes.ARROW_LEFT);
		qutils.triggerKeydown(token3.getDomRef(), KeyCodes.ARROW_RIGHT);

		// assert
		assert.strictEqual(oMultiInput.getTokens().length, 3,
			"Tokens are not deleted upon arrow right navigation.");

		oMultiInput.destroy();
	});

	QUnit.test("When all tokens are selected, arrow right navigation does not delete the tokens", async function(assert) {
		const token1 = new Token({ text: "1" });
		const token2 = new Token({ text: "2" });
		const token3 = new Token({ text: "3" });
		var oMultiInput = new MultiInput({
			value: "AAA",
			tokens: [
				token1,
				token2,
				token3
			]
		}).placeAt('content');
		await nextUIUpdate();

		const oTokenizer = oMultiInput.getAggregation("tokenizer");
		oTokenizer.focus();
		oTokenizer.selectAllTokens();
		token3.focus();
		qutils.triggerKeydown(token3.getDomRef(), KeyCodes.ARROW_RIGHT);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oMultiInput.getTokens().length, 3,
			"Tokens are not deleted upon arrow right navigation.");

		// clean
		oMultiInput.destroy();
	});


	QUnit.test("onsapprevious when MultiInput has a token and value in the input field", function(assert) {
		var oPreventSpy = this.spy(),
			oFakeEvent = {
				preventDefault: oPreventSpy,
				keyCode: KeyCodes.ARROW_UP
			},
			token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		this.multiInput1.setValue("text");

		this.multiInput1._$input.trigger("focus");

		this.multiInput1.onsapprevious(oFakeEvent);

		// assert
		assert.strictEqual(oPreventSpy.called, true, "Arrow up was prevented.");
	});

	QUnit.test("onsapdelete", async function(assert) {
		this.multiInput1.setValue("text123");
		this.multiInput1.setTokens([new Token()]);
		await nextUIUpdate();

		this.multiInput1.focus();
		await nextUIUpdate();
		this.multiInput1._$input[0].setSelectionRange(2, 3);
		await nextUIUpdate();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.multiInput1.getTokens().length, 1, "No token was deleted");
	});

	QUnit.test("onsapdelete with selected tokens and focusable tokens", async function(assert) {
		var oMultiInput =  new MultiInput(),
			token1 = new Token({text: "Token 1", selected: true}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3"});

		oMultiInput.placeAt("content");
		await nextUIUpdate();

		oMultiInput.setTokens([token1, token2, token3]);
		await nextUIUpdate();

		qutils.triggerKeydown(token3.getDomRef(), KeyCodes.DELETE);

		// assert
		assert.strictEqual(document.activeElement, token3.getDomRef(),
			"The focus is forwarded to the input field.");

		oMultiInput.destroy();
	});

	QUnit.test("onsapdelete with selected tokens and no focusable tokens", async function(assert) {
		var token1 = new Token({text: "Token 1"}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3", selected: true});

		this.multiInput1.setTokens([token1, token2, token3]);
		await nextUIUpdate();

		qutils.triggerKeydown(this.multiInput1.getAggregation("tokenizer").getDomRef(), KeyCodes.DELETE);
		await nextUIUpdate();

		// assert
		assert.strictEqual(document.activeElement, this.multiInput1.getFocusDomRef(),
			"The focus is forwarded to the input field.");
	});

	QUnit.test("onsapbackspace with selected tokens and focusable tokens", async function(assert) {
		var token1 = new Token({text: "Token 1"}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3", selected: true});

		this.multiInput1.setTokens([token1, token2, token3]);
		await nextUIUpdate();

		qutils.triggerKeydown(this.multiInput1.getAggregation("tokenizer").getDomRef(), KeyCodes.BACKSPACE);

		// assert
		assert.strictEqual(document.activeElement, token1.getDomRef(),
			"The focus is forwarded to the input field.");
	});

	QUnit.test("onsapbackspace with selected tokens and no focusable tokens", async function(assert) {
		var token1 = new Token({text: "Token 1", selected: true}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3"});

		this.multiInput1.setTokens([token1, token2, token3]);
		await nextUIUpdate();

		qutils.triggerKeydown(this.multiInput1.getAggregation("tokenizer").getDomRef(), KeyCodes.BACKSPACE);
		await nextUIUpdate();

		// assert
		assert.strictEqual(document.activeElement, this.multiInput1.getFocusDomRef(),
			"The focus is forwarded to the input field.");
	});

	QUnit.test("backspace should delete token and fire tokenUpdate", async function (assert) {
		var oFirstToken = new Token({ text: "Token 1"});
		var oMI = new MultiInput({
			tokens: [
				oFirstToken,
				new Token({ text: "Token 2"}),
				new Token({ text: "Token 3"})
			]
		}).placeAt("content");

		await nextUIUpdate();

		var oSpy = this.spy(oMI, "fireTokenUpdate");

		oMI.focus();

		// focus last token
		qutils.triggerKeydown(oMI.getDomRef(), KeyCodes.BACKSPACE);
		await nextUIUpdate();

		// delete last token
		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);
		await nextUIUpdate();

		assert.strictEqual(oMI.getTokens().length, 2, "One Token should be deleted");
		assert.ok(oSpy.called, "Fire Token Update is called");

		oMI.destroy();
	});

	QUnit.test("Backspace should not delete token and fire tokenUpdate when not editable", async function (assert) {
		// Arrange
		var oFirstToken = new Token({ text: "Token 1"});
		var oMI = new MultiInput({
			editable: false,
			tokens: [
				oFirstToken,
				new Token({ text: "Token 2"}),
				new Token({ text: "Token 3"})
			]
		}).placeAt("content");
		await nextUIUpdate();

		var oSpy = this.spy(oMI, "fireTokenUpdate");

		// focus first token
		oFirstToken.focus();

		// delete first token
		qutils.triggerKeydown(oFirstToken.getDomRef(), KeyCodes.BACKSPACE);
		await nextUIUpdate();


		// Assert
		assert.strictEqual(oMI.getTokens().length, 3, "None tokens should be deleted.");
		assert.notOk(oSpy.called, "Fire Token Update should not be called.");

		// Clean up
		oMI.destroy();
	});

	QUnit.test("backspace should delete token and fire tokenUpdate", async function (assert) {
		var oFirstToken = new Token({ text: "Token 1"});
		var oMI = new MultiInput({
			tokens: [
				oFirstToken,
				new Token({ text: "Token 2"}),
				new Token({ text: "Token 3"})
			]
		}).placeAt("content");

		await nextUIUpdate();

		var oSpy = this.spy(oMI, "fireTokenUpdate");

		oMI.focus();

		// focus last token
		qutils.triggerKeydown(oMI.getDomRef(), KeyCodes.BACKSPACE);
		await nextUIUpdate();

		// delete last token
		qutils.triggerKeydown(document.activeElement, KeyCodes.DELETE);
		await nextUIUpdate();

		assert.ok(oMI.getTokens().length, 2, "One Token should be deleted");
		assert.ok(oSpy.called, "Fire Token Update is called");

		oMI.destroy();
	});

	QUnit.test("onsapdelete when MultiInput has value", async function(assert) {
		var oSpy = this.spy(Tokenizer.prototype, "onsapdelete");
		this.multiInput1.setValue("value");

		await nextUIUpdate();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapdelete is not called");
		assert.equal(this.multiInput1.onsapdelete(), undefined, "then onsapdelete returns undefined");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapnext when a token is focused", async function(assert) {

		var oTokenizerSpy = this.spy(Tokenizer.prototype, "scrollToEnd");

		this.multiInput1.addToken(new Token({}));

		await nextUIUpdate();

		this.multiInput1.getTokens()[0].focus();

		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ARROW_RIGHT, false, false, false);

		// assert
		assert.ok(oTokenizerSpy.called, "Tokenizer's scrollToEnd is called");
		assert.strictEqual(this.multiInput1._$input[0].id, document.activeElement.id,
			"The first token in the multiinput is focused.");

		// cleanup
		oTokenizerSpy.restore();
	});

	QUnit.test("onsapnext when MultiInput in not editable", async function(assert) {

		var oSpy = this.spy(Tokenizer.prototype, "onsapdelete");
		this.multiInput1.setEditable(false);
		await nextUIUpdate();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapdelete is not called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapright", async function(assert) {
		// Arrange
		this.multiInput1.setTokens([
			new Token({text:"A"}),
			new Token({text:"B"}),
			new Token({text:"C"})
		]);
		this.multiInput1.addValidator(function (args) {
			return new Token({text: args.text, key: args.text});
		});
		await nextUIUpdate();

		// Act
		// create new token by user input
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.D });
		this.multiInput1._$input.trigger("focus").trigger(oFakeKeydown).val("D").trigger("input");
		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ENTER);
		await nextUIUpdate();

		// move to previous token and than back to the newly added
		this.multiInput1.getTokens()[3].focus();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_LEFT);
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_RIGHT);

		// Assert
		assert.strictEqual(this.multiInput1.getTokens().length, 4, "4 tokens");
	});

	QUnit.skip("oninput on mobile device", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Setup
		var oMI, oSpy;

		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		oMI = new MultiInput({
			suggestionItems : [
				new Item({
					text : 'Damage',
					key : 'damage'
				}),
				new Item({
					text : 'another Damage',
					key : 'damage'
				}),
				new Item({
					text : 'demon',
					key : 'demon'
				})
			]
		}).placeAt( "qunit-fixture");
		oMI.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		await nextUIUpdate(this.clock);
		oSpy = this.spy(oMI.getAggregation("tokenizer"), "_togglePopup");

		oMI.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(1);

		// Assert
		assert.ok(oSpy.called, "_togglePopup is called when N-more is pressed");

		// Act
		qutils.triggerCharacterInput(oMI._getSuggestionsPopover().getInput().getFocusDomRef(), "d");
		qutils.triggerEvent("input", oMI._getSuggestionsPopover().getInput().getFocusDomRef());
		this.clock.tick(100);

		// Assert
		assert.ok(oMI._getSuggestionsList(), "Suggestions list is shown on input");

		// Cleanup
		oSpy.restore();
		oMI.destroy();
	});

	QUnit.test("Event propagation onsapenter rules", async function (assert) {
		var oMI = new MultiInput().placeAt("qunit-fixture");
		var oEvent = {setMarked: function () {}};
		var oSpy = this.spy(oEvent, "setMarked");
		await nextUIUpdate();

		// Act
		oMI.onsapenter(oEvent);

		// Assert
		assert.notOk(oSpy.calledOnce, "The event should not be marked in case of empty input");

		// Act
		oMI.setValue("My test value");
		await nextUIUpdate();
		oMI.onsapenter(oEvent);

		// Assert
		assert.ok(oSpy.calledOnce, "The event should be marked when there's a text in the input");

		oMI.destroy();
	});

	QUnit.test("mobile - clear input value after selection a suggestion", async function (assert) {

		// Setup
		var oMI;

		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		oMI = new MultiInput({
			suggestionItems : [
				new Item({
					text : 'Diamond',
					key : 'diamond'
				}),
				new Item({
					text : 'Graphite',
					key : 'graphite'
				})
			]
		}).placeAt( "qunit-fixture");
		await nextUIUpdate();

		oMI._getSuggestionsPopoverPopup().open();
		oMI.setSelectionItem(oMI.getSuggestionItems()[0]);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oMI._getSuggestionsPopover().getInput().getValue(), "", "The dialog's input is cleared.");

		// clean up
		oMI.destroy();
	});

	QUnit.test("onBeforeOpen should call _manageListsVisibility with the correct parameter", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oFakeEvent = {
			target: {id: null}, isMarked: function () {
			}
		};

		// Setup
		var oMI, oMultiInput1, oSpy, oSpy1;

		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// Arrange
		oMI = new MultiInput({
			suggestionItems : [
				new Item({
					text : 'Damage',
					key : 'damage'
				}),
				new Item({
					text : 'another Damage',
					key : 'damage'
				}),
				new Item({
					text : 'demon',
					key : 'demon'
				})
			]
		}).placeAt( "qunit-fixture");
		oMI.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		await nextUIUpdate(this.clock);

		oSpy = this.spy(oMI, "_manageListsVisibility");

		oMultiInput1 = new MultiInput({
			showValueHelp: true,
			valueHelpOnly: true
		});
		oMultiInput1.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oMI.ontap(oFakeEvent);
		this.clock.tick(1);

		// Assert
		assert.ok(oSpy.called, "_manageListsVisibility is called");
		assert.ok(oSpy.calledWith(true), "Selected items list is visible.");


		// act
		oSpy1 = this.spy(oMultiInput1, "_manageListsVisibility");
		oMultiInput1.ontap(oFakeEvent);

		// Assert
		assert.ok(oSpy1.called, "_manageListsVisibility is called");
		assert.ok(oSpy1.calledWith(false), "Suggestions list is visible.");

		// Cleanup
		oMI.destroy();
		oMultiInput1.destroy();
	});

	QUnit.test("Picker should be correctly updated according to the interaction", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oIndicator,
			oModel = new JSONModel(),
			aData = [
				{
					name: "A Item 1", key: "a-item-1"
				}, {
					name: "A Item 2", key: "a-item-2"
				},{
					name: "B Item 1", key: "a-item-1"
				},{
					name: "B Item 2", key: "a-item-2"
				},{
					name: "Other Item", key: "ab-item-1"
				}
			],
			oMultiInput = new MultiInput({
				width: "100px",
				filterSuggests: false,
				showSuggestion: true,
				startSuggestion: 0
			}),
			oTokenizer = oMultiInput.getAggregation("tokenizer");

		oMultiInput.placeAt("content");

		// Act
		oModel.setData(aData);
		oMultiInput.setModel(oModel);

		oMultiInput.bindAggregation("suggestionItems", {
			path: "/",
			template: new Item({text: "{name}", key: "{key}"})
		});
		await nextUIUpdate(this.clock);

		oMultiInput._$input.trigger("focus");
		this.clock.tick(400);

		// Assert
		assert.ok(oMultiInput._oSuggestionPopup.isOpen(), "Suggestions should be visible");

		// Act
		oMultiInput.setSelectionItem(oMultiInput.getSuggestionItems()[0], true);
		oMultiInput.setSelectionItem(oMultiInput.getSuggestionItems()[1], true);
		this.clock.tick(1000);

		oIndicator = oMultiInput.$().find(".sapMTokenizerIndicator");

		// Assert
		assert.ok(oIndicator[0], "A n-more label is rendered");

		// Act
		oTokenizer._handleNMoreIndicatorPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oMultiInput._oSuggestionPopup.isOpen(), "Suggestions should not be visible");
		assert.ok(oTokenizer.getTokensPopup().isOpen(), "Suggestions should be visible");

		// Act
		oTokenizer.getTokensPopup().close();
		await nextUIUpdate(this.clock);

		oMultiInput.onfocusin({target: oMultiInput.getDomRef("inner")});
		this.clock.tick(1000);

		// Assert
		assert.ok(oMultiInput._oSuggestionPopup.getContent()[0].getVisible(), "Suggestions are visible");

		// Clean up
		oMultiInput.destroy();
	});

	QUnit.test("Deleting a token from tokenizer popup should keep popup open", async function (assert) {
		var oToken1 = new Token({ text: "Apple" });
		var oToken2 = new Token({ text: "Banana" });
		var oToken3 = new Token({ text: "Orange" });
		var oMI = new MultiInput({
			width: "240px",
			tokens: [
				oToken1,
				oToken2,
				oToken3
			]
		}).placeAt("content");
		var oTokenizerPopover = oMI.getAggregation("tokenizer").getTokensPopup();

		await nextUIUpdate();

		oMI.getAggregation("tokenizer")._handleNMoreIndicatorPress();

		oMI._deleteTokens([oToken1], {});
		await nextUIUpdate();

		assert.strictEqual(document.activeElement, oMI.getFocusDomRef(), "Multi Input should be focused");
		assert.ok(oTokenizerPopover.isOpen(), "Popover should be open");

		var oSpy = this.spy(oTokenizerPopover, "close");

		oMI._deleteTokens([oToken2, oToken3], {});
		await nextUIUpdate();

		assert.strictEqual(document.activeElement, oMI.getFocusDomRef(), "Multi Input should be focused");
		assert.ok(oSpy.called, "Popover should be closed");

		oMI.destroy();
	});

	QUnit.test("Deleting a bound token by delete key should place focus to the next token", async function (assert) {
		var oModel = new JSONModel({
			items: [
				{key: "1", text: "Item 1"},
				{key: "2", text: "Item 2"},
				{key: "3", text: "Item 3"},
				{key: "4", text: "Item 4"},
				{key: "5", text: "Item 5"}
			]
		});

		var oTokenTemplate = new Token({
			key: {path: "key"},
			text: {path: "text"}
		});

		var oMI = new MultiInput({
			tokens: {path: "/items", template: oTokenTemplate},
			tokenUpdate: function(oEvent){
				if (oEvent.getParameter("type") === "removed") {
					var aRemovedTokens = oEvent.getParameter("removedTokens");
					var oData = oModel.getData();
					var aItems = oData.items;

					aRemovedTokens.forEach(function (oToken) {
						aItems = aItems.filter(function (oItem) {
							return oItem.key !== oToken.getKey();
						});
					});

					oModel.setProperty("/items", aItems);
				}
			}
		}).placeAt("content");

		oMI.setModel(oModel);
		await nextUIUpdate();

		var aTokens = oMI.getTokens();
		var oToken = aTokens[aTokens.length - 2];

		oToken.focus();
		await nextUIUpdate();

		qutils.triggerKeydown(oToken.getDomRef(), KeyCodes.DELETE);
		await nextUIUpdate();

		aTokens = oMI.getTokens();
		var oLastToken = aTokens[aTokens.length - 1];

		assert.strictEqual(document.activeElement, oLastToken.getDomRef(), "Last Token is focused");

		oMI.destroy();
	});

	QUnit.test("Add tokens on mobile", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		var oMultiInput = new MultiInput({
			filterSuggests: false,
			showSuggestion: true,
			showValueHelp: true
		}).placeAt("qunit-fixture");

		oMultiInput.addValidator(function(args){
			var text = args.text;

			return new Token({text: text});
		});
		await nextUIUpdate(this.clock);

		// Act
		oMultiInput._openSuggestionsPopover({});
		oMultiInput._getSuggestionsPopover().getInput().focus();
		oMultiInput._getSuggestionsPopover().getInput().updateDomValue("123");
		qutils.triggerKeydown(oMultiInput._getSuggestionsPopover().getInput().getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(oMultiInput.getAggregation("tokenizer").getTokens().length, 1, "Just a single token gets created");

		// Cleanup
		oMultiInput.destroy();
	});

	QUnit.test("Add tokens on mobile when there are no suggestions available", async function(assert) {
		// System under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// Arrange
		var oMultiInput = new MultiInput({
			showSuggestion: false,
			showValueHelp: false
		}).placeAt("qunit-fixture");

		oMultiInput.addValidator(function(args){
			var text = args.text;
			return new Token({text: text});
		});
		await nextUIUpdate();

		// Act
		oMultiInput.setValue("test");
		oMultiInput.onsapfocusleave({});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiInput.getAggregation("tokenizer").getTokens().length, 1, "A token is created");

		// Cleanup
		oMultiInput.destroy();
	});

	QUnit.test("arrow left / top should not throw an error when there are no suggestions", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oMI = new MultiInput({
			showSuggestion: false
		});

		oMI.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oMI.getFocusDomRef().focus();
		qutils.triggerKeydown(oMI.getFocusDomRef(), KeyCodes.ARROW_LEFT);
		this.clock.tick(nPopoverAnimationTick);

		assert.ok(true, "No error has been thrown");

		oMI.getFocusDomRef().focus();
		qutils.triggerKeydown(oMI.getFocusDomRef(), KeyCodes.HOME);

		assert.ok(true, "No error has been thrown");

		oMI.destroy();
	});

	QUnit.module("Mobile: Closing behaviour of the Dialog", {
		beforeEach: async function() {
			this.clock = sinon.useFakeTimers();
			this.oDeviceStub = this.stub(Device, "system").value({
				desktop: false,
				phone: true,
				tablet: false
			});

			this.oMultiInput = new MultiInput({}).placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach : function() {
			this.oDeviceStub.restore();
			this.oMultiInput.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Should close the dialog when 'x' button is pressed", function (assert) {
		// Setup
		var bChangeFired, sOpenState;
		var oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Act
		oSuggestionsDialog.getPopover().open();
		this.clock.tick(500);

		// Assert
		assert.ok(oSuggestionsDialog.isOpen(), "The dialog is opened");

		// Arrange
		this.oMultiInput.attachChange(function() {
			bChangeFired = true;
		});

		// Act
		this.oMultiInput._revertPopupSelection();
		this.clock.tick(500);

		sOpenState = oSuggestionsDialog.getPopover().oPopup.getOpenState();

		// Assert
		assert.strictEqual(sOpenState === OpenState.CLOSED || sOpenState === OpenState.CLOSING, true, "The dialog is closed after enter key");
		assert.strictEqual(bChangeFired, undefined, "The change event is not fired");
	});

	QUnit.test("Should disregard the new value when 'x' button is pressed", function (assert) {
		// Setup
		var bChangeFired, sOpenState;
		var oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Arrange
		this.oMultiInput.attachChange(function() {
			bChangeFired = true;
		});

		// Arrange
		oSuggestionsDialog.getInput().setValue("test");
		oSuggestionsDialog.getPopover().open();
		this.clock.tick(500);

		// Act
		this.oMultiInput._revertPopupSelection();
		this.clock.tick(500);

		sOpenState = oSuggestionsDialog.getPopover().oPopup.getOpenState();

		// Assert
		assert.strictEqual(sOpenState === OpenState.CLOSED || sOpenState === OpenState.CLOSING, true, "The dialog is closed after enter key");
		assert.strictEqual(this.oMultiInput.getValue(), '', "The new value is dismissed");
		assert.strictEqual(bChangeFired, undefined, "The change event is not fired");

	});

	QUnit.test("Should restore the last confirmed value when 'x' button is pressed", function (assert) {
		// Setup
		var bChangeFired;
		var oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Arrange
		this.oMultiInput.attachChange(function() {
			bChangeFired = true;
		});

		// Arrange
		this.oMultiInput.setValue("test");
		oSuggestionsDialog.getPopover().open();
		this.clock.tick(500);

		// Act
		oSuggestionsDialog.getInput().setValue("new value");
		this.oMultiInput._revertPopupSelection();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(this.oMultiInput.getValue(), 'test', "The last confirmed value is still set");
		assert.strictEqual(bChangeFired, undefined, "The change event is not fired");
	});

	QUnit.test("Pressing the close button should not tokenize the value", async function (assert) {
		// Setup
		var bChangeFired, oFakeKeydown, oCloseButton,
			oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Arrange
		this.oMultiInput.addSuggestionItem(new Item({key: "1", text: "Item"}));
		this.oMultiInput.attachChange(function() {
			bChangeFired = true;
		});
		this.oMultiInput.setValue("test");
		await nextUIUpdate(this.clock);

		oSuggestionsDialog.getPopover().open();
		oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.I });
		oCloseButton = oSuggestionsDialog.getPopover().getCustomHeader().getContentRight()[0];

		// Act
		oSuggestionsDialog.getInput()._$input.trigger("focus").trigger(oFakeKeydown).val("I").trigger("input");
		this.clock.tick(500);

		oCloseButton.firePress();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(this.oMultiInput.getValue(), 'test', "The last confirmed value is still set");
		assert.strictEqual(bChangeFired, undefined, "The change event is not fired");
		assert.notOk(this.oMultiInput.getAggregation("tokenizer").getTokens().length, "The new value is not tokenized");
	});

	QUnit.test("Pressing the OK button should tokenize the value if there is validation", async function (assert) {
		// Setup
		var oSuggestionsDialog, oValidatorSpy;
		var oEventMock = {};
		var oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Act
		oSuggestionsDialog.getPopover().open();
		this.clock.tick();

		// Arrange
		oValidatorSpy = this.spy(function (oParams) {
			return new Token({
				key: oParams.text,
				text: oParams.text
			});
		});

		this.oMultiInput.setValue("");
		this.oMultiInput.addValidator(oValidatorSpy);
		await nextUIUpdate(this.clock);

		oSuggestionsDialog.getPopover().open();
		this.clock.tick(500);

		// Act
		oSuggestionsDialog.getInput().setValue("another value");
		this.oMultiInput._handleConfirmation(oEventMock);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(this.oMultiInput.getValue(), '', "The new value is tokenized");
		assert.strictEqual(oValidatorSpy.calledOnce, true, "Validator is fired");
		assert.strictEqual(this.oMultiInput.getAggregation("tokenizer").getTokens()[0].getText(), 'another value', "The new value is tokenized");
	});

	QUnit.test("Pressing the OK button should set the value if there is no validation", function (assert) {
		// Setup
		var bChangeFired, sOpenState, oSuggestionsDialog;
		var oEventMock = {};
		var oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Act
		oSuggestionsDialog.getPopover().open();
		this.clock.tick(500);

		// Arrange
		this.oMultiInput.attachChange(function() {
			bChangeFired = true;
		});

		// Arrange
		oSuggestionsDialog.getInput().setValue("test");

		// Act
		this.oMultiInput._handleConfirmation(oEventMock);
		this.clock.tick(500);

		sOpenState = oSuggestionsDialog.getPopover().oPopup.getOpenState();

		// Assert
		assert.strictEqual(sOpenState === OpenState.CLOSED || sOpenState === OpenState.CLOSING, true, "The dialog is closed after confirmation");
		assert.strictEqual(this.oMultiInput.getValue(), 'test', "The new value is set");
		assert.strictEqual(bChangeFired, true, "The change event is fired");
	});

	QUnit.test("Pressing the OK button should close the dialog even if the value is empty", function (assert) {
		// Setup
		var sOpenState, oSuggestionsDialog;
		var oEventMock = {};
		var oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Act
		oSuggestionsDialog.getPopover().open();
		this.clock.tick(500);

		// Act
		this.oMultiInput._handleConfirmation(true, oEventMock);
		this.clock.tick(500);

		sOpenState = oSuggestionsDialog.getPopover().oPopup.getOpenState();

		// Assert
		assert.strictEqual(sOpenState === OpenState.CLOSED || sOpenState === OpenState.CLOSING, true, "The dialog is closed after confirmation");
	});

	QUnit.test("onsapenter should change the value and close the picker", function (assert) {
		// Setup
		var sValue, oPickerTextFieldDomRef, sOpenState;
		var oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Act
		this.oMultiInput._getSuggestionsPopoverPopup().open();
		this.clock.tick(500);

		oPickerTextFieldDomRef = oSuggestionsDialog.getInput().getFocusDomRef();
		this.oMultiInput.attachChange(function(oEvent) {
			sValue = oEvent.getParameter("value");
		});

		// Act
		qutils.triggerCharacterInput(oPickerTextFieldDomRef, "test");
		qutils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);
		this.clock.tick(500);

		sOpenState = this.oMultiInput._getSuggestionsPopoverPopup().oPopup.getOpenState();

		// Assert
		assert.strictEqual(sOpenState === OpenState.CLOSED || sOpenState === OpenState.CLOSING, true, "The dialog is closed after enter key if the value is typed in");
		assert.strictEqual(this.oMultiInput.getValue(), 'test', "Value is confirmed");
		assert.strictEqual(sValue, 'test', "The change event is triggered and the right value is passed");
	});

	QUnit.test("Pressing 'Enter' should not close the dialog if the value is empty", function (assert) {
		// Setup
		var sOpenState, oSuggestionsDialog, oPickerTextFieldDomRef;
		var oSuggestionsDialog = this.oMultiInput._getSuggestionsPopover();

		// Act
		oSuggestionsDialog.getPopover().open();
		this.clock.tick(500);

		oPickerTextFieldDomRef = oSuggestionsDialog.getInput().getFocusDomRef();

		// Act
		qutils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);
		this.clock.tick(500);

		sOpenState = oSuggestionsDialog.getPopover().oPopup.getOpenState();

		// Assert
		assert.strictEqual(sOpenState === OpenState.OPEN || sOpenState === OpenState.OPENING, true, "The dialog is not closed if no value is provided");
	});

	QUnit.module("Events", {
		beforeEach: async function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.multiInput1.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("tokenUpdate event", function(assert) {
		var eventType,
			token1 = new Token({key: "test", text: "test", selected: true}),
			count = 0;

			this.multiInput1.attachTokenUpdate(function(args) {
			eventType = args.getParameter("type");
			count++;
		});

		this.multiInput1.addValidateToken({
			token : token1,
			validationCallback : function() {return true;}
		});
		assert.strictEqual(eventType, Tokenizer.TokenUpdateType.Added, "tokenUpdate event raised when token added");
		assert.strictEqual(count, 1, "tokenUpdate event fired once upon adding unique token");

		// clean-up
		token1.destroy();
	});

	QUnit.test("token update event", async function(assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var sPastedString = "a\nb\nc\nd\ne\nf\n\a",
			counter = 0;

		this.multiInput1.addValidator(function (args) {
			return new Token({text: args.text, key: args.text});
		});

		this.multiInput1.attachTokenUpdate(function (args) {
			counter++;
		});

		//act
		qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		this.clock.tick(10);
		await nextUIUpdate(this.clock);

		//assert
		assert.equal(counter, 1, "tokenUpdate event should be fired once");
		assert.equal(this.multiInput1.getTokens().length, 6, "6 tokens should be added to MultiInput");
	});

	QUnit.test("Paste clipboard data from excel from several rows and columns info multiple tokens", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var sPastedString = '1\t\t2\r\n\t\t\r\n3\t\t4\r\n',
			counter = 0;

		this.multiInput1.addValidator(function (args) {
			return new Token({text: args.text, key: args.text});
		});

		this.multiInput1.attachTokenUpdate(function (args) {
			counter++;
		});

		//act
		qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		this.clock.tick(10);
		await nextUIUpdate(this.clock);

		//assert
		assert.equal(counter, 1, "tokenUpdate event should be fired once");
		assert.equal(this.multiInput1.getTokens().length, 4, "6 tokens should be added to MultiInput");
	});

	QUnit.test("Paste single cell from excel should not create a token on Windows.", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var sPastedString = '1\r\n';

		this.multiInput1.addValidator(function (args) {
			return new Token({text: args.text, key: args.text});
		});

		//act
		qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		this.clock.tick(10);
		await nextUIUpdate(this.clock);

		//assert
		assert.equal(this.multiInput1.getTokens().length, 0, "A token should not be created");
	});

	QUnit.test("token update event on paste of a single string", async function(assert) {
			this.clock = sinon.useFakeTimers();
			//arrange
			var sPastedString = "text",
					counter = 0;

			this.multiInput1.addValidator(function (args) {
				return new Token({text: args.text, key: args.text});
			});

			this.multiInput1.attachTokenUpdate(function (args) {
				counter++;
			});

			if (window.clipboardData) {
				window.clipboardData.setData("Text", sPastedString);
			} else {
				qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
					originalEvent: {
						clipboardData: {
							getData: function () {
								return sPastedString;
							}
						}
					}
				});
			}

			this.clock.tick(10);
			await nextUIUpdate(this.clock);

			//assert
			assert.equal(counter, 0, "tokenUpdate event should not be fired");
			assert.equal(this.multiInput1.getTokens().length, 0, "no token should be created");
	});

	QUnit.test("paste of 2 rows of excel data fires '_validateOnPaste' with proper event argument", async function (assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var sPastedString = "value00\tvalue01\nvalue10\tvalue11";
		var fnFireEventSpy = this.spy(this.multiInput1, "fireEvent");

		//act
		qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		this.clock.tick();
		await nextUIUpdate(this.clock);

		//assert
		assert.ok(
			fnFireEventSpy.calledWith("_validateOnPaste"),
			"Private event _validateOnPaste was fired"
		);
		assert.deepEqual(
			fnFireEventSpy.firstCall.args[1].textRows,
			[
				["value00", "value01"],
				["value10", "value11"]
			],
			"_validateOnPaste should be called with argument 'textRows' that is an array of arrays"
		);
	});

	QUnit.test("paste of 1 row of excel data fires '_validateOnPaste' with proper event argument", async function (assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var sPastedString = "value00\tvalue01";
		var fnFireEventSpy = this.spy(this.multiInput1, "fireEvent");

		//act
		qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		this.clock.tick();
		await nextUIUpdate(this.clock);

		//assert
		assert.ok(
			fnFireEventSpy.calledWith("_validateOnPaste"),
			"Private event _validateOnPaste was fired"
		);
		assert.deepEqual(
			fnFireEventSpy.firstCall.args[1].textRows,
			[["value00", "value01"]],
			"_validateOnPaste should be called with argument 'textRows' that is an array of arrays"
		);
	});

	QUnit.test("paste of 2 rows of excel data with empty first column fires '_validateOnPaste' with empty first elements", async function (assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var sPastedString = "\tvalue01\r\n\tvalue11\r\n";
		var fnFireEventSpy = this.spy(this.multiInput1, "fireEvent");

		//act
		qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		this.clock.tick();
		await nextUIUpdate(this.clock);

		//assert
		assert.strictEqual(
			fnFireEventSpy.firstCall.args[1].textRows[0][0],
			"",
			"_validateOnPaste should be called with argument 'textRows' with empty value at position (0,0)"
		);
		assert.strictEqual(
			fnFireEventSpy.firstCall.args[1].textRows[1][0],
			"",
			"_validateOnPaste should be called with argument 'textRows' with empty value at position (1,0)"
		);
	});

	QUnit.test("paste of 1 cell of excel data does not fire '_validateOnPaste'", async function (assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var sPastedString = "value00";
		var fnFireEventSpy = this.spy(this.multiInput1, "fireEvent");

		//act
		qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		this.clock.tick();
		await nextUIUpdate(this.clock);

		//assert
		assert.notOk(
			fnFireEventSpy.calledWith("_validateOnPaste"),
			"Private event _validateOnPaste was fired"
		);
	});

	QUnit.test("token update event", function(assert) {
		this.clock = sinon.useFakeTimers();
		var iCount = 0,
			done = assert.async(),
			sText;

		assert.expect(2);
		this.multiInput1.attachTokenUpdate(function() {
			iCount++;
		});

		//arrange
		this.multiInput1.addValidator(function(args){
			sText = args.text;
			var oToken = new Token({key:args.text, text:args.text});
			args.asyncCallback(oToken);
		});

		//act
		this.multiInput1.setValue("test");
		this.multiInput1._validateCurrentText();

		//assert
		setTimeout(function () {
			assert.strictEqual(sText, "test", "tokenUpdate event fired with correct text parameter");
			assert.strictEqual(iCount, 1, "tokenUpdate event should be fired once");
			done();
		}, 200);

		this.clock.tick(250);
	});

	QUnit.test("test suggestionItemSelected event", function(assert) {
		var testTokenText = "Testtoken";
		var item = {
			getText: function(){return testTokenText;},
			getKey: function(){return "abc";}
		};

		this.multiInput1.fireSuggestionItemSelected({selectedItem: item});

		var aTokens = this.multiInput1.getTokens();
		assert.equal(aTokens.length, 1, "MultiInput contains 1 token");
		assert.equal(aTokens[0].getText(), testTokenText, "Token text == " + testTokenText);
	});

	QUnit.test("click on delete icon should not trigger Input.prototype.ontap", async function(assert) {
		var oDeleteIcon,
			spy = this.spy(Input.prototype, "ontap"),
			token1 = new Token();

		this.multiInput1.addToken(token1);
		this.multiInput1.attachTokenUpdate(function(evt){
			evt.preventDefault();
		});

		await nextUIUpdate();

		oDeleteIcon = token1.getAggregation("deleteIcon");
		qutils.triggerEvent("tap", oDeleteIcon.getDomRef());

		// assert
		assert.notOk(spy.called, "Input's ontap method is not called");
	});

	QUnit.test("Change event is properly fired on different interactions", async function (assert) {
		//Setup
		var oChangeFireSpy = this.spy(this.multiInput1, "fireChange"),
			oEnterSpy = this.spy(this.multiInput1, "onsapenter"),
			oValidatorSpy = this.spy(function (oParams) {
				return new Token({
					key: oParams.text,
					text: oParams.text
				});
			});
		this.multiInput1.addValidator(oValidatorSpy);


		//Act
		//Emulate use input
		// Modify DOM's value as we don't want to go trough MultiInput's API.
		this.multiInput1.focus();
		this.multiInput1.$("inner").val("Test token");
		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ENTER);
		await nextUIUpdate();

		//Assert
		assert.ok(oChangeFireSpy.calledOnce, "Change is fired");
		assert.ok(oValidatorSpy.calledOnce, "Validator is fired");
		assert.ok(oChangeFireSpy.calledBefore(oValidatorSpy), "fireChange is fired before Validator");
		assert.ok(oEnterSpy.args[0][0].isMarked(), "The change event should be marked, since a token is validated");

		//Act
		//Emulate use input
		// Modify DOM's value as we don't want to go trough MultiInput's API.
		this.multiInput1.bFocusoutDueRendering = false;
		this.multiInput1.$("inner").val("Test token 2");
		this.multiInput1.onsapfocusleave({});
		await nextUIUpdate();

		//Assert
		assert.ok(oChangeFireSpy.calledTwice, "Change is fired");
		assert.ok(oValidatorSpy.calledTwice, "Validator is fired");
		assert.ok(oChangeFireSpy.calledBefore(oValidatorSpy), "fireChange is fired before Validator");
	});


	QUnit.test("Enter event, should not be marked, when there are no modifications", async function (assert) {
		// Setup
		var oEnterSpy = this.spy(this.multiInput1, "onsapenter");

		// Act
		this.multiInput1.focus();
		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ENTER);
		await nextUIUpdate();

		// Assert
		assert.notOk(oEnterSpy.args[0][0].isMarked());

		// Cleanup
		oEnterSpy.restore();
	});

	QUnit.test("Selecting an item should not leave a text in the input", async function (assert) {
		// arrange
		var oItem = new ListItem({
			key: '1',
			text: '1 Item 1'
		});

		var oSpyChangeEvent = this.spy(this.multiInput1, "fireChange");

		this.multiInput1.addSuggestionItem(oItem);
		await nextUIUpdate();

		// act
		this.multiInput1.setSelectedKey(oItem.getKey());
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.multiInput1.getValue(), "", "Value of the input should be empty");

		assert.strictEqual(oSpyChangeEvent.callCount, 1, "Change event should be fired once");
	});

	QUnit.test("The selectedKey property should be reset on user input", async function (assert) {
		// Arrange
		var oFakeEvent = {
				isMarked: function(){},
				setMarked:function(){}
			},
			oMultiInput = new MultiInput().placeAt("content"),
			oSpy;
		await nextUIUpdate();

		// Act
		oSpy = this.spy(oMultiInput, "setProperty");
		oMultiInput.oninput(oFakeEvent);

		// Assert
		assert.strictEqual(oSpy.firstCall.args[0], "selectedKey", "SelectedKey property is set");
		assert.strictEqual(oSpy.firstCall.args[1], "", "SelectedKey value is an empty string");
		assert.strictEqual(oSpy.firstCall.args[2], true, "Invalidation is suppressed");

		// Clean up
		oSpy.restore();
		oMultiInput.destroy();
	});

	QUnit.test("The binding data and the value should be an empty string after adding a token when focusing out of the control", async function (assert) {
		// Arrange
		var oMultiInput = new MultiInput({
			value: "{/value}",
			suggestionItems: [
				new ListItem("itemId", {
					key: "1",
					text: "Token 1"
				})
			]
		}).placeAt("content");

		await nextUIUpdate();

		var oModel = new JSONModel({
			value: ""
		});

		oMultiInput.addValidator(function (o) {
			return o.suggestedToken ? o.suggestedToken : new Token({text: o.text});
		});

		oMultiInput.setModel(oModel);
		oMultiInput.setValue("Token 1");

		await nextUIUpdate();

		// Act - trigger onsapfocusleave and close
		// the suggestion popover when an item is selected
		oMultiInput.onsapfocusleave({});
		oMultiInput.setSelectedKey("1");
		oMultiInput._getSuggestionsPopoverPopup().close();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiInput.getValue(), "", "Value of the input should be empty");
		assert.strictEqual(oMultiInput.getBinding("value").getModel().getProperty("/value"), "", "The binding value should be an empty string");

		oMultiInput.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach : async function() {
			this.multiInput1 = new MultiInput({
				value: "Value",
				tooltip: "Tooltip",
				placeholder: "Placeholder"
			});
			this.multiInput1.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.multiInput1.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		// assert
		assert.ok(!!this.multiInput1.getAccessibilityInfo, "MultiInput has a getAccessibilityInfo function");

		// arrange
		var oInfo = this.multiInput1.getAccessibilityInfo();

		// assert
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, this.multiInput1.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, oResourceBundle.getText("ACC_CTR_TYPE_MULTIINPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		assert.strictEqual(this.multiInput1.getFocusDomRef().getAttribute("aria-roledescription"), oResourceBundle.getText("MULTIINPUT_ARIA_ROLE_DESCRIPTION"), "aria-roledescription attribute is rendered correctly to the DOM");


		// act
		this.multiInput1.setValue("");
		this.multiInput1.setEnabled(false);
		oInfo = this.multiInput1.getAccessibilityInfo();

		// assert
		assert.strictEqual(oInfo.description, oResourceBundle.getText("INPUTBASE_VALUE_EMPTY"), "Description - Empty when there are no tokens and no value");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");

		// act
		this.multiInput1.setEnabled(true);
		this.multiInput1.setEditable(false);
		oInfo = this.multiInput1.getAccessibilityInfo();

		// assert
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");

		// act
		this.multiInput1.setDescription("Description");
		oInfo = this.multiInput1.getAccessibilityInfo();

		// assert
		assert.strictEqual(oInfo.description, "Description", "Description");

		// act
		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));
		this.multiInput1.setDescription("Description");
		oInfo = this.multiInput1.getAccessibilityInfo();

		// assert
		assert.strictEqual(oInfo.description, "Description Token1 Token2", "Description");
	});

	QUnit.test("Tokens information should be read out", function(assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var sInvisibleTextId = this.multiInput1.getAggregation("tokenizer").getTokensInfoId(),
			oInvisibleText = Element.getElementById(sInvisibleTextId);

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_NO_TOKENS"), "'MultiInput no tokens' text is set.");

		// act
		this.multiInput1.addToken(new Token({text: "Token1"}));

		this.clock.tick();

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_ONE_TOKEN"), "'MultiInput contains 1 token' text is set.");

		// act
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.clock.tick();

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS", this.multiInput1.getTokens().length), "'MultiInput contains N tokens' text is set.");

		this.multiInput1.focus();
		assert.ok(this.multiInput1.getFocusDomRef().getAttribute('aria-describedby').indexOf(oInvisibleText.getId()) !== -1, "Tokens information is added to the input");

		//arrange
		var sInvisibleTextId1 = InvisibleText.getStaticId("sap.m", "MULTICOMBOBOX_OPEN_NMORE_POPOVER");

		// act
		this.multiInput1.getFocusDomRef().blur();
		this.clock.tick();

		this.multiInput1.setEditable(false);
		this.multiInput1.setWidth("20px");

		this.clock.tick(300);

		//assert
		assert.ok(this.multiInput1.getFocusDomRef().getAttribute('aria-describedby').indexOf(sInvisibleTextId1) !== -1, "Input has aria-describedby attribute to indicate Enter press possibility");
		assert.strictEqual(this.multiInput1.getFocusDomRef().getAttribute('aria-describedby'), sInvisibleTextId + " " + sInvisibleTextId1, "Both references are added to the aria-describedby attribute");
	});

	QUnit.test("aria-keyshortcuts attribute", async function(assert) {
		// Arrange
		var sKeyShortcut,
			oMultiInput = new MultiInput({
				width: "300px",
				editable: false,
				tokens: [
					new Token({text: "Long text"}),
					new Token({text: "Very long text"}),
					new Token({text: "Very, very long text"}),
					new Token({text: "Very, very, very long text"})
				]
			});

		oMultiInput.placeAt("content");
		await nextUIUpdate();

		oMultiInput._onResize();
		await nextUIUpdate();

		// Act
		sKeyShortcut = oMultiInput.getFocusDomRef().getAttribute('aria-keyshortcuts');
		await nextUIUpdate();

		// Assert
		assert.strictEqual(sKeyShortcut, "Enter", "'aria-keyshortcuts' attribute should be presented with the correct value");

		// Act
		oMultiInput.setEnabled(false);
		await nextUIUpdate();
		sKeyShortcut = oMultiInput.getFocusDomRef().getAttribute('aria-keyshortcuts');

		// Assert
		assert.notOk(sKeyShortcut, "'aria-keyshortcuts' attribute should not be presented.");

		// Act
		oMultiInput.setEnabled(true);
		oMultiInput.setEditable(true);
		await nextUIUpdate();
		sKeyShortcut = oMultiInput.getFocusDomRef().getAttribute('aria-keyshortcuts');

		// Assert
		assert.notOk(sKeyShortcut, "'aria-keyshortcuts' attribute should not be presented.");

		oMultiInput.destroy();
	});

	QUnit.test("Placeholder opacity", async function(assert) {
		// assert
		assert.ok(!this.multiInput1.$().hasClass("sapMMultiInputHasTokens"), "MultiInput placeholder shows placeholder");

		// act
		this.multiInput1.addToken(new Token({text: "Token2"}));
		await nextUIUpdate();

		// assert
		assert.ok(this.multiInput1.$().hasClass("sapMMultiInputHasTokens"), "MultiInput placeholder doesn't show placeholder");
	});

	QUnit.test("aria-haspopup should be correctly applied", async function(assert) {
		//Arrange
		var oMultiInputWithoutSuggestions = new MultiInput({showSuggestion: false}),
			oMultiInputWithSuggestions =  new MultiInput({});

		oMultiInputWithoutSuggestions.placeAt("content");
		oMultiInputWithSuggestions.placeAt("content");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oMultiInputWithoutSuggestions._$input.attr("aria-haspopup"), undefined, "aria-haspopup should not be  presented.");
		assert.strictEqual(oMultiInputWithSuggestions._$input.attr("aria-haspopup"), "dialog", "aria-haspopup should have value 'dialog'.");

		//Act
		oMultiInputWithSuggestions.setShowSuggestion(false);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oMultiInputWithSuggestions._$input.attr("aria-haspopup"), undefined, "aria-haspopup should not be  presented.");

		//Clean up
		oMultiInputWithoutSuggestions.destroy();
		oMultiInputWithSuggestions.destroy();
	});

	QUnit.test("Invisible Message - Announce navigation through suggestions and tokens", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oItem = new Item({
				key : "0",
				text : "item 0"
			}),
			oAnnounceSpy = this.spy(InvisibleMessage.prototype, "announce"),
			oMultiInputWithSuggestions = new MultiInput({
				suggestionItems: [oItem]
			});

		oMultiInputWithSuggestions.placeAt("content");
		await nextUIUpdate(this.clock);

		oMultiInputWithSuggestions._openSuggestionsPopover();
		this.clock.tick(1000);

		//Assert
		assert.ok(oAnnounceSpy.calledWith(oResourceBundle.getText("MULTIINPUT_NAVIGATION_POPUP")), "Navigation through suggestions should be announced.");

		//Act
		oMultiInputWithSuggestions._closeSuggestionPopup();
		this.clock.tick(1000);
		oMultiInputWithSuggestions.addToken(new Token({text: "Token1"}));
		await nextUIUpdate(this.clock);

		oMultiInputWithSuggestions._openSuggestionsPopover();
		this.clock.tick(1000);

		//Assert
		assert.ok(oAnnounceSpy.calledWith(oResourceBundle.getText("MULTIINPUT_NAVIGATION_POPUP_AND_TOKENS")),
			"Navigation through suggestions and tokens should be announced.");

		//Clean up
		oAnnounceSpy.restore();
		oMultiInputWithSuggestions.destroy();
	});

	QUnit.module("Copy/Cut Functionality", {
		beforeEach: async function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.multiInput1.destroy();
		}
	});

	QUnit.test("Cut", async function(assert) {
		var oSpy = this.spy(Tokenizer.prototype, "_cut");

		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.multiInput1.getTokens()[0].setSelected(true);
		this.multiInput1.getTokens()[0].focus();


		await nextUIUpdate();

		qutils.triggerEvent("keydown", this.multiInput1.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.X,
			ctrlKey: true
		});

		// assert
		assert.ok(oSpy.called, "Tokenizer's cut method is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Cut with keyboard", async function(assert) {
		var oSpy = this.spy(Tokenizer.prototype, "_cut");

		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.multiInput1.getTokens()[0].focus();

		await nextUIUpdate();

		qutils.triggerEvent("keydown", this.multiInput1.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.A,
			ctrlKey: true
		});

		qutils.triggerEvent("keydown", this.multiInput1.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.X,
			ctrlKey: true
		});

		// assert
		assert.ok(oSpy.called, "Tokenizer's cut method is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Copy", async function(assert) {
		var oSpy = this.spy(Tokenizer.prototype, "_copy");

		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.multiInput1.getTokens()[0].setSelected(true);

		await nextUIUpdate();

		qutils.triggerEvent("keydown", this.multiInput1.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.C,
			ctrlKey: true
		});

		// assert
		assert.ok(oSpy.called, "Tokenizer's copy method is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Copy with keyboard", async function(assert) {
		var oSpy = this.spy(Tokenizer.prototype, "_copy");

		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.multiInput1.focus();

		await nextUIUpdate();

		qutils.triggerEvent("keydown", this.multiInput1.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.A,
			ctrlKey: true
		});

		qutils.triggerEvent("keydown", this.multiInput1.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.C,
			ctrlKey: true
		});

		// assert
		assert.ok(oSpy.called, "Tokenizer's copy method is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Paste (with suggestions)", async function(assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var sPastedString = "a\nb";
		this.multiInput1.addSuggestionItem(new Item({ text : "a"}));
		this.multiInput1.addSuggestionItem(new Item({ text : "b"}));

		//act
		qutils.triggerEvent("paste", this.multiInput1.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		await nextUIUpdate(this.clock);
		this.clock.tick(10);

		//assert
		assert.equal(this.multiInput1.getTokens().length, 2, "2 tokens should be added to MultiInput on paste");
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("_convertTextToToken", async function(assert) {
		this.multiInput1.addValidator(function(args){
			return new Token({text: args.text});
		});

		await nextUIUpdate();

		var result = this.multiInput1._convertTextToToken("  token");

		// assert
		assert.strictEqual(result.getText(), "token", "then the return value is correct");
	});

	QUnit.module("Collapsed state (N-more)", {
		beforeEach : async function() {
			this.multiInput = new MultiInput();
			this.multiInput.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.multiInput.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Popover's initial state", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oTokenizer = this.multiInput.getAggregation("tokenizer"),
			oSpy = this.spy(oTokenizer, "_togglePopup"),
			oSelectedItemsList;
		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		await nextUIUpdate(this.clock);

		// act
		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(1);

		// assert
		oSelectedItemsList = oTokenizer.getTokensPopup().getContent()[0];
		assert.ok(oSpy.called, "_togglePopup is called when N-more is pressed");
		assert.strictEqual(oSelectedItemsList.getMetadata().getName(), "sap.m.List", "The popover contains a list");
		assert.strictEqual(oSelectedItemsList.getItems().length, 4, "sap.m.List", "The list contains the correct number of items");

		// clean up
		oSpy.restore();
	});

	QUnit.test("Popover's interaction", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oPicker;
		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		await nextUIUpdate(this.clock);

		// act
		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		oPicker = this.multiInput.getAggregation("tokenizer").getTokensPopup();
		this.clock.tick(100);

		// delete the first item
		oPicker.getContent()[0].getItems()[0]._oDeleteControl.firePress();
		await nextUIUpdate(this.clock);
		// assert
		assert.strictEqual(this.multiInput.getTokens().length, 3, "A token was deleted after deleting an item from the popover");
		assert.ok(oPicker.isOpen(), "Popover remains open after deleting a token");

		//close and open the picker
		oPicker.close();
		this.multiInput.getAggregation("tokenizer").$().trigger("click");

		//assert
		assert.strictEqual(oPicker.getContent()[0].getItems().length, 3, "The items in the list are updated");
	});

	QUnit.test("Popover's interaction - try to delete non editable token", async function(assert) {
		// Arrange
		var oFakeEvent, oItem,
			oTokenizer = this.multiInput.getAggregation("tokenizer"),
			oList = oTokenizer._getTokensList(),
			oListRemoveItemSpy = this.spy(oList, "removeItem");

		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX", editable: false})
		]);

		await nextUIUpdate();

		oItem = oList.getItems()[0];
		oFakeEvent = {
			getParameter: function () { return oItem; }
		};

		// Act
		oTokenizer._handleListItemDelete(oFakeEvent);

		// Assert
		assert.strictEqual(oListRemoveItemSpy.callCount, 0, "List item was not removed.");
		assert.strictEqual(this.multiInput.getTokens().length, 1, "There is still one token in the multi input.");
	});

	QUnit.test("onfocusin", async function(assert) {
		var oIndicator,
			oEventMock = {
				target : this.multiInput.getDomRef("inner")
			};
		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		await nextUIUpdate();

		oIndicator = this.multiInput.$().find(".sapMTokenizerIndicator");

		//assert
		assert.ok(oIndicator[0], "A n-more label is rendered");

		//close and open the picker
		this.multiInput.onfocusin(oEventMock);
		await nextUIUpdate();

		// assert
		assert.ok(oIndicator.hasClass("sapUiHidden"), "The n-more label is hidden on focusin.");
	});

	QUnit.test("RenderMode behaviour against different interactions", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oTokenizer = this.multiInput.getAggregation("tokenizer"),
			oTokenizerSpy;

		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		await nextUIUpdate(this.clock);

		// Setup
		oTokenizerSpy = this.spy(oTokenizer, "setRenderMode");

		// Act. Emulate click on the Icon
		this.multiInput.onfocusin({target: this.multiInput.getDomRef("vhi")});
		await nextUIUpdate(this.clock);

		// assert
		assert.notOk(oTokenizerSpy.calledOnce, "setRenderMode should not be triggered");
		assert.strictEqual(oTokenizer.getRenderMode(), TokenizerRenderMode.Narrow, "Tokenizer's renderMode should be Narrow");

		// Act. Emulate "real" focusin
		this.multiInput.onfocusin({target: this.multiInput.getDomRef("inner")});
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oTokenizerSpy.calledOnce, "setRenderMode should be triggered");
		assert.strictEqual(oTokenizer.getRenderMode(), TokenizerRenderMode.Loose, "renderMode property should be set when the focus is on the input");

		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();

		// Focus first item in the popover.
		oTokenizer.getTokensPopup().getContent()[0].getItems()[0].$().trigger("focus");
		await nextUIUpdate(this.clock);

		oTokenizer.getTokensPopup().close();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(this.multiInput.getAggregation("tokenizer").getRenderMode(), TokenizerRenderMode.Narrow, "The tokenizer is in Narrow mode");
	});

	QUnit.test("_mapTokenToListItem", function(assert) {
		var oToken = new Token({
			text: "text123",
			key: "key123"
		}), oListItem = this.multiInput.getAggregation("tokenizer")._mapTokenToListItem(oToken);

		//assert
		assert.strictEqual(oListItem.getTitle(), "text123", "The listItem's title is correct.");
		assert.strictEqual(oListItem.data("tokenId"), oToken.getId(), "The listItem's customData tokenId is correct.");
	});

	QUnit.test("_handleNMoreItemDelete", async function(assert) {
		var oListItem = new StandardListItem(), aTokens,
			oToken = new Token("token", {text: "text123", key: "key123"}),
			oSpy = this.spy(this.multiInput.getAggregation("tokenizer"), "removeAggregation"),
			oTokenUpdateSpy = this.spy(this.multiInput, "fireTokenUpdate"),
			oFakeEvent = new Event(),
			oSetSelectionStub = this.stub(Event.prototype, "getParameter");

		oSetSelectionStub.withArgs("listItem").returns(oListItem);
		oSetSelectionStub.withArgs("tokens").returns([oToken]);

		this.multiInput.addToken(oToken);
		oListItem.data("key", "key123");
		oListItem.data("text", "text123");
		oListItem.data("tokenId", "token");

		await nextUIUpdate();

		// assert
		aTokens = this.multiInput.getTokens();
		assert.strictEqual(aTokens.length, 1, "Initially the multiinput has one token.");

		// act
		this.multiInput.getAggregation("tokenizer")._handleListItemDelete(oFakeEvent);
		assert.ok(oTokenUpdateSpy.calledOnce, "tokenUpdate event is fired once upond token removal.");

		aTokens = this.multiInput.getTokens();

		// assert
		assert.ok(oSpy.called, "removeToken is called.");
		assert.strictEqual(aTokens.length, 0, "The multiinput is empty after deselection.");

		// clean up
		oSpy.restore();
		oSetSelectionStub.restore();
	});

	QUnit.test("Token's list", function(assert) {
		var oSelectedItemsList;
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		// act
		oSelectedItemsList = this.multiInput.getAggregation("tokenizer")._getTokensList();
		//assert
		assert.strictEqual(oSelectedItemsList.getMetadata().getName(), "sap.m.List", "_getTokensList method return a list");

		// act
		this.multiInput.getAggregation("tokenizer")._fillTokensList(oSelectedItemsList);
		// assert
		assert.strictEqual(oSelectedItemsList.getItems().length, 4, "_fillTokensList adds the correct number of items in the list");
	});

	QUnit.test("getTokensPopup", function(assert) {
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		// act
		var oSelectedItemsPicker = this.multiInput.getAggregation("tokenizer").getTokensPopup();
		//assert
		assert.strictEqual(oSelectedItemsPicker.getMetadata().getName(), "sap.m.ResponsivePopover", "getTokensPopup method return a popover.");

		// assert
		assert.strictEqual(oSelectedItemsPicker.getContent()[0].getMetadata().getName(), "sap.m.List", "The popover contains a list.");
	});

	QUnit.skip('Selected items list on mobile', async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});
		this.multiInput1 = new MultiInput({
		}).placeAt("qunit-fixture");
		this.multiInput1.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		this.multiInput1.setWidth("200px");

		var oTokenizer = this.multiInput1.getAggregation("tokenizer"),
			oStub = this.stub(oTokenizer.getTokensPopup(), "openBy");

		await nextUIUpdate(this.clock);

		// act
		this.multiInput1.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(1000);

		assert.ok(oStub.called, "The suggestion dialog is opened on click on N-more");
		assert.ok(this.multiInput1._getSuggestionsPopover().getFilterSelectedButton(), "The filtering button is pressed on initial opening");
		assert.ok(oTokenizer._getTokensList().getVisible(), "The list with tokens is visible");

		// clean up
		oStub.restore();
		this.multiInput1.destroy();
	});

	QUnit.test('Selected items list update on mobile', async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		var oList,
			oFakeEvent = new Event(),
			oDeleteStub = this.stub(Event.prototype, "getParameter"),
			oMI = new MultiInput().placeAt("qunit-fixture"),
			oTokenizer = oMI.getAggregation("tokenizer");

		oMI.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		oMI.setWidth("200px");
		await nextUIUpdate(this.clock);

		// act
		oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		await nextUIUpdate(this.clock);

		// assert
		oList = oTokenizer._getTokensList();
		assert.strictEqual(oList.getItems().length, 4, "The dialog has the correct number of list items.");

		// act
		oDeleteStub.withArgs("listItem").returns(oList.getItems()[0]);
		oDeleteStub.withArgs("tokens").returns([oMI.getTokens()[0]]);
		oTokenizer._handleListItemDelete(oFakeEvent);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oList.getItems().length, 3, "A list item is removed from the dialog.");

				// Prepare clean up
		// In IE the tokenizer's popup is getting auto-closed with delay, after the tokenizer itself has been destroyed.
		// Close the popup before destroying so it has a place to return the focus to prevent exceptions in IE.
		oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Clean
		oDeleteStub.restore();
		oMI.destroy();
	});

	QUnit.test('Selected items dialog, when showSuggestion is false', async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oFakeEvent = {
			target: {id: null}, isMarked: function () {}
		};
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		//arrange
		var oMI = new MultiInput({
			showSuggestion: false
		}).placeAt("qunit-fixture");

		oMI.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		oMI.setWidth("300px");
		await nextUIUpdate(this.clock);

		//act
		oMI.ontap(oFakeEvent);
		this.clock.tick(1);

		//assert
		assert.ok(oMI._getSuggestionsPopover().isOpen(), "Tokens dialog should be open");

		//clean up
		oMI.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test('One long token, when showSuggestion is false', async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oFakeEvent = {
			target: {id: null}, isMarked: function () {}
		};
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		//arrange
		var oMI = new MultiInput({
			showSuggestion: false
		}).placeAt("qunit-fixture");

		oMI.setTokens([
			new Token({text: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"})
		]);
		oMI.setWidth("200px");
		await nextUIUpdate(this.clock);

		//act
		oMI.ontap(oFakeEvent);
		this.clock.tick(1);

		//assert
		assert.ok(oMI._getSuggestionsPopover().isOpen(), "Tokens dialog should be open");

		//clean up
		oMI.destroy();
	});

	QUnit.test("Token's list + token deletion", async function(assert) {
		var aListItems,
			oToken = new Token({text: "XXXX"}),
		oTokenizer = this.multiInput.getAggregation("tokenizer");
		this.multiInput.addToken(oToken);
		oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		await nextUIUpdate();

		// act
		oTokenizer._fillTokensList(oTokenizer._getTokensList());
		this.multiInput.removeToken(oToken);
		await nextUIUpdate();

		// assert
		aListItems = oTokenizer._getTokensList().getItems();
		assert.strictEqual(aListItems.length, 0, "The list item should be deleted on token deletion");
	});

	QUnit.test("Read-only popover ", function(assert) {
		//arrange
		var multiInput = new MultiInput({editable: true});

		var fnReadOnlyPopDestroySpy = this.spy(multiInput.getAggregation("tokenizer").getTokensPopup(), "destroy");
		multiInput.destroy();

		// assert
		assert.strictEqual(fnReadOnlyPopDestroySpy.callCount, 1, "The tokenizer was destroyed once during cloning");

		// clean up
		fnReadOnlyPopDestroySpy.restore();
		multiInput.destroy();
	});

	QUnit.test("Read-only popover should be closed on ENTER", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oMultiInput = new MultiInput({
				editable: false,
				width: "200px",
				tokens: [
					new Token({text: "XXXX"}),
					new Token({text: "XXXX"}),
					new Token({text: "XXXX"}),
					new Token({text: "XXXX"})
				]
			}),
			oPopover = oMultiInput.getAggregation("tokenizer").getTokensPopup();

		// act
		oMultiInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oPopover, "Readonly Popover should be created");

		// act
		qutils.triggerKeydown(oPopover, KeyCodes.ENTER);
		this.clock.tick(nPopoverAnimationTick);

		assert.notOk(oPopover.isOpen(), "Readonly Popover should be closed");

		// delete
		oMultiInput.destroy();
	});

	QUnit.test("Read-only popover should be opened on ENTER keypress", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oMultiInput = new MultiInput({
			editable: false,
			width: "200px",
			tokens: [
				new Token({ text: "XXXX" }),
				new Token({ text: "XXXX" }),
				new Token({ text: "XXXX" }),
				new Token({ text: "XXXX" })
			]
		}), oMIDomRef;

		// act
		oMultiInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// act
		oMIDomRef = oMultiInput.getFocusDomRef();
		qutils.triggerKeydown(oMIDomRef, KeyCodes.ENTER);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oMultiInput.getAggregation("tokenizer")._getTokensList().getItems()[0].getDomRef(), document.activeElement, "Popover should be on focus when opened");

		// delete
		oMultiInput.destroy();
	});

	QUnit.test("Read-only popover should not be closed when the scrolbar inside is clicked", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oMultiInput = new MultiInput({
			editable: false,
			width: "50px",
			tokens: [
				new Token({ text: "XXXX" }),
				new Token({ text: "XXXX" }),
				new Token({ text: "XXXX" }),
				new Token({ text: "XXXX" })
			]
		}),
		oPopover = oMultiInput.getAggregation("tokenizer").getTokensPopup();

		// act
		oMultiInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oPopover, "Readonly Popover should be created");

		// act
		oMultiInput.getAggregation("tokenizer")._handleNMoreIndicatorPress();
		this.clock.tick(nPopoverAnimationTick);

		oMultiInput.onsapfocusleave({
			relatedControlId: oPopover.getId()
		});
		this.clock.tick(nPopoverAnimationTick);

		assert.ok(oPopover.isOpen(), "Readonly Popover should remain open");

		// delete
		oMultiInput.destroy();
	});

	QUnit.test("Read-only popover is opened after N-more is pressed", async function(assert){
		var oPicker,
		oTokenizer = this.multiInput.getAggregation("tokenizer");
		this.multiInput.setWidth("200px");
		this.multiInput.setEditable(false);
		this.multiInput.setEnabled(true);
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		await nextUIUpdate();

		// act

		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();

		oPicker = oTokenizer.getTokensPopup();

		assert.equal(oPicker.isOpen(), true, "The readonly popover is opened on click on N-more");
	});

	QUnit.test("Read-only popover list should be destroyed, when MultiInput is set to editable", async function(assert){
		var oPicker,
			oTokenizer = this.multiInput.getAggregation("tokenizer");
		this.multiInput.setWidth("200px");
		this.multiInput.setEditable(false);
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		await nextUIUpdate();


		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		oPicker = oTokenizer.getTokensPopup();

		// assert
		assert.ok(oPicker.isOpen(), "The readonly popover is opened on click on N-more");

		// act
		oPicker.close();
		this.multiInput.setEditable(true);
		await nextUIUpdate();

		// act
		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();

		await nextUIUpdate();


		var oEvent = {
			getParameter: function () {
				return oPicker.getContent()[0].getItems()[0];
			}
		};

		oTokenizer._handleListItemDelete(oEvent);
		await nextUIUpdate();

		var aTokens = this.multiInput.getTokens();
		var aItems = oPicker.getDomRef().querySelectorAll('.sapMLIB');

		// assert
		assert.strictEqual(document.querySelectorAll("#" + this.multiInput.getAggregation("tokenizer")._getTokensList().getId()).length, 1, "There should be only 1 instance of the tokens list");
		assert.strictEqual(aItems.length, aTokens.length, "List items and tokens should be equal:" + aItems.length);
	});

	QUnit.test("tokenizer's _useCollapsedMode is called on initial rendering", async function(assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var oMultiInput = new MultiInput(),
			tokenizerSpy = this.spy(oMultiInput.getAggregation("tokenizer"), "_useCollapsedMode");

		// act
		oMultiInput.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		// assert
		assert.strictEqual(oMultiInput.getAggregation("tokenizer").getRenderMode(), TokenizerRenderMode.Narrow, "the tokenizer is in Narrow mode");
		assert.ok(tokenizerSpy.called, "tokenizer's _useCollapsedMode is called");

		// clean up
		oMultiInput.destroy();
	});

	QUnit.test("Input visibility", async function(assert) {
		//arrange
		var multiInput = new MultiInput();

		// act
		multiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		multiInput.updateDomValue("123");
		qutils.triggerEvent("input", multiInput.getFocusDomRef());

		multiInput.onsapfocusleave({});
		await nextUIUpdate();

		// assert
		assert.strictEqual(multiInput.$("inner").css("opacity"), "1", "The input value remains visible, if the n-more label is hidden");

		// clean up
		multiInput.destroy();
	});

	QUnit.test("Input visibility with read-only state", async function (assert) {
		// arrange
		var oMultiInput = new MultiInput({
			editable: false,
			width: "200px",
			value: "111"
		});

		// act
		oMultiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oMultiInput.$("inner").css("opacity"), "1", "The input value remains visible, if the n-more label is hidden");

		oMultiInput.setTokens([
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" })
		]);

		// act
		await nextUIUpdate();

		// assert
		assert.strictEqual(oMultiInput.$("inner").css("opacity"), "0", "The input value is not visible, if the n-more label is shown");

		// clean up
		oMultiInput.destroy();
	});

	QUnit.test("input's visibility onsapfocusleave + n-more label", async function(assert) {
		var oIndicator,
			oVisibleInputSpy = this.spy(this.multiInput, "_setValueVisible");

		this.multiInput.setWidth("200px");
		this.multiInput.setValue("XXXX");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		await nextUIUpdate();

		oIndicator = this.multiInput.$().find(".sapMTokenizerIndicator");
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is visible.");
		assert.ok(this.multiInput.getAggregation("tokenizer").getHiddenTokensCount() > 0, "The n-more indicator is visible.");

		// Currently the _handleVisibility method is called more than once as it is connected with the Tokenizer
		// Invalidating when the nMore is to be shown that is why
		oVisibleInputSpy.resetHistory();
		this.multiInput.onsapfocusleave({});
		await nextUIUpdate();

		// assert
		assert.ok(oVisibleInputSpy.calledWith(false), "The input field is hidden onfocusout.");
		assert.notOk(oVisibleInputSpy.calledWith(true), "The input field is not shown onfocusout.");
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is visible");
	});

	QUnit.test("input's visibility onsapfocusleave + without n-more label", async function(assert) {
		var oIndicator,
			oVisibleInputSpy = this.spy(this.multiInput, "_setValueVisible");

		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"})
		]);

		await nextUIUpdate();

		oIndicator = this.multiInput.$().find(".sapMTokenizerIndicator");
		assert.ok(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is not visible.");
		assert.strictEqual(this.multiInput.getAggregation("tokenizer").getHiddenTokensCount(), 0, "The n-more indicator is not visible.");

		// act
		this.multiInput.onsapfocusleave({});

		// assert
		assert.ok(oVisibleInputSpy.calledWith(true), "The input field is shown onfocusout.");
		assert.notOk(oVisibleInputSpy.calledWith(false), "The input field is not hidden onfocusout.");
		assert.ok(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is hidden");
	});

	QUnit.test("input's visibility on rerendering", async function(assert) {
		var oIndicator,
			oVisibleInputSpy = this.spy(this.multiInput, "_setValueVisible");

		this.multiInput.setWidth("200px");
		this.multiInput.setValue("XXXX");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		await nextUIUpdate();

		oIndicator = this.multiInput.$().find(".sapMTokenizerIndicator");

		//assert that the n-more indicator is shown
		assert.ok(oIndicator[0], "A n-more label is rendered");
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is visible.");

		oVisibleInputSpy.resetHistory();
		this.multiInput.invalidate({});
		await nextUIUpdate();

		// assert
		assert.ok(oVisibleInputSpy.calledWith(false), "The input field is hidden.");
		assert.notOk(oVisibleInputSpy.calledWith(true), "The input field is not shown.");
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is visible");
	});

	QUnit.test("Do not listen for resize while resizing", function (assert) {
		// Setup
		var oRegisterResizeSpy = this.spy(this.multiInput, "_registerResizeHandler"),
			oMaxWidthSetterSpy = this.spy(this.multiInput.getAggregation("tokenizer"), "setMaxWidth");

		// Act
		this.multiInput._onResize();

		//Assert
		assert.ok(this.multiInput._iResizeHandlerId, "Register resize handler");
		assert.ok(oMaxWidthSetterSpy.calledOnce, "Tokens MaxWidth setter called");
		assert.ok(oMaxWidthSetterSpy.calledBefore(oRegisterResizeSpy), "Finally, subscribe again for the resize handler");

		this.multiInput.destroy();

		assert.notOk(this.multiInput._iResizeHandlerId, "Deregister resize handler");
		assert.notOk(this.multiInput._iTokenizerResizeHandler, "Deregister Tokenizer's resize handler");
	});

	QUnit.module("Destroyers");

	QUnit.test("Destroy properly internal lists", async function (assert) {
		// arrange
		var oMultiInput = new MultiInput({
			editable: true
		});
		var oTokenizer = oMultiInput.getAggregation("tokenizer");
		var oList  = oTokenizer._getTokensList();
		oMultiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oMultiInput.destroy();
		await nextUIUpdate();

		// assert
		assert.ok(!oTokenizer._oTokensList, "The SelectedItemsList gets detached");
		assert.ok(oTokenizer._oTokensList !== oList, "The SelectedItemsList gets cleaned properly");
	});

	QUnit.test("Destroy & reinit on mobile", async function (assert) {
		// Setup
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// arrange
		var oMultiInput = new MultiInput("test-input").placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oMultiInput.destroy();
		oMultiInput = new MultiInput("test-input").placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.ok(true, "If there's no exception so far, everything is ok");

		// Cleanup
		oMultiInput.destroy();
	});

	QUnit.test("Properly destroy tokens only when allowed", async function (assert) {
		// arrange
		var oToken = new Token({text: "My Token"}),
			oTokenSpy = this.spy(oToken, "destroy"),
			oMultiInput = new MultiInput({
				tokens: [oToken]
			}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oMultiInput.setEditable(false);
		oMultiInput._deleteTokens([oToken], {});
		await nextUIUpdate();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oMultiInput.getTokens(), [oToken], "The tokenizer should remain untouched");


		// Act
		oMultiInput.setEditable(true);
		oMultiInput.setEnabled(false);
		oMultiInput._deleteTokens([oToken], {});
		await nextUIUpdate();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oMultiInput.getTokens(), [oToken], "The tokenizer should remain untouched");

		// Act
		oMultiInput.setEnabled(true);
		oToken.setEditable(false);
		oMultiInput._deleteTokens([oToken], {});
		await nextUIUpdate();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oMultiInput.getTokens(), [oToken], "The tokenizer should remain untouched");

		// Act
		oToken.setEditable(true);
		oMultiInput._deleteTokens([oToken], {});
		await nextUIUpdate();

		// assert
		assert.ok(oTokenSpy.calledOnce, "Token should be destroyed this time");
		assert.deepEqual(oMultiInput.getTokens(), [], "Tokens aggregation should be empty");

		// Cleanup
		oMultiInput.destroy();
	});

	QUnit.module("IE11", {
		beforeEach : async function() {
			this.multiInput1 = new MultiInput({
				placeholder: 'placeholder',
				tokens:[
					new Token({text: 'token 1'}),
					new Token({text: 'token 2'}),
					new Token({text: 'token 3'})
				]
			});
			this.multiInput1.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.multiInput1.destroy();
		}
	});

	QUnit.skip("keyboard", function(assert) {
		var done = assert.async();

		this.multiInput1.focus();

		this.multiInput1.oninput({
			setMarked: function (vl) {
				this.invalid = vl === "invalid";
			},
			isMarked: function () {
				return this.invalid;
			}
		});

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_LEFT);

		setTimeout(function () {
			assert.strictEqual(this.multiInput1.getTokens().length, 3, 'tokens count is correct');
			done();
		}.bind(this), 1000);
	});

	QUnit.module("Width calculations");

	QUnit.test("_syncInputWidth", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oItem1 = new Item({
				key : "0",
				text : "item 0"
			}),
			oSyncInput = this.spy(MultiInput.prototype, "_syncInputWidth"),
			oMI = new MultiInput({
				suggestionItems: [oItem1]
			});

		oMI.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		assert.strictEqual(oSyncInput.callCount, 2);

		oMI.setSelectionItem(oItem1, true);
		this.clock.tick(1000);

		assert.strictEqual(oSyncInput.callCount, 4);

		oMI.setTokens([]);
		this.clock.tick(1000);

		assert.strictEqual(oSyncInput.callCount, 6);

		oSyncInput.restore();
		oMI.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("Read-only popover is opened after N-more is pressed", async function (assert) {
		//Arrange
		var oMultiInput = new MultiInput({
				editable: true
			}),
			oTokenizer = oMultiInput.getAggregation("tokenizer"),
			oRenderingSpy = this.spy(oMultiInput, "onBeforeRendering"),
			bVisible;

		oMultiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oMultiInput.updateDomValue("123");
		qutils.triggerEvent("input", oMultiInput.getFocusDomRef());
		await nextUIUpdate();

		//Arrange
		var oToken1 = new Token({text: "Token with a very long text content"}),
			oToken2 = new Token({text: "Token with a very long text content"}),
			oToken3 = new Token({text: "Token with a very long text content"}),
			oToken4 = new Token({text: "Token with a very long text content"}),
			oToken5 = new Token({text: "Token with a very long text content"}),
			oToken6 = new Token({text: "Token with a very long text content"});

		//Act
		oRenderingSpy.resetHistory();
		oMultiInput.setTokens([oToken1, oToken2, oToken3, oToken4, oToken5, oToken6]);
		oMultiInput.setEditable(false);
		await nextUIUpdate();

		oTokenizer._handleNMoreIndicatorPress();
		bVisible = oTokenizer._getTokensList().getVisible();

		//Assert
		assert.strictEqual(bVisible, true, "Tokens list is visible");
		assert.strictEqual(oRenderingSpy.callCount, 1, "The rendering should have been called only once");

		//Clean up
		oMultiInput.destroy();
	});

	QUnit.test("Selection of group header", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oModel, aVisibleItems, oGroupHeader,
			aData = [
				{
					name: "A Item 1", key: "a-item-1", group: "A"
				}, {
					name: "A Item 2", key: "a-item-2", group: "A"
				},{
					name: "B Item 1", key: "a-item-1", group: "B"
				},{
					name: "B Item 2", key: "a-item-2", group: "B"
				},{
					name: "Other Item", key: "ab-item-1", group: "A B"
				}
			],
			oMultiInput = new MultiInput({});

		oMultiInput.placeAt("content");

		oModel = new JSONModel();
		oModel.setData(aData);
		oMultiInput.setModel(oModel);

		oMultiInput.bindAggregation("suggestionItems", {
			path: "/",
			sorter: [new Sorter('group', false, true)],
			template: new Item({text: "{name}", key: "{key}"})
		});
		await nextUIUpdate(this.clock);

		// Act
		oMultiInput.onfocusin({target: oMultiInput.getDomRef("inner")}); // for some reason this is not triggered when calling focus via API
		oMultiInput._$input.trigger("focus").val("A").trigger("input");
		this.clock.tick(1000);

		aVisibleItems = oMultiInput._getSuggestionsPopover().getItemsContainer().getItems().filter(function(oItem){
			return oItem.getVisible();
		});
		oGroupHeader = aVisibleItems[0];
		var sInvisibleTextId = oMultiInput._getSuggestionsList().getItems()[0].getId();

		// Assert
		assert.ok(oGroupHeader.isA("sap.m.GroupHeaderListItem"), "The first visible item is a group header");

		// Act
		qutils.triggerKeydown(oMultiInput.getDomRef(), KeyCodes.ARROW_DOWN);

		// Assert
		assert.strictEqual(oMultiInput.getFocusDomRef().getAttribute('aria-activedescendant'), sInvisibleTextId, "Input has aria-activedescendant attribute set");

		// Act
		oGroupHeader.focus();

		// Assert
		assert.strictEqual(document.activeElement, oMultiInput.getFocusDomRef(), "The focus is in the input field");

		// Clean up
		oMultiInput.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.module("One extra long token", {
		beforeEach : async function() {
			this.oMultiInput = new MultiInput({
				width: "200px",
				tokens: [new Token({text: "Extra long token, Extra long token, Extra long token, Extra long token"})]
			});
			this.oMultiInput.placeAt("content");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.oMultiInput.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Token should be truncated initially", function (assert) {
		// Assert
		assert.ok(this.oMultiInput.getAggregation("tokenizer").hasOneTruncatedToken(), "Token is truncated initially.");
	});

	QUnit.test("Token should be truncated on re-rerender", async function (assert) {
		this.oMultiInput.destroyTokens();
		this.oMultiInput.addToken(new Token({
			text: "Extra long token, Extra long token, Extra long token, Extra long token"
		}));

		await nextUIUpdate();

		// Assert
		assert.ok(this.oMultiInput.getAggregation("tokenizer").hasOneTruncatedToken(), "Token is truncated initially.");
	});

	QUnit.test("Should remove truncation on focusin", function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oSpy = this.spy(this.oMultiInput.getAggregation("tokenizer"), "_useCollapsedMode"),
			oMockEvent = {
				target: this.oMultiInput.getFocusDomRef(),
				relatedTarget: this.oMultiInput.getTokens()[0].getDomRef()
			};

		// Act
		this.oMultiInput.onfocusin(oMockEvent);
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.ok(oSpy.calledWith(TokenizerRenderMode.Loose), "Collapsed mode called with 'Loose'");
		assert.ok(!this.oMultiInput.getAggregation("tokenizer").hasOneTruncatedToken(), "Truncation was removed from the token.");
	});

	QUnit.test("Prevent IE default scrolling when one extra long token is focused", async function(assert) {
		// Arrange
		var oTokenizer = this.oMultiInput.getAggregation("tokenizer"),
			aTokens = oTokenizer._getVisibleTokens(),
			oLastToken = aTokens[aTokens.length - 1],
			oSpy = this.spy(oLastToken, "focus");

		// Act
		this.oMultiInput.focus();
		qutils.triggerKeydown(this.oMultiInput.getFocusDomRef(), KeyCodes.ARROW_LEFT);
		await nextUIUpdate();

		// Assert
		assert.ok(oSpy.calledWith({preventScroll: true}), "Focus has been called with preventScroll argument.");
	});

	QUnit.test("Should add truncation when focus leaves the MultiInput", function (assert) {
		var oTokenizer = this.oMultiInput.getAggregation("tokenizer");

		// Mock the tokenizer's check function to pass
		oTokenizer._hasOneTruncatedToken = function () { return true; };

		// Act
		this.oMultiInput.onsapfocusleave({});

		// Assert
		assert.strictEqual(oTokenizer.getRenderMode(), TokenizerRenderMode.Narrow, "Tokenizer will be collapsed after rendering.");
		assert.ok(oTokenizer.getTokens()[0].getTruncated(), true, "The token's property was set correctly.");
	});

	QUnit.test("Should open/close suggestion popover on CTRL + I", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oTokensPopup = this.oMultiInput.getAggregation("tokenizer").getTokensPopup();
		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick + 1);

		// Assert
		assert.ok(oTokensPopup.isOpen(), "Should open suggestion popover");

		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick + 1);

		// Assert
		assert.notOk(oTokensPopup.isOpen(), "Should close suggestion popover");
	});

	QUnit.test("Should open/close suggestion popover on CTRL + I when MultiInput is readonly", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oPopover = this.oMultiInput.getAggregation("tokenizer").getTokensPopup();
		// Arrange
		this.oMultiInput.setEditable(false);
		this.clock.tick();

		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick + 1);

		// Assert
		assert.ok(oPopover.isOpen(), "Should open suggestion popover");

		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick + 1);

		// Assert
		assert.notOk(oPopover.isOpen(), "Should close suggestion popover");
	});

	QUnit.test("Should open/close suggestion popover on CTRL + I when MultiInput is readonly (real case scenario)", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oPopover = this.oMultiInput.getAggregation("tokenizer").getTokensPopup();
		// Arrange
		this.oMultiInput.setEditable(false);
		this.clock.tick();

		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(1000);

		// Assert
		assert.ok(oPopover.isOpen(), "Should open suggestion popover");

		// Act
		this.oMultiInput.onsapescape();
		this.clock.tick(nPopoverAnimationTick + 1);

		// Assert
		assert.notOk(oPopover.isOpen(), "Should close suggestion popover");
	});


	QUnit.test("Should not open suggestion popover on CTRL + I when the input doesn't have tokens", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oMultiInput = new MultiInput();

		oMultiInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		qutils.triggerKeydown(oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick + 1);

		// Assert
		assert.notOk(oMultiInput.getAggregation("tokenizer").getTokensPopup().isOpen(), "Shouldn't open suggestion popover");

		// cleanup
		oMultiInput.destroy();
	});

	QUnit.test("Should not close the picker when input event is marked as invalid.", function (assert) {
		// Arrange
		var oFakeEvent = {
				isMarked: function () { return true; },
				setMarked: function () { return; }
			},
			oSpy = this.spy(this.oMultiInput.getAggregation("tokenizer"), "getTokensPopup");

		// Act
		this.oMultiInput.oninput(oFakeEvent);

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "Should not call getTokensPopup if the event is marked as invalid");
	});

	QUnit.test("Truncation should stay on token click in read only mode", function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		this.oMultiInput.setEditable(false);

		// Act
		this.oMultiInput.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(nPopoverAnimationTick + 1);

		// Assert
		assert.ok(this.oMultiInput.getAggregation("tokenizer").hasOneTruncatedToken(), "The token should be truncated");
	});

	QUnit.module("API");

	QUnit.test("showItems should always set all items list visibility to true", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oMultiInput = new MultiInput({
			width: "200px",
			tokens: [
				new Token({ text: "lorem" }),
				new Token({ text: "ipsum" }),
				new Token({ text: "test" }),
				new Token({ text: "Bulgaria" })
			],
			showSuggestion: true,
			suggestionItems: [
				new Item({ text: "lorem ipsum" })
			]
		});

		oMultiInput.placeAt("content");
		await nextUIUpdate(this.clock);

		oMultiInput.getAggregation("tokenizer")._handleNMoreIndicatorPress();

		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick + 1);

		oMultiInput.showItems();

		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick + 1);

		assert.ok(oMultiInput._getSuggestionsPopover().getItemsContainer().getVisible(), true, "List should be visible");

		oMultiInput.destroy();
		runAllTimersAndRestore(this.clock);
	});


	QUnit.test("a popover instance should always be present, but onsapfocusleave should not throw error even if not", async function (assert) {
		// Arrange
		var oMultiInput = new MultiInput({
			showSuggestion: false
		});
		var oGetPopoverSpy = this.spy(oMultiInput, "_getSuggestionsPopoverPopup");
		var oEventMock = {};
		oMultiInput.placeAt("content");
		await nextUIUpdate();

		// Act
		oMultiInput.focus();
		oMultiInput.onsapfocusleave(oEventMock);

		// Assert
		assert.strictEqual(oGetPopoverSpy.returned(oMultiInput._oSuggestionPopup), true, "A popover instance exists even if no suggestions are present");

		// Cleanup
		oGetPopoverSpy.restore();

		// Arrange
		this.stub(oMultiInput, "_getSuggestionsPopoverPopup").returns(null);

		// Act
		oMultiInput.focus();
		oMultiInput.onsapfocusleave(oEventMock);

		// Assert
		assert.ok(true, "No exception is thrown if popover instance is not present on focusleave");

		// Cleanup
		oMultiInput.destroy();
	});

	QUnit.module("Handling curly braces", {
		beforeEach: async function() {
			this.oMultiInput = new MultiInput();
			this.oMultiInput.placeAt('content');
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oMultiInput.destroy();
			this.oMultiInput = null;
		}
	});

	QUnit.test("Braces in binded text and key properties do not cause error", function(assert) {
		// Arrange
		var oEvent;
		var oItem = {
			getText: function () { return "text with braces {{}}"; },
			getKey: function () { return "keyWithBraces{{}}"; }
		};
		var oStub = this.stub();

		oStub.withArgs("selectedItem").returns(oItem);

		oEvent = {
			getParameter: oStub
		};

		// Act
		this.oMultiInput._onSuggestionItemSelected(oEvent);

		// Assert
		assert.strictEqual(this.oMultiInput.getTokens()[0].getText(), "text with braces {{}}", "Braces are escaped in token's text");
		assert.strictEqual(this.oMultiInput.getTokens()[0].getKey(), "keyWithBraces{{}}", "Braces are escaped in token's key");
	});


	QUnit.module("Tabular");

	QUnit.test("Checks focus after focus out via tab", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oMultiInput = new MultiInput({
			value: "d",
			suggestionColumns: [
				new Column({
					header : new Label({
						text : "City"
					})
				})
			],
			suggestionRows: [
				new ColumnListItem({
					cells: [
						new Label({
							text: "Dryanovo"
						})
					]
				})
			]
		}).placeAt("content");

		var oDummyBtn = new Button().placeAt("content");

		await nextUIUpdate(this.clock);

		// show suggestions
		oMultiInput._openSuggestionsPopover();
		this.clock.tick();

		// arrow down
		qutils.triggerKeydown(oMultiInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(300);
		await nextUIUpdate(this.clock);

		oDummyBtn.focus();
		this.clock.tick();
		await nextUIUpdate(this.clock);

		assert.notOk(oMultiInput.hasStyleClass("sapMFocus"), "Input should not have focus class");

		oMultiInput.destroy();
		oDummyBtn.destroy();
		runAllTimersAndRestore(this.clock);
	});
});