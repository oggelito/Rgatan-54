(function( $ ) {

    //----------------------------------------------------------------//
    // Diverse fixar för Elementor pluggar eller andra globala grejer
    //----------------------------------------------------------------//

    /*
    JetTabs to work in IE11
     */
    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    if(isIE11){
        $(document).on('click', '.jet-accordion .jet-toggle', function (e) {
            $(this).toggleClass('active-toggle');
            return false;
        });
    }


})(jQuery);



