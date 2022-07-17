/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new <code>TableTypeBase</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info base class for the metadata-driven table. Base class with no implementation.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 * @abstract
	 * @experimental
	 * @since 1.65
	 * @alias sap.ui.mdc.table.TableTypeBase
	 * @ui5-metamodel This element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TableTypeBase = Element.extend("sap.ui.mdc.table.TableTypeBase", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {}
		}
	});

	TableTypeBase.prototype.setProperty = function(sProperty, vValue, bSupressInvalidate) {
		Element.prototype.setProperty.call(this, sProperty, vValue, true);
		var oTable = this.getRelevantTable();
		if (oTable) {
			this.updateRelevantTableProperty(oTable, sProperty, vValue);
		}
		return this;
	};

	// Should be implemented in the actual types
	TableTypeBase.prototype.updateRelevantTableProperty = function(oTable, sProperty, vValue) {

	};

	TableTypeBase.prototype.getRelevantTable = function() {
		var oTable = this.getParent();
		if (oTable && oTable.isA("sap.ui.mdc.Table")) {
			// get the right inner table
			oTable = oTable._oTable;
		} else {
			oTable = null;
		}
		return oTable;
	};

	TableTypeBase.prototype.updateTableSettings = function(mAdditionalProperties) {
		var mProperties = Object.assign({}, mAdditionalProperties, this.getMetadata().getProperties()), sProperty, oTable = this.getRelevantTable();
		if (oTable) {
			for (sProperty in mProperties) {
				this.updateRelevantTableProperty(oTable, sProperty, this.getProperty(sProperty));
			}
		}
	};

	TableTypeBase.getSelectionMode = function(oTable) {
		var sSelectionMode = oTable.getSelectionMode();
		switch (sSelectionMode) {
			case "Single":
				sSelectionMode = oTable._bMobileTable ? "SingleSelectLeft" : "Single";
				break;
			case "Multi":
				sSelectionMode = oTable._bMobileTable ? "MultiSelect" : "MultiToggle";
				break;
			default:
				sSelectionMode = "None";
		}
		return sSelectionMode;
	};

	return TableTypeBase;
});
