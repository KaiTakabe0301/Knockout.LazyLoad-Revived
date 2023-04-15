# Knockout.LazyLoad-Revived

It is based on the open source [Knockout.Lazyload](https://github.com/seantimm/Knockout.LazyLoad) developed by seantimms, to which we added various extensions of our own.
<br>
It has been 9 years since he completed the development, and it would be inconvenient to contact him now, so we have released it as a separate repository.
<br>
If you are willing to merge the diffs into the original repository, I would be happy to do so!

## Usage
It provides lazyload for img tags using knockout.js
Please set it up as follows:

 * ```loadingSrc```: The image displayed while lazyload is running.
 * ```src```: The image you want to load with lazyload.
 * ```srcset```: The image you want to load when displayed on HiDPI monitors.
 * ```threshold```: Set this if you want to start loading before the image is within the viewport. By setting a value greater than or equal to 0, you can start loading in advance.
 * ```on```: Execute an arbitrary callback function depending on the event timing.
 <br>※ To execute a callback function, please specify the id attribute. If the callback function is specified and the id attribute is not set, lazyload will not work.<br>
     Currently, it is possible to execute callback functions at the following timings.<br>
     * ```load```: When lazyload is completed and both src and srcset have finished loading.<br>
 The target element is passed as the first argument.
   
   ### Example
   #### HTML
   ```html
   <ul data-bind="foreach: images">
     <li>
       <img id="unique_id"
            data-bind="attr: {id: unique_id }, // ※ If you want to assign an id dynamically, describe it before lazyload
                   lazyload: {
                      loadingSrc: 'loading_48x48.gif',
                      src: $data,
                      srcset: 'text1x.png 1x test2x.png 2x',
                      threshold: 200,
                      on: {
                        load: function(element){
                            console.log(element);
                        }
                      }
                   }"
                   >
     </li>
   </ul>
   <script src="knockout.js"></script>
   <script src="ko.lazyload.js"></script>
   ```
   
   #### JavaScript
   ```javascript
   var viewModel = {
     images: ko.observableArray([
      'image1.png'),
      'image2.png'),
      'image3.png')
     ])
   };
   ko.applyBindings(viewModel);
   ```
