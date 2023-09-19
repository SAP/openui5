/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/m/library"
], function(DefaultContent, mLibrary) {
	"use strict";

	const EmptyIndicatorMode = mLibrary.EmptyIndicatorMode;

	/**
	 * Object-based definition of the link content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enums.ContentMode}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.LinkContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 */
	const LinkContent = Object.assign({}, DefaultContent, {
		getDisplay: function() {
			return ["sap/m/Link"];
		},
		getDisplayMultiValue: function() {
			return [null];
		},
		getDisplayMultiLine: function() {
			return ["sap/m/Link"]; // render Link too, it wraps in Multiline
		},
		getUseDefaultFieldHelp: function() {
			return false;
		},
		createDisplay: function(oContentFactory, aControlClasses, sId) {
			const Link = aControlClasses[0];
			const oConditionsType = oContentFactory.getConditionsType();
			// do no set width to open the FieldInfo at the end of the Link
			const oLink = new Link(sId, {
				text: { path: "$field>/conditions", type: oConditionsType },
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				tooltip: "{$field>/tooltip}",
				press: oContentFactory.getHandleContentPress(),
				wrapping: "{$field>/multipleLines}",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});
			const oFieldInfo = oContentFactory.getField().getFieldInfo();
			if (oFieldInfo) {
				oFieldInfo.getDirectLinkHrefAndTarget().then(function(oLinkItem) {
					oContentFactory.getMetadata()._oClass._updateLink(oLink, oLinkItem);
				});
			}

			oContentFactory.setAriaLabelledBy(oLink);

			return [oLink];
		},
		createDisplayMultiValue: function() {
			throw new Error("sap.ui.mdc.field.content.LinkContent - createDisplayMultiValue not defined!");
		},
		createDisplayMultiLine: function(oContentFactory, aControlClasses, sId) {
			return LinkContent.createDisplay(oContentFactory, aControlClasses, sId);
		}
	});

	return LinkContent;
});