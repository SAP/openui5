import jQuery from "sap/ui/thirdparty/jquery";
var aViews = [{
        path: sap.ui.require.toUrl("qunit/view/Async1.view.xml"),
        content: undefined
    }, {
        path: sap.ui.require.toUrl("qunit/view/Async2.view.xml")
    }, {
        path: sap.ui.require.toUrl("qunit/view/Async3.view.xml")
    }];
aViews.forEach(function (oViewSetting) {
    jQuery.ajax({
        dataType: "text",
        url: oViewSetting.path,
        success: function (data) {
            oViewSetting.content = data;
        },
        async: false
    });
});