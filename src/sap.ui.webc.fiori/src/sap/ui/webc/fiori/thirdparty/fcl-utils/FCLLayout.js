sap.ui.define(['exports'], function (exports) { 'use strict';

	const getLayoutsByMedia = () => {
		return {
			desktop: {
				"OneColumn": {
					layout: ["100%", 0, 0],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"TwoColumnsStartExpanded": {
					layout: ["67%", "33%", 0],
					arrows: [
						{ visible: true, dir: "mirror" },
						{ visible: false, dir: null },
					],
				},
				"TwoColumnsMidExpanded": {
					layout: ["33%", "67%", 0],
					arrows: [
						{ visible: true, dir: null },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsStartExpanded": {
					layout: ["25%", "50%", "25%"],
					arrows: [
						{ visible: true, dir: null },
						{ visible: true, dir: null },
					],
				},
				"ThreeColumnsMidExpanded": {
					layout: ["25%", "50%", "25%"],
					arrows:	[
						{ visible: true, dir: null },
						{ visible: true, dir: null },
					],
				},
				"ThreeColumnsEndExpanded": {
					layout: ["25%", "25%", "50%"],
					arrows: [
						{ visible: false, dir: null, separator: true },
						{ visible: true, dir: "mirror" },
					],
				},
				"ThreeColumnsStartExpandedEndHidden": {
					layout: ["67%", "33%", 0],
					arrows: [
						{ visible: true, dir: "mirror" },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsMidExpandedEndHidden": {
					layout: ["33%", "67%", 0],
					arrows: [
						{ visible: true, dir: null },
						{ visible: true, dir: null },
					],
				},
				"MidColumnFullScreen": {
					layout: [0, "100%", 0],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"EndColumnFullScreen": {
					layout: [0, 0, "100%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
			},
			tablet: {
				"OneColumn": {
					layout: ["100%", 0, 0],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"TwoColumnsStartExpanded": {
					layout: ["67%", "33%", 0],
					arrows: [
						{ visible: true, dir: "mirror" },
						{ visible: false, dir: null },
					],
				},
				"TwoColumnsMidExpanded": {
					layout: ["33%", "67%", 0],
					arrows: [
						{ visible: true, dir: null },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsStartExpanded": {
					layout: ["67%", "33%", 0],
					arrows: [
						{ visible: true, dir: "mirror" },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsMidExpanded": {
					layout: [0, "67%", "33%"],
					arrows: [
						{ visible: true, dir: null },
						{ visible: true, dir: null },
					],
				},
				"ThreeColumnsEndExpanded": {
					layout: [0, "33%", "67%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: true, dir: "mirror" },
					],
				},
				"ThreeColumnsStartExpandedEndHidden": {
					layout: ["67%", "33%", 0],
					arrows: [
						{ visible: true, dir: "mirror" },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsMidExpandedEndHidden": {
					layout: ["33%", "67%", 0],
					arrows: [
						{ visible: true, dir: null },
						{ visible: true, dir: null },
					],
				},
				"MidColumnFullScreen": {
					layout: [0, "100%", 0],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"EndColumnFullScreen": {
					layout: [0, 0, "100%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
			},
			phone: {
				"OneColumn": {
					layout: ["100%", 0, 0],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"TwoColumnsStartExpanded": {
					layout: [0, "100%", 0],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"TwoColumnsMidExpanded": {
					layout: [0, "100%", 0],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsStartExpanded": {
					layout: [0, 0, "100%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsMidExpanded": {
					layout: [0, 0, "100%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsEndExpanded": {
					layout: [0, 0, "100%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsStartExpandedEndHidden": {
					layout: [0, 0, "100%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"ThreeColumnsMidExpandedEndHidden": {
					layout: [0, 0, "100%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"MidColumnFullScreen": {
					layout: [0, "100%", 0],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
				"EndColumnFullScreen": {
					layout: [0, 0, "100%"],
					arrows: [
						{ visible: false, dir: null },
						{ visible: false, dir: null },
					],
				},
			},
		};
	};
	const getNextLayoutByStartArrow = () => {
		return {
			"TwoColumnsStartExpanded": "TwoColumnsMidExpanded",
			"TwoColumnsMidExpanded": "TwoColumnsStartExpanded",
			"ThreeColumnsMidExpanded": "ThreeColumnsMidExpandedEndHidden",
			"ThreeColumnsEndExpanded": "ThreeColumnsStartExpandedEndHidden",
			"ThreeColumnsStartExpandedEndHidden": "ThreeColumnsMidExpandedEndHidden",
			"ThreeColumnsMidExpandedEndHidden": "ThreeColumnsStartExpandedEndHidden",
		};
	};
	const getNextLayoutByEndArrow = () => {
		return {
			"ThreeColumnsMidExpanded": "ThreeColumnsEndExpanded",
			"ThreeColumnsEndExpanded": "ThreeColumnsMidExpanded",
			"ThreeColumnsStartExpandedEndHidden": "ThreeColumnsMidExpanded",
			"ThreeColumnsMidExpandedEndHidden": "ThreeColumnsMidExpanded",
		};
	};

	exports.getLayoutsByMedia = getLayoutsByMedia;
	exports.getNextLayoutByEndArrow = getNextLayoutByEndArrow;
	exports.getNextLayoutByStartArrow = getNextLayoutByStartArrow;

	Object.defineProperty(exports, '__esModule', { value: true });

});
