import assert from "sap/base/assert";
export class Rem {
    static fromPx(vPx: any) {
        assert(((typeof vPx === "string") && (vPx !== "") && !isNaN(parseFloat(vPx)) && (typeof parseFloat(vPx) === "number")) || ((typeof vPx === "number") && !isNaN(vPx)), "Rem.fromPx: either the \"vPx\" parameter must be an integer, or a string e.g.: \"16px\"");
        return parseFloat(vPx) / getRootFontSize();
    }
    static toPx(vRem: any) {
        assert(((typeof vRem === "string") && (vRem !== "") && !isNaN(parseFloat(vRem)) && (typeof parseFloat(vRem) === "number")) || ((typeof vRem === "number") && !isNaN(vRem)), "Rem.toPx: either the \"vRem\" parameter must be an integer, or a string e.g.: \"1rem\"");
        return parseFloat(vRem) * getRootFontSize();
    }
}
function getRootFontSize() {
    var oRootDomRef = document.documentElement;
    if (!oRootDomRef) {
        return 16;
    }
    return parseFloat(window.getComputedStyle(oRootDomRef).getPropertyValue("font-size"));
}