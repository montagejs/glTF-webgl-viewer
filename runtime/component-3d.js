// Copyright (c) 2013, Fabrice Robinet
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var Montage = require("montage").Montage;
var glTFNode = require("runtime/glTF-node").glTFNode;
var Target = require("montage/core/target").Target
require("runtime/dependencies/CSSOM");

//FIXME: add a state to now that resolution of id pending to avoid adding useless listeners
//This currently *can't* happen with the code path in use, the API would allow it.
exports.Component3D = Target.specialize( {

    //FIXME: work-around
    self: {
        get: function() {
            return this;
        }
    },

    constructor: {
        value: function Component3D() {
            this._hasUnresolvedId = true;
            this.super();
        }
    },

    _glTFElement: { value : null, writable: true },

    glTFElement: {
        get: function() {
            return this._glTFElement;
        },
        set: function(value) {
            this._glTFElement = value;
        }
    },

    _scene: { value : null, writable: true },

    scene: {
        get: function() {
            return this._scene;
        },
        set: function(value) {
            this._scene = value;
            this._sceneDidChange();
        }
    },

    baseURL: {
        get: function() {
            return this.scene ? this.scene.glTFElement.baseURL : null;
        }
    },

    _isAbsolutePath: {
        value: function(path) {
            var isAbsolutePathRegExp = new RegExp("^"+window.location.protocol, "i");

            return path.match(isAbsolutePathRegExp) ? true : false;
        }
    },

    resolvePathIfNeeded: {
        value: function(path) {
            if (this._isAbsolutePath(path)) {
                return path;
            }

            return this.baseURL + path;
        }
    },

    _hasUnresolvedId: { value: false, writable: true },

    handleStatusChange: {
        value: function(status, key, object) {
            if (status === "loaded") {
                if (this._id) {
                    this.glTFElement = this.scene.glTFElement.ids[this._id];
                    if (this.glTFElement == null) {
                        //FIXME: this should be probably fixed at the loader level instead of having a special case for root. TBD
                        if (this.scene.glTFElement.rootNode.id == this._id) {
                            this.glTFElement = this.scene.glTFElement.rootNode;
                        }
                    }
                    if (this.glTFElement) {
                        this._hasUnresolvedId = false;
                    }
                }
            }
        }
    },

    resolveIdIfNeeded: {
        value: function() {
            if (this._hasUnresolvedId && this.scene != null) {
                if (this.scene.status !== "loaded") {
                    this.scene.addOwnPropertyChangeListener("status", this);
                    return;
                }

                if (this._id) {
                    this.handleStatusChange(this.scene.status, "status", this.scene);
                }
            }
        }
    },

    _idDidChange: {
        value: function() {
            this.resolveIdIfNeeded();
        }
    },

    //here we are guaranteed to have the styleSheet
    _applyCSS: {
        value: function() {
            if (this.class) {
            }
        }
    },

    handleStyleSheetsChange: {
        value: function(value, key, object) {
            this._applyCSS();
            var self = this;
            setTimeout(function() {
                self.scene.removeOwnPropertyChangeListener(key, self);
            }, 1);
        }
    },

    _sceneDidChange: {
        value: function() {
            this.resolveIdIfNeeded();
            if (this.scene) {
                if (this.scene.styleSheets) {
                    this._applyCSS();
                } else {
                    this.scene.addOwnPropertyChangeListener("styleSheets", this);
                }
            }
        }
    },

    removeAllCSSRules: {
        value: function() {

        }
    },

    /*
        Should I create a Component3DStyle Object ?
        1.state {} (default:hover:..)
            2.property {}
                3.value
                3.transition
        States:
            no state : means value assignment
     */


    __STYLE_DEFAULT__ : { value: "__default__"},

    _stateForSelectorName: {
        value: function(selectorName) {
            var state = null;

            if (selectorName.indexOf("hover:") !== -1) {
                return "hover"
            } else if (selectorName.indexOf(":") !== -1) {
                return  null;
            }

            //that's fragile, we won't need this once we handle all states
            return this.__STYLE_DEFAULT__;
        }
    },

    _style: { value: null, writable: true },

    _defaultTransition: { value: {"duration" : 0, "timingFunction" : "ease", "delay" : 0 } },

    _createDefaultStyle: {
        value: function() {
            var style = {};
            if (this.styleableProperties != null) {
                this.styleableProperties.forEach(function(property) {
                    if (this.getDefaultValueForCSSProperty) {
                        var propertyValue = this.getDefaultValueForCSSProperty(property);
                        if (propertyValue) {
                            this._applyCSSPropertyWithValueForState(this.__STYLE_DEFAULT__, property, propertyValue.value, style);
                            //FIXME
                            if (propertyValue.transition) {
                                var declaration = this._getStylePropertyObject(style, this.__STYLE_DEFAULT__, property);
                                declaration.transition = propertyValue.transition;
                            }
                        }
                    }
                }, this);
            }
            return style;
        }
    },

    _createStyleStateAndPropertyIfNeeded:  {
        value: function(style, state, property) {
            if (style[state] == null) {
                style[state] = {};
            }

            var stateValue = style[state];
            if (stateValue[property] == null) {
                stateValue[property] = {};
            }

            return stateValue[property];
         }
    },

    _getStylePropertyObject: {
        value: function(style, state, property) {
            return this._createStyleStateAndPropertyIfNeeded(style, state, property);
        }
    },

    _createTransitionFromComponents: {
        value: function(transitionComponents) {
            //the property is handled up front
            var transition = {};
            var parsingState = ["duration", "timing-function", "delay"];

            //http://www.w3.org/TR/css3-transitions/#transition-timing-function-property
            // + need to handle steps () and cubic-bezier
            var timingFunctions = ["ease", "linear", "ease-in", "ease-out", "ease-in-out", "step-start"];

            var parsingStateIndex = 0;
            //each component is optional here but there is an order
            transitionComponents.forEach(function (transitionComponent) {
                var componentMatchesParsingState = false;
                var tentativeParsingIndex = parsingStateIndex;

                do {
                    if (parsingState[tentativeParsingIndex] === "duration") {
                        //make sure we really have a duration, otherwise it has to be a timing function
                        if (timingFunctions.indexOf(transitionComponent) === -1) {
                            //so we assume we have a duration here
                            componentMatchesParsingState = true;
                            transition.duration = parseFloat(transitionComponent);
                            parsingStateIndex = tentativeParsingIndex;
                        }
                    } else if (parsingState[tentativeParsingIndex] === "timing-function") {
                        if (timingFunctions.indexOf(transitionComponent) !== -1) {
                            componentMatchesParsingState = true;
                            transition.timingFunction = transitionComponent;
                            parsingStateIndex = tentativeParsingIndex;
                        }
                    } else if (parsingState[tentativeParsingIndex] === "delay") {
                        //delay has to be last parsed element
                        if (tentativeParsingIndex ==  transitionComponents.length-1) {
                            componentMatchesParsingState = true;
                            transition.delay = parseFloat(transitionComponent);
                        }
                    }
                    tentativeParsingIndex++;
                } while ((parsingStateIndex < parsingState.length) && (componentMatchesParsingState == false));

            }, this);
            if (transition.duration == null) {
                transition.duration = 0;
            }
            if (transition.timingFunction == null) {
                transition.timingFunction = "ease";
            }
            if (transition.delay == null) {
                transition.delay = 0;
            }

            return transition;
        }
    },

    _applyCSSPropertyWithValueForState: {
        value: function(state, cssProperty, cssValue, style) {
            //to be optimized (remove switch)

            if (cssValue == null)
                return;

            if (this.styleableProperties.indexOf(cssProperty) === -1 ) {
                return;
            }

            var declaration = this._getStylePropertyObject(style, state, cssProperty);

            //consider delegating this somewhere else..
            switch(cssProperty) {
                case "transition": {
                    var transitionComponents = cssValue.split(" ");
                    if (transitionComponents.length > 0) {
                        var actualProperty = transitionComponents.shift();
                        //do we handle this property ? otherwise specifying transition for it would be pointless
                        if (this.styleableProperties.indexOf(actualProperty) !== -1 ) {
                            if (transitionComponents.length > 0) {
                                declaration = this._getStylePropertyObject(style, state, "opacity");
                                declaration.transition = this._createTransitionFromComponents(transitionComponents);
                            }
                        }
                    }
                }
                    break;
                case "visibility":
                    declaration.value = cssValue;
                    break;
                case "opacity":
                    declaration.value = cssValue;
                    break;
                default:
                    break;
            }
        }
    },

    _applyStyleRule: {
        value: function(selectorName, styleRule, style) {
            if (styleRule.style) {
                var length = styleRule.style.length;
                if (length > 0) {
                    for (var i = 0 ; i < length ; i++) {
                        var cssProperty = styleRule.style[i];
                        var cssValue = styleRule.style[cssProperty];

                        //should be states ?
                        var state = this._stateForSelectorName(selectorName);
                        if (state != null) {
                            this._applyCSSPropertyWithValueForState(state, cssProperty, cssValue, style);
                        }
                    }
                }
            }
        }
    },

    _executeCurrentStyle: {
        value: function() {
            var style = this._style;
            if (this.styleableProperties != null) {
                this.styleableProperties.forEach(function(property) {
                    var declaration = this._getStylePropertyObject(style, this.__STYLE_DEFAULT__, property);
                    debugger;
                    if (declaration) {
                        if (declaration.value != null) {
                            this[property] = declaration.value;
                        }
                    }
                }, this);
            }
        }
    },

    classDidChange: {
        value: function() {
            if (this.class) {
                var rule = this.retrieveCSSRule(this.class);
                var selectorName = this.class; //FIXME
                if (rule) {
                    var style = this._createDefaultStyle();
                    if (rule.cssText) {
                        var cssDescription = CSSOM.parse(rule.cssText);
                        if (cssDescription) {
                            var allRules = cssDescription.cssRules;
                            allRules.forEach(function(styleRule) {
                                this._applyStyleRule(selectorName, styleRule, style);
                            }, this);
                        }
                        this._style = style;
                        this._executeCurrentStyle();
                    }

                }
            } else {
                this.removeAllCSSRules();
            }
        }
    },

    _class: { value: "",  writable: true },

    class: {
        get: function() {
            return this._class;
        },

        set: function(value) {
            if (value != this._class) {
                this._class = value;
                this.classDidChange();
            }
        }
    },

    _id: { value: null,  writable: true },

    id: {
        get: function() {
            return this._id;
        },

        set: function(value) {
            if (value != this._id) {
                this._id = value;
                this._idDidChange();
            }
        }
    },

    initWithScene: {
        value: function(scene) {
            this.scene = scene;
            return this;
        }
    },

    //http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
    retrieveCSSRule: {
        value: function(ruleName) {
            ruleName = ruleName.toLowerCase();                       // Convert test string to lower case.
            if (document.styleSheets) {                            // If browser can play with stylesheets
                for (var i = 0; i < document.styleSheets.length; i++) { // For each stylesheet
                    var styleSheet = document.styleSheets[i];          // Get the current Stylesheet
                    var ii= 0 ;                                        // Initialize subCounter.
                    var cssRule=false;                               // Initialize cssRule.
                    do {                                             // For each rule in stylesheet
                        if (styleSheet.cssRules) {                    // Browser uses cssRules?
                            cssRule = styleSheet.cssRules[ii];         // Yes --Mozilla Style
                        } else {                                      // Browser usses rules?
                            cssRule = styleSheet.rules[ii];            // Yes IE style.
                        }                                             // End IE check.
                        if (cssRule)  {                               // If we found a rule...
                            if (cssRule.selectorText.toLowerCase() == ruleName) { //  match ruleName?
                                return cssRule;                      // return the style object.
                            }                                          // End found rule name
                        }                                             // end found cssRule
                        ii++;                                         // Increment sub-counter
                    } while (cssRule)                                // end While loop
                }                                                   // end For loop
            }                                                      // end styleSheet ability check
            return false;                                          // we found NOTHING!
        }
    },

    blueprintModuleId:require("montage")._blueprintModuleIdDescriptor,

    blueprint:require("montage")._blueprintDescriptor

});
