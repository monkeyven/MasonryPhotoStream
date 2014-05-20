//TODO: use require js or other lazy loading/dependancy manager to load
//500pxApi
//masonry.js
//jquery

/**
* New application
* container = jquery container
* column width = width of masonry column width
* scrollcontainer = container to check when user has scrolled to bottom
*/
function app(container, columnwidth, scrollcontainer) {
  
  var _container = container,
      _columnWidth = columnwidth,
      _scrollcontainer = scrollcontainer,
      //setup msnry layout
      _msnry, 
      //start with first page
      _curPage = 1,
      //how many 
      _favoriteCounter = 0; 
    
    var self = this;
    self.init = function() {

        //init 500px api
        _500px.init({
            sdk_key: '86d59c0fecdbd89ccbc4759fe02f3f4903bd5dc4'
        });

        _msnry = new Masonry( _container[0], {
            // options...
            itemSelector: '.photo',
            columnWidth: _columnWidth
          });

        //set event handlers, for photos
        _container.on('click', '.photo', photoClicked);

        //set event handlers for user scrolling
        _scrollcontainer.scroll(scrollCheck);

        //get first photos
        //TODO: check that we don't need more (if monitor larger resolution, etc)
        _curPage = getMorePhotos(_container, _curPage);
    }
    
    //TODO: change column width on the fly
    //self.changeColumnWidth(columnwidth){}

    //retrieve more photos from 500px api
    function getMorePhotos(container, curpage){
      
      var allPhotos = [],
          fragments = [],
          photo;

      // Get photos
      _500px.api('/photos', { feature: 'popular', page: curpage, image_size: 4 }, function (response) {
            $.each(response.data.photos, function () {
              
                var photo = createPhotoContainer(this);
                //add to the dom
                fragments.push(photo);
                //add to masonry styling array
                allPhotos.push(photo[0]);
            });
           _container.append(fragments);
           //add array all at once
          _msnry.appended(allPhotos);
      });

      return curpage + 1;
    }

    function createPhotoContainer(photo){
        var photoDom,
            widthRatio = (_columnWidth-3)  / photo.width,
            height = (photo.height * widthRatio);
        photoDom = $("<div>", {
                  class: "photo",
                  id: photo.id,
                  style: 'height:' + (height + 50) + 'px'
                })
                .append("<div class='count-hover'><span>" + photo.times_viewed + "</span></div>")
                .append($("<div>")
                .append($("<img>", {
                  src: photo.image_url,
                  style: 'height:' + height + 'px; width:' + (_columnWidth-3) + 'px'
                })))
                .append("<div class='photo-title'>" + photo.name + "</div>");

        return photoDom;
    }

    //if we click a photo we want to favorite it
    function photoClicked(ev, el){
        var cont = $(ev.currentTarget);
        if(cont.hasClass("active")){
          cont.removeClass("active");  
          _favoriteCounter -= 1;
        } else {
          cont.addClass("active");
          _favoriteCounter += 1;
        }
        $("#num-favorites").html(_favoriteCounter);
    }

    //check wether we have scrolled towards the bottom,
    //and get more images if we have
    function scrollCheck(ev){
        if($(window).scrollTop() + screen.height > getDocHeight() - 50) {
          _curPage = getMorePhotos(_container, _curPage);
        }
    } 

    //get true height of window, using function from
    //http://james.padolsey.com/javascript/get-document-height-cross-browser/
    function getDocHeight() {
        var D = document;
        return Math.max(
          D.body.scrollHeight, D.documentElement.scrollHeight,
          D.body.offsetHeight, D.documentElement.offsetHeight,
          D.body.clientHeight, D.documentElement.clientHeight
        );
    }

}