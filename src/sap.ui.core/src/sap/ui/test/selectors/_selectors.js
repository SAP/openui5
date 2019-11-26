/*!
 * ${copyright}
 */

//private
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/test/selectors/_BindingPath",
    "sap/ui/test/selectors/_DropdownItem",
    "sap/ui/test/selectors/_GlobalID",
    "sap/ui/test/selectors/_ControlType",
    "sap/ui/test/selectors/_LabelFor",
    "sap/ui/test/selectors/_Properties",
    "sap/ui/test/selectors/_Selector",
    "sap/ui/test/selectors/_TableRowItem",
    "sap/ui/test/selectors/_ViewID"
], function ($) {
    "use strict";

    function getSelectorInstances() {
        // create an instance of every imported selector generator and save it in a common object
        return Array.prototype.slice.call(arguments, 1).reduce(function (mResult, Selector) {
            var mNewSelector = {};
            var sOwnName = Selector.getMetadata()._sClassName.split(".").pop();
            var sOwnNameLowCapital = sOwnName.charAt(1).toLowerCase() + sOwnName.substring(2);
            mNewSelector[sOwnNameLowCapital] = new Selector();
            return $.extend(mResult, mNewSelector);
        }, {});
    }

    function sort(aSelectors) {
        return [
            "globalID",
            "viewID",
            "labelFor",
            "bindingPath",
            "properties",
            "dropdownItem",
            "tableRowItem",
            "controlType"
        ].map(function (sName) {
            return aSelectors[sName];
        });
    }

    return sort(getSelectorInstances.apply(this, arguments));

});
