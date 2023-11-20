/*!
 * ${copyright}
 */

/*global QUnit */
/*eslint no-warning-comments: 0 */
/*eslint max-nested-callbacks: [2, 10]*/

sap.ui.define([
		"sap/ui/mdc/condition/ConditionModel",
		"sap/ui/mdc/condition/Condition",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/ChangeReason",
		"sap/ui/mdc/enums/ConditionValidated",
		"sap/ui/mdc/enums/OperatorName"
		], function(ConditionModel, Condition, JSONModel, ChangeReason, ConditionValidated, OperatorName) {
	"use strict";

	let oConditionModel;
	let iCount = 0;
	let oPropertyChange = {};
	function handlePropertyChange(oEvent) {
		const sPath = oEvent.getParameter("path");
		iCount++;
		if (!oPropertyChange[sPath]) {
			oPropertyChange[sPath] = {reason: "", count: 0, value: undefined};
		}
		oPropertyChange[sPath].reason = oEvent.getParameter("reason");
		oPropertyChange[sPath].count++;
		oPropertyChange[sPath].value = oEvent.getParameter("value");
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.mdc.condition.ConditionModel", {
		beforeEach: function() {
			oConditionModel = new ConditionModel();
		},

		afterEach: function() {
			iCount = 0;
			oPropertyChange = {};
			if (oConditionModel) {
				oConditionModel.destroy();
				oConditionModel = undefined;
			}
		}
	});


	//*********************************************************************************************
	QUnit.test("create condition", function(assert) {
		const sData = JSON.stringify(oConditionModel.getData());
		assert.ok(sData === '{"conditions":{},"fieldPath":{}}', "Default Data exist");
	});

	/**
	 * @deprecated use the sap.ui.mdc.condition.Condition.createItemCondition or sap.ui.mdc.condition.Condition.createCondition
	 */
	QUnit.test("ConditionModel.createCondition", function(assert) {
		let oCondition = oConditionModel.createCondition("fieldPath1", OperatorName.EQ, ["foo"]); // test deprecated function for compatibility reasons
		assert.equal(oCondition.operator, OperatorName.EQ, "condition.operator must be 'EQ'");
		assert.equal(oCondition.values.length, 1, "condition.values.length must be 1");
		assert.equal(oCondition.values[0], "foo", "condition.value[0] must be 'foo'");
		assert.notOk(oCondition.validated, "Condition validated unknown");

		oCondition = Condition.createCondition(OperatorName.GT, [100]);
		assert.equal(oCondition.operator, OperatorName.GT, "condition.operator must be 'GT'");
		assert.equal(oCondition.values.length, 1, "condition.values.length must be 1");
		assert.equal(oCondition.values[0], 100, "condition.value[0] must be 100");
		assert.notOk(oCondition.validated, "Condition validated unknown");

		oCondition = oConditionModel.createItemCondition("fieldPath3", "key", "description"); // test deprecated function for compatibility reasons
		assert.equal(oCondition.operator, OperatorName.EQ, "condition.operator must be 'EQ'");
		assert.equal(oCondition.values.length, 2, "condition.values.length must be 2");
		assert.equal(oCondition.values[0], "key", "condition.value[0] must be 'key'");
		assert.equal(oCondition.values[1], "description", "condition.value[1] must be 'description'");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition is validated");

		oCondition = Condition.createItemCondition("key", "description");
		assert.equal(oCondition.operator, OperatorName.EQ, "condition.operator must be 'EQ'");
		assert.equal(oCondition.values.length, 2, "condition.values.length must be 2");
		assert.equal(oCondition.values[0], "key", "condition.value[0] must be 'key'");
		assert.equal(oCondition.values[1], "description", "condition.value[1] must be 'description'");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition is validated");
	});

	QUnit.test("ConditionModel.add/removeConditions", function(assert) {
		oConditionModel.attachPropertyChange(handlePropertyChange);

		oConditionModel.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["foo"]));
		assert.equal(iCount, 1, "PropertyChange event fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
		assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
		iCount = 0; oPropertyChange = {};
		oConditionModel.addCondition("field/Path2", Condition.createCondition(OperatorName.BT, [1, 100]));
		assert.equal(iCount, 1, "PropertyChange event fired once");
		assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
		assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
		assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for field/Path2 value");
		iCount = 0; oPropertyChange = {};
		oConditionModel.addCondition("fieldPath3", Condition.createCondition(OperatorName.GT, [new Date()]));
		assert.equal(iCount, 1, "PropertyChange event fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath3"] && oPropertyChange["/conditions/fieldPath3"].count, 1, "PropertyChange event for fieldPath3 fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath3"] && oPropertyChange["/conditions/fieldPath3"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath3 reason");
		assert.deepEqual(oPropertyChange["/conditions/fieldPath3"] && oPropertyChange["/conditions/fieldPath3"].value, oConditionModel.getConditions("fieldPath3"), "PropertyChange event for fieldPath3 value");
		iCount = 0; oPropertyChange = {};

		assert.equal(oConditionModel.getConditions("fieldPath1").length, 1, "one condition expected");
		assert.equal(oConditionModel.getConditions("field/Path2").length, 1, "one condition expected");
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "one condition expected");

		oConditionModel.addCondition("fieldPath3", Condition.createCondition(OperatorName.LT, ["xxx"]));
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 2, "two conditions expected");

		oConditionModel.addCondition("fieldPath3", Condition.createCondition(OperatorName.LT, ["xxx"]));
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 2, "still 2 conditions expected, last addCondition ignored because the condition already exist");

		oConditionModel.addCondition("fieldPath3", Condition.createCondition(OperatorName.LT, ["xxx"]), true);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 3, "now 3 conditions expected");

		iCount = 0;	oPropertyChange = {};
		oConditionModel.removeCondition("fieldPath1", 0);
		assert.equal(oConditionModel.getConditions("fieldPath1").length, 0, "no conditions expected");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
		assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
		iCount = 0;	oPropertyChange = {};

		oConditionModel.removeCondition("field/Path2", 0);
		assert.equal(oConditionModel.getConditions("field/Path2").length, 0, "no conditions expected");
		assert.equal(iCount, 1, "PropertyChange event fired once");
		assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
		assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
		assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for field/Path2 value");
		iCount = 0;	oPropertyChange = {};

		oConditionModel.removeCondition("fieldPath3", 0);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 2, "two condition expected");
		let oCondition = oConditionModel.getConditions("fieldPath3")[0];
		oConditionModel.removeCondition("fieldPath3", oCondition);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "one condition expected");
		oCondition = Condition.createCondition(OperatorName.GT, ["XYZ"]);
		oConditionModel.removeCondition("fieldPath3", oCondition);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "one condition expected, as removing condition is not in model");
		oConditionModel.removeCondition("fieldPath3", 0);
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 0, "no condition expected");
	});

	QUnit.test("ConditionModel.insertConditions", function(assert) {
		oConditionModel.attachPropertyChange(handlePropertyChange);

		oConditionModel.insertCondition("fieldPath1", 0, Condition.createCondition(OperatorName.EQ, [1]));
		assert.equal(iCount, 1, "PropertyChange event fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
		assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
		iCount = 0;	oPropertyChange = {};
		oConditionModel.insertCondition("fieldPath1", 0, Condition.createItemCondition(2, "text"));
		assert.equal(iCount, 1, "PropertyChange event fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
		assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
		iCount = 0;	oPropertyChange = {};
		oConditionModel.insertCondition("fieldPath1", 0, Condition.createCondition(OperatorName.EQ, []));
		assert.equal(iCount, 1, "PropertyChange event fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
		assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
		assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
		iCount = 0;	oPropertyChange = {};

		const aConditions = oConditionModel.getConditions("fieldPath1");
		assert.equal(aConditions.length, 3, "number of conditions");
		assert.equal(aConditions[0].values.length, 1, "Condition.values.length");
		assert.equal(aConditions[0].values[0], undefined, "Condition.values[0]");
		assert.ok(aConditions[0].isEmpty, "Conditions.isEmpty");

		assert.equal(aConditions[1].values.length, 2, "Condition.values.length");
		assert.equal(aConditions[1].values[0], 2, "Condition.values[0]");
		assert.equal(aConditions[1].values[1], "text", "Condition.values[1]");
		assert.notOk(aConditions[1].isEmpty, "Conditions.isEmpty");

		assert.equal(aConditions[2].values.length, 1, "Condition.values.length");
		assert.equal(aConditions[2].values[0], 1, "Condition.values[0]");
		assert.notOk(aConditions[2].isEmpty, "Conditions.isEmpty");
	});

	QUnit.test("ConditionModel.indexOf/exist", function(assert) {
		const c1 = Condition.createCondition(OperatorName.EQ, ["foo"]);
		oConditionModel.addCondition("fieldPath1", c1);
		const c2 = Condition.createCondition(OperatorName.EQ, ["foo2"]);
		oConditionModel.addCondition("fieldPath1", c2);
		const c3 = Condition.createCondition(OperatorName.BT, [1, 100]);
		oConditionModel.addCondition("fieldPath2", c3);
		const c4 = Condition.createCondition(OperatorName.BT, [2, 99]);
		oConditionModel.addCondition("fieldPath2", c4);
		const c5 = Condition.createCondition(OperatorName.GT, [new Date()]);
		oConditionModel.addCondition("fieldPath3", c5);
		const c6 = Condition.createCondition(OperatorName.GT, [new Date(2018, 7, 24)]);
		oConditionModel.addCondition("fieldPath3", c6);

		assert.equal(oConditionModel.indexOf("fieldPath1", c1), 0, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath1", c2), 1, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath2", c3), 0, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath2", c4), 1, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath3", c5), 0, "condition found");
		assert.equal(oConditionModel.indexOf("fieldPath3", c6), 1, "condition found");
		assert.ok(oConditionModel.exist(c2, "fieldPath1"), "condition should exist");

		oConditionModel.removeCondition("fieldPath2", 0);
		assert.equal(oConditionModel.indexOf("fieldPath2", c3), -1, "condition should not exist");
		assert.notOk(oConditionModel.exist(c3, "fieldPath2"), "condition should not exist");

		// normalization
		let iNormalized = 0;
		const fnNormalize = function (oCondition) {
			iNormalized++;
			return Object.assign({}, oCondition, {values: oCondition.values.map(function (sValue) {
				return sValue.replace(/^0*(?=\d)/, "");
			})});
		};
		const oLeadingZerosCondition = Condition.createCondition(OperatorName.EQ, ["0000000763"]);
		const oCondition = Condition.createCondition(OperatorName.EQ, ["763"]);
		oConditionModel.addCondition("fieldPath4", oCondition);
		assert.ok(oConditionModel.indexOf("fieldPath4", oLeadingZerosCondition) === -1, "Existing condition not considered without normalization.");
		assert.ok(oConditionModel.indexOf("fieldPath4", oLeadingZerosCondition, fnNormalize) >= 0, "Existing condition considered.");
		assert.ok(iNormalized, "normalization method was called.");
	});

	QUnit.test("getAllConditions", function(assert) {
		const c1 = Condition.createCondition(OperatorName.EQ, ["foo"]);
		oConditionModel.addCondition("fieldPath1", c1);
		const c2 = Condition.createCondition(OperatorName.EQ, ["foo2"]);
		oConditionModel.addCondition("fieldPath1", c2);
		const c3 = Condition.createCondition(OperatorName.BT, [1, 100]);
		oConditionModel.addCondition("field/Path2", c3);
		const c4 = Condition.createCondition(OperatorName.BT, [2, 99]);
		oConditionModel.addCondition("field/Path2", c4);
		const c5 = Condition.createCondition(OperatorName.GT, [new Date()]);
		oConditionModel.addCondition("fieldPath3", c5);

		let oConditions = oConditionModel.getAllConditions();
		let iNumber = 0;
		for (const sFieldPath in oConditions) {// eslint-disable-line
			iNumber++;
		}
		assert.equal(iNumber, 3, "FieldPaths returned");
		assert.equal(oConditions.fieldPath1.length, 2, "fieldPath1 conditions");
		assert.equal(oConditions["field/Path2"].length, 2, "field/Path2 conditions");
		assert.equal(oConditions.fieldPath3.length, 1, "fieldPath3 conditions");

		oConditions = oConditionModel.getAllConditions("field/Path2");
		iNumber = 0;
		for (let sFieldPath in oConditions) {// eslint-disable-line
			iNumber++;
		}
		assert.equal(iNumber, 1, "FieldPaths returned");
		assert.equal(oConditions["field/Path2"].length, 2, "field/Path2 conditions");

		oConditions = oConditionModel.getAllConditions(["fieldPath1", "field/Path2"]);
		iNumber = 0;
		for (let sFieldPath in oConditions) {// eslint-disable-line
			iNumber++;
		}
		assert.equal(iNumber, 2, "FieldPaths returned");
		assert.equal(oConditions.fieldPath1.length, 2, "fieldPath1 conditions");
		assert.equal(oConditions["field/Path2"].length, 2, "field/Path2 conditions");

		oConditions = oConditionModel.getAllConditions("X");
		iNumber = 0;
		for (let sFieldPath in oConditions) { // eslint-disable-line
			iNumber++;
		}
		assert.equal(iNumber, 0, "FieldPaths returned");

	});

	QUnit.test("ConditionModel.clone", function(assert) {

		oConditionModel.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oConditionModel.addCondition("fieldPath2", Condition.createCondition(OperatorName.BT, [1, 100]));
		oConditionModel.addCondition("fieldPath3", Condition.createCondition(OperatorName.GT, [new Date()]));

		let oClone = oConditionModel.clone("fieldPath1");
		assert.equal(oClone.getConditions("fieldPath1").length, 1, "only one condition expected for FieldPath1");
		assert.equal(oClone.getConditions("fieldPath2").length, 0, "no condition expected for FieldPath2");
		assert.equal(oClone.getConditions("fieldPath3").length, 0, "no condition expected for FieldPath3");

		oClone = oConditionModel.clone();
		assert.equal(oClone.getConditions("fieldPath1").length, 1, "only one condition expected for FieldPath1");
		assert.equal(oClone.getConditions("fieldPath2").length, 1, "only one condition expected for FieldPath2");
		assert.equal(oClone.getConditions("fieldPath3").length, 1, "only one condition expected for FieldPath3");

		oClone.destroy();

	});

	QUnit.test("ConditionModel.merge", function(assert) {

		oConditionModel.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oConditionModel.addCondition("fieldPath2", Condition.createCondition(OperatorName.BT, [1, 100]));
		oConditionModel.addCondition("fieldPath3", Condition.createCondition(OperatorName.GT, [new Date()]));

		const oConditionModel2 = new ConditionModel();
		oConditionModel2.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["new"]));
		oConditionModel2.addCondition("fieldPath1", Condition.createCondition(OperatorName.BT, ["new2", "news2"]));
		oConditionModel2.addCondition("fieldPath2", Condition.createCondition(OperatorName.EQ, ["new3"]));

		// Remove existing newFieldPath conditions and merge the condition with name fieldPath1
		oConditionModel.merge("fieldPath1", oConditionModel2, "fieldPath1");
		assert.equal(oConditionModel.getConditions("fieldPath1").length, 2, "2 conditions expected for fieldPath1");
		assert.equal(oConditionModel.getConditions("fieldPath2").length, 1, "1 condition expected for fieldPath2");
		assert.equal(oConditionModel.getConditions("fieldPath2")[0].operator, OperatorName.BT, "operator for condition for fieldPath2");
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "1 condition expected for fieldPath3");

		// Remove existing FieldPath1 conditions and merge the new from oConditionModel2
		oConditionModel.merge("fieldPath1", oConditionModel2);
		assert.equal(oConditionModel.getConditions("fieldPath1").length, 2, "2 conditions expected for fieldPath1");
		assert.equal(oConditionModel.getConditions("fieldPath2").length, 2, "2 condition2 expected for fieldPath2");
		assert.equal(oConditionModel.getConditions("fieldPath3").length, 1, "1 condition expected for fieldPath3");

		oConditionModel2.destroy();

	});

	QUnit.test("Condition.removeEmptyConditions", function(assert) {

		oConditionModel.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oConditionModel.addCondition("fieldPath1", Condition.createCondition(OperatorName.BT, []));
		oConditionModel.addCondition("fieldPath1", Condition.createCondition(OperatorName.GT, []));

		const aConditions = Condition._removeEmptyConditions(oConditionModel.getConditions("fieldPath1"));
		assert.equal(aConditions.length, 1, "1 condition expected");

	});

	QUnit.test("ConditionModel.serialize/parse", function(assert) {

		const oCM = new ConditionModel();

		oCM.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oCM.addCondition("fieldPath2", Condition.createCondition(OperatorName.BT, [1, 100]));
		oCM.addCondition("fieldPath3", Condition.createCondition(OperatorName.GT, [new Date(Date.UTC(2017, 3, 25, 10, 30, 0, 0))]));

		const s = oCM.serialize();
		assert.strictEqual(s, '{\"conditions\":{\"fieldPath1\":[{\"operator\":\"EQ\",\"values\":[\"foo\"]}],\"fieldPath2\":[{\"operator\":\"BT\",\"values\":[1,100]}],\"fieldPath3\":[{\"operator\":\"GT\",\"values\":[\"2017-04-25T10:30:00.000Z\"]}]}}', "serialize returns the expected value");

		oCM.parse('{"conditions":{"fieldPath1":[{"operator":"EQ","values":["foo"]}],"fieldPath2":[{"operator":"BT","values":[1,100]}],"fieldPath3":[{"operator":"GT","values":["2017-04-25T10:30:00.000Z"]}]}}');
		assert.strictEqual(oCM.getConditions("fieldPath1").length, 1, "after parse 1 condition should exist for fieldPath1");
		assert.strictEqual(oCM.getConditions("fieldPath2").length, 1, "after parse 1 condition should exist for fieldPath2");
		assert.strictEqual(oCM.getConditions("fieldPath3").length, 1, "after parse 1 condition should exist for fieldPath3");
		assert.strictEqual(oCM.getConditions("fieldPath1")[0].values[0], "foo", "value of condition for fieldPath1 is foo");
		assert.strictEqual(oCM.getConditions("fieldPath2")[0].values[0], 1, "first value of condition for fieldPath1 is 1");

		oCM.destroy();
	});

	let oConditionChangeBinding;
	let oConditionChangeBinding1;
	let oConditionChangeBinding2;
	let oConditionChangeBinding3;
	let oConditionChangeBinding4;
	let oConditionChange = {};
	function handleChange(oEvent) {
		if (!oConditionChange[oEvent.oSource._sOriginapPath]) {
			oConditionChange[oEvent.oSource._sOriginapPath] = {reason: "", count: 0};
		}
		oConditionChange[oEvent.oSource._sOriginapPath].reason = oEvent.getParameter("reason");
		oConditionChange[oEvent.oSource._sOriginapPath].count++;
	}

	QUnit.module("ConditionPropertyBinding", {
		beforeEach: function() {
			oConditionModel = new ConditionModel();
			oConditionModel.addCondition("fieldPath1", Condition.createItemCondition("key", "description"));
			oConditionModel.addCondition("field/Path2", Condition.createItemCondition("key1", "description1"));
			oConditionChangeBinding = oConditionModel.bindProperty("/conditions", oConditionModel.getContext("/conditions"));
			oConditionChangeBinding.attachChange(handleChange);
			oConditionChangeBinding1 = oConditionModel.bindProperty("/conditions/fieldPath1", oConditionModel.getContext("/conditions/fieldPath1"));
			oConditionChangeBinding1.attachChange(handleChange);
			oConditionChangeBinding1._sID = "B1"; // for debugging
			oConditionChangeBinding2 = oConditionModel.bindProperty("/conditions/fieldPath1", oConditionModel.getContext("/conditions/fieldPath1"));
			oConditionChangeBinding2.attachChange(handleChange);
			oConditionChangeBinding2._sID = "B2"; // for debugging
			oConditionChangeBinding3 = oConditionModel.bindProperty("/conditions/field/Path2", oConditionModel.getContext("/conditions/field/Path2"));
			oConditionChangeBinding3.attachChange(handleChange);
			oConditionChangeBinding3._sID = "B3"; // for debugging
			oConditionChangeBinding4 = oConditionModel.bindProperty("/conditions/field/Path2", oConditionModel.getContext("/conditions/field/Path2"));
			oConditionChangeBinding4.attachChange(handleChange);
			oConditionChangeBinding4._sID = "B4"; // for debugging
			oConditionModel.attachPropertyChange(handlePropertyChange);
		},

		afterEach: function() {
			iCount = 0;
			oPropertyChange = {};
			oConditionChange = {};
			if (oConditionModel) {
				oConditionModel.destroy();
				oConditionModel = undefined;
			}
		}
	});

	QUnit.test("ConditionModel Change event for new condition", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};
			let aConditions = oConditionChangeBinding1.getExternalValue();
			aConditions.push(Condition.createItemCondition("X", "Y"));
			oConditionChangeBinding1.setExternalValue(aConditions);
			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, ChangeReason.Change, "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 1, "Change event for fieldPath1 fired once");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.notOk(oConditionChange["/conditions/field_Path2"], "Change event for fieldPath2 not fired");
				assert.equal(iCount, 1, "PropertyChange event fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");

				iCount = 0;	oPropertyChange = {};
				oConditionChange = {};
				aConditions = oConditionChangeBinding3.getExternalValue();
				aConditions.push(Condition.createItemCondition("X", "Y"));
				oConditionChangeBinding3.setExternalValue(aConditions);
				setTimeout(function () {
					assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
					assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, ChangeReason.Change, "Change event for all conditions reason");
					assert.notOk(oConditionChange["/conditions/fieldPath1"], "Change event for fieldPath1 not fired");
					assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 1, "Change event for fieldPath2 fired once");
					assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, ChangeReason.Change, "Change event for field/Path2 reason");
					assert.equal(iCount, 1, "PropertyChange event fired once");
					assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
					assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
					assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for fieldPath2 value");
						fnDone();
				}, 0);
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event for changed condition", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};
			let aConditions = oConditionChangeBinding1.getExternalValue();
			aConditions[0].values[0] = "A";
			oConditionChangeBinding1.setExternalValue(aConditions);

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, ChangeReason.Change, "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 1, "Change event for fieldPath1 fired once");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.notOk(oConditionChange["/conditions/field/Path2"], "Change event for field/Path2 not fired");
				assert.equal(iCount, 1, "PropertyChange event fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");

				iCount = 0;	oPropertyChange = {};
				oConditionChange = {};
				aConditions = oConditionChangeBinding3.getExternalValue();
				aConditions[0].values[0] = "B";
				oConditionChangeBinding3.setExternalValue(aConditions);

				setTimeout(function () {
					assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
					assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, ChangeReason.Change, "Change event for all conditions reason");
					assert.notOk(oConditionChange["/conditions/fieldPath1"], "Change event for fieldPath1 not fired");
					assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 1, "Change event for field/Path2 fired once");
					assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, ChangeReason.Change, "Change event for field/Path2 reason");
					assert.equal(iCount, 1, "PropertyChange event fired once");
					assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
					assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
					assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for fieldPath2 value");

					fnDone();
				}, 0);
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.setConditions (add conditions)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};
			oConditionModel.oData.conditions = {}; // just initialize

			oConditionModel.setConditions({
				"fieldPath1": [Condition.createCondition(OperatorName.BT, ["A", "C"])],
				"field/Path2": [Condition.createCondition(OperatorName.GT, ["X"])]
			});
			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, ChangeReason.Change, "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, ChangeReason.Change, "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
				assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for fieldPath2 value");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for fieldPath1");
				assert.equal(aConditions[0].operator, OperatorName.BT, "Conditition operator fieldPath1");
				assert.deepEqual(aConditions[0].values, ["A", "C"], "Conditition values fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, OperatorName.GT, "Conditition operator field/Path2");
				assert.deepEqual(aConditions[0].values, ["X"], "Conditition values field/Path2");

				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.setConditions (change conditions)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.setConditions({
				"fieldPath1": [Condition.createCondition(OperatorName.BT, ["A", "C"])],
				"field/Path2": [Condition.createCondition(OperatorName.GT, ["X"])]
			});
			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, ChangeReason.Change, "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, ChangeReason.Change, "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
				assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for fieldPath2 value");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for fieldPath1");
				assert.equal(aConditions[0].operator, OperatorName.BT, "Conditition operator fieldPath1");
				assert.deepEqual(aConditions[0].values, ["A", "C"], "Conditition values fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, OperatorName.GT, "Conditition operator field/Path2");
				assert.deepEqual(aConditions[0].values, ["X"], "Conditition values field/Path2");

				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.setConditions (set same conditions)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.setConditions({
				"fieldPath1": [Condition.createItemCondition("key", "description")],
				"field/Path2": [Condition.createItemCondition("key1", "description1")]
			});
			setTimeout(function () {
				assert.notOk(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, "Change event for all conditions not fired");
				assert.notOk(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, "Change event for fieldPath1 not fired");
				assert.notOk(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, "Change event for field/Path2 not fired");
				assert.equal(iCount, 0, "PropertyChange event not fired");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for fieldPath1");
				assert.equal(aConditions[0].operator, OperatorName.EQ, "Conditition operator fieldPath1");
				assert.deepEqual(aConditions[0].values, ["key", "description"], "Conditition values fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, OperatorName.EQ, "Conditition operator field/Path2");
				assert.deepEqual(aConditions[0].values, ["key1", "description1"], "Conditition values field/Path2");

				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.setConditions (change one condition, set same on other path)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.setConditions({
				"fieldPath1": [Condition.createCondition(OperatorName.BT, ["A", "C"])],
				"field/Path2": [Condition.createItemCondition("key1", "description1")]
			});
			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, ChangeReason.Change, "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.notOk(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, "Change event for field/Path2 not fired");
				assert.equal(iCount, 1, "PropertyChange event fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.notOk(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, "PropertyChange event for field/Path2 not fired");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for fieldPath1");
				assert.equal(aConditions[0].operator, OperatorName.BT, "Conditition operator fieldPath1");
				assert.deepEqual(aConditions[0].values, ["A", "C"], "Conditition values fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, OperatorName.EQ, "Conditition operator field/Path2");
				assert.deepEqual(aConditions[0].values, ["key1", "description1"], "Conditition values field/Path2");

				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.setConditions (remove conditions)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.setConditions({
				"fieldPath1": []
			});
			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].reason, ChangeReason.Change, "Change event for all conditions reason");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, ChangeReason.Change, "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
				assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for fieldPath2 value");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for field/Path2");

				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.insertCondition (2 paths)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.insertCondition("fieldPath1", 0, Condition.createCondition(OperatorName.BT, ["A", "C"]));
			oConditionModel.insertCondition("field/Path2", 0, Condition.createCondition(OperatorName.GT, ["X"]));

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, ChangeReason.Change, "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
				assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for fieldPath2 value");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 2, "Condititions length for fieldPath1");
				assert.deepEqual(aConditions[0].values, ["A", "C"], "Conditition values fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 2, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, OperatorName.GT, "Conditition operator field/Path2");
				assert.deepEqual(aConditions[0].values, ["X"], "Conditition values field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.insertCondition (only 1 path)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.insertCondition("fieldPath1", 0, Condition.createCondition(OperatorName.BT, ["A", "C"]));

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.notOk(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, "Change event for field/Path2 not fired");
				assert.equal(iCount, 1, "PropertyChange event fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.notOk(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, "PropertyChange event for field/Path2 not fired");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 2, "Condititions length for fieldPath1");
				assert.deepEqual(aConditions[0].values, ["A", "C"], "Conditition values fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, OperatorName.EQ, "Conditition operator field/Path2");
				assert.deepEqual(aConditions[0].values, ["key1", "description1"], "Conditition values field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.removeCondition (2 paths)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.removeCondition("fieldPath1", Condition.createItemCondition("key", "description"));
			oConditionModel.removeCondition("field/Path2", Condition.createItemCondition("key1", "description1"));

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, ChangeReason.Change, "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
				assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for fieldPath2 value");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.removeCondition (only 1 path)", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.removeCondition("fieldPath1", Condition.createItemCondition("key", "description"));

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.notOk(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, "Change event for field/Path2 not fired");
				assert.equal(iCount, 1, "PropertyChange event fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.notOk(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, "PropertyChange event for field/Path2 not fired");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 1, "Condititions length for field/Path2");
				assert.equal(aConditions[0].operator, OperatorName.EQ, "Conditition operator field/Path2");
				assert.deepEqual(aConditions[0].values, ["key1", "description1"], "Conditition values field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

	QUnit.test("ConditionModel Change event ConditionModel.removeAllConditions", function(assert) {
		const fnDone = assert.async();
		setTimeout(function () {
			oConditionChange = {};

			oConditionModel.removeAllConditions("fieldPath1");
			oConditionModel.removeAllConditions();

			setTimeout(function () {
				assert.equal(oConditionChange["/conditions"] && oConditionChange["/conditions"].count, 1, "Change event for all conditions fired");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].count, 2, "Change event for fieldPath1 fired twice");
				assert.equal(oConditionChange["/conditions/fieldPath1"] && oConditionChange["/conditions/fieldPath1"].reason, ChangeReason.Change, "Change event for fieldPath1 reason");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].count, 2, "Change event for field/Path2 fired twice");
				assert.equal(oConditionChange["/conditions/field/Path2"] && oConditionChange["/conditions/field/Path2"].reason, ChangeReason.Change, "Change event for field/Path2 reason");
				assert.equal(iCount, 2, "PropertyChange event fired twice");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].count, 1, "PropertyChange event for fieldPath1 fired once");
				assert.equal(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].reason, ChangeReason.Binding, "PropertyChange event for fieldPath1 reason");
				assert.deepEqual(oPropertyChange["/conditions/fieldPath1"] && oPropertyChange["/conditions/fieldPath1"].value, oConditionModel.getConditions("fieldPath1"), "PropertyChange event for fieldPath1 value");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].count, 1, "PropertyChange event for field/Path2 fired once");
				assert.equal(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].reason, ChangeReason.Binding, "PropertyChange event for field/Path2 reason");
				assert.deepEqual(oPropertyChange["/conditions/field/Path2"] && oPropertyChange["/conditions/field/Path2"].value, oConditionModel.getConditions("field/Path2"), "PropertyChange event for fieldPath2 value");

				let aConditions = oConditionChangeBinding1.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for fieldPath1");

				aConditions = oConditionChangeBinding3.getExternalValue();
				assert.equal(aConditions.length, 0, "Condititions length for field/Path2");
				fnDone();
			}, 0);
		}, 0);
	});

});
