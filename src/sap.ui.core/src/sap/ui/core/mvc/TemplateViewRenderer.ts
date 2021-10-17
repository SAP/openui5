import ViewRenderer from "./ViewRenderer";
export class TemplateViewRenderer {
    static render(rm: any, oControl: any) {
        rm.openStart("div", oControl);
        rm.class("sapUiView");
        rm.class("sapUiTmplView");
        ViewRenderer.addDisplayClass(rm, oControl);
        rm.style("width", oControl.getWidth());
        rm.style("height", oControl.getHeight());
        rm.openEnd();
        rm.renderControl(oControl._oTemplate);
        rm.close("div");
    }
}