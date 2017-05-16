/*!
 * ${copyright}
 */

window.sapUiSupportReport = window.sapUiSupportReport || {};
window.sapUiSupportReport.collapseExpand = (function() {
	'use strict';

	function collapseExpandClickHandler(event) {
		var toExpandElementId = this.getAttribute('data-expandableElement');
		var expandableElement = document.getElementById(toExpandElementId);
		var toExpand = expandableElement.classList.contains('collapsed');

		if (toExpand) {
			expandableElement.classList.remove('collapsed');
			expandableElement.classList.add('expanded');
			this.classList.remove('collapsed-content');
			this.classList.add('expanded-content');
		} else {
			expandableElement.classList.remove('expanded');
			expandableElement.classList.add('collapsed');
			this.classList.remove('expanded-content');
			this.classList.add('collapsed-content');
		}
	}

	function init() {
		try {
			var expandableElements = document.getElementsByClassName('expandable-control');
			if (!expandableElements) {
				return;
			}

			for (var i = 0; i < expandableElements.length; i++) {
				expandableElements[i].addEventListener('click', collapseExpandClickHandler);

				// Set the default collapsed/expanded state of the expandable content.
				var elementToExpandId = expandableElements[i].getAttribute('data-expandableElement');
				var elementToExpand = document.getElementById(elementToExpandId);
				if (expandableElements[i].classList.contains('collapsed-content')) {
					elementToExpand.classList.add('collapsed');
				} else {
					elementToExpand.classList.add('expanded');
				}

				expandableElements[i].setAttribute('style', 'cursor: pointer;');
			}
		} catch (ex) {
			/* eslint-disable no-console */
			console.log('There was a problem initializing collapse/expand functionality.');
			/* eslint-enable no-console */
		}
	}

	return {
		init: init
	};
}());
