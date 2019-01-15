/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/test/Opa5",
    "sap/ui/test/OpaPlugin",
    "sap/ui/test/actions/Press",
    "sap/ui/test/_LogCollector",
    "sap/ui/thirdparty/jquery",
    "sap/ui/base/ManagedObjectMetadata"
], function(UI5Object, Opa5, OpaPlugin, Press, _LogCollector, $, ManagedObjectMetadata) {
    "use strict";

    var oPlugin = new OpaPlugin();

    var _ControlFinder = UI5Object.extend("sap.ui.test._ControlFinder", {});
    var oLogCollector = _LogCollector.getInstance('^((?!autowaiter).)*$');
    var aLogs = [];

    /**
     * Retrieves the controls matching oOptions. Does not wait or poll for the controls to become available.
     * This can be useful in external tools since polling might be done beforehand as in UIVeri5
     * @param {object} oOptions An Object containing conditions for control search similar to {@link sap.ui.test.Opa5#waitFor}
     * For details on the recognized object properties, see {@link sap.ui.test.matchers} and control selector types of {@link sap.ui.test.RecordReplay}
     * If oOptions.ancestor is given, it should be a control selector object. The ancestor control is located and then used for {@link sap.ui.test.matchers.Ancestor}
     * @returns {Array} An array of the matching controls. If no controls match, the returned array is empty.
     * @private
     */
    _ControlFinder._findControls = function (oOptions) {
        if (oOptions.ancestor) {
            var mAncestorSelector = {};
            // ensure backwards compatibility with UIVeri5
            if ($.isArray(oOptions.ancestor)) {
                mAncestorSelector = {id: oOptions.ancestor[0]};
            } else {
                mAncestorSelector = oOptions.ancestor;
            }
            var oAncestor = _ControlFinder._findControls(mAncestorSelector)[0];
            if (!oAncestor) {
                return [];
            }

            var oOptionsWithAncestor = $.extend({}, oOptions, {
                matchers: {
                    ancestor: oAncestor
                }
            });

            delete oOptionsWithAncestor.ancestor;

            return  _ControlFinder._findControls(oOptionsWithAncestor);
        } else {
            var vControls = oPlugin._getFilteredControlsByDeclaration(oOptions);
            var aResult;

            if (vControls === OpaPlugin.FILTER_FOUND_NO_CONTROLS) {
                aResult = [];
            } else {
                aResult = $.isArray(vControls) ? vControls : [vControls];
            }

            return aResult;
        }
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
        oLogCollector.start();

        var aControls = _ControlFinder._findControls(oOptions);
        var fnGetDefaultElement = function (oControl) {
            return new Press().$(oControl)[0] || oControl.getDomRef();
        };

        var aElements = aControls.map(function (oControl) {
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

        aLogs.push(oLogCollector.getAndClearLog());
        oLogCollector.stop();

        return aElements;
    };

    /**
     * Retrieves the control best corresponding to the DOM element
     * @param {object|string} vElement DOM element or its ID
     * Before change 3592877, only ID is allowed
     * @returns {sap.ui.core.Control} the control in the given context
     * @private
     */
    _ControlFinder._getControlForElement = function (vElement) {
        var vSelector = Object.prototype.toString.call(vElement) === "[object String]" ? document.getElementById(vElement) : vElement;
        var controls = _ControlFinder._getIdentifiedDOMElement(vSelector).control();
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
        var properties = $.extend({}, oControl.mProperties, {id: oControl.getId()});

        return Object.keys(properties).indexOf(sProperty) > -1 ? properties[sProperty] : null;
    };

     /**
     * Retrieves the ID suffix of the DOM element, if it is stable
     * @param {object} oElement DOM element
     * @returns {string} ID suffix or undefined
     * @private
     */
    _ControlFinder._getDomElementIDSuffix = function (oElement, oControl) {
        var sElementId = oElement.id;
        var sDelimiter = "-";

        if (!ManagedObjectMetadata.isGeneratedId(sElementId)) {
            var iSuffixStart = oControl.getId().length;
            return sElementId.charAt(iSuffixStart) === sDelimiter && sElementId.substring(iSuffixStart + 1);
        }
    };

    /**
     * Retrieves oElement or the nearest parent DOM element that is identified with an ID by UI5
     * @param {object|string} vSelector DOM element or jQuery string selector
     * @returns {object} DOM element
     * @private
     */
    _ControlFinder._getIdentifiedDOMElement = function (vSelector) {
        return $(vSelector).closest("[data-sap-ui]");
    };

     /**
     * Get latest log collected during control/element search
     * @returns {string} string of concatenated logs
     * @private
     */
    _ControlFinder._getLatestLog = function () {
        return aLogs && aLogs.pop();
    };

    return _ControlFinder;
});