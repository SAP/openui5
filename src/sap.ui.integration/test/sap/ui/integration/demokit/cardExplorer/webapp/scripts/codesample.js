function iLiner() {
	"use strict";
	var observer = new MutationObserver(function (mutations) {
		markLines();
	});
	observer.observe(document.body, { attributes: true, childList: true });
	function markLines() {
		var aPretty = document.querySelectorAll(".prettyprint");
		for (var i = 0; i < aPretty.length; i++) {
			var oPre = aPretty[i],
				sLines = oPre.getAttribute("lines");
			if ((oPre.classList.contains("collapsed") || oPre.classList.contains("expanded")) && !oPre.classList.contains("linenums")) {
				oPre.classList.add("linenums");
				oPre.classList.add("linenumshidden");
			}
			if (!sLines) {
				continue;
			}
			if (!oPre.classList.contains("linenums")) {
				oPre.classList.add("linenums");
				oPre.classList.add("linenumshidden");
			}
		}
		window.PR.prettyPrint();

		for (var i = 0; i < aPretty.length; i++) {
			var oPre = aPretty[i],
				sLines = oPre.getAttribute("lines");
			if (!oPre.__attached && oPre.classList.contains("collapsed") || oPre.classList.contains("expanded")) {
				oPre.__attached = true;
				var sCaption = oPre.getAttribute("caption");
				if (oPre.classList.contains("collapsed")) {
					if (sCaption) {
						sCaption = ": " + sCaption;
					}
					sCaption = "Show code" + sCaption;
				}
				if (oPre.classList.contains("expanded")) {
					var sCaption = oPre.getAttribute("caption");
					if (sCaption) {
						sCaption = ": " + sCaption;
					}
					sCaption = "Hide code" + sCaption;
				}
				oPre.setAttribute("caption", sCaption);

				oPre.addEventListener("click", function (oEvent) {
					if (this.contains(oEvent.target) && oEvent.target !== this) {
						return;
					}
					if (this.classList.contains("collapsed")) {
						this.setAttribute("caption", this.getAttribute("caption").replace("Show", "Hide"));
						this.style.height = 0 + "px";
						this.classList.remove("collapsed");
						this.classList.add("expanded");
						this.style.height = (this.scrollHeight + 5) + "px";
					} else {
						this.setAttribute("caption", this.getAttribute("caption").replace("Hide", "Show"));
						this.style.height = (this.scrollHeight + 5) + "px";
						this.classList.remove("expanded");
						this.classList.add("collapsed");
						this.style.height = 0 + "px";
					}
				}.bind(oPre));
			}
			if (!sLines) {
				continue;
			}
			var aLines = sLines.split(","),
				aNumbers = [],
				aLi = oPre.querySelectorAll("li"),
				j;

			for (j = 0; j < aLines.length; j++) {
				var sPart = aLines[j];
				if (sPart.indexOf("-") > -1) {
					var iFrom = parseInt(sPart.split("-")[0]),
						iTo = parseInt(sPart.split("-")[1]);
					for (var k = iFrom; k <= iTo; k++) {
						aNumbers.push(k);
					}
				} else {
					aNumbers.push(parseInt(sPart));
				}
			}
			for (j = 0; j < aLi.length; j++) {
				if (aNumbers.indexOf(j + 1) > -1) {
					aLi[j].classList.add("marked");
				} else {
					aLi[j].classList.remove("marked");
				}
			}
		}
	}
	markLines();
}

window.codesample = iLiner;
