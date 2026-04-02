jQuery(function ($) {

    // Instagram
    var token = '1005992259.1677ed0.9bec0ccc60dc442e9d526fed0204fd1b ', // learn how to obtain it below
        userid = 1005992259, // User ID - get it in source HTML of your Instagram profile or look at the next example :)
        num_photos = 20; // how much photos do you want to get

    $('#sbi_images').imagesLoaded( function() {
      $('.sbi_item').each(function(i,e){
        const $img  = $(e).find('img');
        const $link = $(e).find('a');
        let txt      = $img.attr('alt');
        let smallRes = $img.attr('src').replace('size=t', 'size=m');
        let fullRes  = $link.data('full-res');
        let link     = $link.attr('href');
        if(txt.length > 200){
          txt = txt.substr(0,200)+'...';
        }
        $('ul.haus-insta-feed').append('<li data-big-img="' + fullRes + '"><a href="' + link + '" target="_blank"><div class="thumb" style="background-image:url(' + smallRes + ');"></div><p class="descr">'+txt+'</p></a></li>');
      });

      $('#sb_instagram').empty().remove();

      // Init slick when all is done
      $('ul.haus-insta-feed').slick({
        dots: true,
        infinite: true,
        speed: 500,
        fade: false,
        prevArrow: '<button type="button" class="slick-prev"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="37" fill="none"><path stroke="#4B3D34" stroke-linecap="round" stroke-linejoin="round" d="m18.5.5-18 18 18 18"/></svg></button>',
        nextArrow: '<button type="button" class="slick-next"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="37" fill="none"><path stroke="#4B3D34" stroke-linecap="round" stroke-linejoin="round" d="m.5.5 18 18-18 18"/></svg></button>',
        cssEase: 'ease-out',
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [
          {
            breakpoint: 1100,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3
            }
          },
          {
            breakpoint: 900,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
      });
    });

    /*$.ajax({
        url: 'https://api.instagram.com/v1/users/' + userid + '/media/recent', // or /users/self/media/recent for Sandbox
        dataType: 'jsonp',
        type: 'GET',
        data: {access_token: token, count: num_photos},
        success: function(data){
            //console.log(data);
            for( x in data.data ){
                var txt = data.data[x].caption.text;
                if(txt.length > 200){
                    txt = txt.substr(0,200)+'...';
                }
                $('ul.haus-insta-feed').append('<li data-big-img="' + data.data[x].images.standard_resolution.url + '"><a href="' + data.data[x].link + '" target="_blank"><div class="thumb" style="background-image:url(' + data.data[x].images.low_resolution.url + ');"></div><p class="descr">'+txt+'</p></a></li>');
            }
        },
        error: function(data){
            console.log(data); // send the error notifications to console
        }
    });*/


});