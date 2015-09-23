/*!

 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './BarInPageEnabler'],
	function(jQuery, BarInPageEnabler) {
	"use strict";


	/**
	 * Bar renderer.
	 * @namespace
	 */
	var BarRenderer = {};

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
		oRM.addClass("sapMBar");
		oRM.addClass(this.getContext(oControl));

		oControl._writeLandmarkInfo(oRM, oControl);

		if (oControl.getTranslucent() && (sap.ui.Device.support.touch  || jQuery.sap.simulateMobileOnDesktop)) {
			oRM.addClass("sapMBarTranslucent");
		}

		oRM.addClass("sapMBar-CTX");
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
		var sClosingDiv = "</div>";

		//left content area
		oRM.write("<div id='" + oControl.getId() + "-BarLeft' ");
		oRM.addClass('sapMBarLeft');
		oRM.addClass('sapMBarContainer');
		oRM.writeClasses();
		oRM.write(">");

		this.renderAllControls(oControl.getContentLeft(), oRM, oControl);

		oRM.write(sClosingDiv);

		//middle content area
		oRM.write("<div id='" + oControl.getId() + "-BarMiddle' ");
		oRM.addClass('sapMBarMiddle');
		oRM.writeClasses();
		oRM.write(">");
		if (oControl.getEnableFlexBox()) {
			oControl._oflexBox = oControl._oflexBox || new sap.m.HBox(oControl.getId() + "-BarPH", {alignItems: "Center"}).addStyleClass("sapMBarPH").setParent(oControl, null, true);

			oControl.getContentMiddle().forEach(function(oMidContent) {
				oControl._oflexBox.addItem(oMidContent);
			});

			oRM.renderControl(oControl._oflexBox);
		} else {
			oRM.write("<div id='" + oControl.getId() + "-BarPH' ");
			oRM.addClass('sapMBarPH');
			oRM.addClass('sapMBarContainer');
			oRM.writeClasses();
			oRM.write(">");

			this.renderAllControls(oControl.getContentMiddle(), oRM, oControl);

			oRM.write(sClosingDiv);
		}
		oRM.write(sClosingDiv);


		//right content area
		oRM.write("<div id='" + oControl.getId() + "-BarRight'");
		oRM.addClass('sapMBarRight');
		oRM.addClass('sapMBarContainer');
		if (sap.ui.getCore().getConfiguration().getRTL()) {
			oRM.addClass("sapMRTL");
		}
		oRM.writeClasses();
		oRM.write(">");

		this.renderAllControls(oControl.getContentRight(), oRM, oControl);

		oRM.write(sClosingDiv);
	};

	/**
	 * Makes the RenderManager render all controls in an array.
	 * @param {sap.ui.core.Control} aControls The Controls to be rendered
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Bar} oBar An object representation of the control that should be rendered
	 */
	BarRenderer.renderAllControls = function (aControls, oRM, oBar) {
		aControls.forEach(function (oControl) {
			sap.m.BarInPageEnabler.addChildClassTo(oControl, oBar);

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



	return BarRenderer;

}, /* bExport= */ true);
