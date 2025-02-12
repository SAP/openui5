sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/test/generic/GenericTestCollection"
], function(Core, GenericTestCollection) {
	"use strict";

	const fnRequire = function(aModules) {
		return Core.ready().then(() => {
			return new Promise(function(fnResolve, fnReject) {
				sap.ui.require(aModules, function() {
					fnResolve(arguments);
				});
			});
		});
	};

	const oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.mdc",
		objectCapabilities: {
			"sap.ui.mdc.Control": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.Element": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					sortConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					filterConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					groupConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					aggregateConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					propertyInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.ui.mdc.Table": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				create: function(Class, mSettings) {
					return (new Class(mSettings)).initialized();
				}
			},
			"sap.ui.mdc.FilterBar": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					filterConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					propertyInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.ui.mdc.filterbar.FilterBarBase": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					filterConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					propertyInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.ui.mdc.filterbar.p13n.AdaptationFilterBar": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					adaptationControl: GenericTestCollection.ExcludeReason.CantSetDefaultValue,
					filterConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					propertyInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.ui.mdc.field.FieldBase": {
				create: async (FieldBase, mSettings) => {
					const aModules = await fnRequire(["sap/ui/mdc/enums/FieldDisplay", "sap/ui/mdc/enums/FieldEditMode", "sap/ui/mdc/field/FieldBaseDelegate", "sap/ui/mdc/field/FieldInput", "sap/ui/mdc/field/FieldMultiInput", "sap/ui/mdc/ValueHelp", "sap/ui/mdc/valuehelp/Dialog", "sap/ui/mdc/valuehelp/content/Conditions", "sap/ui/model/type/String"]);
					const sId = mSettings && mSettings.id;
					return new FieldBase(sId, {
						dataType: 'sap.ui.model.type.String', // set to prevent test to set dummy value
						display: aModules[0].Value,
						editMode: aModules[1].Editable,
						multipleLines: false,
						maxConditions: -1
					});
				},
				properties: {
					dataType: "sap.ui.model.type.String",
					dataTypeFormatOptions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeConstraints: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					conditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				aggregations: {
					content: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					contentDisplay: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					contentEdit: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					fieldInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings // we want to test standard content
				}
			},
			"sap.ui.mdc.field.FieldInput": {
				properties: {
					ariaAttributes: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings // tested inside Field
				}
			},
			"sap.ui.mdc.field.FieldMultiInput": {
				properties: {
					ariaAttributes: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings // tested inside MultiValueField
				}
			},
			"sap.ui.mdc.Field": {
				create: async (Field, mSettings) => { // use Unit Field to test with two content controls (single control is tested in FieldBase)
					const aModules = await fnRequire(["sap/ui/model/json/JSONModel", "sap/ui/model/type/String", "sap/ui/model/type/Float", "sap/ui/model/type/Currency", "sap/ui/mdc/enums/FieldDisplay", "sap/ui/mdc/enums/FieldEditMode", "sap/ui/mdc/ValueHelp", "sap/ui/mdc/valuehelp/Popover", "sap/ui/mdc/valuehelp/content/MTable", "sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/Label", "sap/m/Text", "sap/ui/mdc/ValueHelpDelegate", "sap/ui/mdc/field/FieldBaseDelegate", "sap/ui/mdc/field/FieldInput"]);
					const [JSONModel, StringType, FloatType, CurrencyType, FieldDisplay, FieldEditMode, ValueHelp, Popover, MTable, Table, Column, ColumnListItem, Label, Text, ValueHelpDelegate] = aModules;
					const sId = mSettings && mSettings.id;

					const oModel = new JSONModel({
						number: 1,
						currency: "EUR",
						items:[{text: "Euro", key: "EUR", additionalText: "Euro"},
								{text: "US Dollar", key: "USD", additionalText: "US-Dollar"},
								{text: "Japan Yen", key: "JPY", additionalText: "Japan-Yen"}]
					});
					ValueHelpDelegate.isSearchSupported = () => true; // fake it

					// test with Typeahead as ValueHelp is not tested stand-alone
					const oItemTemplate = new ColumnListItem({
						type: "Active",
						cells: [new Text({text: "{key}"}),
								new Text({text: "{text}"}),
								new Text({text: "{additionalText}"})]
					});
					const oMTable = new MTable(sId + "VH1-MTable", {
						keyPath: "key",
						descriptionPath: "text",
						table: new Table(sId + "VH1-Table", {
							width: "26rem",
							columns: [ new Column({header: new Label({text: "Id"})}),
										new Column({header: new Label({text: "Text"})}),
										new Column({header: new Label({text: "Info"})})],
							items: {path: "/items", template: oItemTemplate}
						})
					});
					const oPopover = new Popover(sId + "VH1-Pop", {
						title: "Title",
						content: oMTable
					});
					const oValueHelp = new ValueHelp(sId + "VH1", {
						typeahead: oPopover
					});

					const oField = new Field(sId, {
						value: {parts: [{path: "/number", type: new FloatType()}, {path: "/currency", type: new StringType()}], type: new CurrencyType()},
						additionalValue: undefined,
						display: FieldDisplay.Value,
						editMode: FieldEditMode.Editable,
						multipleLines: false,
						valueHelp: oValueHelp.getId(),
						dependents: [oValueHelp, oItemTemplate]
					});
					oField.setModel(oModel);
					// configure the Field und ValueHelp faking somme calls what would be triggered by opening
					const oEvent = {
						type: "focusin",
						srcControl: oField,
						target: null, // as not rendered, but Event needs to defined for check
						currentTarget: null,
						isMarked: () => {return false;}
					};
					oField.onfocusin(oEvent); // to connect ValueHelp
					oMTable.getContent(); // to create internal controls
					oPopover.getContainerControl(); // to create internal controls
					oValueHelp.open(true); // fake typeahead
					return oField;
				},
				properties: {
					value: GenericTestCollection.ExcludeReason.OnlyChangeableViaBinding, // as tested with binding
					additionalValue: GenericTestCollection.ExcludeReason.OnlyChangeableViaBinding, // makes no sense with Currency
					dataType: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeFormatOptions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeConstraints: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					conditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					maxConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				aggregations: {
					content: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					contentDisplay: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					contentEdit: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					fieldInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test standard content
					dependents: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.FilterField": {
				create: async (FilterField, mSettings) => { // use DynamicDateRange as standard text is tested with FieldBase
					const aModules = await fnRequire(["sap/ui/mdc/enums/FieldDisplay", "sap/ui/mdc/enums/FieldEditMode", "sap/ui/mdc/field/FieldBaseDelegate", "sap/m/DynamicDateRange", "sap/ui/mdc/condition/OperatorDynamicDateOption", "sap/ui/mdc/field/DynamicDateRangeConditionsType", "sap/m/library", "sap/m/DynamicDateFormat", "sap/ui/model/type/Date"]);
					const sId = mSettings && mSettings.id;
					return new FilterField(sId, {
						dataType: 'sap.ui.model.type.Date',
						display: aModules[0].Value,
						editMode: aModules[1].Editable,
						multipleLines: false,
						maxConditions: 1
					});
				},
				properties: {
					dataType: "sap.ui.model.type.Date",
					dataTypeFormatOptions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeConstraints: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					conditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					operators: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					maxConditions: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				aggregations: {
					content: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					contentDisplay: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					contentEdit: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					fieldInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings // we want to test standard content
				}
			},
			"sap.ui.mdc.MultiValueField": {
				create: async (MultiValueField, mSettings) => {
					const aModules = await fnRequire(["sap/ui/model/json/JSONModel", "sap/ui/model/type/String", "sap/ui/mdc/enums/FieldDisplay", "sap/ui/mdc/enums/FieldEditMode", "sap/ui/mdc/field/MultiValueFieldItem", "sap/ui/mdc/ValueHelp", "sap/ui/mdc/valuehelp/Dialog", "sap/ui/mdc/valuehelp/content/MTable", "sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/Label", "sap/m/Text", "sap/ui/mdc/valuehelp/content/Conditions", "sap/ui/mdc/ValueHelpDelegate", "sap/ui/mdc/field/MultiValueFieldDelegate", "sap/ui/mdc/field/FieldMultiInput", "sap/m/ScrollContainer", "sap/ui/layout/FixFlex", "sap/ui/mdc/valuehelp/FilterBar", "sap/ui/mdc/valuehelp/FilterBarDelegate", "sap/ui/fl/library"]);
					const [JSONModel, StringType, FieldDisplay, FieldEditMode, MultiValueFieldItem, ValueHelp, Dialog, MTable, Table, Column, ColumnListItem, Label, Text, Conditions, ValueHelpDelegate] = aModules;
					const sId = mSettings && mSettings.id;

					const oModel = new JSONModel({
						items:[{text: "Item 1", key: "I1", additionalText: "Text 1"},
								{text: "Item 2", key: "I2", additionalText: "Text 2"},
								{text: "X-Item 3", key: "I3", additionalText: "Text 3"}]
					});
					ValueHelpDelegate.isSearchSupported = () => true; // fake it

					// test with Dialog as ValueHelp is not tested stand-alone
					const oVHItemTemplate = new ColumnListItem({
						type: "Active",
						cells: [new Text({text: "{key}"}),
								new Text({text: "{text}"}),
								new Text({text: "{additionalText}"})]
					});
					const oMTable = new MTable(sId + "VH1-MTable", {
						keyPath: "key",
						descriptionPath: "text",
						table: new Table(sId + "VH1-Table", {
							width: "26rem",
							columns: [ new Column({header: new Label({text: "Id"})}),
										new Column({header: new Label({text: "Text"})}),
										new Column({header: new Label({text: "Info"})})],
							items: {path: "/items", template: oVHItemTemplate}
						})
					});
					const oDialog = new Dialog(sId + "VH1-Dia", {
						title: "Title",
						content: [oMTable, new Conditions(sId + "VH1-Cond", {label: "Label"})]
					});
					const oValueHelp = new ValueHelp(sId + "VH1", {
						dialog: oDialog
					});

					const oItemTemplate = new MultiValueFieldItem(sId + "I1", {
						key: {path: "key", type: new StringType({}, {maxLength: 1000})},
						description: {path: "text", type: new StringType()}
					});
					const oField = new MultiValueField(sId, {
						items: {path: "/items", template: oItemTemplate},
						display: FieldDisplay.Value,
						editMode: FieldEditMode.Editable,
						multipleLines: false,
						maxConditions: -1,
						valueHelp: oValueHelp.getId(),
						dependents: [oValueHelp, oVHItemTemplate]
					});
					oField.setModel(oModel);
					// configure the Field und ValueHelp faking somme calls what would be triggered by opening
					const oEvent = {
						type: "focusin",
						srcControl: oField,
						target: null, // as not rendered, but Event needs to defined for check
						currentTarget: null,
						isMarked: () => {return false;}
					};
					oField.onfocusin(oEvent); // to connect ValueHelp
					oMTable.getContent(); // to create internal controls
					oDialog.getContainerControl(); // to create internal controls
					oValueHelp.open(false);
					const oPromise = new Promise(function(fnResolve, fnReject) {
						setTimeout(function() { // wait for resolving promise and Dialog started to open
							setTimeout(function() { // wait until Dialog has opened (has some animation duration)
								fnResolve();
							}, 301);
						}, 0);
					});
					await oPromise;
					return oField;
				},
				properties: {
					dataType: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeFormatOptions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeConstraints: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					conditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					maxConditions: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				aggregations: {
					content: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					contentDisplay: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					contentEdit: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test creation of internal content
					fieldInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings, // we want to test standard content
					items: GenericTestCollection.ExcludeReason.OnlyChangeableViaBinding // as tested with binding
				}
			},
			"sap.ui.mdc.valuehelp.base.DefineConditionPanel": {
				create: async (DefineConditionPanel, mSettings) => {
					const aModules = await fnRequire(["sap/ui/mdc/field/FieldBaseDelegate", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enums/OperatorName", "sap/ui/model/type/String"]);
					const sId = mSettings && mSettings.id;
					const oDataType = new aModules[3]();
					const oConfig = {
							dataType: oDataType,
							maxConditions: -1,
							delegate: aModules[0]
					};

					const oDCP = new DefineConditionPanel(sId, {
						conditions: [aModules[1].createCondition(aModules[2].EQ, ["Test1"]),
						aModules[1].createCondition(aModules[2].BT, ["A", "Z"])],
						config: oConfig
					});

					const oPromise = new Promise(function(fnResolve, fnReject) {
						setTimeout(function() { // wait until Fields for Conditions are created
							fnResolve();
						}, 0);
					});
					await oPromise;

					return oDCP;
				},
				properties: {
					conditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					config: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				},
				aggregations: {
				}
			},
			"sap.ui.mdc.ValueHelp": {
				properties: {
					conditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.Chart": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					sortConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					filterConditions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					propertyInfo: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			}
		}
	});

	return oConfig;
});