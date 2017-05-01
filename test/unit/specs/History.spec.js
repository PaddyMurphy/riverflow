import Vue from 'vue'
// avoriaz is a vue / mocha wrapper
// import { mount } from 'avoriaz';
import History from '@/components/History'

describe('History.vue', () => {
  let Constructor = Vue.extend(History)
  // history of > 1 required to render
  Constructor = Constructor.extend({
    data () {
      return {
        history: '[{"cfs":"116","name":"Brazos Rv nr Palo Pinto, TX","time":"1:15:00 PM","date":"Mon May 01 2017"},{"cfs":"12","name":"Brazos Rv nr Glen Rose, TX","time":"1:00:00 PM","date":"Mon May 01 2017"}]'
      }
    },
    propsData: {
      latestCfs: '123',
      siteName: 'Test site name',
      latestDate: 'Mon May 01 2017',
      latestTime: '1:15:00 PM'
    }
  })

  it('renders a div with class history', () => {
    const vm = new Constructor().$mount();

    expect(vm.$el.querySelector('.history-title')
      .textContent).to.equal('History')
  });
})
