import Device from "sap/ui/Device";
export class Helper {
    static parse(sXMLText: any) {
        var oXMLDocument;
        var oParseError;
        var DomHelper = new DOMParser();
        oXMLDocument = DomHelper.parseFromString(sXMLText, "text/xml");
        oParseError = Helper.getParseError(oXMLDocument);
        if (oParseError) {
            if (!oXMLDocument.parseError) {
                oXMLDocument.parseError = oParseError;
            }
        }
        return oXMLDocument;
    }
    static getParseError(oDocument: any) {
        var oParseError = {
            errorCode: -1,
            url: "",
            reason: "unknown error",
            srcText: "",
            line: -1,
            linepos: -1,
            filepos: -1
        };
        if (Device.browser.firefox && oDocument && oDocument.documentElement && oDocument.documentElement.tagName == "parsererror") {
            var sErrorText = oDocument.documentElement.firstChild.nodeValue, rParserError = /XML Parsing Error: (.*)\nLocation: (.*)\nLine Number (\d+), Column (\d+):(.*)/;
            if (rParserError.test(sErrorText)) {
                oParseError.reason = RegExp.$1;
                oParseError.url = RegExp.$2;
                oParseError.line = parseInt(RegExp.$3);
                oParseError.linepos = parseInt(RegExp.$4);
                oParseError.srcText = RegExp.$5;
            }
            return oParseError;
        }
        if (Device.browser.webkit && oDocument && oDocument.documentElement && oDocument.getElementsByTagName("parsererror").length > 0) {
            var sErrorText = Helper.serialize(oDocument), rParserError = /(error|warning) on line (\d+) at column (\d+): ([^<]*)\n/;
            if (rParserError.test(sErrorText)) {
                oParseError.reason = RegExp.$4;
                oParseError.url = "";
                oParseError.line = parseInt(RegExp.$2);
                oParseError.linepos = parseInt(RegExp.$3);
                oParseError.srcText = "";
                oParseError.type = RegExp.$1;
            }
            return oParseError;
        }
        if (!oDocument || !oDocument.documentElement) {
            return oParseError;
        }
        return {
            errorCode: 0
        };
    }
    static serialize(oXMLDocument: any) {
        var oSerializer = new XMLSerializer();
        return oSerializer.serializeToString(oXMLDocument);
    }
}