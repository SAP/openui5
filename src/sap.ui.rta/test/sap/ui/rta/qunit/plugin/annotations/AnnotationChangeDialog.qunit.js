/* global QUnit */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/rta/plugin/annotations/AnnotationChangeDialog",
	"sap/ui/rta/plugin/annotations/AnnotationTypes",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Element,
	FlexObjectFactory,
	PersistenceWriteAPI,
	AnnotationChangeDialog,
	AnnotationTypes,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const oTextArrangementTypes = {
		TextOnly: "TextOnly",
		TextFirst: "TextFirst",
		IDOnly: "IDOnly",
		IDFirst: "IDFirst"
	};

	const oTextArrangementLabels = {
		[oTextArrangementTypes.TextOnly]: "Text Only",
		[oTextArrangementTypes.TextFirst]: "Text First",
		[oTextArrangementTypes.IDOnly]: "ID Only",
		[oTextArrangementTypes.IDFirst]: "ID First"
	};

	async function openDialog(sandbox, oActionConfig, fnAfterOpen) {
		const oDialog = new AnnotationChangeDialog();
		const oCreateDialogStub = sandbox.stub(oDialog, "_createDialog");
		oCreateDialogStub.callsFake(async () => {
			const oPopover = await oCreateDialogStub.wrappedMethod.apply(oDialog);
			oPopover.attachAfterOpen(fnAfterOpen);
			return oPopover;
		});
		const aChanges = await oDialog.openDialogAndHandleChanges(oActionConfig);
		oDialog.destroy();
		return aChanges;
	}

	QUnit.module("Basic functionality", {
		beforeEach() {
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
		},
		afterEach() {
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the dialog is opened", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return {
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My Test Label",
								annotationPath: "path/to/test/label",
								currentValue: oTextArrangementTypes.TextOnly
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: oTextArrangementTypes.IDFirst
							}
						],
						possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
							key: sKey,
							text: oTextArrangementLabels[sKey]
						}))
					};
				}
			};
			const oActionConfig = {
				title: "Change Text Arrangement",
				description: "Select The Preferred Text Arrangement For Each Entry:",
				type: AnnotationTypes.ValueListType,
				control: { id: "testControl" },
				annotation: "testAnnotation",
				delegate: oTestDelegate
			};
			const oDelegateSpy = sandbox.spy(oTestDelegate, "getAnnotationsChangeInfo");
			const fnAfterOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();

				// Initial rendering checks
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_title").getText(),
					"Change Text Arrangement",
					"then the correct title is set"
				);
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_description").getText(),
					"Select The Preferred Text Arrangement For Each Entry:",
					"then the correct description is set"
				);
				assert.strictEqual(aFormElements.length, 2, "then for each property a form element is created");
				assert.strictEqual(
					aFormElements[0].getLabel(),
					"My Test Label",
					"then the property is correctly labeled"
				);
				const aVisibleFields = aFormElements[0].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(
					aVisibleFields.length,
					1,
					"then only one input field is visible based on the type"
				);
				const oSelect = aVisibleFields[0];
				assert.strictEqual(
					oSelect.getSelectedKey(),
					oTextArrangementTypes.TextOnly,
					"then the correct value is set"
				);
				assert.ok(
					oSelect.isA("sap.m.Select"),
					"then the input field for the value list type is a select"
				);

				// Switch selected item for a property
				const oListItem = oSelect.getItems()[1];
				oSelect.setSelectedItem(oListItem);
				oSelect.fireChange({ selectedItem: oListItem });
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				oSaveButton.firePress();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 1, "then one change was returned");
			assert.strictEqual(
				aChanges[0].content.annotationPath,
				"path/to/test/label",
				"then the correct annotationPath was returned"
			);
			assert.strictEqual(
				aChanges[0].content.value,
				oTextArrangementTypes.TextFirst,
				"then the correct value was returned"
			);
			assert.strictEqual(oDelegateSpy.callCount, 1, "then the delegate was called once");
			assert.strictEqual(
				oDelegateSpy.firstCall.args[0].id,
				"testControl",
				"then the control was passed to the delegate"
			);
			assert.strictEqual(
				oDelegateSpy.firstCall.args[1],
				"testAnnotation",
				"then the annotation was passed to the delegate"
			);
		});

		QUnit.test("When the dialog is closed via cancel or no changes are made", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return {
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My Test Label",
								annotationPath: "path/to/test/label",
								currentValue: oTextArrangementTypes.TextOnly
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: oTextArrangementTypes.IDFirst
							}
						],
						possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
							key: sKey,
							text: oTextArrangementLabels[sKey]
						}))
					};
				}
			};
			const oActionConfig = {
				type: AnnotationTypes.ValueListType,
				annotation: "testAnnotation",
				delegate: oTestDelegate
			};

			const fnAfterFirstOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				const [oSelect] = aFormElements[0].getFields().filter((oField) => oField.getVisible());
				const oListItem = oSelect.getItems()[1];
				oSelect.setSelectedItem(oListItem);
				oSelect.fireChange({ selectedItem: oListItem });
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			const fnAfterSecondOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				const [oSelect] = aFormElements[0].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(
					oSelect.getSelectedKey(),
					oTextArrangementTypes.TextOnly,
					"then the initial value is displayed on second open"
				);
				// Select item and switch back to initial value
				const oSecondListItem = oSelect.getItems()[1];
				oSelect.setSelectedItem(oSecondListItem);
				oSelect.fireChange({ selectedItem: oSecondListItem });
				const oFirstListItem = oSelect.getItems()[0];
				oSelect.setSelectedItem(oFirstListItem);
				oSelect.fireChange({ selectedItem: oFirstListItem });
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				oSaveButton.firePress();
			};
			this._isFirstOpen = true;
			const fnAfterOpen = () => {
				if (this._isFirstOpen) {
					fnAfterFirstOpen();
					delete this._isFirstOpen;
				} else {
					fnAfterSecondOpen();
				}
			};
			const oDialog = new AnnotationChangeDialog();
			const oCreateDialogStub = sandbox.stub(oDialog, "_createDialog");
			oCreateDialogStub.callsFake(async () => {
				const oPopover = await oCreateDialogStub.wrappedMethod.apply(oDialog);
				oPopover.attachAfterOpen(fnAfterOpen);
				return oPopover;
			});

			const aChangesAfterFirstOpen = await oDialog.openDialogAndHandleChanges(oActionConfig);
			assert.strictEqual(aChangesAfterFirstOpen.length, 0, "then no changes were returned");
			const aChangesAfterSecondOpen = await oDialog.openDialogAndHandleChanges(oActionConfig);
			assert.strictEqual(aChangesAfterSecondOpen.length, 0, "then no changes were returned");
			oDialog.destroy();
		});

		QUnit.test("When the dialog is opened with a preselected annotationPath", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return {
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My First Test Label",
								annotationPath: "path/to/test/label",
								currentValue: oTextArrangementTypes.TextOnly
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: oTextArrangementTypes.IDFirst
							}
						],
						possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
							key: sKey,
							text: oTextArrangementLabels[sKey]
						})),
						preSelectedProperty: "path/to/second/test/label"
					};
				}
			};
			const oActionConfig = {
				title: "Change Text Arrangement",
				type: AnnotationTypes.ValueListType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				assert.notOk(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_description").getVisible(),
					"then if no description is provided, none is displayed"
				);
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				assert.strictEqual(
					oList.getFormElements().length,
					1,
					"then the properties are filtered based on the predefined annotationPath"
				);

				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");
				oSearchField.setValue("");
				oSearchField.fireLiveChange({ newValue: "" });
				assert.strictEqual(
					oList.getFormElements().length,
					2,
					"then the filter can be removed by the user"
				);

				oSearchField.setValue("first");
				oSearchField.fireLiveChange({ newValue: "first" });
				assert.strictEqual(
					oList.getFormElements().length,
					1,
					"then a different filter value can be set by the user"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("When the dialog is opened with existing changeAnnotation changes", async function(assert) {
			const oAnnotationChange = FlexObjectFactory.createFromFileContent({
				changeType: "changeAnnotation",
				content: {
					annotationPath: "path/to/test/label"
				},
				fileType: "annotation_change"
			});
			sandbox.stub(PersistenceWriteAPI, "_getAnnotationChanges").returns([
				oAnnotationChange
			]);
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return {
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My Test Label",
								annotationPath: "path/to/test/label",
								currentValue: oTextArrangementTypes.TextOnly
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: oTextArrangementTypes.IDFirst
							}
						],
						possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
							key: sKey,
							text: oTextArrangementLabels[sKey]
						}))
					};
				}
			};
			const oActionConfig = {
				title: "Change Text Arrangement",
				description: "Select The Preferred Text Arrangement For Each Entry:",
				type: AnnotationTypes.ValueListType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const oToggleButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_toggleShowAllPropertiesButton");
				oToggleButton.firePress();
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				assert.strictEqual(
					aFormElements.length,
					1,
					"then only one form element is displayed"
				);
				assert.strictEqual(
					aFormElements[0].getBindingContext().getObject().annotationPath,
					oAnnotationChange.getContent().annotationPath,
					"then only the property for which a change exists is displayed"
				);
				oToggleButton.firePress();
				assert.strictEqual(
					oList.getFormElements().length,
					2,
					"then on second toggle press all properties are displayed again"
				);
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("When the action type is boolean", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return {
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My Test Label",
								annotationPath: "path/to/test/label",
								currentValue: true
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: false
							}
						]
					};
				}
			};
			const oActionConfig = {
				title: "Change Some Boolean Prop",
				type: AnnotationTypes.BooleanType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				const aVisibleFields = aFormElements[1].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(
					aVisibleFields.length,
					1,
					"then only one input field is visible based on the type"
				);
				const oCheckBox = aVisibleFields[0];
				assert.strictEqual(
					oCheckBox.getSelected(),
					false,
					"then the correct value is set"
				);
				assert.ok(
					oCheckBox.isA("sap.m.CheckBox"),
					"then the input field for the boolean type is a checkbox"
				);

				oCheckBox.setSelected(true);
				oCheckBox.fireSelect({ selected: true });
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				oSaveButton.firePress();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 1, "One change was returned");
			assert.strictEqual(
				aChanges[0].content.annotationPath,
				"path/to/second/test/label",
				"then the correct path was returned"
			);
			assert.strictEqual(
				aChanges[0].content.value,
				true,
				"then the correct value was returned"
			);
		});

		QUnit.test("When the action type is string", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return {
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My Test Label",
								annotationPath: "path/to/test/label",
								currentValue: "Hello"
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: "World"
							}
						]
					};
				}
			};
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				const aVisibleFields = aFormElements[0].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(
					aVisibleFields.length,
					1,
					"then only one input field is visible based on the type"
				);
				const oInput = aVisibleFields[0];
				assert.strictEqual(
					oInput.getValue(),
					"Hello",
					"then the correct value is set"
				);
				assert.ok(
					oInput.isA("sap.m.Input"),
					"then the input field for the string type is an input"
				);

				oInput.setValue("Bye");
				oInput.fireChange({ value: "Bye" });
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				oSaveButton.firePress();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 1, "One change was returned");
			assert.strictEqual(
				aChanges[0].content.annotationPath,
				"path/to/test/label",
				"then the correct path was returned"
			);
			assert.strictEqual(
				aChanges[0].content.value,
				"Bye",
				"then the correct value was returned"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});