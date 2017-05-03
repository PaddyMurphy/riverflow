import Vue from 'vue'
import Navbar from '@/components/Navbar'

describe('Navbar.vue', () => {
  it('should render the nav with title and headline', () => {
    const Constructor = Vue.extend(Navbar)
    const vm = new Constructor().$mount()

    expect(vm.$el.querySelector('.title').textContent)
      .to.equal('Riverflow')
  })
})
