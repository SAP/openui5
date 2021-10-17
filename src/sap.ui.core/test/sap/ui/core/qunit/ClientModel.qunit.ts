import ClientModel from "sap/ui/model/ClientModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
QUnit.module("sap.ui.model.ClientModel: Unsupported Filter Operators", {
    beforeEach: function () {
        this.oModel = new ClientModel();
    },
    getErrorWithMessage: function (sFilter) {
        return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
    }
});
QUnit.test("Empty Arguments", function (assert) {
    this.oModel.checkFilterOperation();
    assert.ok(true, "No arguments lead to a positive result");
    this.oModel.checkFilterOperation([]);
    assert.ok(true, "Empty array lead to a positive result");
});
QUnit.test("Simple Filters - Supported are OK", function (assert) {
    var oSupported = new Filter("x", FilterOperator.NE, "Foo");
    this.oModel.checkFilterOperation(oSupported);
    assert.ok(true, "Valid operators are supported");
    var oSupported2 = new Filter({
        path: "y",
        operator: FilterOperator.NE,
        value1: "FooBar"
    });
    this.oModel.checkFilterOperation(oSupported2);
    assert.ok(true, "Valid operators are supported");
    var oSupported3 = new Filter("z", function () { });
    this.oModel.checkFilterOperation(oSupported3);
    assert.ok(true, true, "local fnTest is ignored (comma separated syntax)");
    var oSupported4 = new Filter({
        path: "z",
        test: function () { }
    });
    this.oModel.checkFilterOperation(oSupported4);
    assert.ok(true, "local fnTest is ignored (object syntax)");
});
QUnit.test("Simple Filters - Unsupported are not OK - Incorrect lambda operator", function (assert) {
    var oUnsupported3 = new Filter({
        path: "x",
        operator: FilterOperator.Any,
        variable: "c",
        condition: new Filter()
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oUnsupported3);
    }.bind(this), this.getErrorWithMessage(FilterOperator.Any), "Invalid operators are not supported (object syntax)");
    var oUnsupported4 = new Filter({
        path: "y",
        operator: FilterOperator.All,
        variable: "abc",
        condition: new Filter()
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oUnsupported4);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators are not supported (object syntax)");
});
QUnit.test("Simple Filters - Unsupported are not OK - Correct lambda operator", function (assert) {
    var oUnsupported3 = new Filter({
        path: "x",
        operator: FilterOperator.Any,
        variable: "id1",
        condition: new Filter("snytax", FilterOperator.GT, 200)
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oUnsupported3);
    }.bind(this), this.getErrorWithMessage(FilterOperator.Any), "Invalid operators are not supported (object syntax)");
    var oUnsupported4 = new Filter({
        path: "y",
        operator: FilterOperator.All,
        variable: "id2",
        condition: new Filter("snytax", FilterOperator.NE, 66)
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oUnsupported4);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators are not supported (object syntax)");
});
QUnit.test("Multi Filters (Simple) - Supported are OK", function (assert) {
    var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    var oFilter2 = new Filter("y", FilterOperator.GT, "Bar");
    var oMultiFilter2 = new Filter([oFilter1, oFilter2], false);
    this.oModel.checkFilterOperation(oMultiFilter2);
    assert.ok(true, "Valid operators in multi-filter are supported (comma separated syntax)");
    var oMultiFilter = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    this.oModel.checkFilterOperation(oMultiFilter);
    assert.ok(true, "Valid operators in multi-filter are supported (object syntax)");
});
QUnit.test("Multi Filters (Simple) - Unsupported are not OK - incorrect lambda operator", function (assert) {
    var oFilter1 = new Filter({ path: "y", operator: FilterOperator.All, variable: "x", condition: new Filter("z", FilterOperator.EQ, 100) });
    var oFilter2 = new Filter("y", FilterOperator.GT, "Bar");
    var oMultiFilter = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported (object syntax)");
    oMultiFilter = new Filter({
        filters: [oFilter1, oFilter2],
        and: false
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported (object syntax)");
    var oMultiFilter2 = new Filter([oFilter1, oFilter2], true);
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter2);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported (comma separated syntax)");
    oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    oFilter2 = new Filter({ path: "y", operator: FilterOperator.Any, variable: "abc", condition: new Filter() });
    oMultiFilter2 = new Filter([oFilter1, oFilter2], true);
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter2);
    }.bind(this), this.getErrorWithMessage(FilterOperator.Any), "Invalid operators in multi-filter are unsupported (comma separated syntax)");
});
QUnit.test("Multi Filters (Simple) - Unsupported are not OK - correct lambda operator", function (assert) {
    var oFilter1 = new Filter({ path: "y", operator: FilterOperator.All, variable: "x", condition: new Filter("z", FilterOperator.EQ, 100) });
    var oFilter2 = new Filter("y", FilterOperator.GT, new Filter("z", FilterOperator.NE, 77));
    var oMultiFilter = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported (object syntax)");
    oMultiFilter = new Filter({
        filters: [oFilter1, oFilter2],
        and: false
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported (object syntax)");
    var oMultiFilter2 = new Filter([oFilter1, oFilter2], true);
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter2);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported (comma separated syntax)");
    oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    oFilter2 = new Filter({ path: "y", operator: FilterOperator.Any, variable: "dd", condition: new Filter("z", FilterOperator.EQ, 110) });
    oMultiFilter2 = new Filter([oFilter1, oFilter2], true);
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter2);
    }.bind(this), this.getErrorWithMessage(FilterOperator.Any), "Invalid operators in multi-filter are unsupported (comma separated syntax)");
});
QUnit.test("Multi Filters (Complex) - Supported are OK", function (assert) {
    var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    var oFilter2 = new Filter("y", FilterOperator.GT, "Bar");
    var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
    var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");
    var oMultiFilter1 = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);
    var oMultiFilter3 = new Filter([oMultiFilter2, oFilter4]);
    this.oModel.checkFilterOperation(oMultiFilter3);
    assert.ok(true, "Valid operators in multi-filter are supported");
});
QUnit.test("Multi Filters (Complex) 1 - Unsupported are not OK", function (assert) {
    var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    var oFilter2 = new Filter({ path: "y", operator: FilterOperator.All, variable: "x", condition: new Filter("z", FilterOperator.EQ, 100) });
    var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
    var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");
    var oMultiFilter1 = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);
    var oMultiFilter3 = new Filter({
        filters: [oMultiFilter2, oFilter4],
        and: true
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter3);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported");
});
QUnit.test("Multi Filters (Complex) 2 - Unsupported are not OK", function (assert) {
    var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    var oFilter2 = new Filter({
        path: "y",
        operator: FilterOperator.All,
        variable: "id1",
        condition: new Filter([
            new Filter("t", FilterOperator.GT, 66),
            new Filter({ path: "g", operator: FilterOperator.Any, variable: "id2", condition: new Filter("f", FilterOperator.NE, "hello") })
        ], true)
    });
    var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
    var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");
    var oMultiFilter1 = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    var oMultiFilter2 = new Filter([oMultiFilter1, oFilter3], false);
    var oMultiFilter3 = new Filter({
        filters: [oMultiFilter2, oFilter4],
        and: true
    });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter3);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported");
});
QUnit.module("sap.ui.model.ClientModel: Create own model which supports lambda operators", {
    beforeEach: function () {
        var SomeOwnModel = ClientModel.extend("sap.ui.model.SomeOwnModel", {
            constructor: function (oData) {
                ClientModel.apply(this, arguments);
                this.mUnsupportedFilterOperators = { "All": true };
            }
        });
        this.oModel = new SomeOwnModel();
    },
    getErrorWithMessage: function (sFilter) {
        return new Error("Filter instances contain an unsupported FilterOperator: " + sFilter);
    }
});
QUnit.test("Own model supports the Any operator (Simple)", function (assert) {
    var oSupportedFilter = new Filter({ path: "y", operator: FilterOperator.Any, variable: "x", condition: new Filter("z", FilterOperator.EQ, 100) });
    this.oModel.checkFilterOperation(oSupportedFilter);
    assert.ok(true, "Supported lambda operator provided");
});
QUnit.test("Own model does not support All operator (Simple)", function (assert) {
    var oSupportedFilter = new Filter({ path: "y", operator: FilterOperator.All, variable: "x", condition: new Filter("z", FilterOperator.EQ, 100) });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oSupportedFilter);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Unsupported lambda operator provided");
});
QUnit.test("Multi Filters (Complex) - Supported are OK", function (assert) {
    var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    var oFilter2 = new Filter("y", FilterOperator.GT, "Bar");
    var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
    var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");
    var oMultiFilter1 = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    var oAnyFilter = new Filter({ path: "foo", operator: FilterOperator.Any, variable: "id1", condition: oMultiFilter1 });
    var oMultiFilter2 = new Filter([oAnyFilter, oFilter3], false);
    var oMultiFilter3 = new Filter([oMultiFilter2, oFilter4]);
    this.oModel.checkFilterOperation(oMultiFilter3);
    assert.ok(true, "Valid operators in multi-filter are supported");
});
QUnit.test("Multi Filters (Complex) - Unsupported are not OK", function (assert) {
    var oFilter1 = new Filter("x", FilterOperator.EQ, "Foo");
    var oFilter2 = new Filter("y", FilterOperator.GT, "Bar");
    var oFilter3 = new Filter("z", FilterOperator.NE, "Bla");
    var oFilter4 = new Filter("t", FilterOperator.LE, "ZZZ");
    var oMultiFilter1 = new Filter({
        filters: [oFilter1, oFilter2],
        and: true
    });
    var oAnyFilter = new Filter({ path: "y", operator: FilterOperator.All, variable: "x", condition: oMultiFilter1 });
    var oMultiFilter2 = new Filter([oAnyFilter, oFilter3], false);
    var oMultiFilter3 = new Filter([oMultiFilter2, oFilter4]);
    assert.throws(function () {
        this.oModel.checkFilterOperation(oMultiFilter3);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported");
});
QUnit.test("Multi Filters (Complex) 2 - Unsupported are not OK", function (assert) {
    var oFilter3 = new Filter({ path: "y", operator: FilterOperator.All, variable: "x", condition: new Filter("z", FilterOperator.EQ, 100) });
    var oFilter2 = new Filter([
        new Filter("c", FilterOperator.NE, "bar"),
        new Filter("c", FilterOperator.GT, 456),
        new Filter({ path: "y", operator: FilterOperator.Any, variable: "x", condition: oFilter3 })
    ]);
    var oFilter1 = new Filter({ path: "y", operator: FilterOperator.Any, variable: "x", condition: oFilter2 });
    assert.throws(function () {
        this.oModel.checkFilterOperation(oFilter1);
    }.bind(this), this.getErrorWithMessage(FilterOperator.All), "Invalid operators in multi-filter are unsupported");
});