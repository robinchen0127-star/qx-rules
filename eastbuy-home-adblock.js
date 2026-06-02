/*
Quantumult X - 东方甄选首页弹窗/开屏清理
更新时间：2026-06-02
用途：清理 capi.eastbuy.com/c/homepage/index 响应里的开屏/弹窗/签到/满减券运营位，
      保留商品、直播、列表等首页核心数据。保守策略：只清明确的弹窗类字段，按字段名精确匹配，不做全局深删。
*/

const body = ($response && $response.body) || '';

// 明确的弹窗/开屏/签到/运营位字段名（精确匹配，避免误伤商品流里的 ad 位）
const POPUP_KEYS = /^(popup|popups|pop_up|popupinfo|popupinfos|popupconfig|popupwindow|dialog|dialogs|floatlayer|floatlayers|float_window|floatwindow|floating|float_ad|floatad|suspension|modal|mask|guide|guidepopup|newuser|newuserpopup|newcomer|sign|signin|sign_in|signinfo|signpopup|checkin|check_in|dailysign|continuoussign|signact|signactivity|coupon|couponpopup|couponact|redpacket|redpackage|hongbao|splash|splashad|splashads|startup|startupad|launch|launchad|bootad|openscreen|openad|advdialog|adpopup|operationpopup|operatepopup|operating|operationposition|operatposition|activitypopup|actpopup|activitydialog)$/i;

// 布尔开关型字段：弹窗/签到/活动展示开关 → 关掉
const SWITCH_KEYS = /^(showpopup|show_popup|popupshow|needpopup|need_popup|haspopup|has_popup|showsign|show_sign|needsign|showsplash|show_splash|hassplash|showad|show_ad|hasad|has_ad|showdialog|show_dialog|showactivity|show_activity|showcoupon|show_coupon|isshow|ispop|is_pop|ispopup|showmask|showguide|shownewuser|showfloat)$/i;

function emptyFor(v) {
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return {};
  return null;
}

function clean(x) {
  if (Array.isArray(x)) { for (let i = 0; i < x.length; i++) x[i] = clean(x[i]); return x; }
  if (x && typeof x === 'object') {
    for (const k of Object.keys(x)) {
      const lk = String(k).toLowerCase();
      if (POPUP_KEYS.test(lk)) {
        x[k] = emptyFor(x[k]);
      } else if (SWITCH_KEYS.test(lk)) {
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
  $done({ body: JSON.stringify(data) });
} catch (e) {
  $done({}); // 解析失败则原样放行，绝不破坏首页
}
