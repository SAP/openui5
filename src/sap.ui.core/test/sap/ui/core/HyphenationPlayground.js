sap.ui.require([
	"sap/ui/core/Element",
	"sap/ui/core/hyphenation/Hyphenation",
	"sap/ui/core/hyphenation/HyphenationTestingWords",
	"sap/base/util/UriParameters",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/Title",
	"sap/m/Label",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/HTML",
	"sap/m/Input",
	"sap/m/Slider",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Panel"
],
	function (
		Element,
		HyphenationDelegate,
		HyphenationTestingWords,
		UriParameters,
		App,
		Page,
		Button,
		Title,
		Label,
		SimpleForm,
		HTML,
		Input,
		Slider,
		VerticalLayout,
		Panel
		) {
		"use strict";

		// create and add app
		var app = new App("myApp", {
			initialPage: "pg"
		});
		app.placeAt("body");
		var initialPage = new Page("pg", {
			showHeader: true,
			title: "Playground for Hyphenation for different languages in SAPUI5"
		}).addStyleClass("sapUiResponsiveContentPadding");
		app.addPage(initialPage);

		var aLangCodes = [
			"bg",
			"ca",
			"hr",
			"cs",
			"da",
			"nl",
			"en-us",
			"et",
			"fi",
			"fr",
			"de",
			"el-monoton",
			"hi",
			"hu",
			"it",
			"lt",
			"nb-no",
			"pl",
			"pt",
			"ru",
			"sr",
			"sl",
			"es",
			"sv",
			"th",
			"tr",
			"uk"
		];

		var oLangFullText = {
			"bg": "Bulgarian",
			"ca": "Catalan",
			"hr": "Croatian",
			"cs": "Czech",
			"da": "Danish",
			"nl": "Dutch",
			"en-us": "English (US)",
			"et": "Estonian",
			"fi": "Finnish",
			"fr": "French (FR)",
			"de": "German",
			"el-monoton": "Greek",
			"hi": "Hindi",
			"hu": "Hungarian",
			"it": "Italian",
			"lt": "Lithuanian",
			"nb-no": "Norwegian",
			"pl": "Polish",
			"pt": "Portuguese (BR)",
			"ru": "Russian",
			"sr": "Serbian",
			"sl": "Slovenian",
			"es": "Spanish (ES)",
			"sv": "Swedish",
			"th": "Thai",
			"tr": "Turkish",
			"uk": "Ukrainian"
		};

		var oLangTexts = {
			"bg": "Примерен текст, който ще послужи за проверка на пренасянето",
			"ca": "Una manera especial de provar la partició de paraules en català a la web.",
			"hr": "Uzorak teksta koji će poslužiti za potvrdu prijenosa",
			"cs": "Typografie je umělecko-technický obor, který se zabývá písmem.",
			"da": "Bindestregen er et symbol brugt i grammatisk tegnsætning. Den bruges til at lave sammensatte ord eller adskille stavelser ved linjeskift.",
			"nl": "Een lettergreep of syllabe is een prosodische eenheid in gesproken taal.",
			"en-us": "A hyphenation algorithm is a set of rules that decides at which points a word can be broken over two lines with a hyphen.",
			"et": "Tüpograafia ehk trükikunst on trükiste valmistamise oskus, täpsemini sõnastatult trükimärkide kujundamise ja paigutamise kunst ja tehnika.",
			"fi": "Typografia tarkoittaa nykyisin mitä tahansa tekstiin, tekstityyppiin, kirjainten asetteluun, väritykseen ja muuhun liittyvää suunnittelua.",
			"fr": "En typographie, la coupure de mot (parfois aussi appelée césure) est l'opération qui consiste à couper en fin de ligne un mot qui n'entrerait pas dans la justification.",
			"de": "Die Worttrennung, auch Silbentrennung genannt, bezeichnet in der Orthographie die Art und Weise, wie die Wörter insbesondere am Zeilenende getrennt werden können.",
			"el-monoton": "Δείγμα κειμένου που θα χρησιμεύσει για την επαλήθευση της μεταφοράς",
			"hi": "नमूना पाठ जो स्थानांतरण को सत्यापित करने के लिए काम करेगा",
			"hu": "A weboldal nyelvét nem sikerült automatikusan megállapítani. Kérem adja meg a nyelvet.",
			"it": "La storia della scrittura, quel processo lungo e tortuoso, ma anche estremamente affascinante e ricco di sorprese, che parte dai primi incerti disegni sulla roccia degli uomini primitivi e giunge ai moderni word processor, ha avuto proprio negli scribi, nei copisti e negli amanuensi dei solitari, silenziosi, laboriosi e importantissimi protagonisti.",
			"lt": "Lietuvių kalba yra labiausiai vartojama iš rytų baltų kalbų.",
			"nb-no": "Omtrentlig tekst som fortsatt fungerer som en kontroll for prenasyset",
			"pl": "Typografia - termin mający szereg pokrewnych znaczeń związanych z użyciem znaków pisarskich w druku, prezentacją ich na ekranie monitora komputerowego itp.",
			"pt": "A tipografia é a arte e o processo de criação na composição de um texto, física ou digitalmente.",
			"ru": "Пример текста, который будет служить для проверки перевода",
			"sr": "Tipografija se bavi izborom i organizacijom oblika slova i drugih grafičkih karakteristika štampane strane.",
			"sl": "Tipografija je veda o tipografskem oblikovanju. Preučuje izdelavo črk in pisav ter njihovo uporabo v besedilu.",
			"es": "Las palabras en español suelen ser, en promedio, más largas que en inglés pero más cortas que en alemán.",
			"sv": "En algoritm är inom matematiken och datavetenskapen begränsad uppsättning (mängd) väldefinierade instruktioner för att lösa en uppgift, som från givna utgångstillstånd (starttillstånd) med säkerhet leder till något givet sluttillstånd.",
			"th": "ตัวอย่างข้อความที่จะใช้ในการยืนยันการถ่ายโอน",
			"tr": "Tipografi sözcüklerinden türemiş olan typographia sözcüğünün Türkçe halidir.",
			"uk": "Зразок тексту, який буде служити для перевірки передачі"
		};

		var getFilteredLangs = function () {
			var langsParam = UriParameters.fromQuery(window.location.search).get("filter-langs");
			if (langsParam != null) {
				return langsParam.split(",");
			}
		};

		var hyph = HyphenationDelegate.getInstance();
		var filteredLangs = getFilteredLangs() || aLangCodes;

		var fnChangeText = function (evt) {
			var sLng = evt.getSource().getId().slice(4);
			var sNewText = Element.getElementById("inpChTxt-" + sLng).getValue();
			Element.getElementById("txt-" + sLng).setContent("<div style='font-size: 14px;' lang='" + sLng +
				"' class='sapUiHyphenation'>" + sNewText + "</div>");
			var sHyphenatedText = hyph.hyphenate(sNewText, sLng);
			Element.getElementById("hyph-" + sLng).setContent("<div style='font-size: 14px;'>" + sHyphenatedText + "</div>");
			Element.getElementById("slider-" + sLng).setValue(100);
		};

		var fnApplyConfig = function (evt) {
			var lang = evt.getParameters().id.split("button-")[1];
			hyph.initialize(lang).then(function () {
				var sNewText = Element.getElementById("inpChTxt-" + lang).getValue();
				Element.getElementById("txt-" + lang).setContent("<div style='font-size: 14px; 'lang='" + lang +
					"' class='sapUiHyphenation' >" + sNewText + "</div>");
				var sHyphenatedText = hyph.hyphenate(sNewText, lang);
				Element.getElementById("hyph-" + lang).setContent("<div style='font-size: 14px;'>" + sHyphenatedText +
					"</div>");
			});
			Element.getElementById("slider-" + lang).setValue(100);
		};
		var fnSliderChange = function (oEvent) {
			var value = oEvent.getParameter("value");
			var sLang = oEvent.getParameter("id").slice(7);
			document.getElementById("txt-" + sLang).style.width = value + "%";

			var oThirdPartyTextDomRef = document.getElementById("hyph-" + sLang);
			if (oThirdPartyTextDomRef) {
				oThirdPartyTextDomRef.style.width = value + "%";
			}
		};

		filteredLangs.forEach(function (lang) {
			if (hyph.canUseThirdPartyHyphenation(lang)) {
				hyph.initialize(lang).then(function () {
					createSectionFor(lang);
				});
			} else {
				createSectionFor(lang);
			}
		});

		function createSectionFor(lang) {
			var isSupportedBy3rdParty = (lang != "cs") && (lang != "pl") && (lang != "sr");
			var oTitle = new Title({
				text: oLangFullText[lang] + ": " + lang.toUpperCase(),
				width: "100%",
				titleStyle: "H2"
			}).addStyleClass("sapUiMediumMarginTop");

			var oInput = new Input({
				id: "inpChTxt-" + lang,
				value: oLangTexts[lang],
				width: "80%"
			});

			var oBtn = new Button({
				id: "btn-" + lang,
				press: fnChangeText,
				text: "Change Text"
			});

			var oInputWord = new Input({
				id: "inpWord-" + lang,
				value: HyphenationTestingWords[lang],
				editable: false,
				width: "60%"
			});

			var oButtonApply = new Button({
				id: "button-" + lang,
				//value: oLangTexts[aLangCodes[i]],
				width: "100px",
				press: fnApplyConfig,
				text: "Apply",
				visible: isSupportedBy3rdParty
			});

			var oFormConfig = new SimpleForm({
				layout: "ResponsiveGridLayout",
				labelSpanM: 3,
				labelSpanS: 3,
				labelSpanL: 2,
				editable: true,
				content: [
					new Label({
						text: "Word used for testing browser hyphenation function"
					}),
					oInputWord,
					new Label({
						text: "Apply configuration",
						visible: isSupportedBy3rdParty
					}),
					oButtonApply
				]
			});

			var oConfigPanel = new Panel({
				headerText: "Configuration",
				expandable: true,
				expanded: false,
				expandAnimation: false,
				content: [oFormConfig]
			});

			var oCssHyphenatedText = new HTML({
				id: "txt-" + lang
			});
			oCssHyphenatedText.setContent("<div style='font-size: 14px;' lang='" + lang + "' class='sapUiHyphenation'>" +
				oLangTexts[lang] + "</div>");

			var oThirdPartyTextHyphenated = new HTML({
				id: "hyph-" + lang,
				visible: isSupportedBy3rdParty,
				content: ["<div style='font-size: 14px;'>" + (isSupportedBy3rdParty ? hyph.hyphenate(oLangTexts[lang], lang) : oLangTexts[lang]) + "</div>"]
			});

			var sSlId = "slider-" + lang;
			var sFormId = "formWithTexts-" + lang;

			var oFormTexts = new SimpleForm(sFormId, {
				layout: "ResponsiveGridLayout",
				width: "80%",
				labelSpanM: 2,
				labelSpanS: 5,
				labelSpanL: 1,
				content: [
					new Label({
						text: "Container width",
						displayOnly: false
					}).addStyleClass("labelForSlider"),
					new Slider(sSlId, {
						value: 100,
						liveChange: fnSliderChange,
						width: "100%"
					}),
					new Label({
						text: "Browser native",
						displayOnly: false
					}).addStyleClass("labelHyphChoiseNat-" + hyph.canUseNativeHyphenation(lang)),
					oCssHyphenatedText,
					new Label({
						text: "3rd party",
						visible: isSupportedBy3rdParty,
						displayOnly: false
					}).addStyleClass("labelHyphChoise3rd-" + !hyph.canUseNativeHyphenation(lang)),
					oThirdPartyTextHyphenated
				]
			});

			var oLayoutTexts = new VerticalLayout({
				width: "100%",
				content: [

					oFormTexts
				]
			});
			initialPage.addContent(oTitle);
			initialPage.addContent(oInput);
			initialPage.addContent(oBtn);
			initialPage.addContent(oConfigPanel);
			initialPage.addContent(oLayoutTexts);
		}

	});