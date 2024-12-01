(function() {
	'use strict';

	document.querySelectorAll("[data-href]").forEach((elem) => {
		elem.addEventListener("click", function() {
			window.location = elem.dataset.href;
		});
	});

	document.getElementById("hamburger-icon").addEventListener("click", function() {
		var navigationList = document.getElementById('navigation-list');
		navigationList.classList.toggle("responsive-menu-opened");
	});
}());