/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/MultiInput',
	'sap/ui/mdc/field/FieldMultiInputRenderer',
	'sap/ui/base/ManagedObjectObserver'
	], function(
		MultiInput,
		FieldMultiInputRenderer,
		ManagedObjectObserver
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FieldMultiInput</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * The <code>FieldMultiInput</code> control is used to render a multi-input field inside a control based on {@link sap.ui.mdc.field.FieldBase FieldBase}.
	 * It enhances the {@link sap.m.MultiInput MultiInput} control to add ARIA attributes and other {@link sap.ui.mdc.field.FieldBase FieldBase}-specific logic.
	 * @extends sap.m.MultiInput
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 * @alias sap.ui.mdc.field.FieldMultiInput
	 */
	const FieldMultiInput = MultiInput.extend("sap.ui.mdc.field.FieldMultiInput", /** @lends sap.ui.mdc.field.FieldMultiInput.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the ARIA attributes added to the <code>MultiInput</code> control.
				 *
				 * The object contains ARIA attributes in an <code>aria</code> node.
				 * Additional attributes, such as <code>role</code>, <code>autocomplete</code> or <code>valueHelpEnabled</code>, are added on root level.
				 */
				ariaAttributes: {
					type: "object",
					defaultValue: {},
					byValue: true
				}
			}
		},
		renderer: FieldMultiInputRenderer
	});

	FieldMultiInput.prototype.init = function() {

		MultiInput.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["ariaAttributes"]
		});

	};

	FieldMultiInput.prototype.exit = function() {

		MultiInput.prototype.exit.apply(this, arguments);

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	function _observeChanges(oChanges) {

		if (oChanges.name === "ariaAttributes") {
			// set aria-activedescendant directly to prevent anouncement of old one
			if (oChanges.current.aria?.activedescendant !== oChanges.old.aria?.activedescendant) {
				const oDomRef = this.getFocusDomRef();
				if (!oChanges.current.aria?.activedescendant) {
					oDomRef.removeAttribute("aria-activedescendant");
				} else {
					oDomRef.setAttribute("aria-activedescendant", oChanges.current.aria.activedescendant);
				}
			}
		}

	}

	return FieldMultiInput;

});
