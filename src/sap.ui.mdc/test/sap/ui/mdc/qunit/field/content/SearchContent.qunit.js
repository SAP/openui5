/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"./ContentBasicTest",
	"sap/ui/mdc/field/content/SearchContent",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/m/SearchField",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], (
	QUnit,
	ContentBasicTest,
	SearchContent,
	ConditionsType,
	BaseType,
	FieldEditMode,
	SearchField,
	ParseException,
	ValidateException
) => {
	"use strict";

	ContentBasicTest.controlMap.DisplayMultiValue = {
		getPathsFunction: "getDisplayMultiValue",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createDisplayMultiValue",
		noFormatting: false,
		editMode: FieldEditMode.Display,
		throwsError: true
	};

	ContentBasicTest.controlMap.DisplayMultiLine = {
		getPathsFunction: "getDisplayMultiLine",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createDisplayMultiLine",
		noFormatting: false,
		editMode: FieldEditMode.Display,
		throwsError: true
	};

	ContentBasicTest.controlMap.Edit = {
		getPathsFunction: "getEdit",
		paths: ["sap/m/SearchField"],
		modules: [SearchField],
		instances: [SearchField],
		createFunction: "createEdit",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		bindings: [
			{
				value: {path: "$field>/conditions", type: ConditionsType},
				placeholder: {path: "$field>/placeholder"},
				tooltip: {path: "$field>/tooltip"}
			}
		],
		properties: [
			{
				width: "100%"
			}
		],
		events: [
			{
				change: {value: "X"},
				liveChange: {newValue: "X"}
			}
		],
		detailTests: _checkSearchField
	};

	ContentBasicTest.controlMap.EditMultiValue = {
		getPathsFunction: "getEditMultiValue",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createEditMultiValue",
		noFormatting: true,
		editMode: FieldEditMode.Editable,
		throwsError: true
	};

	ContentBasicTest.controlMap.EditMultiLine = {
		getPathsFunction: "getEditMultiLine",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createEditMultiLine",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		throwsError: true
	};

	ContentBasicTest.controlMap.EditForHelp = {
		getPathsFunction: "getEditForHelp",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createEditForHelp",
		noFormatting: false,
		editMode: FieldEditMode.Editable,
		throwsError: true
	};

	ContentBasicTest.test(QUnit, SearchContent, "SearchContent", "sap.ui.model.type.String", {}, undefined, BaseType.String, undefined, false);

	function _checkSearchField(assert, aControls, oValue) {
		const oSearchField = aControls[0];
		const oBinding = oSearchField.getBinding("value");

		sinon.spy(oSearchField, "fireValidationSuccess");
		sinon.spy(oSearchField, "fireParseError");
		sinon.spy(oSearchField, "fireValidationError");
		sinon.stub(oBinding, "setExternalValue");

		// for testing just fire event of SearchField. Do not test if SearchField behaves right on user-intercation, just test the API usage.
		oSearchField.fireChange({value: "OK"});
		assert.ok(oBinding.setExternalValue.calledOnce, "Binding.setExternalValue called");
		assert.ok(oBinding.setExternalValue.calledWith("OK"), "Binding.setExternalValue value");
		assert.ok(oSearchField.fireValidationSuccess.calledOnce, "SearchField.fireValidationSuccess called");
		assert.equal(oSearchField.fireValidationSuccess.args[0][0].element, oSearchField, "SearchField.fireValidationSuccess Property 'element'");
		assert.equal(oSearchField.fireValidationSuccess.args[0][0].property, "value", "SearchField.fireValidationSuccess Property 'property'");
		assert.ok(oSearchField.fireValidationSuccess.args[0][0].type instanceof ConditionsType, "SearchField.fireValidationSuccess Property 'type'");
		assert.equal(oSearchField.fireValidationSuccess.args[0][0].newValue, "OK", "SearchField.fireValidationSuccess Property 'newValue'");
		assert.equal(oSearchField.fireValidationSuccess.args[0][0].oldValue, "", "SearchField.fireValidationSuccess Property 'oldValue'");
		oBinding.setExternalValue.reset();
		oSearchField.fireValidationSuccess.reset();
		oSearchField.fireParseError.reset();
		oSearchField.fireValidationError.reset();

		oBinding.setExternalValue.withArgs("A").throws(new ParseException("My ParseException"));
		oSearchField.fireChange({value: "A"});
		assert.ok(oBinding.setExternalValue.calledOnce, "Binding.setExternalValue called");
		assert.ok(oBinding.setExternalValue.calledWith("A"), "Binding.setExternalValue value");
		assert.notOk(oSearchField.fireValidationSuccess.called, "SearchField.fireValidationSuccess not called");
		assert.ok(oSearchField.fireParseError.calledOnce, "SearchField.fireParseError called");
		assert.equal(oSearchField.fireParseError.args[0][0].element, oSearchField, "SearchField.fireParseError Property 'element'");
		assert.equal(oSearchField.fireParseError.args[0][0].property, "value", "SearchField.fireParseError Property 'property'");
		assert.ok(oSearchField.fireParseError.args[0][0].type instanceof ConditionsType, "SearchField.fireParseError Property 'type'");
		assert.equal(oSearchField.fireParseError.args[0][0].newValue, "A", "SearchField.fireParseError Property 'newValue'");
		assert.equal(oSearchField.fireParseError.args[0][0].oldValue, "", "SearchField.fireParseError Property 'oldValue'");
		assert.ok(oSearchField.fireParseError.args[0][0].exception instanceof ParseException, "SearchField.fireParseError Property 'exception'");
		assert.equal(oSearchField.fireParseError.args[0][0].message, "My ParseException", "SearchField.fireParseError Property 'message'");
		oBinding.setExternalValue.reset();
		oSearchField.fireValidationSuccess.reset();
		oSearchField.fireParseError.reset();
		oSearchField.fireValidationError.reset();

		oBinding.setExternalValue.withArgs("B").throws(new ValidateException("My ValidateException"));
		oSearchField.fireChange({value: "B"});
		assert.ok(oBinding.setExternalValue.calledOnce, "Binding.setExternalValue called");
		assert.ok(oBinding.setExternalValue.calledWith("B"), "Binding.setExternalValue value");
		assert.notOk(oSearchField.fireValidationSuccess.called, "SearchField.fireValidationSuccess not called");
		assert.ok(oSearchField.fireValidationError.calledOnce, "SearchField.fireValidationError called");
		assert.equal(oSearchField.fireValidationError.args[0][0].element, oSearchField, "SearchField.fireValidationError Property 'element'");
		assert.equal(oSearchField.fireValidationError.args[0][0].property, "value", "SearchField.fireValidationError Property 'property'");
		assert.ok(oSearchField.fireValidationError.args[0][0].type instanceof ConditionsType, "SearchField.fireValidationError Property 'type'");
		assert.equal(oSearchField.fireValidationError.args[0][0].newValue, "B", "SearchField.fireValidationError Property 'newValue'");
		assert.equal(oSearchField.fireValidationError.args[0][0].oldValue, "", "SearchField.fireValidationError Property 'oldValue'");
		assert.ok(oSearchField.fireValidationError.args[0][0].exception instanceof ValidateException, "SearchField.fireValidationError Property 'exception'");
		assert.equal(oSearchField.fireValidationError.args[0][0].message, "My ValidateException", "SearchField.fireValidationError Property 'message'");
		oBinding.setExternalValue.reset();
		oSearchField.fireValidationSuccess.reset();
		oSearchField.fireParseError.reset();
		oSearchField.fireValidationError.reset();

		oBinding.setExternalValue.withArgs("C").throws(new Error("My Error"));
		try {
			oSearchField.fireChange({value: "C"});
		} catch (oError) {
			assert.ok(true, "error expected");
			assert.equal(oError.message, "My Error", "Error message");
		}
		oBinding.setExternalValue.restore();
		oSearchField.fireValidationSuccess.restore();
		oSearchField.fireParseError.restore();
		oSearchField.fireValidationError.restore();

		oSearchField.fireSearch({clearButtonPressed: true});
		assert.equal(this.oEventCount.enter, 0, "Enter event not fired");
		oSearchField.fireSearch({escPressed: true});
		assert.equal(this.oEventCount.enter, 0, "Enter event not fired");
		oSearchField.fireSearch({searchButtonPressed: true});
		assert.equal(this.oEventCount.enter, 1, "Enter event fired once");
	}

	QUnit.start();
});