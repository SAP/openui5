/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/base/util/extend",
    "sap/ui/base/ManagedObject",
    "sap/ui/test/_OpaLogger",
    'sap/ui/test/_ControlFinder',
    'sap/ui/core/Element',
    'sap/ui/core/mvc/View',
    'sap/ui/base/ManagedObjectMetadata'
], function (extend, ManagedObject, _OpaLogger, _ControlFinder, UI5Element, View, ManagedObjectMetadata) {
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
            ManagedObject.prototype.constructor.apply(this, arguments);
            this._oLogger = _OpaLogger.getLogger(this.getMetadata().getName());
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
                if (Array.isArray(vResult)) {
                    // result is a list of selectors (e.g.: bindings for several properties)
                    return vResult.filter(function (vSelector) {
                        // filter out empty results
                        return vSelector && (!Array.isArray(vSelector) || vSelector.length);
                    }).map(function (vItem) {
                        if (Array.isArray(vItem)) {
                            // selector has multiple parts (e.g.: composite binding)
                            return vItem.map(function (mItemPart) {
                                return extend({}, this._createSelectorBase(oControl, mItemPart), mItemPart);
                            }.bind(this));
                        } else {
                            return extend({}, this._createSelectorBase(oControl, vItem), vItem);
                        }
                    }.bind(this));
                } else {
                    // result is a single selector
                    return extend(this._createSelectorBase(oControl, vResult), vResult);
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
            if (_ControlFinder._isControlInStaticArea(oControl)) {
                mSelector.searchOpenDialogs = true;
            }
            if (mSelector.skipBasic) {
                delete mSelector.skipBasic;
                return mSelector;
            } else {
                var mBasic = {
                    controlType: oControl.getMetadata()._sClassName
                };
                var oView = this._getControlView(oControl);
                if (oView) {
                    extend(mBasic, this._getViewIdOrName(oView));
                }
                return mBasic;
            }
        },

        /**
         * Get the view to which a control belongs or undefined, if such a view does not exist
         * @param {object} oControl the control to examine
         * @returns {object} the control's view
         * @private
         */
        _getControlView: function (oControl) {
            if (!oControl) {
                return undefined;
            }
            if (oControl.getViewName) {
                return oControl;
            } else {
                return this._getControlView(oControl.getParent());
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
        },

        // returns the viewId or viewName - the first one which is unique - or empty object if neither is unique
        _getViewIdOrName: function (oView) {
            var sViewId = oView.getId();
            var sViewName = oView.getViewName();

            if (ManagedObjectMetadata.isGeneratedId(sViewId)) {
                var aViewsWithSameName = UI5Element.registry.filter(function (oElement) {
                    return oElement instanceof View;
                }).filter(function (oElement) {
                    return oElement.getViewName() === sViewName;
                });
                return aViewsWithSameName.length > 1 ? {} : {
                    viewName: sViewName
                };
            } else {
                return {
                    viewName: sViewName,
                    viewId: sViewId
                };
            }
        }
    });

    return _Selector;
});
