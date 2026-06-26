import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const img = (name) => `/src/assets/${name}`;
const today = new Date().toISOString().slice(0, 10);
const addDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const uid = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

const adminAccount = { username: 'admin', password: '12345' };
const demoCustomer = { id: 'CU-001', name: 'Sudha Priya', phone: '+91 98765 43210', email: 'sudha@example.com', address: 'Chennai, Tamil Nadu', username: 'user', password: '12345', tier: 'Gold' };
const paySeed = { mode: 'UPI', upi: 'sudha@upi', cardName: 'Sudha Priya', cardNumber: '4111 1111 1111 1111', expiry: '12/29', cvv: '123' };

const seedRooms = [
  { id: 1, name: 'Deluxe King Room', type: 'Deluxe', price: 3200, capacity: 2, status: 'Available', floor: '2nd Floor', image: img('single-room-img01.png'), facilities: ['King Bed', 'Breakfast', 'Wi-Fi', 'AC'] },
  { id: 2, name: 'Premium Family Suite', type: 'Suite', price: 5600, capacity: 4, status: 'Available', floor: '4th Floor', image: img('single-room-img02.png'), facilities: ['2 Beds', 'Balcony', 'Mini Bar', 'Pool'] },
  { id: 3, name: 'Executive Sea View', type: 'Executive', price: 4600, capacity: 3, status: 'Available', floor: '5th Floor', image: img('single-room-img03.png'), facilities: ['Sea View', 'Work Desk', 'Laundry', 'Dining'] },
  { id: 4, name: 'Royal Business Studio', type: 'Business', price: 6200, capacity: 2, status: 'Maintenance', floor: '6th Floor', image: img('feature.png'), facilities: ['Meeting Desk', 'Coffee', 'Smart TV', 'Airport Pickup'] },
];
const foodMenu = [
  { id: 1, name: 'South Indian Breakfast', price: 220, category: 'Food', eta: '20 mins' },
  { id: 2, name: 'Royal Veg Meals', price: 340, category: 'Food', eta: '30 mins' },
  { id: 3, name: 'Chicken Biryani Combo', price: 420, category: 'Food', eta: '35 mins' },
  { id: 4, name: 'Fresh Juice & Dessert', price: 180, category: 'Food', eta: '15 mins' },
];
const serviceMenu = [
  { id: 11, name: 'Spa Therapy', price: 1200, category: 'Spa', eta: '60 mins' },
  { id: 12, name: 'Laundry Pickup', price: 250, category: 'Laundry', eta: '45 mins' },
  { id: 13, name: 'Airport Cab', price: 900, category: 'Travel', eta: '30 mins' },
  { id: 14, name: 'Room Decoration', price: 1500, category: 'Event', eta: '90 mins' },
  { id: 15, name: 'Housekeeping', price: 0, category: 'Housekeeping', eta: '15 mins' },
  { id: 16, name: 'Doctor Assistance', price: 0, category: 'Support', eta: '10 mins' },
];
const seedBookings = [{ id: 'BK-1001', invoiceNo: 'INV-1001', customer: demoCustomer, roomId: 1, roomName: 'Deluxe King Room', roomType: 'Deluxe', checkIn: today, checkOut: addDays(1), guests: 1, nights: 1, amount: 3200, payment: 'UPI', paid: true, status: 'Confirmed', request: 'Early check-in', createdAt: new Date().toLocaleString() }];
const seedOrders = [
  { id: 'OR-501', customer: demoCustomer, category: 'Food', item: 'South Indian Breakfast', qty: 2, amount: 440, note: 'Less spicy', status: 'Preparing', staff: 'Kitchen Team', createdAt: new Date().toLocaleString() },
  { id: 'SR-701', customer: demoCustomer, category: 'Spa', item: 'Spa Therapy', qty: 1, amount: 1200, note: 'Evening slot', status: 'Requested', staff: 'Not assigned', createdAt: new Date().toLocaleString() },
];
const seedTickets = [{ id: 'TK-2001', customer: demoCustomer, subject: 'Need extra towel', priority: 'Medium', status: 'Open', createdAt: new Date().toLocaleString() }];

function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function persist(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function money(n) { return `₹${Number(n || 0).toLocaleString('en-IN')}`; }

function App() {
  const [screen, setScreen] = useState('portal');
  const [role, setRole] = useState('user');
  const [auth, setAuth] = useState(null);
  const [active, setActive] = useState('dashboard');
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [login, setLogin] = useState({ username: '', password: '' });
  const [register, setRegister] = useState({ name: '', phone: '', email: '', address: '', username: '', password: '' });
  const [customers, setCustomers] = useState(() => load('rs_customers_full', [demoCustomer]));
  const [rooms, setRooms] = useState(() => load('rs_rooms_full', seedRooms));
  const [bookings, setBookings] = useState(() => load('rs_bookings_full', seedBookings));
  const [orders, setOrders] = useState(() => load('rs_orders_full', seedOrders));
  const [tickets, setTickets] = useState(() => load('rs_tickets_full', seedTickets));
  const [booking, setBooking] = useState({ ...demoCustomer, ...paySeed, roomId: 1, checkIn: today, checkOut: addDays(1), guests: 1, request: 'Near lift room preferred.' });
  const [errors, setErrors] = useState({});
  const [roomDraft, setRoomDraft] = useState({ name: '', type: 'Deluxe', price: '', capacity: 2, floor: '', status: 'Available', facilities: 'Wi-Fi, AC, Breakfast', image: img('single-room-img01.png') });
  const [support, setSupport] = useState({ subject: '', priority: 'Medium' });

  const currentCustomer = auth?.role === 'user' ? auth.customer : demoCustomer;
  const selectedRoom = rooms.find((r) => r.id === Number(booking.roomId)) || rooms[0];
  const nights = Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000) || 1);
  const bookingTotal = selectedRoom ? selectedRoom.price * nights : 0;
  const userBookings = bookings.filter((b) => b.customer.email === currentCustomer?.email);
  const userOrders = orders.filter((o) => o.customer.email === currentCustomer?.email);
  const userTickets = tickets.filter((t) => t.customer.email === currentCustomer?.email);
  const revenue = bookings.reduce((s, b) => s + Number(b.amount || 0), 0) + orders.reduce((s, o) => s + Number(o.amount || 0), 0);
  const latestBooking = userBookings[0];

  const show = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); };
  const choosePanel = (nextRole) => { setRole(nextRole); setScreen('login'); setLogin(nextRole === 'admin' ? adminAccount : { username: 'user', password: '12345' }); };
  const logout = () => { setAuth(null); setScreen('portal'); setActive('dashboard'); setLogin({ username: '', password: '' }); };
  const saveCustomers = (next) => { setCustomers(next); persist('rs_customers_full', next); };
  const saveRooms = (next) => { setRooms(next); persist('rs_rooms_full', next); };
  const saveBookings = (next) => { setBookings(next); persist('rs_bookings_full', next); };
  const saveOrders = (next) => { setOrders(next); persist('rs_orders_full', next); };
  const saveTickets = (next) => { setTickets(next); persist('rs_tickets_full', next); };

  function doLogin(e) {
    e.preventDefault();
    if (role === 'admin' && login.username === adminAccount.username && login.password === adminAccount.password) { setAuth({ role: 'admin', name: 'RoyalStay Admin' }); setActive('dashboard'); show('Admin login success'); return; }
    const found = customers.find((c) => [c.username, c.email].includes(login.username));
    if (role === 'user' && found && found.password === login.password) { setAuth({ role: 'user', name: found.name, customer: found }); setBooking((p) => ({ ...p, ...found, ...paySeed })); setActive('dashboard'); show('Customer login success'); return; }
    show('Invalid login. Register or use auto-filled demo login.');
  }
  function doRegister(e) {
    e.preventDefault();
    if (register.name.trim().length < 3 || !register.email.includes('@') || register.password.length < 4) { show('Register validation failed'); return; }
    const customer = { ...register, id: uid('CU'), tier: 'Silver' };
    const next = [customer, ...customers]; saveCustomers(next); setRole('user'); setScreen('login'); setLogin({ username: customer.email, password: customer.password }); show('Registered. Login details filled.');
  }
  function validateBooking() {
    const e = {};
    if (booking.name.trim().length < 3) e.name = 'Minimum 3 letters required';
    if (!/^\+?\d[\d\s-]{8,}$/.test(booking.phone)) e.phone = 'Valid phone number required';
    if (!booking.email.includes('@')) e.email = 'Valid email required';
    if (!selectedRoom || selectedRoom.status !== 'Available') e.roomId = 'Select available room only';
    if (new Date(booking.checkOut) <= new Date(booking.checkIn)) e.checkOut = 'Check-out must be after check-in';
    if (Number(booking.guests) > selectedRoom.capacity) e.guests = `Max ${selectedRoom.capacity} guests only`;
    if (booking.mode === 'UPI' && !booking.upi.includes('@')) e.upi = 'Valid UPI ID required';
    if (booking.mode === 'Card' && booking.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = '16 digit card number required';
    setErrors(e); return Object.keys(e).length === 0;
  }
  function submitBooking(e) {
    e.preventDefault();
    if (!validateBooking()) { show('Fix booking validation'); return; }
    const customer = { id: currentCustomer.id, name: booking.name, phone: booking.phone, email: booking.email, address: booking.address, tier: currentCustomer.tier || 'Silver' };
    const id = uid('BK');
    const record = { id, invoiceNo: uid('INV'), customer, roomId: selectedRoom.id, roomName: selectedRoom.name, roomType: selectedRoom.type, checkIn: booking.checkIn, checkOut: booking.checkOut, guests: booking.guests, nights, amount: bookingTotal, payment: booking.mode, paid: booking.mode !== 'Cash', request: booking.request, status: 'Confirmed', createdAt: new Date().toLocaleString() };
    saveBookings([record, ...bookings]);
    saveRooms(rooms.map((r) => r.id === selectedRoom.id ? { ...r, status: 'Booked' } : r));
    setActive('invoice'); show('Booking confirmed. Invoice generated.');
  }
  function cancelBooking(id) { saveBookings(bookings.map((b) => b.id === id ? { ...b, status: 'Cancelled' } : b)); show('Booking cancelled'); }
  function placeOrder(item, qty = 1, note = 'Guest request') {
    const prefix = item.category === 'Food' ? 'OR' : 'SR';
    const order = { id: uid(prefix), customer: currentCustomer, category: item.category, item: item.name, qty, amount: item.price * qty, note, status: 'Requested', staff: 'Not assigned', eta: item.eta, createdAt: new Date().toLocaleString() };
    saveOrders([order, ...orders]); show(`${item.name} sent to admin`);
  }
  function updateOrder(id, patch) { saveOrders(orders.map((o) => o.id === id ? { ...o, ...patch } : o)); show('Request updated'); }
  function updateBooking(id, patch) { saveBookings(bookings.map((b) => b.id === id ? { ...b, ...patch } : b)); show('Booking updated'); }
  function addRoom(e) {
    e.preventDefault();
    if (!roomDraft.name || !roomDraft.price) { show('Room name and price required'); return; }
    const room = { ...roomDraft, id: Date.now(), price: Number(roomDraft.price), capacity: Number(roomDraft.capacity), facilities: roomDraft.facilities.split(',').map((x) => x.trim()).filter(Boolean) };
    saveRooms([room, ...rooms]); setRoomDraft({ name: '', type: 'Deluxe', price: '', capacity: 2, floor: '', status: 'Available', facilities: 'Wi-Fi, AC, Breakfast', image: img('single-room-img01.png') }); show('Room added');
  }
  function updateRoom(id, patch) { saveRooms(rooms.map((r) => r.id === id ? { ...r, ...patch } : r)); }
  function deleteRoom(id) { saveRooms(rooms.filter((r) => r.id !== id)); show('Room deleted'); }
  function updateProfile(nextCustomer) {
    const updated = customers.map((c) => c.id === currentCustomer.id ? { ...c, ...nextCustomer } : c);
    saveCustomers(updated); setAuth({ ...auth, customer: { ...currentCustomer, ...nextCustomer } }); setBooking((p) => ({ ...p, ...nextCustomer })); show('Profile updated');
  }
  function submitTicket(e) {
    e.preventDefault();
    if (!support.subject.trim()) { show('Enter support request'); return; }
    saveTickets([{ id: uid('TK'), customer: currentCustomer, subject: support.subject, priority: support.priority, status: 'Open', createdAt: new Date().toLocaleString() }, ...tickets]); setSupport({ subject: '', priority: 'Medium' }); show('Support ticket sent to admin');
  }
  function updateTicket(id, status) { saveTickets(tickets.map((t) => t.id === id ? { ...t, status } : t)); show('Ticket updated'); }

  if (!auth) return <Auth screen={screen} role={role} login={login} register={register} setLogin={setLogin} setRegister={setRegister} choosePanel={choosePanel} doLogin={doLogin} doRegister={doRegister} setScreen={setScreen} toast={toast} />;

  const userNav = ['dashboard', 'rooms', 'booking', 'food', 'services', 'history', 'invoice', 'profile', 'support'];
  const adminNav = ['dashboard', 'rooms', 'bookings', 'orders', 'services', 'customers', 'payments', 'reports', 'support'];
  const nav = auth.role === 'admin' ? adminNav : userNav;
  const liveRequestCount = auth.role === 'admin'
    ? orders.filter(o => !['Completed','Cancelled'].includes(o.status)).length + tickets.filter(t => t.status !== 'Closed').length
    : userOrders.filter(o => !['Completed','Cancelled'].includes(o.status)).length + userTickets.filter(t => t.status !== 'Closed').length;
  return <div className="appShell">
    {toast && <div className="toast">{toast}</div>}
    <header className="topbar"><button className={menu ? "hamb open" : "hamb"} aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu(!menu)}>{menu ? "×" : "☰"}</button><div className="brand"><img src={img('logo1.png')} /><div><b>RoyalStay</b><small>{auth.role === 'admin' ? 'Admin Control Center' : 'Guest Comfort Portal'}</small></div><span>{auth.role === 'admin' ? 'Live PMS' : currentCustomer.tier || 'Guest'}</span></div><div className="topActions"><button className="topBtn notifyBtn" onClick={() => setActive(auth.role === 'admin' ? 'orders' : 'history')}><span className="topIcon">🔔</span><span>{auth.role === 'admin' ? 'All Requests' : 'My Requests'}</span><em>{liveRequestCount}</em></button><button className="topBtn" onClick={() => setActive('invoice')}><span className="topIcon">🧾</span><span>Invoice</span></button><button className="logout noHover" onClick={logout}>Logout</button></div></header>
    {menu && <button className="navOverlay" aria-label="Close menu" onClick={() => setMenu(false)}></button>}
    <aside className={menu ? 'sidebar show' : 'sidebar'}><div className="sideProfile compactProfile"><div>{auth.role === 'admin' ? 'AD' : 'CU'}</div><b>{auth.role === 'admin' ? 'Hotel Admin' : currentCustomer.name}</b></div>{nav.map((n) => <button key={n} className={active === n ? 'active' : ''} onClick={() => { setActive(n); setMenu(false); }}><span>{icon(n)}</span><b>{label(n)}</b><small>{hint(n)}</small></button>)}</aside>
    <main className="workspace">
      {auth.role === 'user' ? <User active={active} rooms={rooms} selectedRoom={selectedRoom} booking={booking} setBooking={setBooking} errors={errors} nights={nights} total={bookingTotal} submitBooking={submitBooking} foodMenu={foodMenu} serviceMenu={serviceMenu} placeOrder={placeOrder} userBookings={userBookings} userOrders={userOrders} latestBooking={latestBooking} cancelBooking={cancelBooking} currentCustomer={currentCustomer} updateProfile={updateProfile} support={support} setSupport={setSupport} submitTicket={submitTicket} userTickets={userTickets} setActive={setActive} /> : <Admin active={active} rooms={rooms} roomDraft={roomDraft} setRoomDraft={setRoomDraft} addRoom={addRoom} updateRoom={updateRoom} deleteRoom={deleteRoom} bookings={bookings} orders={orders} customers={customers} revenue={revenue} updateBooking={updateBooking} updateOrder={updateOrder} tickets={tickets} updateTicket={updateTicket} />}
    </main>
    {auth.role === 'user' && <button className="floatingBook" onClick={() => setActive('booking')}>📅 Book Now</button>}
  </div>;
}

function Auth({ screen, role, login, register, setLogin, setRegister, choosePanel, doLogin, doRegister, setScreen, toast }) {
  return <div className="authPage">{toast && <div className="toast">{toast}</div>}<section className="authHero"><p>ROYALSTAY CLOUD PMS</p><h1>Complete Hotel Management System</h1><span>Register • Login • Booking • Invoice • Food • Spa • Services • Admin Approvals • Reports</span></section>
    {screen === 'portal' && <div className="authCard"><h2>Select Panel</h2><p>Card click pannumbodhe demo login auto-fill agum.</p><button className="choice guest" onClick={() => choosePanel('user')}><b>Customer Panel</b><span>Book rooms, orders, services, invoices</span></button><button className="choice admin" onClick={() => choosePanel('admin')}><b>Admin Panel</b><span>Rooms, bookings, customers, reports</span></button><button className="plain" onClick={() => setScreen('register')}>New customer register</button></div>}
    {screen === 'login' && <form className="authCard" onSubmit={doLogin}><h2>{role === 'admin' ? 'Admin Login' : 'Customer Login'}</h2><input value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} placeholder="Username / Email" /><input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} placeholder="Password" /><button className="primary">Login</button><button type="button" className="plain" onClick={() => setScreen('portal')}>Back</button>{role === 'user' && <button type="button" className="plain" onClick={() => setScreen('register')}>Create account</button>}</form>}
    {screen === 'register' && <form className="authCard register" onSubmit={doRegister}><h2>Customer Register</h2><input placeholder="Full name" value={register.name} onChange={(e) => setRegister({ ...register, name: e.target.value })} /><input placeholder="Phone" value={register.phone} onChange={(e) => setRegister({ ...register, phone: e.target.value })} /><input placeholder="Email" value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value, username: e.target.value })} /><input placeholder="Address" value={register.address} onChange={(e) => setRegister({ ...register, address: e.target.value })} /><input type="password" placeholder="Password" value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} /><button className="primary">Register</button><button type="button" className="plain" onClick={() => setScreen('portal')}>Back</button></form>}
  </div>;
}

function User({ active, rooms, selectedRoom, booking, setBooking, errors, nights, total, submitBooking, foodMenu, serviceMenu, placeOrder, userBookings, userOrders, latestBooking, cancelBooking, currentCustomer, updateProfile, support, setSupport, submitTicket, userTickets, setActive }) {
  if (active === 'dashboard') return <Page title="Guest Dashboard" sub="Everything for a comfortable stay"><div className="cards"><Metric title="My Bookings" value={userBookings.length} /><Metric title="Orders" value={userOrders.length} /><Metric title="Total Spend" value={money(userBookings.reduce((s,b)=>s+b.amount,0)+userOrders.reduce((s,o)=>s+o.amount,0))} /><Metric title="Open Tickets" value={userTickets.filter(t=>t.status!=='Closed').length} /></div><div className="heroPanel"><h2>Welcome, {currentCustomer.name}</h2><p>Book rooms, order food, request spa/housekeeping, print invoice and track admin status updates.</p><button className="primary" onClick={() => setActive('booking')}>Book a Room</button></div></Page>;
  if (active === 'rooms') return <Page title="Available Rooms" sub="Customer room selection"><div className="roomGrid">{rooms.map((r) => <RoomCard key={r.id} room={r} onBook={() => { setBooking({ ...booking, roomId: r.id }); setActive('booking'); }} />)}</div></Page>;
  if (active === 'booking') return <Page title="Room Booking & Payment" sub="Validation + auto-filled payment"><form className="formGrid" onSubmit={submitBooking}><Input err={errors.name}><input placeholder="Name" value={booking.name} onChange={e => setBooking({ ...booking, name: e.target.value })} /></Input><Input err={errors.phone}><input placeholder="Phone" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} /></Input><Input err={errors.email}><input placeholder="Email" value={booking.email} onChange={e => setBooking({ ...booking, email: e.target.value })} /></Input><input placeholder="Address" value={booking.address} onChange={e => setBooking({ ...booking, address: e.target.value })} /><Input err={errors.roomId}><select value={booking.roomId} onChange={e => setBooking({ ...booking, roomId: Number(e.target.value) })}>{rooms.map(r => <option key={r.id} value={r.id}>{r.name} - {money(r.price)} - {r.status}</option>)}</select></Input><Input err={errors.guests}><input type="number" min="1" value={booking.guests} onChange={e => setBooking({ ...booking, guests: e.target.value })} /></Input><input type="date" value={booking.checkIn} onChange={e => setBooking({ ...booking, checkIn: e.target.value })} /><Input err={errors.checkOut}><input type="date" value={booking.checkOut} onChange={e => setBooking({ ...booking, checkOut: e.target.value })} /></Input><select value={booking.mode} onChange={e => setBooking({ ...booking, mode: e.target.value })}><option>UPI</option><option>Card</option><option>Cash</option></select>{booking.mode === 'UPI' && <Input err={errors.upi}><input placeholder="UPI ID" value={booking.upi} onChange={e => setBooking({ ...booking, upi: e.target.value })} /></Input>}{booking.mode === 'Card' && <><input placeholder="Card Holder" value={booking.cardName} onChange={e => setBooking({ ...booking, cardName: e.target.value })} /><Input err={errors.cardNumber}><input placeholder="Card Number" value={booking.cardNumber} onChange={e => setBooking({ ...booking, cardNumber: e.target.value })} /></Input><input placeholder="MM/YY" value={booking.expiry} onChange={e => setBooking({ ...booking, expiry: e.target.value })} /><input type="password" placeholder="CVV" value={booking.cvv} onChange={e => setBooking({ ...booking, cvv: e.target.value })} /></>}<textarea placeholder="Special request" value={booking.request} onChange={e => setBooking({ ...booking, request: e.target.value })} /><div className="bill"><b>{selectedRoom.name}</b><span>{nights} night(s) × {money(selectedRoom.price)}</span><strong>{money(total)}</strong></div><button className="primary wide">Confirm Booking & Generate Invoice</button></form></Page>;
  if (active === 'food') return <OrderPage title="Food Ordering" sub="Goes to admin kitchen panel" menu={foodMenu} placeOrder={placeOrder} history={userOrders.filter(o => o.category === 'Food')} />;
  if (active === 'services') return <OrderPage title="Spa & Guest Services" sub="Goes to admin service desk" menu={serviceMenu} placeOrder={placeOrder} history={userOrders.filter(o => o.category !== 'Food')} />;
  if (active === 'history') return <Page title="My History" sub="Bookings, food, services status"><BookingCards bookings={userBookings} cancelBooking={cancelBooking} /><History title="My Orders & Service Requests" items={userOrders} /></Page>;
  if (active === 'invoice') return <Invoice booking={latestBooking} orders={userOrders} />;
  if (active === 'profile') return <Profile customer={currentCustomer} updateProfile={updateProfile} />;
  return <Page title="Support Center" sub="Tickets go to admin"><form className="miniForm" onSubmit={submitTicket}><input placeholder="What do you need?" value={support.subject} onChange={e => setSupport({ ...support, subject: e.target.value })} /><select value={support.priority} onChange={e => setSupport({ ...support, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select><button className="primary">Send Ticket</button></form><History title="My Tickets" items={userTickets.map(t => ({...t,item:t.subject,category:t.priority,amount:0}))} /><div className="supportLinks"><a href="tel:+919876512345">Call Hotel</a><a target="_blank" href="https://wa.me/919876512345">WhatsApp</a><a href="mailto:booking@royalstay.com">Email</a></div></Page>;
}

function Admin({ active, rooms, roomDraft, setRoomDraft, addRoom, updateRoom, deleteRoom, bookings, orders, customers, revenue, updateBooking, updateOrder, tickets, updateTicket }) {
  if (active === 'dashboard') return <Page title="Admin Dashboard" sub="Hotel operations overview"><div className="cards"><Metric title="Rooms" value={rooms.length} /><Metric title="Bookings" value={bookings.length} /><Metric title="Orders/Services" value={orders.length} /><Metric title="Revenue" value={money(revenue)} /></div><div className="adminHero"><h2>Live Operations</h2><p>Admin panel is different from customer panel: manage rooms, bookings, customer requests, payment status, tickets and reports.</p></div></Page>;
  if (active === 'rooms') return <Page title="Room Management" sub="Add, update status, delete rooms"><form className="miniForm" onSubmit={addRoom}><input placeholder="Room name" value={roomDraft.name} onChange={e=>setRoomDraft({...roomDraft,name:e.target.value})} /><select value={roomDraft.type} onChange={e=>setRoomDraft({...roomDraft,type:e.target.value})}><option>Deluxe</option><option>Suite</option><option>Executive</option><option>Business</option></select><input placeholder="Price" value={roomDraft.price} onChange={e=>setRoomDraft({...roomDraft,price:e.target.value})} /><input placeholder="Floor" value={roomDraft.floor} onChange={e=>setRoomDraft({...roomDraft,floor:e.target.value})} /><button className="primary">Add Room</button></form><div className="roomGrid">{rooms.map(r => <RoomAdmin key={r.id} room={r} updateRoom={updateRoom} deleteRoom={deleteRoom} />)}</div></Page>;
  if (active === 'bookings') return <Page title="Booking Management" sub="Check-in, check-out, cancel"><Table headers={['Guest','Room','Dates','Amount','Payment','Status','Contact','Update']}>{bookings.map(b => <tr key={b.id}><td><b>{b.customer.name}</b><small>{b.customer.email}<br />{b.customer.phone}</small></td><td>{b.roomName}<small>{b.roomType}</small></td><td>{b.checkIn} - {b.checkOut}</td><td>{money(b.amount)}</td><td>{b.payment} {b.paid ? '✓' : 'Pending'}</td><td><Status text={b.status}/></td><td><Contact customer={b.customer}/></td><td><select value={b.status} onChange={e=>updateBooking(b.id,{status:e.target.value})}><option>Confirmed</option><option>Checked In</option><option>Checked Out</option><option>Cancelled</option></select></td></tr>)}</Table></Page>;
  if (active === 'orders') return <AdminRequests title="Food Orders" orders={orders.filter(o=>o.category==='Food')} updateOrder={updateOrder} />;
  if (active === 'services') return <AdminRequests title="Spa & Service Requests" orders={orders.filter(o=>o.category!=='Food')} updateOrder={updateOrder} />;
  if (active === 'customers') return <Page title="Customer CRM" sub="Customer contact and profile"><Table headers={['Customer','Address','Tier','Contact','Bookings']}>{customers.map(c => <tr key={c.id}><td><b>{c.name}</b><small>{c.email}<br />{c.phone}</small></td><td>{c.address}</td><td>{c.tier}</td><td><Contact customer={c}/></td><td>{bookings.filter(b=>b.customer.email===c.email).length}</td></tr>)}</Table></Page>;
  if (active === 'payments') return <Page title="Payment Tracking" sub="Room and order payment summary"><Table headers={['Type','Customer','Reference','Amount','Mode','Status']}>{bookings.map(b=><tr key={b.id}><td>Room</td><td>{b.customer.name}</td><td>{b.invoiceNo}</td><td>{money(b.amount)}</td><td>{b.payment}</td><td><Status text={b.paid?'Paid':'Pending'}/></td></tr>)}{orders.map(o=><tr key={o.id}><td>{o.category}</td><td>{o.customer.name}</td><td>{o.id}</td><td>{money(o.amount)}</td><td>Room Bill</td><td><Status text="Paid"/></td></tr>)}</Table></Page>;
  if (active === 'reports') return <Page title="Reports & Analytics" sub="Revenue, occupancy and request summary"><div className="cards"><Metric title="Room Revenue" value={money(bookings.reduce((s,b)=>s+b.amount,0))}/><Metric title="Order Revenue" value={money(orders.reduce((s,o)=>s+o.amount,0))}/><Metric title="Occupied" value={rooms.filter(r=>r.status==='Booked').length}/><Metric title="Open Requests" value={orders.filter(o=>!['Completed','Cancelled'].includes(o.status)).length}/></div><div className="analyticsGrid"><div className="chartCard"><h3>Revenue Mix</h3><div className="barRow"><span>Rooms</span><i style={{width: `${Math.min(96, bookings.reduce((s,b)=>s+b.amount,0)/80)}%`}}></i><b>{money(bookings.reduce((s,b)=>s+b.amount,0))}</b></div><div className="barRow"><span>Orders</span><i style={{width: `${Math.min(96, orders.reduce((s,o)=>s+o.amount,0)/40)}%`}}></i><b>{money(orders.reduce((s,o)=>s+o.amount,0))}</b></div><div className="barRow"><span>Services</span><i style={{width: `${Math.min(96, orders.filter(o=>o.category!=='Food').length*18)}%`}}></i><b>{orders.filter(o=>o.category!=='Food').length}</b></div></div><div className="chartCard"><h3>Live PMS Status</h3><div className="donut"><span>{Math.round((rooms.filter(r=>r.status==='Booked').length / Math.max(1, rooms.length))*100)}%</span></div><p>Occupancy rate based on current booked rooms.</p></div></div></Page>;
  return <Page title="Admin Support Tickets" sub="Customer complaints and requests"><Table headers={['Customer','Subject','Priority','Status','Contact','Update']}>{tickets.map(t=><tr key={t.id}><td>{t.customer.name}</td><td>{t.subject}</td><td>{t.priority}</td><td><Status text={t.status}/></td><td><Contact customer={t.customer}/></td><td><select value={t.status} onChange={e=>updateTicket(t.id,e.target.value)}><option>Open</option><option>In Progress</option><option>Closed</option></select></td></tr>)}</Table></Page>;
}

function OrderPage({ title, sub, menu, placeOrder, history }) { const [qty, setQty] = useState(1); const [note, setNote] = useState(''); return <Page title={title} sub={sub}><div className="orderTools"><input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))}/><input placeholder="Note / room instruction" value={note} onChange={e=>setNote(e.target.value)}/></div><div className="menuGrid">{menu.map(item => <article className="menuItem" key={item.id}><span>{item.category}</span><h3>{item.name}</h3><p>ETA {item.eta}</p><b>{item.price ? money(item.price) : 'Free'}</b><button className="primary" onClick={() => placeOrder(item, qty, note || 'Guest request')}>Order / Request</button></article>)}</div><History title="My Request History" items={history}/></Page>; }
function AdminRequests({ title, orders, updateOrder }) { return <Page title={title} sub="Admin status update reflects in customer history"><Table headers={['Customer','Item','Qty','Amount','Note','Status','Contact','Update']}>{orders.map(o=><tr key={o.id}><td><b>{o.customer.name}</b><small>{o.customer.phone}</small></td><td>{o.item}<small>{o.category}</small></td><td>{o.qty}</td><td>{money(o.amount)}</td><td>{o.note}</td><td><Status text={o.status}/></td><td><Contact customer={o.customer}/></td><td><select value={o.status} onChange={e=>updateOrder(o.id,{status:e.target.value})}><option>Requested</option><option>Accepted</option><option>Preparing</option><option>On the Way</option><option>Completed</option><option>Cancelled</option></select><select value={o.staff} onChange={e=>updateOrder(o.id,{staff:e.target.value})}><option>Not assigned</option><option>Kitchen Team</option><option>Service Desk</option><option>Housekeeping</option><option>Driver</option></select></td></tr>)}</Table></Page>; }
function RoomCard({ room, onBook }) { return <article className="roomCard"><div className="roomMedia"><img src={room.image}/><button className="wishBtn heartOnly" type="button" aria-label="Add to wishlist">♥</button></div><div className="roomBody"><span className={room.status === 'Available' ? 'ok' : 'busy'}>{room.status}</span><h3>{room.name}</h3><p>{room.type} • {room.floor} • {room.capacity} guests</p><div className="amenityGrid">{room.facilities.map(f=><small key={f}>{f}</small>)}</div><div className="roomFoot"><b><strong>{money(room.price)}</strong><em>/night</em></b><button disabled={room.status !== 'Available'} className="primary bookAction" onClick={onBook}><span>📅</span> Book Now</button></div></div></article>; }
function RoomAdmin({ room, updateRoom, deleteRoom }) { return <article className="roomCard"><img src={room.image}/><div><h3>{room.name}</h3><p>{money(room.price)} • {room.capacity} guests</p><select value={room.status} onChange={e=>updateRoom(room.id,{status:e.target.value})}><option>Available</option><option>Booked</option><option>Maintenance</option></select><button className="danger" onClick={()=>deleteRoom(room.id)}>Delete</button></div></article>; }
function Profile({ customer, updateProfile }) { const [form, setForm] = useState(customer); return <Page title="My Profile" sub="Edit customer details"><form className="formGrid" onSubmit={(e)=>{e.preventDefault(); updateProfile(form);}}><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><button className="primary">Save Profile</button></form></Page>; }
function Invoice({ booking, orders }) { if (!booking) return <Page title="Invoice" sub="No booking"><p className="empty">Booking pannina invoice generate agum.</p></Page>; const related = orders.filter(o => o.customer.email === booking.customer.email); const total = booking.amount + related.reduce((s,o)=>s+o.amount,0); return <Page title="Invoice" sub="Professional printable bill"><div className="invoice"><div className="invTop"><div><h2>RoyalStay Invoice</h2><p>{booking.invoiceNo} • {booking.createdAt}</p></div><Status text={booking.status}/></div><div className="invGrid"><p><b>Guest</b><br/>{booking.customer.name}<br/>{booking.customer.phone}<br/>{booking.customer.email}</p><p><b>Stay</b><br/>{booking.roomName}<br/>{booking.checkIn} to {booking.checkOut}<br/>{booking.nights} night(s)</p></div><table><tbody><tr><td>{booking.roomName}</td><td>{money(booking.amount)}</td></tr>{related.map(o=><tr key={o.id}><td>{o.item} ({o.status})</td><td>{money(o.amount)}</td></tr>)}<tr><th>Total</th><th>{money(total)}</th></tr></tbody></table><button className="primary" onClick={()=>window.print()}>Print / Save PDF</button></div></Page>; }
function BookingCards({ bookings, cancelBooking }) { return <div className="bookingCards">{!bookings.length && <p className="empty">No bookings yet.</p>}{bookings.map(b=><article key={b.id}><h3>{b.roomName}</h3><p>{b.checkIn} to {b.checkOut}</p><b>{money(b.amount)}</b><Status text={b.status}/>{!['Cancelled','Checked Out'].includes(b.status) && <button className="danger" onClick={()=>cancelBooking(b.id)}>Cancel</button>}</article>)}</div>; }
function History({ title, items }) { return <div className="history"><h2>{title}</h2>{!items.length && <p className="empty">No records.</p>}{items.map(i=><div className="hist" key={i.id}><b>{i.item}</b><span>{i.category} • {i.amount ? money(i.amount) : 'No charge'}</span><Status text={i.status}/></div>)}</div>; }
function Page({ title, sub, children }) { return <section className="page"><div className="pageHead"><p>{sub}</p><h1>{title}</h1></div>{children}</section>; }
function Metric({ title, value }) { return <div className="metric"><span>{title}</span><b>{value}</b></div>; }
function Input({ err, children }) { return <label>{children}{err && <small className="err">{err}</small>}</label>; }
function Table({ headers, children }) { return <div className="tableWrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
function Status({ text }) { const icons = { Confirmed:'✅', 'Checked In':'🏨', 'Checked Out':'🏁', Cancelled:'❌', Requested:'🕒', Accepted:'👍', Preparing:'👨‍🍳', 'On the Way':'🚚', Completed:'✨', Open:'📌', 'In Progress':'🔧', Closed:'✅', Paid:'💳' }; return <span className={`status s-${String(text).replace(/\s/g,'').toLowerCase()}`}><i>{icons[text] || '●'}</i><em>{text}</em></span>; }
function Contact({ customer }) { const phone = (customer.phone || '').replace(/\D/g, ''); const msg = encodeURIComponent(`Hi ${customer.name}, RoyalStay support here.`); return <div className="contactLinks"><a title="Call" href={`tel:${customer.phone}`}>☎</a><a title="WhatsApp" target="_blank" rel="noreferrer" href={`https://wa.me/${phone}?text=${msg}`}>💬</a><a title="Email" href={`mailto:${customer.email}`}>✉</a></div>; }
function label(n) { return n.charAt(0).toUpperCase() + n.slice(1); }
function icon(n) { return ({dashboard:'🏛️',rooms:'🛏️',booking:'📅',invoice:'🧾',food:'🍽️',services:'🛎️',history:'📚',profile:'👤',support:'🎧',bookings:'📋',orders:'👨‍🍳',customers:'🤝',payments:'💳',reports:'📊'}[n] || '✨'); }
function hint(n) { return ({dashboard:'Overview',rooms:'Rooms',booking:'Reservation',invoice:'Billing',food:'Kitchen',services:'Service desk',history:'Records',profile:'Account',support:'Tickets',bookings:'Guests',orders:'Kitchen live',customers:'CRM',payments:'Tracking',reports:'Analytics'}[n] || 'Manage'); }

createRoot(document.getElementById('root')).render(<App />);
