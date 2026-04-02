jQuery(document).ready(function () {
    if (typeof elementor !== 'undefined') {
        var hausStandardInterval = setInterval(initAndResetHausStandard, 500);

        function initAndResetHausStandard () {
            if (elementor.hooks !== undefined) {
                var prevModel = null;

                elementor.hooks.addAction( 'panel/open_editor/widget', function( panel, model, view ) {

                    // Make the switch false as default.
                    model.attributes.settings.attributes.haus_elementor_standard_switch = "";

                    // If changing model, reset the previous one.
                    if (prevModel !== null) {
                        prevModel.attributes.settings.attributes.haus_elementor_standard_switch = "";
                    }

                    prevModel = model;
                } );

                // Init all widgets to have save as standard false
                setHausElementorStandardFlag(elementor);

                clearInterval(hausStandardInterval);
            }
        }
        /**
         * Recursive function
         *
         * First checks if object is elementor object. IF it is it finds all sections and sets to self.
         * Then it checks so object has children. IF it has children it checks if child is a section or column.
         * IF it's a section or column it sends to self. IF NOT then it assumes it's a child and resets haus_elementor_standard flag on it.
         */
        function setHausElementorStandardFlag (obj) {

            if (typeof obj.elements !== 'undefined' && typeof obj.elements.models !== 'undefined') {
                for (var section in obj.elements.models) {
                    setHausElementorStandardFlag(elementor.elements.models[section]);
                }
            }
            else if (typeof obj.attributes !== 'undefined' &&
                    typeof obj.attributes.elements !== 'undefined' &&
                    typeof obj.attributes.elements.models !== 'undefined') {
                for (var element in obj.attributes.elements.models) {
                    if (
                        typeof obj.attributes.elements.models[element].attributes.elType !== 'undefined' &&
                        (obj.attributes.elements.models[element].attributes.elType === 'column' ||
                            obj.attributes.elements.models[element].attributes.elType === 'section')
                    ) {
                        setHausElementorStandardFlag(obj.attributes.elements.models[element]);
                    } else {
                        obj.attributes.elements.models[element].attributes.settings.changed = {haus_elementor_standard_switch : ""};
                        obj.attributes.elements.models[element].attributes.settings.attributes.haus_elementor_standard_switch = "";
                    }
                }
            }

            return;
        }
    }
});