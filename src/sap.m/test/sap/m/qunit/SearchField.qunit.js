/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/m/SearchField",
	"sap/m/Label",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleText",
	"sap/m/Button",
	"sap/m/SuggestionItem"
], function(
	Core,
	Library,
	QunitUtils,
	createAndAppendDiv,
	jQuery,
	SearchField,
	Label,
	Device,
	KeyCodes,
	Element,
	InvisibleText,
	Button,
	SuggestionItem
) {
	"use strict";

	var DOM_RENDER_LOCATION = createAndAppendDiv("content");

	var sPlaceholder = "search for..",
		sValue = "value",
		sTooltip = "Search city",
		sQuery = "",
		sLive  = "",
		aEvents = [];

	function onSearch(oEvent){
		sQuery = oEvent.getParameter("query");
		aEvents.push({event: oEvent, query: sQuery});
	}

	function onLiveChange(oEvent){
		sLive = oEvent.getParameter("newValue");
		aEvents.push({event: oEvent, query: sLive});
	}

	function doTouchEnd(sTarget, oParams){
		var sEventName = "touchend";
		var oTarget = document.getElementById(sTarget);
		var oEvent = jQuery.Event(sEventName);
		oEvent.originalEvent = {};
		oEvent.target = oTarget;
		oEvent.srcElement = oTarget;
		if (oParams){
			for (var x in oParams){
				oEvent[x] = oParams[x];
				oEvent.originalEvent[x] = oParams[x];
			}
		}
		var oElement = Element.closestTo(oTarget);
		if (oElement && oElement["on" + sEventName]){
			oElement["on" + sEventName].apply(oElement, [oEvent]);
		}
	}

	function getIconId(oSF, sButton){
		return window.getComputedStyle(oSF.getDomRef(sButton), ":after").getPropertyValue("content");
	}

	new SearchField("sf1", {
		placeholder: sPlaceholder,
		value: sValue,
		enabled: true,
		tooltip: sTooltip,
		search:onSearch,
		liveChange: onLiveChange
	}).placeAt(DOM_RENDER_LOCATION);

	new SearchField("sf2", {
		placeholder: sPlaceholder,
		value: sValue,
		enabled: false,
		showMagnifier: false,
		search:onSearch,
		liveChange: onLiveChange
	}).placeAt(DOM_RENDER_LOCATION);

	new SearchField("sf3", {
		placeholder: sPlaceholder,
		value: sValue,
		enabled: true,
		showRefreshButton: true,
		visible: true
	}).placeAt(DOM_RENDER_LOCATION);

	new SearchField("sf4", {
		placeholder: sPlaceholder,
		value: sValue,
		enabled: true,
		showRefreshButton: true,
		showSearchButton: false,
		visible: true
	}).placeAt(DOM_RENDER_LOCATION);


	QUnit.module("Basic", {
		beforeEach : function() {
			this.sf1 = Element.getElementById("sf1");
			this.sf2 = Element.getElementById("sf2");
			this.sf3 = Element.getElementById("sf3");
			this.sf4 = Element.getElementById("sf4");
			this.sf1Dom = this.sf1.getFocusDomRef();
			this.sf2Dom = this.sf2.getFocusDomRef();
			this.sf3Dom = this.sf3.getFocusDomRef();
			this.sf4Dom = this.sf4.getFocusDomRef();
		},
		afterEach : function() {
			this.sf1 = null;
			this.sf2 = null;
			this.sf3 = null;
			this.sf4 = null;
			this.sf1Dom = null;
			this.sf2Dom = null;
			this.sf3Dom = null;
			this.sf4Dom = null;
			aEvents = [];
		}
	});

	QUnit.test("Properties", function(assert) {
		assert.equal(this.sf1.getValue(), sValue, "Value property, UI5");
		assert.equal(this.sf1Dom.value, sValue, "Value property, DOM");
		assert.equal(this.sf1.getInputElement().getAttribute("title"), sTooltip, "Tooltip correctly set");
		assert.equal(this.sf2.getEnabled(), false, "Enabled property, UI5");
		assert.equal(this.sf2Dom.disabled, true, "Disabled property, DOM");
		assert.ok(this.sf2.$().hasClass("sapMSFDisabled"),"CSS class name for \"disabled\" is set");
		// Button icons
		assert.ok(/\uE00D/.test(getIconId(this.sf1, "search")), "First button icon is magnifier");
		assert.ok(/\uE010/.test(getIconId(this.sf3, "search")), "Third button icon is refresh");
		// showSearchButton:false :
		assert.ok(jQuery("#sf4-search").length == 0, "Search button is not rendered if showSearchButton == false");
	});

	QUnit.test("Placeholder property - default value", function (assert) {
		// arrange
		var oSF = new SearchField();
		oSF.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		var oSFDomRef = oSF.getFocusDomRef();

		// assert
		assert.strictEqual(oSF.getPlaceholder(), "", "Default value of placeholder property is empty string");
		assert.strictEqual(
			oSFDomRef.placeholder,
			Library.getResourceBundleFor("sap.m").getText("FACETFILTER_SEARCH"),
			"Default placeholder is added to the DOM"
		);

		// clean up
		oSF.destroy();
	});

	QUnit.test("Placeholder property - set value", function (assert) {
		// arrange
		var sPlaceholder = "New Placeholder";
		var oSF = new SearchField({
			placeholder: sPlaceholder
		});
		oSF.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		var oSFDomRef = oSF.getFocusDomRef();

		// assert
		assert.strictEqual(oSF.getPlaceholder(), sPlaceholder, "Set value of placeholder property is empty string");
		assert.strictEqual(oSFDomRef.placeholder, sPlaceholder, "Set placeholder is added to the DOM");
		assert.strictEqual(oSFDomRef.getAttribute("aria-label"), sPlaceholder, "aria-label attribute has the same value as the placeholder");

		// clean up
		oSF.destroy();
	});

	QUnit.test("Screen Reader", function(assert) {
		// arrange
		var lbl = new Label("lbl", {
			text: "Label",
			labelFor: "sf6"
		});
		lbl.placeAt(DOM_RENDER_LOCATION);
		var sf = new SearchField("sf6", {
			placeholder: sPlaceholder
		});
		sf.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		var describedById = this.sf3Dom.getAttribute("aria-describedby");
		var aLabels = describedById.split(' ');
		var bLabelsExist = aLabels.every(function(id){
			return !!document.getElementById(id);
		});

		// assert
		assert.ok(!!describedById, "Described by ID is set");
		assert.ok(bLabelsExist, "All descriptions are rendered in DOM");

		assert.strictEqual(sf.$('reset').attr('aria-hidden'), "true", "reset button has aria-hidden='true'");
		assert.strictEqual(sf.$('search').attr('aria-hidden'), "true", "search button has aria-hidden='true'");

		// clean up
		lbl.destroy();
		sf.destroy();
		Core.applyChanges();
	});

	// test the "reset" button
	QUnit.test("ResetButton", function(assert) {
		var done = assert.async();
		assert.ok(true, "Test for reset button started");
		sQuery = "test";
		aEvents = [];
		// touch the reset button
		doTouchEnd("sf1-reset");
		doTouchEnd("sf2-reset");

		setTimeout(function(){
			assert.ok(this.sf1.getValue() == "", "Value property should be empty after reset, UI5");
			assert.ok(this.sf1Dom.value == "", "Value property should be empty after reset, DOM");
			assert.ok(sQuery == "", "Search query parameter should be empty after reset, Event");
			assert.ok(this.sf2.getValue() == sValue, "Disabled searchField should not react on reset, UI5");
			assert.ok(this.sf2Dom.value == sValue, "Disabled searchField should not react on reset, DOM");
			// check events: both search and liveChange should be fired
			assert.ok(aEvents.length >= 2, "there should be at least 2 events in the log");
			aEvents = [];
			done();
		}.bind(this), 200);
	});

	QUnit.test("Focused SearchField", function(assert) {
		var done = assert.async();
		assert.ok(true, "Test for focused search field started");
		// touch the search field
		doTouchEnd("sf3-reset");

		setTimeout(function(){
			assert.ok(this.sf3.$().hasClass("sapMFocus"), "Third search field is focused after reset button press");
			assert.ok(/\uE00D/.test(getIconId(this.sf3, "search")), "Focused search field icon is magnifier");

			document.activeElement.blur();
			setTimeout( function(){
				assert.ok(/\uE010/.test(getIconId(this.sf3, "search")), "Defocused search field icon is refresh");
				done();
			}.bind(this), 350);
		}.bind(this), 200);

	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oSearchField = new SearchField("sf5", {
				placeholder: sPlaceholder,
				value: sValue,
				enabled: true,
				showRefreshButton: true,
				visible: true
			}).placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();
			Core.applyChanges();
		}
	});

	QUnit.test("input's maxlength attribute remains rendered after every invalidation", function(assert) {
		// arrange
		this.oSearchField.setMaxLength(20);
		Core.applyChanges();

		// assert
		assert.strictEqual(this.oSearchField.getDomRef("I").getAttribute("maxlength"), "20", "attribute is present");

		// act
		this.oSearchField.invalidate();
		Core.applyChanges();

		// assert
		assert.strictEqual(this.oSearchField.getDomRef("I").getAttribute("maxlength"), "20", "attribute is present");

		// act
		this.oSearchField.invalidate();
		Core.applyChanges();
		// assert
		assert.strictEqual(this.oSearchField.getDomRef("I").getAttribute("maxlength"), "20", "attribute is present");
	});

	QUnit.test("ARIA attributes for Chrome specific", function(assert) {
		// arrange
		var bHasAutocorrect;
		this.stub(Device, "browser").value({name: "cr", chrome: true});

		// act
		this.oSearchField.invalidate();
		Core.applyChanges();

		bHasAutocorrect = this.oSearchField.$("I").attr("autocorrect") == "off";

		// assert
		assert.strictEqual(bHasAutocorrect, false, "Shouldn't be rendered");
	});

	QUnit.test("ARIA attributes for Safari specific", function(assert) {
		// arrange
		var bHasAutocorrect;
		this.stub(Device, "browser").value({name: "sf", safari: true});

		// act
		this.oSearchField.invalidate();
		Core.applyChanges();

		bHasAutocorrect = this.oSearchField.$("I").attr("autocorrect") == "off";

		// assert
		assert.strictEqual(bHasAutocorrect, true, "Should be rendered when on Safari");
	});

	QUnit.test("Default 'aria-describedby'", function (assert) {
		// arrange
		var sAriaDescribedByAttr = this.oSearchField.$("I").attr("aria-describedby");
		var sDefaultDescrId = InvisibleText.getStaticId("sap.m", "SEARCHFIELD_ARIA_DESCRIBEDBY");

		// assert
		assert.ok(sAriaDescribedByAttr.includes(sDefaultDescrId), "Default text should be part of 'aria-describedby'");
	});

	QUnit.test("When refresh button is added invisible text should be set", function (assert) {
		// arrange
		var ariaDescribedByAttr = this.oSearchField.$("I").attr('aria-describedby');
		var f5TextId = InvisibleText.getStaticId("sap.m", "SEARCHFIELD_ARIA_F5");
		var isF5TextSet = ariaDescribedByAttr.indexOf(f5TextId) >= 0;

		// assert
		assert.strictEqual(isF5TextSet, true, 'The "Press F5 to refresh" text should be set as aria-describedby');
	});

	QUnit.test("Inline width style is not added when 'width' property is not set", function (assert) {
		assert.notOk(this.oSearchField.getDomRef().style.width, "Width style is not added");
	});

	QUnit.test("Setting value to empty string should update the search field", function (assert) {
		// arrange
		var oSF = new SearchField();
		oSF.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// act
		oSF.$("I").val("Some value").trigger("input");

		// assert
		assert.strictEqual(oSF.getDomRef("I").value, "Some value", "There is value displayed in the DOM after typing");

		// act
		oSF.setValue("");
		Core.applyChanges();

		// assert
		assert.strictEqual(oSF.getDomRef("I").value, "", "The value is successfully displayed as '' in the DOM");

		// clean up
		oSF.destroy();
		Core.applyChanges();
	});

	QUnit.module("Input", {
		beforeEach: function () {
			this.oSearchField = new SearchField("sf7", {
				placeholder: sPlaceholder,
				enabled: true,
				showRefreshButton: true,
				visible: true
			}).placeAt(DOM_RENDER_LOCATION);

			this.oMockEvent = {type: "focus"};

			Core.applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();
			this.oMockEvent = null;
			Core.applyChanges();
		}
	});

	QUnit.test("Test input in SearchField", function(assert) {
		// arrange
		var fnLiveChange = this.spy();
		this.oSearchField.attachEvent("liveChange", fnLiveChange);

		// act
		this.oSearchField.onFocus(this.oMockEvent);
		this.oSearchField.$("I").val("abc").trigger("input");

		//assert
		assert.strictEqual(fnLiveChange.callCount, 1, "LiveChange event is fired once");
		assert.strictEqual(this.oSearchField.getValue(), "abc", "Value is correct");
	});

	QUnit.test("Test focus when clicked on the form outside of the input", function(assert) {
		// arrange
		var done = assert.async();
		this.oSearchField.$("I").on("focus", function () {
			//assert
			assert.ok(true, "Input element is focused");
			done();
		});

		// act
		this.oSearchField.$("F").trigger("click"); // click the form
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oSearchField = new SearchField();
			this.oSearchField.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();
			Core.applyChanges();
		}
	});

	QUnit.test("Touch start on input and touch end on reset button", function (assert) {

		// Arrange
		var fnClearSpy = this.spy(SearchField.prototype, "clear");
		var oTouchStartMockEvent = {
			target: this.oSearchField.getInputElement()
		};
		var oTouchEndMockEvent = {
			target: this.oSearchField.getDomRef("reset"),
			originalEvent: {},
			id: this.oSearchField.getId() + "-reset"
		};

		// Act
		// Simulate touch start on the SearchField's input.
		this.oSearchField.ontouchstart(oTouchStartMockEvent);
		// Simulate touch end on the SearchField's reset button.
		this.oSearchField.ontouchend(oTouchEndMockEvent);

		// Assert
		assert.ok(fnClearSpy.notCalled, "Should NOT clear input when touch started on a different target then the reset button.");

		// Cleanup
		fnClearSpy.restore();
	});

	QUnit.test("'change' and 'search' events", function(assert) {

		var fnFireChangeSpy = this.spy(this.oSearchField, "fireChange");
		var fnFireSearchSpy = this.spy(this.oSearchField, "fireSearch");

		// act
		QunitUtils.triggerCharacterInput(this.oSearchField.getFocusDomRef(), "a");
		QunitUtils.triggerKeydown(this.oSearchField.getDomRef("I"), KeyCodes.ENTER);

		// assertions
		assert.strictEqual(fnFireSearchSpy.callCount, 1, "The search event is fired");
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired");

		this.oSearchField.onChange();
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is not fired");

		QunitUtils.triggerCharacterInput(this.oSearchField.getFocusDomRef(), "ab");

		this.oSearchField.onChange();
		assert.strictEqual(fnFireChangeSpy.callCount, 2, "The change event is fired");

		// act
		QunitUtils.triggerCharacterInput(this.oSearchField.getFocusDomRef(), "a");
		this.oSearchField.onsapfocusleave();

		assert.strictEqual(fnFireChangeSpy.callCount, 3, "The change event is fired");

		this.oSearchField.setValue("new");
		QunitUtils.triggerKeydown(this.oSearchField.getDomRef("I"), KeyCodes.ESCAPE);

		assert.strictEqual(fnFireSearchSpy.callCount, 2, "The search event is fired");
		assert.ok(fnFireSearchSpy.args[1][0].escPressed, "'escPressed' parameter is set");

		fnFireChangeSpy.restore();
		fnFireSearchSpy.restore();
	});

	QUnit.test("'searchButtonPressed' event parameter", function(assert) {

		var fnFireSearchSpy = this.spy(this.oSearchField, "fireSearch");

		// act
		QunitUtils.triggerCharacterInput(this.oSearchField.getFocusDomRef(), "a");

		var oTouchStartMockEvent = {
			target: this.oSearchField.getDomRef("search")
		};
		var oTouchEndMockEvent = {
			target: this.oSearchField.getDomRef("search"),
			originalEvent: {},
			id: this.oSearchField.getId() + "-search"
		};

		// Act
		// Simulate touch start on the SearchField's search button.
		this.oSearchField.ontouchstart(oTouchStartMockEvent);
		// Simulate touch end on the SearchField's search button.
		this.oSearchField.ontouchend(oTouchEndMockEvent);

		// assertions
		assert.strictEqual(fnFireSearchSpy.callCount, 1, "The search event is fired");
		assert.strictEqual(fnFireSearchSpy.args[0][0].searchButtonPressed, true, "searchButtonPressed parameter is set for search event");
	});

	QUnit.test("'submit' form event", function(assert) {
		var oEventSpy = sinon.spy(jQuery.Event.prototype, "preventDefault");

		this.oSearchField.$("F").trigger("submit");

		assert.ok(oEventSpy.called, "preventDefault is called and page is not refreshed.");

		oEventSpy.restore();
	});

	QUnit.test("Order of clear and focus of the input is correct when pressing reset", function (assert) {
		// Arrange
		var fnClearSpy = this.spy(SearchField.prototype, "clear"),
			fnFocusInputSpy = this.spy(this.oSearchField.getInputElement(), "focus"),
			oTouchResetMockEvent = {
				target: this.oSearchField.getDomRef("reset"),
				originalEvent: {},
				id: this.oSearchField.getId() + "-reset"
			};

		// Act
		this.oSearchField.ontouchend(oTouchResetMockEvent);

		// Assert
		assert.ok(fnFocusInputSpy.calledBefore(fnClearSpy), "The clear is performed after input is focused again.");
	});

	QUnit.module("Suggestions on mobile phone", {
		beforeEach: function () {
			this.isPhone = Device.system.phone;
			Device.system.phone = true;

			this.oSearchField = new SearchField("sf8", {
				enableSuggestions: true,
				suggestionItems: [
					this.oSuggestionItem1 = new SuggestionItem({key: "suggest1", text: "suggest1"}),
					new SuggestionItem({key: "suggest2", text: "suggest2"})
				],
				suggest: function () {
					this.oSearchField.suggest();
				}.bind(this)
			});
			this.oSearchField.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			Device.system.phone = this.isPhone;
			this.oSearchField.destroy();
			Core.applyChanges();
		}
	});

	QUnit.test("Accessibility", function (assert) {
		assert.strictEqual(this.oSearchField.getFocusDomRef().getAttribute("inputmode"), "none", "inputmode is 'none'");
	});

	QUnit.test("Search is fired once when suggestion item is tapped", function (assert) {
		// Arrange
		var done = assert.async(),
			fnSearchSpy = this.stub();

		this.oSearchField.attachEvent("search", function () {
			fnSearchSpy();
		});

		// Act
		this.oSearchField.focus();
		Core.applyChanges();

		this.oSuggestionItem1.$().tap();

		// Assert
		setTimeout(function () {
			assert.ok(fnSearchSpy.calledOnce, "Search is fired once");
			done();
		}, 500);
	});

	QUnit.test("Search is fired once when 'magnifier' button is pressed", function (assert) {
		// Arrange
		var done = assert.async(),
			fnSearchSpy = this.stub();

		this.oSearchField.attachEvent("search", function () {
			fnSearchSpy();
		});

		// Act
		this.oSearchField.focus();
		Core.applyChanges();

		// tap on the 'magnifier' button
		var searchFieldInDialog = Element.closestTo(document.querySelector(".sapMDialog .sapMSF"));
		var searchIconInDialog = jQuery(".sapMDialog .sapMSFS")[0];

		searchFieldInDialog.ontouchend({
			originalEvent: {
				button: 1
			},
			target: searchIconInDialog
		});

		// Assert
		setTimeout(function () {
			assert.ok(fnSearchSpy.calledOnce, "Search is fired once");
			done();
		}, 500);
	});

	QUnit.test("Search is fired once when 'OK' button is pressed", function (assert) {
		// Arrange
		var done = assert.async(),
			fnSearchSpy = this.stub();

		this.oSearchField.attachEvent("search", function () {
			fnSearchSpy();
		});

		// Act
		this.oSearchField.focus();
		Core.applyChanges();

		// tap on the 'OK' button
		QunitUtils.triggerTouchEvent("tap", jQuery(".sapMDialog .sapMDialogFooter .sapMBtn")[0]);

		// Assert
		setTimeout(function () {
			assert.ok(fnSearchSpy.calledOnce, "Search is fired once");
			done();
		}, 500);
	});

	QUnit.test("Search is NOT fired when 'X' button is pressed", function (assert) {
		// Arrange
		var done = assert.async(),
			fnSearchSpy = this.stub();

		this.oSearchField.attachEvent("search", function () {
			fnSearchSpy();
		});

		// Act
		this.oSearchField.focus();
		Core.applyChanges();


		// tap on the 'X' button
		QunitUtils.triggerTouchEvent("tap", jQuery(".sapMDialog .sapMDialogTitleGroup .sapMBtn")[0]);

		// Assert
		setTimeout(function () {
			assert.ok(fnSearchSpy.notCalled, "Search is not fired");
			done();
		}, 500);
	});

	QUnit.test("When suggestions dialog is closed, suggestions are suppressed", function (assert) {
		// Arrange
		var done = assert.async();

		this.oSearchField.attachSearch(function () {
			assert.ok(this.oSearchField._bSuggestionSuppressed, "suggestions are suspended");

			done();
		}.bind(this));

		// open suggestions
		this.oSearchField.suggest();

		// tap on the 'OK' button

		QunitUtils.triggerTouchEvent("tap", jQuery(".sapMDialog .sapMDialogFooter .sapMBtn")[0]);
	});

	QUnit.module("Suggestions aria attributes", {
		beforeEach: function () {
			this.oSearchField = new SearchField("sf8", {
				enableSuggestions: true,
				suggestionItems: [
					this.oSuggestionItem1 = new SuggestionItem({key: "suggest1", text: "suggest1"}),
					new SuggestionItem({key: "suggest2", text: "suggest2"})
				],
				suggest: function () {
					this.oSearchField.suggest();
				}.bind(this)
			});
			this.oSearchField.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();
			Core.applyChanges();
		}
	});

	QUnit.test("Aria-selected is false when non of the items are selected", function (assert) {
		// Act
		var oSuggestionItems = this.oSearchField.getSuggestionItems();

		this.oSearchField.focus();
		Core.applyChanges();

		assert.strictEqual(oSuggestionItems[0].getDomRef().getAttribute("aria-selected"), "false", "Aria-selected is set to false");
	});

	QUnit.test("Aria-haspopup is listbox when there are suggestions", function (assert) {
		// Act
		assert.strictEqual(this.oSearchField.$("I").attr("aria-haspopup"), "listbox", "Aria-haspopup is set to listbox.");
	});

	QUnit.module("Focus handling", {
		beforeEach: function () {
			this.oSearchField = new SearchField();
			this.oSearchField.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();
			Core.applyChanges();
		}
	});

	QUnit.test("sapMFocus class isn't deleted when invalidated", function (assert) {
		// Act
		this.oSearchField.focus();

		// Assert
		assert.ok(this.oSearchField.$().hasClass("sapMFocus"), "Focus class was added");

		// Act
		this.oSearchField.invalidate();
		Core.applyChanges();

		// Assert
		assert.ok(this.oSearchField.$().hasClass("sapMFocus"), "Focus class should still be present after invalidation");
	});

	QUnit.module("Translations", {
		beforeEach: function () {
			this.oSearchField = new SearchField({
				value: "some value"
			});
			this.oSearchField.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			this.TRANSLATED_TEXT = "Translated text";
			this.getTextStub = sinon.stub(Library.getResourceBundleFor("sap.m"), "getText")
				.returns(this.TRANSLATED_TEXT);
		},
		afterEach: function () {
			this.oSearchField.destroy();
			this.getTextStub.restore();
		}
	});

	QUnit.test("Placeholder is updated when language is changed", function (assert) {
		// act
		this.oSearchField.invalidate();
		Core.applyChanges();

		// assert
		assert.strictEqual(this.oSearchField.getFocusDomRef().placeholder, this.TRANSLATED_TEXT, "Placeholder text is updated");
	});
});