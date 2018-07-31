/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils",
	"sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	DataUtils,
	ErrorUtils,
	jQuery,
	sinon
){
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("LayerContentMaster", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when formatting data with js or properties type", function (assert) {
			var sFileType = "js";
			var oData = "a plain text";
			DataUtils.formatData(oData, sFileType);
			assert.equal(DataUtils.formatData(oData, sFileType), oData, "then nothing is changed");
		});

		QUnit.test("when formatting data of other files type", function (assert) {
			var oData = {};
			var oStubbedJsonParse = sandbox.stub(JSON, "parse");
			var oStubbedJsonStringify = sandbox.stub(JSON, "stringify");
			DataUtils.formatData(oData);
			assert.ok(oStubbedJsonParse.calledOnce, "then JSON parse is called");
			assert.ok(oStubbedJsonStringify.calledOnce, "then JSON stringify is called");
		});

		QUnit.test("when formatting invalid data", function (assert) {
			var oData = "invalidjsonformat";
			var oStubbedDisplayError = sandbox.stub(ErrorUtils, "displayError");
			var oFormatData = DataUtils.formatData(oData);
			assert.ok(oStubbedDisplayError.calledOnce, "then error is called");
			assert.equal(oFormatData, oData, "then the original data is return");
		});

		QUnit.test("when a black list item is verified", function(assert) {
			var oContentItem = {
				category: "NS",
				name: "LREP_HOME_CONTENT",
				ns: "UIF/"
			};

			assert.equal(DataUtils.isNotOnBlacklist(oContentItem), false, "then it is recognized");
		});

		QUnit.test("when cleanLeadingAndTrailingSlashes is called for a string with leading and trailing slashes", function(assert) {
			var sNameSpace = "/path1/path2/";

			assert.equal(DataUtils.cleanLeadingAndTrailingSlashes(sNameSpace), "path1/path2", "then a correct namespace string is returned");
		});

		QUnit.test("when endsStringWith function called", function (assert) {
			var sString = "this is a string";
			assert.equal(DataUtils.endsStringWith(sString, "string"), true, "then a correct result is returned");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});