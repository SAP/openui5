import jQuery from "sap/ui/thirdparty/jquery";
var fnContainsOrEquals = function (oDomRefContainer, oDomRefChild) {
    if (oDomRefChild && oDomRefContainer && oDomRefChild != document && oDomRefChild != window) {
        return (oDomRefContainer === oDomRefChild) || jQuery.contains(oDomRefContainer, oDomRefChild);
    }
    return false;
};