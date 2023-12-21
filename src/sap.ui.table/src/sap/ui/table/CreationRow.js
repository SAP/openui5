/*!
 * ${copyright}
 */

// Provides control sap.ui.table.CreationRow.
sap.ui.define([
	"./CreationRowRenderer",
	"./Column",
	"./utils/TableUtils",
	"sap/ui/core/Control",
	"sap/m/library",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button"
], function(Renderer, Column, TableUtils, Control, MLibrary, OverflowToolbar, ToolbarSpacer, Button) {
	"use strict";

	/**
	 * Constructor for a new CreationRow.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Allows to enter data in a row shaped form, if placed inside a {@link sap.ui.table.Table}.
	 * The form elements (<code>cells</code> aggregation) are aligned with the columns of the table, and are created automatically based on the
	 * {@link sap.ui.table.Column#getCreationTemplate creationTemplate} aggregation of the {@link sap.ui.table.Column}.
	 *
	 * <b>Note:</b> This control is compatible only with the <code>sap.m</code> library. Do not use it together with the
	 * <code>sap.ui.commons</code> library.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @alias sap.ui.table.CreationRow
	 */
	const CreationRow = Control.extend("sap.ui.table.CreationRow", /** @lends sap.ui.table.CreationRow.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * If set to <code>false</code>, the {@link #event:apply apply} event is not fired. The corresponding keyboard shortcut and the
				 * apply button of the default toolbar are disabled.
				 */
				applyEnabled: {type: "boolean", group: "Behavior", defaultValue: true}
			},
			aggregations: {
				/**
				 * The actual cells are a table-internal construct. The controls in this aggregation are the content of the cells.
				 * This aggregation is managed by the table and must not be manipulated. Only read access is allowed.
				 */
				cells: {type: "sap.ui.core.Control", multiple: true, singularName: "cell"},

				/**
				 * The toolbar that is placed below the form.
				 * If no toolbar is set, a default toolbar is created. Basic buttons and functionality are provided only in the default toolbar.
				 */
				toolbar: {type: "sap.ui.core.Toolbar", multiple: false},

				/**
				 * The default toolbar.
				 */
				_defaultToolbar: {type: "sap.ui.core.Toolbar", multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * Fired when the corresponding keyboard shortcut or the apply button of the default toolbar are pressed.
				 */
				apply: {
					allowPreventDefault: true
				}
			}
		},
		renderer: Renderer
	});

	CreationRow.prototype.setApplyEnabled = function(bEnabled) {
		this.setProperty("applyEnabled", bEnabled, true);
		this._updateDefaultToolbar();
		return this;
	};

	CreationRow.prototype.setVisible = function(bVisible) {
		const bVisibleBefore = this.getVisible();
		const oTable = this.getTable();

		this.setProperty("visible", bVisible);

		if (bVisibleBefore !== bVisible && oTable) {
			oTable.invalidate();
		}

		return this;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	CreationRow.prototype.setParent = function(oParent) {
		Control.prototype.setParent.apply(this, arguments);
		this._update();
		return this;
	};

	/**
	 * Sets the focus to the first editable form element.
	 *
	 * @return {boolean} Whether the focus was set
	 * @public
	 */
	CreationRow.prototype.resetFocus = function() {
		const oInteractiveElement = TableUtils.getFirstInteractiveElement(this);

		if (oInteractiveElement) {
			oInteractiveElement.focus();
			if (oInteractiveElement instanceof window.HTMLInputElement) {
				oInteractiveElement.select();
			}
			return true;
		}

		return false;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	CreationRow.prototype.getFocusDomRef = function() {
		const oInteractiveElement = TableUtils.getFirstInteractiveElement(this);

		if (oInteractiveElement) {
			return oInteractiveElement;
		}

		return Control.prototype.getFocusDomRef.apply(this, arguments);
	};

	/**
	 * Fires the apply event and resets the focus, if the default action was not prevented.
	 *
	 * @returns {boolean} Whether the focus was set or not.
	 * @private
	 */
	CreationRow.prototype._fireApply = function() {
		let bFocusSet = false;

		if (this.fireApply()) {
			bFocusSet = this.resetFocus();
		}

		return bFocusSet;
	};

	/*
	 * The FocusHandler triggers the <code>sapfocusleave</code> event in a timeout of 0ms after a blur event. To give the control in the cell
	 * enough time to react to the <code>sapfocusleave</code> event (e.g. sap.m.Input - changes its value), the <code>apply<code/> event is fired
	 * asynchronously.
	 */
	function setEventMarkedAndFireApplyAsync(oCreationRow, oEvent) {
		const oFocusedElement = document.activeElement;

		oCreationRow.getTable().getDomRef("focusDummy").focus();
		oEvent.setMarked();

		window.setTimeout(function() {
			if (!oCreationRow._fireApply()) {
				oFocusedElement.focus();
			}
		}, 0);
	}

	/**
	 * Event handler called when the enter key is pressed inside the CreationRow. It fires the <code>apply</code> event only if the inner
	 * focused control has not handled the event already.
	 *
	 * @param {jQuery.Event} oEvent The ENTER keyboard key event object
	 */
	CreationRow.prototype.onsapenter = function(oEvent) {
		if (this.getApplyEnabled() && !oEvent.isMarked()) {
			setEventMarkedAndFireApplyAsync(this, oEvent);
		}
	};

	/**
	 * Event handler called when the enter key is pressed in combination with modifier keys (Meta or Ctrl) inside the CreationRow.
	 *
	 * @param {jQuery.Event} oEvent The ENTER keyboard key event object
	 */
	CreationRow.prototype.onsapentermodifiers = function(oEvent) {
		if (this.getApplyEnabled() && (oEvent.metaKey || oEvent.ctrlKey)) {
			setEventMarkedAndFireApplyAsync(this, oEvent);
		}
	};

	/**
	 * Creates a default toolbar providing basic buttons and functionality.
	 *
	 * @param {sap.ui.table.CreationRow} oCreationRow The creation row to get the settings for the toolbar creation from.
	 * @returns {sap.m.OverflowToolbar} The default toolbar.
	 */
	function createDefaultToolbar(oCreationRow) {
		return new OverflowToolbar(oCreationRow.getId() + "-tb", {
			content: [
				new ToolbarSpacer(),
				new Button(oCreationRow.getId() + "-applyBtn", {
					text: TableUtils.getResourceText("TBL_CREATIONROW_APPLY"),
					enabled: oCreationRow.getApplyEnabled(),
					press: function() {
						oCreationRow._fireApply();
					}
				})
			],
			style: MLibrary.ToolbarStyle.Clear,
			ariaLabelledBy: [oCreationRow.getId() + "-label"]
		});
	}

	/**
	 * Gets either the toolbar or the default toolbar if none is set.
	 *
	 * @returns {sap.ui.core.Toolbar} The toolbar that should be used in the <code>CreationRow</code>.
	 * @private
	 */
	CreationRow.prototype._getToolbar = function() {
		let oToolbar = this.getToolbar();

		if (!oToolbar) {
			let oDefaultToolbar = this.getAggregation("_defaultToolbar");

			if (!oDefaultToolbar) {
				oDefaultToolbar = createDefaultToolbar(this);
				this.setAggregation("_defaultToolbar", oDefaultToolbar, true);
			}

			oToolbar = oDefaultToolbar;

			if (oToolbar.data("sap-ui-table-invalid")) {
				this._updateDefaultToolbar();
			}
		}

		return oToolbar;
	};

	/**
	 * Updates the default toolbar. For example, the enabled state of the apply button is updated according to the <code>applyEnabled</code>
	 * property value.
	 * If a toolbar is set, the default toolbar is not updated, but just marked as "invalid". It will then be updated the next time
	 * the default toolbar is returned by {@link #_getToolbar}.
	 *
	 * @private
	 */
	CreationRow.prototype._updateDefaultToolbar = function() {
		const oDefaultToolbar = this.getAggregation("_defaultToolbar");

		if (this.getToolbar()) {
			// No need to update the default toolbar if a custom toolbar is used.
			if (oDefaultToolbar) {
				oDefaultToolbar.data("sap-ui-table-invalid", true);
			}
			return;
		}

		if (!oDefaultToolbar) {
			return;
		}

		const oApplyButton = oDefaultToolbar.getContent()[1];

		oApplyButton.setEnabled(this.getApplyEnabled());
		oDefaultToolbar.data("sap-ui-table-invalid", null);
	};

	/**
	 * Gets the cell control of the corresponding column.
	 *
	 * @param {int} iColumnIndex The index of the column in the table's columns aggregation.
	 * @return {sap.ui.core.Control|null} The cell control.
	 * @private
	 */
	CreationRow.prototype._getCell = function(iColumnIndex) {
		const aCells = this.getCells();
		const oCell = aCells.filter(function(oCell) {
			return Column.ofCell(oCell).getIndex() === iColumnIndex;
		})[0];

		if (!oCell) {
			return null;
		}

		return oCell;
	};

	/**
	 * Gets the cell DOM element of the corresponding column.
	 *
	 * @param {int} iColumnIndex The index of the column in the table's columns aggregation.
	 * @return {HTMLElement|null} The cell DOM element.
	 * @private
	 */
	CreationRow.prototype._getCellDomRef = function(iColumnIndex) {
		const oCell = this._getCell(iColumnIndex);
		const oCellContent = oCell ? oCell.getDomRef() : null;
		const $Cell = TableUtils.getCell(this.getTable(), oCellContent, true);

		if (!$Cell) {
			return null;
		}

		return $Cell;
	};

	/**
	 * Focuses the first interactive element in a cell of the corresponding column.
	 * If the cell has no interactive elements, the focus will not be set.
	 *
	 * @param {int} iColumnIndex The index of the column in the table's columns aggregation.
	 * @return {boolean} Whether the focus was set.
	 * @private
	 */
	CreationRow.prototype._focusCell = function(iColumnIndex) {
		const oCellDomRef = this._getCellDomRef(iColumnIndex);
		const $InteractiveElements = TableUtils.getInteractiveElements(oCellDomRef);

		if ($InteractiveElements) {
			$InteractiveElements[0].focus();
			if ($InteractiveElements[0] instanceof window.HTMLInputElement) {
				$InteractiveElements[0].select();
			}
			return true;
		}

		return false;
	};

	/**
	 * The row takes over keyboard handling within the table.
	 *
	 * @param {jQuery.Event} [oEvent] The event object, if the keyboard handling takeover is triggered by an event.
	 * @return {boolean} Whether the keyboard handling was taken over.
	 * @private
	 */
	CreationRow.prototype._takeOverKeyboardHandling = function(oEvent) {
		const oTable = this.getTable();
		const oTableDomRef = oTable ? oTable.getDomRef() : null;

		if (!oTableDomRef || !oTableDomRef.contains(document.activeElement)) {
			// Keyboard handling will not be taken over if the table is not rendered or the focus is not inside the table.
			return false;
		}

		const oCell = TableUtils.getCell(this.getTable(), document.activeElement);
		const oCellInfo = TableUtils.getCellInfo(oCell);
		let bFocusSet = false;

		if (oCellInfo.columnIndex != null && oCellInfo.columnIndex >= 0) {
			// If the currently focused element is a table cell with a column index information, the keyboard handling will only be taken over if the
			// cell of the corresponding column in this row contains an interactive element.
			bFocusSet = this._focusCell(oCellInfo.columnIndex);
		} else {
			bFocusSet = this.resetFocus();
		}

		if (bFocusSet && oEvent) {
			oEvent.preventDefault(); // Prevent positioning the cursor. The text should be selected instead.
		}

		return bFocusSet; // The keyboard handling is only taken over if the focus was set into the CreationRow.
	};

	/**
	 * Updates the row (e.g. the cells) based on the configuration of the table this row is inside.
	 *
	 * @private
	 */
	CreationRow.prototype._update = function() {
		const oTable = this.getTable();

		if (!oTable) {
			this.removeAllCells();
			return;
		}

		const aColumns = oTable.getColumns();

		this.removeAllCells();

		for (let i = 0, l = aColumns.length; i < l; i++) {
			if (aColumns[i].getVisible()) {
				this.addCell(aColumns[i].getTemplateClone(i, "Creation"));
			}
		}
	};

	/**
	 * Gets the table this row is inside.
	 *
	 * @return {sap.ui.table.Table|null} The instance of the table or <code>null</code>, if this row is not inside a table.
	 * @private
	 */
	CreationRow.prototype.getTable = function() {
		const oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Table") ? oParent : null;
	};

	return CreationRow;
});