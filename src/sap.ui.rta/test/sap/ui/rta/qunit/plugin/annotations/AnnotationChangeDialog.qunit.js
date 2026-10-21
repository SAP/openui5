/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/dt/ElementUtil",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/plugin/annotations/AnnotationChangeDialog",
	"sap/ui/rta/plugin/annotations/AnnotationTypes",
	"sap/ui/rta/plugin/annotations/DocumentedAnnotationChanges",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Log,
	Control,
	Element,
	Lib,
	ElementUtil,
	KeyCodes,
	FlexObjectFactory,
	PersistenceWriteAPI,
	JSONModel,
	QUnitUtils,
	AnnotationChangeDialog,
	AnnotationTypes,
	DocumentedAnnotationChanges,
	RtaUtils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	const oTextArrangementTypes = {
		TextOnly: { EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" },
		TextFirst: { EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst" },
		IDOnly: { EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/IDOnly" },
		IDFirst: { EnumMember: "com.sap.vocabularies.UI.v1.TextArrangementType/IDFirst" }
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

	function createValueListTestDelegate(sPreSelectedProperty) {
		return {
			getAnnotationsChangeInfo: () => {
				const oReturn = {
					serviceUrl: "testServiceUrl",
					properties: [
						{
							propertyName: "My First Test Label",
							annotationPath: "path/to/test/label",
							currentValue: oTextArrangementTypes.TextOnly,
							label: "My Special Test"
						},
						{
							propertyName: "My Other Test Label",
							annotationPath: "path/to/second/test/label",
							currentValue: oTextArrangementTypes.IDFirst,
							tooltip: "My Other Test Tooltip"
						},
						{
							propertyName: "My First Test Label",
							annotationPath: "path/to/first/test/label",
							currentValue: oTextArrangementTypes.IDFirst,
							tooltip: "My First Test Tooltip"
						}
					],
					possibleValues: Object.keys(oTextArrangementTypes).map((sKey) => ({
						key: oTextArrangementTypes[sKey],
						text: oTextArrangementLabels[sKey]
					}))
				};
				if (sPreSelectedProperty) {
					oReturn.preSelectedProperty = sPreSelectedProperty;
				}
				return Promise.resolve(oReturn);
			}
		};
	}

	function createBooleanTestDelegate() {
		return {
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
	}

	function createStringTestDelegate(sPreSelectedProperty) {
		return {
			getAnnotationsChangeInfo: () => {
				const oReturn = {
					serviceUrl: "testServiceUrl",
					properties: [
						{
							propertyName: "My Test Label",
							annotationPath: "path/to/test/label",
							currentValue: "Hello",
							label: "My Test Label"
						},
						{
							propertyName: "My Other Test Label",
							annotationPath: "path/to/second/test/label",
							currentValue: "World",
							tooltip: "My Other Test Tooltip"
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
					]
				};
				if (sPreSelectedProperty) {
					oReturn.preSelectedProperty = sPreSelectedProperty;
				}
				return oReturn;
			}
		};
	}

	QUnit.module("Basic functionality", {
		beforeEach() {
			this.oDialog = new AnnotationChangeDialog();
			this.oTestControl = new Control("testControl");
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			this.oGetDocumentationUrl = sandbox.stub(RtaUtils, "getSystemSpecificDocumentationUrl");
		},
		afterEach() {
			this.oDialog.destroy();
			this.oComponent.destroy();
			this.oTestControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the dialog is opened for a textArrangement action", async function(assert) {
			const oTestDelegate = createValueListTestDelegate();
			const oActionConfig = {
				title: "Change Text Arrangement",
				description: "Select The Preferred Text Arrangement For Each Entry:",
				type: AnnotationTypes.ValueListType,
				control: { id: "testControl" },
				annotation: "testAnnotation",
				delegate: oTestDelegate,
				featureKey: DocumentedAnnotationChanges.TextArrangement
			};
			const oDelegateSpy = sandbox.spy(oTestDelegate, "getAnnotationsChangeInfo");
			const fnAfterOpen = () => {
				assert.ok(this.oGetDocumentationUrl.calledWith({
					btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/making-ui-changes#changing-the-text-arrangement",
					s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/54270a390b194c3e97be2424592c3352.html#changing-the-text-arrangement",
					s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/54270a390b194c3e97be2424592c3352.html#changing-the-text-arrangement"
				}), "the documentation url is requested with the correct links");
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();

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
					"then the save button is disabled initially"
				);
				assert.strictEqual(aFormElements.length, 3, "then for each property a form element is created");
				assert.strictEqual(aFormElements[0].getLabel().getText(), "My First Test Label", "then the properties are properly sorted");
				assert.strictEqual(aFormElements[1].getLabel().getText(), "My Other Test Label", "then the properties are properly sorted");
				assert.strictEqual(aFormElements[2].getLabel().getText(), "My Special Test", "then the properties are properly sorted");
				assert.strictEqual(aFormElements[0].getLabel().getTooltip(), "My First Test Tooltip", "then the tooltips are set");
				assert.strictEqual(aFormElements[1].getLabel().getTooltip(), "My Other Test Tooltip", "then the tooltips are set");
				assert.strictEqual(aFormElements[2].getLabel().getTooltip(), null, "then the tooltips are set");

				const aVisibleFields = aFormElements[2].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(aVisibleFields.length, 1, "then only one input field is visible based on the type");

				const oSelect = aVisibleFields[0];
				assert.strictEqual(oSelect.getSelectedKey(), JSON.stringify(oTextArrangementTypes.TextOnly), "the correct value is set");
				assert.ok(oSelect.isA("sap.m.Select"), "then the input field for the value list type is a select");

				// Switch selected item for a property
				const oListItem = oSelect.getItems()[1];
				oSelect.setSelectedItem(oListItem);
				oSelect.fireChange({ selectedItem: oListItem });
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					true,
					"then the save button becomes enabled after a Select change"
				);

				Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").firePress();
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
							label: "My Special Test"
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
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				assert.strictEqual(aFormElements.length, 111, "then only 111 form elements are created");
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			return openDialog(sandbox, oActionConfig, fnAfterOpen, 111, assert);
		});

		QUnit.test("When the dialog is closed via cancel or no changes are made", async function(assert) {
			const oTestDelegate = createValueListTestDelegate();
			const oActionConfig = {
				type: AnnotationTypes.ValueListType,
				annotation: "testAnnotation",
				delegate: oTestDelegate
			};

			const fnAfterFirstOpen = () => {
				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");
				oSearchField.setValue("Other");
				oSearchField.fireLiveChange({ newValue: "Other" });
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const [oSelect] = aFormElements[0].getFields().filter((oField) => oField.getVisible());
				const oListItem = oSelect.getItems()[1];
				oSelect.setSelectedItem(oListItem);
				oSelect.fireChange({ selectedItem: oListItem });
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			const fnAfterSecondOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				assert.strictEqual(aFormElements.length, 3, "then all properties are displayed");
				const [oSelect] = aFormElements[2].getFields().filter((oField) => oField.getVisible());
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
					"then the save button stays disabled after switching back to the original value"
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

		QUnit.test("When the dialog is closed via Escape", async function(assert) {
			const oTestDelegate = createValueListTestDelegate();
			const oActionConfig = {
				type: AnnotationTypes.ValueListType,
				annotation: "testAnnotation",
				delegate: oTestDelegate
			};

			const fnAfterOpen = (oEvent) => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const [oSelect] = aFormElements[0].getFields();
				const oListItem = oSelect.getItems()[1];
				oSelect.setSelectedItem(oListItem);
				oSelect.fireChange({ selectedItem: oListItem });
				QUnitUtils.triggerKeydown(oEvent.getSource().getFocusDomRef(), KeyCodes.ESCAPE);
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 0, "then the handler resolves correctly and no changes are returned");
		});

		QUnit.test("When the dialog is opened with a preselected annotationPath", async function(assert) {
			const oTestDelegate = createValueListTestDelegate("path/to/second/test/label");
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
				assert.strictEqual(oList.getFormElements().length, 3, "then the filter can be removed by the user");

				oSearchField.setValue("Special");
				oSearchField.fireLiveChange({ newValue: "Special" });
				assert.strictEqual(oList.getFormElements().length, 1, "then a different filter value can be set by the user");

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("When filtering by value in the search field", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");

				assert.strictEqual(oList.getFormElements().length, 4, "then all properties are initially displayed");

				oSearchField.setValue("Hello");
				oSearchField.fireLiveChange({ newValue: "Hello" });
				assert.strictEqual(oList.getFormElements().length, 1, "then filtering by value 'Hello' shows one result");
				assert.strictEqual(
					oList.getFormElements()[0].getBindingContext().getObject().currentValue,
					"Hello",
					"then the correct property is displayed"
				);

				oSearchField.setValue("Other");
				oSearchField.fireLiveChange({ newValue: "Other" });
				assert.strictEqual(
					oList.getFormElements().length, 2, "then filtering by 'Other' shows two results (label and value match)"
				);

				oSearchField.setValue("");
				oSearchField.fireLiveChange({ newValue: "" });
				assert.strictEqual(oList.getFormElements().length, 4, "then clearing the filter shows all properties again");

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
			const oTestDelegate = createValueListTestDelegate();
			const oActionConfig = {
				title: "Change Text Arrangement",
				description: "Select The Preferred Text Arrangement For Each Entry:",
				type: AnnotationTypes.ValueListType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const oToggleAllPropertiesSwitch = Element.getElementById("sapUiRtaChangeAnnotationDialog_toggleShowAllPropertiesSwitch");
				// Show changed properties only for preexisting changes
				oToggleAllPropertiesSwitch.fireChange({ state: true });
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				assert.strictEqual(oList.getFormElements().length, 1, "then only one form element is displayed");
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
				assert.strictEqual(oList.getFormElements().length, 3, "then on second toggle press all properties are displayed again");

				// Make dirty changes and toggle again
				const [oSelect1, oSelect2] = oList.getFormElements().map((oFormElement) => oFormElement.getFields()[0]);
				const oListItem1 = oSelect1.getItems()[1];
				oSelect1.setSelectedItem(oListItem1);
				oSelect1.fireChange({ selectedItem: oListItem1 });
				const oListItem2 = oSelect2.getItems()[1];
				oSelect2.setSelectedItem(oListItem2);
				oSelect2.fireChange({ selectedItem: oListItem2 });
				oToggleAllPropertiesSwitch.fireChange({ state: true });
				assert.strictEqual(oList.getFormElements().length, 3, "then the newly dirty property is displayed as well");

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("When the action type is boolean", async function(assert) {
			const oTestDelegate = createBooleanTestDelegate();
			const oActionConfig = {
				title: "Change Some Boolean Prop",
				type: AnnotationTypes.BooleanType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				assert.ok(this.oGetDocumentationUrl.calledWith({
					btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/making-ui-changes",
					s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/54270a390b194c3e97be2424592c3352.html",
					s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/54270a390b194c3e97be2424592c3352.html"
				}), "the documentation url is requested with the correct links");

				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const aVisibleFields = aFormElements[0].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(aVisibleFields.length, 1, "then only one input field is visible based on the type");
				const oCheckBox = aVisibleFields[0];
				assert.strictEqual(oCheckBox.getState(), false, "then the correct value is set");
				assert.ok(oCheckBox.isA("sap.m.Switch"), "then the input field for the boolean type is a switch");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is initially disabled"
				);

				oCheckBox.setState(true);
				oCheckBox.fireChange({ state: true });
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					true,
					"then the save button becomes enabled after a Switch change"
				);
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				oSaveButton.firePress();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 1, "One change was returned");
			assert.strictEqual(aChanges[0].content.annotationPath, "path/to/second/test/label", "then the correct path was returned");
			assert.strictEqual(aChanges[0].content.value, true, "then the correct value was returned");
		});

		QUnit.test("When the action type is string", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				featureKey: DocumentedAnnotationChanges.Rename
			};
			const fnAfterOpen = () => {
				assert.ok(this.oGetDocumentationUrl.calledWith({
					btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/making-ui-changes#renaming-a-ui-element",
					s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/54270a390b194c3e97be2424592c3352.html#renaming-a-ui-element",
					s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/54270a390b194c3e97be2424592c3352.html#renaming-a-ui-element"
				}), "the documentation url is requested with the correct links");

				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const aVisibleFields = aFormElements[1].getFields().filter((oField) => oField.getVisible());
				assert.strictEqual(aVisibleFields.length, 1, "then only one input field is visible based on the type");

				const oInput = aVisibleFields[0];
				assert.strictEqual(oInput.getValue(), "Hello", "then the correct value is set");
				assert.ok(oInput.isA("sap.m.Input"), "then the input field for the string type is an input");

				oInput.fireLiveChange({ newValue: "Bye" });
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				assert.ok(
					oSaveButton.getEnabled(),
					"then the save button enabled state is updated on live change"
				);
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
			const oTestDelegate = createStringTestDelegate("path/to/test/label");
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
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				assert.strictEqual(oInput.getValue(), sAnnotationChangeLabel, "then the correct value is set");
				assert.strictEqual(
					aFormElements[0].getLabel().getText(),
					oResourceBundle.getText("ANNOTATION_CHANGE_DIALOG_SINGLE_RENAME_LABEL"),
					"then the dedicated single rename label is displayed"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened with singleRename and a different label on the control", async function(assert) {
			const oTestDelegate = createStringTestDelegate("path/to/third/test/label");
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

				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				assert.strictEqual(aFormElements.length, 1, "then only one form element is displayed");

				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				assert.strictEqual(oInput.getValue(), sControlSpecificLabel, "then the correct value is set");

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened with singleRename, a new value is entered and user presses Enter", async function(assert) {
			const oTestDelegate = createStringTestDelegate("path/to/third/test/label");
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
				const oInput = Element.getElementById("sapUiRtaChangeAnnotationDialog_singleRenameField");
				assert.ok(oInput, "then the single rename field has the stable ID");
				oInput.fireLiveChange({ newValue: "My New Value" });
				oInput.fireSubmit();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 1, "then one change is created");
			assert.strictEqual(aChanges[0].content.annotationPath, "path/to/third/test/label", "then the correct path was returned");
			assert.strictEqual(aChanges[0].content.text, "My New Value", "then the correct text was returned");
		});

		QUnit.test("when singleRename has no preselected property but one field, a value is entered and Enter pressed", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => ({
					serviceUrl: "testServiceUrl",
					properties: [{
						propertyName: "My Test Label",
						annotationPath: "path/to/test/label",
						currentValue: "Hello",
						label: "My Test Label"
					}]
				})
			};
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			sandbox.stub(ElementUtil, "getLabelForElement").returns("My Control Specific Label");
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				oInput.fireLiveChange({ newValue: "My New Value" });
				// Enter must save even though no property was preselected (there is only one field)
				oInput.fireSubmit();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 1, "then one change is created");
			assert.strictEqual(aChanges[0].content.text, "My New Value", "then the correct text was returned");
		});

		QUnit.test("when the dialog is opened with singleRename, an invalid value is entered and user presses Enter", async function(assert) {
			const oTestDelegate = createStringTestDelegate("path/to/third/test/label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				validators: ["noEmptyText"],
				controlBasedRenameChangeType: "myRename"
			};
			const sControlSpecificLabel = "My Control Specific Label";
			sandbox.stub(ElementUtil, "getLabelForElement").returns(sControlSpecificLabel);
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				oInput.fireLiveChange({ newValue: "" });
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled for the invalid value"
				);
				// Enter must not bypass the disabled save button
				oInput.fireSubmit();
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 0, "then no change is created");
		});

		QUnit.test("when the dialog is opened with singleRename and the user presses Enter without changing the value", async function(assert) {
			const oTestDelegate = createStringTestDelegate("path/to/third/test/label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			sandbox.stub(ElementUtil, "getLabelForElement").returns("My Control Specific Label");
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				// Enter on an unchanged value must still close the dialog
				oInput.fireSubmit();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 0, "then the dialog closes with no change");
		});

		QUnit.test("when the dialog is opened in list mode, the search field is focused", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl
			};
			const fnAfterOpen = () => {
				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog").getInitialFocus(),
					"sapUiRtaChangeAnnotationDialog_propertiesFilter",
					"then the search field is set as the dialog's initial focus"
				);
				assert.strictEqual(oSearchField.getFocusDomRef(), document.activeElement, "then the search field is focused");
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened in single rename mode, the property editor is focused", async function(assert) {
			const oTestDelegate = createStringTestDelegate("path/to/third/test/label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			sandbox.stub(ElementUtil, "getLabelForElement").returns("My Control Specific Label");
			const fnAfterOpen = () => {
				const oInput = Element.getElementById("sapUiRtaChangeAnnotationDialog_singleRenameField");
				assert.ok(oInput, "then the single rename field has the stable ID");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog").getInitialFocus(),
					"sapUiRtaChangeAnnotationDialog_singleRenameField",
					"then the field is set as the dialog's initial focus"
				);
				assert.strictEqual(oInput.getFocusDomRef(), document.activeElement, "then the property editor field is focused");
				assert.strictEqual(window.getSelection().toString(), oInput.getValue(), "then the current text is selected");
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened in single rename mode, the text is selected while opening (no focus flicker)", async function(assert) {
			const oTestDelegate = createStringTestDelegate("path/to/third/test/label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			sandbox.stub(ElementUtil, "getLabelForElement").returns("My Control Specific Label");
			// The text must be selected synchronously while opening (in _openDialog) so it is already
			// selected by the time the afterOpen event fires - deferring it caused a visible focus flicker.
			const oSelectSpy = sandbox.spy(window.HTMLInputElement.prototype, "select");
			const fnAfterOpen = () => {
				assert.ok(oSelectSpy.called, "then the text was already selected when the afterOpen event fired");
				Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton").firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when singleRename yields multiple fields, the dialog behaves like a standard rename", async function(assert) {
			sandbox.stub(Log, "warning");
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => ({
					serviceUrl: "testServiceUrl",
					properties: [
						{ propertyName: "First", annotationPath: "path/to/first", currentValue: "Hello", label: "Ambiguous Label" },
						{ propertyName: "Second", annotationPath: "path/to/second", currentValue: "World", label: "Ambiguous Label" }
					],
					preSelectedProperty: "path/to/does/not/exist"
				})
			};
			sandbox.stub(ElementUtil, "getLabelForElement").returns("Ambiguous Label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			const fnAfterOpen = () => {
				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");
				assert.ok(oSearchField.getVisible(), "then the search field is visible");
				assert.strictEqual(oSearchField.getFocusDomRef(), document.activeElement, "then the search field is focused");
				assert.notOk(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_singleRenameField"),
					"then no field carries the single-rename stable ID"
				);
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when a pending rename change on another property collides with the preselected label", async function(assert) {
			const oAnnotationChange = FlexObjectFactory.createFromFileContent({
				changeType: "changeAnnotation",
				content: {
					annotationPath: "path/to/test/label"
				},
				fileType: "annotation_change",
				texts: {
					annotationText: {
						value: "My Other Test Label"
					}
				}
			});
			sandbox.stub(PersistenceWriteAPI, "_getAnnotationChanges").returns([oAnnotationChange]);
			const oTestDelegate = createStringTestDelegate("path/to/second/test/label");
			sandbox.stub(ElementUtil, "getLabelForElement").returns("My Other Test Label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				assert.strictEqual(aFormElements.length, 1, "then exactly one form element is displayed");
				assert.strictEqual(
					aFormElements[0].getBindingContext().getProperty("annotationPath"),
					"path/to/second/test/label",
					"then the displayed form element belongs to the preselected property"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when singleRename has a non-matching preSelectedProperty and the control label matches one property", async function(assert) {
			const oLogStub = sandbox.stub(Log, "warning");
			const oTestDelegate = createStringTestDelegate("path/to/does/not/exist");
			sandbox.stub(ElementUtil, "getLabelForElement").returns("My Test Label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				assert.strictEqual(aFormElements.length, 1, "then exactly one form element is displayed");
				assert.strictEqual(
					aFormElements[0].getBindingContext().getProperty("annotationPath"),
					"path/to/test/label",
					"then the label-matched property is displayed"
				);
				assert.strictEqual(
					aFormElements[0].getLabel().getText(),
					oResourceBundle.getText("ANNOTATION_CHANGE_DIALOG_SINGLE_RENAME_LABEL"),
					"then the generic single-rename label is shown as it is a single-field rename"
				);
				assert.ok(
					oLogStub.calledWithMatch(sinon.match(/singleRename without a matching preSelectedProperty/)),
					"then a warning is logged about the non-matching preSelectedProperty"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when singleRename has a non-matching preSelectedProperty and the control label matches multiple properties", async function(assert) {
			const oLogStub = sandbox.stub(Log, "warning");
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => ({
					serviceUrl: "testServiceUrl",
					properties: [
						{
							propertyName: "First",
							annotationPath: "path/to/first",
							currentValue: "Hello",
							label: "Ambiguous Label"
						},
						{
							propertyName: "Second",
							annotationPath: "path/to/second",
							currentValue: "World",
							label: "Ambiguous Label"
						},
						{
							propertyName: "Unique",
							annotationPath: "path/to/unique",
							currentValue: "Bye",
							label: "Unique Label"
						}
					],
					preSelectedProperty: "path/to/does/not/exist"
				})
			};
			sandbox.stub(ElementUtil, "getLabelForElement").returns("Ambiguous Label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			const fnAfterOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const aFormElements = oList.getFormElements();
				assert.strictEqual(aFormElements.length, 2, "then both label-matched properties are displayed");
				assert.ok(
					oLogStub.calledWithMatch(sinon.match(/singleRename without a matching preSelectedProperty/)),
					"then a warning is logged"
				);
				assert.strictEqual(oList.getModel().getProperty("/singleFieldRename"), false, "then singleFieldRename is false");
				assert.notOk(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_singleRenameField"),
					"then no field carries the single-rename stable ID"
				);

				// With more than one field, Enter must not submit (it is ambiguous which field to save)
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				oInput.fireLiveChange({ newValue: "My New Value" });
				oInput.fireSubmit();

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 0, "then Enter did not submit and the dialog was cancelled");
		});

		QUnit.test("when singleRename has a non-matching preSelectedProperty and the control label matches no property", async function(assert) {
			const oLogStub = sandbox.stub(Log, "warning");
			const oTestDelegate = createStringTestDelegate("path/to/does/not/exist");
			sandbox.stub(ElementUtil, "getLabelForElement").returns("No Such Label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				assert.strictEqual(aFormElements.length, 0, "then no form elements are displayed");
				assert.ok(
					oLogStub.calledWithMatch(sinon.match(/singleRename without a matching preSelectedProperty/)),
					"then a warning is logged"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when singleRename is true and preSelectedProperty not provided", async function(assert) {
			const oLogStub = sandbox.stub(Log, "error");
			const oTestDelegate = createStringTestDelegate();
			sandbox.stub(ElementUtil, "getLabelForElement").returns("No Such Label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			function fnAfterOpen() {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				assert.strictEqual(aFormElements.length, 4, "then all form elements are displayed");
				assert.strictEqual(aFormElements[0].getLabel().getText(), "My Other Test Label", "the first label is correct");
				assert.strictEqual(aFormElements[1].getLabel().getText(), "My Test Label", "the second label is correct");
				assert.strictEqual(aFormElements[2].getLabel().getText(), "Other Property", "the third label is correct");
				assert.strictEqual(aFormElements[3].getLabel().getText(), "Test", "the fourth label is correct");
				assert.ok(
					oLogStub.calledWithMatch(sinon.match(/AnnotationChangeDialog: singleRename should not be used without a preSelectedProperty./)),
					"then an error is logged about the non-matching preSelectedProperty"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			}
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened with a preselected property, that does not exist", async function(assert) {
			const oTestDelegate = createStringTestDelegate("path/to/does/not/exist");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				assert.strictEqual(aFormElements.length, 4, "then all properties are shown");

				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");
				assert.strictEqual(oSearchField.getValue(), "", "then no filter is set");

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened with no properties", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => {
					return Promise.resolve({
						serviceUrl: "testServiceUrl",
						properties: [],
						possibleValues: []
					});
				}
			};
			const oActionConfig = {
				title: "Change Text Arrangement",
				description: "No properties available.",
				type: AnnotationTypes.ValueListType,
				control: { id: "testControl" },
				annotation: "testAnnotation",
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const oDialog = Element.getElementById("sapUiRtaChangeAnnotationDialog");
				const oIllustratedMessage = oDialog.getContent()[0].getItems().filter(function(oItem) {
					return oItem.isA("sap.m.IllustratedMessage");
				})[0];
				assert.ok(oIllustratedMessage, "then the IllustratedMessage is displayed");
				assert.strictEqual(
					oIllustratedMessage.getTitle(),
					oResourceBundle.getText("ANNOTATION_CHANGE_DIALOG_NO_PROPERTIES_TITLE"),
					"then the Illustrated Message title is correct"
				);
				assert.strictEqual(
					oIllustratedMessage.getDescription(),
					oResourceBundle.getText("ANNOTATION_CHANGE_DIALOG_NO_PROPERTIES_DESCRIPTION"),
					"then the Illustrated Message description is correct"
				);
				const oForm = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyListForm");
				assert.notOk(oForm.getVisible(), "then the property list form is hidden");
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				assert.notOk(oSaveButton.getVisible(), "then the save button is hidden");
				const oSearchField = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertiesFilter");
				assert.notOk(oSearchField.getEnabled(), "then the search field is disabled");
				const oSwitch = Element.getElementById("sapUiRtaChangeAnnotationDialog_toggleShowAllPropertiesSwitch");
				assert.notOk(oSwitch.getEnabled(), "then the switch is disabled");
				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});
	});

	QUnit.module("Validation", {
		beforeEach() {
			this.oDialog = new AnnotationChangeDialog();
			this.oTestControl = new Control("testControl");
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(RtaUtils, "getSystemSpecificDocumentationUrl");
		},
		afterEach() {
			this.oDialog.destroy();
			this.oComponent.destroy();
			this.oTestControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when binding syntax is entered in a string input", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[1].getFields().filter((oField) => oField.getVisible())[0];

				oInput.setValue("{binding}");
				oInput.fireLiveChange({ newValue: "{binding}" });

				assert.strictEqual(oInput.getValueState(), "Error", "then the input has error state");
				assert.ok(oInput.getValueStateText().length > 0, "then a validation error text is shown");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when a custom validator rejects the input", async function(assert) {
			const sCustomError = "Custom validation error";
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				validators: [{
					validatorFunction(sText) {
						return sText !== "forbidden";
					},
					errorMessage: sCustomError
				}]
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];

				oInput.setValue("forbidden");
				oInput.fireLiveChange({ newValue: "forbidden" });

				assert.strictEqual(oInput.getValueState(), "Error", "then the input has error state");
				assert.strictEqual(oInput.getValueStateText(), sCustomError, "then the custom error message is shown");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when a valid value is entered after an invalid one", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];

				// Enter invalid value
				oInput.fireLiveChange({ newValue: "{binding}" });
				assert.strictEqual(oInput.getValueState(), "Error", "then the input initially has error state");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is initially disabled"
				);

				// Fix the value
				oInput.fireLiveChange({ newValue: "Valid Text" });
				assert.strictEqual(oInput.getValueState(), "None", "then the error state is cleared");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					true,
					"then the save button is re-enabled"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when one of multiple inputs is invalid, save is disabled", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oFirstInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				const oSecondInput = aFormElements[1].getFields().filter((oField) => oField.getVisible())[0];

				// Set a valid value on the first input
				oFirstInput.fireLiveChange({ newValue: "New Valid Text" });
				assert.strictEqual(oFirstInput.getValueState(), "None", "then the first input is valid");

				// Set an invalid value on the second input
				oSecondInput.fireLiveChange({ newValue: "{bad}" });
				assert.strictEqual(oSecondInput.getValueState(), "Error", "then the second input has error state");

				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled because one input is invalid"
				);

				// Fix the second input
				oSecondInput.fireLiveChange({ newValue: "Fixed" });
				assert.strictEqual(oSecondInput.getValueState(), "None", "then the second input error is cleared");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					true,
					"then the save button is re-enabled after fixing the input"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the same text as the original value is entered, no error is shown", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[1].getFields().filter((oField) => oField.getVisible())[0];

				// Change value and then change back to original
				oInput.fireLiveChange({ newValue: "Changed" });
				oInput.fireLiveChange({ newValue: "Hello" });

				assert.strictEqual(oInput.getValueState(), "None", "then no error is shown for same text");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled because the value matches the original again"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the noEmptyText validator is used and empty text is entered", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				validators: ["noEmptyText"]
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];

				oInput.fireLiveChange({ newValue: "" });

				assert.strictEqual(oInput.getValueState(), "Error", "then the input has error state");
				assert.ok(oInput.getValueStateText().length > 0, "then an error message is shown");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when the dialog is opened with an initially invalid value, save is disabled immediately", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => ({
					serviceUrl: "testServiceUrl",
					properties: [{
						propertyName: "My Test Label",
						annotationPath: "path/to/test/label",
						currentValue: "",
						label: "My Test Label"
					}]
				})
			};
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				validators: ["noEmptyText"]
			};
			const fnAfterOpen = () => {
				const [oFormElement] = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = oFormElement.getFields().filter((oField) => oField.getVisible())[0];

				// Trigger validation against the (invalid) initial value
				oInput.fireLiveChange({ newValue: oInput.getValue() });

				assert.strictEqual(oInput.getValueState(), "Error", "then the input has error state on open");
				assert.ok(oInput.getValueStateText().length > 0, "then an error message is shown");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled on open"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when a custom validator rejects the initial value, save is disabled immediately", async function(assert) {
			const sCustomError = "Custom validation error";
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => ({
					serviceUrl: "testServiceUrl",
					properties: [{
						propertyName: "My Test Label",
						annotationPath: "path/to/test/label",
						currentValue: "forbidden",
						label: "My Test Label"
					}]
				})
			};
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				validators: [{
					validatorFunction(sText) {
						return sText !== "forbidden";
					},
					errorMessage: sCustomError
				}]
			};
			const fnAfterOpen = () => {
				const [oFormElement] = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = oFormElement.getFields().filter((oField) => oField.getVisible())[0];

				// Trigger validation against the (invalid) initial value
				oInput.fireLiveChange({ newValue: oInput.getValue() });

				assert.strictEqual(oInput.getValueState(), "Error", "then the input has error state on open");
				assert.strictEqual(oInput.getValueStateText(), sCustomError, "then the custom error message is shown");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled on open"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when typing back to the original value which fails validation, the error is re-shown", async function(assert) {
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => ({
					serviceUrl: "testServiceUrl",
					properties: [{
						propertyName: "My Test Label",
						annotationPath: "path/to/test/label",
						currentValue: "",
						label: "My Test Label"
					}]
				})
			};
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				validators: ["noEmptyText"]
			};
			const fnAfterOpen = () => {
				const [oFormElement] = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = oFormElement.getFields().filter((oField) => oField.getVisible())[0];

				oInput.fireLiveChange({ newValue: "Valid Text" });
				assert.strictEqual(oInput.getValueState(), "None", "then the error state is cleared after valid input");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					true,
					"then the save button is enabled after valid input"
				);

				oInput.fireLiveChange({ newValue: "" });
				assert.strictEqual(oInput.getValueState(), "Error", "then the error is re-shown for the invalid original value");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled again"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("in single rename mode, a validator error is shown when sameText passes", async function(assert) {
			// When the new value differs from the original (sameText passes) but fails a custom
			// validator, the validator error is shown on the input and save is disabled.
			const oTestDelegate = {
				getAnnotationsChangeInfo: () => ({
					serviceUrl: "testServiceUrl",
					properties: [{
						propertyName: "My Test Label",
						annotationPath: "path/to/test/label",
						currentValue: "valid",
						label: "My Test Label"
					}]
				})
			};
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename",
				validators: ["noEmptyText"]
			};
			const fnAfterOpen = () => {
				const [oFormElement] = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = oFormElement.getFields().filter((oField) => oField.getVisible())[0];

				oInput.fireLiveChange({ newValue: "" });
				assert.strictEqual(oInput.getValueState(), "Error", "then the input has error state");
				assert.strictEqual(
					oInput.getValueStateText(),
					oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"),
					"then the validator error message is shown"
				);
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("in single rename mode, sameText disables save without showing an error on the field", async function(assert) {
			// In single rename mode, reverting to the original means there is nothing to save.
			// No error is shown — just like RenameDialog — and Save is disabled.
			const oTestDelegate = createStringTestDelegate("path/to/test/label");
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate,
				control: this.oTestControl,
				singleRename: true,
				controlBasedRenameChangeType: "myRename"
			};
			sandbox.stub(ElementUtil, "getLabelForElement").returns("Hello");
			const fnAfterOpen = () => {
				const [oFormElement] = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = oFormElement.getFields().filter((oField) => oField.getVisible())[0];

				oInput.fireLiveChange({ newValue: "Changed" });
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					true,
					"then the save button is enabled after a real change"
				);

				oInput.fireLiveChange({ newValue: "Hello" });
				assert.strictEqual(oInput.getValueState(), "None", "then no error is shown on the field for same text");
				assert.strictEqual(
					Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton").getEnabled(),
					false,
					"then the save button is disabled when the value is back to the original"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("in multi rename mode, reverting the only changed field disables save without an error", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				const sOriginal = oInput.getBindingContext().getProperty("originalValue");

				oInput.fireLiveChange({ newValue: "Changed" });
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled after a real change");

				oInput.fireLiveChange({ newValue: sOriginal });
				assert.strictEqual(oInput.getValueState(), "None", "then reverting shows no error on the field");
				assert.strictEqual(
					oSaveButton.getEnabled(),
					false,
					"then the save button is disabled because no field differs from its original anymore"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("in multi rename mode, reverting one field while another is changed keeps save enabled", async function(assert) {
			// Guards the changedCount counter against double-counting and stale state across
			// multiple inputs: editing A, reverting A, editing B must leave save enabled.
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oFirstInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				const oSecondInput = aFormElements[1].getFields().filter((oField) => oField.getVisible())[0];
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				const sFirstOriginal = oFirstInput.getBindingContext().getProperty("originalValue");
				const sSecondOriginal = oSecondInput.getBindingContext().getProperty("originalValue");

				oFirstInput.fireLiveChange({ newValue: "First Changed" });
				oSecondInput.fireLiveChange({ newValue: "Second Changed" });
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled after editing both inputs");

				oFirstInput.fireLiveChange({ newValue: sFirstOriginal });
				assert.strictEqual(
					oSaveButton.getEnabled(),
					true,
					"then the save button stays enabled because the second input is still changed"
				);

				oSecondInput.fireLiveChange({ newValue: sSecondOriginal });
				assert.strictEqual(
					oSaveButton.getEnabled(),
					false,
					"then the save button is disabled once both inputs are back to their originals"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("in multi rename mode, repeated edits to the same field do not double-count changes", async function(assert) {
			// Guards against a counter bug where every keystroke would treat the field as a
			// new change. After typing several values and reverting, save must be disabled.
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				const sOriginal = oInput.getBindingContext().getProperty("originalValue");

				oInput.fireLiveChange({ newValue: "First Edit" });
				oInput.fireLiveChange({ newValue: "Second Edit" });
				oInput.fireLiveChange({ newValue: "Third Edit" });
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled while edits are in progress");

				oInput.fireLiveChange({ newValue: sOriginal });
				assert.strictEqual(
					oSaveButton.getEnabled(),
					false,
					"then the save button is disabled exactly once when the value returns to the original"
				);

				const oCancelButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton");
				oCancelButton.firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});

		QUnit.test("when typing a trailing blank into a string input, it is kept while typing but trimmed on save", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			let sAnnotationPath;
			const fnAfterOpen = () => {
				const aFormElements = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList").getFormElements();
				const oInput = aFormElements[0].getFields().filter((oField) => oField.getVisible())[0];
				sAnnotationPath = oInput.getBindingContext().getProperty("annotationPath");
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");

				oInput.fireLiveChange({ newValue: "Trimmed Value " });
				assert.strictEqual(oInput.getValue(), "Trimmed Value ", "then the trailing blank is not eaten while typing");
				assert.strictEqual(oSaveButton.getEnabled(), true, "then the save button is enabled");
				oSaveButton.firePress();
			};
			const aChanges = await openDialog(sandbox, oActionConfig, fnAfterOpen);
			assert.strictEqual(aChanges.length, 1, "then one change was returned");
			assert.strictEqual(aChanges[0].content.annotationPath, sAnnotationPath, "then the correct path was returned");
			assert.strictEqual(aChanges[0].content.text, "Trimmed Value", "then the saved text has the trailing blank removed");
		});

		QUnit.test("when a string value differs only by a trailing blank, it is not listed as changed", async function(assert) {
			const oTestDelegate = createStringTestDelegate();
			const oActionConfig = {
				title: "Change Some String Prop",
				type: AnnotationTypes.StringType,
				delegate: oTestDelegate
			};
			const fnAfterOpen = () => {
				const oList = Element.getElementById("sapUiRtaChangeAnnotationDialog_propertyList");
				const oInput = oList.getFormElements()[0].getFields().filter((oField) => oField.getVisible())[0];
				const sOriginalValue = oInput.getBindingContext().getProperty("originalValue");
				const oSaveButton = Element.getElementById("sapUiRtaChangeAnnotationDialog_saveButton");
				const oToggleSwitch = Element.getElementById("sapUiRtaChangeAnnotationDialog_toggleShowAllPropertiesSwitch");

				oInput.fireLiveChange({ newValue: `${sOriginalValue} ` });
				assert.strictEqual(oSaveButton.getEnabled(), false, "then the save button stays disabled for a trailing-only edit");

				oToggleSwitch.fireChange({ state: true });
				assert.strictEqual(
					oList.getFormElements().length,
					0,
					"then the property is not listed as changed in the show-changed-only view"
				);

				Element.getElementById("sapUiRtaChangeAnnotationDialog_cancelButton").firePress();
			};
			await openDialog(sandbox, oActionConfig, fnAfterOpen);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});