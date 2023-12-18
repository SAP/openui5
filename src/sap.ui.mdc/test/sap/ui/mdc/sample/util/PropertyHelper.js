sap.ui.require([
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/cssgrid/CSSGrid",
	"sap/ui/codeeditor/CodeEditor",
	"sap/m/Label",
	"sap/m/Title",
	"sap/m/Text",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/ComboBox",
	"sap/m/FlexItemData",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Boolean",
	"sap/ui/core/Item",
	"sap/ui/core/Core"
], function(
	JSONModel,
	CSSGrid,
	CodeEditor,
	Label,
	Title,
	Text,
	OverflowToolbar,
	ToolbarSpacer,
	Button,
	CheckBox,
	ComboBox,
	FlexItemData,
	Page,
	App,
	IconTabBar,
	IconTabFilter,
	Table,
	TreeTable,
	Column,
	StringType,
	BooleanType,
	Item,
	Core
) {
	"use strict";

	const aKnownPropertyHelperClasses = [
		"sap.ui.mdc.util.PropertyHelper",
		"sap.ui.mdc.table.PropertyHelper",
		"sap.ui.mdc.table.V4AnalyticsPropertyHelper",
		"sap.ui.mdc.chart.PropertyHelper",
		"sap.ui.mdc.filterbar.PropertyHelper",
		"sap.ui.mdc.p13n.PropertyHelper"
	];

	function stringify(vValue) {
		return JSON.stringify(vValue, null, 4);
	}

	Core.ready(() => {
		var aInitialPropertyInfos = [
			{
				name: "PropertyA",
				label: "Property A",
				dataType: "String"
			}, {
				name: "PropertyB",
				label: "Property B",
				visible: false,
				path: "blub",
				dataType: "String",
				maxConditions: 2,
				group: "groupA",
				groupLabel: "Group A"
			}
		];
		var mInitialAdditionalAttributesMetadata = {
			filterable: true,
			sortable: true,
			propertyInfos: true,
			additionalAttribute: {type: "string", "default": {value: "default value"}}
		};
		var oSettingsModel = new JSONModel({helperSettingsEnabled: true});
		var oPropertyInfosInput = new CodeEditor({
			type: "json"
		}).setValue(stringify(aInitialPropertyInfos));
		var oInputLayout = new CSSGrid({
			items: [
				new OverflowToolbar({
					content: [
						new Title({text: "PropertyInfo Input"}),
						new ToolbarSpacer(),
						new Button({
							text: "Reset",
							press: function() {
								oPropertyInfosInput.setValue(stringify(aInitialPropertyInfos));
								savePropertyInfos();
							}
						}),
						new Button({
							text: "Save",
							press: function() {
								savePropertyInfos();
							},
							enabled: false
						})
					]
				}),
				oPropertyInfosInput
			],
			gridTemplateRows: "auto 1fr"
		});
		var oPropertyHelperClassInput = new ComboBox({
			value: "sap.ui.mdc.util.PropertyHelper",
			items: {
				path: "/",
				template: new Item({
					text: {
						path: ""
					}
				})
			},
			placeholder: "Path to PropertyHelper module",
			change: function(oEvent) {
				var sValue = oEvent.getParameter("value");
				oSettingsModel.setProperty("/helperSettingsEnabled", sValue === "sap.ui.mdc.util.PropertyHelper");
				updatePropertyOutput();
			},
			models: new JSONModel(aKnownPropertyHelperClasses)
		});
		var oAdditionalAttributesInput = new CodeEditor({
			type: "json",
			visible: "{/helperSettingsEnabled}"
		}).setValue(stringify(mInitialAdditionalAttributesMetadata));
		var oAttributeMetadataText = new Text({renderWhitespace: true});
		var oSettingsLayout = new CSSGrid({
			items: [
				new OverflowToolbar({
					content: [
						new Title({text: "PropertyHelper Settings"}),
						new ToolbarSpacer(),
						new Button({
							text: "Reset",
							press: function() {
								oPropertyHelperClassInput.setValue("sap.ui.mdc.util.PropertyHelper");
								oAdditionalAttributesInput.setValue(stringify(mInitialAdditionalAttributesMetadata));
								oSettingsModel.setProperty("/helperSettingsEnabled", true);
								savePropertyHelperSettings();
							}
						}),
						new Button({
							text: "Save",
							press: function() {
								savePropertyHelperSettings();
							},
							enabled: false
						})
					]
				}),
				new Text({text: "Class"}),
				oPropertyHelperClassInput,
				new Text({text: "Additional attribute metadata", visible: "{/helperSettingsEnabled}"}),
				oAdditionalAttributesInput,
				new Text({text: "Attribute metadata"}),
				new sap.m.ScrollContainer({content: oAttributeMetadataText, vertical: true})
			],
			gridTemplateRows: "auto auto auto auto 1fr {= ${/helperSettingsEnabled} ? 'auto 2fr' : ''}"
		});
		var oPropertyOutput = new CodeEditor({
			type: "json",
			editable: false
		});
		var oFullOutputCheckBox = new CheckBox({
			text: "Including non-enumerable"
		});
		var oOutputLayout = new CSSGrid({
			items: [
				new OverflowToolbar({
					content: [
						new Title({text: "PropertyHelper#getProperties"}),
						oFullOutputCheckBox,
						new ToolbarSpacer(),
						new Button({
							text: "Update",
							press: function() {
								updatePropertyOutput();
							},
							type: "Emphasized"
						})
					]
				}),
				oPropertyOutput
			],
			gridTemplateRows: "auto 1fr"
		});
		var oApp = new App({
			initialPage: window.location.hash === "#AttributeOverview" ? "AttributeOverview" : "TestPage",
			navigate: function(oEvent) {
				window.location.hash = oEvent.getParameter("toId") === "AttributeOverview" ? "AttributeOverview" : "";
			},
			models: new JSONModel(),
			pages: [
				new Page({
					id: "TestPage",
					enableScrolling: false,
					title: "Test Page",
					headerContent: new sap.m.Button({
						text: "Attribute Overview",
						press: function() {
							oApp.to("AttributeOverview", "slide");
						}
					}),
					content: new CSSGrid({
						items: [oInputLayout, oSettingsLayout, oOutputLayout],
						gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
						gridAutoRows: "100%",
						models: oSettingsModel
					}).addEventDelegate({
						onAfterRendering: function(oEvent) {
							oEvent.srcControl.getDomRef().style.height = "100%";
						}
					})
				}),
				new Page({
					id: "AttributeOverview",
					title: "Attribute Overview",
					headerContent: new sap.m.Button({
						text: "Test Page",
						press: function() {
							oApp.to("TestPage", "slide");
						}
					}),
					enableScrolling: false,
					content: new IconTabBar({
						stretchContentHeight: true,
						items: [
							new IconTabFilter({
								text: "Tree view",
								content: new TreeTable({
									id: "AttributeMetadataTreeTable",
									rowMode: "Auto",
									extension: [
										new OverflowToolbar({
											content: [
												new Title("TreeTableTitle", {text: "Attribute Tree"}),
												new ToolbarSpacer(),
												new Button({
													icon: "sap-icon://expand-all",
													press: function() {
														Core.byId("AttributeMetadataTreeTable").expandToLevel(10);
													}
												}),
												new Button({
													icon: "sap-icon://collapse-all",
													press: function() {
														Core.byId("AttributeMetadataTreeTable").collapseAll();
													}
												})
											]
										})
									],
									rows: {
										path: "/tree",
										parameters: {
											arrayNames: ["attributes"]
										}
									},
									columns: [
										new	Column({
											label: new Label({text: "Name"}),
											template: new Text({text: "{name}", wrapping: false}),
											sortProperty: "name",
											filterProperty: "name",
											width: "350px",
											autoResizable: true
										}),
										new	Column({
											label: new Label({text: "Mandatory"}),
											template: new Text({text: "{mandatory}", wrapping: false}),
											sortProperty: "mandatory",
											filterProperty: "mandatory",
											filterType: new BooleanType(),
											width: "100px",
											autoResizable: true
										}),
										new	Column({
											label: new Label({text: "Type"}),
											template: new Text({text: "{type}", wrapping: false}),
											sortProperty: "type",
											filterProperty: "type",
											width: "150px",
											autoResizable: true
										}),
										new	Column({
											multiLabels: [
												new Label({text: "Default"}),
												new Label({text: "Value"})
											],
											headerSpan: 2,
											template: new Text({
												text: {
													path: "default/value",
													formatter: stringify
												},
												wrapping: false
											}),
											sortProperty: "default/value",
											width: "170px",
											autoResizable: true
										}),
										new	Column({
											multiLabels: [
												new Label(),
												new Label({text: "Ignore if 'null'"})
											],
											template: new Text({text: "{default/ignoreIfNull}", wrapping: false}),
											sortProperty: "default/ignoreIfNull",
											filterProperty: "default/ignoreIfNull",
											filterType: new BooleanType(),
											width: "110px",
											autoResizable: true
										}),
										new	Column({
											multiLabels: [
												new Label({text: "In complex property"}),
												new Label({text: "Allowed"})
											],
											headerSpan: 2,
											template: new Text({text: "{inComplexProperty/allowed}", wrapping: false}),
											sortProperty: "inComplexProperty/allowed",
											filterProperty: "inComplexProperty/allowed",
											filterType: new BooleanType(),
											width: "80px",
											autoResizable: true
										}),
										new	Column({
											multiLabels: [
												new Label(),
												new Label({text: "Value if not allowed"})
											],
											template: new Text({
												text: {
													path: "inComplexProperty/valueIfNotAllowed",
													formatter: stringify
												},
												wrapping: false
											}),
											sortProperty: "inComplexProperty/valueIfNotAllowed",
											width: "150px",
											autoResizable: true
										})
									],
									ariaLabelledBy: ["TreeTableTitle"],
									selectionMode: "None",
									layoutData: new FlexItemData({growFactor: 1})
								})
							}),
							new IconTabFilter({
								text: "List view",
								content: new Table({
									id: "AttributeMetadataTable",
									rowMode: "Auto",
									extension: [
										new OverflowToolbar({
											content: [
												new Title("TableTitle", {text: "Attribute List"})
											]
										})
									],
									rows: {
										path: "/list"
									},
									columns: [
										new Column("ClassName", {
											label: new Label({text: "Class name"}),
											template: new Text({text: "{className}", wrapping: false}),
											sortProperty: "className",
											filterProperty: "className",
											width: "350px",
											autoResizable: true
										})
									],
									ariaLabelledBy: ["TableTitle"],
									selectionMode: "None",
									layoutData: new FlexItemData({growFactor: 1})
								}).addEventDelegate({
									onBeforeRendering: function(oEvent) {
										var oTable = oEvent.srcControl;
										if (oTable.getColumns().length === 1) {
											Core.byId("AttributeMetadataTreeTable").getColumns().forEach(function(oColumn) {
												oTable.addColumn(oColumn.clone());
											});
										}
									}
								})
							})
						]
					})
				})
			]
		});

		oApp.placeAt("main");

		window.addEventListener('hashchange', function() {
			oApp.to(window.location.hash === "#AttributeOverview" ? "AttributeOverview" : "TestPage");
		}, false);

		function loadPropertyHelper(sClassName) {
			return new Promise(function(resolve, reject) {
				sap.ui.require([sClassName.trim().replace(/\./g, "/")], resolve, reject);
			});
		}

		function updatePropertyOutput() {
			var sPropertyInfos = oPropertyInfosInput.getValue();
			var sAdditionalAttributes = oAdditionalAttributesInput.getValue();
			var bFullOutput = oFullOutputCheckBox.getSelected();
			var aPropertyInfos = sPropertyInfos ? JSON.parse(sPropertyInfos) : undefined;
			var mAdditionalAttributesMetadata = sAdditionalAttributes ? JSON.parse(sAdditionalAttributes) : undefined;

			clearError();

			loadPropertyHelper(oPropertyHelperClassInput.getValue()).then(function(PropertyHelper) {
				try {
					let oPropertyHelper;

					if (oSettingsModel.getProperty("/helperSettingsEnabled")) {
						oPropertyHelper = new PropertyHelper(aPropertyInfos, null, mAdditionalAttributesMetadata);
					} else {
						oPropertyHelper = new PropertyHelper(aPropertyInfos);
					}

					if (bFullOutput) {
						oPropertyOutput.setValue(stringify(oPropertyHelper.getProperties().map(getFullPropertyJSON)));
					} else {
						oPropertyOutput.setValue(stringify(oPropertyHelper.getProperties()));
					}

					oAttributeMetadataText.setText(stringify(oPropertyHelper._getAttributeMetadata()));

					oPropertyHelper.destroy();
				} catch (e) {
					oPropertyOutput.setValue();
					showError(e.message);
					throw e;
				}
			}).catch(function(e) {
				showError(e.message);
				throw e;
			});
		}

		function getFullPropertyJSON(oProperty) {
			var oJSON = {};
			var aFunctionKeys = [];
			var aReferenceKeys = [];
			var aOrderedKeys = [];

			Object.getOwnPropertyNames(oProperty).forEach(function(sKey) {
				if (typeof oProperty[sKey] === "function") {
					aFunctionKeys.push(sKey);
				} else if (sKey.startsWith("_")) {
					aReferenceKeys.push(sKey);
				} else {
					aOrderedKeys.push(sKey);
				}
			});

			aReferenceKeys.forEach(function(sKey) {
				aOrderedKeys.splice(aOrderedKeys.indexOf(sKey.substring(1)) + 1, 0, sKey);
			});

			aOrderedKeys.forEach(function(sKey) {
				oJSON[sKey] = oProperty[sKey];
			});

			aFunctionKeys.forEach(function(sKey) {
				oJSON[sKey + "()"] = oProperty[sKey]();
			});

			return oJSON;
		}

		function loadPropertyHelperMetadata() {
			Promise.all(aKnownPropertyHelperClasses.map(function(sPropertyHelperClass) {
				return loadPropertyHelper(sPropertyHelperClass);
			})).then(function(aPropertyHelpers) {
				var aTreeData = [];

				aPropertyHelpers.forEach(function(PropertyHelper) {
					var sClassName = PropertyHelper.getMetadata().getName();
					var mAttributeMetadata = new PropertyHelper([])._getAttributeMetadata();
					var oAttributeTree = {};

					aTreeData.push(oAttributeTree);
					createAttributeMetadataTree(oAttributeTree, mAttributeMetadata, sClassName);
				});

				oApp.getModel().setData({
					tree: aTreeData,
					list: createAttributeMetadataList(aTreeData)
				});
			});
		}

		function createAttributeMetadataTree(oData, mMetadata, sClassName) {
			if (sClassName != null) {
				oData.name = sClassName;
			}

			for (var sAttribute in mMetadata) {
				var mAttribute = mMetadata[sAttribute];

				if (!oData.attributes) {
					oData.attributes = [];
				}

				if (typeof mAttribute.type === "object") {
					var oEntry = Object.assign({}, mAttribute, {
						name: sAttribute,
						type: "<<Complex Type>>"
					});
					oData.attributes.push(oEntry);
					createAttributeMetadataTree(oEntry, mAttribute.type);
				} else {
					oData.attributes.push(Object.assign({}, mAttribute, {
						name: sAttribute
					}));
				}
			}
		}

		function createAttributeMetadataList(aTreeData) {
			return JSON.parse(JSON.stringify(aTreeData)).flatMap(function(oAttribute) {
				function getAllChildAttributes(oAttribute) {
					var aChildAttributes = [];

					if (!oAttribute.attributes) {
						return aChildAttributes;
					}

					oAttribute.attributes.forEach(function(oChildAttribute) {
						oChildAttribute.className = oAttribute.className;

						if (oAttribute.name) {
							oChildAttribute.name = oAttribute.name + "." + oChildAttribute.name;
						}

						aChildAttributes.push(oChildAttribute);
						aChildAttributes = aChildAttributes.concat(getAllChildAttributes(oChildAttribute));
					});

					return aChildAttributes;
				}

				oAttribute.className = oAttribute.name;
				delete oAttribute.name;

				return getAllChildAttributes(oAttribute);
			});
		}

		function clearError() {
			document.getElementById("error").innerText = "";
		}

		function showError(sMessage) {
			document.getElementById("error").innerText = sMessage.split("\n")[0];
		}

		function savePropertyInfos() {

		}

		function savePropertyHelperSettings() {

		}

		updatePropertyOutput();
		loadPropertyHelperMetadata();
	});
});