// Copyright (c) 2013, Fabrice Robinet.
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

require("runtime/dependencies/gl-matrix");
var Utilities = require("runtime/utilities").Utilities;
var ConcatenatedTransform = require("runtime/concatenated-transform").ConcatenatedTransform;

var NodeWrapper = Object.create(Object.prototype, {

    _viewTransform: { value: null, writable: true },

    _viewTransformIsDirty: { value: true, writable: true },

    _worldViewConcatenatedTransform: { value: null, writable: true },

    _node: { value: null, writable: true },

    node: {
        get: function() {
            return this._node;
        }
    },

    init: {
        value: function(node) {
            this._node = node;
            this._viewTransformIsDirty = true;
            this._worldViewConcatenatedTransform = Object.create(ConcatenatedTransform).init();
            return this;
        }
    },

    viewPointDidChange: {
        value: function() {
            this._viewTransformIsDirty = true;
        }
    },

    _scenePassRenderer: { value: null, writable: true },

    scenePassRenderer: {
        get: function() {
            return this._sceneRenderer;
        },
        set: function(value) {
            if (this._scenePassRenderer != value) {
                if (this._scenePassRenderer) {
                    this._scenePassRenderer.removeObserver(this)
                }

                this._scenePassRenderer = value;
                this.viewPointDidChange();

                if (this._scenePassRenderer) {
                    this._scenePassRenderer.addObserver(this);
                }
            }
        }
    },

    worldMatrix: {
        get: function() {
            return this._node.worldMatrix;
        }
    },

    worldViewMatrix: {
        get: function() {

            if (this._viewTransformIsDirty === true) {
                this._viewMatrix = this._scenePassRenderer.viewPoint.transform;
                this._viewTransformIsDirty = false;
            }

            if (this._node) {

            }
        }
    }

});

