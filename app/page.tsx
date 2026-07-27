'use client';
import { useState, useEffect } from 'react';
import { useLanguage, type Lang } from '../lib/useLanguage';
import { PRODUKTER } from '../lib/produkter';

const products = PRODUKTER.map((p, i) => ({
  id: i + 1,
  name: p.navn,
  nameEn: p.navnEn,
  sub: p.sub,
  subEn: p.subEn,
  price: p.pris,
  margin: p.margin,
  bildIndex: p.bildIndex,
  emoji: p.emoji,
  cat: p.cat,
  cjId: p.cjId,
}));

const kategorier = ['alle', 'hund', 'katt'];

function katLabel(kat: string, lang: Lang) {
  if (lang === 'en') return kat === 'alle' ? 'All' : kat === 'hund' ? 'Dog' : 'Cat';
  return kat.charAt(0).toUpperCase() + kat.slice(1);
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', gap: '3px', background: '#f0f0ec', borderRadius: '6px', padding: '3px' }}>
      {(['no', 'en'] as const).map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          background: lang === l ? '#1a1a18' : 'transparent',
          color: lang === l ? '#fafaf8' : '#888',
          border: 'none', borderRadius: '4px',
          padding: '4px 9px', fontSize: '11px', fontWeight: 600,
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.06em',
        }}>
          <img src={l === 'no' ? '/flag-no.svg' : '/flag-gb.svg'} alt={l} style={{ width: '18px', height: '13px', borderRadius: '2px' }} /> {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

async function fetchCJProduct(pid: string) {
  const res = await fetch(`/api/products?pid=${pid}`);
  const data = await res.json();
  return data.data;
}

export default function Home() {
  const { lang, setLang } = useLanguage();
  const [aktivKat, setAktivKat] = useState('alle');
  const [handlekurv, setHandlekurv] = useState<{ id: number; name: string; price: number; cjId: string; variantId: string; quantity: number }[]>([]);

  useEffect(() => {
    try {
      const lagret = localStorage.getItem('fjordfur-cart');
      if (lagret) {
        const parsed = JSON.parse(lagret);
        // Migrer gamle cart-items som mangler quantity-felt
        setHandlekurv(parsed.map((i: any) => ({ ...i, quantity: i.quantity || 1 })));
      }
    } catch {}
  }, []);
  const [toast, setToast] = useState('');
  const [kurvaapen, setKurvAapen] = useState(false);
  const [cjProducts, setCjProducts] = useState<Record<string, any>>({});
  const [cjLaster, setCjLaster] = useState(false);

useEffect(() => {
  const cjIds = products.filter(p => p.cjId).map(p => p.cjId!);

  // Last fra cache først
  const cached: Record<string, any> = {};
  cjIds.forEach(pid => {
    const c = sessionStorage.getItem(`cj_${pid}`);
    if (c) cached[pid] = JSON.parse(c);
  });
  if (Object.keys(cached).length > 0) setCjProducts(cached);

  // Hent fra API for de som mangler
  const mangler = cjIds.filter(pid => !cached[pid]);
  if (mangler.length === 0) return;

  setCjLaster(true);
  Promise.all(
    mangler.map(async (pid) => {
      const data = await fetchCJProduct(pid);
      if (data) sessionStorage.setItem(`cj_${pid}`, JSON.stringify(data));
      return { pid, data };
    })
  ).then(results => {
    const newProducts: Record<string, any> = { ...cached };
    results.forEach(({ pid, data }) => {
      if (data) newProducts[pid] = data;
    });
    setCjProducts(newProducts);
    setCjLaster(false);
  });
}, []);

  const [sortering, setSortering] = useState('anbefalt');

  const filtrerte = (() => {
    const liste = aktivKat === 'alle' ? [...products] : products.filter(p => p.cat === aktivKat);
    if (sortering === 'pris-lav') return liste.sort((a, b) => a.price - b.price);
    if (sortering === 'pris-høy') return liste.sort((a, b) => b.price - a.price);
    if (sortering === 'populær') return liste.sort((a, b) => (b as any).reviews - (a as any).reviews);
    return liste;
  })();

  function leggTil(p: typeof products[0]) {
    const variant = cjProducts[p.cjId]?.variants?.[0];
    if (!variant?.vid) {
      setToast(lang === 'en' ? 'Loading product info, try again in a moment...' : 'Laster produktinfo, prøv igjen om et sekund...');
      setTimeout(() => setToast(''), 2500);
      return;
    }
    setHandlekurv(prev => {
      const eksisterende = prev.findIndex(i => i.variantId === variant.vid);
      if (eksisterende !== -1) {
        const neste = prev.map((i, idx) =>
          idx === eksisterende ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
        localStorage.setItem('fjordfur-cart', JSON.stringify(neste));
        return neste;
      }
      const item = { id: p.id, name: p.name, nameEn: (p as any).nameEn, price: p.price, cjId: p.cjId, variantId: variant.vid, quantity: 1 };
      const neste = [...prev, item];
      localStorage.setItem('fjordfur-cart', JSON.stringify(neste));
      return neste;
    });
    setToast(lang === 'en' ? (p.nameEn + ' added to cart') : (p.name + ' lagt i handlekurven'));
    setTimeout(() => setToast(''), 2500);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafaf8; color: #1a1a18; }

        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8e8e4;
          padding: 0 48px;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600; letter-spacing: 0.3px;
          color: #1a1a18;
        }
        .logo span { color: #1D9E75; }
        .nav-links { display: flex; gap: 28px; }
        .nav-links a {
          font-size: 13px; color: #666; cursor: pointer;
          text-decoration: none; letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #1a1a18; }
        .nav-right { display: flex; gap: 12px; align-items: center; }
        .cart-btn {
          display: flex; align-items: center; gap: 8px;
          background: #1a1a18; color: #fafaf8;
          border: none; border-radius: 8px;
          padding: 9px 18px; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }
        .cart-btn:hover { background: #1D9E75; }

        .hero {
          display: grid; grid-template-columns: 1fr 1fr;
          min-height: 520px; border-bottom: 1px solid #e8e8e4;
        }
        .hero-left {
          padding: 80px 48px;
          display: flex; flex-direction: column; justify-content: center;
          border-right: 1px solid #e8e8e4;
        }
        .hero-tag {
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #1D9E75; font-weight: 500; margin-bottom: 20px;
        }
        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px; font-weight: 600; line-height: 1.1;
          color: #1a1a18; margin-bottom: 20px; letter-spacing: -0.5px;
        }
        .hero-p {
          font-size: 15px; color: #777; line-height: 1.7;
          margin-bottom: 36px; max-width: 340px; font-weight: 300;
        }
        .hero-btns { display: flex; gap: 12px; }
        .btn-primary {
          background: #1a1a18; color: #fafaf8;
          border: none; border-radius: 8px;
          padding: 13px 28px; font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #1D9E75; }
        .btn-secondary {
          background: transparent; color: #1a1a18;
          border: 1px solid #d4d4ce; border-radius: 8px;
          padding: 13px 28px; font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: #1a1a18; }

        .hero-right {
          padding: 80px 48px;
          display: flex; flex-direction: column;
          justify-content: center; gap: 0;
          background: #f4f4f0;
        }
        .stat-row {
          padding: 28px 0;
          border-bottom: 1px solid #e0e0da;
        }
        .stat-row:first-child { padding-top: 0; }
        .stat-row:last-child { border-bottom: none; padding-bottom: 0; }
        .stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 42px; font-weight: 600; color: #1a1a18;
          line-height: 1; margin-bottom: 6px;
        }
        .stat-label { font-size: 13px; color: #888; font-weight: 300; }

        .main { max-width: 1200px; margin: 0 auto; padding: 56px 48px; }

        .section-header {
          display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 28px;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600; color: #1a1a18;
        }

        .cats-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 12px; }
        .cats { display: flex; gap: 8px; flex-wrap: wrap; }
        .sort-select {
          appearance: none; -webkit-appearance: none;
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 12px center;
          border: 1px solid #d4d4ce; border-radius: 8px;
          padding: 8px 36px 8px 14px;
          font-size: 13px; color: #444; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .sort-select:hover { border-color: #1a1a18; }
        .sort-select:focus { outline: none; border-color: #1D9E75; }
        .cat {
          padding: 7px 18px; border-radius: 99px;
          border: 1px solid #d4d4ce;
          font-size: 13px; cursor: pointer;
          background: transparent; color: #666;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; letter-spacing: 0.01em;
        }
        .cat:hover { border-color: #1D9E75; color: #1D9E75; }
        .cat.active { background: #1a1a18; color: #fafaf8; border-color: #1a1a18; }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 64px;
        }
        .card {
          background: #fff; cursor: pointer;
          transition: all 0.2s;
          display: flex; flex-direction: column;
          border: 1px solid #e8e8e4; border-radius: 12px;
          overflow: hidden;
        }
        .card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #d4d4ce; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skel { background: linear-gradient(90deg, #f0f0ec 25%, #e8e8e4 50%, #f0f0ec 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
        .card-skeleton { cursor: default; pointer-events: none; }
        .card-skeleton:hover { transform: none; box-shadow: none; }
        .card-img {
          height: 220px;
          display: flex; align-items: center; justify-content: center;
          font-size: 56px; background: #f7f7f5;
          overflow: hidden;
        }
        .card-body { padding: 18px 20px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .card-name { font-size: 15px; font-weight: 500; color: #1a1a18; }
        .card-sub { font-size: 13px; color: #888; line-height: 1.5; flex: 1; }
        .card-stars { display: flex; align-items: center; gap: 5px; }
        .stars-icons { color: #f59e0b; font-size: 13px; letter-spacing: 1px; }
        .stars-count { font-size: 12px; color: #aaa; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600; color: #1a1a18;
        }
        .add {
          background: #1a1a18; border: none;
          color: #fafaf8; border-radius: 8px;
          font-size: 13px; padding: 8px 16px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-weight: 500; transition: background 0.2s;
        }
        .add:hover { background: #1D9E75; }

        .trust-strip {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: #e8e8e4;
          border: 1px solid #e8e8e4; border-radius: 12px;
          overflow: hidden; margin-bottom: 64px;
        }
        .trust-item {
          background: #fafaf8; padding: 32px 28px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .trust-icon { font-size: 22px; margin-bottom: 4px; }
        .trust-title { font-size: 14px; font-weight: 500; color: #1a1a18; }
        .trust-text { font-size: 13px; color: #888; line-height: 1.6; font-weight: 300; }

        .seo { margin-bottom: 64px; }
        .seo-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px; font-weight: 600; color: #1a1a18;
          margin-bottom: 20px; letter-spacing: -0.3px;
        }
        .seo-h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600; color: #1a1a18;
          margin: 32px 0 12px;
        }
        .seo p {
          font-size: 15px; color: #666; line-height: 1.85;
          font-weight: 300; margin-bottom: 16px; max-width: 760px;
        }
        .seo a { color: #1D9E75; text-decoration: none; }
        .seo a:hover { text-decoration: underline; }
        .seo-cols {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 48px; margin-top: 8px;
        }
        .seo ul { margin: 0 0 16px 0; padding-left: 20px; max-width: 760px; }
        .seo li { font-size: 15px; color: #666; line-height: 1.8; font-weight: 300; margin-bottom: 8px; }
        .seo li strong { color: #1a1a18; font-weight: 500; }

        .footer {
          border-top: 1px solid #e8e8e4;
          padding: 40px 48px;
          display: flex; justify-content: space-between; align-items: center;
          max-width: 1200px; margin: 0 auto;
        }
        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 600; color: #1a1a18;
        }
        .footer-logo span { color: #1D9E75; }
        .footer-text { font-size: 12px; color: #aaa; }

        .toast-bar {
          position: fixed; bottom: 28px; left: 50%;
          transform: translateX(-50%);
          background: #1a1a18; color: #fafaf8;
          padding: 12px 24px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          z-index: 999; pointer-events: none;
          animation: slideup 0.25s ease;
        }
        @keyframes slideup {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .drawer-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 200;
        }
        .drawer {
          position: fixed; top: 0; right: 0;
          width: 380px; height: 100vh;
          background: #fafaf8;
          border-left: 1px solid #e8e8e4;
          z-index: 201; padding: 32px;
          display: flex; flex-direction: column;
          animation: slidein 0.25s ease;
        }
        @keyframes slidein {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .drawer-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 600; margin-bottom: 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .drawer-close {
          background: none; border: none; font-size: 22px;
          cursor: pointer; color: #888; line-height: 1;
        }
        .drawer-item {
          display: flex; flex-direction: column; gap: 8px;
          padding: 14px 0; border-bottom: 1px solid #e8e8e4;
        }
        .drawer-item-name { font-size: 14px; color: #1a1a18; font-weight: 500; }
        .drawer-item-row { display: flex; align-items: center; gap: 10px; }
        .drawer-qty-btn {
          width: 26px; height: 26px; border-radius: 6px;
          border: 1px solid #d4d4ce; background: #fff;
          cursor: pointer; font-size: 15px; color: #1a1a18;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .drawer-qty-btn:hover { background: #1a1a18; color: #fafaf8; border-color: #1a1a18; }
        .drawer-qty-num { font-size: 14px; font-weight: 600; color: #1a1a18; min-width: 18px; text-align: center; }
        .drawer-empty { color: #aaa; font-size: 14px; margin-top: 16px; font-weight: 300; }
        .drawer-frakt {
          background: #f4f4f0; border-radius: 8px;
          padding: 12px 14px; margin-bottom: 16px;
        }
        .drawer-frakt-label { font-size: 13px; color: #444; margin-bottom: 8px; line-height: 1.4; }
        .drawer-frakt-label strong { color: #1a1a18; }
        .drawer-frakt-track { height: 5px; background: #e0e0da; border-radius: 99px; overflow: hidden; }
        .drawer-frakt-fill { height: 100%; border-radius: 99px; background: #1D9E75; transition: width 0.4s ease; }
        .drawer-frakt-done { font-size: 13px; color: #1D9E75; font-weight: 500; }
        .drawer-total {
          margin-top: auto; padding-top: 24px;
          border-top: 1px solid #e8e8e4;
        }
        .drawer-total-row {
          display: flex; justify-content: space-between;
          font-size: 15px; font-weight: 500; margin-bottom: 16px;
        }
        .btn-checkout {
          width: 100%; background: #1D9E75; color: #fafaf8;
          border: none; border-radius: 8px;
          padding: 14px; font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 768px) {
          .nav { padding: 0 20px; }
          .nav-links { display: none; }

          .hero { grid-template-columns: 1fr; min-height: auto; }
          .hero-left { padding: 48px 20px; border-right: none; border-bottom: 1px solid #e8e8e4; }
          .hero-h1 { font-size: 38px; }
          .hero-right { padding: 32px 20px; flex-direction: row; flex-wrap: wrap; gap: 0; }
          .stat-row { padding: 16px 0; width: 50%; border-bottom: 1px solid #e0e0da; }
          .stat-row:nth-child(2) { border-bottom: none; }
          .stat-num { font-size: 32px; }

          .main { padding: 36px 20px; }

          .grid { grid-template-columns: repeat(2, 1fr); }
          .card-img { height: 160px; }

          .trust-strip { grid-template-columns: 1fr; }

          .seo-cols { grid-template-columns: 1fr; gap: 0; }
          .seo-h2 { font-size: 26px; }

          .drawer { width: 100vw; border-left: none; padding: 24px 20px; }

          footer { padding: 32px 20px !important; flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
        }

        @media (max-width: 400px) {
          .grid { grid-template-columns: 1fr; }
          .hero-h1 { font-size: 32px; }
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "name": "FjordFur",
        "url": process.env.NEXT_PUBLIC_SITE_URL || "https://fjordfur.com",
        "description": "Nøye utvalgte kjæledyrprodukter av høy kvalitet. Gratis frakt over 499 kr. 14 dagers angrerett.",
        "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://fjordfur.com"}/icon.svg`,
        "contactPoint": { "@type": "ContactPoint", "email": "contact.fjordfur@gmail.com", "contactType": "customer service" },
        "areaServed": "NO",
        "currenciesAccepted": "NOK",
      })}} />

      {/* Navbar */}
      <nav className="nav">
        <div className="logo">Fjord<span>Fur</span></div>
        <div className="nav-right">
          <LangToggle lang={lang} setLang={setLang} />
          <button className="cart-btn" onClick={() => setKurvAapen(true)}>
            🛒 {lang === 'en' ? 'Cart' : 'Handlekurv'} ({handlekurv.reduce((sum, i) => sum + i.quantity, 0)})
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-left">
          <p className="hero-tag">{lang === 'en' ? 'Premium pet supplies' : 'Premium kjæledyrutstyr'}</p>
          <h1 className="hero-h1">{lang === 'en' ? 'Create joy for your pet' : 'Skap glede for kjæledyret ditt'}</h1>
          <p className="hero-p">{lang === 'en' ? 'Carefully selected products that make everyday life better — for you and your pet. Free shipping over NOK 499.' : 'Nøye utvalgte produkter som gjør hverdagen bedre — for deg og kjæledyret ditt. Gratis frakt over 499 kr.'}</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => document.getElementById('produkter')?.scrollIntoView({ behavior: 'smooth' })}>
              {lang === 'en' ? 'See all products' : 'Se alle produkter'}
            </button>
            <button className="btn-secondary" onClick={() => window.location.href = '/om-oss'}>{lang === 'en' ? 'About us' : 'Om oss'}</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="stat-row">
            <div className="stat-num">{lang === 'en' ? 'Free' : 'Gratis'}</div>
            <div className="stat-label">{lang === 'en' ? 'Shipping over NOK 499' : 'Frakt over kr 499'}</div>
          </div>
          <div className="stat-row">
            <div className="stat-num">14</div>
            <div className="stat-label">{lang === 'en' ? 'Day return policy' : 'Dagers angrerett'}</div>
          </div>
          <div className="stat-row">
            <div className="stat-num">100%</div>
            <div className="stat-label">{lang === 'en' ? 'Secure payment' : 'Sikker betaling'}</div>
          </div>
        </div>
      </div>

      {/* Produkter */}
      <div className="main">
        <div id="produkter" className="section-header">
          <h2 className="section-title">{lang === 'en' ? 'Products' : 'Produkter'}</h2>
        </div>

        <div className="cats-row">
          <div className="cats">
            {kategorier.map(kat => (
              <button
                key={kat}
                className={`cat ${aktivKat === kat ? 'active' : ''}`}
                onClick={() => setAktivKat(kat)}
              >
                {katLabel(kat, lang)}
              </button>
            ))}
          </div>
          <select className="sort-select" value={sortering} onChange={e => setSortering(e.target.value)}>
            <option value="anbefalt">{lang === 'en' ? 'Recommended' : 'Anbefalt'}</option>
            <option value="populær">{lang === 'en' ? 'Most popular' : 'Mest populær'}</option>
            <option value="pris-lav">{lang === 'en' ? 'Price: low to high' : 'Pris: lav til høy'}</option>
            <option value="pris-høy">{lang === 'en' ? 'Price: high to low' : 'Pris: høy til lav'}</option>
          </select>
        </div>

<div className="grid">
  {filtrerte.map(p => {
    const lasterDenne = cjLaster && !cjProducts[p.cjId];
    return (
      <div key={p.id} className={`card${lasterDenne ? ' card-skeleton' : ''}`} onClick={() => !lasterDenne && p.cjId && window.location.assign(`/produkt/${p.cjId}?pris=${p.price}&margin=${p.margin}`)}>
        <div className="card-img">
          {lasterDenne
            ? <div className="skel" style={{ width: '100%', height: '100%' }} />
            : p.cjId && cjProducts[p.cjId]
              ? <img src={cjProducts[p.cjId].productImageSet?.[(p as any).bildIndex ?? 0] || cjProducts[p.cjId].bigImage} alt={lang === 'en' ? (p as any).nameEn : p.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: '#f4f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>{p.emoji}</div>}
        </div>
        <div className="card-body">
          {lasterDenne ? (
            <>
              <div className="skel" style={{ height: '16px', width: '70%' }} />
              <div className="skel" style={{ height: '13px', width: '90%', marginTop: '6px' }} />
              <div className="card-footer" style={{ marginTop: '16px' }}>
                <div className="skel" style={{ height: '16px', width: '50px' }} />
                <div className="skel" style={{ height: '34px', width: '80px', borderRadius: '8px' }} />
              </div>
            </>
          ) : (
            <>
              <div className="card-name">{lang === 'en' ? (p as any).nameEn : p.name}</div>
              <div className="card-sub">{lang === 'en' ? (p as any).subEn : p.sub}</div>
              <div className="card-footer">
                <span className="price">{lang === 'en' ? `NOK ${p.price}` : `kr ${p.price},–`}</span>
                <button className="add" onClick={(e) => { e.stopPropagation(); leggTil(p); }}>
                  {lang === 'en' ? 'Add' : 'Legg til'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  })}
</div>

        {/* Tillitsstripe */}
        <div className="trust-strip">
          <div className="trust-item">
            <div className="trust-icon">🚚</div>
            <div className="trust-title">{lang === 'en' ? 'Free shipping over NOK 499' : 'Gratis frakt over 499 kr'}</div>
            <div className="trust-text">{lang === 'en' ? 'Worldwide delivery. Tracked shipping straight to your door.' : 'Leverer til hele verden. Sporbar frakt rett hjem til deg.'}</div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🔄</div>
            <div className="trust-title">{lang === 'en' ? '14-day return policy' : '14 dagers angrerett'}</div>
            <div className="trust-text">{lang === 'en' ? 'Not happy? We refund without questions — no need to return the item.' : 'Ikke fornøyd? Vi refunderer uten spørsmål og uten at du trenger sende varen tilbake.'}</div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🐾</div>
            <div className="trust-title">{lang === 'en' ? 'Loved by pets' : 'Elsket av kjæledyr'}</div>
            <div className="trust-text">{lang === 'en' ? 'Carefully selected products tested and approved by pet lovers worldwide.' : 'Nøye utvalgte produkter testet og godkjent av dyreelskere over hele verden.'}</div>
          </div>
        </div>

        {/* Innholdsseksjon / SEO */}
        {lang === 'en' ? (
          <section className="seo">
            <h2 className="seo-h2">High-quality pet supplies — carefully selected for dogs and cats</h2>
            <p>
              FjordFur is the online shop for pet owners who want to give their dog or cat a safer, healthier and happier
              everyday life. We hand-pick every single product based on quality, animal welfare and real usefulness — not
              just price. Everything we sell is something we would happily use for our own pets. With free shipping over
              NOK 499, a 14-day return policy and tracked delivery straight to your door, shopping with us is meant to be
              both safe and simple.
            </p>

            <div className="seo-cols">
              <div>
                <h3 className="seo-h3">For your dog</h3>
                <p>
                  Whether you are heading out for long walks in the forest and mountains or relaxing at home, you will
                  find practical gear that makes daily life easier. Does your dog eat far too quickly? A{' '}
                  <a href="/produkt/1653041912300969984?pris=149&margin=132">slow feeder bowl</a> slows down the eating
                  pace and helps prevent choking and bloating. Going on a trip? A{' '}
                  <a href="/produkt/2504100230321610200?pris=249&margin=120">2-in-1 water bottle</a> with a built-in food
                  container is worth its weight in gold, and a{' '}
                  <a href="/produkt/1767124394830204928?pris=169&margin=79">poop bag holder</a> keeps waste bags ready on
                  the leash at all times. Want more tips? Read our guides on the{' '}
                  <a href="/blogg/pakkeliste-til-hundeturen">dog walk packing list</a> and{' '}
                  <a href="/blogg/hvorfor-spiser-hunden-for-fort">why your dog eats too fast</a>.
                </p>
              </div>
              <div>
                <h3 className="seo-h3">For your cat</h3>
                <p>
                  Cats are clean animals, but they still need a helping hand now and then. Our{' '}
                  <a href="/produkt/2607180827191632000?pris=199&margin=122">grooming set for ears and teeth</a> makes it
                  easy and gentle to keep teeth clean and ears healthy between vet visits — completely without water and
                  stress. Good dental health and clean ears help prevent bad odour, plaque and ear mites, so your cat
                  stays comfortable and content.
                </p>
              </div>
            </div>

            <h3 className="seo-h3">Why shop at FjordFur?</h3>
            <ul>
              <li><strong>Carefully selected products</strong> — we test and approve everything ourselves, with animal welfare in focus.</li>
              <li><strong>Free shipping over NOK 499</strong> — tracked delivery straight to your door.</li>
              <li><strong>14-day return policy</strong> — not happy? You get your money back, no questions asked.</li>
              <li><strong>Secure payment</strong> — safe card payment and full overview of your order.</li>
            </ul>
            <p>
              Not sure what your pet needs? <a href="/om-oss">Learn more about us</a> and the philosophy behind the shop,
              or visit our <a href="/blogg">blog</a> for advice and guides for pet owners. To learn more about animal
              health and responsible pet ownership, we recommend the resources from{' '}
              <a href="https://www.mattilsynet.no/dyr/kjaledyr" target="_blank" rel="noopener noreferrer">the Norwegian Food Safety Authority</a>{' '}
              and <a href="https://www.nkk.no" target="_blank" rel="noopener noreferrer">the Norwegian Kennel Club</a>.
            </p>
          </section>
        ) : (
          <section className="seo">
            <h2 className="seo-h2">Kjæledyrutstyr av høy kvalitet — nøye utvalgt for hund og katt</h2>
            <p>
              FjordFur er nettbutikken for deg som vil gi hunden eller katten en tryggere, sunnere og gladere hverdag. Vi
              håndplukker hvert eneste produkt ut fra kvalitet, dyrevelferd og reell nytte — ikke bare pris. Alt vi selger
              er noe vi selv ville brukt på våre egne dyr. Med gratis frakt over 499 kr, 14 dagers angrerett og sporbar
              levering rett hjem til deg, skal det være både trygt og enkelt å handle hos oss.
            </p>

            <div className="seo-cols">
              <div>
                <h3 className="seo-h3">Til hunden</h3>
                <p>
                  Enten dere er på lange turer i skog og fjell eller koser dere hjemme, finner du praktisk utstyr som gjør
                  hverdagen enklere. Spiser hunden altfor fort? En{' '}
                  <a href="/produkt/1653041912300969984?pris=149&margin=132">sakte-fôr skål</a> bremser spisetempoet og
                  forebygger kvelning og oppblåsthet. Skal dere ut på tur? Da er en{' '}
                  <a href="/produkt/2504100230321610200?pris=249&margin=120">vannflaske 2-i-1</a> med innebygd
                  matbeholder gull verdt, og en{' '}
                  <a href="/produkt/1767124394830204928?pris=169&margin=79">bæsjeposeholder</a> sørger for at posene alltid
                  henger klare på båndet. Vil du ha flere tips? Les guidene våre om{' '}
                  <a href="/blogg/pakkeliste-til-hundeturen">pakkeliste til hundeturen</a> og{' '}
                  <a href="/blogg/hvorfor-spiser-hunden-for-fort">hvorfor hunden spiser for fort</a>.
                </p>
              </div>
              <div>
                <h3 className="seo-h3">Til katten</h3>
                <p>
                  Katter er rene dyr, men trenger litt hjelp innimellom. Vårt{' '}
                  <a href="/produkt/2607180827191632000?pris=199&margin=122">stellesett for øre og tenner</a> gjør det
                  enkelt og skånsomt å holde tennene rene og ørene friske mellom besøk hos veterinæren — helt uten vann og
                  stress. God tannhelse og rene ører forebygger både vond lukt, plakk og øremidd, slik at katten holder seg
                  frisk og fornøyd.
                </p>
              </div>
            </div>

            <h3 className="seo-h3">Hvorfor handle hos FjordFur?</h3>
            <ul>
              <li><strong>Nøye utvalgte produkter</strong> — vi tester og godkjenner alt selv, med dyrevelferd i fokus.</li>
              <li><strong>Gratis frakt over 499 kr</strong> — sporbar levering rett hjem til deg.</li>
              <li><strong>14 dagers angrerett</strong> — ikke fornøyd? Du får pengene tilbake, uten spørsmål.</li>
              <li><strong>Trygg betaling</strong> — sikker kortbetaling og full oversikt over bestillingen.</li>
            </ul>
            <p>
              Er du usikker på hva kjæledyret ditt trenger? <a href="/om-oss">Les mer om oss</a> og filosofien bak
              butikken, eller besøk <a href="/blogg">bloggen vår</a> for råd og guider skrevet for norske dyreeiere. Vil du
              lære mer om dyrehelse og ansvarlig dyrehold, anbefaler vi ressursene til{' '}
              <a href="https://www.mattilsynet.no/dyr/kjaledyr" target="_blank" rel="noopener noreferrer">Mattilsynet</a>{' '}
              og <a href="https://www.nkk.no" target="_blank" rel="noopener noreferrer">Norsk Kennel Klub</a>.
            </p>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e8e8e4', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    <div className="footer-logo">Fjord<span>Fur</span></div>
    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>Org.nr. 930 795 593</div>
  </div>
  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
    <a href="/om-oss" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>{lang === 'en' ? 'About us' : 'Om oss'}</a>
    <a href="/blogg" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>{lang === 'en' ? 'Blog' : 'Blogg'}</a>
    <a href="/sporing" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>{lang === 'en' ? 'Track order' : 'Spor bestilling'}</a>
    <a href="/retur" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>{lang === 'en' ? 'Returns' : 'Retur & Refusjon'}</a>
    <a href="/angreskjema" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>{lang === 'en' ? 'Cancellation form' : 'Angreskjema'}</a>
    <a href="/vilkar" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>{lang === 'en' ? 'Terms' : 'Vilkår'}</a>
    <a href="/personvern" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>{lang === 'en' ? 'Privacy' : 'Personvern'}</a>
    <div className="footer-text">© 2026 FjordFur. {lang === 'en' ? 'All rights reserved.' : 'Alle rettigheter forbeholdt.'}</div>
  </div>
</footer>

      {/* Toast */}
      {toast && <div className="toast-bar">{toast}</div>}

      {/* Handlekurv-drawer */}
      {kurvaapen && (
        <>
          <div className="drawer-overlay" onClick={() => setKurvAapen(false)} />
          <div className="drawer">
            <div className="drawer-title">
              {lang === 'en' ? 'Cart' : 'Handlekurv'}
              <button className="drawer-close" onClick={() => setKurvAapen(false)}>×</button>
            </div>
            {handlekurv.length > 0 && (() => {
              const sub = handlekurv.reduce((s, i) => s + i.price * i.quantity, 0);
              return (
                <div className="drawer-frakt">
                  {sub >= 499 ? (
                    <p className="drawer-frakt-done">🎉 {lang === 'en' ? 'You have free shipping!' : 'Du har gratis frakt!'}</p>
                  ) : (
                    <>
                      <p className="drawer-frakt-label">{lang === 'en' ? <>Spend <strong>NOK {499 - sub}</strong> more for <strong>free shipping</strong></> : <>Handle for <strong>kr {499 - sub},–</strong> til for å få <strong>gratis frakt</strong></>}</p>
                      <div className="drawer-frakt-track">
                        <div className="drawer-frakt-fill" style={{ width: `${Math.min(100, (sub / 499) * 100)}%` }} />
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
            {handlekurv.length === 0 ? (
              <p className="drawer-empty">{lang === 'en' ? 'Your cart is empty.' : 'Handlekurven er tom.'}</p>
            ) : (
              handlekurv.map((item, i) => (
                <div key={i} className="drawer-item">
                  <span className="drawer-item-name">{item.name}</span>
                  <div className="drawer-item-row">
                    <button className="drawer-qty-btn" onClick={() => setHandlekurv(prev => {
                      const neste = prev.map((x, idx) => idx === i ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x);
                      localStorage.setItem('fjordfur-cart', JSON.stringify(neste));
                      return neste;
                    })}>−</button>
                    <span className="drawer-qty-num">{item.quantity}</span>
                    <button className="drawer-qty-btn" onClick={() => setHandlekurv(prev => {
                      const neste = prev.map((x, idx) => idx === i ? { ...x, quantity: x.quantity + 1 } : x);
                      localStorage.setItem('fjordfur-cart', JSON.stringify(neste));
                      return neste;
                    })}>+</button>
                    <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 500, color: '#1a1a18' }}>{lang === 'en' ? `NOK ${item.price * item.quantity}` : `kr ${item.price * item.quantity},–`}</span>
                    <button onClick={() => setHandlekurv(prev => {
                      const neste = prev.filter((_, idx) => idx !== i);
                      localStorage.setItem('fjordfur-cart', JSON.stringify(neste));
                      return neste;
                    })} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}>×</button>
                  </div>
                </div>
              ))
            )}
            <div className="drawer-total">
              <div className="drawer-total-row">
                <span>{lang === 'en' ? 'Total' : 'Totalt'}</span>
                <span>{lang === 'en' ? `NOK ${handlekurv.reduce((sum, item) => sum + item.price * item.quantity, 0)}` : `kr ${handlekurv.reduce((sum, item) => sum + item.price * item.quantity, 0)},–`}</span>
              </div>
              <a href="/handlekurv" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '12px', borderRadius: '8px', border: '1px solid #d4d4ce', color: '#1a1a18', textDecoration: 'none', fontSize: '14px', fontWeight: 500, marginBottom: '10px', fontFamily: "'DM Sans', sans-serif" }}>
                {lang === 'en' ? 'View cart' : 'Gå til handlekurv'}
              </a>
<button className="btn-checkout" onClick={async () => {
  if (handlekurv.length === 0) {
    alert(lang === 'en' ? 'Your cart is empty!' : 'Handlekurven er tom!');
    return;
  }
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: handlekurv.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          cjId: item.cjId,
          variantId: item.variantId,
        })),
      }),
    });
    const data = await res.json();
    if (data.url) {
      localStorage.removeItem('fjordfur-cart');
      setHandlekurv([]);
      window.location.href = data.url;
    } else {
      alert((lang === 'en' ? 'Error: ' : 'Feil: ') + JSON.stringify(data));
    }
  } catch (err) {
    alert((lang === 'en' ? 'Something went wrong: ' : 'Noe gikk galt: ') + err);
  }
}}>
  {lang === 'en' ? 'Go to checkout' : 'Gå til betaling'}
</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}