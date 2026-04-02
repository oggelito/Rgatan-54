/** begin js from haus-site-widgets/assets/js/script.js */
jQuery(document).ready(function ($) {
    $('.back-to-objects a').on('click', function(e){
        e.preventDefault();
        window.history.back();
    });
    const $fasadHero = $('#fasad-hero');
    let swiper;
    if (
        ($fasadHero.length && $fasadHero.find('.swiper-slide').length > 1) ||
        ($('body').hasClass('page-template-page-blocks') && $('.swiper-slide').length > 1)
    ) {
        const autoplay = $('body').hasClass('page-template-page-blocks') ? {
                delay: 4000,
                pauseOnMouseEnter: true
            } : false;
        $('.swiper').removeClass('no-swiper');
        swiper = new Swiper(".swiper", {
            speed: 2000,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            autoplay: autoplay,
            loop: true,
        });
        document.querySelectorAll('.right-zone').forEach(zone => {
            zone.addEventListener('click', () => {
                swiper.slideNext();
            });
        });
        document.querySelectorAll('.left-zone').forEach(zone => {
            zone.addEventListener('click', () => swiper.slidePrev());
        });
    }

    // if startpage set swiper to autoplay
    const isStartpage = $('body').hasClass('page-template-page-blocks-php') || $('body').hasClass('home');
    if (isStartpage && typeof swiper !== 'undefined' && swiper.params) {
      swiper.params.autoplay = {
        delay: 5000,
        disableOnInteraction: false
      };
      swiper.update();
      swiper.autoplay.start();
    }

    const interest_form_id = 3;
    const interest_fields = {
        1: 'firstname',
        12: 'cellphone',
        8: 'lastname',
        3: 'mail',
        7: 'message'
    };
    // menu color
    $('.color-change').waypoint(function(direction) {
        if(direction == 'down') {
            $('.haus-animated-menu .item a span').css('color', $(this.element).attr('data-menu-color'));
            $('.haus-animated-menu .item.logo .svg path').css('fill', $(this.element).attr('data-menu-color'));
        }
    });
    $('.color-change').waypoint(function (direction) {
        if(direction == 'up') {
            $('.haus-animated-menu .item a span').css('color', $(this.element).attr('data-menu-color'));
            $('.haus-animated-menu .item.logo .svg path').css('fill', $(this.element).attr('data-menu-color'));
        }
    }, {
        offset: function () {
            return -$(this.element).height();
        }
    });

    var lastScroll;
    var vh = $(window).height();
    $(document).on( 'scroll', function(){
        var scroll = $(window).scrollTop();

        if(scroll > 50 && !$('body').hasClass('scrolled')){
            $('body').addClass('scrolled');
            $('body').addClass('scrolled-offset');
        }
        if(scroll < 50 && $('body').hasClass('scrolled-offset')){
            $('body').removeClass('scrolled-offset');
        }

        if(lastScroll > scroll && $('body').hasClass('scrolled')){
            $('body').removeClass('scrolled');
        }

        lastScroll = scroll;
    });

    // Fasad Objects
    if (typeof gform != 'undefined' && gform) {
        gform.addAction('gform_input_change', function (elem, formId, fieldId) {
            let $interest_form = $('form#interest_form');
            if (formId == interest_form_id && $interest_form.length) {
                if (fieldId in interest_fields) {
                    $interest_form.find('input[name="' + interest_fields[fieldId] + '"]').val($(elem).val());
                }
            }
        }, 10);
    }

    $(document).on("gform_confirmation_loaded", function (e, form_id) {
        let $interest_form = $('form#interest_form');
        if ($interest_form.length) {
            const serializedValues = $interest_form.serialize() + '&policytypeid=3';
            $.ajax({
                url: 'https://crm.fasad.eu/api/customerqueue/addinterestcustomertoqueue?',
                data: serializedValues,
                dataType: 'jsonp',
            });
        }
    });

    // Set email adress in form
    const realtorEmail = $('.realtor-email').text();
    $('.single-fasad_object .gfield.receiver').find('input').val(realtorEmail);
    // Set listing address in form
    const listingAdress = $('.detail--adress p').text();
    $('.single-fasad_object .gfield.address').find('input').val(listingAdress);

    // toggle facts
    $('.show-all-bids').on('click', function(){
        $(this).toggleClass('active');
        $('.bid-list').slideToggle('fast');
        return false;
    });

    //-----------  Filters & object list
    var regex = '';

    $('.check.sold').on('click', function(){
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#sold-section").offset().top
        }, 2000);
        return false;
    });

    var districtArr = [];
    var filterSort = '';

    function uniqueArray(arr){
        // remove duplicates
        var uniqueNames = [];
        $.each(arr, function(i, el){
            if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });
        return uniqueNames
    }

    // click on sold checkbox on listing..
    $('.check.ostermalm').on('click', function(){
        var el = $(this);
        el.toggleClass('active');
        reOrderList('district', 'östermalm', el.hasClass('active'));
        return false;
    });

    $('.check.vasastan').on('click', function(){
        var el = $(this);
        el.toggleClass('active');
        reOrderList('district', 'vasastan', el.hasClass('active'));
        return false;
    });

    var $grid = $('.haus-object-list'),
      gridFilters = '*',
      gridSort = 'data-order',
      sortAsc = true;

    // Check if we have local storage or not
    if (districtArr !== undefined || districtArr.length !== 0) {
        if($.inArray('vasastan', districtArr) !== -1){
            $('.check.vasastan').addClass('active');
        }
        if($.inArray('östermalm', districtArr) !== -1){
            $('.check.ostermalm').addClass('active');
        }

        regex = districtArr.join('|');
        gridFilters = function(){
            var string = $(this).attr('data-district');
            return string.match( new RegExp(regex, 'gi') );
        }

    }

    if(filterSort !== ''){
        if(filterSort === 'size-asc'){
            gridSort = 'data-order';
            sortAsc = false;
            $('.object-sort').val('size-asc');

        } else if(filterSort === 'size-desc') {
            gridSort = 'data-order';
            sortAsc = true;
            $('.object-sort').val('size-desc');

        } else if(filterSort === 'date-desc') {
            gridSort = 'data-time';
            sortAsc = false;
            $('.object-sort').val('date-desc');
        }
    }

    // Initiate Isotope list
    $grid.isotope({
        itemSelector: '.object',
        layoutMode: 'masonry',
        getSortData: {
            listOrder: '['+ gridSort +'] parseInt'
        },
        filter: gridFilters,
        sortBy: 'listOrder',
        sortAscending: sortAsc
    });

    $('select.object-sort').on('change', function(){
        var el = $(this);
        //console.log(el.val());
        reOrderList('sort', el.val(), false);
        return false;
    });

    function reOrderList(type, val, add){

        // Remove puffs before filtering
        $('.list-puff').empty().remove();
        $grid.isotope({
            filter: function () {
                return !this.classList.contains('list-puff');
            }
        });

        if (type === 'district') {
            if (add) {
                districtArr.push(val);
                if (val === 'östermalm') {
                    districtArr.push('djurgården');
                    districtArr.push('gärdet');
                } else if (val === 'vasastan') {
                    districtArr.push('norrmalm');
                }
            } else {
                districtArr.splice(districtArr.indexOf(val), 1);
                if (val === 'östermalm') {
                    districtArr.splice(districtArr.indexOf('djurgården'), 1);
                    districtArr.splice(districtArr.indexOf('gärdet'), 1);
                } else if (val === 'vasastan') {
                    districtArr.splice(districtArr.indexOf('norrmalm'), 1);
                }
            }
            regex = districtArr.join('|');
            $grid.isotope({ filter: function() {
                    var string = $(this).attr('data-district');
                    return string.match( new RegExp(regex, 'gi') );
                } });
        }

        districtArr = uniqueArray(districtArr);

        // Put in localstorage
        //localStorage.setItem("filterDistricts", JSON.stringify(districtArr));

        if(type === 'sort'){
            if(val === 'size-asc'){
                $grid.isotope({
                    getSortData: {
                        listOrder: '[data-order] parseInt'
                    },
                    sortBy: 'listOrder',
                    sortAscending: false,
                });
            } else if(val === 'size-desc') {
                $grid.isotope({
                    getSortData: {
                        listOrder: '[data-order] parseInt'
                    },
                    sortBy: 'listOrder',
                    sortAscending: true,
                });
            } else if(val == 'date-desc') {
                $grid.isotope({
                    getSortData: {
                        listOrder: '[data-time] parseInt'
                    },
                    sortBy: 'listOrder',
                    sortAscending: false,
                });
            }

            $grid.isotope('updateSortData');
            $grid.isotope('arrange');
            //localStorage.setItem("filterSort", val);
        }
    }

    // Select2 on filter dropdown
    if ($('.object-filters').length) {
        $('.object-filters').find('.object-sort').select2({
            minimumResultsForSearch: -1
        });
    }

    if ($('body').hasClass('single-fasad_coworker')) {
        // Do the Swiper
        swiper = new Swiper(".swiper", {
            speed: 2000,
            slidesPerView: 1,
            slidesPerGroup: 1,
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                }
            },
            spaceBetween: 0,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            autoplay: false,
            loop: true,
        });
        $('.swiper').removeClass('no-swiper');
    }
});

/** end js from haus-site-widgets/assets/js/script.js */


(function( $ ) {

    function isotopeList() {

        var items = 0;
        var order = 0;

        $('.jet-listing-grid__item').each(function () {
            items++;
            var el = $(this);

            if (el.find('section.list-puff').length) {
                order = el.find('section.list-puff').attr('list-pos');
            } else {
                order = items;
            }
            //console.log('ORDER: '+order);
            el.attr('list-order', order);
        });

        $('.fasad-object-list').find('.jet-listing-grid__items').isotope({
            itemSelector: '.jet-listing-grid__item',
            layoutMode: 'masonry',
            getSortData: {
                listOrder: '[list-order] parseInt'
            },
            sortBy: 'listOrder'
        });
    }
    isotopeList();

    // click on sold checkbox on listing..
    $('.check-sold').on('click', function(){
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#sold-section").offset().top
        }, 2000);
        return false;
    });

    $('.check-for-sale').find('input').prop('checked', true);
    $('.select-order').find('select').val("order_big");

    $('#toggle-filter').on('click', function(){
        $(this).toggleClass('active');
        $('#filter-section').slideToggle('fast');
        return false;
    });

    $('.toggle-preview-overlay').on('click', function(){
        $('body').toggleClass('preview-overlay-active');
        return false;
    });

    // autoplay video
    $('.elementor-element .elementor-background-video-container').find('video').attr('playsinline','').attr('webkit-playsinline','');

    function initPopup() {
        $('.open-popup').on('click', function() {
            const target = $(this).data('target');
            if(target){
                const $target = $('[data-name="' + target + '"]');
                if($target.length){
                    $target.addClass('open');
                }
            }
        });
        $('.popup-wrapper .close-button').on('click', function() {
            $(this).parent('.popup-wrapper').removeClass('open');
        });
    }
    initPopup();

    $('.accordion-content .show-more').on('click', function(){
        var el = $(this);
        el.toggleClass('active');
        $('.accordion-content .more').slideToggle('fast');
        if(!el.hasClass('active')){
            $([document.documentElement, document.body]).animate({
                scrollTop: $(".accordion").offset().top - 150
            }, 200);
        }
        return false;
    });

    $('.presentation + .show-more').on('click', function(e){
        e.preventDefault();
        const el = $(this);
        el.toggleClass('active');
        $('.presentation').toggleClass('expanded');
    });

    function initFasadHero() {
        const $videoWrapper = $('#fasad-video');
        const $fasadHero = $('#fasad-hero');
        if($fasadHero.length && $videoWrapper.length){
            const $video = $videoWrapper.find('video');
            if($video.length == 1){
                const fadeOutVideo = 1000;
                const fadeOutText = 5000;
                const fadeInText = 5000;
                const $salesTitle = $fasadHero.find('section.sales-title');
                const $label = $salesTitle.siblings('section');
                // $salesTitle.hide();
                // $label.hide();

                //Fade out video on ended
                $video.on('ended', function(){
                    $videoWrapper.fadeOut(fadeOutVideo);
                    //Remove dom element after fadeout
                    setTimeout(function(){
                        $('body').addClass('hero-film-done');
                        // $salesTitle.show(); //Should be hidden if film
                        // $label.show(); //Should be hidden if film
                        $videoWrapper.remove();
                    }, fadeOutVideo)
                });
                /*
                //Nice fadein/fadout of salestitle. Keep as reference
                $video.on('loadedmetadata', function(){
                    const duration = ($video[0].duration * 1000);
                    Only if the video is longer than fadeOutText + fadeInText time
                    if(duration > (fadeOutText + fadeInText)){
                        //fadeout after fadeouttime
                        setTimeout(function(){
                            $salesTitle.fadeOut(600)
                            $label.fadeOut(600)
                        }, fadeOutText);

                        //fadein fadeInText before videoend
                        setTimeout(function(){
                            $salesTitle.fadeIn(600)
                            $label.fadeIn(600)
                        }, duration - fadeInText)
                    }
                });
                 */
            }
        }
    }
    initFasadHero();

    function initMap() {
        const $map = $('#map-canvas');
        if (typeof google !== 'undefined' && $map.length) {
            const lat = typeof( $map.data('lat')) !== 'undefined' ? $map.data('lat') : '59.3399896';
            const lon = typeof( $map.data('lon')) !== 'undefined' ? $map.data('lon') : '18.0754448';
            const myLatlng = new google.maps.LatLng(lat, lon);
            const mapOptions = {
                scrollwheel: true,
                draggable: true,
                gestureHandling: 'cooperative',
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: true,
                zoom: 15,
                center: myLatlng,
                styles: [
                    {
                        "featureType": "administrative",
                        "elementType": "labels.text.fill",
                        "stylers": [
                            {
                                "color": "#4b3d34"
                            }
                        ]
                    },
                    {
                        "featureType": "administrative",
                        "elementType": "labels.text.stroke",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "all",
                        "stylers": [
                            {
                                "color": "#cac6c3"
                            }
                        ]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "all",
                        "stylers": [
                            {
                                "saturation": -100
                            },
                            {
                                "lightness": "-7"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.text",
                        "stylers": [
                            {
                                "lightness": "5"
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "labels.text.fill",
                        "stylers": [
                            {
                                "lightness": "-22"
                            },
                            {
                                "saturation": "57"
                            },
                            {
                                "gamma": "1.00"
                            },
                            {
                                "color": "#4b3d34"
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "simplified"
                            }
                        ]
                    },
                    {
                        "featureType": "road.arterial",
                        "elementType": "labels.icon",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "off"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "all",
                        "stylers": [
                            {
                                "color": "#eae9e9"
                            },
                            {
                                "visibility": "on"
                            }
                        ]
                    }
                ]
            }
            const map = new google.maps.Map($map[0], mapOptions);
            const marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                icon: {
                    url: 'https://www.behrer.se/app/uploads/2019/11/bahrer_kartmarkor-1.svg',
                    scaledSize: new google.maps.Size(50, 50),
                },
            })
        }
    }
    initMap();

    function checkHash() {

        const requestedHash = ((window.location.hash.substring(1).split('#', 1)) + '?').split('?', 1);
        if (requestedHash && requestedHash.includes('bilder')) {
            const $moreImagesBtn = $('.more-images');
            if ($moreImagesBtn.length) {
                $moreImagesBtn.trigger('click');
            }
        }
    }
    checkHash();

    const cookieName = 'value-form-closed';
    const $holder = $('.value-form');
    if (document.cookie.indexOf(cookieName + '=') < 0) {
        $holder.addClass('init');
    }

    $('.js-close-value').on('click', function (e) {
        e.preventDefault();
        $holder.empty().remove();
        document.cookie = cookieName + "=1; max-age=" + 7*24*60*60;
    });

    $('.js-show-value-form').on('click', function (e) {
        e.preventDefault();
        $holder.addClass('open');
    });

    const $offsetElement = $('.details');
    if ($offsetElement.length) {
        const offset = $offsetElement.offset().top + 100;
        let win = $(window);
        win.on('scroll', function () {
            let scrollTop = win.scrollTop();
            if (scrollTop > offset) {
                $holder.addClass('visible');
            } else {
                $holder.removeClass('visible');
            }
        });
    }
    function initBlueprintPhotoswipe() {
        $('.photoswipe-pictures').each(function () {
            var $pic = $(this),
              getItems = function () {
                  var items = [];
                  $pic.find('.photoswipe').each(function () {
                      var $href = $(this).data('href'),
                        $size = $(this).data('size').split('x'),
                        $width = $size[0],
                        $height = $size[1];

                      var item = {
                          src: $href,
                          w: $width,
                          h: $height
                      };
                      items.push(item);
                  });
                  return items;
              };

            var items = getItems();
            var $pswp = $('.pswp')[0];
            $pic.on('click', 'figure', function (event) {
                event.preventDefault();
                var $index = $(this).data('index');
                var options = {
                    index: $index,
                    bgOpacity: 1,
                    showHideOpacity: true
                };

                // Initialize PhotoSwipe
                if (items.length < 2) {
                    $('.pswp .left').hide();
                    $('.pswp .right').hide();
                }
                var lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
                $('.pswp .left').on('click touchstart', function () {
                    lightBox.prev();
                });
                $('.pswp .right').on('click touchstart', function () {
                    lightBox.next();
                });
                $('.pswp .close_button').on('click touchstart', function () {
                    lightBox.close();
                });
                lightBox.init();
                lightBox.listen('close', function () {
                    $('.pswp .left').off('click touchstart');
                    $('.pswp .right').off('click touchstart');
                    $('.pswp .close_button').off('click touchstart');
                })
            });
        });
    }
    initBlueprintPhotoswipe();

    // Accordion
$(document).ready(function() {
    // Open the first accordion by default
    const $firstAccordion = $('.accordion-item').first();
    $firstAccordion.addClass('active');
    $firstAccordion.find('.accordion-content').show();

    $('.accordion-header').on('click', function() {
        let $parentItem = $(this).parent(); // Hämta den aktuella .accordion-item

        if ($(this).attr('id') === 'factsandmap') {
            const $map = $('#map-canvas');
            if ($map.length) {
                $map.toggleClass('open');
            }
        }

        // Kontrollera om den klickade redan är aktiv
        let isActive = $parentItem.hasClass('active');

        // Stäng alla andra öppna accordion-objekt och dölj deras innehåll
        // Om du vill att flera ska kunna vara öppna samtidigt, ta bort denna del
        //$('.accordion-item').not($parentItem).removeClass('active');
        //$('.accordion-item').not($parentItem).find('.accordion-content').slideUp(300); // Stäng andra innehåll

        $parentItem.toggleClass('active');
        $(this).next('.accordion-content').slideToggle(300, function() {
            if ($parentItem.hasClass('active')) {
                var elementTop = $parentItem.offset().top;
                var elementBottom = elementTop + $parentItem.outerHeight();
                var viewportTop = $(window).scrollTop();
                var viewportBottom = viewportTop + $(window).height();

                // Only scroll if element is not fully visible
                if (elementTop < viewportTop) {
                    //console.log('scroll because ' + elementTop + ' < ' + viewportTop);
                    /*$('html, body').animate({
                        scrollTop: elementTop - 110
                    }, 300);*/
                }
            }
        });
    });
});

})(jQuery);

// Load correct video src by screen size
function loadCorrectVideo() {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const blocks = document.querySelectorAll(".flexible-content.video");

    blocks.forEach(block => {
        const mobileVideo  = block.querySelector(".video-mobile");   // may not exist
        const desktopVideo = block.querySelector(".video-desktop");  // always exists

        if (isMobile && mobileVideo) {
            // Enable mobile video
            if (!mobileVideo.src) {
                mobileVideo.src = mobileVideo.dataset.src;
            }

            // Disable desktop video
            if (desktopVideo.src) {
                desktopVideo.pause();
                desktopVideo.removeAttribute("src");
                desktopVideo.load();
            }

        } else {
            // Enable desktop video
            if (!desktopVideo.src) {
                desktopVideo.src = desktopVideo.dataset.src;
            }

            // Disable mobile video (if exists)
            if (mobileVideo && mobileVideo.src) {
                mobileVideo.pause();
                mobileVideo.removeAttribute("src");
                mobileVideo.load();
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", loadCorrectVideo);
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(loadCorrectVideo, 150);
});
