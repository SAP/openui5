import jQuery from "jquery.sap.global";
jQuery.sap.sjaxSettings = {
    complexResult: true,
    fallback: undefined
};
jQuery.sap.sjax = function sjax(oOrigSettings) {
    var s = jQuery.extend(true, {}, jQuery.sap.sjaxSettings, oOrigSettings, {
        async: false,
        success: function (data, textStatus, xhr) {
            oResult = { success: true, data: data, status: textStatus, statusCode: xhr && xhr.status };
        },
        error: function (xhr, textStatus, error) {
            oResult = { success: false, data: undefined, status: textStatus, error: error, statusCode: xhr.status, errorResponse: xhr.responseText };
        }
    });
    var oResult;
    jQuery.ajax(s);
    if (!s.complexResult) {
        return oResult.success ? oResult.data : s.fallback;
    }
    return oResult;
};
jQuery.sap.syncHead = function (sUrl) {
    return jQuery.sap.sjax({ type: "HEAD", url: sUrl }).success;
};
jQuery.sap.syncGet = function syncGet(sUrl, data, sDataType) {
    return jQuery.sap.sjax({
        url: sUrl,
        data: data,
        type: "GET",
        dataType: sDataType || "text"
    });
};
jQuery.sap.syncPost = function syncPost(sUrl, data, sDataType) {
    return jQuery.sap.sjax({
        url: sUrl,
        data: data,
        type: "POST",
        dataType: sDataType || "text"
    });
};
jQuery.sap.syncGetText = function syncGetText(sUrl, data, fallback) {
    return jQuery.sap.sjax({
        url: sUrl,
        data: data,
        type: "GET",
        dataType: "text",
        fallback: fallback,
        complexResult: (arguments.length < 3)
    });
};
jQuery.sap.syncGetJSON = function syncGetJSON(sUrl, data, fallback) {
    return jQuery.sap.sjax({
        url: sUrl,
        data: data || null,
        type: "GET",
        dataType: "json",
        fallback: fallback,
        complexResult: (arguments.length < 3)
    });
};