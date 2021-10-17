var createAndAppendDiv = function (vId, oRootNode) {
    if (!Array.isArray(vId)) {
        return createAndAppendDiv([vId], oRootNode)[0];
    }
    oRootNode = oRootNode || document.body;
    return vId.map(function (sId) {
        var elem = document.createElement("div");
        elem.id = sId;
        return oRootNode.appendChild(elem);
    });
};