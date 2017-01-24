(function() {

	window.TABLESETTINGS = {};


	// Test data

	window.TABLESETTINGS.listTestData = [
		{lastName: "Dente", name: "Alfred", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-05-06", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Friese", name: "Andrew", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", objStatusText: "Name partly OK Text", objStatusTitle: "Name partly OK Title", objStatusState: "Warning"},
		{lastName: "Mann", name: "Sarah", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "images/Person.png", gender: "female", rating: 3, money: 1345.212, birthday: "1987-04-01", currency: "EUR", objStatusText: "Name not OK Text", objStatusTitle: "Name not OK Title", objStatusState: "Error"},
		{lastName: "Berry", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 4, money: 1.1, birthday: "2001-05-09", currency: "USD", objStatusText: "Status unknown Text", objStatusTitle: "Status unknown Title", objStatusState: "None"},
		{lastName: "Open", name: "Jenny", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 2, money: 55663.1, birthday: "1953-03-03", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Dewit", name: "Stanley", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 34.23, birthday: "1957-02-07", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Zar", name: "Louise", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 1, money: 123, birthday: "1965-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Burr", name: "Timothy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 678.45, birthday: "1978-05-08", currency: "DEM", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Hughes", name: "Trisha", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 5, money: 123.45, birthday: "1968-05-06", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Town", name: "Mike", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 3, money: 678.90, birthday: "1968-06-06", currency: "JPY", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Case", name: "Josephine", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 3, money: 8756.2, birthday: "1968-03-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Time", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 4, money: 836.4, birthday: "1968-04-02", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Barr", name: "Susan", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 2, money: 9.3, birthday: "1968-03-02", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Poole", name: "Gerry", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 1, money: 6344.21, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Ander", name: "Corey", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 5, money: 563.2, birthday: "1968-04-01", currency: "JPY", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Early", name: "Boris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 3, money: 8564.4, birthday: "1968-07-07", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Noring", name: "Cory", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "female", rating: 4, money: 3563, birthday: "1968-01-01", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "O'Lantern", name: "Jacob", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 2, money: 5.67, birthday: "1968-06-09", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Tress", name: "Matthew", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Summer", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 5.67, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"}
	];

	var aOrgData = jQuery.extend(true, [], window.TABLESETTINGS.listTestData);
	for (var i = 0; i < 9; i++) {
		window.TABLESETTINGS.listTestData = window.TABLESETTINGS.listTestData.concat(jQuery.extend(true, [], aOrgData));
	}

	for (var i = 0, l = window.TABLESETTINGS.listTestData.length; i < l; i++) {
		window.TABLESETTINGS.listTestData[i].lastName += " - " + (i + 1);
		window.TABLESETTINGS.listTestData[i].birthdayDate = new Date(window.TABLESETTINGS.listTestData[i].birthday);
	}


	window.TABLESETTINGS.treeTestData = {
		root:{
			name: "root",
			description: "moep moep",
			checked: false,
			0: {
				name: "Rock",
				description: "Rockmusik",
				checked: true,
				0: { //children as object references
					name: "Rock'n'Roll",
					description: "late 1940s",
					checked: true,
					children: [ // Children inside an array
						{
							name: "Elvis Presley",
							description: "*1935 - +1977",
							checked: true
						},
						{
							name: "Chuck Berry",
							description: "*1926",
							checked: true
						}
					],
					"flup": { // mixed with arrays and objects
						name: "Keith Richards",
						description: "*1943",
						checked: true
					}
				},
				1: {
					name: "Heavy Metal",
					description: "late 1960s",
					checked: true,
					0: {
						name: "Black Sabbath",
						description: "founded 1968",
						checked: true
					},
					1: {
						name: "Judas Priest",
						description: "founded 1969",
						checked: true
					}
				},
				2: {
					name: "Grunge",
					description: "Mid-1980s",
					checked: true,
					0: {
						name: "Nirvana",
						description: "1987",
						checked: true
					},
					1: {
						name: "Soundgarden",
						description: "1984",
						checked: true
					},
					2: {
						name: "Alice in Chains",
						description: "1987",
						checked: true
					}
				}
			},
			1:{
				name: "Hip-Hop",
				description: "Hip-Hop",
				checked: true,
				0: {
					name: "Old-School",
					description: "Mid 1970s",
					checked: true,
					0: {
						name: "The Sugarhill Gang",
						description: "1973",
						checked: true
					},
					1: {
						name: "Grandmaster Flash and the Furious Five",
						description: "1978",
						checked: true
					}
				},
				1: {
					name: "Rap-Rock",
					description: "early 1980s",
					checked: true,
					0: {
						name: "Run-D.M.C.",
						description: "1981 - 2002",
						checked: true
					},
					1: {
						name: "Beastie Boys",
						description: "1981 - 2012",
						checked: true
					}
				},
				2: {
					name: "Gangsta rap",
					description: "mid 1980s",
					checked: true,
					0: {
						name: "2Pac",
						description: "1971 - 1996",
						checked: true
					},
					1: {
						name: "N.W.A",
						description: "1986 - 1991, 1998 - 2002",
						checked: true
					}
				}
			},
			2: {
				name: "Swing/Big Band",
				description: "1930s",
				checked: true,
				0: {
					name: "Frank Sinatra",
					description: "1915 - 1998",
					checked: true
				},
				1: {
					name: "Count Basie",
					description: "1904 - 1984",
					checked: true
				}
			},
			3: {
				name: "Some Item",
				description: "None",
				checked: true
			},
			4: {
				name: "Some other Item",
				description: "None",
				checked: true
			}
		}
	};

	for (var i = 0; i < 20; i++) {
		window.TABLESETTINGS.treeTestData.root[4][i] = {
			name: "subitem4-" + i,
			description: "subitem4-" + i + " description",
			checked: false
		};
	}



	// Settings

	var DEFAULTACTIONS = {
		I18N: {
			text: "Internationalization",
			group: {
				RTL: {
					text: "Right to Left",
					defaultValue: sap.ui.getCore().getConfiguration().getRTL(),
					input: "boolean",
					action: function(oTable, bValue) {sap.ui.getCore().getConfiguration().setRTL(bValue);}
				},
				LANG: {
					text: "Language (table related localized texts only)",
					defaultKey: sap.ui.getCore().getConfiguration().getLocale().getLanguage().toUpperCase(),
					choice: {
						EN: {
							text: "en",
							action: function(oTable) {sap.ui.getCore().getConfiguration().setLanguage("en");}
						},
						DE: {
							text: "de",
							action: function(oTable) {sap.ui.getCore().getConfiguration().setLanguage("de");}
						},
						FR: {
							text: "fr",
							action: function(oTable) {sap.ui.getCore().getConfiguration().setLanguage("fr");}
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
					defaultKey: function(oTable) {
						return oTable.getSelectionMode().toUpperCase();
					},
					choice: {
						NONE: {
							text: "None",
							action: function(oTable) {oTable.setSelectionMode("None");}
						},
						SINGLE: {
							text: "Single",
							action: function(oTable) {oTable.setSelectionMode("Single");}
						},
						MULTITOGGLE: {
							text: "MultiToggle",
							action: function(oTable) {oTable.setSelectionMode("MultiToggle");}
						}
					}
				},
				SELECTIONBEHAVIOR: {
					text: "Selection Behavior",
					defaultKey: function(oTable) {
						return oTable.getSelectionBehavior().toUpperCase();
					},
					choice: {
						ROWSELECTOR: {
							text: "RowSelector",
							action: function(oTable) {oTable.setSelectionBehavior("RowSelector");}
						},
						ROW: {
							text: "Row",
							action: function(oTable) {oTable.setSelectionBehavior("Row");}
						},
						ROWONLY: {
							text: "RowOnly",
							action: function(oTable) {oTable.setSelectionBehavior("RowOnly");}
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
					defaultKey: function(oTable) {
						var sDensity = sap.ui.table.TableUtils.getContentDensity(oTable);
						if (!sDensity || !sDensity.indexOf("sapUiSize") == 0) {
							return null;
						}
						return sDensity.substring("sapUiSize".length, sDensity.length).toUpperCase();
					},
					choice: {
						COZY: {
							text: "Cozy",
							action: function(oTable) {setDensity("sapUiSizeCozy", oTable);}
						},
						COMPACT: {
							text: "Compact",
							action: function(oTable) {setDensity("sapUiSizeCompact", oTable);}
						},
						CONDENSED: {
							text: "Condensed",
							action: function(oTable) {setDensity("sapUiSizeCondensed", oTable);}
						}
					}
				},
				ROWCOUNTMODE: {
					text: "Visible Row Count Mode",
					defaultKey: function(oTable) {
						return oTable.getVisibleRowCountMode().toUpperCase();
					},
					choice: {
						FIXED: {
							text: "Fixed",
							action: function(oTable) {oTable.setVisibleRowCountMode("Fixed");}
						},
						AUTO: {
							text: "Auto",
							action: function(oTable) {oTable.setVisibleRowCountMode("Auto");}
						},
						INTERACTIVE: {
							text: "Interactive",
							action: function(oTable) {oTable.setVisibleRowCountMode("Interactive");}
						}
					}
				},
				VISIBLEROWCOUNT: {
					text: "Visible Row Count",
					input: true,
					defaultValue: function(oTable) {
						return oTable.getVisibleRowCount();
					},
					action: function(oTable, sValue) {oTable.setVisibleRowCount(parseInt(sValue, 10) || 0);}
				}
			}
		},
		SCROLLING: {
			text: "Scroll Settings (private)",
			group: {
				LARGEDATA: {
					text:  "Large Data Scrolling",
					defaultValue: function(oTable) {
						return oTable._bLargeDataScrolling;
					},
					input: "boolean",
					action: function(oTable, bValue) {oTable._bLargeDataScrolling = bValue;}
				},
				PIXELBASED: {
					text:  "Pixel-Based Scrolling",
					defaultValue: function(oTable) {
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
					defaultValue: function(oColumn) {
						return oColumn.getVisible();
					},
					action: function(oColumn, vValue) {
						oColumn.setVisible(!!vValue);
					}
				},
				RESIZABLE: {
					text: "Resizable",
					input: "boolean",
					defaultValue: function(oColumn) {
						return oColumn.getResizable();
					},
					action: function(oColumn, vValue) {
						oColumn.setResizable(!!vValue);
					}
				},
				AUTORESIZABLE: {
					text: "Auto Resizable",
					input: "boolean",
					defaultValue: function(oColumn) {
						return oColumn.getAutoResizable();
					},
					action: function(oColumn, vValue) {
						oColumn.setAutoResizable(!!vValue);
					}
				},
				WIDTH: {
					text: "Width",
					input: true,
					defaultValue: function(oColumn) {
						return oColumn.getWidth();
					},
					action: function(oColumn, vValue) {
						oColumn.setWidth(vValue + "");
					}
				},
				MINWIDTH: {
					text: "Min-Width",
					input: true,
					defaultValue: function(oColumn) {
						return oColumn.getMinWidth();
					},
					action: function(oColumn, vValue) {
						oColumn.setMinWidth(parseInt(vValue, 10) || 0);
					}
				}
			}
		},
		BUSY: {
			text: "Busy",
			defaultValue: function(oTable) {
				return oTable.getBusy();
			},
			input: "boolean",
			action: function(oTable, bValue) {oTable.setBusy(bValue);}
		},
		CELLFILTER: {
			text: "Cell Filter",
			defaultValue: function(oTable) {
				return oTable.getEnableCellFilter();
			},
			input: "boolean",
			action: function(oTable, bValue) {oTable.setEnableCellFilter(bValue);}
		},
		AREAS: {
			text: "Areas",
			group: {
				OVERLAY: {
					text: "Overlay",
					defaultValue: function(oTable) {
						return oTable.getShowOverlay();
					},
					input: "boolean",
					action: function(oTable, bValue) {oTable.setShowOverlay(bValue);}
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
					defaultKey: "SHOWDATA",
					choice: {
						SHOWDATA: {
							text: "Show Data",
							action: function(oTable) {switchNoData(oTable, "SHOWDATA");}
						},
						TEXT: {
							text: "Text Message",
							action: function(oTable) {switchNoData(oTable, "TEXT");}
						},
						CUSTOM: {
							text: "Custom Control Message",
							action: function(oTable) {switchNoData(oTable, "CUSTOM");}
						},
						EMPTYCELLS: {
							text: "Show Empty Cells",
							action: function(oTable) {switchNoData(oTable, "EMPTYCELLS");}
						}
					}
				},
				FIXEDCOLUMNS: {
					text: "Fixed Columns",
					input: true,
					defaultValue: function(oTable) {
						return oTable.getFixedColumnCount();
					},
					action: function(oTable, sValue) {oTable.setFixedColumnCount(parseInt(sValue, 10) || 0);}
				},
				FIXEDROWS: {
					text: "Fixed Top Rows",
					input: true,
					defaultValue: function(oTable) {
						return oTable.getFixedRowCount();
					},
					action: function(oTable, sValue) {oTable.setFixedRowCount(parseInt(sValue, 10) || 0);}
				},
				FIXEDBOTTOMROWS: {
					text: "Fixed Bottom Rows",
					input: true,
					defaultValue: function(oTable) {
						return oTable.getFixedBottomRowCount();
					},
					action: function(oTable, sValue) {oTable.setFixedBottomRowCount(parseInt(sValue, 10) || 0);}
				},
				ROWACTIONS: {
					text: "Row Actions",
					defaultKey: "NONE",
					choice: {
						NAVIGATION : {
							text: "Navigation",
							action: function(oTable) {
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
								switchRowActions(oTable, 0, null);
							}
						}
					}
				}
			}
		},
		GROUPING: {
			text: "Grouping",
			defaultValue: function(oTable) {
				if (sap.ui.table.TableUtils.isInstanceOf(oTable, "sap/ui/table/TreeTable")) {
					return oTable.getUseGroupMode();
				} else {
					return oTable.getEnableGrouping();
				}
			},
			input: "boolean",
			action: function(oTable, bValue) {
				if (sap.ui.table.TableUtils.isInstanceOf(oTable, "sap/ui/table/TreeTable")) {
					oTable.setUseGroupMode(bValue);
				} else {
					oTable.setEnableGrouping(bValue);
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

	function initMenu(mActions) {
		var oMenu = new sap.ui.unified.Menu();
		for (var item in mActions) {
			var oItem;
			if (mActions[item].input) {
				if (typeof mActions[item].defaultValue == "function") {
					mActions[item].defaultValue = mActions[item].defaultValue(TABLESETTINGS.table);
				}
				var bIsBoolean = mActions[item].input == "boolean";
				var sValue = null;
				if (bIsBoolean) {
					sValue = mActions[item].defaultValue ? "X" : null;
				} else {
					sValue = mActions[item].defaultValue !== null && mActions[item].defaultValue !== undefined ? (mActions[item].defaultValue + "") : null
				}
				oItem = new sap.ui.unified.MenuTextFieldItem({value: sValue, label: mActions[item].text, visible: !mActions[item].hidden, enabled: !mActions[item].disabled});
				oItem._action = mActions[item].action;
				oItem._boolean = bIsBoolean;
				oItem.attachSelect(function(oEvent) {
					var oTFItem = oEvent.getParameter("item");
					oTFItem._action(TABLESETTINGS.table, oTFItem._boolean ? !!oTFItem.getValue() : oTFItem.getValue());
					setReopenTimer();
				});
			} else {
				oItem = new sap.ui.unified.MenuItem({text: mActions[item].text, visible: !mActions[item].hidden, enabled: !mActions[item].disabled});
				if (mActions[item].choice || mActions[item].group) {
					oItem.setSubmenu(initMenu(mActions[item].choice || mActions[item].group));
				} else {
					oItem._action = mActions[item].action;
					oItem.attachSelect(function(oEvent) {
						oEvent.getParameter("item")._action(TABLESETTINGS.table);
						setReopenTimer();
					});
				}
			}
			oMenu.addItem(oItem);
		}
		return oMenu;
	}

	function initFormElements(mActions, iLevel) {
		var aResult = [];

		function addSettings(oAction) {
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
				if (typeof oAction.defaultKey == "function") {
					oAction.defaultKey = oAction.defaultKey(TABLESETTINGS.table);
				}
				mSettings.selectedKey = oAction.defaultKey || null;
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
				if (typeof oAction.defaultValue == "function") {
					oAction.defaultValue = oAction.defaultValue(TABLESETTINGS.table);
				}
				mSettings.selected = oAction.defaultValue !== null && oAction.defaultValue !== undefined ? !!oAction.defaultValue : false;
				mSettings.select = function(oEvent) {
					if (oEvent.getSource()._action) {
						oEvent.getSource()._action(TABLESETTINGS.table, !!oEvent.getParameter("selected"));
					}
				};
			} else if (oAction.input) {
				oClass = sap.m.Input;
				if (typeof oAction.defaultValue == "function") {
					oAction.defaultValue = oAction.defaultValue(TABLESETTINGS.table);
				}
				mSettings.value = oAction.defaultValue !== null && oAction.defaultValue !== undefined ? (oAction.defaultValue + "") : null;
				mSettings.change = function(oEvent) {
					if (oEvent.getSource()._action) {
						oEvent.getSource()._action(TABLESETTINGS.table, oEvent.getParameter("value"));
					}
				};
			} else if (oAction.action) {
				oClass = sap.m.Button;
				mSettings.icon = "sap-icon://restart";
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

	function initDialog(mActions) {
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
		var oDialog = new sap.m.Dialog({
			title: "Table Settings",
			resizable: true,
			contentWidth: "1000px",
			content: [oForm],
			endButton: new sap.m.Button({
				text: "Close", press: function () { oDialog.close(); }
			})
		});

		var aFormElements = [];
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

		return oDialog;
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

		var oButton = new sap.m.Button({icon: "sap-icon://action-settings", tooltip: "Settings", press: function() {
			if (!oSettingsMenu) {
				oSettingsMenu = initDialog(TABLESETTINGS.actions);
			}
			oSettingsMenu.open();
		}});

		if (typeof vPlacement == "function") {
			vPlacement(oButton);
		} else {
			oButton.placeAt(vPlacement || "content");
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
				oSetting[item] = typeof mConfig[item].defaultValue == "function" ? mConfig[item].defaultValue(aColumns[i]) : mConfig[item].defaultValue;
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
				text: "Cancel", press: function () { oDialog.close(); }
			}),
			beginButton: new sap.m.Button({
				text: "Ok",
				press: function () {
					changeSettings();
					oDialog.close();
				}
			}),
			afterClose: function () { oDialog.destroy(); }
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

	var oCustom = new sap.m.Text({text: "Some custom no data control"});
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
		alert("Item " + (oItem.getText() || oItem.getType()) + " in row " + oRow.getIndex() + " pressed.");
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
