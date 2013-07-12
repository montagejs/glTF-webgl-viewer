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
var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;
var RangeController = require("montage/core/range-controller").RangeController;
var Utilities = require("runtime/utilities").Utilities;
var Node = require("runtime/node").Node;
var Camera = require("runtime/camera").Camera;
var GLSLProgram = require("runtime/glsl-program").GLSLProgram;
var glMatrix = require("runtime/dependencies/gl-matrix").glMatrix;

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

            this.defineBinding("modelPath" ,{"<-": "modelsController.selection.0.path"});
            this.defineBinding("camera" ,{"<-": "camerasController.selection.0.node"});

            this.addOwnPropertyChangeListener("modelPath", this.handleModelPathBeforeChange.bind(this), true);
            this.addOwnPropertyChangeListener("modelPath", this.handleModelPathChange.bind(this), false);
        }
    },

    view: {
        get: function() {
            return this.templateObjects ? this.templateObjects.view : null;
        }
    },

    handleOptionsReload: {
        value: function() {
            var self = this;
            var view = this.view;
            if (view) {
                if (view.sceneRenderer) {
                    if (view.sceneRenderer.scene) {
                        view.sceneRenderer.technique.rootPass.scene.rootNode.apply( function(node, parent) {
                            if (node.meshes) {
                                if (node.meshes.length) {
                                    node.meshes.forEach( function(mesh) {
                                        mesh.loadedPrimitivesCount = 0;
                                        mesh.step = 0;
                                    }, self);
                                }
                            }
                            return null;
                        } , true, null);
                    }
                }
                this.loadingProgress.value = 0;
            }
        }
    },

    /**
     */
    templateDidLoad:{
        value:function () {
            this.view.delegate = this;
        }
    },

    enterDocument: {
        value: function(firstTime) {
            this.modelsController.content = [
                { "name": "duck", "path": "model/duck/duck.json"},
                { "name": "Buggy", "path": "model/rambler/Rambler.json"},
                { "name": "SuperMurdoch", "path": "model/SuperMurdoch/SuperMurdoch.json"},
                { "name": "Wine", "path": "model/wine/wine.json"}
            ];
            this.modelPath = this.modelsController.content[0].path;
            if (this.fillViewport) {
                window.addEventListener("resize", this, true);
            }
        }
    },

    willDraw: {
        value: function() {
            this.view.width = this.width = window.innerWidth - 270;
            this.view.height = this.height = window.innerHeight;
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

    _fillViewport: {
        value: true
    },

    fillViewport: {
        get: function() {
            return this._fillViewport;
        },
        set: function(value) {
            if (value === this._fillViewport) {
                return;
            }

            this._fillViewport = value;

            if (this._isComponentExpanded) {
                if (this._fillViewport) {
                    window.addEventListener("resize", this, true);
                } else {
                    window.removeEventListener("resize", this, true);
                }
            }
        }
    },

    height: {value: null},
    width: {value: null},

    captureResize: {
        value: function(evt) {
            this.needsDraw = true;
        }
    },

    run: {
        value: function(scenePath) {
            this.handleOptionsReload();
            if (this.view) {
                this.view.scenePath = scenePath;
            }
        }
    },

    handleModelPathBeforeChange: {
        value: function() {
            var resourceManager = this.view.getResourceManager();
            if (resourceManager) {
                resourceManager.maxConcurrentRequests = this.concurrentRequests;
                resourceManager.bytesLimit = this.bytesLimit * 1024;
                resourceManager.reset();
            }
        }
    },

    handleModelPathChange: {
        value: function() {
            if(this.view.scene) {
                this.handleOptionsReload();
                 var resourceManager = this.view.getResourceManager();
                 if (resourceManager) {
                     if (resourceManager.observers.length === 1) { //FIXME:...
                         resourceManager.observers.push(this);
                     }
                 }
                 this.camerasController.content = [];

                 var cameraNodes = [];
                 this.view.scene.rootNode.apply( function(node, parent, context) {
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
           this.run(this.modelPath);
        }
    },

    resourceAvailable: {
        value: function(resource) {
            var progress = this.progress;
            if (progress) {
                if (resource.range) {
                    this.loadingProgress += (resource.range[1] - resource.range[0])/this.view.totalBufferSize;
                    if (this.loadingProgress >= 1) {
                        this.loadingProgress = 0;
                    }
                }
            }
        }
    }


});
