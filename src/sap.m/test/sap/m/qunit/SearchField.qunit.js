/*global QUnit, sinon*/
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.global",
	"sap/ui/events/jquery/EventExtension",
	"sap/m/SearchField",
	"sap/m/Label",
	"sap/ui/Device",
	"sap/ui/core/InvisibleText",
	"sap/m/Button",
	"sap/m/SuggestionItem"
], function(
	qutils,
	createAndAppendDiv,
	jQuery,
	EventExtension,
	SearchField,
	Label,
	Device,
	InvisibleText,
	Button,
	SuggestionItem
) {
	createAndAppendDiv("content");


	var sf1, sf2, sf3,
		sPlaceholder = "search for..",
		sValue = "value",
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
		var oTarget = jQuery.sap.domById(sTarget);
		var $Target = jQuery(oTarget);
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
		var oElement = $Target.control(0);
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
		search:onSearch,
		liveChange: onLiveChange
	}).placeAt("content");

	new SearchField("sf2", {
		placeholder: sPlaceholder,
		value: sValue,
		enabled: false,
		showMagnifier: false,
		search:onSearch,
		liveChange: onLiveChange
	}).placeAt("content");

	new SearchField("sf3", {
		placeholder: sPlaceholder,
		value: sValue,
		enabled: true,
		showRefreshButton: true,
		visible: true
	}).placeAt("content");

	new SearchField("sf4", {
		placeholder: sPlaceholder,
		value: sValue,
		enabled: true,
		showRefreshButton: true,
		showSearchButton: false,
		visible: true
	}).placeAt("content");


	QUnit.module("Basic", {
		beforeEach : function() {
			sf1 = sap.ui.getCore().getControl("sf1");
			sf2 = sap.ui.getCore().getControl("sf2");
			sf3 = sap.ui.getCore().getControl("sf3");
			sf4 = sap.ui.getCore().getControl("sf4");
			sf1Dom = sf1.getFocusDomRef();
			sf2Dom = sf2.getFocusDomRef();
			sf3Dom = sf3.getFocusDomRef();
			sf4Dom = sf4.getFocusDomRef();
		},
		afterEach : function() {
			sf1 = null;
			sf2 = null;
			sf3 = null;
			sf4 = null;
			sf1Dom = null;
			sf2Dom = null;
			sf3Dom = null;
			sf4Dom = null;
			aEvents = [];
		}
	});

	// test properties
	QUnit.test("Properties", function(assert) {
		assert.equal(sf1.getValue(), sValue, "Value property, UI5");
		assert.equal(sf1Dom.value, sValue, "Value property, DOM");
		assert.equal(sf2.getPlaceholder(), sPlaceholder, "Placeholder property, UI5");
		if (sf2Dom.placeholder){
			assert.equal(sf2Dom.placeholder, sPlaceholder, "Placeholder property, DOM");
		} else {
			// IE9
			// IE9/IE10 cleanup comment: there are still issues with IE11 and placeholders
			// TODO remove after the end of support for Internet Explorer
			assert.equal(sf2.$("P").text(), sPlaceholder, "Placeholder in IE9");
		}
		assert.equal(sf2.getEnabled(), false, "Enabled property, UI5");
		assert.equal(sf2Dom.disabled, true, "Disabled property, DOM");
		assert.ok(sf2.$().hasClass("sapMSFDisabled"),"CSS class name for \"disabled\" is set");
		// Button icons
		assert.ok(/\uE00D/.test(getIconId(sf1, "search")), "First button icon is magnifier");
		assert.ok(/\uE00A/.test(getIconId(sf3, "search")), "Third button icon is synchronize");
		// showSearchButton:false :
		assert.ok(jQuery("#sf4-search").length == 0, "Search button is not rendered if showSearchButton == false");
		var rightOffset = window.getComputedStyle(jQuery("#sf4-reset")[0]).getPropertyValue("right");
		assert.strictEqual(rightOffset, "0px", "Reset button is right aligned if showSearchButton == false");
	});

	QUnit.test("Screen Reader", function(assert) {
		// arrange
		var lbl = new Label("lbl", {
			text: "Label",
			labelFor: "sf6"
		});
		lbl.placeAt("content");
		var sf = new SearchField("sf6", {
			placeholder: sPlaceholder
		});
		sf.placeAt("content");
		sap.ui.getCore().applyChanges();

		var describedById = sf3Dom.getAttribute("aria-describedby");
		var labelledByIdSf3 = sf3Dom.getAttribute("aria-labelledby");
		var sf6Dom = sap.ui.getCore().getControl("sf6").getFocusDomRef();
		var labelledByIdSf6 = sf6Dom.getAttribute("aria-labelledby");
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
			assert.ok(sf1.getValue() == "", "Value property should be empty after reset, UI5");
			assert.ok(sf1Dom.value == "", "Value property should be empty after reset, DOM");
			assert.ok(sQuery == "", "Search query parameter should be empty after reset, Event");
			assert.ok(sf2.getValue() == sValue, "Disabled searchField should not react on reset, UI5");
			assert.ok(sf2Dom.value == sValue, "Disabled searchField should not react on reset, DOM");
			// check events: both search and liveChange should be fired
			assert.ok(aEvents.length >= 2, "there should be at least 2 events in the log");
			aEvents = [];
			done();
			}, 200);
	});

	QUnit.test("Focused SearchField", function(assert) {
		var done = assert.async();
		assert.ok(true, "Test for focused search field started");
		// touch the search field
		doTouchEnd("sf3-reset");

		setTimeout(function(){
			assert.ok(sf3.$().hasClass("sapMFocus"), "Third search field is focused after reset button press");
			assert.ok(/\uE00D/.test(getIconId(sf3, "search")), "Focused search field icon is magnifier");

			document.activeElement.blur();
			setTimeout( function(){
				assert.ok(/\uE00A/.test(getIconId(sf3, "search")), "Defocused search field icon is synchronize");
				done();
			}, 350);
		}, 200);

	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.SearchField = new SearchField("sf5", {
				placeholder: sPlaceholder,
				value: sValue,
				enabled: true,
				showRefreshButton: true,
				visible: true
			}).placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.SearchField.destroy();
		}
	});

	QUnit.test("ARIA attributes for Chrome specific", function(assert) {
		// arrange
		var bHasAutocorrect;
		this.stub(Device, "browser", {name: "cr", chrome: true});

		// act
		this.SearchField.rerender();
		bHasAutocorrect = this.SearchField.$("I").attr("autocorrect") == "off";

		// assert
		assert.strictEqual(bHasAutocorrect, false, "Shouldn't be rendered");
	});

	QUnit.test("ARIA attributes for Safari specific", function(assert) {
		// arrange
		var bHasAutocorrect;
		this.stub(Device, "browser", {name: "sf", safari: true});

		// act
		this.SearchField.rerender();
		bHasAutocorrect = this.SearchField.$("I").attr("autocorrect") == "off";

		// assert
		assert.strictEqual(bHasAutocorrect, true, "Should be rendered when on Safari");
	});

	QUnit.test("When refresh button is added invisible text should be set", function (assert) {
		// arrange
		var ariaDescribedByAttr = this.SearchField.$("I").attr('aria-describedby');
		var f5TextId = InvisibleText.getStaticId("sap.m", "SEARCHFIELD_ARIA_F5");
		var isF5TextSet = ariaDescribedByAttr.indexOf(f5TextId) >= 0;

		// assert
		assert.strictEqual(isF5TextSet, true, 'The "Press F5 to refresh" text should be set as aria-describedby');
	});

	QUnit.module("SearchField tooltip:", {
		beforeEach: function () {
			this.oSearchField = new SearchField("SF", {
				placeholder: sPlaceholder,
				enabled: true,
				showRefreshButton: true,
				visible: true
			}).placeAt("content");
			this.oButton = new Button({}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			this.oMockEvent = {type: "focus"};

		},
		afterEach: function() {
			this.oSearchField.destroy();
			this.oButton.destroy();
			this.oRb = null;
			this.oMockEvent = null;
		}
	});
	QUnit.test("After initial loading only Search button", function (assert) {
		//act
		this.oSearchField.setShowRefreshButton(false);
		this.oSearchField.rerender();
		// assert
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"), "Search button should be with 'Search' tooltip");
	});

	QUnit.test("After initial loading Search and Refresh buttons", function(assert) {
		// assert
		assert.strictEqual(jQuery("#SF-reset").attr("title"), this.oRB.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"), "Search button should be with 'Search' tooltip");
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_REFRESH_BUTTON_TOOLTIP"), "Refresh button should be with 'Refresh' tooltip");
	});

	QUnit.test("After initial loading and losing focus", function(assert) {
		// assert
		assert.strictEqual(jQuery("#SF-reset").attr("title"), this.oRB.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"), "Search button should be with 'Search' tooltip");
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_REFRESH_BUTTON_TOOLTIP"), "Refresh button should be with 'Refresh' tooltip");

		//act
		this.oSearchField.focus();
		this.oButton.focus();

		// assert
		assert.strictEqual(jQuery("#SF-reset").attr("title"), this.oRB.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"), "Search button should be with 'Search' tooltip");
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_REFRESH_BUTTON_TOOLTIP"), "Refresh button should be with 'Refresh' tooltip");
	});

	QUnit.test("After initial loading and 'Refresh button' tooltip is set and value is set", function(assert) {

		// arrange
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_REFRESH_BUTTON_TOOLTIP"), "Refresh button should be with 'Refresh' tooltip");
		assert.strictEqual(jQuery("#SF-reset").attr("title"), this.oRB.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"), "Search button should be with 'Search' tooltip");

		//act
		this.oSearchField.setRefreshButtonTooltip("Reload");
		this.oSearchField.setValue("Test");
		this.oSearchField.rerender();

		// assert
		assert.strictEqual(jQuery("#SF-reset").attr("title"), this.oRB.getText("SEARCHFIELD_RESET_BUTTON_TOOLTIP"), "Reset button should be with 'Reset' tooltip");
		assert.strictEqual(jQuery("#SF-search").attr("title"), 'Reload', "Refresh button should be with 'Reload' tooltip");
	});

	QUnit.test("After control is focused, no value is set", function(assert) {

		// arrange
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_REFRESH_BUTTON_TOOLTIP"), "Refresh button should be with 'Refresh' tooltip");
		//act
		//IE does not apply focus correctly, this way works for all browsers// TODO remove after the end of support for Internet Explorer
		this.oSearchField.onFocus(this.oMockEvent);

		// assert
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"), "Search button should be with 'Search' tooltip");
	});

	QUnit.test("After control is focused and value is set", function(assert) {

		// arrange
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_REFRESH_BUTTON_TOOLTIP"), "Refresh button should be with 'Refresh' tooltip");
		assert.strictEqual(jQuery("#SF-reset").attr("title"), this.oRB.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"), "Search button should be with 'Search' tooltip");

		//act
		this.oSearchField.setValue("Test");
		this.oSearchField.rerender();
		//IE does not apply focus correctly, this way works for all browsers// TODO remove after the end of support for Internet Explorer
		this.oSearchField.onFocus(this.oMockEvent);

		// assert
		assert.strictEqual(jQuery("#SF-search").attr("title"), this.oRB.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"), "Search button should be with 'Search' tooltip");
		assert.strictEqual(jQuery("#SF-reset").attr("title"), this.oRB.getText("SEARCHFIELD_RESET_BUTTON_TOOLTIP"), "Reset button should be with 'Reset' tooltip");
	});

	QUnit.module("Input", {
		beforeEach: function () {
			this.oSearchField = new SearchField("sf7", {
				placeholder: sPlaceholder,
				enabled: true,
				showRefreshButton: true,
				visible: true
			}).placeAt("content");

			this.oMockEvent = {type: "focus"};

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();
			this.oMockEvent = null;
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
		this.oSearchField.$("F").click(); // click the form
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oSearchField = new SearchField();
			this.oSearchField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();
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

	QUnit.test("method: change() event", function(assert) {

		var fnFireChangeSpy = this.spy(this.oSearchField, "fireChange");

		// act
		sap.ui.test.qunit.triggerCharacterInput(this.oSearchField.getFocusDomRef(), "a");
		this.oSearchField.onChange();

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired");
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
			this.oSearchField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();

			Device.system.phone = this.isPhone;
		}
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
		sap.ui.getCore().applyChanges();


		setTimeout(function () {
			this.oSuggestionItem1.$().tap();

			// Asert
			setTimeout(function () {
				assert.ok(fnSearchSpy.calledOnce, "Search is fired once");
				done();
			}, 500);
		}.bind(this), 300); // requires that timeout to work on IE
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
		sap.ui.getCore().applyChanges();


		setTimeout(function () {
			// tap on the 'magnifier' button
			var searchFieldInDialog = jQuery(".sapMDialog .sapMSF").control()[0];
			var searchIconInDialog = jQuery(".sapMDialog .sapMSFS")[0];

			searchFieldInDialog.ontouchend({
				originalEvent: {
					button: 1
				},
				target: searchIconInDialog
			});

			// Asert
			setTimeout(function () {
				assert.ok(fnSearchSpy.calledOnce, "Search is fired once");
				done();
			}, 500);
		}, 300); // requires that timeout to work on IE
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
		sap.ui.getCore().applyChanges();


		setTimeout(function () {
			// tap on the 'OK' button
			qutils.triggerTouchEvent("tap", jQuery(".sapMDialog .sapMDialogFooter .sapMBtn")[0]);

			// Asert
			setTimeout(function () {
				assert.ok(fnSearchSpy.calledOnce, "Search is fired once");
				done();
			}, 500);
		}, 300); // requires that timeout to work on IE
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
		sap.ui.getCore().applyChanges();


		setTimeout(function () {
			// tap on the 'X' button
			qutils.triggerTouchEvent("tap", jQuery(".sapMDialog .sapMDialogTitle .sapMBtn")[0]);

			// Asert
			setTimeout(function () {
				assert.ok(fnSearchSpy.notCalled, "Search is not fired");
				done();
			}, 500);
		}, 300); // requires that timeout to work on IE
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
		qutils.triggerTouchEvent("tap", jQuery(".sapMDialog .sapMDialogFooter .sapMBtn")[0]);
	});

	QUnit.module("Suggestions aria-selected", {
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
			this.oSearchField.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oSearchField.destroy();
		}
	});

	QUnit.test("Aria-selected is false when non of the items are selected", function (assert) {
		// Act
		var done = assert.async(),
			oSuggestionItems = this.oSearchField.getSuggestionItems();
		this.oSearchField.focus();
		sap.ui.getCore().applyChanges();


		setTimeout(function () {
			assert.strictEqual(oSuggestionItems[0].getDomRef().getAttribute("aria-selected"), "false", "Aria-selected is set to false");
			done();
		}, 300); // requires that timeout to work on IE
	});
});
