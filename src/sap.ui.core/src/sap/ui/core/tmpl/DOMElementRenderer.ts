import Log from "sap/base/Log";
import encodeXML from "sap/base/security/encodeXML";
export class DOMElementRenderer {
    static render(oRM: any, oElement: any) {
        var sEncodedTagName = encodeXML(oElement.getTag()), bIsVoid = rVoidTags.test(sEncodedTagName);
        if (bIsVoid) {
            oRM.voidStart(sEncodedTagName, oElement);
        }
        else {
            oRM.openStart(sEncodedTagName, oElement);
        }
        oElement.getAttributes().forEach(function (oAttribute) {
            var sName = oAttribute.getName().toLowerCase();
            if (sName === "class") {
                var aClasses = oAttribute.getValue().split(" ");
                aClasses.forEach(function (sClass) {
                    var sClass = sClass.trim();
                    if (sClass) {
                        oRM.class(sClass);
                    }
                });
            }
            else if (sName === "style") {
                var aStyles = oAttribute.getValue().split(";");
                aStyles.forEach(function (sStyle) {
                    var iIndex = sStyle.indexOf(":");
                    if (iIndex != -1) {
                        var sKey = sStyle.substring(0, iIndex).trim();
                        var sValue = sStyle.substring(iIndex + 1).trim();
                        oRM.style(encodeXML(sKey), sValue);
                    }
                });
            }
            else if (oAttribute.getName()) {
                oRM.attr(encodeXML(oAttribute.getName()), oAttribute.getValue());
            }
            else {
                Log.error("Attributes must have a non-empty name");
            }
        });
        if (bIsVoid) {
            oRM.voidEnd();
        }
        else {
            oRM.openEnd();
        }
        var aElements = oElement.getElements(), bHasChildren = !!oElement.getText() || aElements.length > 0;
        if (bHasChildren) {
            if (bIsVoid) {
                Log.error("Void element '" + sEncodedTagName + "' is rendered with children");
            }
            if (oElement.getText()) {
                oRM.text(oElement.getText());
            }
            aElements.forEach(function (iIndex, oChildElement) {
                oRM.renderControl(oChildElement);
            });
        }
        if (!bIsVoid) {
            oRM.close(sEncodedTagName);
        }
    }
}
var rVoidTags = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;