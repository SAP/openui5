/*
 * ! ${copyright}
 */

sap.ui.define([
	"../library", "sap/ui/core/Element"
], function(Library, Element) {
	"use strict";

	var TableType = Library.TableType;

	/**
	 * Constructor for a new <code>CreationRow</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Row that allows the user to enter data in a row-shaped form if the {@link sap.ui.mdc.TableType TableType} is "<code>Table</code>".
	 * The form elements are aligned with the columns of the table and are created automatically based on the
	 * {@link sap.ui.mdc.table.Column#getCreationTemplate creationTemplate} aggregation of the {@link sap.ui.mdc.table.Column}.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.65
	 * @alias sap.ui.mdc.table.CreationRow
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CreationRow = Element.extend("sap.ui.mdc.table.CreationRow", {
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
		this._sTableType = "";
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
		var oTable = this._getTable();
		var sNewTableType = oTable ? oTable._getStringType() : "";
		var pCreateInnerCreationRow;

		// If tableType is not switched OR no inner table exists --> do nothing
		if (this._sTableType === sNewTableType || !oTable || !oTable._oTable) {
			return Promise.resolve();
		}

		this._sTableType = sNewTableType;

		if (sNewTableType === TableType.Table) {
			pCreateInnerCreationRow = this._createGridTableCreationRow();
			oTable._oTable.getRowMode().setHideEmptyRows(this.getVisible());
		} else { // TableType.ResponsiveTable
			pCreateInnerCreationRow = this._createResponsiveTableCreationRow();
		}

		return pCreateInnerCreationRow.then(function(oInnerCreationRow) {
			insertCreationRow(oTable, oInnerCreationRow);
		});
	};

	function getModule(sModulePath) {
		return new Promise(function(resolve, reject) {
			sap.ui.require([
				sModulePath
			], function(oModule) {
				resolve(oModule);
			}, function(oError) {
				reject(oError);
			});
		});
	}

	CreationRow.prototype._createGridTableCreationRow = function() {
		return getModule("sap/ui/table/CreationRow").then(function(CreationRow) {
			cleanupCreationRow(this);
			this._oInnerCreationRow = new CreationRow(this.getId() + "-inner", {
				visible: this.getVisible(),
				applyEnabled: this.getApplyEnabled(),
				apply: [
					this._onInnerApply, this
				]
			});

			this._getTable()._oTable.getRowMode().setHideEmptyRows(this.getVisible());

			for (var sModelName in this._mBindingContexts) {
				var mBindingContext = this._mBindingContexts[sModelName];
				this._oInnerCreationRow.setBindingContext(mBindingContext.context, mBindingContext.modelName);
			}

			return this._oInnerCreationRow;
		}.bind(this));
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
		var oParent = this.getParent();
		return oParent && oParent.isA("sap.ui.mdc.Table") ? oParent : null;
	};

	return CreationRow;

});
