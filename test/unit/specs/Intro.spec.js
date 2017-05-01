import Vue from 'vue'
import Intro from '@/components/Intro'

describe('Intro.vue', () => {
  it('should render the correct period', () => {
    let Constructor = Vue.extend(Intro)
    Constructor = Constructor.extend({
      propsData: {
        period: 7
      }
    })

    const vm = new Constructor().$mount()

    expect(vm.$el.querySelector('.period').textContent)
      .to.equal('7')
  })
})
