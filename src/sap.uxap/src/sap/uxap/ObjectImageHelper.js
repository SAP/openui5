/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/IconPool",
	"sap/m/Avatar",
	"sap/m/Image"
], function (ManagedObject, IconPool, Avatar, Image) {
	"use strict";

	var ObjectImageHelper = function() {
	};

	ObjectImageHelper.createObjectImage = function(oHeader) {
		var oObjectImage,
			sObjectImageURI = oHeader.getObjectImageURI();

		if (sObjectImageURI.indexOf("sap-icon://") === 0) {
			oObjectImage = ObjectImageHelper.instantiateAvatar(sObjectImageURI);
			oObjectImage.addStyleClass("sapUxAPObjectPageHeaderObjectImageIcon");
		} else {
			oObjectImage = new Image({
				densityAware: oHeader.getObjectImageDensityAware(),
				alt: ManagedObject.escapeSettingsValue(oHeader.getObjectImageAlt()),
				decorative: false,
				mode: "Background",
				backgroundSize: "contain",
				backgroundPosition: "center"
			});

			oObjectImage.addStyleClass("sapUxAPObjectPageHeaderObjectImage");
			oObjectImage.setSrc(sObjectImageURI);
		}

		if (oHeader.getObjectImageAlt()) {
			oObjectImage.setTooltip(oHeader.getObjectImageAlt());
		}
		return oObjectImage;
	};

	ObjectImageHelper.instantiateAvatar = function(sURI) {
		return new Avatar({
			displaySize: "L",
			fallbackIcon: sURI
		});
	};

	ObjectImageHelper.createPlaceholder = function() {
		return ObjectImageHelper.instantiateAvatar(IconPool.getIconURI("picture"));
	};

	ObjectImageHelper.updateAvatarInstance = function(oAvatarInstance, sShape, sColor) {
		oAvatarInstance.setDisplayShape(sShape);
		oAvatarInstance.setBackgroundColor(sColor);
	};

	ObjectImageHelper._renderImageAndPlaceholder = function(oRm, oOptions) {

		var oHeader = oOptions.oHeader,
			oObjectImage = oOptions.oObjectImage,
			oPlaceholder = oOptions.oPlaceholder,
			bIsObjectIconAlwaysVisible = oOptions.bIsObjectIconAlwaysVisible,
			bAddSubContainer = oOptions.bAddSubContainer,
			sBaseClass = oOptions.sBaseClass,
			sObjectImageShape = oHeader.getObjectImageShape(),
			sObjectImageBackgroundColor = oHeader.getObjectImageBackgroundColor(),
			bShowPlaceholder = oHeader.getShowPlaceholder() && !oHeader.getObjectImageURI(),
			bAddIconContainer = oObjectImage.isA("sap.m.Avatar");

		if (oHeader.getShowPlaceholder()) {
			ObjectImageHelper.updateAvatarInstance(oPlaceholder, sObjectImageShape, sObjectImageBackgroundColor);
		}

		if (oHeader.getObjectImageURI() || oHeader.getShowPlaceholder()) {
			oRm.openStart("span")
				.class(sBaseClass)
				.class('sapUxAPObjectPageHeaderObjectImage-' + sObjectImageShape);

			if (bIsObjectIconAlwaysVisible) {
				oRm.class('sapUxAPObjectPageHeaderObjectImageForce');
			}
			oRm.openEnd();

			if (bAddSubContainer) { // add subContainer
				oRm.openStart("span")
					.class("sapUxAPObjectPageHeaderObjectImageContainerSub")
					.openEnd();
			}

			if (bAddIconContainer) {
				ObjectImageHelper.updateAvatarInstance(oObjectImage, sObjectImageShape, sObjectImageBackgroundColor);
				oRm.openStart("div")
					.class("sapUxAPObjectPageHeaderObjectImage")
					.class("sapUxAPObjectPageHeaderPlaceholder")
					.openEnd();
			}

			if (oHeader.getObjectImageURI()) {
				oRm.renderControl(oObjectImage);
			}
			ObjectImageHelper._renderPlaceholder(oRm, oPlaceholder, bShowPlaceholder);

			if (bAddIconContainer) {
				oRm.close("div"); // close icon container
			}

			if (bAddSubContainer) { // close subContainer
				oRm.close("span");
			}
			oRm.close("span");
		}
	};


	/**
	 * Renders the SelectTitleArrow icon.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.uxap.ObjecPageHeader} oPlaceholder The ObjectPageHeader
	 * @param {boolean} bVisible Whether the placeholder will be visible
	 *
	 * @private
	 */
	ObjectImageHelper._renderPlaceholder = function (oRm, oPlaceholder, bVisible) {
		oRm.openStart("div")
			.class('sapUxAPObjectPageHeaderPlaceholder')
			.class('sapUxAPObjectPageHeaderObjectImage');

		if (!bVisible) {
			oRm.class('sapUxAPHidePlaceholder');
		}

		oRm.openEnd();
		oRm.renderControl(oPlaceholder);
		oRm.close("div");
	};

	return ObjectImageHelper;

});