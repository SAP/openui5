/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/core/Core"
], function(
	TableQUnitUtils,
	MultiSelectionPlugin,
	ODataModel,
	TestUtils,
	Core
) {
	"use strict";

	var iCount = 400;

	function createData(iStartIndex, iLength) {
		var aData = [];

		if (iStartIndex + iLength > iCount) {
			iLength = iCount - iStartIndex;
		}

		for (var i = iStartIndex; i < iStartIndex + iLength; i++) {
			aData.push({
				Name: "Test Product (" + i + ")"
			});
		}

		return aData;
	}

	function createResponse(iStartIndex, iLength, iPageSize) {
		var mResponse = {};
		var bPageLimitReached = iPageSize != null && iPageSize > 0 && iLength > iPageSize;

		if (bPageLimitReached) {
			var sSkipTop = "$skip=" + iStartIndex + "&$top=" + iLength;
			var sSkipToken = "&$skiptoken=" + iPageSize;
			mResponse.message = {value: createData(iStartIndex, iPageSize)};
			mResponse.message["@odata.nextLink"] = "http://localhost:8088/MyServiceWithPaging/Products?" + sSkipTop + sSkipToken;
		} else {
			mResponse.message = {value: createData(iStartIndex, iLength)};
		}

		return mResponse;
	}

	TestUtils.useFakeServer(sinon.sandbox.create(), "sap/ui/core/qunit/odata/v4/data", null, [{
		regExp: /^GET \/MyService(WithPaging)?\/\$metadata$/,
		response: {
			source: "metadata_tea_busi_product.xml"
		}
	}, {
		regExp: /^GET \/MyService(WithPaging)?\/Products\?(\$count=true&)?\$skip=(\d+)\&\$top=(\d+)$/,
		response: {
			buildResponse: function(aMatches, oResponse) {
				var iPageSize = aMatches[1] ? 50 : 0;
				var bWithCount = !!aMatches[2];
				var iSkip = parseInt(aMatches[3]);
				var iTop = parseInt(aMatches[4]);
				var mResponse = createResponse(iSkip, iTop, iPageSize);

				if (bWithCount) {
					mResponse.message["@odata.count"] = iCount;
				}

				oResponse.message = JSON.stringify(mResponse.message);
			}
		}
	}]);

	TableQUnitUtils.setDefaultSettings({
		dependents: [new MultiSelectionPlugin()],
		rows: {
			path: "/Products",
			parameters: {
				$count: true
			}
		},
		columns: TableQUnitUtils.createTextColumn({text: "Name", bind: true}),
		models: new ODataModel({
			serviceUrl: "/MyService/"
		})
	});

	function assertAllContextsAvailable(assert, oTable) {
		assert.equal(oTable.getBinding().getAllCurrentContexts().length, iCount, "All binding contexts are available");
	}

	function assertContextsAvailable(assert, oTable, iNumber) {
		var oBinding = oTable.getBinding();
		var aContexts = oBinding.getContexts(0, iNumber, 0, true);

		assert.equal(oBinding.getAllCurrentContexts().length, iNumber, "The expected number of binding contexts is available");
		assert.equal(aContexts.length, iNumber, "Binding contexts in relevant range are available");
		assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
	}

	QUnit.module("Load data", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		Core.applyChanges();

		return this.oMultiSelectionPlugin.selectAll().then(function() {
			assertAllContextsAvailable(assert, this.oTable);
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assertContextsAvailable(assert, this.oTable, 190);
		}.bind(this));
	});

	QUnit.module("Load data with server-driven paging", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: new ODataModel({
					serviceUrl: "/MyServiceWithPaging/"
				})
			});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		Core.applyChanges();

		return this.oMultiSelectionPlugin.selectAll().then(function() {
			assertAllContextsAvailable(assert, this.oTable);
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assertContextsAvailable(assert, this.oTable, 190);
		}.bind(this));
	});

	QUnit.module("Load data without count", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {
					path: "/Products"
				}
			});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Select all", function(assert) {
		this.oMultiSelectionPlugin.setLimit(0);
		Core.applyChanges();

		return this.oMultiSelectionPlugin.selectAll().then(function() {
			assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < iCount,
				"Not all binding contexts are available, but at least the Promise resolved");
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 190,
				"Not all binding contexts are available, but at least the Promise resolved");
		}.bind(this));
	});

	QUnit.module("Load data without count and short read", {
		before: function() {
			iCount = 180;
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {
					path: "/Products"
				}
			});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			iCount = 200;
		}
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			assert.ok(this.oTable.getBinding().getAllCurrentContexts().length < 180,
				"Not all binding contexts are available, but at least the Promise resolved");
		}.bind(this));
	});
});