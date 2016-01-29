(function() {
	"use strict";

// ========================================================================
// inline resource bundle
// ========================================================================
var error_message = {
	"en-US": "An error occurred. Please contact your system administrator.",
	"fr": "Une erreur est survenue. Veuillez contacter votre administrateur système.",
	"it": "Rilevato un errore. Contattare l'amministratore del sistema.",
	"de": "Es ist ein Fehler aufgetreten. Wenden Sie sich an Ihren Systemadministrator.",
	"es": "Se produjo un error. Debe ponerse en contacto con el administrador del sistema.",
	"pl": "Wystąpił błąd. Zwróć się do administratora systemu.",
	"ru": "Произошла ошибка. Пожалуйста, свяжитесь со своим системным адмнистратором.",
	"ja": "エラーが発生しました。システム管理者に連絡してください。",
	"ko": "오류가 발생했습니다. 시스템 관리자에게 문의하십시오.",
	"zh-CN": "出现错误。请联系您的系统管理员。",
	"zh-TW": "發生錯誤。請連絡您的系統管理員。",
	"th": "มีข้อผิดพลาดเกิดขึ้น โปรดติดต่อผู้ดูแลระบบของคุณ",
	"ar": "حدث خطأ. يرجى الاتصال بمدير نظامك.",
	"cs": "Došlo k chybě. Obraťte se na správce systému.",
	"da": "Der er opstået en fejl. Kontakt systemadministratoren.",
	"el": "Παρουσιάστηκε σφάλμα. Επικοινωνήστε με το διαχειριστή του συστήματος.",
	"hr": "Došlo je do pogreške. Obratite se administratoru sustava.",
	"fi": "Tapahtui virhe. Ota yhteyttä järjestelmän ylläpitäjään.",
	"hu": "Hiba lépett fel. Forduljon a rendszergazdához.",
	"iw": "התרחשה שגיאה. פנה למנהל המערכת",
	"nl": "Er is een fout opgetreden. Neem contact op met de systeembeheerder.",
	"no": "Det oppstod en feil. Ta kontakt med systemadministratoren.",
	"pt": "Ocorreu um erro. Contacte o administrador do sistema.",
	"pt-BR": "Ocorreu um erro. Contate o administrador do sistema.",
	"sk": "Vyskytla sa chyba. Obráťte sa na správcu systému.",
	"sl": "Prišlo je do napake. Obrnite se na skrbnika sistema.",
	"sr": "Došlo je do greške. Obratite se administratoru sistema.",
	"sh": "Došlo je do greške. Obratite se administratoru sistema.",
	"sv": "Ett fel uppstod. Kontakta systemansvarig.",
	"tr": "Bir hata oluştu. Lütfen sistem yöneticinizle görüşün.",
	"uk": "Сталася помилка. Зверніться до системного адміністратора."
};
error_message["default"] = error_message["en-US"];

var
	// original onError function, for chaining
	fnOnError = window.onerror,

	// parsed error message from window.onError
	sErrorContent,

	sNativeDialogId = "ErrorDialog_native";

// attempt to use standard jQuery.sap.log,
// if that fails, just write to console
function _safeLog(type, sMessage) {
	try {
		jQuery.sap.log[type](sMessage);
	} catch (e) {
		if (type === "warning") {
			type = "warn";
		}
		// since the framework may not be booted yet, directly use console statement
		/*eslint-disable */
		if (console && typeof console.log === "function") {
			console[type](sMessage);
		}
		/*eslint-enable */
	}
}

// Create a native js error dialog
function _createAndOpenNativeDialog() {
	var
		// outer height and width (px)
		iDivHeight = 300, iDivWidth = 275,

		// dom elements
		domContextNode, domOuterDiv, domTextarea, domCloseButton, domStyleElement,

		// get text based on browser locale
		sDialogTitle = (function() {
			var userLang = navigator.language || navigator.userLanguage;
			return error_message[userLang] || error_message["default"];
		}());

	// create dom elements that make up the dialog
	domOuterDiv = document.createElement("div");
	domOuterDiv.id = sNativeDialogId;
	domOuterDiv.innerHTML = sDialogTitle;

	domTextarea = document.createElement("textarea");
	domTextarea.readOnly = true;
	domTextarea.innerHTML = sErrorContent;

	domCloseButton = document.createElement("button");
	domCloseButton.appendChild(document.createTextNode("x"));
	domCloseButton.setAttribute("aria-label", "Close message window");

	// create style node in head tag to style the dialog
	domStyleElement = document.createElement("STYLE");
	domStyleElement.appendChild(document.createTextNode("#" + sNativeDialogId + " {" +
		"z-index: 998;background-color: white;" +
		"width: " + iDivWidth + "px;height: " + iDivHeight + "px;" +
		"border: 1px solid black;padding: 15px;" +
		"margin-top: " + ((iDivHeight / 2) * -1) + "px;" +
		"margin-left: " + ((iDivWidth / 2) * -1) + "px;" +
		"position: fixed;top: 50%;left: 50%;" +
	"}"));
	domStyleElement.appendChild(document.createTextNode("#" + sNativeDialogId + " textarea {" +
		"z-index: 999;width: 100%;" +
		"margin-top: 5px;resize: none;" +
	"}"));
	domStyleElement.appendChild(document.createTextNode("#" + sNativeDialogId + " > button {" +
		"cursor: pointer;position: absolute;" +
		"top: 0;right: 0;" +
	"}"));

	document.head.appendChild(domStyleElement);

	// determine parent node of Dialog
	domContextNode = document.getElementsByTagName("body");
	if (domContextNode.length === 0) {
		domContextNode = document.getElementsByTagName("html");
	}

	// place nodes in dom
	domContextNode[0].appendChild(domOuterDiv);
	setTimeout(function() {
		domOuterDiv.appendChild(domTextarea);
		domOuterDiv.appendChild(domCloseButton);
		// set height dynamically
		domTextarea.style.height = (iDivHeight - 55) + "px";
	}, 0);

	// close button event handler
	domCloseButton.addEventListener("click", function() {
		domOuterDiv.remove();
	});

    // invoke post-invocation hook
	if (typeof window.__sap.postGlobalErrorHandlerInvocation === "function") {
		window.__sap.postGlobalErrorHandlerInvocation(sNativeDialogId);
	}
}

// define __sap namespace
// __sap is used as the namespace for the globalErrorHandler function
// so it can be accessed since the sap namespace may not yet be defined
if (window.__sap === undefined) {
	window.__sap = {};
	window.__sap.error_message = error_message;
}

// define globalErrorHandler
window.__sap.globalErrorHandler = function(oError) {
	var oErrorDialog;

	// if the error dialog already present, just throw error
	if (document.getElementById(sNativeDialogId) || document.getElementsByClassName("sapMErrorDialog").length > 0) {
		throw oError;
	}

	// attempt to create and open a sap.m.ErrorDialog
	// if sap dialog fails, render native dialog
	try {
		jQuery.sap.require("sap.m.ErrorDialog");
		oErrorDialog = new sap.m.ErrorDialog({
			message: sErrorContent
		});
		oErrorDialog.attachAfterOpen(function() {
			if (typeof window.__sap.postGlobalErrorHandlerInvocation === "function") {
				window.__sap.postGlobalErrorHandlerInvocation(oErrorDialog.getId());
			}
		});
		oErrorDialog.open();
	} catch (e) {
		_safeLog("warning", "error while rendering global error dialog");
		_createAndOpenNativeDialog();
		throw e;
	}

	// still have the error dump to console per-usual
	if (oError !== undefined && oError !== null && typeof oError !== "string") {
		throw oError;
	}
};

// parse default arguments from window.onerror
window.__sap.parseErrorArgs = function(msg, url, line, col, error) {
	var sContent = "";

	if (typeof (msg) === "string") {
		sContent = msg + "\n" + url + "\nline: " + line;
	}
	if (col) {
		sContent += !col ? "" : "\ncol: " + col;
	}
	if (error && error.stack) {
		sContent += "\n" + error.stack;
	}
	return sContent;
};

// chain window.onerror
window.onerror = function(msg, url, line, col, error) {
	function isEnabled() {
		var bEnabled = false;
		try {
			bEnabled = sap.ui.getCore().getConfiguration().getEnableGlobalErrorHandler() === true;
		} catch (e) {
			_safeLog("warning", "unable to determine if global error handler is enabled.");
		}
		return bEnabled;
	}

	// chain onError
	if (fnOnError) {
		fnOnError.apply(this, arguments);
	}

	// exit if not enabled
	if (isEnabled() !== true) {
		return;
	}

	// IE11 propagates events like image.onerror differently
	if (typeof msg !== "string") {
		_safeLog("warning", "image.onerror fired?");
		return;
	}

	// parse onerror arguments to generate error message
	sErrorContent = window.__sap.parseErrorArgs(msg, url, line, col, error);

	// invoke pre-invocation hook
	if (typeof window.__sap.preGlobalErrorHandlerInvocation === "function") {
		window.__sap.preGlobalErrorHandlerInvocation(arguments);
	}

	// invoke global error handler
	window.__sap.globalErrorHandler.apply(this, [error]);
};
}());