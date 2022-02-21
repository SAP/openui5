sap.ui.define(['../types/InvisibleMessageMode', './getSingletonElementInstance', '../Boot'], function (InvisibleMessageMode, getSingletonElementInstance, Boot) { 'use strict';

	let politeSpan;
	let assertiveSpan;
	const setOutOfViewportStyles = el => {
		el.style.position = "absolute";
		el.style.clip = "rect(1px,1px,1px,1px)";
		el.style.userSelect = "none";
		el.style.left = "-1000px";
		el.style.top = "-1000px";
		el.style.pointerEvents = "none";
	};
	Boot.attachBoot(() => {
		if (politeSpan && assertiveSpan) {
			return;
		}
		politeSpan = document.createElement("span");
		assertiveSpan = document.createElement("span");
		politeSpan.classList.add("ui5-invisiblemessage-polite");
		assertiveSpan.classList.add("ui5-invisiblemessage-assertive");
		politeSpan.setAttribute("aria-live", "polite");
		assertiveSpan.setAttribute("aria-live", "assertive");
		politeSpan.setAttribute("role", "alert");
		assertiveSpan.setAttribute("role", "alert");
		setOutOfViewportStyles(politeSpan);
		setOutOfViewportStyles(assertiveSpan);
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
