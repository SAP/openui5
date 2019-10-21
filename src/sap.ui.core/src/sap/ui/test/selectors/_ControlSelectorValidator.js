/*!
 * ${copyright}
 */

 // private
sap.ui.define([
    'sap/ui/base/ManagedObject',
    "sap/ui/test/_OpaLogger",
    'sap/ui/test/_ControlFinder',
    'sap/ui/thirdparty/jquery'
], function (ManagedObject, _OpaLogger, _ControlFinder, $) {
	"use strict";

    /**
     * Validate control selectors
     * @class Control selector validator
     * @extends sap.ui.base.ManagedObject
     * @alias sap.ui.test.selectors._ControlSelectorValidator
     * @private
     */
    var _ControlSelectorValidator = ManagedObject.extend("sap.ui.test.selectors._ControlSelectorValidator", {
        /**
         * contruct a validator
         * @param {object} oValidationRoot control which will be used to test the selector
         * The selector should be unique in the control subtree with root oOptions.validationRoot. By default, this subtree is the entire app control tree.
         * @param {boolean} bMultiple whether to validate non-unique selectors as well. Default value is false, meaning that only unique selectors are valid.
         * @private
         */
        constructor: function (oValidationRoot, bMultiple) {
            this.оValidationRoot = oValidationRoot;
            this.bMultiple = bMultiple;
            this._oLogger = _OpaLogger.getLogger("sap.ui.test.selectors._ControlSelectorValidator");
        },

        /**
         * Validate a single control selector
         * @param {object} mSelector the selector to validate
         * @returns {boolean} true if the selector matches some control.
         * If bMultiple is true: will return true if the selector matches exactly one control.
         * If bMultiple is false: will return true if the selector matches at least one control.
         * @private
         */
        _validate: function (mSelector) {
            if (mSelector) {
                // use a deep copy because _findControls will manipulate the selector object (by changing controlType and adding sOrignalControlType)
                var aLocatedControls = _ControlFinder._findControls($.extend(true, {}, mSelector));

                if (this.оValidationRoot && aLocatedControls.length > 1) {
                    // the control should be unique among siblings
                    aLocatedControls = aLocatedControls.filter(function (oControl) {
                        return this._hasAncestor(oControl, this.оValidationRoot);
                    }.bind(this));
                }

                if (aLocatedControls.length) {
                    if (aLocatedControls.length === 1) {
                        this._oLogger.debug("Selector matched a single control: " + JSON.stringify(mSelector));
                        return true;
                    } else if (this.bMultiple) {
                        this._oLogger.debug("Selector matched multiple controls: " + JSON.stringify(mSelector));
                        return true;
                    } else {
                        this._oLogger.debug("Selector matched multiple controls: " + JSON.stringify(mSelector));
                        return false;
                    }
                } else {
                    this._oLogger.debug("Selector did not match any controls: " + JSON.stringify(mSelector));
                    return false;
                }
            }
        },

        /**
         * checks if the control, located by a given selector, has an indirect ancestor oAncestor
         * @param {object} oControl control (found by selector)
         * @param {object} oAncestor ancestor (validation root)
         * @returns {boolean} true if oAncestor is ancestor of oControl
         * @private
         */
        _hasAncestor: function (oControl, oAncestor) {
            var oParent = oControl.getParent();
            return !!oParent && (oParent === oAncestor || this._hasAncestor(oParent, oAncestor));
        }
    });

    return _ControlSelectorValidator;
});
