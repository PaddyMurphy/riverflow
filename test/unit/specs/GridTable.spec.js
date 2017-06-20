import Vue from 'vue'
import GridTable from '@/components/GridTable'

describe('GridTable.vue', () => {
  const Constructor = Vue.extend(GridTable)
  const vm = new Constructor({
    propsData: {
      data: [{
        'name': 'Brazos Rv nr Palo Pinto, TX',
        'location': '//maps.google.com/?q=32.8626236,+-98.3025492',
        'site': '08089000',
        'date': '',
        'time': '14:15',
        'cfs': 174,
        'oldCfs': 257,
        'condition': 'This is a pretty leisurely flow but still fun. You shouldn\'t have any problems scraping bottom in canoes at this level',
        'level': 'level-3',
        'rising': false,
        'risingFast': false,
        'class': 'II-III'
      }, {
        'name': 'Brazos Rv nr Glen Rose, TX',
        'location': '//maps.google.com/?q=32.25903188,+-97.7025268',
        'site': '08091000',
        'date': '',
        'time': '14:00',
        'cfs': 146,
        'oldCfs': 201,
        'condition': 'This is a pretty leisurely flow but still fun. You shouldn\'t have any problems scraping bottom in canoes at this level',
        'level': 'level-3',
        'rising': false,
        'risingFast': false,
        'class': 'II-III'
      }],
      columns: ['name', 'cfs'],
      filterKey: undefined,
      loading: false,
      graphType: '00060'
    }
  }).$mount();

  it('should load table with 2 rows (tbody)', () => {
    expect(vm.$el.querySelectorAll('.table tbody').length).to.be.equal(2);
    console.log(vm.$propsData)
  });
})
