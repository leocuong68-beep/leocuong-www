import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.AIBIZ_CONFIG;
const APP_URL = location.origin + location.pathname.replace(/[^/]*$/, '');
const sb = createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });

// ---------- Biểu tượng ----------
const I = {
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  msg: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z"/>',
  ai: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  cam: '<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/>',
  img: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
  auto: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  send: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  share: '<path d="M12 3v12M8 7l4-4 4 4"/><rect x="5" y="11" width="14" height="10" rx="2"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>'
};
const sv = (n, s = 22, w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Dữ liệu cố định ----------
const CHANNELS = [['facebook_page', 'Facebook', '#1877F2'], ['instagram', 'Instagram', '#D6249F'], ['tiktok', 'TikTok', '#111111'], ['youtube', 'YouTube', '#FF0000'], ['threads', 'Threads', '#333333'], ['linkedin', 'LinkedIn', '#0A66C2'], ['zalo', 'Zalo', '#0068FF']];
const TITLES = ['sếp', 'anh', 'chị', 'bạn'];
const INDUSTRIES = ['Mỹ phẩm, chăm sóc da', 'Thực phẩm, sức khỏe', 'Dịch vụ làm đẹp', 'Thời trang', 'Bảo hiểm, tài chính', 'Giáo dục, khóa học', 'Tư vấn, huấn luyện'];
const VOICES = ['Thân thiện, gần gũi', 'Chuyên gia, rõ ràng', 'Vui vẻ, hài hước', 'Truyền cảm hứng'];
const GOALS = ['Bán hàng', 'Tăng người theo dõi', 'Xây uy tín chuyên gia', 'Tìm người cùng làm'];
const TIME = [['self', 'Tôi có thời gian, muốn tự làm'], ['auto', 'Tôi bận, muốn AI làm giúp gần hết']];
const FORMATS = [['post', 'Bài viết'], ['image', 'Ảnh'], ['video', 'Video']];
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// ---------- Trạng thái ----------
const S = {
  boot: true, session: null, profile: null, credit: 0, admin: false,
  tab: 'home', view: null, toast: '', toastErr: false, busy: false,
  auth: { mode: 'login', email: '', name: '', msg: '' },
  coach: { step: 0, a: {} },
  ideas: [], scripts: [], posts: [],
  cr: null, day: null, inst: false, standalone: false,
  adm: { users: [], loaded: false }
};
const me = () => S.session?.user;
const callName = () => S.profile?.user_title || 'sếp';
const asst = () => S.profile?.assistant_name || 'Vy';

function toast(t, err = false) { S.toast = t; S.toastErr = err; render(); clearTimeout(toast._t); toast._t = setTimeout(() => { S.toast = ''; render(); }, err ? 4200 : 2400); }
function fail(e, fallback = 'Có lỗi, sếp thử lại giúp em nha') {
  console.error(e);
  const m = (e && (e.message || e.error_description)) || '';
  const map = [
    [/Invalid login credentials/i, 'Sai email hoặc mật khẩu'],
    [/Email not confirmed/i, 'Email chưa xác nhận. Mở hộp thư và bấm link xác nhận trước nha'],
    [/User already registered/i, 'Email này đã có tài khoản, sếp đăng nhập nhé'],
    [/Password should be at least/i, 'Mật khẩu cần ít nhất 8 ký tự'],
    [/rate limit/i, 'Gửi quá nhiều lần, đợi vài phút rồi thử lại nha'],
    [/insufficient_credits/i, 'Hết credit rồi. Nhắn quản trị để được cấp thêm'],
    [/not_admin/i, 'Chỉ quản trị mới làm được việc này'],
    [/Failed to fetch|NetworkError/i, 'Mất kết nối mạng, thử lại khi có mạng nha']
  ];
  for (const [re, vi] of map) if (re.test(m)) return toast(vi, true);
  toast(fallback, true);
}

// ---------- Tải dữ liệu ----------
async function loadAll() {
  const uid = me().id;
  const [p, c, a, i, s, po] = await Promise.all([
    sb.from('profiles').select('*').eq('id', uid).maybeSingle(),
    sb.rpc('credit_balance', { p_user: uid }),
    sb.rpc('is_admin'),
    sb.from('ideas').select('*').order('created_at', { ascending: false }).eq('user_id', uid),
    sb.from('scripts').select('*').order('created_at', { ascending: false }).eq('user_id', uid),
    sb.from('posts').select('*').order('scheduled_at', { ascending: true, nullsFirst: false }).eq('user_id', uid)
  ]);
  if (p.error) throw p.error;
  S.profile = p.data; S.credit = c.data ?? 0; S.admin = !!a.data;
  S.ideas = i.data || []; S.scripts = s.data || []; S.posts = po.data || [];
  if (S.profile && !S.profile.coach_completed_at) {
    S.coach = { step: 0, a: { user_title: S.profile.user_title, assistant_name: S.profile.assistant_name, full_name: S.profile.full_name || '', ...S.profile.coach_answers } };
  }
}
async function refreshCredit() { const c = await sb.rpc('credit_balance', { p_user: me().id }); if (!c.error) S.credit = c.data ?? 0; }

// ---------- Khung chung ----------
function top(title, back, right) {
  return `<div class="top">${back ? `<button class="back" data-a="back" aria-label="Quay lại">${sv('back', 20)}</button>` : '<span class="logo">AB</span>'}<h2>${title}</h2>${right ?? `<button class="chipc" data-a="go" data-v="credits">${S.credit} credit</button>`}</div>`;
}
function tabs() {
  const t = [['home', 'home', 'Hôm nay'], ['cal', 'cal', 'Lịch'], ['new', 'plus', ''], ['inbox', 'msg', 'Khách'], ['ai', 'ai', 'Trợ lý']];
  return `<nav class="tabs" aria-label="Điều hướng">${t.map(x => x[0] === 'new'
    ? `<button class="tab" data-a="tab" data-v="new" aria-label="Tạo bài mới"><span class="plus">${sv('plus', 24, 2.5)}</span></button>`
    : `<button class="tab${S.tab === x[0] && !S.view ? ' on' : ''}" data-a="tab" data-v="${x[0]}">${sv(x[1])}${x[2]}</button>`).join('')}</nav>`;
}
const tg = (on, act, v) => `<button class="toggle" data-a="${act}" ${v != null ? `data-v="${v}"` : ''} role="switch" aria-checked="${on}" style="background:${on ? 'var(--pri)' : '#2B3B57'}"><i style="left:${on ? '21px' : '3px'}"></i></button>`;
const soon = (title, when, text) => `<div class="card soon"><span class="tag" style="background:var(--ambS);color:var(--amb)">Mở ${esc(when)}</span><p class="h">${title}</p><p class="sub">${text}</p></div>`;
const chanChip = id => { const c = CHANNELS.find(x => x[0] === id); return c ? `<span title="${c[1]}" style="width:22px;height:22px;border-radius:7px;background:${c[2]};color:#fff;font-size:10px;font-weight:800;display:inline-flex;align-items:center;justify-content:center">${c[1][0]}</span>` : ''; };
const fmtTime = d => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const fmtDate = d => `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;

// ---------- Đăng nhập ----------
function authView() {
  const a = S.auth, sign = a.mode === 'signup';
  return `<div class="scroll" style="justify-content:center;padding-top:calc(24px + env(safe-area-inset-top))">
  <div><div class="disp">AI Biz<br><em>Team marketing</em><br>của riêng bạn</div><p class="sub" style="margin-top:10px">Nói ý tưởng, AI viết kịch bản, làm ảnh, làm video và lên lịch đăng giúp bạn.</p></div>
  <form class="card" data-f="auth" novalidate>
    <div class="seg" style="grid-template-columns:1fr 1fr" role="tablist">
      <button type="button" role="tab" aria-selected="${!sign}" class="${!sign ? 'on' : ''}" data-a="amode" data-v="login">Đăng nhập</button>
      <button type="button" role="tab" aria-selected="${sign}" class="${sign ? 'on' : ''}" data-a="amode" data-v="signup">Tạo tài khoản</button>
    </div>
    ${sign ? `<div><label class="lb" for="an">Tên của bạn</label><input class="field" id="an" name="name" autocomplete="name" value="${esc(a.name)}" placeholder="Ví dụ: Minh Anh" required></div>` : ''}
    <div><label class="lb" for="ae">Email</label><input class="field" id="ae" name="email" type="email" inputmode="email" autocomplete="email" value="${esc(a.email)}" placeholder="ten@gmail.com" required></div>
    <div><label class="lb" for="ap">Mật khẩu</label><input class="field" id="ap" name="password" type="password" autocomplete="${sign ? 'new-password' : 'current-password'}" placeholder="${sign ? 'Ít nhất 8 ký tự' : ''}" minlength="8" required></div>
    ${a.msg ? `<p class="sub" style="color:var(--ok)">${esc(a.msg)}</p>` : ''}
    <button class="btn" type="submit" ${S.busy ? 'disabled' : ''}>${S.busy ? 'Đang xử lý…' : sign ? 'Tạo tài khoản' : 'Vào app'}</button>
    ${!sign ? '<button type="button" class="btn2" data-a="forgot">Quên mật khẩu</button>' : '<p class="sub">Bằng việc tạo tài khoản, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật (đang hoàn thiện cho bản thử).</p>'}
  </form></div>`;
}
async function submitAuth(form) {
  const f = new FormData(form), email = String(f.get('email') || '').trim(), pw = String(f.get('password') || ''), name = String(f.get('name') || '').trim();
  S.auth.email = email; S.auth.name = name; S.auth.msg = '';
  if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Email chưa đúng', true);
  if (pw.length < 8) return toast('Mật khẩu cần ít nhất 8 ký tự', true);
  if (S.auth.mode === 'signup' && !name) return toast('Cho em xin tên của sếp', true);
  S.busy = true; render();
  try {
    if (S.auth.mode === 'signup') {
      const { data, error } = await sb.auth.signUp({ email, password: pw, options: { data: { full_name: name }, emailRedirectTo: APP_URL } });
      if (error) throw error;
      if (!data.session) { S.auth.mode = 'login'; S.auth.msg = 'Đã tạo tài khoản. Mở email để bấm link xác nhận, rồi quay lại đăng nhập.'; }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
    }
  } catch (e) { fail(e); } finally { S.busy = false; render(); }
}

// ---------- Coach (khảo sát hồ sơ) ----------
const COACH = [
  { k: 'hello', title: 'Làm quen', q: 'Em là trợ lý marketing của sếp. Mình xưng hô thế nào cho tiện?' },
  { k: 'industry', title: 'Lĩnh vực', q: 'Sếp đang bán hoặc tư vấn về lĩnh vực gì?' },
  { k: 'offer', title: 'Sản phẩm', q: 'Sản phẩm hoặc dịch vụ chính của sếp là gì? Điểm nào khiến khách chọn sếp?' },
  { k: 'audience', title: 'Khách hàng', q: 'Khách của sếp là ai? Họ hay lo lắng hoặc mong muốn điều gì?' },
  { k: 'voice', title: 'Giọng nói', q: 'Sếp muốn bài đăng mang giọng như thế nào?' },
  { k: 'goals', title: 'Mục tiêu', q: 'Sếp muốn thương hiệu cá nhân giúp được gì? Chọn nhiều cũng được.' },
  { k: 'channels', title: 'Kênh', q: 'Sếp đang có những kênh nào?' },
  { k: 'mode', title: 'Cách làm', q: 'Sếp có nhiều thời gian không?' }
];
function coachView() {
  const c = S.coach, st = COACH[c.step], a = c.a, title = a.user_title || 'sếp';
  const q = st.q.replace(/sếp/g, title).replace(/^./, m => m.toUpperCase());
  let body = '';
  const pills = (key, opts, multi) => `<div class="row wrap">${opts.map(o => { const val = Array.isArray(o) ? o[0] : o, lab = Array.isArray(o) ? o[1] : o; const on = multi ? (a[key] || []).includes(val) : a[key] === val; return `<button class="pill${on ? ' on' : ''}" aria-pressed="${on}" data-a="cpick" data-k="${key}" data-m="${multi ? 1 : 0}" data-v="${esc(val)}">${esc(lab)}</button>`; }).join('')}</div>`;
  if (st.k === 'hello') body = `<div><label class="lb" for="cn">Tên ${esc(title)} hiển thị trong app</label><input class="field" id="cn" data-in="full_name" value="${esc(a.full_name || '')}" placeholder="Ví dụ: Minh Anh"></div>
    <div><span class="lb">Em gọi ${esc(title)} là</span>${pills('user_title', TITLES)}</div>
    <div><label class="lb" for="cas">Tên trợ lý</label><input class="field" id="cas" data-in="assistant_name" value="${esc(a.assistant_name || 'Vy')}" maxlength="20"></div>`;
  else if (st.k === 'industry') body = `${pills('industry', INDUSTRIES)}<div><label class="lb" for="ci">Hoặc ghi rõ hơn</label><input class="field" id="ci" data-in="industry_other" value="${esc(a.industry_other || '')}" placeholder="Ví dụ: thực phẩm chức năng cho mẹ bầu"></div>`;
  else if (st.k === 'offer') body = `<textarea rows="5" data-in="offer" placeholder="Ví dụ: Bộ dưỡng da cho da khô. Tôi tư vấn 1-1 miễn phí, theo dõi da khách suốt 30 ngày.">${esc(a.offer || '')}</textarea>`;
  else if (st.k === 'audience') body = `<textarea rows="5" data-in="audience" placeholder="Ví dụ: Phụ nữ 28 đến 45 tuổi, đi làm văn phòng, da khô, không có thời gian chăm da.">${esc(a.audience || '')}</textarea>`;
  else if (st.k === 'voice') body = pills('voice', VOICES);
  else if (st.k === 'goals') body = pills('goals', GOALS, true);
  else if (st.k === 'channels') body = pills('channels', CHANNELS.map(x => [x[0], x[1]]), true) + `<p class="sub">Kết nối kênh để tự đăng sẽ làm sau, ở mục Hồ sơ.</p>`;
  else if (st.k === 'mode') body = `<div class="chat" style="gap:8px">${TIME.map(t => `<button class="pill${a.mode === t[0] ? ' on' : ''}" style="min-height:52px;border-radius:16px;text-align:left" data-a="cpick" data-k="mode" data-m="0" data-v="${t[0]}">${esc(t[1])}</button>`).join('')}</div><p class="sub">Chế độ Auto: AI tự nghĩ đề tài, làm ảnh, video và xếp lịch cả tuần. Đổi lại được bất cứ lúc nào.</p>`;
  const last = c.step === COACH.length - 1;
  return `${top('Coach', c.step > 0, `<span class="chipc">${c.step + 1}/${COACH.length}</span>`)}<div class="scroll">
   <div class="stepbar" aria-hidden="true">${COACH.map((_, i) => `<i class="${i <= c.step ? 'on' : ''}"></i>`).join('')}</div>
   <div class="chat"><div class="ai"><b style="color:var(--pri)">${esc(a.assistant_name || 'Vy')}</b>\n${esc(q)}</div></div>
   <div class="card">${body}</div>
   <button class="btn" data-a="cnext" ${S.busy ? 'disabled' : ''}>${last ? 'Xong, vào app' : 'Tiếp tục'}</button>
   ${c.step > 0 && !last ? '<button class="btn2" data-a="cskip">Bỏ qua câu này</button>' : ''}
  </div>`;
}
async function coachSave(finish) {
  const a = S.coach.a;
  const industry = [a.industry, a.industry_other].filter(Boolean).join(' · ') || null;
  const patch = {
    full_name: (a.full_name || '').trim() || S.profile.full_name,
    user_title: a.user_title || 'sếp', assistant_name: (a.assistant_name || 'Vy').trim() || 'Vy',
    industry, offer: a.offer || null, audience: a.audience || null, brand_voice: a.voice || null,
    goals: (a.goals || []).join(', ') || null, mode: a.mode || 'self',
    coach_answers: a
  };
  if (finish) patch.coach_completed_at = new Date().toISOString();
  const { data, error } = await sb.from('profiles').update(patch).eq('id', me().id).select().single();
  if (error) throw error;
  S.profile = data;
}

// ---------- Trang chủ ----------
function upcoming() { const now = Date.now(); return S.posts.filter(p => p.scheduled_at && new Date(p.scheduled_at).getTime() >= now - 36e5 && p.status !== 'published'); }
function home() {
  const p = S.profile, up = upcoming(), wait = S.posts.filter(x => x.status === 'pending_approval').length;
  const name = esc((p.full_name || '').split(' ').slice(-2).join(' ') || '');
  return top('Hôm nay') + `<div class="scroll">
  <div><div class="disp">Chào ${esc(callName())}<br><em>${name}</em></div><p class="sub">${up.length ? `Sắp tới có ${up.length} bài đã lên lịch.` : 'Chưa có bài nào lên lịch. Bắt đầu bằng một kịch bản nha.'}${wait ? ` Còn ${wait} bài chờ duyệt.` : ''}</p></div>
  ${S.standalone ? '' : `<button class="card" data-a="install" style="flex-direction:row;align-items:center;text-align:left;color:var(--ink);border-color:var(--pri)"><span class="ico" style="background:var(--pri2);color:var(--pri)">${sv('dl')}</span><span style="flex:1"><b style="display:block;font-size:15px">Tải app về điện thoại</b><span class="sub">Mở nhanh từ màn hình chính</span></span></button>`}
  ${S.credit <= 0 ? `<div class="card" style="border-color:var(--amb)"><p class="h">Tài khoản chưa có credit</p><p class="sub">Bản thử kín: credit được cấp tay. Các việc không dùng AI (viết tay, kho ý tưởng, lịch) vẫn dùng bình thường.</p></div>` : ''}
  <button class="big hero" data-a="go" data-v="script" style="color:#fff"><b style="color:#fff">Viết kịch bản</b><span style="color:#DCD9FF">Nói một ý, AI soạn kịch bản hoàn chỉnh rồi gợi ý nên đăng bài viết, ảnh hay video.</span></button>
  <div class="grid2"><button class="big" data-a="go" data-v="img" style="background:var(--pinkS)"><span class="ico" style="background:var(--card);color:var(--pink)">${sv('img')}</span><b>Tạo ảnh</b><span>Ảnh có nhân vật, ảnh ghi chú</span></button><button class="big" data-a="go" data-v="auto" style="background:var(--tealS)"><span class="ico" style="background:var(--card);color:var(--teal)">${sv('auto')}</span><b>Auto</b><span>AI tự làm cả tuần</span></button></div>
  <button class="card" data-a="go" data-v="ideas" style="flex-direction:row;align-items:center;text-align:left;color:var(--ink)"><span class="ico" style="background:var(--ambS);color:var(--amb)">${sv('bulb')}</span><span style="flex:1"><b style="display:block;font-size:15px">Kho ý tưởng</b><span class="sub">${S.ideas.length ? `${S.ideas.length} ý tưởng đang chờ` : 'Nghĩ ra gì ghi vào đây'}</span></span></button>
  ${S.scripts.length ? `<div class="card"><div class="row"><p class="h" style="flex:1">Kịch bản gần đây</p><button class="btn2" style="min-height:36px" data-a="go" data-v="scripts">Tất cả</button></div>${S.scripts.slice(0, 3).map(scriptRow).join('')}</div>` : ''}
  </div>` + tabs();
}
const fmtLabel = f => (FORMATS.find(x => x[0] === f) || [, 'Chưa chọn'])[1];
const scriptRow = s => `<button class="list-item" data-a="openscript" data-v="${s.id}" style="background:none;border-left:none;border-right:none;border-bottom:none;text-align:left;width:100%;color:var(--ink)"><span class="ico" style="background:var(--blueS);color:var(--blue)">${sv(s.suggested_format === 'video' ? 'cam' : s.suggested_format === 'image' ? 'img' : 'msg', 20)}</span><span style="flex:1;min-width:0"><b style="display:block;font-size:14px;line-height:1.3">${esc(s.title)}</b><span class="sub">${fmtLabel(s.suggested_format)} · ${new Date(s.created_at).toLocaleDateString('vi-VN')}</span></span></button>`;

// ---------- Tạo bài ----------
function openCreate(tab, seed = {}) { S.cr = { tab: tab || 'script', id: seed.id || null, idea_id: seed.idea_id || null, title: seed.title || '', body: seed.body || '', format: seed.format || null, when: '', platforms: [], dirty: false }; S.view = 'create'; }
function crTabs() { const t = [['script', '1', 'Kịch bản'], ['img', '2', 'Ảnh'], ['vid', '3', 'Video']]; return `<div class="seg" role="tablist">${t.map(x => { const on = S.cr.tab === x[0]; return `<button role="tab" aria-selected="${on}" data-a="ctab" data-v="${x[0]}" class="${on ? 'on' : ''}"><span class="n">0${x[1]}</span>${x[2]}</button>`; }).join('')}</div>`; }
function scriptTab() {
  const c = S.cr;
  return `${soon('AI soạn kịch bản', 'thứ Ba 20/10', `Nói một ý, ${esc(asst())} viết kịch bản hoàn chỉnh theo hồ sơ của ${esc(callName())}. Trong lúc chờ, ${esc(callName())} viết tay và lưu được ngay bên dưới.`)}
  <div class="card">
    <div><label class="lb" for="st">Tiêu đề</label><input class="field" id="st" data-in="cr.title" value="${esc(c.title)}" placeholder="Ví dụ: 3 lỗi khiến da khô hơn khi trời lạnh"></div>
    <div><label class="lb" for="sbd">Nội dung</label><textarea id="sbd" rows="9" data-in="cr.body" placeholder="Mở đầu, các ý chính, lời kêu gọi">${esc(c.body)}</textarea></div>
    <div><span class="lb">Định đăng dạng</span><div class="row wrap">${FORMATS.map(f => `<button class="pill${c.format === f[0] ? ' on' : ''}" aria-pressed="${c.format === f[0]}" data-a="cfmt" data-v="${f[0]}">${f[1]}</button>`).join('')}</div></div>
    <button class="btn" data-a="csave" ${S.busy ? 'disabled' : ''}>${c.id ? 'Lưu thay đổi' : 'Lưu kịch bản'}</button>
    ${c.id ? `<div class="row"><button class="btn2" style="flex:1" data-a="cplan">Lên lịch đăng</button><button class="btnx" data-a="cdel" aria-label="Xóa kịch bản">${sv('trash', 18)}</button></div>` : ''}
  </div>
  ${c.when !== '' ? planCard() : ''}`;
}
function planCard() {
  const c = S.cr, chans = S.profile.coach_answers?.channels || [];
  const list = CHANNELS.filter(x => x[0] !== 'zalo');
  return `<div class="card" id="plan" style="border:2px solid var(--pri)"><p class="h">Lên lịch đăng</p>
   <div><label class="lb" for="pw">Ngày giờ</label><input class="field" id="pw" type="datetime-local" data-in="cr.when" value="${esc(c.when)}"></div>
   <div><span class="lb">Đăng lên</span><div class="row wrap">${list.map(x => { const on = c.platforms.includes(x[0]); return `<button class="pill${on ? ' on' : ''}" aria-pressed="${on}" data-a="cplat" data-v="${x[0]}">${x[1]}${chans.includes(x[0]) ? '' : ''}</button>`; }).join('')}</div></div>
   <p class="sub">Tự đăng lên các kênh mở từ thứ Năm 22/10. Trước đó, bài nằm trong lịch để ${esc(callName())} theo dõi.</p>
   <button class="btn" data-a="csched" ${S.busy ? 'disabled' : ''}>Đưa vào lịch</button></div>`;
}
function imgTab() { return soon('Ảnh có nhân vật và ảnh ghi chú', 'thứ Tư 21/10', `Tải ảnh của ${esc(callName())} hoặc ảnh sản phẩm, chọn phong cách. Hoặc làm ảnh ghi chú dạng viral từ kịch bản.`) + (S.cr.title ? `<div class="card"><span class="tag" style="align-self:flex-start;background:var(--pri2);color:#7FF3E6">Sẽ dùng kịch bản</span><b>${esc(S.cr.title)}</b></div>` : ''); }
function vidTab() { return soon('Video tự quay và video faceless', 'thứ Sáu 23/10', 'Tự quay với chữ chạy để đọc theo, hoặc faceless nhiều phong cách có sẵn, chọn giọng đọc.'); }
function create() {
  const c = S.cr, body = c.tab === 'img' ? imgTab() : c.tab === 'vid' ? vidTab() : scriptTab();
  return top('Tạo bài', true) + `<div style="background:var(--card);padding:0 16px 10px;border-bottom:1px solid var(--line)">${crTabs()}</div><div class="scroll">${body}</div>` + tabs();
}
async function saveScript() {
  const c = S.cr;
  if (!c.title.trim()) return toast('Thêm tiêu đề cho kịch bản nha', true);
  S.busy = true; render();
  try {
    const row = { title: c.title.trim(), body: c.body, suggested_format: c.format, idea_id: c.idea_id };
    const q = c.id ? sb.from('scripts').update(row).eq('id', c.id).select().single() : sb.from('scripts').insert(row).select().single();
    const { data, error } = await q; if (error) throw error;
    S.scripts = [data, ...S.scripts.filter(s => s.id !== data.id)];
    if (c.idea_id && !c.id) { await sb.from('ideas').update({ used: true }).eq('id', c.idea_id); const it = S.ideas.find(x => x.id === c.idea_id); if (it) it.used = true; }
    c.id = data.id; toast('Đã lưu kịch bản');
  } catch (e) { fail(e); } finally { S.busy = false; render(); }
}
async function schedulePost() {
  const c = S.cr;
  if (!c.when) return toast('Chọn ngày giờ đăng nha', true);
  const t = new Date(c.when); if (isNaN(t)) return toast('Ngày giờ chưa đúng', true);
  if (t.getTime() < Date.now() - 6e4) return toast('Giờ đăng đã qua, chọn giờ sau nha', true);
  if (!c.platforms.length) return toast('Chọn ít nhất một kênh', true);
  S.busy = true; render();
  try {
    const { data, error } = await sb.from('posts').insert({ script_id: c.id, caption: c.body, platforms: c.platforms, status: 'scheduled', scheduled_at: t.toISOString() }).select().single();
    if (error) throw error;
    S.posts = [...S.posts, data].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    S.view = null; S.tab = 'cal'; S.day = dayKey(t); toast('Đã đưa vào lịch');
  } catch (e) { fail(e); } finally { S.busy = false; render(); }
}

// ---------- Danh sách kịch bản ----------
function scriptsView() { return top('Kịch bản', true) + `<div class="scroll">${S.scripts.length ? `<div class="card">${S.scripts.map(scriptRow).join('')}</div>` : `<div class="card"><p class="h">Chưa có kịch bản</p><button class="btn2" data-a="go" data-v="script">Viết kịch bản đầu tiên</button></div>`}</div>` + tabs(); }

// ---------- Lịch ----------
const dayKey = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
function cal() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = [...Array(7)].map((_, i) => new Date(today.getTime() + i * 864e5));
  if (S.day == null || !days.some(d => d.getTime() === S.day)) S.day = days[0].getTime();
  const items = S.posts.filter(p => p.scheduled_at && dayKey(p.scheduled_at) === S.day);
  const later = S.posts.filter(p => p.scheduled_at && dayKey(p.scheduled_at) > days[6].getTime());
  const title = id => S.scripts.find(s => s.id === id)?.title || (S.posts.find(p => p.script_id === id)?.caption || 'Bài đăng').slice(0, 60);
  const st = s => ({ scheduled: ['Đã hẹn giờ', 'var(--okS)', 'var(--ok)'], pending_approval: ['Chờ duyệt', 'var(--ambS)', 'var(--amb)'], published: ['Đã đăng', 'var(--blueS)', 'var(--blue)'], failed: ['Lỗi', 'var(--pinkS)', 'var(--pink)'], draft: ['Nháp', 'var(--line)', 'var(--mut)'], publishing: ['Đang đăng', 'var(--pri2)', 'var(--pri)'] }[s] || ['', '', '']);
  const card = p => { const t = new Date(p.scheduled_at), s = st(p.status); return `<div class="card"><div class="row"><div style="font-size:22px;font-weight:800;width:68px">${fmtTime(t)}</div><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700;line-height:1.3">${esc(title(p.script_id))}</div><div class="row" style="gap:4px;margin-top:4px">${(p.platforms || []).map(chanChip).join('')}</div></div></div><div class="row"><span class="tag" style="background:${s[1]};color:${s[2]}">${s[0]}</span><span style="flex:1"></span><button class="btnx" style="min-height:36px" data-a="pdel" data-v="${p.id}">Bỏ lịch</button></div></div>`; };
  return top('Lịch đăng') + `<div class="scroll">
   <div class="row" style="justify-content:space-between"><p class="h">7 ngày tới</p><span class="sub">${upcoming().length} bài</span></div>
   <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${days.map(d => { const on = S.day === d.getTime(), has = S.posts.some(p => p.scheduled_at && dayKey(p.scheduled_at) === d.getTime()); return `<button data-a="day" data-v="${d.getTime()}" aria-pressed="${on}" style="border:none;border-radius:14px;padding:8px 0;background:${on ? 'var(--pri)' : 'var(--card)'};color:${on ? '#04201D' : 'var(--ink)'};display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:11px;font-weight:600">${DAYS[d.getDay()]}</span><b style="font-size:17px">${d.getDate()}</b><span style="width:6px;height:6px;border-radius:50%;background:${has ? (on ? '#04201D' : 'var(--pri)') : 'transparent'}"></span></button>`; }).join('')}</div>
   ${items.length ? items.map(card).join('') : `<div class="card" style="align-items:center;text-align:center"><p class="h">Ngày này chưa có bài</p><p class="sub">Viết kịch bản rồi bấm Lên lịch đăng.</p><button class="btn2" data-a="go" data-v="script">Tạo bài</button></div>`}
   ${later.length ? `<p class="h">Xa hơn</p>${later.map(p => `<div class="card" style="flex-direction:row;align-items:center"><span class="sub" style="width:74px">${fmtDate(new Date(p.scheduled_at))}</span><b style="flex:1;font-size:14px">${esc(title(p.script_id))}</b></div>`).join('')}` : ''}
  </div>` + tabs();
}

// ---------- Kho ý tưởng ----------
function ideasView() {
  const open = S.ideas.filter(i => !i.used), used = S.ideas.filter(i => i.used);
  const row = i => `<div class="card" style="flex-direction:row;align-items:center"><span class="ico" style="background:var(--ambS);color:var(--amb)">${sv('bulb', 20)}</span><span style="flex:1;font-size:14.5px;font-weight:600;${i.used ? 'color:var(--mut);text-decoration:line-through' : ''}">${esc(i.title)}</span>${i.used ? '' : `<button class="btn2" style="min-height:38px" data-a="iwrite" data-v="${i.id}">Viết</button>`}<button class="btnx" style="min-height:38px;padding:0 10px" data-a="idel" data-v="${i.id}" aria-label="Xóa">${sv('trash', 16)}</button></div>`;
  return top('Kho ý tưởng', true) + `<div class="scroll"><p class="sub">Nghĩ ra gì thì ghi vào đây. Bấm Viết để biến thành kịch bản.</p>
  <form class="inp" data-f="idea"><label class="sr" for="ii">Ý tưởng mới</label><input id="ii" name="t" placeholder="Ví dụ: cách chọn sữa rửa mặt cho da nhạy cảm" maxlength="200" autocomplete="off"><button class="sq" type="submit" style="background:var(--pri);color:#04201D" aria-label="Thêm">${sv('plus', 20)}</button></form>
  ${open.map(row).join('') || '<p class="sub">Chưa có ý tưởng nào.</p>'}${used.length ? `<p class="h">Đã viết</p>${used.map(row).join('')}` : ''}</div>` + tabs();
}

// ---------- Khách, Trợ lý, Auto ----------
function inbox() { return top('Khách') + `<div class="scroll">${soon('Trả lời bình luận tự động', 'sau đợt thử', `AI trả lời bình luận trong phạm vi ${esc(callName())} cho phép, báo khách hỏi mua, ẩn bình luận xấu. Tin nhắn Messenger và Instagram cần Meta duyệt nên mở sau.`)}</div>` + tabs(); }
function ai() {
  return top(`Trợ lý ${esc(asst())}`) + `<div class="scroll">
   <div class="row wrap"><button class="pill" data-a="go" data-v="ideas">Kho ý tưởng</button><button class="pill" data-a="go" data-v="scripts">Kịch bản</button><button class="pill" data-a="go" data-v="profile">Hồ sơ</button></div>
   <div class="chat"><div class="ai">Chào ${esc(callName())} ${esc((S.profile.full_name || '').split(' ').pop())}, em là ${esc(asst())}. Từ thứ Ba 20/10 em trò chuyện được: gợi ý đề tài, viết tin nhắn cho khách, trả lời câu khó.</div></div>
  </div>` + tabs();
}
function autoView() { return top('Auto', true) + `<div class="scroll">${soon('Chế độ Auto', 'thứ Sáu 23/10', `AI tự nghĩ đề tài theo hồ sơ, làm ảnh và video, xếp lịch cả tuần. ${esc(callName()).replace(/^./, m => m.toUpperCase())} chọn có duyệt trước khi đăng hay không.`)}<div class="card"><div class="row" style="justify-content:space-between"><span style="font-size:14px;font-weight:600">Duyệt trước khi đăng</span>${tg(S.profile.auto_require_approval, 'arev')}</div><p class="sub">Cài đặt này được lưu sẵn cho khi Auto mở.</p></div></div>` + tabs(); }

// ---------- Hồ sơ ----------
function profileView() {
  const p = S.profile, a = p.coach_answers || {};
  const line = (k, v) => `<div class="sb"><span>${k}</span>${esc(v || 'Chưa có')}</div>`;
  return top('Hồ sơ', true) + `<div class="scroll">
   <div class="card"><div class="row"><span class="ico" style="background:var(--pri2);color:var(--pri)">${sv('user')}</span><div style="flex:1;min-width:0"><p class="h">${esc(p.full_name)}</p><p class="sub">${esc(p.email || me().email)}</p></div></div>
    ${line('Lĩnh vực', p.industry)}${line('Sản phẩm, dịch vụ', p.offer)}${line('Khách hàng', p.audience)}${line('Giọng nói', p.brand_voice)}${line('Mục tiêu', p.goals)}${line('Kênh', (a.channels || []).map(id => (CHANNELS.find(x => x[0] === id) || [, id])[1]).join(', '))}
    ${line('Cách làm', p.mode === 'auto' ? 'Auto, AI làm giúp' : 'Tự làm')}
    <button class="btn2" data-a="recoach">${sv('edit', 16)} Làm lại Coach</button></div>
   <div class="card"><p class="h">Credit</p><p class="sub">Còn <b style="color:var(--ink)">${S.credit}</b> credit. Bản thử kín được cấp tay, chưa thu tiền.</p></div>
   ${S.admin ? `<button class="btn2" data-a="go" data-v="admin">${sv('key', 16)} Quản trị: cấp credit</button>` : ''}
   <button class="btnx" data-a="logout">Đăng xuất</button>
  </div>` + tabs();
}
function creditsView() { return profileView(); }

// ---------- Quản trị ----------
async function loadAdmin() {
  const { data, error } = await sb.from('profiles').select('id,full_name,email,plan,created_at,coach_completed_at').order('created_at', { ascending: false });
  if (error) throw error;
  const bal = await Promise.all(data.map(u => sb.rpc('credit_balance', { p_user: u.id }).then(r => r.data ?? 0)));
  S.adm.users = data.map((u, i) => ({ ...u, credit: bal[i] })); S.adm.loaded = true;
}
function adminView() {
  if (!S.admin) return profileView();
  if (!S.adm.loaded) { loadAdmin().then(render).catch(fail); return top('Quản trị', true) + '<div class="center"><div class="spin"></div></div>' + tabs(); }
  return top('Quản trị', true) + `<div class="scroll"><p class="sub">${S.adm.users.length} tài khoản. Cấp credit cho member thử kín.</p>
   ${S.adm.users.map(u => `<form class="card" data-f="grant" data-v="${u.id}"><div class="row"><div style="flex:1;min-width:0"><p class="h">${esc(u.full_name)}</p><p class="sub">${esc(u.email)} · ${u.coach_completed_at ? 'đã Coach' : 'chưa Coach'}</p></div><span class="chipc">${u.credit}</span></div><div class="row"><label class="sr" for="g${u.id}">Số credit</label><input class="field" id="g${u.id}" name="n" type="number" inputmode="numeric" min="1" max="10000" placeholder="Số credit" style="flex:1"><button class="btn2" type="submit">Cấp</button></div></form>`).join('')}
  </div>` + tabs();
}

// ---------- Cài app ----------
function installSheet() {
  const ua = navigator.userAgent, ios = /iphone|ipad|ipod/i.test(ua), mob = /android|iphone|ipad|ipod/i.test(ua);
  let body;
  if (ios) body = `<div class="istep"><b class="k">1</b><span>Mở trang này bằng <b>Safari</b>, bấm nút Chia sẻ ${sv('share', 18)} ở thanh dưới</span></div><div class="istep"><b class="k">2</b><span>Chọn <b>Thêm vào MH chính</b>, rồi bấm <b>Thêm</b></span></div><p class="sub">Biểu tượng AI Biz sẽ hiện trên màn hình chính, mở ra như app.</p>`;
  else if (!mob) body = `<p class="sub" style="font-size:14px">Mở link dưới đây trên điện thoại, rồi bấm Tải app:</p><div class="sb" style="font-weight:700;word-break:break-all">${esc(APP_URL)}</div><p class="sub">Trên máy tính dùng Chrome hoặc Edge cũng cài được: bấm biểu tượng cài đặt trên thanh địa chỉ.</p>`;
  else body = `<div class="istep"><b class="k">1</b><span>Bấm nút <b>⋮</b> của trình duyệt</span></div><div class="istep"><b class="k">2</b><span>Chọn <b>Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b></span></div>`;
  return `<div class="sheetbg" data-a="iclose"><div class="sheet" data-a="noop"><div class="row"><span class="ico" style="background:var(--pri2);color:var(--pri)">${sv('dl')}</span><b style="font-size:19px;flex:1">Tải app AI Biz</b><button class="btn2" data-a="iclose" style="min-height:38px">Đóng</button></div>${body}</div></div>`;
}

// ---------- Vẽ màn hình ----------
function render() {
  const app = document.getElementById('app');
  let h;
  if (S.boot) h = '<div class="center"><div class="spin" aria-label="Đang tải"></div></div>';
  else if (!S.session) h = authView();
  else if (!S.profile) h = '<div class="center"><div class="spin"></div></div>';
  else if (!S.profile.coach_completed_at) h = coachView();
  else {
    const v = S.view;
    h = v === 'create' ? create() : v === 'ideas' ? ideasView() : v === 'scripts' ? scriptsView() : v === 'auto' ? autoView() : v === 'profile' || v === 'credits' ? profileView() : v === 'admin' ? adminView()
      : ({ home, cal, inbox, ai })[S.tab]();
  }
  const key = (S.session ? 'in' : 'out') + (S.view || S.tab) + (S.cr?.tab || '') + (S.coach.step);
  const sc = app.querySelector('.scroll'), y = sc ? sc.scrollTop : 0, same = render._k === key;
  const focus = document.activeElement && app.contains(document.activeElement) ? { id: document.activeElement.id, s: document.activeElement.selectionStart } : null;
  app.innerHTML = h + (S.inst ? installSheet() : '') + (S.toast ? `<div class="toast${S.toastErr ? ' err' : ''}" role="${S.toastErr ? 'alert' : 'status'}">${esc(S.toast)}</div>` : '');
  if (same) { const n = app.querySelector('.scroll'); if (n) n.scrollTop = y; }
  if (same && focus?.id) { const el = document.getElementById(focus.id); if (el) { el.focus(); try { if (focus.s != null) el.setSelectionRange(focus.s, focus.s); } catch (_) { } } }
  render._k = key;
}

// ---------- Sự kiện ----------
document.addEventListener('input', e => {
  const k = e.target.getAttribute('data-in'); if (!k) return;
  if (k.startsWith('cr.')) { S.cr[k.slice(3)] = e.target.value; S.cr.dirty = true; return; }
  S.coach.a[k] = e.target.value;
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-f]'); if (!f) return; e.preventDefault();
  const kind = f.getAttribute('data-f');
  if (kind === 'auth') return submitAuth(f);
  if (kind === 'idea') {
    const t = String(new FormData(f).get('t') || '').trim(); if (!t) return;
    const { data, error } = await sb.from('ideas').insert({ title: t }).select().single();
    if (error) return fail(error);
    S.ideas = [data, ...S.ideas]; toast('Đã ghi lại ý tưởng');
    setTimeout(() => document.getElementById('ii')?.focus(), 0);
  }
  if (kind === 'grant') {
    const n = parseInt(new FormData(f).get('n'), 10), uid = f.getAttribute('data-v');
    if (!(n > 0)) return toast('Nhập số credit lớn hơn 0', true);
    const { data, error } = await sb.rpc('grant_credits', { p_user: uid, p_amount: n, p_reason: 'manual_grant' });
    if (error) return fail(error);
    const u = S.adm.users.find(x => x.id === uid); if (u) u.credit = data;
    if (uid === me().id) S.credit = data;
    toast(`Đã cấp ${n} credit`);
  }
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const a = b.getAttribute('data-a'), v = b.getAttribute('data-v');
  if (a === 'noop') return;
  if (a === 'iclose') { if (e.target.closest('[data-a=noop]') && b.getAttribute('data-a') !== 'iclose') return; S.inst = false; return render(); }
  if (a === 'install') { if (window.__dp) { window.__dp.prompt(); window.__dp.userChoice.then(r => { if (r.outcome === 'accepted') { S.standalone = true; toast('Đã cài app AI Biz'); } window.__dp = null; }); return; } S.inst = true; return render(); }
  // Đăng nhập
  if (a === 'amode') { S.auth.mode = v; S.auth.msg = ''; return render(); }
  if (a === 'forgot') {
    const email = (document.getElementById('ae')?.value || '').trim(); if (!email) return toast('Nhập email trước rồi bấm Quên mật khẩu', true);
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: APP_URL + '?reset=1' });
    if (error) return fail(error); S.auth.msg = 'Đã gửi link đặt lại mật khẩu vào email.'; return render();
  }
  // Coach
  if (a === 'cpick') { const k = b.getAttribute('data-k'), m = b.getAttribute('data-m') === '1', A = S.coach.a; if (m) { const arr = A[k] || []; A[k] = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]; } else A[k] = A[k] === v && k !== 'user_title' ? null : v; return render(); }
  if (a === 'cnext' || a === 'cskip') {
    const c = S.coach, st = COACH[c.step].k, A = c.a;
    if (a === 'cnext') {
      if (st === 'hello' && !(A.full_name || '').trim()) return toast('Cho em xin tên hiển thị nha', true);
      if (st === 'mode' && !A.mode) return toast('Chọn một cách làm nha', true);
    }
    const last = c.step === COACH.length - 1;
    S.busy = true; render();
    try { await coachSave(last); if (!last) c.step++; else { S.tab = 'home'; S.view = null; toast(`Xong rồi! ${asst()} đã hiểu ${callName()} hơn`); } }
    catch (err) { fail(err); } finally { S.busy = false; render(); }
    return;
  }
  if (a === 'back' && S.session && S.profile && !S.profile.coach_completed_at) { S.coach.step = Math.max(0, S.coach.step - 1); return render(); }
  if (a === 'recoach') { S.coach = { step: 0, a: { ...S.profile.coach_answers, full_name: S.profile.full_name, user_title: S.profile.user_title, assistant_name: S.profile.assistant_name } }; S.profile.coach_completed_at = null; S.view = null; return render(); }
  if (a === 'logout') { await sb.auth.signOut(); return; }
  // Điều hướng
  if (a === 'tab') { if (v === 'new') { openCreate('script'); return render(); } S.tab = v; S.view = null; return render(); }
  if (a === 'back') { S.view = S.view === 'admin' ? 'profile' : null; return render(); }
  if (a === 'go') { if (v === 'script' || v === 'img' || v === 'vid') { openCreate(v); return render(); } if (v === 'admin') S.adm.loaded = false; S.view = v; return render(); }
  // Tạo bài
  const c = S.cr;
  if (a === 'ctab') { c.tab = v; return render(); }
  if (a === 'cfmt') { c.format = c.format === v ? null : v; return render(); }
  if (a === 'csave') return saveScript();
  if (a === 'cplan') { if (!c.when) { const t = new Date(Date.now() + 864e5); t.setHours(19, 0, 0, 0); const p = n => String(n).padStart(2, '0'); c.when = `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}T19:00`; c.platforms = (S.profile.coach_answers?.channels || []).filter(x => x !== 'zalo'); } render(); setTimeout(() => document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth' }), 30); return; }
  if (a === 'cplat') { c.platforms = c.platforms.includes(v) ? c.platforms.filter(x => x !== v) : [...c.platforms, v]; return render(); }
  if (a === 'csched') return schedulePost();
  if (a === 'cdel') {
    if (!confirm('Xóa kịch bản này?')) return;
    const { error } = await sb.from('scripts').delete().eq('id', c.id); if (error) return fail(error);
    S.scripts = S.scripts.filter(s => s.id !== c.id); S.view = null; return toast('Đã xóa kịch bản');
  }
  if (a === 'openscript') { const s = S.scripts.find(x => x.id === v); if (!s) return; openCreate('script', { id: s.id, title: s.title, body: s.body || '', format: s.suggested_format, idea_id: s.idea_id }); return render(); }
  // Ý tưởng
  if (a === 'iwrite') { const i = S.ideas.find(x => x.id === v); openCreate('script', { title: i.title, idea_id: i.id }); return render(); }
  if (a === 'idel') { const { error } = await sb.from('ideas').delete().eq('id', v); if (error) return fail(error); S.ideas = S.ideas.filter(x => x.id !== v); return render(); }
  // Lịch
  if (a === 'day') { S.day = +v; return render(); }
  if (a === 'pdel') { if (!confirm('Bỏ bài này khỏi lịch?')) return; const { error } = await sb.from('posts').delete().eq('id', v); if (error) return fail(error); S.posts = S.posts.filter(p => p.id !== v); return toast('Đã bỏ khỏi lịch'); }
  // Auto
  if (a === 'arev') { const nv = !S.profile.auto_require_approval; const { error } = await sb.from('profiles').update({ auto_require_approval: nv }).eq('id', me().id); if (error) return fail(error); S.profile.auto_require_approval = nv; return render(); }
});

// ---------- Khởi động ----------
S.standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__dp = e; });
window.addEventListener('appinstalled', () => { S.standalone = true; render(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });

async function onSession(session) {
  const prevUid = S.session?.user?.id;
  S.session = session;
  if (session && !prevUid) { S.toast = ''; }
  if (!session) { S.profile = null; S.view = null; S.tab = 'home'; S.boot = false; return render(); }
  if (prevUid === session.user.id && S.profile) { S.boot = false; return render(); }
  try { await loadAll(); } catch (e) { fail(e, 'Không tải được dữ liệu, tải lại trang giúp em'); }
  S.boot = false; render();
}
sb.auth.onAuthStateChange((ev, session) => {
  if (ev === 'PASSWORD_RECOVERY') {
    setTimeout(async () => {
      const pw = prompt('Nhập mật khẩu mới (ít nhất 8 ký tự)');
      if (pw && pw.length >= 8) { const { error } = await sb.auth.updateUser({ password: pw }); error ? fail(error) : toast('Đã đổi mật khẩu'); }
    }, 300);
  }
  setTimeout(() => onSession(session), 0);
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.profile) refreshCredit().then(render); });
render();
