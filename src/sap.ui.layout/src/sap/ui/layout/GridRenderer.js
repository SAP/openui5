/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/Device", "sap/ui/layout/library"],
	function(Device, library) {
	"use strict";


	// shortcut for sap.ui.layout.GridPosition
	var GridPosition = library.GridPosition;


	/**
	 * @author SAP SE
	 * @version
	 * ${version}
	 * @namespace
	 */
	var GridRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render
	 *            output buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
	GridRenderer.render = function(oRm, oControl) {
		var INDENTPATTERN = /^([X][L](?:[0-9]|1[0-1]))? ?([L](?:[0-9]|1[0-1]))? ?([M](?:[0-9]|1[0-1]))? ?([S](?:[0-9]|1[0-1]))?$/i;
		var SPANPATTERN =   /^([X][L](?:[1-9]|1[0-2]))? ?([L](?:[1-9]|1[0-2]))? ?([M](?:[1-9]|1[0-2]))? ?([S](?:[1-9]|1[0-2]))?$/i;

		// write the HTML into the render manager
		oRm.openStart("div", oControl);
		oRm.class("sapUiRespGrid");

		var  sMedia = oControl._getCurrentMediaContainerRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED).name;
		oRm.class("sapUiRespGridMedia-Std-" + sMedia);

		var fHSpacing = oControl.getHSpacing();
		// Check for allowed values, if not matching, set to to default 1 rem.
		if (fHSpacing === 0.5) {
			fHSpacing = "05";
		} else if ((fHSpacing !== 0) && (fHSpacing !== 1) && (fHSpacing !== 2)) {
			fHSpacing = 1;
		}

		oRm.class("sapUiRespGridHSpace" + fHSpacing);

		var fVSpacing = oControl.getVSpacing();
		// Check for allowed values, if not matching, set to to default 1 rem.
		if (fVSpacing === 0.5) {
			fVSpacing = "05";
		} else if ((fVSpacing !== 0) && (fVSpacing !== 1) && (fVSpacing !== 2)) {
			fVSpacing = 1;
		}

		oRm.class("sapUiRespGridVSpace" + fVSpacing);

		var sPosition = oControl.getPosition();
		if (sPosition) {
			sPosition = sPosition.toUpperCase();
			if (sPosition === GridPosition.Center.toUpperCase()) {
				oRm.class("sapUiRespGridPosCenter");
			} else if (sPosition === GridPosition.Right.toUpperCase()) {
				oRm.class("sapUiRespGridPosRight");
			}
		}

		var sWidth = oControl.getWidth();
		if (sWidth !== "100%" && sWidth !== "auto" && sWidth !== "inherit") {
			if (fHSpacing === 0) {
				oRm.style("width", sWidth);
			} else {
				oRm.style("width", "-webkit-calc(" + sWidth + " - " + fHSpacing  + "rem)");
				oRm.style("width", "calc(" + sWidth + " - " + fHSpacing  + "rem)");
			}
		}

		var sRole = oControl._getAccessibleRole();
		var mAriaProps;
		if (sRole) {
			mAriaProps = {role: sRole};
		}

		oRm.accessibilityState(oControl, mAriaProps);

		oRm.openEnd();

		var aItems = oControl.getContent();

		var defaultSpan = oControl.getDefaultSpan();

		// Default Span if nothing is specified at all, not on Grid , not on the
		// cell.
		var aInitialSpan = [ "", "XL3", "L3", "M6", "S12"];

		// Default Indent if nothing is specified at all, not on Grid , not on the
		// cell.
		var aInitialIndent = [ "", "XL0", "L0", "M0", "S0"];

		// Default Span values defined on the whole Grid, that is used if there is
		// no individual span defined for the cell.
		var aDefaultSpan = SPANPATTERN.exec(defaultSpan);

		// Determinate if default span value for XL was changed.
		var bDefaultSpanXLChanged = oControl._getSpanXLChanged();

		// Determinate if default indent value for Indent was changed.
		var bDefaultIndentXLChanged = oControl._getIndentXLChanged();

		// Default indent of the whole Grid control
		var sDefaultIndent = oControl.getDefaultIndent();
		var aDefaultIndent = INDENTPATTERN.exec(sDefaultIndent);


		for ( var i = 0; i < aItems.length; i++) { // loop over all child controls
			oRm.openStart("div");
			var oLay = oControl._getLayoutDataForControl(aItems[i]);
			var bCellSpanXLChanged = false;

			if (!aItems[i].getVisible()) {
				oRm.class("sapUiRespGridSpanInvisible");
			}

			if (oLay) {

				//************************************************************************
				//  LINE BREAK
				//************************************************************************
				var bBreakXLChanged = false;
				if (oLay.getLinebreak() === true) {
					oRm.class("sapUiRespGridBreak");
				} else {
					if (oLay.getLinebreakXL() === true) {
						bBreakXLChanged = true;
						oRm.class("sapUiRespGridBreakXL");
					}
					if (oLay.getLinebreakL() === true) {
						if (!bBreakXLChanged && !oLay._getLinebreakXLChanged()){
							oRm.class("sapUiRespGridBreakXL");
						}
						oRm.class("sapUiRespGridBreakL");
					}
					if (oLay.getLinebreakM() === true) {
						oRm.class("sapUiRespGridBreakM");
					}
					if (oLay.getLinebreakS() === true) {
						oRm.class("sapUiRespGridBreakS");
					}
				}




				//************************************************************************
				//  SPAN
				//************************************************************************
				// array of spans
				var aSpan;
				// sSpanL needed for XL if XL is not defined at all
				var sSpanL;
				var sSpan = oLay.getSpan();
				if (!sSpan || !sSpan.lenght == 0) {
					aSpan = aDefaultSpan;
				} else {
					aSpan = SPANPATTERN.exec(sSpan);
					if (/XL/gi.test(sSpan)) {
						bCellSpanXLChanged = true;
					}
				}


				if (aSpan) {
					for ( var j = 1; j < aSpan.length; j++) {
						var span = aSpan[j];
						if (!span) {
							span = aDefaultSpan[j];
							if (!span) {
								span = aInitialSpan[j];
							}
						}

						if (span.substr(0, 1) === "L") {
							sSpanL = span.substr(1, 2);
						}

						// Catch the Individual Spans
						var iSpanXLarge = oLay.getSpanXL();
						var iSpanLarge = oLay.getSpanL();
						var iSpanMedium = oLay.getSpanM();
						var iSpanSmall = oLay.getSpanS();

						span = span.toUpperCase();
						if ((span.substr(0, 2) === "XL") && (iSpanXLarge > 0)	&& (iSpanXLarge < 13)) {
							oRm.class("sapUiRespGridSpanXL" + iSpanXLarge);
							bCellSpanXLChanged = true;
						} else if ((span.substr(0, 1) === "L") && (iSpanLarge > 0)	&& (iSpanLarge < 13)) {
							oRm.class("sapUiRespGridSpanL" + iSpanLarge);
							sSpanL = iSpanLarge;
						} else if ((span.substr(0, 1) === "M") && (iSpanMedium > 0)	&& (iSpanMedium < 13)) {
							oRm.class("sapUiRespGridSpanM" + iSpanMedium);
						} else if ((span.substr(0, 1) === "S") && (iSpanSmall > 0) && (iSpanSmall < 13)) {
							oRm.class("sapUiRespGridSpanS" + iSpanSmall);
						} else {
							if ((span.substr(0, 2) !== "XL") || bDefaultSpanXLChanged || bCellSpanXLChanged){
								oRm.class("sapUiRespGridSpan" + span);
							}
						}
					}

					if (!bDefaultSpanXLChanged && !bCellSpanXLChanged) {
						// Backwards compatibility - if the XL not defined - it should be as L.
						oRm.class("sapUiRespGridSpanXL" + sSpanL);
					}
				}




				//************************************************************************
				//  INDENT
				//************************************************************************

				var aIndent;
				var sIndentL;
				var sIndent = oLay.getIndent();
				if (!sIndent || sIndent.length == 0) {
					aIndent = aDefaultIndent;
				} else {
					aIndent = INDENTPATTERN.exec(sIndent);
					if (/XL/gi.test(sIndent)) {
						bDefaultIndentXLChanged = true;
					}
				}

				if (!aIndent) {
					aIndent = aDefaultIndent;
					if (!aIndent) {
						aIndent = undefined; // no indent
					}
				}

				// Catch the Individual Indents
				var iIndentXLarge = oLay.getIndentXL();
				var iIndentLarge = oLay.getIndentL();
				var iIndentMedium = oLay.getIndentM();
				var iIndentSmall = oLay.getIndentS();

				if (aIndent) {
					for ( var j = 1; j < aIndent.length; j++) {
						var indent = aIndent[j];
						if (!indent) {
							if (aDefaultIndent && aDefaultIndent[j]) {
								indent = aDefaultIndent[j];
							} else {
								indent = aInitialIndent[j];
							}
						}
						if (indent) {
							indent = indent.toUpperCase();
							if (indent.substr(0, 1) === "L") {
								sIndentL = indent.substr(1, 2);
							}



							if ((indent.substr(0, 2) === "XL") && (iIndentXLarge > 0) && (iIndentXLarge < 12)) {
									oRm.class("sapUiRespGridIndentXL" + iIndentXLarge);
									bDefaultIndentXLChanged = true;
							} else if ((indent.substr(0, 1) === "L") && (iIndentLarge > 0)
									&& (iIndentLarge < 12)) {
								oRm.class("sapUiRespGridIndentL" + iIndentLarge);
								sIndentL = iIndentLarge;
							} else if ((indent.substr(0, 1) === "M")
									&& (iIndentMedium > 0) && (iIndentMedium < 12)) {
								oRm.class("sapUiRespGridIndentM"	+ iIndentMedium);
							} else if ((indent.substr(0, 1) === "S")
									&& (iIndentSmall > 0) && (iIndentSmall < 12)) {
								oRm.class("sapUiRespGridIndentS" + iIndentSmall);
							} else {
								if (!(/^(XL0)? ?(L0)? ?(M0)? ?(S0)?$/.exec(indent))) {
									oRm.class("sapUiRespGridIndent" + indent);
								}
							}
						}
					}
					if (!bDefaultIndentXLChanged) {
						// Backwards compatibility - if the XL not defined - it should be as L.
						if (sIndentL && sIndentL > 0) {
							oRm.class("sapUiRespGridIndentXL" + sIndentL);
						}
					}

				}


				// Visibility

				if (!oLay.getVisibleXL()) {
					oRm.class("sapUiRespGridHiddenXL");
				}

				if (!oLay.getVisibleL()) {
					oRm.class("sapUiRespGridHiddenL");
				}

				if (!oLay.getVisibleM()) {
					oRm.class("sapUiRespGridHiddenM");
				}

				if (!oLay.getVisibleS()) {
					oRm.class("sapUiRespGridHiddenS");
				}


				// Move - moveBackwards shifts a grid element to the left in LTR mode and
				// opposite in RTL mode

				var sMoveB = oLay.getMoveBackwards();

				if (sMoveB && sMoveB.length > 0) {
					var aMoveB = INDENTPATTERN.exec(sMoveB);
					if (aMoveB) {
						for ( var j = 1; j < aMoveB.length; j++) {
							var moveB = aMoveB[j];
							if (moveB) {
								oRm.class("sapUiRespGridBwd"	+ moveB.toUpperCase());
							}
						}
					}
				}
				// ... while moveForward shifts it to the right in LTR mode and opposite
				// in RTL
				var sMoveF = oLay.getMoveForward();

				if (sMoveF && sMoveF.length > 0) {
					var aMoveF = INDENTPATTERN.exec(sMoveF);
					if (aMoveF) {
						for ( var j = 1; j < aMoveF.length; j++) {
							var moveF = aMoveF[j];
							if (moveF) {
								oRm.class("sapUiRespGridFwd"	+ moveF.toUpperCase());
							}
						}
					}
				}

				if (typeof oLay._sStylesInternal === "string") {
					var aStylesInternal = oLay._sStylesInternal.split(" ");

					for (var iStylesIterator = 0; iStylesIterator < aStylesInternal.length; iStylesIterator++) {
						oRm.class(aStylesInternal[iStylesIterator]);
					}
				}
			}

			// No layoutData - apply default values. it could be
			// default value defined on Grid control, or id it is does not exist default parameter value "XL3 L3 M6 S12"
			// XL default value changes if L is defined.
			if (!oLay) {
				var span = "";
				if (aDefaultSpan) {
					for ( var j = 1; j < aDefaultSpan.length; j++) {
						span = aDefaultSpan[j];
						if (!span) {
							if ((j === 1) && (aDefaultSpan[j + 1])) {
								span = "X" + aDefaultSpan[j + 1];
							} else {
								span = aInitialSpan[j];
							}
						}
						oRm.class("sapUiRespGridSpan" + span.toUpperCase());
					}
				} else {
					for ( var j = 1; j < aInitialSpan.length; j++) {
						span = aInitialSpan[j];
						oRm.class("sapUiRespGridSpan" + span.toUpperCase());
					}
				}

				var indent = "";
				if (aDefaultIndent) {
					for ( var j = 1; j < aDefaultIndent.length; j++) {
						indent = aDefaultIndent[j];
						if (!indent) {
							if ((j === 1) && (aDefaultIndent[j + 1])) {
								indent = "X" + aDefaultIndent[j + 1];
							} else {
								indent = aInitialIndent[j];
							}
						}
						if (((indent.substr(0,1) !== "X") && (indent.substr(1,1) !== "0")) || ((indent.substr(0,1) == "X") && (indent.substr(2,1) !== "0"))) {
							oRm.class("sapUiRespGridIndent" + indent.toUpperCase());
						}
					}
				}
			}

			oRm.openEnd();

			oRm.renderControl(aItems[i]); // render the child control (could even
											// be a big control tree, but you don't
											// need to care)

			oRm.close("div"); // end of the box around the respective child
		}

		oRm.close("div"); // end of the complete grid  control
	};

	return GridRenderer;

}, /* bExport= */ true);
