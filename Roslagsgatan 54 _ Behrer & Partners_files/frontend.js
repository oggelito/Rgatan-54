( function( $ ) {

	"use strict";

	var JetEngine = {

		currentMonth: null,
		currentRequest: {},
		activeCalendarDay: null,
		calcFields: {},

		init: function() {

			var widgets = {
				'jet-listing-dynamic-field.default' : JetEngine.widgetDynamicField,
				'jet-engine-booking-form.default' : JetEngine.widgetBookingForm,
				'jet-listing-grid.default': JetEngine.widgetListingGrid,
			};

			$.each( widgets, function( widget, callback ) {
				window.elementorFrontend.hooks.addAction( 'frontend/element_ready/' + widget, callback );
			});

			$( document )
				.on( 'click.JetEngine', '.jet-calendar-nav__link', JetEngine.switchCalendarMonth )
				.on( 'click.JetEngine', '.jet-calendar-week__day-mobile-overlay', JetEngine.showCalendarEvent )
				.on( 'click.JetEngine', '.jet-form__submit.submit-type-ajax', JetEngine.ajaxSubmitBookingForm )
				.on( 'focus.JetEngine', '.jet-form__field', JetEngine.clearFieldErrors )
				.on( 'change.JetEngine', '.jet-form__field', JetEngine.recalcFields )
				.on( 'jet-filter-content-rendered', JetEngine.maybeReinitSlider );

			window.elementorFrontend.hooks.addFilter( 'jet-popup/widget-extensions/popup-data', JetEngine.prepareJetPopup );

		},

		prepareJetPopup: function( popupData, widgetData, $scope ) {

			var postId = null;

			if ( widgetData['is-jet-engine'] ) {
				popupData['isJetEngine'] = true;

				var $gridItem     = $scope.closest( '.jet-listing-grid__item' ),
					$calendarItem = $scope.closest( '.jet-calendar-week__day-event' );

				if ( $gridItem.length ) {
					popupData['postId'] = $gridItem.data( 'post-id' );
				} else if ( $calendarItem.length ) {
					popupData['postId'] = $calendarItem.data( 'post-id' );
				}

			}

			return popupData;

		},

		showCalendarEvent: function( event ) {

			var $this       = $( this ),
				$day        = $this.closest( '.jet-calendar-week__day' ),
				$week       = $day.closest( '.jet-calendar-week' ),
				$events     = $day.find( '.jet-calendar-week__day-content' ),
				activeClass = 'calendar-event-active';

			if ( $day.hasClass( activeClass ) ) {
				$day.removeClass( activeClass );
				JetEngine.activeCalendarDay.remove();
				JetEngine.activeCalendarDay = null;
				return;
			}

			if ( JetEngine.activeCalendarDay ) {
				JetEngine.activeCalendarDay.remove();
				$( '.' + activeClass ).removeClass( activeClass );
				JetEngine.activeCalendarDay = null;
			}

			$day.addClass( 'calendar-event-active' );

			JetEngine.activeCalendarDay = $( '<tr class="jet-calendar-week"><td colspan="7" class="jet-calendar-week__day jet-calendar-week__day-mobile"><div class="jet-calendar-week__day-mobile-event">' + $events.html() + '</div></td></tr>' );

			JetEngine.activeCalendarDay.insertAfter( $week );

		},

		widgetListingGrid: function( $scope ) {

			var $slider  = $scope.find( '.jet-listing-grid__slider' ),
				$masonry = $scope.find( '.jet-listing-grid__masonry' );

			if ( $slider.length ) {
				JetEngine.initSlider( $slider );
			}

			if ( $masonry.length ) {

				if ( window.MagicGrid ) {
					var masonryGrid = new MagicGrid( $masonry.data( 'masonry' ) );
					masonryGrid.listen();

					$( window ).load( function() {
						masonryGrid.positionItems();
					} );

				}

			}

		},

		initSlider: function( $slider ) {

			var options     = $slider.data( 'slider_options' ),
				windowWidth = $( window ).width(),
				tabletBP    = 1025,
				mobileBP    = 768,
				tabletSlides, mobileSlides, defaultOptions, slickOptions;

			if ( options.itemsCount < options.slidesToShow.desktop && windowWidth > tabletBP ) {
				$slider.removeClass( 'jet-listing-grid__slider' );
				return;
			} else if ( options.itemsCount < options.slidesToShow.tablet && tabletBP <= windowWidth && windowWidth > mobileBP ) {
				$slider.removeClass( 'jet-listing-grid__slider' );
				return;
			} else if ( options.itemsCount < options.slidesToShow.mobile && windowWidth <= mobileBP ) {
				$slider.removeClass( 'jet-listing-grid__slider' );
				return;
			}

			if ( options.slidesToShow.tablet ) {
				tabletSlides = options.slidesToShow.tablet;
			} else {
				tabletSlides = 1 === options.slidesToShow.desktop ? 1 : 2;
			}

			if ( options.slidesToShow.mobile ) {
				mobileSlides = options.slidesToShow.mobile;
			} else {
				mobileSlides = 1;
			}

			options.slidesToShow = options.slidesToShow.desktop;

			defaultOptions = {
				customPaging: function( slider, i ) {
					return $( '<span />' ).text( i + 1 );
				},
				slide: '.jet-listing-grid__item',
				dotsClass: 'jet-slick-dots',
				responsive: [
					{
						breakpoint: 1025,
						settings: {
							slidesToShow: tabletSlides,
						}
					},
					{
						breakpoint: 768,
						settings: {
							slidesToShow: mobileSlides,
							slidesToScroll: 1
						}
					}
				]
			};

			slickOptions = $.extend( {}, defaultOptions, options );

			$slider.find( '.jet-listing-grid__items' ).slick( slickOptions );
		},

		maybeReinitSlider: function( event, $scope ) {
			var $slider = $scope.find( '.jet-listing-grid__slider' );

			if ( $slider.length ) {
				JetEngine.initSlider( $slider );
			}
		},

		widgetDynamicField: function( $scope ) {

			var $slider = $scope.find( '.jet-engine-gallery-slider' );

			if ( $slider.length ) {
				if ( $.isFunction( $.fn.imagesLoaded ) ) {
					$slider.imagesLoaded().done( function( instance ) {
						$slider.slick( $slider.data( 'atts' ) );
					} );
				}
			}

		},

		widgetBookingForm: function( $scope ) {

			var $calcFields = $scope.find( '.jet-form__calculated-field' );

			$( document ).trigger( 'jet-engine/booking-form/init' );

			if ( ! $calcFields.length ) {
				return;
			}

			$calcFields.each( function() {

				var $this      = $( this ),
					calculated = null;

				JetEngine.calcFields[ $this.data( 'name' ) ] = {
					'el': $this,
					'listenTo': $this.data( 'listen_to' ),
				};

				calculated = JetEngine.calculateValue( $this );

				$this.find( '.jet-form__calculated-field-val' ).text( +calculated.toFixed( $this.data( 'precision' ) ) );
				$this.find( '.jet-form__calculated-field-input' ).val( +calculated.toFixed( $this.data( 'precision' ) ) );

			});

		},

		calculateValue: function( $scope ) {

			var formula  = $scope.data( 'formula' ),
				listenTo = $scope.data( 'listen_to' ),
				regexp   = /%([a-zA-Z0-9-_]+)%/g,
				func     = null;


			formula = formula.replace( regexp, function ( match1, match2 ) {

				var object = $scope.closest( 'form' ).find( '[name="' + match2 + '"]' ),
					val    = null;

				if ( object.length ) {

					if ( 'INPUT' === object[0].nodeName ) {
						if( object.length > 1 ){
							for(var i = 0; i < object.length; i++){
								if(object[i].checked){
									val = object[i].value;
								}
							}
						} else {
							val = object.val();
						}
					}

					if ( 'SELECT' === object[0].nodeName ) {
						val = object.find( 'option:selected' ).val();
					}

				}

				if ( ! val ) {
					val = '0';
				}

				val = JetEngine.filters.applyFilters( 'forms/calculated-field-value', val, object );

				return val;

			} );

			func = new Function( 'return ' + formula );

			return func();

		},

		recalcFields: function() {

			var $this      = $( this ),
				fieldName  = $this.attr( 'name' ),
				fieldPrecision = 2,
				calculated = null;

			$.each( JetEngine.calcFields, function( calcFieldName, field ) {

				if ( 0 <= $.inArray( fieldName, field.listenTo ) ) {

					calculated = JetEngine.calculateValue( field.el );
					fieldPrecision  = field.el.data( 'precision' );

					field.el.find( '.jet-form__calculated-field-val' ).text( +calculated.toFixed(fieldPrecision) );
					field.el.find( '.jet-form__calculated-field-input' ).val( +calculated.toFixed(fieldPrecision) ).trigger( 'change.JetEngine' );

				}

			});

		},

		ajaxSubmitBookingForm: function() {

			var $this  = $( this ),
				$form  = $this.closest( '.jet-form' ),
				formID = $form.data( 'form-id' ),
				data   = {
					action: 'jet_engine_form_booking_submit',
					values: $form.serializeArray(),
				};

			$form.addClass( 'is-loading' );

			$( '.jet-form-messages-wrap[data-form-id="' + formID + '"]' ).html( '' );
			$form.find( '.jet-form__field-error' ).remove();

			$.ajax({
				url: JetEngineSettings.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: data,
			}).done( function( response ) {

				$form.removeClass( 'is-loading' );

				switch ( response.status ) {

					case 'validation_failed':

						$.each( response.fields, function( index, fieldName ) {
							var $field = $form.find( '.jet-form__field[name="' + fieldName + '"]:last' );

							if ( $field.hasClass( 'checkradio-field' ) ) {
								$field.closest( '.jet-form__field-wrap' ).after( response.field_message );
							} else {
								$field.after( response.field_message );
							}

						});

						break;

					case 'success':

						if ( response.redirect ) {
							window.location = response.redirect;
						} else if ( response.reload ) {
							window.location.reload();
						}

						break;

				}

				$( '.jet-form-messages-wrap[data-form-id="' + formID + '"]' ).html( response.message );

			} );

		},

		clearFieldErrors: function() {

			var $this = $( this );
			$this.closest( '.jet-form-col' ).find( '.jet-form__field-error' ).remove();

		},

		switchCalendarMonth: function( $event ) {

			var $this     = $( this ),
				$calendar = $this.closest( '.jet-calendar' ),
				$widget   = $calendar.closest( '.elementor-widget-container' ),
				settings  = $calendar.data( 'settings' ),
				post      = $calendar.data( 'post' ),
				month     = $this.data( 'month' );

			$calendar.addClass( 'jet-calendar-loading' );

			JetEngine.currentRequest = {
				action: 'jet_engine_calendar_get_month',
				month: month,
				settings: settings,
				post: post,
			};

			$( document ).trigger( 'jet-engine-request-calendar' );

			$.ajax({
				url: JetEngineSettings.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: JetEngine.currentRequest,
			}).done( function( response ) {
				if ( response.success ) {
					$widget.html( response.data.content );
				}
				$calendar.removeClass( 'jet-calendar-loading' );
			} );


		},

		filters: ( function() {

			var callbacks = {};

			return {

				addFilter: function( name, callback ) {

					if ( ! callbacks.hasOwnProperty( name ) ) {
						callbacks[name] = [];
					}

					callbacks[name].push(callback);

				},

				applyFilters: function( name, value, args ) {

					if ( ! callbacks.hasOwnProperty( name ) ) {
						return value;
					}

					if ( args === undefined ) {
						args = [];
					}

					var container = callbacks[ name ];
					var cbLen     = container.length;

					for (var i = 0; i < cbLen; i++) {
						if (typeof container[i] === 'function') {
							value = container[i](value, args);
						}
					}

					return value;
				}

			};

		})()

	};

	$( window ).on( 'elementor/frontend/init', JetEngine.init );

	window.JetEngine = JetEngine;

}( jQuery ) );
