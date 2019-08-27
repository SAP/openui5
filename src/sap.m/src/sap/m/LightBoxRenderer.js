/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library"], function (library) {
	'use strict';

	// shortcut for sap.m.LightBoxLoadingStates
	var LightBoxLoadingStates = library.LightBoxLoadingStates;

	/**
	 * LightBox renderer.
	 * @namespace
	 */
	var LightBoxRenderer = {};

	var className = 'sapMLightBox';
	var classNameTwoLines = 'sapMLightBoxTwoLines';
	var classNameImageContainer = 'sapMLightBoxImageContainer';
	var classNameImageContainerTwoLines = 'sapMLightBoxImageContainerTwoHeaders';
	var classNameError = 'sapMLightBoxError';
	var classNameErrorContainer = 'sapMLightBoxErrorContainer';
	var classNameErrorContainerTwoLines = 'sapMLightBoxErrorContainerTwoHeaders';
	var classNameFooter = 'sapMLightBoxFooter';
	var classNameContrastBelize = 'sapContrast';
	var classNameContrastBelizePlus = 'sapContrastPlus';
	var classNameFooterTitleSection = 'sapMLightBoxTitleSection';
	var classNameFooterTitle = 'sapMLightBoxTitle';
	var classNameFooterSubtitle = 'sapMLightBoxSubtitle';
	var classNameFooterTwoLines = 'sapMLightBoxFooterTwoLines';
	var classNameTopCornersRadius = 'sapMLightBoxTopCornersRadius';

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	LightBoxRenderer.render = function (oRm, oControl) {
		/** @type {sap.m.LightBoxItem} */
		var lightBoxItem = oControl._getImageContent();
		/** @type {sap.m.LightBoxLoadingStates} */
		var imageState = lightBoxItem._getImageState();

		var invisiblePopupText = oControl.getAggregation('_invisiblePopupText');

		oRm.write('<div');
		oRm.writeControlData(oControl);
		oRm.writeAttribute("tabindex", "-1");
		oRm.addClass(className);

		if (lightBoxItem.getSubtitle()) {
			oRm.addClass(classNameTwoLines);
		}

		if (oControl._isLightBoxBiggerThanMinDimensions) {
			oRm.addClass(classNameTopCornersRadius);
		}

		if (imageState !== LightBoxLoadingStates.Error) {
			oRm.addStyle('width', oControl._width + 'px');
			oRm.addStyle('height', oControl._height + 'px');
		} else {
			oRm.addClass(classNameError);
		}

		oRm.writeAccessibilityState({
			role: 'dialog',
			modal: true,
			labelledby: invisiblePopupText && invisiblePopupText.getId()
		});

		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write('>');

		oRm.renderControl(invisiblePopupText);

		//if control is busy render busyIndicator instead
		if (imageState === LightBoxLoadingStates.Loading) {
			this.renderBusyState(oRm, oControl);
		} else if (imageState === LightBoxLoadingStates.TimeOutError ||
			imageState === LightBoxLoadingStates.Error) {
			this.renderError(oRm, oControl);
		} else {
			this.renderImage(oRm, oControl);
		}

		this.renderFooter(oRm, oControl, lightBoxItem);

		oRm.write('</div>');

		oControl._isRendering = false;
	};

	LightBoxRenderer.renderImage = function(oRm, oControl) {
		var oLightBoxItem = oControl._getImageContent();

		if (oLightBoxItem.getSubtitle()) {
			oRm.write('<div class="' + classNameImageContainerTwoLines + '">');
		} else {
			oRm.write('<div class="' + classNameImageContainer + '">');
		}

		oRm.renderControl(oLightBoxItem.getAggregation('_image'));
		oRm.write('</div>');
	};

	LightBoxRenderer.renderError = function(oRm, oControl) {
		var oLightBoxItem = oControl._getImageContent(),
			oVerticalLayout = oControl.getAggregation('_verticalLayout');

		if (oLightBoxItem.getSubtitle()) {
			oRm.write('<div class="' + classNameErrorContainerTwoLines + '">');
		} else {
			oRm.write('<div class="' + classNameErrorContainer + '">');
		}

		oRm.renderControl(oVerticalLayout);

		oRm.write('</div>');
	};

	LightBoxRenderer.renderBusyState = function (oRm, oControl) {
		oRm.renderControl(oControl._getBusyIndicator());
	};

	LightBoxRenderer.renderFooter = function(oRm, oControl, oImageContent) {
		var title = oImageContent.getAggregation("_title"),
			subtitle = oImageContent.getAggregation("_subtitle");
		oRm.write('<div');
		oRm.addClass(classNameFooter);
		oRm.addClass(classNameContrastBelize);
		oRm.addClass(classNameContrastBelizePlus);

		if (oImageContent.getSubtitle()) {
			oRm.addClass(classNameFooterTwoLines);
		}

		oRm.writeClasses();
		oRm.write( '>');
		oRm.write('<div class="' + classNameFooterTitleSection + '">');
		if (title) {
			oRm.renderControl(title.addStyleClass(classNameFooterTitle));
		}

		if (subtitle && subtitle.getText()) {
			oRm.renderControl(subtitle.addStyleClass(classNameFooterSubtitle));
		}

		oRm.write('</div>');
		oRm.renderControl(oControl._getCloseButton());
		oRm.write('</div>');
	};


	return LightBoxRenderer;
}, /* bExport= */ true);
