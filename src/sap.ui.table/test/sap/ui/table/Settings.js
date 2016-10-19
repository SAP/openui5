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
		DENSITY: {
			text: "Density",
			sub: {
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
		SELECTIONMODE: {
			text: "Selection Mode",
			sub: {
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
			sub: {
				NONE: {
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
		},
		ROWCOUNTMODE: {
			text: "Visible Row Count Mode",
			sub: {
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
		OVERLAY: {
			text: "Switch Overlay",
			action: function(oTable) {oTable.setShowOverlay(!oTable.getShowOverlay());}
		},
		NODATA: {
			text: "Switch NoData",
			action: switchNoData,
			setData: function(oTable, bClear) {
				if (bClear) {
					oTable.setModel(oEmptyModel);
				} else {
					oTable.setModel(TABLESETTINGS.model);
				}
			}
		},
		BUSY: {
			text: "Busy",
			action: function(oTable) {oTable.setBusy(!oTable.getBusy());}
		},
		FIXEDCOLUMNS: {
			text: "Fixed Columns",
			input: true,
			action: function(oTable, sValue) {oTable.setFixedColumnCount(parseInt(sValue, 10) || 0);}
		},
		FIXEDROWS: {
			text: "Fixed Top Rows",
			input: true,
			action: function(oTable, sValue) {oTable.setFixedRowCount(parseInt(sValue, 10) || 0);}
		},
		FIXEDBOTTOMROWS: {
			text: "Fixed Bottom Rows",
			input: true,
			action: function(oTable, sValue) {oTable.setFixedBottomRowCount(parseInt(sValue, 10) || 0);}
		},
		VISIBLEROWCOUNT: {
			text: "Visible Row Count",
			input: true,
			action: function(oTable, sValue) {oTable.setVisibleRowCount(parseInt(sValue, 10) || 0);}
		},
		GROUPING: {
			text: "Toogle Grouping",
			action: function(oTable) {
				if (sap.ui.table.TableUtils.isInstanceOf(oTable, "sap/ui/table/TreeTable")) {
					oTable.setUseGroupMode(!oTable.getUseGroupMode());
				} else {
					oTable.setEnableGrouping(!oTable.getEnableGrouping());
				}
			}
		},
	};

	var bInit = false;
	var oMenu = null;
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
				oItem = new sap.ui.unified.MenuTextFieldItem({label: mActions[item].text, visible: !mActions[item].hidden, enabled: !mActions[item].disabled});
				oItem._action = mActions[item].action;
				oItem.attachSelect(function(oEvent) {
					var oTFItem = oEvent.getParameter("item");
					oTFItem._action(TABLESETTINGS.table, oTFItem.getValue());
					setReopenTimer();
				});
			} else {
				oItem = new sap.ui.unified.MenuItem({text: mActions[item].text, visible: !mActions[item].hidden, enabled: !mActions[item].disabled});
				if (mActions[item].sub) {
					oItem.setSubmenu(initMenu(mActions[item].sub));
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

	TABLESETTINGS.init = function(oTable, sUIArea, mCustomActions) {
		if (bInit) {
			return;
		}
		bInit = true;

		try {
			sap.ui.getCore().loadLibrary("sap.ui.unified");
			sap.ui.getCore().loadLibrary("sap.m");
		} catch (e) {
			jQuery.sap.log.error("The table settings extension needs librarys 'sap.m' and 'sap.ui.unified'.");
			throw (e);
		}

		TABLESETTINGS.table = oTable;
		TABLESETTINGS.model = oTable.getModel();
		TABLESETTINGS.actions = jQuery.extend(true, {}, DEFAULTACTIONS, mCustomActions || {});

		var oButton = new sap.m.Button({text: "Settings", press: function() {
			if (!oMenu) {
				oMenu = initMenu(TABLESETTINGS.actions);
			}
			if (oReopenTimer) {
				return;
			}
			oMenu.open(false, oButton, sap.ui.core.Popup.Dock.BeginTop, sap.ui.core.Popup.Dock.BeginBottom, oButton);
		}});
		oButton.placeAt(sUIArea || "content");
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
	var iState = 0;
	var oEmptyModel = new sap.ui.model.json.JSONModel();

	function switchNoData(oTable) {
		iState++;
		switch (iState) {
			case 1:
				TABLESETTINGS.actions.NODATA.setData(oTable, true);
				oTable.setShowNoData(true);
				oTable.setNoData(null);
				break;
			case 2:
				TABLESETTINGS.actions.NODATA.setData(oTable, true);
				oTable.setShowNoData(true);
				oTable.setNoData(oCustom);
				break;
			case 3:
				TABLESETTINGS.actions.NODATA.setData(oTable, true);
				oTable.setShowNoData(false);
				oTable.setNoData(null);
				break;
			default:
			case 0:
				iState = 0;
				TABLESETTINGS.actions.NODATA.setData(oTable, false);
				oTable.setShowNoData(true);
				oTable.setNoData(null);
				break;
		}
	}

})();
