sap.ui.define("test-resources/sap/ui/table/Settings", [
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/util/deepExtend",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Dialog",
	"sap/m/HBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MessageToast",
	"sap/m/Select",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/VBox",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/core/Locale",
	"sap/ui/core/Popup",
	"sap/ui/core/Title",
	"sap/ui/core/message/MessageType",
	"sap/ui/layout/form/SimpleForm",
	// layout used for SimpleForm
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Column",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/RowSettings",
	"sap/ui/table/Table",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/unified/MenuTextFieldItem",
	"sap/m/plugins/CellSelector",
	"sap/ui/core/date/UI5Date"
], function(
	Log,
	Localization,
	deepExtend,
	Button,
	CheckBox,
	Dialog,
	HBox,
	Input,
	Label,
	mobileLibrary,
	Menu,
	MenuItem,
	MessageToast,
	Select,
	Text,
	Toolbar,
	VBox,
	oCore,
	Element,
	Item,
	Locale,
	Popup,
	Title,
	MessageType,
	SimpleForm,
	ResponsiveGridLayout,
	JSONModel,
	Column,
	MultiSelectionPlugin,
	ODataV4Selection,
	RowAction,
	RowActionItem,
	RowSettings,
	Table,
	RowModeType,
	TableUtils,
	UnifiedMenu,
	UnifiedMenuItem,
	MenuTextFieldItem,
	CellSelector,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.core.Popup.Dock
	const Dock = Popup.Dock;

	// shortcut for sap.m.ButtonType
	const ButtonType = mobileLibrary.ButtonType;

	const TABLESETTINGS = window.TABLESETTINGS = {};

	// Test data
	let i; let l;

	TABLESETTINGS.listTestData = [
		{lastName: "Dente", name: "Alfred", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-05-06", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Success"},
		{lastName: "Friese", name: "Andrew", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", objStatusText: "Name partly OK Text", objStatusTitle: "Name partly OK Title", objStatusState: "Warning", highlightState: "Warning", navigatedState: true},
		{lastName: "Mann", name: "Sarah", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "images/Person.png", gender: "female", rating: 3, money: 1345.212, birthday: "1987-04-01", currency: "EUR", objStatusText: "Name not OK Text", objStatusTitle: "Name not OK Title", objStatusState: "Error", highlightState: "Error"},
		{lastName: "Berry", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 4, money: 1.1, birthday: "2001-05-09", currency: "USD", objStatusText: "Status unknown Text", objStatusTitle: "Status unknown Title", objStatusState: "None", highlightState: "Information"},
		{lastName: "Open", name: "Jenny", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 2, money: 55663.1, birthday: "1953-03-03", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "None", highlightState: "None"},
		{lastName: "Dewit", name: "Stanley", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 34.23, birthday: "1957-02-07", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "None"},
		{lastName: "Zar", name: "Louise", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 1, money: 123, birthday: "1965-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Success"},
		{lastName: "Burr", name: "Timothy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 678.45, birthday: "1978-05-08", currency: "DEM", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Success"},
		{lastName: "Hughes", name: "Trisha", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 5, money: 123.45, birthday: "1968-05-06", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "None"},
		{lastName: "Town", name: "Mike", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 3, money: 678.90, birthday: "1968-06-06", currency: "JPY", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Information"},
		{lastName: "Case", name: "Josephine", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 3, money: 8756.2, birthday: "1968-03-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Success"},
		{lastName: "Time", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 4, money: 836.4, birthday: "1968-04-02", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Warning"},
		{lastName: "Barr", name: "Susan", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 2, money: 9.3, birthday: "1968-03-02", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Error"},
		{lastName: "Poole", name: "Gerry", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 1, money: 6344.21, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Error"},
		{lastName: "Ander", name: "Corey", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 5, money: 563.2, birthday: "1968-04-01", currency: "JPY", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Success"},
		{lastName: "Early", name: "Boris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 3, money: 8564.4, birthday: "1968-07-07", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "None"},
		{lastName: "Noring", name: "Cory", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "female", rating: 4, money: 3563, birthday: "1968-01-01", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "None"},
		{lastName: "O'Lantern", name: "Jacob", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 2, money: 5.67, birthday: "1968-06-09", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Error", highlightState: "Indication01"},
		{lastName: "Tress", name: "Matthew", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "None"},
		{lastName: "Summer", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 5.67, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Information"}
	];

	const aOrgData = deepExtend([], TABLESETTINGS.listTestData);
	for (i = 0; i < 9; i++) {
		TABLESETTINGS.listTestData = TABLESETTINGS.listTestData.concat(deepExtend([], aOrgData));
	}

	for (i = 0, l = TABLESETTINGS.listTestData.length; i < l; i++) {
		TABLESETTINGS.listTestData[i].lastName += " - " + (i + 1);
		TABLESETTINGS.listTestData[i].birthdayDate = UI5Date.getInstance(TABLESETTINGS.listTestData[i].birthday);
	}

	TABLESETTINGS.treeTestData = {
		root: {
			name: "root",
			description: "moep moep",
			checked: false,
			highlightState: "Success",
			0: {
				name: "Rock",
				description: "Rockmusik",
				checked: true,
				highlightState: "Information",
				0: { //children as object references
					name: "Rock'n'Roll",
					description: "late 1940s",
					checked: true,
					highlightState: "Warning",
					children: [ // Children inside an array
						{
							name: "Elvis Presley",
							description: "*1935 - +1977",
							checked: true,
							highlightState: "Error"
						},
						{
							name: "Chuck Berry",
							description: "*1926",
							checked: true,
							highlightState: "None"
						}
					],
					"flup": { // mixed with arrays and objects
						name: "Keith Richards",
						description: "*1943",
						checked: true,
						highlightState: "None"
					}
				},
				1: {
					name: "Heavy Metal",
					description: "late 1960s",
					checked: true,
					highlightState: "Success",
					0: {
						name: "Black Sabbath",
						description: "founded 1968",
						checked: true,
						highlightState: "Success"
					},
					1: {
						name: "Judas Priest",
						description: "founded 1969",
						checked: true,
						highlightState: "None"
					}
				},
				2: {
					name: "Grunge",
					description: "Mid-1980s",
					checked: true,
					highlightState: "None",
					0: {
						name: "Nirvana",
						description: "1987",
						checked: true,
						highlightState: "None"
					},
					1: {
						name: "Soundgarden",
						description: "1984",
						checked: true,
						highlightState: "None"
					},
					2: {
						name: "Alice in Chains",
						description: "1987",
						checked: true,
						highlightState: "Success"
					}
				}
			},
			1: {
				name: "Hip-Hop",
				description: "Hip-Hop",
				checked: true,
				highlightState: "Information",
				0: {
					name: "Old-School",
					description: "Mid 1970s",
					checked: true,
					highlightState: "Information",
					0: {
						name: "The Sugarhill Gang",
						description: "1973",
						checked: true,
						highlightState: "None"
					},
					1: {
						name: "Grandmaster Flash and the Furious Five",
						description: "1978",
						checked: true,
						highlightState: "Error"
					}
				},
				1: {
					name: "Rap-Rock",
					description: "early 1980s",
					checked: true,
					highlightState: "Error",
					0: {
						name: "Run-D.M.C.",
						description: "1981 - 2002",
						checked: true,
						highlightState: "Warning"
					},
					1: {
						name: "Beastie Boys",
						description: "1981 - 2012",
						checked: true,
						highlightState: "Warning"
					}
				},
				2: {
					name: "Gangsta rap",
					description: "mid 1980s",
					checked: true,
					highlightState: "Error",
					0: {
						name: "2Pac",
						description: "1971 - 1996",
						checked: true,
						highlightState: "Success"
					},
					1: {
						name: "N.W.A",
						description: "1986 - 1991, 1998 - 2002",
						checked: true,
						highlightState: "Success"
					}
				}
			},
			2: {
				name: "Swing/Big Band",
				description: "1930s",
				checked: true,
				highlightState: "Warning",
				0: {
					name: "Frank Sinatra",
					description: "1915 - 1998",
					checked: true,
					highlightState: "None"
				},
				1: {
					name: "Count Basie",
					description: "1904 - 1984",
					checked: true,
					highlightState: "None"
				}
			},
			3: {
				name: "Some Item",
				description: "None",
				checked: true,
				highlightState: "Success"
			},
			4: {
				name: "Some other Item",
				description: "None",
				checked: true,
				highlightState: "Error"
			}
		}
	};

	for (i = 0; i < 20; i++) {
		TABLESETTINGS.treeTestData.root[4][i] = {
			name: "subitem4-" + i,
			description: "subitem4-" + i + " description",
			checked: false,
			highlightState: "None"
		};
	}

	// Settings

	const SETTING_TEMPLATE_ROWMODE_ROWCOUNT = {
		hidden: true,
		text: "Row count",
		input: true,
		value: function(oTable) {
			if (TableUtils.isA(oTable.getRowMode(), "sap.ui.table.rowmodes.RowMode")
				&& oTable.getRowMode().getMetadata().hasProperty("rowCount")) {
				return oTable.getRowMode().getRowCount();
			}
		},
		action: function(oTable, sValue) {
			oTable.getRowMode().setRowCount(parseInt(sValue) || 0);
		}
	};

	const SETTING_TEMPLATE_ROWMODE_FIXEDTOPROWS = {
		hidden: true,
		text: "Fixed Top Rows",
		input: true,
		value: function(oTable) {
			if (TableUtils.isA(oTable.getRowMode(), "sap.ui.table.rowmodes.RowMode")
				&& oTable.getRowMode().getMetadata().hasProperty("fixedTopRows")) {
				return oTable.getRowMode().getFixedTopRowCount();
			}
		},
		action: function(oTable, sValue) {
			oTable.getRowMode().setFixedTopRowCount(parseInt(sValue) || 0);
		}
	};

	const SETTING_TEMPLATE_ROWMODE_FIXEDBOTTOMROWS = {
		hidden: true,
		text: "Fixed Bottom Rows",
		input: true,
		value: function(oTable) {
			if (TableUtils.isA(oTable.getRowMode(), "sap.ui.table.rowmodes.RowMode")
				&& oTable.getRowMode().getMetadata().hasProperty("fixedBottomRows")) {
				return oTable.getRowMode().getFixedBottomRowCount();
			}
		},
		action: function(oTable, sValue) {
			oTable.getRowMode().setFixedBottomRowCount(parseInt(sValue) || 0);
		}
	};

	const SETTING_TEMPLATE_ROWMODE_HIDEEMPTYROWS = {
		hidden: true,
		text: "Hide empty rows",
		input: "boolean",
		value: function(oTable) {
			if (TableUtils.isA(oTable.getRowMode(), "sap.ui.table.rowmodes.RowMode")
				&& oTable.getRowMode().getMetadata().hasProperty("hideEmptyRows")) { // TODO: "hideEmptyRows" in oTable.getMetadata().getAllPrivateAggregations()
				return oTable.getRowMode().getHideEmptyRows();
			}
		},
		action: function(oTable, bValue) {
			oTable.getRowMode().setHideEmptyRows(bValue);
		}
	};

	const DEFAULTACTIONS = {
		I18N: {
			text: "Internationalization",
			group: {
				RTL: {
					text: "Right to Left",
					value: function() {
						return Localization.getRTL();
					},
					input: "boolean",
					action: function(oTable, bValue) {
						Localization.setRTL(bValue);
					}
				},
				LANG: {
					text: "Language (table related localized texts only)",
					value: function() {
						return new Locale(Localization.getLanguageTag()).getLanguage().toUpperCase();
					},
					choice: {
						EN: {
							text: "en",
							action: function(oTable) {
								Localization.setLanguage("en");
							}
						},
						DE: {
							text: "de",
							action: function(oTable) {
								Localization.setLanguage("de");
							}
						},
						FR: {
							text: "fr",
							action: function(oTable) {
								Localization.setLanguage("fr");
							}
						}
					}
				}
			}
		},
		ROWMODES: {
			text: "Row mode",
			group: {
				ROWMODE: {
					text: "Mode",
					selectedKey: "FIXED_ENUM",
					value: function(oTable) {
						const vRowMode = oTable.getRowMode();

						if (typeof vRowMode === "string") {
							return vRowMode.toUpperCase() + "_ENUM";
						} else {
							return vRowMode?.getMetadata().getName().split(".").pop().toUpperCase();
						}
					},
					choice: (() => {
						const mSettings = {};

						Object.keys(RowModeType).forEach((sType) => {
							function refreshUI(bIsEnum) {
								TABLESETTINGS.actions.ROWMODES.group.ROWMODE.selectedKey = sType.toUpperCase() + (bIsEnum ? "_ENUM" : "");

								for (const sKey in TABLESETTINGS.actions.ROWMODES.group) {
									if (sKey.startsWith("SETTING")) {
										TABLESETTINGS.actions.ROWMODES.group[sKey].hidden = true;
									}
									if (!bIsEnum && sKey.startsWith("SETTING_" + sType.toUpperCase())) {
										TABLESETTINGS.actions.ROWMODES.group[sKey].hidden = false;
									}
								}

								oSettingsMenu.removeAllContent();
								oSettingsMenu.addContent(initForm(TABLESETTINGS.actions));
							}

							mSettings[sType.toUpperCase()] = {
								text: sType,
								action: (oTable) => {
									sap.ui.require(["sap/ui/table/rowmodes/" + sType], function(RowMode) {
										oTable.destroyRowMode();
										oTable.setRowMode(new RowMode());
										refreshUI();
									});
								}
							};
							mSettings[sType.toUpperCase() + "_ENUM"] = {
								text: sType + " (enum)",
								action: (oTable) => {
									oTable.destroyRowMode();
									oTable.setRowMode(sType);
									refreshUI(true);
								}
							};
						});

						return mSettings;
					})()
				},
				SETTING_FIXED_ROWCOUNT: Object.assign({}, SETTING_TEMPLATE_ROWMODE_ROWCOUNT),
				SETTING_FIXED_FIXEDTOPROWS: Object.assign({}, SETTING_TEMPLATE_ROWMODE_FIXEDTOPROWS),
				SETTING_FIXED_FIXEDBOTTOMROWS: Object.assign({}, SETTING_TEMPLATE_ROWMODE_FIXEDBOTTOMROWS),
				SETTING_FIXED_HIDEEMPTYROWS: Object.assign({}, SETTING_TEMPLATE_ROWMODE_HIDEEMPTYROWS),
				SETTING_INTERACTIVE_ROWCOUNT: Object.assign({}, SETTING_TEMPLATE_ROWMODE_ROWCOUNT),
				SETTING_INTERACTIVE_FIXEDTOPROWS: Object.assign({}, SETTING_TEMPLATE_ROWMODE_FIXEDTOPROWS),
				SETTING_INTERACTIVE_FIXEDBOTTOMROWS: Object.assign({}, SETTING_TEMPLATE_ROWMODE_FIXEDBOTTOMROWS),
				SETTING_AUTO_FIXEDTOPROWS: Object.assign({}, SETTING_TEMPLATE_ROWMODE_FIXEDTOPROWS),
				SETTING_AUTO_FIXEDBOTTOMROWS: Object.assign({}, SETTING_TEMPLATE_ROWMODE_FIXEDBOTTOMROWS),
				SETTING_AUTO_HIDEEMPTYROWS: Object.assign({}, SETTING_TEMPLATE_ROWMODE_HIDEEMPTYROWS)
			}
		},
		SELECTION: {
			text: "Selection",
			group: {
				SELECTIONMODE: {
					text: "Selection Mode",
					value: function(oTable) {
						return oTable.getSelectionMode().toUpperCase();
					},
					choice: {
						NONE: {
							text: "None",
							action: function(oTable) {
								if (oTable._hasSelectionPlugin()) {
									oTable._getSelectionPlugin().setSelectionMode("None");
								} else {
									oTable.setSelectionMode("None");
								}
							}
						},
						SINGLE: {
							text: "Single",
							action: function(oTable) {
								if (oTable._hasSelectionPlugin()) {
									oTable._getSelectionPlugin().setSelectionMode("Single");
								} else {
									oTable.setSelectionMode("Single");
								}
							}
						},
						MULTITOGGLE: {
							text: "MultiToggle",
							action: function(oTable) {
								if (oTable._hasSelectionPlugin()) {
									oTable._getSelectionPlugin().setSelectionMode("MultiToggle");
								} else {
									oTable.setSelectionMode("MultiToggle");
								}
							}
						}
					}
				},
				SELECTIONBEHAVIOR: {
					text: "Selection Behavior",
					value: function(oTable) {
						return oTable.getSelectionBehavior().toUpperCase();
					},
					choice: {
						ROWSELECTOR: {
							text: "RowSelector",
							action: function(oTable) {
								oTable.setSelectionBehavior("RowSelector");
							}
						},
						ROW: {
							text: "Row",
							action: function(oTable) {
								oTable.setSelectionBehavior("Row");
							}
						},
						ROWONLY: {
							text: "RowOnly",
							action: function(oTable) {
								oTable.setSelectionBehavior("RowOnly");
							}
						}
					}
				},
				SELECTIONPLUGIN: {
					text: "Selection Plugin",
					value: function(oTable) {
						const oSelectionPlugin = oTable._getSelectionPlugin();
						const sName = oSelectionPlugin ? oSelectionPlugin.getMetadata().getName().split(".").pop().toUpperCase() : "NONE";
						return sName in this.choice ? sName : "NONE";
					},
					choice: {
						NONE: {
							text: "None",
							action: function(oTable) {
								oTable.destroyDependents();
							}
						},
						MULTISELECTIONPLUGIN: {
							text: "MultiSelection",
							action: function(oTable) {
								oTable.destroyDependents();
								const oPlugin = new MultiSelectionPlugin({
									limit: 20,
									enableNotification: true
								});
								oTable.addDependent(oPlugin);
								Element.getElementById("__select5").setSelectedKey(oPlugin.getSelectionMode().toUpperCase());
							}
						},
						ODATAV4SELECTION: {
							text: "ODataV4Selection",
							action: function(oTable) {
								oTable.destroyDependents();
								oTable.addDependent(new ODataV4Selection());
							}
						}
					}
				},
				CELLSELECTIONPLUGIN: {
					text: "Cell Selection Plugin",
					value: function(oTable) {
						const oPlugin = oTable.getDependents().find(function(oDependent) {
							return oDependent.isA("sap.m.plugins.CellSelector");
						});
						return oPlugin ? "CELLSELECTOR" : "NONE";
					},
					choice: {
						NONE: {
							text: "None",
							action: function(oTable) {
								const aDependents = oTable.getDependents();
								const oPlugin = aDependents.find(function(oDependent) {
									return oDependent.isA("sap.m.plugins.CellSelector");
								});
								oTable.removeDependent(oPlugin);
							}
						},
						CELLSELECTOR: {
							text: "Cell Selector",
							action: function(oTable) {
								oTable.addDependent(new CellSelector());
							}
						}
					}
				}
			}
		},
		SIZE: {
			text: "Sizing",
			group: {
				DENSITY: {
					text: "Density",
					value: function(oTable) {
						const sDensity = TableUtils.getContentDensity(oTable);
						if (!sDensity || sDensity.indexOf("sapUiSize") === -1) {
							return null;
						}
						return sDensity.substring(9, sDensity.length).toUpperCase();
					},
					choice: {
						COZY: {
							text: "Cozy",
							action: function(oTable) {
								setDensity("sapUiSizeCozy", oTable);
							}
						},
						COMPACT: {
							text: "Compact",
							action: function(oTable) {
								setDensity("sapUiSizeCompact", oTable);
							}
						},
						CONDENSED: {
							text: "Condensed",
							action: function(oTable) {
								setDensity("sapUiSizeCondensed", oTable);
							}
						}
					}
				}
			}
		},
		SCROLLING: {
			text: "Scroll Settings (private)",
			group: {
				LARGEDATA: {
					text: "Large Data Scrolling",
					value: function(oTable) {
						return oTable._bLargeDataScrolling;
					},
					input: "boolean",
					action: function(oTable, bValue) {
						oTable._bLargeDataScrolling = bValue;
					}
				},
				PIXELBASED: {
					text: "Pixel-Based Scrolling",
					value: function(oTable) {
						return oTable._bVariableRowHeightEnabled;
					},
					input: "boolean",
					action: function(oTable, bValue) {
						oTable._bVariableRowHeightEnabled = bValue;
						oTable.invalidate();
					}
				}
			}
		},
		COLUMNSETTINGS: {
			text: "Change Column Settings",
			action: function(oTable) {
				createAndOpenColumnDialog(oTable, TABLESETTINGS.actions.COLUMNSETTINGS.config);
			},
			config: {
				VISIBLE: {
					text: "Visible",
					input: "boolean",
					value: function(oColumn) {
						return oColumn.getVisible();
					},
					action: function(oColumn, vValue) {
						oColumn.setVisible(!!vValue);
					}
				},
				RESIZABLE: {
					text: "Resizable",
					input: "boolean",
					value: function(oColumn) {
						return oColumn.getResizable();
					},
					action: function(oColumn, vValue) {
						oColumn.setResizable(!!vValue);
					}
				},
				AUTORESIZABLE: {
					text: "Auto Resizable",
					input: "boolean",
					value: function(oColumn) {
						return oColumn.getAutoResizable();
					},
					action: function(oColumn, vValue) {
						oColumn.setAutoResizable(!!vValue);
					}
				},
				WIDTH: {
					text: "Width",
					input: true,
					value: function(oColumn) {
						return oColumn.getWidth();
					},
					action: function(oColumn, vValue) {
						oColumn.setWidth(vValue + "");
					}
				},
				MINWIDTH: {
					text: "Min-Width",
					input: true,
					value: function(oColumn) {
						return oColumn.getMinWidth();
					},
					action: function(oColumn, vValue) {
						oColumn.setMinWidth(parseInt(vValue) || 0);
					}
				}
			}
		},
		BUSY: {
			text: "Busy",
			value: function(oTable) {
				return oTable.getBusy();
			},
			input: "boolean",
			action: function(oTable, bValue) {
				oTable.setBusy(bValue);
			}
		},
		CELLFILTER: {
			text: "Cell Filter",
			value: function(oTable) {
				return oTable.getEnableCellFilter();
			},
			input: "boolean",
			action: function(oTable, bValue) {
				oTable.setEnableCellFilter(bValue);
			}
		},
		CONTEXTMENU: {
			text: "Custom Context Menu",
			value: function(oTable) {
				return !!oTable.getContextMenu();
			},
			input: "boolean",
			action: function(oTable, bValue) {
				if (bValue) {
					oTable.setContextMenu(
						new Menu({
							items: [
								new MenuItem({text: "{name}"})
							]
						})
					);
				} else {
					oTable.destroyContextMenu();
				}
			}
		},
		ALTERNATEROWCOLORS: {
			text: "Alternate Row Colors",
			value: function(oTable) {
				return oTable.getAlternateRowColors();
			},
			input: "boolean",
			action: function(oTable, bValue) {
				oTable.setAlternateRowColors(bValue);
			}
		},
		AREAS: {
			text: "Areas",
			group: {
				OVERLAY: {
					text: "Overlay",
					value: function(oTable) {
						return oTable.getShowOverlay();
					},
					input: "boolean",
					action: function(oTable, bValue) {
						oTable.setShowOverlay(bValue);
						if (bValue) {
							new Button({
								id: "HideOverlayButton",
								text: "Hide overlay",
								type: ButtonType.Emphasized,
								press: function(oEvent) {
									oTable.setShowOverlay(false);
									oEvent.getSource().destroy();
								}
							}).placeAt(oTable.getParent().getId(), "first");
						} else {
							Element.getElementById("HideOverlayButton").destroy();
						}
					}
				},
				NODATA: {
					text: "NoData State",
					setData: function(oTable, bClear) {
						if (bClear) {
							oTable.setModel(oEmptyModel);
						} else {
							oTable.setModel(TABLESETTINGS.model);
						}
					},
					value: function() {
						return TABLESETTINGS.actions.AREAS.group.NODATA.selectedKey;
					},
					selectedKey: "SHOWDATA",
					choice: {
						SHOWDATA: {
							text: "Show Data",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.NODATA.selectedKey = "SHOWDATA";
								switchNoData(oTable, "SHOWDATA");
							}
						},
						TEXT: {
							text: "Text Message",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.NODATA.selectedKey = "TEXT";
								switchNoData(oTable, "TEXT");
							}
						},
						CUSTOM: {
							text: "Custom Control Message",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.NODATA.selectedKey = "CUSTOM";
								switchNoData(oTable, "CUSTOM");
							}
						},
						EMPTYCELLS: {
							text: "Show Empty Cells",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.NODATA.selectedKey = "EMPTYCELLS";
								switchNoData(oTable, "EMPTYCELLS");
							}
						}
					}
				},
				FIXEDCOLUMNS: {
					text: "Fixed Columns",
					input: true,
					value: function(oTable) {
						return oTable.getFixedColumnCount();
					},
					action: function(oTable, sValue) {
						oTable.setFixedColumnCount(parseInt(sValue) || 0);
					}
				},
				ROWACTIONS: {
					text: "Row Actions",
					value: function() {
						return TABLESETTINGS.actions.AREAS.group.ROWACTIONS.selectedKey;
					},
					selectedKey: "NONE",
					choice: {
						NAVIGATION: {
							text: "Navigation",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.ROWACTIONS.selectedKey = "NAVIGATION";
								const oTemplate = new RowAction({items: [
									new RowActionItem({
										type: "Navigation",
										press: fnRowActionPress,
										visible: {
											path: "checked",
											formatter: function(bEnabled) {
												if (bEnabled === true || bEnabled === false) {
													return bEnabled;
												}
												return true;
											}
										}
									})
								]});
								switchRowActions(oTable, 1, oTemplate);
							}
						},
						NAVIGATIONDELETE: {
							text: "Navigation & Delete",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.ROWACTIONS.selectedKey = "NAVIGATIONDELETE";
								const oTemplate = new RowAction({items: [
									new RowActionItem({
										type: "Navigation",
										press: fnRowActionPress,
										visible: {
											path: "checked",
											formatter: function(bEnabled) {
												if (bEnabled === true || bEnabled === false) {
													return bEnabled;
												}
												return true;
											}
										}
									}),
									new RowActionItem({type: "Delete", press: fnRowActionPress})
								]});
								switchRowActions(oTable, 2, oTemplate);
							}
						},
						NAVIGATIONCUSTOM: {
							text: "Navigation & Custom",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.ROWACTIONS.selectedKey = "NAVIGATIONCUSTOM";
								const oTemplate = new RowAction({items: [
									new RowActionItem({
										type: "Navigation",
										press: fnRowActionPress,
										visible: {
											path: "checked",
											formatter: function(bEnabled) {
												if (bEnabled === true || bEnabled === false) {
													return bEnabled;
												}
												return true;
											}
										}
									}),
									new RowActionItem({icon: "sap-icon://edit", text: "Edit", press: fnRowActionPress})
								]});
								switchRowActions(oTable, 2, oTemplate);
							}
						},
						MULTI: {
							text: "Multiple Actions",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.ROWACTIONS.selectedKey = "MULTI";
								const oTemplate = new RowAction({items: [
									new RowActionItem({icon: "sap-icon://attachment", text: "Attachment", press: fnRowActionPress}),
									new RowActionItem({icon: "sap-icon://search", text: "Search", press: fnRowActionPress}),
									new RowActionItem({icon: "sap-icon://edit", text: "Edit", press: fnRowActionPress}),
									new RowActionItem({icon: "sap-icon://line-chart", text: "Analyze", press: fnRowActionPress})
								]});
								switchRowActions(oTable, 2, oTemplate);
							}
						},
						MULTI_ONE: {
							text: "Multiple Actions (1 Column)",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.ROWACTIONS.selectedKey = "MULTI_ONE";
								const oTemplate = new RowAction({items: [
									new RowActionItem({icon: "sap-icon://attachment", text: "Attachment", press: fnRowActionPress}),
									new RowActionItem({icon: "sap-icon://search", text: "Search", press: fnRowActionPress}),
									new RowActionItem({icon: "sap-icon://edit", text: "Edit", press: fnRowActionPress}),
									new RowActionItem({icon: "sap-icon://line-chart", text: "Analyze", press: fnRowActionPress})
								]});
								switchRowActions(oTable, 1, oTemplate);
							}
						},
						NONE: {
							text: "No Actions",
							action: function(oTable) {
								TABLESETTINGS.actions.AREAS.group.ROWACTIONS.selectedKey = "NONE";
								switchRowActions(oTable, 0, null);
							}
						}
					}
				},
				CREATIONROW: {
					text: "Creation Row",
					value: function(oTable) {
						return oTable.getCreationRow() != null;
					},
					input: "boolean",
					action: function(oTable, bValue) {
						if (bValue) {
							sap.ui.require(["sap/ui/table/CreationRow"], function(CreationRow) {
								const oBinding = oTable.getBinding();
								const oModel = oBinding ? oBinding.getModel() : null;
								const oCreationContext = oModel ? oModel.createBindingContext("/new") : null;

								if (oModel) {
									oModel.setProperty("", {}, oCreationContext);
								}

								oTable.setCreationRow(new CreationRow({
									bindingContexts: {
										undefined: oCreationContext
									},
									apply: function(oEvent) {
										const oData = oModel.getObject(oBinding.getPath());

										oData.push(oCreationContext.getObject());
										oModel.setProperty("", {}, oCreationContext);
										oTable.setFirstVisibleRow(oTable._getMaxFirstVisibleRowIndex());
									}
								}));
							});
						} else {
							oTable.getCreationRow().destroy();
						}
					}
				}
			}
		},
		ROWSETTINGS: {
			text: "Row Settings",
			group: {
				HIGHLIGHTS: {
					text: "Highlights",
					value: function(oTable) {
						return TableUtils.hasRowHighlights(oTable);
					},
					input: "boolean",
					action: function(oTable, bValue) {
						oTable.setRowSettingsTemplate(new RowSettings({
							highlight: bValue ? "{highlightState}" : MessageType.None,
							navigated: TableUtils.hasRowNavigationIndicators(oTable) ? "{navigatedState}" : false
						}));
					}
				},
				NAVINDICATORS: {
					text: "Navigation Indicators",
					value: function(oTable) {
						return TableUtils.hasRowNavigationIndicators(oTable);
					},
					input: "boolean",
					action: function(oTable, bValue) {
						oTable.setRowSettingsTemplate(new RowSettings({
							highlight: TableUtils.hasRowHighlights(oTable) ? "{highlightState}" : MessageType.None,
							navigated: bValue ? "{navigatedState}" : false
						}));
					}
				}
			}
		},
		GROUPING: {
			text: "Grouping",
			value: function(oTable) {
				if (oTable.isA("sap.ui.table.TreeTable")) {
					return oTable.getUseGroupMode();
				} else {
					return false;
				}
			},
			input: "boolean",
			action: function(oTable, bValue) {
				if (oTable.isA("sap.ui.table.TreeTable")) {
					oTable.setUseGroupMode(bValue);
				}
			}
		},
		COLUMNFREEZE: {
			text: "Column freeze",
			value: function(oTable) {
				return oTable.getEnableColumnFreeze();
			},
			input: "boolean",
			action: function(oTable, bValue) {
				oTable.setEnableColumnFreeze(bValue);
			}
		},
		EVENTS: {
			text: "Events",
			group: {
				CELLCLICK: {
					text: "CellClick",
					value: function(oTable) {
						return oTable.hasListeners("cellClick");
					},
					input: "boolean",
					_cellClickHandler: function(oEvent) {
						MessageToast.show("Cell " + oEvent.getParameter("rowIndex") + "/" + oEvent.getParameter("columnIndex") + " clicked");
					},
					action: function(oTable, bValue) {
						if (bValue) {
							oTable.attachCellClick(TABLESETTINGS.actions.EVENTS.group.CELLCLICK._cellClickHandler);
						} else {
							oTable.detachCellClick(TABLESETTINGS.actions.EVENTS.group.CELLCLICK._cellClickHandler);
						}
					}
				},
				PASTE: {
					text: "Paste",
					value: function(oTable) {
						return oTable.hasListeners("paste");
					},
					input: "boolean",
					_pasteHandler: function(oEvent) {
						MessageToast.show("Paste data: " + oEvent.getParameter("data"));
					},
					action: function(oTable, bValue) {
						if (bValue) {
							oTable.attachPaste(TABLESETTINGS.actions.EVENTS.group.PASTE._pasteHandler);
						} else {
							oTable.detachPaste(TABLESETTINGS.actions.EVENTS.group.PASTE._pasteHandler);
						}
					}
				}
			}
		}
	};

	let bInit = false;
	let oSettingsMenu;
	let oReopenTimer;

	function setReopenTimer() {
		if (oReopenTimer) {
			clearTimeout(oReopenTimer);
		}
		oReopenTimer = setTimeout(function() { oReopenTimer = null; }, 800);
	}

	function getValue(oAction, oControl) {
		if (oControl == null) {
			oControl = TABLESETTINGS.table;
		}

		if (typeof oAction.value === "function") {
			return oAction.value(oControl);
		} else {
			return oAction.value;
		}
	}

	function initMenu(mActions) {
		const oMenu = new UnifiedMenu();

		function onSelectTextFieldItem(oEvent) {
			const oTFItem = oEvent.getParameter("item");
			oTFItem._action(TABLESETTINGS.table, oTFItem._boolean ? !!oTFItem.getValue() : oTFItem.getValue());
			setReopenTimer();
		}

		function onSelectMenuItem(oEvent) {
			oEvent.getParameter("item")._action(TABLESETTINGS.table);
			setReopenTimer();
		}

		for (const item in mActions) {
			let oItem;
			if (mActions[item].input) {
				const oActionValue = getValue(mActions[item]);
				const bIsBoolean = mActions[item].input === "boolean";
				let sValue = null;

				if (bIsBoolean) {
					sValue = oActionValue ? "X" : null;
				} else {
					sValue = oActionValue ? (oActionValue + "") : null;
				}
				oItem = new MenuTextFieldItem({value: sValue, label: mActions[item].text, visible: !mActions[item].hidden, enabled: !mActions[item].disabled});
				oItem._action = mActions[item].action;
				oItem._boolean = bIsBoolean;
				oItem.attachSelect(onSelectTextFieldItem);
			} else {
				oItem = new UnifiedMenuItem({text: mActions[item].text, visible: !mActions[item].hidden, enabled: !mActions[item].disabled});
				if (mActions[item].choice || mActions[item].group) {
					oItem.setSubmenu(initMenu(mActions[item].choice || mActions[item].group));
				} else {
					oItem._action = mActions[item].action;
					oItem.attachSelect(onSelectMenuItem);
				}
			}
			oMenu.addItem(oItem);
		}
		return oMenu;
	}

	function initFormElements(mActions) {
		const aResult = [];

		function addSettings(oAction, sItem) {
			const oActionValue = getValue(oAction);
			let oClass = null;
			const mSettings = {
				visible: !oAction.hidden,
				enabled: !oAction.disabled
			};
			let oRelatedControl = null;

			if (oAction.group) {
				oClass = Button;
				mSettings.icon = "sap-icon://edit";
				mSettings.width = "3rem";
				mSettings.press = function(oEvent) {
					oEvent.getSource()._related.open(false, oEvent.getSource(), Dock.BeginTop, Dock.BeginBottom, oEvent.getSource());
				};
				oRelatedControl = initMenu(mActions[sItem].group);
			} else if (oAction.choice) {
				oClass = Select;
				mSettings.items = [];
				mSettings.forceSelection = false;
				mSettings.selectedKey = oActionValue || null;
				mSettings.change = function(oEvent) {
					const oSelectedItem = oEvent.getParameter("selectedItem");
					if (oSelectedItem._action) {
						oSelectedItem._action(TABLESETTINGS.table);
					}
				};
				for (const sItem in oAction.choice) {
					if (!oAction.choice[sItem].hidden && !oAction.choice[sItem].disabled) {
						const oItem = new Item({
							text: oAction.choice[sItem].text,
							key: sItem
						});
						oItem._action = oAction.choice[sItem].action;
						mSettings.items.push(oItem);
					}
				}
			} else if (oAction.input === "boolean") {
				oClass = CheckBox;
				mSettings.selected = oActionValue ? !!oActionValue : false;
				mSettings.select = function(oEvent) {
					if (oEvent.getSource()._action) {
						oEvent.getSource()._action(TABLESETTINGS.table, !!oEvent.getParameter("selected"));
					}
				};
			} else if (oAction.input) {
				oClass = Input;
				mSettings.value = oActionValue ? (oActionValue + "") : null;
				mSettings.change = function(oEvent) {
					if (oEvent.getSource()._action) {
						oEvent.getSource()._action(TABLESETTINGS.table, oEvent.getParameter("value"));
					}
				};
			} else if (oAction.action) {
				oClass = Button;
				mSettings.icon = "sap-icon://edit";
				mSettings.width = "3rem";
				mSettings.press = function(oEvent) {
					if (oEvent.getSource()._action) {
						oEvent.getSource()._action(TABLESETTINGS.table);
					}
				};
			} else {
				return null;
			}

			const oLabel = new Label({text: oAction.text, tooltip: oAction.text});
			aResult.push(oLabel);
			const oControl = new oClass(mSettings);
			oControl._action = oAction.action;
			oControl._related = oRelatedControl;
			aResult.push(oControl);

			return oControl;
		}

		for (const sItem in mActions) {
			addSettings(mActions[sItem], sItem);
		}

		return aResult;
	}

	function initForm(mActions) {
		const oForm = new SimpleForm({
			editable: true,
			layout: "ResponsiveGridLayout",
			columnsXL: 2,
			labelSpanXL: 7,
			columnsL: 2,
			labelSpanL: 7,
			columnsM: 2,
			labelSpanM: 7,
			labelSpanS: 7
		});

		const oSettingsSelector = new Select({
			width: "100%",
			selectedKey: loadAppliedSettingsKey(),
			items: (function() {
				const aItems = [];

				for (const key in TABLESETTINGS.storedSettings) {
					aItems.push(new Item({
						key: key,
						text: key
					}));
				}

				return aItems;
			})(),
			change: function(oEvent) {
				const sSettingsKey = oEvent.getParameter("selectedItem").getKey();
				const sSettingsSnapshot = TABLESETTINGS.storedSettings[sSettingsKey];
				const oDialog = Element.getElementById("settingsDialog");

				applySettingsSnapshot(TABLESETTINGS.table, sSettingsSnapshot);
				saveAppliedSettingsKey(sSettingsKey);
				Element.getElementById("settingsSelector").setSelectedKey(sSettingsKey); // Synchronize the select control on the main page.

				oDialog.removeAllContent();
				oDialog.addContent(initForm(mActions));
			}
		});

		const oNewSettingsInput = new Input({
			placeholder: "Name"
		});

		let aFormElements = [
			new Title({text: "Save/Load Settings"}),
			new VBox({
				renderType: "Bare",
				items: [
					new HBox({
						renderType: "Bare",
						items: [
							oSettingsSelector,
							new Button({
								icon: "sap-icon://delete",
								text: "Delete",
								press: function(oEvent) {
									const sDeleteSettingsKey = oSettingsSelector.getSelectedKey();

									deleteSettingsSnapshot(sDeleteSettingsKey);
									TABLESETTINGS.storedSettings = loadSettingsSnapshots();

									function createSelectItems() {
										const aSelectItems = [];

										for (const key in TABLESETTINGS.storedSettings) {
											aSelectItems.push(new Item({
												key: key,
												text: key
											}));
										}

										return aSelectItems;
									}

									const sSelects = [
										Element.getElementById("settingsSelector"),
										oSettingsSelector
									];

									for (let i = 0; i < sSelects.length; i++) {
										const oSelect = sSelects[i];
										const aNewSelectItems = createSelectItems();

										oSelect.removeAllItems();
										for (let j = 0; j < aNewSelectItems.length; j++) {
											oSelect.addItem(aNewSelectItems[j]);
										}
										oSelect.setSelectedKey("Default");
									}

									applySettingsSnapshot(TABLESETTINGS.table, TABLESETTINGS.storedSettings.Default);
									saveAppliedSettingsKey("Default");
								}
							})
						]
					}),
					new HBox({
						renderType: "Bare",
						items: [
							oNewSettingsInput,
							new Button({
								icon: "sap-icon://save",
								text: "Save",
								press: function(oEvent) {
									const sNewSettingsKey = oNewSettingsInput.getValue();

									saveSettingsSnapshot(sNewSettingsKey, createSettingsSnapshot(TABLESETTINGS.table));
									saveAppliedSettingsKey(sNewSettingsKey);
									TABLESETTINGS.storedSettings = loadSettingsSnapshots();

									function createSelectItems() {
										const aSelectItems = [];

										for (const key in TABLESETTINGS.storedSettings) {
											aSelectItems.push(new Item({
												key: key,
												text: key
											}));
										}

										return aSelectItems;
									}

									const sSelects = [
										Element.getElementById("settingsSelector"),
										oSettingsSelector
									];

									for (let i = 0; i < sSelects.length; i++) {
										const oSelect = sSelects[i];
										const aNewSelectItems = createSelectItems();

										oSelect.removeAllItems();
										for (let j = 0; j < aNewSelectItems.length; j++) {
											oSelect.addItem(aNewSelectItems[j]);
										}
										oSelect.setSelectedKey(sNewSettingsKey);
									}
								}
							})
						]
					})
				]
			})
		];

		const mUncategorizedActions = {};
		let bHasUncategorizedActions = false;
		for (const item in mActions) {
			if (mActions[item].group) {
				aFormElements.push(new Title({text: mActions[item].text}));
				aFormElements = aFormElements.concat(initFormElements(mActions[item].group));
			} else {
				bHasUncategorizedActions = true;
				mUncategorizedActions[item] = mActions[item];
			}
		}
		if (bHasUncategorizedActions) {
			aFormElements.push(new Title({text: "Others"}));
			aFormElements = aFormElements.concat(initFormElements(mUncategorizedActions));
		}

		for (let i = 0; i < aFormElements.length; i++) {
			oForm.addContent(aFormElements[i]);
		}

		return oForm;
	}

	function initDialog(mActions) {
		const oDialog = new Dialog({
			id: "settingsDialog",
			title: "Table Settings",
			resizable: true,
			contentWidth: "1000px",
			content: initForm(mActions),
			endButton: new Button({
				text: "Close",
				press: function() {
					oDialog.close();
				}
			})
		});

		return oDialog;
	}

	function createSettingsSnapshot(oTable) {
		const mTableSnapshot = {};
		let sPublicPropertyName;

		// Public table properties.
		for (sPublicPropertyName in oTable.mProperties) {
			mTableSnapshot[sPublicPropertyName] = {};
			mTableSnapshot[sPublicPropertyName].isPublicProperty = true;
			mTableSnapshot[sPublicPropertyName].isPrivateProperty = false;
			mTableSnapshot[sPublicPropertyName].isBound = oTable.isBound(sPublicPropertyName);

			if (mTableSnapshot[sPublicPropertyName].isBound) {
				mTableSnapshot[sPublicPropertyName].value = oTable.getBindingPath(sPublicPropertyName);
			} else {
				mTableSnapshot[sPublicPropertyName].value = oTable.mProperties[sPublicPropertyName];
			}
		}

		// Public row settings properties
		const oRowSettings = oTable.getRowSettingsTemplate();
		if (oRowSettings != null) {
			mTableSnapshot["RowSettings"] = {};

			for (sPublicPropertyName in oRowSettings.mProperties) {
				mTableSnapshot["RowSettings"][sPublicPropertyName] = {};
				mTableSnapshot["RowSettings"][sPublicPropertyName].isPublicProperty = true;
				mTableSnapshot["RowSettings"][sPublicPropertyName].isPrivateProperty = false;
				mTableSnapshot["RowSettings"][sPublicPropertyName].isBound = oRowSettings.isBound(sPublicPropertyName);

				if (mTableSnapshot["RowSettings"][sPublicPropertyName].isBound) {
					mTableSnapshot["RowSettings"][sPublicPropertyName].value = oRowSettings.getBindingPath(sPublicPropertyName);
				} else {
					mTableSnapshot["RowSettings"][sPublicPropertyName].value = oRowSettings.mProperties[sPublicPropertyName];
				}
			}
		}

		// Private table properties
		const aPrivatePropertyNames = [
			"_bLargeDataScrolling", "_bVariableRowHeightEnabled"
		];

		for (let i = 0; i < aPrivatePropertyNames.length; i++) {
			const sPrivatePropertyName = aPrivatePropertyNames[i];

			mTableSnapshot[sPrivatePropertyName] = {};
			mTableSnapshot[sPrivatePropertyName].value = oTable[sPrivatePropertyName];
			mTableSnapshot[sPrivatePropertyName].isPublicProperty = false;
			mTableSnapshot[sPrivatePropertyName].isPrivateProperty = true;
		}

		return JSON.stringify(mTableSnapshot);
	}

	function applySettingsSnapshot(oTable, sSnapshot) {
		let mSettings;
		let sPropertyName;
		let oSetting;
		let sSetterName;

		try {
			mSettings = JSON.parse(sSnapshot);
		} catch (e) {
			return;
		}

		// Public and private table properties.
		for (sPropertyName in mSettings) {
			oSetting = mSettings[sPropertyName];

			if (oSetting.isPublicProperty) {
				if (oSetting.isBound) {
					oTable.bindProperty(sPropertyName, oSetting.value);
				} else {
					sSetterName = "set" + sPropertyName.charAt(0).toUpperCase() + sPropertyName.slice(1);

					if (oTable[sSetterName] != null) {
						oTable[sSetterName](oSetting.value);
					}
				}
			} else if (oSetting.isPrivateProperty) {
				oTable[sPropertyName] = oSetting.value;
			}
		}

		// Public and private row settings properties.
		let oRowSettings = null;

		if (mSettings.hasOwnProperty("RowSettings")) {
			oRowSettings = new RowSettings();

			for (sPropertyName in mSettings["RowSettings"]) {
				oSetting = mSettings["RowSettings"][sPropertyName];

				if (oSetting.isPublicProperty) {
					if (oSetting.isBound) {
						oRowSettings.bindProperty(sPropertyName, oSetting.value);
					} else {
						sSetterName = "set" + sPropertyName.charAt(0).toUpperCase() + sPropertyName.slice(1);

						if (oRowSettings[sSetterName] != null) {
							oRowSettings[sSetterName](oSetting.value);
						}
					}
				} else if (oSetting.isPrivateProperty) {
					oRowSettings[sPropertyName] = oSetting.value;
				}
			}
		}

		oTable.setRowSettingsTemplate(oRowSettings);

		oTable.invalidate(); // In case only private properties have been set, like _largeDataScrolling.
	}

	function saveSettingsSnapshot(sKey, sSnapshot) {
		if (sKey == null || sKey === "" || sKey === "Default") {
			return;
		}

		window.localStorage.setItem("TableSettings_" + sKey, sSnapshot);
	}

	function deleteSettingsSnapshot(sKey) {
		if (sKey == null || sKey === "" || sKey === "Default") {
			return;
		}

		window.localStorage.removeItem("TableSettings_" + sKey);
	}

	function loadSettingsSnapshots() {
		const mSettings = [];

		if (window.localStorage.getItem("TableSettings_Default") == null) {
			window.localStorage.setItem("TableSettings_Default", createSettingsSnapshot(TABLESETTINGS.table));
		}

		for (const sKey in window.localStorage) {
			if (sKey.substring(0, 14) === "TableSettings_") {
				mSettings[sKey.replace("TableSettings_", "")] = window.localStorage.getItem(sKey);
			}
		}

		return mSettings;
	}

	function saveAppliedSettingsKey(sKey) {
		if (sKey == null || sKey === "") {
			return;
		}

		window.localStorage.setItem("TableSettingsAppliedKey", sKey);
	}

	function loadAppliedSettingsKey() {
		return window.localStorage.getItem("TableSettingsAppliedKey") || "Default";
	}

	TABLESETTINGS.init = function(oTable, vPlacement, mCustomActions) {
		if (bInit) {
			return;
		}
		bInit = true;

		try {
			oCore.loadLibrary("sap.ui.layout");
			oCore.loadLibrary("sap.ui.unified");
			oCore.loadLibrary("sap.m");
		} catch (e) {
			Log.error("The table settings extension needs librarys 'sap.m', 'sap.ui.unified' and 'sap.ui.layout'.");
			throw (e);
		}

		TABLESETTINGS.table = oTable;
		TABLESETTINGS.model = oTable.getModel();
		TABLESETTINGS.actions = deepExtend({}, DEFAULTACTIONS, mCustomActions || {});
		TABLESETTINGS.storedSettings = loadSettingsSnapshots();

		const sAppliedSettingsKey = loadAppliedSettingsKey();

		if (sAppliedSettingsKey !== "Default") {
			applySettingsSnapshot(oTable, TABLESETTINGS.storedSettings[sAppliedSettingsKey]);
		}

		const oButton = new Button({icon: "sap-icon://action-settings", tooltip: "Settings", press: function() {
			if (oSettingsMenu == null) {
				oSettingsMenu = initDialog(TABLESETTINGS.actions);
			} else {
				oSettingsMenu.removeAllContent();
				oSettingsMenu.addContent(initForm(TABLESETTINGS.actions));
			}
			oSettingsMenu.open();
		}});

		const oSettingsSelector = new Select({
			id: "settingsSelector",
			selectedKey: sAppliedSettingsKey,
			items: (function() {
				const aItems = [];

				for (const key in TABLESETTINGS.storedSettings) {
					aItems.push(new Item({
						key: key,
						text: key
					}));
				}

				return aItems;
			})(),
			change: function(oEvent) {
				const sSettingsKey = oEvent.getParameter("selectedItem").getKey();
				const sSettingsSnapshot = TABLESETTINGS.storedSettings[sSettingsKey];

				applySettingsSnapshot(oTable, sSettingsSnapshot);
				saveAppliedSettingsKey(sSettingsKey);
			}
		});

		if (typeof vPlacement === "function") {
			vPlacement(oButton);
			vPlacement(oSettingsSelector);
		} else {
			oButton.placeAt(vPlacement || "content");
			oSettingsSelector.placeAt(vPlacement || "content");
		}
	};

	TABLESETTINGS.addServiceSettings = function(oTable, sKey, fnOnSettingsChange, fnInitToolbar) {
		const mServiceSettings = JSON.parse(window.localStorage.getItem(sKey)) || {};
		const oToolbar = new Toolbar({
			content: [
				new Input("TableSettings_ServiceUrl", {
					value: mServiceSettings.url,
					tooltip: "Service Url",
					placeholder: "Enter Service Url"
				}),
				new Input("TableSettings_Collection", {
					value: mServiceSettings.collection,
					tooltip: "Service Collection",
					placeholder: "Enter Service Collection"
				})
			]
		});

		if (fnInitToolbar) {
			fnInitToolbar(oToolbar, mServiceSettings);
		}

		oToolbar.addContent(new Button({
			tooltip: "Go",
			icon: "sap-icon://restart",
			press: function() {
				const mNewServiceSettings = {
					url: Element.getElementById("TableSettings_ServiceUrl").getValue(),
					collection: Element.getElementById("TableSettings_Collection").getValue()
				};

				mNewServiceSettings.defaultProxyUrl = "../../../../proxy/" + mNewServiceSettings.url.replace("://", "/");
				fnOnSettingsChange(mNewServiceSettings);
				window.localStorage.setItem(sKey, JSON.stringify(mNewServiceSettings));
			}
		}));
		oTable.addExtension(oToolbar);

		if (Object.keys(mServiceSettings).length > 0) {
			fnOnSettingsChange(mServiceSettings);
		}
	};

	//*************************

	const oColumnSettingsModel = new JSONModel();

	function createAndOpenColumnDialog(oTable, mConfig) {
		const aData = [];
		const aColumns = oTable.getColumns();
		for (let i = 0; i < aColumns.length; i++) {
			const oSetting = {
				id: aColumns[i].getId(),
				label: aColumns[i].getLabel() ? aColumns[i].getLabel().getText() : aColumns[i].getId()
			};
			for (const sItem in mConfig) {
				oSetting[sItem] = getValue(mConfig[sItem], aColumns[i]);
			}
			aData.push(oSetting);
		}
		oColumnSettingsModel.setData({columns: aData});

		function changeSettings() {
			const aData = oColumnSettingsModel.getData().columns;
			for (let i = 0; i < aData.length; i++) {
				const oColumn = Element.getElementById(aData[i].id);
				for (const item in mConfig) {
					mConfig[item].action(oColumn, aData[i][item]);
				}
			}
		}

		const oSettingsTable = new Table({
			selectionMode: "None",
			rows: "{/columns}",
			fixedColumnCount: 1,
			columns: [
				new Column({
					label: "Column",
					template: new Text({wrapping: false, text: "{label}"}),
					width: "200px"
				})
			]
		});
		oSettingsTable.setModel(oColumnSettingsModel);

		let oColumn;
		for (const sItem in mConfig) {
			if (!mConfig[sItem].hidden) {
				oColumn = new Column({
					label: mConfig[sItem].text,
					template: new CheckBox({selected: "{" + sItem + "}"}),
					minWidth: 120
				});
				if (mConfig[sItem].input === "boolean") {
					oColumn.setTemplate(new CheckBox({enabled: !mConfig[sItem].disabled, selected: "{" + sItem + "}"}));
				} else {
					oColumn.setTemplate(new Input({enabled: !mConfig[sItem].disabled, value: "{" + sItem + "}"}));
				}
				oSettingsTable.addColumn(oColumn);
			}
		}

		const oDialog = new Dialog({
			title: "Table Column Settings",
			resizable: true,
			contentWidth: "1000px",
			content: [oSettingsTable],
			endButton: new Button({
				text: "Cancel", press: function() { oDialog.close(); }
			}),
			beginButton: new Button({
				text: "Ok",
				press: function() {
					changeSettings();
					oDialog.close();
				}
			}),
			afterClose: function() { oDialog.destroy(); }
		});
		oDialog.open();
	}

	function setDensity(sDensity, oTable) {
		if (sDensity !== "") {
			document.body.classList.toggle("sapUiSizeCozy", sDensity === "sapUiSizeCozy");
			document.body.classList.toggle("sapUiSizeCompact", sDensity !== "sapUiSizeCozy");
			oTable.toggleStyleClass("sapUiSizeCondensed", sDensity === "sapUiSizeCondensed");
			oTable.invalidate();
		}
	}

	let oCustom;
	const oEmptyModel = new JSONModel();

	function switchNoData(oTable, sState) {
		const oNoDataConfig = TABLESETTINGS.actions.AREAS.group.NODATA;
		switch (sState) {
			case "TEXT":
				oNoDataConfig.setData(oTable, true);
				oTable.setShowNoData(true);
				oTable.setNoData(null);
				break;
			case "CUSTOM":
				oNoDataConfig.setData(oTable, true);
				oTable.setShowNoData(true);
				if (!oCustom) {
					oCustom = new Text({text: "Some custom no data control"});
				}
				oTable.setNoData(oCustom);
				break;
			case "EMPTYCELLS":
				oNoDataConfig.setData(oTable, true);
				oTable.setShowNoData(false);
				oTable.setNoData(null);
				break;
			case "SHOWDATA":
			default:
				oNoDataConfig.setData(oTable, false);
				oTable.setShowNoData(true);
				oTable.setNoData(null);
				break;
		}
	}

	function fnRowActionPress(oEvent) {
		const oRow = oEvent.getParameter("row");
		const oItem = oEvent.getParameter("item");

		MessageToast.show("Item " + (oItem.getText() || oItem.getType()) + " in row " + oRow.getIndex() + " pressed.");
	}

	function switchRowActions(oTable, iCount, oTemplate) {
		const oCurrentTemplate = oTable.getRowActionTemplate();
		if (oCurrentTemplate) {
			oCurrentTemplate.destroy();
		}

		oTable.setRowActionTemplate(oTemplate);
		oTable.setRowActionCount(iCount);
	}

	return TABLESETTINGS;

});