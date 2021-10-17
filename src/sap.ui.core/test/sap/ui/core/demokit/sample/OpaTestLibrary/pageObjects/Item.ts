import Opa5 from "sap/ui/test/Opa5";
import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";
Opa5.createPageObjects({
    onTheItemPage: {
        viewName: "Main",
        actions: {
            iSelectItem: function (sKey) {
                this.sampleLibrary.iOpenTheSelectList();
                this.sampleLibrary.iSelectItem(sKey);
            }
        },
        assertions: {
            theTitleIsCorrect: function (sTitle) {
                return this.waitFor({
                    controlType: "sap.m.Title",
                    matchers: new PropertyStrictEquals({
                        name: "text",
                        value: sTitle
                    }),
                    success: function (oCandidate) {
                        Opa5.assert.ok(true, "The Item page title is correct");
                    },
                    errorMessage: "The Item page title did not have the expected value"
                });
            }
        }
    }
});