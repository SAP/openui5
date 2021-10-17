import jQuery from "sap/ui/thirdparty/jquery";
var _oScrollbarSize = {};
var fnGetScrollbarSize = function (sClasses, bForce) {
    if (typeof sClasses === "boolean") {
        bForce = sClasses;
        sClasses = null;
    }
    var sKey = sClasses || "#DEFAULT";
    if (bForce) {
        if (sClasses) {
            delete _oScrollbarSize[sClasses];
        }
        else {
            _oScrollbarSize = {};
        }
    }
    if (_oScrollbarSize[sKey]) {
        return _oScrollbarSize[sKey];
    }
    if (!document.body) {
        return { width: 0, height: 0 };
    }
    var $Area = jQuery("<DIV></DIV>").css("visibility", "hidden").css("height", "0").css("width", "0").css("overflow", "hidden");
    if (sClasses) {
        $Area.addClass(sClasses);
    }
    $Area.prependTo(document.body);
    var $Dummy = jQuery("<div></div>");
    $Dummy[0].style = "visibility:visible;position:absolute;height:100px;width:100px;overflow:scroll;opacity:0;";
    $Area.append($Dummy);
    var oDomRef = $Dummy.get(0);
    var iWidth = oDomRef.offsetWidth - oDomRef.scrollWidth;
    var iHeight = oDomRef.offsetHeight - oDomRef.scrollHeight;
    $Area.remove();
    if (iWidth === 0 || iHeight === 0) {
        return { width: iWidth, height: iHeight };
    }
    _oScrollbarSize[sKey] = { width: iWidth, height: iHeight };
    return _oScrollbarSize[sKey];
};