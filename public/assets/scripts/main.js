// easing functions http://goo.gl/5HLl8
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) {
        return c/2*t*t + b
    }
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInCubic = function(t, b, c, d) {
    var tc = (t/=d)*t*t;
    return b+c*(tc);
};

Math.inOutQuintic = function(t, b, c, d) {
    var ts = (t/=d)*t,
        tc = ts*t;
    return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
};

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
var requestAnimFrame = (function(){
    return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };
})();

function scrollTo(to, callback, duration) {
    // figure out if this is moz || IE because they use documentElement
    var doc = (navigator.userAgent.indexOf('Firefox') != -1 || navigator.userAgent.indexOf('MSIE') != -1) ? document.documentElement : document.body,
        start = doc.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;
    duration = (typeof(duration) === 'undefined') ? 500: duration;
    var animateScroll = function(){
        // increment the time
        currentTime += increment;
        // find the value with the quadratic in-out easing function
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        // move the document.body
        doc.scrollTop = val;
        // do the animation unless its over
        if(currentTime < duration) {
            requestAnimFrame(animateScroll);
        } else {
            if (callback && typeof(callback) === 'function') {
                // the animation is done so lets callback
                callback();
            }
        }
    };
    animateScroll();
}

function animate(elem,style,unit,from,to,time,prop) {
    if( !elem) return;
    var start = new Date().getTime(),
        timer = setInterval(function() {
            var step = Math.min(1,(new Date().getTime()-start)/time);
            if (prop) {
                elem[style] = (from+step*(to-from))+unit;
            } else {
                elem.style[style] = (from+step*(to-from))+unit;
            }
            if( step == 1) clearInterval(timer);
        },25);
    elem.style[style] = from+unit;
}

window.testClickListener = function(){
    var element = this.getAttribute('href')
    var target = element.replace('#', '');

    scrollTo(window.document.getElementById(target).offsetTop);
};

[].forEach.call( document.querySelectorAll('.__scrollto'), function(scrollToLink) {
    scrollToLink.addEventListener('click', window.testClickListener, false);
});



/*!
 * Retina.js v1.1.0
 *
 * Copyright 2013 Imulus, LLC
 * Released under the MIT license
 *
 * Retina.js is an open source script that makes it easy to serve
 * high-resolution images to devices with retina displays.
 */
(function() {

  var root = (typeof exports == 'undefined' ? window : exports);

  var config = {
    // Ensure Content-Type is an image before trying to load @2x image
    // https://github.com/imulus/retinajs/pull/45)
    check_mime_type: true
  };



  root.Retina = Retina;

  function Retina() {}

  Retina.configure = function(options) {
    if (options == null) options = {};
    for (var prop in options) config[prop] = options[prop];
  };

  Retina.init = function(context) {
    if (context == null) context = root;

    var existing_onload = context.onload || new Function;

    context.onload = function() {
      var images = document.getElementsByTagName("img"), retinaImages = [], i, image;
      for (i = 0; i < images.length; i++) {
        image = images[i];
        retinaImages.push(new RetinaImage(image));
      }
      existing_onload();
    }
  };

  Retina.isRetina = function(){
    var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
                      (min--moz-device-pixel-ratio: 1.5),\
                      (-o-min-device-pixel-ratio: 3/2),\
                      (min-resolution: 1.5dppx)";

    if (root.devicePixelRatio > 1)
      return true;

    if (root.matchMedia && root.matchMedia(mediaQuery).matches)
      return true;

    return false;
  };


  root.RetinaImagePath = RetinaImagePath;

  function RetinaImagePath(path, at_2x_path) {
    this.path = path;
    if (typeof at_2x_path !== "undefined" && at_2x_path !== null) {
      this.at_2x_path = at_2x_path;
      this.perform_check = false;
    } else {
      this.at_2x_path = path.replace(/\.\w+$/, function(match) { return "@2x" + match; });
      this.perform_check = true;
    }
  }

  RetinaImagePath.confirmed_paths = [];

  RetinaImagePath.prototype.is_external = function() {
    return !!(this.path.match(/^https?\:/i) && !this.path.match('//' + document.domain) )
  }

  RetinaImagePath.prototype.check_2x_variant = function(callback) {
    var http, that = this;
    if (this.is_external()) {
      return callback(false);
    } else if (!this.perform_check && typeof this.at_2x_path !== "undefined" && this.at_2x_path !== null) {
      return callback(true);
    } else if (this.at_2x_path in RetinaImagePath.confirmed_paths) {
      return callback(true);
    } else {
      http = new XMLHttpRequest;
      http.open('HEAD', this.at_2x_path);
      http.onreadystatechange = function() {
        if (http.readyState != 4) {
          return callback(false);
        }

        if (http.status >= 200 && http.status <= 399) {
          if (config.check_mime_type) {
            var type = http.getResponseHeader('Content-Type');
            if (type == null || !type.match(/^image/i)) {
              return callback(false);
            }
          }

          RetinaImagePath.confirmed_paths.push(that.at_2x_path);
          return callback(true);
        } else {
          return callback(false);
        }
      }
      http.send();
    }
  }



  function RetinaImage(el) {
    this.el = el;
    this.path = new RetinaImagePath(this.el.getAttribute('src'), this.el.getAttribute('data-at2x'));
    var that = this;
    this.path.check_2x_variant(function(hasVariant) {
      if (hasVariant) that.swap();
    });
  }

  root.RetinaImage = RetinaImage;

  RetinaImage.prototype.swap = function(path) {
    if (typeof path == 'undefined') path = this.path.at_2x_path;

    var that = this;
    function load() {
      if (! that.el.complete) {
        setTimeout(load, 5);
      } else {
        that.el.setAttribute('width', that.el.offsetWidth);
        that.el.setAttribute('height', that.el.offsetHeight);
        that.el.setAttribute('src', path);
      }
    }
    load();
  }




  if (Retina.isRetina()) {
    Retina.init(root);
  }

})();

