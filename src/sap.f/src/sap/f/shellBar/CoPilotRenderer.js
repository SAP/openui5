/*!
 * ${copyright}
 */

sap.ui.define(['./Accessibility'],
	function (Accessibility) {
		"use strict";

		/**
		 * CoPilot renderer.
		 * @namespace
		 */
		var CoPilotRenderer = {
			apiVersion: 1 // @todo-semantic-rendering replace write calls below
		};

		CoPilotRenderer.render = function (oRm, oControl) {
			var oAcc = new Accessibility(),
				oAttributes = oAcc.getCoPilotAttributes(),
				sTooltip = oControl.getTooltip();

			oRm.openStart("div", oControl);
			oRm.attr("tabindex", "0");

			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}

			oRm.accessibilityState({
				role: oAttributes.role,
				label: oAttributes.label
			});
			oRm.class("CPImage");

			oRm.openEnd();

			if (oControl.getAnimation()) {
				oRm.write('<svg focusable="false" alt="' + sTooltip + '" role="presentation" version="1.1" width="48" height="48" viewBox="-150 -150 300 300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient id="grad1" x1="0%" x2="100%" y1="100%" y2="0%"><stop class="color1 opacity7" offset="0%"/><stop class="color2 opacity7" offset="80%"/></linearGradient><linearGradient id="grad2" x1="0%" x2="100%" y1="100%" y2="0%"><stop class="color1 opacity36" offset="0%"/><stop class="color2 opacity36" offset="80%"/></linearGradient><linearGradient id="grad3" x1="0%" x2="100%" y1="100%" y2="0%"><stop class="color1 opacity2" offset="0%"/><stop class="color2 opacity2" offset="80%"/></linearGradient><mask id="innerCircle"><circle cx="0" cy="0" r="120" fill="white" /><circle cx="0" cy="0" r="76" fill="black" /></mask>' + '<path id="path" d="M 102 0 C 102 17.85 86.87 29.53 77.94 44.99 C 69.01 60.46 66.46 79.4 51 88.33 C 35.53 97.26 17.85 90 5.51000e-15 90 C -17.85 90 -35.53 97.26 -50.99 88.33 C -66.46 79.4 -69.01 60.46 -77.94 45 C -86.87 29.53 -102 17.85 -102 1.24000e-14 C -102 -17.85 -86.87 -29.53 -77.94 -44.99 C -69.01 -60.46 -66.46 -79.4 -51 -88.33 C -35.53 -97.26 -17.85 -89.99 -1.65000e-14 -90 C 17.85 -90 35.53 -97.26 50.99 -88.33 C 66.46 -79.4 69.01 -60.46 77.94 -45 C 86.87 -29.53 102 -17.85 102 0 Z M 97.27 0 C 98.58 17.55 94.29 34.2 84.09 48.54 C 74.21 62.42 58.47 67.23 43.57 75.46 C 28.94 83.54 16.64 93.54 5.81000e-15 95 C -17.27 96.5 -33.78 93.13 -48.19 83.47 C -62.26 74.04 -68.01 58.82 -76.14 43.96 C -84.09 29.4 -92 16.48 -93.8 1.14000e-14 C -95.7 -17.53 -94.76 -34.35 -86.34 -49.84 C -77.83 -65.5 -64.53 -76.31 -48.31 -83.67 C -32.81 -90.7 -17 -88.78 -1.63000e-14 -89 C 17.21 -89.21 34.09 -93.47 49 -84.87 C 63.91 -76.28 68.61 -59.49 77.12 -44.53 C 85.58 -29.66 95.99 -17.05 97.27 0 Z" dur="30s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values="1;1.05;1.05;1.02;1" dur="0.15s" begin="click_area.mousedown" repeatCount="1" additive="sum"/></path></defs><g mask="url(#innerCircle)"><g fill="url(#grad3)" transform="rotate(54)"><use xlink:href="#path"><animateTransform id="animate1" attributeName="transform" type="rotate" from="54" to="416" dur="15s" repeatCount="indefinite"/></use></g><g fill="url(#grad2)" transform="rotate(74)"><use xlink:href="#path" /></g><g fill="url(#grad1)" transform="rotate(90)"><use xlink:href="#path"><animateTransform id="animate2" attributeName="transform" type="rotate" from="90" to="450" dur="30s" repeatCount="indefinite"/></use></g></g><circle cx="0" cy="0" r="76" fill="transparent" id="click_area"/>');
			} else {
				oRm.write('<svg focusable="false" alt="' + sTooltip + '" role="presentation" version="1.1" width="48" height="48" viewBox="-150 -150 300 300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient id="grad1" x1="0%" x2="100%" y1="100%" y2="0%"><stop class="color1 opacity7" offset="0%"/><stop class="color2 opacity7" offset="80%"/></linearGradient><linearGradient id="grad2" x1="0%" x2="100%" y1="100%" y2="0%"><stop class="color1 opacity36" offset="0%"/><stop class="color2 opacity36" offset="80%"/></linearGradient><linearGradient id="grad3" x1="0%" x2="100%" y1="100%" y2="0%"><stop class="color1 opacity2" offset="0%"/><stop class="color2 opacity2" offset="80%"/></linearGradient><mask id="innerCircle"><circle cx="0" cy="0" r="120" fill="white" /><circle cx="0" cy="0" r="76" fill="black" /></mask><path id="path" d="M 98.1584 0 C 98.3156 17.3952 89.0511 31.3348 79.5494 45.9279 C 70.339 60.0814 60.6163 71.2177 46.1724 79.9729 C 31.4266 88.9178 17.2493 94.3909 5.77261e-15 94.2739 C -17.1547 94.1581 -30.8225 87.6907 -45.7979 79.3244 C -61.0143 70.8266 -73.5583 62.554 -83.0507 47.9493 C -92.6677 33.1579 -98.4872 17.5705 -97.1793 1.19010e-14 C -95.9465 -16.9777 -84.488 -29.0862 -76.1351 -43.9566 C -67.6795 -59.0155 -63.8629 -76.1085 -49.262 -85.3243 C -34.502 -94.6464 -17.4328 -93.0037 -1.69174e-14 -92.0939 C 16.8967 -91.214 31.8608 -89.0341 46.4198 -80.4014 C 60.872 -71.8326 69.6003 -59.5351 78.6792 -45.4254 C 88.0511 -30.9104 98.015 -17.2766 98.1584 0 Z"/></defs><g mask="url(#innerCircle)"><g fill="url(#grad3)" transform="rotate(54)"><use xlink:href="#path"/></g><g fill="url(#grad2)" transform="rotate(74)"><use xlink:href="#path" /></g><g fill="url(#grad1)" transform="rotate(90)"><use xlink:href="#path"/></g></g><circle cx="0" cy="0" r="76" fill="transparent" id="click_area"/>');
			}

			oRm.close("div");
		};

		return CoPilotRenderer;

	}, /* bExport= */ true);
