/* eslint-disable */
sap.ui.define(['exports', 'testdata/fastnavigation/webc/integration/isElementHidden', 'testdata/fastnavigation/webc/integration/webcomponents'], (function (exports, isElementHidden, webcomponentsBase) { 'use strict';

	const n=/^(?:a|area)$/i,a=/^(?:input|select|textarea|button)$/i,r=e=>{if(e.disabled)return  false;const t=e.getAttribute("tabindex");return t!=null?parseInt(t)>=0:a.test(e.nodeName)||n.test(e.nodeName)&&!!e.href};

	const E=e=>e.hasAttribute("data-ui5-focus-trap"),d=e=>{const l=getComputedStyle(e);return e.scrollHeight>e.clientHeight&&["scroll","auto"].indexOf(l.overflowY)>=0||e.scrollWidth>e.clientWidth&&["scroll","auto"].indexOf(l.overflowX)>=0},b=async(e,l)=>!e||isElementHidden.t(e)?null:m(e,true),H=async(e,l)=>!e||isElementHidden.t(e)?null:m(e,false),T=e=>e.hasAttribute("data-ui5-focus-redirect")||!isElementHidden.t(e),L=e=>{if(webcomponentsBase.v(e)){const l=e.getAttribute("tabindex");if(l!==null&&parseInt(l)<0)return  true}return  false},m=async(e,l,r$1)=>{let t,s,n=-1;e.shadowRoot?t=l?e.shadowRoot.firstChild:e.shadowRoot.lastChild:e instanceof HTMLSlotElement&&e.assignedNodes()?(s=e.assignedNodes(),n=l?0:s.length-1,t=s[n]):t=l?e.firstElementChild:e.lastElementChild;let i;for(;t;){const u=t;if(!isElementHidden.t(u)&&!L(u)){if(webcomponentsBase.v(t)&&(await t._waitForDomRef(),t=t.getDomRef()),!t||isElementHidden.t(t))return null;if(t.nodeType===1&&T(t)&&!E(t)){if(r(t)||(i=await m(t,l),!webcomponentsBase.h()&&!i&&d(t)))return t&&typeof t.focus=="function"?t:null;if(i)return i&&typeof i.focus=="function"?i:null}}t=l?u.nextSibling:u.previousSibling,s&&!s[n].contains(t)&&(n=l?n+1:n-1,t=s[n]);}return null};

	const ICON_DECLINE = { key: "ICON_DECLINE", defaultText: "Decline" };
	const ICON_ERROR = { key: "ICON_ERROR", defaultText: "Error" };

	const name$1 = "decline";
	const pathData$1 = "M86 109l22-23q5-5 12-5 6 0 11 5l124 125L380 86q5-5 11-5 7 0 12 5l22 23q12 11 0 23L301 256l124 125q11 11 0 22l-22 23q-8 5-12 5-3 0-11-5L255 301 131 426q-5 5-11 5-4 0-12-5l-22-23q-11-11 0-22l124-125L86 132q-12-12 0-23z";
	const ltr$1 = false;
	const accData$1 = ICON_DECLINE;
	const collection$1 = "SAP-icons-v4";
	const packageName$1 = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

	webcomponentsBase.f(name$1, { pathData: pathData$1, ltr: ltr$1, accData: accData$1, collection: collection$1, packageName: packageName$1 });

	const name = "decline";
	const pathData = "M292 256l117 116q7 7 7 18 0 12-7.5 19t-18.5 7q-10 0-18-8L256 292 140 408q-8 8-18 8-11 0-18.5-7.5T96 390q0-10 8-18l116-116-116-116q-8-8-8-18 0-11 7.5-18.5T122 96t18 7l116 117 116-117q7-7 18-7t18.5 7.5T416 122t-7 18z";
	const ltr = false;
	const accData = ICON_DECLINE;
	const collection = "SAP-icons-v5";
	const packageName = "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons";

	webcomponentsBase.f(name, { pathData, ltr, accData, collection, packageName });

	var decline = "decline";

	var o=(i=>(i.None="None",i.Positive="Positive",i.Critical="Critical",i.Negative="Negative",i.Information="Information",i))(o||{});

	exports.H = H;
	exports.ICON_ERROR = ICON_ERROR;
	exports.b = b;
	exports.decline = decline;
	exports.o = o;

}));
