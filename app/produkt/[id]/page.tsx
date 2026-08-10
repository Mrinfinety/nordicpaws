'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage, type Lang } from '../../../lib/useLanguage';
import { PRODUKTER, hentRelaterte } from '../../../lib/produkter';

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

const STØRRELSE_REKKEFØLGE = ['xs', 's', 'm', 'l', 'xl'];

function sorterVarianter(varianter: any[]) {
  return [...varianter].sort((a, b) => {
    const nøkkelA = a.variantKey?.toLowerCase() ?? '';
    const nøkkelB = b.variantKey?.toLowerCase() ?? '';
    const iA = STØRRELSE_REKKEFØLGE.findIndex(s => nøkkelA === s || nøkkelA.endsWith(`-${s}`) || nøkkelA.includes(` ${s}`));
    const iB = STØRRELSE_REKKEFØLGE.findIndex(s => nøkkelB === s || nøkkelB.endsWith(`-${s}`) || nøkkelB.includes(` ${s}`));
    if (iA === -1 && iB === -1) return 0;
    if (iA === -1) return 1;
    if (iB === -1) return -1;
    return iA - iB;
  });
}

const SKJUL_VARIANTER: Record<string, string[]> = {};

const FARGE_ORD = ['green','blue','red','pink','orange','black','white','yellow','purple','gray','grey','brown'];

const NORSK: Record<string, string> = {
  'set1':'2-pk Rosa & Oransje','set':'2-pk Oransje & Grønn',
  'green':'Grønn','pink':'Rosa','orange':'Oransje','blue':'Blå','red':'Rød',
  'black':'Svart','white':'Hvit','yellow':'Gul','purple':'Lilla',
  'gray':'Grå','grey':'Grå','brown':'Brun','dark blue':'Mørkeblå',
  'without logo':'','with label':'','new striped blue':'Blå striper','new striped gray':'Grå striper',
  'small':'Liten','medium':'Medium','large':'Stor',
  'water grain cup':'Med matbeholder',
  'xs':'XS','s':'S','m':'M','l':'L','xl':'XL',
};

const ENGLISH: Record<string, string> = {
  'set1': '2-pack Pink & Orange',
  'set': '2-pack Orange & Green',
  'water grain cup': 'With food container',
  'without logo': '',
  'with label': '',
  'new striped blue': 'Blue Stripes',
  'new striped gray': 'Gray Stripes',
};

function oversett(tekst: string, lang: Lang = 'no'): string {
  let t = tekst.trim();
  if (lang === 'en') {
    const sortertEn = Object.entries(ENGLISH).sort((a, b) => b[0].length - a[0].length);
    for (const [key, val] of sortertEn) {
      t = t.replace(new RegExp(`\\b${key}\\b`, 'gi'), val);
    }
    return t.trim().replace(/\b\w/g, c => c.toUpperCase());
  }
  const sortert = Object.entries(NORSK).sort((a, b) => b[0].length - a[0].length);
  for (const [en, no] of sortert) {
    t = t.replace(new RegExp(`\\b${en}\\b`, 'gi'), no);
  }
  return t.trim().replace(/\bml\b/gi, 'ml');
}

function hentFarge(key: string): string | null {
  const k = key.toLowerCase();
  return FARGE_ORD.find(f => new RegExp(`\\b${f}\\b`).test(k)) || null;
}

function hentAnnenDim(key: string): string {
  let k = key.trim();
  FARGE_ORD.forEach(f => { k = k.replace(new RegExp(`\\b${f}\\b`, 'gi'), ''); });
  return k.trim().toLowerCase();
}

function hentDimensjoner(varianter: any[]) {
  const farger = new Set<string>();
  const andre = new Set<string>();
  varianter.forEach(v => {
    const f = hentFarge(v.variantKey || '');
    const a = hentAnnenDim(v.variantKey || '');
    if (f) farger.add(f);
    if (a) andre.add(a);
  });
  return { farger: [...farger], andre: [...andre], harBegge: farger.size > 0 && andre.size > 0 };
}

function finnVariant(varianter: any[], farge: string, annen: string): any {
  return varianter.find(v => {
    const k = (v.variantKey || '').toLowerCase();
    const mf = !farge || k.includes(farge.toLowerCase());
    const ma = !annen || k.toLowerCase().includes(annen.toLowerCase());
    return mf && ma;
  });
}

function andreDimLabel(verdier: string[], lang: Lang): string {
  if (verdier.some(v => /ml/i.test(v))) return lang === 'en' ? 'Capacity' : 'Kapasitet';
  if (verdier.some(v => /xs|s|m|l|xl|small|medium|large/i.test(v))) return lang === 'en' ? 'Size' : 'Størrelse';
  return 'Type';
}

export default function ProduktSide() {
  const { lang, setLang } = useLanguage();
  const { id } = useParams();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const konfigPris = PRODUKTER.find(p => p.cjId === id)?.pris ?? 0;
  const fastPris = parseInt(searchParams.get('pris') || '0') || konfigPris;
  const margin = parseInt(searchParams.get('margin') || '15');
  const [produkt, setProdukt] = useState<any>(null);
  const [valgtVariant, setValgtVariant] = useState<any>(null);
  const [laster, setLaster] = useState(true);
  const [beskrivelse, setBeskrivelse] = useState('');
  const [variantNavn, setVariantNavn] = useState<Record<string, string>>({});
  const [produktNavn, setProduktNavn] = useState('');
  const [aktivBilde, setAktivBilde] = useState(0);
  const [lagtTil, setLagtTil] = useState(false);
  const [handlekurv, setHandlekurv] = useState<{ id: number; name: string; nameEn?: string; price: number; cjId: string; variantId: string; quantity: number }[]>([]);
  const [kurvaapen, setKurvAapen] = useState(false);
  const [relBilder, setRelBilder] = useState<Record<string, string>>({});
  const [valgtFarge, setValgtFarge] = useState('');
  const [valgtAnnen, setValgtAnnen] = useState('');

  useEffect(() => {
    try {
      const lagret = localStorage.getItem('fjordfur-cart');
      if (lagret) setHandlekurv(JSON.parse(lagret).map((i: any) => ({ ...i, quantity: i.quantity || 1 })));
    } catch {}
  }, []);

  useEffect(() => {
  fetch(`/api/products?pid=${id}`)
    .then(res => res.json())
    .then(async data => {
      setProdukt(data.data);
      const konfig = PRODUKTER.find(p => p.cjId === id);
      const skjul = SKJUL_VARIANTER[id as string] ?? konfig?.skjul_varianter ?? [];
      const tillatte = konfig?.tillatte_vider;
      const synligeVarianter = data.data?.variants?.filter((v: any) =>
        !skjul.some(s => v.variantKey?.toLowerCase().includes(s)) &&
        (!tillatte || tillatte.some(t => t.toLowerCase() === (v.vid || v.variantSku || '')?.toLowerCase()))
      );
      const førsteVariant = synligeVarianter?.[0] ?? data.data?.variants?.[0];
      setValgtVariant(førsteVariant);

      const dim = hentDimensjoner(synligeVarianter || []);
      if (dim.harBegge) {
        const f = hentFarge(førsteVariant?.variantKey || '');
        const a = hentAnnenDim(førsteVariant?.variantKey || '');
        setValgtFarge(f || '');
        setValgtAnnen(a || '');
      }
      setLaster(false);

      setBeskrivelse(konfig?.beskrivelse || '');
      setProduktNavn(konfig?.navn || '');

      const rel = hentRelaterte(id as string);
      const bilder: Record<string, string> = {};
      await Promise.all(rel.map(async r => {
        const res = await fetch(`/api/products?pid=${r.cjId}`);
        const d = await res.json();
        const imgSet = d.data?.productImageSet;
        bilder[r.cjId] = imgSet?.[r.bildIndex ?? 0] || d.data?.bigImage || '';
      }));
      setRelBilder(bilder);
    });
}, [id]);

  if (laster) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      {lang === 'en' ? 'Loading product...' : 'Laster produkt...'}
    </div>
  );

  const visPris = fastPris;

  if (!produkt) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      {lang === 'en' ? 'Product not found.' : 'Produkt ikke funnet.'}
    </div>
  );

  const allebilderRå: string[] = [...(produkt.productImageSet || [])];
  produkt.variants?.forEach((v: any) => {
    if (v.variantImage && !allebilderRå.includes(v.variantImage)) allebilderRå.push(v.variantImage);
  });
  const konfig = PRODUKTER.find(p => p.cjId === id);
  const behold = konfig?.behold_bilder;
  const allebilder = behold ? allebilderRå.filter((_, i) => behold.includes(i)) : allebilderRå;
  function gaTilVariantBilde(v: any) {
    if (v?.variantImage) {
      const idx = allebilder.indexOf(v.variantImage);
      if (idx >= 0) setAktivBilde(idx);
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fafaf8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pnav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8e8e4;
          padding: 0 48px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .plogo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600; color: #1a1a18;
          text-decoration: none; cursor: pointer;
        }
        .plogo span { color: #1D9E75; }
        .pback {
          font-size: 13px; color: #666; cursor: pointer;
          text-decoration: none; display: flex; align-items: center; gap: 6px;
        }
        .pback:hover { color: #1a1a18; }

        .pcontainer {
          max-width: 1100px; margin: 0 auto;
          padding: 48px; display: grid;
          grid-template-columns: 1fr 1fr; gap: 64px;
        }

        .pimages { display: flex; flex-direction: column; gap: 12px; }
        .pmain-img {
          width: 100%; aspect-ratio: 1;
          object-fit: cover; border-radius: 12px;
          border: 1px solid #e8e8e4;
        }
        .pthumbs { display: flex; gap: 8px; flex-wrap: wrap; }
        .pthumb {
          width: 64px; height: 64px; object-fit: cover;
          border-radius: 8px; cursor: pointer;
          border: 1px solid #e8e8e4; transition: border-color 0.2s;
        }
        .pthumb:hover { border-color: #1a1a18; }
        .pthumb.active { border-color: #1D9E75; }

        .pinfo { display: flex; flex-direction: column; gap: 24px; padding-top: 8px; }
        .ptag {
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #1D9E75; font-weight: 500;
        }
        .ptitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 600; line-height: 1.2; color: #1a1a18;
        }
        .pprice {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 600; color: #1a1a18;
        }
        .pdivider { height: 1px; background: #e8e8e4; }

        .pvariant-label { font-size: 13px; font-weight: 500; color: #1a1a18; margin-bottom: 10px; }
        .pvariants { display: flex; gap: 8px; flex-wrap: wrap; }
        .pvariant {
          padding: 8px 16px; border-radius: 8px;
          border: 1px solid #d4d4ce; font-size: 13px;
          cursor: pointer; background: transparent; color: #666;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .pvariant:hover { border-color: #1a1a18; color: #1a1a18; }
        .pvariant.active { background: #1a1a18; color: #fafaf8; border-color: #1a1a18; }

        .padd {
          width: 100%; background: #1a1a18; color: #fafaf8;
          border: none; border-radius: 8px; padding: 16px;
          font-size: 15px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.2s;
        }
        .padd:hover { background: #1D9E75; }

        .pdesc {
          font-size: 14px; color: #888; line-height: 1.8; font-weight: 300;
        }

        .pstars { display: flex; align-items: center; gap: 8px; }
        .pstars-icons { color: #f59e0b; font-size: 16px; letter-spacing: 1px; }
        .pstars-text { font-size: 13px; color: #888; }

        .sticky-add {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 150;
          background: #fafaf8; border-top: 1px solid #e8e8e4;
          padding: 14px 20px; gap: 12px; align-items: center;
        }
        .sticky-add-name { font-size: 14px; font-weight: 500; color: #1a1a18; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sticky-add-price { font-size: 15px; font-weight: 600; color: #1a1a18; }
        .sticky-add-btn {
          background: #1D9E75; color: #fafaf8; border: none;
          border-radius: 8px; padding: 12px 20px;
          font-size: 14px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }

        .relaterte { max-width: 1100px; margin: 0 auto; padding: 0 48px 64px; }
        .relaterte-tittel {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 600; color: #1a1a18; margin-bottom: 20px;
        }
        .relaterte-grid { display: flex; gap: 16px; }
        .rel-card {
          flex: 0 0 240px; border: 1px solid #e8e8e4; border-radius: 12px;
          overflow: hidden; cursor: pointer; background: #fff;
          transition: all 0.2s;
        }
        .rel-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
        .rel-img { height: 160px; overflow: hidden; background: #f7f7f5; }
        .rel-img img { width: 100%; height: 100%; object-fit: cover; }
        .rel-body { padding: 14px 16px; }
        .rel-name { font-size: 14px; font-weight: 500; color: #1a1a18; margin-bottom: 4px; }
        .rel-price { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; color: #1a1a18; }

        @media (max-width: 768px) {
          .sticky-add { display: flex; }
          .relaterte { padding: 0 20px 80px; }
        }

        .pcart-btn {
          display: flex; align-items: center; gap: 8px;
          background: #1a1a18; color: #fafaf8;
          border: none; border-radius: 8px;
          padding: 9px 18px; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }
        .pcart-btn:hover { background: #1D9E75; }

        .drawer-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35); z-index: 200;
        }
        .drawer {
          position: fixed; top: 0; right: 0;
          width: 380px; height: 100vh;
          background: #fafaf8; border-left: 1px solid #e8e8e4;
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
          margin-top: auto; padding-top: 24px; border-top: 1px solid #e8e8e4;
        }
        .drawer-total-row {
          display: flex; justify-content: space-between;
          font-size: 15px; font-weight: 500; margin-bottom: 16px;
        }
        .btn-checkout {
          width: 100%; background: #1D9E75; color: #fafaf8;
          border: none; border-radius: 8px; padding: 14px;
          font-size: 14px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 768px) {
          .drawer { width: 100vw; border-left: none; padding: 24px 20px; }
        }

        @media (max-width: 768px) {
          .pnav { padding: 0 20px; }
          .pcontainer {
            grid-template-columns: 1fr;
            padding: 24px 20px;
            gap: 32px;
          }
          .ptitle { font-size: 28px; }
          .pprice { font-size: 26px; }
        }
      `}</style>

      <nav className="pnav">
        <a href="/" className="plogo">Fjord<span>Fur</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" className="pback">← {lang === 'en' ? 'Back to store' : 'Tilbake til butikken'}</a>
          <LangToggle lang={lang} setLang={setLang} />
          <button className="pcart-btn" onClick={() => setKurvAapen(true)}>
            🛒 {lang === 'en' ? 'Cart' : 'Handlekurv'} ({handlekurv.reduce((sum, i) => sum + i.quantity, 0)})
          </button>
        </div>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": produktNavn || produkt.productNameEn,
        "description": beskrivelse || produkt.productNameEn,
        "brand": { "@type": "Brand", "name": "FjordFur" },
        "image": produkt.bigImage,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "NOK",
          "price": String(visPris),
          "availability": "https://schema.org/InStock",
          "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://fjordfur.com"}/produkt/${id}`,
          "seller": { "@type": "Organization", "name": "FjordFur" },
        },
      })}} />

      <div className="pcontainer">
        <div className="pimages">
  <div style={{ position: 'relative' }}>
    <img
      className="pmain-img"
      src={allebilder[aktivBilde] || produkt.bigImage}
      alt={produkt.productNameEn}
      fetchPriority="high"
      decoding="async"
    />
    <button onClick={() => setAktivBilde(prev => Math.max(0, prev - 1))} style={{
      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
      width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px',
      display: aktivBilde === 0 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center'
    }}>←</button>
    <button onClick={() => setAktivBilde(prev => Math.min(allebilder.length - 1, prev + 1))} style={{
      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
      width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px',
      display: aktivBilde === allebilder.length - 1 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center'
    }}>→</button>
  </div>
  <div className="pthumbs">
    {allebilder.map((img: string, i: number) => (
      <img
        key={i}
        src={img}
        className={`pthumb ${aktivBilde === i ? 'active' : ''}`}
        alt={`${lang === 'en' ? 'Image' : 'Bilde'} ${i + 1}`}
        onClick={() => setAktivBilde(i)}
        loading="lazy"
        decoding="async"
      />
    ))}
  </div>
</div>

        <div className="pinfo">
          <p className="ptag">FjordFur</p>
          <h1 className="ptitle">{lang === 'en' ? (konfig?.navnEn || produkt.productNameEn) : (produktNavn || produkt.productNameEn)}</h1>
          <p className="pprice">{lang === 'en' ? `NOK ${visPris}` : `kr ${visPris},–`}</p>
          <div className="pdivider" />

          {produkt.variants?.length > 1 && (() => {
            const tillatteVider = konfig?.tillatte_vider;
            const synlige = sorterVarianter(produkt.variants.filter((v: any) =>
              !(SKJUL_VARIANTER[id as string] ?? konfig?.skjul_varianter ?? []).some(s => v.variantKey?.toLowerCase().includes(s)) &&
              (!tillatteVider || tillatteVider.some(t => t.toLowerCase() === (v.vid || v.variantSku || '')?.toLowerCase()))
            ));
            const dim = hentDimensjoner(synlige);

            if (dim.harBegge && !konfig?.enkel_picker) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <p className="pvariant-label">{andreDimLabel(dim.andre, lang)}</p>
                    <div className="pvariants">
                      {dim.andre.map(a => (
                        <button key={a}
                          className={`pvariant ${valgtAnnen === a ? 'active' : ''}`}
                          onClick={() => {
                            setValgtAnnen(a);
                            const v = finnVariant(synlige, valgtFarge, a);
                            if (v) { setValgtVariant(v); gaTilVariantBilde(v); }
                          }}>
                          {oversett(a, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="pvariant-label">{lang === 'en' ? 'Color' : 'Farge'}</p>
                    <div className="pvariants">
                      {dim.farger.map(f => (
                        <button key={f}
                          className={`pvariant ${valgtFarge === f ? 'active' : ''}`}
                          onClick={() => {
                            setValgtFarge(f);
                            const v = finnVariant(synlige, f, valgtAnnen);
                            if (v) { setValgtVariant(v); gaTilVariantBilde(v); }
                          }}>
                          {oversett(f, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            const label = dim.farger.length > 0 ? (lang === 'en' ? 'Color' : 'Farge') : dim.andre.length > 0 ? andreDimLabel(dim.andre, lang) : (lang === 'en' ? 'Variant' : 'Variant');
            return (
              <div>
                <p className="pvariant-label">{label}</p>
                <div className="pvariants">
                  {synlige.map((v: any) => (
                    <button key={v.vid}
                      className={`pvariant ${valgtVariant?.vid === v.vid ? 'active' : ''}`}
                      onClick={() => { setValgtVariant(v); gaTilVariantBilde(v); }}>
                      {oversett(v.variantKey || '', lang)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <button className="padd" onClick={() => {
            if (!valgtVariant?.vid) return;
            setHandlekurv(prev => {
              const eksisterende = prev.findIndex(i => i.variantId === valgtVariant.vid);
              let neste;
              if (eksisterende !== -1) {
                neste = prev.map((i, idx) => idx === eksisterende ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
              } else {
                neste = [...prev, { id: Date.now(), name: produktNavn || produkt.productNameEn, nameEn: konfig?.navnEn || produkt.productNameEn, price: visPris, cjId: id as string, variantId: valgtVariant.vid, quantity: 1 }];
              }
              localStorage.setItem('fjordfur-cart', JSON.stringify(neste));
              return neste;
            });
            setLagtTil(true);
            setTimeout(() => setLagtTil(false), 2500);
          }}>
            {lagtTil ? (lang === 'en' ? '✓ Added to cart' : '✓ Lagt i handlekurven') : (lang === 'en' ? 'Add to cart' : 'Legg i handlekurv')}
          </button>

          <div className="pdivider" />
          {(beskrivelse || konfig?.beskrivelseEn) && (
  <p className="pdesc" style={{ lineHeight: '1.8', color: '#555' }}>
    {lang === 'en' ? (konfig?.beskrivelseEn || beskrivelse) : beskrivelse}
  </p>
)}
<div className="pdivider" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
    <span style={{ color: '#1D9E75', fontSize: '16px' }}>✓</span>
    <p className="pdesc">{lang === 'en' ? 'Free shipping over NOK 499' : 'Gratis frakt over kr 499'}</p>
  </div>
  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
    <span style={{ color: '#1D9E75', fontSize: '16px' }}>✓</span>
    <p className="pdesc">{lang === 'en' ? 'Tracked delivery to your door' : 'Sporbar levering hjem til deg'}</p>
  </div>
  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
    <span style={{ color: '#1D9E75', fontSize: '16px' }}>✓</span>
    <p className="pdesc">{lang === 'en' ? '14-day return policy' : '14 dagers angrerett'}</p>
  </div>
</div>
        </div>
      </div>

      {/* Relaterte produkter */}
      {hentRelaterte(id as string).length > 0 && (
        <div className="relaterte">
          <h2 className="relaterte-tittel">{lang === 'en' ? 'You might also like' : 'Du vil kanskje også like'}</h2>
          <div className="relaterte-grid">
            {hentRelaterte(id as string).map(r => (
              <div key={r.cjId} className="rel-card" onClick={() => window.location.assign(`/produkt/${r.cjId}?pris=${r.pris}&margin=${r.margin}`)}>
                <div className="rel-img">
                  {relBilder[r.cjId]
                    ? <img src={relBilder[r.cjId]} alt={lang === 'en' ? r.navnEn : r.navn} loading="lazy" decoding="async" />
                    : <div style={{ width: '100%', height: '100%', background: '#f4f4f0' }} />}
                </div>
                <div className="rel-body">
                  <div className="rel-name">{lang === 'en' ? r.navnEn : r.navn}</div>
                  <div className="rel-price">{lang === 'en' ? `NOK ${r.pris}` : `kr ${r.pris},–`}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky kjøpsknapp på mobil */}
      <div className="sticky-add">
        <span className="sticky-add-name">{lang === 'en' ? (konfig?.navnEn || produkt.productNameEn) : (produktNavn || produkt.productNameEn)}</span>
        <span className="sticky-add-price">{lang === 'en' ? `NOK ${visPris}` : `kr ${visPris},–`}</span>
        <button className="sticky-add-btn" onClick={() => {
          if (!valgtVariant?.vid) return;
          setHandlekurv(prev => {
            const eksisterende = prev.findIndex(i => i.variantId === valgtVariant.vid);
            let neste;
            if (eksisterende !== -1) {
              neste = prev.map((i, idx) => idx === eksisterende ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
            } else {
              neste = [...prev, { id: Date.now(), name: produktNavn || produkt.productNameEn, nameEn: konfig?.navnEn || produkt.productNameEn, price: visPris, cjId: id as string, variantId: valgtVariant.vid, quantity: 1 }];
            }
            localStorage.setItem('fjordfur-cart', JSON.stringify(neste));
            return neste;
          });
          setLagtTil(true);
          setTimeout(() => setLagtTil(false), 2500);
        }}>
          {lagtTil ? (lang === 'en' ? '✓ Added' : '✓ Lagt til') : (lang === 'en' ? 'Add to cart' : 'Legg i handlekurv')}
        </button>
      </div>

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
                      <p className="drawer-frakt-label">{lang === 'en' ? <><strong>NOK {499 - sub}</strong> more for <strong>free shipping</strong></> : <>Handle for <strong>kr {499 - sub},–</strong> til for å få <strong>gratis frakt</strong></>}</p>
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
                  <span className="drawer-item-name">{lang === 'en' ? (item.nameEn || item.name) : item.name}</span>
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
                if (handlekurv.length === 0) { alert(lang === 'en' ? 'Your cart is empty!' : 'Handlekurven er tom!'); return; }
                try {
                  const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lang, items: handlekurv.map(item => ({ name: item.name, nameEn: item.nameEn, price: item.price, quantity: item.quantity, cjId: item.cjId, variantId: item.variantId })) }),
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