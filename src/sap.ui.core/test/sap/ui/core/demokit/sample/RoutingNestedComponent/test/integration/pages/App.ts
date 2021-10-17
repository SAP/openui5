import Opa5 from "sap/ui/test/Opa5";
import Base from "./Base";
import Press from "sap/ui/test/actions/Press";
var sViewName = "App";
Opa5.createPageObjects({
    onTheAppPage: {
        baseClass: Base,
        actions: {
            iSelectMenuItem: function (sMenuItemId) {
                return this.waitFor({
                    id: sMenuItemId,
                    viewName: sViewName,
                    actions: new Press(),
                    success: function () {
                        Opa5.assert.ok(true, "The MenuItem '" + sMenuItemId + "' was closed.");
                    }
                });
            }
        }
    }
});