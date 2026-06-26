export const FAVORITES_LIST_ID = 'favorites'
export const MY_LISTINGS_ID = 'ilanlarim'

export const defaultLists = {
  [FAVORITES_LIST_ID]: {
    id: 'favorites', name: 'Favoriler',
    desc: 'Favori ilanlarınız',
    items: ['p1', 'p2', 'p3', 'p5', 'p6', 'p8', 'p10', 'p12', 'p14', 'd1', 'd3', 'd5', 'd6'],
    color: '#e3d10d', icon: 'heart',
    notes: {}
  },
  [MY_LISTINGS_ID]: {
    id: 'ilanlarim', name: 'Portföyüm',
    desc: 'Kaydettiğiniz ilanlar (Portföyüm)',
    items: ['p1', 'p4', 'p7', 'p10', 'd2'],
    color: '#059669', icon: 'bookmark',
    notes: {
      p1: 'Harika bir ev, kesinlikle değerlendirilmeli.',
      p4: 'Tatil için ideal konum.'
    }
  },
  l1: {
    id: 'l1', name: 'Hayalimdeki Evler',
    desc: 'Yaşamak istediğim evler', items: ['p1', 'p3', 'p6', 'p10', 'p14'],
    color: '#1e1b2e', icon: 'home',
    notes: {}
  },
  l2: {
    id: 'l2', name: 'Yatırımlık Projeler',
    desc: 'Değerlendirebilecek fırsatlar', items: ['p5', 'p7', 'p11', 'd3'],
    color: '#e3d10d', icon: 'trending-up',
    notes: {}
  },
  l3: {
    id: 'l3', name: 'Tatil İçin',
    desc: 'Yazlık ve tatillik seçenekler', items: ['p4', 'p8'],
    color: '#3b82f6', icon: 'umbrella',
    notes: {}
  },
  l4: {
    id: 'l4', name: 'Ofis Seçenekleri',
    desc: 'İş yeri için alternatifler', items: ['p9', 'p12', 'p13'],
    color: '#8b5cf6', icon: 'building-2',
    notes: {}
  }
}
