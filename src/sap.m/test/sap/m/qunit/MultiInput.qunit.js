/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/MultiInput",
	"sap/m/Token",
	"sap/m/Tokenizer",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Column",
	"sap/m/Table",
	"sap/ui/core/Item",
	"sap/ui/events/KeyCodes",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/m/Input",
	"sap/m/InputBase",
	"sap/ui/core/ListItem",
	"sap/m/StandardListItem"
], function(
	qutils,
	createAndAppendDiv,
	MultiInput,
	Token,
	Tokenizer,
	ColumnListItem,
	Label,
	Column,
	Table,
	Item,
	KeyCodes,
	EventExtension,
	Device,
	JSONModel,
	jQuery,
	Input,
	InputBase,
	ListItem,
	StandardListItem
) {
	createAndAppendDiv("content");



	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	QUnit.module("Basic", {
		beforeEach : function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
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
		sap.ui.getCore().applyChanges();

		this.multiInput1.insertToken(new Token({text: "Token1"}), 0);

		// assert
		assert.ok(oSpy.called, "Tokenizer's insertToken method is called");
		assert.equal(this.multiInput1.getTokens().length, 1, "then the MultiInput contains 1 tokens");

		// cleanup
		oSpy.restore();
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
			multiInputClone,
			fnTokenizerDestroySpy = this.spy(Tokenizer.prototype, "destroy");

		this.multiInput1.addToken(token1);

		//act
		multiInputClone = this.multiInput1.clone();

		//assert
		assert.strictEqual(fnTokenizerDestroySpy.callCount, 1, "The tokenizer was destroyed once during cloning");
		assert.equal(multiInputClone.getTokens().length, 1, "Cloned MultiInput contains 1 token");
		assert.equal(multiInputClone.getTokens()[0].getText(), TEXT, "Cloned token has correct text");

		//clean-up
		multiInputClone.destroy();
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
		assert.equal(this.multiInput1.getTokens().length, 2, "no more than 2 tokens can be added");
	});

	QUnit.test("_calculateSpaceForTokenizer", function(assert) {
		var multiInput = new MultiInput(),
			output;

		multiInput.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		multiInput.$().find(".sapMMultiInputInputContainer").removeClass("sapMMultiInputInputContainer");
		sap.ui.getCore().applyChanges();

		output = multiInput._calculateSpaceForTokenizer();

		assert.strictEqual(isNaN(parseInt(output, 10)), false, "_calculateSpaceForTokenizer returns a valid value");
	});

	QUnit.test("_calculateSpaceForTokenizer with negative tokenizer space", function(assert) {
		var multiInput = new MultiInput({
			width: "30px",
			description: "Unit"
		});

		multiInput.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().setModel(oModel);

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

		sap.ui.getCore().applyChanges();

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

		sap.ui.getCore().applyChanges();

		var firstToken = this.multiInput1.getTokens()[0];
		firstToken.setSelected(true);

		// act
		qutils.triggerKeydown(firstToken.$(), KeyCodes.BACKSPACE);

		// assert
		assert.equal(this.multiInput1.getTokens().length, 3, "MultiInput has only 3 tokens");

		// act

		model.setData(newData);

		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		//assert
		assert.equal(aFirstToken.$('icon').css('display'), 'inline-block', 'First token icon is visible');
		assert.ok(!aSecondToken.getDomRef('icon'), 'Second token icon does not exist');

		//act
		this.multiInput1.setEditable(false);
		sap.ui.getCore().applyChanges();

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

	QUnit.module("Validation", {
		beforeEach: function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.multiInput1.destroy();
		}
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

	QUnit.test("removeValidator", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "removeValidator"),
			oValidator = function(args){
				return new Token({text: args.text});
			};

		this.multiInput1.addValidator(oValidator);

		sap.ui.getCore().applyChanges();
		this.multiInput1.removeValidator(oValidator);
		// assert
		assert.strictEqual(this.multiInput1._tokenizer._aTokenValidators.length, 0 , "then the MultiInput has no validators");
		assert.ok(oSpy.called, "Tokenizer's removeValidator is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.module("KeyboardEvents", {
		beforeEach : function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.multiInput1.$().focus();
		},
		afterEach : function() {
			this.multiInput1.destroy();
		}
	});

	QUnit.test("delete tokens via backspace", function(assert) {
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		var token1 = new Token();
		this.multiInput1.addToken(token1);

		sap.ui.getCore().applyChanges();

		this.multiInput1.onsapbackspace({preventDefault:function(){}, stopPropagation:function(){}, setMarked:function(){}});
		assert.ok(token1.getSelected(), "Token got selected");

		this.multiInput1.onsapbackspace({preventDefault:function(){}, stopPropagation:function(){}, setMarked:function(){}});
		assert.equal(this.multiInput1.getTokens().length, 0, "Token got deleted");
	});

	QUnit.test("delete tokens via backspace and prevent default", function(assert) {

		this.multiInput1.attachTokenUpdate(function (evt) {
			evt.preventDefault();
		});

		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		var token1 = new Token();
		this.multiInput1.addToken(token1);

		sap.ui.getCore().applyChanges();

		this.multiInput1.onsapbackspace({preventDefault:function(){}, stopPropagation:function(){}, setMarked:function(){}});
		assert.ok(token1.getSelected(), "Token got selected");

		this.multiInput1.onsapbackspace({preventDefault:function(){}, stopPropagation:function(){}, setMarked:function(){}});
		assert.equal(this.multiInput1.getTokens().length, 1, "Token is not deleted");
	});

	QUnit.test("test keyboard navigation", function(assert){
		var token = new Token({selected: true}),
			that = this;
		this.multiInput1.addToken(token);
		assert.equal(this.multiInput1.getTokens().length, 1, "MultiInput contains 1 token");

		this.multiInput1.onsapnext({isMarked:function(){return false;}});

		this.multiInput1.onsapdelete();
		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");

		token = new Token({selected: false});
		this.multiInput1.addToken(token);

		sap.ui.getCore().applyChanges();

		this.multiInput1._getIsSuggestionPopupOpen = function(){ return true; };

		this.multiInput1.onsapprevious(new jQuery.Event("onsapprevious", {srcControl: that.multiInput1}));
		assert.equal(token.getSelected(), false, "Token not selected because popup is open");

		this.multiInput1._getIsSuggestionPopupOpen = function(){return false;};
		this.multiInput1.onsapprevious(new jQuery.Event("onsapprevious", {srcControl: that.multiInput1}));
		assert.equal(token.getSelected(), true, "Token got selected");
	});

	QUnit.test("test remove via live change", function(assert) {
		var token1 = new Token({selected:true});
		var token2 = new Token({selected:true});
		var token3 = new Token({selected:true});
		this.multiInput1.setTokens([token1, token2, token3]);
		this.multiInput1.fireLiveChange();

		assert.equal(this.multiInput1.getTokens().length, 0, "MultiInput contains 0 tokens");
	});

	QUnit.test("keyboard - ctrl + A with no text", function(assert) {
		var token1 = new Token();
		var token2 = new Token();
		var token3 = new Token();
		this.multiInput1.setTokens([token1, token2, token3]);

		sap.ui.getCore().applyChanges();

		this.multiInput1.focus();

		qutils.triggerKeydown(this.multiInput1.$(), KeyCodes.A, false, false, true); // trigger Control key + A
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

		this.multiInput1.ontap();
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
		sap.ui.getCore().applyChanges();

		this.multiInput1.getTokens()[0].focus();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.HOME);

		// assert
		assert.ok(oSpy.called, "Tokenizer's onsaphome is called when a token is focused");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsaphome when no token is focused", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsaphome"),
				token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		sap.ui.getCore().applyChanges();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.HOME);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsaphome is not called when no token is focused");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapprevious when MultiInput has no value", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsapprevious"),
				token1 = new Token({text: "Token"});

		this.multiInput1.addToken(token1);
		sap.ui.getCore().applyChanges();

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
		this.multiInput1._$input.focus();
		this.multiInput1._$input[0].setSelectionRange(3, 3);

		sap.ui.getCore().applyChanges();

		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.ARROW_LEFT);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapprevious is not called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapdelete", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsapdelete");

		sap.ui.getCore().applyChanges();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);

		// assert
		assert.ok(oSpy.called, "Tokenizer's onsapdelete is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapdelete when MultiInput has value", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsapdelete");
		this.multiInput1.setValue("value");

		sap.ui.getCore().applyChanges();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapdelete is not called");
		assert.equal(this.multiInput1.onsapdelete(), undefined, "then onsapdelete returns undefined");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapnext when a token is focused", function(assert) {

		var oMISpy = sinon.spy(MultiInput.prototype, "_scrollAndFocus"),
			oTokenizerSpy = sinon.spy(Tokenizer.prototype, "scrollToEnd");

		this.multiInput1.addToken(new Token({}));

		sap.ui.getCore().applyChanges();

		this.multiInput1.getTokens()[0].focus();

		qutils.triggerKeydown(this.multiInput1.getFocusDomRef(), KeyCodes.ARROW_RIGHT, false, false, false);

		// assert
		assert.ok(oMISpy.called, "MultiInputs's _scrollAndFocus is called");
		assert.ok(oTokenizerSpy.called, "Tokenizer's scrollToEnd is not called");

		// cleanup
		oMISpy.restore();
		oTokenizerSpy.restore();
	});

	QUnit.test("onsapnext when MultiInput in not editable", function(assert) {

		var oSpy = sinon.spy(Tokenizer.prototype, "onsapdelete");
		this.multiInput1.setEditable(false);
		sap.ui.getCore().applyChanges();
		qutils.triggerKeydown(this.multiInput1.getDomRef(), KeyCodes.DELETE);

		// assert
		assert.notOk(oSpy.called, "Tokenizer's onsapdelete is not called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("onsapenter on mobile device", function (assert) {
		// Setup
		var oMI, sValue;

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

		// Act
		oMI._oSuggPopover._oPopover.open();
		this.clock.tick(1000);

		// Assert
		assert.ok(oMI._oSuggPopover._oPopover.isOpen(), "The dialog is opened");

		// Act
		oMI._oSuggPopover._oPopupInput.setValue("test");
		qutils.triggerKeydown(oMI._oSuggPopover._oPopupInput.getDomRef(), jQuery.sap.KeyCodes.ENTER);

		// Assert
		assert.ok(oMI._oSuggPopover._oPopover.isOpen(), "The dialog is still open after enter key");
		assert.strictEqual(sValue, 'test', "The change event is triggered and the right value is passed");

		// // Cleanup
		oMI.destroy();
	});

	QUnit.module("Events", {
		beforeEach: function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
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
		assert.equal(eventType, MultiInput.TokenChangeType.Added, "added event raised");

		this.multiInput1.removeToken(token1);
		assert.equal(eventType, MultiInput.TokenChangeType.Removed, "removed event raised");

		this.multiInput1.removeAllTokens();
		assert.equal(eventType, MultiInput.TokenChangeType.RemovedAll, "removedAll event raised");
	});

	QUnit.test("token update event", function(assert) {
		/* TODO remove after 1.62 version */
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
			sap.ui.getCore().applyChanges();

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
			sap.ui.getCore().applyChanges();

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
		var spy = sinon.spy(Input.prototype, "ontap"),
			token1 = new Token();

		this.multiInput1.addToken(token1);
		this.multiInput1.attachTokenUpdate(function(evt){
			evt.preventDefault();
		});

		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("tap", this.multiInput1.getTokens()[0]._deleteIcon.getDomRef());

		// assert
		assert.notOk(spy.called, "Input's ontap method is not called");
	});

	QUnit.test("Change event is properly fired on different interactions", function (assert) {
		//Setup
		var oChangeFireSpy = this.spy(this.multiInput1, "fireChange"),
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
		this.multiInput1.$("inner").val("Test token");
		this.multiInput1.onsapenter({});
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oChangeFireSpy.calledOnce, "Change is fired");
		assert.ok(oValidatorSpy.calledOnce, "Validator is fired");
		assert.ok(oChangeFireSpy.calledBefore(oValidatorSpy), "fireChange is fired before Validator");

		//Act
		//Emulate use input
		// Modify DOM's value as we don't want to go trough MultiInput's API.
		this.multiInput1.bFocusoutDueRendering = false;
		this.multiInput1.$("inner").val("Test token 2");
		this.multiInput1.onsapfocusleave({});
		sap.ui.getCore().applyChanges();

		//Assert
		assert.ok(oChangeFireSpy.calledTwice, "Change is fired");
		assert.ok(oValidatorSpy.calledTwice, "Validator is fired");
		assert.ok(oChangeFireSpy.calledBefore(oValidatorSpy), "fireChange is fired before Validator");
	});

	QUnit.test("Selecting an item should not leave a text in the input", function (assert) {
		// arrange
		var oItem = new ListItem({
			key: '1',
			text: '1 Item 1'
		});

		var oSpyChangeEvent = sinon.spy(this.multiInput1, "fireChange");

		this.multiInput1.addSuggestionItem(oItem);
		sap.ui.getCore().applyChanges();

		// act
		this.multiInput1.setSelectionItem(oItem, true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.multiInput1.getValue(), "", "Value of the input should be empty");

		assert.strictEqual(oSpyChangeEvent.callCount, 1, "Change event should be fired once");
	});

	QUnit.module("Accessibility", {
		beforeEach : function() {
			this.multiInput1 = new MultiInput({
				value: "Value",
				tooltip: "Tooltip",
				placeholder: "Placeholder"
			});
			this.multiInput1.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
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
		assert.strictEqual(oInfo.description, "Value Placeholder Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");

		// act
		this.multiInput1.setValue("");
		this.multiInput1.setEnabled(false);
		oInfo = this.multiInput1.getAccessibilityInfo();

		// assert
		assert.strictEqual(oInfo.description, "Placeholder Tooltip", "Description");
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
		assert.strictEqual(oInfo.description, "Placeholder Tooltip Description", "Description");

		// act
		this.multiInput1.addToken(new Token({text: "Token1"}));
		this.multiInput1.addToken(new Token({text: "Token2"}));
		this.multiInput1.setDescription("Description");
		oInfo = this.multiInput1.getAccessibilityInfo();

		// assert
		assert.strictEqual(oInfo.description, "Placeholder Tooltip Description Token1 Token2", "Description");
	});

	QUnit.test("Tokens information should be read out", function(assert) {
		// arrange
		var sInvisibleTextId = this.multiInput1.getAggregation("tokenizer").getTokensInfoId(),
			oInvisibleText = sap.ui.getCore().byId(sInvisibleTextId);

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_TOKEN"), "'MultiInput may contain tokens' text is set.");

		// act
		this.multiInput1.addToken(new Token({text: "Token1"}));

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_ONE_TOKEN"), "'MultiInput contains 1 token' text is set.");

		// act
		this.multiInput1.addToken(new Token({text: "Token2"}));

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS", this.multiInput1.getTokens().length), "'MultiInput contains N tokens' text is set.");

		this.multiInput1.focus();
		assert.ok(this.multiInput1.getFocusDomRef().getAttribute('aria-describedby').indexOf(oInvisibleText.getId()) !== -1, "Tokens information is added to the input");
	});

	QUnit.test("Placeholder opacity", function(assert) {
		// assert
		assert.ok(!this.multiInput1.$().hasClass("sapMMultiInputHasTokens"), "MultiInput placeholder shows placeholder");

		// act
		this.multiInput1.addToken(new Token({text: "Token2"}));

		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(this.multiInput1.$().hasClass("sapMMultiInputHasTokens"), "MultiInput placeholder doesn't show placeholder");
	});

	QUnit.module("Copy/Cut Functionality", {
		beforeEach: function() {
			this.multiInput1 = new MultiInput();
			this.multiInput1.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
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


		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("keydown", this.multiInput1.getFocusDomRef(), {
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

		sap.ui.getCore().applyChanges();

		qutils.triggerEvent("keydown", this.multiInput1.getFocusDomRef(), {
			which: KeyCodes.C,
			ctrlKey: true
		});

		// assert
		assert.ok(oSpy.called, "Tokenizer's copy method is called");

		// cleanup
		oSpy.restore();
	});

	QUnit.test("Paste (with suggestions)", function(assert) {
		/* TODO remove after 1.62 version */
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

			sap.ui.getCore().applyChanges();
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

		sap.ui.getCore().applyChanges();

		var result = this.multiInput1._convertTextToToken("  token");

		// assert
		assert.strictEqual(result.getText(), "token", "then the return value is correct");
	});

	QUnit.module("Collapsed state (N-more)", {
		beforeEach : function() {
			this.multiInput = new MultiInput();
			this.multiInput.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.multiInput.destroy();
		}
	});

	QUnit.test("Popover's initial state", function(assert) {
		var oSpy = sinon.spy(MultiInput.prototype, "_openSelectedItemsPicker"),
			oSelectedItemsList;
		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		sap.ui.getCore().applyChanges();

		// act
		if (Device.browser.internet_explorer) {
			this.multiInput._tokenizer.$().click();
		} else {
			this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		}

		this.clock.tick(1);

		// assert
		oSelectedItemsList = this.multiInput._getSelectedItemsPicker().getContent()[0];
		assert.ok(oSpy.called, "_openSelectedItemsPicker is called when N-more is pressed");
		assert.strictEqual(oSelectedItemsList.getMetadata().getName(), "sap.m.List", "The popover contains a list");
		assert.strictEqual(oSelectedItemsList.getItems().length, 4, "sap.m.List", "The list contains the correct number of items");

		// clean up
		oSpy.restore();
	});

	QUnit.test("Popover's interaction", function(assert) {
		var oPicker;
		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		sap.ui.getCore().applyChanges();

		// act
		if (Device.browser.internet_explorer) {
			this.multiInput._tokenizer.$().click();
		} else {
			this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		}

		oPicker = this.multiInput._getSelectedItemsPicker();
		this.clock.tick(100);

		// deselect the first item
		jQuery(oPicker.getContent()[0].getItems()[0]).tap();
		// assert
		assert.strictEqual(this.multiInput.getTokens().length, 3, "A token was deleted after deselecting an item from the popover");

		//close and open the picker
		oPicker.close();
		// act
		if (Device.browser.internet_explorer) {
			this.multiInput._tokenizer.$().click();
		} else {
			this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		}
		//assert
		assert.strictEqual(oPicker.getContent()[0].getItems().length, 3, "The items in the list are updated");
	});

	QUnit.test("onfocusin", function(assert) {
		var oIndicator,
			oEventMock = {
				target : {
					classList: {
						contains: function () {
							return false;
						}
					}
				}
			};
		this.multiInput.setWidth("200px");
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		sap.ui.getCore().applyChanges();

		oIndicator = this.multiInput.$().find(".sapMTokenizerIndicator");

		//assert
		assert.ok(oIndicator[0], "A n-more label is rendered");

		//close and open the picker
		this.multiInput.onfocusin(oEventMock);
		// assert
		assert.ok(oIndicator.hasClass("sapUiHidden"), "The n-more label is hidden on focusin.");
	});

	QUnit.test("_mapTokenToListItem", function(assert) {
		var oToken = new Token({
			text: "text123",
			key: "key123"
		}), oListItem = this.multiInput._mapTokenToListItem(oToken);

		//assert
		assert.strictEqual(oListItem.getTitle(), "text123", "The listItem's title is correct.");
		assert.strictEqual(oListItem.data("key"), "key123", "The listItem's customData key is correct.");
		assert.strictEqual(oListItem.data("text"), "text123", "The listItem's customData text is correct.");
	});

	QUnit.test("_syncTokensWithSelection - selection", function(assert) {
		var oListItem = new StandardListItem(), aTokens,
			oSpy = this.spy(this.multiInput, "addToken"),
			oTokenUpdateSpy = this.spy(this.multiInput, "fireTokenUpdate");

		oListItem.data("key", "key123");
		oListItem.data("text", "text123");
		oListItem.data("tokenId", "token");

		// assert
		aTokens = this.multiInput.getTokens();
		assert.strictEqual(aTokens.length, 0, "Initially the multiinput is empty.");

		// act
		this.multiInput._syncTokensWithSelection(oListItem, true);
		aTokens = this.multiInput.getTokens();

		// assert
		assert.ok(oSpy.called, "addToken is called.");
		assert.ok(oTokenUpdateSpy.called, "tokenUpdate is fired.");
		assert.strictEqual(aTokens.length, 1, "One token was added");
		assert.strictEqual(aTokens[0].getText(), "text123", "The token's text is correct.");
		assert.strictEqual(aTokens[0].getKey(), "key123", "The token's key is correct.");
		assert.strictEqual(oListItem.data("tokenId"), aTokens[0].getId(), "The new token id is correctly recorder in the item");

		// clean up
		oSpy.restore();
	});

	QUnit.test("_syncTokensWithSelection - deselection", function(assert) {
		var oListItem = new StandardListItem(), aTokens,
			oToken = new Token("token", {text: "text123", key: "key123"}),
			oSpy = this.spy(this.multiInput._tokenizer, "removeToken"),
			oTokenDestroySpy = this.spy(Token.prototype, "destroy");

		this.multiInput.addToken(oToken);
		oListItem.data("key", "key123");
		oListItem.data("text", "text123");
		oListItem.data("tokenId", "token");

		// assert
		aTokens = this.multiInput.getTokens();
		assert.strictEqual(aTokens.length, 1, "Initially the multiinput has one token.");

		// act
		this.multiInput._syncTokensWithSelection(oListItem, false);
		assert.ok(oTokenDestroySpy.called, "The token is destroyed on deselection.");
		aTokens = this.multiInput.getTokens();

		// assert
		assert.ok(oSpy.called, "addToken is called.");
		assert.strictEqual(aTokens.length, 0, "The multiinput is empty after deselection.");

		// clean up
		oSpy.restore();
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
		oSelectedItemsList = this.multiInput._getTokensList();
		//assert
		assert.strictEqual(oSelectedItemsList.getMetadata().getName(), "sap.m.List", "_getTokensList method return a list");

		// act
		this.multiInput._fillList();
		// assert
		assert.strictEqual(oSelectedItemsList.getItems().length, 4, "_fillList adds the correct number of items in the list");
	});

	QUnit.test("_getSelectedItemsPicker", function(assert) {
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		// act
		var oSelectedItemsPicker = this.multiInput._getSelectedItemsPicker();
		//assert
		assert.strictEqual(oSelectedItemsPicker.getMetadata().getName(), "sap.m.Popover", "_getSelectedItemsPicker method return a popover.");

		// assert
		assert.strictEqual(oSelectedItemsPicker.getContent()[0].getMetadata().getName(), "sap.m.List", "The popover contains a list.");
	});

	QUnit.test('Selected items list on mobile', function(assert) {
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
		var oStub = sinon.stub(	this.multiInput1._oSuggPopover._oPopover, "open");


		sap.ui.getCore().applyChanges();
		// act
		if (Device.browser.internet_explorer) {
			this.multiInput1._tokenizer.$().click();
		} else {
			this.multiInput1.$().find(".sapMTokenizerIndicator")[0].click();
		}
		this.clock.tick(1000);

		assert.ok(oStub.called, "The suggestion dialog is opened on click on N-more");
		assert.ok(this.multiInput1._bShowSelectedButton.getPressed(), "The filtering button is pressed on initial opening");
		assert.ok(this.multiInput1._getTokensList().getVisible(), "The list with tokens is visible");

		// clean up
		oStub.restore();
		this.multiInput1.destroy();
	});

	QUnit.test("Read-only popover ", function(assert) {
		//arrange
		var multiInput = new MultiInput({editable: true});
		// create the lazy initializated read-only popover
		multiInput._getReadOnlyPopover();

		var fnReadOnlyPopDestroySpy = this.spy(multiInput._oReadOnlyPopover, "destroy");
		multiInput.destroy();

		// assert
		assert.strictEqual(fnReadOnlyPopDestroySpy.callCount, 1, "The tokenizer was destroyed once during cloning");

		// clean up
		fnReadOnlyPopDestroySpy.restore();
	});

	QUnit.test("Read-only popover should be closed on focusout", function (assert) {
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
		}), oListItemRef;

		// act
		oMultiInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oMultiInput._oReadOnlyPopover, "Readonly Popover should be created");

		// act
		oMultiInput._handleIndicatorPress();
		this.clock.tick(300);

		oMultiInput.onsapfocusleave({});
		this.clock.tick(300);

		assert.notOk(oMultiInput._oReadOnlyPopover.isOpen(), "Readonly Popover should be closed");

		// delete
		oMultiInput.destroy();
	});

	QUnit.test("Read-only popover should not be closed when the scrolbar inside is clicked", function (assert) {
		// arrange
		var oMultiInput = new sap.m.MultiInput({
			editable: false,
			width: "200px",
			tokens: [
				new sap.m.Token({ text: "XXXX" }),
				new sap.m.Token({ text: "XXXX" }),
				new sap.m.Token({ text: "XXXX" }),
				new sap.m.Token({ text: "XXXX" })
			]
		}), oListItemRef;

		// act
		oMultiInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oMultiInput._oReadOnlyPopover, "Readonly Popover should be created");

		// act
		oMultiInput._handleIndicatorPress();
		this.clock.tick(300);

		oMultiInput.onsapfocusleave({
			relatedControlId: oMultiInput._oReadOnlyPopover.getId()
		});
		this.clock.tick(300);

		assert.ok(oMultiInput._oReadOnlyPopover.isOpen(), "Readonly Popover should remain open");

		// delete
		oMultiInput.destroy();
	});

	QUnit.test("Read-only popover should be closed on after selection of an item from its list", function (assert) {
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
		}), oListItemRef;

		// act
		oMultiInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiInput._handleIndicatorPress();
		this.clock.tick(300);

		sap.ui.test.qunit.triggerEvent("tap", oMultiInput._oReadOnlyPopover.getContent()[0].getItems()[0].getDomRef());
		this.clock.tick(300);

		// assert
		assert.notOk(oMultiInput._oReadOnlyPopover.isOpen(), "Read-only Popover should be closed");

		// delete
		oMultiInput.destroy();
	});

	QUnit.test("Read-only popover is opened after N-more is pressed", function(assert){
		var oPicker;
		this.multiInput.setWidth("200px");
		this.multiInput.setEditable(false);
		this.multiInput.setEnabled(true);
		this.multiInput.setTokens([
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"}),
			new Token({text: "XXXX"})
		]);

		sap.ui.getCore().applyChanges();

		// act
		if (Device.browser.msie) {
			this.multiInput._tokenizer.$().click();
		} else {
			this.multiInput.$().find(".sapMTokenizerIndicator")[0].click();
		}

		oPicker = this.multiInput._getReadOnlyPopover();

		assert.equal(oPicker.isOpen(), true, "The readonly popover is opened on click on N-more");
	});

	QUnit.test("tokenizer's adjustTokensVisibility is called on initial rendering", function(assert) {
		//arrange
		var oMultiInput = new MultiInput(),
			tokenizerSpy = this.spy(oMultiInput._tokenizer, "_adjustTokensVisibility");

		// act
		oMultiInput.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		// assert
		assert.ok(oMultiInput._tokenizer._getAdjustable(), "the tokenizer is adjustable");
		assert.ok(tokenizerSpy.called, "tokenizer's _adjustTokensVisibility is called");

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
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiInput.$("inner").css("opacity"), "1", "The input value remains visible, if the n-more label is hidden");

		oMultiInput.setTokens([
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" }),
			new Token({ text: "XXXX" })
		]);

		// act
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oMultiInput.$("inner").css("opacity"), "0", "The input value is not visible, if the n-more label is shown");

		// clean up
		oMultiInput.destroy();
	});

	QUnit.test("Do not listen for resize while resizing", function (assert) {
		// Setup
		var oRegisterResizeSpy = this.spy(this.multiInput, "_registerResizeHandler"),
			oDeregisterResizeSpy = this.spy(this.multiInput, "_deregisterResizeHandler"),
			oMaxWidthSetterSpy = this.spy(this.multiInput._tokenizer, "setMaxWidth");

		// Act
		this.multiInput._onResize();

		//Assert
		assert.ok(oDeregisterResizeSpy.calledOnce, "Deregister resize handler");
		assert.ok(oRegisterResizeSpy.calledOnce, "Register resize handler");
		assert.ok(oMaxWidthSetterSpy.calledOnce, "Tokens MaxWidth setter called");
		assert.ok(oDeregisterResizeSpy.calledBefore(oRegisterResizeSpy), "Deregister, do something and register again");
		assert.ok(oDeregisterResizeSpy.calledBefore(oMaxWidthSetterSpy), "Deregister and the resize");
		assert.ok(oMaxWidthSetterSpy.calledBefore(oRegisterResizeSpy), "Finally, subscribe again for the resize handler");
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
		sap.ui.getCore().applyChanges();

		// Act
		oMultiInput.destroy();
		oMultiInput = new MultiInput("test-input").placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(true, "If there's no exception so far, everything is ok");

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

			sap.ui.getCore().applyChanges();
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
			oMI = new MultiInput({
				suggestionItems: [oItem1]
			}),
			oSyncInput = this.spy(oMI, "_syncInputWidth");

		oMI.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oSyncInput.callCount, 1);

		oMI.setSelectionItem(oItem1, true);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oSyncInput.callCount, 2);

		oMI.setTokens([]);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oSyncInput.callCount, 3);

		oSyncInput.restore();
		oMI.destroy();
	});
});
