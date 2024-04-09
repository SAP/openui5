/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element", "sap/ui/mdc/enums/TableType"
], (Element, TableType) => {
	"use strict";

	/**
	 * Constructor for a new <code>CreationRow</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Row that allows the user to enter data in a row-shaped form if the {@link sap.ui.mdc.enums.TableType TableType} is "<code>Table</code>".
	 * The form elements are aligned with the columns of the table and are created automatically based on the
	 * {@link sap.ui.mdc.table.Column#getCreationTemplate creationTemplate} aggregation of the {@link sap.ui.mdc.table.Column}.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.65
	 * @alias sap.ui.mdc.table.CreationRow
	 */
	const CreationRow = Element.extend("sap.ui.mdc.table.CreationRow", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * If set to <code>false</code>, the {@link #event:apply apply} event is not fired. The corresponding keyboard shortcut and the
				 * apply button of the toolbar are disabled.
				 */
				applyEnabled: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * Determines whether the <code>sap.ui.mdc.table.CreationRow</code> and its inner control are in a busy state.
				 */
				busy: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Visibility of the <code>CreationRow</code>.
				 */
				visible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				}
			},
			events: {
				/**
				 * The event is fired when the corresponding keyboard shortcut or the apply button of the toolbar are pressed.
				 */
				apply: {
					allowPreventDefault: true
				}
			}
		}
	});

	CreationRow.prototype.init = function() {
		this._oInnerCreationRow = null;
		this._mBindingContexts = {};
	};

	CreationRow.prototype.exit = function() {
		if (this._oInnerCreationRow) {
			this._oInnerCreationRow.destroy();
			this._oInnerCreationRow = null;
		}

		this._mBindingContexts = null;
	};

	/**
	 * Sets the busy state on the inner <code>CreationRow</code> control.
	 *
	 * @param {boolean} bBusy Busy state that is applied to the inner control
	 * @returns {this}  Returns <code>this</code> to allow method chaining
	 * @private
	 */
	CreationRow.prototype.setBusy = function(bBusy) {
		this.setProperty('busy', bBusy, true);

		if (this._oInnerCreationRow) {
			this._oInnerCreationRow.setBusy(bBusy);
		}

		return this;
	};

	CreationRow.prototype.setBindingContext = function(oContext, sModelName) {
		Element.prototype.setBindingContext.call(this, oContext, sModelName);

		this._mBindingContexts[sModelName] = {
			context: oContext,
			modelName: sModelName
		};

		if (this._oInnerCreationRow) {
			this._oInnerCreationRow.setBindingContext(oContext, sModelName);
		}
		return this;
	};

	CreationRow.prototype.setApplyEnabled = function(bEnabled) {
		this.setProperty("applyEnabled", bEnabled, true);

		if (this._oInnerCreationRow) {
			this._oInnerCreationRow.setApplyEnabled(bEnabled);
		}

		return this;
	};

	CreationRow.prototype.setVisible = function(bVisible) {
		this.setProperty("visible", bVisible, true);

		if (this._oInnerCreationRow) {
			this._oInnerCreationRow.setVisible(bVisible);
			this._getTable()._oTable.getRowMode().setHideEmptyRows(bVisible);
		}

		return this;
	};

	CreationRow.prototype._onInnerApply = function(oEvent) {
		if (!this.fireApply()) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Updates the row based on the configuration of the table.
	 *
	 * @returns {Promise} <code>Promise</code> that resolves once the inner <code>CreationRow</code> control is updated
	 * @private
	 */
	CreationRow.prototype.update = function() {
		return this._updateInnerCreationRow();
	};

	CreationRow.prototype._updateInnerCreationRow = function() {
		const oTable = this._getTable();
		let pCreateInnerCreationRow;

		if (!oTable || !oTable._oTable) {
			return Promise.resolve();
		}

		if (oTable._isOfType(TableType.Table, true)) {
			if (!this._oInnerCreationRow || this._oInnerCreationRow.isDestroyed()) {
				pCreateInnerCreationRow = this._createGridTableCreationRow();
				oTable._oTable.getRowMode().setHideEmptyRows(this.getVisible());
			} else {
				pCreateInnerCreationRow = Promise.resolve();
			}
		} else {
			pCreateInnerCreationRow = this._createResponsiveTableCreationRow();
		}

		return pCreateInnerCreationRow.then((oInnerCreationRow) => {
			insertCreationRow(oTable, oInnerCreationRow);
		});
	};

	function getModule(sModulePath) {
		return new Promise((resolve, reject) => {
			sap.ui.require([
				sModulePath
			], (oModule) => {
				resolve(oModule);
			}, (oError) => {
				reject(oError);
			});
		});
	}

	CreationRow.prototype._createGridTableCreationRow = function() {
		return getModule("sap/ui/table/CreationRow").then((CreationRow) => {
			cleanupCreationRow(this);
			this._oInnerCreationRow = new CreationRow(this.getId() + "-inner", {
				visible: this.getVisible(),
				applyEnabled: this.getApplyEnabled(),
				apply: [
					this._onInnerApply, this
				]
			});

			this._getTable()._oTable.getRowMode().setHideEmptyRows(this.getVisible());

			for (const sModelName in this._mBindingContexts) {
				const mBindingContext = this._mBindingContexts[sModelName];
				this._oInnerCreationRow.setBindingContext(mBindingContext.context, mBindingContext.modelName);
			}

			return this._oInnerCreationRow;
		});
	};

	CreationRow.prototype._createResponsiveTableCreationRow = function() {
		// The CreationRow is currently not supported in the ResponsiveTable.
		cleanupCreationRow(this);

		return Promise.resolve();
	};

	function insertCreationRow(oMDCTable, oInnerCreationRow) {
		if (oMDCTable && oMDCTable._oTable && oInnerCreationRow) {
			oMDCTable._oTable.setCreationRow(oInnerCreationRow);
		}
	}

	function cleanupCreationRow(oMDCCreationRow) {
		if (oMDCCreationRow && oMDCCreationRow._oInnerCreationRow) {
			oMDCCreationRow._oInnerCreationRow.destroy();
			oMDCCreationRow._oInnerCreationRow = null;
		}
	}

	/**
	 * Gets the table in which this row is located.
	 *
	 * @return {sap.ui.mdc.Table|null} The instance of the table or <code>null</code>, if this row is not inside a table.
	 * @private
	 */
	CreationRow.prototype._getTable = function() {
		const oParent = this.getParent();
		return oParent && oParent.isA("sap.ui.mdc.Table") ? oParent : null;
	};

	return CreationRow;

});