(function () {
	"use strict";

	var treeWalker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_ELEMENT,
		{
			acceptNode: function(node) {
				if (node instanceof HTMLHeadingElement) {
					return NodeFilter.FILTER_ACCEPT;
				}

				return NodeFilter.FILTER_SKIP;
			}
		}
	);

	treeWalker.nextNode();
	var headings = [];
	var node = treeWalker.currentNode;

	while (node) {
		headings.push(node);
		node = treeWalker.nextNode();
	}

	var navMenu = document.createElement("div");
	navMenu.classList.add("navigation");
	var navMenuHeading = document.createElement("h4");
	navMenuHeading.innerText = "Table of Contents";
	navMenu.appendChild(navMenuHeading);

	var headingToIndent = {
		"H1": 0,
		"H2": 1,
		"H3": 2,
		"H4": 3,
		"H5": 4,
		"H6": 5
	};

	headings.forEach(function (heading) {
		if (!heading.id) {
			// eslint-disable-next-line no-console
			console.error("Heading ", heading, " doesn't have ID");
		}

		var wrapper = document.createElement("div");
		wrapper.setAttribute("data-indent", headingToIndent[heading.nodeName]);
		var link = document.createElement("a");
		link.innerText = heading.innerText;
		link.href = "#" + heading.id;
		wrapper.appendChild(link);
		navMenu.appendChild(wrapper);
	});

	document.getElementsByClassName("topic")[0].appendChild(navMenu);
})();