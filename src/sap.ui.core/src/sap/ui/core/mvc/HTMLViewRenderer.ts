import ViewRenderer from "./ViewRenderer";
export class HTMLViewRenderer {
    static render(rm: any, oControl: any) {
        rm.openStart("div", oControl);
        rm.class("sapUiView");
        rm.class("sapUiHTMLView");
        ViewRenderer.addDisplayClass(rm, oControl);
        rm.style("width", oControl.getWidth());
        rm.style("height", oControl.getHeight());
        rm.openEnd();
        if (oControl._oTemplate) {
            var sHTML = oControl._oTemplate.innerHTML;
            var content = oControl.getContent();
            var aDeferred = [];
            var renderControl = function (oControl) {
                var sTemp = HTMLViewRenderer._getHTML(rm, oControl, sHTML);
                if (sTemp) {
                    sHTML = sTemp;
                }
                else {
                    aDeferred.push(oControl);
                }
            };
            if (content) {
                if (Array.isArray(content)) {
                    for (var i = 0; i < content.length; i++) {
                        renderControl(content[i]);
                    }
                }
                else if (content) {
                    renderControl(content);
                }
            }
            rm.unsafeHtml(sHTML);
            for (var k = 0; k < aDeferred.length; k++) {
                rm.renderControl(aDeferred[k]);
            }
        }
        rm.close("div");
    }
    private static _getHTML(oRenderManager: any, oControl: any, sHTML: any) {
        var sId = oControl.getId();
        sHTML = sHTML.replace(/(<div)/gi, "\n$1");
        var regExp = new RegExp("<div.*?data-sap-ui-id=\"" + sId + "\".*?></div>", "gi");
        var aMatches = regExp.exec(sHTML);
        if (aMatches) {
            sHTML = sHTML.replace(aMatches[0], oRenderManager.getHTML(oControl));
            return sHTML;
        }
        else {
            return "";
        }
    }
}