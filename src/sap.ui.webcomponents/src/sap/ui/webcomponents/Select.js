/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Select.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"sap/ui/core/library",
	"./thirdparty/ui5-wc-bundles/Select"
], function(WebComponent, coreLibrary, WC) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>Select</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.Select
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Select = WebComponent.extend("sap.ui.webcomponents.Select", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-select",
			properties: {

				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				/**
				 * Defines whether <code>ui5-select</code> is in disabled state.
				 * <br><br>
				 * <b>Note:</b> A disabled <code>ui5-select</code> is noninteractive.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				disabled: {
					type: "boolean"
				},

				/**
				 * Determines the name with which the <code>ui5-select</code> will be submitted in an HTML form.
				 * The value of the <code>ui5-select</code> will be the value of the currently selected <code>ui5-option</code>.
				 *
				 * <br><br>
				 * <b>Important:</b> For the <code>name</code> property to have effect, you must add the following import to your project:
				 * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
				 *
				 * <br><br>
				 * <b>Note:</b> When set, a native <code>input</code> HTML element
				 * will be created inside the <code>ui5-select</code> so that it can be submitted as
				 * part of an HTML form. Do not use this property unless you need to submit a form.
				 *
				 * @type {string}
				 * @defaultvalue ""
				 * @public
				 */
				name: {
					type: "string"
				},

				/**
				 * Defines the value state of the <code>ui5-select</code>.
				 * <br><br>
				 * Available options are:
				 * <ul>
				 * <li><code>None</code></li>
				 * <li><code>Error</code></li>
				 * <li><code>Warning</code></li>
				 * <li><code>Success</code></li>
				 * <li><code>Information</code></li>
				 * </ul>
				 *
				 * @type {ValueState}
				 * @defaultvalue "None"
				 * @public
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None,
					updateOnEvent: "change"
				},

				/**
				 * Defines whether the <code>ui5-select</code> is required.
				 *
				 * @since 1.0.0-rc.9
				 * @type {Boolean}
				 * @defaultvalue false
				 * @public
				 */
				required: {
					type: "boolean"
				},

				valueStateMessage: {
					type: "string",
					mapping: {
						type: "slot",
						to: "div"
					}
				}
			},
			aggregations: {
				options: {
					type: "sap.ui.webcomponents.Option",
					multiple: true
				}
			},
			associations: {
				selectedOption: {
					type: "sap.ui.webcomponents.Option",
					multiple: false
				}
			},
			events: {
				change: {}
			}
		}
	});

	Select.prototype.onBeforeFireEvent = function(sEventName, oEventData) {
		// Synchronize the "selected" state of all options upon "change"
		if (sEventName === "change") {
			var oSelectedOption = oEventData.selectedOption;
			this.getOptions().forEach(function(oOpt) {
				oOpt.setSelected(oOpt === oSelectedOption);
			});
		}
	};

	Select.prototype.setSelectedOption = function(oOption) {
		this.setAssociation("selectedOption", oOption, true);

		this.getOptions().forEach(function(oOpt) {
			oOpt.setSelected(oOpt === oOption);
		});
	};

	Select.prototype.getSelectedOption = function() {
		var oFiltered = this.getOptions().filter(function(oOpt) {
			return !!oOpt.getSelected();
		});

		return oFiltered.length ? oFiltered[0] : null;
	};

	return Select;
});
