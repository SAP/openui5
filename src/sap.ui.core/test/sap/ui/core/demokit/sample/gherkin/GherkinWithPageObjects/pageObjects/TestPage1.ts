import Opa5 from "sap/ui/test/Opa5";
import Common from "./Common";
Opa5.createPageObjects({
    onPage1: {
        baseClass: Common,
        assertions: {
            iShouldSeeThePage1Text: function () {
                return this.iShouldSeeTheText("text1", "This is Page 1");
            }
        }
    }
});