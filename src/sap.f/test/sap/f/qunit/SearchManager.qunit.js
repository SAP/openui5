/*global QUnit */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/f/SearchManager",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils"
],
	function (Core, SearchManager, KeyCodes, qutils) {
		"use strict";

		var TESTS_DOM_CONTAINER = "qunit-fixture",
			fnRenderObject = function (oObject) {
				oObject.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
				return oObject;
			};

		/* --------------------------- SearchManager API -------------------------------------- */
		QUnit.module("SearchManager - API ", {
			beforeEach: function () {
				this.oSearchManager = new SearchManager();
				fnRenderObject(this.oSearchManager._oSearch);
			},
			afterEach: function () {
				this.oSearchManager.destroy();
				this.oSearchManager = null;
			}
		});

		QUnit.test("test SearchManager instantiation", function (assert) {
			// Assert
			assert.equal(this.oSearchManager.getMetadata().getName(), "sap.f.SearchManager",
				"SearchManager instantiated successfully.");
		});

		QUnit.test("property - value", function (assert) {
			var sNewValue = "New value for test";

			// Act
			this.oSearchManager.setValue(sNewValue);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getValue(), sNewValue, "Value is set correctly");
			assert.strictEqual(this.oSearchManager._getSearchField().getValue(), sNewValue, "Value is set correctly");
		});

		QUnit.test("property - placeholder", function (assert) {
			var sNewPlaceholder = "New placeholder for test";

			// Act
			this.oSearchManager.setPlaceholder(sNewPlaceholder);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getPlaceholder(), sNewPlaceholder, "Placeholder is set correctly");
			assert.strictEqual(this.oSearchManager._getSearchField().getPlaceholder(), sNewPlaceholder, "Placeholder is set correctly");
		});

		QUnit.test("property - maxLength", function (assert) {
			var iMaxLength = 5;

			// Act
			this.oSearchManager.setMaxLength(iMaxLength);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getMaxLength(), iMaxLength, "MaxLength is set correctly");
			assert.strictEqual(this.oSearchManager._getSearchField().getMaxLength(), iMaxLength, "MaxLength is set correctly");
		});

		QUnit.test("property - enabled", function (assert) {
			var bEnabled = false;

			// Act
			this.oSearchManager.setEnabled(bEnabled);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getEnabled(), bEnabled, "MaxLength is set correctly");
			assert.strictEqual(this.oSearchManager._getSearchField().getEnabled(), bEnabled, "MaxLength is set correctly");
		});

		QUnit.test("property - enableSuggestions", function (assert) {
			var bEnableSuggestions = true;

			// Act
			this.oSearchManager.setEnableSuggestions(bEnableSuggestions);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getEnableSuggestions(), bEnableSuggestions, "EnableSuggestions is set correctly");
			assert.strictEqual(this.oSearchManager._getSearchField().getEnableSuggestions(), bEnableSuggestions, "EnableSuggestions is set correctly");
		});

		QUnit.test("aggregation - suggestionItems", function (assert) {
			var aSuggestionItems = [
				new sap.m.SuggestionItem({
					text: "Test item 1"
				}),
				new sap.m.SuggestionItem({
					text: "Test item 2"
				}),
				new sap.m.SuggestionItem({
					text: "Test item 3"
				}),
				new sap.m.SuggestionItem({
					text: "Test item 4"
				})
			],
				sNewValue = "New value for test";


			// Act
			aSuggestionItems.forEach(function (oSuggestionItem) {
				this.oSearchManager.insertSuggestionItem(oSuggestionItem);
			}, this);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getSuggestionItems().length, aSuggestionItems.length, "SuggestionItems are forwarded correctly");
			assert.strictEqual(this.oSearchManager._getSearchField().getSuggestionItems().length, aSuggestionItems.length, "SuggestionItems are forwarded correctly");

			// Act
			this.oSearchManager.removeSuggestionItem(aSuggestionItems[0]);
			aSuggestionItems.shift();
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getSuggestionItems().length, aSuggestionItems.length, "SuggestionItems are forwarded correctly");
			assert.strictEqual(this.oSearchManager._getSearchField().getSuggestionItems().length, aSuggestionItems.length, "SuggestionItems are forwarded correctly");

			// Act
			this.oSearchManager.getSuggestionItems()[0].setText(sNewValue);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getSuggestionItems()[0].getText(), sNewValue, "SuggestionItems are forwarded correctly");
			assert.strictEqual(this.oSearchManager._getSearchField().getSuggestionItems()[0].getText(), sNewValue, "SuggestionItems are forwarded correctly");
		});

		QUnit.test("event - search event", function (assert) {
			var sEventDispatchedId,
				oFakeObject = {
					fnFakeFucntion: function (oEvent) {
						sEventDispatchedId = oEvent.getParameter("id");
					}
				},
				oSpy = this.spy(oFakeObject, "fnFakeFucntion");

			// Act
			this.oSearchManager.attachSearch(oFakeObject.fnFakeFucntion);
			this.oSearchManager._getSearchField().fireSearch();
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getId(), sEventDispatchedId, "Event is dispatched correctly");
			assert.ok(oSpy.calledOnce, "Event is fired");
		});

		QUnit.test("event - live change event", function (assert) {
			var sEventDispatchedId,
				oFakeObject = {
					fnFakeFucntion: function (oEvent) {
						sEventDispatchedId = oEvent.getParameter("id");
					}
				},
				oSpy = this.spy(oFakeObject, "fnFakeFucntion");

			// Act
			this.oSearchManager.attachLiveChange(oFakeObject.fnFakeFucntion);
			this.oSearchManager._getSearchField().fireLiveChange();
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getId(), sEventDispatchedId, "Event is dispatched correctly");
			assert.ok(oSpy.calledOnce, "Event is fired");
		});

		QUnit.test("event - suggest event", function (assert) {
			var sEventDispatchedId,
				oFakeObject = {
					fnFakeFucntion: function (oEvent) {
						sEventDispatchedId = oEvent.getParameter("id");
					}
				},
				oSpy = this.spy(oFakeObject, "fnFakeFucntion");

			// Act
			this.oSearchManager.attachSuggest(oFakeObject.fnFakeFucntion);
			this.oSearchManager._getSearchField().fireSuggest();
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager.getId(), sEventDispatchedId, "Event is dispatched correctly");
			assert.ok(oSpy.calledOnce, "Event is fired");
		});

		QUnit.test("keyboard handling - escape", function (assert) {
			// Act
			this.oSearchManager._oSearch.setIsOpen(true);
			Core.applyChanges();
			qutils.triggerKeyup(this.oSearchManager._oSearch, KeyCodes.ESCAPE);

			// Assert
			assert.strictEqual(this.oSearchManager._oSearch.getIsOpen(), false, "Search is closed");
		});

		QUnit.module("SearchManager - Rendering ", {
			beforeEach: function () {
				this.oSearchManager = new SearchManager();
				fnRenderObject(this.oSearchManager._oSearch);
			},
			afterEach: function () {
				this.oSearchManager.destroy();
				this.oSearchManager = null;
			}
		});

		QUnit.test("Initial rendering", function (assert) {
			// Assert
			assert.strictEqual(this.oSearchManager._oSearch.$()[0].childElementCount, 1, "Search button was rendered.");
		});

		QUnit.test("Open search rendering", function (assert) {
			// Act
			this.oSearchManager._oSearch.setIsOpen(true);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager._oSearch.$().find(".sapFShellBarSearchWrap")[0].childElementCount, 3, "Search field and search button were rendered.");
		});

		QUnit.test("Open search rendering in phone mode", function (assert) {
			// Act
			this.oSearchManager._oSearch.setIsOpen(true);
			this.oSearchManager._oSearch.setPhoneMode(true);
			Core.applyChanges();

			// Assert
			assert.strictEqual(this.oSearchManager._oSearch.$().find(".sapFShellBarSearchWrap")[0].childElementCount, 3,
				"Search field, search button and cancel button were rendered.");
			assert.strictEqual(this.oSearchManager._oSearch.$()[0].classList.contains("sapFShellBarSearchFullWidth"), true,
				"Full width class list was added.");
		});
	});
