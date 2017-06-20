import Vue from 'vue'
import Conditions from '@/components/Conditions'

describe('Conditions.vue', () => {
  const Constructor = Vue.extend(Conditions)
  const vm = new Constructor({
    propsData: {
      latestCfs: '123'
    }
  }).$mount();

  it('should load the conditions vue hidden with no values', () => {
    // conditions should be empty initially
    expect(vm.$el.style.display).to.equal('none');
    expect(vm.$data.condition).to.undefined;
  });

  it('should return a paragraph of conditions', () => {
    vm.displayConditions();
    // should have a condition now
    expect(vm.$data.condition).to.not.be.undefined;
  });
})
