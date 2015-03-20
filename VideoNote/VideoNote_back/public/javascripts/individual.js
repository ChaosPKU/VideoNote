jQuery(document).ready(function() {
    //SWTICH SVG TO PNG
    if (!$("html").hasClass("svg")) {
        $("span.svg").remove();
        $('.nosvg').attr('style', 'display:block !important;');
    }
    else{
        $("span.svg").attr('style', 'display:block !important;');
        $('.nosvg').remove();
    }
    //================================================================================================
    //================================================================================================
    //==================================                            ==================================
    //==================================        SVG ANIMATION       ==================================
    //==================================                            ==================================
    //================================================================================================
    //================================================================================================

    //CLOCK ANIMATION
    function startTicking() {
        newInt = window.setInterval(function() {

            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();

            h = (h > 12) ? h - 12 : h;
            h = (h == '00') ? 12 : h;

            var secangle = (s) * 6;
            var minangle = (m) * 6;
            var hrsangle = h * 30;

            jQuerysvg = jQuery("#clock");

            if (s == 0) {
                jQuery("#sec", jQuerysvg).attr('transform', "rotate(" + secangle + ",50,50)");
            }

            jQuery("#sec", jQuerysvg).animate({
                svgTransform: 'rotate(' + secangle + ',50,50)'
            }, {
                duration: 400,
                easing: 'easeOutElastic'
            });
            jQuery("#min", jQuerysvg).animate({
                svgTransform: 'rotate(' + minangle + ',50,50)'
            }, {
                duration: 600,
                easing: 'easeOutElastic'
            });
            jQuery("#hrs", jQuerysvg).animate({
                svgTransform: 'rotate(' + hrsangle + ',50,50)'
            }, {
                duration: 800,
                easing: 'easeOutElastic'
            });

        }, 1000);
    }
    jQuery('#clock').hover(function() {

        var d = new Date();
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();

        h = (h > 12) ? h - 12 : h;
        h = (h == '00') ? 12 : h;

        var secangle = (s) * 6;
        var minangle = (m) * 6;
        var hrsangle = h * 30;

        jQuerysvg = jQuery("#clock");

        jQuery("#sec", jQuerysvg).animate({
            svgTransform: 'rotate(' + secangle + ',50,50)'
        }, {
            duration: 400,
            easing: 'easeOutElastic'
        });
        jQuery("#min", jQuerysvg).animate({
            svgTransform: 'rotate(' + minangle + ',50,50)'
        }, {
            duration: 400,
            easing: 'easeOutElastic'
        });
        jQuery("#hrs", jQuerysvg).animate({
            svgTransform: 'rotate(' + hrsangle + ',50,50)'
        }, {
            duration: 600,
            easing: 'easeOutElastic'
        });

        startTicking();

    }, function() {
        window.clearInterval(newInt);
    });


    //================================================================================================
    //SWATCHES
    jQuery('#swatches').hover(function() {
        jQuerysvg = jQuery('#swatches');
        rotate();

    }, function() {
        jQuery('#body-1').stop(true).animate({
            svgFill: "#29bb9c"
        }, 500);
        jQuery('#body-2').stop(true).animate({
            svgFill: "#e54d42"
        }, 500);

    }).click(function() {
        jQuerysvg = jQuery('#swatches');
        var colors = new Array('#1abc9c', '#2dc86f', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e');

        newcolor1 = getRandomInt(0, colors.length)
        newcolor2 = getRandomInt(0, colors.length)

        if (newcolor1 == newcolor2) {
            newcolor1 = getRandomInt(0, colors.length);
        }

        jQuery('#body-1').stop(true).animate({
            svgFill: colors[newcolor1]
        }, 500);
        jQuery('#body-2').stop(true).animate({
            svgFill: colors[newcolor2]
        }, 500);

        rotate();
    });
    newangle = 0;
    function rotate() {
        newangle = newangle - 180;
        jQuery('#pen-1', jQuerysvg).stop(true).animate({
            svgTransform: 'rotate(' + newangle + ',50,50)'
        }, {
            duration: 1400,
            easing: 'easeOutElastic'
        });
        jQuery('#pen-2', jQuerysvg).stop(true).animate({
            svgTransform: 'rotate(' + newangle + ',50,50)'
        }, {
            duration: 1500,
            easing: 'easeOutElastic'
        });

        var nf1 = jQuery('#inner-2', jQuerysvg).attr('fill');
        var nf2 = jQuery('#inner-1', jQuerysvg).attr('fill');
    }
});
$(".todo > ul > li").click(function(){
    $(this.dataset.target).toggle();
})