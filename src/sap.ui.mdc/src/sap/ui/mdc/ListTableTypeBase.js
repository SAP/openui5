/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element"
], (Element) => {
	"use strict";

	/**
	 * Constructor for a new <code>ListTableTypeBase</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 *
	 * @class
	 * Abstract base for the type strategies of <code>sap.ui.mdc.List</code> and <code>sap.ui.mdc.Table</code>,
	 * holding the behavior shared by {@link sap.ui.mdc.list.ListTypeBase} and {@link sap.ui.mdc.table.TableTypeBase}.
	 * It must not be used stand-alone.
	 * @extends sap.ui.core.Element
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.154
	 * @alias sap.ui.mdc.ListTableTypeBase
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const ListTableTypeBase = Element.extend("sap.ui.mdc.ListTableTypeBase", {
		metadata: {
			"abstract": true,
			library: "sap.ui.mdc",
			properties: {}
		}
	});

	/**
	 * Returns the inner control instance created and managed by the type, or <code>null</code> if it does not exist yet.
	 *
	 * @returns {sap.ui.core.Control|null} The inner control, or <code>null</code>
	 * @private
	 * @abstract
	 */
	ListTableTypeBase.prototype.getInnerControl = function() {
		throw new Error(this + " does not implement #getInnerControl");
	};

	/**
	 * Inserts the filter info bar into the inner control.
	 *
	 * @param {sap.ui.mdc.table.utils.FilterInfoBar} oFilterInfoBar The filter info bar to insert
	 * @private
	 * @abstract
	 */
	ListTableTypeBase.prototype.insertFilterInfoBar = function(oFilterInfoBar) {
		throw new Error(this + " does not implement #insertFilterInfoBar");
	};

	return ListTableTypeBase;
});
