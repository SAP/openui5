/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/SimpleType",
	"sap/ui/model/Type"
], function (Log, SimpleType, Type) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.SimpleType", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oSetFormatOptionsCall = this.mock(SimpleType.prototype).expects("setFormatOptions").withExactArgs({})
				.callsFake(function () {
					assert.ok(this.hasOwnProperty("oInputFormat"), "oInputFormat set before setFormatOptions call");
					assert.strictEqual(this.oInputFormat, undefined);
				});
		var oSetConstraintsCall = this.mock(SimpleType.prototype).expects("setConstraints").withExactArgs({});

		// code under test
		var oType = new SimpleType();

		assert.ok(oType instanceof Type, "is a Type");
		assert.ok(oType instanceof SimpleType, "is a SimpleType");
		assert.strictEqual(oType.getName(), "SimpleType", "type name");
		assert.ok(oSetFormatOptionsCall.calledOn(oType));
		assert.ok(oSetConstraintsCall.calledOn(oType));
	});

	//*********************************************************************************************
	QUnit.test("c'tor sets constraints and format options", function (assert) {
		var oConstraints = "~oConstraints",
			oFormatOptions = "~oFormatOptions",
			oType;

		// code under test
		oType = new SimpleType(oFormatOptions, oConstraints);

		assert.strictEqual(oType.oConstraints, oConstraints);
		assert.strictEqual(oType.oFormatOptions, oFormatOptions);

		// code under test
		oType = new SimpleType();

		assert.deepEqual(oType.oConstraints, {});
		assert.deepEqual(oType.oFormatOptions, {});

		// code under test
		oType = new SimpleType(null, null);

		assert.deepEqual(oType.oConstraints, {});
		assert.deepEqual(oType.oFormatOptions, {});
	});

	//*********************************************************************************************
	QUnit.test("getConstraints: with and w/o constraints", function (assert) {
		var oConstraintsResult,
			oQux = {qux : "quux"},
			oType = new SimpleType(undefined, {foo : "bar", baz : oQux});

		// code under test
		oConstraintsResult = oType.getConstraints();

		assert.deepEqual(oConstraintsResult, {foo : "bar", baz : oQux});
		assert.notStrictEqual(oConstraintsResult, oType.oConstraints);
		assert.notStrictEqual(oConstraintsResult.baz, oQux);

		// code under test
		assert.deepEqual(new SimpleType().getConstraints(), {});
	});

	//*********************************************************************************************
	QUnit.test("getFormatOptions: with and w/o format options", function (assert) {
		var oFormatOptionsResult,
			oQux = {qux : "quux"},
			oType = new SimpleType({foo : "bar", baz : oQux});

		// code under test
		oFormatOptionsResult = oType.getFormatOptions();

		assert.deepEqual(oFormatOptionsResult, {foo : "bar", baz : oQux});
		assert.notStrictEqual(oFormatOptionsResult, oType.oFormatOptions);
		assert.notStrictEqual(oFormatOptionsResult.baz, oQux);

		// code under test
		assert.deepEqual(new SimpleType().getFormatOptions(), {});
	});

	//*********************************************************************************************
	QUnit.test("combineMessages", function (assert) {
		// code under test
		assert.strictEqual(SimpleType.prototype.combineMessages([]), "");
		assert.strictEqual(SimpleType.prototype.combineMessages(["M0"]), "M0", "single message is unchanged");
		assert.strictEqual(SimpleType.prototype.combineMessages(["M0."]), "M0.");

		assert.strictEqual(SimpleType.prototype.combineMessages(["M0", "M1"]), "M0. M1.");
		// BCP 2380043909: messages may end with a dot
		assert.strictEqual(SimpleType.prototype.combineMessages(["M0.", "M1"]), "M0. M1.");
		assert.strictEqual(SimpleType.prototype.combineMessages(["M0", "M1."]), "M0. M1.");
		assert.strictEqual(SimpleType.prototype.combineMessages(["M0.", "M1."]), "M0. M1.");
	});
});