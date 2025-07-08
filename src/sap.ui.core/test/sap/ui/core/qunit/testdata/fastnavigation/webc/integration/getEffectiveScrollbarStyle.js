/* eslint-disable */
sap.ui.define(['exports'], (function (exports) { 'use strict';

	const r="ui5-content-native-scrollbars",o=typeof document>"u",a=()=>o||document.body.classList.contains(r)?"":`
::-webkit-scrollbar:horizontal {
	height: var(--sapScrollBar_Dimension);
}

::-webkit-scrollbar:vertical {
	width: var(--sapScrollBar_Dimension);
}

::-webkit-scrollbar {
	background-color: var(--sapScrollBar_TrackColor);
	border-left: none;
}

::-webkit-scrollbar-thumb {
	border-radius: var(--sapElement_BorderCornerRadius);
	background-color: var(--sapScrollBar_FaceColor);
	border: 0.125rem solid var(--sapScrollBar_TrackColor);
}

::-webkit-scrollbar-thumb:hover {
	background-color: var(--sapScrollBar_Hover_FaceColor);
}

::-webkit-scrollbar-corner {
	background-color: var(--sapScrollBar_TrackColor);
}`;

	exports.a = a;

}));
