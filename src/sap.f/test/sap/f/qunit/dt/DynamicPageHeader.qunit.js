(function () {
    "use strict";

    sap.ui.require([
        "sap/ui/dt/test/report/QUnit",
        "sap/ui/dt/test/ElementEnablementTest",
        "sap/ui/rta/test/controlEnablingCheck",
        "sap/f/DynamicPageHeader",
        "sap/m/Text"
    ], function (
        QUnitReport,
        ElementEnablementTest,
        rtaControlEnablingCheck,
        DynamicPageHeader,
        Text
    ) {

        var oElementEnablementTest = new ElementEnablementTest({
            type: "sap.f.DynamicPageHeader",
            create: function () {
                return new DynamicPageHeader({
                    content : [
                        new Text({text: "Header content 1"}),
                        new Text({text: "Header content 2"}),
                        new Text({text: "Header content 3"})
                    ]
                });
            }
        });
        oElementEnablementTest.run().then(function (oData) {
            new QUnitReport({
                data: oData
            });
        });

        // ------------ HIDING THE CONTROL --------------
        // Check if the remove action is working properly
        var fnConfirmDynamicPageHeaderIsInvisible = function(oAppComponent, oViewAfterAction, assert){
            assert.ok(oViewAfterAction.byId("header").getVisible() === false, "then the DynamicPageHeader is invisible");
        };

        var fnConfirmDynamicPageHeaderIsVisible = function(oAppComponent, oViewAfterAction, assert){
            assert.ok(oViewAfterAction.byId("header").getVisible() === true, "then the DynamicPageHeader is visible");
        };

        // Use rtaControlEnablingCheck to check if your control is ready for the remove action of UI adaptation
        rtaControlEnablingCheck("Checking the remove action for DynamicPageHeader", {
            xmlView :
                '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
                    '<DynamicPageHeader id="header" >' +
                        '<content>' +
                            '<m:Text text="Simple header text" />' +
                        '</content>' +
                    '</DynamicPageHeader>' +
                '</mvc:View>'
            ,
            action : {
                name : "remove",
                controlId : "header",
                parameter : function(oView){
                    return {
                        removedElement : oView.byId("header")
                    };
                }
            },
            afterAction : fnConfirmDynamicPageHeaderIsInvisible,
            afterUndo : fnConfirmDynamicPageHeaderIsVisible,
            afterRedo : fnConfirmDynamicPageHeaderIsInvisible
        });

        // ----------- UNHIDING THE CONTROL -------------
        // Check if the reveal action is working properly
        var fnConfirmDynamicPageHeaderIsRevealed = function (oAppComponent, oView, assert) {
            var oGroupElement = oView.byId("header");
            assert.ok(oGroupElement.getVisible(), "then the DynamicPageHeader is visible");
        };
        var fnConfirmDynamicPageHeaderIsHidden = function (oAppComponent, oView, assert) {
            var oGroupElement = oView.byId("header");
            assert.notOk(oGroupElement.getVisible(), "then the DynamicPageHeader is hidden");
        };
        rtaControlEnablingCheck("Checking the reveal action for a DynamicPageHeader", {
            xmlView :
                '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
                    '<DynamicPageHeader id="header" visible="false">' +
                        '<content>' +
                            '<m:Text text="Simple header text" />' +
                        '</content>' +
                    '</DynamicPageHeader>' +
                '</mvc:View>'
            ,
            action : {
                name : "reveal",
                controlId : "header"
            },
            afterAction : fnConfirmDynamicPageHeaderIsRevealed,
            afterUndo : fnConfirmDynamicPageHeaderIsHidden,
            afterRedo : fnConfirmDynamicPageHeaderIsRevealed
        });

        // --------- MOVING THE CONTROLS CONTENT ---------
        // Check if the move action is working properly
        var fnConfirmHeaderlement1IsOn3rdPosition = function(oAppComponent, oViewAfterAction, assert) {
            assert.strictEqual( oViewAfterAction.byId("text1").getId(),                   // Id of element at first position in original view
                                oViewAfterAction.byId("header").getContent() [2].getId(),   // Id of third element in group after change has been applied
                                "then the control has been moved to the right position");
        };
        var fnConfirmHeaderlement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
            assert.strictEqual( oViewAfterAction.byId("text1").getId(),                   // Id of element at first position in original view
                                oViewAfterAction.byId("header").getContent() [0].getId(),   // Id of third element in group after change has been applied
                                "then the control has been moved to the previous position");
        };
        // Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
        rtaControlEnablingCheck("Checking the move action for a simple control", {
            xmlView :
                '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.f">' +
                    '<DynamicPageHeader id="header">' +
                        '<content>' +
                            '<m:Text id="text1" text="Simple header text 1" />' +
                            '<m:Text id="text2" text="Simple header text 2" />' +
                            '<m:Text id="text3" text="Simple header text 3" />' +
                        '</content>' +
                    '</DynamicPageHeader>' +
                '</mvc:View>'
            ,
            action : {
                name : "move",
                controlId : "header",
                parameter : function(oView){
                    return {
                        movedElements : [{
                            element : oView.byId("text1"),
                            sourceIndex : 0,
                            targetIndex : 2
                        }],
                        source : {
                            aggregation: "content",
                            parent: oView.byId("header")
                        },
                        target : {
                            aggregation: "content",
                            parent: oView.byId("header")
                        }
                    };
                }
            },
            afterAction : fnConfirmHeaderlement1IsOn3rdPosition,
            afterUndo : fnConfirmHeaderlement1IsOn1stPosition,
            afterRedo : fnConfirmHeaderlement1IsOn3rdPosition
        });

    });
})();