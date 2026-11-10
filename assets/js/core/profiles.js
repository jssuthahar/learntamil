/* Learn Tamil — child profiles (brothers and sisters on one device).
   Loaded before every other script. Each child's progress is kept under its own localStorage keys:
   the first child uses the original keys (so existing progress is kept), other children add "@<id>".
   Device-wide settings (theme, sound, cookie choice, break reminder) are shared.
   Everything stays in this browser; nothing is sent anywhere. */
'use strict';
const Profiles = (() => {
  const LIST = 'lt-profiles', CUR = 'lt-profile';
  const AVATARS = ['🦁', '🐯', '🐘', '🦚', '🐢', '🐬', '🦋', '🐼', '🦊', '🐰'];
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let list = []; try { list = JSON.parse(get(LIST)) || []; } catch (e) {}
  if (!Array.isArray(list) || !list.length) list = [{ id: 'p0', name: '', ic: '🦁' }];
  let cur = get(CUR); if (!list.some(p => p.id === cur)) cur = list[0].id;
  const save = () => set(LIST, JSON.stringify(list));
  // Storage key for the current child.
  const key = (k, id = cur) => id === 'p0' ? k : `${k}@${id}`;
  const mine = (k, id = cur) => id === 'p0' ? !k.includes('@') : k.endsWith('@' + id);
  return {
    AVATARS, key, mine,
    get: k => get(key(k)),
    set: (k, v) => set(key(k), v),
    list: () => list.slice(),
    current: () => list.find(p => p.id === cur),
    add(name, ic){
      if (list.length >= 6) return null;
      const p = { id: 'p' + Date.now().toString(36), name: String(name || '').trim().slice(0, 24), ic: ic || AVATARS[list.length % AVATARS.length] };
      list.push(p); save(); return p;
    },
    update(id, fields){ const p = list.find(x => x.id === id); if (!p) return; Object.assign(p, fields); if (p.name) p.name = p.name.trim().slice(0, 24); save(); },
    remove(id){
      if (id === 'p0' || !list.some(p => p.id === id)) return;
      try { Object.keys(localStorage).filter(k => k.startsWith('lt-') && k.endsWith('@' + id)).forEach(k => localStorage.removeItem(k)); } catch (e) {}
      list = list.filter(p => p.id !== id); save();
      if (cur === id) this.switchTo('p0');
    },
    // Switching reloads the page so every part of the app reads the new child's progress.
    switchTo(id){ if (!list.some(p => p.id === id)) return; set(CUR, id); save(); location.reload(); }
  };
})();
