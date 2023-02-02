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

	function createData(iStartIndex, iLength) {
		var aData = [];

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

	TestUtils.useFakeServer(sinon.sandbox.create(), "sap/ui/core/qunit/odata/v4/data/", null, [{
		regExp: /^GET \/MyService(WithPaging)?\/\$metadata$/,
		response: {
			source: "metadata_tea_busi_product.xml"
		}
	}, {
		regExp: /^GET \/MyService(WithPaging)?\/Products\?(\$count=true)?&\$skip=(\d+)\&\$top=(\d+)$/,
		response: {
			buildResponse: function(aMatches, oResponse) {
				var iPageSize = aMatches[1] === "WithPaging" ? 50 : 0;
				var bWithCount = aMatches[2] === "$count=true";
				var iSkip = parseInt(aMatches[3]);
				var iTop = parseInt(aMatches[4]);
				var mResponse = createResponse(iSkip, iTop, iPageSize);

				if (bWithCount) {
					mResponse.message["@odata.count"] = "200";
				}

				oResponse.message = JSON.stringify(mResponse.message);
			}
		}
	}]);

	TableQUnitUtils.setDefaultSettings({
		plugins: [new MultiSelectionPlugin()],
		rows: {
			path: "/Products",
			parameters: {
				$count: true
			}
		},
		columns: TableQUnitUtils.createTextColumn({text: "Name", bind: true})
	});

	QUnit.module("Load data", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: new ODataModel({
					serviceUrl: "/MyService/"
				})
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
				models: new ODataModel({
					serviceUrl: "/MyServiceWithPaging/"
				})
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