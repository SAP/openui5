import AggregationEmpty from "sap/ui/test/matchers/AggregationEmpty";
import ComboBox from "sap/m/ComboBox";
import ListItem from "sap/ui/core/ListItem";
QUnit.module("AggregationEmpty", {
    beforeEach: function () {
        this.oComboBox = new ComboBox("myCB");
    },
    afterEach: function () {
        this.oComboBox.destroy();
    }
});
QUnit.test("Should not match a filled aggregation", function (assert) {
    this.oComboBox.addItem(new ListItem());
    var oMatcher = new AggregationEmpty({ name: "items" });
    var bResult = oMatcher.isMatching(this.oComboBox);
    assert.ok(!bResult, "Did not match because there was an item");
});
QUnit.test("Should match an empty aggregation", function (assert) {
    var oMatcher = new AggregationEmpty({ name: "items" });
    var bResult = oMatcher.isMatching(this.oComboBox);
    assert.ok(bResult, "Matched because there was no item");
});
QUnit.test("Should complain if control does not have an aggregation", function (assert) {
    var oMatcher = new AggregationEmpty({ name: "anAggregationThatWillNeverBeAddedToTheCombobox" });
    var bResult = oMatcher.isMatching(this.oComboBox);
    assert.strictEqual(bResult, false, "Did not match");
});