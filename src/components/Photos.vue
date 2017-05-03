<template>
  <div class="photos">
    <div class="gallery"></div>
  </div>
</template>

<script>
// required for tests, native Promise unavailable for axios
import 'babel-polyfill';
import axios from 'axios';
import Photoswipe from 'photoswipe';
import PhotoswipeUi from 'photoswipe/dist/photoswipe-ui-default';

export default {
  name: 'photos',
  props: {
    siteName: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      apiKey: '6c6069e831fb567b86c7d9b75c82624f',
      flickrTags: undefined,
      flickrUrl: 'https://api.flickr.com/services/rest/?&method=flickr.photos.search',
      loading: false,
      disableButton: false,
      numberOfImages: 10,
      galleryImages: []
    }
  },
  watch: {
    siteName: function () {
      this.clearGallery();
      this.getFlickrImages();
    }
  },
  methods: {
    buildFlickrTags: function () {
      // get the tags from the select option text and trim everything after ':'
      this.flickrTags = this.siteName.replace(/:.*/, '').trim();
      // combine the river name as one tag
      this.flickrTags = this.flickrTags.replace(/\s+/g, '+');
      this.flickrTags = this.flickrTags.replace(',+', '+');
      // combine the river name and keep 'kayak' as the other tag
      this.flickrTags = 'kayak,Texas,' + this.flickrTags;

      return this.flickrTags;
    },
    getFlickrImages: function () {
      var vm = this;
      this.loading = true;

      // fetch data
      axios.get(vm.flickrUrl, {
        params: {
          api_key: vm.apiKey,
          format: 'json',
          nojsoncallback: 1,
          per_page: vm.numberOfImages,
          sort: 'interestingness-asc',
          tag_mode: 'all',
          tags: vm.buildFlickrTags()
        }
      })
      .then(response => {
        vm.loading = false;
        vm.buildImages(response.data.photos.photo);
      })
      .catch(error => {
        console.error(error.message);
        vm.loading = false;
        vm.error = error.message;
      });
    }, // END getFlickrImages
    buildImages: function (photos) {
      var vm = this;
      var gallery = document.querySelector('.gallery');
      var docFrag = document.createDocumentFragment();
      var image, link, photoURL, square, photoOriginal, photoLarge, photoHref; // eslint-disable-line

      photos.forEach(function (v, i) {
        // set urls
        vm.photoURL = '//farm' + v.farm + '.static.flickr.com/' + v.server + '/' + v.id + '_' + v.secret;
        vm.square = vm.photoURL + '_q.jpg'; // q = 150sq
        vm.photoLarge = vm.photoURL + '_b.jpg'; // b = 1024 on longest side,
        vm.photoOriginal = vm.photoURL + '_o.jpg';
        // set the photo href for larger views
        vm.photoHref = '//www.flickr.com/photos/' + v.owner + '/' + v.id;

        // photoswipe gallery
        vm.galleryImages.push({
          src: vm.photoLarge,
          title: v.title,
          // set size onload
          w: 0,
          h: 0
        });

        // thumbnail images
        image = new Image();
        image.src = vm.square;
        image.setAttribute('itemprop', 'thumbnail');
        image.title = v.title;
        image.height = 150;
        image.width = 150;
        image.dataset.index = i;

        link = document.createElement('a');
        link.rel = 'prefetch';
        link.href = vm.photoLarge;
        link.onclick = vm.initGallery;
        link.appendChild(image);

        docFrag.appendChild(link);
      });

      // insert images
      gallery.appendChild(docFrag);
      this.disableButton = true;
    },
    clearGallery: function () {
      this.$el.querySelector('.gallery').innerHTML = '';
      this.disableButton = false;
      this.galleryImages = [];
    },
    initGallery: function (e) {
      e.preventDefault();
      var vm = this;
      // photoswipe template
      var pswp = document.querySelector('.pswp');
      // photo options
      var options = {
        index: e.target.dataset.index,
        showHideOpacity: true
      };

      var galleryJs = new Photoswipe(pswp, PhotoswipeUi, vm.galleryImages, options);
      // set size after loading since we don't know
      // https://github.com/dimsemenov/PhotoSwipe/issues/796
      galleryJs.listen('gettingData', function (index, item) {
        if (item.w < 1 || item.h < 1) { // unknown size
          var img = new Image();
          img.onload = function () { // will get size after load
            item.w = this.width; // set image width
            item.h = this.height; // set image height
            galleryJs.invalidateCurrItems(); // reinit Items
            galleryJs.updateSize(true); // reinit Items
          }
          img.src = item.src; // let's download image
        }
      });

      galleryJs.init();
      // open the clicked thumbnail
      galleryJs.goTo(parseInt(e.target.dataset.index, 10));
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  @import '../../node_modules/photoswipe/dist/photoswipe.css';
  @import '../../node_modules/photoswipe/dist/default-skin/default-skin.css';

  .gallery {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  .gallery a {
    // display: inline-block;
    width: 150px;
    height: 150px;
    margin: 0 auto 0.5em;
  }
</style>
