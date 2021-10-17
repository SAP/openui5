var fnDerive = function defaultLinkTypes(sRel, sTarget) {
    sRel = typeof sRel === "string" ? sRel.trim() : sRel;
    if (!sRel && sTarget && sTarget !== "_self") {
        return "noopener noreferrer";
    }
    return sRel;
};