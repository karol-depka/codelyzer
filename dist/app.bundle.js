(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var HtmlFormatter = (function () {
    function HtmlFormatter() {
    }
    HtmlFormatter.prototype.format = function (e) {
        return "<li><span class=\"position\">[" + (e.startPosition.line + 1) + " - " + (e.endPosition.line + 1) + "]</span> " + this.linkify(e.failure) + " <span class=\"rule-name\">(" + e.ruleName + ")</span></li>";
    };
    HtmlFormatter.prototype.formatErrors = function (errors) {
        var _this = this;
        return errors.map(function (e) { return _this.format(e); }).join('');
    };
    HtmlFormatter.prototype.linkify = function (inputText) {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
        return replacedText;
    };
    return HtmlFormatter;
}());
exports.HtmlFormatter = HtmlFormatter;

},{}],2:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./html-formatter'));
__export(require('./linter'));

},{"./html-formatter":1,"./linter":3}],3:[function(require,module,exports){
"use strict";
var Linter = (function () {
    function Linter(config) {
        this.config = config;
        this.widgets = [];
    }
    Linter.prototype.init = function () {
        var _this = this;
        this.worker = new Worker(this.config.workerBundle);
        this.worker.addEventListener('message', function (res) {
            try {
                console.log(res.data);
                var errors = JSON.parse(res.data);
                _this.renderErrors(errors);
                _this.reportInlineErrors(errors);
            }
            catch (e) {
                console.error(e);
            }
        });
        this.config.textEditor.on('change', function () {
            return _this.lint(_this.config.textEditor.getValue());
        });
        this.lint(this.config.textEditor.getValue());
    };
    Linter.prototype.lint = function (program) {
        this.worker.postMessage(JSON.stringify({ program: program }));
    };
    Linter.prototype.renderErrors = function (errors) {
        if (!errors || !errors.length) {
            this.config.errorLabelContainer.innerHTML = 'Good job! No warnings in your code!';
            this.config.errorsContainer.innerHTML = '';
        }
        else {
            this.config.errorLabelContainer.innerHTML = 'Warnings';
            this.config.errorsContainer.innerHTML = this.config.formatter.formatErrors(errors);
        }
    };
    Linter.prototype.reportInlineErrors = function (errors) {
        var _this = this;
        var editor = this.config.textEditor;
        editor.operation(function () {
            for (var i = 0; i < _this.widgets.length; ++i)
                editor.removeLineWidget(_this.widgets[i]);
            _this.widgets.length = 0;
            var _loop_1 = function(i) {
                var err = errors[i];
                if (!err)
                    return "continue";
                var wrapper = document.createElement('div');
                var msg = document.createElement('div');
                var error = document.createElement('div');
                wrapper.className = 'lint-error';
                wrapper.appendChild(msg);
                wrapper.appendChild(error);
                error.className = 'error-tooltip';
                error.innerHTML = err.failure;
                msg.className = 'lint-icon';
                msg.onmouseenter = function () {
                    error.classList.add('visible');
                };
                msg.onmouseleave = function () {
                    error.classList.remove('visible');
                };
                _this.widgets.push(editor.addLineWidget(err.startPosition.line - 1, wrapper, { coverGutter: false, noHScroll: true }));
            };
            for (var i = 0; i < errors.length; ++i) {
                _loop_1(i);
            }
        });
    };
    return Linter;
}());
exports.Linter = Linter;

},{}],4:[function(require,module,exports){
"use strict";
var index_1 = require('./app-linter/index');
var sampleCode = "// Welcome to Codelyzer!\n//\n// Codelyzer is a tool great for teams and individuals, which helps you\n// write consistent code, and helps you discover potential errors.\n//\n// In case you're working on a huge legacy codebase, codelyzer can\n// automatically correct all the existing files for you!\n//\n// Codelyzer is extensible with custom rules and compatible with tslint!\n\n@Component({\n  selector: 'hero-cmp',\n  template: `\n    <h1>Hello <span>{{ hero.name }}</span></h1>\n  `,\n  styles: [\n    `\n    h1 spam {\n      color: red;\n    }\n    `\n  ]\n})\nclass HeroComponent {\n  private hero: Hero;\n}\n";
new index_1.Linter({
    workerBundle: './dist/worker.bundle.js',
    textEditor: window.CodeMirror(document.getElementById('editor'), {
        value: sampleCode,
        mode: 'javascript',
        theme: 'material',
        lineNumbers: true
    }),
    errorLabelContainer: document.getElementById('warnings-header'),
    formatter: new index_1.HtmlFormatter(),
    errorsContainer: document.getElementById('warnings')
}).init();

},{"./app-linter/index":2}]},{},[4]);