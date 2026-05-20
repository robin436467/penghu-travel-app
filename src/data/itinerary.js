// 五天行程（取自澎湖行程.xlsx「行程」分頁）
// type 用於對應圖示：transport 交通 / food 餐飲 / spot 景點 / activity 活動 / hotel 住宿
// place 為導航用的地點查詢字串；沒填則該項無導航按鈕。

export const itinerary = [
  {
    day: 1,
    date: '2026-05-22',
    weekday: '五',
    title: '安船長海釣',
    stops: [
      { id: 'd1-1', time: '08:00', type: 'transport', name: '抵達馬公機場・租車', place: '馬公機場', note: '早上 8 點到馬公機場，租汽車 1 台、行李托運' },
      { id: 'd1-2', time: '11:00', type: 'food', name: '午餐', note: '機場附近用餐' },
      { id: 'd1-3', time: '12:00', type: 'activity', name: '安船長｜海之柔登船', place: '安船長海上平台 澎湖', note: '出海海釣' },
      { id: 'd1-4', time: '18:00', type: 'food', name: '安船長餐廳・晚餐', place: '安船長餐廳 澎湖', note: '吃現釣的魚' },
      { id: 'd1-5', time: '20:00', type: 'hotel', name: '仁居民宿入住', place: '仁居民宿 澎湖', note: 'check-in、行李就定位' },
    ],
  },
  {
    day: 2,
    date: '2026-05-23',
    weekday: '六',
    title: '西嶼一日',
    stops: [
      { id: 'd2-1', time: '08:00', type: 'transport', name: '抵達馬公機場・牽車', place: '馬公機場', note: '詹、嘎早上 8 點到，到仁居民宿會合、牽車 check-in' },
      { id: 'd2-2', time: '12:00', type: 'food', name: '小萍的店・小卷米粉', place: '小萍的店 西嶼', note: '招牌小卷米粉' },
      { id: 'd2-3', time: '14:00', type: 'activity', name: '浮潛 / 內垵沙灘', place: '內垵沙灘', note: '可現場租裝備' },
      { id: 'd2-4', time: '17:00', type: 'activity', name: '潮間帶體驗（約2小時）', place: '西嶼 潮間帶', note: '記得戴頭燈，來回車程約 90 分鐘' },
      { id: 'd2-5', time: '19:30', type: 'food', name: '漁村川菜活海鮮・晚餐', place: '漁村川菜活海鮮 西嶼', note: '需事先預訂' },
    ],
  },
  {
    day: 3,
    date: '2026-05-24',
    weekday: '日',
    title: '吉貝島',
    stops: [
      { id: 'd3-1', time: '08:00', type: 'transport', name: '北海遊客中心報到', place: '北海遊客中心 澎湖', note: '8 點報到、8:30 開船前往吉貝' },
      { id: 'd3-2', time: '12:00', type: 'food', name: '吉貝別野餐廳・午餐', place: '吉貝別野餐廳', note: '桌菜' },
      { id: 'd3-3', time: '14:00', type: 'activity', name: '吉貝沙尾・水上設施・機車', place: '吉貝沙尾', note: '水上設施＋機車環島＋目斗嶼燈塔' },
      { id: 'd3-4', time: '18:30', type: 'food', name: '仁居民宿 BBQ 烤肉', place: '仁居民宿 澎湖', note: '提前訂郭家牡蠣' },
    ],
  },
  {
    day: 4,
    date: '2026-05-25',
    weekday: '一',
    title: '湖西・花火節',
    stops: [
      { id: 'd4-1', time: '09:00', type: 'spot', name: '仁居附近走走', place: '仁居民宿 澎湖', note: '早上自由活動' },
      { id: 'd4-2', time: '12:00', type: 'food', name: '味良壽司・午餐', place: '味良壽司 澎湖', note: '營業 06:30–14:00，可能須預訂' },
      { id: 'd4-3', time: '15:00', type: 'spot', name: '隘門沙灘 / 林投沙灘', place: '隘門沙灘', note: '摩西分海周邊海灘' },
      { id: 'd4-4', time: '18:00', type: 'food', name: '晚餐', note: '馬公市區用餐' },
      { id: 'd4-5', time: '21:00', type: 'spot', name: '澎湖花火節', place: '澎湖觀音亭 花火節', note: '晚上 21:00 開始施放' },
    ],
  },
  {
    day: 5,
    date: '2026-05-26',
    weekday: '二',
    title: '水族館・返程',
    stops: [
      { id: 'd5-1', time: '11:00', type: 'hotel', name: '仁居民宿退房', place: '仁居民宿 澎湖', note: '11:00 前退房' },
      { id: 'd5-2', time: '12:00', type: 'food', name: '午餐', note: '馬公用餐' },
      { id: 'd5-3', time: '14:00', type: 'spot', name: '澎湖水族館', place: '澎湖水族館', note: '營業 09:00–17:00，可分批去浮潛' },
      { id: 'd5-4', time: '17:30', type: 'food', name: '馬公晚餐', place: '馬公', note: '回程前補貨晚餐' },
      { id: 'd5-5', time: '19:00', type: 'transport', name: '還車・馬公機場', place: '馬公機場', note: '7 點前還車，20:35 飛機，21:30 抵松山機場' },
    ],
  },
]
