import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ShoppingCart, X, Leaf, Truck, Smartphone, MessageCircle, Search } from 'lucide-react';

// ⚠️ Numéro WhatsApp qui reçoit les commandes (indicatif 225 + numéro, sans + ni espaces)
const WHATSAPP_NUMBER = '2250788348997';
// Nom de l'application de livraison (corrige-le si besoin : Yango / Yang)
const DELIVERY_APP = 'Yango';
// Lien Google Apps Script qui enregistre chaque commande dans ton Google Sheet.
// Colle ici l'adresse qui finit par /exec (laisse '' pour désactiver).
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbytw2zahrBNZmuk_yVl28RPsXDHR5EiQwhouRCLK88t7heaHLGljQrF_KwuoNzP-nI/exec';

const BRAND = 'AYD.Cosmetics';

const products = [
  { id: 1, name: "Huile d'amande douce", price: 1500, category: 'Cheveux & Cuir chevelu', emoji: '🌰', benefits: ['Hydrate le cuir chevelu', 'Aide à stimuler la repousse', 'Contribue à atténuer les cernes', 'Soin de la peau'] },
  { id: 2, name: 'Huile de fenugrec', price: 1500, category: 'Cheveux & Corps', emoji: '🌿', benefits: ['Aide à limiter la chute', 'Favorise la croissance', 'Renforce et hydrate', 'Soin de la peau'] },
  { id: 3, name: 'Huile de nila bleu', price: 2500, category: 'Anti-taches & Peau', emoji: '💙', benefits: ['Aide à unifier le teint', 'Contribue à réduire les taches', 'Aide à atténuer les cicatrices', 'Nourrit les cheveux'] },
  { id: 4, name: 'Huile Akpi', price: 2000, category: 'Corps & Peau', emoji: '🌱', benefits: ['Aide à raffermir la peau', 'Contribue à réduire les ridules', 'Améliore la texture', 'Idéale pour le massage'] },
  { id: 5, name: 'Huile de Chébé', price: 1500, category: 'Cheveux', emoji: '✨', benefits: ['Limite la casse', 'Favorise la croissance', 'Action anti-chute', 'Aide à réparer les pointes fourchues'] },
  { id: 6, name: "Huile d'Argan", price: 1500, category: 'Cheveux & Peau Premium', emoji: '👑', benefits: ['Hydratation profonde', 'Nourrit la peau', 'Soin anti-âge', 'Renforce les follicules'] },
  { id: 7, name: 'Huile de Ricin', price: 2000, category: 'Cheveux & Cils', emoji: '💧', benefits: ['Régénère et nourrit', 'Aide à prévenir la chute', 'Renforce les ongles', 'Favorise la pousse des cils & sourcils'] },
  { id: 8, name: 'Huile de Hachiche', price: 1500, category: 'Cheveux Secs', emoji: '🍃', benefits: ['Nourrit les cheveux secs', 'Renforce les follicules', 'Réduit les frisottis', 'Apporte de la brillance'] },
  { id: 9, name: 'Huile de carotte', price: 2000, category: 'Bronzage & Vitalité', emoji: '🥕', benefits: ['Facilite le bronzage', 'Hydrate la peau', 'Redonne de la vitalité', 'Éclat naturel des cheveux'] },
];

const paymentMethods = {
  orange: { name: 'Orange Money', number: '0788348997' },
  moov: { name: 'Moov Money', number: '0152105101' },
  wave: { name: 'Wave', number: '0152105101' },
};

// Paiement à la livraison (espèces) : mets false pour le désactiver
const COD_ENABLED = true;

// Zones de livraison. fee = frais en FCFA (ex : fee: 1500).
// fee: null + feeRange: '3 000 à 5 000 F' = frais variables : le client voit la fourchette
// et les frais exacts sont confirmés sur WhatsApp (ils ne sont pas ajoutés au total).
const deliveryZones = [
  { id: 'abobo', name: 'Abidjan - Abobo', fee: 1500 },
  { id: 'adjame', name: 'Abidjan - Adjamé', fee: 1500 },
  { id: 'anyama', name: 'Abidjan - Anyama', fee: 2000 },
  { id: 'attecoube', name: 'Abidjan - Attécoubé', fee: 1000 },
  { id: 'bingerville', name: 'Abidjan - Bingerville', fee: 2000 },
  { id: 'cocody', name: 'Abidjan - Cocody', fee: 2000 },
  { id: 'koumassi', name: 'Abidjan - Koumassi', fee: 2000 },
  { id: 'marcory', name: 'Abidjan - Marcory', fee: 2000 },
  { id: 'plateau', name: 'Abidjan - Plateau', fee: 1500 },
  { id: 'port-bouet', name: 'Abidjan - Port-Bouët', fee: 2500 },
  { id: 'songon', name: 'Abidjan - Songon', fee: 2500 },
  { id: 'treichville', name: 'Abidjan - Treichville', fee: 1500 },
  { id: 'yopougon', name: 'Abidjan - Yopougon', fee: 1000 },
  { id: 'autre', name: 'Autre ville (hors Abidjan)', fee: null, feeRange: '3 000 à 5 000 F' },
];

const emptyInfo = { name: '', phone: '', zone: '', address: '', paymentMethod: 'orange', reference: '' };

// Filtres : chaque produit (par son id) appartient à une ou plusieurs catégories
const filters = ['Tous', 'Cheveux', 'Peau', 'Corps'];
const productTags = {
  1: ['Cheveux', 'Peau'],
  2: ['Cheveux', 'Corps'],
  3: ['Peau', 'Cheveux'],
  4: ['Corps', 'Peau'],
  5: ['Cheveux'],
  6: ['Cheveux', 'Peau'],
  7: ['Cheveux'],
  8: ['Cheveux'],
  9: ['Peau', 'Corps'],
};

// Enlève les accents et met en minuscules (pour que "ricin" trouve "Ricin", "argan" trouve "Argan"...)
const normalize = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const css = `
  :root {
    --violet: #7c3aed;
    --violet-dark: #5b21b6;
    --night: #1a0f2e;
    --lilac: #f5effe;
    --gold: #d4af37;
    --text: #2b2140;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #faf8ff;
    color: var(--text);
  }
  h1, h2, h3, .serif { font-family: 'Playfair Display', Georgia, serif; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }

  .fade-up { animation: fadeUp 0.8s ease both; }
  .delay-1 { animation-delay: 0.15s; }
  .delay-2 { animation-delay: 0.3s; }
  .delay-3 { animation-delay: 0.45s; }

  .header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(26, 15, 46, 0.92);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(212, 175, 55, 0.25);
  }
  .header-inner { max-width: 1200px; margin: 0 auto; padding: 0.9rem 1rem; display: flex; align-items: center; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 0.9rem; text-decoration: none; }
  .logo-img { height: 56px; width: auto; display: block; }
  .hero-logo { height: 130px; width: auto; display: block; margin: 0 auto 1.2rem; }
  .logo-name { font-size: 1.5rem; font-weight: 700; color: white; letter-spacing: 0.02em; }
  .logo-name span { color: var(--gold); }
  .logo-sub { font-size: 0.65rem; color: #c9a8e0; letter-spacing: 0.18em; text-transform: uppercase; }
  .cart-btn { position: relative; background: none; border: none; color: white; cursor: pointer; padding: 0.5rem; }
  .cart-badge {
    position: absolute; top: 0; right: 0; background: var(--gold); color: var(--night);
    font-size: 0.7rem; font-weight: 700; border-radius: 50%; width: 20px; height: 20px;
    display: flex; align-items: center; justify-content: center; animation: pop 0.3s ease;
  }

  .hero {
    position: relative; overflow: hidden; color: white; text-align: center;
    padding: 5rem 1.25rem 6rem;
    background: radial-gradient(circle at 20% 20%, #7c3aed 0%, transparent 45%),
                radial-gradient(circle at 85% 80%, #a855f7 0%, transparent 40%),
                linear-gradient(135deg, #1a0f2e 0%, #3b1a78 100%);
  }
  .hero::before, .hero::after {
    content: ''; position: absolute; border-radius: 50%; background: rgba(212, 175, 55, 0.12);
    animation: float 7s ease-in-out infinite;
  }
  .hero::before { width: 220px; height: 220px; top: -60px; right: 8%; }
  .hero::after { width: 140px; height: 140px; bottom: -40px; left: 6%; animation-delay: 1.5s; }
  .hero-inner { position: relative; z-index: 1; max-width: 780px; margin: 0 auto; }
  .eyebrow { display: inline-block; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); border: 1px solid rgba(212,175,55,0.5); padding: 0.4rem 1rem; border-radius: 999px; margin-bottom: 1.5rem; }
  .hero h2 { font-size: clamp(2rem, 6vw, 3.5rem); line-height: 1.15; margin-bottom: 1.25rem; }
  .hero h2 em { color: var(--gold); font-style: italic; }
  .hero p { font-size: clamp(1rem, 2.5vw, 1.2rem); color: #e9d8fd; margin-bottom: 2rem; line-height: 1.6; }

  .btn { display: inline-block; padding: 0.85rem 1.8rem; border-radius: 999px; font-weight: 600; font-size: 1rem; border: none; cursor: pointer; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s, background 0.2s; }
  .btn:hover { transform: translateY(-2px); }
  .btn-gold { background: var(--gold); color: var(--night); box-shadow: 0 8px 24px rgba(212,175,55,0.35); }
  .btn-gold:hover { box-shadow: 0 12px 28px rgba(212,175,55,0.5); }
  .btn-violet { background: var(--violet); color: white; }
  .btn-violet:hover { background: var(--violet-dark); }
  .btn-outline { background: white; color: var(--violet); border: 2px solid var(--violet); }

  .trust { max-width: 1000px; margin: -2.5rem auto 0; padding: 0 1rem; position: relative; z-index: 2; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
  .trust-item { background: white; border-radius: 1rem; padding: 1.1rem 1.25rem; display: flex; align-items: center; gap: 0.9rem; box-shadow: 0 10px 30px rgba(59, 26, 120, 0.12); }
  .trust-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--lilac); color: var(--violet); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .trust-item strong { display: block; font-size: 0.95rem; }
  .trust-item span { font-size: 0.8rem; color: #6b6080; }

  .section { max-width: 1200px; margin: 0 auto; padding: 4rem 1rem 1rem; }
  .section-title { text-align: center; margin-bottom: 2.5rem; }
  .section-title h3 { font-size: clamp(1.7rem, 4vw, 2.4rem); color: var(--night); }
  .section-title p { color: #6b6080; margin-top: 0.5rem; }
  .divider { width: 60px; height: 3px; background: var(--gold); margin: 0.9rem auto 0; border-radius: 3px; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
  .card { background: white; border-radius: 1.25rem; overflow: hidden; box-shadow: 0 4px 16px rgba(59,26,120,0.08); transition: transform 0.3s, box-shadow 0.3s; animation: fadeUp 0.7s ease both; display: flex; flex-direction: column; }
  .card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(59,26,120,0.18); }
  .card-visual img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .card-visual { height: 200px; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; background: linear-gradient(135deg, #ede1ff, #f9f3ff); transition: transform 0.4s; }
  .card:hover .card-visual { transform: scale(1.06); }
  .card-body { padding: 1.1rem 1.25rem 1.25rem; display: flex; flex-direction: column; flex: 1; }
  .tag { align-self: flex-start; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; color: var(--violet); background: var(--lilac); padding: 0.25rem 0.7rem; border-radius: 999px; margin-bottom: 0.7rem; }
  .card h4 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.2rem; color: var(--night); margin-bottom: 0.6rem; }
  .card ul { list-style: none; font-size: 0.88rem; color: #4b4260; margin-bottom: 1.1rem; flex: 1; }
  .card li { margin-bottom: 0.3rem; padding-left: 1.2rem; position: relative; }
  .card li::before { content: '✓'; position: absolute; left: 0; color: var(--violet); font-weight: 700; }
  .card-foot { display: flex; align-items: center; justify-content: space-between; }
  .price { font-size: 1.4rem; font-weight: 700; color: var(--violet); }

  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
  .step { text-align: center; padding: 1.5rem 1rem; }
  .step-num { width: 52px; height: 52px; margin: 0 auto 1rem; border-radius: 50%; background: var(--night); color: var(--gold); font-family: 'Playfair Display', serif; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; }
  .step h4 { margin-bottom: 0.4rem; color: var(--night); }
  .step p { font-size: 0.9rem; color: #6b6080; line-height: 1.5; }

  .cta { margin: 4rem auto 0; max-width: 1000px; padding: 0 1rem; }
  .cta-box { background: linear-gradient(135deg, #1a0f2e, #4c1d95); color: white; border-radius: 1.5rem; padding: 3rem 1.5rem; text-align: center; }
  .cta-box h3 { font-size: clamp(1.5rem, 4vw, 2.1rem); margin-bottom: 0.8rem; }
  .cta-box p { color: #e9d8fd; margin-bottom: 1.5rem; }

  .footer { margin-top: 4rem; background: var(--night); color: #c9a8e0; text-align: center; padding: 2.5rem 1rem; }
  .footer .logo-name { display: block; margin-bottom: 0.4rem; }
  .footer p { font-size: 0.85rem; margin-top: 0.4rem; }

  .overlay { position: fixed; inset: 0; background: rgba(26,15,46,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 60; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: white; border-radius: 1.25rem; max-width: 460px; width: 100%; padding: 1.5rem; max-height: 90vh; overflow-y: auto; animation: fadeUp 0.3s ease; }
  .modal h3 { font-size: 1.5rem; color: var(--night); }
  .input { width: 100%; padding: 0.7rem 1rem; border: 1px solid #d9d0ea; border-radius: 0.7rem; font-size: 1rem; font-family: inherit; }
  .input:focus { outline: 2px solid var(--violet); border-color: transparent; }
  .qty-btn { padding: 0.25rem 0.75rem; background: var(--lilac); color: var(--violet); border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 700; }
  .pay-box { background: var(--lilac); padding: 0.9rem; border-radius: 0.8rem; }

  .toolbar { max-width: 640px; margin: 0 auto 2rem; display: flex; flex-direction: column; gap: 1rem; }
  .search { position: relative; }
  .search svg { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #8b7fa3; }
  .search input { width: 100%; padding: 0.85rem 1rem 0.85rem 2.8rem; border: 1px solid #d9d0ea; border-radius: 999px; font-size: 1rem; font-family: inherit; background: white; }
  .search input:focus { outline: 2px solid var(--violet); border-color: transparent; }
  .chips { display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center; }
  .chip { padding: 0.5rem 1.2rem; border-radius: 999px; border: 1.5px solid #d9d0ea; background: white; color: var(--text); font-weight: 600; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.2s; }
  .chip:hover { border-color: var(--violet); color: var(--violet); }
  .chip.active { background: var(--violet); border-color: var(--violet); color: white; }
  .empty { text-align: center; color: #6b6080; padding: 3rem 1rem; }
  .empty button { margin-top: 1rem; }

  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); } 70% { box-shadow: 0 0 0 16px rgba(37,211,102,0); } 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); } }
  .wa-float { position: fixed; right: 1rem; bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); z-index: 40; width: 58px; height: 58px; border-radius: 50%; background: #25D366; color: white; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 8px 24px rgba(37,211,102,0.45); animation: pulse 2.5s infinite; transition: transform 0.2s; }
  .wa-float:hover { transform: scale(1.08); }

  @media (max-width: 600px) {
    .logo-sub { display: none; }
    .logo-img { height: 48px; }
    .hero-logo { height: 100px; }
    .hero { padding: 3.5rem 1rem 5rem; }
    .section { padding-top: 3rem; }
  }
`;

// Photo du produit : /public/produits/1.jpg, 2.jpg... (jpg, jpeg, png ou webp). Sans photo, l'emoji s'affiche.
const photoExtensions = ['jpg', 'jpeg', 'png', 'webp'];

function ProductImage({ product }) {
  const [extIndex, setExtIndex] = useState(0);
  if (extIndex >= photoExtensions.length) return <span>{product.emoji}</span>;
  return (
    <img
      src={`/produits/${product.id}.${photoExtensions[extIndex]}`}
      alt={product.name}
      loading="lazy"
      onError={() => setExtIndex(extIndex + 1)}
    />
  );
}

export default function Home() {
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(emptyInfo);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');

  const filtered = products.filter((p) => {
    const matchFilter = activeFilter === 'Tous' || productTags[p.id].includes(activeFilter);
    const text = normalize([p.name, p.category, ...p.benefits].join(' '));
    const matchSearch = text.includes(normalize(searchTerm.trim()));
    return matchFilter && matchSearch;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ayd-cart');
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem('ayd-cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart, loaded]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) removeFromCart(id);
    else setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const zone = deliveryZones.find((z) => z.id === customerInfo.zone);
  const deliveryFee = zone && typeof zone.fee === 'number' ? zone.fee : null;
  const isCod = customerInfo.paymentMethod === 'cod';
  const selectedPay = isCod ? null : paymentMethods[customerInfo.paymentMethod];
  const amountNow = cartTotal + (deliveryFee || 0);

  const formatF = (n) => `${n.toLocaleString('fr-FR')} F`;
  const feeText = !zone
    ? 'selon votre zone'
    : deliveryFee !== null
    ? formatF(deliveryFee)
    : zone.feeRange
    ? `${zone.feeRange} (confirmé sur WhatsApp)`
    : 'frais communiqués sur WhatsApp';

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.zone || !customerInfo.address.trim()) {
      alert("Veuillez remplir le nom, le téléphone, la commune et l'adresse.");
      return;
    }
    if (customerInfo.phone.replace(/\D/g, '').length < 8) {
      alert('Votre numéro de téléphone semble incomplet.');
      return;
    }

    const orderId = 'AYD-' + Date.now().toString(36).toUpperCase().slice(-6);

    const lines = cart.map((i) => `• ${i.name} x${i.quantity} = ${formatF(i.price * i.quantity)}`);

    const message = [
      `🛍️ *Nouvelle commande ${BRAND}* (n° ${orderId})`,
      '',
      ...lines,
      '',
      `🧾 Sous-total : ${formatF(cartTotal)}`,
      `🚚 Livraison (${zone.name}) : ${deliveryFee !== null ? formatF(deliveryFee) : zone.feeRange ? 'à confirmer (' + zone.feeRange + ')' : 'à confirmer, selon le tarif ' + DELIVERY_APP}`,
      `💰 *Total : ${formatF(amountNow)}*${deliveryFee === null ? ' + frais de livraison' : ''}`,
      '',
      isCod
        ? '💳 Paiement : à la livraison (espèces)'
        : `💳 Paiement : ${selectedPay.name} (${selectedPay.number})`,
      ...(isCod
        ? []
        : [`🔖 Référence de transaction : ${customerInfo.reference.trim() || "non indiquée (capture d'écran à envoyer dans cette conversation)"}`]),
      '',
      `👤 Nom : ${customerInfo.name}`,
      `📞 Téléphone : ${customerInfo.phone}`,
      `📍 Adresse : ${customerInfo.address}`,
      `🚚 Livraison via app ${DELIVERY_APP}`,
    ].join('\n');

    // Enregistrement dans Google Sheet (sans bloquer l'envoi sur WhatsApp en cas de problème)
    if (SHEET_URL) {
      try {
        fetch(SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            orderId,
            name: customerInfo.name,
            phone: customerInfo.phone,
            zone: zone.name,
            address: customerInfo.address,
            items: cart.map((i) => `${i.name} x${i.quantity}`).join(', '),
            subtotal: cartTotal,
            deliveryFee: deliveryFee !== null ? deliveryFee : zone.feeRange || 'à confirmer',
            total: amountNow,
            payment: isCod ? 'À la livraison' : selectedPay.name,
            reference: customerInfo.reference.trim(),
          }),
        }).catch(() => {});
      } catch (err) {}
    }

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    setCustomerInfo(emptyInfo);
  };

  return (
    <>
      <Head>
        <title>{BRAND} | Soins capillaires et de la peau naturels</title>
        <meta name="description" content={`${BRAND}, spécialisé dans les soins capillaires et de la peau. Huiles pures et naturelles pour vos cheveux et votre peau.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />
      </Head>

      <style>{css}</style>

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <a className="logo" href="#top" aria-label="AYD.Cosmetics, accueil">
            <img className="logo-img" src="/logo-light.png" alt="AYD.Cosmetics" />
            <span className="logo-sub">Aydan Cosmetics Soins capillaires &amp; soins de la peau</span>
          </a>
          <button className="cart-btn" onClick={() => setShowCart(true)} aria-label="Ouvrir le panier">
            <ShoppingCart size={26} />
            {cartCount > 0 && <span className="cart-badge" key={cartCount}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" id="top">
        <div className="hero-inner">
          <img className="hero-logo fade-up" src="/logo-light.png" alt="AYD.Cosmetics" />
          <span className="eyebrow fade-up">100% naturel</span>
          <h2 className="fade-up delay-1">
            Sublimez vos cheveux et votre peau, <em>naturellement</em>
          </h2>
          <p className="fade-up delay-2">
            {BRAND} vous propose des huiles pures et naturelles, spécialisées dans les soins capillaires et de la peau.
          </p>
          <a href="#produits" className="btn btn-gold fade-up delay-3">Découvrir nos huiles</a>
        </div>
      </section>

      {/* Réassurance */}
      <div className="trust">
        <div className="trust-item">
          <div className="trust-icon"><Leaf size={22} /></div>
          <div><strong>Pur &amp; naturel</strong><span>Huiles sélectionnées avec soin</span></div>
        </div>
        <div className="trust-item">
          <div className="trust-icon"><Smartphone size={22} /></div>
          <div><strong>Paiement Mobile Money &amp; en espèces</strong><span>Orange, Moov et Wave</span></div>
        </div>
        <div className="trust-item">
          <div className="trust-icon"><Truck size={22} /></div>
          <div><strong>Livraison nationale</strong><span>Partout en Côte d'Ivoire</span></div>
        </div>
      </div>

      {/* Produits */}
      <main className="section" id="produits">
        <div className="section-title">
          <h3>Nos Huiles</h3>
          <div className="divider" />
          <p>Chaque huile répond à un besoin précis pour vos cheveux et votre peau, cliquez sur le Bouton WhatsApp si vous avez des préoccupations.</p>
        </div>
        <div className="toolbar">
          <div className="search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Rechercher une huile (ricin, argan, chute...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="chips">
            {filters.map((f) => (
              <button key={f} className={`chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid">
          {filtered.map((product, index) => (
            <div key={product.id} className="card" style={{ animationDelay: `${(index % 6) * 0.08}s` }}>
              <div className="card-visual">
                <ProductImage product={product} />
              </div>
              <div className="card-body">
                <span className="tag">{product.category}</span>
                <h4>{product.name}</h4>
                <ul>
                  {product.benefits.slice(0, 3).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <div className="card-foot">
                  <span className="price">{product.price.toLocaleString('fr-FR')} F</span>
                  <button className="btn btn-violet" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }} onClick={() => addToCart(product)}>
                    + Panier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty">
            <p>Aucune huile ne correspond à votre recherche.</p>
            <button className="btn btn-violet" onClick={() => { setSearchTerm(''); setActiveFilter('Tous'); }}>
              Voir tous les produits
            </button>
          </div>
        )}
      </main>

      {/* Comment commander */}
      <section className="section">
        <div className="section-title">
          <h3>Comment commander ?</h3>
          <div className="divider" />
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h4>Choisissez</h4>
            <p>Ajoutez vos huiles préférées au panier.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h4>Envoyez votre commande</h4>
            <p>Remplissez vos infos : votre commande s'envoie par WhatsApp.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h4>Payez &amp; recevez</h4>
            <p>Payez par Mobile Money, nous confirmons puis vous êtes livré, ou payez en espèces avec le livreur.</p>
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="cta">
        <div className="cta-box">
          <h3 className="serif">Une question sur nos soins ?</h3>
          <p>Écrivez-nous sur WhatsApp, nous vous conseillons le produit adaptée à votre besoin.</p>
          <a className="btn btn-gold" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
            <MessageCircle size={18} style={{ verticalAlign: '-3px', marginRight: '0.5rem' }} />
            Discuter sur WhatsApp
          </a>
        </div>
      </section>

      {/* Bouton WhatsApp flottant */}
      <a
        className="wa-float"
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour ${BRAND}, j'ai une question.`)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Discuter sur WhatsApp"
      >
        <MessageCircle size={28} />
      </a>

      {/* Panier */}
      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Votre Panier</h3>
              <button onClick={() => setShowCart(false)} aria-label="Fermer" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <p style={{ color: '#6b6080', textAlign: 'center', padding: '2rem 0' }}>Votre panier est vide</p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ borderBottom: '1px solid #eee6fb', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a0f2e' }}>{item.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span style={{ padding: '0 0.5rem' }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString('fr-FR')} F</span>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1rem', color: '#7c3aed' }}>
                  <span>Total :</span>
                  <span>{cartTotal.toLocaleString('fr-FR')} F</span>
                </div>
                <button className="btn btn-violet" style={{ width: '100%' }} onClick={() => { setShowCart(false); setShowCheckout(true); }}>
                  Passer la commande
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout */}
      {showCheckout && (
        <div className="overlay">
          <div className="modal">
            <h3 style={{ marginBottom: '1rem' }}>Finaliser la commande</h3>

            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input className="input" type="text" placeholder="Nom complet" value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
              <input className="input" type="tel" placeholder="Téléphone (WhatsApp de préférence)" value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />

              <select className="input" value={customerInfo.zone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, zone: e.target.value })}>
                <option value="">Commune / ville de livraison</option>
                {deliveryZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}{typeof z.fee === 'number' ? ` - ${formatF(z.fee)}` : z.feeRange ? ` - ${z.feeRange}` : ''}
                  </option>
                ))}
              </select>

              <textarea className="input" placeholder="Quartier, repère, précisions (ex : près de la pharmacie...)" rows="3" value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} />

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1a0f2e' }}>Mode de paiement</label>
                <select className="input" value={customerInfo.paymentMethod}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, paymentMethod: e.target.value })}>
                  {Object.entries(paymentMethods).map(([key, m]) => (
                    <option key={key} value={key}>{m.name}</option>
                  ))}
                  {COD_ENABLED && <option value="cod">Paiement à la livraison (espèces)</option>}
                </select>
              </div>

              <div className="pay-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Sous-total</span><span>{formatF(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                  <span>Livraison</span><span style={{ textAlign: 'right' }}>{feeText}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', color: '#7c3aed', marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid #d9c8f5' }}>
                  <span>Total</span><span>{formatF(amountNow)}{deliveryFee === null && zone ? ' +' : ''}</span>
                </div>

                {isCod ? (
                  <p style={{ fontSize: '0.85rem', color: '#1a0f2e', marginTop: '0.8rem' }}>
                    Vous payez <strong>en espèces à la réception</strong>. Nous vous contactons sur WhatsApp pour confirmer la commande avant l'envoi.
                  </p>
                ) : (
                  <>
                    <p style={{ fontSize: '0.85rem', color: '#1a0f2e', marginTop: '0.8rem' }}>
                      1. Envoyez <strong>{formatF(amountNow)}</strong> par <strong>{selectedPay.name}</strong> au <strong>{selectedPay.number}</strong>.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#1a0f2e', marginTop: '0.4rem' }}>
                      2. Indiquez ci-dessous la référence de la transaction (reçue par SMS) :
                    </p>
                    <input className="input" style={{ marginTop: '0.5rem' }} type="text" placeholder="Référence de transaction"
                      value={customerInfo.reference}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, reference: e.target.value })} />
                    <p style={{ fontSize: '0.75rem', color: '#6b6080', marginTop: '0.5rem' }}>
                      Vous pouvez aussi joindre la capture d'écran du paiement dans la conversation WhatsApp.
                    </p>
                  </>
                )}
                <p style={{ fontSize: '0.75rem', color: '#6b6080', marginTop: '0.6rem' }}>
                  En cliquant sur « Envoyer ma commande », WhatsApp s'ouvre avec votre commande : envoyez-la pour la valider.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.7rem 0.5rem' }} onClick={() => setShowCheckout(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-violet" style={{ flex: 1, padding: '0.7rem 0.5rem' }}>
                  Envoyer ma commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <img src="/logo-light.png" alt="AYD.Cosmetics" style={{ height: '90px', width: 'auto', display: 'block', margin: '0 auto 0.8rem' }} />
        <p>Soins capillaires &amp; soins de la peau par Aydan • COTE D'IVOIRE, Abidjan</p>
        <p>aydancosmetics444@gmail.com • 0152105101</p>
        <p>© {new Date().getFullYear()} {BRAND}. Tous droits réservés.</p>
      </footer>
    </>
  );
}