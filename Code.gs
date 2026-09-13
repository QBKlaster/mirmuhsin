/**
 * Model of OTS — backend va admin panel.
 * Bu kod faqat Google serverida ishlaydi. Saytga hech qachon yuborilmaydi,
 * shuning uchun uni tashqaridan hech kim koʻra olmaydi.
 *
 * O'rnatish: README.md, "Admin panel" bo'limi.
 */

/* ====================== SOZLAMALAR ====================== */

/** Panelga kira oladigan pochtalar. Faqat shu ro'yxatdagilar kiradi. */
var ADMIN_EMAILS = [
  'sizning.pochtangiz@gmail.com'
];

var CONFERENCE_NAME = 'Model of OTS';
var REPLY_EMAIL = 'mirmuhsinxonwest@gmail.com';
var TZ = '+05:00';               // saytdagi TZ bilan bir xil bo'lsin

var SH = {
  apps: 'Applications',
  events: 'Events',
  news: 'News',
  settings: 'Settings'
};

var HEAD = {
  apps: ['Timestamp','Full name','Country','Institution','Email','Phone','Position','Motivation','Lang','Status','Mailed'],
  events: ['id','titleEn','titleUz','descEn','descUz','startsAt','endsAt','location','link','published','updatedAt'],
  news: ['id','date','titleEn','titleUz','bodyEn','bodyUz','image','published','updatedAt'],
  settings: ['key','value']
};

var SETTING_KEYS = [
  'email','phone','telegram','channel',
  'cityEn','cityUz','heroSubEn','heroSubUz','delegationsEn','delegationsUz'
];

/* ====================== KIRISH NUQTALARI ====================== */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';

  if (action === 'content') return json_(getPublicContent_());
  if (action === 'ping') return json_({ ok: true, service: CONFERENCE_NAME });

  // Boshqa hamma holatda — admin panel. Faqat ro'yxatdagi pochta kiradi.
  var email = currentEmail_();
  if (!email || ADMIN_EMAILS.indexOf(email.toLowerCase()) === -1) {
    return HtmlService.createHtmlOutput(
      '<div style="font:16px system-ui;padding:40px">Kirish taqiqlangan.</div>'
    );
  }
  return HtmlService.createTemplateFromFile('Admin').evaluate()
    .setTitle(CONFERENCE_NAME + ' — admin')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Saytdagi ariza shakli shu yerga yuboradi. Faqat ariza qabul qiladi. */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents) || {};
    var take = function (v, max) { return String(v == null ? '' : v).slice(0, max).trim(); };

    var row = {
      fullName: take(d.fullName, 120),
      country: take(d.country, 60),
      institution: take(d.institution, 160),
      email: take(d.email, 120),
      phone: take(d.phone, 40),
      position: take(d.position, 80),
      motivation: take(d.motivation, 4000),
      lang: take(d.lang, 4)
    };

    if (!row.fullName || !row.email || !row.country || !row.position) {
      return json_({ ok: false, error: 'missing fields' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)) {
      return json_({ ok: false, error: 'bad email' });
    }

    sheet_('apps').appendRow([
      new Date(), row.fullName, row.country, row.institution, row.email,
      row.phone, row.position, row.motivation, row.lang, 'New', ''
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false });
  }
}

/* ====================== OMMAVIY KONTENT ====================== */

function getPublicContent_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('content');
  if (hit) return JSON.parse(hit);

  var out = {
    ok: true,
    tz: TZ,
    settings: readSettings_(),
    events: readRows_('events').filter(isPublished_).map(function (r) {
      return {
        id: r.id, titleEn: r.titleEn, titleUz: r.titleUz,
        descEn: r.descEn, descUz: r.descUz,
        startsAt: r.startsAt, endsAt: r.endsAt,
        location: r.location, link: r.link
      };
    }),
    news: readRows_('news').filter(isPublished_).map(function (r) {
      return {
        id: r.id, date: r.date, titleEn: r.titleEn, titleUz: r.titleUz,
        bodyEn: r.bodyEn, bodyUz: r.bodyUz, image: r.image
      };
    })
  };

  cache.put('content', JSON.stringify(out), 60);
  return out;
}

function isPublished_(r) {
  var v = String(r.published).toUpperCase();
  return v === 'TRUE' || v === 'HA' || v === 'YES' || v === '1';
}

function clearCache_() { CacheService.getScriptCache().remove('content'); }

/* ====================== ADMIN API ====================== */

function requireAdmin_() {
  var email = currentEmail_();
  if (!email || ADMIN_EMAILS.indexOf(email.toLowerCase()) === -1) {
    throw new Error('Kirish taqiqlangan.');
  }
  return email;
}

function currentEmail_() {
  try { return (Session.getActiveUser().getEmail() || '').toLowerCase(); }
  catch (err) { return ''; }
}

function adminLoad() {
  requireAdmin_();
  return {
    email: currentEmail_(),
    events: readRows_('events'),
    news: readRows_('news'),
    settings: readSettings_(),
    settingKeys: SETTING_KEYS,
    applications: readApplications_(),
    sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl()
  };
}

function adminSaveEvent(o) {
  requireAdmin_();
  var rec = {
    id: o.id || newId_(),
    titleEn: clip_(o.titleEn, 200), titleUz: clip_(o.titleUz, 200),
    descEn: clip_(o.descEn, 3000), descUz: clip_(o.descUz, 3000),
    startsAt: clip_(o.startsAt, 25), endsAt: clip_(o.endsAt, 25),
    location: clip_(o.location, 200), link: clip_(o.link, 500),
    published: o.published ? 'TRUE' : 'FALSE',
    updatedAt: new Date()
  };
  upsert_('events', rec);
  clearCache_();
  return readRows_('events');
}

function adminDeleteEvent(id) {
  requireAdmin_();
  removeById_('events', id);
  clearCache_();
  return readRows_('events');
}

function adminSaveNews(o) {
  requireAdmin_();
  var rec = {
    id: o.id || newId_(),
    date: clip_(o.date, 25),
    titleEn: clip_(o.titleEn, 200), titleUz: clip_(o.titleUz, 200),
    bodyEn: clip_(o.bodyEn, 8000), bodyUz: clip_(o.bodyUz, 8000),
    image: clip_(o.image, 500),
    published: o.published ? 'TRUE' : 'FALSE',
    updatedAt: new Date()
  };
  upsert_('news', rec);
  clearCache_();
  return readRows_('news');
}

function adminDeleteNews(id) {
  requireAdmin_();
  removeById_('news', id);
  clearCache_();
  return readRows_('news');
}

function adminSaveSettings(obj) {
  requireAdmin_();
  var sh = sheet_('settings');
  var rows = readRows_('settings');
  var index = {};
  rows.forEach(function (r, i) { index[r.key] = i + 2; });

  SETTING_KEYS.forEach(function (k) {
    if (!(k in obj)) return;
    var val = clip_(obj[k], 1000);
    if (index[k]) sh.getRange(index[k], 2).setValue(val);
    else sh.appendRow([k, val]);
  });
  clearCache_();
  return readSettings_();
}

function adminSetStatus(rowNumber, status) {
  requireAdmin_();
  if (['New', 'Accepted', 'Rejected'].indexOf(status) === -1) throw new Error('status');
  sheet_('apps').getRange(Number(rowNumber), 10).setValue(status);
  return readApplications_();
}

function adminSendEmails(kind) {
  requireAdmin_();
  var status = kind === 'reject' ? 'Rejected' : 'Accepted';
  var sh = sheet_('apps');
  var last = sh.getLastRow();
  if (last < 2) return { sent: 0, list: [] };

  var values = sh.getRange(2, 1, last - 1, HEAD.apps.length).getValues();
  var sent = 0;

  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var email = String(r[4]).trim();
    if (String(r[9]).trim() !== status || String(r[10]).trim() !== '' || !email) continue;

    var msg = (status === 'Accepted')
      ? { subject: CONFERENCE_NAME + ' — arizangiz qabul qilindi',
          body: 'Hurmatli ' + r[1] + ',\n\n' + CONFERENCE_NAME + ' konferensiyasiga arizangiz qabul qilindi.\n\n' +
                'Delegatsiya: ' + r[2] + '\nLavozim: ' + r[6] + '\n\n' +
                'Sessiya kuni, manzili va o\'quv qo\'llanma keyingi xatda yuboriladi.\n\n' +
                CONFERENCE_NAME + ' sekretariati' }
      : { subject: CONFERENCE_NAME + ' — arizangiz bo\'yicha javob',
          body: 'Hurmatli ' + r[1] + ',\n\nArizangiz uchun rahmat. Bu safar o\'rinlar soni cheklangani sababli ' +
                'sizni delegat sifatida taklif qila olmaymiz.\n\nKeyingi sessiya haqida xabar beramiz.\n\n' +
                CONFERENCE_NAME + ' sekretariati' };

    MailApp.sendEmail({ to: email, subject: msg.subject, body: msg.body, replyTo: REPLY_EMAIL, name: CONFERENCE_NAME });
    sh.getRange(i + 2, 11).setValue(new Date());
    sent++;
  }
  return { sent: sent, list: readApplications_() };
}

/* ====================== JADVAL BILAN ISHLASH ====================== */

function sheet_(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = SH[key];
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEAD[key]);
    sh.getRange(1, 1, 1, HEAD[key].length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function readRows_(key) {
  var sh = sheet_(key);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var head = HEAD[key];
  var values = sh.getRange(2, 1, last - 1, head.length).getValues();
  return values.map(function (row) {
    var o = {};
    head.forEach(function (h, i) { o[h] = row[i] instanceof Date ? isoLocal_(row[i]) : String(row[i]); });
    return o;
  }).filter(function (o) { return o.id !== '' || key === 'settings'; });
}

function readSettings_() {
  var out = {};
  readRows_('settings').forEach(function (r) { if (r.key) out[r.key] = r.value; });
  return out;
}

function readApplications_() {
  var sh = sheet_('apps');
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEAD.apps.length).getValues();
  return values.map(function (r, i) {
    return {
      row: i + 2,
      when: r[0] instanceof Date ? isoLocal_(r[0]) : String(r[0]),
      name: String(r[1]), country: String(r[2]), institution: String(r[3]),
      email: String(r[4]), phone: String(r[5]), position: String(r[6]),
      motivation: String(r[7]), status: String(r[9]) || 'New',
      mailed: r[10] ? 'ha' : ''
    };
  }).reverse();
}

function upsert_(key, rec) {
  var sh = sheet_(key);
  var head = HEAD[key];
  var rows = readRows_(key);
  var line = head.map(function (h) { return rec[h] === undefined ? '' : rec[h]; });

  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === rec.id) {
      sh.getRange(i + 2, 1, 1, head.length).setValues([line]);
      return;
    }
  }
  sh.appendRow(line);
}

function removeById_(key, id) {
  var sh = sheet_(key);
  var rows = readRows_(key);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === String(id)) { sh.deleteRow(i + 2); return; }
  }
}

function clip_(v, max) { return String(v == null ? '' : v).slice(0, max).trim(); }
function newId_() { return Utilities.getUuid().slice(0, 8); }
function isoLocal_(d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm"); }
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
