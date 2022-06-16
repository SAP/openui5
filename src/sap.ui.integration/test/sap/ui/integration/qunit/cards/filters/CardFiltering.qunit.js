/* global QUnit sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/Host",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils"
], function (
	Card,
	RequestDataProvider,
	Host,
	Core,
	KeyCodes,
	QUnitUtils
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Filters in Card", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oRb = Core.getLibraryResourceBundle("sap.ui.integration");
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oRb = null;
		}
	});

	QUnit.test("Filter items by category", function (assert) {
		// Arrange
		var done = assert.async(),
			sCategory = "notebooks",
			sStatus = "2 of 3";

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oHeader = this.oCard.getAggregation("_header"),
				oContentList = this.oCard.getCardContent().getInnerList(),
				oListItems = oContentList.getItems();

			// Assert
			assert.strictEqual(oHeader.getSubtitle(), "Category " + sCategory, "The initial value of 'category' is ok.");
			assert.strictEqual(oHeader.getStatusText(), sStatus, "The number of list items is as expected.");
			assert.strictEqual(oListItems[0].getDescription(), sCategory, "The list items have correct category.");

			// Act - change the category to flat_screens
			sCategory = "flat_screens";
			sStatus = "2 of 4";

			this.oCard.getModel("filters").setProperty("/category/value", "flat_screens");
			Core.applyChanges();

			setTimeout(function () {
				assert.strictEqual(oHeader.getSubtitle(), "Category " + sCategory, "The initial value of 'category' is ok.");
				assert.strictEqual(oHeader.getStatusText(), sStatus, "The number of list items is as expected.");
				assert.strictEqual(oListItems[0].getDescription(), sCategory, "The list items have correct category.");
				done();
			}, 500);

		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Show 'No Data' message and show valid data after that", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			// Act
			this.oCard.getModel("filters").setProperty("/shipper/value", "43");
			Core.applyChanges();

			setTimeout(function () {
				assert.strictEqual(this.oCard.getCardContent().getItems()[0].getTitle(), this.oRb.getText("CARD_NO_ITEMS_ERROR_LISTS"), "an empty list is displayed");

				// Act
				this.oCard.getModel("filters").setProperty("/shipper/value", "3");
				Core.applyChanges();

				setTimeout(function () {
					assert.ok(this.oCard.getCardContent().isA("sap.ui.integration.cards.ListContent"), "list content is displayed");
					done();
				}.bind(this), 500);
			}.bind(this), 500);
		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardFilteringNoDataForFilter/manifest.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Are filters properly cleaned up", function (assert) {
		// Arrange
		var done = assert.async(),
		sCity = "sofia";

		this.oCard.attachEventOnce("_ready", function () {
			// Assert
			assert.ok(this.oCard.getModel("filters").getData().category, "Category field is correct");
			assert.strictEqual(this.oCard.getModel("filters").getData().city.value, sCity, "City value is correct");

			this.oCard.attachEventOnce("_ready", function () {
				sCity = "vienna";

				// Assert
				assert.notOk(this.oCard.getModel("filters").getData().category, "Category field is not the old one");
				assert.ok(this.oCard.getModel("filters").getData().category2, "Category field is correct");
				assert.strictEqual(this.oCard.getModel("filters").getData().city.value, sCity, "City value is correct");

				done();

			}.bind(this));

			// Act - change the manifest
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter_changed.json");

		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("configurationChange event is fired", function (assert) {
		// Arrange
		var done = assert.async(),
			oHost = new Host(),
			oFireConfigurationChangeSpy = sinon.spy(this.oCard, "fireConfigurationChange"),
			oFireCardConfigurationChangeHostSpy = sinon.spy(oHost, "fireCardConfigurationChange");

		this.oCard.setHost(oHost);

		this.oCard.attachEvent("_ready", function () {
			// Act
			var oFilterBar = this.oCard.getAggregation("_filterBar"),
				oSelect = oFilterBar._getFilters()[0]._getSelect(),
				oSearchField = oFilterBar._getFilters()[2]._getSearchField(),
				oDdr = oFilterBar._getFilters()[3]._getDdr(),
				mArguments;

			// select filter
			oSelect.onSelectionChange({
				getParameter: function () {
					return oSelect.getItems()[0];
				}
			});
			Core.applyChanges();

			assert.ok(oFireConfigurationChangeSpy.called, "configurationChange event is fired");
			assert.ok(oFireCardConfigurationChangeHostSpy.called, "cardConfigurationChange event of the Host is fired");

			mArguments = oFireConfigurationChangeSpy.args[0][0];
			assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/category/value"], "flat_screens", "arguments are correct");

			mArguments = oFireCardConfigurationChangeHostSpy.args[0][0];
			assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/category/value"], "flat_screens", "arguments are correct");
			assert.strictEqual(mArguments.card, this.oCard, "card parameter is correct");

			// search filter
			oSearchField.getInputElement().value = "A";
			oSearchField.onSearch();
			Core.applyChanges();

			assert.strictEqual(oFireConfigurationChangeSpy.callCount, 2, "configurationChange event is fired");
			assert.strictEqual(oFireCardConfigurationChangeHostSpy.callCount, 2, "cardConfigurationChange event of the Host is fired");

			mArguments = oFireConfigurationChangeSpy.args[1][0];
			assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/country/value"], "A", "arguments are correct");

			mArguments = oFireCardConfigurationChangeHostSpy.args[1][0];
			assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/country/value"], "A", "arguments are correct");
			assert.strictEqual(mArguments.card, this.oCard, "card parameter is correct");

			// Dynamic Date Range filter
			oDdr._handleInputChange({
				getParameter: function () {
					return "Oct 4, 2021 - Oct 5, 2021";
				}
			});
			Core.applyChanges();

			var oExpectedResult = {
				"option": "dateRange",
				"values": [
					new Date("Oct 4, 2021"),
					new Date("Oct 5, 2021")
				]
			};

			assert.strictEqual(oFireConfigurationChangeSpy.callCount, 3, "configurationChange event is fired");
			assert.strictEqual(oFireCardConfigurationChangeHostSpy.callCount, 3, "cardConfigurationChange event of the Host is fired");

			mArguments = oFireConfigurationChangeSpy.args[2][0];
			assert.deepEqual(mArguments.changes["/sap.card/configuration/filters/period/value"], oExpectedResult, "arguments are correct");

			mArguments = oFireCardConfigurationChangeHostSpy.args[2][0];
			assert.deepEqual(mArguments.changes["/sap.card/configuration/filters/period/value"], oExpectedResult, "arguments are correct");
			assert.strictEqual(mArguments.card, this.oCard, "card parameter is correct");

			// destory
			oFireConfigurationChangeSpy.reset();
			oFireCardConfigurationChangeHostSpy.reset();
			oHost.destroy();

			done();

		}.bind(this));

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Dynamic filters", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Loading a filter using a data request", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Assert
			var oFilterBar = this.oCard.getAggregation("_filterBar");
			assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

			var oFilter = oFilterBar._getFilters()[0];
			assert.strictEqual(oFilter._getSelect().getSelectedKey(), "available", "property binding works");
			assert.strictEqual(oFilter._getSelect().getItems()[1].getKey(), "out_of_stock", "option has the expected key");

			done();
		}, this);

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_dynamic_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Filter values - edge cases", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Double quotes in the SearchFilter", function (assert) {
		// Arrange
		var done = assert.async();
		this.stub(RequestDataProvider.prototype, "getData")
			.onFirstCall().resolves()
			.onSecondCall().callsFake(function () {
				// Assert
				assert.ok(true, "Exception is NOT thrown when double quotes are part of the value");
				done();
				return Promise.resolve();
			});

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Arrange
			var oFilterBar = this.oCard.getAggregation("_filterBar");
			var oFilter = oFilterBar._getFilters()[0];

			// Act
			oFilter.getField().$("I").trigger("focus").val("\"city\"").trigger("input");
			QUnitUtils.triggerKeydown(oFilter.getField().getDomRef("I"), KeyCodes.ENTER);
		}, this);

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.filters.search",
				"type": "card"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "{filters>/searchFilter/value}/some/url"
					}
				},
				"configuration": {
					"filters": {
						"searchFilter": {
							"type": "Search"
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

});