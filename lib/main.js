'use babel';

var maybeIdentifier = /^[$0-9\w]+$/;
var disableForSelector = [
  '.storage.type',
  '.storage.type',
  '.string.quoted',
  '.string.quoted',
  '.keyword',
  '.support.function.builtin',
  '.constant.numeric.integer',
  '.constant.language',
  '.variable.other.assignment',
  '.variable.other.declaration',
  '.comment.line',
];
var disableForSelectorLength = disableForSelector.length;

module.exports = {
  dependenciesInstalled: false,
  godef: null,
  activate() {
    require('atom-package-deps').install('go-hyperclick').then(() => {
      this.dependenciesInstalled = true;
      return this.dependenciesInstalled;
    }).then(() => {
      var godefModule = atom.packages.getLoadedPackage('navigator-go');
      if (godefModule && godefModule.mainModulePath) {
        this.godef = require(godefModule.mainModulePath).godef;
      }
    }).catch((e) => {
      console.log(e);
    });
  },
  getProvider() {
    var getGodef = () => {
      return this.godef;
    };
    return {
      providerName: 'go-hyperclick',
      getSuggestionForWord(textEditor, text, range) {
        var { scopeName } = textEditor.getGrammar();
        if (scopeName !== 'source.go') {
          return;
        }
        if (!text.match(maybeIdentifier)) {
          return;
        }
        var scopeChain = textEditor.scopeDescriptorForBufferPosition(range.start).getScopeChain();
        var found = false;
        for (var i = 0; i < disableForSelectorLength; ++i) {
          if (scopeChain.indexOf(disableForSelector[i]) >= 0) {
            found = true;
            break;
          }
        }
        if (found) {
          return;
        }
        var godef = getGodef();
        if (!godef) {
          return;
        }
        // console.log(text, scopeChain);
        return {
          range,
          callback() {
            // call func from module `navigator-go`
            var endOffset = textEditor.getBuffer().characterIndexForPosition(range.end);
            godef.gotoDefinitionWithParameters(['-o', endOffset, '-i'], textEditor.getText())
          },
        };
      },
    };
  },
};
