import Opa5 from "sap/ui/test/Opa5";
import Press from "sap/ui/test/actions/Press";
import Ancestor from "sap/ui/test/matchers/Ancestor";
import Properties from "sap/ui/test/matchers/Properties";
import Common1 from "testLibrary/pageObjects/Common1";
import Common2 from "testLibrary/pageObjects/Common2";
Opa5.extendConfig({
    testLibBase: {
        sampleLibrary: {
            actions: {
                iOpenTheSelectList: function () {
                    return this.waitFor({
                        controlType: "sap.m.Select",
                        actions: new Press(),
                        errorMessage: "The Select was not found"
                    });
                },
                iSelectItem: function (sKey) {
                    return this.waitFor({
                        controlType: "sap.m.SelectList",
                        success: function (aLists) {
                            return this.waitFor({
                                controlType: "sap.ui.core.Item",
                                matchers: [
                                    new Ancestor(aLists[0]),
                                    new Properties({ key: sKey })
                                ],
                                actions: new Press(),
                                errorMessage: "The item with key '" + sKey + "' was not found"
                            });
                        },
                        errorMessage: "The Select list was not found"
                    });
                }
            }
        }
    },
    arrangements: new Common1(),
    assertions: new Common2()
});