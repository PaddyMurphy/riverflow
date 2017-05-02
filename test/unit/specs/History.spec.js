import Vue from 'vue'
// avoriaz is a vue / mocha wrapper
// import { mount } from 'avoriaz';
import History from '@/components/History'

describe('History.vue', () => {
  const Constructor = Vue.extend(History)
  // history of > 1 required to render
  const vm = new Constructor({
    data () {
      return {
        history: [
          {'cfs': '116', 'name': 'Brazos Rv nr Palo Pinto, TX', 'time': '1:15:00 PM', 'date': 'Mon May 01 2017'},
          {'cfs': '12', 'name': 'Brazos Rv nr Glen Rose, TX', 'time': '1:00:00 PM', 'date': 'Mon May 01 2017'}
        ]
      }
    },
    propsData: {
      latestCfs: '123',
      siteName: 'Test site name',
      latestDate: 'Mon May 01 2017',
      latestTime: '1:15:00 PM'
    }
  }).$mount();

  it('should render the history component', () => {
    expect(vm.$el.querySelector('.history-title')
      .textContent).to.equal('History')
  });

  it('should add a new history item', () => {
    expect(vm.history.length).to.equal(2)
    vm.addHistory();
    expect(vm.history.length).to.equal(3)
    // clean up
    window.localStorage.clear();
    vm.history = [];
  });
})
