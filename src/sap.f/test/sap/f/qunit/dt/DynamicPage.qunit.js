(function () {
    "use strict";

    sap.ui.require([
        "sap/ui/dt/test/report/QUnit",
        "sap/ui/dt/test/ElementEnablementTest",
        "sap/ui/rta/test/controlEnablingCheck",
        "sap/f/DynamicPage",
        "sap/f/DynamicPageTitle",
        "sap/f/DynamicPageHeader",
        "sap/m/Text",
        "sap/m/Title",
        "sap/m/OverflowToolbar",
        "sap/m/Button"
    ], function (QUnitReport,
        ElementEnablementTest,
        rtaControlEnablingCheck,
        DynamicPage,
        DynamicPageTitle,
        DynamicPageHeader,
        Text,
        Title,
        OverflowToolbar,
        Button) {

        var oElementEnablementTest = new ElementEnablementTest({
            type: "sap.f.DynamicPage",
            create: function () {
                return new DynamicPage({
                    showFooter : true,
                    title : new DynamicPageTitle({
                        heading : new Title({text: "Title text"}),
                        expandedContent : new Text({text: "Expanded subheading"}),
                        snappedContent : new Text({text: "Collapsed subheading"}),
                        actions : [
                            new Button({text: "Action1"}),
                            new Button({text: "Action2"})
                        ]
                    }),
                    header : new DynamicPageHeader({
                            content : new Text({text: "Header content"})
                    }),
                    content : new Text({text: "Some sample content"}),
                    footer : new OverflowToolbar({
                        content : [
                            new Button({text: "Footer Button"})
                        ]
                    })
                });
            }
        });
        oElementEnablementTest.run().then(function (oData) {
            new QUnitReport({
                data: oData
            });
        });
    });
})();