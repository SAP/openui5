/*!
 * ${copyright}
 */
sap.ui.define([
    "./ButtonRenderer",
    "sap/ui/core/Renderer",
    "sap/ui/core/library",
    'sap/ui/core/AccessKeysEnablement'
], function (ButtonRenderer, Renderer, coreLibrary, AccessKeysEnablement) {
    "use strict";

    // shortcut for sap.ui.core.TextDirection
    var TextDirection = coreLibrary.TextDirection;

    var AdditionalTextButtonRenderer = Renderer.extend(ButtonRenderer);
    AdditionalTextButtonRenderer.apiVersion = 2;

    AdditionalTextButtonRenderer.writeButtonText = function (oRm, oButton, sTextDir, bRenderBDI) {
        oRm.openStart("span", oButton.getId() + "-content");
        oRm.class("sapMBtnContent");
        // check if textDirection property is not set to default "Inherit" and add "dir" attribute
        if (sTextDir !== TextDirection.Inherit) {
            oRm.attr("dir", sTextDir.toLowerCase());
        }

        if (oButton.getProperty("highlightAccKeysRef")) {
            oRm.class(AccessKeysEnablement.CSS_CLASS);
        }

        oRm.openEnd();

        if (bRenderBDI) {
            oRm.openStart("bdi", oButton.getId() + "-BDI-content");
            oRm.openEnd();
        }
        oRm.text(oButton.getText());
        if (bRenderBDI) {
            oRm.close("bdi");
        }
        if (oButton.getAdditionalText()) {
            var sRendererTag = bRenderBDI ? "bdi" : "span";

            oRm.openStart(sRendererTag, oButton.getId() + "-additionalText-BDI-content");
            oRm.class("sapMBtnContentAddText");
            oRm.openEnd();
            oRm.text(oButton.getAdditionalText());
            oRm.close(sRendererTag);
        }

        oRm.close("span");
    };

    AdditionalTextButtonRenderer.renderButtonAttributes = function (oRm){
        oRm.class("sapMBtnAdditionalTextContent");
    };

    return AdditionalTextButtonRenderer;
}, /* bExport= */ true);