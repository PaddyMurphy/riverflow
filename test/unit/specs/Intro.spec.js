import Vue from 'vue'
import Intro from '@/components/Intro'

describe('Intro.vue', () => {
  it('should render the correct period', () => {
    const Constructor = Vue.extend(Intro)
    const vm = new Constructor({
      propsData: {
        period: 7
      }
    }).$mount()

    expect(vm.$el.querySelector('.period').textContent)
      .to.equal('7')
  })
})
