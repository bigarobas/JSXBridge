# Non-prioritized non-exhaustive todo list

## JSXBridge
- [ ] Static JSXBridge.register(client,bridgeName) method in addition to new JSXBridge(client,bridgeName) syntaxe
- [ ] create a mirrorName in addition to bridgeName default value would be the same than bridgeName but it would give the capacity to refer to another mirror object than the one with the same bridgeName oin the other context. Exemple : Few JS objects will be able to be bridged to the same mirror object in JSX context.
- [ ] (?) Getting away from singelton model for CORE (?)
- [ ] (?) Thinking multi-panel and cross-app (?)
- [ ] (?) Thinking external framework (angular, react, vue, knockoutjs, etc.) helpers
- [ ] optional es5-shim integration via config for JSX (ES3 JSX power up to ES5)
- [ ] more in depth performance test
- [ ] Commenting/Documenting the code
- [x] JSXBridge linker resolve bridge path based on registred object instead global variables name

## Modules
- [ ] a ready to use Panel Module to quickly startup a Panel Project
- [ ] standard core events for all modules (INIT, READY, etc.)

- Configuration
    - [ ] local storage save/load
    - [x] evaluate values : internal key/value injection / external key/value injection

- Debugger
    - [ ] optimize stack/flush

- Environment
    - [ ] use JSXBridge native node lib imports instead of its own



