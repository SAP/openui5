/* global QUnit */

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'../../pages/Actions',
	'../../pages/Assertions',
	'../../pages/Arrangements',
	'../../pages/Keyboard',
	'../../pages/Mouse',
	'../../utils/Util'
], function (
	Opa5,
	opaTest,
	Actions,
	Assertions,
	Arrangements,
	Keyboard,
	Mouse,
	Util
) {
	"use strict";

	Opa5.extendConfig({
		arrangements: Arrangements,
		actions: Actions,
		assertions: Assertions,
		autoWait: true,
		async: true,
		timeout: 40
	});

	[{dir: "LTR", forward: true }, {dir: "RTL", forward: false }].forEach((oConfig) => {
		QUnit.module("Keyboard - " + oConfig.dir);

		opaTest("App startup", function(Given, When, Then) {
			// Setup
			Given.iStartMyGridTableApp(oConfig.dir);

			// Act
			When.iLookAtTheScreen();

			// Assert
			Then.iSeeGridTable();
		});

		opaTest("Single Cell Interaction", function (Given, When, Then) {
			// Act: Select Cell at 0, 0 | Assert: Cell 0, 0 should be selected
			When.iFocusCell(0, 0);
			When.Keyboard.iSelectDeselectCell(0, 0);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 0, colIndex: 0 });

			// Act: Deselect Cell at 0, 0 | Assert: Cell 0, 0 should not be selected
			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected();

			// Act: Select Cell at 0, 0 | Assert: Cell 0, 0 should be selected
			When.Keyboard.iSelectDeselectCell(0, 0);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 0, colIndex: 0});
			Then.iSeeCellFocused({ rowIndex: 0, colIndex: 0 });

			// Act: Select Cell at 0, 1 | Assert: Cell 0, 0 should not be selected. Cell 0, 1 should be selected
			When.Keyboard.iNavigate(true, oConfig.forward);
			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 1 }, { rowIndex: 0, colIndex: 1});
			Then.iSeeCellFocused({ rowIndex: 0, colIndex: 1 });

			// Act: Navigate with Arrow Keys | Assert: Cell should not be deselected
			When.Keyboard.iNavigate(true, oConfig.forward);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 1 }, { rowIndex: 0, colIndex: 1});
			Then.iSeeCellFocused({ rowIndex: 0, colIndex: 2 });

			When.Keyboard.iNavigate(true, !oConfig.forward);
			When.Keyboard.iNavigate(true, !oConfig.forward);
			When.Keyboard.iNavigate(false, true);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 1 }, { rowIndex: 0, colIndex: 1});

			When.Keyboard.iRemoveSelection();
		});

		opaTest("Extend/Decrease selection area", function(Given, When, Then) {
			// Select single cell. Then extend.
			When.iFocusCell(1, 1);
			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 1 });

			When.Keyboard.iSelectNextCell(true, oConfig.forward);
			When.Keyboard.iSelectNextCell(true, oConfig.forward);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 3 });

			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 3, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 3, colIndex: 3 });

			// Focus middle. Try selecting next cells. Selection should not change.
			When.iFocusCell(2, 2);
			When.Keyboard.iSelectNextCell(true, oConfig.forward);
			Then.iSeeCellFocused({ rowIndex: 2, colIndex: 3 });
			When.Keyboard.iSelectNextCell(false, false);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 3, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 3 });

			// Continue with normal extending/decreasing
			When.iFocusCell(3, 3);

			When.Keyboard.iSelectNextCell(true, !oConfig.forward);
			When.Keyboard.iSelectNextCell(true, !oConfig.forward);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 3, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 3, colIndex: 1 });

			When.Keyboard.iSelectNextCell(true, !oConfig.forward);
			When.Keyboard.iSelectNextCell(false, false, 3, 0);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 0 }, { rowIndex: 2, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 2, colIndex: 0 });

			When.iFocusCell(2, 0);
			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected();

			When.iFocusCell(1, 1);
			When.Keyboard.iSelectNextCell(true, oConfig.forward);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 2 });

			When.iFocusCell(2, 1);
			When.Keyboard.iSelectNextCell(false, true);
			Then.iSeeCellsSelected({ rowIndex: 2, colIndex: 1 }, { rowIndex: 3, colIndex: 1 });

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Scroll down
			When.iFocusCell(9, 1);
			When.Keyboard.iSelectDeselectCell();

			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);

			When.iFocusCell(4, 1);
			Then.iSeeCellsSelected({ rowIndex: 9, colIndex: 1 }, { rowIndex: 13, colIndex: 1 });

			When.Keyboard.iNavigate(false, false);
			When.Keyboard.iNavigate(false, false);
			When.Keyboard.iNavigate(false, false);
			When.Keyboard.iNavigate(false, false);

			Then.iSeeCellsSelected({ rowIndex: 9, colIndex: 1 }, { rowIndex: 9, colIndex: 1 });

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Scroll up
			When.iFocusCell(9, 1);
			When.Keyboard.iNavigate(false, true);
			When.Keyboard.iNavigate(false, true);
			When.Keyboard.iNavigate(false, true);
			When.Keyboard.iNavigate(false, true);

			When.iFocusCell(4, 1);

			When.Keyboard.iSelectNextCell(false, false);
			When.Keyboard.iSelectNextCell(false, false);
			When.Keyboard.iSelectNextCell(true, !oConfig.forward);
			When.Keyboard.iSelectNextCell(false, false);
			When.Keyboard.iSelectNextCell(false, false);

			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 4, colIndex: 1 });

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();
		});

		opaTest("Row Selection", function(Given, When, Then) {
			// Selection Mode: None
			Given.iChangeSelectionMode(Util.GridTableSelectionMode.None);

			When.iFocusCell(1, 1);
			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 1 });

			// Try selecting rows. Nothing should change.
			When.Keyboard.iSelectRows();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeRowsSelected();

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Selection Mode: Single
			Given.iChangeSelectionMode(Util.GridTableSelectionMode.Single);

			When.iFocusCell(1, 1);
			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 1 });

			// Try selecting rows. Row should be selected. Cell Selection gone.
			When.Keyboard.iSelectRows();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(1, 1);

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Try selecting multi rows. Only one row selected.
			When.iFocusCell(1, 1);
			When.Keyboard.iSelectDeselectCell();
			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);

			When.Keyboard.iSelectRows();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(3, 3);

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Selection Mode: Multi
			Given.iChangeSelectionMode(Util.GridTableSelectionMode.Multi);

			When.iFocusCell(1, 1);
			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 1 });

			// Try selecting single row.
			When.Keyboard.iSelectRows();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(1, 1);

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Try selecting multi rows. 3 rows should be selected.
			When.iFocusCell(1, 1);
			When.Keyboard.iSelectDeselectCell();
			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);

			When.Keyboard.iSelectRows();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(1, 3);

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();
		});

		opaTest("Removing Selection", function(Given, When, Then) {
			function selectBlock() {
				// Select single cell. Then extend.
				When.iFocusCell(1, 1);
				When.Keyboard.iSelectNextCell(true, oConfig.forward);
				When.Keyboard.iSelectNextCell(true, oConfig.forward);
				Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 3 });
				Then.iSeeCellFocused({ rowIndex: 1, colIndex: 3 });
			}

			function selectRows() {
				When.iFocusCell(3, 3);
				When.Keyboard.iSelectDeselectCell();
				When.Keyboard.iSelectNextCell(false, true);

				When.Keyboard.iSelectRows();
				Then.iSeeCellsSelected();
				Then.iSeeRowsSelected(3, 4);
			}

			// Using CTRL + SHIFT + A
			selectBlock();
			When.iFocusCell(3, 3);
			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Using ESC
			selectBlock();
			When.iFocusCell(3, 3);
			When.Keyboard.iRemoveSelection(true);
			Then.iSeeCellsSelected();

			// Using CTRL + SHIFT + A => everything is cleared
			selectRows();
			selectBlock();
			When.iFocusCell(0, 0);
			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected();

			// Using ESC => only cells are cleared
			selectRows();
			selectBlock();
			When.iFocusCell(0, 0);
			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(3, 4);

			// Trying to clear when focus is in input => nothing happens
			selectBlock();
			When.iFocusCell(1, 2);
			When.Keyboard.iSelectInnerControl();
			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 3 });

			When.Keyboard.iRemoveSelection(true);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 3 });

			When.Keyboard.iSelectInnerControl();
			When.Keyboard.iRemoveSelection(true);
			Then.iSeeCellsSelected();


			// Trying to clear with 2x CTRL + A with Select All => clears selection, also clears cells
			Given.iChangeSelectAllState(true);

			selectBlock();
			When.iFocusCell(1, 1);
			When.Keyboard.iSelectAll();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(0, 114);

			When.Keyboard.iSelectAll();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected();

			When.Keyboard.iRemoveSelection(true);
			Then.iSeeCellsSelected();
			Given.iChangeSelectAllState(false);
		});

		opaTest("Column Selection", function(Given, When, Then) {
			let rangeLimit = 200; // Default range limit

			// Select column with default range limit
			When.iFocusCell(1, 1);
			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 1 });

			When.Keyboard.iSelectColumns();
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 1 }, { rowIndex: rangeLimit - 1, colIndex: 1 });

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Select single column with range limit 5
			rangeLimit = 5;

			Given.iChangeRangeLimit(rangeLimit);
			When.iFocusCell(1, 1);

			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 1 });

			When.Keyboard.iSelectColumns();
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 1 }, { rowIndex: rangeLimit - 1, colIndex: 1 });

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Select multiple columns with range limit 5
			When.iFocusCell(1, 1);

			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 1 });

			When.Keyboard.iSelectNextCell(true, oConfig.forward);
			When.Keyboard.iSelectNextCell(true, oConfig.forward);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 3 });

			When.Keyboard.iSelectColumns();
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 1 }, { rowIndex: rangeLimit - 1, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 3});

			// Extend Column Selection
			When.Keyboard.iSelectNextCell(true, !oConfig.forward);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 1 }, { rowIndex: rangeLimit - 1, colIndex: 2 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 2});

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			// Select column, then focus cell that is not part of selection -> columns of focused cell should be selected
			When.iFocusCell(1, 1);

			When.Keyboard.iSelectDeselectCell();
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 1 });

			When.Keyboard.iSelectNextCell(true, oConfig.forward);
			When.Keyboard.iSelectNextCell(true, oConfig.forward);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 3 });

			When.Keyboard.iSelectColumns();
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 1 }, { rowIndex: rangeLimit - 1, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 3});

			When.iFocusCell(4, 4);
			When.Keyboard.iSelectColumns();
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 4 }, { rowIndex: rangeLimit - 1, colIndex: 4 });

			When.Keyboard.iRemoveSelection();
			Then.iSeeCellsSelected();

			Given.iChangeRangeLimit(200);
		});

		opaTest("Row- and Cell Selection interaction", function(Given, When, Then) {
			// No selection at all => cells should be selected
			When.iFocusCell(1, 1);
			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 3, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 3, colIndex: 1 });

			When.Keyboard.iSelectRows();
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(1, 3);

			// Focus row and try to extend row selection => row selection extends
			When.iFocusCell(3, 1);
			When.Keyboard.iSelectNextCell(false, true);

			Then.iSeeCellFocused({ rowIndex: 4, colIndex: 1});
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(1, 4);

			// Focus selected row with a cell selection block and extend => cell selection extends
			When.iFocusCell(4, 1);
			When.Keyboard.iSelectDeselectCell();
			When.Keyboard.iSelectNextCell(false, true);

			Then.iSeeCellFocused({ rowIndex: 5, colIndex: 1 });
			Then.iSeeCellsSelected({ rowIndex: 4, colIndex: 1 }, { rowIndex: 5, colIndex: 1 });
			Then.iSeeRowsSelected(1, 4);

			When.Keyboard.iSelectNextCell(false, false);
			When.Keyboard.iSelectNextCell(false, false);
			When.Keyboard.iSelectNextCell(false, false);

			Then.iSeeCellFocused({ rowIndex: 2, colIndex: 1 });
			Then.iSeeCellsSelected({ rowIndex: 2, colIndex: 1 }, { rowIndex: 4, colIndex: 1 });
			Then.iSeeRowsSelected(1, 4);

			// Focus selected row with cell selection block, but focus is outside of block => extend row selection and clear cells
			When.iFocusCell(4, 2);
			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);

			Then.iSeeCellFocused({ rowIndex: 6, colIndex: 2 });
			Then.iSeeCellsSelected();
			Then.iSeeRowsSelected(1, 6);

			// Focus outside any selection => new selection block
			When.iFocusCell(0, 0);
			When.Keyboard.iSelectNextCell(false, true);
			When.Keyboard.iSelectNextCell(false, true);

			Then.iSeeCellFocused({ rowIndex: 2, colIndex: 0 });
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 2, colIndex: 0 });
			Then.iSeeRowsSelected(1, 6);

			Then.iTeardownMyApp();
		});

		QUnit.module("Mouse - " + oConfig.dir);

		opaTest("App startup", function(Given, When, Then) {
			// Setup
			Given.iStartMyGridTableApp(oConfig.dir);

			// Act
			When.iLookAtTheScreen();

			// Assert
			Then.iSeeGridTable();
		});

		opaTest("Single cell selection", function(Given, When, Then) {
			// Select and deselect 0 0
			When.Mouse.iSelectDeselectCell(0, 0);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 0, colIndex: 0 });
			Then.iSeeCellFocused({ rowIndex: 0, colIndex: 0 });

			When.Mouse.iSelectDeselectCell(0, 0);
			Then.iSeeCellsSelected();
			Then.iSeeCellFocused({ rowIndex: 0, colIndex: 0 });

			// Select 0 0 and then select other cell
			When.Mouse.iSelectDeselectCell(0, 0);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 0, colIndex: 0 });
			Then.iSeeCellFocused({ rowIndex: 0, colIndex: 0 });

			When.Mouse.iSelectDeselectCell(2, 2);
			Then.iSeeCellsSelected({ rowIndex: 2, colIndex: 2 }, { rowIndex: 2, colIndex: 2 });
			Then.iSeeCellFocused({ rowIndex: 2, colIndex: 2 });

			When.Mouse.iSelectDeselectCell(2, 2);
			Then.iSeeCellsSelected();
			Then.iSeeCellFocused({ rowIndex: 2, colIndex: 2 });
		});

		opaTest("Initial Cell Range Selection", function(Given, When, Then) {
			// Mousedown and move to second cell
			When.Mouse.iPressCell(1, 1);
			Then.iSeeCellsSelected();

			When.Mouse.iExtendTo(1, 2, true);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 2 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 2 });

			When.Mouse.iSelectDeselectCell(1, 2);
			Then.iSeeCellsSelected();

			// Select larger area
			When.Mouse.iPressCell(1, 1);
			Then.iSeeCellsSelected();

			When.Mouse.iExtendTo(1, 2);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 2 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 2 });

			When.Mouse.iExtendTo(1, 5);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 1, colIndex: 5 });
			Then.iSeeCellFocused({ rowIndex: 1, colIndex: 5 });

			When.Mouse.iExtendTo(3, 3);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 3, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 3, colIndex: 3 });

			When.Mouse.iExtendTo(5, 5);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 5, colIndex: 5 });
			Then.iSeeCellFocused({ rowIndex: 5, colIndex: 5 });

			When.Mouse.iExtendTo(2, 2);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 2, colIndex: 2 });
			Then.iSeeCellFocused({ rowIndex: 2, colIndex: 2 });

			When.Mouse.iExtendTo(0, 0);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 1, colIndex: 1 });
			Then.iSeeCellFocused({ rowIndex: 0, colIndex: 0 });

			When.Mouse.iExtendTo(5, 5, true);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 5, colIndex: 5 });
			Then.iSeeCellFocused({ rowIndex: 5, colIndex: 5 });

			// Select new block
			When.Mouse.iPressCell(0, 0);
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 5, colIndex: 5 });
			Then.iSeeCellFocused({ rowIndex: 0, colIndex: 0 });

			When.Mouse.iExtendTo(2, 0, true);
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 2, colIndex: 0 });
			Then.iSeeCellFocused({ rowIndex: 2, colIndex: 0 });

			When.Mouse.iSelectDeselectCell(0, 0);
			Then.iSeeCellsSelected();
		});

		opaTest("Border & Edge Selection", function(Given, When, Then) {
			const bIsRTL = oConfig.dir == "RTL";

			When.Mouse.iPressCell(2, 2);
			Then.iSeeCellsSelected();

			When.Mouse.iExtendTo(5, 3, true);
			Then.iSeeCellsSelected({ rowIndex: 2, colIndex: 2 }, { rowIndex: 5, colIndex: 3 });
			Then.iSeeCellFocused({ rowIndex: 5, colIndex: 3 });

			// Check border states
			When.Mouse.iHoverBorder("bottom", { rowIndex: 2, colIndex: 2 }, { rowIndex: 5, colIndex: 3 }, bIsRTL);
			Then.iCheckBorderState(true, true, 5);

			When.Mouse.iHoverBorder("top", { rowIndex: 2, colIndex: 2 }, { rowIndex: 5, colIndex: 3 }, bIsRTL);
			Then.iCheckBorderState(true, false, 2);

			When.Mouse.iHoverBorder("left", { rowIndex: 2, colIndex: 2 }, { rowIndex: 5, colIndex: 3 }, bIsRTL);
			Then.iCheckBorderState(false, false, bIsRTL ? 3 : 2);

			When.Mouse.iHoverBorder("right", { rowIndex: 2, colIndex: 2 }, { rowIndex: 5, colIndex: 3 }, bIsRTL);
			Then.iCheckBorderState(false, true, bIsRTL ? 2 : 3);

			// Extending different borders
			When.Mouse.iExtendBorderTo("bottom", { rowIndex: 2, colIndex: 2 }, { rowIndex: 5, colIndex: 3 }, { rowIndex: 7, colIndex: 3 }, bIsRTL);
			Then.iSeeCellsSelected({ rowIndex: 2, colIndex: 2 }, { rowIndex: 7, colIndex: 3 });

			When.Mouse.iExtendBorderTo("top", { rowIndex: 2, colIndex: 2 }, { rowIndex: 7, colIndex: 3 }, { rowIndex: 5, colIndex: 3 }, bIsRTL);
			Then.iSeeCellsSelected({ rowIndex: 5, colIndex: 2 }, { rowIndex: 7, colIndex: 3 });

			When.Mouse.iExtendBorderTo(bIsRTL ? "right" : "left", { rowIndex: 5, colIndex: 2 }, { rowIndex: 7, colIndex: 3 }, { rowIndex: 7, colIndex: 0 }, bIsRTL);
			Then.iSeeCellsSelected({ rowIndex: 5, colIndex: 0 }, { rowIndex: 7, colIndex: 3 });

			When.Mouse.iExtendBorderTo(bIsRTL ? "left" : "right", { rowIndex: 5, colIndex: 2 }, { rowIndex: 7, colIndex: 3 }, { rowIndex: 5, colIndex: 5 }, bIsRTL);
			Then.iSeeCellsSelected({ rowIndex: 5, colIndex: 0 }, { rowIndex: 7, colIndex: 5 });

			// Check edge states
			When.Mouse.iHoverEdge(true, oConfig.forward, { rowIndex: 5, colIndex: 0 });
			Then.iCheckEdgeState(true, oConfig.forward, 5, 0);

			When.Mouse.iHoverEdge(true, !oConfig.forward, { rowIndex: 5, colIndex: 5 });
			Then.iCheckEdgeState(true, !oConfig.forward, 5, 5);

			When.Mouse.iHoverEdge(false, !oConfig.forward, { rowIndex: 7, colIndex: 5 });
			Then.iCheckEdgeState(false, !oConfig.forward, 7, 5);

			When.Mouse.iHoverEdge(false, oConfig.forward, { rowIndex: 7, colIndex: 0 });
			Then.iCheckEdgeState(false, oConfig.forward, 7, 0);

			// Extending different edges
			When.Mouse.iExtendEdgeTo(true, oConfig.forward, { rowIndex: 5, colIndex: 0 }, { rowIndex: 2, colIndex: 2 });
			Then.iSeeCellsSelected({ rowIndex: 2, colIndex: 2 }, { rowIndex: 7, colIndex: 5 });

			When.Mouse.iExtendEdgeTo(true, oConfig.forward, { rowIndex: 2, colIndex: 2 }, { rowIndex: 9, colIndex: 1 });
			Then.iSeeCellsSelected({ rowIndex: 7, colIndex: 1 }, { rowIndex: 9, colIndex: 5 });

			When.Mouse.iExtendEdgeTo(true, !oConfig.forward, { rowIndex: 7, colIndex: 5 }, { rowIndex: 1, colIndex: 3 });
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 1 }, { rowIndex: 9, colIndex: 3 });

			When.Mouse.iExtendEdgeTo(false, oConfig.forward, { rowIndex: 9, colIndex: 1 }, { rowIndex: 5, colIndex: 5 });
			Then.iSeeCellsSelected({ rowIndex: 1, colIndex: 3 }, { rowIndex: 5, colIndex: 5 });

			When.Mouse.iExtendEdgeTo(false, !oConfig.forward, { rowIndex: 5, colIndex: 5 }, { rowIndex: 0, colIndex: 0 });
			Then.iSeeCellsSelected({ rowIndex: 0, colIndex: 0 }, { rowIndex: 1, colIndex: 3 });

			When.Mouse.iSelectDeselectCell(0, 0);
			Then.iSeeCellsSelected();

			Then.iTeardownMyApp();
		});
	});
});
