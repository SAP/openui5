/*!

 * ${copyright}
 */

sap.ui.define(['./BarInPageEnabler', 'sap/ui/Device', "sap/base/Log", 'sap/m/HBox'],
	function(BarInPageEnabler, Device, Log, HBox) {
	"use strict";


	/**
	 * Bar renderer.
	 * @namespace
	 */
	var BarRenderer = {
		apiVersion: 2
	};

	/////////////////
	//Bar in page delegation
	/////////////////

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	BarRenderer.render = BarInPageEnabler.prototype.render;

	/////////////////
	//Bar specific rendering + implementation of enabler hooks
	/////////////////

	/**
	 * Adds classes attributes and styles to the root tag
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	BarRenderer.decorateRootElement = function (oRM, oControl) {
		oRM.class("sapMBar");
		oRM.class(this.getContext(oControl));

		oRM.accessibilityState(oControl, {
			"role": oControl._getRootAccessibilityRole(),
			"level":  oControl._getRootAriaLevel()
		});

		if (oControl.getTranslucent() && Device.support.touch) {
			oRM.class("sapMBarTranslucent");
		}

		oRM.class("sapMBar-CTX");
	};

	/**
	 * Determines if the IBarContext classes should be added to the control.
	 * @private
	 */
	BarRenderer.shouldAddIBarContext = function () {
		return true;
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	BarRenderer.renderBarContent = function(oRM, oControl) {
		//left content area
		oRM.openStart("div", oControl.getId() + "-BarLeft");
		oRM.class("sapMBarLeft");
		oRM.class("sapMBarContainer");
		writeWidthIfContentOccupiesWholeArea("left", oRM, oControl);
		oRM.openEnd();

		this.renderAllControls(oControl.getContentLeft(), oRM, oControl);

		oRM.close("div");

		//middle content area
		oRM.openStart("div", oControl.getId() + "-BarMiddle");
		oRM.class("sapMBarMiddle");
		oRM.openEnd();
		if (oControl.getEnableFlexBox()) {
			oControl._oflexBox = oControl._oflexBox
				|| new HBox(oControl.getId() + "-BarPH", {
					alignItems: "Center"
				}).addStyleClass("sapMBarPH").setParent(oControl, null, true);
			var bContentLeft = !!oControl.getContentLeft().length,
				bContentMiddle = !!oControl.getContentMiddle().length,
				bContentRight = !!oControl.getContentRight().length;
			if (bContentMiddle && !bContentLeft && !bContentRight) {
				oControl._oflexBox.addStyleClass("sapMBarFlexBoxWidth100");

			}
			oControl.getContentMiddle().forEach(function(oMidContent) {
				oControl._oflexBox.addItem(oMidContent);
			});

			oRM.renderControl(oControl._oflexBox);
		} else {
			oRM.openStart("div", oControl.getId() + "-BarPH");
			oRM.class("sapMBarPH");
			oRM.class("sapMBarContainer");
			writeWidthIfContentOccupiesWholeArea("middle", oRM, oControl);
			oRM.openEnd();

			this.renderAllControls(oControl.getContentMiddle(), oRM, oControl);

			oRM.close("div");
		}
		oRM.close("div");

		//right content area
		oRM.openStart("div", oControl.getId() + "-BarRight");
		oRM.class("sapMBarRight");
		oRM.class("sapMBarContainer");
		if (sap.ui.getCore().getConfiguration().getRTL()) {
			oRM.class("sapMRTL");
		}
		writeWidthIfContentOccupiesWholeArea("right", oRM, oControl);
		oRM.openEnd();

		this.renderAllControls(oControl.getContentRight(), oRM, oControl);

		oRM.close("div");
	};

	/**
	 * Makes the RenderManager render all controls in an array.
	 * @param {sap.ui.core.Control} aControls The Controls to be rendered
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Bar} oBar An object representation of the control that should be rendered
	 */
	BarRenderer.renderAllControls = function (aControls, oRM, oBar) {
		aControls.forEach(function (oControl) {
			BarInPageEnabler.addChildClassTo(oControl, oBar);

			oRM.renderControl(oControl);
		});
	};

	BarRenderer._mContexts = {
			Header : "sapMHeader-CTX",
			SubHeader : "sapMSubHeader-CTX",
			Footer : "sapMFooter-CTX",
			Default : "sapMContent-CTX"
	};

	/**
	 * Determines which tag or context class the Bar should have.
	 * @protected
	 * @param {sap.m.BarBase} oControl The Bar control
	 * @returns {string} The context class
	 */
	BarRenderer.getContext = function(oControl) {
		var sDesign = oControl.getDesign(),
			mContexts = BarRenderer._mContexts;

		return mContexts[sDesign] || mContexts.Default;
	};

	/**
	 * Adds width style to 100% in case of the given content container is the only container with content amongst the three (left, middle, right)
	 * @param {string} sArea The content container - one of the left, middle or right
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oControl the Bar instance
	 * @private
	 */
	function writeWidthIfContentOccupiesWholeArea(sArea, oRm, oControl) {
		var bContentLeft = !!oControl.getContentLeft().length,
			bContentMiddle = !!oControl.getContentMiddle().length,
			bContentRight = !!oControl.getContentRight().length;
		switch (sArea.toLowerCase()) {
			case "left":
				if (bContentLeft && !bContentMiddle && !bContentRight) {
					oRm.style("width", "100%");
				}
				break;
			case "middle":
				if (bContentMiddle && !bContentLeft && !bContentRight) {
					oRm.style("width", "100%");
				}
				break;
			case "right" :
				if (bContentRight && !bContentLeft && !bContentMiddle) {
					oRm.style("width", "100%");
				}
				break;
			default:
				Log.error("Cannot determine which of the three content aggregations is alone");
		}
	}



	return BarRenderer;

}, /* bExport= */ true);
