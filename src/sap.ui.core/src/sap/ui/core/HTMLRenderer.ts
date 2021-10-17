import RenderManager from "./RenderManager";
export class HTMLRenderer {
    static render(oRM: any, oControl: any) {
        oRM.openStart("div", RenderPrefixes.Dummy + oControl.getId());
        oRM.style("display", "none");
        oRM.openEnd();
        oRM.close("div");
    }
}
var RenderPrefixes = RenderManager.RenderPrefixes;