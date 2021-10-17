import Log from "sap/base/Log";
import ParseException from "sap/ui/model/ParseException";
import ValidateException from "sap/ui/model/ValidateException";
import applyUnitMixin from "sap/ui/model/odata/type/UnitMixin";
import TestUtils from "sap/ui/test/TestUtils";
function UnitMixin() {
    this._applyUnitMixin.apply(this, arguments);
}
QUnit.module("sap.ui.model.odata.type.UnitMixin", {
    before: function () {
        function BaseType(oFormatOptions, oConstraints) {
            this.oConstraints = oConstraints || {};
            this.oFormatOptions = oFormatOptions || {};
            this.bShowMeasure = !oFormatOptions || !("showMeasure" in oFormatOptions) || oFormatOptions.showMeasure;
            this.bShowNumber = !oFormatOptions || !("showNumber" in oFormatOptions) || oFormatOptions.showNumber;
        }
        this.oBasePrototype = BaseType.prototype = {
            formatValue: function () { },
            getFormatOptions: function () { },
            parseValue: function () { },
            setFormatOptions: function () { }
        };
        UnitMixin.prototype.getCustomUnitForKey = function () { };
        applyUnitMixin(UnitMixin.prototype, BaseType, "customUnitsOrCurrencies", "Unit");
    },
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("constructor", function (assert) {
    var oConstraints, oType, oFormatOptions = { groupingEnabled: false };
    oType = new UnitMixin();
    assert.deepEqual(oType.oConstraints, {});
    assert.ok(oType.hasOwnProperty("mCustomUnits"));
    assert.strictEqual(oType.mCustomUnits, undefined);
    assert.deepEqual(oType.oFormatOptions, { emptyString: 0, parseAsString: true, unitOptional: true });
    assert.throws(function () {
        oType.setConstraints({ skipDecimalsValidation: true });
    }, new Error("Constraints are immutable"));
    assert.throws(function () {
        oType.setFormatOptions({ parseAsString: false });
    }, new Error("Format options are immutable"));
    [undefined, false, true, "foo"].forEach(function (vSkipDecimalsValidation) {
        oConstraints = { skipDecimalsValidation: vSkipDecimalsValidation };
        oType = new UnitMixin(undefined, oConstraints);
        assert.deepEqual(oType.oConstraints, { skipDecimalsValidation: vSkipDecimalsValidation });
        assert.notStrictEqual(oType.oConstraints, oConstraints);
    });
    oType = new UnitMixin(undefined, {});
    assert.deepEqual(oType.oConstraints, {});
    assert.throws(function () {
        oType = new UnitMixin(undefined, { minimum: 42, skipDecimalsValidation: true });
    }, new Error("Only 'skipDecimalsValidation' constraint is supported"));
    assert.throws(function () {
        oType = new UnitMixin(undefined, { minimum: 42 });
    }, new Error("Only 'skipDecimalsValidation' constraint is supported"));
    oType = new UnitMixin(oFormatOptions);
    assert.notStrictEqual(oType.oFormatOptions, oFormatOptions, "cloned");
    assert.deepEqual(oType.oFormatOptions, { emptyString: 0, groupingEnabled: false, parseAsString: true, unitOptional: true });
    oType = new UnitMixin({ parseAsString: "~parseAsString", unitOptional: "~unitOptional" });
    assert.deepEqual(oType.oFormatOptions, { emptyString: 0, parseAsString: "~parseAsString", unitOptional: "~unitOptional" });
    assert.throws(function () {
        oType = new UnitMixin({}, { minimum: 42 });
    }, new Error("Only 'skipDecimalsValidation' constraint is supported"));
    assert.throws(function () {
        oType = new UnitMixin({}, undefined, []);
    }, new Error("Only parameters oFormatOptions and oConstraints are supported"));
    assert.throws(function () {
        oType = new UnitMixin({ customUnitsOrCurrencies: {} });
    }, new Error("Format option customUnitsOrCurrencies is not supported"));
});
[
    undefined,
    {},
    { showMeasure: true },
    { showNumber: true },
    { showMeasure: true, showNumber: true }
].forEach(function (oFormatOptions, i) {
    QUnit.test("constructor: format option unitOptional=true; " + i, function (assert) {
        assert.strictEqual(new UnitMixin(oFormatOptions).oFormatOptions.unitOptional, true);
    });
});
[
    { showMeasure: false },
    { showNumber: false },
    { showMeasure: false, showNumber: true },
    { showMeasure: true, showNumber: false },
    { showMeasure: false, showNumber: false }
].forEach(function (oFormatOptions, i) {
    QUnit.test("constructor: format option unitOptional=false; " + i, function (assert) {
        assert.strictEqual(new UnitMixin(oFormatOptions).oFormatOptions.unitOptional, false);
    });
});
[
    undefined,
    null,
    [undefined, undefined, undefined],
    [42, undefined, undefined],
    [42, "KG", undefined],
    [42, undefined, {}],
    [undefined, "KG", {}],
    [undefined, undefined, {}],
    [null, undefined, {}],
    [undefined, null, {}]
].forEach(function (aValues, i) {
    QUnit.test("formatValue returns null, " + i, function (assert) {
        var oType = new UnitMixin();
        this.mock(this.oBasePrototype).expects("formatValue").never();
        assert.strictEqual(oType.formatValue(aValues, "foo"), null);
    });
});
QUnit.test("formatValue w/o customizing", function (assert) {
    var oBaseUnitMock = this.mock(this.oBasePrototype), oExpectation, oType = new UnitMixin(), aValues = [42, "KG", null];
    oExpectation = oBaseUnitMock.expects("formatValue").on(oType).withExactArgs([42, "KG"], "foo").returns("42 KG");
    oBaseUnitMock.expects("setFormatOptions").never();
    assert.strictEqual(oType.formatValue(aValues, "foo"), "42 KG");
    assert.strictEqual(oType.mCustomUnits, null);
    assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);
    aValues = [77, "KG", {}];
    oExpectation = oBaseUnitMock.expects("formatValue").on(oType).withExactArgs([77, "KG"], "foo").returns("77 KG");
    assert.strictEqual(oType.formatValue(aValues, "foo"), "77 KG");
    assert.strictEqual(oType.mCustomUnits, null, "remains null");
    assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);
    aValues = [78, "KG", undefined];
    oExpectation = oBaseUnitMock.expects("formatValue").on(oType).withExactArgs([78, "KG"], "foo").returns("78 KG");
    assert.strictEqual(oType.formatValue(aValues, "foo"), "78 KG");
    assert.strictEqual(oType.mCustomUnits, null, "remains null");
    assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);
    aValues = [42, null, undefined];
    oExpectation = oBaseUnitMock.expects("formatValue").on(oType).withExactArgs([42, null], "foo").returns("42");
    assert.strictEqual(oType.formatValue(aValues, "foo"), "42");
    assert.strictEqual(oType.mCustomUnits, null, "remains null");
    assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);
    aValues = [null, "KG", undefined];
    oExpectation = oBaseUnitMock.expects("formatValue").on(oType).withExactArgs([null, "KG"], "foo").returns("KG");
    assert.strictEqual(oType.formatValue(aValues, "foo"), "KG");
    assert.strictEqual(oType.mCustomUnits, null, "remains null");
    assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);
});
QUnit.test("formatValue with customizing", function (assert) {
    var oBaseFormatValueCall, oBaseUnitMock = this.mock(this.oBasePrototype), mCustomizing = {
        "G": { Text: "gram", UnitSpecificScale: 3 },
        "KG": { Text: "kilogram", UnitSpecificScale: 2 }
    }, mCustomizing2, mCustomUnits = {
        "G": { displayName: "gram", decimals: 3, "unitPattern-count-other": "{0} G" },
        "KG": { displayName: "kilogram", decimals: 2, "unitPattern-count-other": "{0} KG" }
    }, oSetFormatOptionsCall, oType = new UnitMixin(), oType2 = new UnitMixin(), oType3 = new UnitMixin(), oTypeCustomUnits, oTypeMock = this.mock(oType), aValues = ["42", "KG", mCustomizing];
    oTypeMock.expects("getCustomUnitForKey").withExactArgs(mCustomizing, "G").returns(mCustomUnits["G"]);
    oTypeMock.expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG").returns(mCustomUnits["KG"]);
    oSetFormatOptionsCall = oBaseUnitMock.expects("setFormatOptions").on(oType).withExactArgs({
        customUnitsOrCurrencies: mCustomUnits,
        emptyString: 0,
        parseAsString: true,
        unitOptional: true
    });
    oBaseFormatValueCall = oBaseUnitMock.expects("formatValue").on(oType).withExactArgs(["42", "KG"], "foo").returns("42 KG");
    assert.strictEqual(oType.formatValue(aValues, "foo"), "42 KG");
    assert.deepEqual(aValues, ["42", "KG", mCustomizing], "aValues unmodified");
    assert.deepEqual(oType.mCustomUnits, mCustomUnits);
    assert.ok(oSetFormatOptionsCall.calledBefore(oBaseFormatValueCall), "setFormatOptions only called on first call to formatValue");
    oTypeCustomUnits = oType.mCustomUnits;
    oBaseUnitMock.expects("formatValue").on(oType).withExactArgs(["77", "G"], "foo").returns("77 G");
    assert.strictEqual(oType.formatValue(["77", "G", mCustomizing], "foo"), "77 G");
    assert.deepEqual(oType.mCustomUnits, mCustomUnits);
    assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);
    oBaseUnitMock.expects("formatValue").on(oType).withExactArgs(["78", "G"], "foo").returns("78 G");
    assert.strictEqual(oType.formatValue(["78", "G"], "foo"), "78 G");
    assert.deepEqual(oType.mCustomUnits, mCustomUnits);
    assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);
    mCustomizing2 = { "G": { Text: "gram", UnitSpecificScale: 1 } };
    oBaseUnitMock.expects("formatValue").on(oType).withExactArgs(["77.123", "G"], "foo").returns("77.123 G");
    assert.strictEqual(oType.formatValue(["77.123", "G", mCustomizing2], "foo"), "77.123 G");
    assert.deepEqual(oType.mCustomUnits, mCustomUnits);
    assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);
    oBaseUnitMock.expects("formatValue").on(oType).withExactArgs(["78", "G"], "foo").returns("78 G");
    assert.strictEqual(oType.formatValue(["78", "G", null], "foo"), "78 G");
    assert.deepEqual(oType.mCustomUnits, mCustomUnits);
    assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);
    oBaseUnitMock.expects("formatValue").on(oType).withExactArgs(["78", null], "foo").returns("78");
    assert.strictEqual(oType.formatValue(["78", null, null], "foo"), "78");
    assert.deepEqual(oType.mCustomUnits, mCustomUnits);
    assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);
    oBaseUnitMock.expects("formatValue").on(oType).withExactArgs([null, "KG"], "foo").returns("KG");
    assert.strictEqual(oType.formatValue([null, "KG", null], "foo"), "KG");
    assert.deepEqual(oType.mCustomUnits, mCustomUnits);
    assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);
    oBaseUnitMock.expects("setFormatOptions").on(oType2).withExactArgs({
        customUnitsOrCurrencies: sinon.match.same(oType.mCustomUnits),
        emptyString: 0,
        parseAsString: true,
        unitOptional: true
    });
    oBaseUnitMock.expects("formatValue").on(oType2).withExactArgs([null, null], "foo").returns(null);
    assert.strictEqual(oType2.formatValue([null, null, mCustomizing], "foo"), null);
    assert.deepEqual(oType2.mCustomUnits, mCustomUnits);
    assert.strictEqual(oType2.mCustomUnits, oTypeCustomUnits);
    oBaseUnitMock.expects("setFormatOptions").on(oType3).withExactArgs({
        customUnitsOrCurrencies: sinon.match.same(oType.mCustomUnits),
        emptyString: 0,
        parseAsString: true,
        unitOptional: true
    });
    oBaseUnitMock.expects("formatValue").on(oType3).withExactArgs([null, "G"], "foo").returns("G");
    assert.strictEqual(oType3.formatValue([null, "G", mCustomizing], "foo"), "G");
    assert.deepEqual(oType3.mCustomUnits, mCustomUnits);
    assert.strictEqual(oType3.mCustomUnits, oTypeCustomUnits);
});
QUnit.test("parseValue delegates to base prototype", function (assert) {
    var oBaseUnitMock = this.mock(this.oBasePrototype), mCustomizing = {
        "KG": { Text: "kilogram", UnitSpecificScale: 2 }
    }, oType = new UnitMixin({ parseAsString: true });
    this.mock(oType).expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG").returns({
        displayName: "kilogram",
        decimals: 2,
        "unitPattern-count-other": "{0} KG"
    });
    oType.formatValue([42, "KG", mCustomizing], "string");
    oBaseUnitMock.expects("parseValue").withExactArgs("42 KG", "string").on(oType).returns(["42", "KG"]);
    assert.deepEqual(oType.parseValue("42 KG", "string"), ["42", "KG"]);
});
QUnit.test("parseValue: remove trailing zeroes", function (assert) {
    var oBaseUnitMock = this.mock(this.oBasePrototype), mCustomizing = {
        "KG": { Text: "kilogram", UnitSpecificScale: 2 }
    }, oType = new UnitMixin({ parseAsString: true });
    this.mock(oType).expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG").returns({
        displayName: "kilogram",
        decimals: 2,
        "unitPattern-count-other": "{0} KG"
    });
    oType.formatValue([42, "KG", mCustomizing], "string");
    oBaseUnitMock.expects("parseValue").withExactArgs("12.100", "string").on(oType).returns(["12.100", undefined]);
    assert.deepEqual(oType.parseValue("12.100", "string"), ["12.1", undefined]);
    oBaseUnitMock.expects("parseValue").withExactArgs("12.000", "string").on(oType).returns(["12.000", undefined]);
    assert.deepEqual(oType.parseValue("12.000", "string"), ["12", undefined]);
    oType = new UnitMixin({ parseAsString: false });
    oType.mCustomUnits = {
        "KG": {}
    };
    oBaseUnitMock.expects("parseValue").withExactArgs("12.000", "string").on(oType).returns([12, undefined]);
    assert.deepEqual(oType.parseValue("12.000", "string"), [12, undefined]);
});
QUnit.test("parseValue: empty field", function (assert) {
    var mCustomizing = {
        "KG": { Text: "kilogram", UnitSpecificScale: 2 }
    }, oType = new UnitMixin({ parseAsString: true });
    this.mock(oType).expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG").returns({
        displayName: "kilogram",
        decimals: 2,
        "unitPattern-count-other": "{0} KG"
    });
    oType.formatValue([null, null, mCustomizing], "string");
    this.mock(this.oBasePrototype).expects("parseValue").withExactArgs("42", "string").on(oType).returns(["42", undefined]);
    assert.deepEqual(oType.parseValue("42", "string"), ["42", undefined]);
});
QUnit.test("parseValue: falsy amount/measure and showNumber=false", function (assert) {
    var oType = new UnitMixin({ emptyString: null, parseAsString: false, showNumber: false });
    oType.mCustomUnits = {
        "KG": {}
    };
    this.mock(this.oBasePrototype).expects("parseValue").withExactArgs("", "string").on(oType).returns([undefined, null]);
    assert.deepEqual(oType.parseValue("", "string"), [undefined, null]);
});
QUnit.test("parseValue: no customizing", function (assert) {
    var oType = new UnitMixin({ parseAsString: true });
    oType.formatValue([null, null, null], "string");
    this.mock(this.oBasePrototype).expects("parseValue").withExactArgs("42.123 kg", "string").on(oType).returns(["42.123", "mass-kilogram"]);
    assert.deepEqual(oType.parseValue("42.123 kg", "string"), ["42.123", "mass-kilogram"]);
});
QUnit.test("parseValue, error if customizing is unset", function (assert) {
    assert.throws(function () {
        new UnitMixin().parseValue("42 KG", "string");
    }, new ParseException("Cannot parse value without customizing"));
});
QUnit.test("validateValue", function (assert) {
    var oType = new UnitMixin();
    assert.throws(function () {
        oType.validateValue(["77", "G"]);
    }, new ValidateException("Cannot validate value without customizing"));
    this.mock(oType).expects("getCustomUnitForKey").withExactArgs({ "G": { Text: "gram", UnitSpecificScale: 1 } }, "G").returns({ displayName: "gram", decimals: 1, "unitPattern-count-other": "{0} G" });
    oType.formatValue(["42", "G", { "G": { Text: "gram", UnitSpecificScale: 1 } }], "string");
    oType.validateValue(["77", "G"]);
    oType.validateValue([undefined, "KG"]);
    oType = new UnitMixin({ showNumber: false });
    oType.formatValue(["42", "G", { "G": { Text: "gram", UnitSpecificScale: 1 } }], "string");
    oType.validateValue([42, undefined]);
    oType = new UnitMixin();
    oType.formatValue(["42", "G", null], "string");
    oType.validateValue(["77", "G"]);
    oType = new UnitMixin(undefined, { skipDecimalsValidation: true });
    this.mock(oType).expects("getCustomUnitForKey").withExactArgs({ "G": { Text: "gram", UnitSpecificScale: 1 } }, "G").returns({ displayName: "gram", decimals: 1, "unitPattern-count-other": "{0} G" });
    oType.formatValue(["42", "G", { "G": { Text: "gram", UnitSpecificScale: 1 } }], "string");
    oType.validateValue(["1.23", "G"]);
});
QUnit.test("validateValue: check decimals, error cases", function (assert) {
    var mCustomizing = {
        "KG": { Text: "kilogram", UnitSpecificScale: 2 },
        "KG0": { Text: "kilogram", UnitSpecificScale: 0 }
    }, oType = new UnitMixin({ parseAsString: true }), oTypeMock = this.mock(oType);
    oTypeMock.expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG").returns({
        decimals: 2,
        displayName: "kilogram",
        "unitPattern-count-other": "{0} KG"
    });
    oTypeMock.expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG0").returns({
        decimals: 0,
        displayName: "kilogram",
        "unitPattern-count-other": "{0} KG="
    });
    oType.formatValue([42, "KG", mCustomizing], "string");
    oTypeMock.expects("getValidateException").withExactArgs(2).returns("error0");
    TestUtils.withNormalizedMessages(function () {
        assert.throws(function () {
            oType.validateValue(["123456789012345678901234567890.123", "KG"]);
        }, "error0");
    });
    oTypeMock.expects("getValidateException").withExactArgs(0).returns("error1");
    TestUtils.withNormalizedMessages(function () {
        assert.throws(function () {
            oType.validateValue(["12.1", "KG0"]);
        }, "error1");
    });
    oTypeMock.expects("getValidateException").withExactArgs(0).returns("error2");
    TestUtils.withNormalizedMessages(function () {
        assert.throws(function () {
            oType.validateValue([12.34, "KG0"]);
        }, "error2");
    });
});
[
    { oFormatOptions: undefined, aResult: [2] },
    { oFormatOptions: {}, aResult: [2] },
    { oFormatOptions: { showMeasure: true }, aResult: [2] },
    { oFormatOptions: { showMeasure: false }, aResult: [1, 2] },
    { oFormatOptions: { showNumber: true }, aResult: [2] },
    { oFormatOptions: { showNumber: false }, aResult: [0, 2] }
].forEach(function (oFixture, i) {
    QUnit.test("getPartsIgnoringMessages, #" + i, function (assert) {
        var oUnitType = new UnitMixin(oFixture.oFormatOptions);
        assert.deepEqual(oUnitType.getPartsIgnoringMessages(), oFixture.aResult);
    });
});
QUnit.test("getFormatOptions with format option for custom units", function (assert) {
    var oBaseUnitMock = this.mock(this.oBasePrototype), oBaseFormatOptions = {
        customUnitsOrCurrencies: { foo: undefined },
        emptyString: 0,
        parseAsString: true,
        unitOptional: true
    }, oType = new UnitMixin();
    oBaseUnitMock.expects("setFormatOptions").withExactArgs(oBaseFormatOptions).callsFake(function (oFormatOptions) {
        this.oFormatOptions = oFormatOptions;
    });
    oBaseUnitMock.expects("getFormatOptions").withExactArgs().returns(oBaseFormatOptions);
    assert.deepEqual(oType.oFormatOptions, { emptyString: 0, parseAsString: true, unitOptional: true });
    oType.formatValue([undefined, undefined, { foo: {} }]);
    assert.deepEqual(oType.oFormatOptions, oBaseFormatOptions);
    assert.deepEqual(oType.getFormatOptions(), { emptyString: 0, parseAsString: true, unitOptional: true });
});
[{
        iDecimals: 0,
        oFormatOptions: {},
        sResult: "EnterInt"
    }, {
        iDecimals: 2,
        oFormatOptions: {},
        sResult: "EnterNumberFraction 2"
    }, {
        iDecimals: 0,
        oFormatOptions: { showNumber: false },
        sResult: "Unit.WithoutDecimals"
    }, {
        iDecimals: 2,
        oFormatOptions: { showNumber: false },
        sResult: "Unit.WithDecimals 2"
    }].forEach(function (oFixture, i) {
    QUnit.test("getValidateException #" + i, function (assert) {
        var oResult, oType = new UnitMixin(oFixture.oFormatOptions);
        TestUtils.withNormalizedMessages(function () {
            oResult = oType.getValidateException(oFixture.iDecimals);
        });
        assert.ok(oResult instanceof ValidateException);
        assert.strictEqual(oResult.message, oFixture.sResult);
    });
});