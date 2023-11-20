/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/cards/AnalyticsCloudContent",
	"sap/m/IllustratedMessageType",
	"sap/ui/integration/widgets/Card",
	"sap/base/Log"
], function (
	Core,
	AnalyticsCloudContent,
	IllustratedMessageType,
	Card,
	Log
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oExample1 = {
		"sap.app": {
			"id": "qunit.analyticscloud.example1"
		},
		"sap.card": {
			"type": "AnalyticsCloud",
			"data": {
				"json": {
					"myChart": "my-chart-options"
				}
			},
			"configuration": {
				"destinations": {
					"sac": {
						"name": "DummyName",
						"defaultUrl": "/dummy-url"
					}
				}
			},
			"header": {
				"title": "My chart"
			},
			"content": {
				"options": "{myChart}"
			}
		}
	};

	function fakeHighcharts(fnChartStub) {
		// Creates a fake Highcharts object with method class Chart with a constructor.
		var Chart = function () {
			fnChartStub.apply(this, arguments);

			// Fakes the destroy function which is required
			this.destroy = function () { };
		};

		return {
			Chart: Chart
		};
	}

	QUnit.module("Static methods", {
		beforeEach: function () {
			this.fnRequireStub = sinon.stub(AnalyticsCloudContent, "_require");
			this.fnRequireStub.callsFake(function () {
				return Promise.resolve();
			});

			this.fnLogWarning = sinon.spy(Log, "warning");
		},
		afterEach: function () {
			this.fnRequireStub.restore();
			this.fnLogWarning.restore();
			AnalyticsCloudContent._sIncludedFrom = null; // reset the is included check
		}
	});

	QUnit.test("loadHighcharts", function (assert) {
		// Arrange
		var sBaseUrl = "/dummy-url",
			aModules = Object.getOwnPropertyNames(AnalyticsCloudContent.HIGHCHART_MODULES),
			fnRequireStub = this.fnRequireStub;

		// Act
		AnalyticsCloudContent.loadHighcharts(sBaseUrl);

		// Assert
		assert.ok(fnRequireStub.calledOnce, "Require of the modules is called once.");
		assert.ok(fnRequireStub.calledWith(aModules), "All modules are loaded.");
	});

	QUnit.test("loadHighcharts for second time", function (assert) {
		// Arrange
		var fnRequireStub = this.fnRequireStub,
			fnLogStub = this.fnLogWarning;

		// Act
		AnalyticsCloudContent.loadHighcharts("/dummy-url");
		AnalyticsCloudContent.loadHighcharts("/dummy-url");

		// Assert
		assert.ok(fnRequireStub.calledOnce, "Require of the modules is called once.");
		assert.notOk(fnLogStub.calledOnce, "Warning is not logged when loadHighcharts is called with same url.");

		// Act - load from different url
		fnLogStub.resetHistory();
		AnalyticsCloudContent.loadHighcharts("/different-url");

		// Assert
		assert.ok(fnRequireStub.calledOnce, "Require of the modules is still called once.");
		assert.ok(fnLogStub.calledOnce, "Warning is logged when loadHighcharts is called with new url.");
	});

	QUnit.test("loadHighcharts when Highcharts already available globally", function (assert) {
		// Arrange
		var fnRequireStub = this.fnRequireStub,
			fnLogStub = this.fnLogWarning;

		window.Highcharts = sinon.stub();

		// Act
		AnalyticsCloudContent.loadHighcharts("/dummy-url");

		// Assert
		assert.notOk(fnRequireStub.called, "Scripts are not included.");
		assert.ok(fnLogStub.called, "Warning is logged.");

		// Clean up
		window.Highcharts = null;
	});

	QUnit.test("loadHighcharts shouldn't append anything to the given URL", function (assert) {
		// Arrange
		var sUrl = "/dummy-url";

		// Act
		AnalyticsCloudContent.loadHighcharts(sUrl);

		// Assert
		assert.strictEqual(AnalyticsCloudContent._sIncludedFrom, sUrl, "Nothing is appended to the given URL");
	});

	QUnit.module("Creating a chart", {
		beforeEach: function () {
			this.fnLoadStub = sinon.stub(AnalyticsCloudContent, "loadHighcharts");

			this.fnChartStub = sinon.stub();
			window.Highcharts = fakeHighcharts(this.fnChartStub);

			this.oCard = new Card("testCard", {
				manifest: oExample1,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.fnLoadStub.restore();
			delete window.Highcharts;
			this.oCard.destroy();
		}
	});

	QUnit.test("Create a Highchart chart", function (assert) {
		// Arrange
		var done = assert.async(),
			fnLoadStub = this.fnLoadStub,
			fnChartStub = this.fnChartStub;

		setTimeout(function () {
			Core.applyChanges();

			// Assert
			assert.ok(fnLoadStub.calledOnce, "Highcharts library is loaded once.");
			assert.ok(fnChartStub.calledOnce, "window.Highcharts.Chart() is called once.");
			assert.strictEqual(fnChartStub.getCall(0).args[1], "my-chart-options", "window.Highcharts.Chart() is called with correct arguments.");

			done();
		}, 300);
	});

	QUnit.test("Refresh", function (assert) {
		// Arrange
		var done = assert.async();
		var oErrorSpy = sinon.spy(Log, "error");

		setTimeout(function () {
			Core.applyChanges();
			this.oCard.refresh();

			setTimeout(function () {
				assert.notOk(oErrorSpy.called, "Error is not logged");

				oErrorSpy.restore();
				done();
			}, 300);

		}.bind(this), 300);
	});

	QUnit.test("Card type: 'AnalyticsCloud' has 'Generic' placeholder", function (assert) {
		var done = assert.async(),
			oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/"
			});

		oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oContent = oCard.getCardContent(),
				oPlaceholder = oContent.getAggregation("_loadingPlaceholder");

			assert.strictEqual(oPlaceholder.isA("sap.f.cards.loading.GenericPlaceholder"), true, "Placeholder has correct type");

			oCard.destroy();
			done();
		});

		oCard.setManifest(oExample1);
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.module("Display errors", {
		beforeEach: function () {
			this.fnCreateHighchartStub = sinon.stub(AnalyticsCloudContent.prototype, "_createHighchart");

			this.fnChartStub = sinon.stub();
			window.Highcharts = fakeHighcharts(this.fnChartStub);

			this.oCard = new Card("testCard", {
				manifest: oExample1
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.fnCreateHighchartStub.restore();
			delete window.Highcharts;
			this.oCard.destroy();
		}
	});

	QUnit.test("showBlockingMessage method", function (assert) {
		// Arrange
		var done = assert.async(),
			fnCreateHighchartStub = this.fnCreateHighchartStub;

		setTimeout(function () {
			Core.applyChanges();

			// Assert
			assert.ok(fnCreateHighchartStub.calledOnce, "_createHighchart is called once");

			this.oCard.getCardContent().showBlockingMessage({
				illustrationType: IllustratedMessageType.ErrorScreen,
				title: "Title"
			});

			Core.applyChanges();

			assert.ok(fnCreateHighchartStub.calledOnce, "_createHighchart is called once");
			done();
		}.bind(this), 300);
	});
});
