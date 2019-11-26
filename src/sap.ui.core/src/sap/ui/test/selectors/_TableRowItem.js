/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/test/selectors/_BindingPath",
    "sap/m/ListBase",
    "sap/m/ListItemBase",
    "sap/ui/thirdparty/jquery"
], function (_BindingPath, ListBase, ListItemBase, $) {
    "use strict";

    /**
     * Selector generator for an item inside row in a ListBase control (eg: table)
     * example: select button in 5th table row
     * @class Control selector generator: table row
     * @extends sap.ui.test.selectors._BindingPath
     * @alias sap.ui.test.selectors._TableRowItem
     * @private
     */
    var _TableRowItem = _BindingPath.extend("sap.ui.test.selectors._TableRowItem", {

        /**
         * @param {object} oControl the control for which to generate a selector
         * @param {object} mTableSelector unique selector for the control's table
         * @param {object} mRowRelativeSelector selector for the control that is unique in the row subtree
         * @returns {object} a plain object representation of a control. Contains unique selector within row, row binding path and table selector
         * Undefined if the control is not inside a table
         * @private
         */
        _generate: function (oControl, mTableSelector, mRowRelativeSelector) {
            if (mTableSelector && mRowRelativeSelector) {
                var oRow = this._getValidationRoot(oControl);
                var oTable = this._getAncestor(oControl);

                var oTableBindingInfo = oTable.getBinding("items");
                var sRowBindingContextPath = oRow.getBindingContextPath && oRow.getBindingContextPath();
                var mRowSelector = {};
                // tables may not have an items binding eg: forms as tables
                if (oTableBindingInfo && sRowBindingContextPath) {
                    mRowSelector = $.extend(this._createSelectorBase(oRow, {}), {
                        bindingPath: {
                            modelName: oTableBindingInfo.model || undefined,
                            path: sRowBindingContextPath
                        },
                        ancestor: mTableSelector
                    });
                }

                this._oLogger.debug("Control " + oControl + " has table row binding context path " + sRowBindingContextPath);

                return $.extend({}, mRowRelativeSelector, {
                    ancestor: mRowSelector
                });
            } else {
                this._oLogger.debug("Control " + oControl + " does not have unique selector within row subtree or unique table selector");
            }
        },

        _isAncestorRequired: function () {
            return true;
        },

        _isValidationRootRequired: function () {
            return true;
        },

        _getAncestor: function (oControl) {
            var oRow = this._getValidationRoot(oControl);
            if (oRow) {
                // there might be tables that don't have rows
                // but they are not targeted by this selector
                return this._findAncestor(oRow, function (oRowAncestor) {
                    return oRowAncestor instanceof ListBase;
                });
            }
        },

        _getValidationRoot: function (oControl) {
            return this._findAncestor(oControl, function (oControl) {
                return oControl instanceof ListItemBase;
            });
        }
    });

    return _TableRowItem;
});
