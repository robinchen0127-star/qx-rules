/*
Quantumult X - 京东开屏/启动广告响应清理
更新时间：2026-07-08
用途：清理京东 App 开屏、启动页、广告配置响应；保留正常业务字段，避免核心 API 整条拒绝导致异常。
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

function isAdKey(k) {
  const lk = String(k || '').toLowerCase();
  return /^(ad|ads|advert|adverts|advertise|advertisement|advertisements|splash|splashad|splashads|splashadvert|splashadvertise|startup|startupad|startupads|startupadvert|startimage|startpage|launch|launchad|launchads|boot|bootad|openscreen|openscreenad|openad|promotion|promotions|material|materials|admaterial|admaterials|creative|creatives|floorads|deliveryads|jdad|jdads|expo|exposure)$/.test(lk);
}

function isAdSwitch(k) {
  const lk = String(k || '').toLowerCase();
  return /^(hasad|hasads|showad|showads|needad|displayad|enablead|showadvert|hasadvert|showadvertise|needadvert|isshow|isdisplay|visible|show)$/.test(lk);
}

function looksAdNode(x) {
  if (!x || typeof x !== 'object') return false;
  let s = '';
  try { s = JSON.stringify(x).slice(0, 8000); } catch (e) { return false; }
  const hasAdWord = /(splash|start(?:up)?|launch|openScreen|开屏|广告|advert|adverts?|jdad|material|creative|expo|impr|impression|clickUrl|jumpUrl|landingUrl|imgUrl|imageUrl|videoUrl|duration|displayTime|countdown|delivery)/i.test(s);
  const hasMedia = /(https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif|mp4)|imgUrl|imageUrl|videoUrl|picUrl|pictureUrl)/i.test(s);
  const hasJump = /(jumpUrl|clickUrl|landingUrl|schema|deeplink|openapp|union|jzt|adid|adId|creativeId|materialId)/i.test(s);
  return hasAdWord && (hasMedia || hasJump || s.length < 1200);
}

function clean(x, parentKey) {
  if (Array.isArray(x)) return x.map(v => clean(v, parentKey)).filter(v => !looksAdNode(v));
  if (x && typeof x === 'object') {
    for (const k of Object.keys(x)) {
      if (isAdKey(k)) {
        x[k] = emptyFor(x[k]);
      } else if (isAdSwitch(k) && /ad|advert|splash|launch|start|open|show|display|visible/i.test(String(k))) {
        x[k] = false;
      } else if (/countdown|displaytime|duration|showtime|expiretime/i.test(String(k)) && /splash|startup|launch|open|ad|advert/i.test(String(parentKey || '') + JSON.stringify(x).slice(0, 300))) {
        x[k] = 0;
      } else {
        x[k] = clean(x[k], k);
      }
    }
  }
  return x;
}

function forceEmpty(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
  Object.assign(data, {
    ad: null,
    ads: [],
    advert: null,
    adverts: [],
    advertisement: null,
    advertisements: [],
    splash: null,
    splashAd: null,
    splashAds: [],
    startup: null,
    startupAd: null,
    startupAds: [],
    launch: null,
    launchAd: null,
    openScreen: null,
    openScreenAd: null,
    materials: [],
    adMaterials: [],
    creatives: [],
    show: false,
    hasAd: false,
    showAd: false,
    code: data.code || '0'
  });
  return data;
}

try {
  let data = JSON.parse(body || '{}');
  data = clean(data, 'root');
  if (/splash|startup|startUp|start|launch|openScreen|open_screen|advert|ad|material/i.test(url)) {
    data = forceEmpty(data);
  }
  $done({ body: JSON.stringify(data) });
} catch (e) {
  $done({ body: '{"ad":null,"ads":[],"splash":null,"splashAds":[],"startupAd":null,"materials":[],"show":false,"hasAd":false,"code":"0"}' });
}
