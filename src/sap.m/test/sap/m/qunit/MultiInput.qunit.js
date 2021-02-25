/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/MultiInput",
	"sap/m/Token",
	"sap/m/Popover",
	"sap/m/Tokenizer",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Column",
	"sap/m/Table",
	"sap/m/List",
	"sap/ui/core/Item",
	"sap/ui/events/KeyCodes",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/m/Input",
	"sap/m/InputBase",
	"sap/ui/core/ListItem",
	"sap/m/StandardListItem",
	"sap/ui/core/library",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/base/Event",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Core",
	"sap/ui/model/Sorter",
	"sap/m/library"
], function(
	qutils,
	createAndAppendDiv,
	MultiInput,
	Token,
	Popover,
	Tokenizer,
	ColumnListItem,
	Label,
	Column,
	Table,
	List,
	Item,
	KeyCodes,
	EventExtension,
	Device,
	JSONModel,
	jQuery,
	Input,
	InputBase,
	ListItem,
	StandardListItem,
	coreLibrary,
	containsOrEquals,
	Event,
	InvisibleText,
	Core,
	Sorter,
	Library
) {
	createAndAppendDiv("content");


	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	var oResourceBundle = Core.getLibraryResourceBundle("sap.m");
	var nPopoverAnimationTick = 300;
	var TokenizerRenderMode = Library.TokenizerRenderMode;

	QUnit.module("Basic", {
		beforeEach : function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			Core.applyChanges();
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

	QUnit.test("insertToken aggregation", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "insertToken");
		Core.applyChanges();

		this.multiInput1.insertToken(new Token({text: "Token1"}), 0);

		// assert
		assert.ok(oSpy.called, "Tokenizer's insertToken method is called");
		assert.equal(this.multiInput1.getTokens().length, 1, "then the MultiInput contains 1 tokens");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("destroyTokens() called upon the tokens aggregation must update the MultiInput CSS classes", function(assert) {
		// Arrange
		var oToken1 = new Token(),
			oToken2 = new Token(),
			oToken3 = new Token(),
			oInvalidationSpy;

		// Act
		this.multiInput1.setTokens([oToken1, oToken2, oToken3]);
		Core.applyChanges();

		oInvalidationSpy = this.spy(this.multiInput1, "onBeforeRendering");
		this.multiInput1.destroyTokens();
		Core.applyChanges();

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

	QUnit.test("max tokens", function(assert) {
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();

		this.multiInput1.setMaxTokens(2);
		this.multiInput1.setTokens([token1, token2, token3]);
		Core.applyChanges();

		var aVisibleTokens = this.multiInput1.getTokens().filter(function (oToken) {
			return oToken.getVisible();
		});

		assert.equal(aVisibleTokens.length, 2, "no more than 2 tokens can be added");
	});

	QUnit.test("_calculateSpaceForTokenizer", function(assert) {
		var multiInput = new MultiInput({
			width: "500px"
		});

		multiInput.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(multiInput._calculateSpaceForTokenizer(), "398px", "_calculateSpaceForTokenizer returns a correct px value");

		multiInput.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer for MultiInput with description", function(assert) {
		var multiInput = new MultiInput({
			width: "500px",
			description: "Unit"
		});

		multiInput.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(multiInput._calculateSpaceForTokenizer(), "148px", "_calculateSpaceForTokenizer returns a correct px value");

		multiInput.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer with null DOM element reference", function(assert) {
		var multiInput = new MultiInput(),
			output;

		multiInput.placeAt("qunit-fixture");
		Core.applyChanges();

		multiInput.$().find(".sapMMultiInputInputContainer").removeClass("sapMMultiInputInputContainer");
		Core.applyChanges();

		output = multiInput._calculateSpaceForTokenizer();

		assert.strictEqual(isNaN(parseInt(output)), false, "_calculateSpaceForTokenizer returns a valid value");

		multiInput.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer with negative tokenizer space", function(assert) {
		var multiInput = new MultiInput({
			width: "30px",
			description: "Unit"
		});

		multiInput.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(multiInput._calculateSpaceForTokenizer(), "0px", "_calculateSpaceForTokenizer returns a non negative value");

		multiInput.destroy();
	});

	QUnit.test("token data binding", function(assert) {
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

		// set the model to the core
		Core.setModel(oModel);

		// define the template
		var oItemTemplate = new ColumnListItem({
			cells : [
				new Label({
					text: "{lastName}"
				}),
				new MultiInput({
					tokens:[
						new Token({text:"{lastName}", key:"{lastName}"}),
						new Token({text:"{gender}", key:"{gender}"})
					]
				})
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
		oTable.bindItems("/modelData", oItemTemplate);
		oTable.placeAt("qunit-fixture");

		Core.applyChanges();

		var oMultiInput1 = oTable.getItems()[0].getCells()[1];
		assert.equal(oMultiInput1.getTokens()[0].$().text(), "Doe", "text of token is correct");
		assert.equal(oMultiInput1.getTokens()[1].$().text(), "Male", "text of token is correct");

		var oMultiInput2 = oTable.getItems()[1].getCells()[1];
		assert.equal(oMultiInput2.getTokens()[0].$().text(), "Ali", "text of token is correct");
		assert.equal(oMultiInput2.getTokens()[1].$().text(), "Female", "text of token is correct");

		oTable.destroy();
	});

	QUnit.test("data binding when tokens have changed", function(assert) {
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

		Core.applyChanges();

		var firstToken = this.multiInput1.getTokens()[0];
		firstToken.setSelected(true);

		Core.applyChanges();

		qutils.triggerKeydown(firstToken.$(), KeyCodes.BACKSPACE);
		Core.applyChanges();

		// assert
		assert.equal(this.multiInput1.getTokens().length, 3, "MultiInput has only 3 tokens");

		// act
		model.setData(newData);

		Core.applyChanges();

		// assert
		assert.equal(this.multiInput1.getTokens().length, 4, "MultiInput has 4 tokens");
		assert.equal(this.multiInput1.getTokens()[0].getText(), "Arnold", "The data binding has been applied properly");
	});


	QUnit.test("tabindex of tokenizer in MultiInput", function(assert) {
		assert.equal(!this.multiInput1.$().find(".sapMTokenizer").attr("tabindex"), true, "tokenizer has no tabindex if it is in MultiInput");
	});

	QUnit.test("test setEditable=false MultiInput with editable tokens", function(assert) {
		var aFirstToken,
			aSecondToken;
		//arrange
		this.multiInput1.setTokens([
			new Token({text: "Token 1", key: "0001"}),
			new Token({text: "Token 2", key: "0002", editable: false})
		]);

		aFirstToken = this.multiInput1.getTokens()[0];
		aSecondToken = this.multiInput1.getTokens()[1];
		Core.applyChanges();

		//assert
		assert.equal(aFirstToken.$('icon').css('display'), 'inline-block', 'First token icon is visible');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');

		//act
		this.multiInput1.setEditable(false);
		Core.applyChanges();

		//assert
		assert.equal(aFirstToken.$('icon').css('display'), 'none', 'First token icon is invisible');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');
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
		var aTokens = this.multiInput1.getTokens();
		assert.equal(aTokens.length, 1, "MultiInput contains 1 token");
		assert.equal(aTokens[0].getText(), testTokenText, "Token text == " + testTokenText);

		this.multiInput1.setValue(testTokenText);
		//act
		this.multiInput1.onsapfocusleave({});

		//assert
		var aTokens = this.multiInput1.getTokens();
		assert.equal(aTokens.length, 1, "MultiInput contains still contains 1 token, duplicate token was not added");

		this.multiInput1.setValue("B-Item");
		//act
		this.multiInput1.onsapfocusleave({});

		//assert
		var aTokens = this.multiInput1.getTokens();
		assert.equal(aTokens.length, 2, "MultiInput contains contains 2 token");

	});

	QUnit.test("Token should invalidate the MultiInput when its text is updated by the binding", function(assert) {
		// Arrange
		var oInvalidateSpy = sinon.spy(this.multiInput1, "invalidate");
		var oToken = new Token({
			text: "{/text}"
		});
		var oData = {
			text: ""
		};
		var oJSONModel = new JSONModel(oData);

		this.multiInput1.setModel(oJSONModel);
		this.multiInput1.addToken(oToken);
		Core.applyChanges();

		oInvalidateSpy.reset();

		// Act
		oJSONModel.setProperty("/text", "test");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oInvalidateSpy.callCount, 1, "MultiInput was invalidated once.");
		assert.strictEqual(oToken.getText(), "test", "Token's text property was updated.");

		// Clean
		oJSONModel.destroy();
	});

	QUnit.test("Adding a token, should attach the invalidate event handler function.", function(assert) {
		// Arrange
		var oToken = new Token({
			text: "test"
		});
		var oAttachEventSpy = sinon.spy(oToken, "attachEvent");

		// Act
		this.multiInput1.addToken(oToken);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oAttachEventSpy.callCount, 1, "Attach event was called once");
		assert.strictEqual(oAttachEventSpy.firstCall.args[0], "_change", "Attach event was called for the right event.");
		assert.strictEqual(oAttachEventSpy.firstCall.args[2].getId(), this.multiInput1.getId(), "Attach event was called with the right context.");
	});

	QUnit.test("Removing a token, should detach the invalidate event handler function.", function(assert) {
		// Arrange
		var oToken = new Token({
			text: "test"
		});
		var oDetachEventSpy = sinon.spy(oToken, "detachEvent");

		this.multiInput1.addToken(oToken);
		Core.applyChanges();

		// Act
		this.multiInput1.removeToken(oToken);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oDetachEventSpy.callCount, 1, "Detach event was called once");
		assert.strictEqual(oDetachEventSpy.firstCall.args[0], "_change", "Detach event was called for the right event.");
		assert.strictEqual(oDetachEventSpy.firstCall.args[2].getId(), this.multiInput1.getId(), "Detach event was called with the right context.");
	});

	QUnit.module("Validation", {
		beforeEach: function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			Core.applyChanges();
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
		this.multiInput1.removeAllValidators();
		this.multiInput1.addValidator(function(args) {
			fAsyncValidateCallback = args.asyncCallback;
			return MultiInput.WaitForAsyncValidation;
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

	QUnit.test("validation via suggestion items", function(assert) {
		var i,
			AasciiCode = 65; // A == 65 in ASCII

		for (i = 0; i < 10; i++) {
			this.multiInput1.addSuggestionItem(new Item({ text : String.fromCharCode(i + AasciiCode) + "-Item"}));
		}

		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		this.multiInput1.setValue("a");
		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };
		this.multiInput1.onsapenter();

		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token, added via suggest");

		this.multiInput1.setValue("B");
		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };
		this.multiInput1.onsapenter();

		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, added via suggest ");

		this.multiInput1.setValue("C");
		this.multiInput1._getIsSuggestionPopupOpen = function(){ return false; };
		this.multiInput1.onsapenter();

		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, no token added, suggestion list was closed");

		this.multiInput1.setValue("Z");
		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };
		this.multiInput1.onsapenter();

		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, no token added, value does not fit suggestion list");
	});

	QUnit.test("validate tokens using validator callback", function(assert) {
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		this.multiInput1.removeAllValidators();
		this.multiInput1.addValidator(function(args){
			return new Token({text: args.text});
		});

		var tokenText = "TestToken1";
		this.multiInput1.setValue(tokenText);
		this.multiInput1.onsapenter();
		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token");
		assert.equal(this.multiInput1.getTokens()[0].getText(), tokenText, "added token contains validated text");

		var tokenText = "TestToken2";
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
		this.multiInput1.removeAllValidators();
		this.multiInput1.addValidator(function(args){
			fAsyncValidateCallback = args.asyncCallback;
			return MultiInput.WaitForAsyncValidation;
		});
		tokenText = "TestToken4";
		this.multiInput1.setValue(tokenText);
		this.multiInput1.onsapenter();

		assert.equal(this.multiInput1.getTokens().length, 2, "MultiInput contains 2 tokens, no token added as validator runs asynchronously");

		fAsyncValidateCallback(new Token({text: "dummy"}));

		assert.equal(this.multiInput1.getTokens().length, 3, "MultiInput contains 3 tokens");
	});

	QUnit.test("do not duplicate tokens on sapfocusleave when using custom validator", function(assert) {
		var aItems = [
			new sap.ui.core.Item("itemId", {
				key: "1",
				text: "Token 1"
			}),
			new sap.ui.core.Item({
				key: "2",
				text: "Token 2"
			}),
			new sap.ui.core.Item({
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
			return new sap.m.Token({ text: args.text });
		});

		Core.applyChanges();

		// Act
		this.multiInput1.setValue("Token 1");
		this.multiInput1.onsapfocusleave(oMockEvent);
		this.multiInput1._onSuggestionItemSelected(oMockItem);

		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token");
	});

	QUnit.test("removeValidator", function(assert) {

		var oSpy = sinon.spy(this.multiInput1, "removeValidator"),
			oValidator = function(args){
				return new Token({text: args.text});
			};

		this.multiInput1.addValidator(oValidator);

		Core.applyChanges();
		this.multiInput1.removeValidator(oValidator);
		// assert
		assert.strictEqual(this.multiInput1._aTokenValidators.length, 0 , "then the MultiInput has no validators");
		assert.ok(oSpy.called, "MultiInput's removeValidator is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.module("KeyboardEvents", {
		beforeEach : function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			Core.applyChanges();

			this.multiInput1.focus();
		},
		afterEach : function() {
			this.multiInput1.destroy();
		}
	});

	QUnit.test("delete tokens via backspace", function(assert) {
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		var token1 = new Token();
		this.multiInput1.addToken(token1);
		Core.applyChanges();

		this.multiInput1.focus();
		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.BACKSPACE);
		Core.applyChanges();

		assert.notOk(token1.getSelected(), "Token got selected");
		assert.strictEqual(token1.getId(), document.activeElement.id ,"Token got focused");

		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);

		assert.equal(this.multiInput1.getTokens().length, 0, "Token got deleted");
	});

	QUnit.test("delete tokens via backspace and prevent default", function(assert) {

		this.multiInput1.attachTokenUpdate(function (evt) {
			evt.preventDefault();
		});

		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		var token1 = new Token();
		this.multiInput1.addToken(token1);

		Core.applyChanges();

		this.multiInput1.focus();
		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.BACKSPACE);
		Core.applyChanges();

		assert.strictEqual(token1.getId(), document.activeElement.id ,"Token got focused");

		this.multiInput1.onsapbackspace({preventDefault:function(){}, stopPropagation:function(){},
			isMarked: function(){}, setMarked:function(){}});
		assert.equal(this.multiInput1.getTokens().length, 1, "Token is not deleted");
	});

	QUnit.test("Get custom data from deleted tokens", function (assert) {
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
			}
		});

		oMI.placeAt("qunit-fixture");
		Core.applyChanges();

		oToken.fireDelete({
			byKeyboard: false,
			backspace: false
		});
		Core.applyChanges();

		oMI.destroy();
	});

	QUnit.test("test keyboard navigation", function(assert){
		var token = new Token({selected: true}),
			that = this;
		this.multiInput1.addToken(token);

		Core.applyChanges();
		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token");

		this.multiInput1.focus();

		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ARROW_LEFT);
		Core.applyChanges();

		qutils.triggerKeydown(document.activeElement, KeyCodes.DELETE);
		Core.applyChanges();

		Core.applyChanges();
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		token = new Token({selected: false});
		this.multiInput1.addToken(token);

		Core.applyChanges();

		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };

		this.multiInput1.onsapprevious(new jQuery.Event("onsapprevious", {srcControl: that.multiInput1}));
		assert.equal(token.getSelected(), false, "Token not selected because popup is open");

		this.multiInput1._getIsSuggestionPopupOpen = function(){return false;};
		this.multiInput1.onsapprevious(new jQuery.Event("onsapprevious", {srcControl: that.multiInput1}));
		assert.strictEqual(token.getId(), document.activeElement.id ,"Token got focused");
	});

	QUnit.test("test remove via live change", function(assert) {
		var token1 = new Token({selected:true});
		var token2 = new Token({selected:true});
		var token3 = new Token({selected:true});
		this.multiInput1.setTokens([token1, token2, token3]);
		Core.applyChanges();

		this.multiInput1.fireLiveChange();

		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");
	});

	QUnit.test("keyboard - ctrl + A with focused token", function(assert) {
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();
		this.multiInput1.setTokens([token1, token2, token3]);

		Core.applyChanges();

		qutils.triggerKeydown(token1.$(), KeyCodes.A, false, false, true); // trigger Control key + A
		assert.equal(token1.getSelected(), true, "Token1 got selected using ctrl+a");
		assert.equal(token2.getSelected(), true, "Token2 got selected using ctrl+a");
		assert.equal(token3.getSelected(), true, "Token3 got selected using ctrl+a");
	});

	QUnit.test("keyboard - ctrl + A with text", function(assert) {
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

	QUnit.test("onsaphome", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsaphome"),
			token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		Core.applyChanges();

		this.multiInput1.getTokens()[0].focus();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.HOME);

		// assert
		assert.ok(oSpy.called, "Tokenizer's onsaphome is called when a token is focused");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsaphome when the input value is empty", function(assert) {
		var token1 = new Token({text: "Token 1"}),
			token2 = new Token({text: "Token 2"});

		this.multiInput1.setTokens([token1, token2]);
		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(token1.getDomRef().id, document.activeElement.id,
			"The first token in the multiinput is focused.");

	});

	QUnit.test("onsaphome when the input has text value", function(assert) {
		var focusRef = this.multiInput1.getFocusDomRef(),
			token1 = new Token({text: "Token 1"}),
			token2 = new Token({text: "Token 2"});

		this.multiInput1.setTokens([token1, token2]);
		this.multiInput1.setValue("text123");
		Core.applyChanges();

		this.multiInput1.focus();
		this.multiInput1._$input[0].setSelectionRange(1, 7);
		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.HOME);
		Core.applyChanges();

		// assert
		assert.strictEqual(focusRef.id, document.activeElement.id,
			"The focus stays in the input.");

	});

	QUnit.test("onsapprevious when MultiInput has no value", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsapprevious"),
				token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		Core.applyChanges();

		this.multiInput1.getTokens()[0].focus();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_LEFT);

		// assert
		assert.ok(oSpy.called, "Tokenizer's onsapprevious is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapprevious when MultiInput has value and focus is on input", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsapprevious"),
			token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		this.multiInput1.setValue("text");
		this.multiInput1.addValidator(function (args) {
			return new Token({text: args.text, key: args.text});
		});

		this.multiInput1._$input.trigger("focus");
		this.multiInput1._$input[0].setSelectionRange(3, 3);

		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_LEFT);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapprevious is not called");
		assert.strictEqual(this.multiInput1.getTokens().length, 1,
			"No token is added after navigation.");

		// cleanup
		oSpy.restore();
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

	QUnit.test("onsapdelete", function(assert) {
		this.multiInput1.setValue("text123");
		this.multiInput1.setTokens([new Token()]);
		Core.applyChanges();

		this.multiInput1.focus();
		Core.applyChanges();
		this.multiInput1._$input[0].setSelectionRange(2, 3);
		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);
		Core.applyChanges();

		// assert
		assert.strictEqual(this.multiInput1.getTokens().length, 1, "No token was deleted");
	});

	QUnit.test("onsapdelete with selected tokens and focusable tokens", function(assert) {
		var token1 = new Token({text: "Token 1", selected: true}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3"});

		this.multiInput1.setTokens([token1, token2, token3]);
		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getAggregation("tokenizer").getDomRef(), KeyCodes.DELETE);
		Core.applyChanges();

		// assert
		assert.strictEqual(document.activeElement, token3.getDomRef(),
			"The focus is forwarded to the input field.");
	});

	QUnit.test("onsapdelete with selected tokens and no focusable tokens", function(assert) {
		var token1 = new Token({text: "Token 1"}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3", selected: true});

		this.multiInput1.setTokens([token1, token2, token3]);
		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getAggregation("tokenizer").getDomRef(), KeyCodes.DELETE);
		Core.applyChanges();

		// assert
		assert.strictEqual(document.activeElement, this.multiInput1.getFocusDomRef(),
			"The focus is forwarded to the input field.");
	});

	QUnit.test("onsapbackspace with selected tokens and focusable tokens", function(assert) {
		var token1 = new Token({text: "Token 1"}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3", selected: true});

		this.multiInput1.setTokens([token1, token2, token3]);
		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getAggregation("tokenizer").getDomRef(), KeyCodes.BACKSPACE);

		// assert
		assert.strictEqual(document.activeElement, token1.getDomRef(),
			"The focus is forwarded to the input field.");
	});

	QUnit.test("onsapbackspace with selected tokens and no focusable tokens", function(assert) {
		var token1 = new Token({text: "Token 1", selected: true}),
			token2 = new Token({text: "Token 2", selected: true}),
			token3 = new Token({text: "Token 3"});

		this.multiInput1.setTokens([token1, token2, token3]);
		Core.applyChanges();

		qutils.triggerKeydown(this.multiInput1.getAggregation("tokenizer").getDomRef(), KeyCodes.BACKSPACE);
		Core.applyChanges();

		// assert
		assert.strictEqual(document.activeElement, this.multiInput1.getFocusDomRef(),
			"The focus is forwarded to the input field.");
	});

	QUnit.test("backspace should delete token and fire tokenUpdate", function (assert) {
		var oFirstToken = new Token({ text: "Token 1"});
		var oMI = new MultiInput({
			tokens: [
				oFirstToken,
				new Token({ text: "Token 2"}),
				new Token({ text: "Token 3"})
			]
		}).placeAt("content");

		Core.applyChanges();

		var oSpy = this.spy(oMI, "fireTokenUpdate");

		oMI.focus();

		// focus last token
		qutils.triggerKeydown(oMI.getDomRef(), KeyCodes.BACKSPACE);
		Core.applyChanges();

		// delete last token
		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);
		Core.applyChanges();

		assert.strictEqual(oMI.getTokens().length, 2, "One Token should be deleted");
		assert.ok(oSpy.called, "Fire Token Update is called");

		oMI.destroy();
	});

	QUnit.test("Backspace should not delete token and fire tokenUpdate when not editable", function (assert) {
		// Arrange
		var oMI = new MultiInput({
			editable: false,
			tokens: [
				new Token({ text: "Token 1"}),
				new Token({ text: "Token 2"}),
				new Token({ text: "Token 3"})
			]
		}).placeAt("content");
		Core.applyChanges();

		var oSpy = this.spy(oMI, "fireTokenUpdate");

		// Act
		oMI.focus();

		// focus last token
		qutils.triggerKeydown(oMI.getDomRef(), KeyCodes.BACKSPACE);
		Core.applyChanges();

		// delete last token
		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oMI.getTokens().length, 3, "None tokens should be deleted.");
		assert.notOk(oSpy.called, "Fire Token Update should not be called.");

		// Clean up
		oMI.destroy();
	});

	QUnit.test("backspace should delete token and fire tokenUpdate", function (assert) {
		var oFirstToken = new Token({ text: "Token 1"});
		var oMI = new MultiInput({
			tokens: [
				oFirstToken,
				new Token({ text: "Token 2"}),
				new Token({ text: "Token 3"})
			]
		}).placeAt("content");

		Core.applyChanges();

		var oSpy = this.spy(oMI, "fireTokenUpdate");

		oMI.focus();

		// focus last token
		qutils.triggerKeydown(oMI.getDomRef(), KeyCodes.BACKSPACE);
		Core.applyChanges();

		// delete last token
		qutils.triggerKeydown(document.activeElement, KeyCodes.DELETE);
		Core.applyChanges();

		assert.ok(oMI.getTokens().length, 2, "One Token should be deleted");
		assert.ok(oSpy.called, "Fire Token Update is called");

		oMI.destroy();
	});

	QUnit.test("onsapdelete when MultiInput has value", function(assert) {
		var oSpy = sinon.spy(Tokenizer.prototype, "onsapdelete");
		this.multiInput1.setValue("value");

		Core.applyChanges();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapdelete is not called");
		assert.equal(this.multiInput1.onsapdelete(), undefined, "then onsapdelete returns undefined");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapnext when a token is focused", function(assert) {

		var oTokenizerSpy = sinon.spy(Tokenizer.prototype, "scrollToEnd");

		this.multiInput1.addToken(new Token({}));

		Core.applyChanges();

		this.multiInput1.getTokens()[0].focus();

		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ARROW_RIGHT, false, false, false);

		// assert
		assert.ok(oTokenizerSpy.called, "Tokenizer's scrollToEnd is called");
		assert.strictEqual(this.multiInput1._$input[0].id, document.activeElement.id,
			"The first token in the multiinput is focused.");

		// cleanup
		oTokenizerSpy.restore();
	});

	QUnit.test("onsapnext when MultiInput in not editable", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsapdelete");
		this.multiInput1.setEditable(false);
		Core.applyChanges();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapdelete is not called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapright", function(assert) {
		// Arrange
		this.multiInput1.setTokens([
			new Token({text:"A"}),
			new Token({text:"B"}),
			new Token({text:"C"})
		]);
		this.multiInput1.addValidator(function (args) {
			return new Token({text: args.text, key: args.text});
		});
		Core.applyChanges();

		// Act
		// create new token by user input
		var oFakeKeydown = jQuery.Event("keydown", { which: KeyCodes.D });
		this.multiInput1._$input.trigger("focus").trigger(oFakeKeydown).val("D").trigger("input");
		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ENTER);
		Core.applyChanges();

		// move to previous token and than back to the newly added
		this.multiInput1.getTokens()[3].focus();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_LEFT);
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_RIGHT);

		// Assert
		assert.strictEqual(this.multiInput1.getTokens().length, 4, "4 tokens");
	});

	QUnit.skip("onsapenter on mobile device", function (assert) {
		// Setup
		var oMI, sValue, oPickerTextFieldDomRef, sOpenState;

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		oMI = new MultiInput({
			change: function (oEvent) {
				sValue = oEvent.getParameter("value");
			}
		}).placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		oMI._getSuggestionsPopoverPopup().open();
		this.clock.tick(1000);

		// Assert
		assert.ok(oMI._getSuggestionsPopoverPopup().isOpen(), "The dialog is opened");

		// Act
		oPickerTextFieldDomRef = oMI._getSuggestionsPopoverInstance().getInput().getFocusDomRef();

		sap.ui.test.qunit.triggerCharacterInput(oPickerTextFieldDomRef, "test");
		qutils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);

		sOpenState = oMI._getSuggestionsPopoverPopup().oPopup.getOpenState();

		// Assert
		assert.strictEqual(sOpenState === OpenState.CLOSED || sOpenState === OpenState.CLOSING, true, "The dialog is still open after enter key");
		assert.strictEqual(sValue, 'test', "The change event is triggered and the right value is passed");

		// Cleanup
		oMI._getSuggestionsPopoverPopup().close();
		oMI.destroy();
	});

	QUnit.skip("oninput on mobile device", function (assert) {

		// Setup
		var oMI, oSpy;

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		oMI = new MultiInput({
			suggestionItems : [
				new sap.ui.core.Item({
					text : 'Damage',
					key : 'damage'
				}),
				new sap.ui.core.Item({
					text : 'another Damage',
					key : 'damage'
				}),
				new sap.ui.core.Item({
					text : 'demon',
					key : 'demon'
				})
			]
		}).placeAt( "qunit-fixture");
		oMI.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		Core.applyChanges();
		oSpy = sinon.spy(oMI.getAggregation("tokenizer"), "_togglePopup");

		oMI.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(1);

		// Assert
		assert.ok(oSpy.called, "_togglePopup is called when N-more is pressed");

		// Act
		sap.ui.test.qunit.triggerCharacterInput(oMI._getSuggestionsPopoverInstance().getInput().getFocusDomRef(), "d");
		qutils.triggerEvent("input", oMI._getSuggestionsPopoverInstance().getInput().getFocusDomRef());
		this.clock.tick(100);

		// Assert
		assert.ok(oMI._getSuggestionsList(), "Suggestions list is shown on input");

		// Cleanup
		oSpy.restore();
		oMI.destroy();
	});

	QUnit.test("mobile - clear input value after selection a suggestion", function (assert) {

		// Setup
		var oMI;

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		oMI = new MultiInput({
			suggestionItems : [
				new sap.ui.core.Item({
					text : 'Diamond',
					key : 'diamond'
				}),
				new sap.ui.core.Item({
					text : 'Graphite',
					key : 'graphite'
				})
			]
		}).placeAt( "qunit-fixture");
		Core.applyChanges();

		oMI._getSuggestionsPopoverPopup().open();
		oMI.setSelectionItem(oMI.getSuggestionItems()[0]);
		Core.applyChanges();

		// assert
		assert.strictEqual(oMI._getSuggestionsPopoverInstance().getInput().getValue(), "", "The dialog's input is cleared.");

		// clean up
		oMI.destroy();
	});

	QUnit.test("onBeforeOpen should call _manageListsVisibility with the correct parameter", function (assert) {
		var oFakeEvent = {
			target: {id: null}, isMarked: function () {
			}
		};

		// Setup
		var oMI, oMultiInput1, oSpy, oSpy1;

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// Arrange
		oMI = new MultiInput({
			suggestionItems : [
				new sap.ui.core.Item({
					text : 'Damage',
					key : 'damage'
				}),
				new sap.ui.core.Item({
					text : 'another Damage',
					key : 'damage'
				}),
				new sap.ui.core.Item({
					text : 'demon',
					key : 'demon'
				})
			]
		}).placeAt( "qunit-fixture");
		oMI.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		Core.applyChanges();

		oSpy = sinon.spy(oMI, "_manageListsVisibility");

		oMultiInput1 = new MultiInput({
			showValueHelp: true,
			valueHelpOnly: true
		});
		oMultiInput1.placeAt("content");
		Core.applyChanges();

		// Act
		oMI.ontap(oFakeEvent);
		this.clock.tick(1);

		// Assert
		assert.ok(oSpy.called, "_manageListsVisibility is called");
		assert.ok(oSpy.calledWith(true), "Selected items list is visible.");

		// Act
		oMI._getSuggestionsPopoverPopup().close();
		oSpy.restore();

		oSpy1 = sinon.spy(oMultiInput1, "_manageListsVisibility");
		oMultiInput1.ontap(oFakeEvent);

		// Assert
		assert.ok(oSpy1.called, "_manageListsVisibility is called");
		assert.ok(oSpy1.calledWith(false), "Suggestions list is visible.");

		// Cleanup
		oSpy.restore();
		oSpy1.restore();
		oMI.destroy();
		oMultiInput1.destroy();
	});

	QUnit.skip("Picker should be correctly updated according to the interaction",  function(assert) {
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
		Core.applyChanges();

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
		Core.applyChanges();

		// Assert
		assert.notOk(oMultiInput._oSuggestionPopup.isOpen(), "Suggestions should not be visible");
		assert.ok(oTokenizer.getTokensPopup().isOpen(), "Suggestions should be visible");

		// Act
		oTokenizer.getTokensPopup().close();
		Core.applyChanges();

		oMultiInput.onfocusin({target: oMultiInput.getDomRef("inner")});
		this.clock.tick(1000);

		// Assert
		assert.ok(oMultiInput._oSuggestionPopup.getContent()[0].getVisible(), "Suggestions are visible");

		// Clean up
		oMultiInput.destroy();
	});

	QUnit.test("Deleting a token from tokenizer popup should keep popup open", function (assert) {
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

		Core.applyChanges();

		oMI.getAggregation("tokenizer")._handleNMoreIndicatorPress();

		oMI._deleteTokens([oToken1], {});
		Core.applyChanges();

		assert.strictEqual(document.activeElement, oMI.getFocusDomRef(), "Multi Input should be focused");
		assert.ok(oTokenizerPopover.isOpen(), "Popover should be open");

		var oSpy = this.spy(oTokenizerPopover, "close");

		oMI._deleteTokens([oToken2, oToken3], {});
		Core.applyChanges();

		assert.strictEqual(document.activeElement, oMI.getFocusDomRef(), "Multi Input should be focused");
		assert.ok(oSpy.called, "Popover should be closed");
	});

	QUnit.test("Add tokens on mobile", function(assert) {
		// system under test
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		var oMultiInput = new MultiInput({
			enableMultiLineMode: true,
			filterSuggests: false,
			showSuggestion: true,
			showValueHelp: true
		}).placeAt("qunit-fixture");

		oMultiInput.addValidator(function(args){
			var text = args.text;

			return new Token({text: text});
		});
		Core.applyChanges();

		// Act
		oMultiInput._openSuggestionsPopover({});
		oMultiInput._getSuggestionsPopoverInstance().getInput().focus();
		oMultiInput._getSuggestionsPopoverInstance().getInput().updateDomValue("123");
		qutils.triggerKeydown(oMultiInput._getSuggestionsPopoverInstance().getInput().getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(oMultiInput.getAggregation("tokenizer").getTokens().length, 1, "Just a single token gets created");

		// Cleanup
		oMultiInput.destroy();
	});

	QUnit.test("arrow left / top should not throw an error when there are no suggestions", function (assert) {
		var oMI = new MultiInput({
			showSuggestion: false
		});

		oMI.placeAt("qunit-fixture");
		Core.applyChanges();

		oMI.getFocusDomRef().focus();
		qutils.triggerKeydown(oMI.getFocusDomRef(), KeyCodes.ARROW_LEFT);
		this.clock.tick(nPopoverAnimationTick);

		assert.ok(true, "No error has been thrown");

		oMI.getFocusDomRef().focus();
		qutils.triggerKeydown(oMI.getFocusDomRef(), KeyCodes.HOME);

		assert.ok(true, "No error has been thrown");

		oMI.destroy();
	});

	QUnit.module("Events", {
		beforeEach: function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			Core.applyChanges();
		},
		afterEach: function() {
			this.multiInput1.destroy();
		}
	});

	QUnit.test("tokens change event", function(assert) {
		var eventType;
		this.multiInput1.attachTokenChange(function(args){
			eventType = args.getParameter("type");
		});

		var token1 = new Token();
		this.multiInput1.addToken(token1);
		Core.applyChanges();

		assert.equal(eventType, MultiInput.TokenChangeType.Added, "added event raised");

		this.multiInput1.removeToken(token1);
		Core.applyChanges();

		this.multiInput1.removeAllTokens();
		Core.applyChanges();

		assert.equal(eventType, MultiInput.TokenChangeType.RemovedAll, "removedAll event raised");
	});

	QUnit.test("tokenUpdate event", function(assert) {
		var oTokenizer = this.multiInput1.getAggregation("tokenizer"),
			eventType,
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

	QUnit.test("token update event", function(assert) {
		/* TODO remove after the end of support for Internet Explorer */
		if (!Device.browser.internet_explorer) {
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
			Core.applyChanges();

			//assert
			assert.equal(counter, 1, "tokenUpdate event should be fired once");
			assert.equal(this.multiInput1.getTokens().length, 6, "6 tokens should be added to MultiInput");
		} else {
			assert.expect(0);
		}
	});

	QUnit.test("token update event on paste of a single string", function(assert) {

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
			Core.applyChanges();

			//assert
			assert.equal(counter, 0, "tokenUpdate event should not be fired");
			assert.equal(this.multiInput1.getTokens().length, 0, "no token should be created");
	});

	QUnit.test("token update event", function(assert) {
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

	QUnit.test("click on delete icon should not trigger Input.prototype.ontap", function(assert) {
		var oDeleteIcon,
			spy = sinon.spy(Input.prototype, "ontap"),
			token1 = new Token();

		this.multiInput1.addToken(token1);
		this.multiInput1.attachTokenUpdate(function(evt){
			evt.preventDefault();
		});

		Core.applyChanges();

		oDeleteIcon = token1.getAggregation("deleteIcon");
		qutils.triggerEvent("tap", oDeleteIcon.getDomRef());

		// assert
		assert.notOk(spy.called, "Input's ontap method is not called");
	});

	QUnit.test("Change event is properly fired on different interactions", function (assert) {
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
		Core.applyChanges();

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
		Core.applyChanges();

		//Assert
		assert.ok(oChangeFireSpy.calledTwice, "Change is fired");
		assert.ok(oValidatorSpy.calledTwice, "Validator is fired");
		assert.ok(oChangeFireSpy.calledBefore(oValidatorSpy), "fireChange is fired before Validator");
	});


	QUnit.test("Enter event, should not be marked, when there are no modifications", function (assert) {
		// Setup
		var oEnterSpy = this.spy(this.multiInput1, "onsapenter");

		// Act
		this.multiInput1.focus();
		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ENTER);
		Core.applyChanges();

		// Assert
		assert.notOk(oEnterSpy.args[0][0].isMarked());

		// Cleanup
		oEnterSpy.restore();
	});

	QUnit.test("Selecting an item should not leave a text in the input", function (assert) {
		// arrange
		var oItem = new ListItem({
			key: '1',
			text: '1 Item 1'
		});

		var oSpyChangeEvent = sinon.spy(this.multiInput1, "fireChange");

		this.multiInput1.addSuggestionItem(oItem);
		Core.applyChanges();

		// act
		this.multiInput1.setSelectionItem(oItem, true);
		Core.applyChanges();

		// assert
		assert.strictEqual(this.multiInput1.getValue(), "", "Value of the input should be empty");

		assert.strictEqual(oSpyChangeEvent.callCount, 1, "Change event should be fired once");
	});

	QUnit.test("The selectedKey property should be reset on user input", function (assert) {
		// Arrange
		var oFakeEvent = {
				isMarked: function(){},
				setMarked:function(){}
			},
			oMultiInput = new MultiInput().placeAt("content"),
			oSpy;
		Core.applyChanges();

		// Act
		oSpy = sinon.spy(oMultiInput, "setProperty");
		oMultiInput.oninput(oFakeEvent);

		// Assert
		assert.strictEqual(oSpy.firstCall.args[0], "selectedKey", "SelectedKey property is set");
		assert.strictEqual(oSpy.firstCall.args[1], "", "SelectedKey value is an empty string");
		assert.strictEqual(oSpy.firstCall.args[2], true, "Invalidation is suppressed");

		// Clean up
		oSpy.restore();
		oMultiInput.destroy();
	});

	QUnit.test("The binding data and the value should be an empty string after adding a token when focusing out of the control", function (assert) {
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

		Core.applyChanges();

		var oModel = new JSONModel({
			value: ""
		});

		oMultiInput.addValidator(function (o) {
			return o.suggestedToken ? o.suggestedToken : new Token({text: o.text});
		});

		oMultiInput.setModel(oModel);
		oMultiInput.setValue("Token 1");

		Core.applyChanges();

		// Act - trigger onsapfocusleave and close
		// the suggestion popover when an item is selected
		oMultiInput.onsapfocusleave({});
		oMultiInput.setSelectedKey("1");
		oMultiInput._getSuggestionsPopoverPopup().close();
		Core.applyChanges();

		// Assert
		assert.strictEqual(oMultiInput.getValue(), "", "Value of the input should be empty");
		assert.strictEqual(oMultiInput.getBinding("value").getModel().getProperty("/value"), "", "The binding value should be an empty string");

		oMultiInput.destroy();
	});

	QUnit.test("Clicking on a Token should not trigger Input.prototype._fireValueHelpRequestForValueHelpOnly", function(assert) {
		var oSpy = sinon.spy(Input.prototype, "_fireValueHelpRequestForValueHelpOnly"),
			oToken = new Token();

		this.multiInput1.addToken(oToken);

		this.multiInput1.attachTokenUpdate(function(oEvent){
			oEvent.preventDefault();
		});

		Core.applyChanges();

		qutils.triggerEvent("tap", this.multiInput1.getTokens()[0].getDomRef());

		// assert
		assert.notOk(oSpy.called, "Input's _fireValueHelpRequestForValueHelpOnly method is not called");

		// clean up
		oSpy.restore();
	});

	QUnit.test("Clicking on nMore should not trigger Input.prototype._fireValueHelpRequestForValueHelpOnly", function(assert) {
		var oSpy = sinon.spy(Input.prototype, "_fireValueHelpRequestForValueHelpOnly");

		this.multiInput1.setWidth("200px");
		this.multiInput1.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		this.multiInput1.attachTokenUpdate(function(oEvent){
			oEvent.preventDefault();
		});

		Core.applyChanges();

		this.multiInput1.getAggregation("tokenizer")._handleNMoreIndicatorPress();

		// assert
		assert.notOk(oSpy.called, "Input's _fireValueHelpRequestForValueHelpOnly method is not called");

		// clean up
		oSpy.restore();
	});

	QUnit.module("Accessibility", {
		beforeEach : function() {
			this.multiInput1 = new MultiInput({
				value: "Value",
				tooltip: "Tooltip",
				placeholder: "Placeholder"
			});
			this.multiInput1.placeAt("qunit-fixture");

			Core.applyChanges();
		},
		afterEach : function() {
			this.multiInput1.destroy();
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
		assert.strictEqual(oInfo.description, "", "Description");
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
		// arrange
		var sInvisibleTextId = this.multiInput1.getAggregation("tokenizer").getTokensInfoId(),
			oInvisibleText = Core.byId(sInvisibleTextId);

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

		this.clock.tick();

		//assert
		assert.ok(this.multiInput1.getFocusDomRef().getAttribute('aria-describedby').indexOf(sInvisibleTextId1) !== -1, "Input has aria-describedby attribute to indicate Enter press possibility");
		assert.strictEqual(this.multiInput1.getFocusDomRef().getAttribute('aria-describedby'), sInvisibleTextId + " " + sInvisibleTextId1, "Both references are added to the aria-describedby attribute");
	});

	QUnit.test("aria-keyshortcuts attribute", function(assert) {
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
		Core.applyChanges();

		oMultiInput._onResize();
		Core.applyChanges();

		// Act
		sKeyShortcut = oMultiInput.getFocusDomRef().getAttribute('aria-keyshortcuts');
		Core.applyChanges();

		// Assert
		assert.strictEqual(sKeyShortcut, "Enter", "'aria-keyshortcuts' attribute should be presented with the correct value");

		// Act
		oMultiInput.setEnabled(false);
		Core.applyChanges();
		sKeyShortcut = oMultiInput.getFocusDomRef().getAttribute('aria-keyshortcuts');

		// Assert
		assert.notOk(sKeyShortcut, "'aria-keyshortcuts' attribute should not be presented.");

		// Act
		oMultiInput.setEnabled(true);
		oMultiInput.setEditable(true);
		Core.applyChanges();
		sKeyShortcut = oMultiInput.getFocusDomRef().getAttribute('aria-keyshortcuts');

		// Assert
		assert.notOk(sKeyShortcut, "'aria-keyshortcuts' attribute should not be presented.");
	});

	QUnit.test("Placeholder opacity", function(assert) {
		// assert
		assert.ok(!this.multiInput1.$().hasClass("sapMMultiInputHasTokens"), "MultiInput placeholder shows placeholder");

		// act
		this.multiInput1.addToken(new Token({text: "Token2"}));
		Core.applyChanges();

		// assert
		assert.ok(this.multiInput1.$().hasClass("sapMMultiInputHasTokens"), "MultiInput placeholder doesn't show placeholder");
	});

	QUnit.test("aria-haspopup should be correctly applied", function(assert) {
		//Arrange
		var oMultiInputWithoutSuggestions = new MultiInput({showSuggestion: false}),
			oMultiInputWithSuggestions =  new MultiInput({});

		oMultiInputWithoutSuggestions.placeAt("content");
		oMultiInputWithSuggestions.placeAt("content");
		Core.applyChanges();

		//Assert
		assert.strictEqual(oMultiInputWithoutSuggestions._$input.attr("aria-haspopup"), undefined, "aria-haspopup should not be  presented.");
		assert.strictEqual(oMultiInputWithSuggestions._$input.attr("aria-haspopup"), "listbox", "aria-haspopup should have value 'listbox'.");

		//Act
		oMultiInputWithSuggestions.setShowSuggestion(false);
		Core.applyChanges();

		//Assert
		assert.strictEqual(oMultiInputWithSuggestions._$input.attr("aria-haspopup"), undefined, "aria-haspopup should not be  presented.");

		//Clean up
		oMultiInputWithoutSuggestions.destroy();
		oMultiInputWithSuggestions.destroy();
	});

	QUnit.module("Copy/Cut Functionality", {
		beforeEach: function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			Core.applyChanges();
		},
		afterEach: function() {
			this.multiInput1.destroy();
		}
	});

	QUnit.test("Cut", function(assert) {
		var oSpy = sinon.spy(Tokenizer.prototype, "_cut");

		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.multiInput1.getTokens()[0].setSelected(true);
		this.multiInput1.getTokens()[0].focus();


		Core.applyChanges();

		qutils.triggerEvent("keydown", this.multiInput1.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.X,
			ctrlKey: true
		});

		// assert
		assert.ok(oSpy.called, "Tokenizer's cut method is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Cut with keyboard", function(assert) {
		var oSpy = sinon.spy(Tokenizer.prototype, "_cut");

		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.multiInput1.getTokens()[0].focus();

		Core.applyChanges();

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

	QUnit.test("Copy", function(assert) {
		var oSpy = sinon.spy(Tokenizer.prototype, "_copy");

		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.multiInput1.getTokens()[0].setSelected(true);

		Core.applyChanges();

		qutils.triggerEvent("keydown", this.multiInput1.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.C,
			ctrlKey: true
		});

		// assert
		assert.ok(oSpy.called, "Tokenizer's copy method is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Copy with keyboard", function(assert) {
		var oSpy = sinon.spy(Tokenizer.prototype, "_copy");

		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));

		this.multiInput1.focus();

		Core.applyChanges();

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

	QUnit.test("Paste (with suggestions)", function(assert) {
		/* TODO remove after the end of support for Internet Explorer */
		if (!Device.browser.internet_explorer) {
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

			Core.applyChanges();
			this.clock.tick(10);

			//assert
			assert.equal(this.multiInput1.getTokens().length, 2, "2 tokens should be added to MultiInput on paste");
		} else {
			assert.expect(0);
		}
	});

	QUnit.test("_convertTextToToken", function(assert) {
		this.multiInput1.addValidator(function(args){
			return new Token({text: args.text});
		});

		Core.applyChanges();

		var result = this.multiInput1._convertTextToToken("  token");

		// assert
		assert.strictEqual(result.getText(), "token", "then the return value is correct");
	});

	QUnit.module("Collapsed state (N-more)", {
		beforeEach : function() {
			this.multiInput = new MultiInput();
			this.multiInput.placeAt("qunit-fixture");

			Core.applyChanges();
		},
		afterEach : function() {
			this.multiInput.destroy();
		}
	});

	QUnit.test("Popover's initial state", function(assert) {
		var oTokenizer = this.multiInput.getAggregation("tokenizer"),
			oSpy = sinon.spy(oTokenizer, "_togglePopup"),
			oSelectedItemsList;
		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		Core.applyChanges();

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

	QUnit.skip("Popover's interaction", function(assert) {
		var oPicker;
		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		Core.applyChanges();

		// act
		if (Device.browser.internet_explorer) {
			this.multiInput.getAggregation("tokenizer").$().trigger("click");
		} else {
			this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		}

		oPicker = this.multiInput.getAggregation("tokenizer").getTokensPopup();
		this.clock.tick(100);

		// delete the first item
		oPicker.getContent()[0].getItems()[0]._oDeleteControl.firePress();
		// assert
		assert.strictEqual(this.multiInput.getTokens().length, 3, "A token was deleted after deleting an item from the popover");
		assert.ok(oPicker.isOpen(), "Popover remains open after deleting a token");

		//close and open the picker
		oPicker.close();
		// act
		if (Device.browser.internet_explorer) {
			this.multiInput.getAggregation("tokenizer").$().trigger("click");
		} else {
			this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		}
		//assert
		assert.strictEqual(oPicker.getContent()[0].getItems().length, 3, "The items in the list are updated");
	});

	QUnit.test("Popover's interaction - try to delete non editable token", function(assert) {
		// Arrange
		var oFakeEvent, oItem,
			oTokenizer = this.multiInput.getAggregation("tokenizer"),
			oList = oTokenizer._getTokensList(),
			oListRemoveItemSpy = this.spy(oList, "removeItem");

		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX", editable: false})
		]);

		Core.applyChanges();

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

	QUnit.test("onfocusin", function(assert) {
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

		Core.applyChanges();

		oIndicator = this.multiInput.$().find(".sapMTokenizerIndicator");

		//assert
		assert.ok(oIndicator[0], "A n-more label is rendered");

		//close and open the picker
		this.multiInput.onfocusin(oEventMock);
		Core.applyChanges();

		// assert
		assert.ok(oIndicator.hasClass("sapUiHidden"), "The n-more label is hidden on focusin.");
	});

	QUnit.test("RenderMode behaviour against different interactions", function (assert) {
		var oTokenizer = this.multiInput.getAggregation("tokenizer"),
			oTokenizerSpy;

		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		Core.applyChanges();

		// Setup
		oTokenizerSpy = this.spy(oTokenizer, "setRenderMode");

		// Act. Emulate click on the Icon
		this.multiInput.onfocusin({target: this.multiInput.getDomRef("vhi")});
		Core.applyChanges();

		// assert
		assert.notOk(oTokenizerSpy.calledOnce, "setRenderMode should not be triggered");
		assert.strictEqual(oTokenizer.getRenderMode(), TokenizerRenderMode.Narrow, "Tokenizer's renderMode should be Narrow");

		// Act. Emulate "real" focusin
		this.multiInput.onfocusin({target: this.multiInput.getDomRef("inner")});
		Core.applyChanges();

		// assert
		assert.ok(oTokenizerSpy.calledOnce, "setRenderMode should be triggered");
		assert.strictEqual(oTokenizer.getRenderMode(), TokenizerRenderMode.Loose, "renderMode property should be set when the focus is on the input");

		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();

		// Focus first item in the popover.
		oTokenizer.getTokensPopup().getContent()[0].getItems()[0].$().trigger("focus");
		Core.applyChanges();

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

	QUnit.test("_handleNMoreItemDelete", function(assert) {
		var oListItem = new StandardListItem(), aTokens,
			oToken = new Token("token", {text: "text123", key: "key123"}),
			oSpy = this.spy(this.multiInput.getAggregation("tokenizer"), "removeAggregation"),
			oTokenUpdateSpy = this.spy(this.multiInput, "fireTokenUpdate"),
			oFakeEvent = new Event(),
			oSetSelectionStub = sinon.stub(Event.prototype, "getParameter");

		oSetSelectionStub.withArgs("listItem").returns(oListItem);
		oSetSelectionStub.withArgs("tokens").returns([oToken]);

		this.multiInput.addToken(oToken);
		oListItem.data("key", "key123");
		oListItem.data("text", "text123");
		oListItem.data("tokenId", "token");

		Core.applyChanges();

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

	QUnit.skip('Selected items list on mobile', function(assert) {
		// system under test
		this.stub(Device, "system", {
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
			oStub = sinon.stub(oTokenizer.getTokensPopup(), "openBy");

		Core.applyChanges();
		// act
		if (Device.browser.internet_explorer) {
			oTokenizer.$().trigger("click");
		} else {
			this.multiInput1.$().find(".sapMTokenizerIndicator")[0].click();
		}
		this.clock.tick(1000);

		assert.ok(oStub.called, "The suggestion dialog is opened on click on N-more");
		assert.ok(this.multiInput1._getSuggestionsPopoverInstance().getFilterSelectedButton(), "The filtering button is pressed on initial opening");
		assert.ok(oTokenizer._getTokensList().getVisible(), "The list with tokens is visible");

		// clean up
		oStub.restore();
		this.multiInput1.destroy();
	});

	QUnit.test('Selected items list update on mobile', function(assert) {
		// system under test
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		var oList,
			oFakeEvent = new Event(),
			oDeleteStub = sinon.stub(Event.prototype, "getParameter"),
			oMI = new MultiInput().placeAt("qunit-fixture"),
			oTokenizer = oMI.getAggregation("tokenizer");

		oMI.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);
		oMI.setWidth("200px");

		// act
		oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		Core.applyChanges();

		// assert
		oList = oTokenizer._getTokensList();
		assert.strictEqual(oList.getItems().length, 4, "The dialog has the correct number of list items.");

		// act
		oDeleteStub.withArgs("listItem").returns(oList.getItems()[0]);
		oDeleteStub.withArgs("tokens").returns([oMI.getTokens()[0]]);
		oTokenizer._handleListItemDelete(oFakeEvent);
		Core.applyChanges();

		// assert
		assert.strictEqual(oList.getItems().length, 3, "A list item is removed from the dialog.");

		// Prepare clean up
		// In IE the tokenizer's popup is getting auto-closed with delay, after the tokenizer itself has been destroyed.
		// Close the popup before destroying so it has a place to return the focus to prevent exceptions in IE.
		oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		Core.applyChanges();

		// Clean
		oDeleteStub.restore();
		oMI.destroy();
	});

	QUnit.test("Token's list + token deletion", function(assert) {
		var aListItems,
			oToken = new Token({text: "XXXX"}),
		oTokenizer = this.multiInput.getAggregation("tokenizer");
		this.multiInput.addToken(oToken);
		oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		Core.applyChanges();

		// act
		oTokenizer._fillTokensList(oTokenizer._getTokensList());
		this.multiInput.removeToken(oToken);
		Core.applyChanges();

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
	});

	QUnit.test("Read-only popover should be closed on ENTER", function (assert) {
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
		Core.applyChanges();

		// assert
		assert.ok(oPopover, "Readonly Popover should be created");

		// act
		qutils.triggerKeydown(oPopover, KeyCodes.ENTER);
		this.clock.tick(nPopoverAnimationTick);

		assert.notOk(oPopover.isOpen(), "Readonly Popover should be closed");

		// delete
		oMultiInput.destroy();
	});

	QUnit.skip("Read-only popover should be opened on ENTER keypress", function (assert) {
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
		Core.applyChanges();

		// act
		oMIDomRef = oMultiInput.getFocusDomRef();
		qutils.triggerKeydown(oMIDomRef, KeyCodes.ENTER);
		this.clock.tick(500);

		// assert
		assert.ok(containsOrEquals(oMultiInput.getAggregation("tokenizer")._getTokensList().getItems()[0].getDomRef(), document.activeElement),
			"Popover should be on focus when opened");

		// delete
		oMultiInput.destroy();
	});

	QUnit.test("Read-only popover should not be closed when the scrolbar inside is clicked", function (assert) {
		// arrange
		var oMultiInput = new sap.m.MultiInput({
			editable: false,
			width: "50px",
			tokens: [
				new sap.m.Token({ text: "XXXX" }),
				new sap.m.Token({ text: "XXXX" }),
				new sap.m.Token({ text: "XXXX" }),
				new sap.m.Token({ text: "XXXX" })
			]
		}),
		oPopover = oMultiInput.getAggregation("tokenizer").getTokensPopup();

		// act
		oMultiInput.placeAt("content");
		Core.applyChanges();

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

	QUnit.test("Read-only popover is opened after N-more is pressed", function(assert){
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

		Core.applyChanges();

		// act

		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();

		oPicker = oTokenizer.getTokensPopup();

		assert.equal(oPicker.isOpen(), true, "The readonly popover is opened on click on N-more");
	});

	QUnit.test("Read-only popover list should be destroyed, when MultiInput is set to editable", function(assert){
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

		Core.applyChanges();


		this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		oPicker = oTokenizer.getTokensPopup();

		// assert
		assert.ok(oPicker.isOpen(), "The readonly popover is opened on click on N-more");

		// act
		oPicker.close();
		this.multiInput.setEditable(true);
		Core.applyChanges();

		// act
		if (Device.browser.msie) {
			oTokenizer.$().trigger("click");
		} else {
			this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		}
		Core.applyChanges();


		var oEvent = {
			getParameter: function () {
				return oPicker.getContent()[0].getItems()[0];
			}
		};

		oTokenizer._handleListItemDelete(oEvent);
		Core.applyChanges();

		var aTokens = this.multiInput.getTokens();
		var aItems = oPicker.getDomRef().querySelectorAll('.sapMLIB');

		// assert
		assert.strictEqual(document.querySelectorAll("#" + this.multiInput.getAggregation("tokenizer")._getTokensList().getId()).length, 1, "There should be only 1 instance of the tokens list");
		assert.strictEqual(aItems.length, aTokens.length, "List items and tokens should be equal:" + aItems.length);
	});

	QUnit.test("tokenizer's _useCollapsedMode is called on initial rendering", function(assert) {
		//arrange
		var oMultiInput = new MultiInput(),
			tokenizerSpy = this.spy(oMultiInput.getAggregation("tokenizer"), "_useCollapsedMode");

		// act
		oMultiInput.placeAt("qunit-fixture");
		Core.applyChanges();
		this.clock.tick(100);

		// assert
		assert.strictEqual(oMultiInput.getAggregation("tokenizer").getRenderMode(), TokenizerRenderMode.Narrow, "the tokenizer is in Narrow mode");
		assert.ok(tokenizerSpy.called, "tokenizer's _useCollapsedMode is called");

		// clean up
		oMultiInput.destroy();
	});

	QUnit.test("Input visibility", function(assert) {
		//arrange
		var multiInput = new MultiInput();

		// act
		multiInput.placeAt("qunit-fixture");
		this.clock.tick(100);

		multiInput.updateDomValue("123");
		qutils.triggerEvent("input", multiInput.getFocusDomRef());

		multiInput.onsapfocusleave({});
		Core.applyChanges();

		// assert
		assert.strictEqual(multiInput.$("inner").css("opacity"), "1", "The input value remains visible, if the n-more label is hidden");

		// clean up
		multiInput.destroy();
	});

	QUnit.test("Input visibility with read-only state", function (assert) {
		// arrange
		var oMultiInput = new MultiInput({
			editable: false,
			width: "200px",
			value: "111"
		});

		// act
		oMultiInput.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oMultiInput.$("inner").css("opacity"), "1", "The input value remains visible, if the n-more label is hidden");

		oMultiInput.setTokens([
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" })
		]);

		// act
		Core.applyChanges();

		// assert
		assert.strictEqual(oMultiInput.$("inner").css("opacity"), "0", "The input value is not visible, if the n-more label is shown");

		// clean up
		oMultiInput.destroy();
	});

	QUnit.test("input's visibility onsapfocusleave + n-more label", function(assert) {
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

		Core.applyChanges();

		oIndicator = this.multiInput.$().find(".sapMTokenizerIndicator");
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is visible.");
		assert.ok(this.multiInput.getAggregation("tokenizer").getHiddenTokensCount() > 0, "The n-more indicator is visible.");

		// Currently the _handleVisibility method is called more than once as it is connected with the Tokenizer
		// Invalidating when the nMore is to be shown that is why
		oVisibleInputSpy.reset();
		this.multiInput.onsapfocusleave({});
		Core.applyChanges();

		// assert
		assert.ok(oVisibleInputSpy.calledWith(false), "The input field is hidden onfocusout.");
		assert.notOk(oVisibleInputSpy.calledWith(true), "The input field is not shown onfocusout.");
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is visible");
	});

	QUnit.test("input's visibility onsapfocusleave + without n-more label", function(assert) {
		var oIndicator,
			oVisibleInputSpy = this.spy(this.multiInput, "_setValueVisible");

		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"})
		]);

		Core.applyChanges();

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

	QUnit.test("input's visibility on rerendering", function(assert) {
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

		Core.applyChanges();

		oIndicator = this.multiInput.$().find(".sapMTokenizerIndicator");

		//assert that the n-more indicator is shown
		assert.ok(oIndicator[0], "A n-more label is rendered");
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more indicator is visible.");

		oVisibleInputSpy.reset();
		this.multiInput.invalidate({});
		Core.applyChanges();

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
		assert.ok(this.multiInput._iTokenizerResizeHandler, "Register Tokenizer's resize handler");
		assert.ok(oMaxWidthSetterSpy.calledOnce, "Tokens MaxWidth setter called");
		assert.ok(oMaxWidthSetterSpy.calledBefore(oRegisterResizeSpy), "Finally, subscribe again for the resize handler");

		this.multiInput.destroy();

		assert.notOk(this.multiInput._iResizeHandlerId, "Deregister resize handler");
		assert.notOk(this.multiInput._iTokenizerResizeHandler, "Deregister Tokenizer's resize handler");
	});

	QUnit.module("Destroyers");

	QUnit.test("Destroy properly internal lists", function (assert) {
		// arrange
		var oMultiInput = new MultiInput({
			editable: true
		});
		var oTokenizer = oMultiInput.getAggregation("tokenizer");
		var oList  = oTokenizer._getTokensList();
		oMultiInput.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		oMultiInput.destroy();
		Core.applyChanges();

		// assert
		assert.ok(!oTokenizer._oTokensList, "The SelectedItemsList gets detached");
		assert.ok(oTokenizer._oTokensList !== oList, "The SelectedItemsList gets cleaned properly");
	});

	QUnit.test("Destroy & reinit on mobile", function (assert) {
		// Setup
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// arrange
		var oMultiInput = new MultiInput("test-input").placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		oMultiInput.destroy();
		oMultiInput = new MultiInput("test-input").placeAt("qunit-fixture");
		Core.applyChanges();

		// assert
		assert.ok(true, "If there's no exception so far, everything is ok");

		// Cleanup
		oMultiInput.destroy();
	});

	QUnit.test("Properly destroy tokens only when allowed", function (assert) {
		// arrange
		var oToken = new Token({text: "My Token"}),
			oTokenSpy = this.spy(oToken, "destroy"),
			oMultiInput = new MultiInput({
				tokens: [oToken]
			}).placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		oMultiInput.setEditable(false);
		oMultiInput._deleteTokens([oToken], {});
		Core.applyChanges();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oMultiInput.getTokens(), [oToken], "The tokenizer should remain untouched");


		// Act
		oMultiInput.setEditable(true);
		oMultiInput.setEnabled(false);
		oMultiInput._deleteTokens([oToken], {});
		Core.applyChanges();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oMultiInput.getTokens(), [oToken], "The tokenizer should remain untouched");

		// Act
		oMultiInput.setEnabled(true);
		oToken.setEditable(false);
		oMultiInput._deleteTokens([oToken], {});
		Core.applyChanges();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oMultiInput.getTokens(), [oToken], "The tokenizer should remain untouched");

		// Act
		oToken.setEditable(true);
		oMultiInput._deleteTokens([oToken], {});
		Core.applyChanges();

		// assert
		assert.ok(oTokenSpy.calledOnce, "Token should be destroyed this time");
		assert.deepEqual(oMultiInput.getTokens(), [], "Tokens aggregation should be empty");

		// Cleanup
		oMultiInput.destroy();
	});


	QUnit.module("IE11", {
		beforeEach : function() {
			sinon.config.useFakeTimers = false;
			this.multiInput1 = new MultiInput({
				placeholder: 'placeholder',
				tokens:[
					new Token({text: 'token 1'}),
					new Token({text: 'token 2'}),
					new Token({text: 'token 3'})
				]
			});
			this.multiInput1.placeAt("qunit-fixture");

			Core.applyChanges();
		},
		afterEach : function() {
			sinon.config.useFakeTimers = true;
			this.multiInput1.destroy();
		}
	});

	QUnit.test("keyboard", function(assert) {
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

	QUnit.test("_syncInputWidth", function(assert) {
		var oItem1 = new Item({
				key : "0",
				text : "item 0"
			}),
			oSyncInput = this.spy(MultiInput.prototype, "_syncInputWidth"),
			oMI = new MultiInput({
				suggestionItems: [oItem1]
			});

		oMI.placeAt("qunit-fixture");
		Core.applyChanges();
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
	});

	QUnit.test("Read-only popover is opened after N-more is pressed", function (assert) {
		//Arrange
		var oMultiInput = new sap.m.MultiInput({
				editable: true
			}),
			oTokenizer = oMultiInput.getAggregation("tokenizer"),
			oRenderingSpy = this.spy(oMultiInput, "onBeforeRendering"),
			bVisible;

		oMultiInput.placeAt("qunit-fixture");
		Core.applyChanges();

		//Act
		oMultiInput.updateDomValue("123");
		qutils.triggerEvent("input", oMultiInput.getFocusDomRef());
		Core.applyChanges();

		//Arrange
		var oToken1 = new Token({text: "Token with a very long text content"}),
			oToken2 = new Token({text: "Token with a very long text content"}),
			oToken3 = new Token({text: "Token with a very long text content"}),
			oToken4 = new Token({text: "Token with a very long text content"}),
			oToken5 = new Token({text: "Token with a very long text content"}),
			oToken6 = new Token({text: "Token with a very long text content"});

		//Act
		oRenderingSpy.reset();
		oMultiInput.setTokens([oToken1, oToken2, oToken3, oToken4, oToken5, oToken6]);
		oMultiInput.setEditable(false);
		Core.applyChanges();

		oTokenizer._handleNMoreIndicatorPress();
		bVisible = oTokenizer._getTokensList().getVisible();

		//Assert
		assert.strictEqual(bVisible, true, "Tokens list is visible");
		assert.strictEqual(oRenderingSpy.callCount, 1, "The rendering should have been called only once");

		//Clean up
		oMultiInput.destroy();
	});

	QUnit.module("Performance");

	QUnit.test("Check execution time when 1000 tokens are being added", function (assert) {
		//Arrange
		var i = 1000,
			oMultiInput = new MultiInput({
				width: "150px"
			}),
			iTimeStamp = window.performance.now();

		// Act
		while (i--) {
			oMultiInput.addToken(new Token({text: ("0000" + i).slice(-4)}));
		}

		// Assert
		assert.ok((iTimeStamp + 1000) > window.performance.now(), "A thousand Tokens get populated under a second");

		//Clean up
		oMultiInput.destroy();
	});

	QUnit.test("Selection of group header", function(assert) {
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
		Core.applyChanges();

		// Act
		oMultiInput.onfocusin({target: oMultiInput.getDomRef("inner")}); // for some reason this is not triggered when calling focus via API
		oMultiInput._$input.trigger("focus").val("A").trigger("input");
		this.clock.tick(300);

		aVisibleItems = oMultiInput._getSuggestionsPopoverInstance().getItemsContainer().getItems().filter(function(oItem){
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
	});

	QUnit.module("One extra long token", {
		beforeEach : function() {
			this.oMultiInput = new MultiInput({
				width: "100px",
				tokens: [new Token({text: "Extra long token, Extra long token, Extra long token, Extra long token"})]
			});
			this.oMultiInput.placeAt("qunit-fixture");

			Core.applyChanges();
		},
		afterEach : function() {
			this.oMultiInput.destroy();
		}
	});

	QUnit.test("Token should be truncated initially", function (assert) {
		// Assert
		assert.ok(this.oMultiInput.getAggregation("tokenizer").hasOneTruncatedToken(), "Token is truncated initially.");
	});

	QUnit.test("Should remove truncation on focusin", function (assert) {
		// Arrange
		var oSpy = sinon.spy(this.oMultiInput.getAggregation("tokenizer"), "_useCollapsedMode"),
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

	QUnit.test("Prevent IE default scrolling on focus when one extra long token is clicked", function(assert) {
		// Arrange
		var oTokenizer = this.oMultiInput.getAggregation("tokenizer"),
			oSpy = sinon.spy(oTokenizer, "scrollToEnd"),
			aTokens = oTokenizer._getVisibleTokens(),
			oLastToken = aTokens[aTokens.length - 1];

		// Stub the browser to be only IE
		this.stub(Device, "browser", {
			msie: true
		});

		// Act
		qutils.triggerEvent("tap", oLastToken.getDomRef());
		Core.applyChanges();

		// Assert
		assert.ok(oSpy.called, "scrollToEnd has been called.");
	});

	QUnit.test("Prevent IE default scrolling when one extra long token is focused", function(assert) {
		// Arrange
		var oTokenizer = this.oMultiInput.getAggregation("tokenizer"),
			aTokens = oTokenizer._getVisibleTokens(),
			oLastToken = aTokens[aTokens.length - 1],
			oSpy = sinon.spy(oLastToken, "focus");

		// Act
		this.oMultiInput.focus();
		qutils.triggerKeydown(this.oMultiInput.getFocusDomRef(), KeyCodes.ARROW_LEFT);
		Core.applyChanges();

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
		var oTokensPopup = this.oMultiInput.getAggregation("tokenizer").getTokensPopup();
		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.ok(oTokensPopup.isOpen(), "Should open suggestion popover");

		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.notOk(oTokensPopup.isOpen(), "Should close suggestion popover");
	});

	QUnit.test("Should open/close suggestion popover on CTRL + I when MultiInput is readonly", function (assert) {
		var oPopover = this.oMultiInput.getAggregation("tokenizer").getTokensPopup();
		// Arrange
		this.oMultiInput.setEditable(false);
		this.clock.tick();

		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.ok(oPopover.isOpen(), "Should open suggestion popover");

		// Act
		qutils.triggerKeydown(this.oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.notOk(oPopover.isOpen(), "Should close suggestion popover");
	});

	QUnit.test("Should open/close suggestion popover on CTRL + I when MultiInput is readonly (real case scenario)", function (assert) {
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
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.notOk(oPopover.isOpen(), "Should close suggestion popover");
	});


	QUnit.test("Should not open suggestion popover on CTRL + I when the input doesn't have tokens", function (assert) {
		// Arrange
		var oMultiInput = new MultiInput();

		oMultiInput.placeAt("content");
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oMultiInput, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick);

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
		// Arrange
		this.oMultiInput.setEditable(false);

		// Act
		this.oMultiInput.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.ok(this.oMultiInput.getAggregation("tokenizer").hasOneTruncatedToken(), "The token should be truncated");
	});

	QUnit.module("API");

	QUnit.test("showItems should always set all items list visibility to true", function (assert) {
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
		Core.applyChanges();

		oMultiInput.getAggregation("tokenizer")._handleNMoreIndicatorPress();

		Core.applyChanges();
		this.clock.tick(nPopoverAnimationTick);

		oMultiInput.showItems();

		Core.applyChanges();
		this.clock.tick(nPopoverAnimationTick);

		assert.ok(oMultiInput._getSuggestionsPopoverInstance().getItemsContainer().getVisible(), true, "List should be visible");

		oMultiInput.destroy();
	});


	QUnit.test("a popover instance should always be present, but onsapfocusleave should not throw error even if not", function (assert) {
		// Arrange
		var oMultiInput = new MultiInput({
			showSuggestion: false
		});
		var oGetPopoverSpy = this.spy(oMultiInput, "_getSuggestionsPopoverPopup");
		var oEventMock = {};
		oMultiInput.placeAt("content");
		Core.applyChanges();

		// Act
		oMultiInput.focus();
		oMultiInput.onsapfocusleave(oEventMock);

		// Assert
		assert.strictEqual(oGetPopoverSpy.returned(oMultiInput._oSuggestionPopup), true, "A popover instance exists even if no suggestions are present");

		// Cleanup
		oGetPopoverSpy.restore();

		// Arrange
		this.stub(oMultiInput, "_getSuggestionsPopoverPopup", function() {
			return null;
		});

		// Act
		oMultiInput.focus();
		oMultiInput.onsapfocusleave(oEventMock);

		// Assert
		assert.ok(true, "No exception is thrown if popover instance is not present on focusleave");

		// Cleanup
		oMultiInput.destroy();
	});

	QUnit.module("Handling curly braces", {
		beforeEach: function() {
			this.oMultiInput = new MultiInput();
			this.oMultiInput.placeAt('content');
			Core.applyChanges();
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
		var oStub = new sinon.stub();

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


});
