/*
Quantumult X - 豆瓣开屏广告响应清理 v3
更新时间：2026-06-02
用途：把豆瓣 splash/app_ads 接口响应改成无广告结构，避免 reject 后 App 走缓存/兜底广告。
*/

const url = ($request && $request.url) || '';
const body = ($response && $response.body) || '';

function emptyFor(v) {
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return {};
  if (typeof v === 'boolean') return false;
  if (typeof v === 'number') return 0;
  return null;
}

function looksAdNode(x) {
  if (!x || typeof x !== 'object') return false;
  const s = JSON.stringify(x).slice(0, 6000);
  return /(splash|app_ads|advert|advertisement|commercial|promoted|ad_tracking|adid|creative_id|material_id|click_url|landing_url|开屏|广告|erebor|adservice)/i.test(s);
}

function clean(x) {
  if (Array.isArray(x)) return x.map(clean).filter(v => !looksAdNode(v));
  if (x && typeof x === 'object') {
    for (const k of Object.keys(x)) {
      const lk = String(k).toLowerCase();
      if (/^(ad|ads|advert|adverts|advertise|advertisement|splash|splash_ad|splash_ads|startup|launch|boot|commercial|promotion|promote|bid|bids|materials|creative|creatives)$/.test(lk)) {
        x[k] = emptyFor(x[k]);
      } else if (/^(has_ads|has_ad|show_ad|show_ads|need_ad|enable_ad|display_ad|hasad|showad|isshow)$/.test(lk)) {
        x[k] = false;
      } else {
        x[k] = clean(x[k]);
      }
    }
  }
  return x;
}

try {
  let data = JSON.parse(body || '{}');
  data = clean(data);
  if (/app_ads|splash|startup|launch|boot/i.test(url)) {
    data = Object.assign({}, data, {
      splash_ads: [],
      splashAds: [],
      ads: [],
      ad: null,
      adverts: [],
      items: [],
      data: [],
      materials: [],
      count: 0,
      has_ads: false,
      hasAd: false,
      show: false,
      display: false,
      enabled: false
    });
  }
  $done({ body: JSON.stringify(data) });
} catch (e) {
  $done({ body: '{"splash_ads":[],"ads":[],"data":[],"count":0,"has_ads":false,"show":false}' });
}
