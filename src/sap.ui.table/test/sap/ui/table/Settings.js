(function() {

	try {
		sap.ui.getCore().loadLibrary("sap.ui.unified");
		sap.ui.getCore().loadLibrary("sap.m");
	} catch (e) {
		jQuery.sap.log.error("The table settings extension needs librarys 'sap.m' and 'sap.ui.unified'.");
		throw (e);
	}

	window.TABLESETTINGS = {};

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
				SINGLE: {
					text: "Row",
					action: function(oTable) {oTable.setSelectionBehavior("Row");}
				},
				MULTITOGGLE: {
					text: "RowOnly",
					action: function(oTable) {oTable.setSelectionBehavior("RowOnly");}
				}
			}
		},
		OVERLAY: {
			text: "Switch Overlay",
			action: function(oTable) {oTable.setShowOverlay(!oTable.getShowOverlay());}
		},
		NODATA: {
			text: "Switch NoData",
			action: switchNoData
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
		oReopenTimer = setTimeout(function() {oReopenTimer = null;}, 200);
	}

	function initMenu(mActions) {
		var oMenu = new sap.ui.unified.Menu();
		for (var item in mActions) {
			var oItem;
			if (mActions[item].input) {
				oItem = new sap.ui.unified.MenuTextFieldItem({label: mActions[item].text});
				oItem._action = mActions[item].action;
				oItem.attachSelect(function(oEvent) {
					var oTFItem = oEvent.getParameter("item");
					oTFItem._action(TABLESETTINGS.table, oItem.getValue());
					setReopenTimer();
				});
			} else {
				oItem = new sap.ui.unified.MenuItem({text: mActions[item].text});
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

		TABLESETTINGS.table = oTable;
		TABLESETTINGS.model = oTable.getModel();

		var oButton = new sap.m.Button({text: "Settings", press: function() {
			if (!oMenu) {
				oMenu = initMenu(jQuery.extend({}, DEFAULTACTIONS, mCustomActions || {}));
			}
			if (oReopenTimer) {
				return;
			}
			oMenu.open(false, oButton, sap.ui.core.Popup.Dock.BeginTop, sap.ui.core.Popup.Dock.BeginBottom, oButton);
		}});
		oButton.placeAt(sUIArea || "content");
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
				oTable.setModel(oEmptyModel);
				oTable.setShowNoData(true);
				oTable.setNoData(null);
				break;
			case 2:
				oTable.setModel(oEmptyModel);
				oTable.setShowNoData(true);
				oTable.setNoData(oCustom);
				break;
			case 3:
				oTable.setModel(oEmptyModel);
				oTable.setShowNoData(false);
				oTable.setNoData(null);
				break;
			default:
			case 0:
				iState = 0;
				oTable.setModel(TABLESETTINGS.model);
				oTable.setShowNoData(true);
				oTable.setNoData(null);
				break;
		}
	}

})();
