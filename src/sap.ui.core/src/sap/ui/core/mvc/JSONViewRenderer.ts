import ViewRenderer from "./ViewRenderer";
export class JSONViewRenderer {
    static render(rm: any, oControl: any) {
        rm.openStart("div", oControl);
        rm.class("sapUiView");
        rm.class("sapUiJSONView");
        ViewRenderer.addDisplayClass(rm, oControl);
        rm.style("width", oControl.getWidth());
        rm.style("height", oControl.getHeight());
        rm.openEnd();
        oControl.getContent().forEach(rm.renderControl, rm);
        rm.close("div");
    }
}