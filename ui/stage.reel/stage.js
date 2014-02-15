/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
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

//FIXME: rename .view as .sceneViewer
//FIXME: camera controller currently broken

var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;
var RangeController = require("montage/core/range-controller").RangeController;

var Utilities = require("mjs-volume/runtime/utilities").Utilities;
var Node = require("mjs-volume/runtime/node").Node;
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
exports.Stage = Montage.create(Component, /** @lends module:"montage/ui/stage.reel".Stage# */ {

    constructor: {
        value: function Stage () {
            this.super();
            this.modelsController = new RangeController().initWithContent([]);
            this.modelsController.selectAddedContent = true;
            this.camerasController = new RangeController().initWithContent([]);
            this.camerasController.selectAddedContent = true;

            this.defineBinding("model" ,{"<-": "modelsController.selection.0"});
            this.defineBinding("camera" ,{"<-": "camerasController.selection.0"});

            this.addOwnPropertyChangeListener("model", this);
            this.addOwnPropertyChangeListener("camera", this);
        }
    },

    view: {
        get: function() {
            return this.templateObjects ? this.templateObjects.view : null;
        }
    },

    /**
     */
    templateDidLoad:{
        value:function () {
        }
    },

    enterDocument: {
        value: function(firstTime) {
            if(firstTime) {
                this.modelsController.content = [
                    { "name": "duck", "path": "model/duck/duck.json"},
                    { "name": "Buggy", "path": "model/rambler/Rambler.json"},
                    { "name": "SuperMurdoch", "path": "model/SuperMurdoch/SuperMurdoch.json"},
                    { "name": "Wine", "path": "model/wine/wine.json"}
                ];
                this.modelPath = this.modelsController.content[0].path;
            }
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

    bytesLimit: { value: 250},

    concurrentRequests: { value: 6},

    modelPath: {
        value: null
    },

    loadingProgress: {
        value: 0
    },

    location: {
        value: null
    },

    handleOptionsReload: {
        value: function() {
            this.loadScene();
        }
    },

    handleModelChange: {
        value: function() {
            this.run(this.model.path);
            this.loading = true;
        }
    },

    handleCameraChange: {
        value: function(camera) {
            if (camera) {
                var m3dNode = Montage.create(Node);
                m3dNode.scene = this.view.scene;
                m3dNode.id = camera.node.baseId;
                this.view.viewPoint = m3dNode;
            } else {
                //FIXME: handle this case
                //this.view.viewPoint = null;
            }
        }
    },

    _playAnimation: { value: false, writable: true },

    playAnimation: {
        get: function() {
            return this._playAnimation;
        },
        set: function(flag) {
            this._playAnimation = flag;
            if (this.view) {
                if (flag) {
                    this.view.play();
                } else {
                    this.view.pause();
                }
            }
        }
    },

    _showBBOX: { value: false, writable: true },

    showBBOX: {
        get: function() {
            return this._showBBOX;
        },
        set: function(flag) {
            //FIXME: need to fix mjs-volume
            if (this.view) {
                if (this.view) {
                    this.view.showBBOX = flag;
                }
            }
            this._showBBOX = flag;
        }
    },

    handleStatusChange: {
        value: function(status, key, object) {
            object.addOwnPropertyChangeListener("status", this);
            this.sceneDidChange();
        }
    },

    run: {
        value: function(scenePath) {
            this.loadScene();
            if (this.view) {
                var scene = Montage.create(Scene).init();
                scene.path = scenePath;
                this.view.scene = scene;
                scene.addOwnPropertyChangeListener("status", this);
            }
        }
    },

    loadScene: {
        value: function() {

        }
    },

    /* View delegate methods*/

    sceneWillChange: {
        value: function() {
        }
    },


    //This is using private methods - stay away from that.
    sceneDidChange: {
        value: function() {
            if(this.view.scene) {
                this.loadScene();
                 this.camerasController.content = [];

                 var cameraNodes = [];
                 this.view.scene.glTFElement.rootNode.apply( function(node, parent, context) {
                     if (node.cameras) {
                         if (node.cameras.length)
                             cameraNodes = cameraNodes.concat(node);
                     }
                     return context;
                 } , true, null);

                 cameraNodes.forEach( function(cameraNode) {
                     this.camerasController.content.push( { "name": cameraNode.name, "node": cameraNode} );
                 }, this);
            }
        }
    }

});
