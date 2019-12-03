/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/base/ManagedObject",
    "sap/ui/test/_OpaLogger"
], function ($, ManagedObject, _OpaLogger) {
	"use strict";

    /**
     * Selector generator for controls. This class should be extended by all other generators.
     * A selector generator should implement the _generate function!
     * @class Base slass for control selector generators
     * @extends sap.ui.base.ManagedObject
     * @alias sap.ui.test.selectors._Selector
     * @private
     */
    var _Selector = ManagedObject.extend("sap.ui.test.selectors._Selector", {

        constructor: function () {
			this._oLogger = _OpaLogger.getLogger(this.getMetadata().getName());
			return ManagedObject.prototype.constructor.apply(this, arguments);
        },

        /**
         * Calls the _generate function for a selector. By default, decorates the selector object with basics such as controlType and viewName.
         * The aim is to avoid extra work when searching a control by the selector - filter out some controls before running them through the matcher pipeline.
         * If the selector doesn't need this decoration, then it should include the property "skipBasic: true"
         * @param {object} oControl the control for which to generate a selector
         * @returns {object|array} plain object representation of a control, or,
         * in case of multiple options for a single control property, an array of objects, or,
         * undefined if no selector could be generated
         * @private
         */
        generate: function (oControl) {
            var vResult = this._generate.apply(this, arguments);

            if (vResult) {
                if ($.isArray(vResult)) {
                    // result is a list of selectors (e.g.: bindings for several properties)
                    return vResult.filter(function (vSelector) {
                        // filter out empty results
                        return vSelector && (!$.isArray(vSelector) || vSelector.length);
                    }).map(function (vItem) {
                        if ($.isArray(vItem)) {
                            // selector has multiple parts (e.g.: composite binding)
                            return vItem.map(function (mItemPart) {
                                return $.extend({}, this._createSelectorBase(oControl, mItemPart), mItemPart);
                            }.bind(this));
                        } else {
                            return $.extend({}, this._createSelectorBase(oControl, vItem), vItem);
                        }
                    }.bind(this));
                } else {
                    // result is a single selector
                    return $.extend(this._createSelectorBase(oControl, vResult), vResult);
                }
            }
        },

        // override for selectors that need an ancestor control selector
        _isAncestorRequired: function () {
            return false;
        },
        _getAncestor: function () {
            return null;
        },

        // override for selectors that need to be unique only within a certain sub-tree (starting with the validation root)
        _isValidationRootRequired: function () {
            return false;
        },
        _getValidationRoot: function () {
            return null;
        },

        _createSelectorBase: function (oControl, mSelector) {
            if (mSelector.skipBasic) {
                delete mSelector.skipBasic;
                return mSelector;
            } else {
                var mBasic = {
                    controlType: oControl.getMetadata()._sClassName
                };
                var sViewname = this._getControlViewName(oControl);
                if (sViewname) {
                    mBasic.viewName = sViewname;
                }
                return mBasic;
            }
        },

        /**
         * Get the viewName of the view to which a control belongs or undefined, if such a view does not exist
         * @param {object} oControl the control to examine
         * @returns {string} viewName of the control's view
         * @private
         */
        _getControlViewName: function (oControl) {
            // TODO: handle controls in static area?
            if (!oControl) {
                return undefined;
            }
            if (oControl.getViewName) {
                var sViewName = oControl.getViewName();
                this._oLogger.debug("Control " + oControl + " has viewName " + sViewName);
                return sViewName;
            } else {
                return this._getControlViewName(oControl.getParent());
            }
        },

        // retrieve an ancestor which satisfies the fnCheck condition
        _findAncestor: function (oControl, fnCheck, bDirect) {
            if (oControl) {
                var oParent = oControl.getParent();
                if (oParent) {
                    if (fnCheck(oParent)) {
                        return oParent;
                    } else if (!bDirect) {
                        return this._findAncestor(oParent, fnCheck);
                    }
                }
            }
        }
    });

    return _Selector;
});
