import jQuery from "sap/ui/thirdparty/jquery";
import assert from "sap/base/assert";
var fnRectContains = function rectContains(iPosX, iPosY) {
    assert(!isNaN(iPosX), "iPosX must be a number");
    assert(!isNaN(iPosY), "iPosY must be a number");
    var oRect = this.rect();
    if (oRect) {
        return iPosX >= oRect.left && iPosX <= oRect.left + oRect.width && iPosY >= oRect.top && iPosY <= oRect.top + oRect.height;
    }
    return false;
};
jQuery.fn.rectContains = fnRectContains;