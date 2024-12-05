sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"./ContentBasicTest",
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/mdc/field/content/DateContent",
	"sap/ui/mdc/field/content/LinkContent",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/library",
	"sap/m/Link"
], (
	QUnit,
	ContentBasicTest,
	DefaultContent,
	DateContent,
	LinkContent,
	ConditionsType,
	BaseType,
	FieldEditMode,
	OperatorName,
	mLibrary,
	Link
) => {
	"use strict";

	const EmptyIndicatorMode = mLibrary.EmptyIndicatorMode;
	const LinkDefaultContent = LinkContent.extendBaseContent(DefaultContent); // Use extended DefaultContent
	const LinkDateContent = LinkContent.extendBaseContent(DateContent); // Use extended DateContent

	ContentBasicTest.controlMap.Display = {
		getPathsFunction: "getDisplay",
		paths: ["sap/m/Link"],
		modules: [Link],
		instances: [Link],
		createFunction: "createDisplay",
		noFormatting: false,
		editMode: FieldEditMode.Display,
		bindings: [
			{
				text: {path: "$field>/conditions", type: ConditionsType},
				textAlign: {path: "$field>/textAlign"},
				textDirection: {path: "$field>/textDirection"},
				wrapping: {path: "$field>/multipleLines"},
				tooltip: {path: "$field>/tooltip"}
		}
		],
		properties: [
			{
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			}
		],
		events: [
			{
				press: {ctrlKey: false, metaKey: false}
			}
		],
		detailTests: _checkLink
	};

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
		paths: ["sap/m/Link"],
		modules: [Link],
		instances: [Link],
		createFunction: "createDisplayMultiLine",
		noFormatting: false,
		editMode: FieldEditMode.Display,
		bindings: [
			{
				text: {path: "$field>/conditions", type: ConditionsType},
				textAlign: {path: "$field>/textAlign"},
				textDirection: {path: "$field>/textDirection"},
				wrapping: {path: "$field>/multipleLines"},
				tooltip: {path: "$field>/tooltip"}
		}
		],
		properties: [
			{
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			}
		],
		events: [
			{
				press: {ctrlKey: false, metaKey: false}
			}
		],
		detailTests: _checkLink
	};

	const fnEnhanceField = (oFakeField) => {
		oFakeField.getFieldInfo = () => {
			return {
				getDirectLinkHrefAndTarget: () => {return Promise.resolve({href: "X", target: "Y"});}
			};
		};
	};

	ContentBasicTest.test(QUnit, LinkDefaultContent, "LinkContent", "sap.ui.model.type.String", {}, fnEnhanceField, BaseType.String, false, true);

	function _checkLink(assert, aControls, oValue) {
		return new Promise((resolve) => {
			setTimeout(() => {
				assert.equal(aControls[0].getHref(), "X", "Link: Href");
				assert.equal(aControls[0].getTarget(), "Y", "Link: Target");
				resolve();
			},0);
		});

	}

	// Test based on DateContent
	QUnit.module("based on DateContent", {
		beforeEach: () => {
		},
		afterEach: () => {
		}
	});

	QUnit.test("Getters", (assert) => {
		assert.deepEqual(LinkDateContent.getEditOperator(), DateContent.getEditOperator(), "Correct editOperator value returned.");
		assert.notOk(LinkDateContent.getUseDefaultValueHelp(), "DefaultValueHelp is not used.");
		assert.deepEqual(LinkDateContent.getControlNames("Display"), ["sap/m/Link"], "Correct default controls returned for ContentMode 'Display'");
		assert.deepEqual(LinkDateContent.getControlNames("DisplayMultiLine"), ["sap/m/Link"], "Correct default controls returned for ContentMode 'DisplayMultiLine'");
		assert.deepEqual(LinkDateContent.getControlNames("DisplayMultiValue"), [null], "Correct default controls returned for ContentMode 'DisplayMultiValue'");
		assert.deepEqual(LinkDateContent.getControlNames("Edit"), DateContent.getControlNames("Edit"), "Correct default controls returned for ContentMode 'Edit'");
		assert.deepEqual(LinkDateContent.getControlNames("EditMultiLine"), DateContent.getControlNames("EditMultiLine"), "Correct default controls returned for ContentMode 'EditMultiLine'");
		assert.deepEqual(LinkDateContent.getControlNames("EditMultiValue"), DateContent.getControlNames("EditMultiValue"), "Correct default controls returned for ContentMode 'EditMultiValue'");
		assert.deepEqual(LinkDateContent.getControlNames("EditForHelp"), DateContent.getControlNames("EditForHelp"), "Correct default controls returned for ContentMode 'EditForHelp'");
		assert.deepEqual(LinkDateContent.getControlNames("EditOperator", OperatorName.EQ), DateContent.getControlNames("EditOperator", OperatorName.EQ), "Correct default controls returned for ContentMode 'EditOperator'");
	});

	QUnit.start();
});