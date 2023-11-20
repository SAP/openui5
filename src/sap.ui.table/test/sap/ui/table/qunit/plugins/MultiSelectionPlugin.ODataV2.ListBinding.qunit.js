/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/model/odata/v2/ODataModel",
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

	function createData(iStartIndex, iLength, bPaging) {
		var aData = [];
		var sService = "MyService" + (bPaging ? "WithPaging" : "");

		if (iStartIndex + iLength > iCount) {
			iLength = iCount - iStartIndex;
		}

		for (var i = iStartIndex; i < iStartIndex + iLength; i++) {
			aData.push({
				__metadata: {
					uri: "http://localhost:8088/" + sService + "/ProductSet(ProductID='" + i + "')",
					type: "GWSAMPLE_BASIC.Product"
				},
				Name: "Test Product (" + i + ")"
			});
		}

		return aData;
	}

	function createResponse(iStartIndex, iLength, iPageSize) {
		var mResponse = {
			headers: {
				"Content-Type": "application/json;charset=utf-8"
			}
		};
		var bPageLimitReached = iPageSize != null && iPageSize > 0 && iLength > iPageSize;

		if (bPageLimitReached) {
			var sSkipToken = "&$skiptoken='" + (iStartIndex + iPageSize - 1) + "'";
			mResponse.message = {d: {results: createData(iStartIndex, iPageSize, true)}};
			mResponse.message.d.__next = "http://localhost:8088/MyServiceWithPaging/ProductSet?$top=" + (iLength - iPageSize) + sSkipToken;
		} else {
			mResponse.message = {d: {results: createData(iStartIndex, iLength)}};
		}

		return mResponse;
	}

	TestUtils.useFakeServer(sinon.sandbox.create(), "sap/ui/core/qunit/model", null, [{
		regExp: /^GET \/MyService(WithPaging)?\/\$metadata$/,
		response: {
			source: "GWSAMPLE_BASIC.metadata.xml"
		}
	}, {
		regExp: /^GET \/MyService(WithPaging)?\/ProductSet\/\$count$/,
		response: {
			headers: {
				"Content-Type": "text/plain;charset=utf-8"
			},
			message: iCount
		}
	}, {
		regExp: /^GET \/MyService(WithPaging)?\/ProductSet\?\$skip=(\d+)\&\$top=(\d+)$/,
		response: {
			buildResponse: function(aMatches, oResponse) {
				var iPageSize = aMatches[1] ? 50 : 0;
				var iSkip = parseInt(aMatches[2]);
				var iTop = parseInt(aMatches[3]);
				var mResponse = createResponse(iSkip, iTop, iPageSize);

				oResponse.headers = mResponse.headers;
				oResponse.message = JSON.stringify(mResponse.message);
			}
		}
	}]);

	TableQUnitUtils.setDefaultSettings({
		dependents: [new MultiSelectionPlugin()],
		rows: {path: "/ProductSet"},
		columns: TableQUnitUtils.createTextColumn({text: "Name", bind: true})
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
			this.oTable = TableQUnitUtils.createTable({
				models: new ODataModel("/MyService/")
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

	QUnit.module("Load data with server-driven paging", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: new ODataModel("/MyServiceWithPaging/")
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
				threshold: 60,
				models: new ODataModel("/MyService/", {
					defaultCountMode: "None"
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
				models: new ODataModel("/MyService/", {
					defaultCountMode: "None"
				})
			});
			this.oMultiSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished);
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			iCount = 400;
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
			assertAllContextsAvailable(assert, this.oTable);
		}.bind(this));
	});
});