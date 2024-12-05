sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"./ContentBasicTest",
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/mdc/enums/BaseType"
], (QUnit, ContentBasicTest, DefaultContent, BaseType) => {
	"use strict";

	const oDefaultValueHelp = {name: "defineConditions", oneOperatorSingle: false, oneOperatorMulti: false, single: true, multi: true};
	ContentBasicTest.test(QUnit, DefaultContent, "DefaultContent", "sap.ui.model.type.String", {}, undefined, BaseType.String, oDefaultValueHelp, true);

	QUnit.start();
});