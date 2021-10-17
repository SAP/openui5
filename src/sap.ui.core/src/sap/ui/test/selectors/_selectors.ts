import $ from "sap/ui/thirdparty/jquery";
function getSelectorInstances() {
    return Array.prototype.slice.call(arguments, 1).reduce(function (mResult, Selector) {
        var mNewSelector = {};
        var sOwnName = Selector.getMetadata()._sClassName.split(".").pop();
        var sOwnNameLowCapital = sOwnName.charAt(1).toLowerCase() + sOwnName.substring(2);
        mNewSelector[sOwnNameLowCapital] = new Selector();
        return $.extend(mResult, mNewSelector);
    }, {});
}