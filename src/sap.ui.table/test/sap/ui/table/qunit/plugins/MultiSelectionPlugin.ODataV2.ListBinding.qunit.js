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

	function createData(iStartIndex, iLength, bPaging) {
		var aData = [];
		var sService = "MyService" + (bPaging ? "WithPaging" : "");

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

	TestUtils.useFakeServer(sinon.sandbox.create(), "sap/ui/core/qunit/model/", null, [{
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
			message: "200"
		}
	}, {
		regExp: /^GET \/MyService(WithPaging)?\/ProductSet\?\$skip=(\d+)\&\$top=(\d+)$/,
		response: {
			buildResponse: function(aMatches, oResponse) {
				var iPageSize = aMatches[1] === "WithPaging" ? 50 : 0;
				var iSkip = parseInt(aMatches[2]);
				var iTop = parseInt(aMatches[3]);
				var mResponse = createResponse(iSkip, iTop, iPageSize);

				oResponse.headers = mResponse.headers;
				oResponse.message = JSON.stringify(mResponse.message);
			}
		}
	}]);

	TableQUnitUtils.setDefaultSettings({
		plugins: [new MultiSelectionPlugin()],
		rows: {path: "/ProductSet"},
		columns: TableQUnitUtils.createTextColumn({text: "Name", bind: true})
	});

	QUnit.module("Load data", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: new ODataModel("/MyService/")
			});
			this.oMultiSelectionPlugin = this.oTable.getPlugins()[0];
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
			assert.equal(this.oTable.getBinding().getAllCurrentContexts().length, 200, "All binding contexts are available");
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			var aContexts = this.oTable.getBinding().getContexts(0, 190, 0, true);

			assert.equal(this.oTable.getBinding().getAllCurrentContexts().length, 190, "The expected number of binding contexts is available");
			assert.equal(aContexts.length, 190, "Binding contexts in selected range are available");
			assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
		}.bind(this));
	});

	QUnit.module("Load data with server-side paging", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: new ODataModel("/MyServiceWithPaging/")
			});
			this.oMultiSelectionPlugin = this.oTable.getPlugins()[0];
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
			assert.equal(this.oTable.getBinding().getAllCurrentContexts().length, 200, "All binding contexts are available");
		}.bind(this));
	});

	QUnit.test("Select range", function(assert) {
		return this.oMultiSelectionPlugin.setSelectionInterval(0, 189).then(function() {
			var aContexts = this.oTable.getBinding().getContexts(0, 190, 0, true);

			assert.equal(this.oTable.getBinding().getAllCurrentContexts().length, 190, "The expected number of binding contexts is available");
			assert.equal(aContexts.length, 190, "Binding contexts in selected range are available");
			assert.ok(!aContexts.includes(undefined), "There are no undefined contexts");
		}.bind(this));
	});
});