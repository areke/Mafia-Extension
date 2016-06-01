(function UMDish(name, context, definition) {
    context[name] = definition.call(context);
    if (typeof module !== "undefined" && module.exports) {
        module.exports = context[name]
    } else if (typeof define === "function" && define.amd) {
        define(function reference() {
            return context[name]
        })
    }
})("Primus", this, function wrapper() {
    var define, module, exports, Primus = function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    }({
        1: [function(_dereq_, module, exports) {
            "use strict";
            module.exports = function demolish(keys, options) {
                var split = /[, ]+/;
                options = options || {};
                keys = keys || [];
                if ("string" === typeof keys) keys = keys.split(split);

                function run(key, selfie) {
                    if (!options[key]) return;
                    if ("string" === typeof options[key]) options[key] = options[key].split(split);
                    if ("function" === typeof options[key]) return options[key].call(selfie);
                    for (var i = 0, type, what; i < options[key].length; i++) {
                        what = options[key][i];
                        type = typeof what;
                        if ("function" === type) {
                            what.call(selfie)
                        } else if ("string" === type && "function" === typeof selfie[what]) {
                            selfie[what]()
                        }
                    }
                }
                return function destroy() {
                    var selfie = this,
                        i = 0,
                        prop;
                    if (selfie[keys[0]] === null) return false;
                    run("before", selfie);
                    for (; i < keys.length; i++) {
                        prop = keys[i];
                        if (selfie[prop]) {
                            if ("function" === typeof selfie[prop].destroy) selfie[prop].destroy();
                            selfie[prop] = null
                        }
                    }
                    if (selfie.emit) selfie.emit("destroy");
                    run("after", selfie);
                    return true
                }
            }
        }, {}],
        2: [function(_dereq_, module, exports) {
            "use strict";
            module.exports = function emits() {
                var self = this,
                    parser;
                for (var i = 0, l = arguments.length, args = new Array(l); i < l; i++) {
                    args[i] = arguments[i]
                }
                if ("function" !== typeof args[args.length - 1]) return function emitter() {
                    for (var i = 0, l = arguments.length, arg = new Array(l); i < l; i++) {
                        arg[i] = arguments[i]
                    }
                    return self.emit.apply(self, args.concat(arg))
                };
                parser = args.pop();
                return function emitter() {
                    for (var i = 0, l = arguments.length, arg = new Array(l + 1); i < l; i++) {
                        arg[i + 1] = arguments[i]
                    }
                    arg[0] = function next(err, returned) {
                        if (err) return self.emit("error", err);
                        arg = returned === undefined ? arg.slice(1) : returned === null ? [] : returned;
                        self.emit.apply(self, args.concat(arg))
                    };
                    parser.apply(self, arg);
                    return true
                }
            }
        }, {}],
        3: [function(_dereq_, module, exports) {
            "use strict";
            var prefix = typeof Object.create !== "function" ? "~" : false;

            function EE(fn, context, once) {
                this.fn = fn;
                this.context = context;
                this.once = once || false
            }

            function EventEmitter() {}
            EventEmitter.prototype._events = undefined;
            EventEmitter.prototype.listeners = function listeners(event, exists) {
                var evt = prefix ? prefix + event : event,
                    available = this._events && this._events[evt];
                if (exists) return !!available;
                if (!available) return [];
                if (available.fn) return [available.fn];
                for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
                    ee[i] = available[i].fn
                }
                return ee
            };
            EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
                var evt = prefix ? prefix + event : event;
                if (!this._events || !this._events[evt]) return false;
                var listeners = this._events[evt],
                    len = arguments.length,
                    args, i;
                if ("function" === typeof listeners.fn) {
                    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
                    switch (len) {
                        case 1:
                            return listeners.fn.call(listeners.context), true;
                        case 2:
                            return listeners.fn.call(listeners.context, a1), true;
                        case 3:
                            return listeners.fn.call(listeners.context, a1, a2), true;
                        case 4:
                            return listeners.fn.call(listeners.context, a1, a2, a3), true;
                        case 5:
                            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
                        case 6:
                            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true
                    }
                    for (i = 1, args = new Array(len - 1); i < len; i++) {
                        args[i - 1] = arguments[i]
                    }
                    listeners.fn.apply(listeners.context, args)
                } else {
                    var length = listeners.length,
                        j;
                    for (i = 0; i < length; i++) {
                        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
                        switch (len) {
                            case 1:
                                listeners[i].fn.call(listeners[i].context);
                                break;
                            case 2:
                                listeners[i].fn.call(listeners[i].context, a1);
                                break;
                            case 3:
                                listeners[i].fn.call(listeners[i].context, a1, a2);
                                break;
                            default:
                                if (!args)
                                    for (j = 1, args = new Array(len - 1); j < len; j++) {
                                        args[j - 1] = arguments[j]
                                    }
                                listeners[i].fn.apply(listeners[i].context, args)
                        }
                    }
                }
                return true
            };
            EventEmitter.prototype.on = function on(event, fn, context) {
                var listener = new EE(fn, context || this),
                    evt = prefix ? prefix + event : event;
                if (!this._events) this._events = prefix ? {} : Object.create(null);
                if (!this._events[evt]) this._events[evt] = listener;
                else {
                    if (!this._events[evt].fn) this._events[evt].push(listener);
                    else this._events[evt] = [this._events[evt], listener]
                }
                return this
            };
            EventEmitter.prototype.once = function once(event, fn, context) {
                var listener = new EE(fn, context || this, true),
                    evt = prefix ? prefix + event : event;
                if (!this._events) this._events = prefix ? {} : Object.create(null);
                if (!this._events[evt]) this._events[evt] = listener;
                else {
                    if (!this._events[evt].fn) this._events[evt].push(listener);
                    else this._events[evt] = [this._events[evt], listener]
                }
                return this
            };
            EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
                var evt = prefix ? prefix + event : event;
                if (!this._events || !this._events[evt]) return this;
                var listeners = this._events[evt],
                    events = [];
                if (fn) {
                    if (listeners.fn) {
                        if (listeners.fn !== fn || once && !listeners.once || context && listeners.context !== context) {
                            events.push(listeners)
                        }
                    } else {
                        for (var i = 0, length = listeners.length; i < length; i++) {
                            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
                                events.push(listeners[i])
                            }
                        }
                    }
                }
                if (events.length) {
                    this._events[evt] = events.length === 1 ? events[0] : events
                } else {
                    delete this._events[evt]
                }
                return this
            };
            EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
                if (!this._events) return this;
                if (event) delete this._events[prefix ? prefix + event : event];
                else this._events = prefix ? {} : Object.create(null);
                return this
            };
            EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
            EventEmitter.prototype.addListener = EventEmitter.prototype.on;
            EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
                return this
            };
            EventEmitter.prefixed = prefix;
            if ("undefined" !== typeof module) {
                module.exports = EventEmitter
            }
        }, {}],
        4: [function(_dereq_, module, exports) {
            "use strict";
            var regex = new RegExp("^((?:\\d+)?\\.?\\d+) *(" + ["milliseconds?", "msecs?", "ms", "seconds?", "secs?", "s", "minutes?", "mins?", "m", "hours?", "hrs?", "h", "days?", "d", "weeks?", "wks?", "w", "years?", "yrs?", "y"].join("|") + ")?$", "i");
            var second = 1e3,
                minute = second * 60,
                hour = minute * 60,
                day = hour * 24,
                week = day * 7,
                year = day * 365;
            module.exports = function millisecond(ms) {
                var type = typeof ms,
                    amount, match;
                if ("number" === type) return ms;
                else if ("string" !== type || "0" === ms || !ms) return 0;
                else if (+ms) return +ms;
                if (ms.length > 1e4 || !(match = regex.exec(ms))) return 0;
                amount = parseFloat(match[1]);
                switch (match[2].toLowerCase()) {
                    case "years":
                    case "year":
                    case "yrs":
                    case "yr":
                    case "y":
                        return amount * year;
                    case "weeks":
                    case "week":
                    case "wks":
                    case "wk":
                    case "w":
                        return amount * week;
                    case "days":
                    case "day":
                    case "d":
                        return amount * day;
                    case "hours":
                    case "hour":
                    case "hrs":
                    case "hr":
                    case "h":
                        return amount * hour;
                    case "minutes":
                    case "minute":
                    case "mins":
                    case "min":
                    case "m":
                        return amount * minute;
                    case "seconds":
                    case "second":
                    case "secs":
                    case "sec":
                    case "s":
                        return amount * second;
                    default:
                        return amount
                }
            }
        }, {}],
        5: [function(_dereq_, module, exports) {
            "use strict";
            module.exports = function one(fn) {
                var called = 0,
                    value;

                function onetime() {
                    if (called) return value;
                    called = 1;
                    value = fn.apply(this, arguments);
                    fn = null;
                    return value
                }
                onetime.displayName = fn.displayName || fn.name || onetime.displayName || onetime.name;
                return onetime
            }
        }, {}],
        6: [function(_dereq_, module, exports) {
            "use strict";
            var has = Object.prototype.hasOwnProperty;

            function querystring(query) {
                var parser = /([^=?&]+)=([^&]*)/g,
                    result = {},
                    part;
                for (; part = parser.exec(query); result[decodeURIComponent(part[1])] = decodeURIComponent(part[2]));
                return result
            }

            function querystringify(obj, prefix) {
                prefix = prefix || "";
                var pairs = [];
                if ("string" !== typeof prefix) prefix = "?";
                for (var key in obj) {
                    if (has.call(obj, key)) {
                        pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
                    }
                }
                return pairs.length ? prefix + pairs.join("&") : ""
            }
            exports.stringify = querystringify;
            exports.parse = querystring
        }, {}],
        7: [function(_dereq_, module, exports) {
            "use strict";
            var EventEmitter = _dereq_("eventemitter3"),
                millisecond = _dereq_("millisecond"),
                destroy = _dereq_("demolish"),
                Tick = _dereq_("tick-tock"),
                one = _dereq_("one-time");

            function defaults(name, selfie, opts) {
                return millisecond(name in opts ? opts[name] : name in selfie ? selfie[name] : Recovery[name])
            }

            function Recovery(options) {
                var recovery = this;
                if (!(recovery instanceof Recovery)) return new Recovery(options);
                options = options || {};
                recovery.attempt = null;
                recovery._fn = null;
                recovery["reconnect timeout"] = defaults("reconnect timeout", recovery, options);
                recovery.retries = defaults("retries", recovery, options);
                recovery.factor = defaults("factor", recovery, options);
                recovery.max = defaults("max", recovery, options);
                recovery.min = defaults("min", recovery, options);
                recovery.timers = new Tick(recovery)
            }
            Recovery.prototype = new EventEmitter;
            Recovery.prototype.constructor = Recovery;
            Recovery["reconnect timeout"] = "30 seconds";
            Recovery.max = Infinity;
            Recovery.min = "500 ms";
            Recovery.retries = 10;
            Recovery.factor = 2;
            Recovery.prototype.reconnect = function reconnect() {
                var recovery = this;
                return recovery.backoff(function backedoff(err, opts) {
                    opts.duration = +new Date - opts.start;
                    if (err) return recovery.emit("reconnect failed", err, opts);
                    recovery.emit("reconnected", opts)
                }, recovery.attempt)
            };
            Recovery.prototype.backoff = function backoff(fn, opts) {
                var recovery = this;
                opts = opts || recovery.attempt || {};
                if (opts.backoff) return recovery;
                opts["reconnect timeout"] = defaults("reconnect timeout", recovery, opts);
                opts.retries = defaults("retries", recovery, opts);
                opts.factor = defaults("factor", recovery, opts);
                opts.max = defaults("max", recovery, opts);
                opts.min = defaults("min", recovery, opts);
                opts.start = +opts.start || +new Date;
                opts.duration = +opts.duration || 0;
                opts.attempt = +opts.attempt || 0;
                if (opts.attempt === opts.retries) {
                    fn.call(recovery, new Error("Unable to recover"), opts);
                    return recovery
                }
                opts.backoff = true;
                opts.attempt++;
                recovery.attempt = opts;
                opts.scheduled = opts.attempt !== 1 ? Math.min(Math.round((Math.random() + 1) * opts.min * Math.pow(opts.factor, opts.attempt - 1)), opts.max) : opts.min;
                recovery.timers.setTimeout("reconnect", function delay() {
                    opts.duration = +new Date - opts.start;
                    opts.backoff = false;
                    recovery.timers.clear("reconnect, timeout");
                    var connect = recovery._fn = one(function connect(err) {
                        recovery.reset();
                        if (err) return recovery.backoff(fn, opts);
                        fn.call(recovery, undefined, opts)
                    });
                    recovery.emit("reconnect", opts, connect);
                    recovery.timers.setTimeout("timeout", function timeout() {
                        var err = new Error("Failed to reconnect in a timely manner");
                        opts.duration = +new Date - opts.start;
                        recovery.emit("reconnect timeout", err, opts);
                        connect(err)
                    }, opts["reconnect timeout"])
                }, opts.scheduled);
                recovery.emit("reconnect scheduled", opts);
                return recovery
            };
            Recovery.prototype.reconnecting = function reconnecting() {
                return !!this.attempt
            };
            Recovery.prototype.reconnected = function reconnected(err) {
                if (this._fn) this._fn(err);
                return this
            };
            Recovery.prototype.reset = function reset() {
                this._fn = this.attempt = null;
                this.timers.clear("reconnect, timeout");
                return this
            };
            Recovery.prototype.destroy = destroy("timers attempt _fn");
            module.exports = Recovery
        }, {
            demolish: 1,
            eventemitter3: 3,
            millisecond: 4,
            "one-time": 5,
            "tick-tock": 9
        }],
        8: [function(_dereq_, module, exports) {
            "use strict";
            module.exports = function required(port, protocol) {
                protocol = protocol.split(":")[0];
                port = +port;
                if (!port) return false;
                switch (protocol) {
                    case "http":
                    case "ws":
                        return port !== 80;
                    case "https":
                    case "wss":
                        return port !== 443;
                    case "ftp":
                        return port !== 21;
                    case "gopher":
                        return port !== 70;
                    case "file":
                        return false
                }
                return port !== 0
            }
        }, {}],
        9: [function(_dereq_, module, exports) {
            "use strict";
            var has = Object.prototype.hasOwnProperty,
                ms = _dereq_("millisecond");

            function Timer(timer, clear, duration, fn) {
                this.start = +new Date;
                this.duration = duration;
                this.clear = clear;
                this.timer = timer;
                this.fns = [fn]
            }
            Timer.prototype.remaining = function remaining() {
                return this.duration - this.taken()
            };
            Timer.prototype.taken = function taken() {
                return +new Date - this.start
            };

            function unsetTimeout(id) {
                clearTimeout(id)
            }

            function unsetInterval(id) {
                clearInterval(id)
            }

            function unsetImmediate(id) {
                clearImmediate(id)
            }

            function Tick(context) {
                if (!(this instanceof Tick)) return new Tick(context);
                this.timers = {};
                this.context = context || this
            }
            Tick.prototype.tock = function ticktock(name, clear) {
                var tock = this;
                return function tickedtock() {
                    if (!(name in tock.timers)) return;
                    var timer = tock.timers[name],
                        fns = timer.fns.slice(),
                        l = fns.length,
                        i = 0;
                    if (clear) tock.clear(name);
                    else tock.start = +new Date;
                    for (; i < l; i++) {
                        fns[i].call(tock.context)
                    }
                }
            };
            Tick.prototype.setTimeout = function timeout(name, fn, time) {
                var tick = this,
                    tock;
                if (tick.timers[name]) {
                    tick.timers[name].fns.push(fn);
                    return tick
                }
                tock = ms(time);
                tick.timers[name] = new Timer(setTimeout(tick.tock(name, true), ms(time)), unsetTimeout, tock, fn);
                return tick
            };
            Tick.prototype.setInterval = function interval(name, fn, time) {
                var tick = this,
                    tock;
                if (tick.timers[name]) {
                    tick.timers[name].fns.push(fn);
                    return tick
                }
                tock = ms(time);
                tick.timers[name] = new Timer(setInterval(tick.tock(name), ms(time)), unsetInterval, tock, fn);
                return tick
            };
            Tick.prototype.setImmediate = function immediate(name, fn) {
                var tick = this;
                if ("function" !== typeof setImmediate) return tick.setTimeout(name, fn, 0);
                if (tick.timers[name]) {
                    tick.timers[name].fns.push(fn);
                    return tick
                }
                tick.timers[name] = new Timer(setImmediate(tick.tock(name, true)), unsetImmediate, 0, fn);
                return tick
            };
            Tick.prototype.active = function active(name) {
                return name in this.timers
            };
            Tick.prototype.clear = function clear() {
                var args = arguments.length ? arguments : [],
                    tick = this,
                    timer, i, l;
                if (args.length === 1 && "string" === typeof args[0]) {
                    args = args[0].split(/[, ]+/)
                }
                if (!args.length) {
                    for (timer in tick.timers) {
                        if (has.call(tick.timers, timer)) args.push(timer)
                    }
                }
                for (i = 0, l = args.length; i < l; i++) {
                    timer = tick.timers[args[i]];
                    if (!timer) continue;
                    timer.clear(timer.timer);
                    timer.fns = timer.timer = timer.clear = null;
                    delete tick.timers[args[i]]
                }
                return tick
            };
            Tick.prototype.adjust = function adjust(name, time) {
                var interval, tick = this,
                    tock = ms(time),
                    timer = tick.timers[name];
                if (!timer) return tick;
                interval = timer.clear === unsetInterval;
                timer.clear(timer.timer);
                timer.start = +new Date;
                timer.duration = tock;
                timer.timer = (interval ? setInterval : setTimeout)(tick.tock(name, !interval), tock);
                return tick
            };
            Tick.prototype.end = Tick.prototype.destroy = function end() {
                if (!this.context) return false;
                this.clear();
                this.context = this.timers = null;
                return true
            };
            Tick.Timer = Timer;
            module.exports = Tick
        }, {
            millisecond: 4
        }],
        10: [function(_dereq_, module, exports) {
            "use strict";
            var required = _dereq_("requires-port"),
                lolcation = _dereq_("./lolcation"),
                qs = _dereq_("querystringify"),
                relativere = /^\/(?!\/)/;
            var instructions = [
                ["#", "hash"],
                ["?", "query"],
                ["//", "protocol", 2, 1, 1],
                ["/", "pathname"],
                ["@", "auth", 1],
                [NaN, "host", undefined, 1, 1],
                [/\:(\d+)$/, "port"],
                [NaN, "hostname", undefined, 1, 1]
            ];

            function URL(address, location, parser) {
                if (!(this instanceof URL)) {
                    return new URL(address, location, parser)
                }
                var relative = relativere.test(address),
                    parse, instruction, index, key, type = typeof location,
                    url = this,
                    i = 0;
                if ("object" !== type && "string" !== type) {
                    parser = location;
                    location = null
                }
                if (parser && "function" !== typeof parser) {
                    parser = qs.parse
                }
                location = lolcation(location);
                for (; i < instructions.length; i++) {
                    instruction = instructions[i];
                    parse = instruction[0];
                    key = instruction[1];
                    if (parse !== parse) {
                        url[key] = address
                    } else if ("string" === typeof parse) {
                        if (~(index = address.indexOf(parse))) {
                            if ("number" === typeof instruction[2]) {
                                url[key] = address.slice(0, index);
                                address = address.slice(index + instruction[2])
                            } else {
                                url[key] = address.slice(index);
                                address = address.slice(0, index)
                            }
                        }
                    } else if (index = parse.exec(address)) {
                        url[key] = index[1];
                        address = address.slice(0, address.length - index[0].length)
                    }
                    url[key] = url[key] || (instruction[3] || "port" === key && relative ? location[key] || "" : "");
                    if (instruction[4]) {
                        url[key] = url[key].toLowerCase()
                    }
                }
                if (parser) url.query = parser(url.query);
                if (!required(url.port, url.protocol)) {
                    url.host = url.hostname;
                    url.port = ""
                }
                url.username = url.password = "";
                if (url.auth) {
                    instruction = url.auth.split(":");
                    url.username = instruction[0] || "";
                    url.password = instruction[1] || ""
                }
                url.href = url.toString()
            }
            URL.prototype.set = function set(part, value, fn) {
                var url = this;
                if ("query" === part) {
                    if ("string" === typeof value && value.length) {
                        value = (fn || qs.parse)(value)
                    }
                    url[part] = value
                } else if ("port" === part) {
                    url[part] = value;
                    if (!required(value, url.protocol)) {
                        url.host = url.hostname;
                        url[part] = ""
                    } else if (value) {
                        url.host = url.hostname + ":" + value
                    }
                } else if ("hostname" === part) {
                    url[part] = value;
                    if (url.port) value += ":" + url.port;
                    url.host = value
                } else if ("host" === part) {
                    url[part] = value;
                    if (/\:\d+/.test(value)) {
                        value = value.split(":");
                        url.hostname = value[0];
                        url.port = value[1]
                    }
                } else {
                    url[part] = value
                }
                url.href = url.toString();
                return url
            };
            URL.prototype.toString = function toString(stringify) {
                if (!stringify || "function" !== typeof stringify) stringify = qs.stringify;
                var query, url = this,
                    result = url.protocol + "//";
                if (url.username) {
                    result += url.username;
                    if (url.password) result += ":" + url.password;
                    result += "@"
                }
                result += url.hostname;
                if (url.port) result += ":" + url.port;
                result += url.pathname;
                query = "object" === typeof url.query ? stringify(url.query) : url.query;
                if (query) result += "?" !== query.charAt(0) ? "?" + query : query;
                if (url.hash) result += url.hash;
                return result
            };
            URL.qs = qs;
            URL.location = lolcation;
            module.exports = URL
        }, {
            "./lolcation": 11,
            querystringify: 6,
            "requires-port": 8
        }],
        11: [function(_dereq_, module, exports) {
            (function(global) {
                "use strict";
                var ignore = {
                        hash: 1,
                        query: 1
                    },
                    URL;
                module.exports = function lolcation(loc) {
                    loc = loc || global.location || {};
                    URL = URL || _dereq_("./");
                    var finaldestination = {},
                        type = typeof loc,
                        key;
                    if ("blob:" === loc.protocol) {
                        finaldestination = new URL(unescape(loc.pathname), {})
                    } else if ("string" === type) {
                        finaldestination = new URL(loc, {});
                        for (key in ignore) delete finaldestination[key]
                    } else if ("object" === type)
                        for (key in loc) {
                            if (key in ignore) continue;
                            finaldestination[key] = loc[key]
                        }
                    return finaldestination
                }
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {
            "./": 10
        }],
        12: [function(_dereq_, module, exports) {
            "use strict";
            var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""),
                length = 64,
                map = {},
                seed = 0,
                i = 0,
                prev;

            function encode(num) {
                var encoded = "";
                do {
                    encoded = alphabet[num % length] + encoded;
                    num = Math.floor(num / length)
                } while (num > 0);
                return encoded
            }

            function decode(str) {
                var decoded = 0;
                for (i = 0; i < str.length; i++) {
                    decoded = decoded * length + map[str.charAt(i)]
                }
                return decoded
            }

            function yeast() {
                var now = encode(+new Date);
                if (now !== prev) return seed = 0, prev = now;
                return now + "." + encode(seed++)
            }
            for (; i < length; i++) map[alphabet[i]] = i;
            yeast.encode = encode;
            yeast.decode = decode;
            module.exports = yeast
        }, {}],
        13: [function(_dereq_, module, exports) {
            "use strict";
            var EventEmitter = _dereq_("eventemitter3"),
                TickTock = _dereq_("tick-tock"),
                Recovery = _dereq_("recovery"),
                qs = _dereq_("querystringify"),
                destroy = _dereq_("demolish"),
                yeast = _dereq_("yeast"),
                u2028 = /\u2028/g,
                u2029 = /\u2029/g;

            function context(self, method) {
                if (self instanceof Primus) return;
                var failure = new Error("Primus#" + method + "'s context should called with a Primus instance");
                if ("function" !== typeof self.listeners || !self.listeners("error").length) {
                    throw failure
                }
                self.emit("error", failure)
            }
            var defaultUrl;
            try {
                if (location.origin) {
                    defaultUrl = location.origin
                } else {
                    defaultUrl = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "")
                }
            } catch (e) {
                defaultUrl = "http://127.0.0.1"
            }

            function Primus(url, options) {
                if (!(this instanceof Primus)) return new Primus(url, options);
                if ("function" !== typeof this.client) {
                    var message = "The client library has not been compiled correctly, " + "see https://github.com/primus/primus#client-library for more details";
                    return this.critical(new Error(message))
                }
                if ("object" === typeof url) {
                    options = url;
                    url = options.url || options.uri || defaultUrl
                } else {
                    options = options || {}
                }
                var primus = this;
                options.queueSize = "queueSize" in options ? options.queueSize : Infinity;
                options.timeout = "timeout" in options ? options.timeout : 1e4;
                options.reconnect = "reconnect" in options ? options.reconnect : {};
                options.ping = "ping" in options ? options.ping : 25e3;
                options.pong = "pong" in options ? options.pong : 1e4;
                options.strategy = "strategy" in options ? options.strategy : [];
                options.transport = "transport" in options ? options.transport : {};
                primus.buffer = [];
                primus.writable = true;
                primus.readable = true;
                primus.url = primus.parse(url || defaultUrl);
                primus.readyState = Primus.CLOSED;
                primus.options = options;
                primus.timers = new TickTock(this);
                primus.socket = null;
                primus.latency = 0;
                primus.disconnect = false;
                primus.transport = options.transport;
                primus.transformers = {
                    outgoing: [],
                    incoming: []
                };
                primus.recovery = new Recovery(options.reconnect);
                if ("string" === typeof options.strategy) {
                    options.strategy = options.strategy.split(/\s?\,\s?/g)
                }
                if (false === options.strategy) {
                    options.strategy = []
                } else if (!options.strategy.length) {
                    options.strategy.push("disconnect", "online");
                    if (!this.authorization) options.strategy.push("timeout")
                }
                options.strategy = options.strategy.join(",").toLowerCase();
                if ("websockets" in options) {
                    primus.AVOID_WEBSOCKETS = !options.websockets
                }
                if ("network" in options) {
                    primus.NETWORK_EVENTS = options.network
                }
                if (!options.manual) primus.timers.setTimeout("open", function open() {
                    primus.timers.clear("open");
                    primus.open()
                }, 0);
                primus.initialise(options)
            }
            Primus.require = function requires(name) {
                if ("function" !== typeof _dereq_) return undefined;
                return !("function" === typeof define && define.amd) ? _dereq_(name) : undefined
            };
            var Stream;
            try {
                Primus.Stream = Stream = Primus.require("stream");
                Primus.require("util").inherits(Primus, Stream)
            } catch (e) {
                Primus.Stream = EventEmitter;
                Primus.prototype = new EventEmitter
            }
            Primus.OPENING = 1;
            Primus.CLOSED = 2;
            Primus.OPEN = 3;
            Primus.prototype.AVOID_WEBSOCKETS = false;
            Primus.prototype.NETWORK_EVENTS = false;
            Primus.prototype.online = true;
            try {
                if (Primus.prototype.NETWORK_EVENTS = "onLine" in navigator && (window.addEventListener || document.body.attachEvent)) {
                    if (!navigator.onLine) {
                        Primus.prototype.online = false
                    }
                }
            } catch (e) {}
            Primus.prototype.ark = {};
            Primus.prototype.emits = _dereq_("emits");
            Primus.prototype.trigger = function trigger() {
                for (var i = 0, l = arguments.length, args = new Array(l); i < l; i++) {
                    args[i] = arguments[i]
                }
                if ("function" !== typeof args[l - 1]) args.push(function defer(next) {
                    setTimeout(next, 0)
                });
                return this.emits.apply(this, args)
            };
            Primus.prototype.plugin = function plugin(name) {
                context(this, "plugin");
                if (name) return this.ark[name];
                var plugins = {};
                for (name in this.ark) {
                    plugins[name] = this.ark[name]
                }
                return plugins
            };
            Primus.prototype.reserved = function reserved(evt) {
                return /^(incoming|outgoing)::/.test(evt) || evt in this.reserved.events
            };
            Primus.prototype.reserved.events = {
                "reconnect scheduled": 1,
                "reconnect timeout": 1,
                readyStateChange: 1,
                "reconnect failed": 1,
                reconnected: 1,
                reconnect: 1,
                offline: 1,
                timeout: 1,
                online: 1,
                error: 1,
                close: 1,
                open: 1,
                data: 1,
                end: 1
            };
            Primus.prototype.initialise = function initialise(options) {
                var primus = this,
                    start;
                primus.recovery.on("reconnected", primus.emits("reconnected")).on("reconnect failed", primus.emits("reconnect failed", function failed(next) {
                    primus.emit("end");
                    next()
                })).on("reconnect timeout", primus.emits("reconnect timeout")).on("reconnect scheduled", primus.emits("reconnect scheduled")).on("reconnect", primus.emits("reconnect", function reconnect(next) {
                    primus.emit("outgoing::reconnect");
                    next()
                }));
                primus.on("outgoing::open", function opening() {
                    var readyState = primus.readyState;
                    primus.readyState = Primus.OPENING;
                    if (readyState !== primus.readyState) {
                        primus.emit("readyStateChange", "opening")
                    }
                    start = +new Date
                });
                primus.on("incoming::open", function opened() {
                    var readyState = primus.readyState;
                    if (primus.recovery.reconnecting()) {
                        primus.recovery.reconnected()
                    }
                    primus.writable = true;
                    primus.readable = true;
                    if (!primus.online) {
                        primus.online = true;
                        primus.emit("online")
                    }
                    primus.readyState = Primus.OPEN;
                    if (readyState !== primus.readyState) {
                        primus.emit("readyStateChange", "open")
                    }
                    primus.latency = +new Date - start;
                    primus.timers.clear("ping", "pong");
                    primus.heartbeat();
                    if (primus.buffer.length) {
                        var data = primus.buffer.slice(),
                            length = data.length,
                            i = 0;
                        primus.buffer.length = 0;
                        for (; i < length; i++) {
                            primus._write(data[i])
                        }
                    }
                    primus.emit("open")
                });
                primus.on("incoming::pong", function pong(time) {
                    primus.online = true;
                    primus.timers.clear("pong");
                    primus.heartbeat();
                    primus.latency = +new Date - time
                });
                primus.on("incoming::error", function error(e) {
                    var connect = primus.timers.active("connect"),
                        err = e;
                    if ("string" === typeof e) {
                        err = new Error(e)
                    } else if (!(e instanceof Error) && "object" === typeof e) {
                        err = new Error(e.message || e.reason);
                        for (var key in e) {
                            if (Object.prototype.hasOwnProperty.call(e, key)) err[key] = e[key]
                        }
                    }
                    if (primus.recovery.reconnecting()) return primus.recovery.reconnected(err);
                    if (primus.listeners("error").length) primus.emit("error", err);
                    if (connect) {
                        if (~primus.options.strategy.indexOf("timeout")) {
                            primus.recovery.reconnect()
                        } else {
                            primus.end()
                        }
                    }
                });
                primus.on("incoming::data", function message(raw) {
                    primus.decoder(raw, function decoding(err, data) {
                        if (err) return primus.listeners("error").length && primus.emit("error", err);
                        if (primus.protocol(data)) return;
                        primus.transforms(primus, primus, "incoming", data, raw)
                    })
                });
                primus.on("incoming::end", function end() {
                    var readyState = primus.readyState;
                    if (primus.disconnect) {
                        primus.disconnect = false;
                        return primus.end()
                    }
                    primus.readyState = Primus.CLOSED;
                    if (readyState !== primus.readyState) {
                        primus.emit("readyStateChange", "end")
                    }
                    if (primus.timers.active("connect")) primus.end();
                    if (readyState !== Primus.OPEN) {
                        return primus.recovery.reconnecting() ? primus.recovery.reconnect() : false
                    }
                    this.writable = false;
                    this.readable = false;
                    this.timers.clear();
                    primus.emit("close");
                    if (~primus.options.strategy.indexOf("disconnect")) {
                        return primus.recovery.reconnect()
                    }
                    primus.emit("outgoing::end");
                    primus.emit("end")
                });
                primus.client();
                for (var plugin in primus.ark) {
                    primus.ark[plugin].call(primus, primus, options)
                }
                if (!primus.NETWORK_EVENTS) return primus;
                primus.offlineHandler = function offline() {
                    if (!primus.online) return;
                    primus.online = false;
                    primus.emit("offline");
                    primus.end();
                    primus.recovery.reset()
                };
                primus.onlineHandler = function online() {
                    if (primus.online) return;
                    primus.online = true;
                    primus.emit("online");
                    if (~primus.options.strategy.indexOf("online")) {
                        primus.recovery.reconnect()
                    }
                };
                if (window.addEventListener) {
                    window.addEventListener("offline", primus.offlineHandler, false);
                    window.addEventListener("online", primus.onlineHandler, false)
                } else if (document.body.attachEvent) {
                    document.body.attachEvent("onoffline", primus.offlineHandler);
                    document.body.attachEvent("ononline", primus.onlineHandler)
                }
                return primus
            };
            Primus.prototype.protocol = function protocol(msg) {
                if ("string" !== typeof msg || msg.indexOf("primus::") !== 0) return false;
                var last = msg.indexOf(":", 8),
                    value = msg.slice(last + 2);
                switch (msg.slice(8, last)) {
                    case "pong":
                        this.emit("incoming::pong", +value);
                        break;
                    case "server":
                        if ("close" === value) {
                            this.disconnect = true
                        }
                        break;
                    case "id":
                        this.emit("incoming::id", value);
                        break;
                    default:
                        return false
                }
                return true
            };
            Primus.prototype.transforms = function transforms(primus, connection, type, data, raw) {
                var packet = {
                        data: data
                    },
                    fns = primus.transformers[type];
                (function transform(index, done) {
                    var transformer = fns[index++];
                    if (!transformer) return done();
                    if (1 === transformer.length) {
                        if (false === transformer.call(connection, packet)) {
                            return
                        }
                        return transform(index, done)
                    }
                    transformer.call(connection, packet, function finished(err, arg) {
                        if (err) return connection.emit("error", err);
                        if (false === arg) return;
                        transform(index, done)
                    })
                })(0, function done() {
                    if ("incoming" === type) return connection.emit("data", packet.data, raw);
                    connection._write(packet.data)
                });
                return this
            };
            Primus.prototype.id = function id(fn) {
                if (this.socket && this.socket.id) return fn(this.socket.id);
                this._write("primus::id::");
                return this.once("incoming::id", fn)
            };
            Primus.prototype.open = function open() {
                context(this, "open");
                if (!this.recovery.reconnecting() && this.options.timeout) this.timeout();
                this.emit("outgoing::open");
                return this
            };
            Primus.prototype.write = function write(data) {
                context(this, "write");
                this.transforms(this, this, "outgoing", data);
                return true
            };
            Primus.prototype._write = function write(data) {
                var primus = this;
                if (Primus.OPEN !== primus.readyState) {
                    if (this.buffer.length === this.options.queueSize) {
                        this.buffer.splice(0, 1)
                    }
                    this.buffer.push(data);
                    return false
                }
                primus.encoder(data, function encoded(err, packet) {
                    if (err) return primus.listeners("error").length && primus.emit("error", err);
                    if ("string" === typeof packet) {
                        if (~packet.indexOf("\u2028")) packet = packet.replace(u2028, "\\u2028");
                        if (~packet.indexOf("\u2029")) packet = packet.replace(u2029, "\\u2029")
                    }
                    primus.emit("outgoing::data", packet)
                });
                return true
            };
            Primus.prototype.heartbeat = function heartbeat() {
                var primus = this;
                if (!primus.options.ping) return primus;

                function pong() {
                    primus.timers.clear("pong");
                    if (!primus.online) return;
                    primus.online = false;
                    primus.emit("offline");
                    primus.emit("incoming::end")
                }

                function ping() {
                    var value = +new Date;
                    primus.timers.clear("ping");
                    primus._write("primus::ping::" + value);
                    primus.emit("outgoing::ping", value);
                    primus.timers.setTimeout("pong", pong, primus.options.pong)
                }
                primus.timers.setTimeout("ping", ping, primus.options.ping);
                return this
            };
            Primus.prototype.timeout = function timeout() {
                var primus = this;

                function remove() {
                    primus.removeListener("error", remove).removeListener("open", remove).removeListener("end", remove).timers.clear("connect")
                }
                primus.timers.setTimeout("connect", function expired() {
                    remove();
                    if (primus.readyState === Primus.OPEN || primus.recovery.reconnecting()) {
                        return
                    }
                    primus.emit("timeout");
                    if (~primus.options.strategy.indexOf("timeout")) {
                        primus.recovery.reconnect()
                    } else {
                        primus.end()
                    }
                }, primus.options.timeout);
                return primus.on("error", remove).on("open", remove).on("end", remove)
            };
            Primus.prototype.end = function end(data) {
                context(this, "end");
                if (this.readyState === Primus.CLOSED && !this.timers.active("connect") && !this.timers.active("open")) {
                    if (this.recovery.reconnecting()) {
                        this.recovery.reset();
                        this.emit("end")
                    }
                    return this
                }
                if (data !== undefined) this.write(data);
                this.writable = false;
                this.readable = false;
                var readyState = this.readyState;
                this.readyState = Primus.CLOSED;
                if (readyState !== this.readyState) {
                    this.emit("readyStateChange", "end")
                }
                this.timers.clear();
                this.emit("outgoing::end");
                this.emit("close");
                this.emit("end");
                return this
            };
            Primus.prototype.destroy = destroy("url timers options recovery socket transport transformers", {
                before: "end",
                after: ["removeAllListeners", function detach() {
                    if (!this.NETWORK_EVENTS) return;
                    if (window.addEventListener) {
                        window.removeEventListener("offline", this.offlineHandler);
                        window.removeEventListener("online", this.onlineHandler)
                    } else if (document.body.attachEvent) {
                        document.body.detachEvent("onoffline", this.offlineHandler);
                        document.body.detachEvent("ononline", this.onlineHandler)
                    }
                }]
            });
            Primus.prototype.clone = function clone(obj) {
                return this.merge({}, obj)
            };
            Primus.prototype.merge = function merge(target) {
                var args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, l = args.length, key, obj; i < l; i++) {
                    obj = args[i];
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) target[key] = obj[key]
                    }
                }
                return target
            };
            Primus.prototype.parse = _dereq_("url-parse");
            Primus.prototype.querystring = qs.parse;
            Primus.prototype.querystringify = qs.stringify;
            Primus.prototype.uri = function uri(options) {
                var url = this.url,
                    server = [],
                    qsa = false;
                if (options.query) qsa = true;
                options = options || {};
                options.protocol = "protocol" in options ? options.protocol : "http:";
                options.query = url.query && qsa ? url.query.slice(1) : false;
                options.secure = "secure" in options ? options.secure : url.protocol === "https:" || url.protocol === "wss:";
                options.auth = "auth" in options ? options.auth : url.auth;
                options.pathname = "pathname" in options ? options.pathname : this.pathname;
                options.port = "port" in options ? +options.port : +url.port || (options.secure ? 443 : 80);
                this.emit("outgoing::url", options);
                var querystring = this.querystring(options.query || "");
                querystring._primuscb = yeast();
                options.query = this.querystringify(querystring);
                server.push(options.secure ? options.protocol.replace(":", "s:") : options.protocol, "");
                server.push(options.auth ? options.auth + "@" + url.host : url.host);
                if (options.pathname) server.push(options.pathname.slice(1));
                if (qsa) server.push("?" + options.query);
                else delete options.query;
                if (options.object) return options;
                return server.join("/")
            };
            Primus.prototype.transform = function transform(type, fn) {
                context(this, "transform");
                if (!(type in this.transformers)) {
                    return this.critical(new Error("Invalid transformer type"))
                }
                this.transformers[type].push(fn);
                return this
            };
            Primus.prototype.critical = function critical(err) {
                if (this.listeners("error").length) {
                    this.emit("error", err);
                    return this
                }
                throw err
            };
            Primus.connect = function connect(url, options) {
                return new Primus(url, options)
            };
            Primus.EventEmitter = EventEmitter;
            Primus.prototype.client = function client() {
                var primus = this,
                    socket;
                var Factory = function factory() {
                    if ("undefined" !== typeof WebSocket) return WebSocket;
                    if ("undefined" !== typeof MozWebSocket) return MozWebSocket;
                    try {
                        return Primus.require("ws")
                    } catch (e) {}
                    return undefined
                }();
                if (!Factory) return primus.critical(new Error("Missing required `ws` module. Please run `npm install --save ws`"));
                primus.on("outgoing::open", function opening() {
                    primus.emit("outgoing::end");
                    try {
                        var prot = primus.url.protocol === "ws+unix:" ? "ws+unix:" : "ws:",
                            qsa = prot === "ws:";
                        if (Factory.length === 3) {
                            primus.socket = socket = new Factory(primus.uri({
                                protocol: prot,
                                query: qsa
                            }), [], primus.transport)
                        } else {
                            primus.socket = socket = new Factory(primus.uri({
                                protocol: prot,
                                query: qsa
                            }))
                        }
                    } catch (e) {
                        return primus.emit("error", e)
                    }
                    socket.binaryType = "arraybuffer";
                    socket.onopen = primus.trigger("incoming::open");
                    socket.onerror = primus.trigger("incoming::error");
                    socket.onclose = primus.trigger("incoming::end");
                    socket.onmessage = primus.trigger("incoming::data", function parse(next, evt) {
                        setTimeout(function defer() {
                            next(undefined, evt.data)
                        }, 0)
                    })
                });
                primus.on("outgoing::data", function write(message) {
                    if (!socket || socket.readyState !== Factory.OPEN) return;
                    try {
                        socket.send(message)
                    } catch (e) {
                        primus.emit("incoming::error", e)
                    }
                });
                primus.on("outgoing::reconnect", function reconnect() {
                    primus.emit("outgoing::open")
                });
                primus.on("outgoing::end", function close() {
                    if (!socket) return;
                    socket.onerror = socket.onopen = socket.onclose = socket.onmessage = function() {};
                    socket.close();
                    socket = null
                })
            };
            Primus.prototype.authorization = false;
            Primus.prototype.pathname = "/m.io";
            Primus.prototype.encoder = function(data, fn) {
                return fn(null, data)
            };
            Primus.prototype.decoder = function(data, fn) {
                return fn(null, data)
            };
            Primus.prototype.version = "4.0.4";
            if ("undefined" !== typeof document && "undefined" !== typeof navigator) {
                if (document.addEventListener) {
                    document.addEventListener("keydown", function keydown(e) {
                        if (e.keyCode !== 27 || !e.preventDefault) return;
                        e.preventDefault()
                    }, false)
                }
                var ua = (navigator.userAgent || "").toLowerCase(),
                    parsed = ua.match(/.+(?:rv|it|ra|ie)[\/: ](\d+)\.(\d+)(?:\.(\d+))?/) || [],
                    version = +[parsed[1], parsed[2]].join(".");
                if (!~ua.indexOf("chrome") && ~ua.indexOf("safari") && version < 534.54) {
                    Primus.prototype.AVOID_WEBSOCKETS = true
                }
            }
            module.exports = Primus
        }, {
            demolish: 1,
            emits: 2,
            eventemitter3: 3,
            querystringify: 6,
            recovery: 7,
            "tick-tock": 9,
            "url-parse": 10,
            yeast: 12
        }]
    }, {}, [13])(13);
    return Primus
});
(function(p, c, n) {
    "use strict";

    function l(b, a, g) {
        var d = g.baseHref(),
            k = b[0];
        return function(b, e, f) {
            var g, h;
            f = f || {};
            h = f.expires;
            g = c.isDefined(f.path) ? f.path : d;
            c.isUndefined(e) && (h = "Thu, 01 Jan 1970 00:00:00 GMT", e = "");
            c.isString(h) && (h = new Date(h));
            e = encodeURIComponent(b) + "=" + encodeURIComponent(e);
            e = e + (g ? ";path=" + g : "") + (f.domain ? ";domain=" + f.domain : "");
            e += h ? ";expires=" + h.toUTCString() : "";
            e += f.secure ? ";secure" : "";
            f = e.length + 1;
            4096 < f && a.warn("Cookie '" + b + "' possibly not set or overflowed because it was too large (" + f + " > 4096 bytes)!");
            k.cookie = e
        }
    }
    c.module("ngCookies", ["ng"]).provider("$cookies", [function() {
        var b = this.defaults = {};
        this.$get = ["$$cookieReader", "$$cookieWriter", function(a, g) {
            return {
                get: function(d) {
                    return a()[d]
                },
                getObject: function(d) {
                    return (d = this.get(d)) ? c.fromJson(d) : d
                },
                getAll: function() {
                    return a()
                },
                put: function(d, a, m) {
                    g(d, a, m ? c.extend({}, b, m) : b)
                },
                putObject: function(d, b, a) {
                    this.put(d, c.toJson(b), a)
                },
                remove: function(a, k) {
                    g(a, n, k ? c.extend({}, b, k) : b)
                }
            }
        }]
    }]);
    c.module("ngCookies").factory("$cookieStore", ["$cookies", function(b) {
        return {
            get: function(a) {
                return b.getObject(a)
            },
            put: function(a, c) {
                b.putObject(a, c)
            },
            remove: function(a) {
                b.remove(a)
            }
        }
    }]);
    l.$inject = ["$document", "$log", "$browser"];
    c.module("ngCookies").provider("$$cookieWriter", function() {
        this.$get = l
    })
})(window, window.angular);
var app;
window._emotes = {
    ":)": "happy",
    ":(": "sad",
    ":o": "surprised",
    ":|": "meh",
    ":p": "tongue",
    ":@": "cthulhu",
    "o.o": "eyes",
    o_o: "eyes",
    zzz: "dreamer",
    "-@": "jack",
    ":3": "candy",
    ";)": "wink",
    ":bats:": "bats",
    ":boar:": "boar",
    ":rip:": "rip",
    "&lt;3": "heart",
    ":wolf:": "wolf",
    ":bunny:": "bunny",
    ":ghost:": "ghost",
    ":snake:": "snake",
    ":knife:": "knife",
    ":doge:": "doge",
    ":star:": "star",
    ":rainbow:": "rainbow",
    ":horse:": "horse",
    ":mermaid:": "mermaid",
    ":rose:": "rose",
    ":bump:": "bump",
    ":clock:": "clock",
    ";-;": "cry",
    ";_;": "cry",
    ":cookie:": "cookie",
    ":hammer:": "hammer",
    ":panda:": "panda",
    ":penguin:": "penguin",
    ":pizza:": "pizza",
    ":sheep:": "sheep",
    ":shotgun:": "shotgun",
    ":tiger:": "tiger",
    ":unicorn:": "unicorn",
    ":wolf:": "wolf",
    ":cupcake:": "cupcake",
    ":cat:": "cat",
    ":fox:": "fox",
    ":turkey:": "turkey",
    ":santa:": "santa",
    ":christmas:": "christmas",
    ":snowman:": "snowman",
    ":candycane:": "candycane",
    ":lion:": "lion",
    ":cake:": "cake"
};
window._user_emotes = {};
app = angular.module("emoteFilter", []);
app.filter("emotify", ["$sce", function($sce) {
    return function(text, user) {
        var custom_obj, custom_user_obj, i, len, obj, r, replace_fnc, rgx, user_obj;
        if (user == null) {
            user = null
        }
        obj = window._emotes || {};
        user_obj = window._user_emotes || {};
        custom_obj = window._custom_emotes || {};
        custom_user_obj = user && user_obj[user];
        rgx = [/(\s|^)(?::\)|:\(|:\||:o|:p|:@|:3|;\))(?!\S)/gi, /(\s|^)(o[\.|_]o|zzz)(?!\S)/gi, /(\s|^)(;[\-_];)(?!\S)/gi, /(\s|^)(-@)(?!\S)/gi, /:([a-zA-Z]*):/gi, /&lt;3/g];
        replace_fnc = function(substring, match, nextMatch) {
            var e, m;
            m = substring.trim().toLowerCase();
            if (custom_user_obj && (e = custom_user_obj[m])) {
                return " <img class='custom-user-emote' src='" + e + "'/>"
            } else if (e = custom_obj[m]) {
                return " <img class='custom-emote' src='" + e + "'/>"
            } else if (e = obj[m]) {
                return " <span class='emote emote-" + e + "'></span> "
            } else {
                return substring
            }
        };
        for (i = 0, len = rgx.length; i < len; i++) {
            r = rgx[i];
            text = text.replace(r, replace_fnc)
        }
        text = $sce.trustAsHtml(text);
        return text
    }
}]);
$(function() {
    $(document).on("click", ".voteinput", function() {
        var cb, current_val, customerror, id, ratectrl, self, table, val;
        customerror = $(this).data("error");
        cb = $(this).data("cb");
        ratectrl = $(this).closest(".ratectrl");
        table = ratectrl.data("t");
        id = ratectrl.data("i");
        val = $(this).data("val");
        self = this;
        current_val = parseInt(ratectrl.siblings(".ratetext").find("span").text());
        val = $(this).hasClass("sel") ? 0 : parseInt($(this).data("val"));
        $.ajax({
            url: "/vote/" + table + "/" + id,
            type: "post",
            dataType: "json",
            data: {
                val: val
            },
            success: function(_this) {
                return function(o) {
                    var changed_val, data, num_str, span, status;
                    status = o[0], data = o[1];
                    if (status) {
                        changed_val = data + current_val;
                        num_str = changed_val > 0 ? "+" + changed_val : changed_val.toString();
                        span = ratectrl.siblings(".ratetext").find("span");
                        span.text(num_str);
                        span.removeClass("red").removeClass("green");
                        if (changed_val > 0) {
                            span.addClass("green")
                        } else if (changed_val < 0) {
                            span.addClass("red")
                        }
                        ratectrl.find("a").removeClass("sel");
                        if (val !== 0) {
                            $(self).addClass("sel")
                        }
                        return delete window._tooltip_cache["voteObject:" + table + ":" + id]
                    } else {
                        return window.errordisplay(customerror || ".naverror", data)
                    }
                }
            }(this)
        });
        return false
    });
    return window.loadvote("[id^=votebox_]")
});
window.loadvote = function(sel, t, i, data) {
    if (data == null) {
        data = {}
    }
    return $(sel).each(function() {
        var id, table, under;
        under = $(this).attr("id").split("_");
        table = t != null ? t : under[1];
        id = i != null ? i : under[2];
        console.log(sel, t, i, data, under, table, id)
        console.log("sel")
        if (table && id) {
            return $(this).html("").load("/vote/find/" + table + "/" + id, data)
        }
    })
};
(function(G) {
    function $($, pa) {
        function aa(a) {
            return c.preferFlash && t && !c.ignoreFlash && void 0 !== c.flash[a] && c.flash[a]
        }

        function q(a) {
            return function(d) {
                var e = this._s;
                !e || !e._a ? (e && e.id ? c._wD(l + "ignoring " + d.type + ": " + e.id) : c._wD(l + "ignoring " + d.type), d = null) : d = a.call(this, d);
                return d
            }
        }
        this.setupOptions = {
            url: $ || null,
            flashVersion: 8,
            debugMode: !0,
            debugFlash: !1,
            useConsole: !0,
            consoleOnly: !0,
            waitForWindowLoad: !1,
            bgColor: "#ffffff",
            useHighPerformance: !1,
            flashPollingInterval: null,
            html5PollingInterval: null,
            flashLoadTimeout: 1e3,
            wmode: null,
            allowScriptAccess: "always",
            useFlashBlock: !1,
            useHTML5Audio: !0,
            html5Test: /^(probably|maybe)$/i,
            preferFlash: !0,
            noSWFCache: !1
        };
        this.defaultOptions = {
            autoLoad: !1,
            autoPlay: !1,
            from: null,
            loops: 1,
            onid3: null,
            onload: null,
            whileloading: null,
            onplay: null,
            onpause: null,
            onresume: null,
            whileplaying: null,
            onposition: null,
            onstop: null,
            onfailure: null,
            onfinish: null,
            multiShot: !0,
            multiShotEvents: !1,
            position: null,
            pan: 0,
            stream: !0,
            to: null,
            type: null,
            usePolicyFile: !1,
            volume: 100
        };
        this.flash9Options = {
            isMovieStar: null,
            usePeakData: !1,
            useWaveformData: !1,
            useEQData: !1,
            onbufferchange: null,
            ondataerror: null
        };
        this.movieStarOptions = {
            bufferTime: 3,
            serverURL: null,
            onconnect: null,
            duration: null
        };
        this.audioFormats = {
            mp3: {
                type: ['audio/mpeg; codecs="mp3"', "audio/mpeg", "audio/mp3", "audio/MPA", "audio/mpa-robust"],
                required: !0
            },
            mp4: {
                related: ["aac", "m4a", "m4b"],
                type: ['audio/mp4; codecs="mp4a.40.2"', "audio/aac", "audio/x-m4a", "audio/MP4A-LATM", "audio/mpeg4-generic"],
                required: !1
            },
            ogg: {
                type: ["audio/ogg; codecs=vorbis"],
                required: !1
            },
            wav: {
                type: ['audio/wav; codecs="1"', "audio/wav", "audio/wave", "audio/x-wav"],
                required: !1
            }
        };
        this.movieID = "sm2-container";
        this.id = pa || "sm2movie";
        this.debugID = "soundmanager-debug";
        this.debugURLParam = /([#?&])debug=1/i;
        this.versionNumber = "V2.97a.20121104";
        this.altURL = this.movieURL = this.version = null;
        this.enabled = this.swfLoaded = !1;
        this.oMC = null;
        this.sounds = {};
        this.soundIDs = [];
        this.didFlashBlock = this.muted = !1;
        this.filePattern = null;
        this.filePatterns = {
            flash8: /\.mp3(\?.*)?$/i,
            flash9: /\.mp3(\?.*)?$/i
        };
        this.features = {
            buffering: !1,
            peakData: !1,
            waveformData: !1,
            eqData: !1,
            movieStar: !1
        };
        this.sandbox = {
            type: null,
            types: {
                remote: "remote (domain-based) rules",
                localWithFile: "local with file access (no internet access)",
                localWithNetwork: "local with network (internet access only, no local access)",
                localTrusted: "local, trusted (local+internet access)"
            },
            description: null,
            noRemote: null,
            noLocal: null
        };
        this.html5 = {
            usingFlash: null
        };
        this.flash = {};
        this.ignoreFlash = this.html5Only = !1;
        var La, c = this,
            Ma = null,
            g = null,
            l = "HTML5::",
            A, u = navigator.userAgent,
            i = G,
            R = i.location.href.toString(),
            j = document,
            qa, Na, ra, k, D = [],
            sa = !0,
            y, S = !1,
            T = !1,
            n = !1,
            v = !1,
            ba = !1,
            m, jb = 0,
            U, w, ta, I, ua, J, K, L, Oa, va, ca, da, ea, M, wa, V, fa, ga, N, Pa, xa, kb = ["log", "info", "warn", "error"],
            Qa, ha, Ra, W = null,
            ya = null,
            p, za, O, Sa, ia, ja, P, s, X = !1,
            Aa = !1,
            Ta, Ua, Va, ka = 0,
            Y = null,
            la, B = null,
            Wa, ma, Z, E, Ba, Ca, Xa, r, Ya = Array.prototype.slice,
            H = !1,
            Za, t, Da, $a, C, ab, Ea = u.match(/(ipad|iphone|ipod)/i),
            F = u.match(/msie/i),
            lb = u.match(/webkit/i),
            Fa = u.match(/safari/i) && !u.match(/chrome/i),
            Ga = u.match(/opera/i),
            Ha = u.match(/(mobile|pre\/|xoom)/i) || Ea,
            Ia = !R.match(/usehtml5audio/i) && !R.match(/sm2\-ignorebadua/i) && Fa && !u.match(/silk/i) && u.match(/OS X 10_6_([3-7])/i),
            bb = void 0 !== G.console && void 0 !== console.log,
            Ja = void 0 !== j.hasFocus ? j.hasFocus() : null,
            na = Fa && (void 0 === j.hasFocus || !j.hasFocus()),
            cb = !na,
            db = /(mp3|mp4|mpa|m4a|m4b)/i,
            Q = j.location ? j.location.protocol.match(/http/i) : null,
            eb = !Q ? "http://" : "",
            fb = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
            gb = "mpeg4 aac flv mov mp4 m4v f4v m4a m4b mp4v 3gp 3g2".split(" "),
            mb = RegExp("\\.(" + gb.join("|") + ")(\\?.*)?$", "i");
        this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;
        this.useAltURL = !Q;
        Ha && (c.useHTML5Audio = !0, c.preferFlash = !1, Ea && (H = c.ignoreFlash = !0));
        var Ka;
        try {
            Ka = void 0 !== Audio && void 0 !== (Ga && void 0 !== opera && 10 > opera.version() ? new Audio(null) : new Audio).canPlayType
        } catch (ob) {
            Ka = !1
        }
        this.hasHTML5 = Ka;
        this.setup = function(a) {
            var d = !c.url;
            void 0 !== a && n && B && c.ok() && (void 0 !== a.flashVersion || void 0 !== a.url) && P(p("setupLate"));
            ta(a);
            d && V && void 0 !== a.url && c.beginDelayedInit();
            !V && void 0 !== a.url && "complete" === j.readyState && setTimeout(M, 1);
            return c
        };
        this.supported = this.ok = function() {
            return B ? n && !v : c.useHTML5Audio && c.hasHTML5
        };
        this.getMovie = function(c) {
            return A(c) || j[c] || i[c]
        };
        this.createSound = function(a, d) {
            function e() {
                f = ia(f);
                c.sounds[f.id] = new La(f);
                c.soundIDs.push(f.id);
                return c.sounds[f.id]
            }
            var b, f;
            b = null;
            b = "soundManager.createSound(): " + p(!n ? "notReady" : "notOK");
            if (!n || !c.ok()) return P(b), !1;
            void 0 !== d && (a = {
                id: a,
                url: d
            });
            f = w(a);
            f.url = la(f.url);
            f.id.toString().charAt(0).match(/^[0-9]$/) && c._wD("soundManager.createSound(): " + p("badID", f.id), 2);
            c._wD("soundManager.createSound(): " + f.id + " (" + f.url + ")", 1);
            if (s(f.id, !0)) return c._wD("soundManager.createSound(): " + f.id + " exists", 1), c.sounds[f.id];
            ma(f) ? (b = e(), c._wD("Creating sound " + f.id + ", using HTML5"), b._setup_html5(f)) : (8 < k && (null === f.isMovieStar && (f.isMovieStar = !(!f.serverURL && !(f.type && f.type.match(fb) || f.url.match(mb)))), f.isMovieStar && (c._wD("soundManager.createSound(): using MovieStar handling"), 1 < f.loops && m("noNSLoop"))), f = ja(f, "soundManager.createSound(): "), b = e(), 8 === k ? g._createSound(f.id, f.loops || 1, f.usePolicyFile) : (g._createSound(f.id, f.url, f.usePeakData, f.useWaveformData, f.useEQData, f.isMovieStar, f.isMovieStar ? f.bufferTime : !1, f.loops || 1, f.serverURL, f.duration || null, f.autoPlay, !0, f.autoLoad, f.usePolicyFile), f.serverURL || (b.connected = !0, f.onconnect && f.onconnect.apply(b))), !f.serverURL && (f.autoLoad || f.autoPlay) && b.load(f));
            !f.serverURL && f.autoPlay && b.play();
            return b
        };
        this.destroySound = function(a, d) {
            if (!s(a)) return !1;
            var e = c.sounds[a],
                b;
            e._iO = {};
            e.stop();
            e.unload();
            for (b = 0; b < c.soundIDs.length; b++)
                if (c.soundIDs[b] === a) {
                    c.soundIDs.splice(b, 1);
                    break
                }
            d || e.destruct(!0);
            delete c.sounds[a];
            return !0
        };
        this.load = function(a, d) {
            return !s(a) ? !1 : c.sounds[a].load(d)
        };
        this.unload = function(a) {
            return !s(a) ? !1 : c.sounds[a].unload()
        };
        this.onposition = this.onPosition = function(a, d, e, b) {
            return !s(a) ? !1 : c.sounds[a].onposition(d, e, b)
        };
        this.clearOnPosition = function(a, d, e) {
            return !s(a) ? !1 : c.sounds[a].clearOnPosition(d, e)
        };
        this.start = this.play = function(a, d) {
            var e = !1;
            return !n || !c.ok() ? (P("soundManager.play(): " + p(!n ? "notReady" : "notOK")), e) : !s(a) ? (d instanceof Object || (d = {
                url: d
            }), d && d.url && (c._wD('soundManager.play(): attempting to create "' + a + '"', 1), d.id = a, e = c.createSound(d).play()), e) : c.sounds[a].play(d)
        };
        this.setPosition = function(a, d) {
            return !s(a) ? !1 : c.sounds[a].setPosition(d)
        };
        this.stop = function(a) {
            if (!s(a)) return !1;
            c._wD("soundManager.stop(" + a + ")", 1);
            return c.sounds[a].stop()
        };
        this.stopAll = function() {
            var a;
            c._wD("soundManager.stopAll()", 1);
            for (a in c.sounds) c.sounds.hasOwnProperty(a) && c.sounds[a].stop()
        };
        this.pause = function(a) {
            return !s(a) ? !1 : c.sounds[a].pause()
        };
        this.pauseAll = function() {
            var a;
            for (a = c.soundIDs.length - 1; 0 <= a; a--) c.sounds[c.soundIDs[a]].pause()
        };
        this.resume = function(a) {
            return !s(a) ? !1 : c.sounds[a].resume()
        };
        this.resumeAll = function() {
            var a;
            for (a = c.soundIDs.length - 1; 0 <= a; a--) c.sounds[c.soundIDs[a]].resume()
        };
        this.togglePause = function(a) {
            return !s(a) ? !1 : c.sounds[a].togglePause()
        };
        this.setPan = function(a, d) {
            return !s(a) ? !1 : c.sounds[a].setPan(d)
        };
        this.setVolume = function(a, d) {
            return !s(a) ? !1 : c.sounds[a].setVolume(d)
        };
        this.mute = function(a) {
            var d = 0;
            a instanceof String && (a = null);
            if (a) {
                if (!s(a)) return !1;
                c._wD('soundManager.mute(): Muting "' + a + '"');
                return c.sounds[a].mute()
            }
            c._wD("soundManager.mute(): Muting all sounds");
            for (d = c.soundIDs.length - 1; 0 <= d; d--) c.sounds[c.soundIDs[d]].mute();
            return c.muted = !0
        };
        this.muteAll = function() {
            c.mute()
        };
        this.unmute = function(a) {
            a instanceof String && (a = null);
            if (a) {
                if (!s(a)) return !1;
                c._wD('soundManager.unmute(): Unmuting "' + a + '"');
                return c.sounds[a].unmute()
            }
            c._wD("soundManager.unmute(): Unmuting all sounds");
            for (a = c.soundIDs.length - 1; 0 <= a; a--) c.sounds[c.soundIDs[a]].unmute();
            c.muted = !1;
            return !0
        };
        this.unmuteAll = function() {
            c.unmute()
        };
        this.toggleMute = function(a) {
            return !s(a) ? !1 : c.sounds[a].toggleMute()
        };
        this.getMemoryUse = function() {
            var c = 0;
            g && 8 !== k && (c = parseInt(g._getMemoryUse(), 10));
            return c
        };
        this.disable = function(a) {
            var d;
            void 0 === a && (a = !1);
            if (v) return !1;
            v = !0;
            m("shutdown", 1);
            for (d = c.soundIDs.length - 1; 0 <= d; d--) Qa(c.sounds[c.soundIDs[d]]);
            U(a);
            r.remove(i, "load", K);
            return !0
        };
        this.canPlayMIME = function(a) {
            var d;
            c.hasHTML5 && (d = Z({
                type: a
            }));
            !d && B && (d = a && c.ok() ? !!(8 < k && a.match(fb) || a.match(c.mimePattern)) : null);
            return d
        };
        this.canPlayURL = function(a) {
            var d;
            c.hasHTML5 && (d = Z({
                url: a
            }));
            !d && B && (d = a && c.ok() ? !!a.match(c.filePattern) : null);
            return d
        };
        this.canPlayLink = function(a) {
            return void 0 !== a.type && a.type && c.canPlayMIME(a.type) ? !0 : c.canPlayURL(a.href)
        };
        this.getSoundById = function(a, d) {
            if (!a) throw Error("soundManager.getSoundById(): sID is null/undefined");
            var e = c.sounds[a];
            !e && !d && c._wD('"' + a + '" is an invalid sound ID.', 2);
            return e
        };
        this.onready = function(a, d) {
            if ("function" === typeof a) n && c._wD(p("queue", "onready")), d || (d = i), ua("onready", a, d), J();
            else throw p("needFunction", "onready");
            return !0
        };
        this.ontimeout = function(a, d) {
            if ("function" === typeof a) n && c._wD(p("queue", "ontimeout")), d || (d = i), ua("ontimeout", a, d), J({
                type: "ontimeout"
            });
            else throw p("needFunction", "ontimeout");
            return !0
        };
        this._wD = this._writeDebug = function(a, d, e) {
            var b, f;
            if (!c.debugMode) return !1;
            void 0 !== e && e && (a = a + " | " + (new Date).getTime());
            if (bb && c.useConsole) {
                e = kb[d];
                if (void 0 !== console[e]) console[e](a);
                else console.log(a);
                if (c.consoleOnly) return !0
            }
            try {
                b = A("soundmanager-debug");
                if (!b) return !1;
                f = j.createElement("div");
                0 === ++jb % 2 && (f.className = "sm2-alt");
                d = void 0 === d ? 0 : parseInt(d, 10);
                f.appendChild(j.createTextNode(a));
                d && (2 <= d && (f.style.fontWeight = "bold"), 3 === d && (f.style.color = "#ff3333"));
                b.insertBefore(f, b.firstChild)
            } catch (g) {}
            return !0
        };
        this._debug = function() {
            var a, d;
            m("currentObj", 1);
            a = 0;
            for (d = c.soundIDs.length; a < d; a++) c.sounds[c.soundIDs[a]]._debug()
        };
        this.reboot = function() {
            c._wD("soundManager.reboot()");
            c.soundIDs.length && c._wD("Destroying " + c.soundIDs.length + " SMSound objects...");
            var a, d;
            for (a = c.soundIDs.length - 1; 0 <= a; a--) c.sounds[c.soundIDs[a]].destruct();
            if (g) try {
                F && (ya = g.innerHTML), W = g.parentNode.removeChild(g), c._wD("Flash movie removed.")
            } catch (e) {
                m("badRemove", 2)
            }
            ya = W = B = null;
            c.enabled = V = n = X = Aa = S = T = v = c.swfLoaded = !1;
            c.soundIDs = [];
            c.sounds = {};
            g = null;
            for (a in D)
                if (D.hasOwnProperty(a))
                    for (d = D[a].length - 1; 0 <= d; d--) D[a][d].fired = !1;
            c._wD("soundManager: Rebooting...");
            i.setTimeout(c.beginDelayedInit, 20)
        };
        this.getMoviePercent = function() {
            return g && "PercentLoaded" in g ? g.PercentLoaded() : null
        };
        this.beginDelayedInit = function() {
            ba = !0;
            M();
            setTimeout(function() {
                if (Aa) return !1;
                ga();
                ea();
                return Aa = !0
            }, 20);
            L()
        };
        this.destruct = function() {
            c._wD("soundManager.destruct()");
            c.disable(!0)
        };
        La = function(a) {
            var d, e, b = this,
                f, j, x, h, i, n, q = !1,
                z = [],
                r = 0,
                u, v, t = null;
            e = d = null;
            this.sID = this.id = a.id;
            this.url = a.url;
            this._iO = this.instanceOptions = this.options = w(a);
            this.pan = this.options.pan;
            this.volume = this.options.volume;
            this.isHTML5 = !1;
            this._a = null;
            this.id3 = {};
            this._debug = function() {
                if (c.debugMode) {
                    var a = null,
                        d = [],
                        e, f;
                    for (a in b.options) null !== b.options[a] && ("function" === typeof b.options[a] ? (e = b.options[a].toString(), e = e.replace(/\s\s+/g, " "), f = e.indexOf("{"), d.push(" " + a + ": {" + e.substr(f + 1, Math.min(Math.max(e.indexOf("\n") - 1, 64), 64)).replace(/\n/g, "") + "... }")) : d.push(" " + a + ": " + b.options[a]));
                    c._wD("SMSound() merged options: {\n" + d.join(", \n") + "\n}")
                }
            };
            this._debug();
            this.load = function(a) {
                var d = null;
                void 0 !== a ? b._iO = w(a, b.options) : (a = b.options, b._iO = a, t && t !== b.url && (m("manURL"), b._iO.url = b.url, b.url = null));
                b._iO.url || (b._iO.url = b.url);
                b._iO.url = la(b._iO.url);
                a = b.instanceOptions = b._iO;
                c._wD("SMSound.load(): " + a.url, 1);
                if (a.url === b.url && 0 !== b.readyState && 2 !== b.readyState) return m("onURL", 1), 3 === b.readyState && a.onload && a.onload.apply(b, [!!b.duration]), b;
                b.loaded = !1;
                b.readyState = 1;
                b.playState = 0;
                b.id3 = {};
                if (ma(a)) d = b._setup_html5(a), d._called_load ? c._wD(l + "ignoring request to load again: " + b.id) : (c._wD(l + "load: " + b.id), b._html5_canplay = !1, b.url !== a.url && (c._wD(m("manURL") + ": " + a.url), b._a.src = a.url, b.setPosition(0)), b._a.autobuffer = "auto", b._a.preload = "auto", b._a._called_load = !0, a.autoPlay && b.play());
                else try {
                    b.isHTML5 = !1, b._iO = ja(ia(a)), a = b._iO, 8 === k ? g._load(b.id, a.url, a.stream, a.autoPlay, a.usePolicyFile) : g._load(b.id, a.url, !!a.stream, !!a.autoPlay, a.loops || 1, !!a.autoLoad, a.usePolicyFile)
                } catch (e) {
                    m("smError", 2), y("onload", !1), N({
                        type: "SMSOUND_LOAD_JS_EXCEPTION",
                        fatal: !0
                    })
                }
                b.url = a.url;
                return b
            };
            this.unload = function() {
                0 !== b.readyState && (c._wD('SMSound.unload(): "' + b.id + '"'), b.isHTML5 ? (h(), b._a && (b._a.pause(), Ba(b._a, "about:blank"), t = "about:blank")) : 8 === k ? g._unload(b.id, "about:blank") : g._unload(b.id), f());
                return b
            };
            this.destruct = function(a) {
                c._wD('SMSound.destruct(): "' + b.id + '"');
                b.isHTML5 ? (h(), b._a && (b._a.pause(), Ba(b._a), H || x(), b._a._s = null, b._a = null)) : (b._iO.onfailure = null, g._destroySound(b.id));
                a || c.destroySound(b.id, !0)
            };
            this.start = this.play = function(a, d) {
                var e, f;
                f = !0;
                f = null;
                d = void 0 === d ? !0 : d;
                a || (a = {});
                b.url && (b._iO.url = b.url);
                b._iO = w(b._iO, b.options);
                b._iO = w(a, b._iO);
                b._iO.url = la(b._iO.url);
                b.instanceOptions = b._iO;
                if (b._iO.serverURL && !b.connected) return b.getAutoPlay() || (c._wD("SMSound.play():  Netstream not connected yet - setting autoPlay"), b.setAutoPlay(!0)), b;
                ma(b._iO) && (b._setup_html5(b._iO), i());
                1 === b.playState && !b.paused && ((e = b._iO.multiShot) ? c._wD('SMSound.play(): "' + b.id + '" already playing (multi-shot)', 1) : (c._wD('SMSound.play(): "' + b.id + '" already playing (one-shot)', 1), f = b));
                if (null !== f) return f;
                a.url && a.url !== b.url && b.load(b._iO);
                b.loaded ? c._wD('SMSound.play(): "' + b.id + '"') : 0 === b.readyState ? (c._wD('SMSound.play(): Attempting to load "' + b.id + '"', 1), b.isHTML5 || (b._iO.autoPlay = !0), b.load(b._iO), b.instanceOptions = b._iO) : 2 === b.readyState ? (c._wD('SMSound.play(): Could not load "' + b.id + '" - exiting', 2), f = b) : c._wD('SMSound.play(): "' + b.id + '" is loading - attempting to play..', 1);
                if (null !== f) return f;
                !b.isHTML5 && 9 === k && 0 < b.position && b.position === b.duration && (c._wD('SMSound.play(): "' + b.id + '": Sound at end, resetting to position:0'), a.position = 0);
                if (b.paused && 0 <= b.position && (!b._iO.serverURL || 0 < b.position)) c._wD('SMSound.play(): "' + b.id + '" is resuming from paused state', 1), b.resume();
                else {
                    b._iO = w(a, b._iO);
                    if (null !== b._iO.from && null !== b._iO.to && 0 === b.instanceCount && 0 === b.playState && !b._iO.serverURL) {
                        e = function() {
                            b._iO = w(a, b._iO);
                            b.play(b._iO)
                        };
                        if (b.isHTML5 && !b._html5_canplay) c._wD('SMSound.play(): Beginning load of "' + b.id + '" for from/to case'), b.load({
                            oncanplay: e
                        }), f = !1;
                        else if (!b.isHTML5 && !b.loaded && (!b.readyState || 2 !== b.readyState)) c._wD('SMSound.play(): Preloading "' + b.id + '" for from/to case'), b.load({
                            onload: e
                        }), f = !1;
                        if (null !== f) return f;
                        b._iO = v()
                    }
                    c._wD('SMSound.play(): "' + b.id + '" is starting to play');
                    (!b.instanceCount || b._iO.multiShotEvents || !b.isHTML5 && 8 < k && !b.getAutoPlay()) && b.instanceCount++;
                    b._iO.onposition && 0 === b.playState && n(b);
                    b.playState = 1;
                    b.paused = !1;
                    b.position = void 0 !== b._iO.position && !isNaN(b._iO.position) ? b._iO.position : 0;
                    b.isHTML5 || (b._iO = ja(ia(b._iO)));
                    b._iO.onplay && d && (b._iO.onplay.apply(b), q = !0);
                    b.setVolume(b._iO.volume, !0);
                    b.setPan(b._iO.pan, !0);
                    b.isHTML5 ? (i(), f = b._setup_html5(), b.setPosition(b._iO.position), f.play()) : (f = g._start(b.id, b._iO.loops || 1, 9 === k ? b._iO.position : b._iO.position / 1e3, b._iO.multiShot), 9 === k && !f && (c._wD("SMSound.play(): " + b.id + ": No sound hardware, or 32-sound ceiling hit"), b._iO.onplayerror && b._iO.onplayerror.apply(b)))
                }
                return b
            };
            this.stop = function(a) {
                var c = b._iO;
                1 === b.playState && (b._onbufferchange(0), b._resetOnPosition(0), b.paused = !1, b.isHTML5 || (b.playState = 0), u(), c.to && b.clearOnPosition(c.to), b.isHTML5 ? b._a && (a = b.position, b.setPosition(0), b.position = a, b._a.pause(), b.playState = 0, b._onTimer(), h()) : (g._stop(b.id, a), c.serverURL && b.unload()), b.instanceCount = 0, b._iO = {}, c.onstop && c.onstop.apply(b));
                return b
            };
            this.setAutoPlay = function(a) {
                c._wD("sound " + b.id + " turned autoplay " + (a ? "on" : "off"));
                b._iO.autoPlay = a;
                b.isHTML5 || (g._setAutoPlay(b.id, a), a && !b.instanceCount && 1 === b.readyState && (b.instanceCount++, c._wD("sound " + b.id + " incremented instance count to " + b.instanceCount)))
            };
            this.getAutoPlay = function() {
                return b._iO.autoPlay
            };
            this.setPosition = function(a) {
                void 0 === a && (a = 0);
                var d = b.isHTML5 ? Math.max(a, 0) : Math.min(b.duration || b._iO.duration, Math.max(a, 0));
                b.position = d;
                a = b.position / 1e3;
                b._resetOnPosition(b.position);
                b._iO.position = d;
                if (b.isHTML5) {
                    if (b._a)
                        if (b._html5_canplay) {
                            if (b._a.currentTime !== a) {
                                c._wD("setPosition(" + a + "): setting position");
                                try {
                                    b._a.currentTime = a, (0 === b.playState || b.paused) && b._a.pause()
                                } catch (e) {
                                    c._wD("setPosition(" + a + "): setting position failed: " + e.message, 2)
                                }
                            }
                        } else c._wD("setPosition(" + a + "): delaying, sound not ready")
                } else a = 9 === k ? b.position : a, b.readyState && 2 !== b.readyState && g._setPosition(b.id, a, b.paused || !b.playState, b._iO.multiShot);
                b.isHTML5 && b.paused && b._onTimer(!0);
                return b
            };
            this.pause = function(a) {
                if (b.paused || 0 === b.playState && 1 !== b.readyState) return b;
                c._wD("SMSound.pause()");
                b.paused = !0;
                b.isHTML5 ? (b._setup_html5().pause(), h()) : (a || void 0 === a) && g._pause(b.id, b._iO.multiShot);
                b._iO.onpause && b._iO.onpause.apply(b);
                return b
            };
            this.resume = function() {
                var a = b._iO;
                if (!b.paused) return b;
                c._wD("SMSound.resume()");
                b.paused = !1;
                b.playState = 1;
                b.isHTML5 ? (b._setup_html5().play(), i()) : (a.isMovieStar && !a.serverURL && b.setPosition(b.position), g._pause(b.id, a.multiShot));
                !q && a.onplay ? (a.onplay.apply(b), q = !0) : a.onresume && a.onresume.apply(b);
                return b
            };
            this.togglePause = function() {
                c._wD("SMSound.togglePause()");
                if (0 === b.playState) return b.play({
                    position: 9 === k && !b.isHTML5 ? b.position : b.position / 1e3
                }), b;
                b.paused ? b.resume() : b.pause();
                return b
            };
            this.setPan = function(a, c) {
                void 0 === a && (a = 0);
                void 0 === c && (c = !1);
                b.isHTML5 || g._setPan(b.id, a);
                b._iO.pan = a;
                c || (b.pan = a, b.options.pan = a);
                return b
            };
            this.setVolume = function(a, d) {
                void 0 === a && (a = 100);
                void 0 === d && (d = !1);
                b.isHTML5 ? b._a && (b._a.volume = Math.max(0, Math.min(1, a / 100))) : g._setVolume(b.id, c.muted && !b.muted || b.muted ? 0 : a);
                b._iO.volume = a;
                d || (b.volume = a, b.options.volume = a);
                return b
            };
            this.mute = function() {
                b.muted = !0;
                b.isHTML5 ? b._a && (b._a.muted = !0) : g._setVolume(b.id, 0);
                return b
            };
            this.unmute = function() {
                b.muted = !1;
                var a = void 0 !== b._iO.volume;
                b.isHTML5 ? b._a && (b._a.muted = !1) : g._setVolume(b.id, a ? b._iO.volume : b.options.volume);
                return b
            };
            this.toggleMute = function() {
                return b.muted ? b.unmute() : b.mute()
            };
            this.onposition = this.onPosition = function(a, c, d) {
                z.push({
                    position: parseInt(a, 10),
                    method: c,
                    scope: void 0 !== d ? d : b,
                    fired: !1
                });
                return b
            };
            this.clearOnPosition = function(b, a) {
                var c, b = parseInt(b, 10);
                if (isNaN(b)) return !1;
                for (c = 0; c < z.length; c++)
                    if (b === z[c].position && (!a || a === z[c].method)) z[c].fired && r--, z.splice(c, 1)
            };
            this._processOnPosition = function() {
                var a, c;
                a = z.length;
                if (!a || !b.playState || r >= a) return !1;
                for (a -= 1; 0 <= a; a--) c = z[a], !c.fired && b.position >= c.position && (c.fired = !0, r++, c.method.apply(c.scope, [c.position]));
                return !0
            };
            this._resetOnPosition = function(b) {
                var a, c;
                a = z.length;
                if (!a) return !1;
                for (a -= 1; 0 <= a; a--) c = z[a], c.fired && b <= c.position && (c.fired = !1, r--);
                return !0
            };
            v = function() {
                var a = b._iO,
                    d = a.from,
                    e = a.to,
                    f, h;
                h = function() {
                    c._wD(b.id + ': "to" time of ' + e + " reached.");
                    b.clearOnPosition(e, h);
                    b.stop()
                };
                f = function() {
                    c._wD(b.id + ': playing "from" ' + d);
                    if (null !== e && !isNaN(e)) b.onPosition(e, h)
                };
                null !== d && !isNaN(d) && (a.position = d, a.multiShot = !1, f());
                return a
            };
            n = function() {
                var a, c = b._iO.onposition;
                if (c)
                    for (a in c)
                        if (c.hasOwnProperty(a)) b.onPosition(parseInt(a, 10), c[a])
            };
            u = function() {
                var a, c = b._iO.onposition;
                if (c)
                    for (a in c) c.hasOwnProperty(a) && b.clearOnPosition(parseInt(a, 10))
            };
            i = function() {
                b.isHTML5 && Ta(b)
            };
            h = function() {
                b.isHTML5 && Ua(b)
            };
            f = function(a) {
                a || (z = [], r = 0);
                q = !1;
                b._hasTimer = null;
                b._a = null;
                b._html5_canplay = !1;
                b.bytesLoaded = null;
                b.bytesTotal = null;
                b.duration = b._iO && b._iO.duration ? b._iO.duration : null;
                b.durationEstimate = null;
                b.buffered = [];
                b.eqData = [];
                b.eqData.left = [];
                b.eqData.right = [];
                b.failures = 0;
                b.isBuffering = !1;
                b.instanceOptions = {};
                b.instanceCount = 0;
                b.loaded = !1;
                b.metadata = {};
                b.readyState = 0;
                b.muted = !1;
                b.paused = !1;
                b.peakData = {
                    left: 0,
                    right: 0
                };
                b.waveformData = {
                    left: [],
                    right: []
                };
                b.playState = 0;
                b.position = null;
                b.id3 = {}
            };
            f();
            this._onTimer = function(a) {
                var c, f = !1,
                    h = {};
                if (b._hasTimer || a) {
                    if (b._a && (a || (0 < b.playState || 1 === b.readyState) && !b.paused)) c = b._get_html5_duration(), c !== d && (d = c, b.duration = c, f = !0), b.durationEstimate = b.duration, c = 1e3 * b._a.currentTime || 0, c !== e && (e = c, f = !0), (f || a) && b._whileplaying(c, h, h, h, h);
                    return f
                }
            };
            this._get_html5_duration = function() {
                var a = b._iO;
                return (a = b._a && b._a.duration ? 1e3 * b._a.duration : a && a.duration ? a.duration : null) && !isNaN(a) && Infinity !== a ? a : null
            };
            this._apply_loop = function(b, a) {
                !b.loop && 1 < a && c._wD("Note: Native HTML5 looping is infinite.");
                b.loop = 1 < a ? "loop" : ""
            };
            this._setup_html5 = function(a) {
                var a = w(b._iO, a),
                    c = decodeURI,
                    d = H ? Ma : b._a,
                    e = c(a.url),
                    h;
                H ? e === Za && (h = !0) : e === t && (h = !0);
                if (d) {
                    if (d._s)
                        if (H) d._s && d._s.playState && !h && d._s.stop();
                        else if (!H && e === c(t)) return b._apply_loop(d, a.loops), d;
                    h || (f(!1), d.src = a.url, Za = t = b.url = a.url, d._called_load = !1)
                } else m("h5a"), b._a = a.autoLoad || a.autoPlay ? new Audio(a.url) : Ga && 10 > opera.version() ? new Audio(null) : new Audio, d = b._a, d._called_load = !1, H && (Ma = d);
                b.isHTML5 = !0;
                b._a = d;
                d._s = b;
                j();
                b._apply_loop(d, a.loops);
                a.autoLoad || a.autoPlay ? b.load() : (d.autobuffer = !1, d.preload = "auto");
                return d
            };
            j = function() {
                if (b._a._added_events) return !1;
                var a;
                b._a._added_events = !0;
                for (a in C) C.hasOwnProperty(a) && b._a && b._a.addEventListener(a, C[a], !1);
                return !0
            };
            x = function() {
                var a;
                c._wD(l + "removing event listeners: " + b.id);
                b._a._added_events = !1;
                for (a in C) C.hasOwnProperty(a) && b._a && b._a.removeEventListener(a, C[a], !1)
            };
            this._onload = function(a) {
                a = !!a || !b.isHTML5 && 8 === k && b.duration;
                c._wD('SMSound._onload(): "' + b.id + '"' + (a ? " loaded." : " failed to load? - " + b.url), a ? 1 : 2);
                !a && !b.isHTML5 && (!0 === c.sandbox.noRemote && c._wD("SMSound._onload(): " + p("noNet"), 1), !0 === c.sandbox.noLocal && c._wD("SMSound._onload(): " + p("noLocal"), 1));
                b.loaded = a;
                b.readyState = a ? 3 : 2;
                b._onbufferchange(0);
                b._iO.onload && b._iO.onload.apply(b, [a]);
                return !0
            };
            this._onbufferchange = function(a) {
                if (0 === b.playState || a && b.isBuffering || !a && !b.isBuffering) return !1;
                b.isBuffering = 1 === a;
                b._iO.onbufferchange && (c._wD("SMSound._onbufferchange(): " + a), b._iO.onbufferchange.apply(b));
                return !0
            };
            this._onsuspend = function() {
                b._iO.onsuspend && (c._wD("SMSound._onsuspend()"), b._iO.onsuspend.apply(b));
                return !0
            };
            this._onfailure = function(a, d, e) {
                b.failures++;
                c._wD('SMSound._onfailure(): "' + b.id + '" count ' + b.failures);
                if (b._iO.onfailure && 1 === b.failures) b._iO.onfailure(b, a, d, e);
                else c._wD("SMSound._onfailure(): ignoring")
            };
            this._onfinish = function() {
                var a = b._iO.onfinish;
                b._onbufferchange(0);
                b._resetOnPosition(0);
                if (b.instanceCount && (b.instanceCount--, b.instanceCount || (u(), b.playState = 0, b.paused = !1, b.instanceCount = 0, b.instanceOptions = {}, b._iO = {}, h(), b.isHTML5 && (b.position = 0)), (!b.instanceCount || b._iO.multiShotEvents) && a)) c._wD('SMSound._onfinish(): "' + b.id + '"'), a.apply(b)
            };
            this._whileloading = function(a, c, d, e) {
                var f = b._iO;
                b.bytesLoaded = a;
                b.bytesTotal = c;
                b.duration = Math.floor(d);
                b.bufferLength = e;
                b.durationEstimate = !b.isHTML5 && !f.isMovieStar ? f.duration ? b.duration > f.duration ? b.duration : f.duration : parseInt(b.bytesTotal / b.bytesLoaded * b.duration, 10) : b.duration;
                b.isHTML5 || (b.buffered = [{
                    start: 0,
                    end: b.duration
                }]);
                (3 !== b.readyState || b.isHTML5) && f.whileloading && f.whileloading.apply(b)
            };
            this._whileplaying = function(a, c, d, e, f) {
                var h = b._iO;
                if (isNaN(a) || null === a) return !1;
                b.position = Math.max(0, a);
                b._processOnPosition();
                !b.isHTML5 && 8 < k && (h.usePeakData && void 0 !== c && c && (b.peakData = {
                    left: c.leftPeak,
                    right: c.rightPeak
                }), h.useWaveformData && void 0 !== d && d && (b.waveformData = {
                    left: d.split(","),
                    right: e.split(",")
                }), h.useEQData && void 0 !== f && f && f.leftEQ && (a = f.leftEQ.split(","), b.eqData = a, b.eqData.left = a, void 0 !== f.rightEQ && f.rightEQ && (b.eqData.right = f.rightEQ.split(","))));
                1 === b.playState && (!b.isHTML5 && 8 === k && !b.position && b.isBuffering && b._onbufferchange(0), h.whileplaying && h.whileplaying.apply(b));
                return !0
            };
            this._oncaptiondata = function(a) {
                c._wD('SMSound._oncaptiondata(): "' + this.id + '" caption data received.');
                b.captiondata = a;
                b._iO.oncaptiondata && b._iO.oncaptiondata.apply(b, [a])
            };
            this._onmetadata = function(a, d) {
                c._wD('SMSound._onmetadata(): "' + this.id + '" metadata received.');
                var e = {},
                    f, h;
                f = 0;
                for (h = a.length; f < h; f++) e[a[f]] = d[f];
                b.metadata = e;
                b._iO.onmetadata && b._iO.onmetadata.apply(b)
            };
            this._onid3 = function(a, d) {
                c._wD('SMSound._onid3(): "' + this.id + '" ID3 data received.');
                var e = [],
                    f, h;
                f = 0;
                for (h = a.length; f < h; f++) e[a[f]] = d[f];
                b.id3 = w(b.id3, e);
                b._iO.onid3 && b._iO.onid3.apply(b)
            };
            this._onconnect = function(a) {
                a = 1 === a;
                c._wD('SMSound._onconnect(): "' + b.id + '"' + (a ? " connected." : " failed to connect? - " + b.url), a ? 1 : 2);
                if (b.connected = a) b.failures = 0, s(b.id) && (b.getAutoPlay() ? b.play(void 0, b.getAutoPlay()) : b._iO.autoLoad && b.load()), b._iO.onconnect && b._iO.onconnect.apply(b, [a])
            };
            this._ondataerror = function(a) {
                0 < b.playState && (c._wD("SMSound._ondataerror(): " + a), b._iO.ondataerror && b._iO.ondataerror.apply(b))
            }
        };
        fa = function() {
            return j.body || j._docElement || j.getElementsByTagName("div")[0]
        };
        A = function(a) {
            return j.getElementById(a)
        };
        w = function(a, d) {
            var e = a || {},
                b, f;
            b = void 0 === d ? c.defaultOptions : d;
            for (f in b) b.hasOwnProperty(f) && void 0 === e[f] && (e[f] = "object" !== typeof b[f] || null === b[f] ? b[f] : w(e[f], b[f]));
            return e
        };
        I = {
            onready: 1,
            ontimeout: 1,
            defaultOptions: 1,
            flash9Options: 1,
            movieStarOptions: 1
        };
        ta = function(a, d) {
            var e, b = !0,
                f = void 0 !== d,
                g = c.setupOptions;
            if (void 0 === a) {
                b = [];
                for (e in g) g.hasOwnProperty(e) && b.push(e);
                for (e in I) I.hasOwnProperty(e) && ("object" === typeof c[e] ? b.push(e + ": {...}") : c[e] instanceof Function ? b.push(e + ": function() {...}") : b.push(e));
                c._wD(p("setup", b.join(", ")));
                return !1
            }
            for (e in a)
                if (a.hasOwnProperty(e))
                    if ("object" !== typeof a[e] || null === a[e] || a[e] instanceof Array) f && void 0 !== I[d] ? c[d][e] = a[e] : void 0 !== g[e] ? (c.setupOptions[e] = a[e], c[e] = a[e]) : void 0 === I[e] ? (P(p(void 0 === c[e] ? "setupUndef" : "setupError", e), 2), b = !1) : c[e] instanceof Function ? c[e].apply(c, a[e] instanceof Array ? a[e] : [a[e]]) : c[e] = a[e];
                    else if (void 0 === I[e]) P(p(void 0 === c[e] ? "setupUndef" : "setupError", e), 2), b = !1;
            else return ta(a[e], e);
            return b
        };
        var hb = function(a) {
                var a = Ya.call(a),
                    c = a.length;
                oa ? (a[1] = "on" + a[1], 3 < c && a.pop()) : 3 === c && a.push(!1);
                return a
            },
            ib = function(a, c) {
                var e = a.shift(),
                    b = [nb[c]];
                if (oa) e[b](a[0], a[1]);
                else e[b].apply(e, a)
            },
            oa = i.attachEvent,
            nb = {
                add: oa ? "attachEvent" : "addEventListener",
                remove: oa ? "detachEvent" : "removeEventListener"
            };
        r = {
            add: function() {
                ib(hb(arguments), "add")
            },
            remove: function() {
                ib(hb(arguments), "remove")
            }
        };
        C = {
            abort: q(function() {
                c._wD(l + "abort: " + this._s.id)
            }),
            canplay: q(function() {
                var a = this._s,
                    d;
                if (a._html5_canplay) return !0;
                a._html5_canplay = !0;
                c._wD(l + "canplay: " + a.id + ", " + a.url);
                a._onbufferchange(0);
                d = void 0 !== a._iO.position && !isNaN(a._iO.position) ? a._iO.position / 1e3 : null;
                if (a.position && this.currentTime !== d) {
                    c._wD(l + "canplay: setting position to " + d);
                    try {
                        this.currentTime = d
                    } catch (e) {
                        c._wD(l + "setting position of " + d + " failed: " + e.message, 2)
                    }
                }
                a._iO._oncanplay && a._iO._oncanplay()
            }),
            canplaythrough: q(function() {
                var a = this._s;
                a.loaded || (a._onbufferchange(0), a._whileloading(a.bytesLoaded, a.bytesTotal, a._get_html5_duration()), a._onload(!0))
            }),
            ended: q(function() {
                var a = this._s;
                c._wD(l + "ended: " + a.id);
                a._onfinish()
            }),
            error: q(function() {
                c._wD(l + "error: " + this.error.code);
                this._s._onload(!1)
            }),
            loadeddata: q(function() {
                var a = this._s;
                c._wD(l + "loadeddata: " + a.id);
                !a._loaded && !Fa && (a.duration = a._get_html5_duration())
            }),
            loadedmetadata: q(function() {
                c._wD(l + "loadedmetadata: " + this._s.id)
            }),
            loadstart: q(function() {
                c._wD(l + "loadstart: " + this._s.id);
                this._s._onbufferchange(1)
            }),
            play: q(function() {
                c._wD(l + "play: " + this._s.id + ", " + this._s.url);
                this._s._onbufferchange(0)
            }),
            playing: q(function() {
                c._wD(l + "playing: " + this._s.id);
                this._s._onbufferchange(0)
            }),
            progress: q(function(a) {
                var d = this._s,
                    e, b, f;
                e = 0;
                var g = "progress" === a.type,
                    x = a.target.buffered,
                    h = a.loaded || 0,
                    j = a.total || 1;
                d.buffered = [];
                if (x && x.length) {
                    e = 0;
                    for (b = x.length; e < b; e++) d.buffered.push({
                        start: 1e3 * x.start(e),
                        end: 1e3 * x.end(e)
                    });
                    e = 1e3 * (x.end(0) - x.start(0));
                    h = e / (1e3 * a.target.duration);
                    if (g && 1 < x.length) {
                        f = [];
                        b = x.length;
                        for (e = 0; e < b; e++) f.push(1e3 * a.target.buffered.start(e) + "-" + 1e3 * a.target.buffered.end(e));
                        c._wD(l + "progress: timeRanges: " + f.join(", "))
                    }
                    g && !isNaN(h) && c._wD(l + "progress: " + d.id + ": " + Math.floor(100 * h) + "% loaded")
                }
                isNaN(h) || (d._onbufferchange(0), d._whileloading(h, j, d._get_html5_duration()), h && j && h === j && C.canplaythrough.call(this, a))
            }),
            ratechange: q(function() {
                c._wD(l + "ratechange: " + this._s.id)
            }),
            suspend: q(function(a) {
                var d = this._s;
                c._wD(l + "suspend: " + d.id);
                C.progress.call(this, a);
                d._onsuspend()
            }),
            stalled: q(function() {
                c._wD(l + "stalled: " + this._s.id)
            }),
            timeupdate: q(function() {
                this._s._onTimer()
            }),
            waiting: q(function() {
                var a = this._s;
                c._wD(l + "waiting: " + a.id);
                a._onbufferchange(1)
            })
        };
        ma = function(a) {
            return a.serverURL || a.type && aa(a.type) ? !1 : a.type ? Z({
                type: a.type
            }) : Z({
                url: a.url
            }) || c.html5Only
        };
        Ba = function(a, c) {
            a && (a.src = c)
        };
        Z = function(a) {
            if (!c.useHTML5Audio || !c.hasHTML5) return !1;
            var d = a.url || null,
                a = a.type || null,
                e = c.audioFormats,
                b;
            if (a && void 0 !== c.html5[a]) return c.html5[a] && !aa(a);
            if (!E) {
                E = [];
                for (b in e) e.hasOwnProperty(b) && (E.push(b), e[b].related && (E = E.concat(e[b].related)));
                E = RegExp("\\.(" + E.join("|") + ")(\\?.*)?$", "i")
            }
            b = d ? d.toLowerCase().match(E) : null;
            !b || !b.length ? a && (d = a.indexOf(";"), b = (-1 !== d ? a.substr(0, d) : a).substr(6)) : b = b[1];
            b && void 0 !== c.html5[b] ? d = c.html5[b] && !aa(b) : (a = "audio/" + b, d = c.html5.canPlayType({
                type: a
            }), d = (c.html5[b] = d) && c.html5[a] && !aa(a));
            return d
        };
        Xa = function() {
            function a(a) {
                var b, e, f = b = !1;
                if (!d || "function" !== typeof d.canPlayType) return b;
                if (a instanceof Array) {
                    b = 0;
                    for (e = a.length; b < e; b++)
                        if (c.html5[a[b]] || d.canPlayType(a[b]).match(c.html5Test)) f = !0, c.html5[a[b]] = !0, c.flash[a[b]] = !!a[b].match(db);
                    b = f
                } else a = d && "function" === typeof d.canPlayType ? d.canPlayType(a) : !1, b = !(!a || !a.match(c.html5Test));
                return b
            }
            if (!c.useHTML5Audio || !c.hasHTML5) return !1;
            var d = void 0 !== Audio ? Ga && 10 > opera.version() ? new Audio(null) : new Audio : null,
                e, b, f = {},
                g;
            g = c.audioFormats;
            for (e in g)
                if (g.hasOwnProperty(e) && (b = "audio/" + e, f[e] = a(g[e].type), f[b] = f[e], e.match(db) ? (c.flash[e] = !0, c.flash[b] = !0) : (c.flash[e] = !1, c.flash[b] = !1), g[e] && g[e].related))
                    for (b = g[e].related.length - 1; 0 <= b; b--) f["audio/" + g[e].related[b]] = f[e], c.html5[g[e].related[b]] = f[e], c.flash[g[e].related[b]] = f[e];
            f.canPlayType = d ? a : null;
            c.html5 = w(c.html5, f);
            return !0
        };
        da = {
            notReady: "Not loaded yet - wait for soundManager.onready()",
            notOK: "Audio support is not available.",
            domError: "soundManager::createMovie(): appendChild/innerHTML call failed. DOM not ready or other error.",
            spcWmode: "soundManager::createMovie(): Removing wmode, preventing known SWF loading issue(s)",
            swf404: "soundManager: Verify that %s is a valid path.",
            tryDebug: "Try soundManager.debugFlash = true for more security details (output goes to SWF.)",
            checkSWF: "See SWF output for more debug info.",
            localFail: "soundManager: Non-HTTP page (" + j.location.protocol + " URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/",
            waitFocus: "soundManager: Special case: Waiting for SWF to load with window focus...",
            waitImpatient: "soundManager: Getting impatient, still waiting for Flash%s...",
            waitForever: "soundManager: Waiting indefinitely for Flash (will recover if unblocked)...",
            waitSWF: "soundManager: Retrying, waiting for 100% SWF load...",
            needFunction: "soundManager: Function object expected for %s",
            badID: 'Warning: Sound ID "%s" should be a string, starting with a non-numeric character',
            currentObj: "--- soundManager._debug(): Current sound objects ---",
            waitEI: "soundManager::initMovie(): Waiting for ExternalInterface call from Flash...",
            waitOnload: "soundManager: Waiting for window.onload()",
            docLoaded: "soundManager: Document already loaded",
            onload: "soundManager::initComplete(): calling soundManager.onload()",
            onloadOK: "soundManager.onload() complete",
            init: "soundManager::init()",
            didInit: "soundManager::init(): Already called?",
            flashJS: "soundManager: Attempting JS to Flash call...",
            secNote: "Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html",
            badRemove: "Warning: Failed to remove flash movie.",
            shutdown: "soundManager.disable(): Shutting down",
            queue: "soundManager: Queueing %s handler",
            smFail: "soundManager: Failed to initialise.",
            smError: "SMSound.load(): Exception: JS-Flash communication failed, or JS error.",
            fbTimeout: "No flash response, applying .swf_timedout CSS...",
            fbLoaded: "Flash loaded",
            fbHandler: "soundManager::flashBlockHandler()",
            manURL: "SMSound.load(): Using manually-assigned URL",
            onURL: "soundManager.load(): current URL already assigned.",
            badFV: 'soundManager.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
            as2loop: "Note: Setting stream:false so looping can work (flash 8 limitation)",
            noNSLoop: "Note: Looping not implemented for MovieStar formats",
            needfl9: "Note: Switching to flash 9, required for MP4 formats.",
            mfTimeout: "Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case",
            needFlash: "soundManager: Fatal error: Flash is needed to play some required formats, but is not available.",
            gotFocus: "soundManager: Got window focus.",
            mfOn: "mobileFlash::enabling on-screen flash repositioning",
            policy: "Enabling usePolicyFile for data access",
            setup: "soundManager.setup(): allowed parameters: %s",
            setupError: 'soundManager.setup(): "%s" cannot be assigned with this method.',
            setupUndef: 'soundManager.setup(): Could not find option "%s"',
            setupLate: "soundManager.setup(): url + flashVersion changes will not take effect until reboot().",
            h5a: "creating HTML5 Audio() object",
            noURL: "soundManager: Flash URL required. Call soundManager.setup({url:...}) to get started."
        };
        p = function() {
            var a = Ya.call(arguments),
                c = a.shift(),
                c = da && da[c] ? da[c] : "",
                e, b;
            if (c && a && a.length) {
                e = 0;
                for (b = a.length; e < b; e++) c = c.replace("%s", a[e])
            }
            return c
        };
        ia = function(a) {
            8 === k && 1 < a.loops && a.stream && (m("as2loop"), a.stream = !1);
            return a
        };
        ja = function(a, d) {
            if (a && !a.usePolicyFile && (a.onid3 || a.usePeakData || a.useWaveformData || a.useEQData)) c._wD((d || "") + p("policy")), a.usePolicyFile = !0;
            return a
        };
        P = function(a) {
            void 0 !== console && void 0 !== console.warn ? console.warn(a) : c._wD(a)
        };
        qa = function() {
            return !1
        };
        Qa = function(a) {
            for (var c in a) a.hasOwnProperty(c) && "function" === typeof a[c] && (a[c] = qa)
        };
        ha = function(a) {
            void 0 === a && (a = !1);
            if (v || a) m("smFail", 2), c.disable(a)
        };
        Ra = function(a) {
            var d = null;
            if (a)
                if (a.match(/\.swf(\?.*)?$/i)) {
                    if (d = a.substr(a.toLowerCase().lastIndexOf(".swf?") + 4)) return a
                } else a.lastIndexOf("/") !== a.length - 1 && (a += "/");
            a = (a && -1 !== a.lastIndexOf("/") ? a.substr(0, a.lastIndexOf("/") + 1) : "./") + c.movieURL;
            c.noSWFCache && (a += "?ts=" + (new Date).getTime());
            return a
        };
        va = function() {
            k = parseInt(c.flashVersion, 10);
            8 !== k && 9 !== k && (c._wD(p("badFV", k, 8)), c.flashVersion = k = 8);
            var a = c.debugMode || c.debugFlash ? "_debug.swf" : ".swf";
            c.useHTML5Audio && !c.html5Only && c.audioFormats.mp4.required && 9 > k && (c._wD(p("needfl9")), c.flashVersion = k = 9);
            c.version = c.versionNumber + (c.html5Only ? " (HTML5-only mode)" : 9 === k ? " (AS3/Flash 9)" : " (AS2/Flash 8)");
            8 < k ? (c.defaultOptions = w(c.defaultOptions, c.flash9Options), c.features.buffering = !0, c.defaultOptions = w(c.defaultOptions, c.movieStarOptions), c.filePatterns.flash9 = RegExp("\\.(mp3|" + gb.join("|") + ")(\\?.*)?$", "i"), c.features.movieStar = !0) : c.features.movieStar = !1;
            c.filePattern = c.filePatterns[8 !== k ? "flash9" : "flash8"];
            c.movieURL = (8 === k ? "soundmanager2.swf" : "soundmanager2_flash9.swf").replace(".swf", a);
            c.features.peakData = c.features.waveformData = c.features.eqData = 8 < k
        };
        Pa = function(a, c) {
            if (!g) return !1;
            g._setPolling(a, c)
        };
        xa = function() {
            c.debugURLParam.test(R) && (c.debugMode = !0);
            if (A(c.debugID)) return !1;
            var a, d, e, b;
            if (c.debugMode && !A(c.debugID) && (!bb || !c.useConsole || !c.consoleOnly)) {
                a = j.createElement("div");
                a.id = c.debugID + "-toggle";
                d = {
                    position: "fixed",
                    bottom: "0px",
                    right: "0px",
                    width: "1.2em",
                    height: "1.2em",
                    lineHeight: "1.2em",
                    margin: "2px",
                    textAlign: "center",
                    border: "1px solid #999",
                    cursor: "pointer",
                    background: "#fff",
                    color: "#333",
                    zIndex: 10001
                };
                a.appendChild(j.createTextNode("-"));
                a.onclick = Sa;
                a.title = "Toggle SM2 debug console";
                u.match(/msie 6/i) && (a.style.position = "absolute", a.style.cursor = "hand");
                for (b in d) d.hasOwnProperty(b) && (a.style[b] = d[b]);
                d = j.createElement("div");
                d.id = c.debugID;
                d.style.display = c.debugMode ? "block" : "none";
                if (c.debugMode && !A(a.id)) {
                    try {
                        e = fa(), e.appendChild(a)
                    } catch (f) {
                        throw Error(p("domError") + " \n" + f.toString())
                    }
                    e.appendChild(d)
                }
            }
        };
        s = this.getSoundById;
        m = function(a, d) {
            return !a ? "" : c._wD(p(a), d)
        };
        R.indexOf("sm2-debug=alert") + 1 && c.debugMode && (c._wD = function(a) {
            G.alert(a)
        });
        Sa = function() {
            var a = A(c.debugID),
                d = A(c.debugID + "-toggle");
            if (!a) return !1;
            sa ? (d.innerHTML = "+", a.style.display = "none") : (d.innerHTML = "-", a.style.display = "block");
            sa = !sa
        };
        y = function(a, c, e) {
            if (void 0 !== i.sm2Debugger) try {
                sm2Debugger.handleEvent(a, c, e)
            } catch (b) {}
            return !0
        };
        O = function() {
            var a = [];
            c.debugMode && a.push("sm2_debug");
            c.debugFlash && a.push("flash_debug");
            c.useHighPerformance && a.push("high_performance");
            return a.join(" ")
        };
        za = function() {
            var a = p("fbHandler"),
                d = c.getMoviePercent(),
                e = {
                    type: "FLASHBLOCK"
                };
            if (c.html5Only) return !1;
            c.ok() ? (c.didFlashBlock && c._wD(a + ": Unblocked"), c.oMC && (c.oMC.className = [O(), "movieContainer", "swf_loaded" + (c.didFlashBlock ? " swf_unblocked" : "")].join(" "))) : (B && (c.oMC.className = O() + " movieContainer " + (null === d ? "swf_timedout" : "swf_error"), c._wD(a + ": " + p("fbTimeout") + (d ? " (" + p("fbLoaded") + ")" : ""))), c.didFlashBlock = !0, J({
                type: "ontimeout",
                ignoreInit: !0,
                error: e
            }), N(e))
        };
        ua = function(a, c, e) {
            void 0 === D[a] && (D[a] = []);
            D[a].push({
                method: c,
                scope: e || null,
                fired: !1
            })
        };
        J = function(a) {
            a || (a = {
                type: c.ok() ? "onready" : "ontimeout"
            });
            if (!n && a && !a.ignoreInit || "ontimeout" === a.type && (c.ok() || v && !a.ignoreInit)) return !1;
            var d = {
                    success: a && a.ignoreInit ? c.ok() : !v
                },
                e = a && a.type ? D[a.type] || [] : [],
                b = [],
                f, g = [d],
                j = B && c.useFlashBlock && !c.ok();
            a.error && (g[0].error = a.error);
            d = 0;
            for (f = e.length; d < f; d++) !0 !== e[d].fired && b.push(e[d]);
            if (b.length) {
                c._wD("soundManager: Firing " + b.length + " " + a.type + "() item" + (1 === b.length ? "" : "s"));
                d = 0;
                for (f = b.length; d < f; d++) b[d].scope ? b[d].method.apply(b[d].scope, g) : b[d].method.apply(this, g), j || (b[d].fired = !0)
            }
            return !0
        };
        K = function() {
            i.setTimeout(function() {
                c.useFlashBlock && za();
                J();
                "function" === typeof c.onload && (m("onload", 1), c.onload.apply(i), m("onloadOK", 1));
                c.waitForWindowLoad && r.add(i, "load", K)
            }, 1)
        };
        Da = function() {
            if (void 0 !== t) return t;
            var a = !1,
                c = navigator,
                e = c.plugins,
                b, f = i.ActiveXObject;
            if (e && e.length)(c = c.mimeTypes) && c["application/x-shockwave-flash"] && c["application/x-shockwave-flash"].enabledPlugin && c["application/x-shockwave-flash"].enabledPlugin.description && (a = !0);
            else if (void 0 !== f && !u.match(/MSAppHost/i)) {
                try {
                    b = new f("ShockwaveFlash.ShockwaveFlash")
                } catch (g) {}
                a = !!b
            }
            return t = a
        };
        Wa = function() {
            var a, d, e = c.audioFormats;
            if (Ea && u.match(/os (1|2|3_0|3_1)/i)) c.hasHTML5 = !1, c.html5Only = !0, c.oMC && (c.oMC.style.display = "none");
            else if (c.useHTML5Audio) {
                if (!c.html5 || !c.html5.canPlayType) c._wD("SoundManager: No HTML5 Audio() support detected."), c.hasHTML5 = !1;
                Ia && c._wD("soundManager::Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - " + (!t ? " would use flash fallback for MP3/MP4, but none detected." : "will use flash fallback for MP3/MP4, if available"), 1)
            }
            if (c.useHTML5Audio && c.hasHTML5)
                for (d in e)
                    if (e.hasOwnProperty(d) && (e[d].required && !c.html5.canPlayType(e[d].type) || c.preferFlash && (c.flash[d] || c.flash[e[d].type]))) a = !0;
            c.ignoreFlash && (a = !1);
            c.html5Only = c.hasHTML5 && c.useHTML5Audio && !a;
            return !c.html5Only
        };
        la = function(a) {
            var d, e, b = 0;
            if (a instanceof Array) {
                d = 0;
                for (e = a.length; d < e; d++)
                    if (a[d] instanceof Object) {
                        if (c.canPlayMIME(a[d].type)) {
                            b = d;
                            break
                        }
                    } else if (c.canPlayURL(a[d])) {
                    b = d;
                    break
                }
                a[b].url && (a[b] = a[b].url);
                a = a[b]
            }
            return a
        };
        Ta = function(a) {
            a._hasTimer || (a._hasTimer = !0, !Ha && c.html5PollingInterval && (null === Y && 0 === ka && (Y = i.setInterval(Va, c.html5PollingInterval)), ka++))
        };
        Ua = function(a) {
            a._hasTimer && (a._hasTimer = !1, !Ha && c.html5PollingInterval && ka--)
        };
        Va = function() {
            var a;
            if (null !== Y && !ka) return i.clearInterval(Y), Y = null, !1;
            for (a = c.soundIDs.length - 1; 0 <= a; a--) c.sounds[c.soundIDs[a]].isHTML5 && c.sounds[c.soundIDs[a]]._hasTimer && c.sounds[c.soundIDs[a]]._onTimer()
        };
        N = function(a) {
            a = void 0 !== a ? a : {};
            "function" === typeof c.onerror && c.onerror.apply(i, [{
                type: void 0 !== a.type ? a.type : null
            }]);
            void 0 !== a.fatal && a.fatal && c.disable()
        };
        $a = function() {
            if (!Ia || !Da()) return !1;
            var a = c.audioFormats,
                d, e;
            for (e in a)
                if (a.hasOwnProperty(e) && ("mp3" === e || "mp4" === e))
                    if (c._wD("soundManager: Using flash fallback for " + e + " format"), c.html5[e] = !1, a[e] && a[e].related)
                        for (d = a[e].related.length - 1; 0 <= d; d--) c.html5[a[e].related[d]] = !1
        };
        this._setSandboxType = function(a) {
            var d = c.sandbox;
            d.type = a;
            d.description = d.types[void 0 !== d.types[a] ? a : "unknown"];
            c._wD("Flash security sandbox type: " + d.type);
            "localWithFile" === d.type ? (d.noRemote = !0, d.noLocal = !1, m("secNote", 2)) : "localWithNetwork" === d.type ? (d.noRemote = !1, d.noLocal = !0) : "localTrusted" === d.type && (d.noRemote = !1, d.noLocal = !1)
        };
        this._externalInterfaceOK = function(a, d) {
            if (c.swfLoaded) return !1;
            var e, b = (new Date).getTime();
            c._wD("soundManager::externalInterfaceOK()" + (a ? " (~" + (b - a) + " ms)" : ""));
            y("swf", !0);
            y("flashtojs", !0);
            c.swfLoaded = !0;
            na = !1;
            Ia && $a();
            if (!d || d.replace(/\+dev/i, "") !== c.versionNumber.replace(/\+dev/i, "")) return e = 'soundManager: Fatal: JavaScript file build "' + c.versionNumber + '" does not match Flash SWF build "' + d + '" at ' + c.url + ". Ensure both are up-to-date.", setTimeout(function() {
                throw Error(e)
            }, 0), !1;
            setTimeout(ra, F ? 100 : 1)
        };
        ga = function(a, d) {
            function e() {
                c._wD("-- SoundManager 2 " + c.version + (!c.html5Only && c.useHTML5Audio ? c.hasHTML5 ? " + HTML5 audio" : ", no HTML5 audio support" : "") + (!c.html5Only ? (c.useHighPerformance ? ", high performance mode, " : ", ") + ((c.flashPollingInterval ? "custom (" + c.flashPollingInterval + "ms)" : "normal") + " polling") + (c.wmode ? ", wmode: " + c.wmode : "") + (c.debugFlash ? ", flash debug mode" : "") + (c.useFlashBlock ? ", flashBlock mode" : "") : "") + " --", 1)
            }

            function b(a, b) {
                return '<param name="' + a + '" value="' + b + '" />'
            }
            if (S && T) return !1;
            if (c.html5Only) return va(), e(), c.oMC = A(c.movieID), ra(), T = S = !0, !1;
            var f = d || c.url,
                g = c.altURL || f,
                i = fa(),
                h = O(),
                k = null,
                k = j.getElementsByTagName("html")[0],
                l, q, n, k = k && k.dir && k.dir.match(/rtl/i),
                a = void 0 === a ? c.id : a;
            va();
            c.url = Ra(Q ? f : g);
            d = c.url;
            c.wmode = !c.wmode && c.useHighPerformance ? "transparent" : c.wmode;
            if (null !== c.wmode && (u.match(/msie 8/i) || !F && !c.useHighPerformance) && navigator.platform.match(/win32|win64/i)) m("spcWmode"), c.wmode = null;
            i = {
                name: a,
                id: a,
                src: d,
                quality: "high",
                allowScriptAccess: c.allowScriptAccess,
                bgcolor: c.bgColor,
                pluginspage: eb + "www.macromedia.com/go/getflashplayer",
                title: "JS/Flash audio component (SoundManager 2)",
                type: "application/x-shockwave-flash",
                wmode: c.wmode,
                hasPriority: "true"
            };
            c.debugFlash && (i.FlashVars = "debug=1");
            c.wmode || delete i.wmode;
            if (F) f = j.createElement("div"), q = ['<object id="' + a + '" data="' + d + '" type="' + i.type + '" title="' + i.title + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="' + eb + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">', b("movie", d), b("AllowScriptAccess", c.allowScriptAccess), b("quality", i.quality), c.wmode ? b("wmode", c.wmode) : "", b("bgcolor", c.bgColor), b("hasPriority", "true"), c.debugFlash ? b("FlashVars", i.FlashVars) : "", "</object>"].join("");
            else
                for (l in f = j.createElement("embed"), i) i.hasOwnProperty(l) && f.setAttribute(l, i[l]);
            xa();
            h = O();
            if (i = fa())
                if (c.oMC = A(c.movieID) || j.createElement("div"), c.oMC.id) n = c.oMC.className, c.oMC.className = (n ? n + " " : "movieContainer") + (h ? " " + h : ""), c.oMC.appendChild(f), F && (l = c.oMC.appendChild(j.createElement("div")), l.className = "sm2-object-box", l.innerHTML = q), T = !0;
                else {
                    c.oMC.id = c.movieID;
                    c.oMC.className = "movieContainer " + h;
                    l = h = null;
                    c.useFlashBlock || (c.useHighPerformance ? h = {
                        position: "fixed",
                        width: "8px",
                        height: "8px",
                        bottom: "0px",
                        left: "0px",
                        overflow: "hidden"
                    } : (h = {
                        position: "absolute",
                        width: "6px",
                        height: "6px",
                        top: "-9999px",
                        left: "-9999px"
                    }, k && (h.left = Math.abs(parseInt(h.left, 10)) + "px")));
                    lb && (c.oMC.style.zIndex = 1e4);
                    if (!c.debugFlash)
                        for (n in h) h.hasOwnProperty(n) && (c.oMC.style[n] = h[n]);
                    try {
                        F || c.oMC.appendChild(f), i.appendChild(c.oMC), F && (l = c.oMC.appendChild(j.createElement("div")), l.className = "sm2-object-box", l.innerHTML = q), T = !0
                    } catch (r) {
                        throw Error(p("domError") + " \n" + r.toString())
                    }
                }
            S = !0;
            e();
            c._wD("soundManager::createMovie(): Trying to load " + d + (!Q && c.altURL ? " (alternate URL)" : ""), 1);
            return !0
        };
        ea = function() {
            if (c.html5Only) return ga(), !1;
            if (g) return !1;
            if (!c.url) return m("noURL"), !1;
            g = c.getMovie(c.id);
            g || (W ? (F ? c.oMC.innerHTML = ya : c.oMC.appendChild(W), W = null, S = !0) : ga(c.id, c.url), g = c.getMovie(c.id));
            g && m("waitEI");
            "function" === typeof c.oninitmovie && setTimeout(c.oninitmovie, 1);
            return !0
        };
        L = function() {
            setTimeout(Oa, 1e3)
        };
        Oa = function() {
            var a, d = !1;
            if (!c.url || X) return !1;
            X = !0;
            r.remove(i, "load", L);
            if (na && !Ja) return m("waitFocus"), !1;
            n || (a = c.getMoviePercent(), c._wD(p("waitImpatient", 0 < a ? " (SWF " + a + "% loaded)" : "")), 0 < a && 100 > a && (d = !0));
            setTimeout(function() {
                a = c.getMoviePercent();
                if (d) return X = !1, c._wD(p("waitSWF")), i.setTimeout(L, 1), !1;
                n || (c._wD("soundManager: No Flash response within expected time.\nLikely causes: " + (0 === a ? "Loading " + c.movieURL + " may have failed (and/or Flash " + k + "+ not present?), " : "") + "Flash blocked or JS-Flash security error." + (c.debugFlash ? " " + p("checkSWF") : ""), 2), !Q && a && (m("localFail", 2), c.debugFlash || m("tryDebug", 2)), 0 === a && c._wD(p("swf404", c.url)), y("flashtojs", !1, ": Timed out" + Q ? " (Check flash security or flash blockers)" : " (No plugin/missing SWF?)"));
                !n && cb && (null === a ? c.useFlashBlock || 0 === c.flashLoadTimeout ? (c.useFlashBlock && za(), m("waitForever")) : ha(!0) : 0 === c.flashLoadTimeout ? m("waitForever") : ha(!0))
            }, c.flashLoadTimeout)
        };
        ca = function() {
            if (Ja || !na) return r.remove(i, "focus", ca), !0;
            Ja = cb = !0;
            m("gotFocus");
            X = !1;
            L();
            r.remove(i, "focus", ca);
            return !0
        };
        ab = function() {
            var a, d = [];
            if (c.useHTML5Audio && c.hasHTML5) {
                for (a in c.audioFormats) c.audioFormats.hasOwnProperty(a) && d.push(a + ": " + c.html5[a] + (!c.html5[a] && t && c.flash[a] ? " (using flash)" : c.preferFlash && c.flash[a] && t ? " (preferring flash)" : !c.html5[a] ? " (" + (c.audioFormats[a].required ? "required, " : "") + "and no flash support)" : ""));
                c._wD("-- SoundManager 2: HTML5 support tests (" + c.html5Test + "): " + d.join(", ") + " --", 1)
            }
        };
        U = function(a) {
            if (n) return !1;
            if (c.html5Only) return c._wD("-- SoundManager 2: loaded --"), n = !0, K(), y("onload", !0), !0;
            var d = !0,
                e;
            if (!c.useFlashBlock || !c.flashLoadTimeout || c.getMoviePercent()) n = !0, v && (e = {
                type: !t && B ? "NO_FLASH" : "INIT_TIMEOUT"
            });
            c._wD("-- SoundManager 2 " + (v ? "failed to load" : "loaded") + " (" + (v ? "Flash security/load error" : "OK") + ") --", 1);
            v || a ? (c.useFlashBlock && c.oMC && (c.oMC.className = O() + " " + (null === c.getMoviePercent() ? "swf_timedout" : "swf_error")), J({
                type: "ontimeout",
                error: e,
                ignoreInit: !0
            }), y("onload", !1), N(e), d = !1) : y("onload", !0);
            v || (c.waitForWindowLoad && !ba ? (m("waitOnload"), r.add(i, "load", K)) : (c.waitForWindowLoad && ba && m("docLoaded"), K()));
            return d
        };
        Na = function() {
            var a, d = c.setupOptions;
            for (a in d) d.hasOwnProperty(a) && (void 0 === c[a] ? c[a] = d[a] : c[a] !== d[a] && (c.setupOptions[a] = c[a]))
        };
        ra = function() {
            m("init");
            if (n) return m("didInit"), !1;
            if (c.html5Only) return n || (r.remove(i, "load", c.beginDelayedInit), c.enabled = !0, U()), !0;
            ea();
            try {
                m("flashJS"), g._externalInterfaceTest(!1), Pa(!0, c.flashPollingInterval || (c.useHighPerformance ? 10 : 50)), c.debugMode || g._disableDebug(), c.enabled = !0, y("jstoflash", !0), c.html5Only || r.add(i, "unload", qa)
            } catch (a) {
                return c._wD("js/flash exception: " + a.toString()), y("jstoflash", !1), N({
                    type: "JS_TO_FLASH_EXCEPTION",
                    fatal: !0
                }), ha(!0), U(), !1
            }
            U();
            r.remove(i, "load", c.beginDelayedInit);
            return !0
        };
        M = function() {
            if (V) return !1;
            V = !0;
            Na();
            xa();
            var a = null,
                a = null,
                d = void 0 !== G.console && "function" === typeof console.log,
                e = R.toLowerCase(); - 1 !== e.indexOf("sm2-usehtml5audio=") && (a = "1" === e.charAt(e.indexOf("sm2-usehtml5audio=") + 18), d && console.log((a ? "Enabling " : "Disabling ") + "useHTML5Audio via URL parameter"), c.setup({
                useHTML5Audio: a
            })); - 1 !== e.indexOf("sm2-preferflash=") && (a = "1" === e.charAt(e.indexOf("sm2-preferflash=") + 16), d && console.log((a ? "Enabling " : "Disabling ") + "preferFlash via URL parameter"), c.setup({
                preferFlash: a
            }));
            !t && c.hasHTML5 && (c._wD("SoundManager: No Flash detected" + (!c.useHTML5Audio ? ", enabling HTML5." : ". Trying HTML5-only mode.")), c.setup({
                useHTML5Audio: !0,
                preferFlash: !1
            }));
            Xa();
            c.html5.usingFlash = Wa();
            B = c.html5.usingFlash;
            ab();
            !t && B && (m("needFlash"), c.setup({
                flashLoadTimeout: 1
            }));
            j.removeEventListener && j.removeEventListener("DOMContentLoaded", M, !1);
            ea();
            return !0
        };
        Ca = function() {
            "complete" === j.readyState && (M(), j.detachEvent("onreadystatechange", Ca));
            return !0
        };
        wa = function() {
            ba = !0;
            r.remove(i, "load", wa)
        };
        Da();
        r.add(i, "focus", ca);
        r.add(i, "load", L);
        r.add(i, "load", wa);
        j.addEventListener ? j.addEventListener("DOMContentLoaded", M, !1) : j.attachEvent ? j.attachEvent("onreadystatechange", Ca) : (y("onload", !1), N({
            type: "NO_DOM2_EVENTS",
            fatal: !0
        }))
    }
    var pa = null;
    if (void 0 === G.SM2_DEFER || !SM2_DEFER) pa = new $;
    G.SoundManager = $;
    G.soundManager = pa
})(window);
var Flasher, bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments)
    }
};
Flasher = function() {
    function Flasher() {
        this.flash = bind(this.flash, this);
        this.b = [];
        this.c = 0;
        this.d = 0
    }
    Flasher.prototype.flash = function() {
        this.d += 1;
        if (this.d === this.b.length) {
            this.d = 0
        }
        if (this.c === 1) {
            document.title = this.b[this.d];
            return setTimeout(this.flash, 1e3)
        }
    };
    Flasher.prototype.remind = function(g) {
        this.b[1] = g;
        $(window).one("focus", function(_this) {
            return function() {
                _this.c = 2;
                return document.title = _this.b[0]
            }
        }(this));
        if (this.c === 0) {
            this.b[0] = document.title
        }
        if (this.c !== 1) {
            this.c = 1;
            return this.flash()
        }
    };
    return Flasher
}();
var Camera, bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments)
    }
};
Camera = function() {
    function Camera() {
        this.streamCreated = bind(this.streamCreated, this);
        this.sessionConnected = bind(this.sessionConnected, this);
        this.inited = false;
        this.username = null;
        this.apikey = null;
        this.session = null;
        this.mytoken = null;
        this.nodevices = false;
        this.subscribers = {};
        this.publisher = null
    }
    Camera.prototype.init = function() {
        return this.inited = true
    };
    Camera.prototype.join_session = function(sid, token) {
        if (!this.inited) {
            return
        }
        if (this.session) {
            this.leave_session()
        }
        this.session = OT.initSession(this.apikey, sid);
        this.session.on("sessionConnected", this.sessionConnected);
        this.session.on("streamCreated", this.streamCreated);
        return this.session.connect(token, function() {
            return $("#cam").slideDown()
        })
    };
    Camera.prototype.devicesDetected = function(e) {
        if (e.cameras.length < 1 && e.microphone.length < 1) {
            this.nodevices = true;
            if (this.publisher) {
                return this.publisher.unpublish("publisher")
            }
        }
    };
    Camera.prototype.leave_session = function() {
        if (!this.inited || !this.session) {
            return
        }
        this.session.disconnect();
        this.session = null;
        $("#publisher, #subscribers").html("");
        return $("#cam").slideUp()
    };
    Camera.prototype.sessionConnected = function(event) {
        var div;
        div = $("<div/>").attr("id", "publisher");
        $("#cam").prepend(div);
        if (!this.nodevices) {
            this.publisher = this.session.publish("publisher", {
                width: 150,
                height: 150,
                style: {
                    nameDisplayMode: "on"
                },
                name: this.username
            });
            this.publisher.on("accessDenied", function() {
                return $("#publisher").remove()
            })
        }
        return this.subscribeStreams(event.streams)
    };
    Camera.prototype.streamCreated = function(event) {
        return this.subscribeStreams(event.streams)
    };
    Camera.prototype.subscribeStreams = function(streams) {
        var div, i, len, results, stream;
        results = [];
        for (i = 0, len = streams.length; i < len; i++) {
            stream = streams[i];
            if (stream.connection.connectionId !== this.session.connection.connectionId) {
                div = $("<div/>").attr("id", stream.streamId).attr("class", "subscriber");
                $("#subscribers").append(div);
                results.push(this.subscribers[stream.streamId] = this.session.subscribe(stream, stream.streamId, {
                    width: 150,
                    height: 150,
                    style: {
                        nameDisplayMode: "on"
                    }
                }))
            } else {
                results.push(void 0)
            }
        }
        return results
    };
    return Camera
}();
window.Camera = Camera;
var OFFSET_LEFT, OFFSET_TOP, PieRender, Sound, any_in_object, app, bound, classroom_tmpl, clone, color_from_hue, distance, enclose, find_hash_key, gamecounter, message_tmpl, rand, rand_between, remove, rgb_to_hex, role_info_tmpl, indexOf = [].indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item) return i
    }
    return -1
};
app = angular.module("MafiaApp", ["emoteFilter", "ngCookies"]);
OFFSET_TOP = parseInt($("#canvas-player-area").css("top"));
OFFSET_LEFT = parseInt($("#canvas-player-area").css("left"));
app.directive("ngBindHtmlUnsafe", [function() {
    return function(scope, element, attr) {
        element.addClass("ng-binding").data("$binding", attr.ngBindHtmlUnsafe);
        return scope.$watch(attr.ngBindHtmlUnsafe, function(value) {
            return element.html(value || "")
        })
    }
}]);
enclose = function(h) {
    var c;
    c = $("<div/>");
    c.html(h);
    return c
};
rand = function(num) {
    return Math.floor(Math.random() * num)
};
rand_between = function(left, right) {
    var diff;
    diff = right - left;
    if (!(diff > 0)) {
        return 0
    }
    return left + rand(diff)
};
distance = function(pos1, pos2) {
    var d, diff_left, diff_top;
    diff_top = Math.abs(pos2.top - pos1.top);
    diff_left = Math.abs(pos2.left - pos1.left);
    d = Math.sqrt(Math.pow(diff_top, 2) + Math.pow(diff_left, 2));
    return d
};
bound = function(num, low, high) {
    if (num < low) {
        return low
    }
    if (num > high) {
        return high
    }
    return num
};
any_in_object = function(obj, cb) {
    var a, k, l, len;
    for (a = l = 0, len = obj.length; l < len; a = ++l) {
        k = obj[a];
        if (cb(a)) {
            return true
        }
    }
    return false
};
remove = function(arr, e) {
    var ref, t;
    if ((t = arr.indexOf(e)) > -1) {
        return [].splice.apply(arr, [t, t - t + 1].concat(ref = [])), ref
    }
};
window.escapeHtml = function(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
};
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj) {
        var i, k, l, len;
        for (i = l = 0, len = this.length; l < len; i = ++l) {
            k = this[i];
            if (k === obj) {
                return i
            }
        }
        return -1
    }
}
find_hash_key = function(hash, cb) {
    var k, v;
    for (k in hash) {
        v = hash[k];
        if (cb(v)) {
            return k
        }
    }
    return null
};
clone = function(obj) {
    var i, key;
    if (obj == null || typeof obj !== "object") {
        return obj
    }
    i = new obj.constructor;
    for (key in obj) {
        i[key] = clone(obj[key])
    }
    return i
};
color_from_hue = function(hue) {
    var c, color, h, i, x;
    h = hue / 60;
    c = 255;
    x = (1 - Math.abs(h % 2 - 1)) * 255;
    i = Math.floor(h);
    color = null;
    color = function() {
        switch (i) {
            case 0:
                return rgb_to_hex(c, x, 0);
            case 1:
                return rgb_to_hex(x, c, 0);
            case 2:
                return rgb_to_hex(0, c, x);
            case 3:
                return rgb_to_hex(0, x, c);
            case 4:
                return rgb_to_hex(c, 0, x)
        }
    }();
    return color
};
rgb_to_hex = function(red, green, blue) {
    var h;
    h = (red << 16 | green << 8 | blue).toString(16);
    while (h.length < 6) {
        h = "0" + h
    }
    return "#" + h
};
window.rainbownize = function(text) {
    var i, msg;
    msg = function() {
        var l, ref, results;
        results = [];
        for (i = l = 0, ref = text.length; 0 <= ref ? l <= ref : l >= ref; i = 0 <= ref ? ++l : --l) {
            results.push("<span class='rainbowchar' style='color:hsl(" + Math.round(i * 360 / text.length) + ",50%,50%)'>" + text.charAt(i) + "</span>")
        }
        return results
    }();
    return msg.join("")
};
message_tmpl = Handlebars.compile("{{#if new_meet}}\n  <div class='new_meet'>@ {{new_meet}} meeting</div>\n{{/if}}\n<div id='cursay' class='talk {{#if dead}}dead{{/if}}'>\n  \n  <div class='timestamp'>\n  {{#if timestamp}}\n    {{{timestamp}}}\n  {{/if}}\n  </div>\n  {{#if contact}} \n    {{#if user}}\n      <b class='sayimg_{{user}} contacting'> {{user}} contacted {{#if role}}the {{role}}{{else}}{{target}}{{/if}}: </b><span class='msg_wrapper'><div>{{{msg}}}</div></span></div>\n    {{else}}\n      <b>You received a message: </b><span class='special msg_wrapper'>{{{msg}}}</span></div>\n    {{/if}}\n  {{/if}}\n  {{#if crying}}\n    <b class='grey'>Someone cries out</b><span class='special msg_wrapper'>{{{msg}}}</span>\n  {{/if}} \n  {{#if ventrilo}}\n    <input type='hidden' class='talk_username' value='{{ventuser}}'/><b class='sayimg_{{user}}'> {{user}}</b><b class='space'> disguises as </b><b class='sayimg_{{ventuser}}'> {{ventuser}}</b><b class='space'> at {{#if vent_everyone}} everyone</b>{{else}}</b><b class='sayimg_{{venttarget}}'>{{venttarget}}</b>{{/if}}<span class='special regular msg_wrapper'>{{{msg}}}</span></div>\n  {{/if}}\n  {{#if whisper}}\n    <b class='sayimg_{{user}}'> {{user}}</b><b class='space'>whispers to</b><b class='sayimg_{{whisper}}'> {{whisper}}</b><span class='special msg_wrapper'>{{{msg}}}</span></div>\n  {{/if}}\n  {{#if regular}}\n    {{#if user}}<div class='name'><input type='hidden' class='talk_username' value='{{user}}'/><b class='sayimg_{{user}} name' {{#if usercolor}}style=\"color:{{usercolor}}\"{{/if}}> {{user}}</b></div>{{#if directed}}<div class='directed_name'><span class='at_symbol'>@</span><b>{{directed}}</b></div>{{/if}}{{else}}<b class='grey'>Someone whispers </b>{{/if}}<span class=\"msg_wrapper {{#if grey}}meing{{/if}} {{#if directed}}{{directed}}{{/if}}\">{{#if quote}}<div class='quote_target'>{{target}} said</div>{{/if}}<div class='{{#if quote}}quote{{else}}{{#if day}}regular{{/if}}{{/if}} msg {{#if green}}olive{{/if}} {{#if grey}}meing{{/if}}' {{#if textcolor}}style='color:{{textcolor}}'{{/if}}>{{{msg}}}</div></span></div>\n  {{/if}}\n</div>");
classroom_tmpl = Handlebars.compile("<div class='classroom_talk'>\n  <b>{{user}}:</b>\n  <span>{{{msg}}}</span>\n</div>");
role_info_tmpl = Handlebars.compile('<div id="trackrole_" class="roleimg role-unknown"/>\n{{#each this}}\n  <div id="trackrole_{{id}}" class=\'roleimg role-{{id}} {{#if red}}mafia_red{{/if}}\' {{#if custom}}style="background-image:url({{avatar}})"{{/if}}></div>\n{{/each}}');
app.directive("ngFocus", ["$parse", function($parse) {
    return function(scope, element, attr) {
        var fn;
        fn = $parse(attr["ngFocus"]);
        return element.bind("focus", function(event) {
            return scope.$apply(function() {
                return fn(scope, {
                    $event: event
                })
            })
        })
    }
}]);
app.directive("ngBlur", ["$parse", function($parse) {
    return function(scope, element, attr) {
        var fn;
        fn = $parse(attr["ngBlur"]);
        return element.bind("blur", function(event) {
            return scope.$apply(function() {
                return fn(scope, {
                    $event: event
                })
            })
        })
    }
}]);
app.filter("filter_alive", function() {
    return function(input) {
        var k, output, v;
        output = [];
        for (k in input) {
            v = input[k];
            if (v.status === "alive") {
                output.push(v)
            }
        }
        return output
    }
});
app.filter("filter_not_alive", function() {
    return function(input) {
        var k, output, v;
        output = [];
        for (k in input) {
            v = input[k];
            if (v.status !== "alive") {
                output.push(v)
            }
        }
        return output
    }
});
app.factory("socket", ["$rootScope", "$window", function($rootScope, $window) {
    return {
        num_connects: 0,
        incr_connects: function() {
            return this.num_connects += 1
        },
        connect: function() {
            this.remove_bindings();
            return this.sock = new Primus($window.mafia_url, {
                reconnect: {
                    retries: 10
                }
            })
        },
        remove_bindings: function() {
            if (!this.sock) {
                return
            }
            this.sock.removeAllListeners();
            return delete this.sock
        },
        close: function() {
            if (!this.sock) {
                return
            }
            return this.sock.end()
        },
        on: function(event_name, callback) {
            var socket;
            socket = this.sock;
            return this.sock.on(event_name, function() {
                var args;
                args = arguments;
                if (event_name === "end") {
                    return callback.apply(socket, args)
                } else {
                    return $rootScope.$apply(function() {
                        return callback.apply(socket, args)
                    })
                }
            })
        },
        sendcmd: function(cmd, data) {
            var k, pkg, v;
            if ($window.development) {
                console.log("sending:", cmd, data)
            }
            pkg = [cmd];
            if (data != null && function() {
                    var results;
                    results = [];
                    for (k in data) {
                        v = data[k];
                        results.push(k)
                    }
                    return results
                }().length) {
                pkg.push(data)
            }
            return this.sock.write(JSON.stringify(pkg))
        }
    }
}]);
app.controller("GameCtrl", ["$scope", "$http", "$window", "$document", "$timeout", "socket", "$filter", "$cookieStore", function($scope, $http, $window, $document, $timeout, socket, $filter, $cookieStore) {
    var base, gamecmd_map, init_player_and_users, k, play_background_music, ref, transform_cmd, transform_shorten, unwrap_canvas_data, v;
    if (!$window.development && (typeof OT !== "undefined" && OT !== null)) {
        OT.setLogLevel(TB.NONE)
    }
    $scope.mobile = window.mobile_layout;
    $scope.new_chat = 0;
    $scope.new_meetings = 0;
    $scope.owner = false;
    $scope.role_data = $window.role_data;
    $scope.setup_id = $window.setup_id;
    $scope.game_id = $window.game_id;
    $scope.uid = $window.uid;
    $scope.user = $window.user;
    $scope.mentor = $window.mentor;
    $scope.mentee = $window.mentee;
    $scope.user_list = [];
    $scope.users = {};
    $scope.mentors = {};
    $scope.students = [];
    $scope.classrooms = {};
    $scope.num_mentors = 0;
    $scope.actual_users = {};
    $scope.selected_user = null;
    $scope.gamestate = 0;
    $scope.current_state = 0;
    $scope.screens = {};
    $scope.active_screen = {};
    $scope.is_current = false;
    $scope.meetings = {};
    $scope.current_meet = null;
    $scope.gameoptions = {};
    $scope.options = $window.options;
    $scope.current_window_html = "";
    $scope.current_cmds_html = "";
    $scope.record = $window.record;
    $scope.ranked = $window.ranked;
    $scope.compete = $window.compete;
    $scope.connected = false;
    $scope.spectate = false;
    $scope.show_startcounter = false;
    $scope.waiting = $window.target;
    $scope.anonymous = false;
    $scope.show_typing = true;
    $scope.can_speak = true;
    $scope.speak_meetings = [];
    $scope.chat_timestamp = null;
    $scope.system_messages = [];
    $scope.mode = "text";
    $scope.last_z_index = 10;
    $scope.anonymous_speaker = {
        speech: "",
        speech_id: "anonymous-speech-bubble",
        speech_timeout: null,
        spoke: false,
        z_index: 10
    };
    $scope.past = {};
    $window._custom_emotes = $window.lobby_emotes;
    $scope.settings = {
        fullscreen: false,
        timestamp: false,
        voting: false,
        acronym: false,
        muting: false,
        emoticons: false,
        mutemusic: false
    };
    $scope.settings_fnc = {
        mutemusic: function() {
            var ref, ref1;
            if ($scope.settings.mutemusic) {
                if ((ref = $window.sound.sounds.day) != null) {
                    ref.stop()
                }
                return (ref1 = $window.sound.sounds.night) != null ? ref1.stop() : void 0
            } else {
                return play_background_music()
            }
        },
        muting: function() {
            if ($scope.settings.muting) {
                return $window.sound.mute()
            } else {
                return $window.sound.unmute()
            }
        }
    };
    play_background_music = function() {
        if ($scope.mobile || $scope.record || $scope.settings.mutemusic) {
            return
        }
        $window.sound.stopAll();
        if ($scope.current_state > 0) {
            if ($scope.current_state % 2 === 0) {
                return $window.sound.play("day", {
                    loop: 100
                })
            } else {
                return $window.sound.play("night", {
                    loop: 100
                })
            }
        }
    };
    $scope.previouswill = null;
    $scope.lastwill = "";
    $scope.speak = {
        types: {},
        data: {}
    };
    $scope.kicks_needed = 1;
    $scope.kick_state = 0;
    $scope.inputs_needed = 0;
    $scope.$watch("kicks_needed", function() {
        var i;
        $scope.kicks_html = function() {
            var l, ref, results;
            results = [];
            for (i = l = 1, ref = $scope.kicks_needed; 1 <= ref ? l <= ref : l >= ref; i = 1 <= ref ? ++l : --l) {
                results.push({
                    html: "&#10006;"
                })
            }
            return results
        }();
        if ($scope.kicks_needed === 0) {
            $scope.kick_state = 3;
            kickcounter.settime(15, "#kickseconds");
            kickcounter.run();
            return window.sound.play("warning")
        }
    });
    $scope.$watch("mode", function() {
        $("#typebox").focus();
        if ($scope.mode === "text") {
            return $scope.scroll_to_bottom("window")
        }
    });
    $scope.$watch("waiting", function() {
        if ($scope.waiting === 0) {
            $scope.show_startcounter = true;
            $window.startcounter.settime(10, "#startseconds");
            return $window.startcounter.run()
        } else {
            $scope.show_startcounter = false;
            return $window.startcounter.stop()
        }
    });
    $(document).delegate("#window", "resize", function() {
        return $scope.active_scroll("window")
    });
    $(document).delegate(".regular", "dblclick", function() {
        var cont, data, msg, name;
        cont = $(this).clone();
        cont.find(".acronym_descr").remove();
        msg = cont.text();
        name = $(this).closest(".talk").find(".talk_username").val();
        data = {
            msg: msg,
            quote: true,
            target: name
        };
        if ($scope.current_state > 0 && $scope.current_meet) {
            data.meet = $scope.current_meet
        }
        socket.sendcmd("<", data);
        return false
    });
    $(document).delegate(".talk > .name", "click", function() {
        var name;
        name = $(this).find(".talk_username").val();
        $("#typebox").val("@" + name + " ");
        $("#typebox").focus();
        return false
    });
    $(document).on("click", "[id^=trackrole_]", function() {
        var roleid, username;
        roleid = $(this).attr("id").split("_")[1];
        username = $(this).parent(".select_possible_tip").data("uname");
        if ($scope.current_screen.users[username].revealed) {
            return false
        }
        $scope.$apply(function() {
            return $scope.select_role(username, roleid)
        });
        $(".tip").fadeOut().remove();
        return false
    });
    $(document).on("click", ".user_li > .roleimg", function() {
        var id, info, role_info_str, roles, tooltip, username, v;
        $(".tip").remove();
        username = $(this).parent(".user_li").data("uname");
        if ($scope.current_screen.users[username].revealed) {
            return false
        }
        roles = function() {
            var ref, results;
            ref = window.role_infos;
            results = [];
            for (id in ref) {
                v = ref[id];
                info = clone(v);
                info.id = v.id;
                results.push(info)
            }
            return results
        }();
        role_info_str = role_info_tmpl(roles);
        tooltip = window.center_tooltip(this, "<div data-uname='" + username + "' class='tip_body select_possible_tip'><div class='close_modal' data-closest='.tip' data-type='remove' />" + role_info_str + "</div>", "right");
        $(this).data("sel", true);
        return false
    });
    $(document).on("click", ".canvas", function(e) {
        var i, offset, x, y;
        offset = $(this).offset();
        x = e.clientX - offset.left + document.body.scrollLeft - OFFSET_LEFT;
        y = e.clientY - offset.top + document.body.scrollTop - OFFSET_TOP;
        socket.sendcmd("move", {
            pos: function() {
                var l, len, ref, results;
                ref = [x, y];
                results = [];
                for (l = 0, len = ref.length; l < len; l++) {
                    i = ref[l];
                    results.push(Math.round(i))
                }
                return results
            }()
        });
        return e.preventDefault()
    });
    $(document).on("click", ".inputchoice", function() {
        var __, choice, cmd, data, field, id, meet, ref;
        meet = $(this).data("meet");
        ref = $(this).attr("id").split("_"), __ = ref[0], field = ref[1], choice = ref[2];
        if (!meet) {
            data = {};
            id = $(this).data("id");
            data["id"] = id;
            data["input"] = {};
            data["input"][field] = choice;
            socket.sendcmd("input", data)
        } else {
            cmd = $(this).closest(".input").attr("id").split("_")[1];
            data = {
                meet: meet
            };
            data[field] = choice;
            socket.sendcmd(cmd, data);
            false
        }
        return false
    });
    $(document).on("click", ".one_booth_choice", function() {
        var c;
        c = $(this).attr("id").split("_");
        socket.sendcmd("point", {
            meet: c[2],
            target: c[3]
        });
        return false
    });
    $(document).on("click", ".inputchoice_text_submit", function() {
        var cmd, data, meet, text;
        meet = $(this).data("meet");
        text = $(this).siblings(".inputchoice_text:first").val();
        cmd = $(this).closest(".input").attr("id").split("_")[1];
        data = {
            meet: meet,
            text: text
        };
        socket.sendcmd(cmd, data);
        return false
    });
    $("#form_lastwill textarea").keyup(function(e) {
        var code, ref;
        code = (ref = e.keyCode) != null ? ref : e.which;
        limittext(this, 100);
        switch (code) {
            case 13:
                $scope.update_will();
                return e.preventDefault()
        }
    });
    if (window.ranked) {
        $(window).on("keydown", function(e) {
            if (e.target.value === void 0) {
                return $("#typebox").focus()
            }
        })
    }
    $(document).on("keydown", "#typebox", function(_this) {
        return function(e) {
            var keycode, l, len, m, n, r, ref, reference, str, term, text, username;
            keycode = e.keyCode || e.which;
            if (keycode === 9 && !event.shiftKey) {
                e.preventDefault();
                text = $("#typebox").val();
                if (!text) {
                    return false
                }
                n = text.lastIndexOf(" ");
                m = null;
                r = false;
                if (n >= 0) {
                    term = text.substr(n + 1);
                    m = false
                } else {
                    if (text[0] === "@") {
                        term = text.substr(1);
                        n = 0;
                        m = false
                    } else {
                        term = text;
                        m = true
                    }
                }
                reference = term[0] === "%";
                if (reference) {
                    term = term.substr(1)
                }
                if (term.length > 1) {
                    ref = $scope.user_list;
                    for (l = 0, len = ref.length; l < len; l++) {
                        username = ref[l];
                        if (username.replace("(", "").toLowerCase().indexOf(term.toLowerCase()) === 0) {
                            str = username;
                            if (reference) {
                                str = "%" + str
                            }
                            if (!m) {
                                str = text.substring(0, n + 1) + str
                            }
                            $("#typebox").val(str)
                        }
                    }
                }
                return true
            }
        }
    }(this));
    $scope.disconnect = function() {
        return socket.close()
    };
    $scope.say_classroom = function(mentor, student, data) {
        return $scope.classrooms[mentor + ":" + student] += data
    };
    $scope.toggle_classroom = function(id) {
        if (!$scope.classrooms[id]) {
            return
        }
        return $scope.classrooms[id].hidden = !$scope.classrooms[id].hidden
    };
    $scope.add_classroom = function(mentor, student) {
        var id;
        id = mentor + ":" + student;
        if ($scope.classrooms[id]) {
            return
        }
        return $scope.classrooms[id] = {
            id: rand(1e4),
            mentor_id: mentor.toString(),
            msg: "",
            input: ""
        }
    };
    $scope.remove_classroom = function(id) {
        return delete $scope.classrooms[id]
    };
    $scope.classroom_keypress = function($event, id) {
        var keycode;
        keycode = $event.keyCode;
        if (keycode === 13) {
            socket.sendcmd("<", {
                classroom: id,
                msg: $scope.classrooms[id].input
            });
            return $scope.classrooms[id].input = ""
        }
    };
    $scope.reset_meetings = function(username) {
        return $scope.modify_html("cmds", function(el) {
            return el.find("div.meetbox[id]:not(.ended) [id^=target_]:contains('" + username + "')").each(function() {
                if (!$scope.dead) {
                    $(this).closest(".meetbox").find(".votebooth").show()
                }
                return $(this).text("voted for a dead person.")
            })
        })
    };
    $scope.toggle_setting = function(setting) {
        var base;
        $scope.settings[setting] = !$scope.settings[setting];
        if (typeof(base = $scope.settings_fnc)[setting] === "function") {
            base[setting]()
        }
        if ($scope.settings[setting]) {
            if (!$cookieStore.get(setting)) {
                return $cookieStore.put(setting, true)
            }
        } else {
            return $cookieStore.remove(setting)
        }
    };
    ref = $scope.settings;
    for (k in ref) {
        v = ref[k];
        if ($cookieStore.get(k)) {
            $scope.settings[k] = true;
            if (typeof(base = $scope.settings_fnc)[k] === "function") {
                base[k]()
            }
        }
    }
    $scope.stop_kick = function() {
        return $timeout.cancel($scope.kick_count)
    };
    $scope.addtime_kick = function(start, total_milli) {
        $scope.kick_start = start;
        $scope.kick_total_milli = total_milli;
        if ($scope.kick_count) {
            $timeout.cancel($scope.kick_count)
        }
        $scope.kick_total = Math.floor($scope.kick_total_milli / 1e3);
        return $scope.synchronize_kick()
    };
    $scope.settime_kick = function(left) {
        $scope.kick_left = left;
        if ($scope.kick_left < 0) {
            $scope.kick_left = 0
        }
        $("#kick_pie").show();
        return $scope.update_kick(true)
    };
    $scope.synchronize_kick = function() {
        var seconds_left;
        seconds_left = Math.floor(($scope.kick_start + $scope.kick_total_milli - +new Date) / 1e3);
        $scope.settime_kick(seconds_left);
        return $scope.update_kick(true)
    };
    $scope.run_kick = function() {
        $scope.kick_count = $timeout(function(_this) {
            return function() {
                return $scope.run_kick()
            }
        }(this), 1e3);
        if ($scope.kick_left) {
            window.pie.renderPie($scope.kick_left * 100 / $scope.kick_total)
        }
        $scope.update_kick(true);
        if ($scope.kick_left > 0) {
            return $scope.kick_left -= 1
        } else {
            return $scope.stop_kick()
        }
    };
    $scope.update_kick = function(h) {
        var f, j, minutes_left, text, warn;
        if (h == null) {
            h = false
        }
        if (h == null) {
            h = false
        }
        f = false;
        j = false;
        text = "";
        warn = false;
        if ($scope.kick_left > 30) {
            minutes_left = Math.ceil($scope.kick_left / 60);
            text = minutes_left + " minute";
            if (minutes_left > 1) {
                text += "s"
            }
            warn = false
        } else if ($scope.kick_left <= 30) {
            if ($scope.kick_left === 30) {
                $window.sound.play("warning");
                $window.flasher.remind("30 seconds left!")
            }
            text = $scope.kick_left + " second";
            if ($scope.kick_left > 1) {
                text += "s"
            }
            warn = true
        }
        text = $scope.kick_left ? text + " left" : "Time is up!";
        if (warn) {
            $("#countwarn").show().html("&bull; " + text)
        } else {
            $("#countwarn").hide()
        }
        if ($scope.kick_left <= 0) {
            $scope.kick_state = 2
        }
        return $scope.kick_countdown = text
    };
    $scope.resetkick = function() {
        var alives, kicks_needed, ref1;
        alives = 0;
        ref1 = $scope.current_users;
        for (k in ref1) {
            v = ref1[k];
            if (v.status === "alive") {
                alives += 1
            }
        }
        kicks_needed = Math.ceil(alives.toFixed(2) / 3) - $scope.kick_votes;
        return $scope.kicks_needed = kicks_needed > 0 ? kicks_needed : 0
    };
    $(window).focus(function() {
        $window.in_window = true;
        return $scope.synchronize_kick()
    });
    $(window).blur(function() {
        return $window.in_window = false
    });
    $scope.init_user = function(u) {
        u.status = "alive";
        u.role_class = "role-unknown";
        if (u.usercolor) {
            u.name_color = {
                color: "#" + u.usercolor
            }
        }
        u.speech = "";
        u.speech_id = "speech-bubble-" + u.username;
        u.speech_timeout = null;
        u.spoke = false;
        if (u.emotes) {
            try {
                u.emotes = JSON.parse(u.emotes);
                return window._user_emotes[u.username] = u.emotes
            } catch (_error) {}
        }
    };
    $scope.select_role = function(username, roleid, red) {
        var ref1, user;
        if (red == null) {
            red = false
        }
        user = $scope.current_screen.users[username];
        if (roleid && roleid.length) {
            user.role = roleid;
            user.red = red;
            if ((ref1 = $window.role_infos[roleid]) != null ? ref1.custom : void 0) {
                user.role_style = "url(" + $window.role_infos[roleid].avatar + ")";
                return user.role_class = ""
            } else {
                return user.role_class = "role-" + roleid + (red ? " mafia_red" : "")
            }
        } else {
            user.role = null;
            return user.role_class = "role-unknown"
        }
    };
    $scope.send_report = function(username) {
        $scope.selected_user.details.submitting_report = true;
        $http({
            method: "POST",
            url: "/report",
            data: $.param({
                msg: $scope.selected_user.details.report,
                username: username,
                game_id: $scope.game_id
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(o) {
            var msg, status;
            status = o[0], msg = o[1];
            if (status) {
                $scope.selected_user.details.report_success = true;
                $scope.selected_user.details.report_message = "Report submitted...";
                return $scope.selected_user.details.reported = true
            } else {
                $scope.selected_user.details.submitting_report = false;
                return $scope.selected_user.details.report_message = msg
            }
        });
        return false
    };
    $scope.ban = function(id) {
        $scope.selected_user = null;
        socket.sendcmd("ban", {
            uid: id
        });
        return false
    };
    $scope.is_day = function() {
        return $scope.gamestate > 0 && $scope.gamestate % 2 === 0
    };
    $scope.is_night = function() {
        return $scope.gamestate > 0 && $scope.gamestate % 2 === 1
    };
    $scope.sel_tab = function(type) {
        if ($scope.selected_user) {
            return $scope.selected_user.selected_tab = type
        }
    };
    $scope.update_will = function() {
        if ($scope.lastwill !== $scope.previouswill) {
            if ($scope.previouswill === null) {
                $scope.log("You wrote a will.", "lastwill")
            } else {
                $scope.log("You revised your will.", "lastwill")
            }
            $scope.previouswill = $scope.lastwill;
            return socket.sendcmd("will", {
                msg: $scope.previouswill
            })
        }
    };
    $scope.modify_html = function(id, cb) {
        var el;
        el = $("#" + id);
        return cb(el)
    };
    $scope.greaterOne = function(v) {
        return v > 1
    };
    $scope.activate_speak = function(type) {
        return $scope.speak.activated = $scope.speak.activated === type ? null : type
    };
    $scope.speak_activated = function(type) {
        return $scope.speak.activated === type
    };
    $scope.reset_speak = function() {
        var l, len, results, speak_type, speak_types;
        speak_types = ["whisper", "telepath", "contact", "ventrilo"];
        $scope.speak.activated = null;
        $scope.speak.types = {};
        $scope.speak.data = {};
        results = [];
        for (l = 0, len = speak_types.length; l < len; l++) {
            speak_type = speak_types[l];
            results.push($scope.speak.data[speak_type] = {})
        }
        return results
    };
    $scope.leave_confirm = false;
    $scope.redirect_back = function() {
        return $window.location.href = $scope.gamestate === -1 && $scope.ranked ? "/game/" + $scope.game_id + "/review" : "/lobby"
    };
    $scope.leave = function() {
        if ($scope.record) {
            return $window.location.href = $scope.ranked && $scope.gamestate === -1 ? "/game/" + window.game_id + "/review" : "/lobby"
        } else if ($scope.gamestate === -1) {
            return $scope.definite_leave()
        } else {
            return $scope.toggle_leave()
        }
    };
    $scope.toggle_leave = function() {
        return $scope.leave_confirm = !$scope.leave_confirm
    };
    $scope.definite_leave = function() {
        return socket.sendcmd("leave")
    };
    $scope.kick = function() {
        return socket.sendcmd("kick")
    };
    $scope["default"] = function(value, default_value) {
        return value || default_value
    };
    $scope.toggle_show_typing = function() {
        return $scope.show_typing = !$scope.show_typing
    };
    $scope.send_msg = function(e) {
        var data, msg, ref1, type;
        msg = $("#typebox").val();
        if (msg === "") {
            return
        }
        data = {
            msg: msg
        };
        if ($scope.current_state > 0 && $scope.selected_meet) {
            data.meet = $scope.selected_meet
        }
        if (type = $scope.speak.activated) {
            data[type] = true;
            ref1 = $scope.speak.data[type];
            for (k in ref1) {
                v = ref1[k];
                data[k] = v
            }
        }
        socket.sendcmd("<", data);
        $("#typebox").focus();
        $("#typebox").val("");
        return false
    };
    $scope.keypress = function($event) {
        var alpha_num, data, keycode;
        if (!$scope.show_typing || $scope.speak.activated) {
            return
        }
        keycode = $event.keyCode;
        data = {};
        if ($scope.selected_meet) {
            data.meet = $scope.selected_meet
        }
        alpha_num = String.fromCharCode(keycode).match(/[A-Za-z][A-Za-z0-9 ]*/);
        if ($scope.keytimeout && keycode === 13) {
            socket.sendcmd("u", data);
            clearTimeout($scope.keytimeout);
            return $scope.keytimeout = null
        } else if (!($scope.keytimeout || keycode === 13 || !alpha_num)) {
            socket.sendcmd("k", data);
            return $scope.keytimeout = setTimeout(function(_this) {
                return function() {
                    socket.sendcmd("u", data);
                    clearTimeout($scope.keytimeout);
                    return $scope.keytimeout = null
                }
            }(this), 3e3)
        }
    };
    $scope.set_option = function(_this) {
        return function(option) {
            if (!$scope.owner) {
                return
            }
            return socket.sendcmd("option", {
                field: option
            })
        }
    }(this);
    $scope.fetch_real_avatar = function(username, size) {
        if (size == null) {
            size = "teeny"
        }
        return $scope.fetch_avatar($scope.actual_users, username, size)
    };
    $scope.fetch_current_avatar = function(username, size) {
        if (size == null) {
            size = "teeny"
        }
        return $scope.fetch_avatar($scope.current_users, username, size)
    };
    $scope.fetch_avatar = function(arr, username, size) {
        var ref1, ref2, src;
        if (size == null) {
            size = "teeny"
        }
        if ((src = (ref1 = arr[username]) != null ? ref1["img" + size] : void 0) || (src = (ref2 = $scope.chatters[username]) != null ? ref2["img" + size] : void 0)) {
            return $('<img src="' + src + '" style="display:inline;"/>')
        } else {
            return null
        }
    };
    $scope.hide_user_details = function() {
        return $scope.selected_user = null
    };
    $scope.user_details = function(_this) {
        return function(id) {
            var info, ref1, username;
            username = find_hash_key($scope.current_users, function(v) {
                return v.id === id
            });
            if (!(username && !$scope.spectate && !$scope.current_users[username].anonymous)) {
                return
            }
            info = $scope.current_users[username];
            if (info.id === ((ref1 = $scope.selected_user) != null ? ref1.id : void 0)) {
                return $scope.selected_user = null
            } else {
                if (!info.details) {
                    return $http.get("/game/user/" + info.id).success(function(data) {
                        info.details = data;
                        info.selected_tab = "info";
                        $scope.selected_user = info;
                        if ($scope.mobile) {
                            $scope.view = "track"
                        }
                        return $scope.load_pie()
                    })
                } else {
                    info.selected_tab = "info";
                    $scope.selected_user = info;
                    $scope.load_pie();
                    if ($scope.mobile) {
                        return $scope.view = "track"
                    }
                }
            }
        }
    }(this);
    gamecmd_map = {};
    transform_shorten = function() {
        var l, len, obj, ref1, results;
        gamecmd_map.cmds = {};
        gamecmd_map.params = {};
        ref1 = $window.shorten;
        results = [];
        for (l = 0, len = ref1.length; l < len; l++) {
            obj = ref1[l];
            if (obj.cmd) {
                if (obj.alias) {
                    gamecmd_map.cmds[obj.alias] = obj.cmd
                }
                gamecmd_map.params[obj.cmd] = {};
                results.push(function() {
                    var ref2, results1;
                    ref2 = obj.data;
                    results1 = [];
                    for (k in ref2) {
                        v = ref2[k];
                        results1.push(gamecmd_map.params[obj.cmd][v] = k)
                    }
                    return results1
                }())
            } else {
                results.push(void 0)
            }
        }
        return results
    };
    if (!$scope.record) {
        transform_shorten()
    }
    transform_cmd = function(cmd, params) {
        var new_cmd, new_vv, params_map;
        if (params == null) {
            params = {}
        }
        if (new_cmd = gamecmd_map.cmds[cmd]) {
            cmd = new_cmd
        }
        for (k in params) {
            v = params[k];
            params_map = gamecmd_map.params[cmd];
            if ((params_map != null ? params_map[k] : void 0) != null) {
                if (new_vv = params_map[k]) {
                    params[new_vv] = v;
                    delete params[k]
                }
            }
        }
        return [cmd, params]
    };
    $scope.load_pie = function() {
        var data;
        data = $scope.selected_user.details;
        return $.when($window.loading_chart.promise()).then(function() {
            if (data.pie) {
                data.pie.pie_options.backgroundColor = "#ddd";
                $window.draw_chart("user_pie", data.pie.pie_data, data.pie.pie_options);
                return $("#user_pie").show()
            } else {
                return $("#user_pie").hide()
            }
        })
    };
    $scope.executed_cmds = false;
    $scope.execute_cmds = function(_this) {
        return function(pkg) {
            var cmd, l, len, p, params, ref1;
            for (l = 0, len = pkg.length; l < len; l++) {
                p = pkg[l];
                if (p) {
                    ref1 = transform_cmd.apply(null, p), cmd = ref1[0], params = ref1[1];
                    $scope.process_cmd(cmd, params)
                }
            }
            if (!$scope.executed_cmds) {
                $timeout(function() {
                    return $scope.scroll_to_bottom("window")
                }, 0);
                return $scope.executed_cmds = true
            }
        }
    }(this);
    $scope.log = function(a, classes) {
        var log;
        if (classes == null) {
            classes = null
        }
        log = $("<div class='log " + (classes != null ? classes : "") + "'/>").text(a);
        $scope.system_messages.push({
            msg: log
        });
        $scope.modify_html("window", function(el) {
            return el.append(log)
        });
        $scope.active_scroll("window");
        return $timeout(function() {
            return $scope.active_scroll("system-messages")
        }, 0)
    };
    $scope.active_scroll = function(id) {
        var b, scrollDiv;
        scrollDiv = document.getElementById(id);
        if (scrollDiv) {
            b = 0;
            if (scrollDiv.scrollHeight > 0) {
                b = scrollDiv.scrollHeight
            }
            if (b - scrollDiv.scrollTop - (scrollDiv.style.pixelHeight ? scrollDiv.style.pixelHeight : scrollDiv.offsetHeight) < 80) {
                return scrollDiv.scrollTop = b
            }
        }
    };
    $scope.scroll_to_bottom = function(id) {
        var scrollDiv;
        scrollDiv = document.getElementById(id);
        return scrollDiv.scrollTop += scrollDiv.scrollHeight
    };
    $scope.record_state = function(state) {
        var chat_html, cmds_html, el;
        chat_html = $("#window").html();
        cmds_html = $("#cmds").html();
        el = enclose(cmds_html);
        el.find("[id^=votebooth_], .del").remove();
        el.find(".id_remove").removeAttr("class");
        cmds_html = el.html();
        $("#cmds, #window").empty();
        $scope.screens[state].chat = chat_html;
        $scope.screens[state].cmds = cmds_html;
        return $scope.screens[state].recorded = true
    };
    $scope.goto_state = function(state) {
        if (!$scope.screens[state]) {
            return
        }
        $scope.selected_user = null;
        $scope.active_screen = $scope.screens[state];
        $scope.gamestate = state;
        $scope.is_current = $scope.current_state === state;
        if ($scope.current_state === state) {
            $scope.scroll_to_bottom("window");
            $("#cmds, #window").show()
        } else {
            $("#cmds, #window").hide()
        }
        return $scope.create_links(state)
    };
    $scope.create_links = function(state) {
        var next_state, prev_state;
        prev_state = state !== 0 ? state > 0 && $scope.screens[state - 1] ? state - 1 : state === -1 ? Math.max.apply(Math, function() {
            var ref1, results;
            ref1 = $scope.screens;
            results = [];
            for (k in ref1) {
                v = ref1[k];
                results.push(parseInt(k))
            }
            return results
        }()) : void 0 : void 0;
        $scope.prev_state = prev_state != null ? {
            name: $scope.screens[prev_state].name,
            state: prev_state
        } : null;
        next_state = state !== -1 ? $scope.screens[state + 1] ? state + 1 : $scope.screens[-1] ? -1 : void 0 : void 0;
        return $scope.next_state = next_state != null ? {
            name: $scope.screens[next_state].name,
            state: next_state
        } : null
    };
    $scope.state_name = function(num) {
        var time;
        switch (num) {
            case 0:
                return "Pregame";
            case -1:
                return "Game over";
            default:
                time = num % 2 === 1 ? "Night" : "Day";
                return time + " " + (num + num % 2) / 2
        }
    };
    $scope.state_icon = function(num) {
        return (num > 0 ? num % 2 : -1).toString()
    };
    unwrap_canvas_data = function(user, data) {
        var ref1, u, x, y;
        if (data && (u = $scope.actual_users[user])) {
            if (data.coor) {
                ref1 = data.coor, x = ref1.x, y = ref1.y;
                u.pos = {
                    left: x + OFFSET_LEFT,
                    top: y + OFFSET_TOP
                }
            }
            if (v = data.villager_id) {
                return u.villager_id = v
            }
        }
    };
    init_player_and_users = function(user, data) {
        $scope.init_user(data);
        $scope.current_screen.users[user] = data;
        $scope.current_users = $scope.current_screen.users;
        $scope.actual_users[user] = clone(data);
        unwrap_canvas_data(user, data.canvas);
        return $scope.user_list.push(user)
    };
    $scope.num_users = function() {
        if ($scope.current_users) {
            return Object.keys($scope.current_users).length
        } else {
            return 0
        }
    };
    $scope.process_cmd = function(_this) {
        return function(cmd, a) {
            console.log(a);
            var classroom, cont, d, directed, is_party, l, len, len1, len2, m, m_id, match, meetname, member, members, members_with_all, members_without_self, min, msg, num_users, old_width, original_msg, player, q, re, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results, s, s_id, sec, str, target, tc, type, u, uc, user, users, vocab, voting_log, w, word;
            if (!cmd) {
                return
            }
            if ($window.development) {
                console.log("cmd:", cmd, a)
            }
            if (cmd[0] === "~") {
                $scope.last_index = parseInt(cmd.slice(1));
                if ($window.development) {
                    console.log("lastindex: " + $scope.last_index)
                }
            }
            switch (cmd) {
                case "auth":
                    poptog("#pop_warn");
                    $scope.connected = true;
                    if (a.spectate) {
                        $scope.spectate = true
                    }
                    if (a.owner) {
                        $scope.owner = true
                    }
                    $scope.process_cmd("round", {
                        state: 0
                    });
                    return $timeout(function() {
                        return $("#typebox").focus()
                    }, 1e3);
                case "option":
                    return $scope.options[a.field] = !$scope.options[a.field];
                case "users":
                    ref1 = a.users;
                    for (k in ref1) {
                        u = ref1[k];
                        init_player_and_users(k, u)
                    }
                    $scope.chatters = a.chatters;
                    num_users = function() {
                        var ref2, results;
                        ref2 = $scope.current_users;
                        results = [];
                        for (k in ref2) {
                            v = ref2[k];
                            results.push(k)
                        }
                        return results
                    }().length;
                    return $scope.waiting = $window.target - num_users;
                case "anonymous_players":
                    $scope.current_users = {};
                    ref2 = a.players;
                    for (l = 0, len = ref2.length; l < len; l++) {
                        player = ref2[l];
                        $scope.current_users[player.username] = player;
                        $scope.init_user(player)
                    }
                    $scope.current_screen.users = $scope.current_users;
                    return $scope.anonymous = true;
                case "speech":
                    $scope.speak.types[a.type] = true;
                    switch (a.type) {
                        case "contact":
                            return $scope.speak.data.contacts = function() {
                                var len1, q, ref3, results;
                                ref3 = a.data;
                                results = [];
                                for (q = 0, len1 = ref3.length; q < len1; q++) {
                                    d = ref3[q];
                                    results.push({
                                        text: d,
                                        value: d
                                    })
                                }
                                return results
                            }()
                    }
                    break;
                case "join":
                    init_player_and_users(a.user, a.data);
                    $scope.waiting -= 1;
                    return $window.flasher.remind(a.user + " has joined!");
                case "leave":
                    if ($scope.gamestate) {
                        return $scope.current_screen.users[a.user].left = true
                    } else {
                        delete $scope.current_screen.users[a.user];
                        remove($scope.user_list, a.user);
                        return $scope.waiting += 1
                    }
                    break;
                case "menter":
                    $scope.mentors[a.user] = a.data;
                    return $scope.num_mentors += 1;
                case "mentee":
                    return $scope.students = a.users;
                case "mexit":
                    delete $scope.mentors[a.user];
                    return $scope.num_mentors -= 1;
                case "disguise":
                    ref3 = a.exchange;
                    results = [];
                    for (k in ref3) {
                        v = ref3[k];
                        ref4 = [$scope.current_users[v].status, $scope.current_users[k].status], $scope.current_users[k].status = ref4[0], $scope.current_users[v].status = ref4[1];
                        if ($scope.user === k) {
                            $scope.user = v
                        }
                        if ($scope.user === v) {
                            results.push($scope.user = k)
                        } else {
                            results.push(void 0)
                        }
                    }
                    return results;
                    break;
                case "<":
                    users = $scope.current_state <= 0 ? $scope.actual_users : $scope.current_screen.users;
                    type = {};
                    directed = null;
                    if (a.msg[0] === "@") {
                        m = a.msg.match(/^[@]([a-z0-9]+)/i);
                        if (m) {
                            target = m[1];
                            if (users[target] != null) {
                                a.directed = target;
                                a.msg = a.msg.substr(a.directed.length + 2)
                            }
                        }
                    }
                    a.green = a.msg[0] === ">" && a.msg[1] && a.msg[1] !== ">";
                    if (a.msg.indexOf("/me ") === 0) {
                        a.grey = true;
                        a.msg = a.msg.substr(3)
                    }
                    a.msg = $("<div/>").text(a.msg).html();
                    original_msg = a.msg;
                    is_party = a.meet === "party";
                    if (!(a.dead || a.grey || a.green)) {
                        if (users[a.user]) {
                            if (uc = users[a.user].usercolor) {
                                a.usercolor = "#" + uc
                            }
                            if (is_party || users[a.user].rainbow) {
                                a.msg = $window.rainbownize(a.msg)
                            } else if (tc = users[a.user].textcolor) {
                                a.textcolor = "#" + tc
                            }
                        }
                    }
                    if (!($scope.spectate || $scope.settings.acronym)) {
                        ref5 = $window.vocabs;
                        for (q = 0, len1 = ref5.length; q < len1; q++) {
                            vocab = ref5[q];
                            re = new RegExp("\\b" + vocab + "\\b", "ig");
                            match = a.msg.match(re);
                            if (match) {
                                word = match[0];
                                a.msg = a.msg.replace(re, "<span class='acronym'>" + word + "<span class='acronym_descr'></span></span>")
                            }
                        }
                    }
                    if (a.ventrilo) {
                        a.vent_everyone = a.venttarget === "*"
                    }
                    a.day = $scope.gamestate % 2 === 0;
                    if (a.meet && $scope.num_meetings > 1 && $scope.last_meet_chat !== a.meet) {
                        a.new_meet = a.meet
                    }
                    $scope.last_meet_chat = a.meet;
                    if (a.t && a.t !== $scope.chat_timestamp) {
                        min = parseInt(a.t / 60);
                        sec = a.t % 60;
                        if (sec < 10) {
                            sec = "0" + sec.toString()
                        }
                        if (min < 10) {
                            min = "0" + min.toString()
                        }
                        $scope.chat_timestamp = a.t;
                        a.timestamp = min + ":" + sec
                    }
                    a.regular = !a.whisper && !a.ventrilo && !a.contact && !a.crying;
                    a.msg = a.msg.replace(/[%]([a-z0-9]+)/gi, function(substring, match, nextMatch) {
                        var imgsrc, subtext;
                        target = substring.substr(1);
                        subtext = substring;
                        for (k in users) {
                            v = users[k];
                            if (k.toLowerCase() === target.toLowerCase()) {
                                if (imgsrc = v != null ? v.imgteeny : void 0) {
                                    subtext = "<img class='msg-avatar' src='" + imgsrc + "'/>";
                                    break
                                }
                            }
                        }
                        return subtext
                    });
                    if (!$scope.settings.emoticons) {
                        a.msg = $filter("emotify")(a.msg, a.user)
                    }
                    if (a.classroom) {
                        if (!$scope.classrooms[a.classroom]) {
                            ref6 = a.classroom.split(":"), m_id = ref6[0], s_id = ref6[1];
                            $scope.add_classroom(m_id, s_id)
                        }
                        classroom = $scope.classrooms[a.classroom];
                        classroom.msg = classroom_tmpl(a) + classroom.msg
                    } else {
                        $scope.modify_html("window", function(el) {
                            el.append(message_tmpl(a));
                            el.find("#cursay").find("[class^=sayimg_]").each(function() {
                                var c, name, path;
                                c = $(this).attr("class").split(" ")[0].split("_");
                                u = c[1];
                                if (a.whisper || a.contact || a.ventrilo) {
                                    $(this).before($scope.fetch_current_avatar(u))
                                } else {
                                    if (users[u]) {
                                        path = users[u].imgteeny
                                    }
                                    if (!path && $scope.chatters[u]) {
                                        path = $scope.chatters[u].imgteeny
                                    }
                                    if (path) {
                                        $(this).css("background-image", 'url("' + path + '")').css("background-repeat", "no-repeat").css("background-position", "center left")
                                    }
                                }
                                $(this).removeClass("sayimg_" + c[1]);
                                name = $(this).text();
                                if (name.length > 10 && !a.contact && !a.grey) {
                                    name = name.substr(0, 10) + "..."
                                }
                                return $(this).text(name)
                            });
                            return el.find("#cursay").removeAttr("id")
                        });
                        if ($scope.view !== "chat") {
                            $scope.new_chat += 1
                        }
                        if ($scope.current_state === 0 && !$scope.last_index) {
                            $scope.scroll_to_bottom("window")
                        } else {
                            $scope.active_scroll("window")
                        }
                    }
                    m = a.msg.toString();
                    if ($scope.executed_cmds && $scope.mode === "graphical") {
                        u = $scope.actual_users[a.user] || $scope.anonymous_speaker;
                        $timeout.cancel(u.speech_timeout);
                        u.speech_timeout = $timeout(function() {
                            return u.spoke = false
                        }, 8e3);
                        str = a.msg.toString();
                        $scope.last_z_index += 1;
                        u.z_index = $scope.last_z_index;
                        cont = $("#" + u.speech_id);
                        w = bound(7 * original_msg.length, 40, 150);
                        old_width = cont.width();
                        if (u.spoke) {
                            u.speech.push(str);
                            w = Math.max(w, old_width)
                        } else {
                            u.speech = [str]
                        }
                        cont.width(w);
                        cont.find(".speech-bubble-i").css("left", -((w - 20) / 2) - 2);
                        cont.find(".arrow").css("left", (w - 10) / 2 - 2);
                        u.spoke = true
                    }
                    if (!$window.in_window && m.match(new RegExp("\\b" + $scope.user + "\\b", "ig"))) {
                        $window.sound.play("ding");
                        return $window.flasher.remind(a.user + " mentioned you!")
                    }
                    break;
                case "countdown":
                    $scope.kick_state = 1;
                    $scope.stop_kick();
                    $scope.addtime_kick(a.start, a.totaltime);
                    return $scope.run_kick();
                case "reveal":
                    $scope.current_screen.users[a.user].revealed = true;
                    console.log(a);
                    return $scope.select_role(a.user, a.data, a.red);
                case "reveal_align":
                    return $scope.current_screen.users[a.user].revealed_align = a.data;
                case "point":
                    if ($scope.meetings[a.meet] == null) {
                        return
                    }
                    voting_log = "";
                    $scope.modify_html("cmds", function(el) {
                        var b, is_me, t, targetcss, voting_log_b;
                        targetcss = "#target_" + a.meet + "_" + a.user;
                        d = el.find("[id^=id_choose_" + a.meet + "_]").size() === 1 ? "end meeting" : "no one";
                        el.find(targetcss).text("");
                        b = "";
                        if ($scope.meetings[a.meet].votetype === "majority") {
                            b += "vote"
                        } else if ($scope.meetings[a.meet].votetype === "individual") {
                            b += "choose"
                        }
                        is_me = a.user === $scope.user;
                        if (is_me) {
                            el.find("[id^=id_choose_" + a.meet + "]").removeClass("selected");
                            if (!a.unpoint) {
                                el.find("#id_choose_" + a.meet + "_" + a.target).addClass("selected")
                            }
                        } else {
                            b += "s"
                        }
                        voting_log_b = "" + b + (is_me ? "s" : "");
                        if (!a.unpoint) {
                            if (a.target === "*") {
                                b += " " + d;
                                voting_log_b += " " + d
                            } else if (a.target) {
                                b += " " + a.target;
                                voting_log_b += " " + a.target
                            }
                            el.find(targetcss).text(b);
                            voting_log = "<div class='log_voting voting'>" + a.user + " " + voting_log_b + "</div>";
                            if (!$scope.meetings[a.meet].votesee && $scope.meetings[a.meet].votetype === "individual") {
                                if (a.target === "*") {
                                    return el.find(targetcss).text("choose " + d)
                                } else {
                                    if (a.target) {
                                        return el.find(targetcss).text("choose " + a.target)
                                    }
                                }
                            }
                        } else {
                            t = a.target === "*" ? "no one" : a.target;
                            return voting_log = "<div class='log_voting unvoting'>" + a.user + " unvotes " + a.target + "</div>"
                        }
                    });
                    $scope.modify_html("window", function(ell) {
                        return ell.append(voting_log)
                    });
                    return $scope.active_scroll("window");
                case "inputed":
                    return $scope.modify_html("cmds", function(el) {
                        var item, ref7, results1;
                        ref7 = a.data;
                        results1 = [];
                        for (k in ref7) {
                            v = ref7[k];
                            item = k === "text" ? v : el.find(".inputbox [id^=inputchoice_" + k + "_" + v + "]").attr("id").split("_")[3];
                            item = item.replace(/~/g, " ");
                            results1.push(el.find("#meetbox_" + a.meet + " #inputbox_" + a.inputname + " #inputed_" + a.inputname + "_" + k + "_" + a.user).text("choose " + item))
                        }
                        return results1
                    });
                case "move":
                    return unwrap_canvas_data(a.user, a);
                case "round":
                    if ($scope.mobile) {
                        $scope.view = "chat"
                    }
                    if (a.state === -1) {
                        $scope.game_over = true
                    }
                    $scope.screens[a.state] = {
                        name: $scope.state_name(a.state),
                        icon: $scope.state_icon(a.state)
                    };
                    if ($scope.current_screen) {
                        $scope.screens[a.state].has_dead = $scope.current_screen.has_dead
                    }
                    $scope.current_screen = $scope.screens[a.state];
                    if (a.state) {
                        $scope.record_state($scope.current_state);
                        $scope.current_screen.users = clone($scope.screens[$scope.current_state].users)
                    } else {
                        $scope.current_screen.users = $scope.users
                    }
                    $scope.current_users = $scope.current_screen.users;
                    $scope.current_state = a.state;
                    $scope.current_night = a.state % 2 === 1;
                    $scope.current_day = a.state % 2 === 0;
                    if (!($scope.record && a.state !== 0)) {
                        $scope.goto_state(a.state)
                    } else {
                        $scope.create_links($scope.gamestate)
                    }
                    play_background_music();
                    $scope.new_meetings = 0;
                    if ($scope.gamestate > 0) {
                        $scope.can_speak = false;
                        $scope.speak.types = {};
                        $scope.speak_meetings = [];
                        $scope.num_meetings = 0
                    }
                    if ($scope.gamestate === -1) {
                        $scope.anonymous = false
                    }
                    if ($scope.users) {
                        ref7 = $scope.users;
                        for (user = s = 0, len2 = ref7.length; s < len2; user = ++s) {
                            k = ref7[user];
                            user.chatting = false
                        }
                    }
                    $scope.reset_speak();
                    $scope.current_meet = null;
                    $scope.inputs_needed = 0;
                    $scope.kick_votes = 0;
                    $scope.resetkick();
                    $(".tip").remove();
                    $scope.stop_kick();
                    if ($scope.current_state && !$scope.spectate && !$scope.dead) {
                        $window.sound.play("bell")
                    }
                    $window.flasher.remind($scope.state_name(a.state));
                    if ($scope.gamestate <= 0) {
                        $scope.kick_state = 0;
                        $("#typebox").focus();
                        if ($scope.gamestate && $scope.setup_id && !$scope.spectate) {
                            return $("#ratecontainer *").show()
                        }
                    } else {
                        return $window.kickcounter.stop()
                    }
                    break;
                case "start_input":
                    if (a.data) {
                        return $scope.modify_html("cmds", function(el) {
                            return el.append(a.data)
                        })
                    }
                    break;
                case "remove_input":
                    return $scope.modify_html("cmds", function(el) {
                        return el.find("#inputid_" + a.id).remove()
                    });
                case "finish_input":
                    return $scope.modify_html("cmds", function(el) {
                        return el.find("#inputid_" + a.id).remove()
                    });
                case "end_meet":
                    return $scope.modify_html("cmds", function(el) {
                        return el.find("#meetbox_" + a.meet).addClass("ended")
                    });
                case "meet":
                    meetname = a.meet;
                    $scope.meetings[meetname] = a;
                    $scope.active_scroll("window");
                    $scope.modify_html("cmds", function(el) {
                        var booth_choices, len3, nv, ref10, ref8, ref9, results1, z;
                        el.append(a.data);
                        if ($scope.spectate || $scope.mentor || $scope.dead || (ref8 = $scope.user, indexOf.call(a.non_voting || [], ref8) >= 0)) {
                            el.find("#votebooth_" + a.meet).hide()
                        }
                        booth_choices = el.find("#booth_choices_" + a.meet);
                        ref9 = a.choosedata;
                        for (k in ref9) {
                            v = ref9[k];
                            booth_choices.append("<a href='#' id='id_choose_" + a.meet + "_" + k + "' class='booth_inner one_booth_choice'>" + v + "</a>")
                        }
                        el.find("[id^=id_choose_" + a.meet + "_]").each(function() {
                            var avatar, c;
                            c = $(this).attr("id").split("_");
                            u = c[3];
                            avatar = $scope.fetch_current_avatar(u);
                            avatar = $(avatar).attr("id", "boothimg_" + u);
                            return $(this).prepend(avatar)
                        });
                        d = el.find("[id^=id_choose_" + a.meet + "_]").size() === 1 ? "end meeting" : "no one";
                        el.find("[id^=id_choose_" + a.meet + "_]:contains('*')").addClass("booth_noimg").text(d);
                        if (a.non_voting) {
                            ref10 = a.non_voting;
                            results1 = [];
                            for (z = 0, len3 = ref10.length; z < len3; z++) {
                                nv = ref10[z];
                                results1.push(el.find("#target_" + a.meet + "_" + nv).text(($scope.user === nv ? "do" : "does") + " not vote."))
                            }
                            return results1
                        }
                    });
                    $scope.new_meetings += 1;
                    if (a.say && a.members.length > 1 && ((ref8 = $scope.user, indexOf.call(a.members, ref8) >= 0) || ((ref9 = a.disguise) != null ? ref9[$scope.user] : void 0))) {
                        $scope.can_speak = true;
                        $scope.speak_meetings.push(a.meet);
                        $scope.num_meetings += 1;
                        if ($scope.gameoptions.whisper) {
                            $scope.speak.types.whisper = true
                        }
                        $("#typebox").val("");
                        $("#typebox").focus();
                        a.members_data = {};
                        members = function() {
                            var len3, ref10, results1, z;
                            ref10 = a.members;
                            results1 = [];
                            for (z = 0, len3 = ref10.length; z < len3; z++) {
                                member = ref10[z];
                                results1.push({
                                    text: member,
                                    value: member
                                })
                            }
                            return results1
                        }();
                        a.members_data.members = members;
                        members_with_all = clone(members);
                        members_with_all.push({
                            text: "All",
                            value: "*"
                        });
                        members_without_self = clone(a.members);
                        members_without_self = function() {
                            var len3, results1, z;
                            results1 = [];
                            for (z = 0, len3 = members_without_self.length; z < len3; z++) {
                                member = members_without_self[z];
                                if (member !== $scope.user) {
                                    results1.push({
                                        text: member,
                                        value: member
                                    })
                                }
                            }
                            return results1
                        }();
                        a.members_data.members_without_self = members_without_self;
                        a.members_data.members_with_all = members_with_all;
                        $scope.selected_meet = a.meet;
                        return $scope.current_meet = a.meet
                    }
                    break;
                case "kill":
                    $scope.modify_html("cmds", function(el) {
                        return el.find("[id$=_" + a.target + "]").remove()
                    });
                    $scope.reset_meetings(a.target);
                    $scope.current_screen.has_dead = true;
                    $scope.current_users[a.target].status = "dead";
                    if (!a.disguiser && $scope.user === a.target || a.disguiser && $scope.user === a.disguiser) {
                        $scope.dead = true;
                        $scope.reset_speak();
                        if ($window.cam) {
                            $window.cam.leave_session()
                        }
                        $("#countcont").remove();
                        $scope.modify_html("cmds", function(el) {
                            return $(".votebooth").remove()
                        });
                        if (a.disguiser && $scope.user === a.disguiser) {
                            $scope.user = a.target
                        }
                    } else if (a.disguiser && $scope.user === a.target) {
                        $scope.user = a.disguiser
                    }
                    return $scope.resetkick();
                case "kick":
                    if (a.deranked) {
                        $scope.ranked = false
                    }
                    $scope.current_users[a.user].status = "dead";
                    $scope.current_users[a.user].left = true;
                    $scope.current_screen.has_dead = true;
                    $scope.modify_html("cmds", function(el) {
                        return el.find("[id$=_" + a.user + "]").remove()
                    });
                    $scope.reset_meetings(a.user);
                    if (a.user === $scope.user) {
                        $scope.dead = true
                    }
                    return $scope.resetkick();
                case "kickvote":
                    $scope.kick_votes = 1;
                    return $scope.kicks_needed -= 1;
                case "kicks_needed":
                    $scope.kick_votes = a.votes;
                    return $scope.resetkick();
                case "msg":
                    msg = $window.escapeHtml(a.msg);
                    return $scope.log(msg, a.type);
                case "event":
                    switch (a.id) {
                        case "gunshot":
                            return $window.sound.play("gunshot");
                        case "bomb":
                            return $window.sound.play("bomb")
                    }
                    break;
                case "redirect":
                    $scope.leaving = true;
                    return $scope.redirect_back();
                case "k":
                    if (user = $scope.current_users[a.u]) {
                        return user.chatting = true
                    }
                    break;
                case "u":
                    if (user = $scope.current_users[a.u]) {
                        return user.chatting = false
                    }
                    break;
                case "options":
                    return $scope.gameoptions = a.data;
                case "del_meet":
                    return $scope.modify_html("cmds", function(el) {
                        return el.find("#meetbox_" + a.meet).remove()
                    });
                case "cam_init":
                    $window.cam.apikey = a.apikey;
                    $window.cam.username = $scope.user;
                    return $window.cam.init();
                case "cam_start":
                    return $window.cam.join_session(a.sid, a.token);
                case "cam_end":
                    return $window.cam.leave_session();
                case "anonymous_reveal":
                    $scope.current_users[a.mask].real_user = a.user;
                    if (a.user === $scope.user) {
                        return $scope.user = a.mask
                    }
                    break;
                case "kudo_karma":
                    return $.getJSON("/game/" + $scope.game_id + "/kudo_karma", function(o) {
                        var data, status;
                        status = o[0], data = o[1];
                        if (status) {
                            return $window.fetch_template("game_kudo.html", "game_kudo", function(tmpl) {
                                $scope.modify_html("cmds", function(el) {
                                    return $scope.$apply(function() {
                                        return el.append(tmpl(data))
                                    })
                                });
                                return $(".kudo_player").click(function() {
                                    var self;
                                    self = this;
                                    $.getJSON($(this).attr("href"), function(oo) {
                                        var mm, ss;
                                        ss = oo[0], mm = oo[1];
                                        if (ss) {
                                            $(self).replaceWith("<span class='green'>&#x2713;</span>");
                                            $(".kudo_player").remove();
                                            return $(".tip").remove()
                                        } else {
                                            return $window.errordisplay(".kudoerror", mm)
                                        }
                                    });
                                    return false
                                })
                            })
                        } else {
                            return $window.errordisplay(".error", data)
                        }
                    });
                case "start_delay":
                    $scope.modify_html("cmds", function(el) {
                        return el.find("#meetbox_" + a.meet + " .delay_end_meeting").show()
                    });
                    if (m = $window.meetingtimers[a.meet]) {
                        m.stop();
                        m = new gamecounter;
                        m.settime(a.timeleft, "#meetbox_" + a.meet + " .end_count");
                        return m.run()
                    }
                    break;
                case "end_delay":
                    if (m = $window.meetingtimers[a.meet]) {
                        m.stop()
                    }
                    return $scope.modify_html("cmds", function(el) {
                        return el.find("#meetbox_" + a.meet + " .delay_end_meeting").hide()
                    })
            }
        }
    }(this);
    $scope.connect_game = function() {
        socket.connect();
        return $scope.bind_events()
    };
    $scope.bind_events = function() {
        var disconnect_handler;
        socket.on("open", function(_this) {
            return function() {
                var data;
                if ($scope.reconnecting) {
                    $scope.reconnecting = false
                }
                data = {
                    gameid: $scope.game_id,
                    uid: $scope.uid,
                    pass: $window.pass,
                    t: +new Date
                };
                if ($scope.last_index !== null) {
                    data.last = $scope.last_index
                }
                if ($window.mentor) {
                    data.m = $window.mentor;
                    data.mi = $window.mentee
                }
                if ($window.development) {
                    console.log("connecting with", data)
                }
                return socket.sendcmd("join", data)
            }
        }(this));
        disconnect_handler = function(_this) {
            return function() {
                if ($scope.leaving) {
                    pophtml("You are leaving the game...");
                    return $scope.redirect_back()
                } else {
                    $scope.connected = false;
                    $scope.reconnecting = true;
                    if (socket.num_connects > 10) {
                        return $scope.redirect_back
                    } else {
                        socket.incr_connects();
                        clearTimeout($scope.new_connect);
                        return $scope.new_connect = setTimeout(function() {
                            return $scope.connect_game()
                        }, 200)
                    }
                }
            }
        }(this);
        socket.on("reconnect", disconnect_handler);
        socket.on("end", disconnect_handler);
        return socket.on("data", function(_this) {
            return function(a) {
                var o;
                o = JSON.parse(a);
                return $scope.execute_cmds(o)
            }
        }(this))
    };
    if ($scope.record) {
        $scope.settings.acronym = true;
        $window.sound.mute();
        return $.ajax({
            dataType: "json",
            url: $window.record_location,
            success: function(o) {
                return $scope.$apply(function() {
                    var l, len, row;
                    for (l = 0, len = o.length; l < len; l++) {
                        row = o[l];
                        $scope.process_cmd.apply($scope, row)
                    }
                    return $scope.record_state($scope.current_state)
                })
            },
            error: function() {
                alert("The game history has expired for this game...");
                return $window.location.href = "/lobby"
            }
        })
    } else {
        return $scope.connect_game()
    }
}]);
Sound = function() {
    function Sound() {
        this.soundready = false;
        this.data = {
            bell: {
                file: "/sounds/bell.mp3",
                volume: 30
            },
            warning: {
                file: "/sounds/warning.mp3",
                volume: 40
            },
            gunshot: {
                file: "/sounds/gun.mp3"
            },
            ding: {
                file: "/sounds/ding.mp3",
                volume: 40
            },
            death: {
                file: "/sounds/death.mp3",
                volume: 20
            },
            bomb: {
                file: "/sounds/grenade.mp3",
                volume: 20
            },
            day: {
                file: "/sounds/day.mp3",
                volume: 60
            },
            night: {
                file: "/sounds/night.mp3",
                volume: 60
            }
        };
        if (window.mobile_layout) {
            delete this.data.day;
            delete this.data.night
        }
        this.sounds = {};
        soundManager.setup({
            url: "/javascripts/soundmanager/",
            debugMode: false,
            noSWFCache: false,
            onready: function(_this) {
                return function() {
                    return _this.soundready = true
                }
            }(this)
        })
    }
    Sound.prototype.play = function(sound) {
        var d;
        if (this.is_mute) {
            return false
        }
        if (this.soundready) {
            if (this.sounds[sound] == null) {
                d = this.data[sound];
                this.sounds[sound] = soundManager.createSound({
                    id: sound,
                    url: d.file
                });
                if (d.volume) {
                    soundManager.setVolume(sound, d.volume)
                }
            }
            return soundManager.play(sound)
        } else {
            return setTimeout(function(_this) {
                return function() {
                    return _this.play(sound)
                }
            }(this), 1e3)
        }
    };
    Sound.prototype.stopAll = function() {
        return soundManager.stopAll()
    };
    Sound.prototype.mute = function() {
        this.is_mute = true;
        return soundManager.mute()
    };
    Sound.prototype.unmute = function() {
        this.is_mute = false;
        return soundManager.unmute()
    };
    return Sound
}();
PieRender = function() {
    function PieRender(context, c) {
        this.center = c;
        this.paper = Raphael(context, c * 2, c * 2)
    }
    PieRender.prototype.p2c = function(cx, cy, r, aD) {
        var aR, x, y;
        aR = aD * Math.PI / 180;
        x = cx + r * Math.cos(aR);
        y = cy + r * Math.sin(aR);
        return [x, y]
    };
    PieRender.prototype.getPath = function(num) {
        return "M " + this.center + " " + this.center + " L " + this.center + " 0 A " + this.center + " " + this.center + " 0 " + (num < 90 ? 1 : 0) + " 0 " + this.p2c(this.center, this.center, this.center, num).join(" ") + " z"
    };
    PieRender.prototype.removePie = function() {
        if (this.pie) {
            return this.pie.remove()
        }
    };
    PieRender.prototype.renderPie = function(percent) {
        var num;
        num = 270 - percent * 360 / 100;
        if (this.pie) {
            this.pie.remove()
        }
        this.pie = this.paper.path(this.getPath(num));
        this.pie.attr("fill", "#aaa");
        return this.pie.attr("stroke", "#ccc")
    };
    return PieRender
}();
$(function() {
    document.body.oncontextmenu = function() {
        return false
    };
    $(document).on("click", ".strategy_title", function(o) {
        $(".strategy_descr").hide();
        $(".strategy_title").removeClass("sel");
        $(this).addClass("sel");
        return $(this).closest(".strategy").find(".strategy_descr").show()
    });
    $("#setup_strategy").click(function() {
        if ($("#setup_strategy_inner").is(":empty")) {
            return $.get("/setup/" + $("#setupid").val() + "/strategies", function(o) {
                $("#setup_strategy_inner").html(o);
                return $("#setup_strategy_inner").show()
            })
        } else {
            return $("#setup_strategy_inner").show()
        }
    });
    $(document).on("click", "#setup_strategy_inner .close", function() {
        return $("#setup_strategy_inner").hide()
    });
    $(document).delegate(".acronym", "click", function() {
        if ($(this).find(".acronym_descr.loaded").length) {
            $(this).find(".acronym_descr").show().delay(2e3).fadeOut()
        } else {
            $.get("/vocab/fetch_descr/" + $(this).text(), function(_this) {
                return function(o) {
                    return $(_this).find(".acronym_descr").addClass("loaded").html(o).show().delay(4e3).fadeOut()
                }
            }(this))
        }
        return false
    });
    $(document).delegate(".boothhover", "click", function() {
        var f;
        f = $(this).find(".booth_choices");
        if ($(this).hasClass("sel")) {
            f.css("visibility", "")
        } else {
            f.css("visibility", "visible")
        }
        $(this).toggleClass("sel");
        return false
    });
    window.pie = new PieRender("barcont", 10);
    return $(document).on("click", ".request_friend", function() {
        var self, userid;
        self = this;
        userid = $(this).data("id");
        $.post($(this).attr("href"), {
            userid: userid
        }, function(o) {
            if (o.status) {
                return $(self).replaceWith("Friendship requested! <span class='green'>&#x2713;</span>")
            } else {
                return window.errordisplay(".error", o.msg)
            }
        });
        return false
    })
});
gamecounter = function() {
    function gamecounter() {}
    gamecounter.prototype.stop = function() {
        return clearTimeout(this.c)
    };
    gamecounter.prototype.settime = function(time, cont) {
        this.time = time;
        return this.cont = cont
    };
    gamecounter.prototype.run = function() {
        this.c = setTimeout(function(_this) {
            return function() {
                return _this.run()
            }
        }(this), 1e3);
        this.update();
        if (this.time > 0) {
            return this.time -= 1
        } else {
            return this.stop()
        }
    };
    gamecounter.prototype.update = function() {
        return $(this.cont).text(this.time)
    };
    return gamecounter
}();
window.sound = new Sound;
window.kickcounter = new gamecounter;
window.startcounter = new gamecounter;
window.meetingtimers = {};
window.flasher = new Flasher;
window.cam = new Camera;
window.in_window = true;
angular.element(document).ready(function() {
    angular.bootstrap(document, ["MafiaApp"]);
    return $(window).on("contextmenu", function(event) {
        return event.preventDefault()
    })
});
window.loading_chart = $.Deferred();
google.load("visualization", "1", {
    packages: ["corechart"]
});
google.setOnLoadCallback(function() {
    return window.loading_chart.resolve()
});
window.draw_chart = function(cont, pie_data, options) {
    var chart, data, t;
    if (options == null) {
        options = {}
    }
    if (!$("#" + cont).length) {
        return
    }
    data = google.visualization.arrayToDataTable(pie_data);
    if (t = $(cont).data("title")) {
        options.title = t
    }
    if (!options.chartArea) {
        options.chartArea = {
            width: "75%",
            height: "75%"
        }
    }
    chart = new google.visualization.PieChart(document.getElementById(cont));
    return chart.draw(data, options)
};