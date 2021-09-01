sap.ui.define(['../types/InvisibleMessageMode', './getSingletonElementInstance', '../Boot'], function (InvisibleMessageMode, getSingletonElementInstance, Boot) { 'use strict';

	let politeSpan;
	let assertiveSpan;
	Boot.attachBoot(() => {
		if (politeSpan && assertiveSpan) {
			return;
		}
		const styles = `position: absolute;
	clip: rect(1px,1px,1px,1px);
	user-select: none;
	left: -1000px;
	top: -1000px;
	pointer-events: none;`;
		politeSpan = document.createElement("span");
		assertiveSpan = document.createElement("span");
		politeSpan.classList.add("ui5-invisiblemessage-polite");
		assertiveSpan.classList.add("ui5-invisiblemessage-assertive");
		politeSpan.setAttribute("aria-live", "polite");
		assertiveSpan.setAttribute("aria-live", "assertive");
		politeSpan.setAttribute("role", "alert");
		assertiveSpan.setAttribute("role", "alert");
		politeSpan.style.cssText = styles;
		assertiveSpan.style.cssText = styles;
		getSingletonElementInstance("ui5-static-area").appendChild(politeSpan);
		getSingletonElementInstance("ui5-static-area").appendChild(assertiveSpan);
	});
	const announce = (message, mode) => {
		const span = mode === InvisibleMessageMode.Assertive ? assertiveSpan : politeSpan;
		span.textContent = "";
		span.textContent = message;
		if (mode !== InvisibleMessageMode.Assertive && mode !== InvisibleMessageMode.Polite) {
			console.warn(`You have entered an invalid mode. Valid values are: "Polite" and "Assertive". The framework will automatically set the mode to "Polite".`);
		}
	};

	return announce;

});
