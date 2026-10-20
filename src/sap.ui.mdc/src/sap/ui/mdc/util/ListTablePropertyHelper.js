/*!
 * ${copyright}
 */

sap.ui.define([
	"./PropertyHelper"
], (
	PropertyHelperBase
) => {
	"use strict";

	/**
	 * Constructor for a new list/table property helper.
	 *
	 * @param {object[]} aProperties
	 *     The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 * @param {object} [mAdditionalAttributes]
	 *     Additional attributes the subclass enables, merged on top of the shared base attributes
	 *
	 * @class
	 * Shared property helper for <code>sap.ui.mdc.List</code> and <code>sap.ui.mdc.Table</code>, holding the
	 * property attributes both support (<code>filterable</code>, <code>sortable</code>, <code>groupable</code>,
	 * <code>exportSettings</code>). Keeping them here prevents the list and table helpers from drifting apart.
	 *
	 * @extends sap.ui.mdc.util.PropertyHelper
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.154
	 * @alias sap.ui.mdc.util.ListTablePropertyHelper
	 */
	const ListTablePropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.util.ListTablePropertyHelper", {
		constructor: function(aProperties, oParent, mAdditionalAttributes) {
			PropertyHelperBase.call(this, aProperties, oParent, Object.assign(ListTablePropertyHelper.getBaseAttributes(), mAdditionalAttributes));
		}
	});

	/**
	 * Returns the property attributes shared by the list and table property helpers. A fresh map is
	 * returned on every call so that subclasses can safely extend it.
	 *
	 * @returns {object} Attribute enablement map
	 * @private
	 */
	ListTablePropertyHelper.getBaseAttributes = function() {
		return {
			filterable: true,
			sortable: true,
			groupable: {
				type: "boolean"
			},
			exportSettings: {
				type: "object",
				"default": {
					value: {},
					ignoreIfNull: true
				}
			}
		};
	};

	// Re-expose the static validation helpers so subclasses referencing them via this base keep working
	// (statics are not inherited onto subclass constructors by ManagedObject.extend).
	Object.defineProperties(ListTablePropertyHelper, {
		reportInvalidProperty: {value: PropertyHelperBase.reportInvalidProperty},
		throwInvalidPropertyError: {value: PropertyHelperBase.throwInvalidPropertyError}
	});

	return ListTablePropertyHelper;
});
