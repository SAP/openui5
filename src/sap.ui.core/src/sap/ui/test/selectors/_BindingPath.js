/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/test/selectors/_Selector",
    "sap/ui/thirdparty/jquery",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/ListBase",
    "sap/m/ListItemBase"
], function (_Selector, $, ResourceModel, ListBase, ListItemBase) {
	"use strict";

    /**
     * Selector generator for control with data binding
     * @class Control selector generator: bindingPath
     * @extends sap.ui.test.selectors._Selector
     * @alias sap.ui.test.selectors._BindingPath
     * @private
     */
	var _BindingPath = _Selector.extend("sap.ui.test.selectors._BindingPath", {

        /**
         * Generate control selector for control with data binding
         * @param {object} oControl the control for which to generate a selector
         * @returns {array} an array of arrays of plain object representations of a control. Each object can represent:
         * - i18N resource binding with the property name, bundle key and bundle name
         * - data binding with binding path and model name
         * For each data binding, either a binding object or an array of objects is generated, for simple and composite data binding respectively.
         * If the control doesn't have any bindings, the result is an empty array
         * @private
         */
        _generate: function (oControl) {
            return Object.keys(oControl.mBindingInfos).map(function (sProperty) {
                return this._getBindingSelector(oControl, sProperty);
            }.bind(this));
        },

        // generate the selector for one of the control data bindings
        _getBindingSelector: function (oControl, sProperty) {
            var vBinding = this._getBinding(oControl, sProperty);

            if (vBinding) {
                return vBinding.map(function (mBinding) {
                    // models for i18n data are ResourceModels
                    // i18n is more restricting than bindingPath: the property name is also considered
                    if (mBinding.model.type === ResourceModel.getMetadata().getName()) {
                        this._oLogger.debug("Control " + oControl + " property " + sProperty +
                            " has i18n binding for model " + mBinding.model.name + " with key " + mBinding.path);

                        return {
                            i18NText: {
                                propertyName: sProperty,
                                key: mBinding.path,
                                // TODO: get parameters: mBinding.model.parameters
                                modelName: mBinding.model.name
                            }
                        };
                    } else {
                        this._oLogger.debug("Control " + oControl + " property " + sProperty +
                            " has data binding for model " + mBinding.model.name + " with path " + mBinding.path);

                        return {
                            bindingPath: {
                                path: mBinding.path,
                                modelName: mBinding.model.name
                            }
                        };
                    }
                }.bind(this));
            } else {
                this._oLogger.debug("Control " + oControl + " does not have data binding for property " + sProperty);
                return [];
            }
        },

        // handle binding type (simple or composite) and combine a minimal summary for each binding part
        _getBinding: function (oControl, sProperty) {
            var oBinding = oControl.getBinding(sProperty);
            var oBindingInfo = oControl.getBindingInfo(sProperty);

            if (oBinding) {
                // multiple parts when composite binding
                if (oBinding.getBindings) {
                    this._oLogger.debug("Control " + oControl + " has composite binding for property " + sProperty);

                    return oBinding.getBindings().map(function (oBinding, index) {
                        return this._mapBindingData(oBinding, oBindingInfo.parts[index]);
                    }.bind(this));
                } else {
                    this._oLogger.debug("Control " + oControl + " has simple binding for property " + sProperty);

                    return [this._mapBindingData(oBinding, oBindingInfo.parts ? oBindingInfo.parts[0] : oBindingInfo)];
                }
            }
        },

        // get only the data needed to construct a I18NText or BindingPath matcher
        _mapBindingData: function (oBinding, oBindingInfoPart) {
            var oModel = oBinding.getModel();
            var oContext = oBinding.getContext();
            var sContextPath = oContext ? oContext.getPath() + "/" : "";
            var sPath = sContextPath + oBinding.getPath();

            this._oLogger.debug("Control binding " + (oContext ? "has context path " + sContextPath : " does not have object binding"));

            return {
                path: sPath,
                model: {
                    name: oBindingInfoPart.model || undefined, // don't save empty strings
                    type: oModel.getMetadata().getName(),
                    data: oModel.getData ? oModel.getData() : undefined
                }
            };
        }
    });

    return _BindingPath;
});
