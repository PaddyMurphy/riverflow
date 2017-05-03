import Vue from 'vue'
import Graph from '@/components/Graph'

describe('Graph.vue', () => {
  const Constructor = Vue.extend(Graph)
  const vm = new Constructor({
    propsData: {
      radioDateType: 'date',
      selected: 'selectRiver',
      startDate: undefined,
      endDate: '2017-05-02',
      graphType: '00060',
      period: 7
    }
  }).$mount();

  it('should load the graph vue with no image', () => {
    // graph-image should be empty initially
    expect(vm.$el.querySelector('.graph-image').textContent)
      .to.equal('');
  });

  it('should return a html img tag on displayGraph', () => {
    // displayGraph should return a valid img tag
    const imgTag = vm.displayGraph();
    const isValidImg = imgTag.match(/<img src=("[^"]*"|'[^']*'|[^'">])*>/ig);
    // should match 1 valid img tag
    expect(isValidImg.length).to.equal(1);
  });
})
