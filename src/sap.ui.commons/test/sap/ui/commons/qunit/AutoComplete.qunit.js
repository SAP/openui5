/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/AutoComplete",
	"sap/ui/commons/ListBox",
	"sap/ui/core/ListItem",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"jquery.sap.strings" // jQuery.sap.endsWithIgnoreCase
], function(
	qutils,
	createAndAppendDiv,
	AutoComplete,
	ListBox,
	ListItem,
	jQuery,
	Device,
	KeyCodes
) {
	"use strict";

	// prepare DOM
	document.body.insertBefore(document.createElement("BUTTON"), document.body.firstChild).setAttribute("id", "focusDummy");
	document.body.insertBefore(createAndAppendDiv("uiArea2"), document.body.firstChild).setAttribute("style", "position: relative; left: 10px; top: 10px;");
	document.body.insertBefore(createAndAppendDiv("uiArea1"), document.body.firstChild).setAttribute("style", "position: relative; left: 10px; top: 10px;");


	function clear(oAuto, bDestroyItems){
		jQuery(oAuto.getInputDomRef()).val("");
		oAuto.setValue("");
		if (oAuto.oPopup && oAuto.oPopup.isOpen()){
			oAuto._close();
		}
		oAuto.setEnableScrolling(true);
		oAuto.setFilterFunction();
		if (bDestroyItems){
			oAuto.destroyItems();
		}
		sap.ui.getCore().applyChanges();
	}

	function checkSuggestion(oAuto, aTexts, assert){
		checkPopup(oAuto, true, assert);
		var aItems = oAuto._getListBox().getItems();
		assert.equal(aItems.length, aTexts.length, "Number of visible items correct");
		for (var i = 0; i < aItems.length; i++){
			assert.ok(jQuery.inArray(aItems[i].getText(), aTexts) >= 0, "Item '" + aItems[i].getText() + "' contained in suggestion list");
		}
	}

	function checkPopup(oAuto, bExpectOpen, assert){
		if (bExpectOpen){
			assert.ok(oAuto.oPopup && oAuto.oPopup.isOpen(), "Popup is open");
		} else {
			assert.ok(!oAuto.oPopup || !oAuto.oPopup.isOpen(), "Popup is closed");
		}
	}

	function checkStaticSuggestion(oAuto, sChar, aTexts, fCleanup, iCheckTimer, assert, done){
		oAuto.focus();

		setTimeout(function(){
			qutils.triggerCharacterInput(oAuto.getFocusDomRef(), sChar);
			qutils.triggerEvent("input", oAuto.getFocusDomRef());
			qutils.triggerKeyup(oAuto.getFocusDomRef(), sChar);
			setTimeout(function(){
				checkSuggestion(oAuto, aTexts, assert);
				if (fCleanup){
					fCleanup(oAuto);
				} else {
					clear(oAuto);
				}
				done();
			}, iCheckTimer || 200);
		}, 10);
	}


	QUnit.module("Control API", {
		beforeEach : function() {
			this.oAuto0 = new AutoComplete();
		},
		afterEach : function() {
			clear(this.oAuto0);
			this.oAuto0.destroy();

			jQuery("#focusDummy").trigger("focus");
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Property Defaults", function(assert) {
		assert.equal(this.oAuto0.getEnableScrolling(), true, "Default 'enableScrolling'");
		assert.ok(this.oAuto0._filter === AutoComplete._DEFAULTFILTER, "Default filter set");
	});

	QUnit.test("Property Custom Values", function(assert) {
		this.oAuto0.setEnableScrolling(false);

		function foo(){}

		this.oAuto0.setFilterFunction(foo);

		assert.equal(this.oAuto0.getEnableScrolling(), false, "Custom 'enableScrolling'");
		assert.ok(this.oAuto0._filter === foo, "Custom filter set");
	});

	QUnit.test("Deprecated APIs", function(assert) {
		var oCustomLB = new ListBox();
		this.oAuto0.setListBox(oCustomLB);
		this.oAuto0.setSelectedItemId("abc");
		this.oAuto0.setSelectedKey("abc");

		assert.ok(!this.oAuto0.getSelectedKey(), "Deprecated property 'selectedKey'");
		assert.ok(!this.oAuto0.getSelectedItemId(), "Deprecated property 'selectedItemId'");
		assert.ok(oCustomLB != this.oAuto0._getListBox(), "Deprecated aggregation 'listBox'");
	});

	QUnit.module("Suggestion - Static Items", {
		beforeEach : function() {
			this.oAuto1 = new AutoComplete({
				maxPopupItems: 3
			}).placeAt("uiArea1");

			var aVals = ["A", "B", "C"];
			for (var i = 0; i < aVals.length; i++){
				for (var j = 0; j < 4; j++){
					this.oAuto1.addItem(new ListItem({
						text: aVals[i] + j
					}));
				}
			}

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			clear(this.oAuto1);
			this.oAuto1.destroy();

			jQuery("#focusDummy").trigger("focus");
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Scrolling enabled", function(assert) {
		var done = assert.async();
		this.oAuto1.onfocusin();

		checkStaticSuggestion(this.oAuto1, "a", ["A0", "A1", "A2", "A3"], undefined, undefined, assert, done);

	});

	QUnit.test("Scrolling disabled", function(assert) {
		var done = assert.async();
		this.oAuto1.setEnableScrolling(false);
		this.oAuto1.onfocusin();

		checkStaticSuggestion(this.oAuto1, "a", ["A0", "A1", "A2"], undefined, undefined, assert, done);
	});

	QUnit.test("Custom Filter", function(assert) {
		var done = assert.async();
		this.oAuto1.onfocusin();

		this.oAuto1.setFilterFunction(function(sValue, oItem){
			return jQuery.sap.endsWithIgnoreCase(oItem.getText(), sValue);
		});

		checkStaticSuggestion(this.oAuto1, "0", ["A0", "B0", "C0"], undefined, undefined, assert, done);
	});

	QUnit.test("Change Items (No Focus)", function(assert) {
		var done = assert.async();
		jQuery("#focusDummy").trigger("focus");
		this.oAuto1.setValue("c");
		sap.ui.getCore().applyChanges();

		var that = this;

		setTimeout(function(){
			checkPopup(that.oAuto1, false, assert);
			that.oAuto1.addItem(new ListItem({text: "C4"}));
			setTimeout(function(){
				checkPopup(that.oAuto1, false, assert);
				done();
			}, 200);
		}, 10);
	});

	QUnit.test("Change Items (Focus)", function(assert) {
		var done = assert.async();
		this.oAuto1.setValue("a");
		sap.ui.getCore().applyChanges();
		this.oAuto1.onfocusin();

		var that = this;

		setTimeout(function(){
			checkPopup(that.oAuto1, false, assert);
			that.oAuto1.addItem(new ListItem({text: "A4"}));
			that.oAuto1.removeItem(that.oAuto1.getItems()[0]);
			setTimeout(function(){
				checkSuggestion(that.oAuto1, ["A1", "A2", "A3", "A4"], assert);
				done();
			}, 200);
		}, 10);
	});

	QUnit.module("Suggestion - Dynamic Items", {
		beforeEach : function() {
			this.oAuto2 = new AutoComplete();
			this.oAuto2.placeAt("uiArea2");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			clear(this.oAuto2);
			this.oAuto2.destroy();

			jQuery("#focusDummy").trigger("focus");
			sap.ui.getCore().applyChanges();
		}
	});

	function dynamicItemSuggestionTest(oAuto2, fHandler, iDelay, assert, done){
		oAuto2.attachSuggest(fHandler);
		checkStaticSuggestion(oAuto2, "a", ["A0", "A1", "A2", "A3"], function(oAuto){
			clear(oAuto, true);
			oAuto.detachSuggest(fHandler);
		}, iDelay, assert, done);
	}

	QUnit.test("Dynamic Items (sync)", function(assert) {
		var done = assert.async();
		this.oAuto2.onfocusin();
		var that = this;

		dynamicItemSuggestionTest(this.oAuto2, function(){
			that.oAuto2.destroyItems();
			for (var j = 0; j < 4; j++){
				that.oAuto2.addItem(new ListItem({text: "A" + j}));
			}
		}, 200, assert, done);
	});

	QUnit.test("Dynamic Items (async)", function(assert) {
		var done = assert.async();
		this.oAuto2.onfocusin();
		var that = this;

		dynamicItemSuggestionTest(this.oAuto2, function(){
			setTimeout(function(){
				that.oAuto2.destroyItems();
				for (var j = 0; j < 4; j++){
					that.oAuto2.addItem(new ListItem({text: "A" + j}));
				}
			}, 200);
		}, 500, assert, done);
	});

	QUnit.module("Closing Popup", {
		beforeEach : function() {
			this.oAuto1 = new AutoComplete({
				maxPopupItems: 3
			}).placeAt("uiArea1");

			var aVals = ["A", "B", "C"];
			for (var i = 0; i < aVals.length; i++){
				for (var j = 0; j < 4; j++){
					this.oAuto1.addItem(new ListItem({
						text: aVals[i] + j
					}));
				}
			}

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			clear(this.oAuto1);
			this.oAuto1.destroy();

			jQuery("#focusDummy").trigger("focus");
			sap.ui.getCore().applyChanges();
		}
	});

	function popupClosingTest(assert, oAuto1, fAction){
		oAuto1.focus();
		oAuto1.onfocusin();

		var done = assert.async();
		setTimeout(function(){
			checkPopup(oAuto1, false, assert);
			qutils.triggerCharacterInput(oAuto1.getFocusDomRef(), "a");
			qutils.triggerEvent("input", oAuto1.getFocusDomRef());
			qutils.triggerKeyup(oAuto1.getFocusDomRef(), "a");
			setTimeout(function(){
				checkPopup(oAuto1, true, assert);

				oAuto1.oPopup.attachClosed(function(){
					checkPopup(oAuto1, false, assert);
				});

				done();
				fAction(oAuto1);
			}, 200);
		}, 10);
	}

	QUnit.test("Focusout", function(assert) {
		var oButton = jQuery("#focusDummy");

		assert.expect(3);
		popupClosingTest(assert, this.oAuto1, function(oAuto){
			if (Device.system.combi) {
				oButton.trigger("click").trigger("mousedown").trigger("mouseup");
			} else {
				oButton.trigger("focus");
			}

		});
	});

	QUnit.test("Empty AutoComplete", function(assert) {
		popupClosingTest(assert, this.oAuto1, function(oAuto){
			jQuery(oAuto.getInputDomRef()).val("");
			qutils.triggerEvent("input", oAuto.getFocusDomRef());
			qutils.triggerKeyup(oAuto.getFocusDomRef(), KeyCodes.BACKSPACE);
		});
	});

	QUnit.test("Enter", function(assert) {
		popupClosingTest(assert, this.oAuto1, function(oAuto){
			qutils.triggerKeydown(oAuto.getFocusDomRef(), "ENTER");
		});
	});

	QUnit.test("Escape", function(assert) {
		popupClosingTest(assert, this.oAuto1, function(oAuto){
			qutils.triggerKeydown(oAuto.getFocusDomRef(), "ESCAPE");
			qutils.triggerKeypress(oAuto.getFocusDomRef(), "ESCAPE");
			qutils.triggerKeyup(oAuto.getFocusDomRef(), "ESCAPE");
		});
	});

	QUnit.module("ARIA", {
		beforeEach : function() {
			this.oAuto1 = new AutoComplete({
				maxPopupItems: 3
			}).placeAt("uiArea1");

			var aVals = ["A", "B", "C"];
			for (var i = 0; i < aVals.length; i++){
				for (var j = 0; j < 4; j++){
					this.oAuto1.addItem(new ListItem({
						text: aVals[i] + j
					}));
				}
			}

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			clear(this.oAuto1);
			this.oAuto1.destroy();

			jQuery("#focusDummy").trigger("focus");
			sap.ui.getCore().applyChanges();
		}
	});

	function checkAriaAttributes(assert, oAuto1, iExpPos, iExpSize, bOpenDesc, sAdditionalText){
		var $Ref = jQuery(oAuto1.getInputDomRef());
		var sPos = $Ref.attr("aria-posinset");
		var sSize = $Ref.attr("aria-setsize");

		if (iExpPos < 0){
			assert.ok(!sPos, "No aria-posinset attribute set " + sAdditionalText);
		} else {
			if (sPos){
				assert.equal(parseInt(sPos), iExpPos, "aria-posinset attribute set " + sAdditionalText);
			} else {
				assert.ok(false, "aria-posinset attribute set " + sAdditionalText);
			}
		}

		if (iExpSize < 0){
			assert.ok(!sSize, "No aria-setsize attribute set " + sAdditionalText);
		} else {
			if (sSize){
				assert.equal(parseInt(sSize), iExpSize, "aria-setsize attribute set " + sAdditionalText);
			} else {
				assert.ok(false, "aria-setsize attribute set " + sAdditionalText);
			}
		}

		if (bOpenDesc){
			assert.ok(!!$Ref.attr("aria-describedby"), "aria-describedby attribute set " + sAdditionalText);
		} else {
			assert.ok(!$Ref.attr("aria-describedby"), "aria-describedby attribute not set " + sAdditionalText);
		}

		assert.equal($Ref.attr("aria-live"), "polite", "aria-live attribute set " + sAdditionalText);
		assert.equal($Ref.attr("aria-relevant"), "all", "aria-relevant attribute set " + sAdditionalText);
		assert.equal($Ref.attr("aria-autocomplete"), "list", "aria-autocomplete attribute set " + sAdditionalText);
		assert.equal(jQuery(oAuto1.getDomRef()).attr("role"), "textbox", "role attribute set " + sAdditionalText);
	}

	QUnit.test("Attributes", function(assert) {
		var done = assert.async();
		this.oAuto1.focus();
		this.oAuto1.onfocusin();
		var that = this;

		setTimeout(function(){
			checkAriaAttributes(assert, that.oAuto1, -1, -1, false, "when popup is closed");
			qutils.triggerCharacterInput(that.oAuto1.getFocusDomRef(), "a");
			qutils.triggerEvent("input", that.oAuto1.getFocusDomRef());
			qutils.triggerKeyup(that.oAuto1.getFocusDomRef(), "a");
			setTimeout(function(){
				checkAriaAttributes(assert, that.oAuto1, -1, 4, true, "when popup is open");
				qutils.triggerKeydown(that.oAuto1.getFocusDomRef(), "ARROW_DOWN");
				setTimeout(function(){
					checkAriaAttributes(assert, that.oAuto1, 1, 4, true, "when popup is open and list item 1 selected");
					qutils.triggerKeydown(that.oAuto1.getFocusDomRef(), "ARROW_DOWN");
					setTimeout(function(){
						checkAriaAttributes(assert, that.oAuto1, 2, 4, true, "when popup is open and list item 2 selected");
						that.oAuto1._close();
						setTimeout(function(){
							checkAriaAttributes(assert, that.oAuto1, -1, -1, false, "when popup is closed");
							done();
						}, 200);
					}, 200);
				}, 200);
			}, 200);
		}, 10);
	});
});