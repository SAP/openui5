import ViewRenderer from "./ViewRenderer";
import RenderManager from "../RenderManager";
import jQuery from "sap/ui/thirdparty/jquery";
export class XMLViewRenderer {
    static render(rm: any, oControl: any) {
        var aParsedContent = oControl._aParsedContent;
        var $oldContent = oControl._$oldContent = RenderManager.findPreservedContent(oControl.getId());
        if ($oldContent.length === 0) {
            var bSubView = oControl.isSubView();
            if (!bSubView) {
                rm.openStart("div", oControl);
                rm.class("sapUiView");
                rm.class("sapUiXMLView");
                ViewRenderer.addDisplayClass(rm, oControl);
                if (!oControl.oAsyncState || !oControl.oAsyncState.suppressPreserve) {
                    rm.attr("data-sap-ui-preserve", oControl.getId());
                }
                rm.style("width", oControl.getWidth());
                rm.style("height", oControl.getHeight());
                rm.openEnd();
            }
            if (aParsedContent) {
                for (var i = 0; i < aParsedContent.length; i++) {
                    var vRmInfo = aParsedContent[i];
                    if (Array.isArray(vRmInfo)) {
                        rm[vRmInfo[0]].apply(rm, vRmInfo[1]);
                    }
                    else {
                        rm.renderControl(vRmInfo);
                        if (!vRmInfo.bOutput) {
                            rm.openStart("div", PREFIX_DUMMY + vRmInfo.getId());
                            rm.class("sapUiHidden");
                            rm.openEnd();
                            rm.close("div");
                        }
                    }
                }
            }
            if (!bSubView) {
                rm.close("div");
            }
        }
        else {
            rm.renderControl(oControl.oAfterRenderingNotifier);
            rm.openStart("div", PREFIX_TEMPORARY + oControl.getId());
            rm.class("sapUiHidden");
            rm.openEnd();
            for (var i = 0; i < aParsedContent.length; i++) {
                var vFragment = aParsedContent[i];
                if (!Array.isArray(vFragment)) {
                    rm.renderControl(vFragment);
                    var sFragmentId = vFragment.getId(), $fragment = jQuery(document.getElementById(sFragmentId));
                    if ($fragment.length == 0) {
                        $fragment = jQuery(document.getElementById(PREFIX_INVISIBLE + sFragmentId));
                    }
                    if (!RenderManager.isPreservedContent($fragment[0])) {
                        $fragment.replaceWith("<div id=\"" + PREFIX_DUMMY + sFragmentId + "\" class=\"sapUiHidden\"></div>");
                    }
                }
            }
            rm.close("div");
        }
    }
}
var PREFIX_DUMMY = RenderManager.RenderPrefixes.Dummy, PREFIX_INVISIBLE = RenderManager.RenderPrefixes.Invisible, PREFIX_TEMPORARY = RenderManager.RenderPrefixes.Temporary;