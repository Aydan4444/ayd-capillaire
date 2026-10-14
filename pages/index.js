import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ShoppingCart, X } from 'lucide-react';

// ⚠️ Remplace par ton numéro WhatsApp (indicatif 225 + numéro, sans + ni espaces)
const WHATSAPP_NUMBER = '2250152105101';

const products = [
  { id: 1, name: "Huile d'amande douce", price: 2000, category: 'Cheveux & Cuir chevelu', benefits: ['Hydrate le cuir chevelu', 'Aide à stimuler la repousse', 'Contribue à atténuer les cernes', 'Soin de la peau'] },
  { id: 2, name: 'Huile de fenugrec', price: 2000, category: 'Cheveux & Corps', benefits: ['Aide à limiter la chute', 'Favorise la croissance', 'Renforce et hydrate', 'Soin de la peau'] },
  { id: 3, name: 'Huile de nila bleu', price: 2000, category: 'Anti-taches & Peau', benefits: ['Aide à unifier le teint', 'Contribue à réduire les taches', 'Aide à atténuer les cicatrices', 'Nourrit les cheveux'] },
  { id: 4, name: 'Huile Akpi', price: 2000, category: 'Corps & Peau', benefits: ['Aide à raffermir la peau', 'Contribue à réduire les ridules', 'Améliore la texture', 'Idéale pour le massage'] },
  { id: 5, name: 'Huile de Chébé', price: 2000, category: 'Cheveux', benefits: ['Limite la casse', 'Favorise la croissance', 'Action anti-chute', 'Aide à réparer les pointes fourchues'] },
  { id: 6, name: "Huile d'Argan", price: 2000, category: 'Cheveux & Peau Premium', benefits: ['Hydratation profonde', 'Nourrit la peau', 'Soin anti-âge', 'Renforce les follicules'] },
  { id: 7, name: 'Huile de Ricin', price: 2000, category: 'Cheveux & Cils', benefits: ['Régénère et nourrit', 'Aide à prévenir la chute', 'Renforce les ongles', 'Favorise la pousse des cils & sourcils'] },
  { id: 8, name: 'Huile de Hachiche', price: 2000, category: 'Cheveux Secs', benefits: ['Nourrit les cheveux secs', 'Renforce les follicules', 'Réduit les frisottis', 'Apporte de la brillance'] },
  { id: 9, name: 'Huile de carotte', price: 2000, category: 'Bronzage & Vitalité', benefits: ['Facilite le bronzage', 'Hydrate la peau', 'Redonne de la vitalité', 'Éclat naturel des cheveux'] },
];

const paymentMethods = {
  orange: { name: 'Orange Money', number: '0788348997' },
  moov: { name: 'Moov Money', number: '0152105101' },
  wave: { name: 'Wave', number: '0152105101' }, // vérifie que ce numéro est bien le même que Moov
};

const emptyInfo = { name: '', phone: '', address: '', paymentMethod: 'orange' };

const inputStyle = {
  width: '100%',
  padding: '0.6rem 1rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  fontSize: '1rem',
};

const primaryBtn = {
  padding: '0.6rem 1rem',
  borderRadius: '0.5rem',
  backgroundColor: '#7c3aed',
  color: 'white',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  zIndex: 60,
};

const modalStyle = {
  backgroundColor: 'white',
  borderRadius: '0.75rem',
  maxWidth: '448px',
  width: '100%',
  padding: '1.5rem',
  maxHeight: '90vh',
  overflowY: 'auto',
};

export default function Home() {
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(emptyInfo);

  // Charger le panier sauvegardé
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ayd-cart');
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {}
    setLoaded(true);
  }, []);

  // Sauvegarder le panier à chaque changement
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem('ayd-cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart, loaded]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
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

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      alert('Veuillez remplir le nom, le téléphone et l\'adresse.');
      return;
    }

    const pay = paymentMethods[customerInfo.paymentMethod];
    const lines = cart.map((i) => `• ${i.name} x${i.quantity} = ${(i.price * i.quantity).toLocaleString('fr-FR')} F`);

    const message = [
      '🛍️ *Nouvelle commande AYD Capillaire*',
      '',
      ...lines,
      '',
      `💰 *Total : ${cartTotal.toLocaleString('fr-FR')} F* (hors livraison)`,
      `💳 Paiement : ${pay.name} (${pay.number})`,
      '',
      `👤 Nom : ${customerInfo.name}`,
      `📞 Téléphone : ${customerInfo.phone}`,
      `📍 Adresse : ${customerInfo.address}`,
      '🚚 Livraison via app Yango',
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    setCustomerInfo(emptyInfo);
  };

  const selectedPay = paymentMethods[customerInfo.paymentMethod];

  return (
    <>
      <Head>
        <title>AYD Capillaire - Huiles Naturelles</title>
        <meta name="description" content="AYD Capillaire - Huiles pures et naturelles pour vos cheveux" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background-color: #f5f5f5;
        }
        .btn-primary:hover { background-color: #6d28d9 !important; }
      `}</style>

      {/* Header */}
      <header style={{ backgroundColor: '#2d1b4e', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '2rem' }}>✨</div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>AYD</h1>
              <p style={{ fontSize: '0.75rem', color: '#c9a8e0' }}>Capillaire Naturel</p>
            </div>
          </div>

          <button
            onClick={() => setShowCart(true)}
            aria-label="Ouvrir le panier"
            style={{ position: 'relative', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
          >
            <ShoppingCart size={26} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', color: 'white',
                fontSize: '0.75rem', borderRadius: '50%', width: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ backgroundColor: '#7c3aed', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Beauté Naturelle</h2>
          <p style={{ fontSize: '1.25rem', color: '#f3e8ff' }}>Huiles pures et naturelles pour vos cheveux et votre peau</p>
        </div>
      </section>

      {/* Produits */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#2d1b4e' }}>Nos Produits</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {products.map((product) => (
            <div key={product.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              {/* Remplace ce bloc par <img src="/produits/..." /> avec tes vraies photos */}
              <div style={{ height: '128px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', backgroundColor: '#f3e8ff' }}>
                💜
              </div>
              <div style={{ padding: '1rem' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem', color: '#2d1b4e' }}>{product.name}</h4>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.75rem' }}>{product.category}</p>
                <ul style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '1rem', listStyle: 'none' }}>
                  {product.benefits.slice(0, 2).map((b, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>• {b}</li>
                  ))}
                </ul>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                    {product.price.toLocaleString('fr-FR')} F
                  </span>
                  <button className="btn-primary" onClick={() => addToCart(product)} style={{ ...primaryBtn, fontSize: '0.875rem' }}>
                    + Panier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Panier (plein écran, adapté au téléphone) */}
      {showCart && (
        <div style={overlayStyle} onClick={() => setShowCart(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 'bold', color: '#2d1b4e' }}>Votre Panier</h3>
              <button onClick={() => setShowCart(false)} aria-label="Fermer" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>Panier vide</p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#2d1b4e' }}>{item.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '0.25rem 0.7rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>−</button>
                        <span style={{ padding: '0 0.5rem' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.25rem 0.7rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>+</button>
                        <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
                          {(item.price * item.quantity).toLocaleString('fr-FR')} F
                        </span>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem', color: '#7c3aed' }}>
                  <span>Total :</span>
                  <span>{cartTotal.toLocaleString('fr-FR')} F</span>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  style={{ ...primaryBtn, width: '100%', padding: '0.75rem' }}
                >
                  Passer la commande
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout */}
      {showCheckout && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2d1b4e' }}>Finaliser la commande</h3>

            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nom complet" value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} style={inputStyle} />

              <input type="tel" placeholder="Téléphone" value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} style={inputStyle} />

              <textarea placeholder="Adresse de livraison" rows="3" value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} style={inputStyle} />

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#2d1b4e' }}>Mode de paiement</label>
                <select value={customerInfo.paymentMethod}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, paymentMethod: e.target.value })} style={inputStyle}>
                  {Object.entries(paymentMethods).map(([key, m]) => (
                    <option key={key} value={key}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ backgroundColor: '#f3e8ff', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2d1b4e' }}>Montant à payer :</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>{cartTotal.toLocaleString('fr-FR')} F</p>
                <p style={{ fontSize: '0.85rem', color: '#2d1b4e', marginTop: '0.5rem' }}>
                  Envoyez ce montant par <strong>{selectedPay.name}</strong> au <strong>{selectedPay.number}</strong>.
                </p>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  En cliquant sur « Envoyer ma commande », WhatsApp s'ouvre avec votre commande. Envoyez-la et nous confirmons dès réception du paiement. Livraison via app Yango (frais selon tarif Yango).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowCheckout(false)}
                  style={{ ...primaryBtn, flex: 1, backgroundColor: 'white', color: '#7c3aed', border: '2px solid #7c3aed' }}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" style={{ ...primaryBtn, flex: 1 }}>
                  Envoyer ma commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '3rem', padding: '2rem 1rem', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#666' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>AYD Capillaire</p>
        <p style={{ fontSize: '0.875rem' }}>Huiles naturelles pour la beauté • Livraison nationale</p>
        <p style={{ fontSize: '0.75rem', marginTop: '1rem' }}>© {new Date().getFullYear()} AYD Capillaire. Tous droits réservés.</p>
      </footer>
    </>
  );
}
