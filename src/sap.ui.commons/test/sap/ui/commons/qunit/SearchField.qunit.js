/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/SearchField",
	"sap/ui/core/search/OpenSearchProvider",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library"
], function(
	qutils,
	createAndAppendDiv,
	SearchField,
	OpenSearchProvider,
	jQuery,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5",
						"uiArea6", "uiArea7", "uiArea8", "uiArea9", "uiArea10", "uiArea11"]);



	var createSearchField = function(iIdSuffix, oProps){
		if (!oProps) {oProps = {};}
		var oSearch = new SearchField("search" + iIdSuffix, oProps);
		oSearch.placeAt("uiArea" + iIdSuffix);
		return oSearch;
	};


	var oSearch1 = createSearchField(1);
	var oSearch2 = createSearchField(2, {enableListSuggest: false});
	var oSearch3 = createSearchField(3, {enableListSuggest: false, enableClear: true, startSuggestion: 0});
	var oSearch4 = createSearchField(4, {startSuggestion: 1});
	var oSearch5 = createSearchField(5, {enableClear: true, startSuggestion: 20});
	var oSearch6 = createSearchField(6, {maxHistoryItems: 5});
	var oSearch7 = createSearchField(7, {enableListSuggest: false});
	var oSearch8 = createSearchField(8, {searchProvider: new OpenSearchProvider({
		suggestType: "xml",
		suggestUrl: "test-resources/sap/ui/commons/qunit/searchprovidertest.xml",
		icon: sap.ui.require.toUrl("sap/ui/core/mimes/logo/txtonly_16x16.ico")
	})});
	var oSearch9 = createSearchField(9, {searchProvider: new OpenSearchProvider({
		suggestType: "json",
		suggestUrl: "test-resources/sap/ui/commons/qunit/searchprovidertest.json"
	})});
	var oSearch10 = createSearchField(10, {
		suggest: function(oEvent){
			var sVal = oEvent.getParameter("value");
			var aSuggestions = ["a", "b"];
			oSearch10.suggest(sVal, aSuggestions);
		}
	});
	var oSearch11 = createSearchField(11, {enableListSuggest: false, enableFilterMode: true});



	var triggerInputSequence = function(assert, oSearchField, iCount, bDoReset) {
		if (bDoReset){
			var sNew = "";
			oSearchField.setValue(sNew);
			assert.equal(oSearchField.getValue(), sNew, "SearchField' value should have changed.");
			assert.equal(oSearchField.getFocusDomRef().value, sNew, "SearchField' value should have changed in HTML.");
		}
		var aKeys = ["S", "a", "p", "U", "i", "5"];
		var iLength = Math.min(iCount, aKeys.length);
		for (var i = 0; i < iLength; i++){
			qutils.triggerCharacterInput(oSearchField.getFocusDomRef(), aKeys[i]);
			qutils.triggerKeyEvent("keyup", oSearchField.getFocusDomRef(), aKeys[i]);
		}
	};

	var checkFocus = function(assert, sId, sText, bExpectFocus){
		var sActiveId = document.activeElement ? document.activeElement.id : "<undef>";
		if (bExpectFocus){
			assert.ok(sActiveId === sId, sText + " (" + sId + "): " + sActiveId);
		} else {
			assert.ok(sActiveId != sId, sText + " (" + sId + "): " + sActiveId);
		}
	};

	var checkVisible = function(sId, bExpectVisible){
		var bVisible = jQuery("#" + sId).is(":visible");
		return (bExpectVisible && bVisible) || (!bExpectVisible && !bVisible);
	};

	var checkSearch = function(assert, sType, oSearchField, bReadOnly, bWithClear) {
		var done = assert.async();
		if (!bReadOnly){
			oSearchField.focus();
		}

		setTimeout(function(){
			if (!/^ie/.test(jQuery("html").attr("data-sap-ui-browser"))){ //TODO check why this does not work for IE
				checkFocus(assert, oSearchField.getFocusDomRef().id, "SearchField has " + (bReadOnly ? "no " : "") + "focus before user action", !bReadOnly);
			}
			var bEventHandlerCalled = false;
			var handler = function(oControlEvent){
				assert.equal(oControlEvent.getParameter("query"), "SapUi5", "Value of search event:");
				oSearchField.detachSearch(handler);
				bEventHandlerCalled = true;
			};
			oSearchField.attachSearch(handler);
			triggerInputSequence(assert, oSearchField, bReadOnly ? 0 : 6, true); //Reset only in readonly case
			if (sType == "click"){
				qutils.triggerEvent("click", oSearchField._ctrl.getId() + "-searchico");
			} else {
				qutils.triggerKeydown(oSearchField.getFocusDomRef(), "ENTER");
			}

			var bNoChange = bReadOnly || (bWithClear && sType == "click");
			if (bNoChange){
				assert.ok(!bEventHandlerCalled, "Search handler not called.");
				oSearchField.detachSearch(handler);
			} else {
				assert.ok(bEventHandlerCalled, "Search handler called.");
			}

			assert.equal(jQuery(oSearchField.getFocusDomRef()).val(), bNoChange ? "" : "SapUi5", "SearchField' value after user action (HTML)");
			assert.equal(oSearchField.getValue(), bNoChange ? "" : "SapUi5", "SearchField' value after user action (Property)");
			checkFocus(assert, oSearchField.getFocusDomRef().id, "SearchField has " + (bReadOnly ? "no " : "") + "focus after user action", !bReadOnly);

			done();

			// focus is removed for the next test
			if ( document.activeElement ) {
				document.activeElement.blur();
			}
		}, 10);
	};

	var checkSuggestion = function(assert, oSearchField, fSecondPassCheck){
		var done = assert.async();
		oSearchField.clearHistory();
		oSearchField.focus();

		var sSuggestValue = "INITIAL";
		var handler = function(oControlEvent){
			oSearchField.detachSuggest(handler);
			sSuggestValue = oControlEvent.getParameter("value");
		};
		oSearchField.attachSuggest(handler);

		triggerInputSequence(assert, oSearchField, 2, true);
		setTimeout(function(){
			oSearchField.detachSuggest(handler);
			assert.equal(sSuggestValue, "INITIAL", "No suggestions when input has not yet reach configured 'startSuggestion' value");
			sSuggestValue = "INITIAL";
			oSearchField.attachSuggest(handler);
			triggerInputSequence(assert, oSearchField, 3, false);
			setTimeout(function(){
				oSearchField.detachSuggest(handler);
				var aItems = [];
				if (oSearchField.getEnableListSuggest()){
					assert.ok(checkVisible(oSearchField._lb.getId(), true), "List is visible");
					aItems = oSearchField._lb.getItems();
				}
				fSecondPassCheck(sSuggestValue, aItems);
				if (oSearchField.getEnableListSuggest()){
					var bEventHandlerCalled = false;
					var handler2 = function(oControlEvent){
						assert.equal(oControlEvent.getParameter("query"), "b", "Value of search event:");
						oSearchField.detachSearch(handler2);
						bEventHandlerCalled = true;
					};
					oSearchField.attachSearch(handler2);
					qutils.triggerEvent("click", aItems[1].getId());
					assert.ok(bEventHandlerCalled, "Search Event triggered");
					assert.equal(jQuery(oSearchField.getFocusDomRef()).val(), "b", "SearchField' value after user action (HTML)");
					assert.equal(oSearchField.getValue(), "b", "SearchField' value after user action (Property)");
					if (!bEventHandlerCalled){
						oSearchField.detachSearch(handler2);
					}
				}
				done();
			}, 1000);
		}, 500);
	};



	QUnit.module("Properties and Aggregations");

	QUnit.test("Default Values", function(assert) {
		assert.equal(oSearch1.getEnableListSuggest(), true, "Default 'enableListSuggest'");
		assert.equal(oSearch1.getShowListExpander(), true, "Default 'showListExpander'");
		assert.equal(oSearch1.getEnableClear(), false, "Default 'enableClear'");
		assert.equal(oSearch1.getShowExternalButton(), false, "Default 'showExternalButton'");
		assert.equal(oSearch1.getValue(), "", "Default 'value'");
		assert.equal(oSearch1.getWidth(), "", "Default 'width'");
		assert.equal(oSearch1.getEnabled(), true, "Default 'enabled'");
		assert.equal(oSearch1.getEditable(), true, "Default 'editable'");
		assert.equal(oSearch1.getVisible(), true, "Default 'visible'");
		assert.equal(oSearch1.getEnableFilterMode(), false, "Default 'enableFilterMode'");
		assert.equal(oSearch1.getMaxLength(), 0, "Default 'maxLength'");
		assert.equal(oSearch1.getPlaceholder(), "", "Default 'placeholder'");
		assert.equal(oSearch1.getValueState(), ValueState.None, "Default 'valueState'");
		assert.equal(oSearch1.getTextAlign(), "Begin", "Default 'textAlign'");
		assert.equal(oSearch1.getVisibleItemCount(), 20, "Default 'visibleItemCount'");
		assert.equal(oSearch1.getStartSuggestion(), 3, "Default 'startSuggestion'");
		assert.equal(oSearch1.getMaxSuggestionItems(), 10, "Default 'maxSuggestionItems'");
		assert.equal(oSearch1.getMaxHistoryItems(), 0, "Default 'maxHistoryItems'");
		assert.equal(oSearch1.getSearchProvider(), null, "Default aggregation 'searchProvider'");
	});

	QUnit.test("Custom Values", function(assert) {
		oSearch1.setEnableListSuggest(false);
		oSearch1.setShowListExpander(false);
		oSearch1.setEnableClear(true);
		oSearch1.setShowExternalButton(true);
		oSearch1.setValue("Hello");
		oSearch1.setWidth("200px");
		oSearch1.setEnabled(false);
		oSearch1.setEditable(false);
		oSearch1.setVisible(false);
		oSearch1.setEnableFilterMode(true);
		oSearch1.setMaxLength(5);
		oSearch1.setPlaceholder("Click to search");
		oSearch1.setValueState(ValueState.Error);
		oSearch1.setTextAlign("End");
		oSearch1.setVisibleItemCount(10);
		oSearch1.setStartSuggestion(5);
		oSearch1.setMaxSuggestionItems(5);
		oSearch1.setMaxHistoryItems(5);
		oSearch1.setSearchProvider(new OpenSearchProvider("search1_provider"));

		assert.equal(oSearch1.getEnableListSuggest(), false, "Custom 'enableListSuggest'");
		assert.equal(oSearch1.getShowListExpander(), false, "Custom 'showListExpander'");
		assert.equal(oSearch1.getEnableClear(), true, "Custom 'enableClear'");
		assert.equal(oSearch1.getShowExternalButton(), true, "Custom 'showExternalButton'");
		assert.equal(oSearch1.getValue(), "Hello", "Custom 'value'");
		assert.equal(oSearch1.getWidth(), "200px", "Custom 'width'");
		assert.equal(oSearch1.getEnabled(), false, "Custom 'enabled'");
		assert.equal(oSearch1.getEditable(), false, "Custom 'editable'");
		assert.equal(oSearch1.getVisible(), false, "Custom 'visible'");
		assert.equal(oSearch1.getEnableFilterMode(), true, "Custom 'enableFilterMode'");
		assert.equal(oSearch1.getMaxLength(), 5, "Custom 'maxLength'");
		assert.equal(oSearch1.getPlaceholder(), "Click to search", "Custom 'placeholder'");
		assert.equal(oSearch1.getValueState(), ValueState.Error, "Custom 'valueState'");
		assert.equal(oSearch1.getTextAlign(), "End", "Custom 'textAlign'");
		assert.equal(oSearch1.getVisibleItemCount(), 10, "Custom 'visibleItemCount'");
		assert.equal(oSearch1.getStartSuggestion(), 5, "Custom 'startSuggestion'");
		assert.equal(oSearch1.getMaxSuggestionItems(), 5, "Custom 'maxSuggestionItems'");
		assert.equal(oSearch1.getMaxHistoryItems(), 5, "Custom 'maxHistoryItems'");
		assert.equal(oSearch1.getSearchProvider().getId(), "search1_provider", "Custom aggregation 'searchProvider'");
	});


	//***********************************
	QUnit.module("Appearance");

	QUnit.test("Visibility", function(assert) {
		oSearch1.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.ok(!oSearch1.getDomRef(), "Control is not visible, when property visible is set to false");
		oSearch1.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(!!oSearch1.getDomRef(), "Control is visible, when property visible is set to true");
	});

	QUnit.test("Width", function(assert) {
		oSearch1.setWidth("200px");
		oSearch1.setVisible(true);

		var checkWidth = function(bSuggList, bWithButton){
			oSearch1.setEnableListSuggest(bSuggList);
			oSearch1.setShowExternalButton(bWithButton);
			sap.ui.getCore().applyChanges();
			assert.equal(jQuery(oSearch1.getDomRef()).outerWidth(true), 200, "Width for SearchField (with suggestion list:" + bSuggList + ", with Button: " + bWithButton + ")");
		};

		checkWidth(false, false);
		checkWidth(false, true);
		checkWidth(true, false);
		checkWidth(true, true);
	});

	QUnit.test("ValueState", function(assert) {
		var iNumberOfClasses;
		oSearch1.setValueState(ValueState.None);
		sap.ui.getCore().applyChanges();
		iNumberOfClasses = jQuery("#" + oSearch1._ctrl.getId()).attr("class").split(" ").length;
		oSearch1.setValueState(ValueState.Error);
		sap.ui.getCore().applyChanges();
		assert.ok(iNumberOfClasses < jQuery("#" + oSearch1._ctrl.getId()).attr("class").split(" ").length, "style class added for error state");
		oSearch1.setValueState(ValueState.None);
		sap.ui.getCore().applyChanges();
		assert.ok(iNumberOfClasses === jQuery("#" + oSearch1._ctrl.getId()).attr("class").split(" ").length, "error state style class removed again");
	});

	QUnit.test("List Expander Visibility", function(assert) {
		assert.ok(checkVisible(oSearch6._ctrl.getId() + "-icon", true), "List expander is not visible");
		oSearch6.setShowListExpander(false);
		sap.ui.getCore().applyChanges();
		assert.ok(checkVisible(oSearch6._ctrl.getId() + "-icon", false), "List expander is not visible");
	});

	QUnit.test("Search Provider Icon Visibility", function(assert) {
		assert.ok(checkVisible(oSearch8._ctrl.getId() + "-providerico", true), "Search Provider Icon is visible when configured");
		assert.ok(checkVisible(oSearch9._ctrl.getId() + "-providerico", false), "Search Provider Icon is not visible when not configured");
	});


	//***********************************
	QUnit.module("Trigger Search", {
		beforeEach: function(){
			oSearch4.clearHistory();
		},
		afterEach: function(){
			oSearch2.setEnabled(true);
			oSearch4.setEnabled(true);
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("TextField - Click on icon", function(assert) {
		checkSearch(assert, "click", oSearch2, false, false);
	});

	QUnit.test("TextField - Press enter", function(assert) {
		checkSearch(assert, "enter", oSearch2, false, false);
	});

	QUnit.test("TextField - Click on icon (disabled)", function(assert) {
		oSearch2.setEnabled(false);
		sap.ui.getCore().applyChanges();
		checkSearch(assert, "click", oSearch2, true, false);
	});

	QUnit.test("ComboBox - Click on icon", function(assert) {
		oSearch4.clearHistory();
		checkSearch(assert, "click", oSearch4, false, false);
	});

	QUnit.test("ComboBox - Press enter", function(assert) {
		oSearch4.clearHistory();
		checkSearch(assert, "enter", oSearch4, false, false);
	});

	QUnit.test("ComboBox - Click on icon (disabled)", function(assert) {
		oSearch4.setEnabled(false);
		sap.ui.getCore().applyChanges();
		checkSearch(assert, "click", oSearch4, true, false);
	});


	//***********************************
	QUnit.module("Clear", {
		beforeEach: function(){
			oSearch5.clearHistory();
		},
		afterEach: function(){
			oSearch3.setEnabled(true);
			oSearch5.setEnabled(true);
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("TextField - Click on icon", function(assert) {
		checkSearch(assert, "click", oSearch3, false, true);
	});

	QUnit.test("TextField - Press enter", function(assert) {
		checkSearch(assert, "enter", oSearch3, false, true);
	});

	QUnit.test("TextField - Click on icon (disabled)", function(assert) {
		oSearch3.setEnabled(false);
		sap.ui.getCore().applyChanges();
		checkSearch(assert, "click", oSearch3, true, true);
	});

	QUnit.test("ComboBox - Click on icon", function(assert) {
		oSearch5.clearHistory();
		checkSearch(assert, "click", oSearch5, false, true);
	});

	QUnit.test("ComboBox - Press enter", function(assert) {
		oSearch5.clearHistory();
		checkSearch(assert, "enter", oSearch5, false, true);
	});

	QUnit.test("ComboBox - Click on icon (disabled)", function(assert) {
		oSearch5.setEnabled(false);
		sap.ui.getCore().applyChanges();
		checkSearch(assert, "click", oSearch5, true, true);
	});


	//***********************************
	QUnit.module("List Handling");

	QUnit.test("Open List with F4 - No List Expander", function(assert) {
		oSearch6.clearHistory();
		oSearch6.setShowListExpander(false);
		sap.ui.getCore().applyChanges();
		oSearch6.focus();
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
		qutils.triggerKeydown(oSearch6.getFocusDomRef(), "F4");
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is still not visible");
	});

	QUnit.test("Open List with F4 - no values", function(assert) {
		oSearch6.clearHistory();
		oSearch6.setShowListExpander(true);
		sap.ui.getCore().applyChanges();
		oSearch6.focus();
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
		qutils.triggerKeydown(oSearch6.getFocusDomRef(), "F4");
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
	});

	QUnit.test("Open List with click - no values", function(assert) {
		oSearch6.clearHistory();
		oSearch6.setShowListExpander(true);
		sap.ui.getCore().applyChanges();
		oSearch6.focus();
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
		qutils.triggerEvent("click", oSearch6._ctrl.getId() + "-icon");
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
	});

	QUnit.test("Open List with F4", function(assert) {
		oSearch6.focus();
		triggerInputSequence(assert, oSearch6, 1, true);
		qutils.triggerKeydown(oSearch6.getFocusDomRef(), "ENTER"); //Create History entry

		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
		qutils.triggerKeydown(oSearch6.getFocusDomRef(), "F4");
		assert.ok(checkVisible(oSearch6._lb.getId(), true), "List is  visible");
	});

	QUnit.test("Close List with ESCAPE", function(assert) {
		assert.ok(checkVisible(oSearch6._lb.getId(), true), "List is visible");
		qutils.triggerKeydown(oSearch6.getFocusDomRef(), "ESCAPE");
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
	});

	QUnit.test("Open List with click", function(assert) {
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
		qutils.triggerEvent("click", oSearch6._ctrl.getId() + "-icon");
		assert.ok(checkVisible(oSearch6._lb.getId(), true), "List is  visible");
	});

	QUnit.test("Close List with click", function(assert) {
		assert.ok(checkVisible(oSearch6._lb.getId(), true), "List is visible");
		qutils.triggerEvent("click", oSearch6._ctrl.getId() + "-icon");
		assert.ok(checkVisible(oSearch6._lb.getId(), false), "List is not visible");
	});


	//***********************************
	QUnit.module("Suggestion");

	var getProviderTest = function(oSearchControl){
		return function(assert) {
			checkSuggestion(assert, oSearchControl, function(sSuggestValue, aItems){
				assert.equal(sSuggestValue, "INITIAL", "No suggest event when search provider connected");
				assert.equal(aItems.length, 2, "Number of suggestions correct");
				assert.equal(aItems[0].getText(), "a", "First suggestion item correct");
				assert.equal(aItems[1].getText(), "b", "Second suggestion item correct");
			});
		};
	};

	QUnit.test("Textfield mode (no suggestion list)", function(assert) {
		checkSuggestion(assert, oSearch7, function(sSuggestValue, aItems){
			assert.equal(sSuggestValue, "SaSap", "Suggest value");
		});
	});

	QUnit.test("Open Search provider with XML response", getProviderTest(oSearch8));

	QUnit.test("Combobox mode (with suggestion list)", function(assert) {
		checkSuggestion(assert, oSearch10, function(sSuggestValue, aItems){
			assert.equal(sSuggestValue, "SaSap", "Suggest value");
			assert.equal(aItems.length, 2, "Number of suggestions correct");
			assert.equal(aItems[0].getText(), "a", "First suggestion item correct");
			assert.equal(aItems[1].getText(), "b", "Second suggestion item correct");
		});
	});


	//***********************************
	QUnit.module("Filter Mode");

	function testFilterMode(assert, bClick, sVal) {
		function trigger(bClick) {
			if (bClick){
				qutils.triggerEvent("click", oSearch11._ctrl.getId() + "-searchico");
			} else {
				qutils.triggerKeydown(oSearch11.getFocusDomRef(), "ENTER");
			}
		}

		oSearch11.setEnableFilterMode(true);
		oSearch11.setValue(sVal);
		sap.ui.getCore().applyChanges();

		var bEventHandlerCalled = false;
		var handler = function(oControlEvent){
			assert.equal(oControlEvent.getParameter("query"), "", "Value of search event is empty:");
			bEventHandlerCalled = true;
		};
		oSearch11.attachSearch(handler);
		trigger(bClick);
		assert.ok(bEventHandlerCalled, "Search handler called.");

		oSearch11.setEnableFilterMode(false);
		oSearch11.setValue(sVal);
		sap.ui.getCore().applyChanges();

		bEventHandlerCalled = false;
		trigger(bClick);
		assert.ok(!bEventHandlerCalled, "Search handler not called.");

		oSearch11.detachSearch(handler);
	}

	QUnit.test("Press ENTER", function(assert) {
		testFilterMode(assert, false, "");
	});

	QUnit.test("Click Search Icon", function(assert) {
		testFilterMode(assert, true, "");
	});

	QUnit.test("Click Clear Icon", function(assert) {
		oSearch11.setEnableClear(true);
		sap.ui.getCore().applyChanges();
		testFilterMode(assert, true, "Test");
	});
});