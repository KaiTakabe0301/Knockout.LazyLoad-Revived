(function ($, ko) {
  ("use strict");
  function KoLazyLoad() {
    var self = this;

    var updatebit = ko.observable(true).extend({ throttle: 50 });

    // Tags that KoLazyLoad targets.
    var handlers = {
      img: updateImage,
    };

    // Tags that KoLazyLoad targets.
    let eventsListeners = {};

    /**
     * Register eventListeners
     * @params {string} key - The id set for the tag that is the target of kolazyload.
     * @params {string} events - Event name that determines the timing of the callback function.
     * @params {handler} Callback - function executed at the timing specified by events.
     */
    function on(key, events, handler) {
      if (typeof handler !== "function") {
        return;
      }

      if (!eventsListeners[key]) {
        eventsListeners[key] = {};
      }
      events.split(" ").forEach(function (event) {
        if (!eventsListeners[key][event]) {
          eventsListeners[key][event] = [];
        }
        eventsListeners[key][event].push(handler);
      });
    }

    /**
     * Execute the registered callback functions for each event
     * Writing emit(id, 'load hoge', element) will execute the registered callback functions for id in the order of 'load' -> 'hoge'.
     * Note: hoge is a non-load event name that may be added in the future.
     * To call emit, write as follows:
     *   1. emit(id, 'load', element);
     * @params {ArrayLike} arguments - Arguments that can be passed arbitrarily at the time of processing execution
     */
    function emit() {
      if (!eventsListeners) {
        return;
      }

      // Get any arguments
      let args = [];
      let len = arguments.length;

      while (len--) {
        args[len] = arguments[len];
      }

      let key;
      let events;
      let data;
      const context = self;

      // Check for the id attribute
      if (typeof args[0] === "string") {
        // If the id attribute is set
        key = args[0];
      } else if (args[0] === undefined) {
        // If the id attribute is not set, the callback function is not executed.
        return;
      } else {
        // If the developer sets an unexpected format for the first argument.
        console.log(
          "[DEBUG]:The id attribute is not set in the correct format. Please set it in string format."
        );
        return;
      }

      // Check for the event at which the callback function is called.
      if (typeof args[1] === "string" || Array.isArray(args[1])) {
        events = args[1];
      } else {
        console.log(
          "[DEBUG]:The event is not set in the correct format. Please set it in string or array format."
        );
        return;
      }

      data = args.slice(2, args.length);

      const eventsArray = Array.isArray(events) ? events : events.split(" ");

      eventsArray.forEach(function (event) {
        if (eventsListeners[key] && eventsListeners[key][event]) {
          let handlers = [];
          eventsListeners[key][event].forEach(function (eventHandler) {
            handlers.push(eventHandler);
          });
          handlers.forEach(function (eventHandler) {
            eventHandler.apply(context, data);
          });
        }
      });
    }

    /**
     * Toggle the ko.observable object updatebit
     */
    function flagForLoadCheck() {
      updatebit(!updatebit());
    }

    // While scrolling/resizing, updatebit continues to toggle. (subscribe continues to fire)
    $(window).on("scroll", flagForLoadCheck);
    $(window).on("resize", flagForLoadCheck);

    /**
     * Check if the element with KoLazyLoad set is within the viewport.
     * @param {object} element - Tag with KoLazyLoad set.
     * @param {number} threshold - Threshold to start loading images before they fit into the viewport.
     * @returns {boolean} Returns true if it fits within the viewport + threshold.
     */
    function isInViewport(element, threshold) {
      var rect = element.getBoundingClientRect();
      return (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top - threshold <
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    /**
     * Execute image loading for the target element.
     * @param {object} element - DOM element associated with this binding.
     * @param {object} valueAccessor - JavaScript function for obtaining the current model property associated with this binding.
     * @param {object} allBindings - JavaScript object for accessing all model values bound to this DOM element.
     * @param {object} viewModel - Object for obtaining the view model.
     * @param {object} bindingContext - Object holding the binding context available in this DOM element's binding.
     */
    function updateImage(
      element,
      valueAccessor,
      allBindings,
      viewModel,
      bindingContext
    ) {
      var attrs = ko.unwrap(valueAccessor());
      var threshold = attrs["threshold"] || 0;

      // Set the images to src and srcset if the element is within the configured viewport.
      if (isInViewport(element, threshold)) {
        $(element).attr("src", attrs["src"]);
        $(element).attr("srcset", attrs["srcset"]);
        $(element).data("kolazy", true);

        emit.call(self, $(element).attr("id"), "load", element);
      }
    }

    /**
     * Set KoLazyLoad for the target element.
     * @param {object} element - DOM element associated with this binding.
     * @param {object} valueAccessor - JavaScript function for obtaining the current model property associated with this binding.
     * @param {object} allBindings - JavaScript object for accessing all model values bound to this DOM element.
     * @param {object} viewModel - Object for obtaining the view model.
     * @param {object} bindingContext - Object holding the binding context available in this DOM element's binding.
     */
    function init(
      element,
      valueAccessor,
      allBindings,
      viewModel,
      bindingContext
    ) {
      var initArgs = arguments;
      var attrs = ko.unwrap(valueAccessor());
      // If a custom loading gif image is not set, a 1x1 transparent image is used as the loading image.
      var loadingSrc =
        attrs["loadingSrc"] ||
        "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";

      // Store the user-defined functions in eventsListeners.
      if (attrs["on"]) {
        const id = $(element).attr("id");
        if (!id) {
          console.log(
            "[DEBUG]: Failed to register the callback function. If you want to use a callback function, please specify the id attribute."
          );
          return;
        }
        Object.keys(attrs["on"]).forEach(function (eventName) {
          on.call(self, id, eventName, attrs["on"][eventName]);
        });
      }

      // Set the loading image to be displayed until the image is fully loaded.
      $(element).attr("src", loadingSrc);

      // Set up the subscribe for the target element.
      updatebit.subscribe(function () {
        update.apply(self, initArgs);
        // Added to detect elements that cover the entire screen, like modals, and are initially hidden.
        flagForLoadCheck();
      });

      // Check if the target element is within the viewport when the page is loaded.
      flagForLoadCheck();
    }

    /**
     * Execute methods registered in handlers for the target element tag.
     * @param {object} element - DOM element associated with this binding.
     * @param {object} valueAccessor - JavaScript function for obtaining the current model property associated with this binding.
     * @param {object} allBindings - JavaScript object for accessing all model values bound to this DOM element.
     * @param {object} viewModel - Object for obtaining the view model.
     * @param {object} bindingContext - Object holding the binding context available in this DOM element's binding.
     * @returns {object}
     * @throws {Error}
     */
    function update(
      element,
      valueAccessor,
      allBindings,
      viewModel,
      bindingContext
    ) {
      var $element = $(element);

      if (
        $element.is(":hidden") ||
        $element.css("visibility") == "hidden" ||
        $element.data("kolazy")
      ) {
        return;
      }

      /**
       * If the target element's tag is registered in handlers, execute the configured process.
       * Here, updateImage set for the img tag is executed.
       */
      var handlerName = element.tagName.toLowerCase();
      if (handlers.hasOwnProperty(handlerName)) {
        return handlers[handlerName].apply(this, arguments);
      } else {
        throw new Error('No lazy handler defined for "' + handlerName + '"');
      }
    }

    return {
      handlers: handlers,
      init: init,
      update: update,
    };
  }

  ko.bindingHandlers.lazyload = new KoLazyLoad();
})(jQuery, ko);
