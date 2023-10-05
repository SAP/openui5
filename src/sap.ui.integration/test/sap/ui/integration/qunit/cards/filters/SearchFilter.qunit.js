/* global QUnit */

sap.ui.define([
	"sap/ui/integration/cards/filters/SearchFilter",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/Element"
], function(
	SearchFilter,
	Card,
	Core,
	KeyCodes,
	QUnitUtils,
	Element
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("SearchFilter Generic", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Instantiation", function (assert) {
		// Arrange
		var oSF = new SearchFilter();

		// Assert
		assert.ok(oSF, "Should be able to instantiate SearchFilter filter");

		// Clean up
		oSF.destroy();
	});

	QUnit.test("Card creating 'Search' filter", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Assert
			var oFilterBar = this.oCard.getAggregation("_filterBar");
			assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

			var oFirstFilter = oFilterBar._getFilters()[0];
			assert.ok(oFirstFilter.isA(SearchFilter.getMetadata().getName()), "The filter type is correct");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.filters.search",
				"type": "card"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"searchFilter": {
							"type": "Search"
						}
					}
				},
				"type": "List",
				"content": {
					"data": {
						"json": [{
								"Name": "item1"
						}]
					},
					"item": {
						"title": "{Name}"
					}
				}
			}
		});
	});

	QUnit.module("SearchFilter Properties");

	QUnit.test("Placeholder", function (assert) {
		// Arrange
		var oConfig = {
			placeholder: "Some placeholder"
		};
		var oSF = new SearchFilter({
			config: oConfig
		});

		// Assert
		assert.strictEqual(oSF._getSearchField().getPlaceholder(), oConfig.placeholder, "Should have set the placeholder");

		// Clean up
		oSF.destroy();
	});

	QUnit.test("Label", function (assert) {
		// Arrange
		var oConfig = {
			label: "Some label"
		};
		var oSF = new SearchFilter({
			config: oConfig
		});
		var oLabel = Element.registry.get(oSF.getField().getAriaLabelledBy()[0]);

		// Assert
		assert.ok(oLabel.getDomRef(), "Hidden label is created and added");
		assert.strictEqual(oLabel.getText(), oConfig.label, "Hidden label is created and added");

		// Act up
		oSF.destroy();

		assert.ok(oLabel.isDestroyed(), "Hidden label should be destroyed when the filter is destroyed");
	});

	QUnit.module("SearchFilter properties binding", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Placeholder set with binding", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			var oFilterBar = this.oCard.getAggregation("_filterBar"),
				oSearchField = oFilterBar._getFilters()[0].getField();

			// Assert
			assert.strictEqual(oSearchField.getPlaceholder(), "Some placeholder", "The placeholder binding should be resolved");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.filters.search",
				"type": "card"
			},
			"sap.card": {
				"data": {
					"json": {
						"placeholder": "Some placeholder"
					}
				},
				"configuration": {
					"filters": {
						"searchFilter": {
							"type": "Search",
							"placeholder": "{/placeholder}"
						}
					}
				},
				"type": "Object",
				"content": {
					"groups": []
				}
			}
		});
	});

	QUnit.test("Value set with binding", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			var oFilterBar = this.oCard.getAggregation("_filterBar"),
				oSearchField = oFilterBar._getFilters()[0].getField();

			// Assert
			assert.strictEqual(oSearchField.getValue(), "Some value", "The value binding should be resolved");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.filters.search",
				"type": "card"
			},
			"sap.card": {
				"data": {
					"json": {
						"value": "Some value"
					}
				},
				"configuration": {
					"filters": {
						"searchFilter": {
							"type": "Search",
							"value": "{/value}"
						}
					}
				},
				"type": "Object",
				"content": {
					"groups": []
				}
			}
		});
	});

	QUnit.module("SearchFilter Value", {
		beforeEach: function () {
			this.oSF = new SearchFilter();
		},
		afterEach: function () {
			this.oSF.destroy();
		}
	});

	QUnit.test("Value properties with default config", function (assert) {
		// Arrange
		this.oSF.setConfig({});
		var oModelValue = this.oSF.getValueForModel();

		// Assert
		assert.ok(oModelValue.hasOwnProperty("value"), "'value' property should be part of value");
		assert.strictEqual(oModelValue.value, "", "'value' should be empty string");
	});

	QUnit.test("Value properties when config is set", function (assert) {
		// Arrange
		this.oSF.setConfig({
			value: "Some city"
		});
		var oModelValue = this.oSF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.value, "Some city", "Initial model value should be set");
		assert.strictEqual(this.oSF._getSearchField().getValue(), "Some city", "Initial value should be set on the search field");
	});

	QUnit.test("Value is updated when new value is entered", function (assert) {
		// Arrange
		this.oSF.setConfig({});
		this.oSF.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		var oOldValue = this.oSF.getValue();

		// Act
		this.oSF._getSearchField().$("I").trigger("focus").val("some new value").trigger("input");
		QUnitUtils.triggerKeydown(this.oSF._getSearchField().getDomRef("I"), KeyCodes.ENTER);

		// Assert
		assert.notDeepEqual(this.oSF.getValue(), oOldValue, "Value should be changed after new value is entered");
		assert.strictEqual(this.oSF.getValue().value, "some new value", "Value should be changed after new value is entered");
	});

	QUnit.test("Model value is reset when the reset button is pressed", function (assert) {
		this.oSF.setConfig({
			value: "Some city"
		});
		this.oSF.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		QUnitUtils.triggerTouchEvent("touchend", this.oSF._getSearchField().getDomRef("reset"));

		// Assert
		assert.strictEqual(this.oSF.getValueForModel().value, "", "Model value is reset");
	});

});