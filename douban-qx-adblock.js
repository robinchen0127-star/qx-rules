/*
Quantumult X - 豆瓣开屏广告响应清理
更新时间：2026-05-04
用途：把豆瓣 splash/app_ads 接口响应改成无广告结构，避免单纯 reject 后 App 走兜底广告。
*/

function emptyAdLike(obj) {
  if (Array.isArray(obj)) return [];
  if (obj && typeof obj === 'object') return {};
  return null;
}

let body = $response && $response.body ? $response.body : '';
let url = $request && $request.url ? $request.url : '';

try {
  let data = JSON.parse(body || '{}');

  // 明确命中的豆瓣开屏广告接口：直接返回常见“无广告”结构。
  if (/\/v\d+\/app_ads\/splash_bid/i.test(url) || /\/app_ads\/splash/i.test(url) || /splash/i.test(url)) {
    data = {
      splash_ads: [],
      ads: [],
      ad: null,
      items: [],
      data: [],
      count: 0,
      has_ads: false,
      show: false,
      display: false
    };
  } else {
    const adKeys = /^(ad|ads|advert|advertise|advertisement|splash|splash_ad|splash_ads|startup|launch|boot|commercial|promotion|promote|bid|bids)$/i;
    const boolKeys = /^(has_ads|has_ad|show_ad|show_ads|need_ad|enable_ad|display_ad)$/i;

    function clean(x) {
      if (Array.isArray(x)) {
        return x.map(clean).filter(item => {
          const s = JSON.stringify(item || {}).slice(0, 3000);
          return !/(splash|advert|advertisement|commercial|promoted|ad_tracking|adid|creative_id)/i.test(s);
        });
      }
      if (x && typeof x === 'object') {
        for (const k of Object.keys(x)) {
          if (adKeys.test(k)) {
            x[k] = emptyAdLike(x[k]);
          } else if (boolKeys.test(k)) {
            x[k] = false;
          } else {
            x[k] = clean(x[k]);
          }
        }
      }
      return x;
    }
    data = clean(data);
  }

  $done({ body: JSON.stringify(data) });
} catch (e) {
  // 非 JSON 时给空对象，避免广告素材继续展示。
  $done({ body: '{}' });
}
