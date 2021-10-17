var rVersion = /^[0-9]+(?:\.([0-9]+)(?:\.([0-9]+))?)?(.*)$/;
function Version(vMajor, iMinor, iPatch, sSuffix) {
    if (vMajor instanceof Version) {
        return vMajor;
    }
    if (!(this instanceof Version)) {
        return new Version(vMajor, iMinor, iPatch, sSuffix);
    }
    var m;
    if (typeof vMajor === "string") {
        m = rVersion.exec(vMajor);
    }
    else if (Array.isArray(vMajor)) {
        m = vMajor;
    }
    else {
        m = arguments;
    }
    m = m || [];
    function norm(v) {
        v = parseInt(v);
        return isNaN(v) ? 0 : v;
    }
    vMajor = norm(m[0]);
    iMinor = norm(m[1]);
    iPatch = norm(m[2]);
    sSuffix = String(m[3] || "");
    this.toString = function () {
        return vMajor + "." + iMinor + "." + iPatch + sSuffix;
    };
    this.getMajor = function () {
        return vMajor;
    };
    this.getMinor = function () {
        return iMinor;
    };
    this.getPatch = function () {
        return iPatch;
    };
    this.getSuffix = function () {
        return sSuffix;
    };
    this.compareTo = function () {
        var vOther = Version.apply(window, arguments);
        return vMajor - vOther.getMajor() || iMinor - vOther.getMinor() || iPatch - vOther.getPatch() || ((sSuffix < vOther.getSuffix()) ? -1 : (sSuffix === vOther.getSuffix()) ? 0 : 1);
    };
}
Version.prototype.inRange = function (vMin, vMax) {
    return this.compareTo(vMin) >= 0 && this.compareTo(vMax) < 0;
};