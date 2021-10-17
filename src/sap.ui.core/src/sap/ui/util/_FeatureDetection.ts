export class _FeatureDetection {
    static initialScrollPositionIsZero(...args: any) {
        return detectedFeatures.initialZero;
    }
}
var detectedFeatures = {};
function detectFeatures() {
    var div = document.createElement("div");
    div.innerHTML = "<div dir=\"rtl\"><div><span></span><span></span></div></div>";
    div.firstChild.style = "width: 1px; height: 1px; position: fixed; top: 0px; left: 0px; overflow: hidden";
    div.firstChild.firstChild.style = "width: 2px";
    div.firstChild.firstChild.firstChild.style = "display: inline-block; width: 1px";
    div.firstChild.firstChild.lastChild.style = "display: inline-block; width: 1px";
    document.documentElement.appendChild(div);
    var definer = div.firstChild;
    detectedFeatures.initialZero = definer.scrollLeft == 0;
    document.documentElement.removeChild(div);
}
detectFeatures();