/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/dt/ElementUtil",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/plugin/annotations/AnnotationChangeDialog",
	"sap/ui/rta/plugin/annotations/AnnotationTypes",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Control,
	Element,
	ElementUtil,
	FlexObjectFactory,
	PersistenceWriteAPI,
	JSONModel,
	AnnotationChangeDialog,
	AnnotationTypes,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const oTextArrangementTypes = {
		TextOnly: {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"},
		TextFirst: {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"},
		IDOnly: {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/IDOnly"},
		IDFirst: {EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/IDFirst"}
	};

	const oTextArrangementLabels = {
		TextOnly: "Text Only",
		TextFirst: "Text First",
		IDOnly: "ID Only",
		IDFirst: "ID First"
	};

	async function openDialog(sandbox, oActionConfig, fnAfterOpen, iNumberOfProperties, assert) {
		const oDialog = new AnnotationChangeDialog();
		const oCreateDialogStub = sandbox.stub(oDialog, "_createDialog");
		oCreateDialogStub.callsFake(async () => {
			const oPopover = await oCreateDialogStub.wrappedMethod.apply(oDialog);
			oPopover.attachAfterOpen(fnAfterOpen);
			return oPopover;
		});

		const aAnnotationChanges = await oDialog.openDialogAndHandleChanges(oActionConfig);

		if (iNumberOfProperties) {
			assert.strictEqual(oDialog.oChangeAnnotationModel.iSizeLimit, iNumberOfProperties, "the model size limit is set correctly");
		}

		oDialog.destroy();
		return aAnnotationChanges;
	}

	QUnit.module("Basic functionality", {
		beforeEach() {
			this.oTextControl = new Control("testControl");
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
		},
		afterEach() {
			this.oComponent.destroy();
			this.oTextControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the dialog is opened", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return Promise.resolve({
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My Test Label",
								annotationPath: "path/to/test/label",
								currentValue: oTextArrangementTypes.TextOnly,
								label: "My Special Test Label"
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: oTextArrangementTypes.IDFirst,
								tooltip: "My Other Test Tooltip"
							}
						],
						possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
							key: oTextArrangementTypes[sKey],
							text: oTextArrangementLabels[sKey]
						}))
					});
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
					Element.getElementById("sapUiRtaChangeAnnotationDialog").getTitle(),
					"Change Text Arrangement",
					"then the correct title is set"
				);
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_description").getText(),
					"Select The Preferred Text Arrangement For Each Entry:",
					"then the correct description is set"
				);
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled"
				);
				assert.strictEqual(aFormElements.length, 2, "then for each property a form element is created");
				assert.strictEqual(
					aFormElements[0].getLabel().getText(),
					"My Other Test Label",
					"then the properties are properly sorted"
				);
				assert.strictEqual(
					aFormElements[1].getLabel().getText(),
					"My Special Test Label",
					"then the properties are properly sorted"
				);
				assert.strictEqual(
					aFormElements[0].getLabel().getTooltip(),
					"My Other Test Tooltip",
					"then the tooltips are set"
				);
				assert.strictEqual(
					aFormElements[1].getLabel().getTooltip(),
					null,
					"then the tooltips are set"
				);
				const aVisibleFields = aFormElements[1].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(
					aVisibleFields.length,
					1,
					"then only one input field is visible based on the type"
				);
				const oSelect = aVisibleFields[0];
				assert.strictEqual(
					oSelect.getSelectedKey(),
					JSON.stringify(oTextArrangementTypes.TextOnly),
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
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					true,
					"then the save button is enabled"
				);
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				oSaveButton.firePress();
			};

			const oModelRefreshSpy = sandbox.spy(JSONModel.prototype, "refresh");
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.ok(oModelRefreshSpy.calledWith(true), "then the model is fully refreshed when the dialog is opened");
			assert.strictEqual(aChanges.length, 1, "then one change was returned");
			assert.strictEqual(
				aChanges[0].content.annotationPath,
				"path/to/test/label",
				"then the correct annotationPath was returned"
			);
			assert.deepEqual(
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

		QUnit.test("when the dialog is opened with more than 100 properties", function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return Promise.resolve({
						serviceUrl: "testServiceUrl",
						properties: new Array(111).fill({
							propertyName: "My Test Label",
							annotationPath: "path/to/test/label",
							currentValue: oTextArrangementTypes.TextOnly,
							label: "My Special Test Label"
						}),
						possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
							key: oTextArrangementTypes[sKey],
							text: oTextArrangementLabels[sKey]
						}))
					});
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
			const fnAfterOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				assert.strictEqual(aFormElements.length, 111, "then only 111 form elements are created");
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			return openDialog(sandbox, oActionConfig, fnAfterOpen, 111, assert);
		});

		QUnit.test("When the dialog is closed via cancel or no changes are made", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return {
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: oTextArrangementTypes.IDFirst
							},
							{
								propertyName: "My Test Label",
								annotationPath: "path/to/test/label",
								currentValue: oTextArrangementTypes.TextOnly
							}
						],
						possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
							key: oTextArrangementTypes[sKey],
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
				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");
				oSearchField.setValue("Other");
				oSearchField.fireLiveChange({ newValue: "Other" });
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
				assert.strictEqual(aFormElements.length, 2, "then both properties are displayed");
				const [oSelect] = aFormElements[1].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(
					oSelect.getSelectedKey(),
					JSON.stringify(oTextArrangementTypes.TextOnly),
					"then the initial value is displayed on second open"
				);
				// Select item and switch back to initial value
				const oSecondListItem = oSelect.getItems()[1];
				oSelect.setSelectedItem(oSecondListItem);
				oSelect.fireChange({ selectedItem: oSecondListItem });
				const oFirstListItem = oSelect.getItems()[0];
				oSelect.setSelectedItem(oFirstListItem);
				oSelect.fireChange({ selectedItem: oFirstListItem });
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled"
				);
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
							key: oTextArrangementTypes[sKey],
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

		QUnit.test("When the dialog is opened with an existing changeAnnotation change, that is not yet applied", async function(assert) {
			const oAnnotationChange = FlexObjectFactory.createFromFileContent({
				changeType: "changeAnnotation",
				content: {
					annotationPath: "path/to/test/label",
					value: oTextArrangementTypes.TextFirst
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
							key: oTextArrangementTypes[sKey],
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
				const oToggleAllPropertiesSwitch = Element.getElementById("sapUiRtaChangeAnnotationDialog_toggleShowAllPropertiesSwitch");
				// Show changed properties only for preexisting changes
				oToggleAllPropertiesSwitch.fireChange({ state: true});
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				assert.strictEqual(
					oList.getFormElements().length,
					1,
					"then only one form element is displayed"
				);
				assert.strictEqual(
					oList.getFormElements()[0].getBindingContext().getObject().annotationPath,
					oAnnotationChange.getContent().annotationPath,
					"then only the property for which a change exists is displayed"
				);
				assert.deepEqual(
					JSON.parse(oList.getFormElements()[0].getFields()[0].getSelectedKey()),
					oTextArrangementTypes.TextFirst,
					"the value is set correctly"
				);

				// Show all properties
				oToggleAllPropertiesSwitch.fireChange({ state: false });
				assert.strictEqual(
					oList.getFormElements().length,
					2,
					"then on second toggle press all properties are displayed again"
				);

				// Make dirty changes and toggle again
				const [oSelect1, oSelect2] = oList.getFormElements().map((oFormElement) => oFormElement.getFields()[0]);
				const oListItem1 = oSelect1.getItems()[1];
				oSelect1.setSelectedItem(oListItem1);
				oSelect1.fireChange({ selectedItem: oListItem1 });
				const oListItem2 = oSelect2.getItems()[1];
				oSelect2.setSelectedItem(oListItem2);
				oSelect2.fireChange({ selectedItem: oListItem2 });
				oToggleAllPropertiesSwitch.fireChange({ state: true });
				assert.strictEqual(
					oList.getFormElements().length,
					2,
					"then the newly dirty property is displayed as well"
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
				const aVisibleFields = aFormElements[0].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(
					aVisibleFields.length,
					1,
					"then only one input field is visible based on the type"
				);
				const oCheckBox = aVisibleFields[0];
				assert.strictEqual(
					oCheckBox.getState(),
					false,
					"then the correct value is set"
				);
				assert.ok(
					oCheckBox.isA("sap.m.Switch"),
					"then the input field for the boolean type is a switch"
				);

				oCheckBox.setState(true);
				oCheckBox.fireChange({ state: true });
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
								currentValue: "Hello",
								tooltip: "My Test Tooltip"
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: "World",
								label: "My special Test Label"
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
				const aVisibleFields = aFormElements[1].getFields().filter((oField) => oField.getVisible());
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
			assert.strictEqual(aChanges[0].content.annotationPath, "path/to/test/label", "then the correct path was returned");
			assert.strictEqual(aChanges[0].content.value, undefined, "then the correct value was returned");
			assert.strictEqual(aChanges[0].content.text, "Bye", "then the correct text was returned");
		});

		QUnit.test("when the dialog is opened with singleRename, different label on the control and a not yet applied change", async function(assert) {
			const sAnnotationChangeLabel = "My Annotation Label";
			const oAnnotationChange = FlexObjectFactory.createFromFileContent({
				changeType: "changeAnnotation",
				content: {
					annotationPath: "path/to/test/label"
				},
				fileType: "annotation_change",
				texts: {
					annotationText: {
						value: sAnnotationChangeLabel
					}
				}
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
								currentValue: "Hello"
							},
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: "World"
							}
						],
						preSelectedProperty: "path/to/test/label"
					};
				}
			};
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			const sControlSpecificLabel = "My Control Specific Label";
			sandbox.stub(ElementUtil, "getLabelForElement").returns(sControlSpecificLabel);
			const fnAfterOpen = () => {
				const oHBox = Element.getElementById("sapUiRtaChangeAnnotationDialog_filterHBox");
				assert.strictEqual(oHBox.getVisible(), false, "then the filter is hidden");
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				assert.strictEqual(oInput.getValue(), sAnnotationChangeLabel, "then the correct value is set");

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened with singleRename and a different label on the control", async function(assert) {
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
							},
							{
								propertyName: "Test",
								annotationPath: "path/to/third/test/label",
								currentValue: "Bye"
							},
							{
								propertyName: "Other Property",
								annotationPath: "path/to/other/label",
								currentValue: "Other"
							}
						],
						preSelectedProperty: "path/to/third/test/label"
					};
				}
			};
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			const sControlSpecificLabel = "My Control Specific Label";
			sandbox.stub(ElementUtil, "getLabelForElement").returns(sControlSpecificLabel);
			const fnAfterOpen = () => {
				const oHBox = Element.getElementById("sapUiRtaChangeAnnotationDialog_filterHBox");
				assert.strictEqual(oHBox.getVisible(), false, "then the filter is hidden");

				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				assert.strictEqual(aFormElements.length, 1, "then only one form element is displayed");

				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				assert.strictEqual(oInput.getValue(), sControlSpecificLabel, "then the correct value is set");

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened with a preselected property, that does not exist", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return {
						serviceUrl: "testServiceUrl",
						properties: [
							{
								propertyName: "My Other Test Label",
								annotationPath: "path/to/second/test/label",
								currentValue: "World"
							},
							{
								propertyName: "My Test Label",
								annotationPath: "other/path/to/test/label",
								currentValue: "Hello"
							}
						],
						preSelectedProperty: "path/to/test/label"
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
				assert.strictEqual(aFormElements.length, 2, "then all properties are shown");

				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");
				assert.strictEqual(oSearchField.getValue(), "", "then no filter is set");

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});