(function() {
	"use strict";

	window.TABLESETTINGS = {};
	var TABLESETTINGS = window.TABLESETTINGS;

	// Test data
	var i, l;

	window.TABLESETTINGS.listTestData = [
		{lastName: "Dente", name: "Alfred", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-05-06", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success", highlightState: "Success"},
		{lastName: "Friese", name: "Andrew", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", objStatusText: "Name partly OK Text", objStatusTitle: "Name partly OK Title", objStatusState: "Warning", highlightState: "Warning"},
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

	var aOrgData = jQuery.extend(true, [], window.TABLESETTINGS.listTestData);
	for (i = 0; i < 9; i++) {
		window.TABLESETTINGS.listTestData = window.TABLESETTINGS.listTestData.concat(jQuery.extend(true, [], aOrgData));
	}

	for (i = 0, l = window.TABLESETTINGS.listTestData.length; i < l; i++) {
		window.TABLESETTINGS.listTestData[i].lastName += " - " + (i + 1);
		window.TABLESETTINGS.listTestData[i].birthdayDate = new Date(window.TABLESETTINGS.listTestData[i].birthday);
	}


	window.TABLESETTINGS.treeTestData = {
		root:{
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
			1:{
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
		window.TABLESETTINGS.treeTestData.root[4][i] = {
			name: "subitem4-" + i,
			description: "subitem4-" + i + " description",
			checked: false,
			highlightState: "None"
		};
	}

	// Settings

	var DEFAULTACTIONS = {
		I18N: {
			text: "Internationalization",
			group: {
				RTL: {
					text: "Right to Left",
					value: function() {
						return sap.ui.getCore().getConfiguration().getRTL();
					},
					input: "boolean",
					action: function(oTable, bValue) {
						sap.ui.getCore().getConfiguration().setRTL(bValue);
					}
				},
				LANG: {
					text: "Language (table related localized texts only)",
					value: function() {
						return sap.ui.getCore().getConfiguration().getLocale().getLanguage().toUpperCase();
					},
					choice: {
						EN: {
							text: "en",
							action: function(oTable) {
								sap.ui.getCore().getConfiguration().setLanguage("en");
							}
						},
						DE: {
							text: "de",
							action: function(oTable) {
								sap.ui.getCore().getConfiguration().setLanguage("de");
							}
						},
						FR: {
							text: "fr",
							action: function(oTable) {
								sap.ui.getCore().getConfiguration().setLanguage("fr");
							}
						}
					}
				}
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
						return (oTable._getSelectionPlugin().isA("sap.ui.table.plugins.MultiSelectionPlugin") ? "MULTISELECTION" : "NONE");
					},
					choice: {
						NONE: {
							text: "None",
							action: function(oTable) {
								oTable.removeAllPlugins();
							}
						},
						MULTISELECTION: {
							text: "MultiSelection",
							action: function(oTable) {
								var MultiSelectionPlugin = sap.ui.requireSync("sap/ui/table/plugins/MultiSelectionPlugin");
								var oPlugin = new MultiSelectionPlugin({
									limit: 20,
									selectionChange: function(oEvent) {
										var oPlugin = oEvent.getSource();
										var bLimitReached = oEvent.getParameters().limitReached;
										var iIndices = oPlugin.getSelectedIndices();
										var sMessage = "";
										if (iIndices.length > 0) {
											sMessage = iIndices.length + " row(s) selected.";
											if (bLimitReached) {
												sMessage = sMessage + " The recently selected range was limited to " + oPlugin.getLimit() + " rows!";
											}
										}

										if (!this.message) {
											this.message = new sap.m.MessageStrip({
												showCloseButton: true,
												showIcon: true
											});
											oTable.addExtension(this.message);
										}

										this.message.setText(sMessage);
										this.message.setVisible(!!sMessage);
										return this;
									}
								});
								oTable.addPlugin(oPlugin);
								sap.ui.getCore().byId("__select5").setSelectedKey(oPlugin.getSelectionMode().toUpperCase());
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
						var sDensity = sap.ui.table.TableUtils.getContentDensity(oTable);
						if (!sDensity || sDensity.indexOf("sapUiSize") === -1) {
							return null;
						}
						return sDensity.substring("sapUiSize".length, sDensity.length).toUpperCase();
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
				},
				ROWCOUNTMODE: {
					text: "Visible Row Count Mode",
					value: function(oTable) {
						return oTable.getVisibleRowCountMode().toUpperCase();
					},
					choice: {
						FIXED: {
							text: "Fixed",
							action: function(oTable) {
								oTable.setVisibleRowCountMode("Fixed");
							}
						},
						AUTO: {
							text: "Auto",
							action: function(oTable) {
								oTable.setVisibleRowCountMode("Auto");
							}
						},
						INTERACTIVE: {
							text: "Interactive",
							action: function(oTable) {
								oTable.setVisibleRowCountMode("Interactive");
							}
						}
					}
				},
				VISIBLEROWCOUNT: {
					text: "Visible Row Count",
					input: true,
					value: function(oTable) {
						return oTable.getVisibleRowCount();
					},
					action: function(oTable, sValue) {
						oTable.setVisibleRowCount(parseInt(sValue) || 0);
					}
				}
			}
		},
		SCROLLING: {
			text: "Scroll Settings (private)",
			group: {
				LARGEDATA: {
					text:  "Large Data Scrolling",
					value: function(oTable) {
						return oTable._bLargeDataScrolling;
					},
					input: "boolean",
					action: function(oTable, bValue) {
						oTable._bLargeDataScrolling = bValue;
					}
				},
				PIXELBASED: {
					text:  "Pixel-Based Scrolling",
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
						new sap.m.Menu({
							items: [
								new sap.m.MenuItem({text : "{name}"})
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
							new sap.m.Button({
								id: "HideOverlayButton",
								text: "Hide overlay",
								type: sap.m.ButtonType.Emphasized,
								press: function(oEvent) {
									oTable.setShowOverlay(false);
									oEvent.getSource().destroy();
								}
							}).placeAt(oTable.getParent().getId(), "first");
						} else {
							sap.ui.getCore().byId("HideOverlayButton").destroy();
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
						return DEFAULTACTIONS.AREAS.group.NODATA.selectedKey;
					},
					selectedKey: "SHOWDATA",
					choice: {
						SHOWDATA: {
							text: "Show Data",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.NODATA.selectedKey = "SHOWDATA";
								switchNoData(oTable, "SHOWDATA");
							}
						},
						TEXT: {
							text: "Text Message",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.NODATA.selectedKey = "TEXT";
								switchNoData(oTable, "TEXT");
							}
						},
						CUSTOM: {
							text: "Custom Control Message",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.NODATA.selectedKey = "CUSTOM";
								switchNoData(oTable, "CUSTOM");
							}
						},
						EMPTYCELLS: {
							text: "Show Empty Cells",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.NODATA.selectedKey = "EMPTYCELLS";
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
				FIXEDROWS: {
					text: "Fixed Top Rows",
					input: true,
					value: function(oTable) {
						return oTable.getFixedRowCount();
					},
					action: function(oTable, sValue) {
						oTable.setFixedRowCount(parseInt(sValue) || 0);
					}
				},
				FIXEDBOTTOMROWS: {
					text: "Fixed Bottom Rows",
					input: true,
					value: function(oTable) {
						return oTable.getFixedBottomRowCount();
					},
					action: function(oTable, sValue) {
						oTable.setFixedBottomRowCount(parseInt(sValue) || 0);
					}
				},
				ROWACTIONS: {
					text: "Row Actions",
					value: function() {
						return DEFAULTACTIONS.AREAS.group.ROWACTIONS.selectedKey;
					},
					selectedKey: "NONE",
					choice: {
						NAVIGATION : {
							text: "Navigation",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.ROWACTIONS.selectedKey = "NAVIGATION";
								var oTemplate = new sap.ui.table.RowAction({items: [
									new sap.ui.table.RowActionItem({
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
						NAVIGATIONDELETE : {
							text: "Navigation & Delete",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.ROWACTIONS.selectedKey = "NAVIGATIONDELETE";
								var oTemplate = new sap.ui.table.RowAction({items: [
									new sap.ui.table.RowActionItem({
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
									new sap.ui.table.RowActionItem({type: "Delete", press: fnRowActionPress})
								]});
								switchRowActions(oTable, 2, oTemplate);
							}
						},
						NAVIGATIONCUSTOM : {
							text: "Navigation & Custom",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.ROWACTIONS.selectedKey = "NAVIGATIONCUSTOM";
								var oTemplate = new sap.ui.table.RowAction({items: [
									new sap.ui.table.RowActionItem({
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
									new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press: fnRowActionPress})
								]});
								switchRowActions(oTable, 2, oTemplate);
							}
						},
						MULTI : {
							text: "Multiple Actions",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.ROWACTIONS.selectedKey = "MULTI";
								var oTemplate = new sap.ui.table.RowAction({items: [
									new sap.ui.table.RowActionItem({icon: "sap-icon://attachment", text: "Attachment", press: fnRowActionPress}),
									new sap.ui.table.RowActionItem({icon: "sap-icon://search", text: "Search", press: fnRowActionPress}),
									new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press: fnRowActionPress}),
									new sap.ui.table.RowActionItem({icon: "sap-icon://line-chart", text: "Analyze", press: fnRowActionPress})
								]});
								switchRowActions(oTable, 2, oTemplate);
							}
						},
						MULTI_ONE : {
							text: "Multiple Actions (1 Column)",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.ROWACTIONS.selectedKey = "MULTI_ONE";
								var oTemplate = new sap.ui.table.RowAction({items: [
									new sap.ui.table.RowActionItem({icon: "sap-icon://attachment", text: "Attachment", press: fnRowActionPress}),
									new sap.ui.table.RowActionItem({icon: "sap-icon://search", text: "Search", press: fnRowActionPress}),
									new sap.ui.table.RowActionItem({icon: "sap-icon://edit", text: "Edit", press: fnRowActionPress}),
									new sap.ui.table.RowActionItem({icon: "sap-icon://line-chart", text: "Analyze", press: fnRowActionPress})
								]});
								switchRowActions(oTable, 1, oTemplate);
							}
						},
						NONE : {
							text: "No Actions",
							action: function(oTable) {
								DEFAULTACTIONS.AREAS.group.ROWACTIONS.selectedKey = "NONE";
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
								var oBinding = oTable.getBinding("rows");
								var oModel = oBinding ? oBinding.getModel() : null;
								var oCreationContext = oModel ? oModel.createBindingContext("/new") : null;

								if (oModel) {
									oModel.setProperty("", {}, oCreationContext);
								}

								oTable.setCreationRow(new CreationRow({
									bindingContexts: {
										undefined: oCreationContext
									},
									apply: function(oEvent) {
										var oData = oModel.getObject(oBinding.getPath());

										oData.push(oCreationContext.getObject());
										oModel.setProperty("", {}, oCreationContext);
										oTable.setFirstVisibleRow(oTable._getMaxFirstVisibleRowIndex());
									}
								}));
							});
						} else {
							oTable.destroyCreationRow();
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
						return sap.ui.table.TableUtils.hasRowHighlights(oTable);
					},
					input: "boolean",
					action: function(oTable, bValue) {
						if (bValue) {
							oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
								highlight: "{highlightState}"
							}));
						} else {
							oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
								highlight: sap.ui.core.MessageType.None
							}));
						}
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
					return oTable.getEnableGrouping();
				}
			},
			input: "boolean",
			action: function(oTable, bValue) {
				if (oTable.isA("sap.ui.table.TreeTable")) {
					oTable.setUseGroupMode(bValue);
				} else {
					oTable.setEnableGrouping(bValue);
				}
			}
		},
		TOOLTIPS: {
			text: "Standard Tooltips (private)",
			value: function(oTable) {
				return oTable._getShowStandardTooltips();
			},
			input: "boolean",
			action: function(oTable, bValue) {
				oTable._bHideStandardTooltips = !bValue;
				oTable.invalidate();
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
						jQuery.sap.require("sap.m.MessageToast");
						sap.m.MessageToast.show("Cell " + oEvent.getParameter("rowIndex") + "/" + oEvent.getParameter("columnIndex") + " clicked");
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
						jQuery.sap.require("sap.m.MessageToast");
						sap.m.MessageToast.show("Paste data: " + oEvent.getParameter("data"));
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

	var bInit = false;
	var oSettingsMenu = null;
	var oReopenTimer;

	function setReopenTimer() {
		if (oReopenTimer) {
			clearTimeout(oReopenTimer);
		}
		oReopenTimer = setTimeout(function() {oReopenTimer = null;}, 800);
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
		var oMenu = new sap.ui.unified.Menu();

		function onSelectTextFieldItem(oEvent) {
			var oTFItem = oEvent.getParameter("item");
			oTFItem._action(TABLESETTINGS.table, oTFItem._boolean ? !!oTFItem.getValue() : oTFItem.getValue());
			setReopenTimer();
		}

		function onSelectMenuItem(oEvent) {
			oEvent.getParameter("item")._action(TABLESETTINGS.table);
			setReopenTimer();
		}

		for (var item in mActions) {
			var oItem;
			if (mActions[item].input) {
				var oActionValue = getValue(mActions[item]);
				var bIsBoolean = mActions[item].input == "boolean";
				var sValue = null;

				if (bIsBoolean) {
					sValue = oActionValue ? "X" : null;
				} else {
					sValue = oActionValue ? (oActionValue + "") : null;
				}
				oItem = new sap.ui.unified.MenuTextFieldItem({value: sValue, label: mActions[item].text, visible: !mActions[item].hidden, enabled: !mActions[item].disabled});
				oItem._action = mActions[item].action;
				oItem._boolean = bIsBoolean;
				oItem.attachSelect(onSelectTextFieldItem);
			} else {
				oItem = new sap.ui.unified.MenuItem({text: mActions[item].text, visible: !mActions[item].hidden, enabled: !mActions[item].disabled});
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

	function initFormElements(mActions, iLevel) {
		var aResult = [];

		function addSettings(oAction) {
			var oActionValue = getValue(oAction);
			var oClass = null;
			var mSettings = {
				visible: !oAction.hidden,
				enabled: !oAction.disabled
			};
			var oRelatedControl = null;

			if (oAction.group) {
				oClass = sap.m.Button;
				mSettings.icon = "sap-icon://edit";
				mSettings.width = "3rem";
				mSettings.press = function(oEvent) {
					oEvent.getSource()._related.open(false, oEvent.getSource(), sap.ui.core.Popup.Dock.BeginTop, sap.ui.core.Popup.Dock.BeginBottom, oEvent.getSource());
				};
				oRelatedControl = initMenu(mActions[item].group);
			} else if (oAction.choice) {
				oClass = sap.m.Select;
				mSettings.items = [];
				mSettings.forceSelection = false;
				mSettings.selectedKey = oActionValue || null;
				mSettings.change = function(oEvent) {
					var oSelectedItem = oEvent.getParameter("selectedItem");
					if (oSelectedItem._action) {
						oSelectedItem._action(TABLESETTINGS.table);
					}
				};
				for ( var item in oAction.choice) {
					if (!oAction.choice[item].hidden && !oAction.choice[item].disabled) {
						var oItem = new sap.ui.core.Item({
							text: oAction.choice[item].text,
							key: item
						});
						oItem._action = oAction.choice[item].action;
						mSettings.items.push(oItem);
					}
				}
			} else if (oAction.input === "boolean") {
				oClass = sap.m.CheckBox;
				mSettings.selected = oActionValue ? !!oActionValue : false;
				mSettings.select = function(oEvent) {
					if (oEvent.getSource()._action) {
						oEvent.getSource()._action(TABLESETTINGS.table, !!oEvent.getParameter("selected"));
					}
				};
			} else if (oAction.input) {
				oClass = sap.m.Input;
				mSettings.value = oActionValue ? (oActionValue + "") : null;
				mSettings.change = function(oEvent) {
					if (oEvent.getSource()._action) {
						oEvent.getSource()._action(TABLESETTINGS.table, oEvent.getParameter("value"));
					}
				};
			} else if (oAction.action) {
				oClass = sap.m.Button;
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

			var oLabel = new sap.m.Label({text: oAction.text, tooltip: oAction.text});
			aResult.push(oLabel);
			var oControl = new oClass(mSettings);
			oControl._action = oAction.action;
			oControl._related = oRelatedControl;
			aResult.push(oControl);

			return oControl;
		}

		for (var item in mActions) {
			addSettings(mActions[item]);
		}

		return aResult;
	}

	function initForm(mActions) {
		var oForm = new sap.ui.layout.form.SimpleForm({
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

		var oSettingsSelector = new sap.m.Select({
			width: "100%",
			selectedKey: loadAppliedSettingsKey(),
			items: (function() {
				var aItems = [];

				for (var key in TABLESETTINGS.storedSettings) {
					aItems.push(new sap.ui.core.Item({
						key: key,
						text: key
					}));
				}

				return aItems;
			})(),
			change: function(oEvent) {
				var sSettingsKey = oEvent.getParameter("selectedItem").getKey();
				var sSettingsSnapshot = TABLESETTINGS.storedSettings[sSettingsKey];
				var oDialog = sap.ui.getCore().byId("settingsDialog");

				applySettingsSnapshot(TABLESETTINGS.table, sSettingsSnapshot);
				saveAppliedSettingsKey(sSettingsKey);
				sap.ui.getCore().byId("settingsSelector").setSelectedKey(sSettingsKey); // Synchronize the select control on the main page.

				oDialog.removeAllContent();
				oDialog.addContent(initForm(mActions));
			}
		});

		var oNewSettingsInput = new sap.m.Input({
			placeholder: "Name"
		});

		var aFormElements = [
			new sap.ui.core.Title({text: "Save/Load Settings"}),
			new sap.m.VBox({
				renderType: "Bare",
				items: [
					new sap.m.HBox({
						renderType: "Bare",
						items: [
							oSettingsSelector,
							new sap.m.Button({
								icon: "sap-icon://delete",
								text: "Delete",
								press: function(oEvent) {
									var sDeleteSettingsKey = oSettingsSelector.getSelectedKey();

									deleteSettingsSnapshot(sDeleteSettingsKey);
									TABLESETTINGS.storedSettings = loadSettingsSnapshots();

									function createSelectItems() {
										var aSelectItems = [];

										for (var key in TABLESETTINGS.storedSettings) {
											aSelectItems.push(new sap.ui.core.Item({
												key: key,
												text: key
											}));
										}

										return aSelectItems;
									}

									var sSelects = [
										sap.ui.getCore().byId("settingsSelector"),
										oSettingsSelector
									];

									for (var i = 0; i < sSelects.length; i++) {
										var oSelect = sSelects[i];
										var aNewSelectItems = createSelectItems();

										oSelect.removeAllItems();
										for (var j = 0; j < aNewSelectItems.length; j++) {
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
					new sap.m.HBox({
						renderType: "Bare",
						items: [
							oNewSettingsInput,
							new sap.m.Button({
								icon: "sap-icon://save",
								text: "Save",
								press: function(oEvent) {
									var sNewSettingsKey = oNewSettingsInput.getValue();

									saveSettingsSnapshot(sNewSettingsKey, createSettingsSnapshot(TABLESETTINGS.table));
									saveAppliedSettingsKey(sNewSettingsKey);
									TABLESETTINGS.storedSettings = loadSettingsSnapshots();

									function createSelectItems() {
										var aSelectItems = [];

										for (var key in TABLESETTINGS.storedSettings) {
											aSelectItems.push(new sap.ui.core.Item({
												key: key,
												text: key
											}));
										}

										return aSelectItems;
									}

									var sSelects = [
										sap.ui.getCore().byId("settingsSelector"),
										oSettingsSelector
									];

									for (var i = 0; i < sSelects.length; i++) {
										var oSelect = sSelects[i];
										var aNewSelectItems = createSelectItems();

										oSelect.removeAllItems();
										for (var j = 0; j < aNewSelectItems.length; j++) {
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

		var mUncategorizedActions = {};
		var bHasUncategorizedActions = false;
		for (var item in mActions) {
			if (mActions[item].group) {
				aFormElements.push(new sap.ui.core.Title({text: mActions[item].text}));
				aFormElements = aFormElements.concat(initFormElements(mActions[item].group));
			} else {
				bHasUncategorizedActions = true;
				mUncategorizedActions[item] = mActions[item];
			}
		}
		if (bHasUncategorizedActions) {
			aFormElements.push(new sap.ui.core.Title({text: "Others"}));
			aFormElements = aFormElements.concat(initFormElements(mUncategorizedActions));
		}

		for (var i = 0; i < aFormElements.length; i++) {
			oForm.addContent(aFormElements[i]);
		}

		return oForm;
	}

	function initDialog(mActions) {
		var oDialog = new sap.m.Dialog({
			id: "settingsDialog",
			title: "Table Settings",
			resizable: true,
			contentWidth: "1000px",
			content: initForm(mActions),
			endButton: new sap.m.Button({
				text: "Close",
				press: function() {
					oDialog.close();
				}
			})
		});

		return oDialog;
	}

	function createSettingsSnapshot(oTable) {
		var mTableSnapshot = {};
		var sPublicPropertyName;

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
		var oRowSettings = oTable.getRowSettingsTemplate();
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
		var aPrivatePropertyNames = [
			"_bLargeDataScrolling", "_bVariableRowHeightEnabled"
		];

		for (var i = 0; i < aPrivatePropertyNames.length; i++) {
			var sPrivatePropertyName = aPrivatePropertyNames[i];

			mTableSnapshot[sPrivatePropertyName] = {};
			mTableSnapshot[sPrivatePropertyName].value = oTable[sPrivatePropertyName];
			mTableSnapshot[sPrivatePropertyName].isPublicProperty = false;
			mTableSnapshot[sPrivatePropertyName].isPrivateProperty = true;
		}

		return JSON.stringify(mTableSnapshot);
	}

	function applySettingsSnapshot(oTable, sSnapshot) {
		var mSettings;
		var sPropertyName;
		var oSetting;
		var sSetterName;

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
		var oRowSettings = null;

		if (mSettings.hasOwnProperty("RowSettings")) {
			oRowSettings = new sap.ui.table.RowSettings();

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
		var mSettings = [];

		if (window.localStorage.getItem("TableSettings_Default") == null) {
			window.localStorage.setItem("TableSettings_Default", createSettingsSnapshot(TABLESETTINGS.table));
		}

		for (var sKey in window.localStorage) {
			if (sKey.substring(0, "TableSettings_".length) === "TableSettings_") {
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
			sap.ui.getCore().loadLibrary("sap.ui.layout");
			sap.ui.getCore().loadLibrary("sap.ui.unified");
			sap.ui.getCore().loadLibrary("sap.m");
		} catch (e) {
			jQuery.sap.log.error("The table settings extension needs librarys 'sap.m', 'sap.ui.unified' and 'sap.ui.layout'.");
			throw (e);
		}

		TABLESETTINGS.table = oTable;
		TABLESETTINGS.model = oTable.getModel();
		TABLESETTINGS.actions = jQuery.extend(true, {}, DEFAULTACTIONS, mCustomActions || {});
		TABLESETTINGS.storedSettings = loadSettingsSnapshots();

		var sAppliedSettingsKey = loadAppliedSettingsKey();

		if (sAppliedSettingsKey !== "Default") {
			applySettingsSnapshot(oTable, TABLESETTINGS.storedSettings[sAppliedSettingsKey]);
		}

		var oButton = new sap.m.Button({icon: "sap-icon://action-settings", tooltip: "Settings", press: function() {
			if (oSettingsMenu == null) {
				oSettingsMenu = initDialog(TABLESETTINGS.actions);
			} else {
				oSettingsMenu.removeAllContent();
				oSettingsMenu.addContent(initForm(TABLESETTINGS.actions));
			}
			oSettingsMenu.open();
		}});

		var oSettingsSelector = new sap.m.Select({
			id: "settingsSelector",
			selectedKey: sAppliedSettingsKey,
			items: (function() {
				var aItems = [];

				for (var key in TABLESETTINGS.storedSettings) {
					aItems.push(new sap.ui.core.Item({
						key: key,
						text: key
					}));
				}

				return aItems;
			})(),
			change: function(oEvent) {
				var sSettingsKey = oEvent.getParameter("selectedItem").getKey();
				var sSettingsSnapshot = TABLESETTINGS.storedSettings[sSettingsKey];

				applySettingsSnapshot(oTable, sSettingsSnapshot);
				saveAppliedSettingsKey(sSettingsKey);
			}
		});

		if (typeof vPlacement == "function") {
			vPlacement(oButton);
			vPlacement(oSettingsSelector);
		} else {
			oButton.placeAt(vPlacement || "content");
			oSettingsSelector.placeAt(vPlacement || "content");
		}
	};

	TABLESETTINGS.getAnalyticalService = function() {
		if (!TABLESETTINGS.oStorage) {
			jQuery.sap.require("jquery.sap.storage");
			TABLESETTINGS.oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		}
		return {url: TABLESETTINGS.oStorage.get("ANALYTICALSERVICETESTURL"), collection: TABLESETTINGS.oStorage.get("ANALYTICALSERVICETESTCOLLECTION")};
	};

	TABLESETTINGS.setAnalyticalService = function(sUrl, sCollection) {
		if (!TABLESETTINGS.oStorage) {
			jQuery.sap.require("jquery.sap.storage");
			TABLESETTINGS.oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		}
		if (sUrl && sCollection) {
			TABLESETTINGS.oStorage.put("ANALYTICALSERVICETESTURL", sUrl);
			TABLESETTINGS.oStorage.put("ANALYTICALSERVICETESTCOLLECTION", sCollection);
			return true;
		}
		return false;
	};

	//*************************

	jQuery.sap.require("sap.ui.model.json.JSONModel");

	var oColumnSettingsModel = new sap.ui.model.json.JSONModel();

	function createAndOpenColumnDialog(oTable, mConfig) {
		var aData = [];
		var aColumns = oTable.getColumns();
		for (var i = 0; i < aColumns.length; i++) {
			var oSetting = {
				id: aColumns[i].getId(),
				label: aColumns[i].getLabel() ? aColumns[i].getLabel().getText() : aColumns[i].getId()
			};
			for (var item in mConfig) {
				oSetting[item] = getValue(mConfig[item], aColumns[i]);
			}
			aData.push(oSetting);
		}
		oColumnSettingsModel.setData({columns: aData});

		function changeSettings() {
			var aData = oColumnSettingsModel.getData().columns;
			for (var i = 0; i < aData.length; i++) {
				var oColumn = sap.ui.getCore().byId(aData[i].id);
				for (var item in mConfig) {
					mConfig[item].action(oColumn, aData[i][item]);
				}
			}
		}

		var oSettingsTable = new sap.ui.table.Table({
			selectionMode: "None",
			rows: "{/columns}",
			fixedColumnCount: 1,
			columns: [
				new sap.ui.table.Column({
					label: "Column",
					template: new sap.m.Text({wrapping: false, text: "{label}"}),
					width: "200px"
				})
			]
		});
		oSettingsTable.setModel(oColumnSettingsModel);

		var oColumn;
		for (var item in mConfig) {
			if (!mConfig[item].hidden) {
				oColumn = new sap.ui.table.Column({
					label: mConfig[item].text,
					template: new sap.m.CheckBox({selected: "{" + item + "}"}),
					minWidth: 120
				});
				if (mConfig[item].input == "boolean") {
					oColumn.setTemplate(new sap.m.CheckBox({enabled: !mConfig[item].disabled, selected: "{" + item + "}"}));
				} else {
					oColumn.setTemplate(new sap.m.Input({enabled: !mConfig[item].disabled, value: "{" + item + "}"}));
				}
				oSettingsTable.addColumn(oColumn);
			}
		}

		var oDialog = new sap.m.Dialog({
			title: "Table Column Settings",
			resizable: true,
			contentWidth: "1000px",
			content: [oSettingsTable],
			endButton: new sap.m.Button({
				text: "Cancel", press: function() { oDialog.close(); }
			}),
			beginButton: new sap.m.Button({
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
			var $Body = jQuery("body");
			$Body.toggleClass("sapUiSizeCozy", sDensity === "sapUiSizeCozy");
			$Body.toggleClass("sapUiSizeCompact", sDensity != "sapUiSizeCozy");
			oTable.toggleStyleClass("sapUiSizeCondensed", sDensity === "sapUiSizeCondensed");
			oTable.invalidate();
		}
	}

	var oCustom;
	var oEmptyModel = new sap.ui.model.json.JSONModel();

	function switchNoData(oTable, sState) {
		var oNoDataConfig = TABLESETTINGS.actions.AREAS.group.NODATA;
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
					oCustom = new sap.m.Text({text: "Some custom no data control"});
				}
				oTable.setNoData(oCustom);
				break;
			case "EMPTYCELLS":
				oNoDataConfig.setData(oTable, true);
				oTable.setShowNoData(false);
				oTable.setNoData(null);
				break;
			default:
			case "SHOWDATA":
				oNoDataConfig.setData(oTable, false);
				oTable.setShowNoData(true);
				oTable.setNoData(null);
				break;
		}
	}

	function fnRowActionPress(oEvent) {
		var oRow = oEvent.getParameter("row");
		var oItem = oEvent.getParameter("item");

		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast("Item " + (oItem.getText() || oItem.getType()) + " in row " + oRow.getIndex() + " pressed.");
	}

	function switchRowActions(oTable, iCount, oTemplate) {
		var oCurrentTemplate = oTable.getRowActionTemplate();
		if (oCurrentTemplate) {
			oCurrentTemplate.destroy();
		}

		oTable.setRowActionTemplate(oTemplate);
		oTable.setRowActionCount(iCount);
	}


})();
