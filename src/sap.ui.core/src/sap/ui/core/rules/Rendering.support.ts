import SupportLib from "sap/ui/support/library";
import RenderManager from "sap/ui/core/RenderManager";
var Categories = SupportLib.Categories;
var Severity = SupportLib.Severity;
var Audiences = SupportLib.Audiences;
var oRendererInterfaceVersion = {
    id: "semanticRenderingNotUsed",
    audiences: [Audiences.Control],
    categories: [Categories.Performance],
    enabled: true,
    minversion: "-",
    title: "Control and renderer not migrated to modern rendering syntax",
    description: "Controls must use modern rendering syntax.",
    resolution: "Control and renderer must be migrated to modern rendering syntax. For more information consult with documentation.",
    resolutionurls: [{
            text: "Documentation: RenderManager syntax",
            href: "https://sapui5.hana.ondemand.com/#/api/sap.ui.core.RenderManager"
        }],
    check: function (oIssueManager, oCoreFacade, oScope) {
        var aControls = oScope.getElements().filter(function (oElement) { return oElement.isA("sap.ui.core.Control"); });
        aControls.forEach(function (oControl) {
            if (RenderManager.getApiVersion(oControl.getRenderer()) < 2 && !oControl.isA("sap.ui.core.mvc.XMLView")) {
                var sControlName = oControl.getMetadata().getName();
                oIssueManager.addIssue({
                    severity: Severity.Medium,
                    category: Categories.Performance,
                    details: "The control '" + sControlName + "' is not migrated to modern rendering syntax. " + "This means it cannot benefit from UI5's modern, DOM-based rendering engine. " + "Please consult with the referred documentation regarding the modern API of RenderManager.",
                    context: {
                        id: oControl.getId()
                    }
                });
            }
        });
    }
};