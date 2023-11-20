/* eslint-disable no-implicit-globals */
function iLiner() {
	"use strict";
	var observer = new MutationObserver(function () {
		processSnippets();
	});
	observer.observe(document.body, { attributes: true, childList: true });
	function processSnippets() {
		var aPreElements = document.querySelectorAll("pre"),
			i,
			oPre,
			sCaption;

		document.querySelectorAll('pre').forEach(window.hljs.highlightBlock);

		for (i = 0; i < aPreElements.length; i++) {
			oPre = aPreElements[i];
			if (!oPre.__attached && oPre.classList.contains("collapsed") || oPre.classList.contains("expanded")) {
				oPre.__attached = true;
				sCaption = oPre.dataset.caption;

				if (oPre.classList.contains("collapsed")) {
					if (sCaption) {
						sCaption = ": " + sCaption;
					}
					sCaption = "Show code" + sCaption;
				}

				if (oPre.classList.contains("expanded")) {
					sCaption = oPre.getAttribute("caption");
					if (sCaption) {
						sCaption = ": " + sCaption;
					}
					sCaption = "Hide code" + sCaption;
				}
				oPre.dataset.caption = sCaption;

				oPre.addEventListener("click", function (oEvent) {
					if (this.contains(oEvent.target) && oEvent.target !== this) {
						return;
					}

					if (this.classList.contains("collapsed")) {
						this.dataset.caption = this.dataset.caption.replace("Show", "Hide");
						this.style.height = "0px";
						this.classList.remove("collapsed");
						this.classList.add("expanded");
						this.style.height = (this.scrollHeight + 5) + "px";
					} else {
						this.dataset.caption = this.dataset.caption.replace("Hide", "Show");
						this.style.height = (this.scrollHeight + 5) + "px";
						this.classList.remove("expanded");
						this.classList.add("collapsed");
						this.style.height = "0px";
					}
				}.bind(oPre));
			}
		}
	}
	processSnippets();
}

window.codesample = iLiner;
