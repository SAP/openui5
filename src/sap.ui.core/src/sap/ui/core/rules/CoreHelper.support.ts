import jQuery from "sap/ui/thirdparty/jquery";
export class CoreHelper {
    static nodeHasUI5ParentControl(node: any, oScope: any) {
        var skipParents = ["sap.ui.core.HTML"], parentNode = jQuery(node).control()[0];
        if (!parentNode) {
            return false;
        }
        var parentName = parentNode.getMetadata().getName(), isParentOutOfSkipList = skipParents.indexOf(parentName) === -1, isParentInScope = oScope.getElements().indexOf(parentNode) > -1;
        return isParentOutOfSkipList && isParentInScope;
    }
    static getExternalStyleSheets(...args: any) {
        return Array.from(document.styleSheets).filter(function (styleSheet) {
            var themeName = sap.ui.getCore().getConfiguration().getTheme(), styleSheetEnding = "/themes/" + themeName + "/library.css", hasHref = !styleSheet.href || !(styleSheet.href.indexOf(styleSheetEnding) !== -1), hasRules = !!styleSheet.rules;
            return hasHref && hasRules;
        });
    }
    static getStyleSheetName(styleSheet: any) {
        return styleSheet.href || "Inline";
    }
    static getStyleSource(styleSheet: any) {
        var styleSheetSourceName;
        if (styleSheet.href) {
            styleSheetSourceName = styleSheet.href.substr(styleSheet.href.lastIndexOf("/"), styleSheet.href.length - 1);
        }
        else {
            styleSheetSourceName = " <style> tag ";
        }
        return styleSheetSourceName;
    }
}