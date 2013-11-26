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
                this.classControllerForRemoval.add(selection);
//                this.classController.delete(selection);
                var self = this;
               // setTimeout(function(){
                    self.dispatchEventNamed("classAdded", true, false, self);
                    self.classController.delete(selection);
                //}, 10);

            }
        }
    },

    handleMinusButtonAction: {
        value: function(event) {
            return;
            var selection = this.classControllerForRemoval.selection[0];
            this.classController.add(selection);
            this.dispatchEventNamed("classRemoved", true, false, this);
            var self = this;
            setTimeout(function(){
                self.classControllerForRemoval.delete(selection);
            }, 1);
        }
    }

});
