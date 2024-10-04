/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Control"], function (Control) {
	"use strict";

	/**
	 * Constructor for a new ActionsPlaceholder.
	 *
	 * @param {string} [sId] ID for the new control. It is generated automatically if an ID is not provided.
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The control acts as placeholder to position specific action controls (Upload, Upload from cloud) on headertoolbar of table with connected plugin {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable} Plugin.<br>
	 * The type of action control placed on the headertoolbar is determined by the {@link sap.m.UploadSetwithTableActionPlaceHolder UploadSetwithTableActionPlaceHolder} enum set.<br>
	 * This control is supposed to be used only within the association of the {@link sap.m.plugins.UploadSetwithTable UploadSetwithTable} Plugin.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.120
	 * @alias sap.m.upload.ActionsPlaceholder
	 */

	const ActionsPlaceholder = Control.extend("sap.m.upload.ActionsPlaceholder", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines the enum value that determines which control gets substituted.
				 */
				placeholderFor : {type: "sap.m.UploadSetwithTableActionPlaceHolder"}
			},
			aggregations: {
				/**
				 * The action control to be rendered in the placeholder.
				 */
				_actionButton: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				if (oControl?.getPlaceholderFor()) {
					// pass the custom style classes added to the placeholder control to the action control.
					// usecase : to add custom style classes to the action control added to the placeholder when the placeholder is used in the table header toolbar.
					// the header toolbar added the custom class .sapMBarChild to the placeholder control. This class is not added to the action control.
                    const oActionControl = oControl.getAggregation("_actionButton");
                    const aCustomClasses = oControl?.aCustomStyleClasses;
                    aCustomClasses?.forEach((sClass) => {
                        oActionControl?.addStyleClass(sClass);
                    });


                    oRm.renderControl(oActionControl);
				}
			}
		}
	});

	return ActionsPlaceholder;
});
