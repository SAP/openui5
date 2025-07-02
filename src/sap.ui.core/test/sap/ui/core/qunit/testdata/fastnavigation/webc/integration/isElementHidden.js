/* eslint-disable */
sap.ui.define(['exports'], (function (exports) { 'use strict';

	const t=e=>e.nodeName==="SLOT"?false:e.offsetWidth<=0&&e.offsetHeight<=0||e.style&&e.style.visibility==="hidden";

	exports.t = t;

}));
