/* <copyright>
Copyright (c) 2013, Fabrice Robinet.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
/**
    @module "montage/ui/stage.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;
var RangeController = require("montage/core/range-controller").RangeController;

var Utilities = require("mjs-volume/runtime/utilities").Utilities;
var Node = require("mjs-volume/runtime/node").Node;
var Component3D = require("mjs-volume/runtime/component-3d").Component3D;
var Scene = require("mjs-volume/runtime/scene").Scene;
var glTFNode = require("mjs-volume/runtime/glTF-node").glTFNode;
var Camera = require("mjs-volume/runtime/camera").Camera;
var GLSLProgram = require("mjs-volume/runtime/glsl-program").GLSLProgram;
var glMatrix = require("mjs-volume/runtime/dependencies/gl-matrix").glMatrix;

/**
    Description TODO
    @class module:"montage/ui/stage.reel".Stage
    @extends module:montage/ui/component.Component
*/
exports.StyleStage = Montage.create(Component, /** @lends module:"montage/ui/stage.reel".Stage# */ {

    constructor: {
        value: function StyleStage () {
            this.super();
            this.idsController = new RangeController().initWithContent([]);
            this.idsController.selectAddedContent = true;
            this.classController = new RangeController().initWithContent([]);
            this.classController.selectAddedContent = true;
            this.classControllerForRemoval = new RangeController().initWithContent([]);
            this.classControllerForRemoval.selectAddedContent = true;

            this.defineBinding("id" ,{"<-": "idsController.selection.0"});
            this.defineBinding("class" ,{"<-": "classController.selection.0"});
            this.defineBinding("classToRemove" ,{"<-": "classControllerForRemoval.selection.0"});

            //this.classController.avoidsEmptySelection = true;
            //this.classControllerForRemoval.avoidsEmptySelection = true;

            this.addOwnPropertyChangeListener("id", this);
        }
    },

    sceneViewer: {
        get: function() {
            return this.templateObjects ? this.templateObjects.sceneViewer : null;
        }
    },

    options: {
        get: function() {
            return this.templateObjects ? this.templateObjects.options : null;
        }
    },

    label: {
        get: function() {
            return this.templateObjects ? this.templateObjects.label : null;
        }
    },

    _populateSelects: {
        value: function() {
            var content = [];

            for (var id in this.templateObjects) {
                var obj = this.templateObjects[id];
                if (obj instanceof Component3D) {
                    var idEntry = {};
                    if (obj.id) {
                        idEntry.component3D = obj;
                        idEntry.name = obj.name;
                        content.push(idEntry);
                    }
                }
            }

            this.idsController.content = content;

            //we now populate the css classes
            var content = [];
            if (document.styleSheets) {
                for (var i = 0; i < document.styleSheets.length; i++) {
                    //http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
                    var styleSheet = document.styleSheets[i];
                    if (styleSheet) {
                        if (styleSheet.href) {
                            console.log(""+styleSheet.href);
                            if (styleSheet.href.indexOf("test-style.css") != -1) {
                                var cssRule=false;
                                var ii= 0 ;                                        // Initialize subCounter.
                                do {                                             // For each rule in stylesheet
                                    if (styleSheet.cssRules) {                    // Browser uses cssRules?
                                        cssRule = styleSheet.cssRules[ii];         // Yes --Mozilla Style
                                    } else {                                      // Browser usses rules?
                                        cssRule = styleSheet.rules[ii];            // Yes IE style.
                                    }                                             // End IE check.
                                    if (cssRule)  {                               // If we found a rule...
                                        if (cssRule.selectorText) {
                                            var classEntry = {};
                                            classEntry.name = cssRule.selectorText;
                                            content.push(classEntry);
                                        }
                                    }                                             // end found cssRule
                                    ii++;                                         // Increment sub-counter
                                } while (cssRule)                                // end While loop
                            }
                        }
                    }
                }
            }
            this.classController.content = content;
        }
    },

    handleStatusChange: {
        value: function(status, key, object) {
            if (status === "loaded") {
                var self = this;

                //This timeout is not needed with Montage TOT
                setTimeout(function() {
                    self.scene.removeOwnPropertyChangeListener("status", self);
                }, 1);
                this._populateSelects();
            }
        }
    },

    /**
     */

    enterDocument: {
        value: function(firstTime) {
            if(firstTime) {
                this.sceneViewer.scene = this.scene;

                if (this.scene.isLoaded()) {
                    this._populateSelects();
                } else {
                    this.scene.addOwnPropertyChangeListener("status", this);
                }

                if (this.options) {
                    this.options.addEventListener("classAdded", this);
                    this.options.addEventListener("classRemoved", this);
                }
            }
        }
    },

    templateDidLoad: {
        value: function() {
        }
    },

    handleClassAdded: {
        value: function(event) {
            if (this.class) {
                if (this.class.name) {
                    this.id.component3D.classList.add(this.class.name);
                }
            }
        }
    },

    handleClassRemoved: {
        value: function(event) {
            if (this.classToRemove) {
                if (this.classToRemove.name) {
                    this.id.component3D.classList.remove(this.classToRemove.name);
                }
            }
        }
    },

    handleCatAction: {
        value: function(event) {
            console.log("node with label \"cat\" was is clicked");
        }
    },

    exitDocument: {
        value: function() {
        }
    },

    willDraw: {
        value: function() {
        }
    },

    handleIdChange: {
        value: function(entry) {
            if (this.label) {
                this.label.value = "la";
            }
        }
    }

});
