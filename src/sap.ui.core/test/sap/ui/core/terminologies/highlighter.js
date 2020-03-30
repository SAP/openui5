sap.ui.define([], function () {
	"use strict";

	var rRegexp = /This text comes from ([A-Za-z0-9]+)( [A-Za-z0-9]+)? \([A-Za-z]+\)/;
	/**
	 * Extracts the appvar id and the terminology id from the given text
	 * @param {string} sText ui text, e.g. "This text comes from appvar1 terminology1 (de)"
	 * @returns {[string, string]} appvar id and terminology id, e.g. ["appvar1", "terminology1"],
	 *     <code>undefined</code> if not found
	 */
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

			// distance to next circle
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

			// distance to next triangle
			iWidth -= 6;
		});
	};

	/**
	 * @param {string} sAppVarId app variant id, e.g. "appvar1"
	 * @param {string} sTerminologyId terminology id, e.g. "terminology2"
	 * @returns {string} the id of the box in the svg image, e.g. "terminology-appvar1-2"
	 */
	var convertToSvgId = function(sAppVarId, sTerminologyId) {
		return "terminology-" + sAppVarId + (sTerminologyId ? "-" + sTerminologyId.substring("terminology".length + 1) : "");
	};

	/**
	 * Highlights the active texts
	 * @param {object[]} aTexts containing <code>text</code> and <code>color</code>
	 */
	var highlightActiveText = function(aTexts) {
		var oBoxIdToColors = {};
		aTexts.forEach(function (oElement) {
			// use the text to identify the correct box by id in the svg image
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

	/**
	 * Highlights the defined keys by printing triangles for each defined key in the box
	 */
	var highlightDefinedKeys = function() {
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

	/**
	 * Gray out unrelated boxes
	 * @param {string} sAppVar appvar id, one of "base", "appvar1" and "appvar2"
	 * @param {string} sActiveTerminology active terminology id, one of "none", "appvar1" and "appvar2"
	 */
	function grayOutIrrelevantBoxes(sAppVar, sActiveTerminology) {
		// gray out not relevant boxes by changing its class and appending Inactive
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

	return {
		highlight: function (oView, sActiveTerminology, sAppVar) {

			// gray out the boxes which are not relevant
			grayOutIrrelevantBoxes(sAppVar, sActiveTerminology);

			var aTextWithColor = [
				{id: "maxappvar1", color: "lightcoral"},
				{id: "appvartext", color: "lightgreen"},
				{id: "terminologytext", color: "lightblue"}
			].map(function (oBox) {
				return {
					text: oView.byId(oBox.id).getText(),
					color: oBox.color
				};
			});
			// highlights the active texts
			highlightActiveText(aTextWithColor);

			// definitions where each text is defined
			highlightDefinedKeys();
		}
	};
});