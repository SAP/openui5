var rRegexp = /This text comes from ([A-Za-z0-9]+)( [A-Za-z0-9]+)? \([A-Za-z]+\)/;
var extractAppVarAndTerminologyIds = function (sText) {
    var oResult = rRegexp.exec(sText);
    if (oResult) {
        return [oResult[1], oResult[2]];
    }
};
var createSvgDomElement = function (sType) {
    return document.createElementNS("http://www.w3.org/2000/svg", sType);
};
var domById = function (sId) {
    return document.getElementById(sId);
};
var addCircleToSvgBox = function (svgElementId, aColors) {
    var iHeight = 0;
    aColors.forEach(function (sColor) {
        var oDomElement = domById(svgElementId);
        var oHighLightDom = createSvgDomElement("circle");
        var iValueY = oDomElement.getAttribute("y");
        iValueY = parseFloat(iValueY) + iHeight;
        oHighLightDom.setAttribute("cx", oDomElement.getAttribute("x"));
        oHighLightDom.setAttribute("cy", "" + iValueY);
        oHighLightDom.setAttribute("r", "10");
        oHighLightDom.setAttribute("fill", sColor);
        oHighLightDom.setAttribute("stroke", "black");
        oHighLightDom.setAttribute("stroke-width", "1");
        oDomElement.parentNode.appendChild(oHighLightDom);
        iHeight += 10;
    });
};
var addTrianglesToSvgBox = function (svgElementId, aColors) {
    var oDomElement = domById(svgElementId);
    var iWidth = parseFloat(oDomElement.getAttribute("width")) - 21;
    aColors.forEach(function (sColor) {
        var iValueY = parseFloat(oDomElement.getAttribute("y")) + 12;
        var oHighLightDomOuter = createSvgDomElement("svg");
        oHighLightDomOuter.setAttribute("x", iWidth);
        oHighLightDomOuter.setAttribute("y", iValueY);
        oHighLightDomOuter.setAttribute("width", "21");
        oHighLightDomOuter.setAttribute("height", "21");
        var oHighLightDom = createSvgDomElement("polygon");
        oHighLightDom.setAttribute("points", "13,10 5,21 21,21");
        oHighLightDom.setAttribute("fill", sColor);
        oHighLightDom.setAttribute("stroke", "black");
        oHighLightDom.setAttribute("stroke-width", "1");
        oHighLightDomOuter.appendChild(oHighLightDom);
        oDomElement.parentNode.appendChild(oHighLightDomOuter);
        iWidth -= 6;
    });
};
var convertToSvgId = function (sAppVarId, sTerminologyId) {
    return "terminology-" + sAppVarId + (sTerminologyId ? "-" + sTerminologyId.substring("terminology".length + 1) : "");
};
var highlightActiveText = function (aTexts) {
    var oBoxIdToColors = {};
    aTexts.forEach(function (oElement) {
        var aIdArray = extractAppVarAndTerminologyIds(oElement.text);
        if (aIdArray) {
            var sBoxId = convertToSvgId(aIdArray[0], aIdArray[1]);
            oBoxIdToColors[sBoxId] = oBoxIdToColors[sBoxId] || [];
            oBoxIdToColors[sBoxId].push(oElement.color);
        }
    });
    Object.keys(oBoxIdToColors).forEach(function (sBoxId) {
        var aColors = oBoxIdToColors[sBoxId].slice().reverse();
        addCircleToSvgBox(sBoxId, aColors);
    });
};
var highlightDefinedKeys = function () {
    var oBoxIdToColors = {
        "terminology-appvar2-1": ["lightblue"],
        "terminology-appvar2": ["lightblue", "lightgreen"],
        "terminology-appvar1-2": ["lightblue", "lightcoral"],
        "terminology-appvar1-1": ["lightblue", "lightcoral"],
        "terminology-appvar1": ["lightblue", "lightcoral", "lightgreen"],
        "terminology-base-1": ["lightblue", "lightcoral"],
        "terminology-base-2": ["lightblue", "lightcoral"],
        "terminology-base": ["lightblue", "lightcoral", "lightgreen"]
    };
    Object.keys(oBoxIdToColors).forEach(function (sBoxId) {
        var aColors = oBoxIdToColors[sBoxId].slice().reverse();
        addTrianglesToSvgBox(sBoxId, aColors);
    });
};
function grayOutIrrelevantBoxes(sAppVar, sActiveTerminology) {
    var sTerminologyId = sAppVar + "-" + sActiveTerminology.substring("terminology".length);
    var oAppVarHierarchy = {
        "appvar2": ["appvar2", "appvar1", "base"],
        "appvar1": ["appvar1", "base"],
        "base": ["base"]
    };
    var oTerminologyHierarchy = {
        "appvar2-1": ["appvar2-1", "appvar1-1", "base-1"],
        "appvar1-1": ["appvar1-1", "base-1"],
        "base-1": ["base-1"],
        "appvar2-2": ["appvar1-2", "base-2"],
        "appvar1-2": ["appvar1-2", "base-2"],
        "base-2": ["base-2"]
    };
    var aAllAppVars = ["appvar2", "appvar1", "base"];
    var aAllTerminologies = ["appvar2-1", "appvar1-1", "base-1", "appvar1-2", "base-2"];
    function setClassToInvalid() {
        return function (sDependentId) {
            var oDom = domById("terminology-" + sDependentId);
            oDom.classList.add("Inactive");
        };
    }
    if (oAppVarHierarchy[sAppVar]) {
        aAllAppVars = aAllAppVars.filter(function (sAppVarId) {
            return oAppVarHierarchy[sAppVar].indexOf(sAppVarId) === -1;
        });
    }
    if (oTerminologyHierarchy[sTerminologyId]) {
        aAllTerminologies = aAllTerminologies.filter(function (sAppVarId) {
            return oTerminologyHierarchy[sTerminologyId].indexOf(sAppVarId) === -1;
        });
    }
    aAllAppVars.forEach(setClassToInvalid());
    aAllTerminologies.forEach(setClassToInvalid());
}