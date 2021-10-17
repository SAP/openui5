import Opa5 from "sap/ui/test/Opa5";
import Common from "./Common";
Opa5.createPageObjects({
    onPage2: {
        baseClass: Common,
        viewName: "Main",
        assertions: {
            iShouldSeeThePage2Text: function () {
                return this.iShouldSeeTheText("text2", "This is Page 2");
            }
        }
    }
});