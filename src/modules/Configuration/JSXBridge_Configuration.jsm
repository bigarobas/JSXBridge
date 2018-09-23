JSXBridge_Configuration = function (bridgeName) {
    'use strict';
	this.data = {};
    this._onSynchPushCallback = null;
    this._onSynchPullCallback = null;
    this.bridgeName = bridgeName;
    this.bridge = new JSXBridge(this,bridgeName);
}

JSXBridge_Configuration.prototype.update = function(json) {
    
    if(!json) return false;
    if (typeof json == "string") json = JSON.parse(json);
    
    for (var key in json) {
        if (key !== undefined && key !== "toJSONString" && key !== "parseJSON" ) {
            this.data[key] = json[key];
        }
    }
    if (this.bridge.checkContext("jsx")) {
        return JSON.stringify(this.data);
    } else {
        return this.data;
    }
}
    
JSXBridge_Configuration.prototype.get = function(key) {
    var value = this.data[key];
    return value;
}

JSXBridge_Configuration.prototype.set = function(key,value) {
    this.data[key] = value;
}

JSXBridge_Configuration.prototype.evaluate = function(key,injections) {

    var value = this.data[key];
    if (typeof value !== "string") return value;

    return this.evaluateString(value,injections);
}

JSXBridge_Configuration.prototype.evaluateString = function(str,injections) {
    var value = str;
    if (typeof value !== "string") return value;
    
    if (injections) {
        for (var inj_key in injections) {
            if (inj_key !== undefined && inj_key !== "toJSONString" && inj_key !== "parseJSON" ) {
                value = value.replace(new RegExp("{"+inj_key+"}",'g'),injections[inj_key]);
            }
        }
    }

    var regex = new RegExp(/\{(\w+)\}/g);
    var res,conf_key,conf_value;

    while ((res = regex.exec(value)) !== null )  {
        conf_key = res[1];
        conf_value = this.get(conf_key);
        if (conf_value) conf_value = this.evaluate(conf_key,injections);
        value = value.replace(new RegExp("{"+conf_key+"}",'g'),conf_value);
    }

    return value;
}

JSXBridge_Configuration.prototype.getData = function() {
    return this.data;
}


JSXBridge_Configuration.prototype.synch = function(callback) {
    this.synchPush(callback);
}

JSXBridge_Configuration.prototype.synchPush = function(callback) {
    this._onSynchPushCallback = callback;
    var _self = this;
    this.bridge.mirror(
        'update',
        this.data,
        function(json) {
            _self.onSynchPushComplete(json);
        }
    );
}
JSXBridge_Configuration.prototype.synchPull= function(callback) {
    this._onSynchPullCallback = callback;
    var _self = this;
    this.bridge.mirror(
        'getData',
        null,
        function(json) {
            _self.onSynchPullFetched(json);
        }
    );
}

JSXBridge_Configuration.prototype.onSynchPushComplete = function (json) {
    this.update(json);
    if (!this._onSynchPushCallback) return;
    this._onSynchPushCallback(json);
}

JSXBridge_Configuration.prototype.onSynchPullFetched = function (json) {
    this.update(json);
    var _self = this;
    this.bridge.mirror(
        'update',
        this.data,
        function(json) {
            _self.onSynchPullComplete(json);
        }
        
    );
}

JSXBridge_Configuration.prototype.onSynchPullComplete = function (json) {
    if (!this._onSynchPullCallback) return;
    this._onSynchPullCallback(json);
}

if ( typeof module === "object" && typeof module.exports === "object" ) {
	module.exports = JSXBridge_Configuration;
} 
    
