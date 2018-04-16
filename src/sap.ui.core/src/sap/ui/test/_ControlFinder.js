/*!
 * ${copyright}
 */

sap.ui.define([
    "jquery.sap.global",
    "sap/ui/base/Object",
    "sap/ui/test/Opa5",
    "sap/ui/test/OpaPlugin",
    "sap/ui/test/actions/Press"
], function ($, UI5Object, Opa5, OpaPlugin, Press) {
    "use strict";

    var oPlugin = new OpaPlugin();

    var _ControlFinder = UI5Object.extend("sap.ui.test._ControlFinder", {});

    /**
     * Retrieves the controls matching oOptions. Does not wait or poll for the controls to become available.
     * This can be useful in external tools since polling might be done beforehand as in UIVeri5
     * @param {object} options An Object containing conditions for control search similar to {@link sap.ui.test.Opa5#waitFor}
     * @returns {Array} An array of the matching controls. If no controls match, the returned array is empty.
     * @private
     */
    _ControlFinder._findControls = function (oOptions) {
        var vControls = oPlugin._getFilteredControlsByDeclaration(oOptions);
        var aResult;

        if (vControls === OpaPlugin.FILTER_FOUND_NO_CONTROLS) {
            aResult = [];
        } else {
            aResult = $.isArray(vControls) ? vControls : [vControls];
        }

        return aResult;
    };

    /**
     * Retrieves the controls matching oOptions and returns the DOM elements that best represent them.
     * Does not wait or poll for the controls to become available. This can be useful in external tools since polling might be done beforehand as in UIVeri5
     * @param {object} oOptions An Object containing conditions for control search similar to {@link sap.ui.test.Opa5#waitFor}
     * @param {string|object} oOptions.interaction A string or object specifying which DOM element is most relevant.
     * Can be any one of: "root", "focus", "press", "auto", {idSuffix: "myIDsuffix"}. Default is "auto". This is what the end result will be in each case:
     * - root: the root DOM element of the control (see {@link sap.ui.core.Element#getDomRef})
     * - focus: the DOM element that should typically get the focus (see {@link sap.ui.core.Element#getFocusDomRef})
     * - press: the DOM element that should get the press events, as determined by OPA5
     * - auto: the DOM element that should receive events, as determined by OPA5. This would search for special elements with the following priority: press, focus, root.
     * - {idSuffix: "myIDsuffix"}: child of the control DOM reference with ID ending in "myIDsuffix"
     * @returns {Array} An array of DOM elements representing the matching controls. If no controls match, the returned array is empty.
     * @private
     */
    _ControlFinder._findElements = function (oOptions) {
        var aControls = _ControlFinder._findControls(oOptions);
        var fnGetDefaultElement = function (oControl) {
            return new Press().$(oControl)[0] || oControl.getDomRef();
        };

        return aControls.map(function (oControl) {
            switch (oOptions.interaction) {
                case "root":
                    return oControl.getDomRef();
                case "focus":
                    return oControl.getFocusDomRef();
                case "press":
                    var sIdSuffix = new Press()._getAdapter(oControl.getMetadata());
                    return oControl.$(sIdSuffix)[0];
                case "auto":
                    return fnGetDefaultElement(oControl);
                default:
                    sIdSuffix = oOptions.interaction && oOptions.interaction.idSuffix;
                    return sIdSuffix ? oControl.$(sIdSuffix)[0] : fnGetDefaultElement(oControl);
            }
        });
    };

     /**
     * Retrieves the control best corresponding to the DOM element with a certain ID.
     * @param {string} sElementId DOM element ID
     * @returns {sap.ui.core.Control} the control in the given context
     * @private
     */
    _ControlFinder._getControlForElement = function (sElementId) {
        var controls = jQuery("#" + sElementId).closest("[data-sap-ui]").control();
        return controls && controls[0];
    };

    /**
     * Retrieves the property value of a control
     * @param {sap.ui.core.Control} oControl
     * @param {string} sProperty The property to look for
     * @returns {object} The control value for the property or null if no such property is defined
     * @private
     */
    _ControlFinder._getControlProperty = function (oControl, sProperty) {
        var properties = jQuery.extend({}, oControl.mProperties, {id: oControl.getId()});

        return Object.keys(properties).indexOf(sProperty) > -1 ? properties[sProperty] : null;
    };

    return _ControlFinder;
});
