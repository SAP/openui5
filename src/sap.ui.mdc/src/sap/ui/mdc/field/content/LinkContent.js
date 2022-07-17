/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent"
], function(DefaultContent) {
	"use strict";

	/**
	 * Object-based definition of the link content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enum.ContentMode}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.LinkContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var LinkContent = Object.assign({}, DefaultContent, {
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
			var Link = aControlClasses[0];
			var oConditionsType = oContentFactory.getConditionsType();
			// do no set width to open the FieldInfo ast the end of the Link
			var oLink = new Link(sId, {
				text: { path: "$field>/conditions", type: oConditionsType },
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				tooltip: "{$field>/tooltip}",
				press: oContentFactory.getHandleContentPress(),
				wrapping: "{$field>/multipleLines}"
			});
			var oFieldInfo = oContentFactory.getField().getFieldInfo();
			if (oFieldInfo) {
				oFieldInfo.getDirectLinkHrefAndTarget().then(function(oLinkItem) {
					oContentFactory.getMetadata()._oClass._updateLink(oLink, oLinkItem);
				});
			}

			oContentFactory.setAriaLabelledBy(oLink);
			oContentFactory.setBoundProperty("text");

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