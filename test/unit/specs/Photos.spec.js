import Vue from 'vue'
import Photos from '@/components/Photos'

describe('Photos.vue', () => {
  const Constructor = Vue.extend(Photos)
  const correctTags = 'kayak,Texas,Barton+Creek'
  let vm

  it('should load the photos vue no galleryImages', () => {
    vm = new Constructor({
      propsData: {
        siteName: ''
      }
    }).$mount();
    // images should be intially empty
    expect(vm.$data.galleryImages.length).to.equal(0);
  });

  it('buildFlickrTags should return comma delimite list', () => {
    vm = new Constructor({
      propsData: {
        siteName: 'Barton Creek : Loop 360'
      }
    }).$mount();
    // TODO: test emitting...
    // flickr tags should be populated
    vm.buildFlickrTags()
    expect(vm.$data.flickrTags).to.equal(correctTags);
  });

  afterEach(function () {
    vm.$destroy()
  })
})
