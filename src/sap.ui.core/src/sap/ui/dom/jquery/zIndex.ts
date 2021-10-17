import jQuery from "sap/ui/thirdparty/jquery";
function getValue(oTarget, sProperty) {
    var descriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
    return descriptor && descriptor.value;
}
if (!getValue(jQuery.fn, "zIndex")) {
    var fnzIndex = function (zIndex) {
        if (zIndex !== undefined) {
            return this.css("zIndex", zIndex);
        }
        if (this.length) {
            var elem = jQuery(this[0]), position, value;
            while (elem.length && elem[0] !== document) {
                position = elem.css("position");
                if (position === "absolute" || position === "relative" || position === "fixed") {
                    value = parseInt(elem.css("zIndex"));
                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }
                elem = elem.parent();
            }
        }
        return 0;
    };
    jQuery.fn.zIndex = fnzIndex;
}