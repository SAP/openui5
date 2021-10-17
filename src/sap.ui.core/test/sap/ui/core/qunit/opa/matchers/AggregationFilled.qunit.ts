import AggregationFilled from "sap/ui/test/matchers/AggregationFilled";
import ComboBox from "sap/m/ComboBox";
import ListItem from "sap/ui/core/ListItem";
import ObjectHeader from "sap/m/ObjectHeader";
import Column from "sap/m/Column";
QUnit.module("AggregationFilled", {
    beforeEach: function () {
        this.oComboBox = new ComboBox("myCB");
        this.oColumn = new Column({ header: new ObjectHeader({ title: "foo" }) });
    },
    afterEach: function () {
        this.oComboBox.destroy();
        this.oColumn.destroy();
    }
});
QUnit.test("Should match a filled aggregation", function (assert) {
    this.oComboBox.addItem(new ListItem());
    var oMatcher = new AggregationFilled({ name: "items" });
    var bResult = oMatcher.isMatching(this.oComboBox);
    assert.ok(bResult, "Matched because there was an item");
});
QUnit.test("Should match aggregation with cardinality 0..1", function (assert) {
    var oMatcher = new AggregationFilled({ name: "header" });
    var bResult = oMatcher.isMatching(this.oColumn);
    assert.ok(bResult, "Matched one control");
});
QUnit.test("Should not match an empty aggregation", function (assert) {
    var oMatcher = new AggregationFilled({ name: "items" });
    var oDebugSpy = this.spy(oMatcher._oLogger, "debug");
    var bResult = oMatcher.isMatching(this.oComboBox);
    assert.ok(!bResult, "Did not match because there was no item");
    sinon.assert.calledWith(oDebugSpy, "Control 'Element sap.m.ComboBox#myCB' aggregation 'items' is empty");
});
QUnit.test("Should complain if control does not have an aggregation", function (assert) {
    var oMatcher = new AggregationFilled({ name: "anAggregationThatWillNeverBeAddedToTheCombobox" });
    var oErrorSpy = this.spy(oMatcher._oLogger, "error");
    var bResult = oMatcher.isMatching(this.oComboBox);
    assert.strictEqual(bResult, false, "Did not match");
    sinon.assert.calledWith(oErrorSpy, "Control 'Element sap.m.ComboBox#myCB' does not have an aggregation called 'anAggregationThatWillNeverBeAddedToTheCombobox'");
});