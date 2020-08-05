/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/util/MockServer",
	"sap/m/SuggestionItem",
	"sap/m/SearchField",
	"sap/ui/Device",
	"jquery.sap.keycodes",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	MockServer,
	SuggestionItem,
	SearchField,
	Device,
	jQuery
) {
	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);


	//
	// Test for the suggestion functionality of the sap.m.SearchField control.
	// Other functional tests see SearchField.qunit.html.
	//



	function createStaticSuggestionItems(a){
		var items = [];
		a.forEach(function(i){
			items.push(new SuggestionItem({
				text : "I" + i,
				description : "D" + i,
				key: i,
				icon: "sap-icon://search"
			}));
		});
		return items;
	}

	var oSF;

	QUnit.test("static values", function(assert) {
		var aItems = ["001", "002", "003", "004", "005"];

		oSF = new SearchField({
			suggestionItems: createStaticSuggestionItems(aItems),
			placeholder: "search",
			enableSuggestions: true,
			//search:onSearch,
			suggest: function(event){
				event.getSource().suggest();
			}
		});

		// arrange
		oSF.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSF.getSuggestionItems().length, aItems.length, "The number of suggestion items is correct");

		// cleanup
		//oSF.destroy();
	});

	QUnit.module("Test the suggest function");

	// test properties
	QUnit.test("Properties", function(assert) {
		assert.equal(oSF.getWidth(), '100%', "Default value of the property Width is 100%s");

	});

	QUnit.test("call the suggest() function", function(assert) {
		// action
		oSF.suggest();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oSF._oSuggest.isOpen(), true, "The suggestion popup opens");
		assert.strictEqual(oSF.$('SuggDescr').text()[0], "5", "Available results are correct");

		assert.ok(!!jQuery(".sapMSuL:visible").length, "The suggestions list is visible");

		var popupId = jQuery(".sapMSuL:visible").parents(".sapMPopup-CTX").attr("id");
		var popup = sap.ui.getCore().byId(popupId);
		assert.ok(!!popup, "popup exists");

		assert.ok(popup.getDomRef().style.minWidth, 'popup min-width is set');

		if (!popup) {
			return;
		}

		var fnPopupSpy = this.spy(popup, "close");

		// close popup
		oSF.suggest(false);
		this.clock.tick(1000);

		if (Device.system.phone) {
			assert.ok(popup.isOpen(), "Suggest(false) does not close the popup on phones");
			popup.close();
			this.clock.tick(1000);
		}

		assert.ok(!jQuery(".sapMSuL").parents(".sapMPopup-CTX:visible").length, "The suggestions list is not visible after close");
		assert.ok(fnPopupSpy && fnPopupSpy.callCount, "Popup close was called");
	});

	QUnit.module("Aggregations");

	QUnit.test("update suggestions by aggregation changes", function(assert) {

		// action
		oSF.suggest();
		this.clock.tick(1000);

		var fnUpdateSpy = this.spy(oSF._oSuggest, "update");

		var item = createStaticSuggestionItems(["newItem"])[0];
		var count = oSF.getSuggestionItems().length;
		oSF.addSuggestionItem(item);
		this.clock.tick(1000);
		assert.strictEqual(oSF.getSuggestionItems().length, count + 1, "A new suggestion item has been added");
		assert.strictEqual(fnUpdateSpy.callCount, 1, "Suggest update() called only once");

		oSF.removeSuggestionItem(item);
		this.clock.tick(1000);
		assert.strictEqual(oSF.getSuggestionItems().length, count, "The suggestion item has been deleted");
		assert.strictEqual(fnUpdateSpy.callCount, 2, "Suggest update() called two times");

		oSF.suggest(false);
		this.clock.tick(1000);
	});

	QUnit.module("User interaction");

	QUnit.test("select an item via keyboard", function(assert) {

		// action
		oSF.suggest();
		this.clock.tick(1000);

		sap.ui.test.qunit.triggerKeydown(oSF.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.strictEqual(oSF._oSuggest.getSelected(), 0, "The first item is selected");
		assert.strictEqual(oSF.getValue(), oSF.getSuggestionItems()[0].getSuggestionText(), "Suggestion text value is set to the search field");
		assert.strictEqual(oSF.$('I').attr('aria-activedescendant'), oSF.getSuggestionItems()[0].getId(), "aria-activedescendant is correct");

		sap.ui.test.qunit.triggerKeydown(oSF.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		assert.strictEqual(oSF._oSuggest.getSelected(), 1, "The second item is selected");
		assert.strictEqual(oSF.getValue(), oSF.getSuggestionItems()[1].getSuggestionText(), "Suggestion text value is set to the search field");
		assert.strictEqual(oSF.$('I').attr('aria-activedescendant'), oSF.getSuggestionItems()[1].getId(), "aria-activedescendant is correct");

		sap.ui.test.qunit.triggerKeydown(oSF.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		assert.strictEqual(oSF._oSuggest.getSelected(), 0, "The first item is selected again");
		assert.strictEqual(oSF.getValue(), oSF.getSuggestionItems()[0].getSuggestionText(), "Suggestion text value is set to the search field");
		assert.strictEqual(oSF.$('I').attr('aria-activedescendant'), oSF.getSuggestionItems()[0].getId(), "aria-activedescendant is correct");
	});

	QUnit.test("Enter closes suggestions", function(assert){
		sap.ui.test.qunit.triggerKeydown(oSF.getDomRef("I"), jQuery.sap.KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeyup(oSF.getDomRef("I"), jQuery.sap.KeyCodes.ENTER);
		this.clock.tick(1000);
		assert.ok(!oSF._oSuggest.isOpen(), "Picker is closed after ENTER");
		assert.notOk(oSF.$('SuggDescr').text(), "'Available results' text is cleared");
	});

	QUnit.test("Escape closes suggestions", function(assert) {
		// action
		oSF.setValue("ABCD");
		oSF.suggest();
		this.clock.tick(1000);


		// press ESCAPE when the suggestions are visible
		sap.ui.test.qunit.triggerKeydown(oSF.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		sap.ui.test.qunit.triggerKeyup(oSF.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);

		this.clock.tick(1000);

		assert.ok(!oSF._oSuggest.isOpen(), "Picker is closed after ESCAPE");
		assert.strictEqual(oSF.getValue(), "ABCD", "Escape closes suggestions and keeps the value");
		assert.notOk(oSF.$('SuggDescr').text(), "'Available results' text is cleared");
	});

	QUnit.test("applyFocusInfo test", function (assert) {
		var 	oInput = oSF.getFocusDomRef(),
				$SF = jQuery(oInput);

		// act - get focus info and change cursor position of the dom element
		var oFocusInfo = oSF.getFocusInfo();
		oSF.setValue("SomethingThatIsNotSameWithTheInitialValue");
		$SF.cursorPos(10);

		// act - reapply last known focus info
		oSF.applyFocusInfo(oFocusInfo);

		// assertion
		assert.strictEqual($SF.cursorPos(), oFocusInfo.cursorPos, "Cursor position is set to the correct position after apply focus.");

	});

	QUnit.test("Clear method test", function(assert) {
		// action
		var toValue = 'ABCD';
		var fnSpyFireLiveChange = this.spy(oSF, 'fireLiveChange');
		var fnFireSearch = this.spy(oSF, 'fireSearch');

		oSF.clear({value: toValue});

		this.clock.tick(1000);

		assert.strictEqual(oSF.getValue(), toValue, "Escape closes suggestions and keeps the value");
		assert.strictEqual(fnFireSearch.callCount, 1, "Clear method fires fireSearch event");
		assert.strictEqual(fnSpyFireLiveChange.callCount, 1, "Clear method fires fireLiveChange event");

		//call again with the same value - should be ignored
		oSF.clear({value: toValue});

		assert.strictEqual(fnFireSearch.callCount, 1, "Clear method is not fired again as the value is the same");


		fnSpyFireLiveChange.restore();
		fnFireSearch.restore();
	});

	QUnit.test("Background color on blur is restored", function(assert) {
		var oMockEvent = {type: "blur"};
		oSF.onBlur(oMockEvent);
		this.clock.tick(1000);

		assert.strictEqual(oSF.$().hasClass( "sapMFocus"), false, "Blur event processing restores the previous background color");
	});

	QUnit.test("onInput test - when change or paste in the input", function(assert) {
		var 	oInput = oSF.getFocusDomRef();
		var fnSpyFireLiveChange = this.spy(oSF, 'fireLiveChange');
		var fnFireSuggest = this.spy(oSF, 'fireSuggest');

		// act - set control value and triggers on input processing
		oSF.setValue("SomethingThatIsNotSameWithTheInitialValue");
		oInput.value = "abcd";
		oSF.onInput();
		this.clock.tick(1000);


		// assertion
		assert.strictEqual(fnSpyFireLiveChange.callCount, 1, "LiveChange event is fired");
		assert.strictEqual(fnFireSuggest.callCount, 1, "FireSuggest event is fired");

		fnSpyFireLiveChange.restore();
		fnFireSuggest.restore();
	});

	QUnit.test("onSearch test - event ", function(assert) {
		var 	oInput = oSF.getFocusDomRef();
		var fnFireSearch = this.spy(oSF, 'fireSearch');
		var toValue = 'abcd';
		this.stub(Device, "system", {
			desktop: false,
			phone: false,
			tablet: true
		});

		// act - triggers on Search processing
		oInput.value = toValue;
		oSF.onSearch();
		this.clock.tick(1000);


		// assertion
		assert.strictEqual(fnFireSearch.callCount, 1, "FireSearch event is fired");
		assert.strictEqual(oSF.getValue(), toValue, "Search event sets the control value");

		fnFireSearch.restore();
		this.stub(Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});
	});

	QUnit.module("Formatting");

	QUnit.test("Search value is bold in suggestions", function(assert) {

		// set value and open suggestions
		oSF.suggest();
		oSF.setValue("003");
		oSF._oSuggest.update();

		this.clock.tick(1000);

		// check highlights
		assert.strictEqual(jQuery("b")[0] && jQuery("b")[0].innerHTML, oSF.getValue(), "Search value is highlighted in suggestions");

		oSF.setValue("002");
		oSF._oSuggest.update();
		this.clock.tick(1000);

		assert.strictEqual(jQuery("b")[0] && jQuery("b")[0].innerHTML, oSF.getValue(), "Changed search value is highlighted in suggestions");

		// close
		oSF.suggest(false);
		this.clock.tick(1000);
	});

	QUnit.module("Delayed suggestions");
	QUnit.test("Test suggestion to be fired after 400ms onInput", function(assert) {

		var fnFireSuggest = this.spy(oSF, 'fireSuggest');
		// set value and trigger onInput
		oSF.getFocusDomRef().value = "D";
		oSF.onInput();

		oSF.getFocusDomRef().value = "D0";
		oSF.onInput();

		oSF.getFocusDomRef().value = "D00";
		oSF.onInput();

		this.clock.tick(400);
		assert.strictEqual(fnFireSuggest.callCount, 1,  "Suggest should be fired ones");

		fnFireSuggest.restore();
	});

	QUnit.module("Clean up");
	QUnit.test("cleanup", function(assert){
		oSF.destroy();
		this.clock.tick(1000);
		assert.ok(!oSF.getDomRef(), "The search field is removed");
	});
});