var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

exports.StyleOptions = Montage.create(Component, /** @lends module:"montage/ui/stage.reel".Stage# */ {

    idsController: {
        value: null
    },

    classController: {
        value: null
    },

    classControllerForRemoval: {
        value: null
    },

    handlePlusButtonAction: {
        value: function(event) {
            if (this.classControllerForRemoval) {
                var selection = this.classController.selection[0];
                if (selection != null) {
                    this.classControllerForRemoval.add(selection);
                    var self = this;
                    self.dispatchEventNamed("classAdded", true, false, self);
                    self.classController.delete(selection);
                    if (self.classController.content[0] != null)
                        self.classController.select(self.classController.content[0]);
                }
            }
        }
    },

    handleMinusButtonAction: {
        value: function(event) {
            if (this.classController) {
                var selection = this.classControllerForRemoval.selection[0];
                if (selection != null) {
                    this.classController.add(selection);
                    var self = this;
                    self.dispatchEventNamed("classRemoved", true, false, self);
                    self.classControllerForRemoval.delete(selection);
                    if (self.classControllerForRemoval.content[0] != null)
                        self.classControllerForRemoval.select(self.classControllerForRemoval.content[0]);
                }
            }
        }
    }

});
