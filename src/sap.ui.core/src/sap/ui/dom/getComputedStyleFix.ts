var fnGetComputedStyleFix = function () {
    var fnGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (element, pseudoElt) {
        var oCSS2Style = fnGetComputedStyle.call(this, element, pseudoElt);
        if (oCSS2Style === null) {
            if (document.body == null) {
                var oFakeBody = document.createElement("body");
                var oHTML = document.getElementsByTagName("html")[0];
                oHTML.insertBefore(oFakeBody, oHTML.firstChild);
                var oStyle = oFakeBody.style;
                oFakeBody.parentNode.removeChild(oFakeBody);
                return oStyle;
            }
            return document.body.cloneNode(false).style;
        }
        return oCSS2Style;
    };
};