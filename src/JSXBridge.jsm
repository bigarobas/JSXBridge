//####################################################
// JSXBridgeEvent
//####################################################

JSXBridgeEvent = function (type,data,scope) {
    this.type = type;
    this.data = data;
    this.context = JSXBridge.getContext();
    this.bridge = null;
    this.bridgeName = null;
    if (!scope) scope = JSXBridgeEventScope.JSM;
    this.scope = scope;
}

JSXBridgeEvent.prototype.clone = function () {
    var event  = new JSXBridgeEvent(this.type,this.data,this.scope);
    event.context = this.context;
    event.bridge = this.bridge;
    event.bridgeName = this.bridgeName;
    return event;
}

JSXBridgeEvent.prototype.toString = function() {
    return JSXBridge.jsonHelper.stringify(this);
}


JSXBridgeEvent.CALL = "JSXBRIDGE.CALL";
JSXBridgeEvent.CALLBACK = "JSXBRIDGE.CALLBACK";
JSXBridgeEvent.READY = "JSXBRIDGE.READY";

JSXBridgeEvent._event_id_count = 0;
JSXBridgeEvent.createCallBackEventId = function () { 
    return JSXBridgeEvent._event_id_count++;
}

JSXBridgeEvent.createCallBackEventType = function (event_id) {
    var stamp = (event_id) ? event_id : JSXBridgeEvent.createCallBackEventId();
    return JSXBridgeEvent.CALLBACK+"_"+stamp;
}
JSXBridgeEvent.createCallBackEventData = function (call_event,result) {
    return  {
        call_event : call_event,
        event_id : call_event.data.event_id,
        result : result
    }
}
JSXBridgeEvent.createCallBackEvent = function (call_event,result,scope) {
    return new JSXBridgeEvent(
        JSXBridgeEvent.createCallBackEventType(call_event.data.event_id), 
        JSXBridgeEvent.createCallBackEventData(call_event,result), 
        (scope) ? scope : "jsx"
    );
}

//####################################################
// JSXBridgeEventScope
//####################################################

JSXBridgeEventScope  = {};
JSXBridgeEventScope.JS = "js";
JSXBridgeEventScope.JSX = "jsx";
JSXBridgeEventScope.MIRROR = "mirror";
JSXBridgeEventScope.JSM = "jsm";
JSXBridgeEventScope.CURRENT = "current";

//####################################################
// JSXBridge constructor
//####################################################

JSXBridge = function(client,bridgeName,mirrorName) {
    this.client = client;
    this.bridgeName = bridgeName;
    this.mirrorName = (mirrorName) ? mirrorName : bridgeName;
    JSXBridge._registerBridge(this);
    this.initClient(client);
}

//####################################################
// JSXBridge prototype
//####################################################

JSXBridge.prototype.initClient = function (client) {
    if (!client) return;
    
    var _self = this;

    if (typeof client._jsxbridge == 'undefined') {
        client._jsxbridge = _self;
    }

   
   //----------------------------------------
    if (typeof client.dispatchBridgeEvent == 'undefined') {
        client.dispatchBridgeEvent = function(event) {
            return _self.dispatchBridgeEvent(event);
        }
    }

    if (typeof client.dispatch == 'undefined') {
        client.dispatch = function(type,data,scope) {
            return _self.dispatch(type,data,scope);
        }
    }
    //----------------------------------------
    if (typeof client.addBridgeEventListener == 'undefined') {
        client.addBridgeEventListener = function(type,handler) {
            return _self.addBridgeEventListener(type,handler);
        }
    }
    if (typeof client.listen == 'undefined') {
        client.listen = function(type,handler) {
            return _self.addBridgeEventListener(type,handler);
        }
    }
    //----------------------------------------
    if (typeof client.removeBridgeEventListener == 'undefined') {
        client.removeBridgeEventListener = function(type,handler) {
            return _self.removeBridgeEventListener(type,handler);
        }
    }

    if (typeof client.unlisten == 'undefined') {
        client.unlisten = function(type,handler) {
            return _self.removeBridgeEventListener(type,handler);
        }
    }
    //----------------------------------------

    if (typeof client.createBridgeEvent == 'undefined') {
        client.createBridgeEvent = function(type,data,scope) {
            return _self.createBridgeEvent(type,data,scope);
        }
    }

    if (typeof client.mirror == 'undefined') {
        client.mirror = function(function_name,function_args,callback_or_expression) {
            return _self.mirror(function_name,function_args,callback_or_expression);
        }
    }

    if (typeof client.bridgeCall == 'undefined') {
        client.bridgeCall = function(bridge_name,function_name,function_args,callback_or_expression,scope) {
            return _self.bridgeCall(bridge_name,function_name,function_args,callback_or_expression,scope);
        }
    }

    if (typeof client.getContext == 'undefined') {
        client.getContext = function() {
            return _self.getContext();
        }
    }

    if (typeof client.checkContext == 'undefined') {
        client.checkContext = function (ctx) {
            return _self.checkContext(ctx);
        }
    }
    
}


JSXBridge.prototype.getContext = function () {
    return JSXBridge.getContext();
}

JSXBridge.prototype.checkContext = function (ctx) {
    return JSXBridge.checkContext(ctx);
}

JSXBridge.prototype.hasBridgeName = function() {
	return (this.bridgeName != undefined);
}

JSXBridge.prototype.setBridgeName = function (bridgeName) {
    this.bridgeName = bridgeName;
    return this.bridgeName;
}

JSXBridge.prototype.getBridgeName = function () {
	return this.bridgeName;
}

JSXBridge.prototype.setMirrorName = function (mirrorName) {
    this.mirrorName = mirrorName;
    return this.mirrorName;
}

JSXBridge.prototype.getMirrorName = function () {
	return this.mirrorName;
}

JSXBridge.prototype.addBridgeEventListener = function (type,handler) {
	return JSXBridge.registerAsListener(this,type,handler);
}

JSXBridge.prototype.removeBridgeEventListener = function (type,handler) {
	return JSXBridge.unRegisterAsListener(this,type,handler);
}

JSXBridge.prototype.dispatchBridgeEvent = function (event) {
    event.bridge = this;
    event.bridgeName = this.bridgeName;
	JSXBridge.dispatchBridgeEvent(event);
}

JSXBridge.prototype.dispatch = function (type,data,scope) {
    var event =  this.createBridgeEvent(type,data,scope);
    this.dispatchBridgeEvent(event);
}

JSXBridge.prototype.createBridgeEvent = function (type,data,scope) {
    return JSXBridge.createBridgeEvent(type,data,scope);
}

JSXBridge.prototype.mirror = function (function_name,function_args,callback_or_expression) {
    JSXBridge.mirror(this,function_name,function_args,callback_or_expression);  
}

JSXBridge.prototype.bridgeCall = function (bridge_name,function_name,function_args,callback_or_expression,scope) {
    return JSXBridge.bridgeCall(bridge_name,function_name,function_args,callback_or_expression,scope);  
}

//####################################################
// JSXBridge statics
//####################################################

JSXBridge._ctx = undefined;
JSXBridge._extension_path = undefined;
JSXBridge._csInterface = undefined;
JSXBridge._nodejs_module_path = undefined;
JSXBridge._nodejs_module_fs = undefined;
JSXBridge._bridgeName = "JSXBridge";
JSXBridge._initialized = false;
JSXBridge._initializing = false;
JSXBridge._bridgesMap = [];
JSXBridge._bridgesArray = [];
JSXBridge._bridgeEventHandlers = [];
JSXBridge._registerBridge = function (bridge) {JSXBridge._bridgesMap[bridge.bridgeName] = bridge; JSXBridge._bridgesArray.push(bridge);}
JSXBridge._callbacks_by_event_id = [];
JSXBridge._date = new Date();
JSXBridge._bridge =  new JSXBridge(JSXBridge,JSXBridge._bridgeName);

JSXBridge.test = function() { alert("JSXBridge.test");}

JSXBridge.init = function(csinterface_for_js_OR_extension_path_for_jsx) {
    if (JSXBridge._initialized) return true;
    if (JSXBridge._initializing) return false;
	JSXBridge._ctx = (typeof console !== 'undefined') ? "js" : "jsx";
    JSXBridge._initializing = true;
	if (JSXBridge.checkContext("jsx")) {
        if (typeof CSXSEvent == 'undefined') {
            try {
                var pp = new ExternalObject("lib:\PlugPlugExternalObject");
            } catch (e) { 
                alert("JSXBridge couldn't create lib:\PlugPlugExternalObject");
                alert(e); 
                return false;
            }
        }
        JSXBridge._extension_path = csinterface_for_js_OR_extension_path_for_jsx;
	} else {
        JSXBridge._nodejs_module_path = require('path');
        JSXBridge._nodejs_module_fs = require('fs');
        if (!JSXBridge.hasCSInterface()) {
            if (!csinterface_for_js_OR_extension_path_for_jsx) {
                try {
                    JSXBridge.setCSInterface(new CSInterface());
                } catch (e) {
                    alert("JSXBridge couldn't find CSInterface Class");
                    console.log("JSXBridge couldn't find CSInterface Class");
                    console.log(e);
                    return false;
                }
            } else {
                JSXBridge.setCSInterface(csinterface_for_js_OR_extension_path_for_jsx);
            }
        }
        JSXBridge._csInterface.addEventListener(JSXBridgeEvent.CALL,JSXBridge.on_BRIDGE_CALL);
        JSXBridge._extension_path = JSXBridge._csInterface.getSystemPath(SystemPath.EXTENSION);
        JSXBridge.evalJSX(
            'try { var res = $.evalFile("'+JSXBridge.getAbsolutePath(__filename)+'"); } catch (e) { alert("JSXBridge couldn\'t Include JSXBridge in JSX Context:" + e);}',
            function(res) {
                JSXBridge._bridge.mirror("init",JSXBridge._extension_path,function(res) {
                    JSXBridge._initializing = false;
                    JSXBridge._initialized = true;
                    JSXBridge._bridge.dispatch(JSXBridgeEvent.READY,JSXBridge.getContext());
                });
            }
        );
       
        /*
        JSXBridge.includeJSX(__filename,function(res) {
            JSXBridge._bridge.mirror("init",JSXBridge._extension_path,function(res) {
                JSXBridge._initializing = false;
                JSXBridge._initialized = true;
                JSXBridge._bridge.dispatch(JSXBridgeEvent.READY,JSXBridge.getContext());
            });
        });
        */

        
    }
    return true;
}

JSXBridge.on_BRIDGE_CALL = function (event) {

    var current_context = JSXBridge.getContext();
    var bridgeName = event.data.bridgeName;
    var mirror = JSXBridge._bridgesMap[bridgeName];

    if (!mirror) {
        return false;
    } 
    
    var functionName = event.data.functionName;
    var bridgeFunction =  mirror.client[functionName];

    if (!bridgeFunction) {
        return false;
    } 

    var functionArgs = event.data.functionArgs;
    var bridgeCallResult = bridgeFunction.call(mirror.client,functionArgs);

    if (current_context == "jsx") {
        return bridgeCallResult; 
    }

    JSXBridge.dispatchBridgeEvent(JSXBridgeEvent.createCallBackEvent(event,bridgeCallResult,"jsx"));
    
    var callback = event.data.callback;

    /*
    if (!callback) {
        alert(4);
        return bridgeCallResult;
    }
    */

    if (typeof callback == "string") {
        JSXBridge.bridgeCall(bridgeName,callback,bridgeCallResult,null,JSXBridgeEventScope.JSX);
    } else {
        JSXBridge.evalCallback(callback);
    }

    return bridgeCallResult;

}

JSXBridge.register = function (client,bridgeName,mirrorName) {
    return new JSXBridge(client,bridgeName,mirrorName);
}

JSXBridge.isInitialized = function() {
	return JSXBridge._initialized;
}

JSXBridge.isInitializing = function() {
	return JSXBridge._initializing;
}


JSXBridge.getBridgeName = function() {
	return JSXBridge._bridgeName;
}


JSXBridge.hasCSInterface = function() {
	return (JSXBridge._csInterface != undefined);
}

JSXBridge.setCSInterface = function (csi) {
	JSXBridge._csInterface = csi;
}

JSXBridge.getCSInterface = function () {
	return JSXBridge._csInterface;
}


JSXBridge.argsToString = function (args) {
    if (!args) return "";
    var result = args;
    switch (typeof args) {
        case "number":
            result = args;
            break;
        case "string":
            result = '"'+args+'"';
            break;
        case "object":
            result = JSXBridge.jsonHelper.stringify(args);
            break;
        default:
            result = JSXBridge.jsonHelper.stringify(args);
            break;
    }
    return result;
}

JSXBridge.checkContext = function (ctx) {
    if (JSXBridge._ctx == ctx) return true;
    return false;
}

JSXBridge.getContext = function () {
    return JSXBridge._ctx;
}

JSXBridge._dispatchBridgeEventAmongListeners = function (event) {
    var type = event.type;
    var handlersList = JSXBridge.getOrCreateBridgeEventHandlersList(type);
    var listener;
    var n = handlersList.length;
    for (var i=0 ; i < n ; i++) {
        listener = handlersList[i];
        if (typeof listener.bridge.client != 'undefined') {
            listener.handler.call(listener.bridge.client,event);
        } else {
            listener.handler(event);
        }
    } 
}


JSXBridge.registerAsListener = function (bridge,type,handler) {
    var handlersList = JSXBridge.getOrCreateBridgeEventHandlersList(type);
    handlersList.push({bridge:bridge,handler:handler});
}

JSXBridge.unRegisterAsListener = function (bridge,type,handler) {
    var handlersList = JSXBridge.getOrCreateBridgeEventHandlersList(type);
    var listener;
    var i =  handlersList.length;
    var count = 0;
    while (i--) {
        listener = handlersList[i];
        if (listener.bridge == bridge && listener.handler == handler) { 
            handlersList.splice(i, 1);
            count++;
        } 
    }
    return count;
}

JSXBridge.dispatchBridgeEvent = function (bridgeEvent) {
    var current_context = JSXBridge.getContext();
    if (bridgeEvent.scope == current_context || bridgeEvent.scope == JSXBridgeEventScope.JSM || bridgeEvent.scope == JSXBridgeEventScope.CURRENT) {
        JSXBridge._dispatchBridgeEventAmongListeners(bridgeEvent);
    }

    if (bridgeEvent.scope != current_context && bridgeEvent.scope != JSXBridgeEventScope.CURRENT) {
        JSXBridge.mirror(
            JSXBridge._bridge,
            '_dispatchBridgeEventAmongListeners',
            bridgeEvent.clone()
        );
    }

}

JSXBridge.createBridgeEvent = function (type,data,scope) {
    var event =  new JSXBridgeEvent(type,data,scope);
    return event;
}


JSXBridge.getOrCreateBridgeEventHandlersList = function(type) {
    var handlersList = JSXBridge._bridgeEventHandlers[type];
     if (!handlersList) JSXBridge._bridgeEventHandlers[type] = [];
     return JSXBridge._bridgeEventHandlers[type];
}

JSXBridge.mirror = function (bridge,function_name,function_args,callback_or_expression) {
    return JSXBridge.bridgeCall(bridge.mirrorName,function_name,function_args,callback_or_expression);
}

JSXBridge.evalCallback = function(callback,data) {
    var callback_function = (typeof callback == 'function') ? callback : null;
    var callback_expression = (typeof callback == 'string') ? callback : null;
    var callback_object = (typeof callback == 'object') ? callback : null;


    if (callback_expression) {
        regex = new RegExp(/{args}/g);
        callback_expression = callback_expression.replace(regex,JSXBridge.argsToString(data));
        if (JSXBridge.checkContext("jsx")) {
            eval(callback_expression);
        } else {
            JSXBridge._csInterface.evalScript(callback_expression);
        }
    }
    
    if (callback_function) {
        callback_function(data);
    }

    if (callback_object) {
        switch(callback_object.type) {
            case "call" :
            if (!callback_object.call_args) callback_object.call_args = data;
                JSXBridge.bridgeCall(callback_object.call_bridge,callback_object.call_method,callback_object.call_args);
                break;
            case "event":
                if (!callback_object.event_data) callback_object.event_data = data;
                JSXBridge.dispatch(callback_object.event_type,callback_object.event_data,callback_object.event_scope);
                break;
            default :
                break;
        }
        
    }
}



JSXBridge.bridgeCall = function (bridge_name,function_name,function_args,callback_or_expression,scope) {
    if (!scope) scope = JSXBridgeEventScope.MIRROR;
    var current_context = JSXBridge.getContext();
    var args_str = JSXBridge.argsToString(function_args);
    var callback_function = (typeof callback_or_expression == 'function') ? callback_or_expression : null;
    var callback_expression = (typeof callback_or_expression == 'string') ? callback_or_expression : null;
    var callback_object = (typeof callback_or_expression == 'object') ? callback_or_expression : null;
    var callback_event_id = JSXBridgeEvent.createCallBackEventId();
    var callback_event_type = JSXBridgeEvent.createCallBackEventType(callback_event_id);
    var data = {
        event_id : callback_event_id,
        context : current_context,
        scope : scope,
        bridgeName : bridge_name,
        functionName : function_name,
        functionArgs : function_args,
        callback : (callback_expression) ? callback_expression : (callback_object) ? callback_object : null,
    };

    var callResult = null;

    var event = (JSXBridge.checkContext("jsx")) ? new CSXSEvent() : new JSXBridgeEvent();
    event.type = JSXBridgeEvent.CALL;
    
    if (scope == current_context || scope == JSXBridgeEventScope.JSM || scope == JSXBridgeEventScope.CURRENT) {
        event.data = data;
        callResult = JSXBridge.on_BRIDGE_CALL(event);
    }

    if (scope != current_context && scope != JSXBridgeEventScope.CURRENT) {
        if (JSXBridge.checkContext("jsx")) {
            if (callback_function) {
                JSXBridge.addBridgeEventListener(callback_event_type,JSXBridge.bridgeCall_callback);
                JSXBridge._callbacks_by_event_id[callback_event_id] = callback_function;
            }
            event.data = JSXBridge.jsonHelper.stringify(data);
            event.dispatch();
        } else {
            event.data = data;
            var expr = 'JSXBridge.on_BRIDGE_CALL('+event+')';
            JSXBridge._csInterface.evalScript(expr,callback_function);
        }
    }

    return callResult;
}

JSXBridge.bridgeCall_callback = function (e) {  
    var callback_function = JSXBridge._callbacks_by_event_id[e.data.event_id];
    var res = JSXBridge.removeBridgeEventListener(e.type,JSXBridge.bridgeCall_callback);
    alert(res);
    callback_function(e.data.result);
}

JSXBridge.evalJSX = function(expression,callback_or_expression) {
    if (JSXBridge.checkContext("js")) {
        JSXBridge._csInterface.evalScript(expression,callback_or_expression);
    } else {
        //TODO : it's not really usefull but still make it native jsx eval
        JSXBridge._bridge.mirror("evalJSX",expression,callback_or_expression);
    }
}

JSXBridge.getCleanPath = function(path) {
    return  path.replace(/\\/g,"/");
}

JSXBridge.getAbsolutePath  = function(path,callback_or_expression) {
    if (JSXBridge.checkContext("jsx")) {
        JSXBridge._bridge.mirror("getAbsolutePath",path,callback_or_expression);
    } else {
        var result = path;
        if (!JSXBridge._nodejs_module_path.isAbsolute(path)) {
            result = JSXBridge.getCleanPath(result);
            var res = result.match(JSXBridge._extension_path);
            if (res == null) result = JSXBridge._nodejs_module_path.resolve(JSXBridge._extension_path,result)
        }
        result = JSXBridge.getCleanPath(result);
        JSXBridge.evalCallback(callback_or_expression,result) ;
        return result;
    }


}

//----------------------------------------------------
// JSXBridgeIncluder Interface implementation
//----------------------------------------------------

JSXBridge.includeJS = function(path,callback_or_expression) {
    return JSXBridgeIncluder.includeJS(path,callback_or_expression);
}

JSXBridge.includeJSX = function(path,callback_or_expression) {
    return JSXBridgeIncluder.includeJSX(path,callback_or_expression);
}

JSXBridge.includeJSM = function(path,callback_or_expression) {
    return JSXBridgeIncluder.includeJSM(path,callback_or_expression);
}

JSXBridge.include = function(param,callback) {
    return JSXBridgeIncluder.include(param,callback);
}

JSXBridge.getIncludesByPath = function(){
    return JSXBridgeIncluder.getIncludesByPath();
}

JSXBridge.getIncludeByPath = function(path){
    return JSXBridgeIncluder.getIncludeByPath(path);
}

JSXBridge.getIncludeById = function(id){
    return JSXBridgeIncluder.getIncludeById(id);
}

//####################################################
// JSXBridgeIncluder
//####################################################

JSXBridgeIncludeData = function(path,scope) {
    this.path = path;
    this.scope = scope;
}

JSXBridgeIncludeGroup = function(queue,callback) {
    this.queue = queue;
    this.callback = callback;
    this.complete_count = 0;
}


JSXBridgeIncluder = function () {}
JSXBridgeIncluder._queue = [];
JSXBridgeIncluder._isWorking = false;
JSXBridgeIncluder._current_group = null;
JSXBridgeIncluder._current_include = null;
JSXBridgeIncluder._includes_by_id = [];
JSXBridgeIncluder._includes_by_path = [];
JSXBridgeIncluder._bridge = new JSXBridge(JSXBridgeIncluder,"JSXBridgeIncluder");


JSXBridgeIncluder.getIncludeDataFromParam = function(data) {
    if (!data) return null;
    switch (typeof data) {
        case "string" :
                var scope = data.split(".");
                if (scope) {
                    if (scope.length>0) scope = scope.pop();
                    else scope = null;
                }
                return new JSXBridgeIncludeData(data,scope);
            break;
        case "object" :
                return new JSXBridgeIncludeData(data.path,data.scope);
            break;
    }
    return null;
}

JSXBridgeIncluder.include = function(data,callback) {
    if (!data) return null;
    var queue = [];
    switch (typeof data) {
        case "string" :
            queue.push(this.getIncludeDataFromParam(data));
            break;
        case "object" :
            if (JSXBridge.arrayHelper.isArray(data)) for (var i = 0 ; i<data.length ;i++) { queue.push(this.getIncludeDataFromParam(data[i])); }  
            else queue.push(this.getIncludeDataFromParam(data));
            break;
    }
    return this._addToQueue(new JSXBridgeIncludeGroup (queue,callback));
}

JSXBridgeIncluder._addToQueue = function(group) {
    this._queue.push(group);
    if (!this._isWorking) {
        this._next();
    } else {


    }
}

JSXBridgeIncluder._next = function() {
    //if (this._isWorking) return false;
    if (!this._current_group) {  
        if (this._queue.length<=0) {
            this._isWorking = false; 
            return false; 
        }
        this._current_group = this._queue.shift(); 
    }

    if (this._current_group.complete_count >= this._current_group.queue.length) {
        var callback = this._current_group.callback;
        this._current_group = null;
        JSXBridge.evalCallback(callback);
        this._isWorking = false;
        this._next();
        return true;
    }

    this._isWorking = true;
    
    this._current_include = this._current_group.queue[this._current_group.complete_count];

    var includeFunction = null;
    
    switch (this._current_include.scope) {
        case "mirror" : includeFunction = (JSXBridge.checkContext("jsx")) ? JSXBridgeIncluder.includeJS : JSXBridgeIncluder.includeJSX; break;
        case "current" : includeFunction = (JSXBridge.checkContext("jsx")) ? JSXBridgeIncluder.includeJSX : JSXBridgeIncluder.includeJS; break;
        case "js" : includeFunction = JSXBridgeIncluder.includeJS; break;
        case "jsx" : includeFunction = JSXBridgeIncluder.includeJSX; break;
        case "jsm" : includeFunction = JSXBridgeIncluder.includeJSM; break;
    }

    var _self = this;
    try {
        includeFunction(this._current_include.path,function(result) {
            _self._current_group.complete_count++;
            _self._next();
        })
    } catch (e) {
        throw new Error("JSXBridgeIncluder cannot include : "+this._current_include.path);
        _self._current_group.complete_count++;
        _self._next();
    }
    return true;

}

JSXBridgeIncluder.includeJS = function(path,callback_or_expression) {
    if (JSXBridge.checkContext("js")) {
        var absolute_path = JSXBridge.getAbsolutePath(path);
        var res = require(absolute_path);
        JSXBridgeIncluder._includes_by_path[path] = res;
        JSXBridge.evalCallback(callback_or_expression,res);
        return res;
    } else {
        JSXBridgeIncluder.mirror("includeJS",path,callback_or_expression);
        return null;
    }
}

JSXBridgeIncluder.includeJSX = function(path,callback_or_expression) {
    if (JSXBridge.checkContext("jsx")) {
        JSXBridge.getAbsolutePath(path,function(resolved_path) {
            var res = JSXBridgeIncluder.__includeJSX(resolved_path)
            JSXBridgeIncluder._includes_by_path[path] = res;
            JSXBridge.evalCallback(callback_or_expression,res);
            return res;
        }); 
    } else {
       var absolute_path = JSXBridge.getAbsolutePath(path);
       JSXBridgeIncluder.includeJSXWithPathData({path:path,absolute_path:absolute_path},callback_or_expression);
       return null;
    }
}

JSXBridgeIncluder.includeJSXWithPathData = function(path_data,callback_or_expression) {
    if (JSXBridge.checkContext("jsx")) {
        var res = JSXBridgeIncluder.__includeJSX(path_data.absolute_path);
        JSXBridgeIncluder._includes_by_path[path_data.path] = res;
        JSXBridge.evalCallback(callback_or_expression,res);
        return res;
    } else {
        JSXBridgeIncluder.mirror("includeJSXWithPathData",path_data,callback_or_expression);
    }
}

JSXBridgeIncluder.__includeJSX = function(absolute_path) {
    try {
        var res = $.evalFile(absolute_path);
        return res;
    } catch (e) {
        alert("JSXBridgeIncluder.__includeJSX couldn\'t include "+absolute_path);
        alert(e);
        return null;
    }
}

JSXBridgeIncluder.includeJSM = function(path,callback_or_expression) {
    if (JSXBridge.checkContext("jsx")) {
        JSXBridgeIncluder.mirror("includeJSM",path,callback_or_expression);
        return null;
    } else {
        var res = JSXBridgeIncluder.includeJS(path);
        JSXBridgeIncluder._includes_by_path[path] = res;
        JSXBridgeIncluder.includeJSX(path,function(result) {
            JSXBridge.evalCallback(callback_or_expression,res);
        });
        return res;
    }
}

JSXBridgeIncluder.getIncludeByPath = function(path){
    return JSXBridgeIncluder._includes_by_path[path];
}

JSXBridgeIncluder.getIncludesByPath = function(){
    return JSXBridgeIncluder._includes_by_path;
}

JSXBridgeIncluder.getIncludeById = function(id){
    return null; //TODO
}



//####################################################
// JSXBridge Array Helpers
//####################################################

JSXBridge.arrayHelper = {};
JSXBridge.arrayHelper.indexOf = function(arr,searchElement, fromIndex) {
// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Référence : http://es5.github.io/#x15.4.4.14

    var k;

    // 1. Soit O le résultat de l'appel à ToObject avec
    //    this en argument.
    if (arr == null) {
    throw new TypeError('"this" vaut null ou n est pas défini');
    }

    var O = Object(arr);

    // 2. Soit lenValue le résultat de l'appel de la
    //    méthode interne Get de O avec l'argument
    //    "length".
    // 3. Soit len le résultat de ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. Si len vaut 0, on renvoie -1.
    if (len === 0) {
    return -1;
    }

    // 5. Si l'argument fromIndex a été utilisé, soit
    //    n le résultat de ToInteger(fromIndex)
    //    0 sinon
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
    n = 0;
    }

    // 6. Si n >= len, on renvoie -1.
    if (n >= len) {
    return -1;
    }

    // 7. Si n >= 0, soit k égal à n.
    // 8. Sinon, si n<0, soit k égal à len - abs(n).
    //    Si k est inférieur à 0, on ramène k égal à 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. On répète tant que k < len
    while (k < len) {
    // a. Soit Pk égal à ToString(k).
    //    Ceci est implicite pour l'opérande gauche de in
    // b. Soit kPresent le résultat de l'appel de la
    //    méthode interne HasProperty de O avec Pk en
    //    argument. Cette étape peut être combinée avec
    //    l'étape c
    // c. Si kPresent vaut true, alors
    //    i.  soit elementK le résultat de l'appel de la
    //        méthode interne Get de O avec ToString(k) en
    //        argument
    //   ii.  Soit same le résultat de l'application de
    //        l'algorithme d'égalité stricte entre
    //        searchElement et elementK.
    //  iii.  Si same vaut true, on renvoie k.
    if (k in O && O[k] === searchElement) {
        return k;
    }
    k++;
    }
    return -1;
};

JSXBridge.arrayHelper.isArray = function(arr) {
    return Object.prototype.toString.call(arr) === "[object Array]";
};

//####################################################
// JSXBridge JSON Helpers
//####################################################

//FROM :
//https://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
JSXBridge.jsonHelper = {};
JSXBridge.jsonHelper.stringify = function(obj) {
    // Note: cache should not be re-used by repeated calls to JSON.stringify.
    var cache = [];
    var result = JSON.stringify(obj, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            //if (cache.indexOf(value) !== -1) {
            if (JSXBridge.arrayHelper.indexOf(cache,value) !== -1) {
                // Duplicate reference found
                try {
                    // If this value does not reference a parent it can be deduped
                    return JSON.parse(JSON.stringify(value));
                } catch (error) {
                    // discard key if value cannot be deduped
                    return;
                }
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null; // Enable garbage collection
    return result;
}

//####################################################
// JSON2 Dependency
//####################################################


//  json2.js
//  2016-10-28
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html
//  This code should be minified before deployment.
//  See http://javascript.crockford.com/jsmin.html

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
//                          +a[5], +a[6]));
//                  }
//              }
//              return value;
//          });

//          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
//              var d;
//              if (typeof value === "string" &&
//                      value.slice(0, 5) === "Date(" &&
//                      value.slice(-1) === ")") {
//                  d = new Date(value.slice(5, -1));
//                  if (d) {
//                      return d;
//                  }
//              }
//              return value;
//          });

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());



//####################################################
// JSXBridge
// Node Export
//####################################################

if ( typeof module === "object" && typeof module.exports === "object" ) {
	module.exports = JSXBridge;
} 