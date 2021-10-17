var JSTokenizer = function () {
    this.at;
    this.ch;
    this.escapee = {
        "\"": "\"",
        "'": "'",
        "\\": "\\",
        "/": "/",
        b: "\b",
        f: "\f",
        n: "\n",
        r: "\r",
        t: "\t"
    };
    this.text;
};
JSTokenizer.prototype.error = function (m) {
    throw {
        name: "SyntaxError",
        message: m,
        at: this.at,
        text: this.text
    };
};
JSTokenizer.prototype.next = function (c) {
    if (c && c !== this.ch) {
        this.error("Expected '" + c + "' instead of '" + this.ch + "'");
    }
    this.ch = this.text.charAt(this.at);
    this.at += 1;
    return this.ch;
};
JSTokenizer.prototype.number = function () {
    var number, string = "";
    if (this.ch === "-") {
        string = "-";
        this.next("-");
    }
    while (this.ch >= "0" && this.ch <= "9") {
        string += this.ch;
        this.next();
    }
    if (this.ch === ".") {
        string += ".";
        while (this.next() && this.ch >= "0" && this.ch <= "9") {
            string += this.ch;
        }
    }
    if (this.ch === "e" || this.ch === "E") {
        string += this.ch;
        this.next();
        if (this.ch === "-" || this.ch === "+") {
            string += this.ch;
            this.next();
        }
        while (this.ch >= "0" && this.ch <= "9") {
            string += this.ch;
            this.next();
        }
    }
    number = +string;
    if (!isFinite(number)) {
        this.error("Bad number");
    }
    else {
        return number;
    }
};
JSTokenizer.prototype.string = function () {
    var hex, i, string = "", quote, uffff;
    if (this.ch === "\"" || this.ch === "'") {
        quote = this.ch;
        while (this.next()) {
            if (this.ch === quote) {
                this.next();
                return string;
            }
            if (this.ch === "\\") {
                this.next();
                if (this.ch === "u") {
                    uffff = 0;
                    for (i = 0; i < 4; i += 1) {
                        hex = parseInt(this.next(), 16);
                        if (!isFinite(hex)) {
                            break;
                        }
                        uffff = uffff * 16 + hex;
                    }
                    string += String.fromCharCode(uffff);
                }
                else if (typeof this.escapee[this.ch] === "string") {
                    string += this.escapee[this.ch];
                }
                else {
                    break;
                }
            }
            else {
                string += this.ch;
            }
        }
    }
    this.error("Bad string");
};
JSTokenizer.prototype.name = function () {
    var name = "", allowed = function (ch) {
        return ch === "_" || ch === "$" || (ch >= "0" && ch <= "9") || (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
    };
    if (allowed(this.ch)) {
        name += this.ch;
    }
    else {
        this.error("Bad name");
    }
    while (this.next()) {
        if (this.ch === " ") {
            this.next();
            return name;
        }
        if (this.ch === ":") {
            return name;
        }
        if (allowed(this.ch)) {
            name += this.ch;
        }
        else {
            this.error("Bad name");
        }
    }
    this.error("Bad name");
};
JSTokenizer.prototype.white = function () {
    while (this.ch && this.ch <= " ") {
        this.next();
    }
};
JSTokenizer.prototype.word = function () {
    switch (this.ch) {
        case "t":
            this.next("t");
            this.next("r");
            this.next("u");
            this.next("e");
            return true;
        case "f":
            this.next("f");
            this.next("a");
            this.next("l");
            this.next("s");
            this.next("e");
            return false;
        case "n":
            this.next("n");
            this.next("u");
            this.next("l");
            this.next("l");
            return null;
    }
    this.error("Unexpected '" + this.ch + "'");
};
JSTokenizer.prototype.array = function () {
    var array = [];
    if (this.ch === "[") {
        this.next("[");
        this.white();
        if (this.ch === "]") {
            this.next("]");
            return array;
        }
        while (this.ch) {
            array.push(this.value());
            this.white();
            if (this.ch === "]") {
                this.next("]");
                return array;
            }
            this.next(",");
            this.white();
        }
    }
    this.error("Bad array");
};
var object = function () {
    var key, object = {};
    if (this.ch === "{") {
        this.next("{");
        this.white();
        if (this.ch === "}") {
            this.next("}");
            return object;
        }
        while (this.ch) {
            if (this.ch >= "0" && this.ch <= "9") {
                key = this.number();
            }
            else if (this.ch === "\"" || this.ch === "'") {
                key = this.string();
            }
            else {
                key = this.name();
            }
            this.white();
            this.next(":");
            if (Object.hasOwnProperty.call(object, key)) {
                this.error("Duplicate key \"" + key + "\"");
            }
            object[key] = this.value();
            this.white();
            if (this.ch === "}") {
                this.next("}");
                return object;
            }
            this.next(",");
            this.white();
        }
    }
    this.error("Bad object");
};
JSTokenizer.prototype.value = function () {
    this.white();
    switch (this.ch) {
        case "{": return object.call(this);
        case "[": return this.array();
        case "\"":
        case "'": return this.string();
        case "-": return this.number();
        default: return this.ch >= "0" && this.ch <= "9" ? this.number() : this.word();
    }
};
JSTokenizer.prototype.getIndex = function () {
    return this.at - 1;
};
JSTokenizer.prototype.getCh = function () {
    return this.ch;
};
JSTokenizer.prototype.init = function (sSource, iIndex) {
    this.text = sSource;
    this.at = iIndex || 0;
    this.ch = " ";
};
JSTokenizer.prototype.setIndex = function (iIndex) {
    if (iIndex < this.at - 1) {
        throw new Error("Must not set index " + iIndex + " before previous index " + (this.at - 1));
    }
    this.at = iIndex;
    this.next();
};
JSTokenizer.parseJS = function (sSource, iStart) {
    var oJSTokenizer = new JSTokenizer();
    var result;
    oJSTokenizer.init(sSource, iStart);
    result = oJSTokenizer.value();
    if (isNaN(iStart)) {
        oJSTokenizer.white();
        if (oJSTokenizer.getCh()) {
            oJSTokenizer.error("Syntax error");
        }
        return result;
    }
    else {
        return { result: result, at: oJSTokenizer.getIndex() };
    }
};