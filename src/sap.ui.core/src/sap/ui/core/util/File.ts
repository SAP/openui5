import jQuery from "sap/ui/thirdparty/jquery";
export class File {
    static save(sData: any, sFileName: any, sFileExtension: any, sMimeType: any, sCharset: any, bByteOrderMark: any) {
        var sFullFileName = sFileName + "." + sFileExtension;
        if (typeof bByteOrderMark === "undefined" && sCharset === "utf-8" && sFileExtension === "csv") {
            bByteOrderMark = true;
        }
        if (bByteOrderMark === true && sCharset === "utf-8") {
            sData = "\uFEFF" + sData;
        }
        if (window.Blob) {
            var sType = "data:" + sMimeType;
            if (sCharset) {
                sType += ";charset=" + sCharset;
            }
            var oBlob = new window.Blob([sData], { type: sType });
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(oBlob, sFullFileName);
            }
            else {
                var oURL = window.URL || window.webkitURL;
                var sBlobUrl = oURL.createObjectURL(oBlob);
                var oLink = window.document.createElement("a");
                if ("download" in oLink) {
                    var $body = jQuery(document.body);
                    var $link = jQuery(oLink).attr({
                        download: sFullFileName,
                        href: sBlobUrl,
                        style: "display:none"
                    });
                    $body.append($link);
                    $link.get(0).click();
                    $link.remove();
                }
                else {
                    sData = encodeURI(sData);
                    var oWindow = window.open(sType + "," + sData);
                    oWindow.opener = null;
                    if (!oWindow) {
                        throw new Error("Could not download the file, please deactivate your pop-up blocker.");
                    }
                }
            }
        }
    }
}