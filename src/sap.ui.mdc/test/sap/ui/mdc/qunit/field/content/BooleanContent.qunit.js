sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"./ContentBasicTest",
	"sap/ui/mdc/field/content/BooleanContent",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/model/type/Boolean" // to be loaded
], (
	QUnit,
	ContentBasicTest,
	BooleanContent,
	BaseType,
	BooleanType
) => {
	"use strict";

	ContentBasicTest.controlMap.DisplayMultiLine = {
		getPathsFunction: "getDisplayMultiLine",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createDisplayMultiLine",
		noFormatting: false,
		throwsError: true
	};
	ContentBasicTest.controlMap.DisplayMultiValue = {
		getPathsFunction: "getDisplayMultiValue",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createDisplayMultiValue",
		noFormatting: false,
		throwsError: true
	};
	ContentBasicTest.controlMap.EditMultiLine = {
		getPathsFunction: "getEditMultiLine",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createEditMultiLine",
		noFormatting: false,
		throwsError: true
	};
	ContentBasicTest.controlMap.EditMultiValue = {
		getPathsFunction: "getEditMultiValue",
		paths: [null],
		modules: [],
		instances: [],
		createFunction: "createEditMultiValue",
		noFormatting: true,
		throwsError: true
	};

	const oDefaultValueHelp = {name: "bool", oneOperatorSingle: true, oneOperatorMulti: true, single: true, multi: true};
	ContentBasicTest.test(QUnit, BooleanContent, "BooleanContent", "sap.ui.model.type.Boolean", {}, undefined, BaseType.Boolean, oDefaultValueHelp, true);

	QUnit.start();
});