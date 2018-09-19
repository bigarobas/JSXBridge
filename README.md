## JSXBridge

JSXBridge is a javascript/extendscript librarie to help building Adobe CC extensions with CEP

Purposes :

- ease communication between both contexts (JS / JSX) with
  - symetrical event base API with different dispatch scopes and embbed data object.
  - symetrical method call API on registred objects with different call scopes, parameters and callback function/expression.
- no dependencies (except CEP of course and an embbed version of JSON2)
- minimize code duplication in both contexts with mixed context patterns : To have a better understanding of what is at stake here I recommand you to read this wiki page about "mixed contexts" :
[Mixed context in Adobe CC extensions with CEP](https://github.com/bigarobas/JSXBridge/wiki/Mixed-context-in-Adobe-CC-extensions-with-CEP)

