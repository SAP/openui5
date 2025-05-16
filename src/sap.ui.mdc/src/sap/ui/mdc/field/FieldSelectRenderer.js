/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/ui/core/library', 'sap/m/library', 'sap/m/SelectRenderer'],
	(Renderer, coreLibrary, library, SelectRenderer) => {
		"use strict";

		const {ValueState} = coreLibrary;
		const {SelectType} = library;

		/**
		 * FieldSelect renderer.
		 * @namespace
		 */
		const FieldSelectRenderer = Renderer.extend(SelectRenderer);
		FieldSelectRenderer.apiVersion = 2;

		FieldSelectRenderer.writeAccessibilityState = function(oRm, oSelect) {
			const sValueState = oSelect.getValueState(),
				bIconOnly = oSelect.getType() === SelectType.IconOnly,
				bEditabledAndEnabled = oSelect.getEnabled() && oSelect.getEditable(),
				aLabels = [];
			let aAriaLabelledBy = [],
				sAriaDescribedBy;
			const oAriaAttributes = oSelect.getAriaAttributes();

			oSelect.getLabels().forEach((oLabel) => {
				if (oLabel && oLabel.getId) {
					aLabels.push(oLabel.getId());
				}
			});

			if (sValueState !== ValueState.None && bEditabledAndEnabled) {
				sAriaDescribedBy = oSelect.getValueStateMessageId() + "-sr";
			}

			if (aLabels.length) {
				aAriaLabelledBy = aAriaLabelledBy.concat(aLabels);
			}

			const oAriaLabelledBy = {
				value: aAriaLabelledBy.join(" "),
				append: true
			};

			oRm.accessibilityState(null, {
				role: this.getAriaRole(oSelect),
				roledescription: bIconOnly ? undefined : oSelect._sAriaRoleDescription,
				readonly: bIconOnly ? undefined : oSelect.getEnabled() && !oSelect.getEditable(),
				required: oSelect._isRequired() || undefined,
				disabled: !oSelect.getEnabled() || undefined,
				expanded: oAriaAttributes.aria?.expanded,
				invalid: (oSelect.getValueState() === ValueState.Error && bEditabledAndEnabled) ? true : undefined,
				labelledby: (bIconOnly || oAriaLabelledBy.value === "") ? undefined : oAriaLabelledBy,
				describedby: sAriaDescribedBy,
				activedescendant: oAriaAttributes.aria?.activedescendant,
				controls: oAriaAttributes.aria?.controls,
				haspopup: oSelect.getEditable() ? "listbox" : undefined
			});
		};

		return FieldSelectRenderer;
	});